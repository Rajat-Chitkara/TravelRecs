"use client";

import { useMemo, useState } from "react";
import type { City } from "@/types";
import { CityCard } from "./CityCard";

export function CityExplorer({ cities }: { cities: City[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(
      (c) =>
        c.display_name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    );
  }, [cities, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destinations…"
            className="w-full rounded-full border border-surface-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-2 outline-none transition-colors focus:border-accent"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["Tokyo", "Rome", "Bangkok", "Lisbon"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuery(tag)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                query.toLowerCase() === tag.toLowerCase()
                  ? "border-accent bg-accent text-white"
                  : "border-surface-border bg-surface text-muted hover:border-accent/40 hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((city, i) => (
            <CityCard key={city.slug} city={city} rank={i === 0 && city.status === "active" ? 1 : undefined} />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted">
          No destinations match &ldquo;{query}&rdquo; yet.
        </p>
      )}
    </div>
  );
}
