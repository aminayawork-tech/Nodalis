import { searchStories } from "@/lib/queries";
import { StoryCard } from "@/components/StoryCard";
import { ExploreBar } from "@/components/ExploreBar";
import { TrendingNow } from "@/components/TrendingNow";
import { KeywordTrendCheck } from "@/components/KeywordTrendCheck";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q ? await searchStories(q) : [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-ink">Explore</h1>
      <p className="mt-2 text-ink-muted">
        Search any topic or keyword for the same layered narrative treatment
        — even if it isn&apos;t currently trending.
      </p>

      <div className="mt-6 max-w-2xl">
        <ExploreBar initialQuery={q} />
      </div>

      <div className="mt-6 max-w-2xl">
        <KeywordTrendCheck />
      </div>

      {!q && (
        <div className="mt-8">
          <TrendingNow />
        </div>
      )}

      {q && (
        <div className="mt-8 max-w-2xl">
          <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {results.length > 0
              ? `${results.length} existing ${results.length === 1 ? "match" : "matches"} for "${q}"`
              : `No existing stories match "${q}"`}
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {results.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
