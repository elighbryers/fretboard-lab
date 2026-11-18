// Helpers for writing lessons. Every label, note name and answer is worked out
// from js/theory.js, and a dot that isn't in its key throws when the lesson file
// loads - so lesson text and the neck can't disagree.
//
// Positions belong to one instrument. makeKit(instrument, tuning) gives the position
// helpers for that instrument's neck, in its own string numbering (js/instruments.js).
// The guitar kit is exported below under the plain names, so guitar lessons read:
// string 6 = low E ... 1 = high e, fret 0 = open. A bass lesson would use
// makeKit('bass'), where string 4 = low E.
// Everything after "Lesson pieces" is instrument-free.
import { midiAt, pcOf, parseNote, preferredName, spell, parseFormula, lookup, INTERVALS } from '../theory.js';
import { INSTRUMENT_DEFS, tuningOf } from '../instruments.js';
import { placeCard } from './cards.js';

// A position on a fretted neck, in the numbering of the instrument that owns it.
export const P = (string, fret, extra = {}) => ({ string, fret, ...extra });
// Where a labelled dot's meaning came from ({ key, kind, id, mode } or { note }), kept
// out of the dot's data (not enumerable) so lessons look exactly the same. The theory
// card check (js/lessons/cards.js) reads it.
const tagged = (dot, src) => Object.defineProperty(dot, 'src', { value: src, enumerable: false });

export function makeKit(instrument = 'guitar', tuningId) {
  const tuning = tuningOf(instrument, tuningId);
  const def = INSTRUMENT_DEFS[instrument];
  const sIdx = n => tuning.strings.findIndex(x => x.num === n);
  const midiOf = (string, fret) => midiAt(sIdx(string), fret, tuning);
  const pcAt = (string, fret) => pcOf(midiOf(string, fret));
  const nameAt = (string, fret) => preferredName(pcAt(string, fret));
  const ALL = tuning.strings.map(x => x.num).sort((a, b) => b - a);

  // Every position (in a fret range, on some strings) holding pitch class pc.
  function spots(pc, { strings = ALL, from = 0, to = 12 } = {}) {
    const out = [];
    strings.forEach(string => { for (let f = from; f <= to; f++) if (pcAt(string, f) === pcOf(pc)) out.push(P(string, f)); });
    return out;
  }
  // The fret of a named note on a string (lowest at or after `from`).
  function fretOf(name, string, from = 0) {
    const pc = parseNote(name);
    for (let f = from; f <= from + 11; f++) if (pcAt(string, f) === pc) return f;
    throw new Error(`no ${name} on string ${string}`);
  }
  // A dot labelled with its note name (sharps/flats as players write them alone).
  const noteDot = (string, fret, extra = {}) => tagged(P(string, fret, { label: nameAt(string, fret), ...extra }), { note: nameAt(string, fret) });

  // A key + scale or chord, for labelling and finding notes:
  //   const G = inKey('G', 'scale', 'major');
  //   G.dot(6, 3) -> { string: 6, fret: 3, label: 'R', role: 'root' }   (throws if not in G major)
  //   G.dot(6, 3, 'note') -> label 'G';  G.name('3') -> 'B';  G.spots('3') -> every B in frets 0-12
  function inKey(key, kind, id) {
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
      dot: (string, fret, mode = 'deg', extra = {}) => { const x = info(string, fret); return tagged(P(string, fret, { label: mode === 'note' ? x.name : x.label, role: x.role, ...extra }), { key, kind, id, mode }); },
      dots: (list, mode = 'deg') => list.map(([s, f]) => { const x = info(s, f); return tagged(P(s, f, { label: mode === 'note' ? x.name : x.label, role: x.role }), { key, kind, id, mode }); }),
      name: label => deg(label).name,
      pc: label => pcOf(keyPc + deg(label).semi),
      spots: (label, opts) => spots(pcOf(keyPc + deg(label).semi), opts),
      // Every position of the scale/chord in a fret range, labelled.
      all: ({ strings = ALL, from = 0, to = 12, mode = 'deg' } = {}) => {
        const out = [];
        strings.forEach(s => { for (let f = from; f <= to; f++) if (byPc.has(pcAt(s, f))) { const x = byPc.get(pcAt(s, f)); out.push(tagged(P(s, f, { label: mode === 'note' ? x.name : x.label, role: x.role }), { key, kind, id, mode })); } });
        return out;
      }
    };
  }

  // The interval label (R, b3, 5 ...) of a position above a root position.
  const intervalLabel = (root, pos) => INTERVALS[pcOf(midiOf(pos.string, pos.fret) - midiOf(root.string, root.fret))];

  // Every position sounding exactly this MIDI note (same pitch, not just the same name).
  function exact(midi, { strings = ALL, from = 0, to = 12 } = {}) {
    const out = [];
    strings.forEach(s => { const f = midi - midiOf(s, 0); if (f >= from && f <= to) out.push(P(s, f)); });
    return out;
  }
  // Positions `semis` above a root position, e.g. above(P(6, 3), 4) = the major 3rds above G.
  const above = (root, semis, opts) => exact(midiOf(root.string, root.fret) + semis, opts);

  return { instrument, tuning, STRING: { ...def.stringNames }, ALL, sIdx, midiOf, pcAt, nameAt, spots, fretOf, noteDot, inKey, intervalLabel, exact, above };
}

// The guitar kit, under the names the guitar lessons use.
const guitar = makeKit('guitar');
export const { sIdx, midiOf, pcAt, nameAt, STRING, ALL, spots, fretOf, noteDot, inKey, intervalLabel, exact, above } = guitar;
// A shared theory card (js/lessons/cards.js) placed on the guitar neck: checked against the card's music.
export const card = (id, board) => placeCard(id, board, pcAt);

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
