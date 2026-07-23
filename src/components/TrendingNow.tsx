import Link from "next/link";
import { getLiveTrends } from "@/lib/trends";

function formatVolume(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}K+`;
  return `${n}+`;
}

export async function TrendingNow() {
  const trends = await getLiveTrends(10);
  if (trends.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg text-ink">Trending now</h2>
        <span className="text-xs text-ink-muted">Google Trends · refreshes every 5 min</span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {trends.map((trend, i) => (
          <Link
            key={trend.query}
            href={`/explore?q=${encodeURIComponent(trend.query)}`}
            className="flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:border-accent"
          >
            <span className="mt-0.5 text-xs font-medium text-ink-muted">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-ink">{trend.query}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                {trend.categories[0] && (
                  <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-accent">
                    {trend.categories[0]}
                  </span>
                )}
                <span>{formatVolume(trend.searchVolume)} searches</span>
                <span className="text-rising">+{trend.increasePercentage}%</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
