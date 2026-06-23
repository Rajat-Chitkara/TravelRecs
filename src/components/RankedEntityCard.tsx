import Link from "next/link";
import type { EnrichedEntityProfile } from "@/types";
import { titleCase } from "@/lib/format";
import { BestForTags } from "./BestForTags";
import { MentionsPillBadge, ScorePillBadge, SentimentPillBadge } from "./Pills";
import { ProsConsBox } from "./ProsConsBox";
import { RankBadge } from "./RankBadge";
import { SentimentBreakdown } from "./SentimentBreakdown";

export function RankedEntityCard({
  rank,
  citySlug,
  entity,
}: {
  rank: number;
  citySlug: string;
  entity: EnrichedEntityProfile;
}) {
  const eyebrow =
    entity.entity_subtype !== ""
      ? titleCase(entity.entity_subtype)
      : titleCase(entity.entity_type);
  const topThread = entity.source_threads[0];

  return (
    <div
      className={`rounded-xl border bg-surface p-5 sm:p-6 ${
        rank === 1 ? "border-accent/50" : "border-surface-border"
      }`}
    >
      <div className="flex items-start gap-4">
        <RankBadge rank={rank} />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <div className="text-xs text-muted-2">{eyebrow}</div>
            <Link
              href={`/${citySlug}/${entity.entity_id}`}
              className="text-lg font-semibold text-foreground hover:text-accent sm:text-xl"
            >
              {entity.entity_normalized}
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            <SentimentPillBadge positivePct={entity.sentiment_pct.positive} />
            <MentionsPillBadge count={entity.mention_count} />
            <ScorePillBadge score={entity.top_score} />
          </div>

          {entity.verdict && (
            <p className="text-sm text-muted">{entity.verdict}</p>
          )}

          <SentimentBreakdown counts={entity.sentiment_counts} />

          <ProsConsBox pros={entity.pros} cons={entity.cons} />

          <BestForTags bestFor={entity.best_for} bestTime={entity.best_time} />

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href={`/${citySlug}/${entity.entity_id}`}
              className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90"
            >
              View full analysis
            </Link>
            {topThread && (
              <a
                href={topThread.thread_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-surface-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
              >
                Read similar threads ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
