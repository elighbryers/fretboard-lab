// Roman numerals in a major key -> chords, spelled by theory.js.
//   chordOf('G', 'vi') -> { root: 4, chord: 'minor', name: 'Em', roman: 'vi' }
// Upper case = major, lower case = minor, '°' = diminished; a suffix 7 /
// maj7 picks the 7th chord (V7 = dominant 7, ii7 = m7, Imaj7, vii°7 = m7b5).
import { parseNote, spell, lookup } from './theory.js';

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const MAJOR = '1 2 3 4 5 6 7';
const SUFFIX = { major: '', minor: 'm', dim: '°', '7': '7', maj7: 'maj7', m7: 'm7', m7b5: 'm7b5' };

export function chordOf(key, roman) {
  const m = /^(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)(°)?(maj7|7)?$/.exec(roman);
  if (!m) throw new Error('bad numeral ' + roman);
  const degree = NUMERALS.indexOf(m[1].toUpperCase()), minor = m[1] === m[1].toLowerCase();
  const keyPc = parseNote(key), sp = spell(keyPc, MAJOR);
  const rootName = sp.notes[degree], root = parseNote(rootName);
  let chord = m[2] ? 'dim' : minor ? 'minor' : 'major';
  if (m[3] === 'maj7') chord = 'maj7';
  else if (m[3] === '7') chord = m[2] ? 'm7b5' : minor ? 'm7' : '7';
  return { root, chord, name: rootName + SUFFIX[chord], roman, rootName };
}

export const progression = (key, romans) => romans.map(r => chordOf(key, r));
// 'G:major' style strings for sound specs.
export const chordSpecs = (key, romans) => progression(key, romans).map(c => `${c.rootName}:${c.chord}`);
export const chordName = (rootName, chordId) => rootName + (SUFFIX[chordId] ?? (lookup('chord', chordId) ? chordId : ''));

export const TWELVE_BAR = ['I7', 'I7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'];
