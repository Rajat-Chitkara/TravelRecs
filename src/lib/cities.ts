import fs from "node:fs";
import path from "node:path";
import type { CitiesRegistry, City } from "@/types";

const CITIES_PATH = path.join(process.cwd(), "data", "cities.json");

function readRegistry(): CitiesRegistry {
  return JSON.parse(fs.readFileSync(CITIES_PATH, "utf-8")) as CitiesRegistry;
}

export function loadCities(): City[] {
  return readRegistry().cities;
}

export function getCityBySlug(slug: string): City | undefined {
  return readRegistry().cities.find((c) => c.slug === slug);
}
