import { Clip, Track, track } from "./keyframes";
import { EasingName } from "./easing";

/**
 * Animation Primitives (spec §28)
 *
 * Each primitive returns a Track (or set of Tracks) rather than a full Clip,
 * so templates compose primitives together into one Clip per element.
 * Distances/angles are expressed in the same units the renderer uses
 * (px for x/y, degrees for rotation, 0..1 for scale/opacity).
 */

export const fadeIn = (easing: EasingName = "easeOut"): Track => track("opacity", 0, 1, easing);
export const fadeOut = (easing: EasingName = "easeIn"): Track => track("opacity", 1, 0, easing);

export const slideIn = (from: number, axis: "x" | "y" = "y", easing: EasingName = "cubicOut"): Track =>
  track(axis, from, 0, easing);
export const slideOut = (to: number, axis: "x" | "y" = "y", easing: EasingName = "cubicIn"): Track =>
  track(axis, 0, to, easing);

export const scaleIn = (from = 0.85, easing: EasingName = "cubicOut"): Track => track("scale", from, 1, easing);
export const scaleOut = (to = 0.85, easing: EasingName = "cubicIn"): Track => track("scale", 1, to, easing);

export const rotateIn = (from = -8, easing: EasingName = "cubicOut"): Track => track("rotation", from, 0, easing);
export const rotateOut = (to = 8, easing: EasingName = "cubicIn"): Track => track("rotation", 0, to, easing);

export const blurIn = (from = 12, easing: EasingName = "cubicOut"): Track => track("blur", from, 0, easing);
export const blurOut = (to = 12, easing: EasingName = "cubicIn"): Track => track("blur", 0, to, easing);

/** Premium "settle" overshoot (spec §33): 0.92 -> 1.03 -> 1.00 */
export const spring = (): Track => ({
  property: "scale",
  keyframes: [
    { time: 0, value: 0.92 },
    { time: 0.7, value: 1.03, easing: "cubicOut" },
    { time: 1, value: 1.0, easing: "cubicOut" },
  ],
});

export const bounce = (): Track => ({
  property: "scale",
  keyframes: [
    { time: 0, value: 0 },
    { time: 1, value: 1, easing: "bounce" },
  ],
});

export const shake = (intensity = 8): Track => ({
  property: "x",
  keyframes: [
    { time: 0, value: 0 },
    { time: 0.15, value: -intensity, easing: "linear" },
    { time: 0.3, value: intensity, easing: "linear" },
    { time: 0.45, value: -intensity * 0.7, easing: "linear" },
    { time: 0.6, value: intensity * 0.7, easing: "linear" },
    { time: 0.8, value: -intensity * 0.3, easing: "linear" },
    { time: 1, value: 0, easing: "easeOut" },
  ],
});

export const stretch = (axis: "scaleX" | "scaleY" = "scaleX", amount = 1.3): Track => ({
  property: axis,
  keyframes: [
    { time: 0, value: 1 },
    { time: 0.4, value: amount, easing: "cubicOut" },
    { time: 1, value: 1, easing: "backOut" },
  ],
});

export const squash = (): Track => ({
  property: "scaleY",
  keyframes: [
    { time: 0, value: 1 },
    { time: 0.3, value: 0.7, easing: "cubicOut" },
    { time: 1, value: 1, easing: "elastic" },
  ],
});

export const glitch = (): Track => ({
  property: "x",
  keyframes: [
    { time: 0, value: 0 },
    { time: 0.1, value: -6, easing: "linear" },
    { time: 0.15, value: 4, easing: "linear" },
    { time: 0.2, value: 0, easing: "linear" },
    { time: 0.5, value: -3, easing: "linear" },
    { time: 0.55, value: 5, easing: "linear" },
    { time: 0.6, value: 0, easing: "linear" },
    { time: 1, value: 0, easing: "linear" },
  ],
});

export const flicker = (): Track => ({
  property: "opacity",
  keyframes: [
    { time: 0, value: 0 },
    { time: 0.1, value: 1, easing: "linear" },
    { time: 0.15, value: 0.2, easing: "linear" },
    { time: 0.2, value: 1, easing: "linear" },
    { time: 0.3, value: 0.4, easing: "linear" },
    { time: 0.4, value: 1, easing: "linear" },
    { time: 1, value: 1, easing: "linear" },
  ],
});

export const draw = (easing: EasingName = "cubicOut"): Track => track("strokeWidth", 0, 1, easing);

/** Build a full clip from a set of tracks, with duration/delay in seconds. */
export function makeClip(id: string, duration: number, tracksIn: Track[], delay = 0): Clip {
  return { id, duration, delay, tracks: tracksIn };
}
