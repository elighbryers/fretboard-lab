// Level 1: the neck and note names. Lessons are content only; js/lesson-player.js
// knows how to play them. Positions use guitar numbering: string 6 = low E,
// string 1 = high e, fret 0 = open.
//
// Lesson shape (every step is optional; a lesson without `steps` shows "coming soon"):
//   hear:  { text, sequence: [pos...], bpm }                  sound only, learner taps Play
//   learn: { text, points: [..], board: { view, dots: [{ string, fret, label }] } }
//   see:   { text, view, sequence: [pos...], bpm }            dots light as they sound
//   try:   { view, tasks: [{ prompt, answer: pos }] }         tap the neck, retry until right
//   play:  { text, view, bpm, beatsPerBar, follow: [pos...] } metronome + lights; Next becomes Done;
//          bpm is the starting tempo (learner can change it 40–160; their choice is remembered)
//   check: { pass, view, questions: [
//            { type: 'choice', prompt, options: [..], answer, item }   item = review id
//            { type: 'tap', prompt, answer: pos } ] }                  item = note:X@sN
// pos = { string, fret }

const OPEN_LOW_TO_HIGH = [6, 5, 4, 3, 2, 1].map(string => ({ string, fret: 0 }));

export default {
  id: 'level-1',
  title: 'The neck and note names',
  lessons: [
    {
      id: 'l1-1',
      title: 'String names and fret numbers',
      steps: {
        hear: {
          text: 'These are the six open strings, from the lowest sound to the highest.',
          sequence: OPEN_LOW_TO_HIGH,
          bpm: 80
        },
        learn: {
          text: 'Every string has a number and a name.',
          points: [
            'Strings are numbered 6 to 1. String 6 is the thickest, lowest one (low E). String 1 is the thinnest, highest one (high e).',
            'From 6 to 1 the names are E A D G B E. Try: "Eddie Ate Dynamite, Good Bye Eddie."',
            'Playing a string without pressing any fret is an open string. That counts as fret 0.'
          ],
          board: {
            view: [0, 5],
            dots: [6, 5, 4, 3, 2, 1].map(string => ({ string, fret: 0, label: String(string) }))
          }
        },
        see: {
          text: 'Watch and listen: open strings 6 to 1.',
          view: [0, 5],
          sequence: OPEN_LOW_TO_HIGH,
          bpm: 80
        },
        try: {
          view: [0, 5],
          tasks: [
            { prompt: 'Tap the open A string.', answer: { string: 5, fret: 0 } },
            { prompt: 'Tap the open G string.', answer: { string: 3, fret: 0 } },
            { prompt: 'Tap string 6, fret 5.', answer: { string: 6, fret: 5 } }
          ]
        },
        play: {
          text: 'Pick up your guitar. Play the open strings from 6 to 1, one per click, and say each name out loud: E, A, D, G, B, E.',
          view: [0, 5],
          bpm: 60,
          beatsPerBar: 6,
          follow: OPEN_LOW_TO_HIGH
        },
        check: {
          pass: 3,
          view: [0, 5],
          questions: [
            { type: 'choice', prompt: 'Which string is number 5?', options: ['E', 'A', 'D', 'G'], answer: 'A', item: 'fact:string-5-name' },
            { type: 'tap', prompt: 'Tap the open D string.', answer: { string: 4, fret: 0 } },
            { type: 'tap', prompt: 'Tap string 1, open.', answer: { string: 1, fret: 0 } },
            { type: 'choice', prompt: 'What fret number is an open string?', options: ['0', '1', '12'], answer: '0', item: 'fact:open-string-fret' }
          ]
        }
      }
    },
    { id: 'l1-2', title: 'The musical alphabet' },
    { id: 'l1-3', title: 'Whole and half steps' },
    { id: 'l1-4', title: 'Natural notes on the E and A strings' },
    { id: 'l1-5', title: 'Octave shapes' },
    { id: 'l1-6', title: 'Sharps and flats' },
    { id: 'l1-7', title: 'Landmarks: frets 5, 7 and 12' }
  ],
  challenge: { id: 'l1-challenge', title: 'Level 1 Challenge', challenge: true }
};
