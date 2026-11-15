// Amazing Grace - traditional melody "New Britain" (1829), public domain. G major, 3/4, open position.
const D = [4, 0], E = [4, 2], G = [3, 0], A = [3, 2], B = [2, 0], hiD = [2, 3];
const n = (p, beats) => [p[0], p[1], beats], rest = beats => [0, 0, beats];
export default {
  id: 'amazing-grace', title: 'Amazing Grace', source: 'Traditional, public domain',
  bpm: 90, time: [3, 4], difficulty: 'easy',
  notes: [
    rest(2), n(D, 1),
    n(G, 2), n(B, .5), n(G, .5),   n(B, 2), n(A, 1),   n(G, 2), n(E, 1),   n(D, 2), n(D, 1),
    n(G, 2), n(B, .5), n(G, .5),   n(B, 2), n(A, 1),   n(hiD, 3),          rest(2), n(B, 1),
    n(hiD, 2), n(B, .5), n(hiD, .5), n(B, 2), n(G, 1), n(D, 2), n(E, 1),   n(G, 2), n(E, 1),
    n(D, 2), n(D, 1),   n(G, 2), n(B, .5), n(G, .5),   n(B, 2), n(A, 1),   n(G, 3)
  ]
};
