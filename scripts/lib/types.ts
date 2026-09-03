/**
 * Shared types for the TravelRecs data pipeline (Stage 0 raw data through
 * Stage 2 enrichment) and the Next.js app. This file is the single source of
 * truth — src/types/index.ts re-exports from here so the pipeline's output
 * shape and what the app reads can never drift apart.
 */

// ---------------------------------------------------------------------------
// Stage 0: raw extraction output (threads.json / mentions.json per city)
// ---------------------------------------------------------------------------

export interface RawThread {
  thread_id: string;
  thread_url: string;
  thread_title: string;
  thread_body: string;
  subreddit: string;
  post_score: number;
  post_comment_count: number;
  post_created_date: string; // YYYY-MM-DD
  source_filename: string;
}

export type EntityType =
  | "attraction"
  | "restaurant"
  | "hotel"
  | "neighborhood"
  | "experience"
  | "day_trip"
  | "shop"
  | "event";

export type Sentiment = "positive" | "neutral" | "mixed" | "negative";
export type Confidence = "high" | "medium" | "low";

export interface RawMention {
  mention_id: number;
  thread_id: string;
  comment_id: string;
  comment_score: number;
  comment_depth: number;
  comment_author: string;
  entity_raw_text: string;
  entity_normalized: string;
  entity_type: EntityType;
  entity_subtype: string;
  sentiment: Sentiment;
  sentiment_confidence: Confidence;
  is_recommendation: 0 | 1;
  is_warning: 0 | 1;
  key_phrase: string;
}

// ---------------------------------------------------------------------------
// Stage 1: deterministic aggregation output (entities.json per city)
// ---------------------------------------------------------------------------

export interface SourceThreadRef {
  thread_id: string;
  thread_title: string;
  thread_url: string;
  subreddit: string;
  post_score: number;
}

export type CrowdSignal = "busy" | "quiet" | "mixed" | null;

export interface SentimentCounts {
  positive: number;
  neutral: number;
  mixed: number;
  negative: number;
}

export interface SentimentPct {
  positive: number;
  neutral: number;
  mixed: number;
  negative: number;
}

export interface EntityProfile {
  entity_id: string; // slug(entity_normalized), e.g. "senso-ji-temple"
  entity_normalized: string;
  entity_type: EntityType;
  entity_subtype: string; // '' allowed
  mention_count: number;
  unique_commenters: number;
  eligible_for_ranking: boolean; // mention_count >= RANKING_MIN_MENTIONS
  sentiment_counts: SentimentCounts;
  sentiment_pct: SentimentPct; // ints summing to ~100
  recommendation_count: number;
  warning_count: number;
  top_score: number; // 0-10, 2 decimals
  crowd_signal: CrowdSignal; // keyword-derived proxy, null if no signal
  source_threads: SourceThreadRef[]; // up to 3, sorted by thread post_score desc
  mention_ids: number[]; // FK list back into mentions.json, used by Stage 2
}

export interface CityEntitiesFile {
  city_slug: string;
  generated_at: string; // ISO timestamp
  total_mentions: number;
  total_threads: number;
  date_range: { earliest: string; latest: string }; // from threads.post_created_date
  unique_commenters: number; // distinct comment_author across all mentions, city-wide
  entities: EntityProfile[];
}

// ---------------------------------------------------------------------------
// Stage 2: LLM enrichment output (entities.enriched.json per city)
// ---------------------------------------------------------------------------

export interface LLMEnrichmentOutput {
  entity_id: string;
  verdict: string;
  pros: string[]; // 0-5 items
  cons: string[]; // 0-5 items
  best_for: string[]; // 0-4 items
  best_time: string | null;
  enrichment_confidence: Confidence;
}

export interface EnrichedEntityProfile extends EntityProfile {
  verdict: string;
  pros: string[];
  cons: string[];
  best_for: string[];
  best_time: string | null;
  enrichment_confidence: Confidence;
  enriched_at: string; // ISO timestamp
  input_hash: string; // hash of inputs that produced this enrichment, for --stale-only re-runs
}

export interface CityEnrichedEntitiesFile {
  city_slug: string;
  generated_at: string;
  total_mentions: number;
  total_threads: number;
  date_range: { earliest: string; latest: string };
  unique_commenters: number;
  entities: EnrichedEntityProfile[]; // only eligible_for_ranking entities
}

// ---------------------------------------------------------------------------
// City registry (data/cities.json)
// ---------------------------------------------------------------------------

export type CityStatus = "active" | "coming_soon";

export interface City {
  slug: string;
  display_name: string;
  status: CityStatus;
  icon: string; // path under /public/icons
  photo?: string; // optional hero photo under /public/images
  place_count: number | null; // null for coming_soon cities
  country: string;
}

export interface CitiesRegistry {
  generated_at: string;
  cities: City[];
}
