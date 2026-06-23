/**
 * Pure, deterministic scoring functions for Stage 1 aggregation. No LLM
 * calls here — this is the auditable, unit-tested contract for how mentions
 * become a 0-10 "top_score" and other derived stats. See the worked example
 * in tests/scoring.test.ts.
 */
import type { Confidence, RawMention, Sentiment } from "./types.ts";

const POLARITY: Record<Sentiment, number> = {
  positive: 1.0,
  mixed: 0.5,
  neutral: 0.5,
  negative: 0.0,
};

const CONFIDENCE_WEIGHT: Record<Confidence, number> = {
  high: 1.0,
  medium: 0.6,
  low: 0.3,
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Sum(polarity_i * weight_i) / Sum(weight_i), in [0, 1]. */
export function sentimentQuality(mentions: RawMention[]): number {
  if (mentions.length === 0) return 0.5;
  let weightedSum = 0;
  let weightTotal = 0;
  for (const m of mentions) {
    const w = CONFIDENCE_WEIGHT[m.sentiment_confidence];
    weightedSum += POLARITY[m.sentiment] * w;
    weightTotal += w;
  }
  return weightTotal === 0 ? 0.5 : weightedSum / weightTotal;
}

/** (rec_ratio * 1.5) - (warn_ratio * 2.5), warnings penalized harder than recs reward. */
export function recommendationAdjustment(
  recommendationCount: number,
  warningCount: number,
  mentionCount: number
): number {
  if (mentionCount === 0) return 0;
  const recRatio = recommendationCount / mentionCount;
  const warnRatio = warningCount / mentionCount;
  return recRatio * 1.5 - warnRatio * 2.5;
}

/** Credibility shrinkage toward 5.0 for low-volume entities; reaches 1.0 around 19 mentions. */
export function volumeFactor(mentionCount: number): number {
  return Math.min(1, Math.log(mentionCount + 1) / Math.log(20));
}

export interface TopScoreInputs {
  mentions: RawMention[];
  recommendationCount: number;
  warningCount: number;
}

/** The full 0-10 top_score formula, rounded to 2 decimals. */
export function computeTopScore({
  mentions,
  recommendationCount,
  warningCount,
}: TopScoreInputs): number {
  const mentionCount = mentions.length;
  const quality = sentimentQuality(mentions);
  const recAdj = recommendationAdjustment(recommendationCount, warningCount, mentionCount);
  const rawScore = clamp(quality * 10 + recAdj, 0, 10);
  const vFactor = volumeFactor(mentionCount);
  const score = 5.0 + (rawScore - 5.0) * vFactor;
  return Math.round(clamp(score, 0, 10) * 100) / 100;
}

const BUSY_KEYWORDS = [
  "crowded",
  "packed",
  "busy",
  "swarm",
  "swarmed",
  "line",
  "lines",
  "queue",
  "queues",
  "wait",
  "waited",
  "waiting",
];
const QUIET_KEYWORDS = ["quiet", "empty", "peaceful", "uncrowded", "calm", "relaxed"];

/** Keyword-derived crowd proxy from key_phrase text. Null when no signal at all. */
export function crowdSignal(keyPhrases: string[]): "busy" | "quiet" | "mixed" | null {
  const text = keyPhrases.join(" ").toLowerCase();
  const hasBusy = BUSY_KEYWORDS.some((kw) => text.includes(kw));
  const hasQuiet = QUIET_KEYWORDS.some((kw) => text.includes(kw));
  if (hasBusy && hasQuiet) return "mixed";
  if (hasBusy) return "busy";
  if (hasQuiet) return "quiet";
  return null;
}

/** URL/identifier-safe slug for an entity_normalized string. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
