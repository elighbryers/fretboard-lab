// Piano play-alongs: one data format, three views (piano roll / falling notes, staff, chord chart).
// Only public-domain melodies, arranged for this app, and original etudes (research-piano.md E).
//   { id, title, source, bpm, time, difficulty, key, level, chords: ['C', ...] one per bar,
//     rh: [[note | null, beats], ...],            note = 'E4' (scientific pitch), null = rest
//     lh: [[note | [notes] | null, beats], ...]   written left hand, or
//     lhPattern: 'root' | 'fifth' | 'broken' | 'alberti' | ...   built from the chords (js/piano/voicing.js) }
// The validator (tools/validate-lessons.mjs) checks bar lengths, ranges, chord symbols, and that
// every melody note is in the key (or listed in `chromatic`).
const n = (note, beats) => [note, beats];
const seq = (str, beats = 1) => str.split(' ').map(x => (x === '-' ? [null, beats] : [x, beats]));

export const PIECES = [
  {
    id: 'five-finger-c', title: 'Five-Finger Walk in C', source: 'Original etude', bpm: 80, time: [4, 4], difficulty: 'easy', key: 'C', level: 1,
    chords: ['C', 'C', 'G', 'C'], lhPattern: 'root',
    rh: [...seq('C4 D4 E4 F4'), ...seq('G4 F4 E4 D4'), ...seq('E4 F4 G4 D4'), n('C4', 4)]
  },
  {
    id: 'hot-cross-buns', title: 'Hot Cross Buns', source: 'Traditional (English street cry), public domain', bpm: 90, time: [4, 4], difficulty: 'easy', key: 'C', level: 1,
    chords: ['C', 'C', 'C', 'C'], lhPattern: 'root',
    rh: [n('E4', 1), n('D4', 1), n('C4', 2), n('E4', 1), n('D4', 1), n('C4', 2), ...seq('C4 C4 C4 C4 D4 D4 D4 D4', 0.5), n('E4', 1), n('D4', 1), n('C4', 2)]
  },
  {
    id: 'ode-to-joy', title: 'Ode to Joy', source: 'Beethoven, Symphony No. 9 (1824), theme, public domain', bpm: 96, time: [4, 4], difficulty: 'easy', key: 'C', level: 1,
    chords: ['C', 'G', 'C', 'G', 'C', 'G', 'C', 'C'], lhPattern: 'fifth',
    rh: [...seq('E4 E4 F4 G4'), ...seq('G4 F4 E4 D4'), ...seq('C4 C4 D4 E4'), n('E4', 1.5), n('D4', 0.5), n('D4', 2),
      ...seq('E4 E4 F4 G4'), ...seq('G4 F4 E4 D4'), ...seq('C4 C4 D4 E4'), n('D4', 1.5), n('C4', 0.5), n('C4', 2)]
  },
  {
    id: 'aura-lee', title: 'Aura Lee', source: 'George R. Poulton (1861), public domain', bpm: 84, time: [4, 4], difficulty: 'easy', key: 'C', level: 1, chromatic: [],
    chords: ['C', 'D', 'G', 'C', 'C', 'D', 'G', 'C'], lhPattern: 'root',
    rh: [...seq('G4 C5 B4 C5'), n('D5', 1), n('A4', 1), n('D5', 2), ...seq('C5 B4 A4 B4'), n('C5', 4),
      ...seq('G4 C5 B4 C5'), n('D5', 1), n('A4', 1), n('D5', 2), ...seq('C5 B4 A4 B4'), n('C5', 4)]
  },
  {
    id: 'lightly-row', title: 'Lightly Row', source: 'Traditional (German folk song), public domain', bpm: 96, time: [4, 4], difficulty: 'easy', key: 'C', level: 2,
    chords: ['C', 'G', 'C', 'C', 'C', 'G', 'C', 'C'], lhPattern: 'root',
    rh: [n('G4', 1), n('E4', 1), n('E4', 2), n('F4', 1), n('D4', 1), n('D4', 2), ...seq('C4 D4 E4 F4'), n('G4', 1), n('G4', 1), n('G4', 2),
      n('G4', 1), n('E4', 1), n('E4', 2), n('F4', 1), n('D4', 1), n('D4', 2), ...seq('C4 E4 G4 G4'), n('C4', 4)]
  },
  {
    id: 'minuet-g', title: 'Minuet in G (right hand)', source: 'Christian Petzold, attr. J. S. Bach, BWV Anh. 114, public domain', bpm: 100, time: [3, 4], difficulty: 'medium', key: 'G', level: 2,
    chords: ['G', 'G', 'C', 'G', 'C', 'G', 'D', 'D'], lhPattern: 'root',
    rh: [n('D5', 1), ...seq('G4 A4 B4 C5', 0.5), n('D5', 1), n('G4', 1), n('G4', 1), n('E5', 1), ...seq('C5 D5 E5 F#5', 0.5), n('G5', 1), n('G4', 1), n('G4', 1),
      n('C5', 1), ...seq('D5 C5 B4 A4', 0.5), n('B4', 1), ...seq('C5 B4 A4 G4', 0.5), n('F#4', 1), ...seq('G4 A4 B4 G4', 0.5), n('A4', 3)]
  },
  {
    id: 'amazing-grace-piano', title: 'Amazing Grace', source: '"New Britain" (1835), public domain', bpm: 80, time: [3, 4], difficulty: 'easy', key: 'G', level: 3,
    chords: ['G', 'G', 'G', 'C', 'G', 'G', 'G', 'D', 'D'], lhPattern: 'fifth',
    rh: [n(null, 2), n('D4', 1), n('G4', 2), n('B4', 0.5), n('G4', 0.5), n('B4', 2), n('A4', 1), n('G4', 2), n('E4', 1), n('D4', 2), n('D4', 1),
      n('G4', 2), n('B4', 0.5), n('G4', 0.5), n('B4', 2), n('A4', 1), n('D5', 3), n('D5', 3)]
  },
  {
    id: 'greensleeves-piano', title: 'Greensleeves', source: 'Traditional English (16th century), public domain', bpm: 90, time: [3, 4], difficulty: 'medium', key: 'Am', level: 3, chromatic: ['G#4'],
    chords: ['Am', 'Am', 'Am', 'G', 'G', 'Am', 'Am', 'E', 'Am'], lhPattern: 'broken',
    rh: [n(null, 2), n('A4', 1), n('C5', 2), n('D5', 1), n('E5', 1.5), n('F5', 0.5), n('E5', 1), n('D5', 2), n('B4', 1), n('G4', 1.5), n('A4', 0.5), n('B4', 1),
      n('C5', 2), n('A4', 1), n('A4', 1.5), n('G#4', 0.5), n('A4', 1), n('B4', 2), n('G#4', 1), n('E4', 3)]
  },
  {
    id: 'saints-piano', title: 'When the Saints Go Marching In', source: 'Traditional, public domain', bpm: 100, time: [4, 4], difficulty: 'easy', key: 'C', level: 4,
    chords: ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'G'], lhPattern: 'octave',
    rh: [n(null, 1), ...seq('C4 E4 F4'), n('G4', 4), n(null, 1), ...seq('C4 E4 F4'), n('G4', 4), n(null, 1), ...seq('C4 E4 F4'), n('G4', 2), n('E4', 2), n('C4', 2), n('E4', 2), n('D4', 4)]
  },
  {
    id: 'k545-opening', title: 'Sonata K. 545, opening (simplified)', source: 'Mozart (1788), public domain', bpm: 96, time: [4, 4], difficulty: 'medium', key: 'C', level: 5,
    chords: ['C', 'G7', 'F', 'C'], lhPattern: 'alberti',
    rh: [n('C5', 2), n('E5', 1), n('G5', 1), n('B4', 1.5), n('C5', 0.25), n('D5', 0.25), n('C5', 2), n('A5', 2), n('G5', 1), n('C6', 1), n('G5', 1), n('F5', 1), n('E5', 2)]
  },
  {
    id: 'entertainer-simple', title: 'The Entertainer (opening, simplified)', source: 'Scott Joplin (1902), public domain', bpm: 80, time: [4, 4], difficulty: 'medium', key: 'C', level: 5, chromatic: ['D#5', 'D#6'],
    chords: ['C', 'C', 'C', 'G7'], lhPattern: 'octave',
    rh: [n('D5', 0.5), n('D#5', 0.5), n('E5', 0.5), n('C6', 1), n('E5', 0.5), n('C6', 1), n('E5', 0.5), n('C6', 3.5),
      ...seq('C6 D6 D#6 E6 C6 D6', 0.5), n('E6', 1), n('B5', 0.5), n('D6', 1), n('C6', 2.5)]
  },
  {
    id: 'gymnopedie-1', title: 'Gymnopédie No. 1 (opening)', source: 'Erik Satie (1888), public domain', bpm: 72, time: [3, 4], difficulty: 'medium', key: 'D', level: 6,
    chords: ['Gmaj7', 'Dmaj7', 'Gmaj7', 'Dmaj7', 'Gmaj7', 'Dmaj7', 'Gmaj7', 'Dmaj7'],
    lh: [n('G2', 1), n(['B3', 'D4', 'F#4'], 2), n('D2', 1), n(['A3', 'C#4', 'F#4'], 2), n('G2', 1), n(['B3', 'D4', 'F#4'], 2), n('D2', 1), n(['A3', 'C#4', 'F#4'], 2),
      n('G2', 1), n(['B3', 'D4', 'F#4'], 2), n('D2', 1), n(['A3', 'C#4', 'F#4'], 2), n('G2', 1), n(['B3', 'D4', 'F#4'], 2), n('D2', 1), n(['A3', 'C#4', 'F#4'], 2)],
    rh: [n(null, 3), n(null, 3), n(null, 3), n(null, 3), n(null, 1), n('F#5', 1), n('A5', 1), n('G5', 1), n('F#5', 1), n('C#5', 1), n('B4', 1), n('C#5', 1), n('D5', 1), n('A4', 3)]
  },
  {
    id: 'black-key-etude', title: 'Black-Key Pentatonic Etude', source: 'Original etude (G♭ major pentatonic)', bpm: 84, time: [4, 4], difficulty: 'easy', key: 'Gb', level: 2, scale: 'major-pentatonic',
    chords: ['Gb', 'Gb', 'Db', 'Gb'], lhPattern: 'fifth',
    rh: [...seq('Gb4 Ab4 Bb4 Db5'), ...seq('Eb5 Db5 Bb4 Ab4'), ...seq('Bb4 Ab4 Gb4 Ab4'), n('Gb4', 4)]
  },
  {
    id: 'waltz-of-thirds', title: 'Waltz of Thirds', source: 'Original etude', bpm: 100, time: [3, 4], difficulty: 'medium', key: 'F', level: 4,
    chords: ['F', 'C', 'C', 'F', 'Bb', 'F', 'C', 'F'], lhPattern: 'broken',
    rh: [n('A4', 2), n('C5', 1), n('G4', 2), n('E4', 1), n('C5', 2), n('Bb4', 1), n('A4', 3), n('Bb4', 2), n('D5', 1), n('C5', 2), n('A4', 1), n('E4', 1), n('G4', 1), n('Bb4', 1), n('F4', 3)]
  }
];
export const findPiece = id => PIECES.find(p => p.id === id);

