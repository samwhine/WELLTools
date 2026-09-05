/**
 * Stagger System (spec §34)
 * Produces a per-index delay (seconds) so character/word/line/element groups
 * animate in sequence rather than simultaneously.
 */
export type StaggerUnit = "character" | "word" | "line" | "element";

export type StaggerConfig = {
  unit: StaggerUnit;
  amount: number; // seconds between each item, e.g. 0.05 = 50ms
  from?: "first" | "last" | "center";
};

export function staggerDelays(count: number, config: StaggerConfig): number[] {
  const { amount, from = "first" } = config;
  const indices = Array.from({ length: count }, (_, i) => i);

  const order = (i: number): number => {
    if (from === "first") return i;
    if (from === "last") return count - 1 - i;
    // center: distance from the middle index
    const mid = (count - 1) / 2;
    return Math.abs(i - mid);
  };

  return indices.map((i) => order(i) * amount);
}

/** Split text into the units a stagger can be applied to. */
export function splitText(text: string, unit: StaggerUnit): string[] {
  switch (unit) {
    case "character":
      return Array.from(text);
    case "word":
      return text.split(/(\s+)/).filter((s) => s.length > 0);
    case "line":
      return text.split("\n");
    default:
      return [text];
  }
}
