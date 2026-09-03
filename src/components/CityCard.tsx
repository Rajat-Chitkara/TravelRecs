import Image from "next/image";
import Link from "next/link";
import type { City } from "@/types";

export function CityCard({ city, rank }: { city: City; rank?: number }) {
  const isActive = city.status === "active";

  return (
    <Link
      href={`/${city.slug}`}
      className="group relative block overflow-hidden rounded-2xl"
      style={{ aspectRatio: "3/2" }}
    >
      {city.photo ? (
        <Image
          src={city.photo}
          alt={city.display_name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0" style={{
          background: "linear-gradient(135deg, #8b7355 0%, #6b5a3e 40%, #4a3f2f 100%)"
        }} />
      )}

      {/* Base gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

      {/* Coming soon dimming */}
      {!isActive && (
        <div className="absolute inset-0 bg-black/30" />
      )}

      {/* Top badges */}
      <div className="absolute left-3 top-3 flex items-center gap-2">
        {rank && isActive && (
          <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            #{rank} Trending
          </span>
        )}
      </div>
      {!isActive && (
        <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          Coming soon
        </span>
      )}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-lg font-bold leading-tight text-white drop-shadow">
              {city.display_name}
            </div>
            <div className="mt-0.5 text-sm text-white/70">{city.country}</div>
            {isActive && city.place_count !== null && (
              <div className="mt-1 text-xs text-white/60">
                {city.place_count.toLocaleString("en-US")} places ranked
              </div>
            )}
          </div>
          {isActive && (
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors group-hover:bg-white/30">
              Explore →
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
