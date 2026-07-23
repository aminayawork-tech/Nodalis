"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function FeedIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5M6 9.5V19a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1V9.5"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExploreIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
      <path
        d="M20 20 15.5 15.5"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

// Reuses the wordmark's node-and-link motif — Themes are the abstract
// connections between stories, so the icon echoes the brand glyph.
function ThemesIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M5 17 12 8l7 9"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="5" cy="17" r="1.8" fill="currentColor" />
      <circle cx="12" cy="8" r="1.8" fill="currentColor" />
      <circle cx="19" cy="17" r="1.8" fill="currentColor" />
    </svg>
  );
}

function SavedIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M6 4h12v16l-6-4-6 4V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

const items = [
  { href: "/", label: "Feed", Icon: FeedIcon },
  { href: "/explore", label: "Explore", Icon: ExploreIcon },
  { href: "/themes", label: "Themes", Icon: ThemesIcon },
  { href: "/saved", label: "Saved", Icon: SavedIcon },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {items.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
                active ? "text-accent" : "text-ink-muted"
              }`}
            >
              <Icon active={active} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
