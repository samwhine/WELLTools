import { EasingName, EasingFn, getEasing } from "./easing";

/**
 * Keyframe System (spec §29)
 */
export type Keyframe<T = number> = {
  time: number; // 0..1 normalized position within the track's duration
  value: T;
  easing?: EasingName | EasingFn; // easing applied on the segment LEADING UP TO this keyframe
};

export type AnimatableProperty =
  | "x"
  | "y"
  | "scale"
  | "scaleX"
  | "scaleY"
  | "rotation"
  | "opacity"
  | "blur"
  | "skew"
  | "tracking"
  | "fontSize"
  | "strokeWidth"
  | "color";

export type Track = {
  property: AnimatableProperty;
  keyframes: Keyframe<any>[];
};

export type Clip = {
  id: string;
  duration: number; // seconds
  delay?: number; // seconds
  tracks: Track[];
};

function lerpNumber(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function isColor(v: unknown): v is string {
  return typeof v === "string" && (v.startsWith("#") || v.startsWith("rgb") || v.startsWith("hsl"));
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const int = parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(lerpNumber(r1, r2, t));
  const g = Math.round(lerpNumber(g1, g2, t));
  const bl = Math.round(lerpNumber(b1, b2, t));
  return `rgb(${r}, ${g}, ${bl})`;
}

/**
 * Sample a single track at normalized time t (0..1 of the clip's duration).
 * Finds the surrounding keyframe pair, applies the leading keyframe's easing,
 * and interpolates (numeric or color).
 */
export function sampleTrack(track: Track, t: number): number | string {
  const kfs = track.keyframes;
  if (kfs.length === 0) return 0;
  if (kfs.length === 1) return kfs[0]!.value;

  const clamped = Math.min(1, Math.max(0, t));

  // Find segment [prev, next] surrounding `clamped`.
  // Indices below are always in bounds: we've already returned above for
  // length 0/1, so kfs[0] and kfs[kfs.length - 1] exist here, and the loop
  // condition `i < kfs.length - 1` guarantees kfs[i + 1] exists too.
  let prev = kfs[0]!;
  let next = kfs[kfs.length - 1]!;
  for (let i = 0; i < kfs.length - 1; i++) {
    if (clamped >= kfs[i]!.time && clamped <= kfs[i + 1]!.time) {
      prev = kfs[i]!;
      next = kfs[i + 1]!;
      break;
    }
  }

  const span = next.time - prev.time;
  const localT = span === 0 ? 1 : (clamped - prev.time) / span;
  const ease = getEasing(next.easing ?? "linear");
  const eased = ease(localT);

  if (isColor(prev.value) && isColor(next.value)) {
    return lerpColor(prev.value, next.value, eased);
  }
  return lerpNumber(Number(prev.value), Number(next.value), eased);
}

export type SampledFrame = Partial<Record<AnimatableProperty, number | string>>;

/** Sample every track in a clip at absolute time `seconds` since the clip started. */
export function sampleClip(clip: Clip, seconds: number): SampledFrame {
  const delay = clip.delay ?? 0;
  const local = seconds - delay;
  const t = clip.duration <= 0 ? 1 : local / clip.duration;
  const out: SampledFrame = {};
  if (local < 0) {
    // Not started yet: hold first keyframe of each track.
    for (const track of clip.tracks) {
      out[track.property] = track.keyframes[0]?.value ?? 0;
    }
    return out;
  }
  for (const track of clip.tracks) {
    out[track.property] = sampleTrack(track, t);
  }
  return out;
}

/** Convenience: build a two-keyframe track (the common case) with one easing. */
export function track(
  property: AnimatableProperty,
  from: number | string,
  to: number | string,
  easing: EasingName | EasingFn = "cubicOut"
): Track {
  return {
    property,
    keyframes: [
      { time: 0, value: from },
      { time: 1, value: to, easing },
    ],
  };
}
