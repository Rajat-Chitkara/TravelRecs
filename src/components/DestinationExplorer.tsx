"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CrowdSignal, EnrichedEntityProfile, EntityType } from "@/types";
import { CROWD_SIGNAL_MIN_COVERAGE } from "@/lib/constants";
import {
  crowdSignalCoverage,
  DEFAULT_FILTERS,
  ENTITY_TYPE_LABELS,
  entityTypeOptions,
  filterEntities,
  subredditOptions as computeSubredditOptions,
  type EntityFilters,
} from "@/lib/filters";
import { titleCase } from "@/lib/format";

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
    <label className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-surface-border bg-surface px-3 py-1.5 text-xs text-muted hover:border-foreground/20">
      <span className="text-muted-2">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent text-foreground outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface text-foreground">
            {o.label}
          </option>
        ))}
      </select>
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-2">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </label>
  );
}

export function DestinationExplorer({
  citySlug,
  entities,
  cityName,
}: {
  citySlug: string;
  entities: EnrichedEntityProfile[];
  cityName: string;
}) {
  const [filters, setFilters] = useState<EntityFilters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const availableTypes = useMemo(() => entityTypeOptions(entities), [entities]);
  const subredditOptions = useMemo(() => computeSubredditOptions(entities), [entities]);
  const showCrowdFilter = useMemo(() => crowdSignalCoverage(entities) >= CROWD_SIGNAL_MIN_COVERAGE, [entities]);
  const filtered = useMemo(() => filterEntities(entities, filters), [entities, filters]);

  const selected = useMemo(
    () => filtered.find((e) => e.entity_id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId]
  );
  const selectedRank = filtered.findIndex((e) => e.entity_id === selected?.entity_id) + 1;

  return (
    <div>
      {/* Category pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilters((f) => ({ ...f, entityType: "any" }))}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            filters.entityType === "any"
              ? "bg-foreground text-background"
              : "border border-surface-border bg-surface text-muted hover:border-foreground/20 hover:text-foreground"
          }`}
        >
          All
        </button>
        {availableTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilters((f) => ({ ...f, entityType: type as EntityType }))}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filters.entityType === type
                ? "bg-foreground text-background"
                : "border border-surface-border bg-surface text-muted hover:border-foreground/20 hover:text-foreground"
            }`}
          >
            {ENTITY_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Toolbar: search + filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search places…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-full rounded-full border border-surface-border bg-surface py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-2 outline-none focus:border-foreground/30"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Min score"
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
              label="Crowd"
              value={filters.crowd ?? "any"}
              onChange={(v) => setFilters((f) => ({ ...f, crowd: v as CrowdSignal | "any" }))}
              options={CROWD_OPTIONS.map((o) => ({ label: o.label, value: o.value ?? "any" }))}
            />
          )}
        </div>
      </div>

      {/* Two-column on desktop; single accordion list on mobile */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[380px_1fr]">
        {/* Ranked list — inline accordion on mobile, plain list on desktop */}
        <div className="rounded-xl border border-surface-border bg-surface shadow-sm">
          <div className="border-b border-surface-border px-4 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-2">
              Ranked by Mentions · {filtered.length} places
            </span>
          </div>

          {filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">No places match these filters.</p>
          ) : (
            <div>
              {filtered.map((entity, i) => {
                const isSelected = selectedId === entity.entity_id;
                const positivePct = Math.round(entity.sentiment_pct.positive);
                const neutralPct = Math.round(entity.sentiment_pct.neutral);
                const mixedPct = Math.round(entity.sentiment_pct.mixed);
                const negativePct = Math.round(entity.sentiment_pct.negative);

                return (
                  <div key={entity.entity_id} className="border-b border-surface-border last:border-b-0">
                    <button
                      onClick={() => setSelectedId(isSelected ? null : entity.entity_id)}
                      className={`w-full px-4 py-4 text-left transition-colors hover:bg-surface-raised ${
                        isSelected ? "border-l-[3px] border-l-accent bg-surface-raised" : "border-l-[3px] border-l-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            i === 0 ? "bg-accent text-white" : "border border-surface-border text-muted-2"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] uppercase tracking-wide text-muted-2">
                            {titleCase(entity.entity_subtype || entity.entity_type)}
                          </div>
                          <div className="truncate text-sm font-semibold text-foreground">
                            {entity.entity_normalized}
                          </div>
                          <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full">
                            <div style={{ width: `${positivePct}%`, backgroundColor: "#10b981" }} />
                            <div style={{ width: `${neutralPct}%`, backgroundColor: "#94a3b8" }} />
                            <div style={{ width: `${mixedPct}%`, backgroundColor: "#fbbf24" }} />
                            <div style={{ width: `${negativePct}%`, backgroundColor: "#f87171" }} />
                          </div>
                          <div className="mt-1.5 text-[11px] text-muted">
                            <span className="font-semibold" style={{ color: "#059669" }}>{positivePct}% positive</span>
                            {" · "}{entity.mention_count} mentions
                          </div>
                          {entity.verdict && (
                            <p className="mt-1 line-clamp-1 text-[11px] text-muted-2">{entity.verdict}</p>
                          )}
                        </div>
                        {/* Chevron indicator — mobile only */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`mt-1 shrink-0 text-muted-2 transition-transform lg:hidden ${isSelected ? "rotate-180" : ""}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </button>

                    {/* Inline accordion detail — mobile only */}
                    {isSelected && (
                      <div className="border-t border-surface-border bg-surface-raised px-4 py-4 lg:hidden">
                        <MobileDetailPanel entity={entity} citySlug={citySlug} cityName={cityName} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right sticky panel — desktop only */}
        <div className="hidden lg:sticky lg:top-[57px] lg:block lg:max-h-[calc(100vh-57px)] lg:overflow-y-auto">
          {selected ? (
            <DetailPanel
              entity={selected}
              rank={selectedRank}
              total={filtered.length}
              citySlug={citySlug}
              cityName={cityName}
            />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-surface-border bg-surface text-sm text-muted">
              Select a place to see details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileDetailPanel({
  entity,
  citySlug,
  cityName,
}: {
  entity: EnrichedEntityProfile;
  citySlug: string;
  cityName: string;
}) {
  const positivePct = Math.round(entity.sentiment_pct.positive);
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(entity.entity_normalized + " " + cityName)}`;

  return (
    <div className="space-y-3">
      {/* Verdict */}
      {entity.verdict && (
        <p className="text-sm leading-relaxed text-muted">{entity.verdict}</p>
      )}

      {/* Quick stats */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-lg border border-surface-border bg-surface px-3 py-2 text-center">
          <div className="text-base font-bold text-foreground">{entity.mention_count}</div>
          <div className="text-[10px] text-muted-2">mentions</div>
        </div>
        <div className="flex-1 rounded-lg border border-surface-border bg-surface px-3 py-2 text-center">
          <div className="text-base font-bold text-foreground">{positivePct}%</div>
          <div className="text-[10px] text-muted-2">positive</div>
        </div>
      </div>

      {/* Pros */}
      {entity.pros.length > 0 && (
        <div className="rounded-lg border border-positive-border bg-positive-bg px-3 py-2.5">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-positive">Pros</div>
          <ul className="space-y-1">
            {entity.pros.slice(0, 3).map((pro, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-foreground">
                <span className="shrink-0 font-bold text-positive">+</span>{pro}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cons */}
      {entity.cons.length > 0 && (
        <div className="rounded-lg border border-negative-border bg-negative-bg px-3 py-2.5">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-negative">Cons</div>
          <ul className="space-y-1">
            {entity.cons.slice(0, 2).map((con, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-foreground">
                <span className="shrink-0 font-bold text-negative">–</span>{con}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Best for */}
      {entity.best_for.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entity.best_for.map((tag) => (
            <span key={tag} className="rounded-full border border-surface-border bg-surface px-2.5 py-0.5 text-[11px] text-muted">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* CTAs */}
      <div className="flex gap-2 pt-1">
        <Link
          href={`/${citySlug}/${entity.entity_id}`}
          className="flex-1 rounded-xl bg-foreground px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-foreground/85"
        >
          Full analysis →
        </Link>
        <a
          href={googleSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs font-medium text-muted transition-colors hover:text-foreground"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Search
        </a>
      </div>
    </div>
  );
}

function DetailPanel({
  entity,
  rank,
  total,
  citySlug,
  cityName,
}: {
  entity: EnrichedEntityProfile;
  rank: number;
  total: number;
  citySlug: string;
  cityName: string;
}) {
  const [showAllPros, setShowAllPros] = useState(false);
  const [showAllCons, setShowAllCons] = useState(false);

  const positivePct = Math.round(entity.sentiment_pct.positive);
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(entity.entity_normalized + " " + cityName)}`;

  const LIMIT = 3;
  const visiblePros = showAllPros ? entity.pros : entity.pros.slice(0, LIMIT);
  const hiddenPros = entity.pros.length - LIMIT;
  const visibleCons = showAllCons ? entity.cons : entity.cons.slice(0, LIMIT);
  const hiddenCons = entity.cons.length - LIMIT;

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-surface shadow-sm">
      {/* Header */}
      <div className="border-b border-surface-border p-6">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-2">
          {titleCase(entity.entity_subtype || entity.entity_type)}
        </div>
        <h2 className="font-mono text-2xl font-bold leading-tight text-foreground">
          {entity.entity_normalized}
        </h2>
        {entity.verdict && (
          <p className="mt-2 text-sm leading-relaxed text-muted">{entity.verdict}</p>
        )}
      </div>

      <div className="space-y-4 p-6">
        {/* Stats — mentions + sentiment */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface-raised p-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <div>
              <div className="text-lg font-bold text-foreground">{entity.mention_count}</div>
              <div className="text-[11px] text-muted-2">total mentions</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface-raised p-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-2">
              <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            <div>
              <div className="text-lg font-bold text-foreground">{positivePct}% positive</div>
              <div className="text-[11px] text-muted-2">sentiment score</div>
            </div>
          </div>
        </div>

        {/* Pros & Cons */}
        {(entity.pros.length > 0 || entity.cons.length > 0) && (
          <div className="grid grid-cols-2 gap-3">
            {entity.pros.length > 0 && (
              <div className="rounded-lg border border-positive-border bg-positive-bg p-4">
                <div className="mb-3 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-positive">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                  </svg>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-positive">Top Pros</span>
                </div>
                <ul className="space-y-2">
                  {visiblePros.map((pro, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-positive text-[10px] font-bold text-white">+</span>
                      {pro}
                    </li>
                  ))}
                </ul>
                {hiddenPros > 0 && !showAllPros && (
                  <button
                    onClick={() => setShowAllPros(true)}
                    className="mt-2.5 rounded-full border border-positive-border px-2.5 py-0.5 text-[11px] font-medium text-positive transition-colors hover:bg-positive-border"
                  >
                    +{hiddenPros} more
                  </button>
                )}
              </div>
            )}
            {entity.cons.length > 0 && (
              <div className="rounded-lg border border-negative-border bg-negative-bg p-4">
                <div className="mb-3 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-negative">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                  </svg>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-negative">Top Cons</span>
                </div>
                <ul className="space-y-2">
                  {visibleCons.map((con, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-negative text-[10px] font-bold text-white">–</span>
                      {con}
                    </li>
                  ))}
                </ul>
                {hiddenCons > 0 && !showAllCons && (
                  <button
                    onClick={() => setShowAllCons(true)}
                    className="mt-2.5 rounded-full border border-negative-border px-2.5 py-0.5 text-[11px] font-medium text-negative transition-colors hover:bg-negative-border"
                  >
                    +{hiddenCons} more
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Best for */}
        {entity.best_for.length > 0 && (
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Best for</div>
            <div className="flex flex-wrap gap-2">
              {entity.best_for.map((tag) => (
                <span key={tag} className="rounded-full border border-surface-border bg-surface-raised px-3 py-1 text-xs text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-2 pt-1">
          <Link
            href={`/${citySlug}/${entity.entity_id}`}
            className="flex-1 rounded-xl bg-foreground px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-foreground/85"
          >
            View full analysis →
          </Link>
          <a
            href={googleSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-foreground/20 hover:text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Search
          </a>
        </div>
      </div>
    </div>
  );
}
