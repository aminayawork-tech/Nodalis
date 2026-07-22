import Link from "next/link";
import { notFound } from "next/navigation";
import { getThread } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { SaveButton } from "@/components/SaveButton";
import { ThemeChip } from "@/components/ThemeChip";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const thread = await getThread(id);
  if (!thread) notFound();

  const savedItem = thread.savedItems[0];

  const themesInThread = new Map<string, { name: string; slug: string }>();
  for (const entry of thread.entries) {
    for (const { theme } of entry.story?.themes ?? []) {
      themesInThread.set(theme.slug, theme);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/" className="text-sm text-ink-muted hover:text-accent">
        ← Feed
      </Link>

      <h1 className="mt-4 font-display text-3xl text-ink">{thread.title}</h1>
      {thread.description && (
        <p className="mt-2 text-ink-muted">{thread.description}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SaveButton
          id={thread.id}
          type="thread"
          initiallySaved={Boolean(savedItem)}
        />
        {[...themesInThread.values()].map((theme) => (
          <ThemeChip key={theme.slug} name={theme.name} slug={theme.slug} />
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          Timeline — {thread.entries.length}{" "}
          {thread.entries.length === 1 ? "entry" : "entries"}
        </h2>

        <ol className="relative mt-5 border-l border-border pl-6">
          {thread.entries.map((entry) => (
            <li key={entry.id} className="mb-8 last:mb-0">
              <span className="absolute -left-[4.5px] mt-1.5 h-2 w-2 rounded-full bg-accent" />
              <div className="text-xs text-ink-muted">
                {formatDate(entry.occurredAt)}
              </div>
              {entry.story ? (
                <Link
                  href={`/story/${entry.story.slug}`}
                  className="mt-1 block font-display text-lg text-ink hover:text-accent"
                >
                  {entry.story.headline}
                </Link>
              ) : null}
              <p className="mt-1 text-sm text-ink">{entry.summary}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
