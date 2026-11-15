// Level 3: intervals. Labels are worked out by js/lessons/kit.js; answers are
// the exact pitch above the root (above()), so "the 3rd above this C" can't be
// confused with an E an octave higher.
import { P, inKey, tap, choice, task, above, degreeItem } from './kit.js';

// Chromatic "keys" label any note by its interval from the root: R b2 2 b3 3 4 b5 5 b6 6 b7 7.
const Gc = inKey('G', 'scale', 'chromatic'), Cc = inKey('C', 'scale', 'chromatic'), Ac = inKey('A', 'scale', 'chromatic');
const Dc = inKey('D', 'scale', 'chromatic'), Ec = inKey('E', 'scale', 'chromatic');
const G = inKey('G', 'scale', 'major');
const SEMI = { m3: 3, M3: 4, P4: 5, P5: 7, m6: 8, M6: 9, m7: 10, M7: 11, P8: 12 };
const NAME = { m3: 'minor 3rd', M3: 'major 3rd', P4: 'perfect 4th', P5: 'perfect 5th', m6: 'minor 6th', M6: 'major 6th', m7: 'minor 7th', M7: 'major 7th', P8: 'octave' };
// A root dot (labelled R) for a chromatic key at a position.
const R = (k, s, f) => [k.dot(s, f)];
// "Tap the <interval> above this root": exact answers, the root shown, review item interval:<id>.
const ivTask = (k, s, f, id, view, extra = {}) => task(extra.prompt || `Tap the ${NAME[id]} above this root.`, above(P(s, f), SEMI[id], { from: view[0], to: view[1] }),
  { dots: R(k, s, f), view, item: SEMI[id] < 12 ? `interval:${id}` : undefined, explain: `Yes! That's the ${NAME[id]}: ${k.name(labelOf(id))}.`, ...extra });
const ivQ = (k, s, f, id, view, extra = {}) => tap(extra.prompt || `Tap the ${NAME[id]} above this root.`, above(P(s, f), SEMI[id], { from: view[0], to: view[1] }),
  { dots: R(k, s, f), view, item: SEMI[id] < 12 ? `interval:${id}` : undefined, ...extra });
const labelOf = id => ({ m3: 'b3', M3: '3', P4: '4', P5: '5', m6: 'b6', M6: '6', m7: 'b7', M7: '7', P8: 'R' }[id]);
// A two-note sound: root, then the note above, then both together.
const pair = (s, f, semis) => { const top = above(P(s, f), semis, { from: 0, to: 15 })[0]; return { seq: [P(s, f), top, null, [P(s, f), top]], bpm: 70 }; };
const listen = (s, f, id, options, prompt = 'Listen. Which interval is it?') =>
  choice(prompt, options.map(o => NAME[o]), NAME[id], `interval-ear:${id}`, { sound: pair(s, f, SEMI[id]) });
// Over a G drone: a note to find by ear.
const heard = (s, f) => ({ seq: [null, P(s, f), null, P(s, f)], bpm: 70, drone: 'G' });
const G_SHAPE = [[6, 3], [6, 5], [5, 2], [5, 3], [5, 5], [4, 2], [4, 4], [4, 5]];

