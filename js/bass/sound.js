// The bass sound: a Karplus-Strong pluck retuned for bass (docs/research-bass.md F1):
// a darker excitation (fingers, not a pick), plucked nearer the bridge, a slower decay and a
// low-pass after it. No downloads, so it plays instantly. The CC0 Growlybass samples the plan
// named could not be downloaded in the build environment (see docs/overnight-report.md), so
// this synth is the bass sound for now; a sample set can be added through setVoice later.
import { context, setVoice } from '../audio.js';
import { midiToFreq } from '../theory.js';

const cache = {};
// Pure: one bass note as samples (exported for tests).
export function bassSamples(midi, sr, seconds = 3.2, rand = Math.random) {
  const f = midiToFreq(midi), len = Math.floor(sr * seconds), out = new Float32Array(len);
  const N = Math.max(2, Math.round(sr / f)), ring = new Float32Array(N);
  // Excitation: noise smoothed twice (soft finger) with a comb for the pluck position (~1/5 of the string).
  let a = 0, b = 0;
  for (let i = 0; i < N; i++) { a += 0.35 * ((rand() * 2 - 1) - a); b += 0.35 * (a - b); ring[i] = b; }
  const p = Math.max(1, Math.round(N / 5)), ex = ring.slice();
  for (let i = 0; i < N; i++) ring[i] = ex[i] - 0.6 * ex[(i + p) % N];
  let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(ring[i]));
  for (let i = 0; i < N; i++) ring[i] /= peak || 1;
  // Loop filter: averaging (dark) with a decay that keeps low notes ringing ~3 s.
  const decay = 0.9985 - 0.0006 * Math.max(0, (midi - 28) / 24);
  let i0 = 0;
  for (let i = 0; i < len; i++) {
    const n = (i0 + 1) % N, v = ring[i0];
    ring[i0] = decay * 0.5 * (v + ring[n]);
    out[i] = v;
    i0 = n;
  }
  // A short fade-in (no click) and fade-out at the end of the buffer.
  for (let i = 0; i < 64 && i < len; i++) out[i] *= i / 64;
  for (let i = 0; i < 2000; i++) out[len - 1 - i] *= i / 2000;
  return out;
}

function buffer(c, midi) {
  if (cache[midi]) return cache[midi];
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * 3.2), c.sampleRate);
  buf.copyToChannel(bassSamples(midi, c.sampleRate), 0);
  return cache[midi] = buf;
}

// The voice: buffer -> low-pass (opens a little on high notes) -> gain.
export function bassVoice(midi, t, volume, out) {
  const c = context();
  if (!c) return 0;
  const src = c.createBufferSource(), lp = c.createBiquadFilter(), g = c.createGain();
  src.buffer = buffer(c, midi);
  lp.type = 'lowpass'; lp.frequency.value = 700 + 18 * (midi - 23); lp.Q.value = 0.7;
  g.gain.value = 0.85 * volume;
  src.connect(lp).connect(g).connect(out);
  src.start(t);
  return t;
}

export function useBassSound() { setVoice(bassVoice); }
