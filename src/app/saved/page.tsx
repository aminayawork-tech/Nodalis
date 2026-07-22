import Link from "next/link";
import { getSavedItems } from "@/lib/queries";
import { ThemeChip } from "@/components/ThemeChip";
import { NotesEditor } from "@/components/NotesEditor";
import { relativeTime } from "@/lib/format";

export default async function SavedPage() {
  const items = await getSavedItems();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl text-ink">Saved</h1>
      <p className="mt-2 text-ink-muted">
        Your personal knowledge base — stories and threads you&apos;ve kept,
        with your own notes attached.
      </p>

      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center text-ink-muted">
          Nothing saved yet. Save a story or thread and it&apos;ll show up
          here.
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              {item.type === "story" && item.story ? (
                <>
                  <Link
                    href={`/story/${item.story.slug}`}
                    className="font-display text-lg text-ink hover:text-accent"
                  >
                    {item.story.headline}
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.story.themes.map(({ theme }) => (
                      <ThemeChip key={theme.id} name={theme.name} slug={theme.slug} />
                    ))}
                  </div>
                </>
              ) : item.type === "thread" && item.thread ? (
                <Link
                  href={`/thread/${item.thread.id}`}
                  className="font-display text-lg text-ink hover:text-accent"
                >
                  {item.thread.title} <span className="text-sm text-ink-muted">(thread)</span>
                </Link>
              ) : null}

              <div className="mt-4">
                <NotesEditor savedItemId={item.id} initialNotes={item.notes} />
              </div>
              <div className="mt-2 text-xs text-ink-muted">
                Saved {relativeTime(item.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
