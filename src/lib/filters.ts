import type { CrowdSignal, EnrichedEntityProfile, EntityType } from "@/types";

export interface EntityFilters {
  entityType: EntityType | "any";
  search: string;
  minScore: number;
  subreddit: string | "any";
  crowd: CrowdSignal | "any";
}

export const DEFAULT_FILTERS: EntityFilters = {
  entityType: "any",
  search: "",
  minScore: 0,
  subreddit: "any",
  crowd: "any",
};

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  attraction: "Attractions",
  restaurant: "Restaurants",
  hotel: "Hotels",
  neighborhood: "Neighbourhoods",
  experience: "Experiences",
  day_trip: "Day Trips",
  shop: "Shops",
  event: "Events",
};

export function matchesFilters(entity: EnrichedEntityProfile, filters: EntityFilters): boolean {
  if (filters.entityType !== "any" && entity.entity_type !== filters.entityType) return false;
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    if (!entity.entity_normalized.toLowerCase().includes(q)) return false;
  }
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

export function entityTypeOptions(entities: EnrichedEntityProfile[]): EntityType[] {
  const seen = new Set<EntityType>();
  for (const e of entities) seen.add(e.entity_type);
  const order: EntityType[] = ["attraction", "neighborhood", "restaurant", "hotel", "experience", "day_trip", "shop", "event"];
  return order.filter((t) => seen.has(t));
}

export function filterEntities(
  entities: EnrichedEntityProfile[],
  filters: EntityFilters
): EnrichedEntityProfile[] {
  return entities
    .filter((e) => matchesFilters(e, filters))
    .sort((a, b) => b.mention_count - a.mention_count || b.top_score - a.top_score);
}


export function subredditOptions(entities: EnrichedEntityProfile[]): string[] {
  const set = new Set<string>();
  for (const e of entities) for (const t of e.source_threads) set.add(t.subreddit);
  return Array.from(set).sort();
}

export function crowdSignalCoverage(entities: EnrichedEntityProfile[]): number {
  return entities.filter((e) => e.crowd_signal !== null).length;
}
