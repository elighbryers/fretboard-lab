// Piano Level 3: intervals and both hands (docs/research-piano.md E). Reading track: lessons 2 and 6.
import { K, all, task, tap, choice, kd, tech, seq, keys, board, S, inKey } from './kit.js';

const Cmaj = inKey('C', 'scale', 'major');
const iv = (prompt, ans, id) => task(prompt, ans, { item: `interval:${id}` });
const ivq = (prompt, ans, id) => tap(prompt, ans, { item: `interval:${id}` });
const earQ = (note, label, opts, item) => choice(`Over a C drone, which degree is this note?`, opts, label, item, { sound: { seq: [null, K(note).midi, null, K(note).midi], bpm: 70, drone: 'C' } });

export default {
  id: 'piano-level-3', title: 'Intervals and both hands',
  lessons: [
    { id: 'p3-1', title: 'Intervals: distances from the root', review: ['interval:M3', 'interval:P5'],
      steps: {
        hear: { text: 'From C: the 2nd, 3rd, 4th and 5th, each with the root first.', sound: seq(['C4', 'D4', 'C4', 'E4', 'C4', 'F4', 'C4', 'G4'], 100) },
        learn: { cards: [S('l3-1.1', [60, 72]), S('l3-1.2', [60, 72]), S('l3-1.3', [60, 72])] },
        see: { text: 'Intervals from C, named by the degree they land on.', view: [58, 74], sequence: keys(['C4', 'D4', 'C4', 'E4', 'C4', 'F4', 'C4', 'G4', 'C4', 'C5']), dots: Cmaj.dots(['C4', 'D4', 'E4', 'F4', 'G4', 'C5']), bpm: 100, link: { key: 'C', scale: 'major', labels: 'intervals' } },
        try: { view: [58, 76], tasks: [
          iv('Tap a major 3rd above C4.', 'E4', 'M3'), iv('Tap a perfect 5th above C4.', 'G4', 'P5'), iv('Tap a perfect 4th above D4.', 'G4', 'P4')
        ] },
        play: { text: 'Play C to each note and back: C D, C E, C F, C G, C C. Say the interval each time.', view: [58, 74], bpm: 70, follow: keys(['C4', 'D4', 'C4', 'E4', 'C4', 'F4', 'C4', 'G4', 'C4', 'C5']) },
        check: { pass: 3, view: [58, 76], questions: [
          ivq('Tap a perfect 5th above F4.', 'C5', 'P5'), ivq('Tap a major 3rd above G4.', 'B4', 'M3'),
          choice('C to E is a…', ['3rd', '2nd', '5th'], '3rd', 'fact:c-to-e-third'),
          tap('From Level 2: tap the black key in F major, Bb.', 'Bb4')
        ] } } },
    { id: 'p3-2', title: 'Reading 2: steps and skips on the staff', review: ['staff:treble@A4', 'staff:treble@D4'],
      steps: {
        hear: { text: 'Steps (line to space) then skips (line to line), up from Middle C.', sound: seq(['C4', 'D4', 'E4', 'F4', null, 'C4', 'E4', 'G4', 'B4'], 100) },
        learn: { cards: [
          { text: 'On the staff, a step goes from a line to the next space (or space to line). It is the next white key.', board: board([58, 70], [kd('E4', { role: 'root' }), kd('F4', { role: 'third' })]) },
          { text: 'A skip goes from a line to the next line: skip one white key. That is a 3rd.', board: board([58, 70], [kd('E4', { role: 'root' }), kd('G4', { role: 'third' })]) },
          { text: 'Read from a landmark by steps and skips: treble G, a step up is A, a skip up is B.', board: board([62, 74], [kd('G4', { role: 'root' }), kd('A4'), kd('B4', { role: 'third' })]) }
        ] },
        see: { text: 'From treble G: step up (A), skip up (B), step down (F), skip down (E).', view: [60, 74], sequence: keys(['G4', 'A4', 'G4', 'B4', 'G4', 'F4', 'G4', 'E4']), bpm: 90, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [55, 76], tasks: [
          task('Treble G, then a step up: tap A4.', 'A4', { item: 'staff:treble@A4' }),
          task('Middle C, then a step up: tap D4.', 'D4', { item: 'staff:treble@D4' }),
          task('Treble G, then a skip down: tap E4.', 'E4', { item: 'staff:treble@E4' })
        ] },
        play: { text: 'Practice → Drills → Staff reader asks these as notes on the staff. Here, play: G A G B G F G E.', view: [60, 74], bpm: 70, follow: keys(['G4', 'A4', 'G4', 'B4', 'G4', 'F4', 'G4', 'E4']) },
        check: { pass: 3, view: [55, 76], questions: [
          choice('A skip on the staff (line to line) is a…', ['3rd', '2nd', '4th'], '3rd', 'fact:staff-skip-third'),
          tap('Bass F, then a step up: tap G3.', 'G3', { item: 'staff:bass@G3' }),
          tap('Middle C, then a skip up: tap E4.', 'E4', { item: 'staff:treble@E4' }),
          tap('From Lesson 1: tap a perfect 5th above C4.', 'G4', { item: 'interval:P5' })
        ] } } },
    { id: 'p3-3', title: 'Major and minor 3rds', review: ['interval:m3', 'interval:M3'],
      steps: {
        hear: { text: 'C to E (major 3rd, bright), then C to Eb (minor 3rd, dark).', sound: seq(['C4', 'E4', null, 'C4', 'Eb4'], 90) },
        learn: { cards: [S('l3-7.2', [60, 83]),
          { text: 'A major 3rd is 4 half steps: C to E. A minor 3rd is 3: C to Eb.', board: board([58, 68], [kd('C4', { role: 'root', label: 'R' }), kd('Eb4', { role: 'third', label: 'b3' }), kd('E4', { role: 'third', label: '3' })]) },
          { text: 'On white keys alone, C–E, F–A and G–B are major 3rds; D–F, E–G, A–C and B–D are minor.', board: board([58, 72], [kd('D4', { role: 'root' }), kd('F4', { role: 'third' })]) }] },
        see: { text: 'Major 3rd, minor 3rd, from D.', view: [58, 70], sequence: keys(['D4', 'F#4', null, 'D4', 'F4']), bpm: 80, link: { key: 'D', scale: 'major', labels: 'intervals' } },
        try: { view: [58, 76], tasks: [
          iv('Tap a minor 3rd above A4.', 'C5', 'm3'), iv('Tap a major 3rd above D4.', 'F#4', 'M3'), iv('Tap a minor 3rd above E4.', 'G4', 'm3')
        ] },
        play: { text: 'Play each 3rd together as a two-note chord: C+E, C+Eb, F+A, F+Ab. Hear bright, then dark.', view: [58, 72], bpm: 60, follow: keys([['C4', 'E4'], ['C4', 'Eb4'], ['F4', 'A4'], ['F4', 'Ab4']]) },
        check: { pass: 3, view: [58, 76], questions: [
          choice('How many half steps is a minor 3rd?', ['3', '4', '2'], '3', 'fact:m3-frets'),
          ivq('Tap a major 3rd above G4.', 'B4', 'M3'), ivq('Tap a minor 3rd above D4.', 'F4', 'm3'),
          tap('From Lesson 2: middle C, then a step up: tap D4.', 'D4', { item: 'staff:treble@D4' })
        ] } } },
    { id: 'p3-4', title: '4ths, 5ths and octaves; left hand root–5th', review: ['interval:P4', 'interval:P5'],
      steps: {
        hear: { text: 'The left hand plays root and 5th together: an open, strong sound.', sound: seq([['C3', 'G3'], ['F3', 'C4'], ['G3', 'D4'], ['C3', 'G3']], 60) },
        learn: { cards: [S('l3-4.3', [48, 72]),
          { text: 'A 5th is 7 half steps; a 4th is 5. On the keys, C–G is a 5th and C–F a 4th.', board: board([58, 70], [kd('C4', { role: 'root', label: 'R' }), kd('F4', { label: '4' }), kd('G4', { role: 'fifth', label: '5' })]) },
          tech('Left hand root–5th: little finger (5) on the root, thumb (1) on the 5th.', ['Play C3 with finger 5 and G3 with your thumb together', 'Move the same shape to F and G', 'Keep the hand relaxed between chords'], 'fiveKeys')] },
        see: { text: 'Left-hand 5ths on C, F and G.', view: [46, 64], sequence: keys([['C3', 'G3'], ['F3', 'C4'], ['G3', 'D4']]), bpm: 60, link: { key: 'C', chord: '5', labels: 'intervals' } },
        try: { view: [46, 76], tasks: [
          iv('Tap a perfect 5th above F3.', 'C4', 'P5'), iv('Tap a perfect 4th above C4.', 'F4', 'P4'), task('Tap an octave above G3.', 'G4')
        ] },
        play: { text: 'Left hand: hold root–5th chords C, F, G, C, one bar each, with the click.', view: [46, 64], bpm: 60, follow: keys([['C3', 'G3'], ['F3', 'C4'], ['G3', 'D4'], ['C3', 'G3']]), beatsPerStep: 4 },
        check: { pass: 3, view: [46, 76], questions: [
          ivq('Tap a perfect 5th above D3.', 'A3', 'P5'), ivq('Tap a perfect 4th above G3.', 'C4', 'P4'),
          choice('How many half steps is a perfect 5th?', ['7', '5', '8'], '7', 'fact:p5-half-steps'),
          tap('From Lesson 3: tap a minor 3rd above A4.', 'C5', { item: 'interval:m3' })
        ] } } },
    { id: 'p3-5', title: '6ths and 7ths', review: ['interval:M6', 'interval:m7'],
      steps: {
        hear: { text: 'From C: a major 6th (A), a minor 7th (Bb), a major 7th (B).', sound: seq(['C4', 'A4', null, 'C4', 'Bb4', null, 'C4', 'B4'], 100) },
        learn: { cards: [S('l3-7.1', [60, 83]),
          { text: 'A major 6th is 9 half steps (C–A); a minor 6th is 8 (C–Ab).', board: board([58, 72], [kd('C4', { role: 'root', label: 'R' }), kd('Ab4', { label: 'b6' }), kd('A4', { label: '6' })]) },
          { text: 'A major 7th is one half step below the octave (C–B); a minor 7th is two (C–Bb).', board: board([58, 74], [kd('C4', { role: 'root', label: 'R' }), kd('Bb4', { label: 'b7' }), kd('B4', { label: '7' }), kd('C5', { role: 'root', label: 'R' })]) }] },
        see: { text: '6ths and 7ths above C.', view: [58, 74], sequence: keys(['C4', 'Ab4', 'C4', 'A4', 'C4', 'Bb4', 'C4', 'B4']), bpm: 90, link: { key: 'C', scale: 'major', labels: 'intervals' } },
        try: { view: [58, 79], tasks: [
          iv('Tap a major 6th above C4.', 'A4', 'M6'), iv('Tap a minor 7th above C4.', 'Bb4', 'm7'), iv('Tap a major 7th above F4.', 'E5', 'M7')
        ] },
        play: { text: 'Play C to each: 6, b7, 7, octave. The major 7th leans hard into the octave.', view: [58, 74], bpm: 70, follow: keys(['C4', 'A4', 'C4', 'Bb4', 'C4', 'B4', 'C5']) },
        check: { pass: 3, view: [58, 79], questions: [
          ivq('Tap a minor 6th above C4.', 'Ab4', 'm6'), ivq('Tap a major 6th above G4.', 'E5', 'M6'),
          choice('A major 7th is how far below the octave?', ['A half step', 'A whole step', 'A 3rd'], 'A half step', 'fact:maj7-half-below'),
          tap('From Lesson 4: tap a perfect 4th above C4.', 'F4', { item: 'interval:P4' })
        ] } } },
    { id: 'p3-6', title: 'Bass clef, the grand staff and hands together', review: ['staff:bass@C3', 'staff:bass@A3'],
      steps: {
        hear: { text: 'Right hand melody with the left hand holding C, then G: hands together.', sound: seq([['C3', 'E4'], 'D4', ['C3', 'C4'], 'D4', ['G2', 'E4'], 'E4', ['C3', 'E4']], 90) },
        learn: { cards: [
          { text: 'The grand staff joins the treble staff (right hand) and bass staff (left hand), with Middle C between them.', board: board([46, 72], [kd('F3', { role: 'third', label: 'F3' }), kd('C4', { role: 'root', label: 'C4' }), kd('G4', { role: 'fifth', label: 'G4' })]) },
          { text: 'Bass clef landmarks: F3 (the dots), C3 (second space from the top) and low C2.', board: board([34, 60], [kd('C2', { role: 'root' }), kd('C3', { role: 'root' }), kd('F3', { role: 'third' })]) },
          tech('Hands together: learn each hand alone first, then put them together slowly.', ['Play the right hand alone twice', 'Then the left hand alone twice', 'Then together at half speed'], 'curve')
        ] },
        see: { text: 'Bass landmarks low to high: C2, C3, F3.', view: [34, 60], sequence: keys(['C2', 'C3', 'F3']), bpm: 70, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [34, 64], tasks: [
          task('Bass clef: tap the C in the second space from the top, C3.', 'C3', { item: 'staff:bass@C3' }),
          task('Bass clef: a step up from F3. Tap G3.', 'G3', { item: 'staff:bass@G3' }),
          task('Bass clef: a skip up from F3. Tap A3.', 'A3', { item: 'staff:bass@A3' })
        ] },
        play: { text: 'Play Ode to Joy hands together: right-hand melody, left hand holding C and G. (Practice → Play-along has it with three views and wait mode.)', view: [41, 72], bpm: 60, follow: keys([['C3', 'E4'], 'E4', 'F4', 'G4', ['G2', 'G4'], 'F4', 'E4', 'D4']) },
        check: { pass: 3, view: [34, 72], questions: [
          choice('Which hand usually reads the bass staff?', ['The left hand', 'The right hand', 'Both'], 'The left hand', 'fact:bass-staff-left'),
          tap('Bass clef: tap the landmark F.', 'F3', { item: 'staff:bass@F3' }),
          tap('Bass clef: tap low C, two octaves below Middle C.', 'C2', { item: 'staff:bass@C2' }),
          tap('From Lesson 5: tap a major 6th above C4.', 'A4', { item: 'interval:M6' })
        ] } } },
    { id: 'p3-7', title: 'Hearing intervals in a key', review: ['ear:3', 'ear:5', 'ear:6'],
      steps: {
        hear: { text: 'A C drone, then E, G and A over it: each degree has its own feeling.', sound: { seq: [null, 64, null, 67, null, 69], bpm: 70, drone: 'C' } },
        learn: { cards: [S('l3-6.1', [60, 72]),
          { text: 'The 3rd sounds sweet, the 5th strong and open, the 6th light and bright.', board: board([58, 72], Cmaj.dots(['C4', 'E4', 'G4', 'A4'])) },
          { text: 'Sing the note, then find it: hum back down to the root to check.', board: board([58, 72], Cmaj.dots(['C4', 'E4', 'G4'])) }] },
        see: { text: 'Over the drone: 1, 3, 5, 6, then back to 1.', view: [58, 72], sequence: keys(['C4', 'E4', 'G4', 'A4', 'C4']), dots: Cmaj.dots(['C4', 'E4', 'G4', 'A4']), bpm: 70, drone: 'C', link: { key: 'C', scale: 'major', labels: 'intervals' } },
        try: { view: [58, 74], tasks: [
          task('Over a C drone you hear E. Tap it.', 'E4', { item: 'ear:3', sound: { seq: [null, 64], bpm: 70, drone: 'C' } }),
          task('Now you hear G. Tap it.', 'G4', { item: 'ear:5', sound: { seq: [null, 67], bpm: 70, drone: 'C' } }),
          task('Now A. Tap it.', 'A4', { item: 'ear:6', sound: { seq: [null, 69], bpm: 70, drone: 'C' } })
        ] },
        play: { text: 'With the drone on, play a C major scale slowly and sing each note. Then play any note and name its degree.', view: [58, 74], bpm: 60, drone: 'C', follow: keys(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']) },
        check: { pass: 3, view: [50, 74], questions: [
          earQ('E4', '3', ['3', '5', '6'], 'ear:3'),
          earQ('G4', '5', ['3', '5', '4'], 'ear:5'),
          tap('Tap the 6th of C major: A.', 'A4'),
          tap('From Lesson 6: bass clef, tap the landmark F.', 'F3', { item: 'staff:bass@F3' })
        ] } } }
  ],
  challenge: { id: 'p3-ch', title: 'Level 3 Challenge', challenge: true, flow: [
    { type: 'check', name: 'Name the interval', pass: 3, view: [58, 74], questions: [
      earQ('E4', '3', ['3', '5', '6'], 'ear:3'), earQ('G4', '5', ['5', '4', '6'], 'ear:5'), earQ('A4', '6', ['6', '5', '7'], 'ear:6'), earQ('F4', '4', ['4', '3', '5'], 'ear:4')] },
    { type: 'play', name: 'Hands together', text: 'Play Amazing Grace with left-hand 5ths at a steady tempo (Practice → Play-along has the full piece).', view: [43, 74], bpm: 60, follow: keys(['D4', ['G2', 'D3', 'G4'], 'B4', ['G2', 'D3', 'B4'], 'A4', ['C3', 'G3', 'G4'], 'E4', ['G2', 'D3', 'D4']]), bpmKey: 'piece' },
    { type: 'check', name: 'Check it', pass: 3, view: [46, 79], questions: [
      ivq('Tap a perfect 5th above C3.', 'G3', 'P5'), ivq('Tap a minor 3rd above A4.', 'C5', 'm3'),
      tap('Bass clef: tap the C in the second space from the top, C3.', 'C3', { item: 'staff:bass@C3' }),
      choice('C to Bb is a…', ['minor 7th', 'major 7th', 'major 6th'], 'minor 7th', 'fact:c-bb-m7')] }
  ] },
  placement: [
    ivq('Tap a major 3rd above F4.', 'A4', 'M3'),
    choice('Can you read the bass clef? Its two dots surround which note?', ['F below Middle C', 'G above Middle C', 'Middle C'], 'F below Middle C', 'fact:bass-clef-f'),
    ivq('Tap a perfect 5th above D4.', 'A4', 'P5')
  ]
};
