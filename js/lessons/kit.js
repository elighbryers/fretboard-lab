// Helpers for writing lessons. Every label, note name and answer is worked out
// from js/theory.js, and a dot that isn't in its key throws when the lesson file
// loads - so lesson text and the neck can't disagree.
// Positions use guitar numbering: string 6 = low E ... 1 = high e, fret 0 = open.
import { TUNINGS, midiAt, pcOf, parseNote, preferredName, spell, parseFormula, lookup, INTERVALS } from '../theory.js';

const tuning = TUNINGS.standard;
export const sIdx = n => tuning.strings.findIndex(x => x.num === n);
export const midiOf = (string, fret) => midiAt(sIdx(string), fret, tuning);
export const pcAt = (string, fret) => pcOf(midiOf(string, fret));
export const nameAt = (string, fret) => preferredName(pcAt(string, fret));
export const STRING = { 6: 'low E', 5: 'A', 4: 'D', 3: 'G', 2: 'B', 1: 'high e' };
export const P = (string, fret, extra = {}) => ({ string, fret, ...extra });
export const ALL = [6, 5, 4, 3, 2, 1];

// Every position (in a fret range, on some strings) holding pitch class pc.
export function spots(pc, { strings = ALL, from = 0, to = 12 } = {}) {
  const out = [];
  strings.forEach(string => { for (let f = from; f <= to; f++) if (pcAt(string, f) === pcOf(pc)) out.push(P(string, f)); });
  return out;
}
// The fret of a named note on a string (lowest at or after `from`).
export function fretOf(name, string, from = 0) {
  const pc = parseNote(name);
  for (let f = from; f <= from + 11; f++) if (pcAt(string, f) === pc) return f;
  throw new Error(`no ${name} on string ${string}`);
}
// A dot labelled with its note name (sharps/flats as players write them alone).
export const noteDot = (string, fret, extra = {}) => P(string, fret, { label: nameAt(string, fret), ...extra });

// A key + scale or chord, for labelling and finding notes:
//   const G = inKey('G', 'scale', 'major');
//   G.dot(6, 3) -> { string: 6, fret: 3, label: 'R', role: 'root' }   (throws if not in G major)
//   G.dot(6, 3, 'note') -> label 'G';  G.name('3') -> 'B';  G.spots('3') -> every B in frets 0-12
export function inKey(key, kind, id) {
  const keyPc = parseNote(key), item = lookup(kind, id);
  if (!item) throw new Error(`unknown ${kind} ${id}`);
  const degs = parseFormula(item.formula), sp = spell(keyPc, degs);
  const byPc = new Map();
  degs.forEach((d, k) => { const pc = pcOf(keyPc + d.semi); if (!byPc.has(pc)) byPc.set(pc, { ...d, name: sp.notes[k] }); });
  const byLabel = new Map(degs.map((d, k) => [d.label, { ...d, name: sp.notes[k] }]));
  const info = (string, fret) => {
    const x = byPc.get(pcAt(string, fret));
    if (!x) throw new Error(`string ${string} fret ${fret} (${nameAt(string, fret)}) is not in ${key} ${id}`);
    return x;
  };
  const deg = label => {
    const x = byLabel.get(label);
    if (!x) throw new Error(`${label} is not in ${key} ${id}`);
    return x;
  };
  return {
    key: sp.root, keyPc, id, kind, notes: sp.notes, labels: degs.map(d => d.label),
    title: `${sp.root} ${item.name.replace(/ \(.*\)$/, '').toLowerCase()}`,
    info,
    dot: (string, fret, mode = 'deg', extra = {}) => { const x = info(string, fret); return P(string, fret, { label: mode === 'note' ? x.name : x.label, role: x.role, ...extra }); },
    dots: (list, mode = 'deg') => list.map(([s, f]) => { const x = info(s, f); return P(s, f, { label: mode === 'note' ? x.name : x.label, role: x.role }); }),
    name: label => deg(label).name,
    pc: label => pcOf(keyPc + deg(label).semi),
    spots: (label, opts) => spots(pcOf(keyPc + deg(label).semi), opts),
    // Every position of the scale/chord in a fret range, labelled.
    all: ({ strings = ALL, from = 0, to = 12, mode = 'deg' } = {}) => {
      const out = [];
      strings.forEach(s => { for (let f = from; f <= to; f++) if (byPc.has(pcAt(s, f))) { const x = byPc.get(pcAt(s, f)); out.push(P(s, f, { label: mode === 'note' ? x.name : x.label, role: x.role })); } });
      return out;
    }
  };
}

// The interval label (R, b3, 5 ...) of a position above a root position.
export const intervalLabel = (root, pos) => INTERVALS[pcOf(midiOf(pos.string, pos.fret) - midiOf(root.string, root.fret))];

// Lesson pieces.
export const tap = (prompt, answer, extra = {}) => ({ type: 'tap', prompt, answer, ...extra });
export const choice = (prompt, options, answer, item, extra = {}) => {
  if (!options.includes(answer)) throw new Error(`answer ${answer} not in options for "${prompt}"`);
  return { type: 'choice', prompt, options, answer, item, ...extra };
};
export const task = (prompt, answer, extra = {}) => ({ prompt, answer, ...extra });
// Review ids for things a lesson teaches (see js/review-screen.js).
export const degreeItem = (k, label) => `degree:${k.key}:${k.id}:${label}`;
export const toneItem = (k, label) => `tone:${k.key}:${k.id}:${label}`;
// A sequence through positions, as a sound spec.
export const seqOf = (positions, bpm = 90, extra = {}) => ({ seq: positions.map(p => (Array.isArray(p) ? p.map(q => P(q.string, q.fret)) : p && P(p.string, p.fret))), bpm, ...extra });

// Every position sounding exactly this MIDI note (same pitch, not just the same name).
export function exact(midi, { strings = ALL, from = 0, to = 12 } = {}) {
  const out = [];
  strings.forEach(s => { const f = midi - midiOf(s, 0); if (f >= from && f <= to) out.push(P(s, f)); });
  return out;
}
// Positions `semis` above a root position, e.g. above(P(6, 3), 4) = the major 3rds above G.
export const above = (root, semis, opts) => exact(midiOf(root.string, root.fret) + semis, opts);
