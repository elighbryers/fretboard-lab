// Greensleeves - traditional English (16th century), public domain. A minor, 3/4, open position.
const A = [3, 2], B = [2, 0], C = [2, 1], D = [2, 3], E = [1, 0], F = [1, 1], G = [3, 0], Gs = [3, 1], Fs = [4, 4], lowE = [4, 2];
const n = (p, beats) => [p[0], p[1], beats], rest = beats => [0, 0, beats];
export default {
  id: 'greensleeves', title: 'Greensleeves', source: 'Traditional, public domain',
  bpm: 100, time: [3, 4], difficulty: 'medium',
  notes: [
    rest(2), n(A, 1),
    n(C, 2), n(D, 1),   n(E, 1.5), n(F, .5), n(E, 1),   n(D, 2), n(B, 1),   n(G, 1.5), n(A, .5), n(B, 1),
    n(C, 2), n(A, 1),   n(A, 1.5), n(Gs, .5), n(A, 1),  n(B, 2), n(Gs, 1),  n(lowE, 2), n(A, 1),
    n(C, 2), n(D, 1),   n(E, 1.5), n(F, .5), n(E, 1),   n(D, 2), n(B, 1),   n(G, 1.5), n(A, .5), n(B, 1),
    n(C, 1.5), n(B, .5), n(A, 1),   n(Gs, 1.5), n(Fs, .5), n(Gs, 1),   n(A, 3)
  ]
};
