import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";
import { sampleTrack, Track } from "@/lib/motion/keyframes";

/** Same shape as primitives.glitch()/flicker(), scaled by `intensity` (px offset). */
function jitterTrack(intensity: number): Track {
  return {
    property: "x",
    keyframes: [
      { time: 0, value: 0 },
      { time: 0.1, value: -intensity, easing: "linear" },
      { time: 0.15, value: intensity * 0.7, easing: "linear" },
      { time: 0.2, value: 0, easing: "linear" },
      { time: 0.5, value: -intensity * 0.5, easing: "linear" },
      { time: 0.55, value: intensity * 0.8, easing: "linear" },
      { time: 0.6, value: 0, easing: "linear" },
      { time: 1, value: 0, easing: "linear" },
    ],
  };
}

const flickerTrack: Track = {
  property: "opacity",
  keyframes: [
    { time: 0, value: 0 },
    { time: 0.08, value: 1, easing: "linear" },
    { time: 0.13, value: 0.3, easing: "linear" },
    { time: 0.18, value: 1, easing: "linear" },
    { time: 0.28, value: 0.5, easing: "linear" },
    { time: 0.36, value: 1, easing: "linear" },
    { time: 1, value: 1, easing: "linear" },
  ],
};

function sampleAt(seconds: number, delay: number, duration: number, intensity: number) {
  const local = seconds - delay;
  const t = duration <= 0 ? 1 : Math.min(1, Math.max(0, local / duration));
  const active = local >= 0;
  const offset = active ? Number(sampleTrack(jitterTrack(intensity), t)) : 0;
  const opacity = active ? Number(sampleTrack(flickerTrack, t)) : 0;
  return { offset, opacity };
}

function TextGlitchComponent({
  settings,
  currentTime,
}: {
  settings: TemplateSettings;
  bind: (id: string) => (el: HTMLElement | SVGElement | null) => void;
  currentTime: number;
}) {
  const intensity = Number(settings.intensity);
  const { offset, opacity } = sampleAt(currentTime, Number(settings.delay), Number(settings.duration), intensity);
  const text = String(settings.text);
  const baseStyle: React.CSSProperties = {
    fontSize: Number(settings.fontSize),
    fontWeight: 800,
    letterSpacing: "-0.01em",
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden" style={{ opacity }}>
      <span style={{ ...baseStyle, color: "#FF3B5C", transform: `translateX(${-offset}px)`, mixBlendMode: "screen" }}>
        {text}
      </span>
      <span style={{ ...baseStyle, color: "#3BE0FF", transform: `translateX(${offset}px)`, mixBlendMode: "screen" }}>
        {text}
      </span>
      <span style={{ ...baseStyle, color: String(settings.color) }}>{text}</span>
    </div>
  );
}

export const textGlitchTemplate: MotionTemplate = {
  id: "text-glitch",
  name: "Text Glitch",
  category: "text",
  description: "Text jitters in with a chromatic-aberration RGB split and flicker — digital, broken-signal energy.",
  tags: ["text", "glitch", "digital", "vhs", "distortion"],
  style: ["Glitch", "Digital"],
  supportedFormats: ["9:16", "16:9", "1:1", "4:5"],
  controls: [
    { key: "text", label: "Text", type: "text", group: "Text", default: "SYSTEM ERROR" },
    { key: "fontSize", label: "Font size", type: "slider", group: "Text", default: 64, min: 24, max: 160, step: 2 },
    { key: "color", label: "Color", type: "color", group: "Text", default: "#F4F5F7" },
    { key: "intensity", label: "Split amount", type: "slider", group: "Animation", default: 6, min: 2, max: 16, step: 1 },
    { key: "duration", label: "Duration", type: "slider", group: "Animation", default: 0.6, min: 0.2, max: 1.5, step: 0.05 },
    { key: "delay", label: "Delay", type: "slider", group: "Animation", default: 0, min: 0, max: 1.5, step: 0.05 },
  ],
  render: (settings) => {
    const duration = Number(settings.duration);
    const delay = Number(settings.delay);
    // The RGB-split layers are derived straight from currentTime (they need
    // three independently-offset copies, which the single-clip engine
    // doesn't model), so no transform clip is registered here.
    return { clips: [], totalDuration: delay + duration + 0.5 };
  },
  Component: TextGlitchComponent,
  drawFrame: (ctx, settings, t, size) => {
    const intensity = Number(settings.intensity);
    const { offset, opacity } = sampleAt(t, Number(settings.delay), Number(settings.duration), intensity);
    const text = String(settings.text);
    const cx = size.width / 2;
    const cy = size.height / 2;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.font = `800 ${Number(settings.fontSize)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "#FF3B5C";
    ctx.fillText(text, cx - offset, cy);
    ctx.fillStyle = "#3BE0FF";
    ctx.fillText(text, cx + offset, cy);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = String(settings.color);
    ctx.fillText(text, cx, cy);
    ctx.restore();
  },
};
