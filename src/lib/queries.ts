import { db } from "./db";

const storyCardSelect = {
  id: true,
  headline: true,
  slug: true,
  whyNow: true,
  trend: true,
  createdAt: true,
  themes: { include: { theme: true } },
} as const;

export async function getFeedStories() {
  return db.story.findMany({
    where: { status: "active" },
    orderBy: [{ trend: "asc" }, { createdAt: "desc" }],
    select: storyCardSelect,
    take: 10,
  });
}

export async function getStoryBySlug(slug: string) {
  return db.story.findUnique({
    where: { slug },
    include: {
      themes: { include: { theme: true } },
      sources: true,
      thread: { include: { entries: { orderBy: { occurredAt: "desc" } } } },
      savedItems: true,
    },
  });
}

export async function getRelatedStories(storyId: string, themeIds: string[]) {
  if (themeIds.length === 0) return [];
  return db.story.findMany({
    where: {
      id: { not: storyId },
      status: "active",
      themes: { some: { themeId: { in: themeIds } } },
    },
    orderBy: { createdAt: "desc" },
    select: storyCardSelect,
    take: 6,
  });
}

export async function getThemeBySlug(slug: string) {
  return db.theme.findUnique({ where: { slug } });
}

export async function getStoriesByTheme(themeId: string) {
  return db.story.findMany({
    where: { themes: { some: { themeId } } },
    orderBy: { createdAt: "desc" },
    select: storyCardSelect,
  });
}

export async function getAllThemes() {
  return db.theme.findMany({
    include: { _count: { select: { stories: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getThread(id: string) {
  return db.thread.findUnique({
    where: { id },
    include: {
      entries: {
        orderBy: { occurredAt: "desc" },
        include: { story: { include: { themes: { include: { theme: true } } } } },
      },
      stories: { select: storyCardSelect },
      savedItems: true,
    },
  });
}

export async function searchStories(query: string) {
  const q = query.trim();
  if (!q) return [];
  return db.story.findMany({
    where: {
      OR: [
        { headline: { contains: q } },
        { whatHappened: { contains: q } },
        { background: { contains: q } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: storyCardSelect,
    take: 10,
  });
}

export async function getSavedItems() {
  return db.savedItem.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      story: { include: { themes: { include: { theme: true } } } },
      thread: true,
    },
  });
}

export type StoryCard = Awaited<ReturnType<typeof getFeedStories>>[number];
