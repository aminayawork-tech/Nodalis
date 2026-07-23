"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TrendingSearch } from "@/lib/trends";

const DISMISSED_KEY = "nodalis:dismissedTrends";
const MAX_DISMISSED = 200;

function loadDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissed(set: Set<string>) {
  const arr = [...set].slice(-MAX_DISMISSED);
  window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(arr));
}

function formatVolume(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}K+`;
  return `${n}+`;
}

export function TrendingNowList({ trends }: { trends: TrendingSearch[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Reading localStorage can only happen client-side, and must not run
    // during the initial render (that runs during SSR/hydration and would
    // mismatch the server-rendered markup) — an effect is the correct place
    // for this, not a lazy useState initializer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(loadDismissed());
    setHydrated(true);
  }, []);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const t of trends) {
      const primary = t.categories[0];
      if (primary && !seen.has(primary)) {
        seen.add(primary);
        ordered.push(primary);
      }
    }
    return ordered;
  }, [trends]);

  const visible = trends.filter(
    (t) =>
      !dismissed.has(t.query) &&
      (!activeCategory || t.categories.includes(activeCategory))
  );

  function dismiss(query: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(query);
      saveDismissed(next);
      return next;
    });
    setOpenMenu(null);
  }

  // Avoid a hydration flash where server-rendered (undismissed) cards
  // briefly show before localStorage loads on the client.
  if (!hydrated) return null;

  if (visible.length === 0) {
    return (
      <p className="mt-3 text-sm text-ink-muted">
        No trending topics match right now.{" "}
        {dismissed.size > 0 && (
          <button
            onClick={() => {
              setDismissed(new Set());
              saveDismissed(new Set());
            }}
            className="text-accent underline"
          >
            Restore {dismissed.size} dismissed
          </button>
        )}
      </p>
    );
  }

  return (
    <div>
      {categories.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
              activeCategory === null
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-ink-muted hover:border-accent"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                activeCategory === c
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-ink-muted hover:border-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {visible.map((trend, i) => (
          <div
            key={trend.query}
            className="group relative flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:border-accent"
          >
            <span className="mt-0.5 text-xs font-medium text-ink-muted">{i + 1}</span>
            <Link
              href={`/explore?q=${encodeURIComponent(trend.query)}`}
              className="min-w-0 flex-1"
            >
              <div className="truncate pr-5 text-sm text-ink">{trend.query}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                {trend.categories[0] && (
                  <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-accent">
                    {trend.categories[0]}
                  </span>
                )}
                <span>{formatVolume(trend.searchVolume)} searches</span>
                <span className="text-rising">+{trend.increasePercentage}%</span>
              </div>
            </Link>

            <div className="absolute right-1.5 top-1.5">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setOpenMenu((cur) => (cur === trend.query ? null : trend.query));
                }}
                onBlur={() => setTimeout(() => setOpenMenu(null), 150)}
                aria-label="Trend options"
                className="rounded p-1 text-ink-muted opacity-0 transition-opacity hover:bg-accent-soft hover:text-accent group-hover:opacity-100 focus:opacity-100"
              >
                ⋯
              </button>
              {openMenu === trend.query && (
                <div className="absolute right-0 top-7 z-10 w-32 rounded-lg border border-border bg-card py-1 shadow-sm">
                  <button
                    onClick={() => dismiss(trend.query)}
                    className="block w-full px-3 py-1.5 text-left text-xs text-ink hover:bg-accent-soft"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
