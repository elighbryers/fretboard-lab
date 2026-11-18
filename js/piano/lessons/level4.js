// Piano Level 4: chords, inversions and voice leading — piano's "one chord, many shapes"
// (docs/research-piano.md E). Reading track: lesson 6 (chord symbols and a lead sheet).
import { K, all, task, tap, choice, kd, tech, seq, keys, board, S, inKey, toneItem } from './kit.js';

const C = inKey('C', 'chord', 'major'), Am = inKey('A', 'chord', 'minor'), Bdim = inKey('B', 'chord', 'dim'), Caug = inKey('C', 'chord', 'aug');
const Ckey = inKey('C', 'scale', 'major'), G7 = inKey('G', 'chord', '7'), Cmaj7 = inKey('C', 'chord', 'maj7'), Dm7 = inKey('D', 'chord', 'm7');
const VL = { C: [['C4', 'E4', 'G4'], ['C4', 'F4', 'A4'], ['B3', 'D4', 'G4'], ['C4', 'E4', 'G4']],
  G: [['G3', 'B3', 'D4'], ['G3', 'C4', 'E4'], ['F#3', 'A3', 'D4'], ['G3', 'B3', 'D4']],
  F: [['F3', 'A3', 'C4'], ['F3', 'Bb3', 'D4'], ['E3', 'G3', 'C4'], ['F3', 'A3', 'C4']] };
const V7 = { C: [['C4', 'E4', 'G4'], ['C4', 'F4', 'A4'], ['B3', 'F4', 'G4'], ['C4', 'E4', 'G4']] };

