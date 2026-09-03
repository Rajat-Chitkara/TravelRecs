import type { SentimentCounts } from "@/types";

const ROWS: { key: keyof SentimentCounts; label: string; emoji: string; color: string }[] = [
  { key: "positive", label: "Positive", emoji: "👍", color: "#10b981" },
  { key: "neutral",  label: "Neutral",  emoji: "😐", color: "#94a3b8" },
  { key: "mixed",    label: "Mixed",    emoji: "🤔", color: "#fbbf24" },
  { key: "negative", label: "Negative", emoji: "👎", color: "#f87171" },
];

export function SentimentBars({ counts }: { counts: SentimentCounts }) {
  const maxCount = Math.max(counts.positive, counts.neutral, counts.mixed, counts.negative, 1);
  const visible = ROWS.filter((r) => counts[r.key] > 0);

  return (
    <div className="space-y-3">
      {visible.map(({ key, label, emoji, color }) => (
        <div key={key} className="flex items-center gap-3">
          <span className="w-5 shrink-0 text-center text-base leading-none">{emoji}</span>
          <span className="w-8 shrink-0 text-sm font-bold tabular-nums" style={{ color }}>
            {counts[key]}
          </span>
          <div className="flex-1 overflow-hidden rounded-full bg-surface-border" style={{ height: "10px" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(counts[key] / maxCount) * 100}%`, backgroundColor: color }}
            />
          </div>
          <span className="w-16 shrink-0 text-xs text-muted-2">{label}</span>
        </div>
      ))}
    </div>
  );
}
