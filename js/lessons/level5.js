// Level 5: progressions. Chords come from Roman numerals (js/progressions.js),
// labels from js/lessons/kit.js. Backing tracks loop on the metronome.
import { P, inKey, tap, choice, task, degreeItem, toneItem } from './kit.js';
import { chordOf, chordSpecs, TWELVE_BAR } from '../progressions.js';

const scale = k => inKey(k, 'scale', 'major');
const Gs = scale('G'), Cs = scale('C'), As = scale('A'), Ds = scale('D'), Es = scale('E'), Fs = scale('F');
const chord = (k, id) => inKey(k, 'chord', id);
const Gmaj = chord('G', 'major'), Cmaj = chord('C', 'major'), Dmaj = chord('D', 'major'), Em = chord('E', 'minor'), Am = chord('A', 'minor'), Amaj = chord('A', 'major');
const A7 = chord('A', '7'), B7 = chord('B', '7'), E7 = chord('E', '7');
const Gmix = inKey('G', 'scale', 'mixolydian'), Amix = inKey('A', 'scale', 'mixolydian');
// One-octave major shapes (root on the A string), for keys; the open G shape moved up two frets = A with a capo at 2.
const shape5 = r => [[5, r], [5, r + 2], [4, r - 1], [4, r], [4, r + 2], [3, r - 1], [3, r + 1], [3, r + 2]];
const G_SHAPE_CAPO2 = [[6, 5], [5, 4], [4, 2], [3, 2], [2, 2], [1, 5]];
const B7_OPEN = [[5, 2], [4, 1], [3, 2], [2, 0], [1, 2]];
const P1b7 = ['I', 'bVII', 'IV', 'I'];

// Triads on the top three strings, all inside frets 2-5 (one position).
const TRI = { G: [[3, 4], [2, 3], [1, 3]], C: [[3, 5], [2, 5], [1, 3]], D: [[3, 2], [2, 3], [1, 2]], Em: [[3, 4], [2, 5], [1, 3]], Am: [[3, 5], [2, 5], [1, 5]] };
const TRI_KEY = { G: Gmaj, C: Cmaj, D: Dmaj, Em, Am };
const tri = name => TRI_KEY[name].dots(TRI[name], 'note');
const triPos = name => TRI[name].map(([s, f]) => P(s, f));
const without = (list, drop) => list.filter(([s, f]) => !drop.some(([a, b]) => a === s && b === f));
const A7_SHAPE = [[6, 5], [5, 7], [4, 5], [3, 6], [2, 5], [1, 5]];

// A root dot with a label (numeral or chord name).
const rootDot = (s, f, label, role = 'root') => P(s, f, { label, role });
// Hear a progression (one strum per beat, two beats per chord).
const hearProg = (key, romans, bpm = 100) => ({ seq: chordSpecs(key, romans).flatMap(c => [c, c]), bpm });
const showProg = romans => romans.join('–').replace(/b(?=[IV])/g, '♭');
const whichProg = (key, romans, options, item, prompt = 'Listen. Which progression is it?') =>
  choice(prompt, options.map(showProg), showProg(romans), item, { sound: hearProg(key, romans) });
const P1451 = ['I', 'IV', 'V', 'I'], P1564 = ['I', 'V', 'vi', 'IV'], P251 = ['ii', 'V', 'I'], P6415 = ['vi', 'IV', 'I', 'V'];
// "Tap the root of the <numeral> chord in <key>": any root on the low two or three strings.
const rootTask = (k, label, numeral, view = [0, 10], strings = [6, 5], mk = task) =>
  mk(`Tap the root of the ${numeral} chord in ${k.key}.`, k.spots(label, { strings, from: view[0], to: view[1] }),
    { item: degreeItem(k, label), explain: `Yes! ${numeral} in ${k.key} is ${chordOf(k.key, numeral).name}.` });
const rootQ = (k, label, numeral, view, strings, prompt) => ({ ...rootTask(k, label, numeral, view, strings, tap), ...(prompt ? { prompt } : {}) });

