import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, SYNTHESIS_MODEL, SYNTHESIS_EFFORT } from "./anthropic";
import type { ScrapedSource } from "./firecrawl";

export const synthesisSchema = z.object({
  headline: z
    .string()
    .describe("A specific, punchy headline for this story — not generic."),
  whatHappened: z
    .string()
    .describe("1-2 sentences: the concrete headline event."),
  whyNow: z
    .string()
    .describe(
      "One sharp sentence: the trigger or root cause explaining why this is surfacing right now."
    ),
  background: z
    .string()
    .describe(
      "A short paragraph of condensed history/context that makes the story make sense to someone unfamiliar with it."
    ),
  whoInvolved: z
    .array(z.string())
    .describe(
      "Key people, organizations, or entities involved, each written as 'Name — why they matter'."
    ),
  whatsNext: z
    .string()
    .describe("A short paragraph projecting the likely trajectory."),
  themes: z
    .array(z.string())
    .describe(
      "2-3 abstract underlying themes this connects to (e.g. 'AI regulation', 'labor shortage', 'supply chain', 'generational shift') — abstract, NOT surface categories like 'Tech' or 'Sports'."
    ),
  talkingPoints: z
    .array(z.string())
    .describe(
      "2-3 sharp, non-generic talking points someone could use to sound informed about this in conversation — specific insight or implication, not a restatement of what happened."
    ),
  trend: z
    .enum(["rising", "steady", "fading"])
    .describe("Is public attention on this story rising, steady, or fading?"),
  threadTitle: z
    .string()
    .describe(
      "A short, durable, canonical name for the ongoing story this belongs to (e.g. 'AI mental health regulation'), suitable as a stable label that future related developments would also be filed under."
    ),
});

export type Synthesis = z.infer<typeof synthesisSchema>;

function buildSourceBlock(sources: ScrapedSource[]): string {
  if (sources.length === 0) {
    return "No source articles could be retrieved. Write from your general knowledge, and be conservative — favor well-established context over speculation about recent specifics you can't verify.";
  }
  return sources
    .map(
      (s, i) =>
        `[Source ${i + 1}] ${s.title} (${s.url})\n${s.content.slice(0, 3000)}`
    )
    .join("\n\n---\n\n");
}

export async function synthesizeStory(
  topic: string,
  sources: ScrapedSource[]
): Promise<Synthesis> {
  const sourceBlock = buildSourceBlock(sources);

  const message = await anthropic.messages.parse({
    model: SYNTHESIS_MODEL,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    output_config: {
      effort: SYNTHESIS_EFFORT,
      format: zodOutputFormat(synthesisSchema),
    },
    system:
      "You are a research analyst writing for a single, well-informed reader who wants to genuinely understand what's going on in the world and speak about it intelligently in conversation — not a marketing writer looking for an angle. Write with precision. Avoid generic filler ('this is a developing story', 'time will tell'). Every talking point must contain a specific, non-obvious insight — if it could apply to any story on this topic, rewrite it. Themes must be abstract enough to link this story to otherwise-unrelated stories.",
    messages: [
      {
        role: "user",
        content: `Topic: ${topic}\n\nSource articles:\n\n${sourceBlock}\n\nWrite the full layered narrative for this topic based on the sources above.`,
      },
    ],
  });

  if (!message.parsed_output) {
    throw new Error("Synthesis did not return parseable structured output");
  }
  return message.parsed_output;
}
