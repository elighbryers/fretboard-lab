// Level 1: the neck and note names. Lessons are content only; js/lesson-player.js
// knows how to play them, and js/lessons/kit.js works out every note name.
//
// Lesson shape (every step optional; a lesson without `steps` or `flow` shows "coming soon"):
//   hear:  { text, sound }                                   sound spec, see js/sound.js
//   learn: { cards: [{ text, board: { view, dots: [{ string, fret, label, role }], focus } }] }  one idea per card
//   see:   { text, view, sequence: [pos | [pos..]], bpm, dots?, link?, drone? }  dots light as they sound
//   try:   { view, tasks: [{ prompt, answer: pos | [pos..], item?, dots?, sound?, explain? }] }  retry until right
//   play:  { text, view, bpm, beatsPerBar, follow?: [pos | [pos..]], beatsPerStep?, drone?, backing?, seconds? }
//   check: { pass, view, questions: [ choice(...) | tap(...) ] }     pass 3 of 4
// A challenge uses `flow: [{ type, name?, ...step }]`, and may use a `timed` step.
// `review: [ids]` adds items the lesson teaches to the daily review.
// pos = { string, fret }
import { P, noteDot, fretOf, tap, choice, task } from './kit.js';

const OPEN_LOW_TO_HIGH = [6, 5, 4, 3, 2, 1].map(string => P(string, 0));
const OPEN_DOTS = [6, 5, 4, 3, 2, 1].map(string => P(string, 0, { label: String(string) }));
const OPEN_NAMES = [6, 5, 4, 3, 2, 1].map(string => noteDot(string, 0));
// Natural notes (no sharps or flats) on a string, frets 0-12.
const NATURAL = { 6: [0, 1, 3, 5, 7, 8, 10, 12], 5: [0, 2, 3, 5, 7, 8, 10, 12], 4: [0, 2, 3, 5, 7, 9, 10, 12] };
const naturals = string => NATURAL[string].map(f => noteDot(string, f));
const at = (name, string, from = 0) => P(string, fretOf(name, string, from));

