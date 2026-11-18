// Piano Level 5: progressions and accompaniment (docs/research-piano.md E).
import { K, all, task, tap, choice, kd, tech, seq, keys, board, inKey, toneItem } from './kit.js';

const Ckey = inKey('C', 'scale', 'major');
const progQ = (prompt, prog, options, answer, item) => choice(prompt, options, answer, item, { sound: { prog, per: 2, bpm: 100 } });
const BOOGIE_C = ['C3', 'E3', 'G3', 'A3', 'Bb3', 'A3', 'G3', 'E3'];
const POP = [['C4', 'E4', 'G4'], ['B3', 'D4', 'G4'], ['C4', 'E4', 'A4'], ['C4', 'F4', 'A4']];   // I V vi IV, nearest voicings
const SHELLS = [['D3', 'C4'], ['G2', 'B2'], ['C3', 'B3']];

export default {
  id: 'piano-level-5', title: 'Progressions and accompaniment',
  lessons: [
    { id: 'p5-1', title: 'Roman numerals', review: ['staff:treble@F4'],
      steps: {
        hear: { text: 'I, IV, V, I in C: C, F, G, C.', sound: { prog: ['C:major', 'F:major', 'G:major', 'C:major'], per: 2, bpm: 90 } },
        learn: { cards: [
          { text: 'Number each chord by the degree of its root: I ii iii IV V vi vii°. Capitals are major, small letters minor.', board: board([58, 79], Ckey.dots(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'])) },
          { text: 'Numerals work in every key: I–IV–V is C–F–G in C and G–C–D in G.', board: board([58, 79], Ckey.dots(['C4', 'F4', 'G4'], 'note')) },
          { text: 'So a song you know in one key can move to any other: just keep the numbers.', board: board([58, 79], [kd('G4', { role: 'root' }), kd('C5'), kd('D5')]) }
        ] },
        see: { text: 'I–IV–V–I in C, roots lit.', view: [58, 72], sequence: keys(['C4', 'F4', 'G4', 'C4']), bpm: 60, link: { key: 'C', scale: 'major', labels: 'intervals' } },
        try: { view: [55, 76], tasks: [
          task('Tap the root of IV in G: C.', 'C5'), task('Tap the root of V in F: C.', 'C4'), task('Tap the root of vi in G: E.', 'E4')
        ] },
        play: { text: 'Play I–IV–V–I as triads in C, then in G and F: left hand on the roots, right hand on the chords.', view: [46, 79], bpm: 70, follow: keys([['C3', 'C4', 'E4', 'G4'], ['F3', 'C4', 'F4', 'A4'], ['G3', 'B3', 'D4', 'G4'], ['C3', 'C4', 'E4', 'G4']]), beatsPerStep: 4 },
        check: { pass: 3, view: [55, 76], questions: [
          choice('In D major, the V chord is…', ['A', 'G', 'E'], 'A', 'fact:d-major-v'),
          tap('Tap the root of IV in C: F.', 'F4'), tap('Tap the root of ii in C: D.', 'D4'),
          tap('From Level 4: tap the flat 7th of G7, F.', 'F4', { item: toneItem({ key: 'G', id: '7' }, 'b7') })
        ] } } },
    { id: 'p5-2', title: 'I–IV–V, the 12-bar blues and boogie bass',
      steps: {
        hear: { text: 'A boogie bass line on C: up and down the chord with the 6th and flat 7th.', sound: seq(BOOGIE_C, 200) },
        learn: { cards: [
          { text: 'The 12-bar blues: four bars of I, two of IV, two of I, then V, IV, I, V.', board: board([46, 60], [kd('C3', { role: 'root' }), kd('F3'), kd('G3')]) },
          { text: 'Boogie bass walks R 3 5 6 b7 6 5 3 in swung eighths, then moves to the next chord.', board: board([46, 60], [kd('C3', { label: 'R', role: 'root' }), kd('E3', { label: '3', role: 'third' }), kd('G3', { label: '5', role: 'fifth' }), kd('A3', { label: '6' }), kd('Bb3', { label: 'b7' })]) },
          tech('Swing the eighths: long-short, long-short.', ['Say "dooo-ba dooo-ba" in time', 'Play the boogie line slowly in that rhythm', 'Keep the left hand light and even'], 'curve')
        ] },
        see: { text: 'Boogie bass on C, then on F.', view: [46, 65], sequence: keys([...BOOGIE_C, 'F3', 'A3', 'C4', 'D4', 'Eb4', 'D4', 'C4', 'A3']), bpm: 160, link: { key: 'C', scale: 'mixolydian', labels: 'intervals' } },
        try: { view: [46, 65], tasks: [
          task('Tap the 6th of the C boogie: A.', 'A3'), task('Tap the flat 7th of the C boogie: Bb.', 'Bb3'), task('Tap the root of the IV chord: F.', 'F3')
        ] },
        play: { text: 'Play the boogie bass through a 12-bar blues in C with the shuffle: C, F and G patterns.', view: [46, 67], bpm: 80, groove: 'shuffle', follow: keys(['C3', 'G3', 'C3', 'G3', 'F3', 'C4', 'C3', 'G3', 'G3', 'F3', 'C3', 'G3']), beatsPerStep: 4, backing: { chords: ['C:7', 'C:7', 'C:7', 'C:7', 'F:7', 'F:7', 'C:7', 'C:7', 'G:7', 'F:7', 'C:7', 'G:7'] } },
        check: { pass: 3, view: [46, 65], questions: [
          choice('A 12-bar blues starts with how many bars of I?', ['4', '2', '8'], '4', 'fact:blues-first-four'),
          tap('Tap the 5th of the C boogie: G.', 'G3'), tap('Tap the 3rd of the C boogie: E.', 'E3'),
          tap('From Lesson 1: tap the root of IV in G, C.', 'C4')
        ] } } },
    { id: 'p5-3', title: 'I–V–vi–IV with voice-led triads',
      steps: {
        hear: { text: 'C, G, Am, F with the right hand barely moving.', sound: seq(POP, 50) },
        learn: { cards: [
          { text: 'I–V–vi–IV is one of the most common progressions. In C: C, G, Am, F.', board: board([58, 72], Ckey.dots(['C4', 'G4', 'A4', 'F4'], 'note')) },
          { text: 'Keep the shared notes and move the rest by a step: C E G → B D G → C E A → C F A.', board: board([55, 72], [kd('C4', { role: 'root', ring: true }), kd('E4', { role: 'third' }), kd('G4', { role: 'fifth' })]) },
          { text: 'The left hand plays the roots: C, G, A, F.', board: board([40, 60], [kd('C3', { role: 'root' }), kd('G2'), kd('A2'), kd('F2')]) }
        ] },
        see: { text: 'Voice-led I–V–vi–IV.', view: [55, 72], sequence: keys(POP), bpm: 45, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [55, 74], tasks: [
          task('In the nearest G chord after C, tap the lowest note: B.', 'B3'),
          task('In the nearest Am after G, tap the top note: A.', 'A4'),
          task('Tap the root of vi in C: A.', 'A4')
        ] },
        play: { text: 'Play I–V–vi–IV in C with these voicings and left-hand roots, one chord per bar.', view: [41, 72], bpm: 70, follow: keys(POP), beatsPerStep: 4, backing: { chords: ['C:major', 'G:major', 'A:minor', 'F:major'] } },
        check: { pass: 3, view: [55, 74], questions: [
          choice('I–V–vi–IV in G is…', ['G D Em C', 'G C D G', 'G Em C D'], 'G D Em C', 'fact:pop-progression-g'),
          tap('In the nearest F chord after Am, tap the middle note: F.', 'F4'),
          tap('Tap the root of V in C: G.', 'G4'),
          tap('From Lesson 2: tap the flat 7th of the C boogie, Bb.', 'Bb3')
        ] } } },
    { id: 'p5-4', title: 'ii–V–I with left-hand shells', review: [toneItem({ key: 'D', id: 'm7' }, 'b7'), toneItem({ key: 'G', id: '7' }, '3')],
      steps: {
        hear: { text: 'Dm7, G7, Cmaj7 as two-note left-hand shells.', sound: seq(SHELLS, 45) },
        learn: { cards: [
          { text: 'A shell voicing is the root plus the 7th or the 3rd: the notes that say what the chord is.', board: board([41, 62], [kd('D3', { role: 'root', label: 'R' }), kd('C4', { label: 'b7' })]) },
          { text: 'In ii–V–I: Dm7 is D + C, G7 is G + B, and Cmaj7 is C + B, so the top note barely moves.', board: board([41, 62], [kd('G2', { role: 'root', label: 'R' }), kd('B2', { role: 'third', label: '3' })]) },
          { text: 'With shells in the left hand, the right hand is free for the melody.', board: board([41, 62], [kd('C3', { role: 'root', label: 'R' }), kd('B3', { label: '7' })]) }
        ] },
        see: { text: 'ii–V–I shells in C.', view: [41, 62], sequence: keys(SHELLS), bpm: 45, link: { key: 'C', scale: 'major', labels: 'intervals' } },
        try: { view: [41, 62], tasks: [
          task('Dm7 shell: tap the 7th, C.', 'C4', { item: toneItem({ key: 'D', id: 'm7' }, 'b7') }),
          task('G7 shell: tap the 3rd, B.', 'B2', { item: toneItem({ key: 'G', id: '7' }, '3') }),
          task('Cmaj7 shell: tap the 7th, B.', 'B3', { item: toneItem({ key: 'C', id: 'maj7' }, '7') })
        ] },
        play: { text: 'Play ii–V–I shells in C with the swing groove, one chord per bar, and loop it.', view: [41, 62], bpm: 80, groove: 'walking', follow: keys([...SHELLS, ['C3', 'B3']]), beatsPerStep: 4, backing: { chords: ['D:m7', 'G:7', 'C:maj7', 'C:maj7'] } },
        check: { pass: 3, view: [41, 62], questions: [
          choice('A shell voicing is…', ['Root plus 3rd or 7th', 'Root plus 5th', 'All four notes'], 'Root plus 3rd or 7th', 'fact:shell-voicing'),
          tap('G7 shell: tap the root, G.', 'G2'), tap('Dm7 shell: tap the root, D.', 'D3'),
          tap('From Lesson 3: tap the root of vi in C, A.', 'A3')
        ] } } },
    { id: 'p5-5', title: 'Cadences: the pull of V to I',
      steps: {
        hear: { text: 'G7 to C: the strongest ending in music. Then G7 to Am: a surprise.', sound: { prog: ['G:7', 'C:major', 'G:7', 'A:minor'], per: 2, bpm: 80 } },
        learn: { cards: [
          { text: 'A cadence is how a phrase ends. V (or V7) to I sounds finished: an authentic cadence.', board: board([55, 72], [kd('G4', { role: 'root' }), kd('C4', { role: 'root' })]) },
          { text: 'In G7 the 3rd (B) rises to C and the 7th (F) falls to E. That is the pull you hear.', board: board([58, 72], [kd('B3', { role: 'third' }), kd('C4', { role: 'root' }), kd('F4', { label: 'b7' }), kd('E4', { role: 'third' })]) },
          { text: 'V to vi is a deceptive cadence: you expect home and get the minor chord.', board: board([55, 72], [kd('G4'), kd('A4', { role: 'root' })]) }
        ] },
        see: { text: 'G7 resolves: B up to C, F down to E.', view: [55, 72], sequence: keys([['G3', 'B3', 'F4'], ['G3', 'C4', 'E4']]), bpm: 40, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [55, 72], tasks: [
          task('The 3rd of G7 rises a half step. Tap where it goes: C.', 'C4'),
          task('The 7th of G7 falls. Tap where it goes: E.', 'E4'),
          task('Tap the root of the chord a deceptive cadence lands on in C: A.', 'A4')
        ] },
        play: { text: 'Play G7 to C several times, slowly, listening to B → C and F → E.', view: [55, 72], bpm: 50, follow: keys([['G3', 'B3', 'F4'], ['G3', 'C4', 'E4']]), beatsPerStep: 4 },
        check: { pass: 3, view: [55, 72], questions: [
          progQ('Listen. Does this phrase end finished or surprised?', ['F:major', 'G:7', 'C:major'], ['Finished (V–I)', 'Surprised (V–vi)'], 'Finished (V–I)', 'fact:hear-authentic-cadence'),
          tap('In G7, tap the 3rd: B.', 'B3', { item: toneItem({ key: 'G', id: '7' }, '3') }),
          tap('In G7, tap the flat 7th: F.', 'F4', { item: toneItem({ key: 'G', id: '7' }, 'b7') }),
          tap('From Lesson 4: Cmaj7 shell, tap the 7th, B.', 'B3', { item: toneItem({ key: 'C', id: 'maj7' }, '7') })
        ] } } },
    { id: 'p5-6', title: 'Accompaniment patterns and the sustain pedal',
      steps: {
        hear: { text: 'One C chord, four ways: block, broken, arpeggio, Alberti bass.', sound: seq(['C3', 'E3', 'G3', null, 'C3', 'G3', 'E4', 'G3', 'C3', 'G3', 'E3', 'G3'], 160) },
        learn: { cards: [
          { text: 'Broken chords spread the chord in time: root, 5th, 3rd, 5th.', board: board([46, 66], [kd('C3', { role: 'root' }), kd('G3', { role: 'fifth' }), kd('E4', { role: 'third' })]) },
          { text: 'Alberti bass is low–high–middle–high in eighths: C G E G. Mozart used it everywhere.', board: board([46, 60], [kd('C3', { role: 'root', label: '1' }), kd('G3', { role: 'fifth', label: '2,4' }), kd('E3', { role: 'third', label: '3' })]) },
          tech('The sustain (right) pedal holds the notes after you let go.', ['Play a chord, press the pedal, then lift your hands', 'Change chords: lift the pedal as the new chord sounds, then press again', 'Keep your heel on the floor'], 'pedal')
        ] },
        see: { text: 'Alberti bass on C, then on G7.', view: [46, 62], sequence: keys(['C3', 'G3', 'E3', 'G3', 'C3', 'G3', 'E3', 'G3', 'B2', 'G3', 'D3', 'G3']), bpm: 160, link: { key: 'C', scale: 'major', labels: 'intervals' } },
        try: { view: [46, 62], tasks: [
          task('Alberti on C: tap the "high" note, G.', 'G3'), task('Alberti on C: tap the "middle" note, E.', 'E3'), task('Alberti on C: tap the "low" note, C.', 'C3')
        ] },
        play: { text: 'Play the Alberti bass under C – F – G – C with the left hand. Try it in Practice → Play-along with the K. 545 opening.', view: [46, 62], bpm: 70, follow: keys(['C3', 'F3', 'G3', 'C3']), beatsPerStep: 4, backing: { chords: ['C:major', 'F:major', 'G:major', 'C:major'] } },
        check: { pass: 3, view: [46, 62], questions: [
          choice('Alberti bass plays the chord…', ['Low, high, middle, high', 'Low, middle, high, middle', 'All at once'], 'Low, high, middle, high', 'fact:alberti'),
          choice('When do you change the sustain pedal?', ['Lift as the new chord sounds, then press again', 'Never', 'Only at the end'], 'Lift as the new chord sounds, then press again', 'fact:pedal-change'),
          tap('Alberti on F: tap the "high" note, C.', 'C4'),
          tap('From Lesson 5: the 3rd of G7 rises to C. Tap C.', 'C4')
        ] } } },
    { id: 'p5-7', title: 'Recognising progressions by ear',
      steps: {
        hear: { text: 'Two progressions: I–IV–V–I, then I–V–vi–IV. Follow the lowest notes.', sound: { prog: ['C:major', 'F:major', 'G:major', 'C:major', 'C:major', 'G:major', 'A:minor', 'F:major'], per: 2, bpm: 100 } },
        learn: { cards: [
          { text: 'Follow the bass: each root is a step of the scale you know.', board: board([46, 60], [kd('C3', { role: 'root' }), kd('F3'), kd('G3')]) },
          { text: 'V wants to go home to I. A minor chord (vi) makes the mood dip.', board: board([46, 60], [kd('G3'), kd('A3', { role: 'third' })]) },
          { text: 'Sing the roots back. If you can sing it, you can find it on the keys.', board: board([46, 60], [kd('C3', { role: 'root' }), kd('G3'), kd('A3'), kd('F3')]) }
        ] },
        see: { text: 'I–V–vi–IV roots, lit as they sound.', view: [46, 60], sequence: keys(['C3', 'G3', 'A3', 'F3']), bpm: 60, link: { key: 'C', scale: 'major', labels: 'intervals' } },
        try: { view: [46, 60], tasks: [
          task('The bass goes from C up to F: tap F.', 'F3'), task('Then it goes to G, the V. Tap G.', 'G3'), task('The mood dips: tap the root of vi, A.', 'A3')
        ] },
        play: { text: 'Play left-hand roots along with I–V–vi–IV, then switch to I–IV–V–I by ear.', view: [46, 60], bpm: 80, follow: keys(['C3', 'G3', 'A3', 'F3']), beatsPerStep: 4, backing: { chords: ['C:major', 'G:major', 'A:minor', 'F:major'] } },
        check: { pass: 3, view: [46, 60], questions: [
          progQ('Which progression is this?', ['C:major', 'F:major', 'G:major', 'C:major'], ['I–IV–V–I', 'I–V–vi–IV', 'I–vi–IV–V'], 'I–IV–V–I', 'fact:hear-1451'),
          progQ('And this one?', ['C:major', 'G:major', 'A:minor', 'F:major'], ['I–V–vi–IV', 'I–IV–V–I', 'ii–V–I–I'], 'I–V–vi–IV', 'fact:hear-15-6-4'),
          tap('Tap the root of IV in C: F.', 'F3'),
          tap('From Lesson 6: Alberti on C, tap the "middle" note, E.', 'E3')
        ] } } }
  ],
  challenge: { id: 'p5-ch', title: 'Level 5 Challenge', challenge: true, flow: [
    { type: 'play', name: 'Accompany in C', text: 'Accompany this chart in C with the backing: C – Am – F – G. Use broken chords in the left hand.', view: [41, 72], bpm: 70, follow: keys(['C3', 'A2', 'F2', 'G2']), beatsPerStep: 4, backing: { chords: ['C:major', 'A:minor', 'F:major', 'G:major'] }, bpmKey: 'c' },
    { type: 'play', name: 'Accompany in G', text: 'Now in G: G – Em – C – D, with a different left-hand pattern (Alberti or octaves).', view: [41, 72], bpm: 70, follow: keys(['G2', 'E2', 'C3', 'D3']), beatsPerStep: 4, backing: { chords: ['G:major', 'E:minor', 'C:major', 'D:major'] }, bpmKey: 'g' },
    { type: 'check', name: 'By ear', pass: 3, view: [46, 60], questions: [
      progQ('Pick the progression.', ['G:major', 'E:minor', 'C:major', 'D:major'], ['I–vi–IV–V', 'I–IV–V–I', 'I–V–vi–IV'], 'I–vi–IV–V', 'fact:hear-16-4-5'),
      progQ('And this one?', ['G:major', 'C:major', 'D:major', 'G:major'], ['I–IV–V–I', 'I–vi–IV–V', 'ii–V–I–I'], 'I–IV–V–I', 'fact:hear-1451'),
      tap('Tap the root of V in C: G.', 'G3'), tap('Alberti on C: tap the "high" note, G.', 'G3')] }
  ] },
  placement: [
    choice('In D major, the V chord is…', ['A', 'G', 'E'], 'A', 'fact:d-major-v'),
    choice('Alberti bass plays the chord…', ['Low, high, middle, high', 'Low, middle, high, middle', 'All at once'], 'Low, high, middle, high', 'fact:alberti'),
    tap('Tap the root of IV in C: F.', 'F4')
  ]
};
export const _K = { K, all };
