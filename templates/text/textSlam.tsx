import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";
import { makeClip } from "@/lib/motion/primitives";
import { sampleClip, Track } from "@/lib/motion/keyframes";

/** Punchy oversized-to-normal scale settle, with a fast opacity flash-in (spec: Text Slam). */
function buildTracks(intensity: number): Track[] {
  return [
    {
      property: "scale",
      keyframes: [
        { time: 0, value: intensity },
        { time: 0.45, value: 0.92, easing: "cubicOut" },
        { time: 0.72, value: 1.05, easing: "cubicOut" },
        { time: 1, value: 1, easing: "cubicOut" },
      ],
    },
    {
      property: "opacity",
      keyframes: [
        { time: 0, value: 0 },
        { time: 0.08, value: 1, easing: "linear" },
        { time: 1, value: 1 },
      ],
    },
  ];
}

function buildClip(settings: TemplateSettings) {
  const duration = Number(settings.duration);
  const delay = Number(settings.delay);
  const intensity = Number(settings.intensity);
  return makeClip("text-slam", duration, buildTracks(intensity), delay);
}

function TextSlamComponent({
  settings,
  bind,
}: {
  settings: TemplateSettings;
  bind: (id: string) => (el: HTMLElement | SVGElement | null) => void;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        ref={bind("text-slam")}
        style={{
          fontSize: Number(settings.fontSize),
          fontWeight: 800,
          color: String(settings.color),
          letterSpacing: "-0.01em",
        }}
      >
        {String(settings.text)}
      </div>
    </div>
  );
}

export const textSlamTemplate: MotionTemplate = {
  id: "text-slam",
  name: "Text Slam",
  category: "text",
  description: "Text slams down from oversized to normal with a fast, punchy overshoot — a hard entrance for hooks.",
  tags: ["text", "slam", "impact", "punch", "kinetic typography"],
  style: ["Playful", "Digital"],
  supportedFormats: ["9:16", "16:9", "1:1", "4:5"],
  controls: [
    { key: "text", label: "Text", type: "text", group: "Text", default: "BOOM" },
    { key: "fontSize", label: "Font size", type: "slider", group: "Text", default: 84, min: 32, max: 180, step: 2 },
    { key: "color", label: "Color", type: "color", group: "Text", default: "#F4F5F7" },
    {
      key: "intensity",
      label: "Starting scale",
      type: "slider",
      group: "Animation",
      default: 2.4,
      min: 1.4,
      max: 3.2,
      step: 0.1,
    },
    { key: "duration", label: "Duration", type: "slider", group: "Animation", default: 0.55, min: 0.3, max: 1.2, step: 0.05 },
    { key: "delay", label: "Delay", type: "slider", group: "Animation", default: 0, min: 0, max: 1.5, step: 0.05 },
  ],
  render: (settings) => {
    const clip = buildClip(settings);
    return { clips: [clip], totalDuration: (Number(settings.delay) || 0) + Number(settings.duration) + 0.4 };
  },
  Component: TextSlamComponent,
  drawFrame: (ctx, settings, t, size) => {
    const clip = buildClip(settings);
    const frame = sampleClip(clip, t);
    const scale = Number(frame.scale ?? 1);
    const opacity = Number(frame.opacity ?? 1);
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = String(settings.color);
    ctx.font = `800 ${Number(settings.fontSize)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(size.width / 2, size.height / 2);
    ctx.scale(scale, scale);
    ctx.fillText(String(settings.text), 0, 0);
    ctx.restore();
  },
};
