// Groove player engine: drum patterns on the shared metronome clock, plus an optional
// looping chord pad (docs/research-bass.md D4, research-master-plan.md section 2).
// Every pattern is original and written as one bar of text per kit piece:
//   'x' hit, 'X' accent, 'g' ghost (quiet), '.' nothing.
// A bar has beatsPerBar x grid steps: grid 4 = sixteenth notes, grid 3 = eighth-note triplets
// (shuffle, swing, 12/8). The pure helpers (STYLES, hitsIn, stepTime, isDropBar, partsFor)
// are tested in tests/groove.test.mjs; start/stop needs Web Audio.
import { metronome, context, output, voicing } from './audio.js';
import { midiToFreq } from './theory.js';
import { hit as kitHit } from './drumkit.js';

export const STYLES = {
  rock8: { name: 'Rock 8ths', grid: 4, beats: 4, bpm: 90, parts: {
    hat: 'x.x.x.x.x.x.x.x.', snare: '....X.......X...', kick: 'x.......x.x.....' } },
  four: { name: 'Four on the floor', grid: 4, beats: 4, bpm: 118, parts: {
    hat: 'x...x...x...x...', ohat: '..x...x...x...x.', snare: '....X.......X...', kick: 'x...x...x...x...' } },
  half: { name: 'Half-time', grid: 4, beats: 4, bpm: 80, parts: {
    hat: 'x.x.x.x.x.x.x.x.', snare: '........X.......', kick: 'x.....x...x.....' } },
  shuffle: { name: 'Shuffle', grid: 3, beats: 4, bpm: 96, parts: {
    hat: 'x.xx.xx.xx.x', snare: '...X.....X..', kick: 'x.....x.....' } },
  funk16: { name: 'Funk 16ths', grid: 4, beats: 4, bpm: 96, parts: {
    hat: 'XxxxXxxxXxxxXxxx', snare: '....X..g.g..X..g', kick: 'x.....x...x..x..' } },
  twofeel: { name: 'Two-feel (swing)', grid: 3, beats: 4, bpm: 110, parts: {
    ride: 'x..x.xx..x.x', phat: '...x.....x..', kick: 'g.....g.....' } },
  walking: { name: 'Walking swing', grid: 3, beats: 4, bpm: 120, parts: {
    ride: 'x..x.xx..x.x', phat: '...x.....x..', kick: 'g..g..g..g..' } },
  bossa: { name: 'Bossa', grid: 4, beats: 4, bpm: 130, parts: {
    hat: 'x.x.x.x.x.x.x.x.', rim: 'x..x..x...x..x..', kick: 'x..xx..xx..xx..x' } },
  onedrop: { name: 'Reggae one-drop', grid: 4, beats: 4, bpm: 76, parts: {
    hat: 'x.x.x.x.x.x.x.x.', rim: '........X.......', kick: '........x.......' } },
  twelve8: { name: '12/8', grid: 3, beats: 4, bpm: 64, parts: {
    hat: 'Xxxxxxxxxxxx', snare: '...X.....X..', kick: 'x.....xx....' } }
};
export const STYLE_IDS = Object.keys(STYLES);

// Which pieces sound for a mute setting.
export const MUTES = { kick: 'Kick only', kicksnare: 'Kick + snare', full: 'Full kit' };
export function partsFor(style, mute = 'full') {
  const p = STYLES[style].parts;
  if (mute === 'kick') return { kick: p.kick };
  if (mute === 'kicksnare') return Object.fromEntries(Object.entries(p).filter(([k]) => ['kick', 'snare', 'rim'].includes(k)));
  return p;
}
// Drop-out: every Nth bar is silent (N = 0: never), so you can check you held time.
// The first bar always plays.
export const DROPOUTS = { 0: 'Off', 4: 'Every 4th bar', 2: 'Every other bar' };
export const isDropBar = (bar, every) => every > 0 && bar > 0 && (bar + 1) % every === 0;

// Step indexes of hits in a pattern string, with velocities.
export function hitsIn(pattern) {
  const out = [];
  [...pattern].forEach((ch, i) => { if (ch !== '.') out.push({ step: i, vel: ch === 'X' ? 1 : ch === 'g' ? 0.35 : 0.75 }); });
  return out;
}
// Audio time of step i in a bar that starts at barT (seconds per beat spb).
export const stepTime = (style, barT, i, spb) => barT + (i / STYLES[style].grid) * spb;
// Beat positions (in beats from the bar start) where the kick plays: used by "lock to the kick".
export const kickBeats = style => hitsIn(STYLES[style].parts.kick).filter(h => h.vel > 0.5).map(h => h.step / STYLES[style].grid);

