import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";
import { makeClip, shake } from "@/lib/motion/primitives";
import { sampleClip, Track } from "@/lib/motion/keyframes";

function buildTracks(intensity: number): Track[] {
  return [
    shake(intensity),
    {
      property: "opacity",
      keyframes: [
        { time: 0, value: 0 },
        { time: 0.1, value: 1, easing: "easeOut" },
        { time: 1, value: 1 },
      ],
    },
  ];
}

function buildClip(settings: TemplateSettings) {
  const duration = Number(settings.duration);
  const delay = Number(settings.delay);
  const intensity = Number(settings.intensity);
  return makeClip("text-shake", duration, buildTracks(intensity), delay);
}

function TextShakeComponent({
  settings,
  bind,
}: {
  settings: TemplateSettings;
  bind: (id: string) => (el: HTMLElement | SVGElement | null) => void;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        ref={bind("text-shake")}
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

export const textShakeTemplate: MotionTemplate = {
  id: "text-shake",
  name: "Text Shake",
  category: "text",
  description: "Text rattles side to side with decaying intensity — good for warnings, hype, or comedic beats.",
  tags: ["text", "shake", "attention", "kinetic typography"],
  style: ["Playful", "Glitch"],
  supportedFormats: ["9:16", "16:9", "1:1", "4:5"],
  controls: [
    { key: "text", label: "Text", type: "text", group: "Text", default: "WATCH OUT" },
    { key: "fontSize", label: "Font size", type: "slider", group: "Text", default: 64, min: 24, max: 160, step: 2 },
    { key: "color", label: "Color", type: "color", group: "Text", default: "#F4F5F7" },
    { key: "intensity", label: "Intensity", type: "slider", group: "Animation", default: 8, min: 2, max: 20, step: 1 },
    { key: "duration", label: "Duration", type: "slider", group: "Animation", default: 0.8, min: 0.3, max: 1.5, step: 0.05 },
    { key: "delay", label: "Delay", type: "slider", group: "Animation", default: 0, min: 0, max: 1.5, step: 0.05 },
  ],
  render: (settings) => {
    const clip = buildClip(settings);
    return { clips: [clip], totalDuration: (Number(settings.delay) || 0) + Number(settings.duration) + 0.3 };
  },
  Component: TextShakeComponent,
  drawFrame: (ctx, settings, t, size) => {
    const clip = buildClip(settings);
    const frame = sampleClip(clip, t);
    const x = Number(frame.x ?? 0);
    const opacity = Number(frame.opacity ?? 1);
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = String(settings.color);
    ctx.font = `800 ${Number(settings.fontSize)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(settings.text), size.width / 2 + x, size.height / 2);
    ctx.restore();
  },
};
