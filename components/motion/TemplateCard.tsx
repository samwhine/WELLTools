"use client";

import Link from "next/link";
import { MotionTemplate } from "@/lib/motion/registry";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { TemplateThumbnail } from "@/components/motion/TemplateThumbnail";

const CATEGORY_LABEL: Record<string, string> = {
  text: "Text",
  editorial: "Editorial",
  social: "Social",
  icons: "UI / Icons",
  callouts: "Callouts",
  shapes: "Shapes",
  transitions: "Transitions",
  effects: "Effects",
  backgrounds: "Backgrounds",
  data: "Data / UI",
  audio: "Audio",
  logo: "Logo",
};

export function TemplateCard({ template }: { template: MotionTemplate }) {
  return (
    <Link href={`/motion/${template.id}`}>
      <LiquidGlass level="subtle" interactive className="group flex flex-col overflow-hidden p-0">
        <div className="relative aspect-[4/3] border-b border-line">
          <TemplateThumbnail template={template} />
        </div>
        <div className="flex flex-col gap-1 p-4">
          <div className="text-[15px] font-medium text-ink">{template.name}</div>
          <div className="text-xs text-ink-faint">
            {CATEGORY_LABEL[template.category] ?? template.category} · {template.supportedFormats.join(" ")}
          </div>
        </div>
      </LiquidGlass>
    </Link>
  );
}
