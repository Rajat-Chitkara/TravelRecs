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
    <div className="flex flex-col items-center gap-10">
      <div className="w-full max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Tokyo, Lisbon, Barcelona"
          className="w-full rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-2 outline-none transition-colors focus:border-accent"
        />
        <p className="mt-3 text-center text-xs text-muted-2">
          Updated quarterly
        </p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
          {filtered.map((city) => (
            <CityCard key={city.slug} city={city} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No cities match &ldquo;{query}&rdquo; yet.</p>
      )}
    </div>
  );
}
