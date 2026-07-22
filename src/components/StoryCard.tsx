import Link from "next/link";
import { TrendBadge } from "./TrendBadge";
import { ThemeChip } from "./ThemeChip";
import type { StoryCard as StoryCardData } from "@/lib/queries";

export function StoryCard({ story }: { story: StoryCardData }) {
  const primaryTheme = story.themes[0]?.theme;

  return (
    <Link
      href={`/story/${story.slug}`}
      className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent"
    >
      <div className="flex items-center justify-between gap-3">
        {primaryTheme ? (
          <ThemeChip name={primaryTheme.name} slug={primaryTheme.slug} linked={false} />
        ) : (
          <span />
        )}
        <TrendBadge trend={story.trend} />
      </div>
      <h2 className="mt-3 font-display text-xl leading-snug text-ink">
        {story.headline}
      </h2>
      <p className="mt-2 text-sm text-ink-muted">{story.whyNow}</p>
    </Link>
  );
}
