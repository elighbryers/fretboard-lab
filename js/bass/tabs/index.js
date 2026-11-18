// Bass play-alongs: original lines only, some over public-domain chord progressions
// (docs/research-bass.md D5). Each tab is data:
//   { id, title, source, style (groove), bpm, time, difficulty, key, swing?,
//     chords: ['A', 'D7', ...]  one per bar, written over the tab,
//     notes: [[string, fret, beats], ...]  4-string bass numbering (4 = low E), string 0 = rest }
// The validator (tools/validate-lessons.mjs) checks bar lengths, positions, chord names and
// that every bar starts on a tone of its chord (or a rest).
const A = (string, fret, beats) => [string, fret, beats];
const rep = (n, bar) => Array.from({ length: n }, () => bar).flat();

const rootEights = (s, f) => rep(8, [A(s, f, 0.5)]);
const r58 = (r, five, oct) => [A(...r, 1), A(...five, 1), A(...oct, 1), A(...five, 1)];

export const BASS_TABS = [
  {
    id: 'root-eights-a', title: 'Root Eights in A', source: 'Original groove', style: 'rock8', bpm: 80, time: [4, 4], difficulty: 'easy', key: 'A',
    chords: ['A', 'A', 'D', 'D', 'E', 'D', 'A', 'A'],
    notes: [...rootEights(3, 0), ...rootEights(3, 0), ...rootEights(3, 5), ...rootEights(3, 5), ...rootEights(4, 0), ...rootEights(3, 5), ...rootEights(3, 0), ...rootEights(3, 0)]
  },
  {
    id: 'root-five-g', title: 'Root-Five Rock in G', source: 'Original groove', style: 'rock8', bpm: 88, time: [4, 4], difficulty: 'easy', key: 'G',
    chords: ['G', 'C', 'D', 'G', 'G', 'C', 'D', 'G'],
    notes: [...r58([4, 3], [3, 5], [2, 5]), ...r58([3, 3], [2, 5], [1, 5]), ...r58([3, 5], [2, 7], [1, 7]), ...r58([4, 3], [3, 5], [2, 5]),
      ...r58([4, 3], [3, 5], [2, 5]), ...r58([3, 3], [2, 5], [1, 5]), ...r58([3, 5], [2, 7], [1, 7]), A(4, 3, 4)]
  },
  {
    id: 'walkdown-c', title: 'Motown-Style Approach in C', source: 'Original line (chromatic approach notes)', style: 'four', bpm: 100, time: [4, 4], difficulty: 'medium', key: 'C',
    chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G'],
    notes: rep(2, [
      A(3, 3, 1), A(2, 5, 0.5), A(1, 5, 0.5), A(2, 5, 1), A(4, 4, 1),   // C ... G# into A
      A(4, 5, 1), A(3, 7, 0.5), A(2, 7, 0.5), A(3, 7, 1), A(4, 0, 1),   // Am ... E into F
      A(4, 1, 1), A(3, 3, 0.5), A(2, 3, 0.5), A(3, 3, 1), A(4, 2, 1),   // F ... F# into G
      A(4, 3, 1), A(3, 5, 0.5), A(2, 5, 0.5), A(3, 5, 1), A(3, 2, 1)    // G ... B into C
    ])
  },
  {
    id: 'funk-octaves-e', title: 'Funk Octaves in E', source: 'Original groove', style: 'funk16', bpm: 92, time: [4, 4], difficulty: 'medium', key: 'E',
    chords: ['E7', 'E7', 'A7', 'E7'],
    notes: [
      ...rep(2, [A(4, 0, .25), A(2, 2, .25), A(0, 0, .25), A(4, 0, .25), A(0, 0, .25), A(2, 2, .25), A(4, 0, .25), A(2, 2, .25),
        A(4, 0, .5), A(0, 0, .25), A(3, 5, .25), A(0, 0, .25), A(4, 0, .25), A(4, 3, .25), A(4, 4, .25)]),
      A(3, 0, .25), A(1, 2, .25), A(0, 0, .25), A(3, 0, .25), A(0, 0, .25), A(1, 2, .25), A(3, 0, .25), A(1, 2, .25),
      A(3, 0, .5), A(0, 0, .25), A(2, 5, .25), A(0, 0, .25), A(3, 0, .25), A(3, 5, .25), A(3, 6, .25),
      A(4, 0, .25), A(2, 2, .25), A(0, 0, .25), A(4, 0, .25), A(0, 0, .25), A(2, 2, .25), A(4, 0, .25), A(2, 2, .25),
      A(4, 0, .5), A(0, 0, .25), A(3, 5, .25), A(0, 0, .25), A(4, 0, .25), A(4, 3, .25), A(4, 4, .25)
    ]
  },
  {
    id: 'one-drop-am', title: 'One-Drop in A Minor', source: 'Original groove', style: 'onedrop', bpm: 74, time: [4, 4], difficulty: 'medium', key: 'Am',
    chords: ['Am', 'Am', 'Dm', 'Em', 'Am', 'Am', 'Dm', 'Am'],
    notes: [
      ...rep(2, [A(0, 0, 1), A(4, 5, .75), A(4, 5, .25), A(0, 0, .5), A(3, 3, .5), A(3, 7, .5), A(3, 5, .5)]),
      A(0, 0, 1), A(3, 5, .75), A(3, 5, .25), A(0, 0, .5), A(2, 3, .5), A(2, 7, .5), A(3, 3, .5),
      A(0, 0, 1), A(4, 0, .75), A(4, 0, .25), A(0, 0, .5), A(4, 3, .5), A(3, 2, .5), A(4, 4, .5),
      ...rep(2, [A(0, 0, 1), A(4, 5, .75), A(4, 5, .25), A(0, 0, .5), A(3, 3, .5), A(3, 7, .5), A(3, 5, .5)]),
      A(0, 0, 1), A(3, 5, .75), A(3, 5, .25), A(0, 0, .5), A(2, 3, .5), A(2, 7, .5), A(4, 4, .5),
      A(0, 0, 1), A(4, 5, 3)
    ]
  },
  {
    id: 'walking-blues-f', title: 'Walking Blues in F', source: 'Original walking line over a 12-bar blues', style: 'walking', bpm: 104, time: [4, 4], difficulty: 'medium', key: 'F',
    chords: ['F7', 'Bb7', 'F7', 'F7', 'Bb7', 'Bb7', 'F7', 'F7', 'C7', 'Bb7', 'F7', 'C7'],
    notes: [
      A(4, 1, 1), A(4, 5, 1), A(3, 3, 1), A(3, 2, 1),   // F7: F A C B -> Bb
      A(3, 1, 1), A(3, 5, 1), A(2, 3, 1), A(2, 2, 1),   // Bb7: Bb D F E -> F
      A(2, 3, 1), A(2, 1, 1), A(3, 3, 1), A(2, 2, 1),   // F7: F Eb C E -> F
      A(2, 3, 1), A(2, 1, 1), A(3, 3, 1), A(4, 5, 1),   // F7: F Eb C A -> Bb
      A(3, 1, 1), A(3, 5, 1), A(2, 3, 1), A(4, 5, 1),   // Bb7: Bb D F A -> Bb
      A(3, 1, 1), A(3, 5, 1), A(2, 3, 1), A(4, 2, 1),   // Bb7: Bb D F F# -> F
      A(4, 1, 1), A(4, 5, 1), A(3, 3, 1), A(2, 2, 1),   // F7: F A C E -> F
      A(2, 3, 1), A(2, 1, 1), A(3, 5, 1), A(3, 4, 1),   // F7: F Eb D C# -> C
      A(3, 3, 1), A(2, 2, 1), A(2, 5, 1), A(3, 2, 1),   // C7: C E G B -> Bb
      A(3, 1, 1), A(3, 5, 1), A(2, 3, 1), A(2, 2, 1),   // Bb7: Bb D F E -> F
      A(2, 3, 1), A(4, 5, 1), A(3, 1, 1), A(3, 2, 1),   // F7: F A Bb B -> C
      A(3, 3, 1), A(2, 2, 1), A(2, 5, 1), A(4, 2, 1)    // C7: C E G F# -> F
    ]
  },
  {
    id: 'amazing-grace-bass', title: 'Amazing Grace (bass)', source: '"New Britain" (1835), public domain; original bass line', style: 'waltz', bpm: 84, time: [3, 4], difficulty: 'easy', key: 'G',
    chords: ['G', 'G7', 'C', 'G', 'G', 'G', 'D', 'D', 'G', 'G7', 'C', 'G', 'G', 'D', 'G', 'G'],
    notes: [
      A(4, 3, 2), A(3, 5, 1), A(4, 3, 2), A(3, 2, 1), A(3, 3, 2), A(2, 5, 1), A(4, 3, 2), A(3, 5, 1),
      A(4, 3, 2), A(3, 5, 1), A(4, 3, 2), A(3, 4, 1), A(3, 5, 2), A(3, 0, 1), A(3, 5, 2), A(4, 2, 1),
      A(4, 3, 2), A(3, 5, 1), A(4, 3, 2), A(3, 2, 1), A(3, 3, 2), A(2, 5, 1), A(4, 3, 2), A(3, 5, 1),
      A(4, 3, 2), A(3, 5, 1), A(3, 5, 2), A(4, 2, 1), A(4, 3, 2), A(3, 5, 1), A(4, 3, 3)
    ]
  },
  {
    id: 'saints-bass', title: 'When the Saints Go Marching In (bass)', source: 'Traditional, public domain; original two-feel bass line', style: 'twofeel', bpm: 112, time: [4, 4], difficulty: 'easy', key: 'G',
    chords: ['G', 'G', 'G', 'G', 'G', 'G', 'D', 'D', 'G', 'G7', 'C', 'C', 'G', 'D', 'G', 'G'],
    notes: [
      ...rep(5, [A(4, 3, 2), A(3, 5, 2)]), A(4, 3, 2), A(3, 4, 2),   // G x6, C# into D
      A(3, 5, 2), A(3, 0, 2), A(3, 5, 2), A(4, 2, 2),                 // D D, F# into G
      A(4, 3, 2), A(3, 5, 2), A(4, 3, 2), A(3, 2, 2),                 // G G7, B into C
      A(3, 3, 2), A(2, 5, 2), A(3, 3, 2), A(4, 2, 2),                 // C C, F# into G
      A(4, 3, 2), A(3, 5, 2), A(3, 5, 2), A(4, 2, 2),                 // G D
      A(4, 3, 2), A(3, 5, 2), A(4, 3, 4)                              // G G
    ]
  },
  {
    id: 'shuffle-blues-a', title: 'Shuffle Blues in A', source: 'Original line over a 12-bar blues (swung 8ths)', style: 'shuffle', bpm: 92, time: [4, 4], difficulty: 'medium', key: 'A', swing: true,
    chords: ['A7', 'A7', 'A7', 'A7', 'D7', 'D7', 'A7', 'A7', 'E7', 'D7', 'A7', 'E7'],
    notes: (() => {
      const a = [[3, 0], [3, 4], [2, 2], [2, 4], [2, 5], [2, 4], [2, 2], [3, 4]];
      const d = [[2, 0], [2, 4], [1, 2], [1, 4], [1, 5], [1, 4], [1, 2], [2, 4]];
      const e = [[4, 0], [4, 4], [3, 2], [3, 4], [3, 5], [3, 4], [3, 2], [4, 4]];
      const bar = x => x.map(([s, f]) => A(s, f, 0.5));
      return [a, a, a, a, d, d, a, a, e, d, a, e].flatMap(bar);
    })()
  }
];
export const findBassTab = id => BASS_TABS.find(t => t.id === id);
