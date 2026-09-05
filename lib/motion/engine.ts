import { Clip, sampleClip, SampledFrame } from "./keyframes";

export type ElementBinding = {
  el: HTMLElement | SVGElement;
  clip: Clip;
};

export type PlayerState = "idle" | "playing" | "paused" | "complete";

export type MotionPlayerOptions = {
  duration: number; // total timeline duration in seconds
  loop?: boolean;
  onTick?: (seconds: number) => void;
  onStateChange?: (state: PlayerState) => void;
};

/**
 * MotionPlayer drives a requestAnimationFrame loop and, on every frame,
 * samples each bound clip and writes the result straight to the element's
 * style (transform/opacity/filter) — never through React state — so
 * previews stay smooth even with many animated elements (spec §39, §60).
 */
export class MotionPlayer {
  private bindings: ElementBinding[] = [];
  private rafId: number | null = null;
  private startTs: number | null = null;
  private elapsed = 0; // seconds, preserved across pause/resume
  private _state: PlayerState = "idle";
  private options: MotionPlayerOptions;

  constructor(options: MotionPlayerOptions) {
    this.options = options;
  }

  get state() {
    return this._state;
  }

  get currentTime() {
    return this.elapsed;
  }

  bind(el: HTMLElement | SVGElement | null, clip: Clip) {
    if (!el) return;
    // Replace existing binding for this element/clip id if present.
    this.bindings = this.bindings.filter((b) => b.clip.id !== clip.id);
    this.bindings.push({ el, clip });
  }

  unbind(clipId: string) {
    this.bindings = this.bindings.filter((b) => b.clip.id !== clipId);
  }

  play() {
    if (this._state === "playing") return;
    this.setState("playing");
    this.startTs = performance.now() - this.elapsed * 1000;
    const step = (ts: number) => {
      if (this.startTs === null) return;
      this.elapsed = (ts - this.startTs) / 1000;
      if (this.elapsed >= this.options.duration) {
        if (this.options.loop) {
          this.startTs = ts;
          this.elapsed = 0;
        } else {
          this.elapsed = this.options.duration;
          this.applyFrame();
          this.options.onTick?.(this.elapsed);
          this.setState("complete");
          this.rafId = null;
          return;
        }
      }
      this.applyFrame();
      this.options.onTick?.(this.elapsed);
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  pause() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.setState("paused");
  }

  seek(seconds: number) {
    this.elapsed = Math.min(this.options.duration, Math.max(0, seconds));
    this.startTs = performance.now() - this.elapsed * 1000;
    this.applyFrame();
    this.options.onTick?.(this.elapsed);
  }

  restart() {
    this.elapsed = 0;
    this.applyFrame();
    this.play();
  }

  destroy() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.bindings = [];
  }

  private setState(s: PlayerState) {
    this._state = s;
    this.options.onStateChange?.(s);
  }

  private applyFrame() {
    for (const { el, clip } of this.bindings) {
      const frame = sampleClip(clip, this.elapsed);
      applyFrameToElement(el, frame);
    }
  }
}

/** Writes a sampled frame to an element using only transform/opacity/filter (GPU-friendly, spec §39). */
export function applyFrameToElement(el: HTMLElement | SVGElement, frame: SampledFrame) {
  const x = frame.x ?? 0;
  const y = frame.y ?? 0;
  const scale = frame.scale ?? 1;
  const scaleX = frame.scaleX ?? scale;
  const scaleY = frame.scaleY ?? scale;
  const rotation = frame.rotation ?? 0;
  const skew = frame.skew ?? 0;
  const opacity = frame.opacity ?? 1;
  const blur = frame.blur ?? 0;

  const transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) skew(${skew}deg) scale(${scaleX}, ${scaleY})`;
  (el as HTMLElement).style.transform = transform;
  (el as HTMLElement).style.opacity = String(opacity);
  if (blur) (el as HTMLElement).style.filter = `blur(${blur}px)`;
  else (el as HTMLElement).style.filter = "";

  if (frame.color && "style" in el) {
    (el as HTMLElement).style.color = String(frame.color);
  }
  if (frame.fontSize !== undefined && "style" in el) {
    (el as HTMLElement).style.fontSize = `${frame.fontSize}px`;
  }
  if (frame.tracking !== undefined && "style" in el) {
    (el as HTMLElement).style.letterSpacing = `${frame.tracking}px`;
  }
}
