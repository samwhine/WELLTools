/** Decode a File/Blob's audio track into an AudioBuffer using the Web Audio API. */
export async function decodeAudio(file: File | Blob): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx: AudioContext = new AudioCtx();
  try {
    return await ctx.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    ctx.close();
  }
}

export type RmsWindow = { start: number; end: number; db: number };

function rmsToDb(rms: number): number {
  if (rms <= 0) return -Infinity;
  return 20 * Math.log10(rms);
}

/** Mix an AudioBuffer down to mono and compute RMS (in dB) over fixed-size windows. */
export function analyzeRmsWindows(buffer: AudioBuffer, windowMs = 20): RmsWindow[] {
  const sampleRate = buffer.sampleRate;
  const windowSize = Math.max(1, Math.round((windowMs / 1000) * sampleRate));
  const channelCount = buffer.numberOfChannels;
  const length = buffer.length;

  const mono = new Float32Array(length);
  for (let c = 0; c < channelCount; c++) {
    const data = buffer.getChannelData(c);
    // Indices are always in bounds here (i < length, and both arrays are
    // fixed-length Float32Arrays of size `length`), so the non-null
    // assertion just works around TS's noUncheckedIndexedAccess being
    // overly conservative for dense typed arrays.
    for (let i = 0; i < length; i++) mono[i]! += data[i]! / channelCount;
  }

  const windows: RmsWindow[] = [];
  for (let i = 0; i < length; i += windowSize) {
    const end = Math.min(length, i + windowSize);
    let sumSquares = 0;
    for (let j = i; j < end; j++) sumSquares += mono[j]! * mono[j]!;
    const rms = Math.sqrt(sumSquares / (end - i));
    windows.push({ start: i / sampleRate, end: end / sampleRate, db: rmsToDb(rms) });
  }
  return windows;
}
