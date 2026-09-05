"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ControlDefinition, TemplateSettings } from "@/lib/motion/registry";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassSlider } from "@/components/glass/GlassSlider";
import { GlassSelect } from "@/components/glass/GlassSelect";

function groupOrder(g: string) {
  return ["Text", "Animation", "Style", "Canvas", "Advanced"].indexOf(g);
}

export function ControlPanel({
  controls,
  settings,
  onChange,
}: {
  controls: ControlDefinition[];
  settings: TemplateSettings;
  onChange: (key: string, value: string | number | boolean) => void;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const groups = Array.from(new Set(controls.map((c) => c.group))).sort(
    (a, b) => groupOrder(a) - groupOrder(b)
  );

  return (
    <div className="flex flex-col gap-6">
      {groups
        .filter((g) => g !== "Advanced")
        .map((group) => (
          <div key={group} className="flex flex-col gap-4">
            <div className="text-xs font-medium uppercase tracking-wide text-ink-faint">{group}</div>
            {controls
              .filter((c) => c.group === group)
              .map((control) => (
                <Control
                  key={control.key}
                  control={control}
                  value={settings[control.key] ?? control.default}
                  onChange={onChange}
                />
              ))}
          </div>
        ))}

      {controls.some((c) => c.group === "Advanced") && (
        <div className="border-t border-line pt-4">
          <button
            onClick={() => setAdvancedOpen((v) => !v)}
            className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-ink-faint"
          >
            Advanced
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
          </button>
          {advancedOpen && (
            <div className="mt-4 flex flex-col gap-4">
              {controls
                .filter((c) => c.group === "Advanced")
                .map((control) => (
                  <Control
                    key={control.key}
                    control={control}
                    value={settings[control.key] ?? control.default}
                    onChange={onChange}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Control({
  control,
  value,
  onChange,
}: {
  control: ControlDefinition;
  value: string | number | boolean;
  onChange: (key: string, value: string | number | boolean) => void;
}) {
  switch (control.type) {
    case "text":
      return (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink-muted">{control.label}</span>
          <GlassInput value={String(value)} onChange={(e) => onChange(control.key, e.target.value)} />
        </label>
      );
    case "number":
      return (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink-muted">{control.label}</span>
          <GlassInput
            type="number"
            min={control.min}
            max={control.max}
            value={Number(value)}
            onChange={(e) => onChange(control.key, Number(e.target.value))}
          />
        </label>
      );
    case "color":
      return (
        <label className="flex items-center justify-between gap-3 text-sm">
          <span className="text-ink-muted">{control.label}</span>
          <span className="flex items-center gap-2">
            <input
              type="color"
              value={String(value)}
              onChange={(e) => onChange(control.key, e.target.value)}
              className="h-8 w-8 cursor-pointer rounded-[8px] border border-line bg-transparent p-0"
            />
            <span className="font-mono text-xs text-ink-faint">{String(value)}</span>
          </span>
        </label>
      );
    case "slider":
      return (
        <GlassSlider
          label={control.label}
          value={Number(value)}
          min={control.min}
          max={control.max}
          step={control.step}
          onChange={(v) => onChange(control.key, v)}
        />
      );
    case "select":
      return (
        <GlassSelect
          label={control.label}
          value={String(value)}
          options={control.options ?? []}
          onChange={(v) => onChange(control.key, v)}
        />
      );
    case "toggle":
      return (
        <label className="flex items-center justify-between text-sm">
          <span className="text-ink-muted">{control.label}</span>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(control.key, e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
        </label>
      );
    default:
      return null;
  }
}