/* ---------- pure helpers (tests/piano.test.mjs) ---------- */
const LETTER = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
// 'F#4' -> 66, 'Bb3' -> 58, 'C4' -> 60
export function midiOfName(name) {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  if (!m) throw new Error('bad note ' + name);
  return 12 * (+m[3] + 1) + LETTER[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
// [{ hand, start, beats, midis: [...], bar }] for both hands (LH built from lhPattern if not written).
export function pieceEvents(piece, lhBarFn) {
  const bar = piece.time[0] * 4 / piece.time[1], out = [];
  const add = (hand, list) => { let t = 0; list.forEach(([note, beats]) => { if (note != null) out.push({ hand, start: t, beats, midis: [].concat(note).map(midiOfName), bar: Math.floor(t / bar + 1e-6) }); t += beats; }); };
  add('R', piece.rh);
  if (piece.lh) add('L', piece.lh);
  else if (piece.lhPattern && lhBarFn) piece.chords.forEach((c, b) => lhBarFn(piece.lhPattern, c, piece.time[0]).forEach(e => out.push({ hand: 'L', start: b * bar + e.beat, beats: e.dur, midis: e.midis, bar: b })));
  return out.sort((a, b) => a.start - b.start || (a.hand === 'L' ? -1 : 1));
}
export const barsOf = piece => piece.chords.length;