export default {
  id: 'level-5',
  title: 'Progressions',
  lessons: [
    {
      id: 'l5-1',
      title: 'Roman numerals',
      review: ['fact:c-v', 'fact:g-iv'],
      steps: {
        hear: { text: 'G, C, D, G: the I, IV and V chords of G major.', sound: hearProg('G', P1451, 80) },
        learn: {
          cards: [
            { text: 'A progression is a series of chords. Roman numerals name each chord by the degree it starts on.', board: { view: [0, 10], dots: [rootDot(6, 3, 'I'), rootDot(5, 0, 'ii', 'third'), rootDot(5, 2, 'iii', 'third'), rootDot(5, 3, 'IV'), rootDot(5, 5, 'V'), rootDot(5, 7, 'vi', 'third'), rootDot(5, 9, 'vii°', 'fifth')] } },
            { text: 'I is the home chord. In G, I is G, IV is C and V is D.', board: { view: [0, 10], dots: [rootDot(6, 3, 'G'), rootDot(5, 3, 'C'), rootDot(5, 5, 'D')] } },
            { text: 'The numerals work in any key. In C, I, IV and V are C, F and G.', board: { view: [0, 10], dots: [rootDot(5, 3, 'C'), rootDot(6, 1, 'F'), rootDot(6, 3, 'G')] } }
          ]
        },
        see: { text: 'I, IV, V, I in G, in one small position.', view: [0, 7], sequence: [triPos('G'), triPos('C'), triPos('D'), triPos('G')], dots: [...tri('G'), ...tri('C').filter(d => d.fret === 5), ...tri('D')], bpm: 50, link: { key: 'G', scale: 'major', labels: 'intervals' } },
        try: {
          view: [0, 10],
          tasks: [rootTask(Cs, 'R', 'I'), rootTask(Cs, '4', 'IV'), rootTask(Cs, '5', 'V')]
        },
        play: {
          text: 'The backing track plays I, IV, V, I. Play each chord\'s root on beat 1, and say its numeral. Change the key when you\'re ready.',
          view: [0, 10], bpm: 70, backing: { key: 'G', progression: P1451, keys: ['G', 'C', 'D', 'A'] }, dots: [rootDot(6, 3, 'I'), rootDot(5, 3, 'IV'), rootDot(5, 5, 'V')]
        },
        check: {
          pass: 3, view: [0, 10],
          questions: [
            choice('In C major, which chord is V?', ['G', 'F', 'D'], 'G', 'fact:c-v'),
            choice('In G major, which chord is IV?', ['C', 'D', 'Am'], 'C', 'fact:g-iv'),
            rootQ(As, '4', 'IV'),
            rootQ(As, '5', 'V')
          ]
        }
      }
    },
    {
      id: 'l5-2',
      title: 'I-IV-V and the 12-bar blues',
      review: ['fact:blues-bar-5', degreeItem(Es, 'R'), degreeItem(Es, '4')],
      steps: {
        hear: { text: 'A 12-bar blues in A: A7, D7 and E7.', sound: { seq: chordSpecs('A', TWELVE_BAR), bpm: 110 } },
        learn: {
          cards: [
            { text: 'I, IV and V are the three major chords of a key. Thousands of songs use only these.', board: { view: [0, 10], dots: [rootDot(6, 5, 'I'), rootDot(5, 5, 'IV'), rootDot(5, 7, 'V')] } },
            { text: 'The 12-bar blues: four bars of I, two of IV, two of I, then V, IV, I, V.', board: { view: [0, 10], dots: [rootDot(6, 5, 'A7'), rootDot(5, 5, 'D7'), rootDot(5, 7, 'E7')] } },
            { text: 'Blues uses 7th chords. Here is A7, the E shape with a b7.', board: { view: [3, 9], dots: A7.dots(A7_SHAPE) } }
          ]
        },
        see: {
          text: 'The roots of a 12-bar blues in A, one per bar.', view: [0, 10],
          sequence: TWELVE_BAR.map(r => ({ I7: P(6, 5), IV7: P(5, 5), V7: P(5, 7) }[r])), dots: [rootDot(6, 5, 'I'), rootDot(5, 5, 'IV'), rootDot(5, 7, 'V')], bpm: 120,
          link: { key: 'A', chord: '7', labels: 'intervals' }
        },
        try: {
          view: [0, 10],
          tasks: [
            rootTask(As, '4', 'IV'),
            task('Bar 9 of a blues in A is the V chord. Tap its root.', As.spots('5', { strings: [6, 5], from: 0, to: 10 }), { item: degreeItem(As, '5'), explain: 'Yes! V in A is E.' }),
            rootTask(Es, 'R', 'I')
          ]
        },
        play: {
          text: 'A 12-bar blues in A. Strum A7, D7 and E7, or just play each root on beat 1. Watch the chord name change.',
          view: [0, 10], bpm: 90, backing: { key: 'A', progression: TWELVE_BAR, keys: ['A', 'E', 'G', 'C'] }, dots: [rootDot(6, 5, 'I'), rootDot(5, 5, 'IV'), rootDot(5, 7, 'V')]
        },
        check: {
          pass: 3, view: [0, 10],
          questions: [
            choice('Which chord is bar 5 of a 12-bar blues?', ['IV', 'I', 'V'], 'IV', 'fact:blues-bar-5'),
            rootQ(As, '5', 'V'),
            rootQ(Es, '4', 'IV'),
            rootQ(Cs, '5', 'V', [0, 10], [6, 5], 'From Lesson 1: tap the root of the V chord in C.')
          ]
        }
      }
    },
    {
      id: 'l5-3',
      title: 'I-V-vi-IV, the pop progression',
      review: ['fact:hear-pop', 'fact:g-vi', degreeItem(Cs, '6'), degreeItem(Ds, '6'), degreeItem(As, '6')],
      steps: {
        hear: { text: 'G, D, Em, C. You have heard this loop in hundreds of songs.', sound: hearProg('G', [...P1564, ...P1564]) },
        learn: {
          cards: [
            { text: 'I-V-vi-IV is the most used progression in pop. In G it is G, D, Em, C.', board: { view: [0, 10], dots: [rootDot(6, 3, 'I'), rootDot(5, 5, 'V'), rootDot(5, 7, 'vi', 'third'), rootDot(5, 3, 'IV')] } },
            { text: 'The vi chord is minor: it is the relative minor of the key, Em in G.', board: { view: [0, 10], dots: [rootDot(6, 3, 'G'), rootDot(6, 0, 'Em', 'third')] } },
            { text: 'Start the same loop on vi and you get vi-IV-I-V, its moodier twin.', board: { view: [0, 10], dots: [rootDot(5, 7, 'vi', 'third'), rootDot(5, 3, 'IV'), rootDot(6, 3, 'I'), rootDot(5, 5, 'V')] } }
          ]
        },
        see: { text: 'G, D, Em, C in one position on the top three strings.', view: [0, 7], sequence: [triPos('G'), triPos('D'), triPos('Em'), triPos('C')], dots: [...tri('G'), ...tri('D'), ...tri('Em').filter(d => d.string === 2), ...tri('C').filter(d => d.fret === 5)], bpm: 50, link: { key: 'G', scale: 'major', labels: 'notes', pos: '2-5' } },
        try: {
          view: [0, 10],
          tasks: [rootTask(Cs, '6', 'vi'), rootTask(Ds, '6', 'vi'), rootTask(Ds, '5', 'V')]
        },
        play: {
          text: 'I-V-vi-IV with the backing track. Play the triads shown, one per bar, or strum any shapes you know.',
          view: [0, 7], bpm: 80, beatsPerStep: 4, follow: [triPos('G'), triPos('D'), triPos('Em'), triPos('C')],
          backing: { key: 'G', progression: P1564 }
        },
        check: {
          pass: 3, view: [0, 10],
          questions: [
            whichProg('C', P1564, [P1564, P1451, P251], 'fact:hear-pop'),
            rootQ(As, '6', 'vi'),
            choice('In G major, which chord is vi?', ['Em', 'E', 'Am'], 'Em', 'fact:g-vi'),
            rootQ(As, '4', 'IV', [0, 10], [6, 5], 'From Lesson 2: tap the root of the IV chord in A.')
          ]
        }
      }
    },
    {
      id: 'l5-4',
      title: 'ii-V-I',
      review: ['fact:hear-251', 'fact:hear-half-cadence', degreeItem(Cs, '2'), degreeItem(Gs, '2'), toneItem(Dmaj, '3')],
      steps: {
        hear: { text: 'Am7, D7, Gmaj7: the ii-V-I in G. Hear how D7 pulls home to G.', sound: hearProg('G', ['ii7', 'V7', 'Imaj7', 'Imaj7'], 80) },
        learn: {
          cards: [
            { text: 'ii-V-I is the backbone of jazz. In G it is Am, D, G.', board: { view: [0, 10], dots: [rootDot(5, 0, 'ii', 'third'), rootDot(5, 5, 'V'), rootDot(6, 3, 'I')] } },
            { text: 'Jazz players add 7ths: Am7, D7, Gmaj7.', board: { view: [0, 10], dots: [rootDot(5, 0, 'Am7', 'third'), rootDot(5, 5, 'D7'), rootDot(6, 3, 'Gmaj7')] } },
            { text: 'V wants to resolve to I, and that pull is called a cadence. The 3rd of D, F#, rises one fret to G.', board: { view: [0, 7], dots: [Dmaj.dot(1, 2), Gmaj.dot(1, 3)] } }
          ]
        },
        see: { text: 'The roots of ii-V-I in G: A, D, G.', view: [0, 10], sequence: [rootDot(6, 5, 'ii', 'third'), rootDot(5, 5, 'V'), rootDot(4, 5, 'I')], bpm: 60, link: { key: 'G', scale: 'major', labels: 'intervals' } },
        try: {
          view: [0, 10],
          tasks: [
            rootTask(Cs, '2', 'ii'), rootTask(Cs, '5', 'V'),
            task('Tap the 3rd of the D chord, the note that pulls toward G.', Dmaj.spots('3', { from: 0, to: 10 }), { item: toneItem(Dmaj, '3'), dots: [Dmaj.dot(5, 5)], explain: 'Yes! F#, the 3rd of D. It rises one fret to G.' })
          ]
        },
        play: {
          text: 'ii-V-I with 7th chords, round and round. Play each root on beat 1, then try the 3rd of each chord instead.',
          view: [0, 10], bpm: 80, backing: { key: 'G', progression: ['ii7', 'V7', 'Imaj7', 'Imaj7'], keys: ['G', 'C', 'F', 'D'] }, dots: [rootDot(6, 5, 'ii', 'third'), rootDot(5, 5, 'V'), rootDot(4, 5, 'I')]
        },
        check: {
          pass: 3, view: [0, 10],
          questions: [
            whichProg('C', P251, [P251, P1451, P1564], 'fact:hear-251'),
            rootQ(Gs, '2', 'ii'),
            choice('Listen. Does it end finished or unfinished?', ['Finished', 'Unfinished'], 'Unfinished', 'fact:hear-half-cadence', { sound: { seq: ['C:major', 'F:major', 'G:major', 'G:major'], bpm: 70 } }),
            rootQ(Cs, '6', 'vi', [0, 10], [6, 5], 'From Lesson 3: tap the root of the vi chord in C.')
          ]
        }
      }
    },
    {
      id: 'l5-keys',
      title: 'Keys, the capo and transposing',
      review: ['fact:d-major-sharps', 'fact:g-major-sharp', 'interval:P5', degreeItem(As, 'R')],
      steps: {
        hear: { text: 'G, C, D, G, then the very same shapes with a capo at fret 2: now it is in A.', sound: { seq: [...chordSpecs('G', P1451), null, ...chordSpecs('A', P1451)], bpm: 70 } },
        learn: {
          cards: [
            { text: 'A key is the set of notes a song uses. G major has one sharp, F#, and D major has two, F# and C#.', board: { view: [2, 9], dots: Ds.dots(shape5(5), 'note') } },
            { text: 'Each step up a 5th adds a sharp: C, G, D, A. This ring of keys is the circle of fifths.', board: { view: [0, 12], dots: [Cs.dot(5, 3, 'note'), Gs.dot(4, 5, 'note'), Ds.dot(3, 7, 'note'), As.dot(2, 10, 'note')] } },
            { text: 'A capo raises every string. Play G shapes with a capo at fret 2 and you hear A, with the same numerals.', board: { view: [0, 7], dots: Amaj.dots(G_SHAPE_CAPO2, 'note') } }
          ]
        },
        see: { text: 'Up the circle of fifths, one string at a time: C, G, D, A.', view: [0, 12], sequence: [Cs.dot(5, 3, 'note'), Gs.dot(4, 5, 'note'), Ds.dot(3, 7, 'note'), As.dot(2, 10, 'note')], bpm: 60, link: { key: 'D', scale: 'major', labels: 'notes' } },
        try: {
          view: [0, 10],
          tasks: [
            task('Tap the 5th above C: one string up, two frets up.', P(4, 5), { dots: [Cs.dot(5, 3, 'note')], item: 'interval:P5', explain: 'Yes! G, a 5th above C: the next key round the circle.' }),
            task('Tap the sharp note of G major on the D string.', P(4, 4), { item: degreeItem(Gs, '7'), explain: 'Yes! F#.' }),
            task('Transpose: with a capo at fret 2, the I chord of a song in G becomes A. Tap that A on the low E string.', P(6, 5), { item: degreeItem(As, 'R'), explain: 'Yes! Two frets up: G becomes A.' })
          ]
        },
        play: {
          text: 'I, IV, V, I with the backing track in G. Then switch the key to A and play the same shapes with a capo at fret 2.',
          view: [0, 10], bpm: 70, backing: { key: 'G', progression: P1451, keys: ['G', 'A', 'C', 'D'] }, dots: [rootDot(6, 3, 'I'), rootDot(5, 3, 'IV'), rootDot(5, 5, 'V')]
        },
        check: {
          pass: 3, view: [0, 10],
          questions: [
            choice('How many sharps does D major have?', ['1', '2', '3'], '2', 'fact:d-major-sharps'),
            choice('Which note is sharp in G major?', ['F#', 'C#', 'G#'], 'F#', 'fact:g-major-sharp'),
            tap('Tap the 5th above A.', P(4, 2), { dots: [As.dot(5, 0, 'note')], item: 'interval:P5' }),
            rootQ(Ds, '6', 'vi', [0, 10], [6, 5], 'From Lesson 3: tap the root of the vi chord in D.')
          ]
        }
      }
    },
    {
      id: 'l5-b7',
      title: '♭VII and secondary dominants',
      review: ['fact:hear-b7', degreeItem(Gmix, 'b7'), degreeItem(Amix, 'b7'), toneItem(B7, 'R'), toneItem(B7, '3'), toneItem(E7, 'R')],
      steps: {
        hear: { text: 'G, F, C, G: a chord from outside the key gives that big rock sound. Then G, B7, Em: a pull into the minor chord.', sound: { seq: [...chordSpecs('G', P1b7), null, ...chordSpecs('G', ['I', 'V7/vi', 'vi', 'vi'])], bpm: 70 } },
        learn: {
          cards: [
            { text: '♭VII borrows a chord from outside the key. In G it is F, and ♭VII-IV-I is a classic rock ending.', board: { view: [0, 10], dots: [rootDot(6, 3, 'I'), rootDot(6, 1, '♭VII', 'fifth'), rootDot(5, 3, 'IV')] } },
            { text: 'A secondary dominant is the V of another chord. B7 is the V of Em, so I-V/vi-vi pulls hard into Em.', board: { view: [0, 10], dots: [rootDot(6, 3, 'I'), rootDot(5, 2, 'V/vi', 'fifth'), rootDot(5, 7, 'vi', 'third')] } },
            { text: 'Spot them by the note from outside the key, like the D# in B7.', board: { view: [0, 5], dots: B7.dots(B7_OPEN) } }
          ]
        },
        see: { text: 'I, ♭VII, IV, I in G, by the roots.', view: [0, 10], sequence: [rootDot(6, 3, 'I'), rootDot(6, 1, '♭VII', 'fifth'), rootDot(5, 3, 'IV'), rootDot(6, 3, 'I')], bpm: 60, link: { key: 'G', scale: 'mixolydian', labels: 'intervals' } },
        try: {
          view: [0, 10],
          tasks: [
            task('Tap the root of ♭VII in G.', Gmix.spots('b7', { strings: [6, 5], from: 0, to: 10 }), { item: degreeItem(Gmix, 'b7'), explain: 'Yes! F: a whole step below G.' }),
            task('Tap the root of V/vi in G, the V of Em.', B7.spots('R', { strings: [6, 5], from: 0, to: 10 }), { item: toneItem(B7, 'R'), explain: 'Yes! B, a 5th above E.' }),
            task('Tap the 3rd of B7, the note outside G major.', B7.spots('3', { from: 0, to: 5 }), { item: toneItem(B7, '3'), dots: [B7.dot(5, 2)], view: [0, 5], explain: 'Yes! D#: G major has D, not D#.' })
          ]
        },
        play: {
          text: 'I, ♭VII, IV, I with the backing track. Strum or play roots, and listen for the F chord stepping outside the key.',
          view: [0, 10], bpm: 80, backing: { key: 'G', progression: P1b7, keys: ['G', 'A', 'D', 'E'] }, dots: [rootDot(6, 3, 'I'), rootDot(6, 1, '♭VII', 'fifth'), rootDot(5, 3, 'IV')]
        },
        check: {
          pass: 3, view: [0, 10],
          questions: [
            whichProg('D', P1b7, [P1b7, P1451, P1564], 'fact:hear-b7'),
            tap('Tap the root of ♭VII in A.', Amix.spots('b7', { strings: [6, 5], from: 0, to: 10 }), { item: degreeItem(Amix, 'b7') }),
            tap('Tap the root of V/vi in C, the V of Am.', E7.spots('R', { strings: [6, 5], from: 0, to: 10 }), { item: toneItem(E7, 'R') }),
            tap('From Lesson 5: tap the 5th above A.', P(4, 2), { dots: [As.dot(5, 0, 'note')], item: 'interval:P5' })
          ]
        }
      }
    },
    {
      id: 'l5-6',
      title: 'Hearing progressions',
      review: ['fact:hear-1451', 'fact:hear-6415'],
      steps: {
        hear: { text: 'Three progressions in C: I-IV-V-I, I-V-vi-IV, then ii-V-I.', sound: { seq: [...chordSpecs('C', P1451), null, ...chordSpecs('C', P1564), null, ...chordSpecs('C', P251)], bpm: 80 } },
        learn: {
          cards: [
            { text: 'Follow the lowest note. Does it climb to IV, drop to vi, or start somewhere other than home?', board: { view: [0, 8], dots: [rootDot(5, 3, 'I'), rootDot(4, 3, 'IV'), rootDot(4, 5, 'V'), rootDot(5, 0, 'vi', 'third')] } },
            { text: 'Minor chords sound darker. A dark chord early in the loop is usually vi.', board: { view: [0, 8], dots: [rootDot(5, 0, 'vi', 'third')] } },
            { text: 'I-IV-V sounds bright and bluesy, I-V-vi-IV sounds like pop, and ii-V-I sounds like jazz.', board: { view: [0, 8], dots: [rootDot(4, 0, 'ii', 'third'), rootDot(4, 5, 'V'), rootDot(5, 3, 'I')] } }
          ]
        },
        see: { text: 'The roots of I-V-vi-IV in C.', view: [0, 8], sequence: [rootDot(5, 3, 'I'), rootDot(4, 5, 'V'), rootDot(5, 0, 'vi', 'third'), rootDot(4, 3, 'IV')], bpm: 60, link: { key: 'C', scale: 'major', labels: 'intervals' } },
        try: {
          view: [0, 8],
          tasks: [
            task('Listen: tap the root of the second chord.', Cs.spots('5', { strings: [6, 5, 4], from: 0, to: 8 }), { sound: hearProg('C', ['I', 'V'], 70), item: degreeItem(Cs, '5'), explain: 'Yes! C to G: I to V.' }),
            task('Listen: tap the root of the second chord.', Cs.spots('6', { strings: [6, 5, 4], from: 0, to: 8 }), { sound: hearProg('C', ['I', 'vi'], 70), item: degreeItem(Cs, '6'), explain: 'Yes! C to Am: I to vi.' }),
            task('Listen: tap the root of the second chord.', Cs.spots('4', { strings: [6, 5, 4], from: 0, to: 8 }), { sound: hearProg('C', ['I', 'IV'], 70), item: degreeItem(Cs, '4'), explain: 'Yes! C to F: I to IV.' })
          ]
        },
        play: {
          text: 'I-vi-IV-V, the classic 1950s loop. Say each numeral out loud as the chord changes, then try it with your eyes closed.',
          view: [0, 8], bpm: 80, backing: { key: 'C', progression: ['I', 'vi', 'IV', 'V'], keys: ['C', 'G', 'D', 'A'] }, dots: [rootDot(5, 3, 'I'), rootDot(5, 0, 'vi', 'third'), rootDot(4, 3, 'IV'), rootDot(4, 5, 'V')]
        },
        check: {
          pass: 3, view: [0, 8],
          questions: [
            whichProg('D', P1451, [P1451, P1564, P251], 'fact:hear-1451'),
            whichProg('G', P6415, [P1564, P6415, P1451], 'fact:hear-6415'),
            tap('Listen: tap the root of the second chord.', Cs.spots('5', { strings: [6, 5, 4], from: 0, to: 8 }), { sound: hearProg('C', ['I', 'V'], 70), item: degreeItem(Cs, '5') }),
            tap('From Lesson 4: tap the 3rd of the D chord.', Dmaj.spots('3', { from: 0, to: 8 }), { item: toneItem(Dmaj, '3'), dots: [Dmaj.dot(5, 5)] })
          ]
        }
      }
    },
    {
      id: 'l5-7',
      title: 'A progression in one position',
      review: [toneItem(Dmaj, 'R'), toneItem(Em, 'R'), toneItem(Cmaj, '3'), toneItem(Am, 'R'), toneItem(Gmaj, '3')],
      steps: {
        hear: { text: 'G, D, Em, C, all between frets 2 and 5, with barely any movement.', sound: { seq: [triPos('G'), triPos('D'), triPos('Em'), triPos('C')], bpm: 50 } },
        learn: {
          cards: [
            { text: 'You don\'t have to jump around. Every chord in a key lives within a few frets.', board: { view: [0, 7], dots: [...tri('G'), ...tri('C').filter(d => d.fret === 5)] } },
            { text: 'G, C, D and Em on the top three strings, all between frets 2 and 5.', board: { view: [0, 7], dots: [...tri('G'), ...tri('D'), ...tri('C').filter(d => d.fret === 5)] } },
            { text: 'Move to the closest notes of the next chord. From G to Em, only one note changes: D goes up to E.', board: { view: [0, 7], dots: [...tri('G'), Em.dot(2, 5, 'note')] } }
          ]
        },
        see: { text: 'G, D, Em, C in one position. Watch how little each change moves.', view: [0, 7], sequence: [triPos('G'), triPos('D'), triPos('Em'), triPos('C')], dots: [...tri('G'), ...tri('D'), Em.dot(2, 5, 'note'), Cmaj.dot(3, 5, 'note')], bpm: 40, link: { key: 'G', scale: 'major', labels: 'notes', pos: '2-5' } },
        try: {
          view: [0, 7],
          tasks: [
            task('This is the D chord. Tap its root.', P(2, 3), { item: toneItem(Dmaj, 'R'), dots: Dmaj.dots(without(TRI.D, [[2, 3]])), explain: 'Yes! D.' }),
            task('This is Em. Tap its root.', P(2, 5), { item: toneItem(Em, 'R'), dots: Em.dots(without(TRI.Em, [[2, 5]])), explain: 'Yes! E.' }),
            task('This is C. Tap its 3rd.', P(2, 5), { item: toneItem(Cmaj, '3'), dots: Cmaj.dots(without(TRI.C, [[2, 5]])), explain: 'Yes! E is the 3rd of C.' })
          ]
        },
        play: {
          text: 'I-V-vi-IV in G with the backing track, using only these triads. Keep your hand in one place.',
          view: [0, 7], bpm: 80, beatsPerStep: 4, follow: [triPos('G'), triPos('D'), triPos('Em'), triPos('C')], backing: { key: 'G', progression: P1564 }
        },
        check: {
          pass: 3, view: [0, 7],
          questions: [
            tap('This is Am. Tap its root.', P(1, 5), { item: toneItem(Am, 'R'), dots: Am.dots(without(TRI.Am, [[1, 5]])) }),
            tap('This is G. Tap its 3rd.', P(3, 4), { item: toneItem(Gmaj, '3'), dots: Gmaj.dots(without(TRI.G, [[3, 4]])) }),
            choice('When you change chords, move to the...', ['closest notes', 'highest notes', 'open strings'], 'closest notes', 'fact:voice-leading'),
            tap('From Lesson 4: tap the 3rd of the D chord.', Dmaj.spots('3', { from: 0, to: 7 }), { item: toneItem(Dmaj, '3'), dots: [Dmaj.dot(5, 5)] })
          ]
        }
      }
    }
  ],
  challenge: {
    id: 'l5-challenge', title: 'Level 5 Challenge', challenge: true,
    flow: [
      {
        type: 'learn', name: 'How it works',
        cards: [
          { text: 'Play I-V-vi-IV with the backing track in two keys: G, then C.', board: { view: [0, 7], dots: [...tri('G'), ...tri('D')] } },
          { text: 'Improvise over the loop, then name four progressions by ear.', board: { view: [0, 10], dots: [rootDot(6, 3, 'I'), rootDot(5, 5, 'V'), rootDot(5, 7, 'vi', 'third'), rootDot(5, 3, 'IV')] } }
        ]
      },
      { type: 'play', name: 'In G', text: 'I-V-vi-IV in G: G, D, Em, C. Play along for a few rounds.', view: [0, 7], bpm: 80, beatsPerStep: 4, follow: [triPos('G'), triPos('D'), triPos('Em'), triPos('C')], backing: { key: 'G', progression: P1564 } },
      { type: 'play', name: 'In C', bpmKey: 'c', text: 'Now in C: C, G, Am, F. Use any shapes you know.', view: [0, 10], bpm: 80, backing: { key: 'C', progression: P1564 }, dots: [rootDot(5, 3, 'C'), rootDot(6, 3, 'G'), rootDot(5, 0, 'Am', 'third'), rootDot(6, 1, 'F')] },
      {
        type: 'play', name: 'Improvise', bpmKey: 'improv',
        text: 'Improvise over I-V-vi-IV in G for 60 seconds with the G major pentatonic. Try landing on a note of each new chord as it arrives.',
        view: [0, 6], bpm: 80, seconds: 60, backing: { key: 'G', progression: P1564 }, dots: inKey('G', 'scale', 'major-pentatonic').all({ from: 2, to: 5 })
      },
      {
        type: 'check', name: 'By ear', pass: 3, view: [0, 10],
        questions: [
          whichProg('A', P1564, [P1451, P1564, P251], 'fact:ch5-pop'),
          whichProg('F', P251, [P251, P6415, P1451], 'fact:ch5-251'),
          whichProg('E', P1451, [P1564, P251, P1451], 'fact:ch5-1451'),
          whichProg('D', P6415, [P6415, P1451, P251], 'fact:ch5-6415')
        ]
      }
    ]
  },
  placement: [
    choice('In C major, which chord is V?', ['G', 'F', 'D'], 'G'),
    { ...whichProg('G', P1564, [P1564, P1451, P251]), item: undefined },
    rootQ(As, '4', 'IV')
  ]
};

