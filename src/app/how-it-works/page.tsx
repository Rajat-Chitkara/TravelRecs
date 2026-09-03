import Link from "next/link";

export const metadata = {
  title: "How it Works — TravelRecs",
  description: "How TravelRecs turns Reddit discussions into ranked travel recommendations.",
};

const STEPS = [
  {
    number: "01",
    title: "We collect Reddit discussions",
    body: "Thousands of threads from travel subreddits are pulled every quarter — questions like \"best neighborhoods in Tokyo?\", \"where to eat in Bangkok?\", and \"worth visiting Nikko?\". We focus on threads with real discussion, not just a single-line reply.",
  },
  {
    number: "02",
    title: "Places are extracted from comments",
    body: "Each comment is scanned for mentions of specific places — a neighborhood, a restaurant name, a temple, a hotel. We normalize variations (\"Senso-ji\", \"Senso Ji\", \"Asakusa temple\") into a single canonical name so counts don't get fragmented.",
  },
  {
    number: "03",
    title: "Sentiment is scored per mention",
    body: "Each mention is scored: positive (recommended, praised), neutral (mentioned without strong opinion), or negative (warned against, complained about). We use the surrounding context — the full comment, the thread title, and any replies — to get the sentiment right.",
  },
  {
    number: "04",
    title: "Places are ranked by aggregated sentiment",
    body: "A place's score is a weighted combination of its positive sentiment ratio and its total mention count. A place with 30 mentions at 85% positive beats one with 5 mentions at 100% positive. Volume is evidence of consistency.",
  },
  {
    number: "05",
    title: "Pros, cons, and context are surfaced",
    body: "We extract the specific things people praise and criticize — not just a score but the reasons behind it. You see \"quiet and central, great subway access\" alongside the occasional \"too quiet at night\", so you can decide for yourself.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="font-mono text-3xl font-bold text-foreground">How it Works</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          TravelRecs turns Reddit travel discussions into ranked, structured recommendations. Here's
          the pipeline from raw posts to what you see on screen.
        </p>

        <div className="mt-12 space-y-10">
          {STEPS.map((step) => (
            <div key={step.number} className="flex gap-6">
              <div className="shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent font-mono text-sm font-bold text-accent">
                  {step.number}
                </div>
              </div>
              <div className="pt-1">
                <h2 className="font-mono text-base font-semibold text-foreground">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-surface-border bg-surface p-6">
          <h2 className="font-mono text-base font-semibold text-foreground">What it doesn't do</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {[
              "It doesn't verify that a place is still open or operating",
              "It doesn't track prices — those change too fast to be reliable",
              "It doesn't catch irony or sarcasm reliably",
              "It doesn't represent every traveler — Reddit skews English-speaking and budget-conscious",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-negative">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
          >
            Browse destinations →
          </Link>
        </div>
      </div>
    </main>
  );
}
