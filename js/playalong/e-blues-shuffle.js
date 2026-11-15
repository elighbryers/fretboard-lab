// Original shuffle riff in E (a boogie-style bass line). Shuffle feel:
// each beat is a long-short pair (2/3 + 1/3 of a beat).
const L = 2 / 3, S = 1 / 3;
const onE = [[6, 0, L], [6, 4, S], [5, 2, L], [5, 4, S], [4, 0, L], [5, 4, S], [5, 2, L], [6, 4, S]]; // E G# B C# D C# B G#
const onA = [[5, 0, L], [5, 4, S], [4, 2, L], [4, 4, S], [3, 0, L], [4, 4, S], [4, 2, L], [5, 4, S]]; // A C# E F# G F# E C#
const turn = [[5, 2, L], [5, 2, S], [5, 1, L], [5, 1, S], [5, 0, L], [6, 4, S], [6, 0, 1]];           // B B Bb Bb A G# E
export default {
  id: 'e-blues-shuffle', title: 'E blues shuffle', source: 'Original riff',
  bpm: 100, time: [4, 4], difficulty: 'medium',
  notes: [...onE, ...onE, ...onA, ...onE, ...turn.slice(0, 7)]
};
