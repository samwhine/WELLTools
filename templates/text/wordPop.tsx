import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";
import { makeClip } from "@/lib/motion/primitives";
import { sampleClip } from "@/lib/motion/keyframes";
import { staggerDelays, splitText } from "@/lib/motion/stagger";

function buildClips(settings: TemplateSettings) {
  const words = splitText(String(settings.text), "word").filter((w) => w.trim().length > 0);
  const duration = Number(settings.duration);
  const stagger = Number(settings.stagger);
  const delays = staggerDelays(words.length, { unit: "word", amount: stagger });
  const clips = words.map((_, i) =>
    makeClip(
      `word-${i}`,
      duration,
      [
        {
          property: "scale" as const,
          keyframes: [
            { time: 0, value: 0.4 },
            { time: 0.75, value: 1.06, easing: "cubicOut" as const },
            { time: 1, value: 1, easing: "cubicOut" as const },
          ],
        },
        {
          property: "opacity" as const,
          keyframes: [
            { time: 0, value: 0 },
            { time: 0.5, value: 1, easing: "easeOut" as const },
          ],
        },
      ],
      delays[i]
    )
  );
  return { words, clips, delays, duration };
}

function WordPopComponent({
  settings,
  bind,
}: {
  settings: TemplateSettings;
  bind: (id: string) => (el: HTMLElement | SVGElement | null) => void;
}) {
  const words = splitText(String(settings.text), "word").filter((w) => w.trim().length > 0);
  return (
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 overflow-hidden px-10 text-center">
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          ref={bind(`word-${i}`)}
          style={{
            display: "inline-block",
            fontSize: Number(settings.fontSize),
            fontWeight: 800,
            color: String(settings.color),
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}

export const wordPopTemplate: MotionTemplate = {
  id: "word-pop",
  name: "Word Pop",
  category: "text",
  description: "Each word pops in one after another with a soft overshoot — a fast, punchy caption style.",
  tags: ["text", "pop", "stagger", "caption", "social"],
  style: ["Playful", "Editorial"],
  supportedFormats: ["9:16", "1:1", "4:5"],
  controls: [
    { key: "text", label: "Text", type: "text", group: "Text", default: "Every word pops in" },
    { key: "fontSize", label: "Font size", type: "slider", group: "Text", default: 56, min: 24, max: 140, step: 2 },
    { key: "color", label: "Color", type: "color", group: "Text", default: "#F4F5F7" },
    { key: "duration", label: "Duration per word", type: "slider", group: "Animation", default: 0.45, min: 0.15, max: 1, step: 0.05 },
    { key: "stagger", label: "Stagger", type: "slider", group: "Animation", default: 0.12, min: 0.02, max: 0.4, step: 0.01 },
  ],
  render: (settings) => {
    const { clips, delays, duration } = buildClips(settings);
    const totalDuration = (delays[delays.length - 1] ?? 0) + duration + 0.4;
    return { clips, totalDuration };
  },
  Component: WordPopComponent,
  drawFrame: (ctx, settings, t, size) => {
    const { words, clips } = buildClips(settings);
    ctx.save();
    ctx.fillStyle = String(settings.color);
    ctx.font = `800 ${Number(settings.fontSize)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const gap = 14;
    const widths = words.map((w) => ctx.measureText(w).width);
    const totalWidth = widths.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
    let x = size.width / 2 - totalWidth / 2;
    const y = size.height / 2;
    words.forEach((w, i) => {
      const frame = sampleClip(clips[i], t);
      const scale = Number(frame.scale ?? 1);
      const opacity = Number(frame.opacity ?? 1);
      const wCenter = x + widths[i] / 2;
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(wCenter, y);
      ctx.scale(scale, scale);
      ctx.textAlign = "center";
      ctx.fillText(w, 0, 0);
      ctx.restore();
      x += widths[i] + gap;
    });
    ctx.restore();
  },
};
