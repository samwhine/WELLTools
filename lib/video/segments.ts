/**
 * Edit Decision List (spec §51)
 * Analysis produces this; export consumes it. The user can edit it in
 * between without re-running analysis.
 */
export type Segment = {
  start: number; // seconds
  end: number; // seconds
  type: "keep" | "cut";
};

export function totalDuration(segments: Segment[]): number {
  if (segments.length === 0) return 0;
  return Math.max(...segments.map((s) => s.end));
}

export function keptDuration(segments: Segment[]): number {
  return segments.filter((s) => s.type === "keep").reduce((sum, s) => sum + (s.end - s.start), 0);
}

export function cutDuration(segments: Segment[]): number {
  return segments.filter((s) => s.type === "cut").reduce((sum, s) => sum + (s.end - s.start), 0);
}

/** Flip a single segment between keep/cut (spec §52 "Restore segment" / "Exclude cut"). */
export function toggleSegment(segments: Segment[], index: number): Segment[] {
  return segments.map((s, i) => (i === index ? { ...s, type: s.type === "keep" ? "cut" : "keep" } : s));
}

/** Merge adjacent segments of the same type, dropping zero-length ones. */
export function normalizeSegments(segments: Segment[]): Segment[] {
  const sorted = [...segments].filter((s) => s.end > s.start).sort((a, b) => a.start - b.start);
  const out: Segment[] = [];
  for (const seg of sorted) {
    const last = out[out.length - 1];
    if (last && last.type === seg.type && Math.abs(last.end - seg.start) < 1e-6) {
      last.end = seg.end;
    } else {
      out.push({ ...seg });
    }
  }
  return out;
}

/** Apply padding around cut segments, shrinking them so a little audio survives at each edge. */
export function applyPadding(segments: Segment[], paddingBefore: number, paddingAfter: number): Segment[] {
  return normalizeSegments(
    segments.map((s) =>
      s.type === "cut"
        ? { ...s, start: s.start + paddingBefore, end: Math.max(s.start + paddingBefore, s.end - paddingAfter) }
        : s
    )
  );
}
