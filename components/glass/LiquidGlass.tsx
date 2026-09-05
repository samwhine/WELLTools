import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export type GlassLevel = "subtle" | "regular" | "strong" | "clear";

const levelStyles: Record<GlassLevel, string> = {
  subtle: "backdrop-blur-xs bg-[var(--glass-subtle-bg)] border-[var(--glass-subtle-border)]",
  regular: "backdrop-blur-glass bg-[var(--glass-regular-bg)] border-[var(--glass-regular-border)]",
  strong: "backdrop-blur-glass-strong bg-[var(--glass-strong-bg)] border-[var(--glass-strong-border)]",
  clear: "backdrop-blur-xs bg-[var(--glass-clear-bg)] border-[var(--glass-clear-border)]",
};

export interface LiquidGlassProps extends HTMLAttributes<HTMLDivElement> {
  level?: GlassLevel;
  interactive?: boolean; // adds hover/press feedback, for functional UI layers only (spec §03)
}

/**
 * The single reusable glass material. Every Glass* component wraps this
 * instead of hand-styling backdrop-filter individually (spec §04) — so
 * blur/tint/border/shadow stay consistent across the whole system.
 */
export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(
  ({ level = "regular", interactive = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-glass border shadow-glass",
          "[backdrop-filter:saturate(var(--glass-saturation))_blur(var(--b))]",
          levelStyles[level],
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-glass",
          "before:shadow-[var(--glass-inner-highlight)]",
          interactive &&
            "transition-[transform,background-color,border-color] duration-200 ease-[var(--ease-standard)] hover:bg-white/[0.09] active:scale-[0.98] cursor-pointer",
          className
        )}
        style={
          {
            "--b":
              level === "subtle"
                ? "var(--glass-subtle-blur)"
                : level === "strong"
                ? "var(--glass-strong-blur)"
                : level === "clear"
                ? "var(--glass-clear-blur)"
                : "var(--glass-regular-blur)",
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    );
  }
);
LiquidGlass.displayName = "LiquidGlass";
