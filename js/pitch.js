// Pitch detection for the optional microphone (docs/research-bass.md F2): YIN on a window
// of at least 100 ms, so two or more periods of a low B (30.9 Hz) fit. Pure functions, no
// DOM or audio: tested with generated tones in tests/pitch.test.mjs.
// Grading is by note name in any octave (pitch class), which removes octave errors.

export const MIN_WINDOW_MS = 100;

// YIN (de Cheveigné & Kawahara 2002): difference function, cumulative mean normalised
// difference, absolute threshold, parabolic interpolation.
// Returns { freq, clarity (0..1, 1 = clean), rms } or { freq: 0 } when there's no clear pitch.
export function yin(buf, sr, { threshold = 0.15, minFreq = 27, maxFreq = 1500 } = {}) {
  const n = buf.length;
  let rms = 0;
  for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / n);
  if (rms < 1e-4) return { freq: 0, clarity: 0, rms };
  const maxTau = Math.min(Math.floor(sr / minFreq), Math.floor(n / 2)), minTau = Math.max(2, Math.floor(sr / maxFreq));
  const W = n - maxTau, d = new Float32Array(maxTau + 1);
  for (let tau = 1; tau <= maxTau; tau++) {
    let s = 0;
    for (let i = 0; i < W; i++) { const x = buf[i] - buf[i + tau]; s += x * x; }
    d[tau] = s;
  }
  // cumulative mean normalised difference
  const cm = new Float32Array(maxTau + 1);
  cm[0] = 1;
  let run = 0;
  for (let tau = 1; tau <= maxTau; tau++) { run += d[tau]; cm[tau] = run ? (d[tau] * tau) / run : 1; }
  let tau = -1;
  for (let t = minTau; t <= maxTau; t++) {
    if (cm[t] < threshold) { while (t + 1 <= maxTau && cm[t + 1] < cm[t]) t++; tau = t; break; }
  }
  if (tau < 0) {
    // no dip under the threshold: take the global minimum if it's reasonably clear
    let best = minTau;
    for (let t = minTau; t <= maxTau; t++) if (cm[t] < cm[best]) best = t;
    if (cm[best] > 0.35) return { freq: 0, clarity: 1 - cm[best], rms };
    tau = best;
  }
  const a = cm[tau - 1] ?? cm[tau], b = cm[tau], c = cm[tau + 1] ?? cm[tau];
  const den = a - 2 * b + c, shift = den ? (a - c) / (2 * den) : 0;
  return { freq: sr / (tau + shift), clarity: Math.max(0, 1 - b), rms };
}

// Frequency -> nearest MIDI note, pitch class and cents off.
export function noteOf(freq) {
  if (!freq) return null;
  const m = 69 + 12 * Math.log2(freq / 440), midi = Math.round(m);
  return { midi, pc: ((midi % 12) + 12) % 12, cents: Math.round((m - midi) * 100) };
}
// Does a frequency match one of these pitch classes, in any octave?
export const matchesPc = (freq, pcs) => { const n = noteOf(freq); return !!n && [].concat(pcs).includes(n.pc); };

// A run of frames agreeing on one note, so a single wobble isn't heard as a note.
// push(freq) -> the stable note (once, when it settles) or null.
export function stabilizer(frames = 3) {
  let last = null, count = 0, reported = null;
  return {
    push(freq) {
      const n = noteOf(freq);
      if (!n) { last = null; count = 0; reported = null; return null; }
      if (last && n.midi === last.midi) count++; else { last = n; count = 1; }
      if (count >= frames && (!reported || reported.midi !== n.midi)) { reported = n; return n; }
      return null;
    },
    reset() { last = null; count = 0; reported = null; }
  };
}

/* ---------- experimental: which pitch classes sound together (chords) ----------
   Behind the "experimental chord detection" setting only. A naive chromagram from a
   magnitude spectrum: sum energy per pitch class between 60 Hz and 2 kHz. Polyphonic
   detection is unreliable (research-piano.md F2), so it never grades anything. */
export function chroma(mags, sr, fftSize) {
  const out = new Array(12).fill(0);
  for (let k = 1; k < mags.length; k++) {
    const f = (k * sr) / fftSize;
    if (f < 60 || f > 2000) continue;
    const n = noteOf(f);
    out[n.pc] += mags[k] * mags[k];
  }
  const max = Math.max(...out) || 1;
  return out.map(v => v / max);
}
// The strongest pitch classes (above a share of the loudest).
export const loudestPcs = (ch, share = 0.45) => ch.map((v, pc) => [v, pc]).filter(([v]) => v >= share).sort((a, b) => b[0] - a[0]).map(([, pc]) => pc);
