"use client";

import { Segment } from "@/lib/video/segments";
import { cn } from "@/lib/utils/cn";

export function RemoveSilenceTimeline({
  segments,
  duration,
  onToggle,
}: {
  segments: Segment[];
  duration: number;
  onToggle: (index: number) => void;
}) {
  if (duration <= 0) return null;
  return (
    <div className="flex h-12 w-full overflow-hidden rounded-control border border-line">
      {segments.map((seg, i) => {
        const widthPct = ((seg.end - seg.start) / duration) * 100;
        if (widthPct <= 0) return null;
        return (
          <button
            key={i}
            onClick={() => onToggle(i)}
            title={`${seg.type === "keep" ? "Keep" : "Cut"} · ${(seg.end - seg.start).toFixed(2)}s — click to ${
              seg.type === "keep" ? "exclude" : "restore"
            }`}
            style={{ width: `${widthPct}%` }}
            className={cn(
              "h-full touch-manipulation border-r border-canvas/60 transition-colors duration-150 last:border-r-0",
              seg.type === "keep" ? "bg-accent/70 hover:bg-accent" : "bg-white/[0.06] hover:bg-white/[0.12]"
            )}
          />
        );
      })}
    </div>
  );
}
