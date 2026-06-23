export function RankBadge({ rank }: { rank: number }) {
  const isTop = rank === 1;
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-sm font-semibold ${
        isTop
          ? "border-accent bg-accent/15 text-accent"
          : "border-surface-border bg-surface text-muted"
      }`}
    >
      {rank}
    </span>
  );
}
