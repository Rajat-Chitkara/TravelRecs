"use client";

import { useMemo, useState } from "react";
import type { CrowdSignal, EnrichedEntityProfile } from "@/types";
import { CROWD_SIGNAL_MIN_COVERAGE } from "@/lib/constants";
import {
  bestForOptions as computeBestForOptions,
  crowdSignalCoverage,
  DEFAULT_FILTERS,
  filterEntities,
  subredditOptions as computeSubredditOptions,
  type EntityFilters,
} from "@/lib/filters";
import { RankedEntityCard } from "./RankedEntityCard";

const SCORE_THRESHOLDS = [
  { label: "Any score", value: 0 },
  { label: "8+", value: 8 },
  { label: "6+", value: 6 },
  { label: "4+", value: 4 },
];

const CROWD_OPTIONS: { label: string; value: CrowdSignal | "any" }[] = [
  { label: "Any", value: "any" },
  { label: "Busy", value: "busy" },
  { label: "Quiet", value: "quiet" },
  { label: "Mixed", value: "mixed" },
];

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="flex items-center gap-2 whitespace-nowrap rounded-full border border-surface-border bg-surface px-3 py-1.5 text-xs text-muted">
      <span className="text-muted-2">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-foreground outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface text-foreground">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function DestinationExplorer({
  citySlug,
  entities,
}: {
  citySlug: string;
  entities: EnrichedEntityProfile[];
}) {
  const [filters, setFilters] = useState<EntityFilters>(DEFAULT_FILTERS);

  const bestForOptions = useMemo(() => computeBestForOptions(entities), [entities]);
  const subredditOptions = useMemo(() => computeSubredditOptions(entities), [entities]);
  const showCrowdFilter = useMemo(
    () => crowdSignalCoverage(entities) >= CROWD_SIGNAL_MIN_COVERAGE,
    [entities]
  );
  const filtered = useMemo(() => filterEntities(entities, filters), [entities, filters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Best for"
          value={filters.bestFor}
          onChange={(v) => setFilters((f) => ({ ...f, bestFor: v }))}
          options={[{ label: "Any", value: "any" }, ...bestForOptions.map((o) => ({ label: o, value: o }))]}
        />
        <FilterSelect
          label="Top score"
          value={String(filters.minScore)}
          onChange={(v) => setFilters((f) => ({ ...f, minScore: Number(v) }))}
          options={SCORE_THRESHOLDS.map((t) => ({ label: t.label, value: String(t.value) }))}
        />
        <FilterSelect
          label="Subreddits"
          value={filters.subreddit}
          onChange={(v) => setFilters((f) => ({ ...f, subreddit: v }))}
          options={[{ label: "Any", value: "any" }, ...subredditOptions.map((o) => ({ label: `r/${o}`, value: o }))]}
        />
        {showCrowdFilter && (
          <FilterSelect
            label="Crowd level"
            value={filters.crowd ?? "any"}
            onChange={(v) => setFilters((f) => ({ ...f, crowd: v as CrowdSignal | "any" }))}
            options={CROWD_OPTIONS.map((o) => ({ label: o.label, value: o.value ?? "any" }))}
          />
        )}
      </div>

      <div className="text-xs font-semibold uppercase tracking-wide text-muted-2">
        Ranked by Lantern™ &middot; {filtered.length} of {entities.length} places
      </div>

      <div className="space-y-4">
        {filtered.map((entity, i) => (
          <RankedEntityCard key={entity.entity_id} rank={i + 1} citySlug={citySlug} entity={entity} />
        ))}
        {filtered.length === 0 && (
          <p className="rounded-xl border border-surface-border bg-surface/50 p-6 text-center text-sm text-muted">
            No places match these filters yet.
          </p>
        )}
      </div>
    </div>
  );
}
