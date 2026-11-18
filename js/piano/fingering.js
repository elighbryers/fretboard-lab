// One-octave scale fingerings, ascending, checked against standard fingering charts
// (pianoscales.org "Piano Major Scales" and Baylor OpenBooks "Piano Basics", opened 2026-11-18):
// C, G, D, A and E major share RH 1 2 3 1 2 3 4 5 and LH 5 4 3 2 1 3 2 1; F major has RH
// 1 2 3 4 1 2 3 4 and the same LH. A natural minor (all white keys) uses the C major fingering.
// Other keys are left out on purpose: we could not confirm them, so nothing is shown for them.
// Following the P.I.A.N.O. study (research-piano.md D1), only the important finger changes are
// marked: the first finger and each thumb crossing (or finger crossing over the thumb).
import { lookup, parseFormula, pcOf } from '../theory.js';

const CAGED = { R: [1, 2, 3, 1, 2, 3, 4, 5], L: [5, 4, 3, 2, 1, 3, 2, 1] };
export const FINGERINGS = {
  'major:0': CAGED, 'major:7': CAGED, 'major:2': CAGED, 'major:9': CAGED, 'major:4': CAGED,
  'major:5': { R: [1, 2, 3, 4, 1, 2, 3, 4], L: [5, 4, 3, 2, 1, 3, 2, 1] },
  'minor:9': CAGED
};
const ALIAS = { ionian: 'major', aeolian: 'minor' };
// The full fingering of a scale (or null when we don't show one): { R: [8 fingers], L: [...] }.
export function fullFingering(keyPc, scaleId) { return FINGERINGS[`${ALIAS[scaleId] || scaleId}:${pcOf(keyPc)}`] || null; }
// Indexes worth showing: the first note and every crossing (thumb after a longer finger, or a finger after the thumb).
// Going up, the right hand's thumb passes under (thumb after a finger); the left hand's finger crosses over the thumb.
export const crossings = (fingers, hand = 'R') => fingers.map((f, i) => (i === 0 || (hand === 'R' ? f === 1 && fingers[i - 1] > 1 : fingers[i - 1] === 1 && f > 1)) ? i : -1).filter(i => i >= 0);

// For the keyboard: { map: { midi: { n, hand } }, note } with RH from middle C up and LH an octave below.
export function scaleFingering(keyPc, scaleId, hands = 'RH') {
  const f = fullFingering(keyPc, scaleId);
  if (!f) return null;
  const semis = [...parseFormula(lookup('scale', scaleId).formula).map(d => d.semi), 12], map = {}, notes = [];
  const place = (hand, base) => crossings(f[hand], hand).forEach(i => { map[base + semis[i]] = { n: f[hand][i], hand: hand === 'R' ? 'R' : 'L' }; });
  if (hands === 'RH' || hands === 'both') { place('R', 60 + pcOf(keyPc)); notes.push(`RH ${f.R.join(' ')}`); }
  if (hands === 'LH' || hands === 'both') { place('L', 48 + pcOf(keyPc)); notes.push(`LH ${f.L.join(' ')}`); }
  return { map, note: `Fingering, going up: ${notes.join(' · ')}. Marked: where to start and where the thumb crosses.` };
}
