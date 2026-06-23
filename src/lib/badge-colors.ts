export type BadgeTone = "positive" | "mixed" | "negative";

/** Color thresholds for the "% positive" pill. */
export function sentimentTone(positivePct: number): BadgeTone {
  if (positivePct >= 60) return "positive";
  if (positivePct >= 35) return "mixed";
  return "negative";
}

/** Color thresholds for the "Top score" pill (0-10 scale). */
export function scoreTone(score: number): BadgeTone {
  if (score >= 7) return "positive";
  if (score >= 4) return "mixed";
  return "negative";
}

export const TONE_CLASSES: Record<BadgeTone, string> = {
  positive: "bg-positive-bg text-positive border-positive-border",
  mixed: "bg-mixed-bg text-mixed border-mixed-border",
  negative: "bg-negative-bg text-negative border-negative-border",
};
