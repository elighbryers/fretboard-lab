// Level 2: the major scale and keys. Every label comes from js/lessons/kit.js
// (a dot outside its key throws when this file loads).
import { P, inKey, noteDot, tap, choice, task, degreeItem, card } from './kit.js';

const G = inKey('G', 'scale', 'major'), A = inKey('A', 'scale', 'major'), C = inKey('C', 'scale', 'major'), D = inKey('D', 'scale', 'major');
const Em = inKey('E', 'scale', 'minor'), Gp = inKey('G', 'scale', 'major-pentatonic');
const Emp = inKey('E', 'scale', 'minor-pentatonic'), Amp = inKey('A', 'scale', 'minor-pentatonic');

// One-octave major shapes: root on the low E string (fret r) or the A string.
const shape6 = r => [[6, r], [6, r + 2], [5, r - 1], [5, r], [5, r + 2], [4, r - 1], [4, r + 1], [4, r + 2]];
const shape5 = r => [[5, r], [5, r + 2], [4, r - 1], [4, r], [4, r + 2], [3, r - 1], [3, r + 1], [3, r + 2]];
const upDown = list => [...list, ...list.slice(0, -1).reverse()];
const ps = list => list.map(([s, f]) => P(s, f));
// G major on one string, and the open-position E minor scale.
const G_ONE = [3, 5, 7, 8, 10, 12, 14, 15].map(f => [6, f]);
const EM_OPEN = [[6, 0], [6, 2], [6, 3], [5, 0], [5, 2], [5, 3], [4, 0], [4, 2]];
const GP_BOX = [[6, 3], [6, 5], [5, 2], [5, 5], [4, 2], [4, 5], [3, 2], [3, 4], [2, 3], [2, 5], [1, 3], [1, 5]];
const root = (k, s, f) => [k.dot(s, f, 'note')];
// E minor pentatonic in the open position (the same notes as G major pentatonic),
// minor pentatonic box 1 (root under the first finger on the low E string: A at fret 5),
// and an original first blues lick in box 1: G E D C A.
const EMP_OPEN = [[6, 0], [6, 3], [5, 0], [5, 2], [4, 0], [4, 2], [3, 0], [3, 2], [2, 0], [2, 3], [1, 0], [1, 3]];
const AMP_BOX1 = [[6, 5], [6, 8], [5, 5], [5, 7], [4, 5], [4, 7], [3, 5], [3, 7], [2, 5], [2, 8], [1, 5], [1, 8]];
const LICK = [[2, 8], [2, 5], [3, 7], [3, 5], [4, 7]];

