import { NextRequest, NextResponse } from "next/server";
import { getTrendCandidates } from "@/lib/trends";
import { ingestTopic } from "@/lib/ingest";
import { db } from "@/lib/db";

// Drives the daily feed: pull today's trend candidates, run the full
// ingest pipeline for each, and archive stories that have gone stale.
// Call with: GET /api/cron/refresh?secret=$CRON_SECRET
// (or Authorization: Bearer $CRON_SECRET), on whatever schedule you like —
// e.g. a daily cron hitting this URL, or `vercel.json` cron config.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided =
    request.nextUrl.searchParams.get("secret") ??
    request.headers.get("authorization")?.replace(/^Bearer /, "");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topics = await getTrendCandidates(8);
  const results: { topic: string; ok: boolean; slug?: string; error?: string }[] = [];

  for (const topic of topics) {
    try {
      const story = await ingestTopic(topic, "trend");
      results.push({ topic, ok: true, slug: story.slug });
    } catch (err) {
      results.push({ topic, ok: false, error: (err as Error).message });
    }
  }

  // Archive stories that have been sitting untouched for a while so the
  // feed stays a "what's active now" list rather than growing forever.
  const staleCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  await db.story.updateMany({
    where: { status: "active", updatedAt: { lt: staleCutoff } },
    data: { status: "archived" },
  });

  return NextResponse.json({ ranAt: new Date().toISOString(), results });
}
