// Pitch detection on generated audio (no microphone here): sawtooth-like tones with harmonics,
// noise and a missing-ish fundamental, at bass, guitar and piano pitches.
import test from 'node:test';
import assert from 'node:assert/strict';
import { yin, noteOf, matchesPc, stabilizer, MIN_WINDOW_MS, chroma, loudestPcs } from '../js/pitch.js';

const SR = 44100;
const win = Math.ceil(SR * 0.186); // 8192 samples, 186 ms (>= 100 ms)
function tone(freq, { n = win, harmonics = [1, 0.6, 0.4, 0.25, 0.15], noise = 0.02, seed = 1 } = {}) {
  let s = seed; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let v = 0;
    harmonics.forEach((a, h) => { v += a * Math.sin(2 * Math.PI * freq * (h + 1) * i / SR + h); });
    x[i] = 0.3 * v + noise * rnd();
  }
  return x;
}
const midiFreq = m => 440 * 2 ** ((m - 69) / 12);

test('window is at least 100 ms', () => { assert.ok(win / SR * 1000 >= MIN_WINDOW_MS); });

test('finds the right note from low B (5-string bass) to high e', () => {
  for (const midi of [23, 26, 28, 33, 38, 40, 45, 52, 57, 64, 69, 76, 84]) {
    const r = yin(tone(midiFreq(midi)), SR);
    assert.equal(noteOf(r.freq)?.midi, midi, `midi ${midi}: got ${r.freq.toFixed(2)} Hz`);
  }
});

test('a strong 2nd harmonic (bass octave error) still grades right by note name', () => {
  for (const midi of [28, 33, 40]) {
    const r = yin(tone(midiFreq(midi), { harmonics: [0.4, 1, 0.5, 0.3] }), SR);
    assert.ok(matchesPc(r.freq, midi % 12), `midi ${midi}: ${r.freq}`);
  }
});

test('silence and noise give no pitch', () => {
  assert.equal(yin(new Float32Array(win), SR).freq, 0);
  let s = 7; const x = new Float32Array(win).map(() => ((s = (s * 16807) % 2147483647) / 2147483647) - 0.5);
  assert.equal(yin(x, SR).freq, 0);
});

test('the stabilizer reports a note once it holds for 3 frames', () => {
  const st = stabilizer(3), f = midiFreq(45);
  assert.equal(st.push(f), null); assert.equal(st.push(f), null);
  assert.equal(st.push(f).midi, 45);
  assert.equal(st.push(f), null, 'not reported twice');
  assert.equal(st.push(0), null);
});

test('experimental chroma picks out a C major triad', () => {
  const n = 8192, x = new Float32Array(n);
  [261.63, 329.63, 392.0].forEach(f => { for (let i = 0; i < n; i++) x[i] += Math.sin(2 * Math.PI * f * i / SR); });
  // naive DFT magnitudes for bins up to 2 kHz
  const bins = Math.ceil(2000 * n / SR), mags = new Float32Array(bins);
  for (let k = 1; k < bins; k++) { let re = 0, im = 0; for (let i = 0; i < n; i += 2) { const a = 2 * Math.PI * k * i / n; re += x[i] * Math.cos(a); im -= x[i] * Math.sin(a); } mags[k] = Math.hypot(re, im); }
  const pcs = loudestPcs(chroma(mags, SR, n), 0.3).slice(0, 3).sort((a, b) => a - b);
  assert.deepEqual(pcs, [0, 4, 7]);
});
