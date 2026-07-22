import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, SYNTHESIS_MODEL } from "./anthropic";
import { firecrawlSearch, hasFirecrawl } from "./firecrawl";

// Used when Firecrawl isn't configured, so the feed/pipeline still has
// something to synthesize against for local testing without any API keys.
const FALLBACK_TOPICS = [
  "AI companion app regulation",
  "Global chip export controls",
  "Return-to-office mandates",
  "Extreme weather insurance costs",
  "Generational shift in home buying",
];

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

interface RawHit {
  title: string;
  url: string;
}

// Best-effort "what's trending" surface for the daily refresh job. We don't
// have a Google Trends key, so we use Firecrawl search results as the raw
// signal and ask Claude to cluster/name the distinct stories in them.
export async function getTrendCandidates(limit = 8): Promise<string[]> {
  if (!hasFirecrawl()) return FALLBACK_TOPICS.slice(0, limit);

  const hits: RawHit[] = [];
  for (const query of DISCOVERY_QUERIES) {
    const results = await firecrawlSearch(query, 8);
    for (const r of results) hits.push({ title: r.title, url: r.url });
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
