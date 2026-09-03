import type { RawMention } from "@/types";

const REDDIT_ORANGE = "#FF4500";

const SENTIMENT_CONFIG: Record<
  RawMention["sentiment"],
  { label: string; borderColor: string; tagBg: string; tagText: string }
> = {
  positive: { label: "Positive", borderColor: "#10b981", tagBg: "#ecfdf5", tagText: "#059669" },
  neutral:  { label: "Neutral",  borderColor: "#94a3b8", tagBg: "#f8fafc", tagText: "#64748b" },
  mixed:    { label: "Mixed",    borderColor: "#fbbf24", tagBg: "#fffbeb", tagText: "#d97706" },
  negative: { label: "Negative", borderColor: "#f87171", tagBg: "#fef2f2", tagText: "#dc2626" },
};

function RedditIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={REDDIT_ORANGE} xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="10" fill={REDDIT_ORANGE} />
      <path
        fill="white"
        d="M16.67 10a1.46 1.46 0 0 0-2.47-1 7.12 7.12 0 0 0-3.85-1.23l.65-3.08 2.13.45a1 1 0 1 0 1.07-.99 1 1 0 0 0-.95.68l-2.37-.5a.26.26 0 0 0-.31.2l-.73 3.44a7.14 7.14 0 0 0-3.89 1.23 1.46 1.46 0 1 0-1.61 2.39 2.87 2.87 0 0 0 0 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 0 0 0-.44 1.46 1.46 0 0 0 .58-1.59zM7.27 11a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm5.58 2.71a3.58 3.58 0 0 1-2.85.87 3.58 3.58 0 0 1-2.85-.87.26.26 0 0 1 .37-.37 3.1 3.1 0 0 0 2.48.72 3.1 3.1 0 0 0 2.48-.72.26.26 0 0 1 .37.37zm-.17-1.71a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"
      />
    </svg>
  );
}

function UpvoteIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

export function WhatPeopleSaid({ mentions }: { mentions: RawMention[] }) {
  if (mentions.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-surface shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-surface-border px-5 py-4">
        <RedditIcon size={18} />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-2">
          From Reddit
        </span>
        <span className="ml-auto text-[10px] text-muted-2">
          {mentions.length} comment{mentions.length === 1 ? "" : "s"}
        </span>
      </div>

      <ul className="divide-y divide-surface-border">
        {mentions.map((m) => {
          const config = SENTIMENT_CONFIG[m.sentiment];
          const href = `https://reddit.com/comments/${m.thread_id}/_/${m.comment_id}/`;
          return (
            <li key={m.mention_id} style={{ borderLeft: `3px solid ${config.borderColor}` }}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block px-5 py-4 transition-colors hover:bg-surface-raised"
              >
                {/* Comment header row: avatar placeholder + username + sentiment badge */}
                <div className="mb-2.5 flex items-center gap-2 flex-wrap">
                  {/* Reddit-style avatar circle */}
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: REDDIT_ORANGE }}
                  >
                    {(m.comment_author?.[0] ?? "u").toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: REDDIT_ORANGE }}>
                    u/{m.comment_author ?? "deleted"}
                  </span>
                  <span className="text-muted-2 text-xs">·</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ backgroundColor: config.tagBg, color: config.tagText }}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Comment text */}
                <p className="text-sm leading-relaxed text-foreground">{m.key_phrase}</p>

                {/* Footer: upvotes + view link */}
                <div className="mt-2.5 flex items-center gap-4 text-xs text-muted-2">
                  {m.comment_score > 0 && (
                    <span
                      className="flex items-center gap-1 font-medium"
                      style={{ color: REDDIT_ORANGE }}
                    >
                      <UpvoteIcon />
                      {m.comment_score}
                    </span>
                  )}
                  <span className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    View on Reddit
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </span>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
