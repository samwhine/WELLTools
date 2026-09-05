import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";
import { makeClip } from "@/lib/motion/primitives";
import { sampleClip, track } from "@/lib/motion/keyframes";
import { EasingName } from "@/lib/motion/easing";

function buildClip(settings: TemplateSettings) {
  const duration = Number(settings.duration);
  const delay = Number(settings.delay);
  const distance = Number(settings.distance);
  const axis = String(settings.direction) as "x" | "y";
  const easing = String(settings.easing) as EasingName;
  return makeClip(
    "text-reveal",
    duration,
    [track(axis, distance, 0, easing), track("opacity", 0, 1, "easeOut")],
    delay
  );
}

function TextRevealComponent({
  settings,
  bind,
}: {
  settings: TemplateSettings;
  bind: (id: string) => (el: HTMLElement | SVGElement | null) => void;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        ref={bind("text-reveal")}
        style={{
          fontSize: Number(settings.fontSize),
          fontWeight: 700,
          color: String(settings.color),
          letterSpacing: "-0.01em",
        }}
      >
        {String(settings.text)}
      </div>
    </div>
  );
}

export const textRevealTemplate: MotionTemplate = {
  id: "text-reveal",
  name: "Text Reveal",
  category: "text",
  description: "A single line of text slides and fades in with a clean, editor-friendly entrance.",
  tags: ["text", "reveal", "entrance", "kinetic typography"],
  style: ["Minimal", "Corporate"],
  supportedFormats: ["9:16", "16:9", "1:1", "4:5"],
  controls: [
    { key: "text", label: "Text", type: "text", group: "Text", default: "Your headline here" },
    { key: "fontSize", label: "Font size", type: "slider", group: "Text", default: 64, min: 24, max: 160, step: 2 },
    { key: "color", label: "Color", type: "color", group: "Text", default: "#F4F5F7" },
    {
      key: "direction",
      label: "Direction",
      type: "select",
      group: "Animation",
      default: "y",
      options: [
        { label: "Slide up", value: "y" },
        { label: "Slide in", value: "x" },
      ],
    },
    { key: "distance", label: "Distance", type: "slider", group: "Animation", default: 40, min: 10, max: 160, step: 5 },
    { key: "duration", label: "Duration", type: "slider", group: "Animation", default: 0.7, min: 0.2, max: 2, step: 0.05 },
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
        { label: "Back Out", value: "backOut" },
        { label: "Expo Out", value: "expoOut" },
      ],
    },
  ],
  render: (settings) => {
    const clip = buildClip(settings);
    return { clips: [clip], totalDuration: (Number(settings.delay) || 0) + Number(settings.duration) + 0.6 };
  },
  Component: TextRevealComponent,
  drawFrame: (ctx, settings, t, size) => {
    const clip = buildClip(settings);
    const frame = sampleClip(clip, t);
    const axis = String(settings.direction) as "x" | "y";
    ctx.save();
    ctx.globalAlpha = Number(frame.opacity ?? 1);
    ctx.fillStyle = String(settings.color);
    ctx.font = `700 ${Number(settings.fontSize)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const x = size.width / 2 + (axis === "x" ? Number(frame.x ?? 0) : 0);
    const y = size.height / 2 + (axis === "y" ? Number(frame.y ?? 0) : 0);
    ctx.fillText(String(settings.text), x, y);
    ctx.restore();
  },
};
