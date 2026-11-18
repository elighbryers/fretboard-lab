// Bass Level 5: progressions and connecting chords (docs/research-bass.md E).
import { K, P, at, nd, task, tap, choice, S, seq } from './kit.js';

const pos = list => list.map(x => x && P(x[0], x[1]));
const A7 = K.inKey('A', 'chord', '7'), Ckey = K.inKey('C', 'scale', 'major'), Gkey = K.inKey('G', 'scale', 'major');
// R 3 5 6 b7 6 5 3 on A, D and E (the shuffle pattern from the play-along "Shuffle Blues in A").
const SH = { A: [[3, 0], [3, 4], [2, 2], [2, 4], [2, 5], [2, 4], [2, 2], [3, 4]], D: [[2, 0], [2, 4], [1, 2], [1, 4], [1, 5], [1, 4], [1, 2], [2, 4]], E: [[4, 0], [4, 4], [3, 2], [3, 4], [3, 5], [3, 4], [3, 2], [4, 4]] };
const progQ = (prompt, prog, options, answer, item) => choice(prompt, options, answer, item, { sound: { prog, per: 2, bpm: 100 } });

export default {
  id: 'bass-level-5',
  title: 'Progressions and connecting chords',
  lessons: [
    {
      id: 'b5-1', title: 'Roman numerals and Nashville numbers',
      steps: {
        hear: { text: 'C, F, G, C: the I, IV, V and I chords of C, roots in the bass.', sound: { prog: ['C:major', 'F:major', 'G:major', 'C:major'], per: 2, bpm: 90 } },
        learn: { cards: [
          { text: 'Number each chord by the scale degree of its root: I, ii, iii, IV, V, vi, vii°. Capitals are major, small letters minor.', board: { view: [0, 9], dots: Ckey.dots([[3, 3], [3, 5], [2, 2], [2, 3], [2, 5], [1, 2], [1, 4]], 'deg') } },
          { text: 'Nashville numbers say the same with plain numbers: 1, 4, 5. Bands use them to change key on the spot.', board: { view: [0, 9], dots: [Ckey.dot(3, 3), Ckey.dot(2, 3), Ckey.dot(2, 5)] } },
          { text: 'The same numbers in G give G, C and D. The shape on the neck stays the same.', board: { view: [0, 9], dots: [Gkey.dot(4, 3), Gkey.dot(3, 3), Gkey.dot(3, 5)] } }
        ] },
        see: { text: 'I IV V I in C, then in G: same pattern, two frets apart on the E and A strings.', view: [0, 9], sequence: pos([[3, 3], [4, 1], [4, 3], [3, 3], [4, 3], [3, 3], [3, 5], [4, 3]]), bpm: 70, link: { key: 'C', scale: 'major', labels: 'intervals' } },
        try: { view: [0, 9], tasks: [
          task('Tap the root of the IV chord in G (C) on the A string.', at('C', 3)),
          task('Tap the root of the V chord in G (D) on the A string.', at('D', 3)),
          task('Tap the root of the vi chord in G (E): the open E string.', P(4, 0))
        ] },
        play: { text: 'Play 1 4 5 1 in G, then in C, one chord per bar, roots in quarter notes.', view: [0, 9], bpm: 75, follow: pos([[4, 3], [3, 3], [3, 5], [4, 3], [3, 3], [4, 1], [4, 3], [3, 3]]), beatsPerStep: 4, backing: { chords: ['G:major', 'C:major', 'D:major', 'G:major', 'C:major', 'F:major', 'G:major', 'C:major'] } },
        check: { pass: 3, view: [0, 9], questions: [
          choice('In the key of D, what is the V chord?', ['A', 'G', 'E'], 'A', 'fact:d-major-v'),
          choice('"1 4 5" in Nashville numbers means…', ['I IV V', 'i iv v minor chords', 'Frets 1, 4 and 5'], 'I IV V', 'fact:nashville-145'),
          tap('Tap the root of the IV chord in C (F) on the E string.', at('F', 4)),
          tap('From Level 4: tap the root of the vi chord in C (Am) on the E string.', at('A', 4))
        ] }
      }
    },
    {
      id: 'b5-2', title: 'I–IV–V and the 12-bar blues',
      steps: {
        hear: { text: 'A 12-bar blues in A with a shuffle feel: A7, D7 and E7.', sound: { prog: ['A:7', 'A:7', 'D:7', 'A:7', 'E:7', 'D:7', 'A:7', 'E:7'], per: 2, bpm: 110 } },
        learn: { cards: [
          { text: 'The 12-bar blues uses I, IV and V, all as 7th chords: four bars of I, two of IV, two of I, then V IV I V.', board: { view: [0, 7], dots: [A7.dot(3, 0), nd(2, 0, { role: 'other' }), nd(4, 0, { role: 'other' })] } },
          { text: 'The shuffle swings the eighths: long-short, long-short, like a heartbeat.', board: { view: [0, 7], dots: A7.dots([[3, 0], [3, 4], [2, 2]]) } },
          { text: 'A classic blues line climbs R 3 5 6 b7 and back down.', board: { view: [0, 7], dots: [A7.dot(3, 0), A7.dot(3, 4), A7.dot(2, 2), P(2, 4, { label: '6' }), A7.dot(2, 5)] } }
        ] },
        see: { text: 'The R 3 5 6 b7 6 5 3 pattern on A7.', view: [0, 7], sequence: pos(SH.A), dots: [A7.dot(3, 0), A7.dot(3, 4), A7.dot(2, 2), P(2, 4, { label: '6' }), A7.dot(2, 5)], bpm: 140, link: { key: 'A', scale: 'mixolydian', labels: 'intervals' } },
        try: { view: [0, 7], tasks: [
          task('Tap the 6th of A, F#, on the D string.', at('F#', 2)),
          task('Tap the flat 7th of A7, G, on the D string.', at('G', 2)),
          task('Tap the root of the IV chord (D7): the open D string.', P(2, 0))
        ] },
        play: { text: 'Play the 12-bar blues in A with the shuffle pattern: same shape on A, D and E.', view: [0, 7], bpm: 80, groove: 'shuffle', follow: ['A', 'A', 'A', 'A', 'D', 'D', 'A', 'A', 'E', 'D', 'A', 'E'].flatMap(c => pos(SH[c]).filter((_, i) => i % 2 === 0)),
          backing: { chords: ['A:7', 'A:7', 'A:7', 'A:7', 'D:7', 'D:7', 'A:7', 'A:7', 'E:7', 'D:7', 'A:7', 'E:7'] } },
        check: { pass: 3, view: [0, 7], questions: [
          choice('How many bars of the I chord start a 12-bar blues?', ['4', '2', '8'], '4', 'fact:blues-first-four'),
          choice('Which chords make a 12-bar blues?', ['I, IV and V', 'I, ii and vi', 'I and V only'], 'I, IV and V', 'fact:blues-chords'),
          tap('Tap the 3rd of A7, C#, on the A string.', at('C#', 3)),
          tap('From Lesson 1: tap the root of the V chord in A (E): the open E string.', P(4, 0))
        ] }
      }
    },
    {
      id: 'b5-3', title: 'I–V–vi–IV',
      steps: {
        hear: { text: 'The most common pop progression: G, D, Em, C.', sound: { prog: ['G:major', 'D:major', 'E:minor', 'C:major'], per: 2, bpm: 90 } },
        learn: { cards: [
          { text: 'I–V–vi–IV is in countless songs. In G it is G, D, Em, C.', board: { view: [0, 7], dots: [Gkey.dot(4, 3), Gkey.dot(3, 5), Gkey.dot(4, 0), Gkey.dot(3, 3)] } },
          { text: 'Roots alone already tell the story. Try them in eighth notes, one chord per bar.', board: { view: [0, 7], dots: [Gkey.dot(4, 3, 'note'), Gkey.dot(3, 5, 'note'), Gkey.dot(4, 0, 'note'), Gkey.dot(3, 3, 'note')] } },
          { text: 'Start it on vi and the same four chords sound sadder: Em, C, G, D.', board: { view: [0, 7], dots: [Gkey.dot(4, 0, 'note'), Gkey.dot(3, 3, 'note'), Gkey.dot(4, 3, 'note'), Gkey.dot(3, 5, 'note')] } }
        ] },
        see: { text: 'Roots of G, D, Em and C.', view: [0, 7], sequence: pos([[4, 3], [4, 3], [3, 5], [3, 5], [4, 0], [4, 0], [3, 3], [3, 3]]), bpm: 80, link: { key: 'G', scale: 'major', labels: 'notes' } },
        try: { view: [0, 7], tasks: [
          task('Tap the root of the V chord in G (D) on the A string.', at('D', 3)),
          task('Tap the root of the vi chord in G (E): the open E string.', P(4, 0)),
          task('Tap the root of the IV chord in G (C) on the A string.', at('C', 3))
        ] },
        play: { text: 'Play I–V–vi–IV in G with roots in eighth notes; then try root-5th-octave on each chord.', view: [0, 7], bpm: 80, follow: pos([[4, 3], [3, 5], [4, 0], [3, 3]]), beatsPerStep: 4, backing: { chords: ['G:major', 'D:major', 'E:minor', 'C:major'] } },
        check: { pass: 3, view: [0, 7], questions: [
          choice('I–V–vi–IV in C is…', ['C G Am F', 'C F G C', 'C Am Dm G'], 'C G Am F', 'fact:pop-progression-c'),
          tap('In C, tap the root of the vi chord (Am) on the E string.', at('A', 4)),
          tap('In C, tap the root of the V chord (G) on the E string.', at('G', 4)),
          tap('From Lesson 2: tap the flat 7th of A7, G, on the D string.', at('G', 2))
        ] }
      }
    },
    {
      id: 'b5-4', title: 'Chromatic approach notes',
      steps: {
        hear: { text: 'C for three beats, then E, a half step below F, leads into F.', sound: { seq: pos([[3, 3], [3, 3], [3, 3], [4, 0], [4, 1]]), bpm: 90, drums: true } },
        learn: { cards: [
          { text: 'An approach note is a note just before the next chord\'s root. It leads the ear there.', board: { view: [0, 7], dots: [nd(4, 1, { role: 'root' }), P(4, 0, { label: '½', ring: true })] } },
          { text: 'The chromatic approach is a half step below or above the target, played on beat 4.', board: { view: [0, 7], dots: [nd(4, 1, { role: 'root' }), P(4, 0, { label: '½' }), P(4, 2, { label: '½' })] } },
          { text: 'Into G, come from F# below or G# above: one fret either side.', board: { view: [0, 7], dots: [nd(4, 3, { role: 'root' }), P(4, 2, { label: '½' }), P(4, 4, { label: '½' })] } }
        ] },
        see: { text: 'C to F with E as the approach, then F to G with F# leading in.', view: [0, 7], sequence: pos([[3, 3], [3, 3], [3, 3], [4, 0], [4, 1], [4, 1], [4, 1], [4, 2], [4, 3]]), bpm: 90, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [0, 7], tasks: [
          task('The next chord is G. Tap the approach a half step below it on the E string: F#.', at('F#', 4)),
          task('The next chord is C. Tap the approach a half step below it on the A string: B.', at('B', 3)),
          task('The next chord is A. Tap the approach a half step above it on the E string: Bb.', at('Bb', 4))
        ] },
        play: { text: 'C – F – G – C: three beats of root, then a half step into the next root on beat 4.', view: [0, 7], bpm: 75, follow: pos([[3, 3], [3, 3], [3, 3], [4, 0], [4, 1], [4, 1], [4, 1], [4, 2], [4, 3], [4, 3], [4, 3], [3, 2]]), backing: { chords: ['C:major', 'F:major', 'G:major'] } },
        check: { pass: 3, view: [0, 7], questions: [
          tap('Next chord: D. Tap the half step below it on the A string, C#.', at('C#', 3)),
          tap('Next chord: F. Tap the half step below it on the E string, E.', P(4, 0)),
          tap('From Lesson 3: in G, tap the root of the IV chord (C) on the A string.', at('C', 3)),
          choice('On which beat does an approach note usually go?', ['Beat 4, just before the change', 'Beat 1', 'Beat 2'], 'Beat 4, just before the change', 'fact:approach-beat-4')
        ] }
      }
    },
    {
      id: 'b5-5', title: 'Dominant and scale approaches',
      steps: {
        hear: { text: 'Into C three ways: from B (half step), from G (its 5th), and from D (a scale step).', sound: seq(pos([[3, 2], [3, 3], null, [4, 3], [3, 3], null, [3, 5], [3, 3]]), 90) },
        learn: { cards: [
          { text: 'Dominant approach: play the target\'s 5th just before it. Into C, play G.', board: { view: [0, 7], dots: [nd(3, 3, { role: 'root' }), nd(4, 3, { role: 'fifth', label: 'V' }), nd(2, 5, { role: 'fifth', label: 'V' })] } },
          { text: 'Scale approach: step into the root from the scale note above or below it. Into C, from D or B.', board: { view: [0, 7], dots: [nd(3, 3, { role: 'root' }), nd(3, 5), nd(3, 2)] } },
          { text: 'Mix them: half steps sound smooth, the 5th sounds strong, scale steps sound natural.', board: { view: [0, 7], dots: [nd(3, 3, { role: 'root' }), nd(3, 2), nd(4, 3, { role: 'fifth', label: 'V' }), nd(3, 5)] } }
        ] },
        see: { text: 'G – C with each approach on beat 4.', view: [0, 7], sequence: pos([[4, 3], [4, 3], [4, 3], [3, 2], [3, 3], [3, 3], [3, 3], [4, 2], [4, 3], [4, 3], [4, 3], [4, 3], [3, 3]]), bpm: 90, link: { key: 'C', scale: 'major', labels: 'notes' } },
        try: { view: [0, 7], tasks: [
          task('Dominant approach into C: tap its 5th, G, on the E string.', at('G', 4)),
          task('Scale approach into C from above: tap D on the A string.', at('D', 3)),
          task('Dominant approach into G: tap its 5th, D, on the A string.', at('D', 3))
        ] },
        play: { text: 'Over C – Am – F – G, approach each change a different way on beat 4.', view: [0, 7], bpm: 75, follow: [at('C', 3), at('A', 4), at('F', 4), at('G', 4)], beatsPerStep: 4, backing: { chords: ['C:major', 'A:minor', 'F:major', 'G:major'] } },
        check: { pass: 3, view: [0, 7], questions: [
          choice('A dominant approach into F is…', ['C, the 5th of F', 'E, a half step below', 'G, a scale step above'], 'C, the 5th of F', 'fact:dominant-approach'),
          tap('Dominant approach into D: tap its 5th, A, on the E string.', at('A', 4)),
          tap('Scale approach into G from below: tap F# on the E string.', at('F#', 4)),
          tap('From Lesson 4: next chord C. Tap the half step below it on the A string, B.', at('B', 3))
        ] }
      }
    },
    {
      id: 'b5-6', title: 'Hearing progressions: follow the bass',
      steps: {
        hear: { text: 'Two progressions in C. Follow the bass notes: they tell you the chords.', sound: { prog: ['C:major', 'F:major', 'G:major', 'C:major', 'C:major', 'G:major', 'A:minor', 'F:major'], per: 2, bpm: 100 } },
        learn: { cards: [
          { text: 'To hear a progression, follow the bass. Each root is a step on the scale you already know.', board: { view: [0, 9], dots: Ckey.dots([[3, 3], [4, 1], [4, 3], [4, 5]], 'deg') } },
          { text: 'Going home to I sounds like an ending. V wants to go to I; IV feels like stepping out.', board: { view: [0, 9], dots: [Ckey.dot(3, 3), Ckey.dot(4, 3), Ckey.dot(4, 1)] } },
          { text: 'A minor vi sounds darker. If the mood dips, look for vi.', board: { view: [0, 9], dots: [Ckey.dot(3, 3), Ckey.dot(4, 5)] } }
        ] },
        see: { text: 'I–IV–V–I, then I–V–vi–IV, roots lit as they sound.', view: [0, 9], sequence: pos([[3, 3], [4, 1], [4, 3], [3, 3], [3, 3], [4, 3], [4, 5], [4, 1]]), bpm: 70, link: { key: 'C', scale: 'major', labels: 'intervals' } },
        try: { view: [0, 9], tasks: [
          task('The bass moves from C up to F. Tap F on the E string.', at('F', 4)),
          task('Then it goes to G, the V. Tap G on the E string.', at('G', 4)),
          task('The mood dips: the vi chord. Tap its root on the E string.', at('A', 4))
        ] },
        play: { text: 'Play along with I–V–vi–IV in C using roots, then switch to I–IV–V–I by ear.', view: [0, 9], bpm: 80, follow: [at('C', 3), at('G', 4), at('A', 4), at('F', 4)], beatsPerStep: 4, backing: { chords: ['C:major', 'G:major', 'A:minor', 'F:major'] } },
        check: { pass: 3, view: [0, 9], questions: [
          progQ('Which progression is this?', ['C:major', 'F:major', 'G:major', 'C:major'], ['I–IV–V–I', 'I–V–vi–IV', 'I–vi–IV–V'], 'I–IV–V–I', 'fact:hear-1451'),
          progQ('And this one?', ['C:major', 'G:major', 'A:minor', 'F:major'], ['I–V–vi–IV', 'I–IV–V–I', 'ii–V–I–I'], 'I–V–vi–IV', 'fact:hear-15-6-4'),
          tap('Tap the root of the IV chord in C (F) on the E string.', at('F', 4)),
          tap('From Lesson 5: dominant approach into C. Tap its 5th, G, on the E string.', at('G', 4))
        ] }
      }
    },
    {
      id: 'b5-7', title: 'Song form on a chart',
      steps: {
        hear: { text: 'A verse on I–IV and a chorus on IV–V–I: the bass changes energy with the section.', sound: { prog: ['G:major', 'C:major', 'G:major', 'C:major', 'C:major', 'D:major', 'G:major', 'G:major'], per: 2, bpm: 100 } },
        learn: { cards: [
          { text: 'Songs are built from sections: verse, chorus and sometimes a bridge. Charts mark them with letters or names.', board: { view: [0, 7], dots: [Gkey.dot(4, 3), Gkey.dot(3, 3), Gkey.dot(3, 5)] } },
          { text: 'Sections are usually 4 or 8 bars. Count bars so you know when the next section starts.', board: { view: [0, 7], dots: [Gkey.dot(4, 3), Gkey.dot(3, 3)] } },
          { text: 'Play simpler in the verse and push more in the chorus, like eighths instead of quarters.', board: { view: [0, 7], dots: [Gkey.dot(4, 3), Gkey.dot(3, 5)] } }
        ] },
        see: { text: 'Verse (G C G C), then chorus (C D G G): roots lit.', view: [0, 7], sequence: pos([[4, 3], [3, 3], [4, 3], [3, 3], [3, 3], [3, 5], [4, 3], [4, 3]]), bpm: 70, link: { key: 'G', scale: 'major', labels: 'notes' } },
        try: { view: [0, 7], tasks: [
          task('The chorus starts on C. Tap its root on the A string.', at('C', 3)),
          task('Then D, the V. Tap D on the A string.', at('D', 3)),
          task('The chorus lands on G. Tap G on the E string.', at('G', 4))
        ] },
        play: { text: 'Play the verse in quarter notes and the chorus in eighth notes. Count the bars: 4 + 4.', view: [0, 7], bpm: 80, follow: [at('G', 4), at('C', 3), at('G', 4), at('C', 3), at('C', 3), at('D', 3), at('G', 4), at('G', 4)], beatsPerStep: 4, backing: { chords: ['G:major', 'C:major', 'G:major', 'C:major', 'C:major', 'D:major', 'G:major', 'G:major'] } },
        check: { pass: 3, view: [0, 7], questions: [
          choice('Song sections are usually how long?', ['4 or 8 bars', '1 or 2 bars', '13 bars'], '4 or 8 bars', 'fact:section-length'),
          choice('The part of a song that repeats with the same words is the…', ['Chorus', 'Verse', 'Intro'], 'Chorus', 'fact:chorus'),
          tap('Tap the root of D on the A string.', at('D', 3)),
          tap('From Lesson 6: tap the root of the vi chord in C on the E string.', at('A', 4))
        ] }
      }
    }
  ],
  challenge: {
    id: 'b5-ch', title: 'Level 5 Challenge', challenge: true,
    flow: [
      { type: 'play', name: '12-bar shuffle', text: 'Play a 12-bar blues in A with the shuffle groove: R 3 5 6 b7 patterns, and an approach note into each chord change.', view: [0, 7], bpm: 80, groove: 'shuffle',
        follow: ['A', 'A', 'A', 'A', 'D', 'D', 'A', 'A', 'E', 'D', 'A', 'E'].flatMap(c => pos(SH[c]).filter((_, i) => i % 2 === 0)),
        backing: { chords: ['A:7', 'A:7', 'A:7', 'A:7', 'D:7', 'D:7', 'A:7', 'A:7', 'E:7', 'D:7', 'A:7', 'E:7'] }, bpmKey: 'blues' },
      { type: 'check', name: 'By ear', pass: 3, view: [0, 7], questions: [
        progQ('Pick the progression you hear.', ['G:major', 'E:minor', 'C:major', 'D:major'], ['I–vi–IV–V', 'I–IV–V–I', 'I–V–vi–IV'], 'I–vi–IV–V', 'fact:hear-16-4-5'),
        progQ('And this one?', ['G:major', 'C:major', 'D:major', 'G:major'], ['I–IV–V–I', 'I–vi–IV–V', 'ii–V–I–I'], 'I–IV–V–I', 'fact:hear-1451'),
        tap('Next chord: A. Tap the half step below it on the E string, G#.', at('G#', 4)),
        tap('Tap the 6th of A, F#, on the D string.', at('F#', 2))
      ] }
    ]
  },
  placement: [
    choice('In the key of D, what is the V chord?', ['A', 'G', 'E'], 'A', 'fact:d-major-v'),
    tap('Next chord: G. Tap the half step below it on the E string, F#.', at('F#', 4)),
    choice('Which chords make a 12-bar blues?', ['I, IV and V', 'I, ii and vi', 'I and V only'], 'I, IV and V', 'fact:blues-chords')
  ]
};
export const _S = S;
