// Helpers for writing drum lessons. A position is a pad: { string: 0, fret: index in KIT }.
// Grooves are written like the groove player: { piece: 'x.x.' } over a 16th grid (or 12 steps
// for triplets). Rhythm-only (shared) ideas are written without any kit geometry.
import { choice, tap as gtap, task as gtask } from '../../lessons/kit.js';
import { KIT, fromPatterns } from '../kit.js';

export { choice };
export const D = id => { const f = KIT.findIndex(p => p.id === id); if (f < 0) throw new Error('no drum ' + id); return { string: 0, fret: f }; };
const ans = a => [].concat(a).map(x => (typeof x === 'string' ? D(x) : x));
export const task = (prompt, a, extra = {}) => gtask(prompt, ans(a).length === 1 ? ans(a)[0] : ans(a), { item: `pad:${KIT[ans(a)[0].fret].id}`, ...extra });
export const tap = (prompt, a, extra = {}) => gtap(prompt, ans(a).length === 1 ? ans(a)[0] : ans(a), { item: `pad:${KIT[ans(a)[0].fret].id}`, ...extra });
export const G = (parts, opts = {}) => fromPatterns(parts, opts);
// Sound: a groove on the kit for `bars` bars.
export const kit = (parts, bpm = 80, bars = 2, opts = {}) => ({ seq: [null], kit: G(parts, opts), bpm, bars });
// Pads lit one beat at a time (arrays = together).
export const seq = steps => steps.map(s => (s == null ? null : Array.isArray(s) ? s.map(D) : D(s)));
export const pads = (ids, labels = {}) => ids.map(id => ({ ...D(id), label: labels[id] }));
// A rhythm-grid card / task on one drum (16th steps), with optional kick/snare rows to lock to.
export const dgrid = (text, notes, { piece = 'snare', label, kick, snare, sub = 4, bpm = 80, beats = 4 } = {}) => ({ text, grid: { notes, piece, label: label || KIT.find(p => p.id === piece).name, kick, snare, sub, bpm, beats } });
export const dgridTask = (prompt, notes, { piece = 'snare', label, kick, sub = 4, bpm = 80, item, beats = 4 } = {}) =>
  ({ prompt, grid: { notes, piece, label: label || KIT.find(p => p.id === piece).name, kick, sub, bpm, beats }, item: item || `count:${notes.join('-')}`, answer: null });
export const tech = (text, items, image) => ({ text, technique: items, image });
export const board = (dots, extra = {}) => ({ view: [0, 9], dots, ...extra });
// A scored Play step on the kit.
export const play = (text, parts, { bpm = 70, bars = 4, opts = {}, only } = {}) => ({ type: 'drumplay', text, groove: G(parts, opts), bpm, bars, only });
