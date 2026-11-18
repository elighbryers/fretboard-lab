// The piano Learn path: six levels in the order of docs/research-piano.md section E.
import level1 from './level1.js';
import level2 from './level2.js';
import level3 from './level3.js';
import level4 from './level4.js';
import level5 from './level5.js';
import level6 from './level6.js';
export const PIANO_LEVELS = [
  { title: 'The keyboard and note names', blurb: 'Hand shape and finger numbers, black-key groups, Middle C, steps, sharps and flats, C position, the staff.', level: level1 },
  { title: 'The major scale and keys', blurb: 'W W H W W W H, C major fingering, degrees, G and F major, key signatures, relative minor, the black-key pentatonic.', level: level2 },
  { title: 'Intervals and both hands', blurb: 'Intervals by degree, steps and skips on the staff, 3rds, 4ths and 5ths, 6ths and 7ths, the grand staff, hearing intervals.', level: level3 },
  { title: 'Chords, inversions and voice leading', blurb: 'Triads, four chord qualities, chords of a key, inversions, voice leading, lead sheets and 7th chords.', level: level4 },
  { title: 'Progressions and accompaniment', blurb: 'Roman numerals, the blues and boogie bass, I–V–vi–IV, ii–V–I shells, cadences, Alberti bass and the pedal, progressions by ear.', level: level5 },
  { title: 'Improvising and lead-sheet playing', blurb: 'Blues scale over a left-hand blues, targeting chord tones, phrasing, comping, melody with chords, modes and ii–V–I.', level: level6 }
];
