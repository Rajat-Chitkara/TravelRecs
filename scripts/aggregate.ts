/**
 * Stage 1: deterministic aggregation.
 *   data/raw/<city>/{threads,mentions}.json -> data/processed/<city>/entities.json
 *
 * Groups mentions by entity_normalized, computes mention counts, sentiment
 * breakdowns, the top_score formula (scripts/lib/scoring.ts), a crowd-signal
 * proxy, and representative source threads. No LLM calls in this stage.
 *
 * Usage: npm run aggregate -- tokyo
 */
import fs from "node:fs";
import { CROWD_SIGNAL_MIN_COVERAGE, RANKING_MIN_MENTIONS } from "./lib/constants.ts";
import {
  citiesRegistryPath,
  processedDir,
  processedEntitiesPath,
  rawMentionsPath,
  rawThreadsPath,
} from "./lib/paths.ts";
import { computeTopScore, crowdSignal, slugify } from "./lib/scoring.ts";
import type {
  CitiesRegistry,
  CityEntitiesFile,
  EntityProfile,
  EntityType,
  RawMention,
  SentimentCounts,
  SentimentPct,
  RawThread,
  SourceThreadRef,
} from "./lib/types.ts";

function mode<T extends string>(values: T[]): T {
  const counts = new Map<T, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best: T = values[0];
  let bestCount = 0;
  for (const [v, c] of counts) {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return best;
}

function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) {
    taken.add(base);
    return base;
  }
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  const slug = `${base}-${i}`;
  taken.add(slug);
  return slug;
}

function roundPercentages(counts: SentimentCounts, total: number): SentimentPct {
  const keys = Object.keys(counts) as (keyof SentimentCounts)[];
  if (total === 0) {
    return { positive: 0, neutral: 0, mixed: 0, negative: 0 };
  }
  const raw = keys.map((k) => (counts[k] / total) * 100);
  const floored = raw.map(Math.floor);
  const remainder = 100 - floored.reduce((a, b) => a + b, 0);
  // distribute remaining whole points to the largest fractional parts so the
  // percentages sum to exactly 100
  const fractions = raw.map((v, i) => ({ i, frac: v - floored[i] }));
  fractions.sort((a, b) => b.frac - a.frac);
  for (let j = 0; j < remainder; j++) {
    floored[fractions[j % keys.length].i] += 1;
  }
  const result = {} as SentimentPct;
  keys.forEach((k, i) => {
    result[k] = floored[i];
  });
  return result;
}

