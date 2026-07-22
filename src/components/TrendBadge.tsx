const trendConfig = {
  rising: { label: "Rising", color: "text-rising", symbol: "↑" },
  steady: { label: "Steady", color: "text-accent", symbol: "→" },
  fading: { label: "Fading", color: "text-fading", symbol: "↓" },
} as const;

export function TrendBadge({ trend }: { trend: "rising" | "steady" | "fading" }) {
  const config = trendConfig[trend];
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide ${config.color}`}
    >
      <span aria-hidden="true">{config.symbol}</span>
      {config.label}
    </span>
  );
}
