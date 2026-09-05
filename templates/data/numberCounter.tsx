import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";
import { getEasing, EasingName } from "@/lib/motion/easing";

function NumberCounterComponent({
  settings,
  currentTime,
}: {
  settings: TemplateSettings;
  bind: (id: string) => (el: HTMLElement | SVGElement | null) => void;
  currentTime: number;
}) {
  const from = Number(settings.from);
  const to = Number(settings.to);
  const duration = Number(settings.duration);
  const delay = Number(settings.delay);
  const easing = getEasing(String(settings.easing) as EasingName);
  const decimals = Number(settings.decimals);

  const local = currentTime - delay;
  const t = duration <= 0 ? 1 : Math.min(1, Math.max(0, local / duration));
  const eased = local < 0 ? 0 : easing(t);
  const value = from + (to - from) * eased;
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        style={{
          fontSize: Number(settings.fontSize),
          fontWeight: 800,
          color: String(settings.color),
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {String(settings.prefix)}
        {formatted}
        {String(settings.suffix)}
      </div>
    </div>
  );
}

export const numberCounterTemplate: MotionTemplate = {
  id: "number-counter",
  name: "Number Counter",
  category: "data",
  description: "Count from one number to another with real easing — for stats, prices, and milestones.",
  tags: ["number", "counter", "stat", "data", "kpi"],
  style: ["Minimal", "Corporate"],
  supportedFormats: ["9:16", "16:9", "1:1", "4:5"],
  controls: [
    { key: "from", label: "From", type: "number", group: "Text", default: 0 },
    { key: "to", label: "To", type: "number", group: "Text", default: 1000 },
    { key: "decimals", label: "Decimals", type: "number", group: "Text", default: 0, min: 0, max: 2 },
    { key: "prefix", label: "Prefix", type: "text", group: "Text", default: "" },
    { key: "suffix", label: "Suffix", type: "text", group: "Text", default: "+" },
    { key: "fontSize", label: "Font size", type: "slider", group: "Text", default: 80, min: 32, max: 180, step: 2 },
    { key: "color", label: "Color", type: "color", group: "Text", default: "#F4F5F7" },
    { key: "duration", label: "Duration", type: "slider", group: "Animation", default: 1.6, min: 0.4, max: 4, step: 0.1 },
    { key: "delay", label: "Delay", type: "slider", group: "Animation", default: 0, min: 0, max: 1.5, step: 0.05 },
    {
      key: "easing",
      label: "Easing",
      type: "select",
      group: "Advanced",
      default: "cubicOut",
      advanced: true,
      options: [
        { label: "Cubic Out", value: "cubicOut" },
        { label: "Expo Out", value: "expoOut" },
        { label: "Linear", value: "linear" },
      ],
    },
  ],
  render: (settings) => {
    const duration = Number(settings.duration);
    const delay = Number(settings.delay);
    return { clips: [], totalDuration: delay + duration + 0.6 };
  },
  Component: NumberCounterComponent,
  drawFrame: (ctx, settings, t, size) => {
    const from = Number(settings.from);
    const to = Number(settings.to);
    const duration = Number(settings.duration);
    const delay = Number(settings.delay);
    const decimals = Number(settings.decimals);
    const easing = getEasing(String(settings.easing) as EasingName);
    const local = t - delay;
    const tt = duration <= 0 ? 1 : Math.min(1, Math.max(0, local / duration));
    const eased = local < 0 ? 0 : easing(tt);
    const value = from + (to - from) * eased;
    const formatted = value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    const text = `${settings.prefix}${formatted}${settings.suffix}`;
    ctx.save();
    ctx.fillStyle = String(settings.color);
    ctx.font = `800 ${Number(settings.fontSize)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, size.width / 2, size.height / 2);
    ctx.restore();
  },
};
