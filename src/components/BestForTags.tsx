export function BestForTags({
  bestFor,
  bestTime,
}: {
  bestFor: string[];
  bestTime: string | null;
}) {
  if (bestFor.length === 0 && !bestTime) return null;

  const tags = bestTime ? [...bestFor, bestTime] : bestFor;

  return (
    <div className="rounded-lg border border-surface-border bg-surface/60 p-4">
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-2">
        Best for
      </div>
      <p className="text-sm text-foreground">{tags.join(" • ")}</p>
    </div>
  );
}
