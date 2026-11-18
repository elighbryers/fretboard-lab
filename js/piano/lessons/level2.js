// Piano Level 2: the major scale and keys (docs/research-piano.md E).
import { K, all, task, tap, choice, kd, tech, seq, keys, board, S, inKey, degreeItem } from './kit.js';

const Cmaj = inKey('C', 'scale', 'major'), Gmaj = inKey('G', 'scale', 'major'), Fmaj = inKey('F', 'scale', 'major'), Amin = inKey('A', 'scale', 'minor');
const C_UP = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], G_UP = ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'];
const RH_C = { 60: { n: 1, hand: 'R' }, 65: { n: 1, hand: 'R' } };   // thumb on C, thumb under to F
const GB_PENT = ['Gb4', 'Ab4', 'Bb4', 'Db5', 'Eb5'];
const updown = a => [...a, ...a.slice(0, -1).reverse()];

export default {
  id: 'piano-level-2', title: 'The major scale and keys',
  lessons: [
    { id: 'p2-1', title: 'The major scale: W W H W W W H', review: ['staff:treble@E4'],
      steps: {
        hear: { text: 'G major, one octave up.', sound: seq(G_UP, 110) },
        learn: { cards: [S('l2-1.1', [65, 84]), S('l2-1.2', [65, 84]), S('l2-1.3', [65, 84])] },
        see: { text: 'G major with the steps shown: the half steps are B–C and F#–G.', view: [65, 81], sequence: keys(G_UP), dots: Gmaj.dots(G_UP, 'note'), bpm: 100, link: { key: 'G', scale: 'major', labels: 'notes' } },
        try: { view: [62, 81], tasks: [
          task('Tap the 2nd note of G major: A.', 'A4'),
          task('Tap the 7th note of G major: F#, the one black key.', 'F#5'),
          task('Tap a whole step above C5.', 'D5')
        ] },
        play: { text: 'Play G major up and down with the right hand, one note per click.', view: [65, 81], bpm: 60, follow: keys(updown(G_UP)) },
        check: { pass: 3, view: [62, 81], questions: [
          choice('The major scale steps are…', ['W W H W W W H', 'W H W W H W W', 'H W W W H W W'], 'W W H W W W H', 'fact:major-steps'),
          tap('Tap the 4th note of G major: C.', 'C5'),
          tap('From Level 1: tap a half step above B4.', 'C5'),
          tap('Tap the 3rd note of G major: B.', 'B4')
        ] } } },
    { id: 'p2-2', title: 'C major fingering: thumb under, finger over',
      review: ['fingering:C-major-RH'],
      steps: {
        hear: { text: 'C major up and down: listen for an even line, no bumps at the thumb.', sound: seq(updown(C_UP), 120) },
        learn: { cards: [
          { text: 'Right hand going up: 1 2 3, then the thumb passes under to F, then 1 2 3 4 5.', board: board([58, 74], Cmaj.dots(C_UP, 'note'), { fingers: RH_C }) },
          tech('Thumb under: move the thumb toward F while finger 3 holds E.', ['Play C D E with 1 2 3', 'Slide the thumb under to F, keep the wrist level', 'Finish G A B C with 2 3 4 5'], 'thumbUnder'),
          { text: 'Coming down, finger 3 crosses over the thumb from F to E.', board: board([58, 74], [Cmaj.dot('F4', 'note', { label: '1' }), Cmaj.dot('E4', 'note', { label: '3' })], { fingers: { 64: { n: 3, hand: 'R' }, 65: { n: 1, hand: 'R' } } }) }
        ] },
        see: { text: 'C major with the thumb crossing marked.', view: [58, 74], sequence: keys(C_UP), dots: Cmaj.dots(C_UP, 'note'), bpm: 100, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [55, 74], tasks: [
          task('Going up, the thumb passes under to which key? Tap it: F.', 'F4', { item: 'fingering:C-major-RH' }),
          task('Which key does finger 5 end on? Tap that C.', 'C5'),
          task('Going down, finger 3 crosses over to which key? Tap E.', 'E4')
        ] },
        play: { text: 'Play C major right hand, up and down, slowly: 1 2 3 1 2 3 4 5, then 5 4 3 2 1 3 2 1.', view: [58, 74], bpm: 60, follow: keys(updown(C_UP)) },
        check: { pass: 3, view: [55, 74], questions: [
          choice('In C major, right hand going up, the thumb crosses under after which finger?', ['3', '4', '2'], '3', 'fingering:C-major-RH'),
          tap('Tap the key the right thumb plays after crossing under: F.', 'F4'),
          tap('From Lesson 1: tap the 7th note of G major, F#.', 'F#4'),
          tap('Tap the key finger 3 plays first: E.', 'E4')
        ] } } },
    { id: 'p2-3', title: 'Scale degrees 1 to 7',
      review: [degreeItem({ key: 'C', id: 'major' }, '5')],
      steps: {
        hear: { text: 'C major with each degree: 1 2 3 4 5 6 7 1.', sound: seq(C_UP, 100) },
        learn: { cards: [S('l2-3.1', [60, 83]), S('l2-3.2', [60, 83]), S('l2-3.3', [60, 83])] },
        see: { text: 'C major labelled by degree.', view: [58, 74], sequence: keys(C_UP), dots: Cmaj.dots(C_UP), bpm: 100, link: { key: 'C', scale: 'major', labels: 'intervals' } },
        try: { view: [58, 74], tasks: [
          task('Tap degree 5 of C major: G.', 'G4', { item: degreeItem({ key: 'C', id: 'major' }, '5') }),
          task('Tap degree 3 of G major: B.', 'B4', { item: degreeItem({ key: 'G', id: 'major' }, '3') }),
          task('Tap degree 6 of C major: A.', 'A4', { item: degreeItem({ key: 'C', id: 'major' }, '6') })
        ] },
        play: { text: 'Play 1 3 5 3 1 in C, then in G, saying the numbers.', view: [58, 76], bpm: 70, follow: keys(['C4', 'E4', 'G4', 'E4', 'C4', null, 'G4', 'B4', 'D5', 'B4', 'G4']) },
        check: { pass: 3, view: [58, 76], questions: [
          choice('Degree 3 of C major is…', ['E', 'D', 'G'], 'E', 'fact:c-major-3rd'),
          tap('Tap degree 4 of C major: F.', 'F4', { item: degreeItem({ key: 'C', id: 'major' }, '4') }),
          tap('Tap degree 7 of C major: B.', 'B4', { item: degreeItem({ key: 'C', id: 'major' }, '7') }),
          tap('From Lesson 2: tap the key the right thumb crosses to in C major, F.', 'F4')
        ] } } },
    { id: 'p2-4', title: 'G and F major; five-finger positions',
      steps: {
        hear: { text: 'G major five-finger position, then F major.', sound: seq(['G4', 'A4', 'B4', 'C5', 'D5', null, 'F4', 'G4', 'A4', 'Bb4', 'C5'], 110) },
        learn: { cards: [
          { text: 'G major has one sharp, F#. Its five-finger position is G A B C D.', board: board([65, 77], Gmaj.dots(['G4', 'A4', 'B4', 'C5', 'D5'], 'note'), { bracket: { lo: 67, hi: 74, hand: 'R' } }) },
          { text: 'F major has one flat, Bb. Its five-finger position is F G A Bb C.', board: board([63, 74], Fmaj.dots(['F4', 'G4', 'A4', 'Bb4', 'C5'], 'note'), { bracket: { lo: 65, hi: 72, hand: 'R' } }) },
          { text: 'In F major the right hand goes 1 2 3 4 1 2 3 4: the thumb crosses after Bb.', board: board([63, 79], Fmaj.dots(['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5'], 'note'), { fingers: { 65: { n: 1, hand: 'R' }, 72: { n: 1, hand: 'R' } } }) }
        ] },
        see: { text: 'F major, one octave.', view: [63, 79], sequence: keys(['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5']), dots: Fmaj.dots(['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5'], 'note'), bpm: 100, link: { key: 'F', scale: 'major', labels: 'notes' } },
        try: { view: [62, 79], tasks: [
          task('Tap the black key in F major: Bb.', 'Bb4'),
          task('Tap the black key in G major: F#.', 'F#4'),
          task('Tap where the G five-finger position starts: G.', 'G4')
        ] },
        play: { text: 'Play the G five-finger position up and down, then F. Right hand, then left hand an octave lower.', view: [53, 79], bpm: 70, follow: keys(['G4', 'A4', 'B4', 'C5', 'D5', 'C5', 'B4', 'A4', 'G4', null, 'F4', 'G4', 'A4', 'Bb4', 'C5', 'Bb4', 'A4', 'G4', 'F4']) },
        check: { pass: 3, view: [62, 79], questions: [
          choice('How many sharps or flats does F major have?', ['1 flat (Bb)', '1 sharp (F#)', 'None'], '1 flat (Bb)', 'fact:f-major-flat'),
          tap('Tap the 4th note of F major: Bb.', 'Bb4'),
          tap('Tap the 3rd note of G major: B.', 'B4'),
          tap('From Lesson 3: tap degree 5 of C major, G.', 'G4', { item: degreeItem({ key: 'C', id: 'major' }, '5') })
        ] } } },
    { id: 'p2-5', title: 'Key signatures and the circle of fifths',
      review: ['keysig:G', 'keysig:D', 'keysig:F'],
      steps: {
        hear: { text: 'C, G, D, A: each a 5th higher, each with one more sharp.', sound: seq(['C4', 'G4', 'D5', 'A5'], 80) },
        learn: { cards: [S('l5-keys.1', [60, 83]), S('l5-keys.2', [60, 83]),
          { text: 'A key signature shows those sharps or flats once, at the start of each line, instead of on every note.', board: board([60, 79], [kd('F#4', { role: 'third' }), kd('C#5', { role: 'third' })]) }] },
        see: { text: 'Up in 5ths around the circle: C G D A E.', view: [58, 89], sequence: keys(['C4', 'G4', 'D5', 'A5', 'E6']), bpm: 70, link: { key: 'D', scale: 'major', labels: 'notes' } },
        try: { view: [58, 84], tasks: [
          task('Tap the key a 5th above C4: G.', 'G4'),
          task('Tap D: the key with two sharps.', all('D', [58, 84])),
          task('Tap the new sharp in D major: C#.', all('C#', [58, 84]))
        ] },
        play: { text: 'Play the five-finger position in C, G and D, one after the other, hearing each new sharp.', view: [58, 81], bpm: 70, follow: keys(['C4', 'D4', 'E4', 'F4', 'G4', null, 'G4', 'A4', 'B4', 'C5', 'D5', null, 'D5', 'E5', 'F#5', 'G5', 'A5']) },
        check: { pass: 3, view: [58, 84], questions: [
          choice('How many sharps does D major have?', ['2', '1', '3'], '2', 'fact:d-major-sharps'),
          choice('Which key has one sharp?', ['G major', 'D major', 'F major'], 'G major', 'fact:g-major-sharps'),
          tap('Tap the key a 5th above G4: D.', 'D5'),
          tap('From Lesson 4: tap the black key in F major, Bb.', all('Bb', [58, 84]))
        ] } } },
    { id: 'p2-6', title: 'The relative minor; A minor five-finger position',
      review: [degreeItem({ key: 'A', id: 'minor' }, 'b3')],
      steps: {
        hear: { text: 'A natural minor: the white keys from A to A.', sound: seq(['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'], 110) },
        learn: { cards: [S('l2-6.1', [60, 83]), S('l2-6.3', [60, 83]),
          { text: 'A minor five-finger position: A B C D E. It shares C major\'s white keys.', board: board([55, 67], Amin.dots(['A3', 'B3', 'C4', 'D4', 'E4'], 'note'), { bracket: { lo: 57, hi: 64, hand: 'R' } }) }] },
        see: { text: 'A minor five-finger position: A B C D E, then down.', view: [55, 67], sequence: keys(['A3', 'B3', 'C4', 'D4', 'E4', 'D4', 'C4', 'B3', 'A3']), dots: Amin.dots(['A3', 'B3', 'C4', 'D4', 'E4'], 'deg'), bpm: 100, link: { key: 'A', scale: 'minor', labels: 'intervals' } },
        try: { view: [55, 72], tasks: [
          task('Tap the flat 3rd of A minor: C.', 'C4', { item: degreeItem({ key: 'A', id: 'minor' }, 'b3') }),
          task('Tap the root of A minor nearest Middle C: the A below it.', 'A3'),
          task('Tap the 5th of A minor: E.', 'E4')
        ] },
        play: { text: 'Play the A minor five-finger position with each hand, then a short tune: A C B A, E D C B A.', view: [55, 67], bpm: 70, follow: keys(['A3', 'C4', 'B3', 'A3', 'E4', 'D4', 'C4', 'B3', 'A3']), drone: 'A' },
        check: { pass: 3, view: [55, 72], questions: [
          choice('A minor is the relative minor of…', ['C major', 'A major', 'E major'], 'C major', 'fact:relative-minor-a'),
          tap('Tap the 4th of A minor: D.', 'D4'),
          tap('Tap the flat 3rd of A minor: C.', 'C4', { item: degreeItem({ key: 'A', id: 'minor' }, 'b3') }),
          tap('From Lesson 5: tap the key a 5th above C4, G.', 'G4')
        ] } } },
    { id: 'p2-7', title: 'The major pentatonic: the black keys',
      steps: {
        hear: { text: 'The five black keys, low to high: G♭ major pentatonic.', sound: seq(GB_PENT, 110) },
        learn: { cards: [S('l2-7.1', [60, 83]), S('l2-7.2', [60, 83]),
          { text: 'The five black keys are G♭ major pentatonic. Any order sounds good, so improvise freely.', board: board([64, 77], GB_PENT.map(n => kd(n))) }] },
        see: { text: 'G♭ major pentatonic on the black keys.', view: [64, 77], sequence: keys(GB_PENT), dots: GB_PENT.map(n => kd(n)), bpm: 100, link: { key: 'Gb', scale: 'major-pentatonic', labels: 'notes' } },
        try: { view: [62, 79], tasks: [
          task('Tap the root of G♭ major pentatonic: Gb.', all('Gb', [62, 79])),
          task('Tap any Bb.', all('Bb', [62, 79])),
          task('Tap the 5th of Gb: Db.', all('Db', [62, 79]))
        ] },
        play: { text: 'Improvise on the black keys for 60 seconds over the drone. Start and end on Gb.', view: [62, 79], bpm: 70, drone: 'F#', dots: GB_PENT.map(n => kd(n)), seconds: 60 },
        check: { pass: 3, view: [62, 79], questions: [
          choice('How many notes are in a pentatonic scale?', ['5', '6', '7'], '5', 'fact:pentatonic-five'),
          tap('Tap any Eb.', all('Eb', [62, 79])),
          tap('Tap any Ab.', all('Ab', [62, 79])),
          tap('From Lesson 6: tap the 5th of A minor, E.', all('E', [62, 79]))
        ] } } }
  ],
  challenge: { id: 'p2-ch', title: 'Level 2 Challenge', challenge: true, flow: [
    { type: 'play', name: 'C and G major', text: 'Play C major, then G major, one octave, hands separately, at 60 bpm.', view: [58, 81], bpm: 60, follow: keys([...updown(C_UP), null, ...updown(G_UP)]), bpmKey: 'scales' },
    { type: 'play', name: 'Black-key improvising', text: 'Improvise for 60 seconds on the black keys over a left-hand open fifth (Gb + Db) drone.', view: [62, 79], bpm: 70, drone: 'F#', dots: GB_PENT.map(n => kd(n)), seconds: 60, bpmKey: 'improv' },
    { type: 'check', name: 'Check it', pass: 3, view: [58, 81], questions: [
      tap('Tap the 7th note of G major: F#.', 'F#5'), tap('Tap the black key in F major: Bb.', 'Bb4'),
      choice('Right hand, C major going up: where does the thumb cross under?', ['To F, after finger 3', 'To G, after finger 4', 'It never crosses'], 'To F, after finger 3', 'fingering:C-major-RH'),
      tap('Tap the flat 3rd of A minor: C.', 'C4')] }
  ] },
  placement: [
    tap('Tap the 7th note of G major: F#.', 'F#4'),
    choice('How many sharps does D major have?', ['2', '1', '3'], '2', 'fact:d-major-sharps'),
    choice('Do you know your major scales? Which step pattern makes one?', ['W W H W W W H', 'W H W W H W W', 'H W W W H W W'], 'W W H W W W H', 'fact:major-steps')
  ]
};
export const _K = K;
