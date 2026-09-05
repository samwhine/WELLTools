/**
 * Easing System (spec §30)
 *
 * Every easing function takes t in [0, 1] and returns a progress value.
 * Values are not clamped here so overshoot easings (back/elastic) can
 * legitimately return <0 or >1 — callers interpolate accordingly.
 */

export type EasingFn = (t: number) => number;

const linear: EasingFn = (t) => t;

const quadIn: EasingFn = (t) => t * t;
const quadOut: EasingFn = (t) => 1 - (1 - t) * (1 - t);
const quadInOut: EasingFn = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const cubicIn: EasingFn = (t) => t * t * t;
const cubicOut: EasingFn = (t) => 1 - Math.pow(1 - t, 3);
const cubicInOut: EasingFn = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const quartIn: EasingFn = (t) => t * t * t * t;
const quartOut: EasingFn = (t) => 1 - Math.pow(1 - t, 4);
const quartInOut: EasingFn = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);

const quintIn: EasingFn = (t) => t * t * t * t * t;
const quintOut: EasingFn = (t) => 1 - Math.pow(1 - t, 5);
const quintInOut: EasingFn = (t) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2);

const expoIn: EasingFn = (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10));
const expoOut: EasingFn = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const expoInOut: EasingFn = (t) => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
};

const circIn: EasingFn = (t) => 1 - Math.sqrt(1 - Math.pow(t, 2));
const circOut: EasingFn = (t) => Math.sqrt(1 - Math.pow(t - 1, 2));
const circInOut: EasingFn = (t) =>
  t < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;

const BACK_C1 = 1.70158;
const BACK_C2 = BACK_C1 * 1.525;
const BACK_C3 = BACK_C1 + 1;
const backIn: EasingFn = (t) => BACK_C3 * t * t * t - BACK_C1 * t * t;
const backOut: EasingFn = (t) => 1 + BACK_C3 * Math.pow(t - 1, 3) + BACK_C1 * Math.pow(t - 1, 2);
const backInOut: EasingFn = (t) =>
  t < 0.5
    ? (Math.pow(2 * t, 2) * ((BACK_C2 + 1) * 2 * t - BACK_C2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((BACK_C2 + 1) * (t * 2 - 2) + BACK_C2) + 2) / 2;

const elastic: EasingFn = (t) => {
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

const bounceOut: EasingFn = (t) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};

export const easings = {
  linear,
  easeIn: quadIn,
  easeOut: quadOut,
  easeInOut: quadInOut,
  quadIn,
  quadOut,
  quadInOut,
  cubicIn,
  cubicOut,
  cubicInOut,
  quartIn,
  quartOut,
  quartInOut,
  quintIn,
  quintOut,
  quintInOut,
  expoIn,
  expoOut,
  expoInOut,
  circIn,
  circOut,
  circInOut,
  backIn,
  backOut,
  backInOut,
  elastic,
  bounce: bounceOut,
} as const;

export type EasingName = keyof typeof easings;

export function getEasing(name: EasingName | EasingFn): EasingFn {
  return typeof name === "function" ? name : easings[name];
}

/** CSS cubic-bezier strings for the handful of easings the Web Animations API needs verbatim. */
export const cssEasing: Partial<Record<EasingName, string>> = {
  linear: "linear",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  cubicIn: "cubic-bezier(0.55, 0, 1, 0.45)",
  cubicOut: "cubic-bezier(0.22, 1, 0.36, 1)",
  cubicInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  backOut: "cubic-bezier(0.34, 1.56, 0.64, 1)",
};
