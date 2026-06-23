/**
 * Stage 2: LLM enrichment.
 *   data/processed/<city>/entities.json -> data/enriched/<city>/entities.enriched.json
 *
 * This script has two modes because the actual LLM synthesis is dispatched
 * as Claude Code subagent calls (not a direct API integration) — see the
 * project plan. `--prep` produces batch payloads + rendered prompts for the
 * orchestrating agent to hand to subagents; `--merge` takes the subagents'
 * JSON responses and produces the final enriched file.
 *
 * Usage:
 *   npm run enrich -- tokyo --prep [--batch-size=20] [--only=id1,id2] [--stale-only]
 *   ... dispatch scripts/.enrich-work/tokyo/batch-NN.prompt.md to subagents,
 *       save each response as scripts/.enrich-work/tokyo/batch-NN.output.json ...
 *   npm run enrich -- tokyo --merge
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { LLMEnrichmentBatchSchema } from "./lib/enrich-schema.ts";
import {
  enrichedDir,
  enrichedEntitiesPath,
  processedEntitiesPath,
  rawMentionsPath,
} from "./lib/paths.ts";
import type {
  CityEnrichedEntitiesFile,
  CityEntitiesFile,
  EnrichedEntityProfile,
  EntityProfile,
  LLMEnrichmentOutput,
  RawMention,
} from "./lib/types.ts";

const DEFAULT_BATCH_SIZE = 20;

function workDir(citySlug: string): string {
  return path.join(import.meta.dirname, ".enrich-work", citySlug);
}

function inputHash(entity: EntityProfile): string {
  const payload = JSON.stringify({
    mention_ids: [...entity.mention_ids].sort((a, b) => a - b),
    top_score: entity.top_score,
    sentiment_pct: entity.sentiment_pct,
  });
  return crypto.createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

interface BatchEntityPayload {
  entity_id: string;
  entity_normalized: string;
  entity_type: string;
  entity_subtype: string;
  mention_count: number;
  sentiment_pct: EntityProfile["sentiment_pct"];
  recommendation_count: number;
  warning_count: number;
  top_score: number;
  mentions: { sentiment: string; is_recommendation: 0 | 1; is_warning: 0 | 1; key_phrase: string }[];
}

function renderBatchData(entities: BatchEntityPayload[]): string {
  return entities
    .map((e) => {
      const header =
        `### ${e.entity_normalized} (entity_id: "${e.entity_id}", ${e.entity_type}` +
        `${e.entity_subtype ? ` / ${e.entity_subtype}` : ""})\n` +
        `Computed stats: ${e.mention_count} mentions, ${e.sentiment_pct.positive}% positive / ` +
        `${e.sentiment_pct.neutral}% neutral / ${e.sentiment_pct.mixed}% mixed / ` +
        `${e.sentiment_pct.negative}% negative, ${e.recommendation_count} recommendations, ` +
        `${e.warning_count} warnings, top_score ${e.top_score}/10`;
      const lines = e.mentions.map((m) => {
        const flags = [m.sentiment, m.is_recommendation ? "recommended" : null, m.is_warning ? "warning" : null]
          .filter(Boolean)
          .join(", ");
        return `  - [${flags}] "${m.key_phrase}"`;
      });
      return `${header}\nRaw observations:\n${lines.join("\n")}`;
    })
    .join("\n\n");
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function prep(citySlug: string, opts: { batchSize: number; only?: string[]; staleOnly: boolean }) {
  const processed: CityEntitiesFile = JSON.parse(fs.readFileSync(processedEntitiesPath(citySlug), "utf-8"));
  const mentions: RawMention[] = JSON.parse(fs.readFileSync(rawMentionsPath(citySlug), "utf-8"));
  const mentionsById = new Map(mentions.map((m) => [m.mention_id, m]));

  let eligible = processed.entities.filter((e) => e.eligible_for_ranking);

  if (opts.only) {
    const onlySet = new Set(opts.only);
    eligible = eligible.filter((e) => onlySet.has(e.entity_id));
  }

  let existing: CityEnrichedEntitiesFile | null = null;
  if (fs.existsSync(enrichedEntitiesPath(citySlug))) {
    existing = JSON.parse(fs.readFileSync(enrichedEntitiesPath(citySlug), "utf-8"));
  }

  if (opts.staleOnly && existing) {
    const existingByIdHash = new Map(existing.entities.map((e) => [e.entity_id, e.input_hash]));
    eligible = eligible.filter((e) => existingByIdHash.get(e.entity_id) !== inputHash(e));
  }

  eligible.sort((a, b) => b.mention_count - a.mention_count);

  const payloads: BatchEntityPayload[] = eligible.map((e) => ({
    entity_id: e.entity_id,
    entity_normalized: e.entity_normalized,
    entity_type: e.entity_type,
    entity_subtype: e.entity_subtype,
    mention_count: e.mention_count,
    sentiment_pct: e.sentiment_pct,
    recommendation_count: e.recommendation_count,
    warning_count: e.warning_count,
    top_score: e.top_score,
    mentions: e.mention_ids
      .map((id) => mentionsById.get(id))
      .filter((m): m is RawMention => Boolean(m))
      .map((m) => ({
        sentiment: m.sentiment,
        is_recommendation: m.is_recommendation,
        is_warning: m.is_warning,
        key_phrase: m.key_phrase,
      })),
  }));

  const batches = chunk(payloads, opts.batchSize);
  const dir = workDir(citySlug);
  fs.mkdirSync(dir, { recursive: true });

  const promptTemplate = fs.readFileSync(
    path.join(import.meta.dirname, "enrich-prompts", "entity-batch.prompt.md"),
    "utf-8"
  );

  for (const [i, batch] of batches.entries()) {
    const n = String(i + 1).padStart(2, "0");
    fs.writeFileSync(path.join(dir, `batch-${n}.json`), JSON.stringify(batch, null, 2), "utf-8");
    const prompt = promptTemplate.replace("{{BATCH_DATA}}", renderBatchData(batch));
    fs.writeFileSync(path.join(dir, `batch-${n}.prompt.md`), prompt, "utf-8");
  }

  console.log(`Prepped ${eligible.length} entities into ${batches.length} batches for "${citySlug}".`);
  console.log(`  -> ${dir}/batch-NN.json (data) and batch-NN.prompt.md (rendered prompt)`);
  console.log(`Next: dispatch each batch-NN.prompt.md to a subagent, save its JSON array response as batch-NN.output.json, then run --merge.`);
}

function merge(citySlug: string) {
  const processed: CityEntitiesFile = JSON.parse(fs.readFileSync(processedEntitiesPath(citySlug), "utf-8"));
  const entityById = new Map(processed.entities.map((e) => [e.entity_id, e]));

  const dir = workDir(citySlug);
  if (!fs.existsSync(dir)) {
    console.error(`No work directory found at ${dir} — run --prep first.`);
    process.exit(1);
  }

  const outputFiles = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".output.json"))
    .sort();

  if (outputFiles.length === 0) {
    console.error(`No batch-NN.output.json files found in ${dir}.`);
    process.exit(1);
  }

  let existing: CityEnrichedEntitiesFile | null = null;
  if (fs.existsSync(enrichedEntitiesPath(citySlug))) {
    existing = JSON.parse(fs.readFileSync(enrichedEntitiesPath(citySlug), "utf-8"));
  }
  const merged = new Map<string, EnrichedEntityProfile>(
    existing ? existing.entities.map((e) => [e.entity_id, e]) : []
  );

  const errors: string[] = [];
  let mergedCount = 0;

  for (const file of outputFiles) {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
    const parsed = LLMEnrichmentBatchSchema.safeParse(raw);
    if (!parsed.success) {
      errors.push(`${file}: ${parsed.error.message}`);
      continue;
    }
    for (const item of parsed.data as LLMEnrichmentOutput[]) {
      const entity = entityById.get(item.entity_id);
      if (!entity) {
        errors.push(`${file}: entity_id "${item.entity_id}" not found in processed entities.json`);
        continue;
      }
      const enrichedEntity: EnrichedEntityProfile = {
        ...entity,
        verdict: item.verdict,
        pros: item.pros,
        cons: item.cons,
        best_for: item.best_for,
        best_time: item.best_time,
        enrichment_confidence: item.enrichment_confidence,
        enriched_at: new Date().toISOString(),
        input_hash: inputHash(entity),
      };
      merged.set(item.entity_id, enrichedEntity);
      mergedCount++;
    }
  }

  if (errors.length > 0) {
    console.error(`MERGE had ${errors.length} issue(s):`);
    for (const e of errors) console.error(`  - ${e}`);
  }

  const eligible = processed.entities.filter((e) => e.eligible_for_ranking);
  const finalEntities = eligible
    .map((e) => merged.get(e.entity_id))
    .filter((e): e is EnrichedEntityProfile => Boolean(e))
    .sort((a, b) => b.top_score - a.top_score || b.mention_count - a.mention_count);

  const output: CityEnrichedEntitiesFile = {
    city_slug: citySlug,
    generated_at: new Date().toISOString(),
    total_mentions: processed.total_mentions,
    total_threads: processed.total_threads,
    date_range: processed.date_range,
    unique_commenters: processed.unique_commenters,
    entities: finalEntities,
  };

  fs.mkdirSync(enrichedDir(citySlug), { recursive: true });
  fs.writeFileSync(enrichedEntitiesPath(citySlug), JSON.stringify(output, null, 2), "utf-8");

  const missing = eligible.filter((e) => !merged.has(e.entity_id));
  const lowConfidence = finalEntities.filter((e) => e.enrichment_confidence === "low");

  console.log(`Merged ${mergedCount} new/updated enrichment records (batch responses processed: ${outputFiles.length}).`);
  console.log(`Final entities.enriched.json: ${finalEntities.length} of ${eligible.length} eligible entities.`);
  if (missing.length > 0) {
    console.warn(`WARNING: ${missing.length} eligible entities still missing enrichment: ${missing.map((e) => e.entity_id).join(", ")}`);
  }
  if (lowConfidence.length > 0) {
    console.warn(`WARNING: ${lowConfidence.length} entities flagged enrichment_confidence "low" — spot-check: ${lowConfidence.map((e) => e.entity_id).join(", ")}`);
  }
  console.log(`  -> ${enrichedEntitiesPath(citySlug)}`);

  if (errors.length === 0 && missing.length === 0) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`Cleaned up work directory ${dir}.`);
  } else {
    console.log(`Leaving work directory ${dir} in place (re-run --merge after fixing missing/invalid batches).`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const citySlug = args.find((a) => !a.startsWith("--"));
  const isPrep = args.includes("--prep");
  const isMerge = args.includes("--merge");
  const staleOnly = args.includes("--stale-only");
  const batchSizeArg = args.find((a) => a.startsWith("--batch-size="));
  const batchSize = batchSizeArg ? Number(batchSizeArg.slice("--batch-size=".length)) : DEFAULT_BATCH_SIZE;
  const onlyArg = args.find((a) => a.startsWith("--only="));
  const only = onlyArg ? onlyArg.slice("--only=".length).split(",") : undefined;

  if (!citySlug || (!isPrep && !isMerge)) {
    console.error("Usage:");
    console.error("  npm run enrich -- <city-slug> --prep [--batch-size=20] [--only=id1,id2] [--stale-only]");
    console.error("  npm run enrich -- <city-slug> --merge");
    process.exit(1);
  }

  if (isPrep) prep(citySlug, { batchSize, only, staleOnly });
  else merge(citySlug);
}

main();
