import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ComingSoonState } from "@/components/ComingSoonState";
import { DestinationExplorer } from "@/components/DestinationExplorer";
import { DiscussionsAnalyzedBox } from "@/components/DiscussionsAnalyzedBox";
import { getCityBySlug, loadCities } from "@/lib/cities";
import { loadCityEntities } from "@/lib/entities";
import { formatDateRange, formatNumber } from "@/lib/format";
import { topThreadsByScore } from "@/lib/threads";

export function generateStaticParams() {
  return loadCities().map((c) => ({ city: c.slug }));
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) notFound();

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={[{ label: "Destinations", href: "/" }, { label: city.display_name }]}
          />
        </div>

        {city.status === "coming_soon" ? (
          <>
            <h1 className="font-mono text-3xl font-semibold text-foreground">
              Top {city.display_name} Attractions
            </h1>
            <div className="mt-8">
              <ComingSoonState city={city} />
            </div>
          </>
        ) : (
          <ActiveCityContent citySlug={city.slug} cityName={city.display_name} />
        )}
      </div>
    </main>
  );
}

function ActiveCityContent({ citySlug, cityName }: { citySlug: string; cityName: string }) {
  const data = loadCityEntities(citySlug);
  if (!data) notFound();

  const topThreads = topThreadsByScore(citySlug, 3);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-mono text-3xl font-semibold text-foreground">
          Top {cityName} Attractions
        </h1>
        <p className="mt-1 text-sm text-muted">
          Based on reviews from{" "}
          <span className="font-medium text-foreground">
            {formatNumber(data.unique_commenters)}
          </span>{" "}
          Reddit users · {formatDateRange(data.date_range.earliest, data.date_range.latest)}
        </p>
      </div>

      {/* Discussions analyzed */}
      <DiscussionsAnalyzedBox threads={topThreads} totalThreadCount={data.total_threads} />

      {/* Split panel — left list + sticky right detail */}
      <DestinationExplorer
        citySlug={citySlug}
        cityName={cityName}
        entities={data.entities}
      />
    </div>
  );
}
