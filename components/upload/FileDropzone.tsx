"use client";

import { useRef, useState, DragEvent } from "react";
import { Upload } from "lucide-react";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { cn } from "@/lib/utils/cn";

export function FileDropzone({
  accept,
  onFile,
  hint,
}: {
  accept: string;
  onFile: (file: File) => void;
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <LiquidGlass
      level="subtle"
      interactive
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-3 border-dashed p-14 text-center",
        dragging && "border-accent/60 bg-accent/[0.06]"
      )}
    >
      <div className="rounded-full bg-white/[0.06] p-3">
        <Upload className="h-5 w-5 text-ink-muted" />
      </div>
      <div className="text-sm text-ink">Drop a file here, or click to browse</div>
      <div className="text-xs text-ink-faint">{hint}</div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </LiquidGlass>
  );
}
