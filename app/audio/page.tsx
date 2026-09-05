import { LiquidGlass } from "@/components/glass/LiquidGlass";

export default function AudioToolsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Audio tools</h1>
        <p className="text-ink-muted">Waveform visualizers and audio utilities are coming after the video MVP.</p>
      </div>

      <LiquidGlass level="subtle" className="p-10 text-center text-ink-muted">
        Audio Visualizer templates (waveform, spectrum, bars) live under{" "}
        <span className="text-ink">Motion → Audio Visualizers</span> once that category ships. Standalone audio
        editing tools (trim, normalize, fade) follow the same architecture as Video tools.
      </LiquidGlass>
    </div>
  );
}
