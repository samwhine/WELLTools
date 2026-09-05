import { analyzeRmsWindows } from "./analyzer";
import { Segment, normalizeSegments, applyPadding } from "@/lib/video/segments";

export type SilenceDetectionOptions = {
  thresholdDb: number; // e.g. -35
  minSilenceMs: number; // e.g. 500
  paddingBeforeMs: number; // e.g. 100
  paddingAfterMs: number; // e.g. 100
  windowMs?: number; // RMS analysis window, default 20ms
};

export const DEFAULT_SILENCE_OPTIONS: SilenceDetectionOptions = {
  thresholdDb: -35,
  minSilenceMs: 500,
  paddingBeforeMs: 100,
  paddingAfterMs: 100,
};

/**
 * RMS/amplitude-based silence detection (spec §50). No AI/ML — just
 * windowed RMS compared to a dB threshold, fast enough to run fully
 * client-side on files well into the tens of minutes.
 */
export function detectSilence(
  buffer: AudioBuffer,
  options: SilenceDetectionOptions = DEFAULT_SILENCE_OPTIONS
): Segment[] {
  const { thresholdDb, minSilenceMs, paddingBeforeMs, paddingAfterMs, windowMs = 20 } = options;
  const windows = analyzeRmsWindows(buffer, windowMs);

  // Merge consecutive below-threshold windows into raw silence spans.
  const rawSilence: Segment[] = [];
  let current: Segment | null = null;
  for (const w of windows) {
    const isSilent = w.db < thresholdDb;
    if (isSilent) {
      if (current) current.end = w.end;
      else current = { start: w.start, end: w.end, type: "cut" };
    } else if (current) {
      rawSilence.push(current);
      current = null;
    }
  }
  if (current) rawSilence.push(current);

  const minSilenceSec = minSilenceMs / 1000;
  const silence = rawSilence.filter((s) => s.end - s.start >= minSilenceSec);

  const duration = buffer.length / buffer.sampleRate;
  const segments: Segment[] = [];
  let cursor = 0;
  for (const s of silence) {
    if (s.start > cursor) segments.push({ start: cursor, end: s.start, type: "keep" });
    segments.push({ start: s.start, end: s.end, type: "cut" });
    cursor = s.end;
  }
  if (cursor < duration) segments.push({ start: cursor, end: duration, type: "keep" });

  return applyPadding(normalizeSegments(segments), paddingBeforeMs / 1000, paddingAfterMs / 1000);
}
