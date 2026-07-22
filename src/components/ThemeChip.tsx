import Link from "next/link";

const chipClass =
  "inline-flex items-center gap-1.5 rounded-full border border-border bg-accent-soft px-2.5 py-1 text-xs text-accent transition-colors";

// `linked={false}` renders a plain span instead of an <a> — required when
// this chip appears inside another <a> (e.g. StoryCard), since nested
// anchors are invalid HTML and break hydration.
export function ThemeChip({
  name,
  slug,
  linked = true,
}: {
  name: string;
  slug: string;
  linked?: boolean;
}) {
  const content = (
    <>
      <span className="node-dot" aria-hidden="true" />
      {name}
    </>
  );

  if (!linked) {
    return <span className={chipClass}>{content}</span>;
  }

  return (
    <Link href={`/theme/${slug}`} className={`${chipClass} hover:border-accent`}>
      {content}
    </Link>
  );
}
