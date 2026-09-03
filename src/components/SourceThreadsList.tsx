import type { SourceThreadRef } from "@/types";

export function SourceThreadsList({ threads }: { threads: SourceThreadRef[] }) {
  if (threads.length === 0) return null;

  return (
    <div className="rounded-xl border border-surface-border bg-surface shadow-sm">
      <div className="border-b border-surface-border px-5 py-4">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-2">
          Source threads · {threads.length}
        </span>
      </div>
      <ul className="divide-y divide-surface-border">
        {threads.map((t) => (
          <li key={t.thread_id}>
            <a
              href={t.thread_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 px-5 py-4 transition-colors hover:bg-surface-raised"
            >
              <span className="mt-0.5 shrink-0 rounded-full border border-surface-border bg-surface-raised px-2 py-0.5 text-[10px] font-semibold text-muted-2">
                r/{t.subreddit}
              </span>
              <span className="flex-1 text-sm text-foreground group-hover:text-accent">
                {t.thread_title}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-1 shrink-0 text-muted-2 transition-colors group-hover:text-accent"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
