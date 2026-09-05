import Link from "next/link";
import { LiquidGlass } from "@/components/glass/LiquidGlass";

const STEPS = [
  { title: "Choose", body: "Browse a library of motion templates, sorted by category and format." },
  { title: "Customize", body: "Change the text, timing, and color. Every control maps to something real." },
  { title: "Preview", body: "Watch it play at full quality before you export anything." },
  { title: "Export", body: "Download a transparent WebM, PNG sequence, or MP4 — ready for your editor." },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-24">
      <section className="flex flex-col items-start gap-6 pt-10">
        <span className="text-sm text-ink-faint">Motion graphics & video tools</span>
        <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
          Create faster.
          <br />
          Customize everything.
        </h1>
        <p className="max-w-md text-lg text-ink-muted">
          A free, browser-based toolbox for video editors — motion templates, animation
          tools, and editing utilities. No login. No uploads to a server.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Link
            href="/motion"
            className="rounded-control bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_20px_rgba(91,140,255,0.35)] transition-colors hover:bg-accent-soft"
          >
            Explore templates
          </Link>
          <Link
            href="/video/remove-silence"
            className="rounded-control border border-line bg-white/[0.05] px-5 py-2.5 text-sm text-ink backdrop-blur-glass transition-colors hover:bg-white/[0.08]"
          >
            Remove silence from a video
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <LiquidGlass key={step.title} level="subtle" className="p-5">
            <div className="mb-3 text-xs text-ink-faint">{String(i + 1).padStart(2, "0")}</div>
            <div className="mb-1.5 text-base font-medium text-ink">{step.title}</div>
            <p className="text-sm leading-relaxed text-ink-muted">{step.body}</p>
          </LiquidGlass>
        ))}
      </section>

      <section className="flex flex-col gap-2 border-t border-line pt-10 text-sm text-ink-faint">
        <p>Files are processed locally in your browser whenever possible.</p>
        <p>Free. No login. No server-side video processing.</p>
      </section>
    </div>
  );
}