/* ---------- the chord pad: a soft sustained chord per bar ---------- */
let padBus = null, padLevel = 0.5;
export function pad(rootPc, chordId, t, dur) {
  const c = context();
  if (!c) return;
  if (!padBus) { padBus = c.createGain(); padBus.gain.value = padLevel; padBus.connect(output()); }
  // The guitar voicing an octave up, without the low root (the bass plays that).
  const notes = voicing(rootPc, chordId).slice(1).map(m => m + 12);
  const f = c.createBiquadFilter(), g = c.createGain();
  f.type = 'lowpass'; f.frequency.value = 1400;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.09, t + 0.08);
  g.gain.setValueAtTime(0.09, t + Math.max(0.1, dur - 0.15));
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  notes.forEach((m, i) => [0, 6].forEach(det => {
    const o = c.createOscillator();
    o.type = i % 2 ? 'triangle' : 'sawtooth';
    o.frequency.value = midiToFreq(m); o.detune.value = det;
    o.connect(f); o.start(t); o.stop(t + dur + 0.05);
  }));
  f.connect(g).connect(padBus);
}
export function setPadVolume(v) { padLevel = Math.max(0, Math.min(1, +v)); if (padBus) padBus.gain.value = padLevel; }

/* ---------- the player ---------- */
// groove.start({ style, bpm, mute, dropout, chords: [{ root, chord }], barsPerChord, click, onBar })
// Uses the shared metronome (its click becomes optional: click volume 0..1, default off).
// Anything else scheduled on the metronome (a bass line, a play-along) stays in time with it.
export const groove = {
  opts: null, off: null, saved: null, drumsOn: true,
  get running() { return !!this.off; },
  start(opts = {}) {
    this.stop();
    const o = this.opts = { style: 'rock8', mute: 'full', dropout: 0, chords: null, barsPerChord: 1, click: 0, ...opts };
    const st = STYLES[o.style];
    this.saved = { bpm: metronome.bpm, beats: metronome.beatsPerBar, subdiv: metronome.subdiv, group: metronome.group, volume: metronome.volume, accent: metronome.accent };
    metronome.stop();
    metronome.setBpm(o.bpm || st.bpm);
    metronome.beatsPerBar = st.beats;
    metronome.subdiv = 1;
    metronome.group = 0;
    metronome.setVolume(o.click);
    this.off = metronome.schedule((beat, t, bar) => this._beat(beat, t, bar));
    metronome.start();
  },
  // Change options while playing (style changes take effect at the next beat).
  set(patch) {
    if (!this.opts) return;
    Object.assign(this.opts, patch);
    if ('bpm' in patch) metronome.setBpm(patch.bpm);
    if ('click' in patch) metronome.setVolume(patch.click);
    if ('style' in patch) metronome.beatsPerBar = STYLES[patch.style].beats;
  },
  _beat(beat, t, bar) {
    const o = this.opts, st = STYLES[o.style], spb = 60 / metronome.bpm;
    const drop = isDropBar(bar, o.dropout);
    o.onBeat?.(beat, t, bar, drop);
    if (drop) return;
    if (this.drumsOn) for (const [piece, pat] of Object.entries(partsFor(o.style, o.mute))) {
      for (const h of hitsIn(pat)) {
        if (Math.floor(h.step / st.grid) !== beat) continue;
        kitHit(piece, stepTime(o.style, t - beat * spb, h.step, spb), h.vel);
      }
    }
    if (beat === 0 && o.chords?.length) {
      const c = o.chords[Math.floor(bar / o.barsPerChord) % o.chords.length];
      if (c) pad(c.root, c.chord, t, spb * st.beats * 0.98);
    }
  },
  // The chord sounding in a bar.
  chordAt(bar) { const o = this.opts; return o?.chords?.length ? o.chords[Math.floor(bar / o.barsPerChord) % o.chords.length] : null; },
  stop() {
    if (!this.off) return;
    this.off(); this.off = null;
    metronome.stop();
    const s = this.saved;
    metronome.setBpm(s.bpm); metronome.beatsPerBar = s.beats; metronome.subdiv = s.subdiv; metronome.group = s.group;
    metronome.setVolume(s.volume); metronome.accent = s.accent;
    this.opts = null;
  }
};
