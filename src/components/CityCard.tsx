import Image from "next/image";
import Link from "next/link";
import type { City } from "@/types";

export function CityCard({ city }: { city: City }) {
  const isActive = city.status === "active";

  return (
    <Link
      href={`/${city.slug}`}
      className={`group relative flex flex-col items-center gap-3 rounded-xl border px-6 py-8 text-center transition-colors ${
        isActive
          ? "border-surface-border bg-surface hover:border-accent/60 hover:bg-surface-raised"
          : "border-surface-border/60 bg-surface/50 hover:border-surface-border"
      }`}
    >
      {!isActive && (
        <span className="absolute right-3 top-3 rounded-full border border-surface-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
          Coming soon
        </span>
      )}
      <Image
        src={city.icon}
        alt=""
        width={32}
        height={32}
        unoptimized
        className={isActive ? "" : "opacity-40 grayscale"}
      />
      <div>
        <div
          className={`text-base font-semibold ${
            isActive ? "text-foreground" : "text-muted"
          }`}
        >
          {city.display_name}
        </div>
        <div className="mt-0.5 text-sm text-muted-2">
          {isActive && city.place_count !== null
            ? `${city.place_count.toLocaleString("en-US")} places`
            : "Coming soon"}
        </div>
      </div>
    </Link>
  );
}
