import type { ComponentType } from "react";
import { Clip } from "./keyframes";

export type ControlType = "text" | "color" | "number" | "select" | "slider" | "toggle" | "font";

export type ControlDefinition = {
  key: string;
  label: string;
  type: ControlType;
  group: "Text" | "Animation" | "Style" | "Canvas" | "Advanced";
  default: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
  advanced?: boolean; // hidden under "Advanced" per spec §37
};

export type CanvasFormat = "9:16" | "16:9" | "1:1" | "4:5" | "Custom";

export type TemplateSettings = Record<string, string | number | boolean>;

/**
 * A renderer takes the current control settings and the canvas size and
 * returns the clips to play, keyed by the element id the template's
 * component will bind refs to.
 */
export type MotionRenderer = (settings: TemplateSettings, canvasSize: { width: number; height: number }) => {
  clips: Clip[];
  totalDuration: number;
};

export type TemplateCategory =
  | "text"
  | "editorial"
  | "social"
  | "icons"
  | "callouts"
  | "shapes"
  | "transitions"
  | "effects"
  | "backgrounds"
  | "data"
  | "audio"
  | "logo";

export type TemplateStyle =
  | "Minimal"
  | "Cinematic"
  | "Editorial"
  | "Glitch"
  | "Retro"
  | "Corporate"
  | "Playful"
  | "Hand-drawn"
  | "Digital";

export type MotionTemplate = {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  tags: string[];
  style?: TemplateStyle[];
  supportedFormats: CanvasFormat[];
  render: MotionRenderer;
  controls: ControlDefinition[];
  /**
   * Optional canvas renderer used purely for export (spec §46). Mirrors what
   * the DOM Component shows at a given playback time `t` (seconds), so
   * export doesn't depend on screenshotting the live DOM. Templates that
   * don't provide one aren't exportable yet — the export panel disables
   * the button and says so rather than producing a blank file.
   */
  drawFrame?: (
    ctx: CanvasRenderingContext2D,
    settings: TemplateSettings,
    t: number,
    size: { width: number; height: number }
  ) => void;
  // Component that draws the element(s) this template animates; the preview
  // page mounts it and hands it refs to bind into the MotionPlayer.
  Component: ComponentType<{
    settings: TemplateSettings;
    bind: (id: string) => (el: HTMLElement | SVGElement | null) => void;
    // Provided for templates whose output isn't just transform/opacity on a
    // fixed element (e.g. Number Counter's digits, Typewriter's char reveal) —
    // they can derive their own render straight from playback time.
    currentTime: number;
    duration: number;
  }>;
};

const registry = new Map<string, MotionTemplate>();

/** Adding a template only ever requires this call (spec §75) — nothing else changes. */
export function registerTemplate(template: MotionTemplate) {
  registry.set(template.id, template);
}

export function getTemplate(id: string): MotionTemplate | undefined {
  return registry.get(id);
}

export function listTemplates(): MotionTemplate[] {
  return Array.from(registry.values());
}

export function searchTemplates(query: string): MotionTemplate[] {
  const q = query.trim().toLowerCase();
  if (!q) return listTemplates();
  return listTemplates().filter((t) =>
    [t.name, t.description, t.category, ...t.tags].some((field) => field.toLowerCase().includes(q))
  );
}

export type TemplateFilters = {
  category?: TemplateCategory | "All";
  format?: CanvasFormat;
  style?: TemplateStyle;
};

export function filterTemplates(templates: MotionTemplate[], filters: TemplateFilters): MotionTemplate[] {
  return templates.filter((t) => {
    if (filters.category && filters.category !== "All" && t.category !== filters.category) return false;
    if (filters.format && !t.supportedFormats.includes(filters.format)) return false;
    if (filters.style && !(t.style ?? []).includes(filters.style)) return false;
    return true;
  });
}

export const CANVAS_PRESETS: Record<CanvasFormat, { width: number; height: number } | null> = {
  "9:16": { width: 1080, height: 1920 },
  "16:9": { width: 1920, height: 1080 },
  "1:1": { width: 1080, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
  Custom: null,
};
