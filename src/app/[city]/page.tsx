import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ComingSoonState } from "@/components/ComingSoonState";
import { DestinationExplorer } from "@/components/DestinationExplorer";
import { DiscussionsAnalyzedBox } from "@/components/DiscussionsAnalyzedBox";
import { Logo } from "@/components/Logo";
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
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <Logo />
      </div>

      <Breadcrumb
        items={[{ label: "Destination page", href: "/" }, { label: city.display_name }]}
      />

      {city.status === "coming_soon" ? (
        <div className="mt-6">
          <h1 className="font-mono text-3xl font-semibold text-foreground">
            Top {city.display_name} Attractions
          </h1>
          <div className="mt-8">
            <ComingSoonState city={city} />
          </div>
        </div>
      ) : (
        <ActiveCityContent citySlug={city.slug} cityName={city.display_name} />
      )}
    </main>
  );
}

function ActiveCityContent({ citySlug, cityName }: { citySlug: string; cityName: string }) {
  const data = loadCityEntities(citySlug);
  if (!data) notFound();

  const eligible = data.entities;
  const topThreads = topThreadsByScore(citySlug, 3);

  return (
    <div className="mt-6 space-y-8">
      <div>
        <h1 className="font-mono text-3xl font-semibold text-foreground">
          Top {cityName} Attractions
        </h1>
        <p className="mt-2 text-sm text-muted">
          Based on reviews from{" "}
          <span className="font-medium text-foreground">
            {formatNumber(data.unique_commenters)}
          </span>{" "}
          Reddit users &middot;{" "}
          {formatDateRange(data.date_range.earliest, data.date_range.latest)}
        </p>
      </div>

      <DiscussionsAnalyzedBox threads={topThreads} totalThreadCount={data.total_threads} />

      <DestinationExplorer citySlug={citySlug} entities={eligible} />
    </div>
  );
}
