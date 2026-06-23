import type { SourceThreadRef } from "@/types";

export function SourceThreadsList({ threads }: { threads: SourceThreadRef[] }) {
  if (threads.length === 0) return null;

  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-2">
        Source threads ({threads.length})
      </h2>
      <ul className="mt-3 space-y-2">
        {threads.map((t) => (
          <li key={t.thread_id} className="text-sm">
            <a
              href={t.thread_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-accent"
            >
              <span className="text-muted">r/{t.subreddit}:</span> {t.thread_title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
