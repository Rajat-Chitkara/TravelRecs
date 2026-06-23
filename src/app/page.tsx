import { loadCities } from "@/lib/cities";
import { CityExplorer } from "@/components/CityExplorer";
import { Logo } from "@/components/Logo";

export default function HomePage() {
  const cities = loadCities();

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl rounded-2xl border border-surface-border bg-surface/40 px-8 py-14 sm:px-14">
        <div className="flex flex-col items-center gap-8 text-center">
          <Logo />

          <div className="space-y-1">
            <h1 className="font-mono text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              Locals did the <span className="text-accent">talking</span>
            </h1>
            <h1 className="font-mono text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              We did the <span className="text-accent">listening</span>
            </h1>
          </div>

          <p className="max-w-xl text-balance text-muted">
            Hotels, attractions, and restaurants ranked by what{" "}
            <span className="font-medium text-foreground">actual travellers</span>{" "}
            said about them on Reddit.
            <br />
            <span className="italic text-muted-2">
              No paid placements. No TripAdvisor reviews from 2014.
            </span>
          </p>

          <CityExplorer cities={cities} />
        </div>
      </div>
    </main>
  );
}
