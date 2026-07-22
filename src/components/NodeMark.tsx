// The "nodes connecting" motif used as the wordmark glyph — three dots, two
// links — kept small and literal-once, not a graph visualization.
export function NodeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 20"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 14 L16 6 L26 14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="6" cy="14" r="2.6" fill="currentColor" />
      <circle cx="16" cy="6" r="2.6" fill="currentColor" />
      <circle cx="26" cy="14" r="2.6" fill="currentColor" />
    </svg>
  );
}
