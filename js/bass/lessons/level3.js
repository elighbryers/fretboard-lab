// Bass Level 3: major scale, keys and the pentatonic (docs/research-bass.md E).
// Shared theory cards (S) come from js/lessons/cards.js, placed on the bass neck.
import { K, P, at, nd, task, tap, choice, S, seq, degreeItem } from './kit.js';

const Gmaj = K.inKey('G', 'scale', 'major'), Amaj = K.inKey('A', 'scale', 'major'), Cmaj = K.inKey('C', 'scale', 'major');
const Amin = K.inKey('A', 'scale', 'minor'), Apent = K.inKey('A', 'scale', 'minor-pentatonic'), Ablues = K.inKey('A', 'scale', 'blues');
// One-finger-per-fret boxes, one octave, low to high.
const G_BOX = [[4, 3], [4, 5], [3, 2], [3, 3], [3, 5], [2, 2], [2, 4], [2, 5]];
const A_BOX = [[4, 5], [4, 7], [3, 4], [3, 5], [3, 7], [2, 4], [2, 6], [2, 7]];
const C_BOX = [[3, 3], [3, 5], [2, 2], [2, 3], [2, 5], [1, 2], [1, 4], [1, 5]];
const AMIN_BOX = [[4, 5], [4, 7], [4, 8], [3, 5], [3, 7], [3, 8], [2, 5], [2, 7]];
const APENT_BOX = [[4, 5], [4, 8], [3, 5], [3, 7], [2, 5], [2, 7]];
const pos = list => list.map(([s, f]) => P(s, f));
const upDown = list => [...list, ...list.slice(0, -1).reverse()];

