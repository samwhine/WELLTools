import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "glass" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
}

const sizeStyles = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  // 44px — Apple's HIG minimum tap target. This size is used for the main
  // playback controls (play/pause/restart), which get tapped the most on
  // mobile, so it's worth being deliberate about rather than reusing `md`.
  icon: "h-11 w-11",
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ variant = "glass", size = "md", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex touch-manipulation items-center justify-center gap-2 rounded-control font-medium",
          "transition-[transform,background-color,box-shadow] duration-150 ease-[var(--ease-standard)]",
          "active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          sizeStyles[size],
          variant === "primary" &&
            "bg-accent text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_20px_rgba(91,140,255,0.35)] hover:bg-accent-soft",
          variant === "glass" &&
            "border border-line bg-white/[0.06] text-ink backdrop-blur-glass hover:bg-white/[0.10] shadow-glass",
          variant === "ghost" && "text-ink-muted hover:text-ink hover:bg-white/[0.05]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
GlassButton.displayName = "GlassButton";
