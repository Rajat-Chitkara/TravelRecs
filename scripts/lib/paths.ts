import path from "node:path";

export const PROJECT_ROOT = path.resolve(import.meta.dirname, "..", "..");

export const dataDir = (...segments: string[]) =>
  path.join(PROJECT_ROOT, "data", ...segments);

export const rawDir = (citySlug: string) => dataDir("raw", citySlug);
export const processedDir = (citySlug: string) => dataDir("processed", citySlug);
export const enrichedDir = (citySlug: string) => dataDir("enriched", citySlug);

export const rawThreadsPath = (citySlug: string) =>
  path.join(rawDir(citySlug), "threads.json");
export const rawMentionsPath = (citySlug: string) =>
  path.join(rawDir(citySlug), "mentions.json");
export const processedEntitiesPath = (citySlug: string) =>
  path.join(processedDir(citySlug), "entities.json");
export const enrichedEntitiesPath = (citySlug: string) =>
  path.join(enrichedDir(citySlug), "entities.enriched.json");
export const citiesRegistryPath = () => dataDir("cities.json");
