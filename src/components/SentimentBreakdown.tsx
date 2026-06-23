"use client";

import { useState } from "react";
import type { SentimentCounts } from "@/types";

const ROWS: { key: keyof SentimentCounts; label: string; barColor: string; textColor: string }[] = [
  { key: "positive", label: "Positive", barColor: "bg-positive", textColor: "text-positive" },
  { key: "neutral", label: "Neutral", barColor: "bg-neutral", textColor: "text-neutral" },
  { key: "mixed", label: "Mixed", barColor: "bg-mixed", textColor: "text-mixed" },
  { key: "negative", label: "Negative", barColor: "bg-negative", textColor: "text-negative" },
];

export function SentimentBreakdown({ counts }: { counts: SentimentCounts }) {
  const [open, setOpen] = useState(false);
  const total = counts.positive + counts.neutral + counts.mixed + counts.negative;
  const visibleRows = ROWS.filter((r) => counts[r.key] > 0);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs font-semibold uppercase tracking-wide text-muted-2 hover:text-muted"
      >
        Sentiment breakdown {open ? "−" : "+"}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {visibleRows.map((row) => {
            const count = counts[row.key];
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={row.key} className="flex items-center gap-3 text-xs">
                <span className={`w-6 text-right font-mono ${row.textColor}`}>{count}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-border">
                  <div
                    className={`h-full rounded-full ${row.barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-14 text-muted-2">{row.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
