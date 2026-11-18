// One way to describe a short sound, shared by lessons, the daily review and
// the placement quiz:
//   { seq: [step, ...], bpm: 90, drone: 'G' }
// A step is one beat: a MIDI number, a position { string, fret } (in the
// current instrument's numbering), a chord 'G:major' / 'A:m7' (strummed), an array of steps
// (sounded together; positions in an array are strummed), or null (a rest).
// With `drone`, a drone on that note plays under the sequence and fades after.
import { midiAt, parseNote } from './theory.js';
import { pluckAt, strumAt, voicing, context, now, droneStart, droneStop } from './audio.js';
import { tuningOf } from './instruments.js';
import { getInstrument, activeTuning } from './storage.js';

const tuning = tuningOf(getInstrument()); // the numbering lessons use for this instrument (4-string bass: string 4 = low E); pitch is the same on any tuning
export const midiOfPos = ({ string, fret }) => midiAt(tuning.strings.findIndex(x => x.num === string), fret, tuning);
// 'G:major' -> { root: 7, chord: 'major' }
export const parseChord = str => { const [n, c = 'major'] = str.split(':'); return { root: parseNote(n), chord: c }; };

// The MIDI notes of one step (for chords, the strummed voicing).
export function stepMidis(step) {
  if (step == null) return [];
  if (typeof step === 'number') return [step];
  if (typeof step === 'string') { const c = parseChord(step); return voicing(c.root, c.chord); }
  if (Array.isArray(step)) return step.flatMap(stepMidis);
  return [midiOfPos(step)];
}

// Plays the spec; returns stop(). onStep(i) is called as each step sounds.
export function playSound(spec, { onStep, onEnd } = {}) {
  const timers = [];
  if (!spec || !context()) return () => {};
  const beat = 60 / (spec.bpm || 90), lead = spec.drone ? 0.8 : 0.05, t0 = now() + lead;
  if (spec.drone) droneStart(parseNote(spec.drone));
  // drums: true adds a light kit under the notes (kick on 1 and 3, snare on 2 and 4, hats on 8ths),
  // so bass sounds are always heard against the beat.
  if (spec.drums) import('./drumkit.js').then(({ hit }) => (spec.seq || []).forEach((_, i) => {
    const t = t0 + i * beat;
    hit(i % 2 ? 'snare' : 'kick', t, 0.55); hit('hat', t, 0.35); hit('hat', t + beat / 2, 0.25);
  }));
  // pad: 'C:major' holds a soft chord under the whole sequence (a chord with a bass note on top).
  if (spec.pad) import('./groove.js').then(({ pad }) => { const c = parseChord(spec.pad); pad(c.root, c.chord, t0, Math.max(1.2, (spec.seq || []).length * beat)); });
  // kit: a drum groove { beats, sub, hits: { piece: [steps] }, bars } played on the synth kit.
  if (spec.kit) import('./drumkit.js').then(({ hit }) => { const g = spec.kit, per = g.beats * g.sub; for (let b = 0; b < (spec.bars || 2); b++) Object.entries(g.hits).forEach(([p, steps]) => steps.forEach(st => { if (st < per) hit(p, t0 + (b * per + st) / g.sub * beat, g.accents?.[p]?.includes(st) ? 1 : 0.75); })); });
  // prog: ['C:major', 'G:major', ...] plays each chord as a pad with its root in the bass, `per` beats each.
  if (spec.prog) import('./groove.js').then(({ pad }) => spec.prog.forEach((name, k) => {
    const c = parseChord(name), t = t0 + k * (spec.per || 2) * beat;
    pad(c.root, c.chord, t, (spec.per || 2) * beat * 0.95);
    pluckAt(28 + ((c.root - 4 + 12) % 12) + (spec.bassUp ? 12 : 0), t, 0.9);
  }));
  (spec.seq || []).forEach((step, i) => {
    const t = t0 + i * beat, midis = stepMidis(step);
    if (midis.length > 1) strumAt(midis, t, { volume: 0.7 });
    else if (midis.length) pluckAt(midis[0], t);
    if (onStep) timers.push(setTimeout(() => onStep(i), (t - now()) * 1000));
  });
  const end = (lead + Math.max((spec.seq || []).length, (spec.prog || []).length * (spec.per || 2), spec.kit ? spec.kit.beats * (spec.bars || 2) : 0) * beat + 0.6) * 1000;
  timers.push(setTimeout(() => { if (spec.drone && !spec.keepDrone) droneStop(); onEnd?.(); }, end));
  return () => { timers.forEach(clearTimeout); if (spec.drone) droneStop(); };
}
