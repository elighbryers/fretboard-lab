// Sound engine: plucked string, drone and metronome, all on one Web Audio context.
// Browsers only allow audio after a user gesture, so the context is created on the
// first tap/keypress (see unlock) and every call is a safe no-op until then.
import { midiToFreq, pcOf, lookup, parseFormula } from './theory.js';

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
// The master output (after the mute switch), for other sound modules (drum kit, groove, samples).
export const output = () => (context() ? master : null);

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

// Another instrument's sound (bass, piano) replaces the guitar pluck for every note the
// app plays: setVoice((midi, t, volume, out) => t). Guitar never sets one.
let voice = null;
export const setVoice = fn => { voice = fn; };

// Play a note `when` seconds from now. Returns the audio-clock time it sounds at.
export function pluck(midi, when = 0) {
  const c = context();
  return c ? pluckAt(midi, c.currentTime + when) : 0;
}

// Play a note at an exact audio-clock time (see now()). Use this for anything
// in tempo, so every note is measured from one start time. volume 0..1.
export function pluckAt(midi, t, volume = 1) {
  const c = context();
  if (!c) return 0;
  if (voice) return voice(midi, t, volume, master) ?? t;
  const src = c.createBufferSource(), g = c.createGain();
  src.buffer = pluckBuffer(midi);
  g.gain.value = 0.45 * volume;
  src.connect(g).connect(master);
  src.start(t);
  return t;
}

/* ---------- strummed chords, built from the pluck ---------- */
// A guitar-like voicing for any chord in the catalog: the root low (E2 to D#3),
// then the 5th, the root an octave up, the 3rd, and the 7th (or 5th) on top.
export function voicing(rootPc, chordId = 'major') {
  const semis = parseFormula((lookup('chord', chordId) || lookup('chord', 'major')).formula).map(d => d.semi % 12);
  const bass = 40 + pcOf(rootPc - 4), find = list => semis.find(x => list.includes(x));
  const third = find([3, 4]) ?? find([2, 5]), fifth = find([6, 7, 8]), seventh = find([9, 10, 11]);
  return [bass, fifth != null ? bass + fifth : null, bass + 12, third != null ? bass + 12 + third : null,
    seventh != null ? bass + 12 + seventh : fifth != null ? bass + 12 + fifth : null].filter(m => m != null);
}

// Strum notes (low to high, or high to low for an upstroke) starting at audio time t.
export function strumAt(midis, t, { spread = 0.022, volume = 0.75, up = false } = {}) {
  const list = up ? midis.slice().reverse() : midis;
  list.forEach((m, i) => pluckAt(m, t + i * spread, volume));
  return t;
}
export const strum = (midis, when = 0, opts) => { const c = context(); return c ? strumAt(midis, c.currentTime + when, opts) : 0; };

/* ---------- drone: a sustained root (plus octave) for ear training ---------- */
let drone = null, droneLevel = 0.5;
const DRONE_MAX = 0.28;

// Drone volume 0..1 (default 0.5); applies immediately if it's playing.
export function setDroneVolume(v) {
  droneLevel = Math.min(1, Math.max(0, +v));
  if (drone) drone.out.gain.setTargetAtTime(droneLevel * DRONE_MAX, ctx.currentTime, 0.05);
}
export const droneVolume = () => droneLevel;

export function droneStart(pc, octave = 2) {
  const c = context();
  if (!c) return;
  const midi = 12 * (octave + 1) + pcOf(pc);
  if (drone) { droneRetune(midi); return; }
  const out = c.createGain(), filter = c.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 900; filter.Q.value = 0.5;
  out.gain.setValueAtTime(0, c.currentTime);
  out.gain.linearRampToValueAtTime(droneLevel * DRONE_MAX, c.currentTime + 0.6);
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

/* ---------- short sounds: click and chime ---------- */
// A metronome-style click at audio time t. level: 0 = sub-beat, 1 = beat, 2 = accent.
export function click(t, level = 1, volume = 1) {
  const c = context();
  if (!c || volume <= 0) return;
  const o = c.createOscillator(), g = c.createGain();
  o.frequency.value = [700, 1000, 1600][level];
  const peak = [0.22, 0.4, 0.65][level] * volume;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.06);
}

// A soft two-note bell, used between practice-timer blocks.
export function chime(volume = 0.6) {
  const c = context();
  if (!c) return;
  [[880, 0], [1318.5, 0.18]].forEach(([f, d]) => {
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + d;
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3 * volume, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + 1.3);
  });
}

