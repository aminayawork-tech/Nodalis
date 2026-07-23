"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { TrendBadge } from "./TrendBadge";
import { ThemeChip } from "./ThemeChip";
import { deleteStory } from "@/lib/actions";
import type { StoryCard as StoryCardData } from "@/lib/queries";

function DotsIcon() {
  return (
    <svg viewBox="0 0 4 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <circle cx="2" cy="2" r="1.6" />
      <circle cx="2" cy="8" r="1.6" />
      <circle cx="2" cy="14" r="1.6" />
    </svg>
  );
}

export function StoryCard({ story }: { story: StoryCardData }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [, startTransition] = useTransition();

  const primaryTheme = story.themes[0]?.theme;

  if (removed) return null;

  function confirmDelete() {
    setRemoved(true);
    startTransition(() => {
      deleteStory(story.id);
    });
  }

  return (
    <div className="relative rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent">
      <Link href={`/story/${story.slug}`} className="block">
        <div className="flex items-center justify-between gap-3 pr-6">
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

      <div
        className="absolute right-3 top-3"
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setOpen(false);
            setConfirming(false);
          }
        }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Story options"
          className="rounded p-1.5 text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent"
        >
          <DotsIcon />
        </button>
        {open && (
          <div className="absolute right-0 top-7 z-10 w-40 rounded-lg border border-border bg-card py-1 shadow-sm">
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                className="block w-full px-3 py-1.5 text-left text-xs text-ink hover:bg-accent-soft"
              >
                Remove
              </button>
            ) : (
              <div className="px-3 py-1.5">
                <p className="text-xs text-ink-muted">Delete for good?</p>
                <div className="mt-1.5 flex gap-2">
                  <button
                    onClick={confirmDelete}
                    className="text-xs font-medium text-rising hover:underline"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="text-xs text-ink-muted hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
