"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { Play, Pause, RotateCcw, Save } from "lucide-react";
import { registerAllTemplates } from "@/templates";
import { getTemplate, CanvasFormat, CANVAS_PRESETS, TemplateSettings } from "@/lib/motion/registry";
import { useMotionPlayer } from "@/lib/motion/useMotionPlayer";
import { saveProject, getProject } from "@/lib/storage/indexeddb";
import { PreviewStage } from "@/components/preview/PreviewStage";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassTabs, GlassTabsList, GlassTabsTrigger } from "@/components/glass/GlassTabs";
import { ControlPanel } from "@/components/controls/ControlPanel";
import { ExportPanel } from "@/components/controls/ExportPanel";

registerAllTemplates();

const FORMATS: CanvasFormat[] = ["9:16", "16:9", "1:1", "4:5"];

function formatTime(seconds: number) {
  const s = Math.max(0, seconds);
  return s.toFixed(1) + "s";
}

export default function TemplateDetailPage() {
  const params = useParams<{ template: string }>();
  const template = getTemplate(params.template);

  if (!template) {
    notFound();
  }

  const [format, setFormat] = useState<CanvasFormat>(template!.supportedFormats[0] ?? "9:16");
  const [settings, setSettings] = useState<TemplateSettings>(() => {
    const initial: TemplateSettings = {};
    for (const c of template!.controls) initial[c.key] = c.default;
    return initial;
  });

  // Restore a saved local project if we arrived via /motion/[template]?project=<id>.
  // Read directly from window.location (rather than useSearchParams) so this
  // page doesn't need a Suspense boundary just to opt into static rendering.
  useEffect(() => {
    const projectId = new URLSearchParams(window.location.search).get("project");
    if (!projectId) return;
    getProject(projectId).then((project) => {
      if (!project) return;
      setFormat(project.canvas);
      setSettings(project.settings);
    });
  }, []);

  const canvasSize = CANVAS_PRESETS[format] ?? { width: 1080, height: 1920 };

  const { clips, totalDuration } = useMemo(
    () => template!.render(settings, canvasSize),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [template, settings, canvasSize.width, canvasSize.height]
  );

  const { bind, play, pause, seek, restart, currentTime, state } = useMotionPlayer(clips, totalDuration, true);

  useEffect(() => {
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalDuration]);

  const handleChange = (key: string, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const handleSave = async () => {
    setSaveState("saving");
    await saveProject({
      id: crypto.randomUUID(),
      name: `${template!.name} project`,
      template: template!.id,
      canvas: format,
      settings,
    });
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{template!.name}</h1>
        <p className="text-ink-muted">{template!.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Preview column */}
        <div className="flex flex-col gap-4">
          <LiquidGlass level="subtle" className="flex min-h-[420px] flex-col p-0">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <GlassTabs value={format} onValueChange={(v) => setFormat(v as CanvasFormat)}>
                <GlassTabsList>
                  {FORMATS.filter((f) => template!.supportedFormats.includes(f)).map((f) => (
                    <GlassTabsTrigger key={f} value={f}>
                      {f}
                    </GlassTabsTrigger>
                  ))}
                </GlassTabsList>
              </GlassTabs>
              <span className="font-mono text-xs text-ink-faint">
                {canvasSize.width} × {canvasSize.height}
              </span>
            </div>

            <PreviewStage format={format} background="checkerboard" className="flex-1">
              <div
                key={`${template!.id}-${format}`}
                className="absolute inset-0"
                style={{ background: "#111214" }}
              >
                <template.Component settings={settings} bind={bind} currentTime={currentTime} duration={totalDuration} />
              </div>
            </PreviewStage>
          </LiquidGlass>

          {/* Playback controls + timeline */}
          <LiquidGlass level="subtle" className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-3">
              <GlassButton
                variant="glass"
                size="icon"
                onClick={() => (state === "playing" ? pause() : play())}
                aria-label={state === "playing" ? "Pause" : "Play"}
              >
                {state === "playing" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </GlassButton>
              <GlassButton variant="ghost" size="icon" onClick={restart} aria-label="Restart">
                <RotateCcw className="h-4 w-4" />
              </GlassButton>
              <span className="font-mono text-xs text-ink-faint">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={totalDuration}
              step={0.01}
              value={Math.min(currentTime, totalDuration)}
              onChange={(e) => {
                pause();
                seek(Number(e.target.value));
              }}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-accent"
            />
          </LiquidGlass>
        </div>

        {/* Controls column */}
        <LiquidGlass level="subtle" className="flex h-fit flex-col gap-6 p-5">
          <ControlPanel controls={template!.controls} settings={settings} onChange={handleChange} />
          <div className="flex flex-col gap-2 border-t border-line pt-5">
            <GlassButton variant="glass" size="sm" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" />
              {saveState === "saved" ? "Saved to this device" : "Save locally"}
            </GlassButton>
            <p className="text-xs text-ink-faint">Saved on this device only. No account required.</p>
          </div>
          <ExportPanel template={template!} settings={settings} size={canvasSize} duration={totalDuration} />
        </LiquidGlass>
      </div>
    </div>
  );
}
