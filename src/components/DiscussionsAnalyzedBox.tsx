import type { SourceThreadRef } from "@/types";

export function DiscussionsAnalyzedBox({
  threads,
  totalThreadCount,
}: {
  threads: SourceThreadRef[];
  totalThreadCount: number;
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface/60 p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-2">
        Discussions analyzed
      </div>
      <ul className="mt-3 space-y-2">
        {threads.map((t) => (
          <li key={t.thread_id} className="text-sm">
            <a
              href={t.thread_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-accent"
            >
              <span className="text-muted">r/{t.subreddit}:</span>{" "}
              {t.thread_title}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-2">
        Showing {threads.length} of {totalThreadCount} source threads
      </p>
    </div>
  );
}
