// Play-along tabs. Each file in this folder is content only; add a tab by
// writing a file and listing it here. Format (see README):
//   { id, title, source, bpm, time: [beatsPerBar, beatUnit], difficulty: 'easy'|'medium',
//     notes: [[string, fret, beats], ...] }   string 6 = low E ... 1 = high e, 0 = rest;
//                                             beats in quarter notes (0.5 = eighth)
import chromatic from './chromatic-warmup.js';
import gMajor from './g-major-scale.js';
import aMinor from './a-minor-pentatonic-riff.js';
import eShuffle from './e-blues-shuffle.js';
import ode from './ode-to-joy.js';
import greensleeves from './greensleeves.js';
import grace from './amazing-grace.js';

export const PLAYALONG = [chromatic, gMajor, aMinor, ode, grace, greensleeves, eShuffle];
export const findTab = id => PLAYALONG.find(t => t.id === id) || null;

// Beats (quarter notes) in one bar: 4/4 -> 4, 3/4 -> 3, 6/8 -> 3.
export const barBeats = tab => tab.time[0] * 4 / tab.time[1];

// Notes with start times: [{ i, string, fret, beats, start, rest }]
export function timeline(tab) {
  let t = 0;
  return tab.notes.map(([string, fret, beats], i) => {
    const e = { i, string, fret, beats, start: t, rest: string === 0 };
    t += beats;
    return e;
  });
}
