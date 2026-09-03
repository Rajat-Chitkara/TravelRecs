export function BestForTags({
  bestFor,
  bestTime,
}: {
  bestFor: string[];
  bestTime: string | null;
}) {
  if (bestFor.length === 0 && !bestTime) return null;

  return (
    <div className="rounded-xl border border-surface-border bg-surface p-5 shadow-sm">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-2">
        Best for
      </div>
      <div className="flex flex-wrap gap-2">
        {bestFor.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-surface-border bg-surface-raised px-3 py-1.5 text-sm font-medium text-muted"
          >
            {tag}
          </span>
        ))}
        {bestTime && (
          <span className="rounded-full border border-accent/30 bg-accent/8 px-3 py-1.5 text-sm font-medium text-accent">
            {bestTime}
          </span>
        )}
      </div>
    </div>
  );
}
