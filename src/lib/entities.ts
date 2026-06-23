import fs from "node:fs";
import path from "node:path";
import type { CityEnrichedEntitiesFile, EnrichedEntityProfile } from "@/types";

const cache = new Map<string, CityEnrichedEntitiesFile>();

function enrichedPath(citySlug: string): string {
  return path.join(process.cwd(), "data", "enriched", citySlug, "entities.enriched.json");
}

export function hasEnrichedData(citySlug: string): boolean {
  return fs.existsSync(enrichedPath(citySlug));
}

export function loadCityEntities(citySlug: string): CityEnrichedEntitiesFile | null {
  if (cache.has(citySlug)) return cache.get(citySlug)!;
  if (!hasEnrichedData(citySlug)) return null;
  const data = JSON.parse(fs.readFileSync(enrichedPath(citySlug), "utf-8")) as CityEnrichedEntitiesFile;
  cache.set(citySlug, data);
  return data;
}

export function getEntityBySlug(citySlug: string, entityId: string): EnrichedEntityProfile | undefined {
  const data = loadCityEntities(citySlug);
  return data?.entities.find((e) => e.entity_id === entityId);
}
