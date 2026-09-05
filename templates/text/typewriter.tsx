import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";

function TypewriterComponent({
  settings,
  currentTime,
}: {
  settings: TemplateSettings;
  bind: (id: string) => (el: HTMLElement | SVGElement | null) => void;
  currentTime: number;
}) {
  const text = String(settings.text);
  const charsPerSecond = Number(settings.speed);
  const delay = Number(settings.delay);
  const visibleCount = Math.max(0, Math.floor((currentTime - delay) * charsPerSecond));
  const visible = text.slice(0, Math.min(text.length, visibleCount));
  const done = visibleCount >= text.length;

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden px-10">
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: Number(settings.fontSize),
          color: String(settings.color),
          whiteSpace: "pre-wrap",
        }}
      >
        {visible}
        <span
          style={{
            display: "inline-block",
            width: "0.5ch",
            marginLeft: 2,
            background: String(settings.color),
            opacity: done ? (Math.floor(currentTime * 2) % 2 === 0 ? 1 : 0) : 1,
          }}
        >
          &nbsp;
        </span>
      </div>
    </div>
  );
}

export const typewriterTemplate: MotionTemplate = {
  id: "typewriter",
  name: "Typewriter",
  category: "text",
  description: "Characters appear one at a time with a blinking cursor, like text being typed live.",
  tags: ["text", "typewriter", "terminal", "kinetic typography"],
  style: ["Retro", "Digital"],
  supportedFormats: ["9:16", "16:9", "1:1", "4:5"],
  controls: [
    { key: "text", label: "Text", type: "text", group: "Text", default: "Typing this out, one letter at a time." },
    { key: "fontSize", label: "Font size", type: "slider", group: "Text", default: 44, min: 18, max: 96, step: 2 },
    { key: "color", label: "Color", type: "color", group: "Text", default: "#8FFFA0" },
    { key: "speed", label: "Characters / second", type: "slider", group: "Animation", default: 18, min: 4, max: 40, step: 1 },
    { key: "delay", label: "Delay", type: "slider", group: "Animation", default: 0.1, min: 0, max: 1.5, step: 0.05 },
  ],
  render: (settings) => {
    const text = String(settings.text);
    const speed = Number(settings.speed);
    const delay = Number(settings.delay);
    const totalDuration = delay + text.length / speed + 1;
    // No transform/opacity clips needed — the component derives its own
    // render straight from currentTime — but a zero-length clip keeps the
    // player timeline length consistent with the other templates.
    return { clips: [], totalDuration };
  },
  Component: TypewriterComponent,
  drawFrame: (ctx, settings, t, size) => {
    const text = String(settings.text);
    const speed = Number(settings.speed);
    const delay = Number(settings.delay);
    const visibleCount = Math.max(0, Math.floor((t - delay) * speed));
    const visible = text.slice(0, Math.min(text.length, visibleCount));
    ctx.save();
    ctx.fillStyle = String(settings.color);
    ctx.font = `${Number(settings.fontSize)}px "IBM Plex Mono", ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(visible, size.width / 2, size.height / 2);
    ctx.restore();
  },
};
