import type { CrowdSignal, EnrichedEntityProfile } from "@/types";

export interface EntityFilters {
  bestFor: string | "any";
  minScore: number;
  subreddit: string | "any";
  crowd: CrowdSignal | "any";
}

export const DEFAULT_FILTERS: EntityFilters = {
  bestFor: "any",
  minScore: 0,
  subreddit: "any",
  crowd: "any",
};

export function matchesFilters(entity: EnrichedEntityProfile, filters: EntityFilters): boolean {
  if (filters.bestFor !== "any" && !entity.best_for.includes(filters.bestFor)) return false;
  if (filters.minScore > 0 && entity.top_score < filters.minScore) return false;
  if (
    filters.subreddit !== "any" &&
    !entity.source_threads.some((t) => t.subreddit === filters.subreddit)
  ) {
    return false;
  }
  if (filters.crowd !== "any" && entity.crowd_signal !== filters.crowd) return false;
  return true;
}

export function filterEntities(
  entities: EnrichedEntityProfile[],
  filters: EntityFilters
): EnrichedEntityProfile[] {
  return entities.filter((e) => matchesFilters(e, filters));
}

export function bestForOptions(entities: EnrichedEntityProfile[]): string[] {
  const set = new Set<string>();
  for (const e of entities) for (const tag of e.best_for) set.add(tag);
  return Array.from(set).sort();
}

export function subredditOptions(entities: EnrichedEntityProfile[]): string[] {
  const set = new Set<string>();
  for (const e of entities) for (const t of e.source_threads) set.add(t.subreddit);
  return Array.from(set).sort();
}

export function crowdSignalCoverage(entities: EnrichedEntityProfile[]): number {
  return entities.filter((e) => e.crowd_signal !== null).length;
}
