import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";
import { getEasing, EasingName } from "@/lib/motion/easing";

function progressAt(seconds: number, delay: number, duration: number, easingName: EasingName) {
  const local = seconds - delay;
  if (local <= 0) return 0;
  const t = duration <= 0 ? 1 : Math.min(1, local / duration);
  return getEasing(easingName)(t);
}

// A gentle hand-drawn wave, not a straight line — differentiates this from
// Word Highlight's clean rectangular sweep.
const MARKER_D = "M 2 22 C 20 12, 35 30, 50 20 S 82 10, 98 20";

function MarkerHighlightComponent({
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
  const thickness = Number(settings.thickness);

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden px-10">
      <span className="relative inline-block px-1">
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            inset: "-15% -6%",
            width: "112%",
            height: "130%",
            transform: "rotate(-1.5deg)",
            pointerEvents: "none",
          }}
        >
          <path
            d={MARKER_D}
            pathLength={100}
            fill="none"
            stroke={String(settings.markerColor)}
            strokeWidth={thickness}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{
              strokeDasharray: 100,
              strokeDashoffset: 100 - progress * 100,
              mixBlendMode: "multiply",
              opacity: 0.6,
            }}
          />
        </svg>
        <span
          className="relative z-10"
          style={{ fontSize: Number(settings.fontSize), fontWeight: 700, color: String(settings.textColor) }}
        >
          {String(settings.text)}
        </span>
      </span>
    </div>
  );
}

export const markerHighlightTemplate: MotionTemplate = {
  id: "marker-highlight",
  name: "Marker Highlight",
  category: "text",
  description: "A rough highlighter stroke draws itself under the text, like it was marked up by hand.",
  tags: ["text", "highlight", "marker", "hand-drawn", "editorial"],
  style: ["Hand-drawn", "Editorial"],
  supportedFormats: ["9:16", "16:9", "1:1", "4:5"],
  controls: [
    { key: "text", label: "Text", type: "text", group: "Text", default: "read this part" },
    { key: "fontSize", label: "Font size", type: "slider", group: "Text", default: 56, min: 24, max: 140, step: 2 },
    { key: "textColor", label: "Text color", type: "color", group: "Text", default: "#0B0C0F" },
    { key: "markerColor", label: "Marker color", type: "color", group: "Style", default: "#FFE066" },
    { key: "thickness", label: "Thickness", type: "slider", group: "Style", default: 24, min: 8, max: 60, step: 2 },
    { key: "duration", label: "Duration", type: "slider", group: "Animation", default: 0.5, min: 0.2, max: 1.2, step: 0.05 },
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
  Component: MarkerHighlightComponent,
  drawFrame: (ctx, settings, t, size) => {
    const progress = progressAt(t, Number(settings.delay), Number(settings.duration), String(settings.easing) as EasingName);
    const text = String(settings.text);
    const fontSize = Number(settings.fontSize);
    const thickness = Number(settings.thickness);
    ctx.save();
    ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
    const metrics = ctx.measureText(text);
    const left = size.width / 2 - metrics.width / 2;
    const top = size.height / 2;

    // Marker stroke, clipped to the revealed fraction of the text width.
    ctx.save();
    ctx.beginPath();
    ctx.rect(left - 8, top - fontSize, (metrics.width + 16) * progress, fontSize * 2);
    ctx.clip();
    ctx.globalAlpha = 0.6;
    ctx.globalCompositeOperation = "multiply";
    ctx.strokeStyle = String(settings.markerColor);
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(left - 8, top + fontSize * 0.05);
    ctx.quadraticCurveTo(left + metrics.width * 0.4, top - fontSize * 0.12, left + metrics.width + 8, top);
    ctx.stroke();
    ctx.restore();

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = String(settings.textColor);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text, left, top);
    ctx.restore();
  },
};
