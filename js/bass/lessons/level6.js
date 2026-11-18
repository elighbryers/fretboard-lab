// Bass Level 6: groove and walking (docs/research-bass.md E).
import { K, P, at, nd, task, tap, choice, S, seq, grid, gridTask, tech } from './kit.js';
import { BASS_TABS } from '../tabs/index.js';

const pos = list => list.map(x => x && P(x[0], x[1]));
const F7 = K.inKey('F', 'chord', '7'), Dm7 = K.inKey('D', 'chord', 'm7'), G7 = K.inKey('G', 'chord', '7'), Cmaj7 = K.inKey('C', 'chord', 'maj7');
const Gmixo = K.inKey('G', 'scale', 'mixolydian'), Ddor = K.inKey('D', 'scale', 'dorian');
// ii-V-I in C, walking: chord tones, and an approach note on beat 4.
const IIVI = [[3, 5], [2, 3], [2, 7], [4, 2], [4, 3], [3, 2], [3, 5], [3, 4], [3, 3], [2, 2], [2, 5], [3, 2], [3, 3], [3, 5], [2, 2], [3, 4]];
// The walking line from the play-along "Walking Blues in F" (validated there), one note per beat.
const WALK_F = BASS_TABS.find(t => t.id === 'walking-blues-f').notes.map(([s, f]) => P(s, f));

