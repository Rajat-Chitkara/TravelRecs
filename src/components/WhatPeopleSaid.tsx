import type { RawMention } from "@/types";
import { TONE_CLASSES, type BadgeTone } from "@/lib/badge-colors";

const SENTIMENT_TONE: Record<RawMention["sentiment"], BadgeTone | "neutral"> = {
  positive: "positive",
  mixed: "mixed",
  negative: "negative",
  neutral: "neutral",
};

const NEUTRAL_CLASS = "bg-neutral-bg text-neutral border-neutral-border";

export function WhatPeopleSaid({ mentions }: { mentions: RawMention[] }) {
  if (mentions.length === 0) return null;

  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-2">
        What people said ({mentions.length} mention{mentions.length === 1 ? "" : "s"})
      </h2>
      <ul className="mt-3 space-y-2">
        {mentions.map((m) => {
          const tone = SENTIMENT_TONE[m.sentiment];
          const className = tone === "neutral" ? NEUTRAL_CLASS : TONE_CLASSES[tone];
          return (
            <li key={m.mention_id} className="flex items-start gap-2 text-sm">
              <span
                className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${className}`}
              >
                {m.sentiment}
              </span>
              <span className="text-muted">{m.key_phrase}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
