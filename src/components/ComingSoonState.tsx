import Link from "next/link";
import type { City } from "@/types";

export function ComingSoonState({ city }: { city: City }) {
  return (
    <div className="rounded-xl border border-dashed border-surface-border bg-surface/40 px-8 py-16 text-center">
      <h2 className="font-mono text-2xl font-semibold text-foreground">
        {city.display_name} is coming soon
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted">
        We&apos;re still reading through Reddit threads about {city.display_name}.
        Check back after the next quarterly update, or explore a city that&apos;s
        already live.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
      >
        Back to all cities
      </Link>
    </div>
  );
}
