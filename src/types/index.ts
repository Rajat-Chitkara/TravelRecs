/**
 * Single source of truth for these types lives in scripts/lib/types.ts (the
 * data pipeline). Re-exported here so app code imports from "@/types"
 * without reaching into scripts/.
 */
export type {
  CitiesRegistry,
  City,
  CityEnrichedEntitiesFile,
  CityEntitiesFile,
  CityStatus,
  Confidence,
  CrowdSignal,
  EnrichedEntityProfile,
  EntityProfile,
  EntityType,
  LLMEnrichmentOutput,
  RawMention,
  RawThread,
  Sentiment,
  SentimentCounts,
  SentimentPct,
  SourceThreadRef,
} from "../../scripts/lib/types.ts";
