// Level 6: improvising. Labels come from js/lessons/kit.js (a dot outside its
// scale or chord throws); backing tracks from js/progressions.js numerals.
import { P, inKey, tap, choice, task, degreeItem, toneItem } from './kit.js';
import { TWELVE_BAR } from '../progressions.js';

const Amp = inKey('A', 'scale', 'minor-pentatonic'), Abl = inKey('A', 'scale', 'blues');
const Ador = inKey('A', 'scale', 'dorian'), Amix = inKey('A', 'scale', 'mixolydian'), Ac = inKey('A', 'scale', 'chromatic');
const Cs = inKey('C', 'scale', 'major');
const chord = (k, id) => inKey(k, 'chord', id);
const Am = chord('A', 'minor'), Cmaj = chord('C', 'major'), A7 = chord('A', '7'), D7 = chord('D', '7'), E7 = chord('E', '7');
const Dm7 = chord('D', 'm7'), G7 = chord('G', '7'), Cmaj7 = chord('C', 'maj7');

// A minor pentatonic, five positions up the neck (5 is the same shape an octave down, frets 2-5).
const POS = {
  1: [[6, 5], [6, 8], [5, 5], [5, 7], [4, 5], [4, 7], [3, 5], [3, 7], [2, 5], [2, 8], [1, 5], [1, 8]],
  2: [[6, 8], [6, 10], [5, 7], [5, 10], [4, 7], [4, 10], [3, 7], [3, 9], [2, 8], [2, 10], [1, 8], [1, 10]],
  3: [[6, 10], [6, 12], [5, 10], [5, 12], [4, 10], [4, 12], [3, 9], [3, 12], [2, 10], [2, 13], [1, 10], [1, 12]],
  4: [[6, 12], [6, 15], [5, 12], [5, 15], [4, 12], [4, 14], [3, 12], [3, 14], [2, 13], [2, 15], [1, 12], [1, 15]],
  5: [[6, 3], [6, 5], [5, 3], [5, 5], [4, 2], [4, 5], [3, 2], [3, 5], [2, 3], [2, 5], [1, 3], [1, 5]]
};
const BLUES1 = [[6, 5], [6, 8], [5, 5], [5, 6], [5, 7], [4, 5], [4, 7], [3, 5], [3, 7], [3, 8], [2, 5], [2, 8], [1, 5], [1, 8]];
const AM_E_SHAPE = [[6, 5], [5, 7], [4, 7], [3, 5], [2, 5], [1, 5]];
const DORIAN = [[6, 5], [6, 7], [6, 8], [5, 5], [5, 7], [5, 9], [4, 5], [4, 7]];
const MIXO = [[6, 5], [6, 7], [5, 4], [5, 5], [5, 7], [4, 4], [4, 5], [4, 7]];
const CALL = [[3, 5], [3, 7], [2, 5], [3, 7]], RESPONSE = [[3, 5], [3, 7], [2, 5], [2, 8], [1, 5]];
const ps = list => list.map(([s, f]) => (s == null ? null : P(s, f)));
const upDown = list => [...list, ...list.slice(0, -1).reverse()];
const pos = (n, k = Amp) => k.dots(POS[n]);
const view = n => ({ 1: [4, 9], 2: [6, 11], 3: [8, 14], 4: [11, 15], 5: [1, 6] })[n];
const spotsIn = (k, label, [from, to]) => k.spots(label, { from, to });
const degQ = (k, label, v, prompt, mk = tap, extra = {}) => mk(prompt, spotsIn(k, label, v), { item: degreeItem(k, label), view: v, ...extra });
const toneQ = (k, label, v, prompt, mk = tap, extra = {}) => mk(prompt, spotsIn(k, label, v), { item: toneItem(k, label), view: v, ...extra });

