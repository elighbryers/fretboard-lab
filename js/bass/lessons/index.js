// The bass Learn path: six levels in the order of docs/research-bass.md section E.
import level1 from './level1.js';
import level2 from './level2.js';
import level3 from './level3.js';
import level4 from './level4.js';

export const BASS_LEVELS = [
  { title: 'The neck, the pulse and your hands', blurb: 'String names, plucking, one finger per fret, the beat, the alphabet, octaves and muting.', level: level1 },
  { title: 'Roots and rhythm', blurb: 'Eighth notes, roots on chord changes, sharps and flats, root-5th-octave, tab and syncopation.', level: level2 },
  { title: 'Major scale, keys and the pentatonic', blurb: 'The major scale in one position, degrees, moving keys, the circle of fifths, minor, pentatonics and blues.', level: level3 },
  { title: 'Intervals and chord tones', blurb: 'Interval shapes, major and minor 3rds, triads, arpeggios and 10ths, 7th chords, chords of a key, hearing chord tones.', level: level4 }
];