export default {
  id: 'bass-level-3',
  title: 'Major scale, keys and the pentatonic',
  lessons: [
    {
      id: 'b3-1', title: 'The major scale in one position',
      review: [degreeItem(Gmaj, '3'), degreeItem(Gmaj, '5')],
      steps: {
        hear: { text: 'G major, one octave up, from G on the E string.', sound: seq(pos(G_BOX), 100) },
        learn: { cards: [S('l2-1.1'), S('l2-1.2'), { text: 'On bass it fits under one hand: the root with finger 2, then one finger per fret.', board: { view: [0, 7], focus: { frets: [2, 5] }, dots: Gmaj.dots(G_BOX, 'deg') } }] },
        see: { text: 'G major in one position. The half steps are B to C and F# to G.', view: [0, 7], sequence: pos(G_BOX), dots: Gmaj.dots(G_BOX, 'note'), bpm: 100, link: { key: 'G', scale: 'major', labels: 'notes' } },
        try: { view: [0, 7], tasks: [
          task('Tap the 3rd note of G major, B, on the A string.', at('B', 3)),
          task('Tap the 7th note, F#, on the D string.', at('F#', 2)),
          task('Tap the 4th note, C, on the A string.', at('C', 3))
        ] },
        play: { text: 'Play G major up and down in quarter notes, one finger per fret, with the drums.', view: [0, 7], bpm: 70, follow: upDown(pos(G_BOX)), dots: Gmaj.dots(G_BOX, 'note') },
        check: { pass: 3, view: [0, 7], questions: [
          choice('The major scale steps are…', ['W W H W W W H', 'W H W W H W W', 'H W W W H W W'], 'W W H W W W H', 'fact:major-steps'),
          tap('Tap the 5th note of G major, D, on the A string.', at('D', 3)),
          tap('From Level 2: tap the 5th of G (one string up, two frets up from G on the E string).', P(3, 5)),
          tap('Tap the 6th note of G major, E, on the D string.', at('E', 2))
        ] }
      }
    },
    {
      id: 'b3-2', title: 'Scale degrees 1 to 7',
      review: [degreeItem(Gmaj, '3'), degreeItem(Gmaj, '6')],
      steps: {
        hear: { text: 'G major with the degrees counted: 1 2 3 4 5 6 7 1.', sound: seq(pos(G_BOX), 90) },
        learn: { cards: [S('l2-3.1'), S('l2-3.2'), S('l2-3.3')] },
        see: { text: 'G major with each note labelled by its degree.', view: [0, 7], sequence: pos(G_BOX), dots: Gmaj.dots(G_BOX, 'deg'), bpm: 90, link: { key: 'G', scale: 'major', labels: 'intervals' } },
        try: { view: [0, 7], tasks: [
          task('Tap degree 3 of G major (B) on the A string.', at('B', 3), { item: degreeItem(Gmaj, '3') }),
          task('Tap degree 5 of G major (D) on the A string.', at('D', 3), { item: degreeItem(Gmaj, '5') }),
          task('Tap degree 6 of G major (E) on the D string.', at('E', 2), { item: degreeItem(Gmaj, '6') })
        ] },
        play: { text: 'Play 1 3 5 3 1 in G, saying the numbers, then 1 2 3 4 5.', view: [0, 7], bpm: 70, follow: pos([[4, 3], [3, 2], [3, 5], [3, 2], [4, 3], [4, 3], [4, 5], [3, 2], [3, 3], [3, 5]]), dots: Gmaj.dots(G_BOX, 'deg') },
        check: { pass: 3, view: [0, 7], questions: [
          choice('In C major, which note is degree 3?', ['E', 'D', 'G'], 'E', 'fact:c-major-3rd'),
          tap('Tap degree 4 of G major (C) on the A string.', at('C', 3), { item: degreeItem(Gmaj, '4') }),
          tap('Tap degree 7 of G major (F#) on the D string.', at('F#', 2), { item: degreeItem(Gmaj, '7') }),
          tap('From Lesson 1: tap the 2nd note of G major, A, on the E string.', at('A', 4))
        ] }
      }
    },
    {
      id: 'b3-3', title: 'Moving the box to any key',
      steps: {
        hear: { text: 'The same shape started on A: A major.', sound: seq(pos(A_BOX), 100) },
        learn: { cards: [
          { text: 'The box is a pattern of frets, not of notes. Start it on a new root and you are in a new key.', board: { view: [2, 9], dots: Amaj.dots(A_BOX, 'deg') } },
          { text: 'G major starts at fret 3; A major starts at fret 5. Same fingers, two frets higher.', board: { view: [0, 9], dots: [Gmaj.dot(4, 3), Amaj.dot(4, 5)] } },
          { text: 'Starting on the A string works too. Here is C major from C at fret 3.', board: { view: [0, 7], dots: Cmaj.dots(C_BOX, 'deg') } }
        ] },
        see: { text: 'A major in one position, from A on the E string.', view: [2, 9], sequence: pos(A_BOX), dots: Amaj.dots(A_BOX, 'note'), bpm: 100, link: { key: 'A', scale: 'major', labels: 'notes' } },
        try: { view: [0, 9], tasks: [
          task('Tap the root of A major on the E string.', at('A', 4)),
          task('Tap the 3rd of A major, C#, on the A string.', at('C#', 3)),
          task('Tap the root of C major on the A string.', at('C', 3))
        ] },
        play: { text: 'Play A major up and down, then C major from the A string. Same shape, new place.', view: [0, 9], bpm: 70, follow: [...upDown(pos(A_BOX)), ...upDown(pos(C_BOX))] },
        check: { pass: 3, view: [0, 9], questions: [
          tap('Tap the 7th of A major, G#, on the D string.', at('G#', 2)),
          tap('Tap the 5th of C major, G, on the D string.', at('G', 2)),
          tap('From Lesson 2: tap degree 3 of G major (B) on the A string.', at('B', 3)),
          choice('To play D major with the same box, start the shape on…', ['D', 'A', 'G'], 'D', 'fact:box-moves-with-root')
        ] }
      }
    },
    {
      id: 'b3-4', title: 'Key signatures and the circle of fifths',
      steps: {
        hear: { text: 'Roots up in 5ths: C, G, D, A. Each key adds one sharp.', sound: seq([at('C', 3), at('G', 4, 3), at('D', 3), at('A', 4)], 80) },
        learn: { cards: [S('l5-keys.1'), S('l5-keys.2'), { text: 'On bass, up a 5th is one string up and two frets up. Walk it: C, G, D, A.', board: { view: [0, 9], dots: [nd(3, 3, { role: 'root' }), nd(2, 5), nd(1, 7)] } }] },
        see: { text: 'The circle of fifths on the neck: C to G to D.', view: [0, 9], sequence: [P(3, 3), P(2, 5), P(1, 7)], dots: [nd(3, 3), nd(2, 5), nd(1, 7)], bpm: 70, link: { key: 'D', scale: 'major', labels: 'notes' } },
        try: { view: [0, 9], tasks: [
          task('Tap the note a 5th above C (C is on the A string, fret 3).', P(2, 5)),
          task('Tap the note a 5th above G on the E string (G is at fret 3).', P(3, 5)),
          task('Tap A on the E string: the key with three sharps.', at('A', 4))
        ] },
        play: { text: 'Play roots around the circle with the drums, one per bar: C G D A E.', view: [0, 9], bpm: 70, follow: [at('C', 3), at('G', 4), at('D', 3), at('A', 4), P(4, 0)], beatsPerStep: 4 },
        check: { pass: 3, view: [0, 9], questions: [
          choice('How many sharps does D major have?', ['2', '1', '3'], '2', 'fact:d-major-sharps'),
          choice('Which key has one sharp, F#?', ['G major', 'D major', 'F major'], 'G major', 'fact:g-major-sharps'),
          tap('Tap the note a 5th above D (D is on the A string, fret 5).', P(2, 7)),
          tap('From Lesson 3: tap the root of A major on the E string.', at('A', 4))
        ] }
      }
    },
    {
      id: 'b3-5', title: 'The relative minor and the minor box',
      review: [degreeItem(Amin, 'b3')],
      steps: {
        hear: { text: 'A natural minor: the notes of C major, started on A.', sound: seq(pos(AMIN_BOX), 100) },
        learn: { cards: [S('l2-6.1'), S('l2-6.3'), { text: 'The minor box starts with finger 1 on the root, here A at fret 5.', board: { view: [3, 9], focus: { frets: [5, 8] }, dots: Amin.dots(AMIN_BOX, 'deg') } }] },
        see: { text: 'A minor in one position. Hear the darker flat 3rd, C.', view: [3, 9], sequence: pos(AMIN_BOX), dots: Amin.dots(AMIN_BOX, 'note'), bpm: 100, link: { key: 'A', scale: 'minor', labels: 'intervals' } },
        try: { view: [3, 9], tasks: [
          task('Tap the flat 3rd of A minor, C, on the E string.', at('C', 4), { item: degreeItem(Amin, 'b3') }),
          task('Tap the 5th of A minor, E, on the A string.', at('E', 3)),
          task('Tap the flat 7th, G, on the D string.', at('G', 2))
        ] },
        play: { text: 'Play A minor up and down with the drums, finger 1 on the root.', view: [3, 9], bpm: 70, follow: upDown(pos(AMIN_BOX)), dots: Amin.dots(AMIN_BOX, 'note'), backing: { chords: ['A:minor'] } },
        check: { pass: 3, view: [3, 9], questions: [
          choice('Which major key shares its notes with A minor?', ['C major', 'A major', 'G major'], 'C major', 'fact:relative-minor-a'),
          tap('Tap the 4th of A minor, D, on the A string.', at('D', 3)),
          tap('Tap the root of A minor on the D string.', at('A', 2)),
          tap('From Lesson 4: tap the note a 5th above C (C is on the A string, fret 3).', P(2, 5))
        ] }
      }
    },
    {
      id: 'b3-6', title: 'Pentatonics and the blues scale',
      review: [degreeItem(Apent, 'b3'), degreeItem(Ablues, 'b5')],
      steps: {
        hear: { text: 'A minor pentatonic: five notes that work over almost anything in A minor.', sound: seq(pos(APENT_BOX), 100) },
        learn: { cards: [S('l2-7.1'), S('l2-minpent.1', [0, 12]), { text: 'Add the flat 5th, Eb, to the minor pentatonic and you have the blues scale.', board: { view: [3, 9], dots: Ablues.dots([[4, 5], [4, 8], [3, 5], [3, 6], [3, 7], [2, 5], [2, 7]], 'deg') } }] },
        see: { text: 'A minor pentatonic in one position.', view: [3, 9], sequence: pos(APENT_BOX), dots: Apent.dots(APENT_BOX, 'deg'), bpm: 100, link: { key: 'A', scale: 'minor-pentatonic', labels: 'intervals' } },
        try: { view: [3, 9], tasks: [
          task('Tap the flat 3rd of A minor pentatonic, C, on the E string.', at('C', 4), { item: degreeItem(Apent, 'b3') }),
          task('Tap the blue note, Eb, on the A string.', at('Eb', 3), { item: degreeItem(Ablues, 'b5') }),
          task('Tap the 4th, D, on the A string.', at('D', 3))
        ] },
        play: { text: 'Play A minor pentatonic up and down, then add the Eb for the blues scale. Shuffle feel.', view: [3, 9], bpm: 70, groove: 'shuffle', follow: upDown(pos(APENT_BOX)), dots: Apent.dots(APENT_BOX, 'note'), backing: { chords: ['A:7'] } },
        check: { pass: 3, view: [3, 9], questions: [
          choice('How many notes are in a pentatonic scale?', ['5', '6', '7'], '5', 'fact:pentatonic-five'),
          choice('The blues scale adds which note to the minor pentatonic?', ['The flat 5th', 'The 2nd', 'The major 3rd'], 'The flat 5th', 'fact:blues-adds-b5'),
          tap('Tap the 5th of A minor pentatonic, E, on the A string.', at('E', 3)),
          tap('From Lesson 5: tap the flat 7th of A minor, G, on the D string.', at('G', 2))
        ] }
      }
    },
    {
      id: 'b3-7', title: 'Create: a line that starts and ends on the root',
      steps: {
        hear: { text: 'A short line in A minor pentatonic: up from the root and back home.', sound: seq(pos([[4, 5], [4, 8], [3, 5], [3, 7], [3, 5], [4, 8], [4, 5]]), 100) },
        learn: { cards: [
          { text: 'A good bass line knows where home is. Start on the root and come back to it at the end.', board: { view: [3, 9], dots: [Apent.dot(4, 5), Apent.dot(2, 7)] } },
          { text: 'Move mostly by step between scale notes; jump to the 5th or octave for energy.', board: { view: [3, 9], dots: Apent.dots(APENT_BOX, 'deg') } },
          { text: 'Keep it short: two bars, then repeat it so the band can lock in.', board: { view: [3, 9], dots: Apent.dots(APENT_BOX, 'deg') } }
        ] },
        see: { text: 'One possible line: R b3 4 5 4 b3 R.', view: [3, 9], sequence: pos([[4, 5], [4, 8], [3, 5], [3, 7], [3, 5], [4, 8], [4, 5]]), dots: Apent.dots(APENT_BOX, 'deg'), bpm: 100, link: { key: 'A', scale: 'minor-pentatonic', labels: 'intervals' } },
        try: { view: [3, 9], tasks: [
          task('Tap where your line starts: A on the E string.', at('A', 4)),
          task('Tap the 5th, E, on the A string: a strong note to aim for.', at('E', 3)),
          task('Tap the octave A on the D string: another way home.', at('A', 2))
        ] },
        play: { text: 'Make up a two-bar line from A minor pentatonic that starts and ends on A. Loop it for 45 seconds over the drums.', view: [3, 9], bpm: 80, dots: Apent.dots(APENT_BOX, 'deg'), seconds: 45, backing: { chords: ['A:minor'] } },
        check: { pass: 3, view: [3, 9], questions: [
          tap('Tap the root of A minor pentatonic on the E string.', at('A', 4)),
          tap('Tap the flat 7th, G, on the D string.', at('G', 2)),
          tap('From Lesson 6: tap the blue note, Eb, on the A string.', at('Eb', 3)),
          choice('Where should a simple line start and end?', ['On the root', 'On the flat 7th', 'Anywhere'], 'On the root', 'fact:line-home-root')
        ] }
      }
    }
  ],
  challenge: {
    id: 'b3-ch', title: 'Level 3 Challenge', challenge: true,
    flow: [
      { type: 'play', name: 'C major in 8ths', text: 'Play the C major scale up and down in eighth notes with the drums at 80 bpm.', view: [0, 7], bpm: 80, follow: upDown(pos(C_BOX)), dots: Cmaj.dots(C_BOX, 'note'), bpmKey: 'scale' },
      { type: 'play', name: 'Improvise', text: 'Improvise a bass line from A minor pentatonic for 60 seconds over the A minor drone and groove.', view: [3, 9], bpm: 80, drone: 'A', dots: Apent.dots(APENT_BOX, 'deg'), seconds: 60, bpmKey: 'improv' },
      { type: 'check', name: 'Check it', pass: 3, view: [0, 9], questions: [
        tap('Tap the 3rd of C major, E, on the D string.', at('E', 2)),
        tap('Tap the flat 3rd of A minor, C, on the E string.', at('C', 4)),
        choice('A minor is the relative minor of…', ['C major', 'E major', 'F major'], 'C major', 'fact:relative-minor-a'),
        choice('How many sharps does A major have?', ['3', '2', '4'], '3', 'fact:a-major-sharps')
      ] }
    ]
  },
  placement: [
    tap('Tap the 3rd of G major, B, on the A string.', at('B', 3)),
    tap('Tap the flat 3rd of A minor, C, on the E string.', at('C', 4)),
    choice('The major scale steps are…', ['W W H W W W H', 'W H W W H W W', 'H W W W H W W'], 'W W H W W W H', 'fact:major-steps')
  ]
};
