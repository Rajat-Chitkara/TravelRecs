"use client";

import { useState } from "react";
import type { SentimentCounts } from "@/types";
import { SentimentBars } from "./SentimentBars";

export function SentimentBreakdown({ counts }: { counts: SentimentCounts }) {
  const [open, setOpen] = useState(false);

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
        <div className="mt-3">
          <SentimentBars counts={counts} />
        </div>
      )}
    </div>
  );
}
