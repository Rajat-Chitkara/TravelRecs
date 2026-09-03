import type { SourceThreadRef } from "@/types";

export function DiscussionsAnalyzedBox({
  threads,
  totalThreadCount,
}: {
  threads: SourceThreadRef[];
  totalThreadCount: number;
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ backgroundColor: "#ff4500" }}
        >
          r/
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Discussions analyzed
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {threads.map((t) => (
          <li key={t.thread_id} className="text-sm">
            <a
              href={t.thread_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground transition-colors hover:text-accent"
            >
              <span className="font-medium text-accent">r/{t.subreddit}:</span>{" "}
              {t.thread_title}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-muted-2">
          Showing {threads.length} of {totalThreadCount} source threads
        </p>
        <a
          href="#"
          className="text-xs font-medium text-accent transition-colors hover:text-accent/80"
        >
          View all discussions →
        </a>
      </div>
    </div>
  );
}