export default {
  id: 'level-3',
  title: 'Intervals',
  lessons: [
    {
      id: 'l3-1',
      title: 'Intervals from the root',
      review: [degreeItem(inKey('C', 'scale', 'major'), '2')],
      steps: {
        hear: { text: 'C, then E. C, then G. C, then C an octave up. Three distances from one root.', sound: { seq: [P(5, 3), P(4, 2), null, P(5, 3), P(4, 5), null, P(5, 3), P(3, 5)], bpm: 90 } },
        learn: {
          cards: [
            { text: 'An interval is the distance from the root to another note.', board: { view: [0, 7], dots: Cc.dots([[5, 3], [4, 2]]) } },
            { text: 'We name it by the scale degree it lands on. C to E is a 3rd, and C to G is a 5th.', board: { view: [0, 7], dots: Cc.dots([[5, 3], [4, 2], [4, 5]]) } },
            { text: 'Count the root as 1. C, D, E is three letters, so C to E is a 3rd.', board: { view: [0, 7], dots: Cc.dots([[5, 3], [5, 5], [4, 2]]) } }
          ]
        },
        see: { text: 'Every degree of C major, named as an interval from C.', view: [0, 7], sequence: Cc.dots([[5, 3], [5, 5], [4, 2], [4, 3], [4, 5], [3, 2], [3, 4], [3, 5]]), bpm: 80, link: { key: 'C', scale: 'major', labels: 'intervals' } },
        try: {
          view: [0, 7],
          tasks: [
            ivTask(Cc, 5, 3, 'M3', [0, 7], { prompt: 'Tap the 3rd above this C.' }),
            ivTask(Cc, 5, 3, 'P5', [0, 7], { prompt: 'Tap the 5th above this C.' }),
            task('Tap the 2nd above this C.', above(P(5, 3), 2, { from: 0, to: 7 }), { dots: R(Cc, 5, 3), item: degreeItem(inKey('C', 'scale', 'major'), '2'), explain: 'Yes! The 2nd above C is D.' })
          ]
        },
        play: { text: 'Play root, 3rd, 5th, 3rd from C, and say the names as you go: "root, three, five, three".', view: [0, 7], bpm: 60, follow: [P(5, 3), P(4, 2), P(4, 5), P(4, 2)] },
        check: {
          pass: 3, view: [0, 8],
          questions: [
            choice('C to G is a...', ['3rd', '4th', '5th'], '5th', 'fact:c-to-g'),
            ivQ(Gc, 6, 3, 'M3', [0, 8], { prompt: 'Tap the 3rd above this G.' }),
            ivQ(Gc, 6, 3, 'P5', [0, 8], { prompt: 'Tap the 5th above this G.' }),
            ivQ(Cc, 5, 3, 'P4', [0, 8], { prompt: 'Tap the 4th above this C.' })
          ]
        }
      }
    },
    {
      id: 'l3-2',
      title: 'Shapes for the 3rd, 5th and octave',
      review: ['interval:M3', 'interval:P5'],
      steps: {
        hear: { text: 'Root, 3rd, 5th and octave from G, then the same from A.', sound: { seq: [P(6, 3), P(5, 2), P(5, 5), P(4, 5), null, P(6, 5), P(5, 4), P(5, 7), P(4, 7)], bpm: 100 } },
        learn: {
          cards: [
            { text: 'The 3rd: one string up, one fret back.', board: { view: [0, 7], dots: Gc.dots([[6, 3], [5, 2]]) } },
            { text: 'The 5th: one string up, two frets up. The octave: two strings up, two frets up.', board: { view: [0, 7], dots: Gc.dots([[6, 3], [5, 5], [4, 5]]) } },
            { text: 'Crossing onto the B string, every shape moves one fret higher.', board: { view: [0, 7], dots: Ac.dots([[3, 2], [2, 2], [2, 5]]) } }
          ]
        },
        see: { text: 'Root, 3rd, 5th and octave from G. Watch the shape, not the frets.', view: [0, 7], sequence: Gc.dots([[6, 3], [5, 2], [5, 5], [4, 5]]), bpm: 70, link: { key: 'G', scale: 'major', labels: 'intervals' } },
        try: {
          view: [0, 9],
          tasks: [
            ivTask(Ac, 6, 5, 'M3', [0, 9], { prompt: 'Tap the 3rd above this root.' }),
            ivTask(Dc, 5, 5, 'P5', [0, 9], { prompt: 'Tap the 5th above this root.' }),
            ivTask(Ac, 3, 2, 'M3', [0, 9], { prompt: 'Across the B string: tap the 3rd above this root.' })
          ]
        },
        play: { text: 'Play root, 3rd, 5th, octave from G, then from A and C. Same shape each time.', view: [0, 9], bpm: 60, follow: [P(6, 3), P(5, 2), P(5, 5), P(4, 5), P(6, 5), P(5, 4), P(5, 7), P(4, 7), P(5, 3), P(4, 2), P(4, 5), P(3, 5)] },
        check: {
          pass: 3, view: [0, 12],
          questions: [
            ivQ(Cc, 5, 3, 'P8', [0, 12], { prompt: 'Tap the C one octave above this root.' }),
            ivQ(Dc, 5, 5, 'M3', [0, 12], { prompt: 'Tap the 3rd above this root.' }),
            ivQ(Dc, 3, 7, 'P5', [0, 12], { prompt: 'Across the B string: tap the 5th above this root.' }),
            choice('From Lesson 1: C to E is a...', ['2nd', '3rd', '5th'], '3rd', 'fact:c-to-e')
          ]
        }
      }
    },
    {
      id: 'l3-3',
      title: 'Major and minor 3rds',
      review: ['interval:m3', 'interval:M3', 'interval-ear:M3', 'interval-ear:m3'],
      steps: {
        hear: { text: 'C to E (a major 3rd), then C to Eb (a minor 3rd). One sounds bright, one sounds sad.', sound: { seq: [P(5, 3), P(4, 2), null, P(5, 3), P(4, 1)], bpm: 70 } },
        learn: {
          cards: [
            { text: 'A major 3rd is 4 frets above the root. It sounds bright.', board: { view: [0, 7], dots: Cc.dots([[5, 3], [4, 2]]) } },
            { text: 'A minor 3rd is 3 frets above the root, written b3. It sounds darker.', board: { view: [0, 7], dots: Cc.dots([[5, 3], [4, 1]]) } },
            { text: 'On the neck, the major 3rd is one string up and one fret back. The minor 3rd is two frets back.', board: { view: [0, 7], dots: Gc.dots([[6, 3], [5, 2], [5, 1]]) } }
          ]
        },
        see: { text: 'G to B (major), then G to Bb (minor).', view: [0, 7], sequence: [...Gc.dots([[6, 3], [5, 2]]), null, ...Gc.dots([[6, 3], [5, 1]])], bpm: 60, link: { key: 'G', scale: 'minor', labels: 'intervals' } },
        try: {
          view: [0, 9],
          tasks: [
            ivTask(Gc, 6, 3, 'm3', [0, 9]),
            ivTask(Cc, 5, 3, 'M3', [0, 9]),
            task('Listen, then tap the 3rd you heard above this C.', above(P(5, 3), 3, { from: 0, to: 9 }), { dots: R(Cc, 5, 3), sound: pair(5, 3, 3), item: 'interval-ear:m3', explain: 'Yes! That darker sound is the minor 3rd, Eb.' })
          ]
        },
        play: { text: 'From G: play the root and major 3rd, then the root and minor 3rd. Listen for bright, then dark.', view: [0, 7], bpm: 60, follow: [P(6, 3), P(5, 2), P(6, 3), P(5, 1)] },
        check: {
          pass: 3, view: [0, 10],
          questions: [
            listen(5, 3, 'M3', ['M3', 'm3']),
            ivQ(Ac, 6, 5, 'm3', [0, 10]),
            ivQ(Dc, 5, 5, 'M3', [0, 10]),
            ivQ(Gc, 6, 3, 'P8', [0, 10], { prompt: 'From Lesson 2: tap the G one octave above this root.' })
          ]
        }
      }
    },
    {
      id: 'l3-4',
      title: '4ths, 5ths and power chords',
      review: ['interval:P4', 'interval:P5', 'interval-ear:P4', 'interval-ear:P5'],
      steps: {
        hear: { text: 'Three power chords: G5, A5 and C5.', sound: { seq: [[P(6, 3), P(5, 5), P(4, 5)], [P(6, 5), P(5, 7), P(4, 7)], [P(5, 3), P(4, 5), P(3, 5)]], bpm: 50 } },
        learn: {
          cards: [
            { text: 'A perfect 4th is 5 frets up: the same fret on the next string.', board: { view: [0, 7], dots: Gc.dots([[6, 3], [5, 3]]) } },
            { text: 'A perfect 5th is 7 frets up: next string, two frets up.', board: { view: [0, 7], dots: Gc.dots([[6, 3], [5, 5]]) } },
            { text: 'Root and 5th together (often with the octave) is a power chord, written G5.', board: { view: [0, 7], dots: Gc.dots([[6, 3], [5, 5], [4, 5]]) } }
          ]
        },
        see: { text: 'G to C (a 4th), G to D (a 5th), then the G5 power chord.', view: [0, 7], sequence: [...Gc.dots([[6, 3], [5, 3]]), null, ...Gc.dots([[6, 3], [5, 5]]), null, Gc.dots([[6, 3], [5, 5], [4, 5]])], bpm: 60, link: { key: 'G', chord: '5', labels: 'intervals' } },
        try: {
          view: [0, 9],
          tasks: [
            ivTask(Ac, 6, 5, 'P4', [0, 9]),
            ivTask(Cc, 5, 3, 'P5', [0, 9]),
            ivTask(Ac, 6, 5, 'P5', [0, 9], { prompt: 'Make an A5 power chord: tap the 5th above this root.' })
          ]
        },
        play: {
          text: 'Play four power chords, one per bar: G5, A5, C5, D5. Mute the other strings with your fretting hand.',
          view: [0, 9], bpm: 80, beatsPerStep: 4,
          follow: [[P(6, 3), P(5, 5), P(4, 5)], [P(6, 5), P(5, 7), P(4, 7)], [P(5, 3), P(4, 5), P(3, 5)], [P(5, 5), P(4, 7), P(3, 7)]]
        },
        check: {
          pass: 3, view: [0, 9],
          questions: [
            listen(5, 3, 'P4', ['P4', 'P5']),
            ivQ(Dc, 5, 5, 'P4', [0, 9]),
            ivQ(Ec, 6, 0, 'P5', [0, 9]),
            ivQ(Cc, 5, 3, 'm3', [0, 9], { prompt: 'From Lesson 3: tap the minor 3rd above this root.' })
          ]
        }
      }
    },
    {
      id: 'l3-5',
      title: '6ths and 7ths',
      review: ['interval:m6', 'interval:M6', 'interval:m7', 'interval:M7', 'interval-ear:m7', 'interval-ear:M7'],
      steps: {
        hear: { text: 'From G: a major 6th, a minor 7th, then a major 7th.', sound: { seq: [P(6, 3), P(4, 2), null, P(6, 3), P(4, 3), null, P(6, 3), P(4, 4)], bpm: 80 } },
        learn: {
          cards: [
            { text: 'Major 6th: two strings up, one fret back. Minor 6th: two frets back.', board: { view: [0, 7], dots: Gc.dots([[6, 3], [4, 2], [4, 1]]) } },
            { text: 'Minor 7th: two strings up, same fret. It sounds bluesy and unfinished.', board: { view: [0, 7], dots: Gc.dots([[6, 3], [4, 3]]) } },
            { text: 'Major 7th: one fret further, just below the octave. It sounds dreamy.', board: { view: [0, 7], dots: Gc.dots([[6, 3], [4, 4], [4, 5]]) } }
          ]
        },
        see: { text: 'G to E, G to F, G to F#, then home to G.', view: [0, 7], sequence: Gc.dots([[6, 3], [4, 2], [4, 3], [4, 4], [4, 5]]), bpm: 70, link: { key: 'G', scale: 'mixolydian', labels: 'intervals' } },
        try: {
          view: [0, 10],
          tasks: [
            ivTask(Ac, 6, 5, 'M6', [0, 10]),
            ivTask(Cc, 5, 3, 'm7', [0, 10]),
            ivTask(Cc, 5, 3, 'M7', [0, 10])
          ]
        },
        play: { text: 'From G, play root, 6th, minor 7th, major 7th, octave. Slowly, and listen to each one against the root.', view: [0, 7], bpm: 56, follow: [P(6, 3), P(4, 2), P(4, 3), P(4, 4), P(4, 5)] },
        check: {
          pass: 3, view: [0, 10],
          questions: [
            listen(6, 3, 'm7', ['m7', 'M7']),
            ivQ(Gc, 6, 3, 'm6', [0, 10]),
            ivQ(Cc, 5, 3, 'M6', [0, 10]),
            ivQ(Gc, 6, 3, 'P4', [0, 10], { prompt: 'From Lesson 4: tap the perfect 4th above this root.' })
          ]
        }
      }
    },
    {
      id: 'l3-6',
      title: 'Hearing intervals in a key',
      review: ['ear:R', 'ear:3', 'ear:5', 'ear:4'],
      steps: {
        hear: { text: 'A G drone, then the root, 3rd and 5th on top.', sound: { seq: [null, P(6, 3), P(5, 2), P(5, 5), P(4, 5)], bpm: 60, drone: 'G' } },
        learn: {
          cards: [
            { text: 'A drone holds the root under everything. Each degree has its own feeling against it.', board: { view: [0, 6], dots: G.dots([[6, 3]]) } },
            { text: 'The root sounds like home, the 5th strong and open, the 3rd sweet.', board: { view: [0, 6], dots: G.dots([[6, 3], [5, 2], [5, 5]]) } },
            { text: 'To find a note you hear, sing it, then search near the root with the shapes you know.', board: { view: [0, 6], dots: G.dots(G_SHAPE) } }
          ]
        },
        see: { text: 'The G major shape over a G drone. Listen to each degree\'s feeling.', view: [0, 6], sequence: G.dots(G_SHAPE), bpm: 70, drone: 'G', link: { key: 'G', scale: 'major', labels: 'intervals' } },
        try: {
          view: [0, 6],
          tasks: [
            task('Listen over the drone, then tap the note you heard.', G.spots('3', { from: 0, to: 6 }), { sound: heard(5, 2), item: 'ear:3', dots: [G.dot(6, 3)], explain: 'Yes! That sweet sound is the 3rd, B.' }),
            task('Listen again, then tap the note you heard.', G.spots('5', { from: 0, to: 6 }), { sound: heard(5, 5), item: 'ear:5', dots: [G.dot(6, 3)], explain: 'Yes! That open sound is the 5th, D.' }),
            task('One more: tap the note you heard.', G.spots('R', { from: 0, to: 6 }), { sound: heard(4, 5), item: 'ear:R', dots: [G.dot(6, 3)], explain: 'Yes! Home: the root, G.' })
          ]
        },
        play: {
          text: 'Over the drone, play a note from the shape, sing it, then find the same note an octave higher. Keep going for 45 seconds.',
          view: [0, 6], bpm: 70, drone: 'G', seconds: 45, dots: G.dots(G_SHAPE)
        },
        check: {
          pass: 3, view: [0, 6],
          questions: [
            tap('Listen over the drone, then tap the note you heard.', G.spots('3', { from: 0, to: 6 }), { sound: heard(5, 2), item: 'ear:3', dots: [G.dot(6, 3)] }),
            tap('Listen, then tap the note you heard.', G.spots('5', { from: 0, to: 6 }), { sound: heard(5, 5), item: 'ear:5', dots: [G.dot(6, 3)] }),
            tap('Listen, then tap the note you heard.', G.spots('4', { from: 0, to: 6 }), { sound: heard(5, 3), item: 'ear:4', dots: [G.dot(6, 3)] }),
            ivQ(Cc, 5, 3, 'm7', [0, 6], { prompt: 'From Lesson 5: tap the minor 7th above this root.' })
          ]
        }
      }
    },
    {
      id: 'l3-7',
      title: 'Mixed interval drill',
      review: ['interval:m6', 'interval-ear:M6', 'interval-ear:m6'],
      steps: {
        hear: { text: 'Four intervals from C: a major 3rd, a 5th, a minor 7th and a 4th.', sound: { seq: [P(5, 3), P(4, 2), null, P(5, 3), P(4, 5), null, P(5, 3), P(3, 3), null, P(5, 3), P(4, 3)], bpm: 100 } },
        learn: {
          cards: [
            { text: 'Here are all eight intervals you know, from one root.', board: { view: [0, 6], dots: Cc.dots([[5, 3], [4, 1], [4, 2], [4, 3], [4, 5], [3, 1], [3, 2], [3, 3], [3, 4]]) } },
            { text: 'They come in confusable pairs: minor and major 3rds, 4ths and 5ths, minor and major 6ths and 7ths.', board: { view: [0, 6], dots: Cc.dots([[5, 3], [4, 1], [4, 2], [4, 3], [4, 5]]) } },
            { text: 'The trick: find the major shape first, then move one fret back for the minor one.', board: { view: [0, 6], dots: Cc.dots([[5, 3], [3, 3], [3, 4]]) } }
          ]
        },
        see: { text: 'Every interval from C, smallest to largest.', view: [0, 6], sequence: Cc.dots([[5, 3], [4, 1], [4, 2], [4, 3], [4, 5], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5]]), bpm: 80, link: { key: 'C', scale: 'chromatic', labels: 'intervals' } },
        try: {
          view: [0, 10],
          tasks: [
            ivTask(Gc, 6, 3, 'M7', [0, 10]),
            ivTask(Cc, 5, 3, 'm6', [0, 10]),
            ivTask(Dc, 5, 5, 'P4', [0, 10])
          ]
        },
        play: { text: 'From C, play every interval up to the octave and say each name. Then try it from D.', view: [0, 6], bpm: 50, follow: [[5, 3], [4, 1], [4, 2], [4, 3], [4, 5], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5]].map(([s, f]) => P(s, f)) },
        check: {
          pass: 3, view: [0, 10],
          questions: [
            listen(5, 3, 'M6', ['m6', 'M6']),
            ivQ(Dc, 5, 5, 'm3', [0, 10]),
            ivQ(Ac, 5, 0, 'P5', [0, 10]),
            tap('From Level 2: tap the 3rd of G major.', G.spots('3', { from: 0, to: 6 }), { item: degreeItem(G, '3'), dots: [G.dot(6, 3)], view: [0, 6] })
          ]
        }
      }
    }
  ],
  challenge: {
    id: 'l3-challenge', title: 'Level 3 Challenge', challenge: true,
    flow: [
      {
        type: 'learn', name: 'How it works',
        cards: [
          { text: 'A note plays over a G drone. Find it on the neck, then name its interval.', board: { view: [0, 6], dots: G.dots(G_SHAPE) } },
          { text: 'Then answer a short call-and-response over the drone, using only R, 3 and 5.', board: { view: [0, 6], dots: G.dots([[6, 3], [5, 2], [5, 5], [4, 5]]) } }
        ]
      },
      {
        type: 'check', name: 'Hear and find', pass: 4, view: [0, 6],
        questions: [
          tap('Listen, then tap the note you heard.', G.spots('3', { from: 0, to: 6 }), { sound: heard(5, 2), item: 'ear:3', dots: [G.dot(6, 3)] }),
          choice('Which interval above G was it?', ['major 3rd', 'perfect 5th', 'major 6th'], 'major 3rd', 'fact:ch3-heard-3', { sound: heard(5, 2) }),
          tap('Listen, then tap the note you heard.', G.spots('5', { from: 0, to: 6 }), { sound: heard(5, 5), item: 'ear:5', dots: [G.dot(6, 3)] }),
          choice('Which interval above G was it?', ['perfect 4th', 'perfect 5th', 'major 7th'], 'perfect 5th', 'fact:ch3-heard-5', { sound: heard(5, 5) }),
          tap('Listen, then tap the note you heard.', G.spots('6', { from: 0, to: 6 }), { sound: heard(4, 2), item: 'ear:6', dots: [G.dot(6, 3)] }),
          choice('Which interval above G was it?', ['minor 3rd', 'perfect 4th', 'major 6th'], 'major 6th', 'fact:ch3-heard-6', { sound: heard(4, 2) })
        ]
      },
      {
        type: 'play', name: 'Call and response', bpmKey: 'improv',
        text: 'Over the drone: play a short phrase with R, 3 and 5 (the call), then answer it with a different phrase using the same notes. Keep trading for 60 seconds.',
        view: [0, 6], bpm: 70, drone: 'G', seconds: 60, dots: G.dots([[6, 3], [5, 2], [5, 5], [4, 5]])
      },
      {
        type: 'check', name: 'Check it', pass: 3, view: [0, 10],
        questions: [
          ivQ(Ac, 6, 5, 'M3', [0, 10]),
          ivQ(Cc, 5, 3, 'P5', [0, 10]),
          ivQ(Dc, 5, 5, 'm7', [0, 10]),
          listen(6, 3, 'm3', ['M3', 'm3'])
        ]
      }
    ]
  },
  placement: [
    ivQ(Cc, 5, 3, 'M3', [0, 9], { item: undefined }),
    ivQ(Gc, 6, 3, 'P5', [0, 9], { item: undefined }),
    { ...listen(5, 3, 'm3', ['M3', 'm3']), item: undefined }
  ]
};
