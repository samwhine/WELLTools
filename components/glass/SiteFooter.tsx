import Link from "next/link";

/**
 * Visible (not just meta-tag) creator attribution. Meta tags and JSON-LD
 * help search engines associate this site with its creator, but they're
 * invisible to a person reading the page — and a "who made this" search is
 * exactly the kind of query where Google weighs visible, human-readable
 * text much more than head-only metadata. This is that visible text.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mx-auto flex max-w-6xl flex-col items-center gap-2 border-t border-line px-4 py-10 text-center text-sm text-ink-faint">
      <p>
        WELLTools — built by{" "}
        <span className="font-medium text-ink-muted">Samuel Extehines Heydemans</span>.
      </p>
      <p>
        Free, browser-based motion graphics & video tools. No login, no server-side processing.{" "}
        <Link href="/tools" className="underline-offset-4 hover:text-ink hover:underline">
          Explore all tools
        </Link>
        .
      </p>
      <p className="text-ink-faint/70">
        © {year} WELL. Brand: WELL · Product: WELLTools.
      </p>
    </footer>
  );
}
