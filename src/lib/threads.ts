import fs from "node:fs";
import path from "node:path";
import type { RawThread } from "@/types";

const cache = new Map<string, RawThread[]>();

function rawThreadsPath(citySlug: string): string {
  return path.join(process.cwd(), "data", "raw", citySlug, "threads.json");
}

export function loadCityThreads(citySlug: string): RawThread[] {
  if (cache.has(citySlug)) return cache.get(citySlug)!;
  const data = JSON.parse(fs.readFileSync(rawThreadsPath(citySlug), "utf-8")) as RawThread[];
  cache.set(citySlug, data);
  return data;
}

export function topThreadsByScore(citySlug: string, limit: number): RawThread[] {
  return [...loadCityThreads(citySlug)].sort((a, b) => b.post_score - a.post_score).slice(0, limit);
}
