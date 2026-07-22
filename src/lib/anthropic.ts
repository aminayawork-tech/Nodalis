import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic();

// claude-opus-4-8 is the most capable model; swap to claude-sonnet-5 in .env
// (ANTHROPIC_MODEL) for a cheaper/faster daily-refresh run.
export const SYNTHESIS_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
export const SYNTHESIS_EFFORT = (process.env.ANTHROPIC_EFFORT || "medium") as
  | "low"
  | "medium"
  | "high"
  | "xhigh"
  | "max";
