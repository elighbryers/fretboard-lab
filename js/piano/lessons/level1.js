// Piano Level 1: the keyboard and note names (docs/research-piano.md E). Keys are scientific
// pitch: C4 = Middle C. Reading runs as a parallel track: lesson 7 of each level is a reading lesson.
import { K, all, task, tap, choice, kd, tech, seq, keys, board, S } from './kit.js';

const C5F = ['C4', 'D4', 'E4', 'F4', 'G4'];
const fiveFinger = (names, hand) => Object.fromEntries(names.map((n, i) => [K(n).midi, { n: hand === 'L' ? 5 - i : i + 1, hand }]));

export default {
  id: 'piano-level-1', title: 'The keyboard and note names',
  lessons: [
    { id: 'p1-1', title: 'Sitting, hand shape and finger numbers',
      steps: {
        hear: { text: 'Fingers 1 to 5 of the right hand, one key each, from Middle C.', sound: seq(C5F, 90) },
        learn: { cards: [
          tech('Sit tall at the middle of the keyboard, forearms level with the keys.', ['Sit near the front of the bench, feet flat', 'Elbows a little in front of your body', 'Shoulders loose, not lifted'], 'curve'),
          tech('Curve your fingers as if holding a ball, and play on the fingertips.', ['Rest your hand on your knee and keep that shape on the keys', 'Thumb plays on its side corner', 'Wrist level, not dropped'], 'curve'),
          { text: 'Fingers are numbered 1 to 5 from the thumb, on both hands. Music shows these numbers above or below notes.', board: board([60, 67], C5F.map((n, i) => kd(n, { label: String(i + 1) })), { fingers: fiveFinger(C5F, 'R') }) }
        ] },
        see: { text: 'Right hand on C D E F G: fingers 1 2 3 4 5.', view: [57, 69], sequence: keys(C5F), dots: C5F.map(n => kd(n)), bpm: 90 },
        try: { view: [55, 72], tasks: [
          task('Your right thumb is on Middle C. Tap the key finger 3 plays: E.', 'E4'),
          task('Tap the key under right-hand finger 5: G.', 'G4'),
          task('Tap Middle C, where the right thumb sits.', 'C4')
        ] },
        play: { text: 'At your piano, play C D E F G with right-hand fingers 1 to 5, one per click, then back down. Say the finger numbers.', view: [57, 69], bpm: 60, follow: keys([...C5F, 'F4', 'E4', 'D4']) },
        check: { pass: 3, view: [55, 72], questions: [
          choice('Which finger is number 1?', ['The thumb', 'The little finger', 'The index finger'], 'The thumb', 'fact:finger-1-thumb'),
          tap('Tap Middle C.', 'C4'),
          tap('Thumb on Middle C: tap the key under finger 4, F.', 'F4'),
          choice('How should your fingers be?', ['Curved, playing on the tips', 'Flat and straight', 'Pointing up'], 'Curved, playing on the tips', 'fact:piano-curved-fingers')
        ] } } },
    { id: 'p1-2', title: 'Black-key groups and the white keys',
      steps: {
        hear: { text: 'The musical alphabet on the white keys: A B C D E F G.', sound: seq(['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'], 100) },
        learn: { cards: [
          { text: 'Black keys come in groups of two and three. They are how you find your way.', board: board([60, 71], ['C#4', 'Eb4', 'F#4', 'Ab4', 'Bb4'].map(n => kd(n, { role: 'other' }))) },
          { text: 'C is just left of each group of two black keys. F is just left of each group of three.', board: board([60, 71], [kd('C4', { role: 'root' }), kd('F4', { role: 'third' })]) },
          S('l1-2.1', [57, 69])
        ] },
        see: { text: 'Every C, then every F: always in the same place next to the black keys.', view: [48, 72], sequence: keys(['C3', 'C4', 'C5', 'F3', 'F4']), dots: [...all('C', [48, 72]), ...all('F', [48, 72])].map(k => kd(k.midi)), bpm: 100, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [55, 72], tasks: [
          task('Tap any C: left of a group of two black keys.', all('C', [55, 72])),
          task('Tap any F: left of a group of three black keys.', all('F', [55, 72])),
          task('Tap any E: just right of the group of two.', all('E', [55, 72]))
        ] },
        play: { text: 'Find and play every C on your piano, low to high, then every F.', view: [48, 72], bpm: 60, follow: keys(['C3', 'C4', 'C5', 'F3', 'F4']) },
        check: { pass: 3, view: [55, 72], questions: [
          tap('Tap any D.', all('D', [55, 72])),
          tap('Tap any B.', all('B', [55, 72])),
          tap('From Lesson 1: tap Middle C.', 'C4'),
          choice('C is just to the left of…', ['A group of two black keys', 'A group of three black keys', 'Any black key'], 'A group of two black keys', 'fact:c-left-of-two')
        ] } } },
    { id: 'p1-3', title: 'Middle C and octaves',
      steps: {
        hear: { text: 'Middle C, then the C an octave higher and an octave lower.', sound: seq(['C4', 'C5', 'C4', 'C3'], 80) },
        learn: { cards: [
          { text: 'Middle C is the C nearest the middle of the keyboard. It is marked C4 here.', board: board([55, 72], [kd('C4', { role: 'root' })]) },
          { text: 'An octave is the next key with the same name: eight white keys up. It sounds like the same note, higher.', board: board([57, 76], [kd('C4', { role: 'root' }), kd('C5', { role: 'root' })]) },
          { text: 'Octaves are numbered: C3 is below Middle C, C5 above it.', board: board([45, 76], [kd('C3', { role: 'root', label: 'C3' }), kd('C4', { role: 'root', label: 'C4' }), kd('C5', { role: 'root', label: 'C5' })]) }
        ] },
        see: { text: 'A3, A4, A5: the same note in three octaves.', view: [55, 84], sequence: keys(['A3', 'A4', 'A5']), bpm: 80, link: { key: 'A', scale: 'minor', labels: 'notes' } },
        try: { view: [45, 76], tasks: [
          task('Tap the C an octave above Middle C.', 'C5'),
          task('Tap the C an octave below Middle C.', 'C3'),
          task('Tap the G just above Middle C.', 'G4')
        ] },
        play: { text: 'Play Middle C, then every C going up, then every C going down. Use finger 3.', view: [45, 84], bpm: 60, follow: keys(['C4', 'C5', 'C6', 'C5', 'C4', 'C3']) },
        check: { pass: 3, view: [45, 76], questions: [
          tap('Tap Middle C.', 'C4'),
          tap('Tap the A just above Middle C.', 'A4'),
          tap('From Lesson 2: tap any F.', all('F', [45, 76])),
          choice('How many white keys from one C up to the next C?', ['8 (counting both Cs)', '5', '12'], '8 (counting both Cs)', 'fact:octave-eight-whites')
        ] } } },
    { id: 'p1-4', title: 'Whole and half steps',
      steps: {
        hear: { text: 'Half steps (next key, black or white), then whole steps (skip one).', sound: seq(['C4', 'C#4', 'D4', 'D#4', null, 'C4', 'D4', 'E4', 'F#4'], 100) },
        learn: { cards: [
          { text: 'A half step is the very next key, black or white.', board: board([60, 67], [kd('E4', { role: 'root' }), kd('F4', { role: 'third' })], { steps: true }) },
          { text: 'A whole step is two half steps: skip one key.', board: board([60, 67], [kd('C4', { role: 'root' }), kd('D4', { role: 'third' })], { steps: true }) },
          S('l1-3.3', [60, 71])
        ] },
        see: { text: 'C to C on the white keys: whole, whole, half, whole, whole, whole, half.', view: [57, 74], sequence: keys(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']), dots: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].map(n => kd(n)), bpm: 100, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [55, 72], tasks: [
          task('Tap a half step above E.', 'F4'),
          task('Tap a whole step above F.', 'G4'),
          task('Tap a half step above B.', 'C5')
        ] },
        play: { text: 'Play half steps up from C (every key, black and white) to E, then whole steps from C: C D E F#.', view: [57, 69], bpm: 70, follow: keys(['C4', 'C#4', 'D4', 'D#4', 'E4', 'C4', 'D4', 'E4', 'F#4']) },
        check: { pass: 3, view: [55, 72], questions: [
          tap('Tap a whole step above C4.', 'D4'),
          tap('Tap a half step above B3.', 'C4'),
          tap('From Lesson 3: tap the C an octave above Middle C.', 'C5'),
          choice('Which white keys have no black key between them?', ['E–F and B–C', 'C–D and F–G', 'A–B and D–E'], 'E–F and B–C', 'fact:alphabet-no-gap')
        ] } } },
    { id: 'p1-5', title: 'Sharps and flats',
      steps: {
        hear: { text: 'F, then F sharp, then G, then G flat: one black key, two names.', sound: seq(['F4', 'F#4', 'G4', 'Gb4'], 80) },
        learn: { cards: [
          { text: 'A sharp (#) is a half step higher: F# is the black key just right of F.', board: board([60, 71], [kd('F4', { role: 'root' }), kd('F#4', { role: 'third' })]) },
          { text: 'A flat (b) is a half step lower: Gb is that same black key, named from G.', board: board([60, 71], [kd('G4', { role: 'root' }), kd('F#4', { role: 'third', label: 'Gb' })]) },
          { text: 'Every black key has two names. C# and Db are one key.', board: board([60, 71], [kd('C#4', { label: 'C#/Db', role: 'other' })]) }
        ] },
        see: { text: 'All five black keys, named with sharps: C# D# F# G# A#.', view: [59, 72], sequence: keys(['C#4', 'D#4', 'F#4', 'G#4', 'A#4']), bpm: 90, link: { key: 'F#', scale: 'major-pentatonic', labels: 'notes' } },
        try: { view: [55, 72], tasks: [
          task('Tap any F#.', all('F#', [55, 72])),
          task('Tap any Bb.', all('Bb', [55, 72])),
          task('Tap any C#.', all('C#', [55, 72]))
        ] },
        play: { text: 'Play every black key from C# to A#, saying both names: C# or Db, D# or Eb…', view: [59, 72], bpm: 60, follow: keys(['C#4', 'D#4', 'F#4', 'G#4', 'A#4']) },
        check: { pass: 3, view: [55, 72], questions: [
          tap('Tap any Eb.', all('Eb', [55, 72])),
          tap('Tap any G#.', all('G#', [55, 72])),
          tap('From Lesson 4: tap a half step above E4.', 'F4'),
          choice('Db is the same key as…', ['C#', 'D#', 'C'], 'C#', 'fact:enharmonic-c#-db')
        ] } } },
    { id: 'p1-6', title: 'C five-finger position, right hand then left',
      steps: {
        hear: { text: 'C D E F G in the right hand, then the left hand an octave lower.', sound: seq([...C5F, null, 'C3', 'D3', 'E3', 'F3', 'G3'], 110) },
        learn: { cards: [
          { text: 'Five fingers on five keys: C D E F G. Right thumb on Middle C.', board: board([58, 69], C5F.map(n => kd(n)), { fingers: fiveFinger(C5F, 'R'), bracket: { lo: 60, hi: 67, hand: 'R' } }) },
          { text: 'Left hand: little finger (5) on the C below Middle C, thumb on G.', board: board([46, 57], ['C3', 'D3', 'E3', 'F3', 'G3'].map(n => kd(n)), { fingers: fiveFinger(['C3', 'D3', 'E3', 'F3', 'G3'], 'L'), bracket: { lo: 48, hi: 55, hand: 'L' } }) },
          tech('Keep the hand still: each finger owns one key.', ['Play C D E F G slowly, no hand movement', 'Keep fingers resting on their keys', 'Then the left hand: 5 4 3 2 1'], 'fiveKeys')
        ] },
        see: { text: 'A five-finger melody in C: E D C D E E E.', view: [58, 69], sequence: keys(['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4']), dots: C5F.map(n => kd(n)), bpm: 100, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [45, 70], tasks: [
          task('Right hand in C position: tap the key under finger 2.', 'D4'),
          task('Left hand in C position: tap the key under finger 5.', 'C3'),
          task('Left hand: tap the key under the thumb.', 'G3')
        ] },
        play: { text: 'Play E D C D E E E with the right hand (fingers 3 2 1 2 3 3 3), then the same notes an octave lower with the left hand.', view: [45, 70], bpm: 70, follow: keys(['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4', null, 'E3', 'D3', 'C3', 'D3', 'E3', 'E3', 'E3']) },
        check: { pass: 3, view: [45, 70], questions: [
          tap('Right hand in C position: tap the key under finger 3.', 'E4'),
          tap('Left hand in C position: tap the key under finger 3.', 'E3'),
          tap('From Lesson 5: tap any F#.', all('F#', [45, 70])),
          choice('In C position, which right-hand finger plays G?', ['5', '4', '1'], '5', 'fact:c-position-g-5')
        ] } } },
    { id: 'p1-7', title: 'Reading 1: the staff and three landmarks',
      review: ['staff:treble@C4', 'staff:treble@G4', 'staff:bass@F3'],
      steps: {
        hear: { text: 'Three landmark notes: Middle C, treble G and bass F.', sound: seq(['C4', 'G4', 'F3'], 70) },
        learn: { cards: [
          { text: 'Music is written on a staff of five lines. Higher on the staff means a higher note.', board: board([52, 72], [kd('C4', { role: 'root' }), kd('G4', { role: 'fifth' })]) },
          { text: 'The treble clef curls around the G line: that line is the G above Middle C. The bass clef\'s two dots hug the F below Middle C.', board: board([50, 72], [kd('G4', { role: 'fifth', label: 'G' }), kd('F3', { role: 'third', label: 'F' })]) },
          { text: 'Middle C sits on a short extra line (a ledger line) between the two staffs.', board: board([50, 72], [kd('C4', { role: 'root' })]) }
        ] },
        see: { text: 'Landmarks: Middle C, treble G, bass F.', view: [50, 72], sequence: keys(['C4', 'G4', 'F3']), bpm: 60, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [50, 72], tasks: [
          task('Tap the treble-clef landmark: the G above Middle C.', 'G4', { item: 'staff:treble@G4' }),
          task('Tap the bass-clef landmark: the F below Middle C.', 'F3', { item: 'staff:bass@F3' }),
          task('Tap the note on the ledger line between the staffs: Middle C.', 'C4', { item: 'staff:treble@C4' })
        ] },
        play: { text: 'Open Practice → Drills → Staff reader for the landmarks, or play them here: C4, G4, F3, one per click.', view: [50, 72], bpm: 60, follow: keys(['C4', 'G4', 'F3']) },
        check: { pass: 3, view: [50, 72], questions: [
          choice('The treble clef circles which line?', ['G (above Middle C)', 'F (below Middle C)', 'C'], 'G (above Middle C)', 'fact:treble-clef-g'),
          choice('The bass clef\'s dots are around which line?', ['F (below Middle C)', 'G', 'A'], 'F (below Middle C)', 'fact:bass-clef-f'),
          tap('Tap the bass-clef landmark F.', 'F3', { item: 'staff:bass@F3' }),
          tap('From Lesson 6: right hand in C position, tap the key under finger 4.', 'F4')
        ] } } }
  ],
  challenge: { id: 'p1-ch', title: 'Level 1 Challenge', challenge: true, flow: [
    { type: 'timedkeys', name: 'Find the keys', text: 'Find 10 named keys, each in under 3 seconds.', rounds: 10, seconds: 3, pass: 8, view: [55, 76] },
    { type: 'play', name: 'Five-finger melody', text: 'Play E D C D E E E (right hand), then the same with the left hand an octave lower, in time with the click.', view: [45, 70], bpm: 70, follow: keys(['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4', null, 'E3', 'D3', 'C3', 'D3', 'E3', 'E3', 'E3']) },
    { type: 'check', name: 'Check it', pass: 3, view: [45, 72], questions: [
      tap('Tap Middle C.', 'C4'), tap('Tap any Bb.', all('Bb', [45, 72])), tap('Tap the bass-clef landmark F.', 'F3', { item: 'staff:bass@F3' }),
      choice('Which finger number is the thumb?', ['1', '5', '2'], '1', 'fact:finger-1-thumb')] }
  ] },
  placement: [
    tap('Tap Middle C.', 'C4'),
    tap('Tap any F#.', all('F#', [55, 72])),
    choice('Can you read the treble clef? Which note sits on the line the treble clef curls around?', ['G above Middle C', 'Middle C', 'F below Middle C'], 'G above Middle C', 'fact:treble-clef-g')
  ]
};
