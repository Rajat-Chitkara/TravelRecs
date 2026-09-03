import Image from "next/image";
import Link from "next/link";
import { loadCities } from "@/lib/cities";
import { CityExplorer } from "@/components/CityExplorer";

const STATS = [
  { value: "120K+", label: "Reddit Posts" },
  { value: "45K+", label: "Traveller Reviews" },
  { value: "100%", label: "Unbiased & Ad-free" },
  { value: "Quarterly", label: "Data Updates" },
];

export default function HomePage() {
  const cities = loadCities();

  return (
    <main className="flex-1">
      {/* Hero — full-bleed background photo with dark gradient overlay */}
      <section className="relative overflow-hidden border-b border-surface-border" style={{ minHeight: "540px" }}>
        <Image
          src="/images/tokyo-hero.png"
          alt="Tokyo"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        {/* Dark gradient: heavy on left where text lives, fades to semi-transparent on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/15" />

        {/* Content sits above the overlay */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex w-full flex-col justify-center gap-5 py-20 lg:w-[55%]">
            <div>
              <h1 className="font-mono text-5xl font-bold leading-tight text-white sm:text-6xl">
                Locals did the{" "}
                <span style={{ color: "#ef6c3f" }}>talking.</span>
              </h1>
              <h1 className="font-mono text-5xl font-bold leading-tight text-white sm:text-6xl">
                We did the{" "}
                <span style={{ color: "#ef6c3f" }}>listening.</span>
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/tokyo"
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors"
                style={{ backgroundColor: "#ef6c3f" }}
              >
                Explore Tokyo →
              </Link>
              <span className="text-sm text-white/60">154 places ranked · Updated Q2 2026</span>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-8 border-t border-white/20 pt-5">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Destinations grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Popular destinations</h2>
            <p className="mt-1 text-sm text-muted">Ranked by traveller sentiment on Reddit</p>
          </div>
        </div>
        <CityExplorer cities={cities} />
      </section>
    </main>
  );
}
