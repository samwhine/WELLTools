"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils/cn";

export const GlassTabs = TabsPrimitive.Root;

export function GlassTabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex items-center gap-1 rounded-control border border-line bg-white/[0.04] p-1 backdrop-blur-glass",
        className
      )}
      {...props}
    />
  );
}

export function GlassTabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "rounded-[9px] px-3.5 py-1.5 text-sm text-ink-muted transition-colors duration-150",
        "data-[state=active]:bg-white/[0.10] data-[state=active]:text-ink data-[state=active]:shadow-glass",
        "hover:text-ink",
        className
      )}
      {...props}
    />
  );
}

export const GlassTabsContent = TabsPrimitive.Content;
