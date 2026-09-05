import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";
import { getEasing, EasingName } from "@/lib/motion/easing";

function progressAt(seconds: number, delay: number, duration: number, easingName: EasingName) {
  const local = seconds - delay;
  if (local <= 0) return 0;
  const t = duration <= 0 ? 1 : Math.min(1, local / duration);
  return getEasing(easingName)(t);
}

function ProgressBarComponent({
  settings,
  currentTime,
}: {
  settings: TemplateSettings;
  bind: (id: string) => (el: HTMLElement | SVGElement | null) => void;
  currentTime: number;
}) {
  const eased = progressAt(currentTime, Number(settings.delay), Number(settings.duration), String(settings.easing) as EasingName);
  const target = Number(settings.value);
  const percent = eased * target;
  const thickness = Number(settings.thickness);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden px-14">
      <div
        className="w-full overflow-hidden"
        style={{ height: thickness, borderRadius: thickness / 2, background: String(settings.trackColor) }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: thickness / 2,
            background: String(settings.color),
          }}
        />
      </div>
      {Boolean(settings.showLabel) && (
        <div style={{ fontSize: thickness * 1.6, fontWeight: 700, color: String(settings.color) }}>
          {Math.round(percent)}%
        </div>
      )}
    </div>
  );
}

/** Manual rounded-rect path — avoids relying on ctx.roundRect browser support. */
function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, h / 2, w / 2 || h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export const progressBarTemplate: MotionTemplate = {
  id: "progress-bar",
  name: "Progress Bar",
  category: "data",
  description: "A rounded progress bar fills up to a target percentage, with an optional live label.",
  tags: ["progress", "bar", "loading", "data", "ui"],
  style: ["Minimal", "Corporate"],
  supportedFormats: ["9:16", "16:9", "1:1", "4:5"],
  controls: [
    { key: "value", label: "Target %", type: "slider", group: "Text", default: 72, min: 0, max: 100, step: 1 },
    { key: "showLabel", label: "Show label", type: "toggle", group: "Text", default: true },
    { key: "color", label: "Fill color", type: "color", group: "Style", default: "#5B8CFF" },
    { key: "trackColor", label: "Track color", type: "color", group: "Style", default: "#2A2B30" },
    { key: "thickness", label: "Thickness", type: "slider", group: "Style", default: 16, min: 6, max: 40, step: 1 },
    { key: "duration", label: "Duration", type: "slider", group: "Animation", default: 1.2, min: 0.3, max: 3, step: 0.1 },
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
        { label: "Linear", value: "linear" },
        { label: "Expo Out", value: "expoOut" },
      ],
    },
  ],
  render: (settings) => {
    const duration = Number(settings.duration);
    const delay = Number(settings.delay);
    return { clips: [], totalDuration: delay + duration + 0.5 };
  },
  Component: ProgressBarComponent,
  drawFrame: (ctx, settings, t, size) => {
    const eased = progressAt(t, Number(settings.delay), Number(settings.duration), String(settings.easing) as EasingName);
    const target = Number(settings.value);
    const percent = eased * target;
    const thickness = Number(settings.thickness);
    const barWidth = size.width * 0.72;
    const x = (size.width - barWidth) / 2;
    const y = size.height / 2 - thickness / 2;

    ctx.save();
    ctx.fillStyle = String(settings.trackColor);
    roundedRectPath(ctx, x, y, barWidth, thickness, thickness / 2);
    ctx.fill();

    ctx.fillStyle = String(settings.color);
    roundedRectPath(ctx, x, y, (barWidth * percent) / 100, thickness, thickness / 2);
    ctx.fill();

    if (settings.showLabel) {
      ctx.fillStyle = String(settings.color);
      ctx.font = `700 ${thickness * 1.6}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${Math.round(percent)}%`, size.width / 2, y + thickness + thickness * 1.4);
    }
    ctx.restore();
  },
};
