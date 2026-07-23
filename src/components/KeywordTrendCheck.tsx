"use client";

import { useState, useTransition } from "react";
import { checkKeywordTrend } from "@/lib/actions";
import { TrendBadge } from "./TrendBadge";
import type { KeywordTrend } from "@/lib/trends";

export function KeywordTrendCheck() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<KeywordTrend | null>(null);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  function check() {
    const trimmed = query.trim();
    if (!trimmed || isPending) return;
    startTransition(async () => {
      const r = await checkKeywordTrend(trimmed);
      setResult(r);
      setSearched(true);
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-xs font-bold uppercase tracking-wide text-ink-muted">
        Quick trend check
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        See how much interest a keyword is getting right now, before committing to a full deep-dive.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          check();
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. mushroom coffee, cold plunge…"
          disabled={isPending}
          className="flex-1 rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending || !query.trim()}
          className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm text-ink transition-colors hover:border-accent disabled:opacity-50"
        >
          {isPending ? "Checking…" : "Check"}
        </button>
      </form>

      {searched && !isPending && !result && (
        <p className="mt-3 text-sm text-ink-muted">No trend data found for that keyword.</p>
      )}

      {result && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink">{result.query}</span>
            <TrendBadge trend={result.direction} />
          </div>
          <div className="mt-2 flex h-12 items-end gap-0.5">
            {result.points.map((p, i) => (
              <div
                key={i}
                title={`${p.date}: ${p.value}`}
                className="flex-1 rounded-sm bg-accent/50"
                style={{ height: `${Math.max(4, p.value)}%` }}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            {result.currentInterest}/100 interest right now
            {result.changePercent !== 0 && (
              <>
                {" "}
                · {result.changePercent > 0 ? "+" : ""}
                {result.changePercent}% over this period
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