export default {
  id: 'piano-level-4', title: 'Chords, inversions and voice leading',
  lessons: [
    { id: 'p4-1', title: 'Triads: 1, 3 and 5', review: [toneItem({ key: 'C', id: 'major' }, '3')],
      steps: {
        hear: { text: 'C, E, G one at a time, then together: a C major triad.', sound: seq(['C4', 'E4', 'G4', ['C4', 'E4', 'G4']], 90) },
        learn: { cards: [S('l4-1.1', [60, 72]), S('l4-1.2', [60, 72]),
          { text: 'On the keys a triad is "play one, skip one, play one, skip one, play one": a stack of 3rds.', board: board([58, 70], C.dots(['C4', 'E4', 'G4'])) }] },
        see: { text: 'C major, then F major, then G major, each as skip-one shapes.', view: [58, 76], sequence: keys([['C4', 'E4', 'G4'], ['F4', 'A4', 'C5'], ['G4', 'B4', 'D5']]), bpm: 50, link: { key: 'C', chord: 'major', labels: 'intervals' } },
        try: { view: [58, 76], tasks: [
          task('Tap the 3rd of the C triad: E.', 'E4', { item: toneItem({ key: 'C', id: 'major' }, '3') }),
          task('Tap the 5th of the F triad: C.', 'C5', { item: toneItem({ key: 'F', id: 'major' }, '5') }),
          task('Tap the root of the G triad: G.', 'G4')
        ] },
        play: { text: 'Play triads up the C major scale with the right hand: C, Dm, Em, F, G, Am. Fingers 1 3 5 every time.', view: [58, 81], bpm: 60, follow: keys([['C4', 'E4', 'G4'], ['D4', 'F4', 'A4'], ['E4', 'G4', 'B4'], ['F4', 'A4', 'C5'], ['G4', 'B4', 'D5'], ['A4', 'C5', 'E5']]) },
        check: { pass: 3, view: [58, 76], questions: [
          choice('Which fingers play a right-hand triad in root position?', ['1, 3 and 5', '1, 2 and 3', '2, 3 and 4'], '1, 3 and 5', 'fact:triad-fingers-135'),
          tap('Tap the 3rd of the G triad: B.', 'B4', { item: toneItem({ key: 'G', id: 'major' }, '3') }),
          tap('Tap the 5th of the C triad: G.', 'G4', { item: toneItem({ key: 'C', id: 'major' }, '5') }),
          tap('From Level 3: tap a major 3rd above F4.', 'A4', { item: 'interval:M3' })
        ] } } },
    { id: 'p4-2', title: 'Major, minor, diminished and augmented', review: [toneItem({ key: 'A', id: 'minor' }, 'b3'), 'chord-ear:minor'],
      steps: {
        hear: { text: 'C major, C minor, C diminished, C augmented.', sound: seq([['C4', 'E4', 'G4'], ['C4', 'Eb4', 'G4'], ['C4', 'Eb4', 'Gb4'], ['C4', 'E4', 'G#4']], 50) },
        learn: { cards: [S('l4-2.1', [60, 72]), S('l4-2.3', [60, 72]),
          { text: 'Raise the 5th of a major triad and it is augmented: C E G#. It sounds unresolved.', board: board([58, 70], Caug.dots(['C4', 'E4', 'G#4'])) }] },
        see: { text: 'Minor: lower the 3rd. Diminished: lower the 5th too.', view: [58, 70], sequence: keys([['C4', 'E4', 'G4'], ['C4', 'Eb4', 'G4'], ['C4', 'Eb4', 'Gb4']]), bpm: 50, link: { key: 'C', chord: 'minor', labels: 'intervals' } },
        try: { view: [56, 76], tasks: [
          task('Tap the flat 3rd of A minor: C.', 'C5', { item: toneItem({ key: 'A', id: 'minor' }, 'b3') }),
          task('Tap the flat 5th of B diminished: F.', 'F4', { item: toneItem({ key: 'B', id: 'dim' }, 'b5') }),
          task('Tap the raised 5th of C augmented: G#.', 'G#4', { item: toneItem({ key: 'C', id: 'aug' }, '#5') })
        ] },
        play: { text: 'On D, play major, minor, diminished and augmented: move one key at a time and listen.', view: [58, 72], bpm: 50, follow: keys([['D4', 'F#4', 'A4'], ['D4', 'F4', 'A4'], ['D4', 'F4', 'Ab4'], ['D4', 'F#4', 'A#4']]) },
        check: { pass: 3, view: [56, 76], questions: [
          choice('Listen. Is this chord major or minor?', ['Minor', 'Major'], 'Minor', 'chord-ear:minor', { sound: { seq: [['A3', 'C4', 'E4'].map(n => K(n).midi)], bpm: 40 } }),
          tap('Tap the flat 3rd of D minor: F.', 'F4', { item: toneItem({ key: 'D', id: 'minor' }, 'b3') }),
          tap('Tap the 3rd of E major: G#.', 'G#4', { item: toneItem({ key: 'E', id: 'major' }, '3') }),
          tap('From Lesson 1: tap the 5th of the C triad, G.', 'G4', { item: toneItem({ key: 'C', id: 'major' }, '5') })
        ] } } },
    { id: 'p4-3', title: 'The chords of a major key',
      steps: {
        hear: { text: 'The seven triads of C major, up the scale.', sound: seq([['C4', 'E4', 'G4'], ['D4', 'F4', 'A4'], ['E4', 'G4', 'B4'], ['F4', 'A4', 'C5'], ['G4', 'B4', 'D5'], ['A4', 'C5', 'E5'], ['B4', 'D5', 'F5']], 70) },
        learn: { cards: [
          { text: 'Build a triad on every note of the scale with only the key\'s notes. You get seven chords.', board: board([58, 79], Ckey.dots(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'], 'note')) },
          { text: 'In every major key: I major, ii and iii minor, IV and V major, vi minor, vii° diminished.', board: board([58, 79], Ckey.dots(['C4', 'F4', 'G4'])) },
          { text: 'In C: C, Dm, Em, F, G, Am and Bdim. I, IV and V are the three major chords.', board: board([58, 79], Ckey.dots(['C4', 'F4', 'G4'], 'note')) }
        ] },
        see: { text: 'The three major chords of C: I, IV, V.', view: [58, 77], sequence: keys([['C4', 'E4', 'G4'], ['F4', 'A4', 'C5'], ['G4', 'B4', 'D5']]), bpm: 50, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [58, 79], tasks: [
          task('Tap the root of the ii chord in C: D.', 'D4'), task('Tap the root of the vi chord in C: A.', 'A4'), task('Tap the root of the V chord in G: D.', 'D5')
        ] },
        play: { text: 'Play I, IV, V, I in C with the right hand (root position), then the same in G.', view: [58, 81], bpm: 60, follow: keys([['C4', 'E4', 'G4'], ['F4', 'A4', 'C5'], ['G4', 'B4', 'D5'], ['C4', 'E4', 'G4'], null, ['G4', 'B4', 'D5'], ['C5', 'E5', 'G5'], ['D5', 'F#5', 'A5'], ['G4', 'B4', 'D5']]) },
        check: { pass: 3, view: [58, 79], questions: [
          choice('In a major key, which chord is diminished?', ['vii°', 'ii', 'IV'], 'vii°', 'fact:vii-dim'),
          tap('Tap the root of the IV chord in C: F.', 'F4'),
          tap('Tap the root of the iii chord in C: E.', 'E4'),
          tap('From Lesson 2: tap the flat 3rd of D minor, F.', 'F4', { item: toneItem({ key: 'D', id: 'minor' }, 'b3') })
        ] } } },
    { id: 'p4-4', title: 'Root position, 1st and 2nd inversion', review: ['inversion:1st', 'inversion:2nd'],
      steps: {
        hear: { text: 'C major three ways: C E G, E G C, G C E.', sound: seq([['C4', 'E4', 'G4'], ['E4', 'G4', 'C5'], ['G4', 'C5', 'E5']], 50) },
        learn: { cards: [
          { text: 'Root position has the root at the bottom. The colors stay the same in every inversion.', board: board([58, 70], C.dots(['C4', 'E4', 'G4'])) },
          { text: '1st inversion puts the 3rd at the bottom: E G C.', board: board([62, 74], C.dots(['E4', 'G4', 'C5'])) },
          { text: '2nd inversion puts the 5th at the bottom: G C E.', board: board([65, 77], C.dots(['G4', 'C5', 'E5'])) }
        ] },
        see: { text: 'Up through the inversions of F major.', view: [63, 82], sequence: keys([['F4', 'A4', 'C5'], ['A4', 'C5', 'F5'], ['C5', 'F5', 'A5']]), bpm: 50, link: { key: 'F', chord: 'major', labels: 'intervals' } },
        try: { view: [58, 79], tasks: [
          task('C major in 1st inversion starts on the 3rd. Tap that E.', 'E4', { item: 'inversion:1st' }),
          task('C major in 2nd inversion starts on the 5th. Tap that G.', 'G4', { item: 'inversion:2nd' }),
          task('G major in 1st inversion starts on its 3rd: tap B.', 'B4', { item: 'inversion:1st' })
        ] },
        play: { text: 'Play C major in root position, 1st and 2nd inversion and back, right hand: fingers 1 3 5, 1 2 5, 1 3 5.', view: [58, 79], bpm: 50, follow: keys([['C4', 'E4', 'G4'], ['E4', 'G4', 'C5'], ['G4', 'C5', 'E5'], ['E4', 'G4', 'C5'], ['C4', 'E4', 'G4']]) },
        check: { pass: 3, view: [58, 79], questions: [
          choice('Listen. Which inversion is this C chord?', ['1st inversion', 'Root position', '2nd inversion'], '1st inversion', 'inversion:1st', { sound: { seq: [[64, 67, 72]], bpm: 40 } }),
          tap('F major in 2nd inversion: tap its lowest note, C.', 'C5', { item: 'inversion:2nd' }),
          tap('A minor in 1st inversion: tap its lowest note, C.', 'C5', { item: 'inversion:1st' }),
          tap('From Lesson 3: tap the root of the vi chord in C, A.', 'A4')
        ] } } },
    { id: 'p4-5', title: 'Voice leading: I–IV–V–I',
      steps: {
        hear: { text: 'I–IV–V–I in C, each chord moving to its nearest notes.', sound: seq(VL.C, 50) },
        learn: { cards: [S('l5-7.3', [55, 77]),
          { text: 'From C (C E G) to F, keep C, move E up to F and G up to A: F major in 2nd inversion.', board: board([58, 72], [C.dot('C4', 'deg', { ring: true }), kd('F4', { role: 'root', label: 'R' }), kd('A4', { role: 'third', label: '3' })]) },
          { text: 'From C to G, keep G and move the others down a step: G in 1st inversion (B D G).', board: board([56, 70], [kd('B3', { role: 'third', label: '3' }), kd('D4', { role: 'fifth', label: '5' }), kd('G4', { role: 'root', label: 'R', ring: true })]) }] },
        see: { text: 'Watch the hand barely move: C – F – G – C.', view: [55, 72], sequence: keys(VL.C), bpm: 45, link: { key: 'C', scale: 'major', labels: 'intervals' } },
        try: { view: [55, 74], tasks: [
          task('Going from C to F: which note stays? Tap it, C.', 'C4'),
          task('Going from C to G: which note stays? Tap it, G.', 'G4'),
          task('In the nearest G chord, the 3rd is at the bottom. Tap that B.', 'B3')
        ] },
        play: { text: 'Play I–IV–V–I in C with the nearest voicings, one chord per bar, while your left hand plays the roots.', view: [46, 74], bpm: 60, follow: keys(VL.C), beatsPerStep: 4 },
        check: { pass: 3, view: [55, 74], questions: [
          choice('Voice leading means…', ['Moving each note to the nearest note of the next chord', 'Playing every chord in root position', 'Singing the melody'], 'Moving each note to the nearest note of the next chord', 'fact:voice-leading'),
          tap('From C (C E G) to Am, two notes stay. Tap the one that moves: G, which goes up to A.', 'G4'),
          tap('In the nearest F chord after C, tap the top note: A.', 'A4'),
          tap('From Lesson 4: C major in 1st inversion starts on E. Tap it.', 'E4', { item: 'inversion:1st' })
        ] } } },
    { id: 'p4-6', title: 'Reading 3: chord symbols and a lead sheet',
      steps: {
        hear: { text: 'A lead sheet: a melody with chord symbols. The left hand plays the chords.', sound: seq([['C3', 'E4'], 'E4', 'F4', 'G4', ['G2', 'G4'], 'F4', 'E4', 'D4'], 100) },
        learn: { cards: [
          { text: 'A lead sheet shows the melody on a staff and chord symbols above it: C, G7, Am.', board: board([46, 72], [kd('C3', { role: 'root' }), kd('E4', { role: 'third' })]) },
          { text: 'The symbol tells you the chord; you choose how to play it. Start with the left hand on the root.', board: board([41, 60], [kd('C3', { role: 'root' }), kd('G2', { role: 'fifth' })]) },
          { text: 'Then add the 5th, or the whole chord, on beat 1 of each bar.', board: board([46, 60], [kd('C3', { role: 'root', label: 'R' }), kd('G3', { role: 'fifth', label: '5' })]) }
        ] },
        see: { text: 'Ode to Joy as a lead sheet: C | G | C | G, left hand on the roots.', view: [41, 72], sequence: keys([['C3', 'E4'], 'E4', 'F4', 'G4', ['G2', 'G4'], 'F4', 'E4', 'D4']), bpm: 90, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [41, 72], tasks: [
          task('The symbol is G. Tap a left-hand root: G.', all('G', [41, 55])),
          task('The symbol is F. Tap a left-hand root: F.', all('F', [41, 55])),
          task('The symbol is Am. Tap a left-hand root: A.', all('A', [41, 55]))
        ] },
        play: { text: 'Open Ode to Joy in Practice → Play-along, choose the Chord chart view and play left-hand roots under the melody.', view: [41, 72], bpm: 70, follow: keys([['C3', 'E4'], 'E4', 'F4', 'G4', ['G2', 'G4'], 'F4', 'E4', 'D4']) },
        check: { pass: 3, view: [41, 72], questions: [
          choice('In a lead sheet, the chord symbols tell you…', ['Which chord to play, not exactly how', 'Every note for both hands', 'Which fingers to use'], 'Which chord to play, not exactly how', 'fact:lead-sheet'),
          tap('The symbol is D. Tap a left-hand root: D.', all('D', [41, 55])),
          tap('The symbol is C. Tap a left-hand root: C.', all('C', [41, 55])),
          tap('From Lesson 5: from C to G, which note stays? Tap G.', 'G4')
        ] } } },
    { id: 'p4-7', title: '7th chords', review: [toneItem({ key: 'G', id: '7' }, 'b7'), toneItem({ key: 'C', id: 'maj7' }, '7')],
      steps: {
        hear: { text: 'Cmaj7, G7 and Dm7.', sound: seq([['C4', 'E4', 'G4', 'B4'], ['G3', 'B3', 'D4', 'F4'], ['D4', 'F4', 'A4', 'C5']], 45) },
        learn: { cards: [S('l4-7.1', [60, 72]), S('l4-7.2', [55, 72]), S('l4-7.3', [60, 74])] },
        see: { text: 'ii7 – V7 – Imaj7 in C: Dm7, G7, Cmaj7.', view: [55, 74], sequence: keys([['D4', 'F4', 'A4', 'C5'], ['G3', 'B3', 'D4', 'F4'], ['C4', 'E4', 'G4', 'B4']]), bpm: 45, link: { key: 'G', chord: '7', labels: 'intervals' } },
        try: { view: [55, 74], tasks: [
          task('Tap the flat 7th of G7: F.', 'F4', { item: toneItem({ key: 'G', id: '7' }, 'b7') }),
          task('Tap the major 7th of Cmaj7: B.', 'B4', { item: toneItem({ key: 'C', id: 'maj7' }, '7') }),
          task('Tap the flat 7th of Dm7: C.', 'C5', { item: toneItem({ key: 'D', id: 'm7' }, 'b7') })
        ] },
        play: { text: 'Play Dm7, G7, Cmaj7 slowly, one per bar. Hear each 7th pull toward the next chord.', view: [55, 74], bpm: 50, follow: keys([['D4', 'F4', 'A4', 'C5'], ['G3', 'B3', 'D4', 'F4'], ['C4', 'E4', 'G4', 'B4']]), beatsPerStep: 4 },
        check: { pass: 3, view: [55, 74], questions: [
          choice('A dominant 7 chord is…', ['R 3 5 b7', 'R 3 5 7', 'R b3 5 b7'], 'R 3 5 b7', 'fact:dom7-formula'),
          tap('Tap the 3rd of G7: B.', 'B3', { item: toneItem({ key: 'G', id: '7' }, '3') }),
          tap('Tap the flat 3rd of Dm7: F.', 'F4', { item: toneItem({ key: 'D', id: 'm7' }, 'b3') }),
          tap('From Lesson 6: the symbol is A. Tap a left-hand root, A.', all('A', [55, 74]))
        ] } } }
  ],
  challenge: { id: 'p4-ch', title: 'Level 4 Challenge', challenge: true, flow: [
    { type: 'play', name: 'I–IV–V7–I in C', text: 'Play I–IV–V7–I in C with smooth voice leading at 70 bpm, one chord per bar.', view: [55, 74], bpm: 70, follow: keys(V7.C), beatsPerStep: 4, bpmKey: 'c' },
    { type: 'play', name: 'In G and F', text: 'Now I–IV–V–I in G, then in F, with the nearest voicings.', view: [50, 72], bpm: 70, follow: keys([...VL.G, null, ...VL.F]), beatsPerStep: 4, bpmKey: 'gf' },
    { type: 'timedtriads', name: 'Build triads fast', text: 'Build each triad the app names in under 3 seconds (any inversion).', rounds: 10, seconds: 3, pass: 7, view: [55, 79], qualities: ['major', 'minor'] }
  ] },
  placement: [
    tap('Tap the 3rd of G major: B.', 'B4', { item: toneItem({ key: 'G', id: 'major' }, '3') }),
    choice('Do you know your major triads? Which notes make D major?', ['D F# A', 'D F A', 'D G B'], 'D F# A', 'fact:d-major-triad'),
    choice('E G C is C major in…', ['1st inversion', 'Root position', '2nd inversion'], '1st inversion', 'inversion:1st')
  ]
};
export const _x = { Am, Bdim, G7, Cmaj7, Dm7 };
