import { describe, expect, it } from "vitest";
import {
  clamp,
  computeTopScore,
  crowdSignal,
  recommendationAdjustment,
  sentimentQuality,
  slugify,
  volumeFactor,
} from "../scripts/lib/scoring.ts";
import type { RawMention } from "../scripts/lib/types.ts";

function mention(overrides: Partial<RawMention>): RawMention {
  return {
    mention_id: 1,
    thread_id: "t1",
    comment_id: "c1",
    comment_score: 1,
    comment_depth: 0,
    comment_author: "user",
    entity_raw_text: "Test Place",
    entity_normalized: "Test Place",
    entity_type: "attraction",
    entity_subtype: "",
    sentiment: "positive",
    sentiment_confidence: "high",
    is_recommendation: 0,
    is_warning: 0,
    key_phrase: "",
    ...overrides,
  };
}

describe("clamp", () => {
  it("clamps within bounds", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe("sentimentQuality", () => {
  it("returns 0.5 for an empty mention list", () => {
    expect(sentimentQuality([])).toBe(0.5);
  });

  it("matches the plan's worked example (5 positive/high + 1 neutral/medium)", () => {
    const mentions = [
      ...Array.from({ length: 5 }, () =>
        mention({ sentiment: "positive", sentiment_confidence: "high" })
      ),
      mention({ sentiment: "neutral", sentiment_confidence: "medium" }),
    ];
    expect(sentimentQuality(mentions)).toBeCloseTo(0.9464, 3);
  });

  it("is 0 for all-negative-high-confidence mentions", () => {
    const mentions = Array.from({ length: 3 }, () =>
      mention({ sentiment: "negative", sentiment_confidence: "high" })
    );
    expect(sentimentQuality(mentions)).toBe(0);
  });
});

describe("recommendationAdjustment", () => {
  it("matches the plan's worked example (4/6 recommended, 0 warnings)", () => {
    expect(recommendationAdjustment(4, 0, 6)).toBeCloseTo(1.0, 5);
  });

  it("penalizes warnings harder than it rewards recommendations", () => {
    const recOnly = recommendationAdjustment(1, 0, 1); // ratio 1 -> +1.5
    const warnOnly = recommendationAdjustment(0, 1, 1); // ratio 1 -> -2.5
    expect(recOnly).toBe(1.5);
    expect(warnOnly).toBe(-2.5);
    expect(Math.abs(warnOnly)).toBeGreaterThan(Math.abs(recOnly));
  });

  it("is 0 for an entity with no mentions", () => {
    expect(recommendationAdjustment(0, 0, 0)).toBe(0);
  });
});

describe("volumeFactor", () => {
  it("matches the plan's worked example at 6 mentions (log(7)/log(20))", () => {
    expect(volumeFactor(6)).toBeCloseTo(0.6496, 3);
  });

  it("caps at 1.0 well beyond ~19 mentions", () => {
    expect(volumeFactor(19)).toBeCloseTo(1.0, 1);
    expect(volumeFactor(100)).toBe(1);
  });

  it("is 0 at zero mentions", () => {
    expect(volumeFactor(0)).toBe(0);
  });
});

describe("computeTopScore", () => {
  it("matches the plan's full worked example: 8.25", () => {
    const mentions = [
      ...Array.from({ length: 5 }, () =>
        mention({ sentiment: "positive", sentiment_confidence: "high" })
      ),
      mention({ sentiment: "neutral", sentiment_confidence: "medium" }),
    ];
    const score = computeTopScore({
      mentions,
      recommendationCount: 4,
      warningCount: 0,
    });
    expect(score).toBeCloseTo(8.25, 2);
  });

  it("stays within [0, 10] for an all-negative, all-warning entity", () => {
    const mentions = Array.from({ length: 10 }, () =>
      mention({ sentiment: "negative", sentiment_confidence: "high", is_warning: 1 })
    );
    const score = computeTopScore({ mentions, recommendationCount: 0, warningCount: 10 });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(10);
  });

  it("pulls a single glowing low-volume mention toward neutral, not straight to 10", () => {
    const mentions = [mention({ sentiment: "positive", sentiment_confidence: "high", is_recommendation: 1 })];
    const score = computeTopScore({ mentions, recommendationCount: 1, warningCount: 0 });
    // raw_score would clamp to 10, but volume_factor at n=1 is tiny, so the
    // shrinkage should keep this well below a 20-mention unanimous entity.
    expect(score).toBeLessThan(8);
    expect(score).toBeGreaterThan(5);
  });

  it("rewards high-volume broad consensus more than thin praise", () => {
    const thin = computeTopScore({
      mentions: [mention({ sentiment: "positive", sentiment_confidence: "high" })],
      recommendationCount: 1,
      warningCount: 0,
    });
    const broad = computeTopScore({
      mentions: Array.from({ length: 25 }, () =>
        mention({ sentiment: "positive", sentiment_confidence: "high" })
      ),
      recommendationCount: 20,
      warningCount: 0,
    });
    expect(broad).toBeGreaterThan(thin);
  });
});

describe("crowdSignal", () => {
  it("detects busy keywords", () => {
    expect(crowdSignal(["Gets really crowded by noon"])).toBe("busy");
  });

  it("detects quiet keywords", () => {
    expect(crowdSignal(["Lovely and peaceful in the morning"])).toBe("quiet");
  });

  it("detects mixed signal", () => {
    expect(crowdSignal(["Quiet at dawn, packed by 10am"])).toBe("mixed");
  });

  it("returns null with no keyword matches", () => {
    expect(crowdSignal(["Great ramen, loved the broth"])).toBeNull();
  });
});

describe("slugify", () => {
  it("lowercases, strips diacritics, and dashes", () => {
    expect(slugify("Senso-ji Temple")).toBe("senso-ji-temple");
    expect(slugify("teamLab Planets")).toBe("teamlab-planets");
  });

  it("has no leading/trailing dashes", () => {
    expect(slugify("  Ueno Park!! ")).toBe("ueno-park");
  });
});
