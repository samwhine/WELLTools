import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";
import { getEasing, EasingName } from "@/lib/motion/easing";

function progressAt(seconds: number, delay: number, duration: number, easingName: EasingName) {
  const local = seconds - delay;
  if (local <= 0) return 0;
  const t = duration <= 0 ? 1 : Math.min(1, local / duration);
  return getEasing(easingName)(t);
}

/** Bezier approximation of an ellipse (kappa constant), in a fixed 0..100 x 0..60 local box. */
const K = 0.5522847498;
const CX = 50;
const CY = 30;
const RX = 46;
const RY = 26;
const ELLIPSE_D = `M ${CX - RX} ${CY}
  C ${CX - RX} ${CY - RY * K}, ${CX - RX * K} ${CY - RY}, ${CX} ${CY - RY}
  C ${CX + RX * K} ${CY - RY}, ${CX + RX} ${CY - RY * K}, ${CX + RX} ${CY}
  C ${CX + RX} ${CY + RY * K}, ${CX + RX * K} ${CY + RY}, ${CX} ${CY + RY}
  C ${CX - RX * K} ${CY + RY}, ${CX - RX} ${CY + RY * K}, ${CX - RX} ${CY} Z`;

function CircleHighlightComponent({
  settings,
  currentTime,
}: {
  settings: TemplateSettings;
  bind: (id: string) => (el: HTMLElement | SVGElement | null) => void;
  currentTime: number;
}) {
  const progress = progressAt(
    currentTime,
    Number(settings.delay),
    Number(settings.duration),
    String(settings.easing) as EasingName
  );
  const pad = Number(settings.padding);

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <span className="relative inline-block px-2 py-1">
        <span
          className="relative z-10"
          style={{ fontSize: Number(settings.fontSize), fontWeight: 700, color: String(settings.textColor) }}
        >
          {String(settings.text)}
        </span>
        <svg
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            inset: -pad,
            width: `calc(100% + ${pad * 2}px)`,
            height: `calc(100% + ${pad * 2}px)`,
            pointerEvents: "none",
          }}
        >
          <path
            d={ELLIPSE_D}
            pathLength={100}
            fill="none"
            stroke={String(settings.circleColor)}
            strokeWidth={Number(settings.thickness)}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ strokeDasharray: 100, strokeDashoffset: 100 - progress * 100 }}
          />
        </svg>
      </span>
    </div>
  );
}

export const circleHighlightTemplate: MotionTemplate = {
  id: "circle-highlight",
  name: "Circle Highlight",
  category: "callouts",
  description: "A hand-drawn circle draws itself around a word — a quick, editorial way to call out one idea.",
  tags: ["circle", "highlight", "callout", "annotation", "hand-drawn"],
  style: ["Hand-drawn", "Editorial"],
  supportedFormats: ["9:16", "16:9", "1:1", "4:5"],
  controls: [
    { key: "text", label: "Text", type: "text", group: "Text", default: "this one" },
    { key: "fontSize", label: "Font size", type: "slider", group: "Text", default: 56, min: 24, max: 140, step: 2 },
    { key: "textColor", label: "Text color", type: "color", group: "Text", default: "#F4F5F7" },
    { key: "circleColor", label: "Circle color", type: "color", group: "Style", default: "#FF5B5B" },
    { key: "thickness", label: "Thickness", type: "slider", group: "Style", default: 5, min: 2, max: 10, step: 1 },
    { key: "padding", label: "Padding", type: "slider", group: "Style", default: 18, min: 6, max: 48, step: 2 },
    { key: "duration", label: "Duration", type: "slider", group: "Animation", default: 0.6, min: 0.2, max: 1.5, step: 0.05 },
    { key: "delay", label: "Delay", type: "slider", group: "Animation", default: 0.15, min: 0, max: 1.5, step: 0.05 },
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
      ],
    },
  ],
  render: (settings) => {
    const duration = Number(settings.duration);
    const delay = Number(settings.delay);
    return { clips: [], totalDuration: delay + duration + 0.4 };
  },
  Component: CircleHighlightComponent,
  drawFrame: (ctx, settings, t, size) => {
    const progress = progressAt(t, Number(settings.delay), Number(settings.duration), String(settings.easing) as EasingName);
    const text = String(settings.text);
    const fontSize = Number(settings.fontSize);
    const pad = Number(settings.padding);
    ctx.save();
    ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
    const metrics = ctx.measureText(text);
    const rx = metrics.width / 2 + pad;
    const ry = fontSize / 2 + pad * 0.7;
    const cx = size.width / 2;
    const cy = size.height / 2;

    ctx.fillStyle = String(settings.textColor);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, cx, cy);

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.strokeStyle = String(settings.circleColor);
    ctx.lineWidth = Number(settings.thickness);
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();
  },
};
