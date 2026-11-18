// A synthesized drum kit: no downloads (docs/research-bass.md F1, research-drums.md F1).
// Kicks and toms are a sine whose pitch falls fast; snares and cymbals are filtered noise
// plus a short tone. It sounds like an electronic kit, which is fine for practice.
//   hit('kick', t, 1)   // piece, audio-clock time, velocity 0..1
// Pieces: kick, snare, rim (cross-stick), hat (closed), ohat (open), phat (pedal),
// ride, bell, crash, tom1 (high), tom2 (mid), tom3 (floor). Used by the groove player
// (js/groove.js) and the drums instrument. With Drums as the instrument a recorded CC0 kit can
// take over (sounds/drums/, js/sound-library.js, registered through useSamples); pieces a kit
// doesn't have, and every hit while it downloads, stay synthesized.
import { context, output } from './audio.js';

export const PIECES = ['crash', 'ride', 'bell', 'ohat', 'hat', 'tom1', 'tom2', 'snare', 'rim', 'tom3', 'kick', 'phat'];
export const PIECE_NAMES = { kick: 'Kick', snare: 'Snare', rim: 'Cross-stick', hat: 'Hi-hat (closed)', ohat: 'Hi-hat (open)',
  phat: 'Hi-hat (pedal)', ride: 'Ride', bell: 'Ride bell', crash: 'Crash', tom1: 'High tom', tom2: 'Mid tom', tom3: 'Floor tom' };

let noise = null, bus = null, level = 1;
// A volume for everything the kit plays (the groove player's drum volume).
export function setKitVolume(v) { level = Math.max(0, Math.min(1, +v)); if (bus) bus.gain.value = level; }
function ensure() {
  const c = context();
  if (!c) return null;
  if (!bus) { bus = c.createGain(); bus.gain.value = level; bus.connect(output()); }
  if (!noise) {
    noise = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return c;
}

function env(c, t, peak, decay, attack = 0.002) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return g;
}
function noiseHit(c, t, { peak, decay, hp = 0, bp = 0, q = 1, dur }) {
  const src = c.createBufferSource();
  src.buffer = noise;
  let node = src;
  if (hp) { const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; node.connect(f); node = f; }
  if (bp) { const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = bp; f.Q.value = q; node.connect(f); node = f; }
  const g = env(c, t, peak, decay);
  node.connect(g).connect(bus);
  src.start(t, Math.random() * 1.5);
  src.stop(t + (dur || decay + 0.05));
}
function toneHit(c, t, { f0, f1, sweep, peak, decay, type = 'sine' }) {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + sweep);
  const g = env(c, t, peak, decay);
  o.connect(g).connect(bus);
  o.start(t);
  o.stop(t + decay + 0.05);
}
function metal(c, t, { peak, decay, hp }) {
  // A few detuned square waves through a high-pass: a metallic, cymbal-like ring.
  const g = env(c, t, peak, decay), f = c.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = hp;
  [2, 3, 4.16, 5.43, 6.79, 8.21].forEach(r => { const o = c.createOscillator(); o.type = 'square'; o.frequency.value = 40 * r * 2.3; o.connect(f); o.start(t); o.stop(t + decay + 0.05); });
  f.connect(g).connect(bus);
}

const VOICES = {
  kick: (c, t, v) => { toneHit(c, t, { f0: 150, f1: 42, sweep: 0.11, peak: 1.0 * v, decay: 0.32 }); noiseHit(c, t, { peak: 0.12 * v, decay: 0.012, hp: 1500 }); },
  snare: (c, t, v) => { toneHit(c, t, { f0: 210, f1: 170, sweep: 0.05, peak: 0.35 * v, decay: 0.09, type: 'triangle' }); noiseHit(c, t, { peak: 0.55 * v, decay: 0.17, hp: 1200, bp: 3500, q: 0.6 }); },
  rim: (c, t, v) => { toneHit(c, t, { f0: 1750, peak: 0.25 * v, decay: 0.03, type: 'triangle' }); noiseHit(c, t, { peak: 0.2 * v, decay: 0.02, bp: 2500, q: 3 }); },
  hat: (c, t, v) => noiseHit(c, t, { peak: 0.22 * v, decay: 0.045, hp: 7000, bp: 10000, q: 0.8 }),
  ohat: (c, t, v) => noiseHit(c, t, { peak: 0.2 * v, decay: 0.32, hp: 6500, bp: 9500, q: 0.7 }),
  phat: (c, t, v) => noiseHit(c, t, { peak: 0.14 * v, decay: 0.05, hp: 5000, bp: 7500, q: 1.2 }),
  ride: (c, t, v) => { metal(c, t, { peak: 0.05 * v, decay: 0.7, hp: 6000 }); noiseHit(c, t, { peak: 0.08 * v, decay: 0.25, hp: 8000 }); },
  bell: (c, t, v) => { metal(c, t, { peak: 0.09 * v, decay: 0.9, hp: 3000 }); },
  crash: (c, t, v) => { noiseHit(c, t, { peak: 0.32 * v, decay: 1.4, hp: 3500, dur: 1.6 }); metal(c, t, { peak: 0.04 * v, decay: 1.0, hp: 5000 }); },
  tom1: (c, t, v) => toneHit(c, t, { f0: 260, f1: 180, sweep: 0.2, peak: 0.7 * v, decay: 0.35 }),
  tom2: (c, t, v) => toneHit(c, t, { f0: 200, f1: 135, sweep: 0.2, peak: 0.7 * v, decay: 0.38 }),
  tom3: (c, t, v) => toneHit(c, t, { f0: 140, f1: 90, sweep: 0.25, peak: 0.75 * v, decay: 0.45 })
};

// Play one piece at audio time t (now if omitted). Returns t.
export function hit(piece, t, velocity = 1) {
  const c = ensure();
  if (!c || !VOICES[piece] || velocity <= 0) return 0;
  const at = t ?? c.currentTime + 0.01;
  // A recorded kit can replace the synth (js/drums/index.js registers it); synth otherwise.
  if (samplePlayer && samplePlayer(piece, at, velocity, bus)) return at;
  VOICES[piece](c, at, Math.min(1.2, velocity));
  return at;
}
let samplePlayer = null;
export const useSamples = fn => { samplePlayer = fn; };
