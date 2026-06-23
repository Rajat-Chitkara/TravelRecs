"use client";

import { useMemo, useState } from "react";
import type { CrowdSignal, EnrichedEntityProfile } from "@/types";
import { CROWD_SIGNAL_MIN_COVERAGE } from "@/lib/constants";
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
    <label className="flex items-center gap-2 rounded-full border border-surface-border bg-surface px-3 py-1.5 text-xs text-muted">
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
  const [bestFor, setBestFor] = useState("any");
  const [minScore, setMinScore] = useState("0");
  const [subreddit, setSubreddit] = useState("any");
  const [crowd, setCrowd] = useState("any");

  const bestForOptions = useMemo(() => {
    const set = new Set<string>();
    for (const e of entities) for (const tag of e.best_for) set.add(tag);
    return Array.from(set).sort();
  }, [entities]);

  const subredditOptions = useMemo(() => {
    const set = new Set<string>();
    for (const e of entities) for (const t of e.source_threads) set.add(t.subreddit);
    return Array.from(set).sort();
  }, [entities]);

  const crowdCoverageCount = useMemo(
    () => entities.filter((e) => e.crowd_signal !== null).length,
    [entities]
  );
  const showCrowdFilter = crowdCoverageCount >= CROWD_SIGNAL_MIN_COVERAGE;

  const filtered = useMemo(() => {
    return entities.filter((e) => {
      if (bestFor !== "any" && !e.best_for.includes(bestFor)) return false;
      if (Number(minScore) > 0 && e.top_score < Number(minScore)) return false;
      if (subreddit !== "any" && !e.source_threads.some((t) => t.subreddit === subreddit)) return false;
      if (crowd !== "any" && e.crowd_signal !== crowd) return false;
      return true;
    });
  }, [entities, bestFor, minScore, subreddit, crowd]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Best for"
          value={bestFor}
          onChange={setBestFor}
          options={[{ label: "Any", value: "any" }, ...bestForOptions.map((o) => ({ label: o, value: o }))]}
        />
        <FilterSelect
          label="Top score"
          value={minScore}
          onChange={setMinScore}
          options={SCORE_THRESHOLDS.map((t) => ({ label: t.label, value: String(t.value) }))}
        />
        <FilterSelect
          label="Subreddits"
          value={subreddit}
          onChange={setSubreddit}
          options={[{ label: "Any", value: "any" }, ...subredditOptions.map((o) => ({ label: `r/${o}`, value: o }))]}
        />
        {showCrowdFilter && (
          <FilterSelect
            label="Crowd level"
            value={crowd}
            onChange={setCrowd}
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
