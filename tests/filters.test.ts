import { describe, expect, it } from "vitest";
import {
  bestForOptions,
  crowdSignalCoverage,
  DEFAULT_FILTERS,
  filterEntities,
  matchesFilters,
  subredditOptions,
} from "../src/lib/filters.ts";
import type { EnrichedEntityProfile } from "../scripts/lib/types.ts";

function entity(overrides: Partial<EnrichedEntityProfile>): EnrichedEntityProfile {
  return {
    entity_id: "test-place",
    entity_normalized: "Test Place",
    entity_type: "attraction",
    entity_subtype: "",
    mention_count: 5,
    unique_commenters: 5,
    eligible_for_ranking: true,
    sentiment_counts: { positive: 3, neutral: 1, mixed: 0, negative: 1 },
    sentiment_pct: { positive: 60, neutral: 20, mixed: 0, negative: 20 },
    recommendation_count: 2,
    warning_count: 0,
    top_score: 7,
    crowd_signal: null,
    source_threads: [
      {
        thread_id: "t1",
        thread_title: "Test thread",
        thread_url: "https://reddit.com/x",
        subreddit: "JapanTravelTips",
        post_score: 100,
      },
    ],
    mention_ids: [1, 2, 3, 4, 5],
    verdict: "A solid spot.",
    pros: ["Great views"],
    cons: [],
    best_for: ["First-time visitors"],
    best_time: null,
    enrichment_confidence: "high",
    enriched_at: new Date().toISOString(),
    input_hash: "abc123",
    ...overrides,
  };
}

describe("matchesFilters", () => {
  it("matches everything with default filters", () => {
    expect(matchesFilters(entity({}), DEFAULT_FILTERS)).toBe(true);
  });

  it("filters by best_for", () => {
    const e = entity({ best_for: ["Foodies"] });
    expect(matchesFilters(e, { ...DEFAULT_FILTERS, bestFor: "Foodies" })).toBe(true);
    expect(matchesFilters(e, { ...DEFAULT_FILTERS, bestFor: "Families" })).toBe(false);
  });

  it("filters by minimum score", () => {
    const e = entity({ top_score: 6.5 });
    expect(matchesFilters(e, { ...DEFAULT_FILTERS, minScore: 6 })).toBe(true);
    expect(matchesFilters(e, { ...DEFAULT_FILTERS, minScore: 8 })).toBe(false);
  });

  it("filters by subreddit across source_threads", () => {
    const e = entity({
      source_threads: [
        { thread_id: "t1", thread_title: "A", thread_url: "u", subreddit: "JapanTravel", post_score: 1 },
        { thread_id: "t2", thread_title: "B", thread_url: "u", subreddit: "Tokyo", post_score: 1 },
      ],
    });
    expect(matchesFilters(e, { ...DEFAULT_FILTERS, subreddit: "Tokyo" })).toBe(true);
    expect(matchesFilters(e, { ...DEFAULT_FILTERS, subreddit: "Osaka" })).toBe(false);
  });

  it("filters by crowd_signal", () => {
    const busy = entity({ crowd_signal: "busy" });
    const quiet = entity({ crowd_signal: "quiet" });
    expect(matchesFilters(busy, { ...DEFAULT_FILTERS, crowd: "busy" })).toBe(true);
    expect(matchesFilters(quiet, { ...DEFAULT_FILTERS, crowd: "busy" })).toBe(false);
  });

  it("combines multiple filter criteria with AND semantics", () => {
    const e = entity({ top_score: 9, best_for: ["Foodies"], crowd_signal: "quiet" });
    expect(
      matchesFilters(e, { bestFor: "Foodies", minScore: 8, subreddit: "any", crowd: "quiet" })
    ).toBe(true);
    expect(
      matchesFilters(e, { bestFor: "Foodies", minScore: 8, subreddit: "any", crowd: "busy" })
    ).toBe(false);
  });
});

describe("filterEntities", () => {
  it("returns only matching entities, preserving order", () => {
    const a = entity({ entity_id: "a", top_score: 9 });
    const b = entity({ entity_id: "b", top_score: 3 });
    const c = entity({ entity_id: "c", top_score: 7 });
    const result = filterEntities([a, b, c], { ...DEFAULT_FILTERS, minScore: 6 });
    expect(result.map((e) => e.entity_id)).toEqual(["a", "c"]);
  });
});

describe("bestForOptions", () => {
  it("returns a deduplicated, sorted union of all best_for tags", () => {
    const a = entity({ entity_id: "a", best_for: ["Families", "Foodies"] });
    const b = entity({ entity_id: "b", best_for: ["Foodies", "Photography lovers"] });
    expect(bestForOptions([a, b])).toEqual(["Families", "Foodies", "Photography lovers"]);
  });
});

describe("subredditOptions", () => {
  it("returns a deduplicated, sorted union of subreddits across source_threads", () => {
    const a = entity({
      entity_id: "a",
      source_threads: [
        { thread_id: "t1", thread_title: "A", thread_url: "u", subreddit: "Tokyo", post_score: 1 },
      ],
    });
    const b = entity({
      entity_id: "b",
      source_threads: [
        { thread_id: "t2", thread_title: "B", thread_url: "u", subreddit: "JapanTravel", post_score: 1 },
      ],
    });
    expect(subredditOptions([a, b])).toEqual(["JapanTravel", "Tokyo"]);
  });
});

describe("crowdSignalCoverage", () => {
  it("counts only entities with a non-null crowd_signal", () => {
    const withSignal = entity({ entity_id: "a", crowd_signal: "busy" });
    const withoutSignal = entity({ entity_id: "b", crowd_signal: null });
    expect(crowdSignalCoverage([withSignal, withoutSignal, withSignal])).toBe(2);
  });
});
