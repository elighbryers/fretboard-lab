// Each instrument's own geometry: string numbering, names and tunings (or keys / kit
// for instruments without strings). Theory content - notes, degrees, intervals - is
// shared (js/theory.js, js/lessons/cards.js); only this file and an instrument's own
// See / Try / Play steps know where a note sits.
//
// String numbers follow each instrument's convention, so they never mean the same
// thing across instruments: on guitar string 6 is the low E, on 4-string bass string 4
// is the low E and on 5-string bass string 5 is the low B. Positions are always
// { string, fret } in the numbering of the instrument that owns them.
import { TUNINGS } from './theory.js';

// Strings run high to low (tab order), like TUNINGS.standard.
const str = (name, num, midi) => ({ name, num, midi });

export const INSTRUMENT_DEFS = {
  guitar: {
    id: 'guitar', kind: 'fretted', frets: 15,
    // TUNINGS.standard itself, so the guitar neck, sounds and lessons are unchanged.
    tunings: { standard: TUNINGS.standard },
    defaultTuning: 'standard',
    // How lesson text names each string ("Tap G on the A string").
    stringNames: { 6: 'low E', 5: 'A', 4: 'D', 3: 'G', 2: 'B', 1: 'high e' }
  },
  bass: {
    id: 'bass', kind: 'fretted', frets: 20,
    tunings: {
      standard: { name: 'Standard (E A D G)', strings: [str('G', 1, 43), str('D', 2, 38), str('A', 3, 33), str('E', 4, 28)] },
      five: { name: '5-string (B E A D G)', strings: [str('G', 1, 43), str('D', 2, 38), str('A', 3, 33), str('E', 4, 28), str('B', 5, 23)] },
      dropD: { name: 'Drop D (D A D G)', strings: [str('G', 1, 43), str('D', 2, 38), str('A', 3, 33), str('D', 4, 26)] },
      six: { name: '6-string (B E A D G C)', strings: [str('C', 1, 48), str('G', 2, 43), str('D', 3, 38), str('A', 4, 33), str('E', 5, 28), str('B', 6, 23)] }
    },
    defaultTuning: 'standard',
    stringNames: { 4: 'E', 3: 'A', 2: 'D', 1: 'G' }
  },
  // No strings: theory cards are placed on keys (piano) or used for rhythm only (drums).
  piano: { id: 'piano', kind: 'keys', range: [48, 84] },
  drums: { id: 'drums', kind: 'kit' }
};

export const instrumentDef = id => INSTRUMENT_DEFS[id] || INSTRUMENT_DEFS.guitar;

// The tuning an instrument's neck uses (fretted instruments only; others fall back to guitar).
// Callers pass the instrument (usually getInstrument() from js/storage.js).
export function tuningOf(id, tuningId) {
  const def = instrumentDef(id);
  if (def.kind !== 'fretted') return TUNINGS.standard;
  return def.tunings[tuningId || def.defaultTuning];
}

// The string number used in review item ids ("note:G@s4") and lesson positions. It is the
// instrument's usual number, except on a 6-string bass, where the strings are counted from
// the high C (C = 6 ... B = 1 would clash with 4-string lessons), so we shift by one:
// G = 1, D = 2, A = 3, E = 4, B = 5 on every bass, and the high C is 0.
export const itemNum = (tuning, s) => (tuning === INSTRUMENT_DEFS.bass.tunings.six ? tuning.strings[s].num - 1 : tuning.strings[s].num);
// The board index of the string with that item number (or -1).
export const indexOfNum = (tuning, num) => tuning.strings.findIndex((_, s) => itemNum(tuning, s) === num);