export default {
  id: 'bass-level-6',
  title: 'Groove and walking',
  lessons: [
    {
      id: 'b6-1', title: 'The two-feel and the four-feel',
      steps: {
        hear: { text: 'F7 with a two-feel (half notes), then a four-feel (quarter notes).', sound: seq(pos([[4, 1], null, [3, 3], null, [4, 1], [4, 5], [3, 3], [3, 2]]), 110) },
        learn: { cards: [
          { text: 'In a two-feel the bass plays two notes a bar, on 1 and 3: usually root and 5th. It feels relaxed.', board: { view: [0, 7], dots: [F7.dot(4, 1), F7.dot(3, 3)] } },
          { text: 'In a four-feel the bass walks: one note on every beat. The band feels it move forward.', board: { view: [0, 7], dots: [F7.dot(4, 1), F7.dot(4, 5), F7.dot(3, 3)] } },
          grid('Two-feel: notes on 1 and 3. Four-feel: on every beat.', [0, 8], { kick: [0, 8], midi: 29 })
        ] },
        see: { text: 'Two bars of two-feel, then two bars of four-feel on F7.', view: [0, 7], sequence: pos([[4, 1], null, [3, 3], null, [4, 1], null, [3, 3], null, [4, 1], [4, 5], [3, 3], [3, 2]]), bpm: 110, link: { key: 'F', chord: '7', labels: 'intervals' } },
        try: { view: [0, 7], tasks: [
          gridTask('Tap a two-feel bar: notes on 1 and 3.', [0, 8], { midi: 29 }),
          gridTask('Now a four-feel bar: every beat.', [0, 4, 8, 12], { midi: 29 }),
          task('Tap the 5th of F7, C, on the A string: the second note of the two-feel.', at('C', 3))
        ] },
        play: { text: 'Over the two-feel groove, play F and C (root and 5th) on 1 and 3. Then switch the groove to Walking swing and play every beat.', view: [0, 7], bpm: 100, groove: 'twofeel', follow: [at('F', 4), at('C', 3)], beatsPerStep: 2, backing: { chords: ['F:7'] } },
        check: { pass: 3, view: [0, 7], questions: [
          choice('In a two-feel, the bass plays on…', ['Beats 1 and 3', 'Every beat', 'Only beat 1'], 'Beats 1 and 3', 'fact:two-feel'),
          choice('A walking line plays…', ['One note on every beat', 'Two notes a bar', 'Long held notes'], 'One note on every beat', 'fact:walking-four'),
          tap('Tap the root of F7 on the E string.', at('F', 4)),
          tap('Tap the 3rd of F7, A, on the E string.', at('A', 4))
        ] }
      }
    },
    {
      id: 'b6-2', title: 'Walking: root, chord tones, approach',
      steps: {
        hear: { text: 'A walking line on F7 to Bb7: F A C B, then Bb.', sound: seq(pos([[4, 1], [4, 5], [3, 3], [3, 2], [3, 1]]), 110) },
        learn: { cards: [
          { text: 'Beat 1: the root of the chord. That is how the band hears where they are.', board: { view: [0, 7], dots: [F7.dot(4, 1)] } },
          { text: 'Beats 2 and 3: chord tones (3, 5, b7) or scale steps. They outline the chord.', board: { view: [0, 7], dots: F7.dots([[4, 1], [4, 5], [3, 3], [2, 1]]) } },
          { text: 'Beat 4: an approach note into the next root, often a half step away.', board: { view: [0, 7], dots: [F7.dot(4, 1), P(3, 2, { label: '½' }), nd(3, 1, { role: 'root' })] } }
        ] },
        see: { text: 'F7 → Bb7 → F7: R 3 5 approach each bar.', view: [0, 7], sequence: pos([[4, 1], [4, 5], [3, 3], [3, 2], [3, 1], [3, 5], [2, 3], [2, 2], [2, 3]]), bpm: 100, link: { key: 'F', chord: '7', labels: 'intervals' } },
        try: { view: [0, 7], tasks: [
          task('Beat 1 over Bb7: tap Bb on the A string.', at('Bb', 3)),
          task('Beat 4 before Bb7: tap B on the A string, a half step above Bb.', at('B', 3)),
          task('Beat 3 over F7: tap the 5th, C, on the A string.', at('C', 3))
        ] },
        play: { text: 'Walk F7 to Bb7 and back, one note per beat: root, 3rd, 5th, approach.', view: [0, 7], bpm: 90, groove: 'walking', follow: pos([[4, 1], [4, 5], [3, 3], [3, 2], [3, 1], [3, 5], [2, 3], [4, 2]]), backing: { chords: ['F:7', 'Bb:7'] } },
        check: { pass: 3, view: [0, 7], questions: [
          choice('In a walking line, beat 1 is usually…', ['The root', 'The 7th', 'An approach note'], 'The root', 'fact:walk-beat-1'),
          tap('Over Bb7, tap its 3rd, D, on the A string.', at('D', 3)),
          tap('Before F7, tap F# on the E string: a half step above F.', at('F#', 4)),
          tap('From Lesson 1: tap the 5th of F7, C, on the A string.', at('C', 3))
        ] }
      }
    },
    {
      id: 'b6-3', title: 'Walking over ii–V–I',
      review: ['tone:D:m7:b3', 'tone:G:7:3'],
      steps: {
        hear: { text: 'Dm7 – G7 – Cmaj7 in C, walked.', sound: seq(pos(IIVI), 120) },
        learn: { cards: [
          { text: 'ii–V–I is the most common chord move in jazz: in C it is Dm7, G7, Cmaj7.', board: { view: [0, 7], dots: [Dm7.dot(3, 5), G7.dot(4, 3), Cmaj7.dot(3, 3)] } },
          { text: 'Walk each chord with its own tones: D F A over Dm7, G B D over G7, C E G over Cmaj7.', board: { view: [0, 7], dots: [...Dm7.dots([[3, 5], [2, 3]]), ...G7.dots([[4, 3], [3, 2]])] } },
          { text: 'Approach each new root on beat 4: F# into G, C# into C.', board: { view: [0, 7], dots: [P(4, 2, { label: '½' }), G7.dot(4, 3), P(3, 4, { label: '½' }), Cmaj7.dot(3, 3)] } }
        ] },
        see: { text: 'One chorus of ii–V–I with the approach notes.', view: [0, 9], sequence: pos(IIVI), bpm: 100, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [0, 9], tasks: [
          task('Over Dm7, tap its flat 3rd, F, on the D string.', at('F', 2), { item: 'tone:D:m7:b3' }),
          task('Over G7, tap its 3rd, B, on the A string.', at('B', 3), { item: 'tone:G:7:3' }),
          task('Beat 4 into Cmaj7: tap C# on the A string.', at('C#', 3))
        ] },
        play: { text: 'Walk ii–V–I in C with the swing groove. Keep it slow and even.', view: [0, 9], bpm: 80, groove: 'walking', follow: pos(IIVI), backing: { chords: ['D:m7', 'G:7', 'C:maj7', 'C:maj7'] } },
        check: { pass: 3, view: [0, 9], questions: [
          choice('ii–V–I in C is…', ['Dm7 G7 Cmaj7', 'C F G', 'Am Dm G'], 'Dm7 G7 Cmaj7', 'fact:ii-v-i-c'),
          tap('Over Cmaj7, tap its 3rd, E, on the D string.', at('E', 2)),
          tap('Over G7, tap its 5th, D, on the A string.', at('D', 3)),
          tap('From Lesson 2: over Bb7, tap its root on the A string.', at('Bb', 3))
        ] }
      }
    },
    {
      id: 'b6-4', title: 'Groove styles: Motown, funk and one-drop',
      review: ['rhythm:bass-0-3-6-10-12'],
      steps: {
        hear: { text: 'Funk octaves on E: low E, high E, with ghost-like gaps.', sound: seq(pos([[4, 0], [2, 2], null, [4, 0], null, [2, 2], [4, 0], [2, 2]]), 180) },
        learn: { cards: [
          grid('Motown-style: busy, melodic eighths that keep moving, with approach notes into each chord.', [0, 4, 6, 8, 12, 14], { kick: [0, 8], snare: [4, 12], midi: 36 }),
          grid('Funk: sixteenth notes and octaves, short and punchy, with gaps that groove.', [0, 3, 6, 10, 12], { kick: [0, 6, 10], snare: [4, 12], midi: 28 }),
          grid('Reggae one-drop: beat 1 is empty. The bass answers around the drop on beat 3.', [4, 7, 10, 12], { kick: [8], snare: [8], midi: 33 })
        ] },
        see: { text: 'Funk octaves: E string open and D string, fret 2.', view: [0, 5], sequence: pos([[4, 0], [2, 2], null, [4, 0], null, [2, 2], [4, 0], [2, 2]]), bpm: 180, link: { key: 'E', scale: 'minor-pentatonic', labels: 'notes' } },
        try: { view: [0, 5], tasks: [
          gridTask('Tap the funk rhythm.', [0, 3, 6, 10, 12], { kick: [0, 6, 10], midi: 28 }),
          gridTask('Tap the one-drop bass: nothing on beat 1.', [4, 7, 10, 12], { kick: [8], midi: 33 }),
          task('Tap the high octave of E for the funk line: E on the D string.', at('E', 2))
        ] },
        play: { text: 'Pick a style in the Drums menu (Funk 16ths, Reggae one-drop, Four on the floor) and play a matching line on E.', view: [0, 7], bpm: 85, groove: 'funk16', follow: pos([[4, 0], [2, 2]]), backing: { chords: ['E:7'] } },
        check: { pass: 3, view: [0, 5], questions: [
          choice('In a reggae one-drop, what is special about beat 1?', ['It is left empty', 'It is the loudest', 'It has a fill'], 'It is left empty', 'fact:one-drop'),
          choice('Funk bass often uses…', ['Octaves and 16th notes', 'Long whole notes', 'Only the 5th'], 'Octaves and 16th notes', 'fact:funk-octaves'),
          tap('Tap the open E string: the low note of the octave.', P(4, 0)),
          tap('From Lesson 3: over G7, tap its 3rd, B, on the A string.', at('B', 3))
        ] }
      }
    },
    {
      id: 'b6-5', title: 'Feel: on, behind and ahead of the beat',
      steps: {
        hear: { text: 'The same line played short and punchy, then long and smooth.', sound: seq(pos([[3, 0], null, [3, 0], null, [3, 0], [3, 0], [3, 0], [3, 0]]), 100) },
        learn: { cards: [
          { text: 'Lock with the kick first. Tiny shifts on purpose (a little behind for laid back) only work once you can play right on it.', board: { view: [0, 5], dots: [nd(3, 0, { role: 'root' })] } },
          { text: 'Big shifts hurt: research found offsets over about 50 ms make a groove feel worse. Stay close.', board: { view: [0, 5], dots: [nd(3, 0, { role: 'root' })] } },
          tech('Note length and loudness are part of feel too.', ['Play four short, muted notes, then four held to the next beat', 'Play one bar quiet, the next louder', 'Accent beat 1 a little, then play it even'])
        ] },
        see: { text: 'Short notes on A, then long ones: same notes, different feel.', view: [0, 5], sequence: pos([[3, 0], null, [3, 0], null, [3, 0], [3, 0], [3, 0], [3, 0]]), bpm: 100, link: { key: 'A', scale: 'minor-pentatonic', labels: 'notes' } },
        try: { view: [0, 7], tasks: [
          gridTask('Tap short notes on every beat.', [0, 4, 8, 12], { midi: 33 }),
          task('Tap the note to play short and long: the open A string.', P(3, 0)),
          task('Tap A an octave up, on the G string.', at('A', 1))
        ] },
        play: { text: 'Play quarter notes on A: first right on the kick, then short and staccato, then long and legato. Use Lock to the kick in Drills to measure it.', view: [0, 5], bpm: 85, follow: [P(3, 0)] },
        check: { pass: 3, view: [0, 7], questions: [
          choice('What should you master before playing "behind the beat" on purpose?', ['Playing right on the beat', 'Playing fast', 'Slap bass'], 'Playing right on the beat', 'fact:feel-on-first'),
          choice('Is a 100 ms early or late offset a good "feel"?', ['No, big offsets make grooves feel worse', 'Yes, the more the better', 'Only in funk'], 'No, big offsets make grooves feel worse', 'fact:feel-small-offsets'),
          tap('Tap the open A string.', P(3, 0)),
          tap('From Lesson 4: tap the high octave of E on the D string.', at('E', 2))
        ] }
      }
    },
    {
      id: 'b6-6', title: 'Modes for bass lines: Mixolydian and Dorian',
      review: ['degree:G:mixolydian:b7', 'degree:D:dorian:6'],
      steps: {
        hear: { text: 'G Mixolydian (major with a b7), then D Dorian (minor with a bright 6).', sound: seq(pos([[4, 3], [4, 5], [3, 2], [3, 3], [3, 5], [2, 2], [2, 3], [2, 5]]), 110) },
        learn: { cards: [S('l6-6.1'), S('l6-6.2'), S('l6-6.3')] },
        see: { text: 'G Mixolydian in one position: the F natural is the b7.', view: [0, 7], sequence: pos([[4, 3], [4, 5], [3, 2], [3, 3], [3, 5], [2, 2], [2, 3], [2, 5]]), dots: Gmixo.dots([[4, 3], [4, 5], [3, 2], [3, 3], [3, 5], [2, 2], [2, 3], [2, 5]]), bpm: 100, link: { key: 'G', scale: 'mixolydian', labels: 'intervals' } },
        try: { view: [0, 9], tasks: [
          task('Tap the b7 of G Mixolydian, F, on the D string.', at('F', 2), { item: 'degree:G:mixolydian:b7' }),
          task('Tap the 6 of D Dorian, B, on the A string.', at('B', 3), { item: 'degree:D:dorian:6' }),
          task('Tap the b3 of D Dorian, F, on the E string.', at('F', 4))
        ] },
        play: { text: 'Over G7, make a line from G Mixolydian. Over Dm7, use D Dorian. Two bars each, then loop.', view: [0, 9], bpm: 90, groove: 'funk16', dots: Gmixo.all({ strings: [4, 3, 2, 1], from: 1, to: 6 }), backing: { chords: ['G:7', 'G:7', 'D:m7', 'D:m7'] }, seconds: 60 },
        check: { pass: 3, view: [0, 9], questions: [
          choice('Mixolydian is the major scale with…', ['A flat 7th', 'A flat 3rd', 'A sharp 4th'], 'A flat 7th', 'fact:mixolydian-b7'),
          tap('Tap the 6 of D Dorian, B, on the D string.', at('B', 2), { item: 'degree:D:dorian:6' }),
          tap('Tap the b7 of G Mixolydian, F, on the E string.', at('F', 4), { item: 'degree:G:mixolydian:b7' }),
          tap('From Lesson 5: tap A an octave up, on the G string.', at('A', 1))
        ] }
      }
    },
    {
      id: 'b6-7', title: 'Electives: slap, pick and the low B',
      steps: {
        hear: { text: 'Octaves, the slap-and-pop shape: low E (thumb), high E (pop).', sound: seq(pos([[4, 0], [2, 2], [4, 0], [2, 2], [3, 0], [1, 2], [3, 0], [1, 2]]), 110) },
        learn: { cards: [
          tech('Slap and pop: the thumb bounces off a low string, a finger snaps a high one.', ['Slap the open E with the side of your thumb, bouncing off', 'Hook your index under the D string at fret 2 and snap it', 'Alternate slow: thumb, pop, thumb, pop']),
          tech('Pick playing gives a brighter, even attack: down and up strokes.', ['Hold a pick between thumb and index', 'Play eighths on the A string: down, up, down, up', 'Mute with your palm near the bridge for a punchier sound']),
          tech('A 5-string adds a low B below the E: notes down to B0, and more notes in one position.', ['Rest your thumb on the B string to mute it', 'Find E on the B string at fret 5', 'Play a root on B and its octave two strings up'])
        ] },
        see: { text: 'Slap octaves on E and A.', view: [0, 5], sequence: pos([[4, 0], [2, 2], [4, 0], [2, 2], [3, 0], [1, 2], [3, 0], [1, 2]]), bpm: 100, link: { key: 'E', scale: 'minor-pentatonic', labels: 'notes' } },
        try: { view: [0, 5], tasks: [
          task('Tap the thumb note: the open E string.', P(4, 0)),
          task('Tap the pop note: E on the D string.', at('E', 2)),
          task('Tap the next pop note: A on the G string.', at('A', 1))
        ] },
        play: { text: 'Choose one elective and play it slowly over the groove: slap octaves, pick eighths, or a line using the low B.', view: [0, 5], bpm: 70, groove: 'funk16', follow: pos([[4, 0], [2, 2]]), backing: { chords: ['E:7'] } },
        check: { pass: 3, view: [0, 5], questions: [
          choice('In slap bass, the thumb usually plays…', ['The low note', 'The high note', 'Both at once'], 'The low note', 'fact:slap-thumb-low'),
          choice('The lowest string on a 5-string bass is…', ['B', 'E', 'C'], 'B', 'fact:bass-five-string-b'),
          tap('Tap the pop note for A: A on the G string.', at('A', 1)),
          tap('From Lesson 6: tap the 6 of D Dorian, B, on the A string.', at('B', 3), { item: 'degree:D:dorian:6' })
        ] }
      }
    }
  ],
  challenge: {
    id: 'b6-ch', title: 'Level 6 Challenge', challenge: true,
    flow: [
      { type: 'play', name: 'Walk the blues', text: 'Walk two choruses of a 12-bar blues in F at 100 bpm with the swing groove: root on beat 1 of every chord, an approach note on beat 4. The line from "Walking Blues in F" is lit; make up your own if you like.', view: [0, 7], bpm: 100, groove: 'walking',
        follow: WALK_F, backing: { chords: ['F:7', 'Bb:7', 'F:7', 'F:7', 'Bb:7', 'Bb:7', 'F:7', 'F:7', 'C:7', 'Bb:7', 'F:7', 'C:7'] }, bpmKey: 'walk' },
      { type: 'check', name: 'Check it', pass: 3, view: [0, 7], questions: [
        tap('Beat 1 over C7: tap C on the A string.', at('C', 3)),
        tap('Beat 4 into C7: tap B on the A string.', at('B', 3)),
        tap('Over Bb7: tap its 3rd, D, on the A string.', at('D', 3)),
        choice('A walking line approaches the next chord on…', ['Beat 4', 'Beat 1', 'Beat 2'], 'Beat 4', 'fact:approach-beat-4')
      ] }
    ]
  },
  placement: [
    choice('A walking line plays…', ['One note on every beat', 'Two notes a bar', 'Long held notes'], 'One note on every beat', 'fact:walking-four'),
    tap('Over G7, tap its 3rd, B, on the A string.', at('B', 3)),
    choice('Mixolydian is the major scale with…', ['A flat 7th', 'A flat 3rd', 'A sharp 4th'], 'A flat 7th', 'fact:mixolydian-b7')
  ]
};
