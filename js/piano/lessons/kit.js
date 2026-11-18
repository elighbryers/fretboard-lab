// Helpers for writing piano lessons. A position is a key: { string: 0, fret: midi, midi }
// (the shape the lesson player's keyboard adapter reads). Note names are scientific pitch:
// 'C4' = Middle C = MIDI 60. Labels and answers come from js/theory.js; a dot that isn't in its
// key throws when the file loads. Every tap carries its review item ('key:F#', a degree, an interval...).
import { tap as gtap, choice, task as gtask, degreeItem, toneItem } from '../../lessons/kit.js';
import { autoPlace, placeCard, CARDS } from '../../lessons/cards.js';
import { pcOf, preferredName, parseNote, lookup, parseFormula, spell } from '../../theory.js';
import { midiOfName } from '../pieces.js';

export { choice, degreeItem, toneItem };
export const K = name => { const m = typeof name === 'number' ? name : midiOfName(name); return { string: 0, fret: m, midi: m }; };
const first = a => (Array.isArray(a) ? a[0] : a);
export const keyItem = p => `key:${preferredName(p.midi ?? p.fret)}`;
// Every key with this name in a range (for "Tap any D").
export const all = (name, [lo, hi] = [48, 72]) => { const out = []; for (let m = lo; m <= hi; m++) if (pcOf(m) === parseNote(name)) out.push(K(m)); return out; };
const answer = a => (Array.isArray(a) ? a.map(x => (typeof x === 'object' ? x : K(x))) : typeof a === 'object' ? a : K(a));
export const task = (prompt, a, extra = {}) => { const ans = answer(a); return gtask(prompt, ans, { item: keyItem(first(ans)), ...extra }); };
export const tap = (prompt, a, extra = {}) => { const ans = answer(a); return gtap(prompt, ans, { item: keyItem(first(ans)), ...extra }); };
// A dot labelled with its note name (or a given label).
export const kd = (name, extra = {}) => { const k = K(name); return { ...k, label: preferredName(k.midi), ...extra }; };
// Keys of a scale or chord, labelled by degree (or note name), checked against the key.
export function inKey(key, kind, id) {
  const keyPc = parseNote(key), degs = parseFormula(lookup(kind, id).formula), sp = spell(keyPc, degs);
  const info = m => { const k = degs.findIndex(d => pcOf(keyPc + d.semi) === pcOf(m)); if (k < 0) throw new Error(`${m} is not in ${key} ${id}`); return { ...degs[k], name: sp.notes[k] }; };
  const dot = (name, mode = 'deg', extra = {}) => { const k = K(name), x = info(k.midi); return { ...k, label: mode === 'note' ? x.name : x.label, role: x.role, ...extra }; };
  return { key: sp.root, keyPc, id, notes: sp.notes, dot, dots: (names, mode) => names.map(n => dot(n, mode)), name: label => sp.notes[degs.findIndex(d => d.label === label)] };
}
// The "kit" autoPlace needs: spots of a pitch class in a key range.
export const KIT = { spots: (pc, { from, to }) => { const out = []; for (let m = from; m <= to; m++) if (pcOf(m) === pcOf(pc)) out.push(K(m)); return out; }, pcAt: (s, f) => pcOf(f) };
// A shared theory card placed on the keys (view = [low, high] MIDI).
export const S = (id, view = [60, 83]) => { if (!CARDS[id]) throw new Error('no card ' + id); const c = autoPlace(id, KIT, view); placeCard(id, c.board, KIT.pcAt); return c; };
export const tech = (text, items, image) => ({ text, technique: items, image });
// Sound: MIDI numbers (or names) one per beat; arrays sound together.
export const seq = (notes, bpm = 90, extra = {}) => ({ seq: notes.map(n => (n == null ? null : Array.isArray(n) ? n.map(x => answer(x).midi) : answer(n).midi)), bpm, ...extra });
export const keys = names => names.map(n => (n == null ? null : Array.isArray(n) ? n.map(K) : K(n)));
export const board = (view, dots, opts) => ({ view, dots, ...(opts ? { opts } : {}) });
