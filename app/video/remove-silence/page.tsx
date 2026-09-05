"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Play, Pause, X } from "lucide-react";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { RemoveSilenceTimeline } from "@/components/timeline/RemoveSilenceTimeline";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassSlider } from "@/components/glass/GlassSlider";
import { GlassProgress } from "@/components/glass/GlassProgress";
import { decodeAudio } from "@/lib/audio/analyzer";
import { detectSilence, DEFAULT_SILENCE_OPTIONS, SilenceDetectionOptions } from "@/lib/audio/silence-detector";
import { Segment, keptDuration, totalDuration, toggleSegment } from "@/lib/video/segments";
import { exportTrimmedVideo, VideoExportProgress, VideoExportHandle } from "@/lib/video/exporter";

const MAX_RECOMMENDED_MB = 500;

export default function RemoveSilencePage() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [options, setOptions] = useState<SilenceDetectionOptions>(DEFAULT_SILENCE_OPTIONS);
  const [status, setStatus] = useState<"idle" | "analyzing" | "ready" | "error">("idle");
  const [statusDetail, setStatusDetail] = useState("");
  const [warning, setWarning] = useState<string | null>(null);

  const [exportProgress, setExportProgress] = useState<VideoExportProgress>({ state: "idle", progress: 0, detail: "" });
  const exportHandleRef = useRef<VideoExportHandle | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const handleFile = async (f: File) => {
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
    setSegments([]);
    setStatus("analyzing");
    setStatusDetail("Reading the file…");
    setWarning(f.size > MAX_RECOMMENDED_MB * 1024 * 1024 ? `This file is over ${MAX_RECOMMENDED_MB}MB — processing may use a lot of memory on this device.` : null);

    try {
      setStatusDetail("Analyzing audio…");
      const buffer = await decodeAudio(f);
      setAudioBuffer(buffer);
      setStatusDetail("Detecting silent sections…");
      const detected = detectSilence(buffer, options);
      setSegments(detected);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setStatusDetail("We couldn't analyze this file's audio. Try a different format.");
    }
  };

  // Re-run detection (cheap, no re-decode) whenever controls change.
  useEffect(() => {
    if (!audioBuffer) return;
    setSegments(detectSilence(audioBuffer, options));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.thresholdDb, options.minSilenceMs, options.paddingBeforeMs, options.paddingAfterMs]);

  // Live preview: skip over "cut" segments while the video plays, so the
  // person can hear the edit before ever exporting (spec §53).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let raf: number;
    const tick = () => {
      const cut = segments.find((s) => s.type === "cut" && video.currentTime >= s.start && video.currentTime < s.end);
      if (cut) video.currentTime = cut.end;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [segments]);

  const duration = totalDuration(segments);
  const newDuration = keptDuration(segments);

  const startExport = () => {
    if (!file) return;
    exportHandleRef.current = exportTrimmedVideo(file, segments, setExportProgress);
  };
  const cancelExport = () => exportHandleRef.current?.cancel();

  const busy = ["preparing", "processing", "encoding", "finalizing"].includes(exportProgress.state);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Remove Silence</h1>
        <p className="text-ink-muted">Cut dead air automatically, adjust the result, then export.</p>
      </div>

      {!file ? (
        <FileDropzone accept="video/*" onFile={handleFile} hint="MP4, MOV, or WebM — recommended up to 500MB / 30 minutes" />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-4">
            <LiquidGlass level="subtle" className="overflow-hidden p-0">
              {videoUrl && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls={false}
                  className="w-full bg-black"
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                />
              )}
            </LiquidGlass>

            <LiquidGlass level="subtle" className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-3">
                <GlassButton
                  variant="glass"
                  size="icon"
                  onClick={() => (playing ? videoRef.current?.pause() : videoRef.current?.play())}
                  disabled={status !== "ready"}
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </GlassButton>
                <span className="text-xs text-ink-faint">
                  {status === "analyzing" ? statusDetail : "Preview skips cut sections automatically"}
                </span>
              </div>

              {status === "ready" && (
                <>
                  <RemoveSilenceTimeline
                    segments={segments}
                    duration={duration}
                    onToggle={(i) => setSegments((prev) => toggleSegment(prev, i))}
                  />
                  <div className="flex gap-6 text-xs text-ink-faint">
                    <span>Original: {duration.toFixed(1)}s</span>
                    <span>New: {newDuration.toFixed(1)}s</span>
                    <span>Removed: {(duration - newDuration).toFixed(1)}s</span>
                  </div>
                </>
              )}
              {status === "error" && <p className="text-sm text-ink">{statusDetail}</p>}
            </LiquidGlass>

            {warning && (
              <p className="text-xs text-ink-faint">{warning} — we won&rsquo;t reject the file, just flagging it.</p>
            )}
          </div>

          <LiquidGlass level="subtle" className="flex h-fit flex-col gap-6 p-5">
            <div className="flex flex-col gap-4">
              <div className="text-xs font-medium uppercase tracking-wide text-ink-faint">Detection</div>
              <GlassSlider
                label="Silence threshold"
                value={options.thresholdDb}
                min={-60}
                max={-10}
                step={1}
                unit=" dB"
                onChange={(v) => setOptions((o) => ({ ...o, thresholdDb: v }))}
              />
              <GlassSlider
                label="Minimum silence"
                value={options.minSilenceMs}
                min={100}
                max={2000}
                step={50}
                unit="ms"
                onChange={(v) => setOptions((o) => ({ ...o, minSilenceMs: v }))}
              />
              <GlassSlider
                label="Padding before"
                value={options.paddingBeforeMs}
                min={0}
                max={500}
                step={10}
                unit="ms"
                onChange={(v) => setOptions((o) => ({ ...o, paddingBeforeMs: v }))}
              />
              <GlassSlider
                label="Padding after"
                value={options.paddingAfterMs}
                min={0}
                max={500}
                step={10}
                unit="ms"
                onChange={(v) => setOptions((o) => ({ ...o, paddingAfterMs: v }))}
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-line pt-5">
              <div className="text-xs font-medium uppercase tracking-wide text-ink-faint">Export</div>

              {exportProgress.state === "idle" || exportProgress.state === "cancelled" ? (
                <GlassButton variant="primary" onClick={startExport} disabled={status !== "ready"}>
                  <Download className="h-4 w-4" />
                  Export MP4
                </GlassButton>
              ) : busy ? (
                <div className="flex flex-col gap-3">
                  <GlassProgress
                    value={exportProgress.progress}
                    label={exportProgress.state === "encoding" ? "Encoding" : "Processing"}
                    detail={exportProgress.detail}
                  />
                  <GlassButton variant="ghost" size="sm" onClick={cancelExport} className="self-start">
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </GlassButton>
                </div>
              ) : exportProgress.state === "complete" ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-ink">Your video is ready.</p>
                  <a href={exportProgress.url} download={`${file.name.replace(/\.[^.]+$/, "")}-trimmed.mp4`}>
                    <GlassButton variant="primary">
                      <Download className="h-4 w-4" />
                      Download MP4
                    </GlassButton>
                  </a>
                </div>
              ) : exportProgress.state === "error" ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-ink">We couldn&rsquo;t process this video.</p>
                  <p className="text-xs text-ink-faint">{exportProgress.error}</p>
                  <GlassButton variant="glass" size="sm" onClick={() => setExportProgress({ state: "idle", progress: 0, detail: "" })}>
                    Try again
                  </GlassButton>
                </div>
              ) : null}
            </div>
          </LiquidGlass>
        </div>
      )}
    </div>
  );
}
