import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getThemeBySlug, getStoriesByTheme } from "@/lib/queries";
import { StoryCard } from "@/components/StoryCard";

export default async function ThemePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // See story/[slug]/page.tsx — dynamic params alone don't force fresh
  // per-request rendering, so without this a theme's story list can freeze
  // at whatever it looked like on first visit.
  await connection();

  const { slug } = await params;
  const theme = await getThemeBySlug(slug);
  if (!theme) notFound();

  const stories = await getStoriesByTheme(theme.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/themes" className="text-sm text-ink-muted hover:text-accent">
        ← All themes
      </Link>
      <div className="mt-4 flex items-center gap-2">
        <span className="node-dot text-accent" />
        <h1 className="font-display text-3xl text-ink">{theme.name}</h1>
      </div>
      <p className="mt-2 text-ink-muted">
        {stories.length} {stories.length === 1 ? "story" : "stories"} connected
        by this underlying theme.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
