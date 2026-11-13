// Sound engine: plucked string, drone and metronome, all on one Web Audio context.
// Browsers only allow audio after a user gesture, so the context is created on the
// first tap/keypress (see unlock) and every call is a safe no-op until then.
import { midiToFreq, pcOf } from './theory.js';

const AC = window.AudioContext || window.webkitAudioContext;
export const supported = !!AC;

let ctx = null, master = null, muted = false;

export function context() {
  if (!supported) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Call once at startup: the first gesture anywhere creates/resumes the context.
// A silent buffer is played because iOS Safari only unlocks on an actual start().
export function unlock() {
  const go = () => {
    const c = context();
    if (c) {
      const src = c.createBufferSource();
      src.buffer = c.createBuffer(1, 1, c.sampleRate);
      src.connect(c.destination);
      src.start();
    }
    window.removeEventListener('pointerdown', go, true);
    window.removeEventListener('keydown', go, true);
  };
  window.addEventListener('pointerdown', go, true);
  window.addEventListener('keydown', go, true);
}

export function setMuted(m) {
  muted = !!m;
  if (master) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.02);
}

export const now = () => (ctx ? ctx.currentTime : 0);

/* ---------- plucked string (Karplus-Strong, no downloads) ---------- */
const cache = {};
function pluckBuffer(midi) {
  if (cache[midi]) return cache[midi];
  const c = context(), sr = c.sampleRate, f = midiToFreq(midi);
  const len = Math.floor(sr * 2.2), buf = c.createBuffer(1, len, sr), d = buf.getChannelData(0);
  const N = Math.max(2, Math.round(sr / f)), ring = new Float32Array(N);
  for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1;
  let i0 = 0;
  for (let i = 0; i < len; i++) { const n = (i0 + 1) % N, v = ring[i0]; ring[i0] = 0.497 * (v + ring[n]); d[i] = v; i0 = n; }
  return cache[midi] = buf;
}

// Play a note `when` seconds from now. Returns the audio-clock time it sounds at.
export function pluck(midi, when = 0) {
  const c = context();
  return c ? pluckAt(midi, c.currentTime + when) : 0;
}

// Play a note at an exact audio-clock time (see now()). Use this for anything
// in tempo, so every note is measured from one start time.
export function pluckAt(midi, t) {
  const c = context();
  if (!c) return 0;
  const src = c.createBufferSource(), g = c.createGain();
  src.buffer = pluckBuffer(midi);
  g.gain.value = 0.45;
  src.connect(g).connect(master);
  src.start(t);
  return t;
}

/* ---------- drone: a sustained root (plus octave) for ear training ---------- */
let drone = null;

export function droneStart(pc, octave = 2) {
  const c = context();
  if (!c) return;
  const midi = 12 * (octave + 1) + pcOf(pc);
  if (drone) { droneRetune(midi); return; }
  const out = c.createGain(), filter = c.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 900; filter.Q.value = 0.5;
  out.gain.setValueAtTime(0, c.currentTime);
  out.gain.linearRampToValueAtTime(0.14, c.currentTime + 0.6);
  const oscs = [[0, 'sawtooth', 0.5], [12, 'triangle', 0.6], [0, 'sine', 0.8]].map(([up, type, level]) => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = midiToFreq(midi + up); g.gain.value = level;
    if (type === 'sawtooth') o.detune.value = 4;
    o.connect(g).connect(filter);
    o.start();
    return { o, up };
  });
  filter.connect(out).connect(master);
  drone = { out, oscs, midi };
}

function droneRetune(midi) {
  drone.midi = midi;
  drone.oscs.forEach(({ o, up }) => o.frequency.setTargetAtTime(midiToFreq(midi + up), ctx.currentTime, 0.05));
}

export function droneStop() {
  if (!drone) return;
  const d = drone, t = ctx.currentTime;
  drone = null;
  d.out.gain.cancelScheduledValues(t);
  d.out.gain.setValueAtTime(d.out.gain.value, t);
  d.out.gain.linearRampToValueAtTime(0, t + 0.4);
  d.oscs.forEach(({ o }) => o.stop(t + 0.45));
}

export const droneOn = () => !!drone;

/* ---------- metronome ----------
   Clicks are scheduled on the audio clock a little ahead of time; a short timer
   only tops up the queue, so timer jitter never reaches the sound. */
const LOOKAHEAD_MS = 25, AHEAD_VISIBLE = 0.1, AHEAD_HIDDEN = 1.2;

export const metronome = {
  bpm: 80,
  beatsPerBar: 4,
  running: false,
  _listeners: new Set(),
  // fn(beatIndexInBar, audioTime) is called close to when each click sounds. Returns an unsubscribe function.
  listen(fn) { this._listeners.add(fn); return () => this._listeners.delete(fn); },
  _next: 0, _beat: 0, _timer: null,

  start() {
    const c = context();
    if (!c || this.running) return;
    this.running = true;
    this._beat = 0;
    this._next = c.currentTime + 0.06;
    this._tick();
  },
  stop() {
    this.running = false;
    clearTimeout(this._timer);
  },
  setBpm(bpm) { this.bpm = Math.min(300, Math.max(20, +bpm || 80)); },

  _tick() {
    if (!this.running) return;
    // Background tabs throttle timers to ~1s, so schedule further ahead then.
    const ahead = document.hidden ? AHEAD_HIDDEN : AHEAD_VISIBLE;
    while (this._next < ctx.currentTime + ahead) {
      this._click(this._beat, this._next);
      this._next += 60 / this.bpm;
      this._beat = (this._beat + 1) % this.beatsPerBar;
    }
    this._timer = setTimeout(() => this._tick(), LOOKAHEAD_MS);
  },
  _click(beat, t) {
    const o = ctx.createOscillator(), g = ctx.createGain(), accent = beat === 0;
    o.frequency.value = accent ? 1600 : 1000;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(accent ? 0.6 : 0.35, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.06);
    if (this._listeners.size) {
      setTimeout(() => this.running && this._listeners.forEach(fn => fn(beat, t)), Math.max(0, (t - ctx.currentTime) * 1000));
    }
  }
};
