import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";
import { getEasing, EasingName } from "@/lib/motion/easing";

type MatchCutFrame = { aOpacity: number; aScale: number; bOpacity: number; bScale: number };

/** Hold A -> punch-zoom crossfade -> hold B, the classic "match cut" transition shape. */
function sampleMatchCut(seconds: number, holdA: number, transition: number, easingName: EasingName): MatchCutFrame {
  if (seconds < holdA) return { aOpacity: 1, aScale: 1, bOpacity: 0, bScale: 0.85 };
  if (seconds < holdA + transition) {
    const p = getEasing(easingName)((seconds - holdA) / (transition <= 0 ? 1 : transition));
    return {
      aOpacity: 1 - p,
      aScale: 1 + p * 0.4,
      bOpacity: p,
      bScale: 0.85 + p * 0.15,
    };
  }
  return { aOpacity: 0, aScale: 1.4, bOpacity: 1, bScale: 1 };
}

function TextMatchCutComponent({
  settings,
  currentTime,
}: {
  settings: TemplateSettings;
  bind: (id: string) => (el: HTMLElement | SVGElement | null) => void;
  currentTime: number;
}) {
  const frame = sampleMatchCut(
    currentTime,
    Number(settings.holdA),
    Number(settings.transitionDuration),
    String(settings.easing) as EasingName
  );
  const shared: React.CSSProperties = {
    fontSize: Number(settings.fontSize),
    fontWeight: 700,
    color: String(settings.color),
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <span style={{ ...shared, opacity: frame.aOpacity, transform: `scale(${frame.aScale})` }}>
        {String(settings.textA)}
      </span>
      <span style={{ ...shared, opacity: frame.bOpacity, transform: `scale(${frame.bScale})` }}>
        {String(settings.textB)}
      </span>
    </div>
  );
}

export const textMatchCutTemplate: MotionTemplate = {
  id: "text-match-cut",
  name: "Text Match Cut",
  category: "editorial",
  description: "One word holds, then punch-zooms into the next — a fast editorial match cut between two ideas.",
  tags: ["text", "match cut", "transition", "editorial"],
  style: ["Editorial", "Cinematic"],
  supportedFormats: ["9:16", "16:9", "1:1", "4:5"],
  controls: [
    { key: "textA", label: "First text", type: "text", group: "Text", default: "the problem" },
    { key: "textB", label: "Second text", type: "text", group: "Text", default: "the solution" },
    { key: "fontSize", label: "Font size", type: "slider", group: "Text", default: 64, min: 24, max: 160, step: 2 },
    { key: "color", label: "Color", type: "color", group: "Text", default: "#F4F5F7" },
    { key: "holdA", label: "Hold first", type: "slider", group: "Animation", default: 0.8, min: 0.3, max: 2, step: 0.05 },
    {
      key: "transitionDuration",
      label: "Transition speed",
      type: "slider",
      group: "Animation",
      default: 0.25,
      min: 0.1,
      max: 0.6,
      step: 0.01,
    },
    { key: "holdB", label: "Hold second", type: "slider", group: "Animation", default: 1, min: 0.3, max: 2, step: 0.05 },
    {
      key: "easing",
      label: "Easing",
      type: "select",
      group: "Advanced",
      default: "cubicIn",
      advanced: true,
      options: [
        { label: "Cubic In", value: "cubicIn" },
        { label: "Expo In", value: "expoIn" },
        { label: "Linear", value: "linear" },
      ],
    },
  ],
  render: (settings) => {
    const holdA = Number(settings.holdA);
    const transition = Number(settings.transitionDuration);
    const holdB = Number(settings.holdB);
    // Both text layers crossfade off currentTime directly (three distinct
    // phases with different scale targets per layer) — not a single-clip
    // transform the generic engine models — so no clips are registered.
    return { clips: [], totalDuration: holdA + transition + holdB };
  },
  Component: TextMatchCutComponent,
  drawFrame: (ctx, settings, t, size) => {
    const frame = sampleMatchCut(
      t,
      Number(settings.holdA),
      Number(settings.transitionDuration),
      String(settings.easing) as EasingName
    );
    ctx.save();
    ctx.font = `700 ${Number(settings.fontSize)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = String(settings.color);
    if (frame.aOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = frame.aOpacity;
      ctx.translate(size.width / 2, size.height / 2);
      ctx.scale(frame.aScale, frame.aScale);
      ctx.fillText(String(settings.textA), 0, 0);
      ctx.restore();
    }
    if (frame.bOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = frame.bOpacity;
      ctx.translate(size.width / 2, size.height / 2);
      ctx.scale(frame.bScale, frame.bScale);
      ctx.fillText(String(settings.textB), 0, 0);
      ctx.restore();
    }
    ctx.restore();
  },
};
