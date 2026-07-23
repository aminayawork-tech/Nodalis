import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, SYNTHESIS_MODEL } from "./anthropic";
import { firecrawlSearch, hasFirecrawl } from "./firecrawl";

// Used when neither SerpApi nor Firecrawl is configured, so the feed/pipeline
// still has something to synthesize against for local testing without keys.
const FALLBACK_TOPICS = [
  "AI companion app regulation",
  "Global chip export controls",
  "Return-to-office mandates",
  "Extreme weather insurance costs",
  "Generational shift in home buying",
];

export interface TrendingSearch {
  query: string;
  searchVolume: number;
  increasePercentage: number;
  categories: string[];
}

const SERPAPI_BASE = "https://serpapi.com/search.json";

function serpApiKey(): string | undefined {
  return process.env.SERPAPI_API_KEY || undefined;
}

export function hasSerpApi(): boolean {
  return Boolean(serpApiKey());
}

interface RawTrendingSearch {
  query?: unknown;
  active?: unknown;
  search_volume?: unknown;
  increase_percentage?: unknown;
  categories?: unknown;
}

// Live "what's trending right now" surface via SerpApi's Google Trends
// Trending Now engine. Cached for 5 minutes (same cadence Snappymarketer
// uses) so the dashboard doesn't burn API quota on every page load.
export async function getLiveTrends(limit = 12): Promise<TrendingSearch[]> {
  const key = serpApiKey();
  if (!key) return [];

  // no_cache=true bypasses SerpApi's own server-side cache — without it,
  // repeat calls for this same (parameter-less) query can get back a
  // response SerpApi already had cached, independent of our own 5-minute
  // revalidation window. Our `next.revalidate` still caps how often we
  // actually call SerpApi, so this doesn't increase request volume.
  const url = `${SERPAPI_BASE}?engine=google_trends_trending_now&geo=US&hl=en&no_cache=true&api_key=${key}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    console.error(`SerpApi trending_now failed (${res.status}): ${await res.text()}`);
    return [];
  }

  const json = await res.json();
  const raw: unknown[] = json?.trending_searches ?? [];

  return raw
    .map((r) => r as RawTrendingSearch)
    .filter((r) => r.active === true && typeof r.query === "string")
    .sort(
      (a, b) => (Number(b.search_volume) || 0) - (Number(a.search_volume) || 0)
    )
    .slice(0, limit)
    .map((r) => ({
      query: r.query as string,
      searchVolume: Number(r.search_volume) || 0,
      increasePercentage: Number(r.increase_percentage) || 0,
      categories: Array.isArray(r.categories)
        ? (r.categories as Array<{ name?: unknown }>)
            .map((c) => (typeof c.name === "string" ? c.name : null))
            .filter((n): n is string => n !== null)
        : [],
    }));
}

export interface KeywordTrendPoint {
  date: string;
  value: number;
}

export interface KeywordTrend {
  query: string;
  points: KeywordTrendPoint[];
  currentInterest: number;
  changePercent: number;
  direction: "rising" | "steady" | "fading";
}

interface RawTimelinePoint {
  date?: unknown;
  values?: Array<{ extracted_value?: unknown }>;
}

// On-demand interest-over-time lookup for a single keyword the user typed —
// a cheap "is this worth researching?" check before committing to the full
// Firecrawl+Claude pipeline. One SerpApi call per lookup (not cached across
// keywords like getLiveTrends, since each query is different).
export async function getKeywordTrend(query: string): Promise<KeywordTrend | null> {
  const key = serpApiKey();
  const trimmed = query.trim();
  if (!key || !trimmed) return null;

  // Explicit `date` window — without it Google Trends defaults to a 5-year
  // lookback, which buries the current, up-to-date signal under years of
  // historical noise. "today 12-m" keeps every point recent.
  const url = `${SERPAPI_BASE}?engine=google_trends&q=${encodeURIComponent(trimmed)}&data_type=TIMESERIES&date=today%2012-m&geo=US&hl=en&no_cache=true&api_key=${key}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    console.error(`SerpApi google_trends failed (${res.status}): ${await res.text()}`);
    return null;
  }

  const json = await res.json();
  const raw: unknown[] = json?.interest_over_time?.timeline_data ?? [];

  const points = raw
    .map((r) => r as RawTimelinePoint)
    .map((r) => ({
      date: typeof r.date === "string" ? r.date : "",
      value: Number(r.values?.[0]?.extracted_value) || 0,
    }))
    .filter((p) => p.date);

  if (points.length === 0) return null;

  const mid = Math.floor(points.length / 2) || 1;
  const firstHalf = points.slice(0, mid);
  const secondHalf = points.slice(mid).length > 0 ? points.slice(mid) : firstHalf;
  const avg = (arr: KeywordTrendPoint[]) =>
    arr.reduce((sum, p) => sum + p.value, 0) / arr.length;
  const firstAvg = avg(firstHalf);
  const secondAvg = avg(secondHalf);
  const changePercent = firstAvg > 0 ? Math.round(((secondAvg - firstAvg) / firstAvg) * 100) : 0;

  const direction: KeywordTrend["direction"] =
    changePercent > 15 ? "rising" : changePercent < -15 ? "fading" : "steady";

  return {
    query: trimmed,
    points,
    currentInterest: points[points.length - 1].value,
    changePercent,
    direction,
  };
}

const DISCOVERY_QUERIES = [
  "trending news today",
  "biggest news story right now",
  "viral story today",
];

const topicListSchema = z.object({
  topics: z
    .array(z.string())
    .describe(
      "5-8 distinct, specific current news topics worth a deep-dive story (short phrases, not full headlines)"
    ),
});

// Fallback trend discovery when SerpApi isn't configured: use Firecrawl
// search results as the raw signal and ask Claude to name the distinct
// stories in them.
async function getTrendCandidatesViaFirecrawl(limit: number): Promise<string[]> {
  if (!hasFirecrawl()) return FALLBACK_TOPICS.slice(0, limit);

  const hits: { title: string }[] = [];
  for (const query of DISCOVERY_QUERIES) {
    const results = await firecrawlSearch(query, 8);
    for (const r of results) hits.push({ title: r.title });
  }

  if (hits.length === 0) return FALLBACK_TOPICS.slice(0, limit);

  const listing = hits.map((h) => `- ${h.title}`).join("\n");

  const message = await anthropic.messages.parse({
    model: SYNTHESIS_MODEL,
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "low",
      format: zodOutputFormat(topicListSchema),
    },
    messages: [
      {
        role: "user",
        content: `Here are headlines from today's top search results:\n\n${listing}\n\nIdentify the ${limit} most distinct, substantive news stories represented here (merge near-duplicates covering the same story). Return each as a short topic phrase suitable for researching in depth, not a full headline.`,
      },
    ],
  });

  const topics = message.parsed_output?.topics ?? [];
  return topics.length > 0 ? topics.slice(0, limit) : FALLBACK_TOPICS.slice(0, limit);
}

// Trend candidates for the daily refresh job: SerpApi's live trending
// searches when configured, else the Firecrawl+Claude approximation, else a
// static fallback list.
export async function getTrendCandidates(limit = 8): Promise<string[]> {
  const live = await getLiveTrends(limit);
  if (live.length > 0) return live.map((t) => t.query);
  return getTrendCandidatesViaFirecrawl(limit);
}
