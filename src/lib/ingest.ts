import { db } from "./db";
import { firecrawlSearch } from "./firecrawl";
import { synthesizeStory } from "./synthesis";
import { findOrCreateThread } from "./threads";
import { upsertThemes } from "./themes";
import { uniqueSlug } from "./slug";

export type StoryOrigin = "trend" | "search" | "manual";

// Runs the full pipeline for one topic: scrape sources, synthesize the
// layered narrative, attach it to a thread, and persist everything. Used by
// both the daily refresh job (origin: "trend") and Explore (origin: "search").
export async function ingestTopic(topic: string, origin: StoryOrigin) {
  const sources = await firecrawlSearch(topic, 6);
  const synthesis = await synthesizeStory(topic, sources);

  const [{ id: threadId }, themes] = await Promise.all([
    findOrCreateThread(synthesis.threadTitle),
    upsertThemes(synthesis.themes),
  ]);

  const story = await db.story.create({
    data: {
      headline: synthesis.headline,
      slug: uniqueSlug(synthesis.headline),
      whyNow: synthesis.whyNow,
      trend: synthesis.trend,
      whatHappened: synthesis.whatHappened,
      background: synthesis.background,
      whoInvolved: JSON.stringify(synthesis.whoInvolved),
      whatsNext: synthesis.whatsNext,
      talkingPoints: JSON.stringify(synthesis.talkingPoints),
      origin,
      threadId,
      themes: {
        create: themes.map((theme) => ({ themeId: theme.id })),
      },
      sources: {
        create: sources.map((s) => ({ url: s.url, title: s.title })),
      },
      threadEntry: {
        create: {
          threadId,
          summary: synthesis.whatHappened,
        },
      },
    },
    include: { themes: { include: { theme: true } }, sources: true },
  });

  return story;
}
