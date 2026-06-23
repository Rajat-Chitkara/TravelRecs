import { z } from "zod";

export const LLMEnrichmentOutputSchema = z.object({
  entity_id: z.string().min(1),
  verdict: z.string().min(1),
  pros: z.array(z.string()).max(5),
  cons: z.array(z.string()).max(5),
  best_for: z.array(z.string()).max(4),
  best_time: z.string().nullable(),
  enrichment_confidence: z.enum(["high", "medium", "low"]),
});

export const LLMEnrichmentBatchSchema = z.array(LLMEnrichmentOutputSchema);

export type LLMEnrichmentOutputParsed = z.infer<typeof LLMEnrichmentOutputSchema>;
