import Link from "next/link";
import { Scissors, Wand2, Music, Repeat, Shrink, Crop } from "lucide-react";
import { LiquidGlass } from "@/components/glass/LiquidGlass";

type Tool = {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "available" | "coming-soon";
};

const TOOLS: Tool[] = [
  {
    name: "Remove Silence",
    description: "Detect and cut dead air automatically, adjust the result, then export.",
    href: "/video/remove-silence",
    icon: Wand2,
    status: "available",
  },
  { name: "Trim / Cut", description: "Cut a clip down to the range you need.", href: "#", icon: Scissors, status: "coming-soon" },
  { name: "Extract Audio", description: "Pull the audio track out as its own file.", href: "#", icon: Music, status: "coming-soon" },
  { name: "Convert Video", description: "Change container or codec without a re-upload.", href: "#", icon: Repeat, status: "coming-soon" },
  { name: "Compress", description: "Shrink file size for faster sharing.", href: "#", icon: Shrink, status: "coming-soon" },
  { name: "Resize / Crop", description: "Change dimensions or aspect ratio.", href: "#", icon: Crop, status: "coming-soon" },
];

export default function VideoToolsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Video tools</h1>
        <p className="text-ink-muted">Practical editing utilities. Everything runs locally in your browser.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link key={tool.name} href={tool.href} aria-disabled={tool.status === "coming-soon"}>
            <LiquidGlass
              level="subtle"
              interactive={tool.status === "available"}
              className={`flex flex-col gap-3 p-5 ${tool.status === "coming-soon" ? "opacity-50" : ""}`}
            >
              <tool.icon className="h-5 w-5 text-ink-muted" />
              <div className="text-[15px] font-medium text-ink">{tool.name}</div>
              <p className="text-sm text-ink-muted">{tool.description}</p>
              {tool.status === "coming-soon" && <span className="text-xs text-ink-faint">Coming soon</span>}
            </LiquidGlass>
          </Link>
        ))}
      </div>
    </div>
  );
}
