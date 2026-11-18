// Bass Level 1: the neck, the pulse and your hands (docs/research-bass.md E).
// Same lesson shape as the guitar path (js/lessons/level1.js), in bass numbering:
// string 4 = low E, 3 = A, 2 = D, 1 = G. Every Play step runs over a drum loop.
import { K, P, at, nd, task, tap, choice, S, grid, gridTask, tech, seq } from './kit.js';

const OPEN = [4, 3, 2, 1].map(s => P(s, 0));
const OPEN_NAMES = [4, 3, 2, 1].map(s => nd(s, 0));
const NAT = { 4: [0, 1, 3, 5, 7, 8, 10, 12], 3: [0, 2, 3, 5, 7, 8, 10, 12] };
const naturals = s => NAT[s].map(f => nd(s, f));

export default {
  id: 'bass-level-1',
  title: 'The neck, the pulse and your hands',
  lessons: [
    {
      id: 'b1-1', title: 'Strings and fret numbers',
      steps: {
        hear: { text: 'The four open strings, from the lowest to the highest.', sound: seq(OPEN, 70) },
        learn: { cards: [
          { text: 'A bass has four strings, numbered 4 to 1. String 4 is the thickest and lowest.', board: { view: [0, 5], dots: [4, 3, 2, 1].map(s => P(s, 0, { label: String(s) })) } },
          { text: 'From low to high they are E A D G. A 5-string adds a low B below the E.', board: { view: [0, 5], dots: OPEN_NAMES } },
          { text: 'An open string is fret 0. Each fret up the neck raises the note by one step.', board: { view: [0, 5], dots: [P(3, 0, { label: '0', role: 'root' }), P(3, 1, { label: '1' }), P(3, 2, { label: '2' }), P(3, 3, { label: '3' })] } }
        ] },
        see: { text: 'Watch and listen: open strings 4 to 1.', view: [0, 5], sequence: OPEN, dots: OPEN_NAMES, bpm: 70 },
        try: { view: [0, 5], tasks: [
          task('Tap the open A string.', P(3, 0)),
          task('Tap the open G string.', P(1, 0)),
          task('Tap string 4, fret 3.', P(4, 3))
        ] },
        play: { text: 'Pick up your bass. Play the open strings E, A, D, G, one per beat, with the drums. Say each name.', view: [0, 5], bpm: 70, follow: OPEN },
        check: { pass: 3, view: [0, 5], questions: [
          choice('Which string is number 4 on a bass?', ['E', 'A', 'G'], 'E', 'fact:bass-string-4'),
          tap('Tap the open D string.', P(2, 0)),
          tap('Tap string 3, fret 2.', P(3, 2)),
          choice('What does a 5-string bass add?', ['A low B string', 'A high E string', 'Two more frets'], 'A low B string', 'fact:bass-five-string')
        ] }
      }
    },
    {
      id: 'b1-2', title: 'Plucking: two fingers, one anchor',
      steps: {
        hear: { text: 'Even plucks on the open E string: index, middle, index, middle.', sound: seq([P(4, 0), P(4, 0), P(4, 0), P(4, 0), P(4, 0), P(4, 0), P(4, 0), P(4, 0)], 90) },
        learn: { cards: [
          tech('Pluck with your index and middle fingers, taking turns.', ['Rest your thumb on the pickup or the E string', 'Pluck the A string: index, middle, index, middle', 'Keep both fingers the same loudness']),
          tech('Pull the string across, toward the next string. Let the finger land there.', ['Pluck the D string so your finger lands on the A string', 'Do it with the middle finger too', 'Listen for a round, even sound, not a snap']),
          { text: 'Each pluck is one note. Even plucks on every beat make a steady pulse.', board: { view: [0, 5], dots: [nd(4, 0, { role: 'root' })] } }
        ] },
        see: { text: 'Four plucks per bar on the open A string, one on each beat.', view: [0, 5], sequence: [P(3, 0), P(3, 0), P(3, 0), P(3, 0)], dots: [nd(3, 0)], bpm: 80 },
        try: { view: [0, 5], tasks: [
          task('Tap the open E string: your thumb can rest on it.', P(4, 0)),
          task('Tap the open A string.', P(3, 0)),
          task('Tap the open D string.', P(2, 0))
        ] },
        play: { text: 'Pluck the open A string on every beat, alternating index and middle, for the whole loop.', view: [0, 5], bpm: 70, follow: [P(3, 0)] },
        check: { pass: 3, view: [0, 5], questions: [
          choice('Which fingers pluck the bass?', ['Index and middle, taking turns', 'Thumb only', 'Any one finger'], 'Index and middle, taking turns', 'fact:bass-pluck-fingers'),
          choice('After a pluck, where does the finger go?', ['It rests on the next string down', 'Up in the air', 'Back to the same string'], 'It rests on the next string down', 'fact:bass-rest-stroke'),
          tap('Tap the open E string.', P(4, 0)),
          tap('Tap the open G string.', P(1, 0))
        ] }
      }
    },
    {
      id: 'b1-3', title: 'The fretting hand: one finger per fret',
      steps: {
        hear: { text: 'Frets 1, 2, 3 and 4 on the A string: one finger for each.', sound: seq([P(3, 1), P(3, 2), P(3, 3), P(3, 4)], 80) },
        learn: { cards: [
          tech('One finger per fret: fingers 1, 2, 3 and 4 each look after one fret.', ['Put finger 1 on fret 1 of the A string', 'Place fingers 2, 3 and 4 on frets 2, 3 and 4', 'Keep them hovering close to the string']),
          tech('Press just behind the fret wire with your fingertip, not on top of it.', ['Play fret 3 with finger 3, close to the fret', 'Press only as hard as it takes to stop the buzz', 'Keep your thumb behind the neck, behind finger 2']),
          { text: 'With your hand at fret 1, four frets are under your fingers without moving.', board: { view: [0, 5], focus: { frets: [1, 4] }, dots: [P(3, 1, { label: '1' }), P(3, 2, { label: '2' }), P(3, 3, { label: '3' }), P(3, 4, { label: '4' })] } }
        ] },
        see: { text: 'Fingers 1 to 4 on the A string, then on the E string.', view: [0, 5], sequence: [P(3, 1), P(3, 2), P(3, 3), P(3, 4), P(4, 1), P(4, 2), P(4, 3), P(4, 4)], bpm: 90 },
        try: { view: [0, 5], tasks: [
          task('Tap where finger 3 goes on the A string with your hand at fret 1.', P(3, 3)),
          task('Tap where finger 1 goes on the E string with your hand at fret 1.', P(4, 1)),
          task('Tap where finger 4 goes on the D string with your hand at fret 1.', P(2, 4))
        ] },
        play: { text: 'Play frets 1-2-3-4 on the A string, one per beat, then on the E string. Keep your hand still.', view: [0, 5], bpm: 60, follow: [P(3, 1), P(3, 2), P(3, 3), P(3, 4), P(4, 1), P(4, 2), P(4, 3), P(4, 4)] },
        check: { pass: 3, view: [0, 5], questions: [
          choice('Where do you press the string?', ['Just behind the fret wire', 'On top of the fret wire', 'Halfway between frets'], 'Just behind the fret wire', 'fact:bass-press-behind-fret'),
          tap('From Lesson 1: tap the open A string.', P(3, 0)),
          tap('With your hand at fret 1, tap where finger 2 goes on the E string.', P(4, 2)),
          choice('One finger per fret covers how many frets?', ['4', '3', '2'], '4', 'fact:bass-ofpf-frets')
        ] }
      }
    },
    {
      id: 'b1-4', title: 'The pulse: quarter notes with the kick',
      review: ['rhythm:bass-0-4-8-12'],
      steps: {
        hear: { text: 'A kick drum and a bass on every beat: 1, 2, 3, 4.', sound: seq([P(3, 0), P(3, 0), P(3, 0), P(3, 0), P(3, 0), P(3, 0), P(3, 0), P(3, 0)], 80) },
        learn: { cards: [
          grid('The beat is the pulse you tap your foot to. Count it: 1 2 3 4.', [0, 4, 8, 12], { kick: [0, 4, 8, 12] }),
          grid('A quarter note lasts one beat. Four of them fill a bar of 4/4.', [0, 4, 8, 12], { kick: [0, 8], snare: [4, 12] }),
          grid('On beats 1 and 3 the kick plays with you. Lock your notes to it.', [0, 8], { kick: [0, 8], snare: [4, 12] })
        ] },
        see: { text: 'Roots on every beat with the drums. Count out loud: 1 2 3 4.', view: [0, 5], sequence: [P(3, 0), P(3, 0), P(3, 0), P(3, 0)], dots: [nd(3, 0)], bpm: 80 },
        try: { view: [0, 5], tasks: [
          gridTask('Tap the four quarter notes of this bar.', [0, 4, 8, 12], { kick: [0, 8] }),
          gridTask('Now just beats 1 and 3, with the kick.', [0, 8], { kick: [0, 8] }),
          task('Tap the note you played with the kick: the open A string.', P(3, 0))
        ] },
        play: { text: 'Play the open A string on every beat with the drums. Then only on beats 1 and 3, with the kick.', view: [0, 5], bpm: 70, follow: [P(3, 0)] },
        check: { pass: 3, view: [0, 5], questions: [
          choice('How many quarter notes fill a bar of 4/4?', ['4', '8', '2'], '4', 'fact:quarters-per-bar'),
          choice('In a rock beat the kick plays on…', ['Beats 1 and 3', 'Beats 2 and 4', 'Only beat 4'], 'Beats 1 and 3', 'fact:kick-1-3'),
          tap('From Lesson 3: with your hand at fret 1, tap where finger 3 goes on the A string.', P(3, 3)),
          tap('Tap the open E string.', P(4, 0))
        ] }
      }
    },
    {
      id: 'b1-5', title: 'The musical alphabet, whole and half steps',
      steps: {
        hear: { text: 'The letters on the A string: A B C D E F G A.', sound: seq(NAT[3].map(f => P(3, f)), 90) },
        learn: { cards: [
          S('l1-2.1'),
          S('l1-3.3'),
          { text: 'On one string, a half step is one fret and a whole step is two frets.', board: { view: [0, 5], dots: [nd(3, 0, { role: 'root' }), nd(3, 2, { role: 'third' }), nd(3, 3, { role: 'fifth' })] } }
        ] },
        see: { text: 'Up the E string: whole and half steps. E to F is one fret; F to G is two.', view: [0, 12], sequence: NAT[4].map(f => P(4, f)), dots: naturals(4), bpm: 90, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [0, 12], tasks: [
          task('Tap B on the A string.', at('B', 3)),
          task('Tap the letter after E on the E string.', at('F', 4)),
          task('Tap C on the A string.', at('C', 3))
        ] },
        play: { text: 'Play up the A string on the lit frets, one per beat, saying each letter: A B C D E F G A.', view: [0, 12], bpm: 60, follow: NAT[3].map(f => P(3, f)) },
        check: { pass: 3, view: [0, 12], questions: [
          choice('Which pairs of letters are a half step apart?', ['B–C and E–F', 'A–B and D–E', 'C–D and F–G'], 'B–C and E–F', 'fact:alphabet-no-gap'),
          tap('Tap G on the E string.', at('G', 4)),
          tap('From Lesson 4: tap the note you played on every beat, the open A string.', P(3, 0)),
          tap('Tap D on the A string.', at('D', 3))
        ] }
      }
    },
    {
      id: 'b1-6', title: 'Notes on the E and A strings, and the octave shape',
      steps: {
        hear: { text: 'G on the E string, then the same note one octave up: two strings up, two frets up.', sound: seq([at('G', 4), at('G', 2), at('A', 4), at('A', 2)], 80) },
        learn: { cards: [
          { text: 'These are the natural notes on the E string. Learn them from the landmarks: E open, G at 3, A at 5.', board: { view: [0, 12], dots: naturals(4) } },
          { text: 'And on the A string: A open, C at 3, D at 5. Most bass roots live on these two strings.', board: { view: [0, 12], dots: naturals(3) } },
          { text: 'The octave: same letter, higher. Go two strings up and two frets up.', board: { view: [0, 7], dots: [nd(4, 3, { role: 'root' }), nd(2, 5, { role: 'root' })] } }
        ] },
        see: { text: 'Roots and their octaves: G, C and A.', view: [0, 12], sequence: [at('G', 4), at('G', 2), at('C', 3), at('C', 1), at('A', 4), at('A', 2)], bpm: 80, link: { key: 'G', scale: 'major', labels: 'notes' } },
        try: { view: [0, 12], tasks: [
          task('Tap A on the E string.', at('A', 4)),
          task('Tap the octave of A: two strings up, two frets up.', at('A', 2, 5)),
          task('Tap D on the A string.', at('D', 3))
        ] },
        play: { text: 'Play each root and then its octave, one per beat: G, G, C, C, A, A.', view: [0, 12], bpm: 70, follow: [at('G', 4), at('G', 2), at('C', 3), at('C', 1), at('A', 4), at('A', 2)] },
        check: { pass: 3, view: [0, 12], questions: [
          tap('Tap C on the A string.', at('C', 3)),
          tap('Tap B on the E string.', at('B', 4)),
          tap('From Lesson 5: tap F on the E string.', at('F', 4)),
          choice('From a root on the E string, where is its octave?', ['Two strings up, two frets up', 'One string up, same fret', 'Twelve frets up only'], 'Two strings up, two frets up', 'fact:bass-octave-shape')
        ] }
      }
    },
    {
      id: 'b1-7', title: 'Muting: silence between notes',
      steps: {
        hear: { text: 'Short, muted notes with silence between them, then long ringing ones.', sound: seq([P(3, 0), null, P(3, 0), null, P(3, 0), P(3, 0), P(3, 0), P(3, 0)], 90) },
        learn: { cards: [
          tech('To stop a fretted note, lift your finger off the fret but keep it touching the string.', ['Play fret 5 on the E string and let it ring', 'Ease off the pressure: the note stops', 'Keep the finger on the string so nothing else rings']),
          tech('Your plucking finger mutes too: after a pluck it rests on the next string down.', ['Pluck the D string and let the finger land on the A string', 'Notice the A string stays quiet', 'Rest your thumb on the E string when playing higher strings']),
          grid('Short notes need silence after them. Here the notes are on beats 1 and 3, quiet in between.', [0, 8], { kick: [0, 8], snare: [4, 12] })
        ] },
        see: { text: 'Notes on 1 and 3 only, muted in between, with the kick.', view: [0, 5], sequence: [P(4, 5), null, P(4, 5), null], dots: [nd(4, 5)], bpm: 80 },
        try: { view: [0, 7], tasks: [
          gridTask('Tap the notes: beats 1 and 3 only.', [0, 8]),
          task('Tap A on the E string: the note you will mute.', at('A', 4)),
          gridTask('Now beats 1, 2 and 3, with beat 4 silent.', [0, 4, 8])
        ] },
        play: { text: 'Play A (E string, fret 5) on beats 1 and 3, muting it on 2 and 4. Nothing should ring when you stop.', view: [0, 7], bpm: 70, follow: [at('A', 4)], beatsPerStep: 2 },
        check: { pass: 3, view: [0, 7], questions: [
          choice('How do you stop a fretted note?', ['Ease off the pressure but keep touching the string', 'Lift the finger right off', 'Press harder'], 'Ease off the pressure but keep touching the string', 'fact:bass-fret-mute'),
          choice('Where does the plucking finger go after a pluck?', ['Onto the next string down, muting it', 'Away from the strings', 'Onto the pickup'], 'Onto the next string down, muting it', 'fact:bass-rest-stroke'),
          tap('From Lesson 6: tap the octave of G on the E string (two strings up, two frets up).', at('G', 2, 5)),
          tap('Tap E on the A string.', at('E', 3))
        ] }
      }
    }
  ],
  challenge: {
    id: 'b1-ch', title: 'Level 1 Challenge', challenge: true,
    flow: [
      { type: 'kickroots', name: 'Roots on the kick',
        text: 'Over a rock drum loop at 70 bpm, play the root the app names on beat 1 of each bar, with the kick. Tap the pad as you play, if you like: your timing is shown, and it never holds you back.',
        bpm: 70, bars: 8, style: 'rock8', window: 60,
        roots: [['A', 4], ['A', 4], ['D', 3], ['D', 3], ['E', 4], ['D', 3], ['A', 4], ['E', 3]].map(([n, s]) => ({ label: `${n} on the ${K.STRING[s]} string`, pos: at(n, s) })) },
      { type: 'check', name: 'Check it', pass: 3, view: [0, 12], questions: [
        tap('Tap A on the E string.', at('A', 4)),
        tap('Tap D on the A string.', at('D', 3)),
        tap('Tap the octave of C on the A string (two strings up, two frets up).', at('C', 1, 5)),
        choice('In a rock beat, the bass locks with the kick on…', ['Beats 1 and 3', 'Beats 2 and 4', 'Every 16th note'], 'Beats 1 and 3', 'fact:kick-1-3')
      ] }
    ]
  },
  placement: [
    tap('Tap A on the E string.', at('A', 4)),
    tap('Tap C on the A string.', at('C', 3)),
    choice('How many quarter notes fill a bar of 4/4?', ['4', '8', '2'], '4', 'fact:quarters-per-bar')
  ]
};
