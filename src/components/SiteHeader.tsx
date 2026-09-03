import Link from "next/link";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-surface-border bg-background backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="hidden text-sm font-medium text-muted transition-colors hover:text-foreground sm:block"
          >
            Destinations
          </Link>
          <Link
            href="/how-it-works"
            className="hidden text-sm font-medium text-muted transition-colors hover:text-foreground md:block"
          >
            How it Works
          </Link>
          <Link
            href="/about"
            className="hidden text-sm font-medium text-muted transition-colors hover:text-foreground md:block"
          >
            About
          </Link>
          <Link
            href="/tokyo"
            className="rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
          >
            Explore
          </Link>
        </nav>
      </div>
    </header>
  );
}
