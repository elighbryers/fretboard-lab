// Level 4: chords and CAGED. Chord tones are labelled by js/lessons/kit.js (a
// dot outside its chord throws); chord names come from js/progressions.js.
import { P, inKey, tap, choice, task, degreeItem, toneItem, card } from './kit.js';
import { chordOf, chordSpecs } from '../progressions.js';

const chord = (key, id) => inKey(key, 'chord', id);
const Cmaj = chord('C', 'major'), Gmaj = chord('G', 'major'), Gm = chord('G', 'minor'), Gdim = chord('G', 'dim');
const Amaj = chord('A', 'major'), Am = chord('A', 'minor'), Dmaj = chord('D', 'major'), Bmaj = chord('B', 'major');
const Gmaj7 = chord('G', 'maj7'), G7 = chord('G', '7'), Gm7 = chord('G', 'm7');
const Gs = inKey('G', 'scale', 'major'), Cs = inKey('C', 'scale', 'major'), Gc = inKey('G', 'scale', 'chromatic');

const OPEN_C = [[5, 3], [4, 2], [3, 0], [2, 1], [1, 0]];
// G major everywhere: the five CAGED shapes, low to high.
const SHAPES = {
  G: [[6, 3], [5, 2], [4, 0], [3, 0], [2, 0], [1, 3]],
  E: [[6, 3], [5, 5], [4, 5], [3, 4], [2, 3], [1, 3]],
  D: [[4, 5], [3, 7], [2, 8], [1, 7]],
  C: [[5, 10], [4, 9], [3, 7], [2, 8], [1, 7]],
  A: [[5, 10], [4, 12], [3, 12], [2, 12], [1, 10]]
};
const ORDER = ['G', 'E', 'D', 'C', 'A'];
// Barre shapes: E shape with the root on the low E string at fret r, A shape on the A string.
const eShape = r => [[6, r], [5, r + 2], [4, r + 2], [3, r + 1], [2, r], [1, r]];
const aShape = r => [[5, r], [4, r + 2], [3, r + 2], [2, r + 2], [1, r]];
// G major triads on the top three strings.
const TOP = { a: [[3, 4], [2, 3], [1, 3]], b: [[3, 7], [2, 8], [1, 7]], c: [[3, 12], [2, 12], [1, 10]] };
const TOP_C = { a: [[3, 5], [2, 5], [1, 3]] };
// G major seventh chords, root on the low E string.
const GMAJ7 = [[6, 3], [4, 4], [3, 4], [2, 3]], G_7 = [[6, 3], [5, 5], [4, 3], [3, 4], [2, 3], [1, 3]], GM7 = [[6, 3], [5, 5], [4, 3], [3, 3], [2, 3], [1, 3]];
const TRIAD = { major: [[6, 3], [5, 2], [5, 5]], minor: [[6, 3], [5, 1], [5, 5]], dim: [[6, 3], [5, 1], [5, 4]] };

const ps = list => list.map(([s, f]) => P(s, f));
const without = (list, drop) => list.filter(([s, f]) => !drop.some(([a, b]) => a === s && b === f));
// The chords of G major, roots on the A string (G on the low E), labelled with names or numerals.
const KEY_ROMANS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const ROOTS = [[6, 3], [5, 0], [5, 2], [5, 3], [5, 5], [5, 7], [5, 9]];
const keyDots = mode => KEY_ROMANS.map((r, i) => {
  const c = chordOf('G', r);
  return P(ROOTS[i][0], ROOTS[i][1], { label: mode === 'roman' ? r : c.name, role: c.chord === 'major' ? 'root' : c.chord === 'minor' ? 'third' : 'fifth' });
});
const EAR = { major: 'Major', minor: 'Minor', dim: 'Diminished', maj7: 'Major 7', '7': 'Dominant 7', m7: 'Minor 7' };
const hearChord = (spec, kind, options) => choice('Listen. What kind of chord is it?', options.map(o => EAR[o]), EAR[kind], `chord-ear:${kind}`, { sound: { seq: [spec, null, spec], bpm: 60 } });

