// Original exercise: fingers 1-2-3-4 on every string, up and back down.
const up = [6, 5, 4, 3, 2, 1].flatMap(s => [1, 2, 3, 4].map(f => [s, f, 1]));
const down = [1, 2, 3, 4, 5, 6].flatMap(s => [4, 3, 2, 1].map(f => [s, f, 1]));
export default {
  id: 'chromatic-warmup', title: 'Chromatic warm-up', source: 'Original exercise',
  bpm: 80, time: [4, 4], difficulty: 'easy',
  notes: [...up, ...down]
};
