"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface GlassSelectProps {
  label?: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  className?: string;
}

export function GlassSelect({ label, value, options, onChange, className }: GlassSelectProps) {
  return (
    <div className={cn("w-full", className)}>
      {label && <div className="mb-2 text-sm text-ink-muted">{label}</div>}
      <SelectPrimitive.Root value={value} onValueChange={onChange}>
        <SelectPrimitive.Trigger
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-control border border-line bg-white/[0.05] px-3 text-sm text-ink",
            "backdrop-blur-glass shadow-glass outline-none focus:border-accent/60"
          )}
        >
          <SelectPrimitive.Value />
          <SelectPrimitive.Icon>
            <ChevronDown className="h-4 w-4 text-ink-muted" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="z-50 overflow-hidden rounded-control border border-line-strong bg-canvas-raised/95 backdrop-blur-glass-strong shadow-glass-strong animate-glass-in"
            position="popper"
            sideOffset={6}
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className="relative flex cursor-pointer select-none items-center rounded-[8px] px-3 py-2 text-sm text-ink outline-none data-[highlighted]:bg-white/[0.08]"
                >
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute right-2">
                    <Check className="h-3.5 w-3.5 text-accent" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
