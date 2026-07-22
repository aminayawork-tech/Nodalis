"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { exploreTopic } from "@/lib/actions";

export function ExploreBar({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [isResearching, startResearch] = useTransition();
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/explore?q=${encodeURIComponent(query)}`);
  }

  function handleResearch() {
    if (!query.trim()) return;
    startResearch(async () => {
      await exploreTopic(query);
    });
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Any topic — trending or not…"
        className="w-full rounded-lg border border-border bg-card px-4 py-3 text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
        disabled={isResearching}
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isResearching}
          className="rounded-full border border-border px-4 py-1.5 text-sm text-ink transition-colors hover:border-accent disabled:opacity-50"
        >
          Search saved stories
        </button>
        <button
          type="button"
          onClick={handleResearch}
          disabled={isResearching || !query.trim()}
          className="rounded-full bg-accent px-4 py-1.5 text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isResearching ? "Researching…" : "Research this from scratch →"}
        </button>
        {isResearching && (
          <span className="text-xs text-ink-muted">
            Scraping sources and synthesizing — this can take up to a minute.
          </span>
        )}
      </div>
    </form>
  );
}
