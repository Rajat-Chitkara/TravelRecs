import fs from "node:fs";
import path from "node:path";
import type { RawMention, SourceThreadRef } from "@/types";
import { loadCityThreads } from "./threads";

const cache = new Map<string, RawMention[]>();

function rawMentionsPath(citySlug: string): string {
  return path.join(process.cwd(), "data", "raw", citySlug, "mentions.json");
}

export function loadCityMentions(citySlug: string): RawMention[] {
  if (cache.has(citySlug)) return cache.get(citySlug)!;
  const data = JSON.parse(fs.readFileSync(rawMentionsPath(citySlug), "utf-8")) as RawMention[];
  cache.set(citySlug, data);
  return data;
}

export function mentionsByIds(citySlug: string, mentionIds: number[]): RawMention[] {
  const ids = new Set(mentionIds);
  return loadCityMentions(citySlug).filter((m) => ids.has(m.mention_id));
}

/** All distinct source threads for a set of mention_ids, uncapped, sorted by post_score desc. */
export function allSourceThreadsForMentions(
  citySlug: string,
  mentionIds: number[]
): SourceThreadRef[] {
  const mentions = mentionsByIds(citySlug, mentionIds);
  const threadIds = new Set(mentions.map((m) => m.thread_id));
  const threadsById = new Map(loadCityThreads(citySlug).map((t) => [t.thread_id, t]));

  return Array.from(threadIds)
    .map((id) => threadsById.get(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .sort((a, b) => b.post_score - a.post_score)
    .map((t) => ({
      thread_id: t.thread_id,
      thread_title: t.thread_title,
      thread_url: t.thread_url,
      subreddit: t.subreddit,
      post_score: t.post_score,
    }));
}
