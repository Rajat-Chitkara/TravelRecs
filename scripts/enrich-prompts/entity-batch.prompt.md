# TravelRecs Stage 2 enrichment — entity batch

You are writing the editorial content for a destination-review website
("TravelRecs") that ranks Tokyo places using **only** what real Reddit
travelers actually said. Your job for this batch is to synthesize a short
verdict, pros, cons, best-for tags, and an optional best-time tag for each
entity below — using **only** the real observations provided. This content
will be shown directly to users as the site's editorial voice, so it must
read naturally, but it must never say anything that isn't traceable back to
the provided data.

## Grounding rule (read this twice)

Every pro, con, verdict clause, and best-for tag **must be directly
traceable** to one or more of the `key_phrases` provided for that entity. Do
**not** introduce facts, prices, opening hours, comparisons, or claims that
are not present in the key_phrases. If the key_phrases don't support a
"best_time" or a specific pro/con, **omit it** rather than invent
it — fewer, well-grounded bullets are better than padded generic ones. It is
completely fine and expected for `cons` to be an empty array (most entities
in this dataset are mentioned positively), and for `best_time` to be `null`.

## Per-entity output requirements

For each entity, produce:

- **verdict**: one sentence (<=30 words) synthesizing the overall consensus
  tone, using the provided `sentiment_pct` plus the dominant theme(s) in the
  key_phrases. You may paraphrase/combine multiple key_phrases into fluent
  prose (e.g. "Iconic and genuinely beautiful — best locals say go at 7am or
  after 9pm to avoid the wall of tour groups."), but every clause must map to
  an actual key_phrase or the computed stats given.
- **pros**: 3-5 short bullets (<=12 words each), each derived from one or
  more positive/recommended key_phrases. If fewer than 3 distinct positive
  themes exist, emit fewer (minimum 1) rather than padding with repeats.
- **cons**: same rule, sourced from negative/mixed/warning key_phrases. Empty
  array is fine and common (don't force a con that isn't really there).
- **best_for**: 2-4 short audience tags (2-4 words each, e.g. "First-time
  visitors", "Photography lovers", "Families"), inferred only from explicit
  cues in key_phrases. Empty array if no audience cues exist.
- **best_time**: a single short tag (e.g. "Early morning (before 7am)") ONLY
  if key_phrases explicitly mention timing/crowd-avoidance advice; otherwise
  `null`.
- **enrichment_confidence**: self-report `"high"` | `"medium"` | `"low"` for
  how well-grounded your synthesis is, based on the volume and clarity of the
  key_phrases (e.g. 3 thin/ambiguous key_phrases -> "low"; 15 clear,
  consistent ones -> "high").

## Output format

Return a **strict JSON array**, one object per entity in the batch, matching
exactly:

```json
[
  {
    "entity_id": "senso-ji-temple",
    "verdict": "...",
    "pros": ["...", "..."],
    "cons": [],
    "best_for": ["...", "..."],
    "best_time": "Early morning (before 7am)",
    "enrichment_confidence": "high"
  }
]
```

No prose outside the JSON array. Echo `entity_id` exactly as given so
responses can be safely re-associated with their source entity. Produce
exactly one output object per entity provided in the batch below — do not
skip any, and do not add entities that aren't in the batch.

## Batch data

{{BATCH_DATA}}
