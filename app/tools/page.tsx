import Link from "next/link";
import { Sparkles, Film, Music2 } from "lucide-react";
import { LiquidGlass } from "@/components/glass/LiquidGlass";

const SECTIONS = [
  { name: "Motion", description: "Templates, animation primitives, and the keyframe editor.", href: "/motion", icon: Sparkles },
  { name: "Video", description: "Remove Silence, trim, convert, and other editing utilities.", href: "/video", icon: Film },
  { name: "Audio", description: "Visualizers and audio editing tools.", href: "/audio", icon: Music2 },
];

export default function ToolsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">All tools</h1>
        <p className="text-ink-muted">Everything WELLTools offers, grouped by what it does.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link key={s.name} href={s.href}>
            <LiquidGlass level="subtle" interactive className="flex flex-col gap-3 p-6">
              <s.icon className="h-5 w-5 text-ink-muted" />
              <div className="text-[15px] font-medium text-ink">{s.name}</div>
              <p className="text-sm text-ink-muted">{s.description}</p>
            </LiquidGlass>
          </Link>
        ))}
      </div>
    </div>
  );
}
