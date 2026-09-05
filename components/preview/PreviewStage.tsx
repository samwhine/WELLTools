"use client";

import { CanvasFormat } from "@/lib/motion/registry";
import { cn } from "@/lib/utils/cn";

const ASPECT: Record<CanvasFormat, number> = {
  "9:16": 9 / 16,
  "16:9": 16 / 9,
  "1:1": 1,
  "4:5": 4 / 5,
  Custom: 16 / 9,
};

export function PreviewStage({
  format,
  background = "checkerboard",
  className,
  children,
}: {
  format: CanvasFormat;
  background?: "checkerboard" | "dark" | "light";
  className?: string;
  children: React.ReactNode;
}) {
  const ratio = ASPECT[format];
  return (
    <div className={cn("flex h-full w-full items-center justify-center p-4", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-[10px] border border-line-strong shadow-glass-strong",
          background === "dark" && "bg-[#111214]",
          background === "light" && "bg-[#f4f5f7]"
        )}
        style={{
          aspectRatio: `${ratio}`,
          // Single formula, both axes solved at once: width is the smaller of
          // (a) everything the container can offer and (b) whatever width
          // stays under the height cap once the ratio is applied. Height is
          // then left to `auto`, which the browser derives from width via
          // aspect-ratio — guaranteed proportional, no separate max-height
          // fighting a fixed height on narrow phones (the old bug).
          width: `min(100%, 720px, calc(70vh * ${ratio}))`,
          height: "auto",
          backgroundImage:
            background === "checkerboard"
              ? "conic-gradient(#2a2b30 25%, transparent 0 50%, #2a2b30 0 75%, transparent 0)"
              : undefined,
          backgroundSize: background === "checkerboard" ? "20px 20px" : undefined,
          backgroundColor: background === "checkerboard" ? "#1c1d21" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
