import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";
import { getEasing, EasingName } from "@/lib/motion/easing";

type ArrowDirection = "right" | "left" | "up" | "down";

const ROTATION: Record<ArrowDirection, number> = { right: 0, down: 90, left: 180, up: -90 };

function progressAt(seconds: number, delay: number, duration: number, easingName: EasingName) {
  const local = seconds - delay;
  if (local <= 0) return 0;
  const t = duration <= 0 ? 1 : Math.min(1, local / duration);
  return getEasing(easingName)(t);
}

/** Shaft + two-stroke arrowhead as one path, drawn right-pointing; rotated via CSS for other directions. */
function arrowPathD(length: number, thickness: number) {
  const headLen = Math.max(10, thickness * 3.2);
  const cy = 40;
  const startX = 20;
  const tipX = startX + length;
  return `M ${startX} ${cy} L ${tipX} ${cy} M ${tipX} ${cy} L ${tipX - headLen} ${cy - headLen * 0.55} M ${tipX} ${cy} L ${
    tipX - headLen
  } ${cy + headLen * 0.55}`;
}

function AnimatedArrowComponent({
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
  const length = Number(settings.length);
  const thickness = Number(settings.thickness);
  const direction = String(settings.direction) as ArrowDirection;
  const d = arrowPathD(length, thickness);

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <svg
        width={length + 40}
        height={80}
        viewBox={`0 0 ${length + 40} 80`}
        style={{ transform: `rotate(${ROTATION[direction]}deg)` }}
      >
        <path
          d={d}
          pathLength={100}
          fill="none"
          stroke={String(settings.color)}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: 100, strokeDashoffset: 100 - progress * 100 }}
        />
      </svg>
    </div>
  );
}

export const animatedArrowTemplate: MotionTemplate = {
  id: "animated-arrow",
  name: "Animated Arrow",
  category: "callouts",
  description: "A callout arrow draws itself on, shaft first then head — for pointing at anything on screen.",
  tags: ["arrow", "callout", "annotation", "pointer"],
  style: ["Minimal", "Hand-drawn"],
  supportedFormats: ["9:16", "16:9", "1:1", "4:5"],
  controls: [
    {
      key: "direction",
      label: "Direction",
      type: "select",
      group: "Style",
      default: "right",
      options: [
        { label: "Right", value: "right" },
        { label: "Left", value: "left" },
        { label: "Up", value: "up" },
        { label: "Down", value: "down" },
      ],
    },
    { key: "color", label: "Color", type: "color", group: "Style", default: "#F4F5F7" },
    { key: "thickness", label: "Thickness", type: "slider", group: "Style", default: 6, min: 2, max: 12, step: 1 },
    { key: "length", label: "Length", type: "slider", group: "Style", default: 220, min: 80, max: 400, step: 10 },
    { key: "duration", label: "Duration", type: "slider", group: "Animation", default: 0.5, min: 0.2, max: 1.5, step: 0.05 },
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
      ],
    },
  ],
  render: (settings) => {
    const duration = Number(settings.duration);
    const delay = Number(settings.delay);
    return { clips: [], totalDuration: delay + duration + 0.4 };
  },
  Component: AnimatedArrowComponent,
  drawFrame: (ctx, settings, t, size) => {
    const progress = progressAt(t, Number(settings.delay), Number(settings.duration), String(settings.easing) as EasingName);
    const length = Number(settings.length);
    const thickness = Number(settings.thickness);
    const direction = String(settings.direction) as ArrowDirection;
    const headLen = Math.max(10, thickness * 3.2);
    const shaftFrac = 0.7; // approximate proportion of total path length spent on the shaft

    ctx.save();
    ctx.translate(size.width / 2, size.height / 2);
    ctx.rotate((ROTATION[direction] * Math.PI) / 180);
    ctx.translate(-(length + 40) / 2, 0);
    ctx.strokeStyle = String(settings.color);
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const startX = 20;
    const cy = 40;
    const tipX = startX + length;

    ctx.beginPath();
    if (progress <= shaftFrac) {
      const shaftProgress = progress / shaftFrac;
      ctx.moveTo(startX, cy);
      ctx.lineTo(startX + length * shaftProgress, cy);
    } else {
      ctx.moveTo(startX, cy);
      ctx.lineTo(tipX, cy);
      const headProgress = (progress - shaftFrac) / (1 - shaftFrac);
      ctx.moveTo(tipX, cy);
      ctx.lineTo(tipX - headLen * headProgress, cy - headLen * 0.55 * headProgress);
      ctx.moveTo(tipX, cy);
      ctx.lineTo(tipX - headLen * headProgress, cy + headLen * 0.55 * headProgress);
    }
    ctx.stroke();
    ctx.restore();
  },
};