export default {
  id: 'level-2',
  title: 'The major scale and keys',
  lessons: [
    {
      id: 'l2-1',
      title: 'The major scale pattern',
      review: ['chordshape:c', degreeItem(G, 'R')],
      steps: {
        hear: { text: 'The G major scale, up one string. You know this sound: do re mi fa so la ti do.', sound: { seq: ps(G_ONE), bpm: 90 } },
        learn: {
          cards: [
            card('l2-1.1', { view: [0, 15], dots: G.dots(G_ONE, 'note'), focus: { strings: [6] } }),
            card('l2-1.2', { view: [0, 15], dots: G.dots([[6, 3], [6, 5], [6, 7], [6, 8]], 'note'), focus: { strings: [6] } }),
            card('l2-1.3', { view: [0, 15], dots: G.dots([[6, 7], [6, 8], [6, 14], [6, 15]], 'note'), focus: { strings: [6] } })
          ]
        },
        see: { text: 'G major on the low E string. Count the frets between the lights: 2, 2, 1, 2, 2, 2, 1.', view: [0, 15], sequence: G.dots(G_ONE, 'note'), bpm: 80, link: { key: 'G', scale: 'major', labels: 'notes' } },
        try: {
          view: [0, 15],
          tasks: [
            task('Start on G. Tap the note one whole step up.', P(6, 5), { dots: root(G, 6, 3) }),
            task('Keep going: tap the 4th note of G major (a half step after B).', P(6, 8), { dots: G.dots([[6, 3], [6, 5], [6, 7]], 'note') }),
            task('Tap the note that ends the pattern, G again.', P(6, 15), { dots: G.dots(G_ONE.slice(0, 7), 'note') })
          ]
        },
        play: { skills: ['c'], text: 'Play G major up the low E string and back down, one note per click. Sing along if you like.', view: [0, 15], bpm: 60, follow: ps(upDown(G_ONE)) },
        check: {
          pass: 3, view: [0, 15],
          questions: [
            choice('Which is the major scale pattern?', ['W W H W W W H', 'W H W W H W W', 'W W W H W W H'], 'W W H W W W H', 'fact:major-pattern'),
            tap('In G major, tap the note after B.', P(6, 8), { dots: G.dots([[6, 3], [6, 5], [6, 7]], 'note') }),
            tap('Tap F# on the low E string.', [P(6, 2), P(6, 14)]),
            tap('Tap B on the low E string.', P(6, 7))
          ]
        }
      }
    },
    {
      id: 'l2-2',
      title: 'One-octave scale shapes',
      review: ['chordshape:g', degreeItem(C, 'R')],
      steps: {
        hear: { text: 'G major again, now in one small shape across three strings.', sound: { seq: ps(shape6(3)), bpm: 90 } },
        learn: {
          cards: [
            { text: 'Root on the low E string: two notes there, three on the A string, three on the D string.', board: { view: [0, 6], dots: G.dots(shape6(3), 'note') } },
            { text: 'Root on the A string: the same shape, one string higher. This one is C major.', board: { view: [0, 6], dots: C.dots(shape5(3), 'note') } },
            { text: 'Both shapes start and end on the root, so you always know where you are.', board: { view: [0, 6], dots: G.dots([[6, 3], [4, 5]], 'note') } }
          ]
        },
        see: { text: 'Up and down the G major shape.', view: [0, 6], sequence: G.dots(upDown(shape6(3)), 'note'), bpm: 90, link: { key: 'G', scale: 'major', labels: 'notes', pos: '2-5' } },
        try: {
          view: [0, 6],
          tasks: [
            task('In the G major shape, tap the note after A.', P(5, 2), { dots: G.dots([[6, 3], [6, 5]], 'note') }),
            task('Tap the last note of the shape, the high G.', P(4, 5), { dots: G.dots(shape6(3).slice(0, 7), 'note') }),
            task('Start a C major shape: tap the C on the A string.', P(5, 3))
          ]
        },
        play: { skills: ['g', 'alt-picking'], text: 'Play the G major shape up and down. Use one finger per fret: fingers 1 to 4 cover frets 2 to 5.', view: [0, 6], bpm: 60, follow: ps(upDown(shape6(3))) },
        check: {
          pass: 3, view: [0, 6],
          questions: [
            tap('In the C major shape, tap the note after C.', P(5, 5), { dots: root(C, 5, 3) }),
            tap('Tap the last note of the C major shape.', P(3, 5), { dots: C.dots(shape5(3).slice(0, 7), 'note') }),
            choice('Which string does the G major shape start on?', ['low E', 'A', 'D'], 'low E', 'fact:g-shape-string'),
            tap('Tap B in the G major shape.', P(5, 2), { dots: root(G, 6, 3) })
          ]
        }
      }
    },
    {
      id: 'l2-3',
      title: 'Scale degrees 1 to 7',
      review: [...['R', '3', '5'].map(l => degreeItem(G, l)), 'rhythm:eighths'],
      steps: {
        hear: { text: 'A G drone, then the scale on top. Listen to how the root feels like home.', sound: { seq: ps(shape6(3)), bpm: 80, drone: 'G' } },
        learn: {
          cards: [
            card('l2-3.1', { view: [0, 6], dots: G.dots(shape6(3)) }),
            card('l2-3.2', { view: [0, 6], dots: G.dots([[6, 3], [5, 2], [5, 5], [4, 5]]) }),
            card('l2-3.3', { view: [0, 6], dots: [G.dot(5, 2, 'deg', { label: '3' }), C.dot(4, 2, 'deg')] })
          ]
        },
        see: { text: 'The G major shape with its degree numbers, over a G drone.', view: [0, 6], sequence: G.dots(shape6(3)), bpm: 80, drone: 'G', link: { key: 'G', scale: 'major', labels: 'intervals' } },
        try: {
          view: [0, 6],
          tasks: [
            task('Tap the 5th of G major.', G.spots('5', { from: 0, to: 6 }), { item: degreeItem(G, '5'), dots: root(G, 6, 3), explain: 'Yes! The 5th of G major is D.' }),
            task('Tap the 3rd of G major.', G.spots('3', { from: 0, to: 6 }), { item: degreeItem(G, '3'), dots: root(G, 6, 3), explain: 'Yes! The 3rd of G major is B.' }),
            task('Tap the 6th of G major.', G.spots('6', { from: 0, to: 6 }), { item: degreeItem(G, '6'), dots: root(G, 6, 3), explain: 'Yes! The 6th of G major is E.' })
          ]
        },
        play: { skills: ['eighths'],
          text: 'Improvise: over the G drone, play the G major shape slowly in any order. Every few notes, stop on the R, 3 or 5 and let it ring.',
          view: [0, 6], bpm: 70, drone: 'G', seconds: 45, dots: G.dots(shape6(3))
        },
        check: {
          pass: 3, view: [0, 6],
          questions: [
            tap('Tap the 4th of G major.', G.spots('4', { from: 0, to: 6 }), { item: degreeItem(G, '4'), dots: root(G, 6, 3) }),
            tap('Tap the 7th of G major.', G.spots('7', { from: 0, to: 6 }), { item: degreeItem(G, '7'), dots: root(G, 6, 3) }),
            choice('Which degree is the root?', ['1', '3', '5'], '1', 'fact:root-is-1'),
            tap('From Lesson 1: start on G and tap the note one whole step up.', P(6, 5), { dots: root(G, 6, 3), view: [0, 8] })
          ]
        }
      }
    },
    {
      id: 'l2-4',
      title: 'Moving the shape to any key',
      review: [degreeItem(A, 'R'), degreeItem(A, '3'), degreeItem(D, 'R')],
      steps: {
        hear: { text: 'G major, then the same shape two frets higher: A major.', sound: { seq: [...ps(shape6(3)), null, ...ps(shape6(5))], bpm: 110 } },
        learn: {
          cards: [
            { text: 'Slide the whole shape up two frets and it becomes A major.', board: { view: [2, 9], dots: A.dots(shape6(5), 'note') } },
            { text: 'Put the root on any note of the low E or A string, and the shape gives that major scale. This is D major.', board: { view: [2, 9], dots: D.dots(shape5(5), 'note') } },
            { text: 'So find the root first, then lay the shape on it.', board: { view: [2, 9], dots: [A.dot(6, 5, 'note'), D.dot(5, 5, 'note')] } }
          ]
        },
        see: { text: 'A major, root on the low E string at fret 5.', view: [2, 9], sequence: A.dots(upDown(shape6(5)), 'note'), bpm: 90, link: { key: 'A', scale: 'major', labels: 'notes', pos: '4-7' } },
        try: {
          view: [2, 9],
          tasks: [
            task('Tap the root of A major on the low E string.', P(6, 5)),
            task('Tap the 3rd of A major in this shape.', A.spots('3', { from: 4, to: 7, strings: [6, 5, 4] }), { item: degreeItem(A, '3'), dots: root(A, 6, 5), explain: 'Yes! The 3rd of A major is C#.' }),
            task('Tap the root of D major on the A string.', P(5, 5))
          ]
        },
        play: { skills: ['changes-c-g'], text: 'Play A major up and down from fret 5. Then try D major from the A string at fret 5.', view: [2, 9], bpm: 60, follow: ps(upDown(shape6(5))) },
        check: {
          pass: 3, view: [2, 9],
          questions: [
            tap('Tap the root of B major on the low E string.', P(6, 7)),
            tap('Tap the 5th of A major in this shape.', A.spots('5', { from: 4, to: 7, strings: [6, 5, 4] }), { item: degreeItem(A, '5'), dots: root(A, 6, 5) }),
            tap('Tap the root of C major on the A string.', P(5, 3)),
            tap('From Lesson 3: tap the 3rd of G major.', G.spots('3', { from: 0, to: 6 }), { item: degreeItem(G, '3'), dots: root(G, 6, 3), view: [0, 6] })
          ]
        }
      }
    },
    {
      id: 'l2-6',
      title: 'The relative minor',
      review: [...['R', 'b3', '5'].map(l => degreeItem(Em, l)), 'rhythm:first-strum'],
      steps: {
        hear: { text: 'G major, then the same notes starting from E. Hear how it turns darker.', sound: { seq: [...ps(shape6(3)), null, ...ps(EM_OPEN)], bpm: 110 } },
        learn: {
          cards: [
            card('l2-6.1', { view: [0, 5], dots: Em.dots(EM_OPEN, 'note') }),
            { text: 'Every major key has a relative minor that shares all its notes. Its root is three frets below the major root.', board: { view: [0, 5], dots: [G.dot(6, 3, 'note'), Em.dot(6, 0, 'note')] } },
            card('l2-6.3', { view: [0, 5], dots: Em.dots(EM_OPEN) })
          ]
        },
        see: { text: 'E minor over an E drone.', view: [0, 5], sequence: Em.dots(EM_OPEN), bpm: 80, drone: 'E', link: { key: 'E', scale: 'minor', labels: 'intervals' } },
        try: {
          view: [0, 12],
          tasks: [
            task('Tap the root of G major\'s relative minor on the low E string.', [P(6, 0), P(6, 12)], { dots: root(G, 6, 3) }),
            task('Tap the b3 of E minor.', Em.spots('b3', { from: 0, to: 4 }), { item: degreeItem(Em, 'b3'), view: [0, 5], explain: 'Yes! The b3 of E minor is G.' }),
            task('Tap the root of C major\'s relative minor on the A string.', [P(5, 0), P(5, 12)], { dots: root(C, 5, 3) })
          ]
        },
        play: { skills: ['first-strum'],
          text: 'Improvise: over an E drone, play the E minor notes in any order. Let the root and b3 ring.',
          view: [0, 5], bpm: 70, drone: 'E', seconds: 45, dots: Em.dots(EM_OPEN)
        },
        check: {
          pass: 3, view: [0, 5],
          questions: [
            choice('What is the relative minor of C major?', ['A minor', 'E minor', 'D minor'], 'A minor', 'fact:relative-minor-c'),
            tap('Tap the 5th of E minor.', Em.spots('5', { from: 0, to: 4 }), { item: degreeItem(Em, '5') }),
            choice('How many notes do G major and E minor share?', ['All 7', '5', '3'], 'All 7', 'fact:relative-share'),
            tap('From Lesson 3: tap the 6th of G major.', G.spots('6', { from: 0, to: 6 }), { item: degreeItem(G, '6'), dots: root(G, 6, 3), view: [0, 6] })
          ]
        }
      }
    },
    {
      id: 'l2-7',
      title: 'The major pentatonic',
      review: ['R', '2', '3', '5', '6'].map(l => degreeItem(Gp, l)),
      steps: {
        hear: { text: 'The G major pentatonic: five notes that sound open and happy.', sound: { seq: ps(GP_BOX), bpm: 100 } },
        learn: {
          cards: [
            card('l2-7.1', { view: [0, 6], dots: Gp.dots(shape6(3).filter(([s, f]) => !['4', '7'].includes(G.info(s, f).label))) }),
            card('l2-7.2', { view: [0, 6], dots: Gp.dots(shape6(3).filter(([s, f]) => !['4', '7'].includes(G.info(s, f).label)), 'note') }),
            { text: 'This box covers all six strings of G major pentatonic, frets 2 to 5.', board: { view: [0, 6], dots: Gp.dots(GP_BOX) } }
          ]
        },
        see: { text: 'Up and down the G major pentatonic box.', view: [0, 6], sequence: Gp.dots(upDown(GP_BOX)), bpm: 110, link: { key: 'G', scale: 'major-pentatonic', labels: 'intervals', pos: '2-5' } },
        try: {
          view: [2, 5],
          tasks: [
            task('Tap a note of G major that the pentatonic leaves out: the 4th.', G.spots('4', { from: 2, to: 5 }), { item: degreeItem(G, '4'), dots: root(G, 6, 3), explain: 'Yes! C is the 4th, so the pentatonic skips it.' }),
            task('Tap the 6th of G major pentatonic.', Gp.spots('6', { from: 2, to: 5 }), { item: degreeItem(Gp, '6'), dots: root(G, 6, 3), explain: 'Yes! The 6th is E.' }),
            task('Tap the 2nd of G major pentatonic.', Gp.spots('2', { from: 2, to: 5 }), { item: degreeItem(Gp, '2'), dots: root(G, 6, 3), explain: 'Yes! The 2nd is A.' })
          ]
        },
        play: {
          text: 'Improvise with the G major pentatonic box over a G drone. Short phrases, then rest. End each phrase on a G.',
          view: [0, 6], bpm: 80, drone: 'G', seconds: 60, dots: Gp.dots(GP_BOX)
        },
        check: {
          pass: 3, view: [2, 5],
          questions: [
            choice('Which degrees does the major pentatonic leave out?', ['4 and 7', '2 and 6', '3 and 5'], '4 and 7', 'fact:pentatonic-leaves'),
            tap('Tap the 3rd of G major pentatonic.', Gp.spots('3', { from: 2, to: 5 }), { item: degreeItem(Gp, '3'), dots: root(G, 6, 3) }),
            tap('Tap the 5th of G major pentatonic.', Gp.spots('5', { from: 2, to: 5 }), { item: degreeItem(Gp, '5'), dots: root(G, 6, 3) }),
            tap('From Lesson 5: tap the root of G major\'s relative minor on the low E string.', [P(6, 0), P(6, 12)], { view: [0, 12], dots: root(G, 6, 3) })
          ]
        }
      }
    },
    {
      id: 'l2-minpent',
      title: 'The minor pentatonic, box 1',
      review: ['R', 'b3', '4', '5', 'b7'].map(l => degreeItem(Amp, l)),
      steps: {
        hear: { text: 'The minor pentatonic, then a first blues lick made from it.', sound: { seq: [...ps(AMP_BOX1), null, ...ps(LICK)], bpm: 110 } },
        learn: {
          cards: [
            card('l2-minpent.1', { view: [0, 5], dots: Emp.dots(EMP_OPEN) }),
            { text: 'Its degrees are 1 b3 4 5 b7. Box 1 puts the root under your first finger on the low E string: at fret 5 it is A minor pentatonic.', board: { view: [3, 10], dots: Amp.dots(AMP_BOX1) } },
            card('l2-minpent.3', { view: [3, 10], dots: Amp.dots(LICK) })
          ]
        },
        see: { text: 'Box 1 up and down, then the lick.', view: [3, 10], sequence: [...Amp.dots(upDown(AMP_BOX1)), null, ...Amp.dots(LICK)], dots: Amp.dots(AMP_BOX1), bpm: 120, link: { key: 'A', scale: 'minor-pentatonic', labels: 'intervals', pos: '5-8' } },
        try: {
          view: [4, 9],
          tasks: [
            task('In box 1, tap the b3.', Amp.spots('b3', { from: 4, to: 9 }), { item: degreeItem(Amp, 'b3'), explain: 'Yes! C, the b3 of A minor pentatonic.' }),
            task('Tap a root.', Amp.spots('R', { from: 4, to: 9 }), { item: degreeItem(Amp, 'R'), explain: 'Yes! A.' }),
            task('Tap the b7.', Amp.spots('b7', { from: 4, to: 9 }), { item: degreeItem(Amp, 'b7'), explain: 'Yes! G, the b7.' })
          ]
        },
        play: {
          text: 'Play the lick a few times, then improvise for 60 seconds over the A drone with box 1. Short phrases, and end on an A.',
          view: [3, 10], bpm: 80, drone: 'A', seconds: 60, dots: Amp.dots(AMP_BOX1)
        },
        check: {
          pass: 3, view: [4, 9],
          questions: [
            tap('In box 1, tap the 4th.', Amp.spots('4', { from: 4, to: 9 }), { item: degreeItem(Amp, '4') }),
            tap('In box 1, tap the 5th.', Amp.spots('5', { from: 4, to: 9 }), { item: degreeItem(Amp, '5') }),
            choice('E minor pentatonic has the same notes as...', ['G major pentatonic', 'E major pentatonic', 'A major pentatonic'], 'G major pentatonic', 'fact:relative-pentatonic'),
            tap('From Lesson 5: tap the b3 of E minor.', Em.spots('b3', { from: 0, to: 4 }), { item: degreeItem(Em, 'b3'), view: [0, 5] })
          ]
        }
      }
    }
  ],
  challenge: {
    id: 'l2-challenge', title: 'Level 2 Challenge', challenge: true,
    flow: [
      {
        type: 'learn', name: 'How it works',
        cards: [
          { text: 'First, play G major up and down in time with the click.', board: { view: [0, 6], dots: G.dots(shape6(3), 'note') } },
          { text: 'Then improvise for 60 seconds over a G drone, using only G major. Finish with four quick questions.', board: { view: [0, 6], dots: G.dots(shape6(3)) } }
        ]
      },
      { type: 'play', name: 'In time', text: 'Play G major up and down, one note per click. Go round as many times as you like.', view: [0, 6], bpm: 70, follow: ps(upDown(shape6(3))) },
      { type: 'play', name: 'Improvise', bpmKey: 'improv', text: 'Improvise over the G drone with G major for 60 seconds. Any order, any rhythm. Land on R, 3 or 5 to finish a phrase.', view: [0, 6], bpm: 70, drone: 'G', seconds: 60, dots: G.dots(shape6(3)) },
      {
        type: 'check', name: 'Check it', pass: 3, view: [0, 6],
        questions: [
          tap('Tap the 3rd of G major.', G.spots('3', { from: 0, to: 6 }), { item: degreeItem(G, '3'), dots: root(G, 6, 3) }),
          tap('Tap the 5th of G major.', G.spots('5', { from: 0, to: 6 }), { item: degreeItem(G, '5'), dots: root(G, 6, 3) }),
          tap('Tap the root of A major on the low E string.', P(6, 5), { view: [0, 9] }),
          choice('What is the relative minor of G major?', ['E minor', 'A minor', 'B minor'], 'E minor', 'fact:relative-minor-g')
        ]
      }
    ]
  },
  placement: [
    tap('Tap the 3rd of G major.', G.spots('3', { from: 0, to: 6 }), { view: [0, 6], dots: root(G, 6, 3) }),
    tap('Tap the root of A major on the low E string.', P(6, 5)),
    choice('Which degrees does the major pentatonic leave out?', ['4 and 7', '2 and 6', '3 and 5'], '4 and 7')
  ]
};
