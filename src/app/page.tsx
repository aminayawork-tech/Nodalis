import Link from "next/link";
import { getFeedStories } from "@/lib/queries";
import { StoryCard } from "@/components/StoryCard";
import { TrendingNow } from "@/components/TrendingNow";

export default async function FeedPage() {
  const stories = await getFeedStories();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl italic text-ink">
          What&apos;s actually going on
        </h1>
        <p className="mt-2 text-ink-muted">
          Active stories worth knowing right now, connected by the themes
          underneath them.
        </p>
      </div>

      <TrendingNow />

      {stories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-ink-muted">
          No stories yet. Run the daily refresh, or head to{" "}
          <Link href="/explore" className="text-accent underline">
            Explore
          </Link>{" "}
          to research a topic on demand.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}
