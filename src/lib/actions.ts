"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import { ingestTopic } from "./ingest";

export async function saveStory(storyId: string) {
  await db.savedItem.upsert({
    where: { storyId },
    update: {},
    create: { type: "story", storyId },
  });
  revalidatePath("/saved");
}

export async function unsaveStory(storyId: string) {
  await db.savedItem.deleteMany({ where: { storyId } });
  revalidatePath("/saved");
}

export async function saveThread(threadId: string) {
  await db.savedItem.upsert({
    where: { threadId },
    update: {},
    create: { type: "thread", threadId },
  });
  revalidatePath("/saved");
}

export async function unsaveThread(threadId: string) {
  await db.savedItem.deleteMany({ where: { threadId } });
  revalidatePath("/saved");
}

export async function updateNotes(savedItemId: string, notes: string) {
  await db.savedItem.update({ where: { id: savedItemId }, data: { notes } });
  revalidatePath("/saved");
}

// Explore "go deep on demand": always runs the full pipeline live (Firecrawl
// + Claude) for whatever the user typed, then lands on the fresh story. The
// Explore page itself surfaces existing matches first (via a plain search)
// so this is only reached when the user deliberately asks for new research.
export async function exploreTopic(topic: string) {
  const trimmed = topic.trim();
  if (!trimmed) return;

  const story = await ingestTopic(trimmed, "search");
  revalidatePath("/");
  redirect(`/story/${story.slug}`);
}
