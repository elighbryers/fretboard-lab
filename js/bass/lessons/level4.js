// Bass Level 4: intervals and chord tones (docs/research-bass.md E).
import { K, P, at, nd, task, tap, choice, S, seq, toneItem } from './kit.js';

const Cmaj = K.inKey('C', 'chord', 'major'), Amin = K.inKey('A', 'chord', 'minor'), Bdim = K.inKey('B', 'chord', 'dim');
const G7 = K.inKey('G', 'chord', '7'), Cmaj7 = K.inKey('C', 'chord', 'maj7'), Am7 = K.inKey('A', 'chord', 'm7');
const Ckey = K.inKey('C', 'scale', 'major');
const pos = list => list.map(x => x && P(x[0], x[1]));
// Hear a chord, then a bass note: which chord tone is it?
const toneQ = (prompt, chord, chordName, bassMidi, answer, extra = {}) => choice(prompt, ['R', '3', '5'], answer, `toneear:${answer}`,
  { sound: { seq: [null, bassMidi, null, bassMidi], bpm: 90, pad: chord }, explain: `The bass played the ${answer === 'R' ? 'root' : answer} of ${chordName}.`, ...extra });

export default {
  id: 'bass-level-4',
  title: 'Intervals and chord tones',
  lessons: [
    {
      id: 'b4-1', title: 'Intervals as shapes on the bass',
      review: ['interval:M3', 'interval:P5', 'interval:P4'],
      steps: {
        hear: { text: 'From C: a major 3rd, a perfect 4th, a perfect 5th and the octave.', sound: seq(pos([[3, 3], [2, 2], [3, 3], [2, 3], [3, 3], [2, 5], [3, 3], [1, 5]]), 100) },
        learn: { cards: [S('l3-1.1', [0, 7]), S('l3-1.2', [0, 7]), { text: 'Every bass string is a 4th above the next, so each interval is the same shape from any root.', board: { view: [0, 7], dots: [Cmaj.dot(3, 3), nd(2, 2, { label: '3', role: 'third' }), nd(2, 3, { label: '4' }), nd(2, 5, { label: '5', role: 'fifth' })] } }] },
        see: { text: 'From C: 3rd one string up and one fret back, 4th straight across, 5th two frets up.', view: [0, 7], sequence: pos([[3, 3], [2, 2], [3, 3], [2, 3], [3, 3], [2, 5]]), dots: [Cmaj.dot(3, 3), nd(2, 2, { label: '3', role: 'third' }), nd(2, 3, { label: '4' }), nd(2, 5, { label: '5', role: 'fifth' })], bpm: 90, link: { key: 'C', scale: 'major', labels: 'intervals' } },
        try: { view: [0, 9], tasks: [
          task('Tap a major 3rd above G (G is on the E string, fret 3): one string up, one fret back.', P(3, 2), { item: 'interval:M3' }),
          task('Tap a perfect 4th above A (A is on the E string, fret 5): straight across.', P(3, 5), { item: 'interval:P4' }),
          task('Tap a perfect 5th above D (D is on the A string, fret 5).', P(2, 7), { item: 'interval:P5' })
        ] },
        play: { text: 'From each root play R, 3, 5, 8 (C, then F, then G): hear the same shape each time.', view: [0, 9], bpm: 70, follow: pos([[3, 3], [2, 2], [2, 5], [1, 5], [4, 1], [3, 0], [3, 3], [2, 3], [4, 3], [3, 2], [3, 5], [2, 5]]), backing: { chords: ['C:major', 'F:major', 'G:major'] } },
        check: { pass: 3, view: [0, 9], questions: [
          tap('Tap a perfect 5th above C (C is on the A string, fret 3).', P(2, 5), { item: 'interval:P5' }),
          tap('Tap a major 3rd above A (A is on the E string, fret 5).', P(3, 4), { item: 'interval:M3' }),
          tap('From Level 3: tap the root of A major on the E string.', at('A', 4)),
          choice('On a bass, each string is what interval above the one below it?', ['A perfect 4th', 'A perfect 5th', 'A major 3rd'], 'A perfect 4th', 'fact:bass-strings-fourths')
        ] }
      }
    },
    {
      id: 'b4-2', title: 'Major and minor 3rds',
      review: ['interval:m3', 'interval:M3'],
      steps: {
        hear: { text: 'C to E (major 3rd, bright), then C to Eb (minor 3rd, dark).', sound: seq(pos([[3, 3], [2, 2], null, [3, 3], [2, 1]]), 90) },
        learn: { cards: [S('l3-7.2', [0, 12]),
          { text: 'A major 3rd is 4 frets above the root. On bass: one string up, one fret back.', board: { view: [0, 7], dots: [Cmaj.dot(3, 3), Cmaj.dot(2, 2)] } },
          { text: 'A minor 3rd is 3 frets: one string up, two frets back. One fret is the whole difference.', board: { view: [0, 7], dots: [nd(3, 3, { role: 'root', label: 'R' }), nd(2, 1, { role: 'third', label: 'b3' })] } }] },
        see: { text: 'Major 3rd, then minor 3rd, from A on the E string.', view: [0, 9], sequence: pos([[4, 5], [3, 4], null, [4, 5], [3, 3]]), dots: [nd(4, 5, { role: 'root', label: 'R' }), nd(3, 4, { role: 'third', label: '3' }), nd(3, 3, { role: 'third', label: 'b3' })], bpm: 80, link: { key: 'A', scale: 'major', labels: 'intervals' } },
        try: { view: [0, 9], tasks: [
          task('Tap a minor 3rd above A (A is on the E string, fret 5).', P(3, 3), { item: 'interval:m3' }),
          task('Tap a major 3rd above G (G is on the E string, fret 3).', P(3, 2), { item: 'interval:M3' }),
          task('Tap a minor 3rd above D (D is on the A string, fret 5).', P(2, 3), { item: 'interval:m3' })
        ] },
        play: { text: 'Alternate R and major 3rd over A major, then R and minor 3rd over A minor. Hear the mood change.', view: [0, 9], bpm: 70, follow: pos([[4, 5], [3, 4], [4, 5], [3, 4], [4, 5], [3, 3], [4, 5], [3, 3]]), backing: { chords: ['A:major', 'A:minor'] } },
        check: { pass: 3, view: [0, 9], questions: [
          choice('How many frets is a minor 3rd?', ['3', '4', '2'], '3', 'fact:m3-frets'),
          tap('Tap a major 3rd above D (D is on the A string, fret 5).', P(2, 4), { item: 'interval:M3' }),
          tap('Tap a minor 3rd above G (G is on the E string, fret 3).', P(3, 1), { item: 'interval:m3' }),
          tap('From Lesson 1: tap a perfect 4th above A (A is on the E string, fret 5).', P(3, 5), { item: 'interval:P4' })
        ] }
      }
    },
    {
      id: 'b4-3', title: 'Triads: major, minor and diminished',
      review: [toneItem(Cmaj, '3'), toneItem(Amin, 'b3')],
      steps: {
        hear: { text: 'C major, A minor and B diminished, each played one note at a time.', sound: seq(pos([[3, 3], [2, 2], [2, 5], null, [4, 5], [3, 3], [3, 7], null, [3, 2], [2, 0], [2, 3]]), 110) },
        learn: { cards: [S('l4-1.1', [0, 7]), S('l4-2.1', [0, 7]), S('l4-2.3', [0, 7])] },
        see: { text: 'Triads as arpeggios: C (R 3 5), Am (R b3 5), Bdim (R b3 b5).', view: [0, 7], sequence: pos([[3, 3], [2, 2], [2, 5], null, [4, 5], [3, 3], [3, 7], null, [3, 2], [2, 0], [2, 3]]), dots: [...Cmaj.dots([[3, 3], [2, 2], [2, 5]])], bpm: 100, link: { key: 'C', chord: 'major', labels: 'intervals' } },
        try: { view: [0, 9], tasks: [
          task('Tap the 3rd of C major, E, on the D string.', at('E', 2), { item: toneItem(Cmaj, '3') }),
          task('Tap the flat 3rd of A minor, C, on the A string.', at('C', 3), { item: toneItem(Amin, 'b3') }),
          task('Tap the flat 5th of B diminished, F, on the D string.', at('F', 2), { item: toneItem(Bdim, 'b5') })
        ] },
        play: { text: 'Play each triad as R 3 5 3 over its chord: C, Am, then Bdim.', view: [0, 9], bpm: 70, follow: pos([[3, 3], [2, 2], [2, 5], [2, 2], [4, 5], [3, 3], [3, 7], [3, 3], [3, 2], [2, 0], [2, 3], [2, 0]]), backing: { chords: ['C:major', 'A:minor', 'B:dim'] } },
        check: { pass: 3, view: [0, 9], questions: [
          choice('A minor triad is…', ['R b3 5', 'R 3 5', 'R b3 b5'], 'R b3 5', 'fact:minor-triad'),
          tap('Tap the 5th of C major, G, on the D string.', at('G', 2), { item: toneItem(Cmaj, '5') }),
          tap('Tap the 5th of A minor, E, on the A string.', at('E', 3), { item: toneItem(Amin, '5') }),
          tap('From Lesson 2: tap a minor 3rd above A (A is on the E string, fret 5).', P(3, 3), { item: 'interval:m3' })
        ] }
      }
    },
    {
      id: 'b4-4', title: 'Arpeggios: R-3-5-8 and tenths',
      steps: {
        hear: { text: 'C major as R 3 5 8, then R 5 8 10: the 10th is the 3rd an octave up.', sound: seq(pos([[3, 3], [2, 2], [2, 5], [1, 5], null, [3, 3], [2, 5], [1, 5], [1, 9]]), 100) },
        learn: { cards: [
          { text: 'An arpeggio is a chord played one note at a time. On bass that is how chords sound.', board: { view: [0, 9], dots: Cmaj.dots([[3, 3], [2, 2], [2, 5], [1, 5]]) } },
          { text: 'R 3 5 8 climbs the chord: root, 3rd, 5th, octave.', board: { view: [0, 9], dots: Cmaj.dots([[3, 3], [2, 2], [2, 5], [1, 5]]) } },
          { text: 'The 10th is the 3rd an octave higher. R 5 8 10 is a big, open sound bassists love.', board: { view: [0, 11], dots: [Cmaj.dot(3, 3), Cmaj.dot(2, 5), Cmaj.dot(1, 5), P(1, 9, { label: '10', role: 'third' })] } }
        ] },
        see: { text: 'R 5 8 10 on C, then on G.', view: [0, 11], sequence: pos([[3, 3], [2, 5], [1, 5], [1, 9], [4, 3], [3, 5], [2, 5], [2, 9]]), dots: [Cmaj.dot(3, 3), Cmaj.dot(2, 5), Cmaj.dot(1, 5), P(1, 9, { label: '10', role: 'third' })], bpm: 90, link: { key: 'C', chord: 'major', labels: 'intervals' } },
        try: { view: [0, 11], tasks: [
          task('Tap the octave of C (C is on the A string, fret 3).', P(1, 5)),
          task('Tap the 10th of C: E on the G string.', at('E', 1)),
          task('Tap the 3rd of G major, B, on the A string.', at('B', 3))
        ] },
        play: { text: 'Play R 3 5 8 on C and G, then R 5 8 10. One arpeggio per bar.', view: [0, 11], bpm: 70, follow: pos([[3, 3], [2, 2], [2, 5], [1, 5], [4, 3], [3, 2], [3, 5], [2, 5], [3, 3], [2, 5], [1, 5], [1, 9], [4, 3], [3, 5], [2, 5], [2, 9]]), backing: { chords: ['C:major', 'G:major'] } },
        check: { pass: 3, view: [0, 11], questions: [
          choice('A 10th is…', ['The 3rd, an octave higher', 'The 5th, an octave higher', 'Ten frets up'], 'The 3rd, an octave higher', 'fact:tenth'),
          tap('Tap the 10th of G: B on the D string.', at('B', 2, 5)),
          tap('Tap the 5th of C, G, on the D string.', at('G', 2)),
          tap('From Lesson 3: tap the 3rd of C major, E, on the D string.', at('E', 2))
        ] }
      }
    },
    {
      id: 'b4-5', title: 'Seventh-chord arpeggios',
      review: [toneItem(G7, 'b7'), toneItem(Cmaj7, '7')],
      steps: {
        hear: { text: 'Cmaj7, G7 and Am7 as arpeggios: R 3 5 7.', sound: seq(pos([[3, 3], [2, 2], [2, 5], [1, 4], null, [4, 3], [3, 2], [3, 5], [2, 3], null, [4, 5], [3, 3], [3, 7], [2, 5]]), 110) },
        learn: { cards: [S('l4-7.1', [0, 7]), S('l4-7.2', [0, 7]), S('l4-7.3', [0, 7])] },
        see: { text: 'Cmaj7, G7 and Am7 under your hand.', view: [0, 9], sequence: pos([[3, 3], [2, 2], [2, 5], [1, 4], null, [4, 3], [3, 2], [3, 5], [2, 3], null, [4, 5], [3, 3], [3, 7], [2, 5]]), dots: Cmaj7.dots([[3, 3], [2, 2], [2, 5], [1, 4]]), bpm: 100, link: { key: 'G', chord: '7', labels: 'intervals' } },
        try: { view: [0, 9], tasks: [
          task('Tap the major 7th of Cmaj7, B, on the G string.', at('B', 1), { item: toneItem(Cmaj7, '7') }),
          task('Tap the flat 7th of G7, F, on the D string.', at('F', 2), { item: toneItem(G7, 'b7') }),
          task('Tap the flat 7th of Am7, G, on the D string.', at('G', 2), { item: toneItem(Am7, 'b7') })
        ] },
        play: { text: 'Play R 3 5 7 over Cmaj7, Am7, Dm7 and G7, one bar each.', view: [0, 9], bpm: 70, follow: pos([[3, 3], [2, 2], [2, 5], [1, 4], [4, 5], [3, 3], [3, 7], [2, 5], [3, 5], [2, 3], [2, 7], [1, 5], [4, 3], [3, 2], [3, 5], [2, 3]]), backing: { chords: ['C:maj7', 'A:m7', 'D:m7', 'G:7'] } },
        check: { pass: 3, view: [0, 9], questions: [
          choice('A dominant 7 chord (like G7) is…', ['R 3 5 b7', 'R 3 5 7', 'R b3 5 b7'], 'R 3 5 b7', 'fact:dom7-formula'),
          tap('Tap the 3rd of G7, B, on the A string.', at('B', 3), { item: toneItem(G7, '3') }),
          tap('Tap the flat 3rd of Am7, C, on the A string.', at('C', 3), { item: toneItem(Am7, 'b3') }),
          tap('From Lesson 4: tap the 10th of C, E on the G string.', at('E', 1))
        ] }
      }
    },
    {
      id: 'b4-6', title: 'The chords of a major key',
      steps: {
        hear: { text: 'The roots of the seven chords in C: C Dm Em F G Am Bdim.', sound: seq(pos([[3, 3], [3, 5], [2, 2], [2, 3], [2, 5], [1, 2], [1, 4]]), 90) },
        learn: { cards: [
          { text: 'Build a triad on each note of the major scale, using only notes in the key. You get seven chords.', board: { view: [0, 7], dots: Ckey.dots([[3, 3], [3, 5], [2, 2], [2, 3], [2, 5], [1, 2], [1, 4]], 'note') } },
          { text: 'They always come out the same: major, minor, minor, major, major, minor, diminished.', board: { view: [0, 7], dots: Ckey.dots([[3, 3], [2, 3], [2, 5]], 'note') } },
          { text: 'In C that is C, Dm, Em, F, G, Am and Bdim. The bass usually plays their roots.', board: { view: [0, 7], dots: Ckey.dots([[3, 3], [3, 5], [2, 2], [2, 3], [2, 5], [1, 2], [1, 4]], 'note') } }
        ] },
        see: { text: 'Each chord of C as R 3 5: C, Dm, Em, F, G, Am.', view: [0, 9], sequence: pos([[3, 3], [2, 2], [2, 5], [3, 5], [2, 3], [2, 7], [2, 2], [2, 5], [1, 4], [4, 1], [3, 0], [3, 3], [4, 3], [3, 2], [3, 5], [4, 5], [3, 3], [3, 7]]), dots: Ckey.all({ strings: [4, 3, 2, 1], from: 0, to: 9, mode: 'note' }), bpm: 140, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [0, 9], tasks: [
          task('Tap the root of the ii chord in C (Dm) on the A string.', at('D', 3)),
          task('Tap the root of the vi chord in C (Am) on the E string.', at('A', 4)),
          task('Tap the root of the IV chord in C (F) on the E string.', at('F', 4))
        ] },
        play: { text: 'Play the roots of C, Am, F, G in eighths, one chord per bar, with the drums and chords.', view: [0, 9], bpm: 75, follow: [at('C', 3), at('A', 4), at('F', 4), at('G', 4)], beatsPerStep: 4, backing: { chords: ['C:major', 'A:minor', 'F:major', 'G:major'] } },
        check: { pass: 3, view: [0, 9], questions: [
          choice('In a major key, the chord on degree 2 is…', ['Minor', 'Major', 'Diminished'], 'Minor', 'fact:ii-minor'),
          choice('Which chord is diminished in a major key?', ['The one on degree 7', 'The one on degree 4', 'The one on degree 6'], 'The one on degree 7', 'fact:vii-dim'),
          tap('Tap the root of the V chord in C (G) on the E string.', at('G', 4)),
          tap('From Lesson 5: tap the flat 7th of G7, F, on the D string.', at('F', 2), { item: toneItem(G7, 'b7') })
        ] }
      }
    },
    {
      id: 'b4-7', title: 'Hearing chord tones',
      review: ['toneear:R', 'toneear:3', 'toneear:5'],
      steps: {
        hear: { text: 'A C major chord, then the bass plays its root, its 3rd and its 5th.', sound: { seq: [null, 36, 40, 43, 36], bpm: 70, pad: 'C:major' } },
        learn: { cards: [S('l6-2.1', [0, 7]),
          { text: 'The root sounds settled and the 5th strong but open. The 3rd sounds sweeter, and it tells you major or minor.', board: { view: [0, 7], dots: Cmaj.dots([[3, 3], [2, 2], [2, 5]]) } },
          { text: 'Listen to how the bass note feels under the chord. Then name it.', board: { view: [0, 7], dots: Cmaj.dots([[3, 3], [2, 2], [2, 5]]) } }] },
        see: { text: 'Under C: root, 3rd, 5th, each held for two beats.', view: [0, 7], sequence: pos([[3, 3], null, [2, 2], null, [2, 5], null]), dots: Cmaj.dots([[3, 3], [2, 2], [2, 5]]), bpm: 80, link: { key: 'C', chord: 'major', labels: 'intervals' } },
        try: { view: [0, 7], tasks: [
          task('Tap the chord tone that sounds most settled under C: its root, on the A string.', at('C', 3)),
          task('Tap the 3rd of C, E, on the D string.', at('E', 2)),
          task('Tap the 5th of C, G, on the D string.', at('G', 2))
        ] },
        play: { text: 'Hold each chord tone of C for a bar over the chord: R, then 3, then 5. Listen to each one.', view: [0, 7], bpm: 70, follow: pos([[3, 3], [2, 2], [2, 5]]), beatsPerStep: 4, backing: { chords: ['C:major'] } },
        check: { pass: 3, view: [0, 7], questions: [
          toneQ('A C chord, then a bass note. Which chord tone is it?', 'C:major', 'C', 40, '3'),
          toneQ('A G chord, then a bass note. Which chord tone is it?', 'G:major', 'G', 43, 'R'),
          tap('Tap the 5th of C, G, on the D string.', at('G', 2)),
          tap('From Lesson 6: tap the root of the vi chord in C (Am) on the E string.', at('A', 4))
        ] }
      }
    }
  ],
  challenge: {
    id: 'b4-ch', title: 'Level 4 Challenge', challenge: true,
    flow: [
      { type: 'play', name: 'Arpeggios over a chart', text: 'Read the chart C – Am – F – G and play R 3 5 3 for each chord with the drums.', view: [0, 9], bpm: 75,
        follow: pos([[3, 3], [2, 2], [2, 5], [2, 2], [4, 5], [3, 3], [3, 7], [3, 3], [4, 1], [3, 0], [3, 3], [3, 0], [4, 3], [3, 2], [3, 5], [3, 2]]), backing: { chords: ['C:major', 'A:minor', 'F:major', 'G:major'] }, bpmKey: 'arps' },
      { type: 'check', name: 'Name the chord tone', pass: 8, view: [0, 7], questions: [
        toneQ('C chord: which tone is the bass?', 'C:major', 'C', 36, 'R'),
        toneQ('C chord: which tone is the bass?', 'C:major', 'C', 43, '5'),
        toneQ('A minor chord: which tone is the bass?', 'A:minor', 'Am', 36, '3'),
        toneQ('G chord: which tone is the bass?', 'G:major', 'G', 35, '3'),
        toneQ('F chord: which tone is the bass?', 'F:major', 'F', 41, 'R'),
        toneQ('F chord: which tone is the bass?', 'F:major', 'F', 36, '5'),
        toneQ('D minor chord: which tone is the bass?', 'D:minor', 'Dm', 41, '3'),
        toneQ('E minor chord: which tone is the bass?', 'E:minor', 'Em', 35, '5'),
        toneQ('A minor chord: which tone is the bass?', 'A:minor', 'Am', 33, 'R'),
        toneQ('G chord: which tone is the bass?', 'G:major', 'G', 38, '5')
      ] }
    ]
  },
  placement: [
    tap('Tap a major 3rd above G (G is on the E string, fret 3).', P(3, 2), { item: 'interval:M3' }),
    tap('Tap the flat 7th of G7, F, on the D string.', at('F', 2), { item: toneItem(G7, 'b7') }),
    choice('A minor triad is…', ['R b3 5', 'R 3 5', 'R b3 b5'], 'R b3 5', 'fact:minor-triad')
  ]
};
