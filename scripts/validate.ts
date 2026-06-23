/**
 * Sanity checks run after each pipeline stage.
 *
 * Usage:
 *   npm run validate -- tokyo --stage=1
 *   npm run validate -- tokyo --stage=2
 */
import fs from "node:fs";
import {
  enrichedEntitiesPath,
  processedEntitiesPath,
  rawMentionsPath,
} from "./lib/paths.ts";
import type { CityEnrichedEntitiesFile, CityEntitiesFile, RawMention } from "./lib/types.ts";

function fail(messages: string[]): never {
  console.error(`VALIDATION FAILED (${messages.length} issue${messages.length === 1 ? "" : "s"}):`);
  for (const m of messages) console.error(`  - ${m}`);
  process.exit(1);
}

function validateStage1(citySlug: string) {
  const issues: string[] = [];
  const data: CityEntitiesFile = JSON.parse(fs.readFileSync(processedEntitiesPath(citySlug), "utf-8"));
  const mentions: RawMention[] = JSON.parse(fs.readFileSync(rawMentionsPath(citySlug), "utf-8"));
  const mentionIds = new Set(mentions.map((m) => m.mention_id));

  const seenSlugs = new Set<string>();
  for (const e of data.entities) {
    if (e.top_score < 0 || e.top_score > 10) {
      issues.push(`${e.entity_id}: top_score ${e.top_score} out of [0,10]`);
    }
    const pctSum = Object.values(e.sentiment_pct).reduce((a, b) => a + b, 0);
    if (Math.abs(pctSum - 100) > 1 && e.mention_count > 0) {
      issues.push(`${e.entity_id}: sentiment_pct sums to ${pctSum}, expected ~100`);
    }
    for (const id of e.mention_ids) {
      if (!mentionIds.has(id)) {
        issues.push(`${e.entity_id}: mention_id ${id} does not resolve in mentions.json`);
      }
    }
    if (e.mention_ids.length !== e.mention_count) {
      issues.push(`${e.entity_id}: mention_ids.length (${e.mention_ids.length}) != mention_count (${e.mention_count})`);
    }
    if (seenSlugs.has(e.entity_id)) {
      issues.push(`duplicate entity_id slug: ${e.entity_id}`);
    }
    seenSlugs.add(e.entity_id);
  }

  if (issues.length > 0) fail(issues);

  const eligible = data.entities.filter((e) => e.eligible_for_ranking);
  console.log(`Stage 1 validation passed for "${citySlug}": ${data.entities.length} entities, ${eligible.length} eligible.`);
}

function validateStage2(citySlug: string) {
  const issues: string[] = [];
  const processed: CityEntitiesFile = JSON.parse(fs.readFileSync(processedEntitiesPath(citySlug), "utf-8"));
  const enrichedPath = enrichedEntitiesPath(citySlug);

  if (!fs.existsSync(enrichedPath)) {
    fail([`${enrichedPath} does not exist yet — run npm run enrich -- ${citySlug} first.`]);
  }

  const enriched: CityEnrichedEntitiesFile = JSON.parse(fs.readFileSync(enrichedPath, "utf-8"));
  const enrichedIds = new Set(enriched.entities.map((e) => e.entity_id));

  const eligible = processed.entities.filter((e) => e.eligible_for_ranking);
  const missing = eligible.filter((e) => !enrichedIds.has(e.entity_id));
  if (missing.length > 0) {
    console.warn(
      `WARNING: ${missing.length} eligible entities have no enrichment record (skipped batches?): ` +
        missing.map((e) => e.entity_id).join(", ")
    );
  }

  const lowConfidence = enriched.entities.filter((e) => e.enrichment_confidence === "low");
  if (lowConfidence.length > 0) {
    console.warn(
      `WARNING: ${lowConfidence.length} entities have enrichment_confidence "low" — spot-check grounding: ` +
        lowConfidence.map((e) => e.entity_id).join(", ")
    );
  }

  let allEmptyCount = 0;
  for (const e of enriched.entities) {
    // An entity with no pros/cons/best_for/best_time is legitimate when its
    // mentions are genuinely thin and neutral (the LLM correctly avoided
    // fabricating content) — not an error, just worth surfacing as a count
    // so it's visible during review. Only a missing verdict is a hard fail,
    // since every entity should get at least a one-line synthesis.
    if (e.pros.length === 0 && e.cons.length === 0 && e.best_for.length === 0 && !e.best_time) {
      allEmptyCount++;
    }
    if (!e.verdict || e.verdict.trim().length === 0) {
      issues.push(`${e.entity_id}: empty verdict`);
    }
  }
  if (allEmptyCount > 0) {
    console.warn(`NOTE: ${allEmptyCount} entities have no pros/cons/best_for/best_time (thin, neutral source data — expected, not an error).`);
  }

  if (issues.length > 0) fail(issues);

  console.log(
    `Stage 2 validation passed for "${citySlug}": ${enriched.entities.length} enriched entities ` +
      `(${missing.length} eligible entities missing, ${lowConfidence.length} flagged low-confidence).`
  );
}

function main() {
  const args = process.argv.slice(2);
  const citySlug = args.find((a) => !a.startsWith("--"));
  const stageArg = args.find((a) => a.startsWith("--stage="));
  const stage = stageArg ? stageArg.slice("--stage=".length) : undefined;

  if (!citySlug || !stage) {
    console.error("Usage: npm run validate -- <city-slug> --stage=<1|2>");
    process.exit(1);
  }

  if (stage === "1") validateStage1(citySlug);
  else if (stage === "2") validateStage2(citySlug);
  else {
    console.error(`Unknown stage "${stage}", expected 1 or 2.`);
    process.exit(1);
  }
}

main();