/* ---------- metronome ----------
   Clicks are scheduled on the audio clock a little ahead of time; a short timer
   only tops up the queue, so timer jitter never reaches the sound. */
const LOOKAHEAD_MS = 25, AHEAD_VISIBLE = 0.1, AHEAD_HIDDEN = 1.2;

export const metronome = {
  bpm: 80,
  beatsPerBar: 4,
  subdiv: 1,       // clicks per beat: 1 quarter, 2 eighth, 3 triplet, 4 sixteenth
  accent: true,    // accent beat 1
  group: 0,        // secondary accent every N beats (3 for 6/8), 0 = none
  volume: 0.7,
  running: false,
  _listeners: new Set(),
  _schedulers: new Set(),
  // fn(beatIndexInBar, audioTime, bar) is called close to when each beat sounds
  // (not on subdivisions). Returns an unsubscribe function.
  listen(fn) { this._listeners.add(fn); return () => this._listeners.delete(fn); },
  // fn(beatIndexInBar, audioTime, bar) is called ahead of time, when each beat is
  // scheduled, so sounds can be put on the audio clock exactly (backing tracks).
  schedule(fn) { this._schedulers.add(fn); return () => this._schedulers.delete(fn); },
  _next: 0, _beat: 0, _sub: 0, _bar: 0, _timer: null,

  start() {
    const c = context();
    if (!c || this.running) return;
    this.running = true;
    this._beat = 0;
    this._sub = 0;
    this._bar = 0;
    this._next = c.currentTime + 0.06;
    this._tick();
  },
  stop() {
    this.running = false;
    clearTimeout(this._timer);
  },
  setBpm(bpm) { this.bpm = Math.min(300, Math.max(20, +bpm || 80)); },
  setVolume(v) { this.volume = Math.min(1, Math.max(0, +v)); },

  _tick() {
    if (!this.running) return;
    // Background tabs throttle timers to ~1s, so schedule further ahead then.
    const ahead = document.hidden ? AHEAD_HIDDEN : AHEAD_VISIBLE;
    while (this._next < ctx.currentTime + ahead) {
      const beat = this._beat, sub = this._sub, t = this._next, bar = this._bar;
      const level = sub > 0 ? 0 : beat === 0 && this.accent ? 2 : this.group && beat % this.group === 0 && this.accent ? 2 : 1;
      click(t, level, this.volume * (level === 2 && beat !== 0 ? 0.8 : 1));
      if (sub === 0) this._schedulers.forEach(fn => fn(beat, t, bar));
      if (sub === 0 && this._listeners.size) {
        setTimeout(() => this.running && this._listeners.forEach(fn => fn(beat, t, bar)), Math.max(0, (t - ctx.currentTime) * 1000));
      }
      this._next += 60 / this.bpm / this.subdiv;
      if (++this._sub >= this.subdiv) {
        this._sub = 0;
        this._beat = (this._beat + 1) % this.beatsPerBar;
        if (this._beat === 0) this._bar++;
      }
    }
    this._timer = setTimeout(() => this._tick(), LOOKAHEAD_MS);
  }
};

/* ---------- backing track: strummed chords on the metronome ----------
   backing.start([{ root: pc, chord: 'major' }, ...]) loops one chord per bar
   (a full strum on beat 1, lighter ones on the other beats) until stop(). */
export const backing = {
  chords: [], off: null, volume: 0.7,
  get running() { return !!this.off; },
  start(chords, { bpm = metronome.bpm, beatsPerBar = 4, barsPerChord = 1 } = {}) {
    this.stop();
    this.chords = chords;
    const voiced = chords.map(c => voicing(c.root, c.chord));
    this.off = metronome.schedule((beat, t, bar) => {
      const v = voiced[Math.floor(bar / barsPerChord) % voiced.length];
      strumAt(beat === 0 ? v : v.slice(1), t, { volume: this.volume * (beat === 0 ? 0.9 : 0.45), up: beat % 2 === 1 });
    });
    metronome.stop();
    metronome.setBpm(bpm);
    metronome.beatsPerBar = beatsPerBar;
    metronome.subdiv = 1;
    metronome.group = 0;
    metronome.start();
  },
  // The chord index sounding in a given bar.
  indexAt(bar, barsPerChord = 1) { return Math.floor(bar / barsPerChord) % (this.chords.length || 1); },
  stop() { if (this.off) { this.off(); this.off = null; metronome.stop(); } }
};
