import Link from "next/link";
import { NodeMark } from "./NodeMark";

const links = [
  { href: "/", label: "Feed" },
  { href: "/explore", label: "Explore" },
  { href: "/themes", label: "Themes" },
  { href: "/saved", label: "Saved" },
];

export function NavHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 text-accent">
          <NodeMark className="h-5 w-8" />
          <span className="font-display text-xl tracking-tight text-ink">
            Nodalis
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-ink-muted">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