export default {
  id: 'level-1',
  title: 'The neck and note names',
  lessons: [
    {
      id: 'l1-1',
      title: 'String names and fret numbers',
      steps: {
        hear: { text: 'These are the six open strings, from the lowest sound to the highest.', sound: { seq: OPEN_LOW_TO_HIGH, bpm: 80 } },
        learn: {
          cards: [
            { text: 'Strings are numbered 6 to 1: string 6 is the thickest and lowest, string 1 the thinnest and highest.', board: { view: [0, 5], dots: OPEN_DOTS } },
            { text: 'From 6 to 1 the names are E A D G B E. Try: "Eddie Ate Dynamite, Good Bye Eddie."', board: { view: [0, 5], dots: OPEN_NAMES } },
            { text: 'Playing a string without pressing a fret is an open string. That counts as fret 0.', board: { view: [0, 5], dots: [P(5, 0, { label: '0', role: 'root' }), P(5, 1, { label: '1' }), P(5, 2, { label: '2' }), P(5, 3, { label: '3' })] } }
          ]
        },
        see: { text: 'Watch and listen: open strings 6 to 1.', view: [0, 5], sequence: OPEN_LOW_TO_HIGH, dots: OPEN_NAMES, bpm: 80 },
        try: {
          view: [0, 5],
          tasks: [
            task('Tap the open A string.', P(5, 0)),
            task('Tap the open G string.', P(3, 0)),
            task('Tap string 6, fret 5.', P(6, 5))
          ]
        },
        play: {
          text: 'Pick up your guitar. Play the open strings from 6 to 1, one per click, and say each name out loud: E, A, D, G, B, E.',
          view: [0, 5], bpm: 60, beatsPerBar: 6, follow: OPEN_LOW_TO_HIGH
        },
        check: {
          pass: 3, view: [0, 5],
          questions: [
            choice('Which string is number 5?', ['E', 'A', 'D', 'G'], 'A', 'fact:string-5-name'),
            tap('Tap the open D string.', P(4, 0)),
            tap('Tap string 1, open.', P(1, 0)),
            choice('What fret number is an open string?', ['0', '1', '12'], '0', 'fact:open-string-fret')
          ]
        }
      }
    },
    {
      id: 'l1-2',
      title: 'The musical alphabet',
      steps: {
        hear: { text: 'Seven letters, then the first one again: A B C D E F G A.', sound: { seq: naturals(5), bpm: 80 } },
        learn: {
          cards: [
            { text: 'Music uses seven letters, A to G. After G it starts again at A.', board: { view: [0, 12], dots: naturals(5) } },
            { text: 'Most letters are two frets apart, like A and B.', board: { view: [0, 5], dots: [noteDot(5, 0, { role: 'root' }), noteDot(5, 2, { role: 'third' })] } },
            { text: 'B to C and E to F are only one fret apart. There is no note between them.', board: { view: [0, 5], dots: [noteDot(5, 2, { role: 'root' }), noteDot(5, 3, { role: 'third' }), noteDot(6, 0, { role: 'root' }), noteDot(6, 1, { role: 'third' })] } }
          ]
        },
        see: {
          text: 'The letters on the low E string, from E up to E again. Watch for the one-fret steps.',
          view: [0, 12], sequence: naturals(6), bpm: 90, link: { key: 'C', scale: 'major', labels: 'notes' }
        },
        try: {
          view: [0, 12],
          tasks: [
            task('Tap B on the A string.', at('B', 5)),
            task('Tap the letter after E on the low E string.', at('F', 6)),
            task('Tap C on the A string.', at('C', 5))
          ]
        },
        play: {
          text: 'Play up the A string on the lit frets, one per click, and say each letter: A B C D E F G A.',
          view: [0, 12], bpm: 60, follow: NATURAL[5].map(f => P(5, f))
        },
        check: {
          pass: 3, view: [0, 12],
          questions: [
            choice('Which letter comes after G?', ['A', 'H', 'F'], 'A', 'fact:alphabet-after-g'),
            choice('Which pair has no note between them?', ['B and C', 'C and D', 'F and G'], 'B and C', 'fact:alphabet-no-gap'),
            tap('Tap F on the low E string.', at('F', 6)),
            tap('Tap D on the A string.', at('D', 5))
          ]
        }
      }
    },
    {
      id: 'l1-3',
      title: 'Whole and half steps',
      steps: {
        hear: { text: 'Half steps first (one fret each), then whole steps (two frets each).', sound: { seq: [P(5, 0), P(5, 1), P(5, 2), P(5, 3), null, P(5, 0), P(5, 2), P(5, 4), P(5, 6)], bpm: 90 } },
        learn: {
          cards: [
            { text: 'A half step is one fret.', board: { view: [0, 5], dots: [noteDot(6, 0, { role: 'root' }), noteDot(6, 1, { role: 'third' })] } },
            { text: 'A whole step is two frets.', board: { view: [0, 6], dots: [noteDot(6, 3, { role: 'root' }), noteDot(6, 5, { role: 'third' })] } },
            { text: 'B to C and E to F are half steps. Every other pair of letters is a whole step.', board: { view: [0, 6], dots: [noteDot(4, 0), noteDot(4, 2), noteDot(4, 3, { role: 'third' }), noteDot(4, 5)] } }
          ]
        },
        see: {
          text: 'On the D string: D to E is a whole step, E to F a half step, F to G a whole step.',
          view: [0, 6], sequence: [P(4, 0), P(4, 2), P(4, 3), P(4, 5)].map(p => noteDot(p.string, p.fret)), bpm: 70
        },
        try: {
          view: [0, 7],
          tasks: [
            task('Tap one half step above A on the A string.', P(5, 1), { dots: [noteDot(5, 0, { role: 'root' })] }),
            task('Tap one whole step above C on the A string.', P(5, 5), { dots: [noteDot(5, 3, { role: 'root' })] }),
            task('Tap one half step below G on the low E string.', P(6, 2), { dots: [noteDot(6, 3, { role: 'root' })] })
          ]
        },
        play: {
          text: 'Climb the G string in half steps from open to fret 4, then come back down in whole steps: 4, 2, 0.',
          view: [0, 6], bpm: 60, follow: [0, 1, 2, 3, 4, 4, 2, 0].map(f => P(3, f))
        },
        check: {
          pass: 3, view: [0, 7],
          questions: [
            choice('How many frets is a whole step?', ['1', '2', '3'], '2', 'fact:whole-step-frets'),
            tap('Tap one whole step above E on the D string.', P(4, 4), { dots: [noteDot(4, 2, { role: 'root' })] }),
            tap('Tap one half step above B on the A string.', P(5, 3), { dots: [noteDot(5, 2, { role: 'root' })] }),
            tap('From Lesson 1: tap the open G string.', P(3, 0))
          ]
        }
      }
    },
    {
      id: 'l1-4',
      title: 'Natural notes on the E and A strings',
      steps: {
        hear: { text: 'The natural notes on the low E string, open to fret 12.', sound: { seq: naturals(6), bpm: 90 } },
        learn: {
          cards: [
            { text: 'These are the letter notes on the low E string. Learn them first: they help you find everything else.', board: { view: [0, 12], dots: naturals(6), focus: { strings: [6] } } },
            { text: 'And on the A string, starting from A.', board: { view: [0, 12], dots: naturals(5), focus: { strings: [5] } } },
            { text: 'At fret 12 the open note comes back, one octave higher.', board: { view: [0, 12], dots: [noteDot(6, 0, { role: 'root' }), noteDot(6, 12, { role: 'root' }), noteDot(5, 0, { role: 'third' }), noteDot(5, 12, { role: 'third' })] } }
          ]
        },
        see: {
          text: 'The A string, A to A. Say each name as it lights.',
          view: [0, 12], sequence: naturals(5), bpm: 80, link: { key: 'C', scale: 'major', labels: 'notes' }
        },
        try: {
          view: [0, 12],
          tasks: [
            task('Tap G on the low E string.', at('G', 6)),
            task('Tap C on the A string.', at('C', 5)),
            task('Tap D on the low E string.', at('D', 6))
          ]
        },
        play: {
          text: 'Play the natural notes on the low E string, open to 12, and say each name.',
          view: [0, 12], bpm: 60, follow: NATURAL[6].map(f => P(6, f))
        },
        check: {
          pass: 3, view: [0, 12],
          questions: [
            tap('Tap A on the low E string.', at('A', 6)),
            tap('Tap G on the A string.', at('G', 5)),
            tap('Tap E on the A string.', at('E', 5, 1)),
            tap('From Lesson 3: tap one half step above E on the low E string.', P(6, 1), { dots: [noteDot(6, 0, { role: 'root' })] })
          ]
        }
      }
    },
    {
      id: 'l1-5',
      title: 'Octave shapes',
      steps: {
        hear: { text: 'The same note, G, in three places on the neck.', sound: { seq: [P(6, 3), P(4, 5), P(1, 3)], bpm: 70 } },
        learn: {
          cards: [
            { text: 'From the low E or A string: skip a string and go two frets up. Same note, one octave higher.', board: { view: [0, 8], dots: [noteDot(6, 3, { role: 'root' }), noteDot(4, 5, { role: 'root' }), noteDot(5, 3, { role: 'third' }), noteDot(3, 5, { role: 'third' })] } },
            { text: 'From the D or G string, the B string shifts it: skip a string and go three frets up.', board: { view: [0, 8], dots: [noteDot(4, 2, { role: 'root' }), noteDot(2, 5, { role: 'root' }), noteDot(3, 2, { role: 'third' }), noteDot(1, 5, { role: 'third' })] } },
            { text: 'The low E and high e strings have the same notes at the same frets.', board: { view: [0, 8], dots: [noteDot(6, 3, { role: 'root' }), noteDot(1, 3, { role: 'root' })] } }
          ]
        },
        see: {
          text: 'Every G from fret 0 to 8, joined by octave shapes.',
          view: [0, 8], sequence: [P(6, 3), P(4, 5), P(3, 0), P(1, 3), P(2, 8)].map(p => noteDot(p.string, p.fret, { role: 'root' })), bpm: 70,
          link: { key: 'G', scale: 'major', labels: 'notes' }
        },
        try: {
          view: [0, 10],
          tasks: [
            task('Tap the G one octave above this one.', P(4, 5), { dots: [noteDot(6, 3, { role: 'root' })] }),
            task('Tap the C one octave above this one.', P(3, 5), { dots: [noteDot(5, 3, { role: 'root' })] }),
            task('Tap the E on the B string, one octave above this one.', P(2, 5), { dots: [noteDot(4, 2, { role: 'root' })] })
          ]
        },
        play: {
          text: 'Play A on the low E string, its octave on the D string, then the A on the high e string. Use the shapes, not memory.',
          view: [0, 10], bpm: 60, follow: [P(6, 5), P(4, 7), P(1, 5), P(4, 7)]
        },
        check: {
          pass: 3, view: [0, 10],
          questions: [
            tap('Tap the A one octave above this one.', P(4, 7), { dots: [noteDot(6, 5, { role: 'root' })] }),
            tap('Tap the D one octave above this one.', P(3, 7), { dots: [noteDot(5, 5, { role: 'root' })] }),
            tap('Tap the F one octave above this one, on the B string.', P(2, 6), { dots: [noteDot(4, 3, { role: 'root' })] }),
            tap('From Lesson 4: tap G on the low E string.', at('G', 6))
          ]
        }
      }
    },
    {
      id: 'l1-6',
      title: 'Sharps and flats',
      steps: {
        hear: { text: 'A, then A sharp, then B: one fret at a time.', sound: { seq: [P(5, 0), P(5, 1), P(5, 2)], bpm: 70 } },
        learn: {
          cards: [
            { text: 'Sharp (#) means one fret higher. One fret above A is A#.', board: { view: [0, 5], dots: [noteDot(5, 0, { role: 'root' }), P(5, 1, { label: 'A#', role: 'third' })] } },
            { text: 'Flat (b) means one fret lower. One fret below B is Bb.', board: { view: [0, 5], dots: [noteDot(5, 2, { role: 'root' }), P(5, 1, { label: 'Bb', role: 'third' })] } },
            { text: 'So A# and Bb are one fret with two names. Every fret between two letters works this way: C# is Db, F# is Gb.', board: { view: [0, 5], dots: [noteDot(5, 0), P(5, 1, { label: 'Bb', role: 'third' }), noteDot(5, 2)] } }
          ]
        },
        see: {
          text: 'Every fret on the A string from A to D, sharps and flats included.',
          view: [0, 6], sequence: [0, 1, 2, 3, 4, 5].map(f => noteDot(5, f)), bpm: 80
        },
        try: {
          view: [0, 8],
          tasks: [
            task('Tap F# on the low E string.', at('F#', 6)),
            task('Tap Bb on the A string.', at('Bb', 5)),
            task('Tap C# on the A string.', at('C#', 5))
          ]
        },
        play: {
          text: 'Play every fret on the A string from open to fret 5 and say both names where there are two: A, A# or Bb, B, C, C# or Db, D.',
          view: [0, 6], bpm: 56, follow: [0, 1, 2, 3, 4, 5].map(f => P(5, f))
        },
        check: {
          pass: 3, view: [0, 8],
          questions: [
            tap('Tap G# on the low E string.', at('G#', 6)),
            choice('What is another name for A#?', ['Bb', 'B', 'Ab'], 'Bb', 'fact:a-sharp-b-flat'),
            tap('Tap Eb on the A string.', at('Eb', 5)),
            tap('From Lesson 5: tap the G one octave above this one.', P(4, 5), { dots: [noteDot(6, 3, { role: 'root' })] })
          ]
        }
      }
    },
    {
      id: 'l1-7',
      title: 'Landmarks: frets 5, 7 and 12',
      steps: {
        hear: { text: 'The open low E, then the E at fret 12: the same note, an octave apart.', sound: { seq: [P(6, 0), P(6, 12)], bpm: 60 } },
        learn: {
          cards: [
            { text: 'Fret 12 has the same names as the open strings, one octave up. The double dot marks it.', board: { view: [0, 12], dots: [6, 5, 4, 3, 2, 1].map(s => noteDot(s, 12)) } },
            { text: 'Fret 5 on the low E string is A, and on the A string it is D.', board: { view: [0, 12], dots: [noteDot(6, 5, { role: 'root' }), noteDot(5, 5, { role: 'root' })] } },
            { text: 'Fret 7 on the low E string is B, and on the A string it is E.', board: { view: [0, 12], dots: [noteDot(6, 7, { role: 'third' }), noteDot(5, 7, { role: 'third' })] } }
          ]
        },
        see: {
          text: 'The landmarks on the two low strings: 5, 7 and 12.',
          view: [0, 12], sequence: [P(6, 5), P(6, 7), P(6, 12), P(5, 5), P(5, 7), P(5, 12)].map(p => noteDot(p.string, p.fret)), bpm: 70
        },
        try: {
          view: [0, 12],
          tasks: [
            task('Tap A on the low E string, using a landmark.', P(6, 5)),
            task('Tap E on the A string, using a landmark.', P(5, 7)),
            task('Tap D at fret 12.', P(4, 12))
          ]
        },
        play: {
          text: 'Jump between landmarks on the low E string: A at 5, B at 7, E at 12. Say each name.',
          view: [0, 12], bpm: 60, follow: [P(6, 5), P(6, 7), P(6, 12), P(6, 7)]
        },
        check: {
          pass: 3, view: [0, 12],
          questions: [
            tap('Tap D on the A string.', at('D', 5)),
            tap('Tap B on the low E string.', at('B', 6)),
            tap('Tap G at fret 12.', P(3, 12)),
            tap('From Lesson 6: tap F# on the low E string.', at('F#', 6))
          ]
        }
      }
    }
  ],
  challenge: {
    id: 'l1-challenge', title: 'Level 1 Challenge', challenge: true,
    flow: [
      {
        type: 'learn', name: 'How it works',
        cards: [
          { text: 'The app names a note and a string. Play it on your guitar, then tap where you played it. You have 3 seconds.', board: { view: [0, 12], dots: [noteDot(5, 10, { role: 'root' })] } },
          { text: 'Not sure? Find it on the low E or A string first, then use an octave shape. Get 8 of 10 to pass.', board: { view: [0, 12], dots: [noteDot(6, 3, { role: 'root' }), noteDot(4, 5, { role: 'root' })] } }
        ]
      },
      { type: 'timed', name: 'Challenge', text: `Ten notes, 3 seconds each, on any string from fret 0 to 12. Ready?`, rounds: 10, seconds: 3, pass: 8, frets: [0, 12] }
    ]
  },
  placement: [
    tap('Tap C on the A string.', at('C', 5)),
    tap('Tap F# on the low E string.', at('F#', 6)),
    tap('Tap the G one octave above this one.', P(4, 5), { dots: [noteDot(6, 3, { role: 'root' })] })
  ]
};

