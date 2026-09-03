import Link from "next/link";

export const metadata = {
  title: "About — TravelRecs",
  description: "How TravelRecs works and who built it.",
};

export default function AboutPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="font-mono text-3xl font-bold text-foreground">About TravelRecs</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          TravelRecs is a side project built out of frustration with travel content that reads like
          it was written by a marketing department. Every hotel "exudes charm." Every restaurant
          "offers an unforgettable dining experience." It all sounds the same and tells you nothing.
        </p>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Reddit is different. People on Reddit argue. They say "skip Senso-ji on a Saturday, the
          crowds are unbearable" and "the ramen at X is better than the famous place everyone
          recommends." That signal is real — it just takes time to dig through thousands of threads
          to find it.
        </p>
        <p className="mt-4 text-base leading-relaxed text-muted">
          This site does that digging for you. We pull posts and comments from travel subreddits,
          run them through a pipeline that extracts mentions of specific places, and score each one
          by the sentiment of the people who discussed it. No paid placements. No sponsored content.
          Just aggregated Reddit opinion.
        </p>

        <div className="mt-12 border-t border-surface-border pt-8">
          <h2 className="font-mono text-lg font-semibold text-foreground">What we track</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {[
              "Neighborhoods and areas to stay",
              "Attractions, temples, museums, viewpoints",
              "Restaurants, street food, ramen shops, izakayas",
              "Hotels and ryokan",
              "Day trips and experiences",
              "Cafes and coffee spots",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 border-t border-surface-border pt-8">
          <h2 className="font-mono text-lg font-semibold text-foreground">Data freshness</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Rankings are updated quarterly. The current dataset covers posts from the last two years
            across major travel subreddits. Older posts are weighted slightly lower to reflect that
            places open, close, and change over time.
          </p>
        </div>

        <div className="mt-12 border-t border-surface-border pt-8">
          <h2 className="font-mono text-lg font-semibold text-foreground">Caveats</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Reddit skews toward English-speaking travelers, budget-to-mid-range trips, and a handful
            of popular destinations. Places that don't get discussed often will have lower confidence
            scores or won't appear at all. Use this as a starting point, not a final word.
          </p>
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