export default {
  id: 'level-6',
  title: 'Improvising',
  lessons: [
    {
      id: 'l6-1',
      title: 'The minor pentatonic in five positions',
      review: ['R', 'b3', '4', '5', 'b7'].map(l => degreeItem(Amp, l)),
      steps: {
        hear: { text: 'A minor pentatonic, position 1: the sound of a thousand rock solos.', sound: { seq: ps(POS[1]), bpm: 110 } },
        learn: {
          cards: [
            { text: 'The minor pentatonic has five notes: 1 b3 4 5 b7. Position 1 in A sits at frets 5 to 8.', board: { view: [3, 10], dots: pos(1) } },
            { text: 'Four more positions join it up the neck, each starting where the last one ends.', board: { view: [3, 13], dots: [...pos(1), ...Amp.dots(POS[2].filter(([s, f]) => !POS[1].some(([a, b]) => a === s && b === f)))] } },
            { text: 'Each position wraps around a shape of the A minor chord. Position 1 holds the E-shape Am.', board: { view: [3, 10], dots: Am.dots(AM_E_SHAPE) } }
          ]
        },
        see: { text: 'Position 1, up and down.', view: [3, 10], sequence: Amp.dots(upDown(POS[1])), bpm: 120, link: { key: 'A', scale: 'minor-pentatonic', labels: 'intervals', pos: '5-8' } },
        try: {
          view: [4, 9],
          tasks: [
            degQ(Amp, 'b3', view(1), 'In position 1, tap the b3.', task, { explain: 'Yes! The b3 of A minor pentatonic is C.' }),
            degQ(Amp, 'b7', view(1), 'In position 1, tap the b7.', task, { explain: 'Yes! The b7 is G.' }),
            degQ(Amp, 'R', view(2), 'Now position 2 (frets 7 to 10): tap a root.', task, { explain: 'Yes! A.', dots: [] })
          ]
        },
        play: {
          text: 'Play position 1 up and down, then improvise with it over the A drone for 45 seconds. Start and end on A.',
          view: [3, 10], bpm: 70, drone: 'A', seconds: 45, follow: ps(upDown(POS[1]))
        },
        check: {
          pass: 3, view: [4, 9],
          questions: [
            degQ(Amp, '4', view(1), 'In position 1, tap the 4th.'),
            degQ(Amp, '5', view(2), 'In position 2 (frets 7 to 10), tap the 5th.'),
            choice('Which degrees make the minor pentatonic?', ['1 b3 4 5 b7', '1 2 3 5 6', '1 b3 5 b7'], '1 b3 4 5 b7', 'fact:minor-pent-degrees'),
            degQ(Amp, 'R', view(5), 'In position 5 (frets 2 to 5), tap a root.')
          ]
        }
      }
    },
    {
      id: 'l6-2',
      title: 'Aiming for chord tones',
      review: [toneItem(Am, 'b3'), toneItem(Am, '5'), toneItem(Cmaj, 'R'), toneItem(Cmaj, '3'), toneItem(Cmaj, '5'), 'fact:chord-tone'],
      steps: {
        hear: { text: 'Am, then C. A line that lands on A over Am, then on C when the chord changes.', sound: { seq: ['A:minor', P(2, 5), P(1, 5), 'C:major', P(1, 8), null], bpm: 70 } },
        learn: {
          cards: [
            { text: 'Chord tones are the notes of the chord that is playing. Landing on one makes your line sound connected.', board: { view: [3, 10], dots: Am.all({ from: 5, to: 8 }) } },
            { text: 'When the chord changes, aim for a note of the new chord. Over C, aim for C, E or G.', board: { view: [3, 10], dots: Cmaj.all({ from: 5, to: 8 }) } },
            { text: 'Notes in both chords, here C and E, are safe bridges across the change.', board: { view: [3, 10], dots: Amp.all({ from: 5, to: 8, mode: 'note' }).filter(d => ['C', 'E'].includes(d.label)) } }
          ]
        },
        see: { text: 'Position 1: the Am chord tones light, then the C chord tones.', view: [3, 10], sequence: [ps(Am.all({ from: 5, to: 8 }).map(d => [d.string, d.fret])), ps(Cmaj.all({ from: 5, to: 8 }).map(d => [d.string, d.fret]))], dots: pos(1), bpm: 40, link: { key: 'A', scale: 'minor-pentatonic', labels: 'intervals', pos: '5-8' } },
        try: {
          view: [4, 9],
          tasks: [
            toneQ(Am, 'b3', view(1), 'The chord is Am. Tap its 3rd (b3) in position 1.', task, { explain: 'Yes! C is the b3 of Am.' }),
            toneQ(Cmaj, 'R', view(1), 'The chord changes to C. Tap its root.', task, { explain: 'Yes! C.' }),
            toneQ(Cmaj, '5', view(1), 'Tap the 5th of C.', task, { explain: 'Yes! G is the 5th of C.' })
          ]
        },
        play: {
          text: 'Improvise over Am and C for 60 seconds with position 1. As each chord arrives, land on one of its notes.',
          view: [3, 10], bpm: 80, seconds: 60, backing: { key: 'C', progression: ['vi', 'vi', 'I', 'I'], keys: ['C', 'G', 'D'] }, dots: pos(1)
        },
        check: {
          pass: 3, view: [4, 9],
          questions: [
            toneQ(Am, '5', view(1), 'Tap the 5th of Am.'),
            toneQ(Cmaj, '3', view(1), 'Tap the 3rd of C.'),
            choice('What is a chord tone?', ['A note of the chord that is playing', 'Any note of the scale', 'The highest note'], 'A note of the chord that is playing', 'fact:chord-tone'),
            degQ(Amp, 'b7', view(1), 'From Lesson 1: in position 1, tap the b7.')
          ]
        }
      }
    },
    {
      id: 'l6-3',
      title: 'Phrasing: call, response and space',
      review: ['fact:phrasing-space', 'fact:call-response'],
      steps: {
        hear: { text: 'A short call, a pause, then an answer that ends on the root.', sound: { seq: [...ps(CALL), null, null, ...ps(RESPONSE)], bpm: 100 } },
        learn: {
          cards: [
            { text: 'A phrase is a short musical sentence. Leave space between phrases, like taking a breath.', board: { view: [3, 10], dots: Amp.dots(CALL) } },
            { text: 'Call and response: play a phrase, then answer it with a similar one that ends somewhere new.', board: { view: [3, 10], dots: Amp.dots(RESPONSE) } },
            { text: 'Repeat a good idea two or three times before changing it. Repetition makes a solo stick.', board: { view: [3, 10], dots: Amp.dots(CALL) } }
          ]
        },
        see: { text: 'The call, then the response.', view: [3, 10], sequence: [...Amp.dots(CALL), null, ...Amp.dots(RESPONSE)], dots: pos(1), bpm: 90, link: { key: 'A', scale: 'minor-pentatonic', labels: 'intervals', pos: '5-8' } },
        try: {
          view: [4, 9],
          tasks: [
            degQ(Amp, 'R', view(1), 'This call ends on D. Answer it: tap a root to finish your phrase.', task, { dots: Amp.dots(CALL), explain: 'Yes! Ending on A sounds like a full stop.' }),
            degQ(Amp, 'b3', view(1), 'Tap the b3, another strong note to end on.', task, { explain: 'Yes! C.' }),
            degQ(Amp, '5', view(1), 'Tap the 5th, a strong but open ending.', task, { explain: 'Yes! E.' })
          ]
        },
        play: {
          text: 'Over the A drone: play a short call, rest for the same length, then answer it. Keep trading for 60 seconds. Space is part of the music.',
          view: [3, 10], bpm: 80, drone: 'A', seconds: 60, dots: pos(1)
        },
        check: {
          pass: 3, view: [4, 9],
          questions: [
            choice('What does leaving space between phrases do?', ['Gives the solo room to breathe', 'Makes it faster', 'Changes the key'], 'Gives the solo room to breathe', 'fact:phrasing-space'),
            choice('In call and response, the response...', ['answers the call with a similar phrase', 'repeats it exactly, louder', 'is always faster'], 'answers the call with a similar phrase', 'fact:call-response'),
            degQ(Amp, 'R', view(2), 'In position 2, tap a root to end a phrase.'),
            toneQ(Cmaj, '3', view(1), 'From Lesson 2: tap the 3rd of C.')
          ]
        }
      }
    },
    {
      id: 'l6-4',
      title: 'Bends, slides and vibrato',
      review: ['fact:vibrato'],
      steps: {
        hear: { text: 'A slide from C to D, then the two notes a bend joins: D and the E it reaches.', sound: { seq: [P(3, 5), P(3, 6), P(3, 7), null, P(3, 7), P(3, 9)], bpm: 160 } },
        learn: {
          cards: [
            { text: 'A bend pushes the string sideways to raise the pitch. Bend the D at fret 7 up until it sounds like the E two frets higher.', board: { view: [3, 10], dots: Amp.dots([[3, 7], [3, 9]]) } },
            { text: 'A slide moves between frets without lifting your finger. Try fret 5 to 7 on the G string.', board: { view: [3, 10], dots: Amp.dots([[3, 5], [3, 7]]) } },
            { text: 'Vibrato is a small, steady wobble on a held note. Use it on the last note of a phrase.', board: { view: [3, 10], dots: Amp.dots([[1, 5]]) } }
          ]
        },
        see: { text: 'The bend target, then the slide.', view: [3, 10], sequence: Amp.dots([[3, 7], [3, 9], [3, 5], [3, 7]]), bpm: 70, link: { key: 'A', scale: 'minor-pentatonic', labels: 'intervals', pos: '5-8' } },
        try: {
          view: [4, 10],
          tasks: [
            task('Tap the note a whole-step bend from this D should reach.', P(3, 9), { dots: Amp.dots([[3, 7]]), item: degreeItem(Amp, '5'), explain: 'Yes! Two frets up: E.' }),
            task('Tap the target of a whole-step bend from this G.', P(2, 10), { dots: Amp.dots([[2, 8]]), item: degreeItem(Amp, 'R'), explain: 'Yes! G bends up to A, the root.' }),
            task('Slide up from this C to the next note of the scale.', P(3, 7), { dots: Amp.dots([[3, 5]]), item: degreeItem(Amp, '4'), explain: 'Yes! C slides up to D.' })
          ]
        },
        play: {
          text: 'Bend practice over the A drone: play the E at fret 9, then bend the D at fret 7 until it matches. Then improvise with bends and slides for 60 seconds.',
          view: [3, 10], bpm: 60, drone: 'A', seconds: 60, follow: [P(3, 9), P(3, 7), P(3, 9), P(3, 7)]
        },
        check: {
          pass: 3, view: [4, 10],
          questions: [
            tap('Tap the target of a whole-step bend from this D.', P(3, 9), { dots: Amp.dots([[3, 7]]), item: degreeItem(Amp, '5') }),
            tap('Tap the target of a whole-step bend from this G.', P(2, 10), { dots: Amp.dots([[2, 8]]), item: degreeItem(Amp, 'R') }),
            choice('Vibrato is...', ['a small, steady wobble on a held note', 'a fast run of notes', 'a muted strum'], 'a small, steady wobble on a held note', 'fact:vibrato'),
            degQ(Amp, 'b3', view(1), 'From Lesson 3: in position 1, tap the b3.')
          ]
        }
      }
    },
    {
      id: 'l6-5',
      title: 'The blues sound: b3, b5 and b7',
      review: [degreeItem(Abl, 'b5'), degreeItem(Abl, 'b3'), degreeItem(Abl, 'b7'), toneItem(A7, '3'), 'fact:blues-b5'],
      steps: {
        hear: { text: 'The A blues scale: the minor pentatonic plus one extra, gritty note.', sound: { seq: ps(BLUES1), bpm: 110 } },
        learn: {
          cards: [
            { text: 'Add the b5 to the minor pentatonic and you have the blues scale.', board: { view: [3, 10], dots: Abl.dots(BLUES1) } },
            { text: 'Over A7, the b3 (C) rubs against the chord\'s own 3rd (C#). That rub is the blues.', board: { view: [3, 10], dots: Ac.dots([[3, 5], [3, 6]]) } },
            { text: 'The b7 (G) is also in A7, so it always sounds at home over the blues.', board: { view: [3, 10], dots: Abl.dots([[4, 5], [2, 8]]) } }
          ]
        },
        see: { text: 'The A blues scale in position 1.', view: [3, 10], sequence: Abl.dots(upDown(BLUES1)), bpm: 130, link: { key: 'A', scale: 'blues', labels: 'intervals', pos: '5-8' } },
        try: {
          view: [4, 9],
          tasks: [
            degQ(Abl, 'b5', view(1), 'Tap the b5 of the A blues scale.', task, { explain: 'Yes! Eb, the blue note.' }),
            degQ(Abl, 'b3', view(1), 'Tap the b3.', task, { explain: 'Yes! C.' }),
            toneQ(A7, '3', view(1), 'Bend the b3 a little toward the chord\'s 3rd. Tap the 3rd of A7.', task, { explain: 'Yes! C#. Bending C slightly sharp hints at it.' })
          ]
        },
        play: {
          text: 'A 12-bar blues in A. Improvise for 60 seconds with the blues scale. Bend the b3 a little, and land on the b7 or the root.',
          view: [3, 10], bpm: 80, seconds: 60, backing: { key: 'A', progression: TWELVE_BAR, keys: ['A', 'E', 'G'] }, dots: Abl.dots(BLUES1)
        },
        check: {
          pass: 3, view: [4, 9],
          questions: [
            choice('Which note turns the minor pentatonic into the blues scale?', ['b5', '2', '6'], 'b5', 'fact:blues-b5'),
            degQ(Abl, 'b7', view(1), 'Tap the b7 of the A blues scale.'),
            degQ(Abl, 'b5', view(1), 'Tap the b5.'),
            tap('From Lesson 4: tap the target of a whole-step bend from this D.', P(3, 9), { dots: Amp.dots([[3, 7]]), item: degreeItem(Amp, '5'), view: [4, 10] })
          ]
        }
      }
    },
    {
      id: 'l6-6',
      title: 'Modes: Dorian and Mixolydian',
      review: [degreeItem(Ador, '6'), degreeItem(Ador, 'b3'), degreeItem(Amix, '3'), degreeItem(Amix, 'b7'), 'fact:mixo-dom7', 'fact:dorian-6'],
      steps: {
        hear: { text: 'A Dorian over an A drone: minor, but with a hopeful lift.', sound: { seq: ps(DORIAN), bpm: 90, drone: 'A' } },
        learn: {
          cards: [
            { text: 'A mode is a major scale started on a different note. Dorian is minor with a bright 6th: 1 2 b3 4 5 6 b7.', board: { view: [3, 10], dots: Ador.dots(DORIAN) } },
            { text: 'Mixolydian is major with a b7: 1 2 3 4 5 6 b7. It is the sound of a dominant 7 chord.', board: { view: [3, 10], dots: Amix.dots(MIXO) } },
            { text: 'Use Dorian over a minor 7 chord and Mixolydian over a dominant 7. The 6 and the 3 make the difference.', board: { view: [3, 10], dots: [Ador.dot(4, 4), Amix.dot(5, 4)] } }
          ]
        },
        see: { text: 'A Dorian over the drone. Listen for the 6th, F#.', view: [3, 10], sequence: Ador.dots(DORIAN), bpm: 80, drone: 'A', link: { key: 'A', scale: 'dorian', labels: 'intervals', pos: '4-9' } },
        try: {
          view: [3, 10],
          tasks: [
            degQ(Ador, '6', [3, 10], 'Tap the 6 of A Dorian.', task, { dots: [Ador.dot(6, 5)], explain: 'Yes! F#, the note that makes Dorian.' }),
            degQ(Amix, '3', [3, 10], 'Tap the 3 of A Mixolydian.', task, { dots: [Amix.dot(6, 5)], explain: 'Yes! C#, the major 3rd.' }),
            degQ(Amix, 'b7', [3, 10], 'Tap the b7 of A Mixolydian.', task, { dots: [Amix.dot(6, 5)], explain: 'Yes! G.' })
          ]
        },
        play: {
          text: 'The backing track vamps Am7 to D7: a Dorian groove. Improvise for 60 seconds with A Dorian, and lean on the F#.',
          view: [3, 10], bpm: 90, seconds: 60, backing: { key: 'G', progression: ['ii7', 'V7'] }, dots: Ador.dots(DORIAN)
        },
        check: {
          pass: 3, view: [3, 10],
          questions: [
            choice('Which mode fits a dominant 7 chord?', ['Mixolydian', 'Dorian', 'Major'], 'Mixolydian', 'fact:mixo-dom7'),
            choice('Dorian is natural minor with a...', ['major 6th', 'major 3rd', 'flat 2nd'], 'major 6th', 'fact:dorian-6'),
            degQ(Ador, 'b3', [3, 10], 'Tap the b3 of A Dorian.', tap, { dots: [Ador.dot(6, 5)] }),
            degQ(Abl, 'b5', view(1), 'From Lesson 5: tap the b5 of the A blues scale.')
          ]
        }
      }
    },
    {
      id: 'l6-7',
      title: 'Soloing over a ii-V-I',
      review: [toneItem(Dm7, 'b3'), toneItem(G7, '3'), toneItem(Cmaj7, '3'), toneItem(G7, 'b7'), toneItem(Cmaj7, '7'), 'fact:aim-thirds'],
      steps: {
        hear: { text: 'Dm7, G7, Cmaj7, and a melody made only of each chord\'s 3rd: F, B, E.', sound: { seq: ['D:m7', P(4, 3), 'G:7', P(3, 4), 'C:maj7', P(2, 5)], bpm: 60 } },
        learn: {
          cards: [
            { text: 'Over ii-V-I, aim for each chord\'s 3rd. In C that is F over Dm7, B over G7 and E over Cmaj7.', board: { view: [1, 7], dots: [Dm7.dot(4, 3), G7.dot(3, 4), Cmaj7.dot(2, 5)] } },
            { text: 'The 3rds sit a fret or two apart. Join them and you have a line that spells out the changes.', board: { view: [1, 7], dots: [Dm7.dot(4, 3, 'note'), G7.dot(3, 4, 'note'), Cmaj7.dot(2, 5, 'note')] } },
            { text: 'Fill the gaps with the C major scale. It fits all three chords.', board: { view: [1, 7], dots: Cs.all({ from: 2, to: 5 }) } }
          ]
        },
        see: { text: 'The three 3rds, one per chord.', view: [1, 7], sequence: [Dm7.dot(4, 3), G7.dot(3, 4), Cmaj7.dot(2, 5)], dots: Cs.all({ from: 2, to: 5 }), bpm: 50, link: { key: 'C', scale: 'major', labels: 'intervals', pos: '2-5' } },
        try: {
          view: [2, 5],
          tasks: [
            toneQ(Dm7, 'b3', [2, 5], 'Tap the 3rd (b3) of Dm7.', task, { explain: 'Yes! F.' }),
            toneQ(G7, '3', [2, 5], 'Tap the 3rd of G7.', task, { explain: 'Yes! B.' }),
            toneQ(Cmaj7, '3', [2, 5], 'Tap the 3rd of Cmaj7.', task, { explain: 'Yes! E.' })
          ]
        },
        play: {
          text: 'ii-V-I in C with the backing track. Improvise for 60 seconds: hit the 3rd of each chord as it arrives, and fill in with C major.',
          view: [1, 7], bpm: 80, seconds: 60, backing: { key: 'C', progression: ['ii7', 'V7', 'Imaj7', 'Imaj7'], keys: ['C', 'G', 'F'] }, dots: Cs.all({ from: 2, to: 5 })
        },
        check: {
          pass: 3, view: [2, 5],
          questions: [
            toneQ(G7, 'b7', [2, 5], 'Tap the b7 of G7.'),
            toneQ(Cmaj7, '7', [2, 5], 'Tap the 7th of Cmaj7.'),
            choice('Over a ii-V-I, which chord tone shows each change most clearly?', ['The 3rd', 'The root', 'The 5th'], 'The 3rd', 'fact:aim-thirds'),
            degQ(Ador, '6', [3, 10], 'From Lesson 6: tap the 6 of A Dorian.', tap, { dots: [Ador.dot(6, 5)] })
          ]
        }
      }
    }
  ],
  challenge: {
    id: 'l6-challenge', title: 'Level 6 Challenge', challenge: true,
    flow: [
      {
        type: 'learn', name: 'How it works',
        cards: [
          { text: 'Improvise a 12-bar blues chorus in A with the backing track. Land on a chord tone each time the chord changes.', board: { view: [3, 10], dots: Abl.dots(BLUES1) } },
          { text: 'If you like, record yourself and log it in Practice. Then finish by finding the chord tones.', board: { view: [3, 10], dots: [A7.dot(5, 4), D7.dot(4, 4), E7.dot(6, 4)] } }
        ]
      },
      {
        type: 'play', name: 'Blues chorus',
        text: 'A 12-bar blues in A: A7, D7, E7. Improvise for 60 seconds (about two choruses). On each new chord, land on its root or 3rd: C# over A7, F# over D7, G# over E7.',
        view: [3, 10], bpm: 90, seconds: 60, backing: { key: 'A', progression: TWELVE_BAR, keys: ['A', 'E', 'G'] }, dots: Abl.dots(BLUES1)
      },
      {
        type: 'check', name: 'Check it', pass: 3, view: [4, 9],
        questions: [
          toneQ(A7, '3', view(1), 'The chord is A7. Tap its 3rd.'),
          toneQ(D7, '3', view(1), 'The chord changes to D7. Tap its 3rd.'),
          toneQ(E7, '3', view(1), 'Now E7. Tap its 3rd.'),
          toneQ(A7, 'b7', view(1), 'Back to A7. Tap its b7.')
        ]
      }
    ]
  },
  placement: [
    degQ(Amp, 'b3', view(1), 'In A minor pentatonic (frets 5 to 8), tap the b3.', tap, { item: undefined }),
    choice('Which note turns the minor pentatonic into the blues scale?', ['b5', '2', '6'], 'b5'),
    toneQ(G7, '3', [2, 5], 'Tap the 3rd of G7.', tap, { item: undefined })
  ]
};
