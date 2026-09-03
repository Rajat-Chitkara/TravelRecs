import fs from "node:fs";
import path from "node:path";
import type { CityEnrichedEntitiesFile, EnrichedEntityProfile } from "@/types";

function enrichedPath(citySlug: string): string {
  return path.join(process.cwd(), "data", "enriched", citySlug, "entities.enriched.json");
}

export function hasEnrichedData(citySlug: string): boolean {
  return fs.existsSync(enrichedPath(citySlug));
}

export function loadCityEntities(citySlug: string): CityEnrichedEntitiesFile | null {
  if (!hasEnrichedData(citySlug)) return null;
  return JSON.parse(fs.readFileSync(enrichedPath(citySlug), "utf-8")) as CityEnrichedEntitiesFile;
}

export function getEntityBySlug(citySlug: string, entityId: string): EnrichedEntityProfile | undefined {
  const data = loadCityEntities(citySlug);
  return data?.entities.find((e) => e.entity_id === entityId);
}
