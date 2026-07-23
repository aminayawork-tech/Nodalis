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
  const [hovered, setHovered] = useState<number | null>(null);

  function check() {
    const trimmed = query.trim();
    if (!trimmed || isPending) return;
    startTransition(async () => {
      setHovered(null);
      const r = await checkKeywordTrend(trimmed);
      setResult(r);
      setSearched(true);
    });
  }

  const peak =
    result && result.points.length > 0
      ? result.points.reduce((max, p) => (p.value > max.value ? p : max), result.points[0])
      : null;
  const active = hovered !== null ? result?.points[hovered] : null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-xs font-bold uppercase tracking-wide text-ink-muted">
        Quick trend check
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        See how much interest a keyword is getting over the past 12 months, before committing to
        a full deep-dive.
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

          <div className="relative mt-4">
            {active && (
              <div
                className="pointer-events-none absolute -top-8 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-ink px-2 py-1 text-xs text-paper shadow-sm"
                style={{
                  left: `${Math.min(92, Math.max(8, ((hovered! + 0.5) / result.points.length) * 100))}%`,
                }}
              >
                {active.date}: {active.value}/100
              </div>
            )}
            <div className="flex h-12 items-end gap-0.5">
              {result.points.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`${p.date}: ${p.value} out of 100`}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  onTouchStart={() => setHovered(i)}
                  className={`flex-1 rounded-sm transition-colors ${
                    hovered === i ? "bg-accent" : "bg-accent/50 hover:bg-accent/80"
                  }`}
                  style={{ height: `${Math.max(4, p.value)}%` }}
                />
              ))}
            </div>
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
          {peak && (
            <p className="mt-1 text-xs text-ink-muted">
              Peak: {peak.date} ({peak.value}/100)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
