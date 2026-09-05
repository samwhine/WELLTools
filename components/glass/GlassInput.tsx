import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export const GlassInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-control border border-line bg-white/[0.05] px-3 text-sm text-ink placeholder:text-ink-faint",
          "backdrop-blur-glass shadow-glass outline-none transition-colors duration-150",
          "focus:border-accent/60 focus:bg-white/[0.07]",
          className
        )}
        {...props}
      />
    );
  }
);
GlassInput.displayName = "GlassInput";
