// Original arpeggio pattern: I-V-vi-IV in G (G, D, Em, C) as triads on the top
// three strings, all inside frets 2-5 (Level 5, Lesson 7).
const bar = ([a, b, c]) => [a, b, c, b, a, b, c, b].map(([s, f]) => [s, f, .5]);
const G = [[3, 4], [2, 3], [1, 3]], D = [[3, 2], [2, 3], [1, 2]], Em = [[3, 4], [2, 5], [1, 3]], C = [[3, 5], [2, 5], [1, 3]];
export default {
  id: 'pop-triads-g', title: 'I-V-vi-IV triads in G', source: 'Original pattern',
  bpm: 80, time: [4, 4], difficulty: 'easy',
  notes: [...bar(G), ...bar(D), ...bar(Em), ...bar(C), ...bar(G), ...bar(D), ...bar(Em), ...bar(C), [3, 4, 2], [0, 0, 2]]
};
