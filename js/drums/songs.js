// Drum play-alongs: original grooves and fills only (docs/research-drums.md D5). Each song is a
// list of bars; a bar is a pattern (kit piece -> 'x.x.' text, as in js/groove.js) with an optional
// section name. Backing chords (one per bar) play as a soft pad with a bass note, drumless.
import { fromPatterns } from './kit.js';

const P = (parts, extra = {}) => ({ parts, ...extra });
// Patterns (16th grid unless noted).
const ROCK = { hat: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.x.....' };
const ROCK_CRASH = { ...ROCK, crash: 'x...............', hat: '..x.x.x.x.x.x.x.' };
const FILL_1 = { hat: 'x.x.x.x.x.x.....', snare: '....x.......xxxx', kick: 'x.......x.......' };          // one-beat fill on 4
const FILL_2 = { hat: 'x.x.x.x.........', snare: '....x...xx..', tom1: '..........xx....', tom2: '............xx..', tom3: '..............xx', kick: 'x.......x.......' };
const FUNK = { hat: 'x.x.x.x.x.x.x.x.', snare: '....X..g.g..X..g', kick: 'x.....x...x..x..' };
const FUNK_FILL = { hat: 'x.x.x.x.x.......', snare: '....X..g.g..xxxx', kick: 'x.....x...x.....' };
const HALF = { hat: 'x.x.x.x.x.x.x.x.', snare: '........X.......', kick: 'x.....x...x.....' };
const HALF_FILL = { hat: 'x.x.x.x.........', snare: '........X...xx..', tom3: '..............xx', kick: 'x.....x.........' };
// Triplet grid (sub 3)
const SHUF = { ride: 'x.xx.xx.xx.x', snare: '...X.....X..', kick: 'x.....x.....', phat: '...x.....x..' };
const SHUF_FILL = { ride: 'x.xx.x......', snare: '...X..xxx...', tom1: '.........xx.', tom3: '...........x', kick: 'x...........' };
const SIX8 = { hat: 'xxxxxx', snare: '...x..', kick: 'x.....' };
const SIX8_FILL = { hat: 'xxx...', snare: '...xxx', kick: 'x.....' };

const fix = parts => Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, v.padEnd(16, '.')]));
export const SONGS = [
  { id: 'rock-basic', title: 'Rock Steady', source: 'Original groove and fills', bpm: 90, beats: 4, sub: 4, difficulty: 'easy',
    chords: ['A', 'A', 'D', 'E', 'A', 'A', 'D', 'E'],
    bars: [P(ROCK, { section: 'Groove' }), P(ROCK), P(ROCK), P(FILL_1, { fill: true }), P(ROCK_CRASH, { section: 'Again' }), P(ROCK), P(ROCK), P(fix(FILL_2), { fill: true })] },
  { id: 'funk-ghosts', title: 'Ghost Note Funk', source: 'Original groove', bpm: 92, beats: 4, sub: 4, difficulty: 'medium',
    chords: ['E7', 'E7', 'A7', 'E7'],
    bars: [P(FUNK, { section: 'Groove' }), P(FUNK), P(FUNK), P(FUNK_FILL, { fill: true })] },
  { id: 'half-time', title: 'Half-Time Heavy', source: 'Original groove and fill', bpm: 76, beats: 4, sub: 4, difficulty: 'easy',
    chords: ['Am', 'F', 'C', 'G'],
    bars: [P(HALF, { section: 'Groove' }), P(HALF), P(HALF), P(HALF_FILL, { fill: true })] },
  { id: 'shuffle-12', title: '12-Bar Shuffle', source: 'Original shuffle with a fill in bar 12', bpm: 96, beats: 4, sub: 3, difficulty: 'medium',
    chords: ['A7', 'A7', 'A7', 'A7', 'D7', 'D7', 'A7', 'A7', 'E7', 'D7', 'A7', 'E7'],
    bars: [...Array(11)].map((_, i) => P(SHUF, i === 0 ? { section: 'Blues' } : {})).concat([P(SHUF_FILL, { fill: true })]) },
  { id: 'six-eight', title: 'Six-Eight Sway', source: 'Original 6/8 groove', bpm: 66, beats: 2, sub: 3, meter: '6/8', difficulty: 'easy',
    chords: ['C', 'Am', 'F', 'G'],
    bars: [P(SIX8, { section: 'Groove' }), P(SIX8), P(SIX8), P(SIX8_FILL, { fill: true })] },
  { id: 'song-form', title: 'Little Song (form)', source: 'Original song chart: intro, verse, chorus, verse, chorus, end', bpm: 96, beats: 4, sub: 4, difficulty: 'medium',
    chords: ['C', 'G', 'C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'C', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'C'],
    bars: [P({ hat: 'x.x.x.x.x.x.x.x.' }, { section: 'Intro' }), P(FILL_1, { fill: true }),
      P(HALF, { section: 'Verse' }), P(HALF), P(HALF), P(HALF_FILL, { fill: true }),
      P(ROCK_CRASH, { section: 'Chorus' }), P(ROCK), P(ROCK), P(fix(FILL_2), { fill: true }),
      P(HALF, { section: 'Verse' }), P(HALF), P(HALF), P(HALF_FILL, { fill: true }),
      P(ROCK_CRASH, { section: 'Chorus' }), P(ROCK), P(ROCK), P(FILL_1, { fill: true }),
      P({ crash: 'x...............', kick: 'x...............' }, { section: 'End' }), P({})] }
];
export const findSong = id => SONGS.find(s => s.id === id);
// The whole song as one long groove (for notation), and each bar's groove (for the grid).
export function barGroove(song, b) { const g = fromPatterns(song.bars[b].parts, { beats: song.beats, sub: song.sub }); g.meter = song.meter; return g; }
export function songGroove(song) {
  const per = song.beats * song.sub, hits = {};
  song.bars.forEach((bar, b) => Object.entries(barGroove(song, b).hits).forEach(([p, steps]) => { (hits[p] ||= []).push(...steps.filter(s => s < per).map(s => s + b * per)); }));
  return { beats: song.beats, sub: song.sub, bars: song.bars.length, meter: song.meter, hits };
}
