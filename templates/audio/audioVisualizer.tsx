import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";

/**
 * Decorative bar visualizer (not driven by a real audio file — that's the
 * separate audio-analysis feature under Video Tools). Each bar follows a
 * sine wave with an integer harmonic per bar, so the whole thing loops
 * seamlessly over `duration` when the player repeats the timeline.
 */
function barHeight(index: number, seconds: number, duration: number) {
  const phase = index * 0.7;
  const harmonic = 1 + (index % 3); // integer -> exact loop at t = duration
  const angle = (seconds / duration) * Math.PI * 2 * harmonic + phase;
  return 0.25 + 0.75 * Math.abs(Math.sin(angle));
}

function AudioVisualizerComponent({
  settings,
  currentTime,
}: {
  settings: TemplateSettings;
  bind: (id: string) => (el: HTMLElement | SVGElement | null) => void;
  currentTime: number;
}) {
  const barCount = Number(settings.barCount);
  const duration = Number(settings.duration);
  const speed = Number(settings.speed);
  const bars = Array.from({ length: barCount }, (_, i) => barHeight(i, currentTime * speed, duration));

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden px-10">
      <div className="flex h-[45%] w-full items-end justify-center gap-[6px]">
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: `${100 / (barCount * 1.6)}%`,
              height: `${h * 100}%`,
              background: String(settings.color),
              borderRadius: 999,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export const audioVisualizerTemplate: MotionTemplate = {
  id: "audio-visualizer",
  name: "Basic Audio Visualizer",
  category: "audio",
  description: "A looping bar visualizer for music overlays — decorative motion, not tied to a specific audio file.",
  tags: ["audio", "visualizer", "bars", "music", "waveform"],
  style: ["Minimal", "Digital"],
  supportedFormats: ["9:16", "16:9", "1:1", "4:5"],
  controls: [
    { key: "barCount", label: "Bar count", type: "slider", group: "Style", default: 16, min: 8, max: 32, step: 1 },
    { key: "color", label: "Color", type: "color", group: "Style", default: "#5B8CFF" },
    { key: "duration", label: "Loop length", type: "slider", group: "Animation", default: 1.2, min: 0.6, max: 3, step: 0.1 },
    { key: "speed", label: "Speed", type: "slider", group: "Animation", default: 1, min: 0.5, max: 3, step: 0.1 },
  ],
  render: (settings) => {
    const duration = Number(settings.duration);
    // Purely decorative and time-driven — every bar is derived straight
    // from currentTime each frame, so no transform clips are needed.
    return { clips: [], totalDuration: duration };
  },
  Component: AudioVisualizerComponent,
  drawFrame: (ctx, settings, t, size) => {
    const barCount = Number(settings.barCount);
    const duration = Number(settings.duration);
    const speed = Number(settings.speed);
    const gap = 6;
    const areaWidth = size.width * 0.8;
    const barWidth = areaWidth / (barCount * 1.6);
    const totalWidth = barCount * barWidth + (barCount - 1) * gap;
    const startX = (size.width - totalWidth) / 2;
    const baseY = size.height / 2 + size.height * 0.225;
    const maxH = size.height * 0.45;

    ctx.save();
    ctx.fillStyle = String(settings.color);
    for (let i = 0; i < barCount; i++) {
      const h = barHeight(i, t * speed, duration) * maxH;
      const x = startX + i * (barWidth + gap);
      const y = baseY - h;
      const r = Math.min(barWidth / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + barWidth, y, x + barWidth, y + h, r);
      ctx.arcTo(x + barWidth, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + barWidth, y, r);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  },
};
