import { anthropic, SYNTHESIS_MODEL } from "./anthropic";
import { parseStringArray } from "./format";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface StoryContext {
  headline: string;
  whyNow: string;
  whatHappened: string;
  background: string;
  whoInvolved: string; // JSON-encoded string[]
  whatsNext: string;
  talkingPoints: string; // JSON-encoded string[]
  themes: string[];
}

// Answers a follow-up question about a story, grounded in its already-
// synthesized content (not a fresh scrape — keeps this cheap and fast
// compared to the full research pipeline).
export async function answerStoryQuestion(
  story: StoryContext,
  history: ChatMessage[],
  question: string
): Promise<string> {
  const context = [
    `Headline: ${story.headline}`,
    `Why now: ${story.whyNow}`,
    `What happened: ${story.whatHappened}`,
    `Background: ${story.background}`,
    `Who's involved: ${parseStringArray(story.whoInvolved).join("; ")}`,
    `What's next: ${story.whatsNext}`,
    `Talking points: ${parseStringArray(story.talkingPoints).join(" | ")}`,
    `Themes: ${story.themes.join(", ")}`,
  ].join("\n");

  const message = await anthropic.messages.create({
    model: SYNTHESIS_MODEL,
    max_tokens: 1536,
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }],
    system: `You're helping a user go deeper on a story they've already read in Nodalis, their personal research tool. Answer follow-up questions using the story context below. Stay grounded in it for what it already covers. For anything current — the latest status, recent developments, or a fact the story doesn't cover — use web search rather than answering from memory or guessing; the user wants up-to-date answers, not a "check elsewhere" deflection. Keep answers conversational and concise — a few sentences, not another full report. Reply in plain prose only: no markdown, no bold/italic asterisks, no headers, no bullet lists.\n\n${context}`,
    messages: [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: question },
    ],
  });

  const text = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();

  // Safety net in case the model still slips in markdown emphasis/headers.
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "");
}
