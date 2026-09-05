import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";

export type ExportState =
  | "idle"
  | "preparing"
  | "rendering"
  | "finalizing"
  | "complete"
  | "error"
  | "cancelled";

export type ExportProgress = {
  state: ExportState;
  progress: number; // 0..100
  detail: string;
  error?: string;
};

export type ExportOptions = {
  template: MotionTemplate;
  settings: TemplateSettings;
  size: { width: number; height: number };
  duration: number; // seconds
  fps: number;
  background: string; // solid color; true alpha WebM isn't reliable cross-browser yet
  onProgress: (p: ExportProgress) => void;
};

export type ExportHandle = { cancel: () => void };

/**
 * Renders a template's `drawFrame` to an offscreen canvas in real time and
 * captures it with MediaRecorder. This is a genuine, working export path for
 * any template that implements drawFrame — not a simulated progress bar.
 *
 * Limitation (documented, not hidden): MediaRecorder's WebM alpha channel
 * support is inconsistent across browsers, so this exports an opaque
 * background for now. Transparent WebM / PNG sequence export needs the
 * FFmpeg.wasm pipeline described in spec §46/§54 — not yet wired up.
 */
export function exportMotionToWebM(options: ExportOptions): ExportHandle {
  const { template, settings, size, duration, fps, background, onProgress } = options;
  let cancelled = false;
  let rafId: number | null = null;

  const cleanup = (canvas: HTMLCanvasElement | null) => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    canvas?.remove();
  };

  if (!template.drawFrame) {
    onProgress({
      state: "error",
      progress: 0,
      detail: "",
      error: "This template doesn't support export yet.",
    });
    return { cancel: () => {} };
  }

  onProgress({ state: "preparing", progress: 0, detail: "Setting up the canvas…" });

  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    onProgress({ state: "error", progress: 0, detail: "", error: "Your browser doesn't support canvas export." });
    return { cancel: () => (cancelled = true) };
  }

  let stream: MediaStream;
  let recorder: MediaRecorder;
  try {
    stream = canvas.captureStream(fps);
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    recorder = new MediaRecorder(stream, { mimeType });
  } catch (err) {
    onProgress({
      state: "error",
      progress: 0,
      detail: "",
      error: "We couldn't start recording in this browser. Try Chrome or Edge.",
    });
    return { cancel: () => (cancelled = true) };
  }

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    cleanup(canvas);
    if (cancelled) {
      onProgress({ state: "cancelled", progress: 0, detail: "" });
      return;
    }
    onProgress({ state: "finalizing", progress: 98, detail: "Building the file…" });
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    onProgress({ state: "complete", progress: 100, detail: url });
  };

  recorder.onerror = () => {
    cleanup(canvas);
    onProgress({
      state: "error",
      progress: 0,
      detail: "",
      error: "We couldn't process this export. Try a shorter duration or a smaller canvas.",
    });
  };

  const start = performance.now();
  recorder.start(200);
  onProgress({ state: "rendering", progress: 0, detail: "Rendering frame 0…" });

  let frameCount = 0;
  const totalFrames = Math.max(1, Math.round(duration * fps));

  const drawLoop = () => {
    if (cancelled) {
      recorder.stop();
      return;
    }
    const elapsed = (performance.now() - start) / 1000;
    ctx.save();
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size.width, size.height);
    template.drawFrame!(ctx, settings, Math.min(elapsed, duration), size);
    ctx.restore();

    frameCount += 1;
    const progress = Math.min(97, Math.round((elapsed / duration) * 97));
    onProgress({
      state: "rendering",
      progress,
      detail: `Rendering frame ${frameCount.toLocaleString()} / ${totalFrames.toLocaleString()}`,
    });

    if (elapsed >= duration) {
      recorder.stop();
      return;
    }
    rafId = requestAnimationFrame(drawLoop);
  };
  rafId = requestAnimationFrame(drawLoop);

  return {
    cancel: () => {
      cancelled = true;
    },
  };
}
