// Bass Level 2: roots and rhythm (docs/research-bass.md E).
import { K, P, at, nd, task, tap, choice, grid, gridTask, seq } from './kit.js';

const G = at('G', 4), C = at('C', 3), D = at('D', 3), A = at('A', 4), E = P(4, 0);
const eighths = [0, 2, 4, 6, 8, 10, 12, 14];
const r58 = (r, s) => [r, P(s - 1, r.fret + 2), P(s - 2, r.fret + 2)];

export default {
  id: 'bass-level-2',
  title: 'Roots and rhythm',
  lessons: [
    {
      id: 'b2-1', title: 'Eighth notes and rests',
      steps: {
        hear: { text: 'Quarter notes, then eighth notes: twice as many, counted 1 & 2 & 3 & 4 &.', sound: seq([A, A, A, A, [A], A, A, A], 80) },
        learn: { cards: [
          grid('An eighth note is half a beat. Count the in-between notes as "&": 1 & 2 & 3 & 4 &.', eighths, { midi: 33 }),
          grid('A rest is a silence that still counts. Here beats 2 and 4 are rests.', [0, 2, 8, 10], { midi: 33 }),
          grid('Steady eighths drive a rock song. Keep them even, like a ticking clock.', eighths, { midi: 28, snare: [4, 12] })
        ] },
        see: { text: 'Eighth notes on the open A string with the drums. Count 1 & 2 & 3 & 4 &.', view: [0, 5], sequence: [P(3, 0), P(3, 0), P(3, 0), P(3, 0), P(3, 0), P(3, 0), P(3, 0), P(3, 0)], dots: [nd(3, 0)], bpm: 140, link: { key: 'A', scale: 'minor-pentatonic', labels: 'notes' } },
        try: { view: [0, 5], tasks: [
          gridTask('Tap the eighth notes of this bar.', eighths),
          gridTask('Eighths on beats 1 and 3, rests on 2 and 4.', [0, 2, 8, 10]),
          task('Tap the note to play these eighths on: the open A string.', P(3, 0))
        ] },
        play: { text: 'Play eighth notes on the open A string with the drums: two plucks per beat, alternating fingers.', view: [0, 5], bpm: 70, follow: [P(3, 0)] },
        check: { pass: 3, view: [0, 5], questions: [
          choice('How many eighth notes fit in one beat?', ['2', '4', '1'], '2', 'fact:eighths-per-beat'),
          choice('How do you count eighth notes?', ['1 & 2 & 3 & 4 &', '1 2 3 4', '1 e & a'], '1 & 2 & 3 & 4 &', 'fact:count-eighths'),
          tap('Tap the open A string.', P(3, 0)),
          tap('Tap A on the E string.', A)
        ] }
      }
    },
    {
      id: 'b2-2', title: 'Roots on the chord changes',
      steps: {
        hear: { text: 'A chord chart, G C D G, with the bass playing each chord\'s root.', sound: seq([G, G, C, C, D, D, G, G], 90) },
        learn: { cards: [
          { text: 'A chord chart lists the chords, usually one per bar. The bass plays each chord\'s root, its letter name.', board: { view: [0, 7], dots: [nd(4, 3, { role: 'root' }), nd(3, 3, { role: 'root' }), nd(3, 5, { role: 'root' })] } },
          { text: 'Find G on the E string, and C and D on the A string. They sit close together.', board: { view: [0, 7], focus: { frets: [2, 5] }, dots: [nd(4, 3), nd(3, 3), nd(3, 5)] } },
          grid('Play the root on beat 1 when the chord changes, with the kick.', [0, 4, 8, 12], { midi: 31 })
        ] },
        see: { text: 'Roots for G, C, D and G, two beats each.', view: [0, 7], sequence: [G, G, C, C, D, D, G, G], bpm: 90, link: { key: 'G', scale: 'major', labels: 'notes' } },
        try: { view: [0, 7], tasks: [
          task('The chord is C. Tap its root on the A string.', C),
          task('The chord is D. Tap its root on the A string.', D),
          task('The chord is G. Tap its root on the E string.', G)
        ] },
        play: { text: 'Play the roots of G, C, D, G in quarter notes, one chord per bar, with the drums and chords.', view: [0, 7], bpm: 70, follow: [G, C, D, G], beatsPerStep: 4, backing: { chords: ['G:major', 'C:major', 'D:major', 'G:major'] } },
        check: { pass: 3, view: [0, 7], questions: [
          tap('The chord is G. Tap G on the E string.', G),
          tap('The chord is D. Tap D on the A string.', D),
          tap('From Lesson 1: tap the open A string.', P(3, 0)),
          choice('What does the bass usually play when a chord changes?', ['The root', 'The highest note', 'Any note'], 'The root', 'fact:bass-root-on-change')
        ] }
      }
    },
    {
      id: 'b2-3', title: 'Sharps, flats and finding any note',
      steps: {
        hear: { text: 'G, then G sharp one fret higher, then A.', sound: seq([G, P(4, 4), A], 70) },
        learn: { cards: [
          { text: 'A sharp (#) is one fret higher. G# is the fret just above G.', board: { view: [0, 7], dots: [nd(4, 3, { role: 'root' }), nd(4, 4, { role: 'third' })] } },
          { text: 'A flat (b) is one fret lower. Ab is the same note as G#: one note, two names.', board: { view: [0, 7], dots: [nd(4, 5, { role: 'root' }), nd(4, 4, { role: 'third', label: 'Ab' })] } },
          { text: 'Find any note on the E string, then use the octave shape to find it higher.', board: { view: [0, 9], dots: [nd(4, 4, { role: 'root' }), nd(2, 6, { role: 'root' })] } }
        ] },
        see: { text: 'F#, then its octave; Bb, then its octave.', view: [0, 9], sequence: [P(4, 2), P(2, 4), P(3, 1), P(1, 3)], bpm: 80, link: { key: 'F#', scale: 'major', labels: 'notes' } },
        try: { view: [0, 9], tasks: [
          task('Tap F# on the E string.', at('F#', 4)),
          task('Tap Bb on the A string.', at('Bb', 3)),
          task('Tap the octave of F# on the E string: two strings up, two frets up.', at('F#', 2, 3))
        ] },
        play: { text: 'Play F#, G, G#, A on the E string, one per beat, then back down. Say each name.', view: [0, 9], bpm: 70, follow: [P(4, 2), P(4, 3), P(4, 4), P(4, 5), P(4, 4), P(4, 3)] },
        check: { pass: 3, view: [0, 9], questions: [
          tap('Tap C# on the A string.', at('C#', 3)),
          tap('Tap Eb on the A string.', at('Eb', 3)),
          tap('From Lesson 2: the chord is C. Tap its root on the A string.', C),
          choice('G# and Ab are…', ['The same note', 'A half step apart', 'A whole step apart'], 'The same note', 'fact:enharmonic-g#-ab')
        ] }
      }
    },
    {
      id: 'b2-4', title: 'Root, 5th and octave',
      steps: {
        hear: { text: 'Root, 5th, octave on G: the most used shape in bass.', sound: seq([...r58(G, 4), P(3, 5)], 90) },
        learn: { cards: [
          { text: 'The 5th is one string up and two frets up from the root.', board: { view: [0, 7], dots: [nd(4, 3, { role: 'root', label: 'R' }), nd(3, 5, { role: 'fifth', label: '5' })] } },
          { text: 'The octave is two strings up and two frets up. Root, 5th and octave make one shape.', board: { view: [0, 7], dots: [nd(4, 3, { role: 'root', label: 'R' }), nd(3, 5, { role: 'fifth', label: '5' }), nd(2, 5, { role: 'root', label: 'R' })] } },
          { text: 'The shape moves anywhere. From C on the A string it is the same pattern.', board: { view: [0, 7], dots: [nd(3, 3, { role: 'root', label: 'R' }), nd(2, 5, { role: 'fifth', label: '5' }), nd(1, 5, { role: 'root', label: 'R' })] } }
        ] },
        see: { text: 'R 5 8 5 on G, then on C.', view: [0, 7], sequence: [...r58(G, 4), P(3, 5), ...r58(C, 3), P(2, 5)], bpm: 90, link: { key: 'G', scale: 'major-pentatonic', labels: 'intervals' } },
        try: { view: [0, 9], tasks: [
          task('Tap the 5th of A: one string up, two frets up from A on the E string.', P(3, 7)),
          task('Tap the octave of A from there.', P(2, 7)),
          task('Tap the 5th of C (C is on the A string, fret 3).', P(2, 5))
        ] },
        play: { text: 'Play R 5 8 5 in quarter notes: two bars on G, two on C, with the drums.', view: [0, 9], bpm: 70, follow: [...r58(G, 4), P(3, 5), ...r58(G, 4), P(3, 5), ...r58(C, 3), P(2, 5), ...r58(C, 3), P(2, 5)], backing: { chords: ['G:major', 'G:major', 'C:major', 'C:major'] } },
        check: { pass: 3, view: [0, 9], questions: [
          tap('Tap the 5th of G (G is on the E string, fret 3).', P(3, 5)),
          tap('Tap the octave of D (D is on the A string, fret 5).', P(1, 7)),
          tap('From Lesson 3: tap F# on the E string.', at('F#', 4)),
          choice('From a root, where is the 5th?', ['One string up, two frets up', 'Two strings up, two frets up', 'Same string, five frets up'], 'One string up, two frets up', 'fact:bass-fifth-shape')
        ] }
      }
    },
    {
      id: 'b2-5', title: 'Reading bass tab',
      steps: {
        hear: { text: 'A line read from tab: 3 on the E line, 5 on the A line, 5 on the D line.', sound: seq([G, P(3, 5), P(2, 5), P(3, 5)], 80) },
        learn: { cards: [
          { text: 'Bass tab has four lines, one per string. The bottom line is the low E, like looking down at your bass.', board: { view: [0, 5], dots: [4, 3, 2, 1].map(s => nd(s, 0)) } },
          { text: 'A number on a line is the fret to play. A 3 on the bottom line means E string, fret 3.', board: { view: [0, 5], dots: [P(4, 3, { label: '3', role: 'root' })] } },
          { text: 'Read left to right. Numbers stacked over each other are played together, but bass lines are mostly one note at a time.', board: { view: [0, 7], dots: [P(4, 3, { label: '3' }), P(3, 5, { label: '5' }), P(2, 5, { label: '5' })] } }
        ] },
        see: { text: 'Tab: E line 3, A line 5, D line 5, A line 5.', view: [0, 7], sequence: [G, P(3, 5), P(2, 5), P(3, 5)], dots: [P(4, 3, { label: '3' }), P(3, 5, { label: '5' }), P(2, 5, { label: '5' })], bpm: 80, link: { key: 'G', scale: 'major', labels: 'notes' } },
        try: { view: [0, 7], tasks: [
          task('The tab shows 5 on the A line. Tap that note.', P(3, 5)),
          task('The tab shows 0 on the D line. Tap it.', P(2, 0)),
          task('The tab shows 2 on the G line. Tap it.', P(1, 2))
        ] },
        play: { text: 'Play the tab from the Fretboard Lab play-along "Root-Five Rock in G", or this: 3 (E line), 5 (A), 5 (D), 5 (A), one per beat.', view: [0, 7], bpm: 70, follow: [G, P(3, 5), P(2, 5), P(3, 5)] },
        check: { pass: 3, view: [0, 7], questions: [
          choice('In bass tab, the bottom line is…', ['The low E string', 'The G string', 'The first fret'], 'The low E string', 'fact:tab-bottom-line'),
          tap('The tab shows 3 on the A line. Tap it.', P(3, 3)),
          tap('The tab shows 7 on the D line. Tap it.', P(2, 7)),
          tap('From Lesson 4: tap the 5th of G (G is on the E string, fret 3).', P(3, 5))
        ] }
      }
    },
    {
      id: 'b2-6', title: 'Syncopation: locking to the kick',
      review: ['rhythm:bass-0-6-8'],
      steps: {
        hear: { text: 'The kick plays on 1, the "&" of 2, and 3. The bass plays with it.', sound: seq([A, null, A, A], 90) },
        learn: { cards: [
          grid('Syncopation means a note off the beat, on an "&". Here the kick lands on the & of 2.', [0, 6, 8], { kick: [0, 6, 8], snare: [4, 12] }),
          grid('A bass player copies the kick: same rhythm, so the two sound like one instrument.', [0, 6, 8], { kick: [0, 6, 8], snare: [4, 12], midi: 28 }),
          grid('Another common one: 1, the & of 3, and 4.', [0, 10, 12], { kick: [0, 10, 12], snare: [4, 12] })
        ] },
        see: { text: 'Root on 1, the & of 2 and 3, locked to the kick.', view: [0, 7], sequence: [A, null, A, A], dots: [nd(4, 5)], bpm: 80, link: { key: 'A', scale: 'minor-pentatonic', labels: 'notes' } },
        try: { view: [0, 7], tasks: [
          gridTask('Tap the bass rhythm: it copies the kick on 1, the & of 2, and 3.', [0, 6, 8], { kick: [0, 6, 8] }),
          gridTask('Now copy this one: 1, the & of 3, and 4.', [0, 10, 12], { kick: [0, 10, 12] }),
          task('Tap the root to play it on: A on the E string.', A)
        ] },
        play: { text: 'Play A (E string, fret 5) with the kick: 1, the & of 2, 3. Use the kick + snare setting to hear the kick clearly.', view: [0, 7], bpm: 75, follow: [A] },
        check: { pass: 3, view: [0, 7], questions: [
          choice('A note on an "&" is…', ['Off the beat (syncopated)', 'On the beat', 'A rest'], 'Off the beat (syncopated)', 'fact:syncopation'),
          choice('Why copy the kick drum\'s rhythm?', ['Bass and kick sound like one instrument', 'It is easier to count', 'The kick is louder'], 'Bass and kick sound like one instrument', 'fact:bass-lock-kick'),
          tap('Tap A on the E string.', A),
          tap('From Lesson 5: the tab shows 0 on the E line. Tap it.', E)
        ] }
      }
    },
    {
      id: 'b2-7', title: 'Create: a one-bar groove from R, 5 and 8',
      steps: {
        hear: { text: 'One idea: R R 5 8 in eighths and quarters, looped over drums.', sound: seq([A, A, P(3, 7), P(2, 7)], 90) },
        learn: { cards: [
          { text: 'You only need three notes to make a groove: root, 5th and octave.', board: { view: [0, 9], dots: [nd(4, 5, { role: 'root', label: 'R' }), nd(3, 7, { role: 'fifth', label: '5' }), nd(2, 7, { role: 'root', label: 'R' })] } },
          grid('Pick a rhythm first. Start on beat 1 with the kick, then add one or two notes.', [0, 6, 8, 12], { kick: [0, 6, 8] }),
          { text: 'Repeat it. A groove is a short idea played the same way again and again.', board: { view: [0, 9], dots: [nd(4, 5, { role: 'root', label: 'R' }), nd(3, 7, { role: 'fifth', label: '5' }), nd(2, 7, { role: 'root', label: 'R' })] } }
        ] },
        see: { text: 'One possible groove: R on 1, R on the & of 2, 5 on 3, 8 on 4.', view: [0, 9], sequence: [A, A, P(3, 7), P(2, 7)], bpm: 90, link: { key: 'A', scale: 'minor-pentatonic', labels: 'intervals' } },
        try: { view: [0, 9], tasks: [
          task('Tap the root, A, on the E string.', A),
          task('Tap the 5th of A.', P(3, 7)),
          task('Tap the octave of A.', P(2, 7))
        ] },
        play: { text: 'Make up your own one-bar groove from R, 5 and 8 on A. Loop it for 30 seconds over the drums. Start every bar on the root.', view: [0, 9], bpm: 80, dots: [nd(4, 5, { role: 'root', label: 'R' }), nd(3, 7, { role: 'fifth', label: '5' }), nd(2, 7, { role: 'root', label: 'R' })], seconds: 30, backing: { chords: ['A:major'] } },
        check: { pass: 3, view: [0, 9], questions: [
          tap('Tap the 5th of A (A is on the E string, fret 5).', P(3, 7)),
          tap('Tap the octave of A.', P(2, 7)),
          tap('From Lesson 3: tap Bb on the A string.', at('Bb', 3)),
          choice('A groove is…', ['A short idea repeated the same way', 'A new note every bar', 'A fast solo'], 'A short idea repeated the same way', 'fact:groove-repeat')
        ] }
      }
    }
  ],
  challenge: {
    id: 'b2-ch', title: 'Level 2 Challenge', challenge: true,
    flow: [
      { type: 'play', name: 'Roots in eighths', text: 'Play G, C, D, G (one chord per bar) with roots in steady eighth notes, along with the drums and chords.', view: [0, 7], bpm: 75, follow: [G, C, D, G], beatsPerStep: 4, backing: { chords: ['G:major', 'C:major', 'D:major', 'G:major'] }, bpmKey: 'eighths' },
      { type: 'play', name: 'Root-5th-octave', text: 'Now the same chords with R 5 8 5 in quarter notes.', view: [0, 7], bpm: 75, follow: [...r58(G, 4), P(3, 5), ...r58(C, 3), P(2, 5), ...r58(D, 3), P(2, 7), ...r58(G, 4), P(3, 5)], backing: { chords: ['G:major', 'C:major', 'D:major', 'G:major'] }, bpmKey: 'r58' },
      { type: 'play', name: 'Your groove', text: 'Make up a two-bar root-5th-octave groove on G and loop it for 30 seconds.', view: [0, 7], bpm: 80, dots: r58(G, 4).map((p, i) => ({ ...p, label: ['R', '5', 'R'][i], role: i === 1 ? 'fifth' : 'root' })), seconds: 30, backing: { chords: ['G:major'] }, bpmKey: 'create' },
      { type: 'check', name: 'Check it', pass: 3, view: [0, 9], questions: [
        tap('Tap the 5th of C (C is on the A string, fret 3).', P(2, 5)),
        tap('Tap D on the A string.', D),
        tap('The tab shows 3 on the E line. Tap it.', G),
        choice('How many eighth notes are in a bar of 4/4?', ['8', '4', '16'], '8', 'fact:eighths-per-bar')
      ] }
    ]
  },
  placement: [
    tap('Tap the 5th of G (G is on the E string, fret 3).', P(3, 5)),
    tap('Tap C# on the A string.', at('C#', 3)),
    choice('In bass tab, the bottom line is…', ['The low E string', 'The G string', 'The first fret'], 'The low E string', 'fact:tab-bottom-line')
  ]
};
export const _K = K;
