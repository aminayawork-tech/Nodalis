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

  const url = `${SERPAPI_BASE}?engine=google_trends_trending_now&geo=US&hl=en&api_key=${key}`;
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
