// Helpers for writing bass lessons (4-string numbering: string 4 = low E ... 1 = G, fret 0 = open).
// Built on js/lessons/kit.js, so every label and answer is worked out by js/theory.js and a dot
// that isn't in its key throws when the file loads. Every tap task and question carries its
// review item ("note:A@s4"), so nothing depends on guitar numbering.
import { makeKit, P, tap as gtap, choice, task as gtask, degreeItem, toneItem } from '../../lessons/kit.js';
import { autoPlace, CARDS } from '../../lessons/cards.js';
import { NOTES, pcOf } from '../../theory.js';

export const K = makeKit('bass');
export { P, choice, degreeItem, toneItem };
const first = a => (Array.isArray(a) ? a[0] : a);
export const noteItem = p => `note:${NOTES[K.pcAt(p.string, p.fret)]}@s${p.string}`;
// "A on the E string" etc.
export const at = (name, string, from = 0) => P(string, K.fretOf(name, string, from));
export const task = (prompt, answer, extra = {}) => gtask(prompt, answer, { item: noteItem(first(answer)), ...extra });
export const tap = (prompt, answer, extra = {}) => gtap(prompt, answer, { item: noteItem(first(answer)), ...extra });
// A note-name dot.
export const nd = (string, fret, extra) => K.noteDot(string, fret, extra);
// A shared theory card placed on the bass neck (frets 0-12 unless a view is given).
export const S = (id, view = [0, 12]) => { if (!CARDS[id]) throw new Error('no card ' + id); return autoPlace(id, K, view); };
// A rhythm-grid card / task: notes and kick as 16th steps in one 4/4 bar.
export const grid = (text, notes, { kick = [0, 8], snare, midi = 33, bpm = 80, beats = 4, sub = 4 } = {}) =>
  ({ text, grid: { notes, kick, snare, midi, bpm, beats, sub } });
export const gridTask = (prompt, notes, { kick = [0, 8], midi = 33, bpm = 80, item, beats = 4, sub = 4 } = {}) =>
  ({ prompt, grid: { notes, kick, midi, bpm, beats, sub }, item: item || `rhythm:bass-${notes.join('-')}`, answer: null });
// A technique card: one idea plus three things to try and tick.
export const tech = (text, items) => ({ text, technique: items });
// Sound specs: positions as a sequence, with drums under them.
export const seq = (positions, bpm = 90, extra = {}) => ({ seq: positions.map(p => (p == null ? null : Array.isArray(p) ? p.map(q => P(q.string, q.fret)) : P(p.string, p.fret))), bpm, drums: true, ...extra });
// The positions (lowest fret first) of a pitch class on some strings.
export const spotsOf = (name, strings = [4, 3, 2, 1], from = 0, to = 12) => K.spots(pcOf(NOTES.indexOf(name) >= 0 ? NOTES.indexOf(name) : 0), { strings, from, to });
