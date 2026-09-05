import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";
import { makeClip } from "@/lib/motion/primitives";
import { sampleClip, track } from "@/lib/motion/keyframes";

function buildClip(settings: TemplateSettings) {
  const duration = Number(settings.duration);
  const delay = Number(settings.delay);
  return makeClip("highlight-bar", duration, [track("scaleX", 0, 1, "cubicOut")], delay);
}

function WordHighlightComponent({
  settings,
  bind,
}: {
  settings: TemplateSettings;
  bind: (id: string) => (el: HTMLElement | SVGElement | null) => void;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden px-10">
      <div className="relative inline-block">
        <span
          ref={bind("highlight-bar")}
          className="absolute inset-y-[6%] left-0 rounded-[4px]"
          style={{
            width: "100%",
            transformOrigin: "left center",
            background: String(settings.highlightColor),
            zIndex: 0,
          }}
        />
        <span
          className="relative z-10"
          style={{
            fontSize: Number(settings.fontSize),
            fontWeight: 700,
            color: String(settings.textColor),
          }}
        >
          {String(settings.text)}
        </span>
      </div>
    </div>
  );
}

export const wordHighlightTemplate: MotionTemplate = {
  id: "word-highlight",
  name: "Word Highlight",
  category: "editorial",
  description: "Highlight words with a smooth editorial animation — a marker sweeps in behind the text.",
  tags: ["text", "highlight", "editorial", "social", "marker"],
  style: ["Editorial", "Minimal"],
  supportedFormats: ["9:16", "16:9", "1:1", "4:5"],
  controls: [
    { key: "text", label: "Text", type: "text", group: "Text", default: "important idea" },
    { key: "fontSize", label: "Font size", type: "slider", group: "Text", default: 64, min: 24, max: 140, step: 2 },
    { key: "textColor", label: "Text color", type: "color", group: "Text", default: "#0B0C0F" },
    { key: "highlightColor", label: "Highlight color", type: "color", group: "Style", default: "#FFE066" },
    { key: "duration", label: "Duration", type: "slider", group: "Animation", default: 0.5, min: 0.2, max: 1.2, step: 0.05 },
    { key: "delay", label: "Delay", type: "slider", group: "Animation", default: 0.2, min: 0, max: 1.5, step: 0.05 },
  ],
  render: (settings) => {
    const clip = buildClip(settings);
    return { clips: [clip], totalDuration: (Number(settings.delay) || 0) + Number(settings.duration) + 0.6 };
  },
  Component: WordHighlightComponent,
  drawFrame: (ctx, settings, t, size) => {
    const clip = buildClip(settings);
    const frame = sampleClip(clip, t);
    const scaleX = Number(frame.scaleX ?? 1);
    ctx.save();
    ctx.font = `700 ${Number(settings.fontSize)}px Inter, system-ui, sans-serif`;
    const text = String(settings.text);
    const metrics = ctx.measureText(text);
    const pad = Number(settings.fontSize) * 0.12;
    const barW = (metrics.width + pad * 2) * scaleX;
    const barH = Number(settings.fontSize) * 1.15;
    const left = size.width / 2 - metrics.width / 2 - pad;
    const top = size.height / 2 - barH / 2;
    ctx.fillStyle = String(settings.highlightColor);
    ctx.fillRect(left, top, barW, barH);
    ctx.fillStyle = String(settings.textColor);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text, size.width / 2 - metrics.width / 2, size.height / 2);
    ctx.restore();
  },
};
