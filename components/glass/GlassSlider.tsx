"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils/cn";

export interface GlassSliderProps {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function GlassSlider({ label, value, min = 0, max = 100, step = 1, unit = "", onChange }: GlassSliderProps) {
  return (
    <div className="w-full">
      {label && (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-ink-muted">{label}</span>
          <span className="font-mono text-xs text-ink">
            {value}
            {unit}
          </span>
        </div>
      )}
      <SliderPrimitive.Root
        className="relative flex h-11 w-full touch-none select-none items-center"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/[0.08]">
          <SliderPrimitive.Range className="absolute h-full bg-accent" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            "relative block h-4 w-4 rounded-full border border-white/40 bg-white shadow-glass",
            "transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
            // Invisible 44px hit area centered on the visible 16px dot — the
            // thumb only *looks* small; the actual touch target meets the
            // HIG/Material minimum so it's draggable with a fingertip.
            "before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
          )}
        />
      </SliderPrimitive.Root>
    </div>
  );
}
