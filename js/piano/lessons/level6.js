// Piano Level 6: improvising and lead-sheet playing (docs/research-piano.md E).
import { K, all, task, tap, choice, kd, tech, seq, keys, board, S, inKey, toneItem, degreeItem } from './kit.js';

const Ablues = inKey('A', 'scale', 'blues'), Apent = inKey('A', 'scale', 'minor-pentatonic'), Ckey = inKey('C', 'scale', 'major');
const PENT = ['A4', 'C5', 'D5', 'E5', 'G5', 'A5'], BLUES = ['A4', 'C5', 'D5', 'Eb5', 'E5', 'G5', 'A5'];
const BLUES12 = ['A:7', 'A:7', 'A:7', 'A:7', 'D:7', 'D:7', 'A:7', 'A:7', 'E:7', 'D:7', 'A:7', 'E:7'];

export default {
  id: 'piano-level-6', title: 'Improvising and lead-sheet playing',
  lessons: [
    { id: 'p6-1', title: 'Minor pentatonic and the blues scale', review: [degreeItem({ key: 'A', id: 'blues' }, 'b5'), 'staff:treble@C5'],
      steps: {
        hear: { text: 'A minor pentatonic, then the blues scale with its extra note, Eb.', sound: seq([...PENT, null, ...BLUES], 140) },
        learn: { cards: [S('l6-5.1', [69, 84]), S('l6-5.2', [61, 84]), S('l6-5.3', [67, 84])] },
        see: { text: 'The A blues scale over an A7 left hand.', view: [67, 84], sequence: keys(BLUES), dots: Ablues.dots(BLUES), bpm: 120, link: { key: 'A', scale: 'blues', labels: 'intervals' } },
        try: { view: [67, 84], tasks: [
          task('Tap the blue note of A blues: Eb.', 'Eb5', { item: degreeItem({ key: 'A', id: 'blues' }, 'b5') }),
          task('Tap the flat 3rd of A minor pentatonic: C.', 'C5', { item: degreeItem({ key: 'A', id: 'minor-pentatonic' }, 'b3') }),
          task('Tap the flat 7th: G.', 'G5')
        ] },
        play: { text: 'Left hand plays A–E (root and 5th) on each beat; right hand improvises with the A blues scale for 60 seconds.', view: [43, 84], bpm: 80, groove: 'shuffle', dots: Ablues.dots(BLUES), seconds: 60, backing: { chords: BLUES12 } },
        check: { pass: 3, view: [67, 84], questions: [
          choice('The blues scale adds which note to the minor pentatonic?', ['The flat 5th', 'The 2nd', 'The major 3rd'], 'The flat 5th', 'fact:blues-adds-b5'),
          tap('Tap the 4th of A minor pentatonic: D.', 'D5'), tap('Tap the 5th of A minor pentatonic: E.', 'E5'),
          tap('From Level 5: tap the root of V in C, G.', 'G4')
        ] } } },
    { id: 'p6-2', title: 'Targeting chord tones on the changes',
      steps: {
        hear: { text: 'A line that lands on E over C, then on F over F: each change lands on a chord tone.', sound: seq(['G4', 'F4', 'E4', null, 'G4', 'G4', 'F4', null], 110) },
        learn: { cards: [S('l6-2.1', [60, 72]), S('l6-2.2', [60, 72]), S('l6-2.3', [60, 72])] },
        see: { text: 'Over C then F: land on E (3rd of C), then on A (3rd of F).', view: [58, 74], sequence: keys(['G4', 'F4', 'E4', null, 'C5', 'B4', 'A4', null]), bpm: 100, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [58, 76], tasks: [
          task('The chord changes to F. Land on its 3rd: A.', 'A4', { item: toneItem({ key: 'F', id: 'major' }, '3') }),
          task('The chord changes to G. Land on its 3rd: B.', 'B4', { item: toneItem({ key: 'G', id: 'major' }, '3') }),
          task('The chord changes to Am. Land on its root: A.', 'A4')
        ] },
        play: { text: 'Improvise over C – F – G – C with the backing; on beat 1 of each bar, land on a chord tone.', view: [58, 79], bpm: 70, dots: Ckey.dots(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], 'note'), seconds: 60, backing: { chords: ['C:major', 'F:major', 'G:major', 'C:major'] } },
        check: { pass: 3, view: [58, 76], questions: [
          choice('Over C, which notes are chord tones?', ['C, E and G', 'D, F and A', 'B, D and F'], 'C, E and G', 'fact:c-chord-tones'),
          tap('The chord is G. Tap its 5th: D.', 'D5', { item: toneItem({ key: 'G', id: 'major' }, '5') }),
          tap('The chord is F. Tap its root: F.', 'F4'),
          tap('From Lesson 1: tap the blue note of A blues, Eb.', 'Eb5', { item: degreeItem({ key: 'A', id: 'blues' }, 'b5') })
        ] } } },
    { id: 'p6-3', title: 'Phrasing: call, response and space',
      steps: {
        hear: { text: 'A short call, a rest, then an answer that ends somewhere new.', sound: seq(['E5', 'G5', 'A5', null, null, 'G5', 'E5', 'D5', 'C5', null], 140) },
        learn: { cards: [S('l6-3.1', [69, 84]), S('l6-3.2', [69, 84]), S('l6-3.3', [69, 84])] },
        see: { text: 'Call: E G A. Response: G E D C.', view: [69, 84], sequence: keys(['E5', 'G5', 'A5', null, 'G5', 'E5', 'D5', 'C5']), dots: Apent.dots(PENT), bpm: 110, link: { key: 'A', scale: 'minor-pentatonic', labels: 'notes' } },
        try: { view: [67, 84], tasks: [
          task('Tap the last note of the call: A.', 'A5'), task('Tap the last note of the response: C.', 'C5'), task('Tap the note both phrases share: G.', 'G5')
        ] },
        play: { text: 'Over the blues backing, play a two-bar call, rest, then answer it. Repeat a good idea before changing it.', view: [67, 84], bpm: 80, groove: 'shuffle', dots: Apent.dots(PENT), seconds: 60, backing: { chords: BLUES12 } },
        check: { pass: 3, view: [67, 84], questions: [
          choice('Why leave space between phrases?', ['It lets the music breathe, like taking a breath', 'To rest your hand', 'It is a mistake'], 'It lets the music breathe, like taking a breath', 'fact:phrase-space'),
          tap('Tap the root of A minor pentatonic: A.', all('A', [67, 84])), tap('Tap the flat 3rd: C.', 'C5'),
          tap('From Lesson 2: the chord is G. Tap its 5th, D.', 'D5', { item: toneItem({ key: 'G', id: 'major' }, '5') })
        ] } } },
    { id: 'p6-4', title: 'Comping: rhythms and three-note voicings',
      steps: {
        hear: { text: 'Left hand roots, right hand short chords on the off-beats: comping.', sound: seq([['C3'], ['E4', 'G4', 'C5'], ['C3'], ['E4', 'G4', 'C5'], ['F2'], ['F4', 'A4', 'C5'], ['G2'], ['F4', 'G4', 'B4']], 120) },
        learn: { cards: [
          { text: 'Comping means accompanying with rhythm: the left hand holds the root, the right hand plays short chords.', board: board([46, 74], [kd('C3', { role: 'root' }), kd('E4', { role: 'third' }), kd('G4', { role: 'fifth' }), kd('C5', { role: 'root' })]) },
          { text: 'Three-note right-hand voicings stay close together; move them to the nearest notes of each chord.', board: board([62, 74], [kd('E4', { role: 'third' }), kd('G4', { role: 'fifth' }), kd('C5', { role: 'root' })]) },
          { text: 'Play on the "&" of beats 2 and 4 for a lift, or on beats 2 and 4 for a steady backbeat.', board: board([62, 74], [kd('F4'), kd('A4', { role: 'third' }), kd('C5', { role: 'fifth' })]) }
        ] },
        see: { text: 'C – F – G7 – C comped: LH root, RH close voicings.', view: [41, 74], sequence: keys([['C3', 'E4', 'G4', 'C5'], ['F2', 'F4', 'A4', 'C5'], ['G2', 'F4', 'G4', 'B4'], ['C3', 'E4', 'G4', 'C5']]), bpm: 60, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [62, 76], tasks: [
          task('The RH voicing of C here is E G C. Tap its lowest note: E.', 'E4'),
          task('The RH voicing of F is F A C. Tap its middle note: A.', 'A4'),
          task('The RH voicing of G7 is F G B. Tap its top note: B.', 'B4')
        ] },
        play: { text: 'Comp C – F – G7 – C with the backing: left hand on beat 1, right hand on 2 and 4.', view: [41, 76], bpm: 80, follow: keys([['C3', 'E4', 'G4', 'C5'], ['F2', 'F4', 'A4', 'C5'], ['G2', 'F4', 'G4', 'B4'], ['C3', 'E4', 'G4', 'C5']]), beatsPerStep: 4, backing: { chords: ['C:major', 'F:major', 'G:7', 'C:major'] } },
        check: { pass: 3, view: [62, 76], questions: [
          choice('Comping means…', ['Accompanying with rhythmic chords', 'Playing the melody', 'Playing fast scales'], 'Accompanying with rhythmic chords', 'fact:comping'),
          tap('In the G7 voicing F G B, tap the 7th: F.', 'F4', { item: toneItem({ key: 'G', id: '7' }, 'b7') }),
          tap('In the F voicing F A C, tap the 3rd: A.', 'A4', { item: toneItem({ key: 'F', id: 'major' }, '3') }),
          tap('From Lesson 3: tap the last note of the call, A.', 'A4')
        ] } } },
    { id: 'p6-5', title: 'Melody with chords underneath in the right hand',
      steps: {
        hear: { text: 'Ode to Joy with the chord filled in under each melody note on beat 1.', sound: seq([['C4', 'E4'], 'E4', 'F4', 'G4', ['B3', 'D4', 'G4'], 'F4', 'E4', 'D4'], 90) },
        learn: { cards: [
          { text: 'Keep the melody on top, played by fingers 4 and 5, and add chord tones under it with the thumb.', board: board([58, 72], [kd('C4', { role: 'root' }), kd('E4', { role: 'third', label: 'melody' })]) },
          { text: 'On beat 1 of each bar, add the chord; between beats, just the melody.', board: board([55, 72], [kd('B3', { role: 'third' }), kd('D4', { role: 'fifth' }), kd('G4', { role: 'root' })]) },
          tech('Make the melody sing above the chord.', ['Play the chord softly and the top note a little louder', 'Lean the hand toward fingers 4 and 5', 'Keep the thumb light'], 'curve')
        ] },
        see: { text: 'Melody on top, chord tones under it on beat 1.', view: [55, 72], sequence: keys([['C4', 'E4'], 'E4', 'F4', 'G4', ['B3', 'D4', 'G4'], 'F4', 'E4', 'D4']), bpm: 80, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [55, 72], tasks: [
          task('Melody E over a C chord: add the root under it. Tap C.', 'C4'),
          task('Melody G over a G chord: tap the 3rd under it, B.', 'B3'),
          task('Tap the melody note on top of that G chord: G.', 'G4')
        ] },
        play: { text: 'Play the first line of Ode to Joy with chords under the melody on beat 1, right hand only.', view: [55, 72], bpm: 60, follow: keys([['C4', 'E4'], 'E4', 'F4', 'G4', ['B3', 'D4', 'G4'], 'F4', 'E4', 'D4']) },
        check: { pass: 3, view: [55, 72], questions: [
          choice('Which part should be loudest?', ['The melody on top', 'The thumb', 'Every note the same'], 'The melody on top', 'fact:melody-on-top'),
          tap('Melody A over an F chord: tap the F under it.', 'F4'),
          tap('Melody D over a G chord: tap the B under it.', 'B3'),
          tap('From Lesson 4: in the G7 voicing F G B, tap the top note, B.', 'B4')
        ] } } },
    { id: 'p6-6', title: 'Modes: Dorian and Mixolydian', review: [degreeItem({ key: 'D', id: 'dorian' }, '6'), degreeItem({ key: 'G', id: 'mixolydian' }, 'b7')],
      steps: {
        hear: { text: 'D Dorian (minor with a bright 6th), then G Mixolydian (major with a flat 7th).', sound: seq(['D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', null, 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'], 150) },
        learn: { cards: [S('l6-6.1', [60, 79]), S('l6-6.2', [60, 79]), S('l6-6.3', [60, 79])] },
        see: { text: 'Both are the white keys: D to D is Dorian, G to G is Mixolydian.', view: [60, 79], sequence: keys(['D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5']), bpm: 120, link: { key: 'D', scale: 'dorian', labels: 'intervals' } },
        try: { view: [60, 79], tasks: [
          task('Tap the bright 6th of D Dorian: B.', 'B4', { item: degreeItem({ key: 'D', id: 'dorian' }, '6') }),
          task('Tap the flat 7th of G Mixolydian: F.', 'F5', { item: degreeItem({ key: 'G', id: 'mixolydian' }, 'b7') }),
          task('Tap the flat 3rd of D Dorian: F.', 'F4', { item: degreeItem({ key: 'D', id: 'dorian' }, 'b3') })
        ] },
        play: { text: 'Improvise with D Dorian over Dm7, then G Mixolydian over G7: white keys only, starting from each root.', view: [60, 79], bpm: 80, groove: 'funk16', seconds: 60, dots: Ckey.dots(['D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5'], 'note'), backing: { chords: ['D:m7', 'D:m7', 'G:7', 'G:7'] } },
        check: { pass: 3, view: [60, 79], questions: [
          choice('Mixolydian is the major scale with…', ['A flat 7th', 'A flat 3rd', 'A sharp 4th'], 'A flat 7th', 'fact:mixolydian-b7'),
          tap('Tap the 6th of D Dorian: B.', 'B4', { item: degreeItem({ key: 'D', id: 'dorian' }, '6') }),
          tap('Tap the 3rd of G Mixolydian: B.', 'B4', { item: degreeItem({ key: 'G', id: 'mixolydian' }, '3') }),
          tap('From Lesson 5: melody A over an F chord. Tap the F under it.', 'F4')
        ] } } },
    { id: 'p6-7', title: 'Improvising over ii–V–I', review: [toneItem({ key: 'D', id: 'm7' }, 'b3'), toneItem({ key: 'G', id: '7' }, '3'), toneItem({ key: 'C', id: 'maj7' }, '3')],
      steps: {
        hear: { text: 'A line over Dm7 – G7 – Cmaj7 that lands on each chord\'s 3rd: F, B, E.', sound: seq(['A4', 'G4', 'F4', null, 'D5', 'C5', 'B4', null, 'G4', 'F4', 'E4', null], 140) },
        learn: { cards: [S('l6-7.1', [60, 76]), S('l6-7.3', [60, 76]),
          { text: 'Left hand: the ii–V–I shells you know. Right hand: the C major scale, aiming at each 3rd.', board: board([41, 76], [kd('D3', { role: 'root' }), kd('F4', { role: 'third' }), kd('G2', { role: 'root' }), kd('B4', { role: 'third' })]) }] },
        see: { text: 'Landing on the 3rds: F over Dm7, B over G7, E over Cmaj7.', view: [62, 76], sequence: keys(['A4', 'G4', 'F4', null, 'D5', 'C5', 'B4', null, 'G4', 'F4', 'E4']), bpm: 110, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [62, 76], tasks: [
          task('Over Dm7, land on its 3rd: F.', 'F4', { item: toneItem({ key: 'D', id: 'm7' }, 'b3') }),
          task('Over G7, land on its 3rd: B.', 'B4', { item: toneItem({ key: 'G', id: '7' }, '3') }),
          task('Over Cmaj7, land on its 3rd: E.', 'E4', { item: toneItem({ key: 'C', id: 'maj7' }, '3') })
        ] },
        play: { text: 'Left hand shells, right hand improvising with C major over ii–V–I. Land on a 3rd at each change.', view: [41, 79], bpm: 80, groove: 'walking', seconds: 60, backing: { chords: ['D:m7', 'G:7', 'C:maj7', 'C:maj7'] }, dots: Ckey.dots(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], 'note') },
        check: { pass: 3, view: [62, 76], questions: [
          choice('Over ii–V–I in C, one scale fits all three chords. Which?', ['C major', 'A minor pentatonic only', 'G major'], 'C major', 'fact:iivi-c-scale'),
          tap('Over G7, tap its flat 7th: F.', 'F4', { item: toneItem({ key: 'G', id: '7' }, 'b7') }),
          tap('Over Cmaj7, tap its 7th: B.', 'B4', { item: toneItem({ key: 'C', id: 'maj7' }, '7') }),
          tap('From Lesson 6: tap the bright 6th of D Dorian, B.', 'B4', { item: degreeItem({ key: 'D', id: 'dorian' }, '6') })
        ] } } }
  ],
  challenge: { id: 'p6-ch', title: 'Level 6 Challenge', challenge: true, flow: [
    { type: 'play', name: '12-bar blues', text: 'Play a 12-bar blues in A: left hand shuffle (root–5th) or shells, right hand improvising with the A blues scale, landing on a chord tone at each change. Record and log it if you like.', view: [43, 84], bpm: 80, groove: 'shuffle', dots: Ablues.dots(BLUES), backing: { chords: BLUES12 }, seconds: 120, bpmKey: 'blues' },
    { type: 'check', name: 'Check it', pass: 3, view: [62, 84], questions: [
      tap('Over D7 in the blues, land on its 3rd: F#.', 'F#5', { item: toneItem({ key: 'D', id: '7' }, '3') }),
      tap('Over A7, land on its 3rd: C#.', 'C#5', { item: toneItem({ key: 'A', id: '7' }, '3') }),
      tap('Tap the blue note of A blues: Eb.', 'Eb5', { item: degreeItem({ key: 'A', id: 'blues' }, 'b5') }),
      choice('A 12-bar blues in A uses…', ['A7, D7 and E7', 'A, Bm and C#m', 'Am and Dm only'], 'A7, D7 and E7', 'fact:blues-a-chords')] }
  ] },
  placement: [
    tap('Tap the blue note of A blues: Eb.', 'Eb5', { item: degreeItem({ key: 'A', id: 'blues' }, 'b5') }),
    choice('Over ii–V–I in C, aim for each chord\'s…', ['3rd', '2nd', '4th'], '3rd', 'fact:iivi-aim-3rds'),
    choice('Mixolydian is the major scale with…', ['A flat 7th', 'A flat 3rd', 'A sharp 4th'], 'A flat 7th', 'fact:mixolydian-b7')
  ]
};
export const _K = K;
