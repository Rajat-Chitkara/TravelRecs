import Link from "next/link";
import { notFound } from "next/navigation";
import { BestForTags } from "@/components/BestForTags";
import { Breadcrumb } from "@/components/Breadcrumb";
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

const CROWD_LABEL: Record<string, string> = {
  busy: "Usually busy",
  quiet: "Usually quiet",
  mixed: "Crowd varies",
};

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

  const totalSentiments =
    entity.sentiment_counts.positive +
    entity.sentiment_counts.neutral +
    entity.sentiment_counts.mixed +
    entity.sentiment_counts.negative;

  return (
    <main className="flex-1 bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Destinations", href: "/" },
            { label: city.display_name, href: `/${city.slug}` },
            { label: entity.entity_normalized },
          ]}
        />

        <div className="mt-6 space-y-4">
          {/* Hero card */}
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface shadow-sm">
            <div className="border-l-4 border-l-accent p-6">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-2">
                {eyebrow}
              </div>
              <h1 className="mt-1 font-mono text-3xl font-bold text-foreground">
                {entity.entity_normalized}
              </h1>

              {/* Stats pills */}
              <div className="mt-4 flex flex-wrap gap-2">
                <SentimentPillBadge positivePct={entity.sentiment_pct.positive} />
                <MentionsPillBadge count={entity.mention_count} />
                <ScorePillBadge score={entity.top_score} />
                {entity.crowd_signal && (
                  <span className="inline-flex items-center rounded-full border border-surface-border bg-surface px-2.5 py-1 text-xs font-medium text-muted">
                    {CROWD_LABEL[entity.crowd_signal] ?? entity.crowd_signal}
                  </span>
                )}
              </div>

              {entity.verdict && (
                <p className="mt-4 leading-relaxed text-muted">{entity.verdict}</p>
              )}
            </div>

            {/* Inline stat strip */}
            <div className="flex divide-x divide-surface-border border-t border-surface-border bg-surface-raised">
              <div className="flex-1 px-5 py-3">
                <div className="text-base font-bold text-foreground">{entity.mention_count}</div>
                <div className="text-[11px] text-muted-2">Total mentions</div>
              </div>
              <div className="flex-1 px-5 py-3">
                <div className="text-base font-bold text-foreground">{entity.unique_commenters}</div>
                <div className="text-[11px] text-muted-2">Unique voices</div>
              </div>
              <div className="flex-1 px-5 py-3">
                <div className="text-base font-bold text-positive">{entity.recommendation_count}</div>
                <div className="text-[11px] text-muted-2">Recommended</div>
              </div>
              {entity.warning_count > 0 && (
                <div className="flex-1 px-5 py-3">
                  <div className="text-base font-bold text-negative">{entity.warning_count}</div>
                  <div className="text-[11px] text-muted-2">Warnings</div>
                </div>
              )}
            </div>
          </div>

          {/* Sentiment breakdown card */}
          <div className="rounded-xl border border-surface-border bg-surface p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-2">
                Sentiment breakdown
              </span>
              <span className="text-xs text-muted-2">{totalSentiments} scored mentions</span>
            </div>
            <SentimentBars counts={entity.sentiment_counts} />
          </div>

          {/* Pros / Cons */}
          <ProsConsBoxFull pros={entity.pros} cons={entity.cons} />

          {/* Best for */}
          <BestForTags bestFor={entity.best_for} bestTime={entity.best_time} />

          {/* What people said */}
          <WhatPeopleSaid mentions={mentions} />

          {/* Source threads */}
          <SourceThreadsList threads={allThreads} />

          {/* Back link */}
          <div className="pt-2">
            <Link
              href={`/${city.slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to {city.display_name}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
