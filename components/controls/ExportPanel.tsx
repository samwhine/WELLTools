"use client";

import { useRef, useState } from "react";
import { Download, X } from "lucide-react";
import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";
import { exportMotionToWebM, ExportHandle, ExportProgress } from "@/lib/motion/exportMotion";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassProgress } from "@/components/glass/GlassProgress";

export function ExportPanel({
  template,
  settings,
  size,
  duration,
}: {
  template: MotionTemplate;
  settings: TemplateSettings;
  size: { width: number; height: number };
  duration: number;
}) {
  const [progress, setProgress] = useState<ExportProgress>({ state: "idle", progress: 0, detail: "" });
  const handleRef = useRef<ExportHandle | null>(null);

  const canExport = Boolean(template.drawFrame);

  const startExport = () => {
    handleRef.current = exportMotionToWebM({
      template,
      settings,
      size,
      duration,
      fps: 30,
      background: "#101114",
      onProgress: setProgress,
    });
  };

  const cancel = () => handleRef.current?.cancel();

  const busy = progress.state === "preparing" || progress.state === "rendering" || progress.state === "finalizing";

  return (
    <div className="flex flex-col gap-3 border-t border-line pt-5">
      <div className="text-xs font-medium uppercase tracking-wide text-ink-faint">Export</div>

      {progress.state === "idle" || progress.state === "cancelled" ? (
        <>
          <GlassButton variant="primary" onClick={startExport} disabled={!canExport}>
            <Download className="h-4 w-4" />
            Export WebM
          </GlassButton>
          {!canExport && (
            <p className="text-xs text-ink-faint">This template doesn&rsquo;t support export yet.</p>
          )}
          {progress.state === "cancelled" && <p className="text-xs text-ink-faint">Export cancelled.</p>}
        </>
      ) : busy ? (
        <div className="flex flex-col gap-3">
          <GlassProgress
            value={progress.progress}
            label={progress.state === "rendering" ? "Rendering" : "Preparing"}
            detail={progress.detail}
          />
          <GlassButton variant="ghost" size="sm" onClick={cancel} className="self-start">
            <X className="h-3.5 w-3.5" />
            Cancel
          </GlassButton>
        </div>
      ) : progress.state === "complete" ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink">Your export is ready.</p>
          <a href={progress.detail} download={`${template.id}.webm`}>
            <GlassButton variant="primary">
              <Download className="h-4 w-4" />
              Download WebM
            </GlassButton>
          </a>
          <GlassButton variant="ghost" size="sm" onClick={() => setProgress({ state: "idle", progress: 0, detail: "" })}>
            Export again
          </GlassButton>
        </div>
      ) : progress.state === "error" ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink">We couldn&rsquo;t process this export.</p>
          <p className="text-xs text-ink-faint">{progress.error}</p>
          <GlassButton variant="glass" size="sm" onClick={() => setProgress({ state: "idle", progress: 0, detail: "" })}>
            Try again
          </GlassButton>
        </div>
      ) : null}
    </div>
  );
}
