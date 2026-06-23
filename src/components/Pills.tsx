import { scoreTone, sentimentTone, TONE_CLASSES } from "@/lib/badge-colors";

function Pill({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function SentimentPillBadge({ positivePct }: { positivePct: number }) {
  const tone = sentimentTone(positivePct);
  return <Pill className={TONE_CLASSES[tone]}>{positivePct}% positive</Pill>;
}

export function ScorePillBadge({ score }: { score: number }) {
  const tone = scoreTone(score);
  return <Pill className={TONE_CLASSES[tone]}>Top score {score.toFixed(2)}</Pill>;
}

export function MentionsPillBadge({ count }: { count: number }) {
  return (
    <Pill className="border-surface-border bg-surface text-muted">
      {count} mention{count === 1 ? "" : "s"}
    </Pill>
  );
}
