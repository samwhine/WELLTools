"use client";

/**
 * Lazy-loaded FFmpeg.wasm client (spec §54).
 *
 * @ffmpeg/ffmpeg v0.12's FFmpeg class already runs the core off the main
 * thread via its own internal Web Worker, so the UI stays responsive without
 * us hand-rolling a worker/message-passing layer. Nothing here imports
 * @ffmpeg/ffmpeg at module scope — the ~30MB core is only fetched the first
 * time getFFmpeg() is actually called, never on initial page load.
 */

let ffmpegPromise: Promise<any> | null = null;

export async function getFFmpeg(onLog?: (message: string) => void) {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      if (onLog) {
        ffmpeg.on("log", ({ message }: { message: string }) => onLog(message));
      }
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      return ffmpeg;
    })();
  }
  return ffmpegPromise;
}

export function isFFmpegLoaded() {
  return ffmpegPromise !== null;
}
