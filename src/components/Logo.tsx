import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-mono text-sm font-bold text-accent-foreground">
        tr
      </span>
      <span className="font-mono text-lg font-semibold text-foreground">
        TravelRecs
      </span>
    </Link>
  );
}
