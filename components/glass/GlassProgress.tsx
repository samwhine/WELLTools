import { cn } from "@/lib/utils/cn";

export interface GlassProgressProps {
  value: number; // 0..100
  label?: string;
  detail?: string; // e.g. "Rendering frame 1,248 / 1,500"
  className?: string;
}

export function GlassProgress({ value, label, detail, className }: GlassProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("w-full", className)}>
      {(label || detail) && (
        <div className="mb-2 flex items-baseline justify-between text-sm">
          {label && <span className="text-ink">{label}</span>}
          <span className="font-mono text-xs text-ink-muted">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-200 ease-[var(--ease-standard)]"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {detail && <div className="mt-1.5 text-xs text-ink-faint">{detail}</div>}
    </div>
  );
}
