// The drum Learn path: six levels in the order of docs/research-drums.md section E.
import { level1, level2, level3 } from './levels1-3.js';
import { level4, level5, level6 } from './levels4-6.js';
export const DRUM_LEVELS = [
  { title: 'Pulse, counting and the kit', blurb: 'The kit and the limb code, pulse and tempo, quarters, eighths, grip and strokes, your first rock beat, the drum staff.', level: level1 },
  { title: 'Grooves and first fills', blurb: 'Kick on the "&", the backbeat, sixteenths, singles and doubles, the toms, fills and four-bar phrases.', level: level2 },
  { title: 'Sixteenths, dynamics and rudiments', blurb: '16th grooves, kick on "e" and "a", accents and ghost notes, paradiddles, flams and drags, 16th fills, song form.', level: level3 },
  { title: 'Triplets, swing and shuffle', blurb: 'Triplets, straight vs swung, the shuffle, 6/8 and 12/8, triplet fills, the jazz ride pattern, feels by ear.', level: level4 },
  { title: 'Coordination and independence', blurb: 'The hi-hat foot, kick reading, syncopation, funk ghost notes, open hi-hat, linear patterns, other meters.', level: level5 },
  { title: 'Time, feel and your own parts', blurb: 'Gap and fading click, tempo ladders, feel, a style tour, writing a part, trading fours, setup and tuning.', level: level6 }
];