function aggregate(citySlug: string) {
  const threads: RawThread[] = JSON.parse(fs.readFileSync(rawThreadsPath(citySlug), "utf-8"));
  const mentions: RawMention[] = JSON.parse(fs.readFileSync(rawMentionsPath(citySlug), "utf-8"));

  const threadsById = new Map(threads.map((t) => [t.thread_id, t]));

  const byEntity = new Map<string, RawMention[]>();
  for (const m of mentions) {
    const arr = byEntity.get(m.entity_normalized) ?? [];
    arr.push(m);
    byEntity.set(m.entity_normalized, arr);
  }

  const takenSlugs = new Set<string>();
  const entities: EntityProfile[] = [];

  for (const [entityNormalized, entMentions] of byEntity) {
    const mentionCount = entMentions.length;
    const entityType = mode(entMentions.map((m) => m.entity_type)) as EntityType;
    // entity_subtype is a reliable descriptor of the place itself for
    // attraction/restaurant/hotel/shop/day_trip (e.g. "temple", "ramen"),
    // but for "neighborhood" it gets contaminated by subtypes of whatever
    // businesses happened to be mentioned within that area (e.g. a single
    // "burger restaurant" mention can outvote mostly-empty subtypes), so we
    // deliberately suppress it there and let the UI fall back to the
    // entity_type label ("Neighborhood") instead of a misleading category.
    const subtypeCandidates =
      entityType === "neighborhood"
        ? []
        : entMentions.map((m) => m.entity_subtype).filter((s) => s !== "");
    const entitySubtype = subtypeCandidates.length > 0 ? mode(subtypeCandidates) : "";

    const sentimentCounts = { positive: 0, neutral: 0, mixed: 0, negative: 0 };
    let recommendationCount = 0;
    let warningCount = 0;
    const commenters = new Set<string>();
    const threadIds = new Set<string>();
    const keyPhrases: string[] = [];

    for (const m of entMentions) {
      sentimentCounts[m.sentiment] += 1;
      recommendationCount += m.is_recommendation;
      warningCount += m.is_warning;
      commenters.add(m.comment_author);
      threadIds.add(m.thread_id);
      keyPhrases.push(m.key_phrase);
    }

    const sentimentPct = roundPercentages(sentimentCounts, mentionCount);

    const topScore = computeTopScore({
      mentions: entMentions,
      recommendationCount,
      warningCount,
    });

    const sourceThreads: SourceThreadRef[] = Array.from(threadIds)
      .map((id) => threadsById.get(id))
      .filter((t): t is RawThread => Boolean(t))
      .sort((a, b) => b.post_score - a.post_score)
      .slice(0, 3)
      .map((t) => ({
        thread_id: t.thread_id,
        thread_title: t.thread_title,
        thread_url: t.thread_url,
        subreddit: t.subreddit,
        post_score: t.post_score,
      }));

    const entityId = uniqueSlug(slugify(entityNormalized), takenSlugs);

    entities.push({
      entity_id: entityId,
      entity_normalized: entityNormalized,
      entity_type: entityType,
      entity_subtype: entitySubtype,
      mention_count: mentionCount,
      unique_commenters: commenters.size,
      eligible_for_ranking: mentionCount >= RANKING_MIN_MENTIONS,
      sentiment_counts: sentimentCounts,
      sentiment_pct: sentimentPct,
      recommendation_count: recommendationCount,
      warning_count: warningCount,
      top_score: topScore,
      crowd_signal: crowdSignal(keyPhrases),
      source_threads: sourceThreads,
      mention_ids: entMentions.map((m) => m.mention_id),
    });
  }

  // sort by top_score desc for a stable, sensible default file order
  entities.sort((a, b) => b.top_score - a.top_score || b.mention_count - a.mention_count);

  const dates = threads.map((t) => t.post_created_date).sort();
  const cityCommenters = new Set(mentions.map((m) => m.comment_author));

  const output: CityEntitiesFile = {
    city_slug: citySlug,
    generated_at: new Date().toISOString(),
    total_mentions: mentions.length,
    total_threads: threads.length,
    date_range: { earliest: dates[0], latest: dates[dates.length - 1] },
    unique_commenters: cityCommenters.size,
    entities,
  };

  fs.mkdirSync(processedDir(citySlug), { recursive: true });
  fs.writeFileSync(processedEntitiesPath(citySlug), JSON.stringify(output, null, 2), "utf-8");

  const eligible = entities.filter((e) => e.eligible_for_ranking);
  const withCrowdSignal = eligible.filter((e) => e.crowd_signal !== null);

  console.log(`Aggregated "${citySlug}":`);
  console.log(`  ${entities.length} distinct entities, ${eligible.length} eligible for ranking (>= ${RANKING_MIN_MENTIONS} mentions)`);
  console.log(`  ${withCrowdSignal.length} entities have a crowd_signal (coverage gate is ${CROWD_SIGNAL_MIN_COVERAGE})`);
  console.log(`  date range ${output.date_range.earliest} .. ${output.date_range.latest}, ${output.unique_commenters} unique commenters`);
  console.log(`  -> ${processedEntitiesPath(citySlug)}`);

  // Patch cities.json place_count if the registry already exists (it may not
  // yet, if this is the first-ever aggregate run before the homepage registry
  // is created in a later phase).
  if (fs.existsSync(citiesRegistryPath())) {
    const registry: CitiesRegistry = JSON.parse(fs.readFileSync(citiesRegistryPath(), "utf-8"));
    const city = registry.cities.find((c) => c.slug === citySlug);
    if (city) {
      city.place_count = eligible.length;
      registry.generated_at = new Date().toISOString();
      fs.writeFileSync(citiesRegistryPath(), JSON.stringify(registry, null, 2), "utf-8");
      console.log(`  patched data/cities.json place_count for "${citySlug}" -> ${eligible.length}`);
    }
  }
}

function main() {
  const citySlug = process.argv[2];
  if (!citySlug) {
    console.error("Usage: npm run aggregate -- <city-slug>");
    process.exit(1);
  }
  aggregate(citySlug);
}

main();