export default {
  id: 'level-4',
  title: 'Chords and CAGED',
  lessons: [
    {
      id: 'l4-1',
      title: 'Building triads from 1-3-5',
      review: [...['R', '3', '5'].map(l => toneItem(Cmaj, l)), 'chordshape:c', 'chordshape:g', 'chordshape:d'],
      steps: {
        hear: { text: 'C, E and G one at a time, then all together: the C major chord.', sound: { seq: [P(5, 3), P(4, 2), P(3, 0), ps(OPEN_C)], bpm: 70 } },
        learn: {
          cards: [
            card('l4-1.1', { view: [0, 6], dots: Cmaj.dots([[5, 3], [4, 2], [4, 5]]) }),
            card('l4-1.2', { view: [0, 6], dots: Cs.dots([[5, 3], [5, 5], [4, 2], [4, 3], [4, 5]], 'note') }),
            { text: 'Play them together and you hear the C major chord. The open C chord is just those three notes, repeated.', board: { view: [0, 6], dots: Cmaj.dots(OPEN_C) } }
          ]
        },
        see: { text: 'The open C chord, note by note, then strummed.', view: [0, 6], sequence: [...Cmaj.dots(OPEN_C), Cmaj.dots(OPEN_C)], bpm: 80, link: { key: 'C', chord: 'major', labels: 'intervals' } },
        try: {
          view: [0, 6],
          tasks: [
            task('Tap the 3rd of the C major chord.', Cmaj.spots('3', { from: 0, to: 6 }), { item: toneItem(Cmaj, '3'), dots: [Cmaj.dot(5, 3)], explain: 'Yes! The 3rd of C major is E.' }),
            task('Tap the 5th of the C major chord.', Cmaj.spots('5', { from: 0, to: 6 }), { item: toneItem(Cmaj, '5'), dots: [Cmaj.dot(5, 3)], explain: 'Yes! The 5th of C major is G.' }),
            task('Tap the root of the G major chord.', Gmaj.spots('R', { from: 0, to: 6 }), { item: toneItem(Gmaj, 'R'), explain: 'Yes! G is the root.' })
          ]
        },
        play: { skills: ['c', 'g', 'd'], text: 'Play C, E and G one at a time, then strum the open C chord. Repeat.', view: [0, 6], bpm: 60, follow: [P(5, 3), P(4, 2), P(3, 0), ps(OPEN_C)] },
        check: {
          pass: 3, view: [0, 6],
          questions: [
            tap('Tap the 3rd of the G major chord.', Gmaj.spots('3', { from: 0, to: 6 }), { item: toneItem(Gmaj, '3'), dots: [Gmaj.dot(6, 3)] }),
            tap('Tap the 5th of the G major chord.', Gmaj.spots('5', { from: 0, to: 6 }), { item: toneItem(Gmaj, '5'), dots: [Gmaj.dot(6, 3)] }),
            choice('Which degrees make a triad?', ['1 3 5', '1 2 3', '1 4 5'], '1 3 5', 'fact:triad-degrees'),
            tap('Tap the root of the C major chord.', Cmaj.spots('R', { from: 0, to: 6 }), { item: toneItem(Cmaj, 'R') })
          ]
        }
      }
    },
    {
      id: 'l4-2',
      title: 'Major, minor and diminished',
      review: [toneItem(Gm, 'b3'), toneItem(Gdim, 'b5'), 'chord-ear:major', 'chord-ear:minor', 'chord-ear:dim'],
      steps: {
        hear: { text: 'G major, G minor, then G diminished. Bright, sad, then tense.', sound: { seq: ['G:major', null, 'G:minor', null, 'G:dim'], bpm: 60 } },
        learn: {
          cards: [
            card('l4-2.1', { view: [0, 6], dots: Gmaj.dots(TRIAD.major) }),
            { text: 'Lower the 3rd one fret to b3 and it becomes minor. It sounds sad.', board: { view: [0, 6], dots: Gm.dots(TRIAD.minor) } },
            card('l4-2.3', { view: [0, 6], dots: Gdim.dots(TRIAD.dim) })
          ]
        },
        see: { text: 'G major, G minor, G diminished, one after another.', view: [0, 6], sequence: [Gmaj.dots(TRIAD.major), Gm.dots(TRIAD.minor), Gdim.dots(TRIAD.dim)], dots: Gc.dots([[6, 3], [5, 1], [5, 2], [5, 4], [5, 5]]), bpm: 50, link: { key: 'G', chord: 'minor', labels: 'intervals' } },
        try: {
          view: [0, 8],
          tasks: [
            task('Make it minor: tap the b3 of G minor.', Gm.spots('b3', { strings: [6, 5, 4], from: 0, to: 6 }), { item: toneItem(Gm, 'b3'), dots: Gm.dots([[6, 3], [5, 5]]), explain: 'Yes! The b3 of G minor is Bb.' }),
            task('Tap the b5 of G diminished.', Gdim.spots('b5', { strings: [6, 5, 4], from: 0, to: 6 }), { item: toneItem(Gdim, 'b5'), dots: Gdim.dots([[6, 3], [5, 1]]), explain: 'Yes! The b5 of G diminished is Db.' }),
            task('Tap the 3rd of A major.', Amaj.spots('3', { strings: [6, 5, 4], from: 2, to: 8 }), { item: toneItem(Amaj, '3'), dots: [Amaj.dot(6, 5)], explain: 'Yes! The 3rd of A major is C#.' })
          ]
        },
        play: { text: 'Pick each triad note by note, one chord per bar: G major, G minor, G diminished. Listen to the mood change.', view: [0, 6], bpm: 70, beatsPerStep: 4, follow: [ps(TRIAD.major), ps(TRIAD.minor), ps(TRIAD.dim)] },
        check: {
          pass: 3, view: [0, 8],
          questions: [
            hearChord('A:minor', 'minor', ['major', 'minor', 'dim']),
            tap('Tap the b3 of A minor.', Am.spots('b3', { strings: [6, 5, 4], from: 2, to: 8 }), { item: toneItem(Am, 'b3'), dots: [Am.dot(6, 5)] }),
            tap('Tap the 5th of D major.', Dmaj.spots('5', { strings: [5, 4, 3], from: 2, to: 8 }), { item: toneItem(Dmaj, '5'), dots: [Dmaj.dot(5, 5)] }),
            choice('Which triad has a b3 and a b5?', ['Diminished', 'Minor', 'Major'], 'Diminished', 'fact:dim-triad')
          ]
        }
      }
    },
    {
      id: 'l4-3',
      title: 'The chords in a key',
      review: ['rhythm:first-strum', 'rhythm:syncopation', 'fact:g-ii', 'fact:major-chords-in-key', degreeItem(Gs, '4'), degreeItem(Gs, '5'), degreeItem(Gs, '6')],
      steps: {
        hear: { text: 'One chord on every note of G major: G, Am, Bm, C, D, Em, F#°, then G again.', sound: { seq: chordSpecs('G', [...KEY_ROMANS, 'I']), bpm: 70 } },
        learn: {
          cards: [
            { text: 'Build a triad on every note of G major, using only G major notes. You get seven chords.', board: { view: [0, 10], dots: keyDots('name') } },
            { text: 'The pattern is the same in every major key: major, minor, minor, major, major, minor, diminished.', board: { view: [0, 10], dots: keyDots('name') } },
            { text: 'Roman numerals name the chords by degree. Upper case is major, lower case is minor.', board: { view: [0, 10], dots: keyDots('roman') } }
          ]
        },
        see: { text: 'The root of each chord in G major, from I to vii°.', view: [0, 10], sequence: keyDots('roman'), bpm: 70, link: { key: 'G', scale: 'major', labels: 'intervals' } },
        try: {
          view: [0, 10],
          tasks: [
            task('Tap the root of the IV chord in G.', Gs.spots('4', { strings: [6, 5], from: 0, to: 10 }), { item: degreeItem(Gs, '4'), explain: 'Yes! IV in G is C.' }),
            task('Tap the root of the V chord in G.', Gs.spots('5', { strings: [6, 5], from: 0, to: 10 }), { item: degreeItem(Gs, '5'), explain: 'Yes! V in G is D.' }),
            task('Tap the root of the vi chord in G (it is minor).', Gs.spots('6', { strings: [6, 5], from: 0, to: 10 }), { item: degreeItem(Gs, '6'), explain: 'Yes! vi in G is Em.' })
          ]
        },
        play: { skills: ['first-strum', 'syncopation'],
          text: 'The backing track plays every chord in G major. Strum along with the open chords you know (G, Am, C, D, Em), or play each chord\'s root. Watch the chord name.',
          view: [0, 10], bpm: 70, backing: { key: 'G', progression: [...KEY_ROMANS, 'I'] }, dots: keyDots('name')
        },
        check: {
          pass: 3, view: [0, 10],
          questions: [
            choice('In G major, which chord is ii?', ['Am', 'A', 'Bm'], 'Am', 'fact:g-ii'),
            choice('In a major key, which chords are major?', ['I, IV and V', 'ii, iii and vi', 'I, ii and iii'], 'I, IV and V', 'fact:major-chords-in-key'),
            tap('Tap the root of the V chord in G.', Gs.spots('5', { strings: [6, 5], from: 0, to: 10 }), { item: degreeItem(Gs, '5') }),
            tap('From Lesson 2: tap the b3 of G minor.', Gm.spots('b3', { strings: [6, 5, 4], from: 0, to: 6 }), { item: toneItem(Gm, 'b3'), dots: Gm.dots([[6, 3], [5, 5]]), view: [0, 6] })
          ]
        }
      }
    },
    {
      id: 'l4-4',
      title: 'Triads on three strings',
      review: [...['R', '3', '5'].map(l => toneItem(Gmaj, l)), 'rhythm:six-eight'],
      steps: {
        hear: { text: 'G major three times, higher each time, on just the top three strings.', sound: { seq: [ps(TOP.a), null, ps(TOP.b), null, ps(TOP.c)], bpm: 60 } },
        learn: {
          cards: [
            { text: 'A triad fits on three neighbouring strings. Here is G major on the top three, with the root on the bottom.', board: { view: [0, 12], dots: Gmaj.dots(TOP.c) } },
            { text: 'Move each note up to the next chord tone and you get the same chord in a new shape.', board: { view: [0, 12], dots: Gmaj.dots(TOP.a) } },
            { text: 'Three shapes cover the neck: around frets 3, 7 and 12. Each one has the root in a different place.', board: { view: [0, 12], dots: Gmaj.dots([...TOP.a, ...TOP.b, ...TOP.c]) } }
          ]
        },
        see: { text: 'G major up the top three strings.', view: [0, 12], sequence: [Gmaj.dots(TOP.a), Gmaj.dots(TOP.b), Gmaj.dots(TOP.c)], dots: Gmaj.dots([...TOP.a, ...TOP.b, ...TOP.c]), bpm: 50, link: { key: 'G', chord: 'major', labels: 'intervals' } },
        try: {
          view: [0, 12],
          tasks: [
            task('In this G shape, tap the 3rd.', P(1, 7), { item: toneItem(Gmaj, '3'), dots: Gmaj.dots([[3, 7], [2, 8]]), explain: 'Yes! B, the 3rd.' }),
            task('In this G shape, tap the root.', P(1, 3), { item: toneItem(Gmaj, 'R'), dots: Gmaj.dots([[3, 4], [2, 3]]), explain: 'Yes! G, the root.' }),
            task('In this G shape, tap the 5th.', P(1, 10), { item: toneItem(Gmaj, '5'), dots: Gmaj.dots([[3, 12], [2, 12]]), explain: 'Yes! D, the 5th.' })
          ]
        },
        play: { skills: ['six-eight'], text: 'Play the three G shapes, one per bar, low to high and back. Pick the notes, then strum them.', view: [0, 12], bpm: 70, beatsPerStep: 4, follow: [ps(TOP.a), ps(TOP.b), ps(TOP.c), ps(TOP.b)] },
        check: {
          pass: 3, view: [0, 12],
          questions: [
            tap('In this C major shape, tap the 3rd.', P(2, 5), { item: toneItem(Cmaj, '3'), dots: Cmaj.dots([[3, 5], [1, 3]]) }),
            tap('In this G shape, tap the root.', P(2, 8), { item: toneItem(Gmaj, 'R'), dots: Gmaj.dots([[3, 7], [1, 7]]) }),
            choice('How many different notes are in a triad?', ['3', '4', '5'], '3', 'fact:triad-three'),
            tap('From Lesson 3: tap the root of the IV chord in G.', Gs.spots('4', { strings: [6, 5], from: 0, to: 12 }), { item: degreeItem(Gs, '4') })
          ]
        }
      }
    },
    {
      id: 'l4-5',
      title: 'CAGED: one chord, five shapes',
      review: [toneItem(Amaj, 'R'), toneItem(Cmaj, 'R'), toneItem(Bmaj, 'R'), 'fact:caged'],
      steps: {
        hear: { text: 'An open E chord shape, moved up to fret 5: now it is A major.', sound: { seq: [ps(eShape(0)), null, ps(eShape(5))], bpm: 50 } },
        learn: {
          cards: [
            { text: 'Barre an open E shape with your first finger and it slides anywhere. At fret 5 it is A major.', board: { view: [3, 9], dots: Amaj.dots(eShape(5)) } },
            { text: 'Every major chord can be played with five open-chord shapes: C, A, G, E and D. That is CAGED.', board: { view: [0, 6], dots: Gmaj.dots(SHAPES.E) } },
            { text: 'In each shape the root is your anchor. Find the root and you have the chord, like this A-shape C.', board: { view: [0, 6], dots: Cmaj.dots(aShape(3)) } }
          ]
        },
        see: { text: 'The E shape at fret 3 (G), then the A shape at fret 3 (C).', view: [0, 6], sequence: [Gmaj.dots(eShape(3)), Cmaj.dots(aShape(3))], dots: Gmaj.dots(eShape(3)), bpm: 40, link: { key: 'G', chord: 'major', labels: 'intervals', pos: '3-5' } },
        try: {
          view: [0, 10],
          tasks: [
            task('This is an E shape. Tap its root on the low E string.', P(6, 5), { item: toneItem(Amaj, 'R'), dots: Amaj.dots(without(eShape(5), [[6, 5]])), explain: 'Yes! Root A at fret 5: A major.' }),
            task('This is an A shape. Tap its root on the A string.', P(5, 3), { item: toneItem(Cmaj, 'R'), dots: Cmaj.dots(without(aShape(3), [[5, 3]])), explain: 'Yes! Root C at fret 3: C major.' }),
            task('Move the E shape to make B major: tap its root on the low E string.', P(6, 7), { item: toneItem(Bmaj, 'R'), explain: 'Yes! B is at fret 7.' })
          ]
        },
        play: { skills: ['barre'], text: 'Barre chords, one per bar: G (E shape, fret 3), C (A shape, fret 3), D (A shape, fret 5). If barres hurt, play just the top four strings, and work on the barre chord goal over the next few weeks.', view: [0, 9], bpm: 70, beatsPerStep: 4, follow: [ps(eShape(3)), ps(aShape(3)), ps(aShape(5)), ps(eShape(3))] },
        check: {
          pass: 3, view: [0, 10],
          questions: [
            tap('This is an E shape. Tap its root on the low E string.', P(6, 7), { item: toneItem(Bmaj, 'R'), dots: Bmaj.dots(without(eShape(7), [[6, 7]])) }),
            tap('In this E-shape G chord, tap the 3rd.', P(3, 4), { item: toneItem(Gmaj, '3'), dots: Gmaj.dots(without(eShape(3), [[3, 4]])) }),
            choice('What is CAGED?', ['Five chord shapes', 'A scale', 'A strumming pattern'], 'Five chord shapes', 'fact:caged'),
            tap('From Lesson 4: in this G shape, tap the 3rd.', P(1, 7), { item: toneItem(Gmaj, '3'), dots: Gmaj.dots([[3, 7], [2, 8]]) })
          ]
        }
      }
    },
    {
      id: 'l4-6',
      title: 'Linking the shapes up the neck',
      review: ['fact:caged-order'],
      steps: {
        hear: { text: 'G major five times, climbing the neck one shape at a time.', sound: { seq: ORDER.map(k => ps(SHAPES[k])), bpm: 40 } },
        learn: {
          cards: [
            { text: 'The open G shape and the E shape at fret 3 share notes where they meet.', board: { view: [0, 12], dots: Gmaj.dots([...SHAPES.G, ...SHAPES.E.filter(([s, f]) => !SHAPES.G.some(([a, b]) => a === s && b === f))]) } },
            { text: 'Keep climbing: D shape, C shape, A shape. The order always follows C-A-G-E-D, round and round.', board: { view: [0, 12], dots: Gmaj.dots([...SHAPES.D, ...without(SHAPES.C, SHAPES.D), ...without(SHAPES.A, [...SHAPES.C, ...SHAPES.D])]) } },
            { text: 'Every shape is built around the G roots. Find the roots and the shapes follow.', board: { view: [0, 12], dots: Gmaj.spots('R', { from: 0, to: 12 }).map(p => Gmaj.dot(p.string, p.fret)) } }
          ]
        },
        see: { text: 'G in all five shapes: G, E, D, C, A.', view: [0, 12], sequence: ORDER.map(k => Gmaj.dots(SHAPES[k])), dots: Gmaj.all({ from: 0, to: 12 }), bpm: 40, link: { key: 'G', chord: 'major', labels: 'intervals' } },
        try: {
          view: [0, 12],
          tasks: [
            task('In the D shape, tap a root.', [P(4, 5), P(2, 8)], { item: toneItem(Gmaj, 'R'), dots: Gmaj.dots(without(SHAPES.D, [[4, 5], [2, 8]])), explain: 'Yes! G, the root.' }),
            task('In the C shape, tap the root on the A string.', P(5, 10), { item: toneItem(Gmaj, 'R'), dots: Gmaj.dots(without(SHAPES.C, [[5, 10]])), explain: 'Yes! G at fret 10.' }),
            task('In the A shape, tap the 3rd.', P(2, 12), { item: toneItem(Gmaj, '3'), dots: Gmaj.dots(without(SHAPES.A, [[2, 12]])), explain: 'Yes! B, the 3rd.' })
          ]
        },
        play: { text: 'Play G in all five shapes, one per bar, up the neck and back. Say "G" each time you land on a root.', view: [0, 12], bpm: 60, beatsPerStep: 4, follow: [...ORDER, 'C', 'D', 'E'].map(k => ps(SHAPES[k])) },
        check: {
          pass: 3, view: [0, 12],
          questions: [
            tap('In the E shape, tap the root on the D string.', P(4, 5), { item: toneItem(Gmaj, 'R'), dots: Gmaj.dots(without(SHAPES.E, [[4, 5]])) }),
            tap('In the C shape, tap the 5th.', P(3, 7), { item: toneItem(Gmaj, '5'), dots: Gmaj.dots(without(SHAPES.C, [[3, 7]])) }),
            choice('Going up the neck, which shape comes after the E shape?', ['D', 'C', 'A'], 'D', 'fact:caged-order'),
            tap('From Lesson 5: this is an E shape. Tap its root on the low E string.', P(6, 5), { item: toneItem(Amaj, 'R'), dots: Amaj.dots(without(eShape(5), [[6, 5]])) })
          ]
        }
      }
    },
    {
      id: 'l4-7',
      title: '7th chords',
      review: [toneItem(Gmaj7, '7'), toneItem(G7, 'b7'), toneItem(Gm7, 'b3'), 'chord-ear:maj7', 'chord-ear:7', 'chord-ear:m7'],
      steps: {
        hear: { text: 'Gmaj7, G7, then Gm7: dreamy, bluesy, smooth.', sound: { seq: ['G:maj7', null, 'G:7', null, 'G:m7'], bpm: 60 } },
        learn: {
          cards: [
            card('l4-7.1', { view: [0, 6], dots: Gmaj7.dots(GMAJ7) }),
            card('l4-7.2', { view: [0, 6], dots: G7.dots(G_7) }),
            card('l4-7.3', { view: [0, 6], dots: Gm7.dots(GM7) })
          ]
        },
        see: { text: 'Gmaj7, G7 and Gm7. Only one or two notes change each time.', view: [0, 6], sequence: [Gmaj7.dots(GMAJ7), G7.dots(G_7), Gm7.dots(GM7)], dots: Gc.dots([[6, 3], [5, 5], [4, 3], [4, 4], [3, 3], [3, 4], [2, 3], [1, 3]]), bpm: 40, link: { key: 'G', chord: 'maj7', labels: 'intervals' } },
        try: {
          view: [0, 6],
          tasks: [
            task('Tap the 7th of Gmaj7.', P(4, 4), { item: toneItem(Gmaj7, '7'), dots: Gmaj7.dots(without(GMAJ7, [[4, 4]])), explain: 'Yes! F#, the major 7th.' }),
            task('Tap the b7 of G7.', P(4, 3), { item: toneItem(G7, 'b7'), dots: G7.dots(without(G_7, [[4, 3]])), explain: 'Yes! F, the b7.' }),
            task('Tap the b3 of Gm7.', P(3, 3), { item: toneItem(Gm7, 'b3'), dots: Gm7.dots(without(GM7, [[3, 3]])), explain: 'Yes! Bb, the b3.' })
          ]
        },
        play: { text: 'Strum Gmaj7, G7 and Gm7, one per bar. Listen to which notes move.', view: [0, 6], bpm: 70, beatsPerStep: 4, follow: [ps(GMAJ7), ps(G_7), ps(GM7)] },
        check: {
          pass: 3, view: [0, 6],
          questions: [
            hearChord('C:7', '7', ['maj7', '7', 'm7']),
            tap('Tap the b7 of G7.', P(4, 3), { item: toneItem(G7, 'b7'), dots: G7.dots(without(G_7, [[4, 3]])) }),
            tap('Tap the 3rd of Gmaj7.', P(3, 4), { item: toneItem(Gmaj7, '3'), dots: Gmaj7.dots(without(GMAJ7, [[3, 4]])) }),
            tap('From Level 3: tap the minor 7th above this root.', [P(4, 3), P(5, 8)], { item: 'interval:m7', dots: [Gc.dot(6, 3)], view: [0, 8] })
          ]
        }
      }
    }
  ],
  challenge: {
    id: 'l4-challenge', title: 'Level 4 Challenge', challenge: true,
    flow: [
      {
        type: 'learn', name: 'How it works',
        cards: [
          { text: 'Play G in all five CAGED shapes up the neck, one per bar, and say the root note on each.', board: { view: [0, 12], dots: Gmaj.all({ from: 0, to: 12 }) } },
          { text: 'Then improvise over a G, C, D backing track, then find the roots in each shape.', board: { view: [0, 12], dots: Gmaj.spots('R', { from: 0, to: 12 }).map(p => Gmaj.dot(p.string, p.fret)) } }
        ]
      },
      { type: 'play', name: 'Five shapes', text: 'G in five shapes: G, E, D, C, A, one per bar. Say "G" as you hit each root.', view: [0, 12], bpm: 60, beatsPerStep: 4, follow: ORDER.map(k => ps(SHAPES[k])) },
      {
        type: 'play', name: 'Improvise', bpmKey: 'improv',
        text: 'The backing track plays G, C, D, G. Improvise for 60 seconds using only chord tones of the chord that is playing (the name shows below).',
        view: [0, 12], bpm: 80, seconds: 60, backing: { key: 'G', progression: ['I', 'IV', 'V', 'I'], keys: ['G', 'C', 'D', 'A'] }, dots: Gmaj.all({ from: 0, to: 12 })
      },
      {
        type: 'check', name: 'Check it', pass: 3, view: [0, 12],
        questions: [
          tap('E shape: tap the root on the low E string.', P(6, 3), { item: toneItem(Gmaj, 'R'), dots: Gmaj.dots(without(SHAPES.E, [[6, 3]])) }),
          tap('D shape: tap the root on the D string.', P(4, 5), { item: toneItem(Gmaj, 'R'), dots: Gmaj.dots(without(SHAPES.D, [[4, 5]])) }),
          tap('C shape: tap the root on the A string.', P(5, 10), { item: toneItem(Gmaj, 'R'), dots: Gmaj.dots(without(SHAPES.C, [[5, 10]])) }),
          tap('A shape: tap the root on the G string.', P(3, 12), { item: toneItem(Gmaj, 'R'), dots: Gmaj.dots(without(SHAPES.A, [[3, 12]])) })
        ]
      }
    ]
  },
  placement: [
    tap('Tap the b3 of G minor.', Gm.spots('b3', { strings: [6, 5, 4], from: 0, to: 6 }), { view: [0, 6], dots: Gm.dots([[6, 3], [5, 5]]) }),
    choice('In G major, which chord is ii?', ['Am', 'A', 'Bm'], 'Am'),
    { ...hearChord('D:minor', 'minor', ['major', 'minor', 'dim']), item: undefined }
  ]
};
