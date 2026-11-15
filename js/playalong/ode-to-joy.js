// Ode to Joy - Ludwig van Beethoven (1824), public domain. Single-note arrangement in C.
const C = [5, 3], D = [4, 0], E = [4, 2], F = [4, 3], G = [3, 0];
const n = (p, beats) => [p[0], p[1], beats];
export default {
  id: 'ode-to-joy', title: 'Ode to Joy', source: 'Beethoven, public domain',
  bpm: 100, time: [4, 4], difficulty: 'easy',
  notes: [
    n(E, 1), n(E, 1), n(F, 1), n(G, 1),  n(G, 1), n(F, 1), n(E, 1), n(D, 1),
    n(C, 1), n(C, 1), n(D, 1), n(E, 1),  n(E, 1.5), n(D, .5), n(D, 2),
    n(E, 1), n(E, 1), n(F, 1), n(G, 1),  n(G, 1), n(F, 1), n(E, 1), n(D, 1),
    n(C, 1), n(C, 1), n(D, 1), n(E, 1),  n(D, 1.5), n(C, .5), n(C, 2)
  ]
};
