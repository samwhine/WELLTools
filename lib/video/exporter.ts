"use client";

import { getFFmpeg } from "@/lib/ffmpeg/worker";
import { Segment } from "./segments";

export type VideoExportState =
  | "idle"
  | "preparing"
  | "processing"
  | "encoding"
  | "finalizing"
  | "complete"
  | "error"
  | "cancelled";

export type VideoExportProgress = {
  state: VideoExportState;
  progress: number; // 0..100
  detail: string;
  url?: string;
  error?: string;
};

export type VideoExportHandle = { cancel: () => void };

/**
 * Cuts a video down to only its "keep" segments and re-encodes it as MP4
 * (spec §48-49, §51). Runs entirely client-side via FFmpeg.wasm — the file
 * never leaves the browser (spec §08, §72).
 */
export function exportTrimmedVideo(
  file: File,
  segments: Segment[],
  onProgress: (p: VideoExportProgress) => void
): VideoExportHandle {
  let cancelled = false;

  (async () => {
    try {
      onProgress({ state: "preparing", progress: 2, detail: "Loading the video engine…" });
      const ffmpeg = await getFFmpeg();
      if (cancelled) return;

      ffmpeg.on("progress", ({ progress }: { progress: number }) => {
        if (cancelled) return;
        onProgress({
          state: "encoding",
          progress: Math.min(97, Math.round(10 + progress * 85)),
          detail: `Encoding video… ${Math.round(progress * 100)}%`,
        });
      });

      onProgress({ state: "preparing", progress: 8, detail: "Reading the file…" });
      const { fetchFile } = await import("@ffmpeg/util");
      const inputName = "input" + extOf(file.name);
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      if (cancelled) return;

      const keep = segments.filter((s) => s.type === "keep" && s.end > s.start);
      if (keep.length === 0) {
        onProgress({ state: "error", progress: 0, detail: "", error: "Nothing left to export — every segment is cut." });
        return;
      }

      onProgress({ state: "processing", progress: 10, detail: "Trimming kept segments…" });
      const partNames: string[] = [];
      for (let i = 0; i < keep.length; i++) {
        if (cancelled) return;
        // Safe: loop condition `i < keep.length` guarantees this index exists.
        const seg = keep[i]!;
        const partName = `part${i}.mp4`;
        await ffmpeg.exec([
          "-i",
          inputName,
          "-ss",
          seg.start.toFixed(3),
          "-to",
          seg.end.toFixed(3),
          "-c",
          "copy",
          "-avoid_negative_ts",
          "make_zero",
          partName,
        ]);
        partNames.push(partName);
        onProgress({
          state: "processing",
          progress: 10 + Math.round(((i + 1) / keep.length) * 10),
          detail: `Trimming segment ${i + 1} / ${keep.length}…`,
        });
      }

      if (cancelled) return;

      const concatList = partNames.map((n) => `file '${n}'`).join("\n");
      await ffmpeg.writeFile("concat.txt", concatList);

      onProgress({ state: "encoding", progress: 25, detail: "Merging segments…" });
      const outputName = "output.mp4";
      await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "concat.txt", "-c", "copy", outputName]);
      if (cancelled) return;

      onProgress({ state: "finalizing", progress: 98, detail: "Building the file…" });
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      // Clean up virtual filesystem entries.
      for (const n of [inputName, ...partNames, "concat.txt", outputName]) {
        try {
          await ffmpeg.deleteFile(n);
        } catch {
          /* best effort */
        }
      }

      onProgress({ state: "complete", progress: 100, detail: "", url });
    } catch (err) {
      if (cancelled) {
        onProgress({ state: "cancelled", progress: 0, detail: "" });
        return;
      }
      onProgress({
        state: "error",
        progress: 0,
        detail: "",
        error:
          "We couldn't process this video. The file may be too large or use a format your browser can't process. Try a smaller MP4 file.",
      });
    }
  })();

  return {
    cancel: () => {
      cancelled = true;
    },
  };
}

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? ".mp4" : name.slice(i);
}
