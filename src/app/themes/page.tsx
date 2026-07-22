import Link from "next/link";
import { getAllThemes } from "@/lib/queries";

export default async function ThemesPage() {
  const themes = await getAllThemes();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-ink">Themes</h1>
      <p className="mt-2 text-ink-muted">
        The underlying threads connecting otherwise-unrelated stories.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {themes.map((theme) => (
          <Link
            key={theme.id}
            href={`/theme/${theme.slug}`}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-ink transition-colors hover:border-accent"
          >
            <span className="node-dot text-accent" />
            {theme.name}
            <span className="text-ink-muted">{theme._count.stories}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
