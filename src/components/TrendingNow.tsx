import { getLiveTrends } from "@/lib/trends";
import { TrendingNowList } from "./TrendingNowList";

export async function TrendingNow() {
  const trends = await getLiveTrends(24);
  if (trends.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg text-ink">Trending now</h2>
        <span className="text-xs text-ink-muted">Google Trends · refreshes every 5 min</span>
      </div>
      <TrendingNowList trends={trends} />
    </div>
  );
}
