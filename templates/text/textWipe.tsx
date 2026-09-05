import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";
import { getEasing, EasingName } from "@/lib/motion/easing";

type WipeDirection = "ltr" | "rtl" | "ttb" | "btt";

/** inset(top right bottom left) — hides the not-yet-revealed side; progress 0..1. */
function clipInsetFor(direction: WipeDirection, progress: number): string {
  const hidden = (1 - progress) * 100;
  switch (direction) {
    case "ltr":
      return `inset(0 ${hidden}% 0 0)`;
    case "rtl":
      return `inset(0 0 0 ${hidden}%)`;
    case "ttb":
      return `inset(0 0 ${hidden}% 0)`;
    case "btt":
      return `inset(${hidden}% 0 0 0)`;
  }
}

function progressAt(seconds: number, delay: number, duration: number, easingName: EasingName) {
  const local = seconds - delay;
  if (local <= 0) return 0;
  const t = duration <= 0 ? 1 : Math.min(1, local / duration);
  return getEasing(easingName)(t);
}

function TextWipeComponent({
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
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        style={{
          fontSize: Number(settings.fontSize),
          fontWeight: 700,
          color: String(settings.color),
          letterSpacing: "-0.01em",
          clipPath: clipInsetFor(String(settings.direction) as WipeDirection, progress),
        }}
      >
        {String(settings.text)}
      </div>
    </div>
  );
}

export const textWipeTemplate: MotionTemplate = {
  id: "text-wipe",
  name: "Text Wipe",
  category: "text",
  description: "Text reveals progressively behind a directional wipe — clean and editorial, no bounce.",
  tags: ["text", "wipe", "reveal", "mask", "kinetic typography"],
  style: ["Minimal", "Corporate", "Editorial"],
  supportedFormats: ["9:16", "16:9", "1:1", "4:5"],
  controls: [
    { key: "text", label: "Text", type: "text", group: "Text", default: "Wiped into view" },
    { key: "fontSize", label: "Font size", type: "slider", group: "Text", default: 64, min: 24, max: 160, step: 2 },
    { key: "color", label: "Color", type: "color", group: "Text", default: "#F4F5F7" },
    {
      key: "direction",
      label: "Direction",
      type: "select",
      group: "Animation",
      default: "ltr",
      options: [
        { label: "Left to right", value: "ltr" },
        { label: "Right to left", value: "rtl" },
        { label: "Top to bottom", value: "ttb" },
        { label: "Bottom to top", value: "btt" },
      ],
    },
    { key: "duration", label: "Duration", type: "slider", group: "Animation", default: 0.6, min: 0.2, max: 1.5, step: 0.05 },
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
    // No transform/opacity clip needed — the reveal is purely clip-path,
    // derived straight from currentTime (same pattern as Typewriter).
    return { clips: [], totalDuration: delay + duration + 0.5 };
  },
  Component: TextWipeComponent,
  drawFrame: (ctx, settings, t, size) => {
    const progress = progressAt(t, Number(settings.delay), Number(settings.duration), String(settings.easing) as EasingName);
    const text = String(settings.text);
    const fontSize = Number(settings.fontSize);
    ctx.save();
    ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const textH = fontSize * 1.2;
    const left = size.width / 2 - textW / 2;
    const top = size.height / 2 - textH / 2;
    const direction = String(settings.direction) as WipeDirection;

    let clipX = left;
    let clipY = top;
    let clipW = textW;
    let clipH = textH;
    if (direction === "ltr") clipW = textW * progress;
    else if (direction === "rtl") {
      clipW = textW * progress;
      clipX = left + (textW - clipW);
    } else if (direction === "ttb") clipH = textH * progress;
    else if (direction === "btt") {
      clipH = textH * progress;
      clipY = top + (textH - clipH);
    }

    ctx.beginPath();
    ctx.rect(clipX, clipY, clipW, clipH);
    ctx.clip();
    ctx.fillStyle = String(settings.color);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, size.width / 2, size.height / 2);
    ctx.restore();
  },
};
