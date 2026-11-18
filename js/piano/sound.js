// The piano sound (docs/research-piano.md F1): the Salamander Grand Piano 30-note MP3 web subset
// (Alexander Holm, CC BY 3.0 — credited under Progress → About), self-hosted in sounds/piano/,
// played with smplr 1.2.0 (MIT, vendored in js/vendor/). A short synth piano plays straight
// away; the lesson's range (C3–C6) loads first, the rest in the background. The service worker
// keeps the files for offline use.
import { context, output, setVoice } from '../audio.js';
import { midiToFreq } from '../theory.js';

// Samples every minor third from A0 to C8, named as in the source set (Ds = D#, Fs = F#).
const NAMES = ['C', 'Ds', 'Fs', 'A'], PC = { C: 0, Ds: 3, Fs: 6, A: 9 };
export const SAMPLES = [];
for (let o = 0; o <= 7; o++) for (const n of NAMES) { const midi = 12 * (o + 1) + PC[n]; if (midi >= 21) SAMPLES.push({ name: `${n}${o}`, midi }); }
SAMPLES.push({ name: 'C8', midi: 108 });
const BASE = new URL('../../sounds/piano/', import.meta.url).href;
// Each sample covers the notes from one below to one above it (minor thirds apart).
export const regionsFor = list => list.map(s => ({ sample: s.name, keyRange: [s.midi - 1, s.midi + 1], pitch: s.midi }));
export const NEAR = [48, 84];

let near = null, far = null, nearReady = false, farReady = false, loading = null;
export const pianoStatus = { loaded: 0, total: SAMPLES.length, onChange: null };

function preset(list) { return { samples: { baseUrl: BASE, formats: ['mp3'] }, groups: [{ regions: regionsFor(list) }] }; }
export function loadPiano() {
  if (loading) return loading;
  const c = context();
  if (!c) return Promise.resolve(false);
  loading = import('../vendor/smplr-1.2.0.mjs').then(async ({ Sampler }) => {
    const inNear = s => s.midi >= NEAR[0] - 2 && s.midi <= NEAR[1] + 2;
    near = Sampler(c, { preset: preset(SAMPLES.filter(inNear)), destination: output() });
    await near.ready; nearReady = true;
    pianoStatus.loaded = SAMPLES.filter(inNear).length; pianoStatus.onChange?.();
    far = Sampler(c, { preset: preset(SAMPLES.filter(s => !inNear(s))), destination: output() });
    await far.ready; farReady = true;
    pianoStatus.loaded = SAMPLES.length; pianoStatus.onChange?.();
    return true;
  }).catch(e => { console.warn('Piano samples could not load; using the synth piano.', e); return false; });
  return loading;
}

// The instant fallback: a soft two-oscillator tone with a piano-like decay.
function synthPiano(midi, t, volume, out) {
  const c = context(), f = midiToFreq(midi), g = c.createGain(), lp = c.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = Math.min(6000, f * 6);
  const dur = 1.6 + Math.max(0, (72 - midi) / 30);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.32 * volume, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  [[1, 'triangle', 1], [2, 'sine', 0.35], [3, 'sine', 0.12]].forEach(([h, type, a]) => {
    const o = c.createOscillator(), og = c.createGain();
    o.type = type; o.frequency.value = f * h; og.gain.value = a;
    o.connect(og).connect(lp); o.start(t); o.stop(t + dur + 0.05);
  });
  lp.connect(g).connect(out);
  return t;
}

export function pianoVoice(midi, t, volume, out) {
  const inNear = midi >= NEAR[0] && midi <= NEAR[1];
  const s = inNear && nearReady ? near : !inNear && farReady ? far : null;
  if (s) { s.start({ note: midi, time: t, velocity: Math.round(40 + 70 * Math.min(1, volume)), duration: 2.5 }); return t; }
  return synthPiano(midi, t, volume, out);
}

export function usePianoSound() {
  setVoice(pianoVoice);
  // Start loading after the first tap (the AudioContext needs a gesture).
  const go = () => { loadPiano(); window.removeEventListener('pointerdown', go, true); window.removeEventListener('keydown', go, true); };
  window.addEventListener('pointerdown', go, true);
  window.addEventListener('keydown', go, true);
}
