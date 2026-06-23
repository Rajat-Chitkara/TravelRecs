import { notFound } from "next/navigation";
import { BestForTags } from "@/components/BestForTags";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Logo } from "@/components/Logo";
import { MentionsPillBadge, ScorePillBadge, SentimentPillBadge } from "@/components/Pills";
import { ProsConsBoxFull } from "@/components/ProsConsBoxFull";
import { SentimentBars } from "@/components/SentimentBars";
import { SourceThreadsList } from "@/components/SourceThreadsList";
import { WhatPeopleSaid } from "@/components/WhatPeopleSaid";
import { getCityBySlug, loadCities } from "@/lib/cities";
import { titleCase } from "@/lib/format";
import { loadCityEntities } from "@/lib/entities";
import { allSourceThreadsForMentions, mentionsByIds } from "@/lib/mentions";

export function generateStaticParams() {
  return loadCities()
    .filter((c) => c.status === "active")
    .flatMap((c) => {
      const data = loadCityEntities(c.slug);
      if (!data) return [];
      return data.entities.map((e) => ({ city: c.slug, slug: e.entity_id }));
    });
}

export default async function EntityDetailPage({
  params,
}: {
  params: Promise<{ city: string; slug: string }>;
}) {
  const { city: citySlug, slug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city || city.status !== "active") notFound();

  const data = loadCityEntities(citySlug);
  const entity = data?.entities.find((e) => e.entity_id === slug);
  if (!data || !entity) notFound();

  const mentions = mentionsByIds(citySlug, entity.mention_ids).sort(
    (a, b) => b.comment_score - a.comment_score
  );
  const allThreads = allSourceThreadsForMentions(citySlug, entity.mention_ids);

  const eyebrow =
    entity.entity_subtype !== "" ? titleCase(entity.entity_subtype) : titleCase(entity.entity_type);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Logo />
      </div>

      <Breadcrumb
        items={[
          { label: "Destination page", href: "/" },
          { label: city.display_name, href: `/${city.slug}` },
          { label: entity.entity_normalized },
        ]}
      />

      <div className="mt-6 space-y-8">
        <div>
          <div className="text-sm text-muted-2">{eyebrow}</div>
          <h1 className="mt-1 font-mono text-3xl font-semibold text-foreground">
            {entity.entity_normalized}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <SentimentPillBadge positivePct={entity.sentiment_pct.positive} />
            <MentionsPillBadge count={entity.mention_count} />
            <ScorePillBadge score={entity.top_score} />
          </div>

          {entity.verdict && (
            <p className="mt-4 text-base text-muted">{entity.verdict}</p>
          )}
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-2">
            Sentiment breakdown
          </h2>
          <div className="mt-3">
            <SentimentBars counts={entity.sentiment_counts} />
          </div>
        </div>

        <ProsConsBoxFull pros={entity.pros} cons={entity.cons} />

        <BestForTags bestFor={entity.best_for} bestTime={entity.best_time} />

        <WhatPeopleSaid mentions={mentions} />

        <SourceThreadsList threads={allThreads} />
      </div>
    </main>
  );
}
