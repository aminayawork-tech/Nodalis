import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoryBySlug, getRelatedStories } from "@/lib/queries";
import { parseStringArray, relativeTime } from "@/lib/format";
import { TrendBadge } from "@/components/TrendBadge";
import { ThemeChip } from "@/components/ThemeChip";
import { SaveButton } from "@/components/SaveButton";
import { NotesEditor } from "@/components/NotesEditor";
import { StoryCard } from "@/components/StoryCard";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) notFound();

  const whoInvolved = parseStringArray(story.whoInvolved);
  const talkingPoints = parseStringArray(story.talkingPoints);
  const themeIds = story.themes.map((t) => t.themeId);
  const related = await getRelatedStories(story.id, themeIds);
  const savedItem = story.savedItems[0];

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/" className="text-sm text-ink-muted hover:text-accent">
        ← Feed
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {story.themes.map(({ theme }) => (
          <ThemeChip key={theme.id} name={theme.name} slug={theme.slug} />
        ))}
        <span className="ml-auto">
          <TrendBadge trend={story.trend} />
        </span>
      </div>

      <h1 className="mt-4 font-display text-3xl leading-tight text-ink">
        {story.headline}
      </h1>
      <p className="mt-3 font-display italic text-lg text-ink-muted">
        {story.whyNow}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <SaveButton
          id={story.id}
          type="story"
          initiallySaved={Boolean(savedItem)}
        />
        <span className="text-xs text-ink-muted">
          Updated {relativeTime(story.updatedAt)}
        </span>
        {story.thread && (
          <Link
            href={`/thread/${story.thread.id}`}
            className="ml-auto text-xs text-accent hover:underline"
          >
            Part of &ldquo;{story.thread.title}&rdquo; →
          </Link>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-7">
        <Section title="What happened">
          <p>{story.whatHappened}</p>
        </Section>

        <Section title="Background">
          <p>{story.background}</p>
        </Section>

        <Section title="Who's involved">
          <ul className="flex flex-col gap-1.5">
            {whoInvolved.map((entry, i) => (
              <li key={i} className="text-ink">
                {entry}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="What's next">
          <p>{story.whatsNext}</p>
        </Section>

        <div className="rounded-xl border border-accent/30 bg-accent-soft p-5">
          <h2 className="text-xs font-medium uppercase tracking-wide text-accent">
            Talking points
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {talkingPoints.map((point, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-ink">
                <span className="node-dot mt-1.5 shrink-0 text-accent" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {savedItem && (
          <NotesEditor savedItemId={savedItem.id} initialNotes={savedItem.notes} />
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-10 border-t border-border pt-8">
          <h2 className="font-display text-lg text-ink">
            Other stories sharing a theme
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {related.map((r) => (
              <StoryCard key={r.id} story={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
        {title}
      </h2>
      <div className="mt-2 text-[15px] leading-relaxed text-ink">{children}</div>
    </div>
  );
}
