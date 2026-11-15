// Rhythm patterns and a small rhythm line (simple notation) in SVG. Pure, no
// imports. Used by the rhythm drill, the Hands & rhythm items, the play-along
// rhythm line and the daily review.
//
// A pattern is a list of notes in beats: [{ dur, rest?, stroke? 'D' | 'U', ghost? }].
// stroke = strumming direction (down/up); ghost = the hand moves but misses the strings.

const q = (stroke = 'D') => ({ dur: 1, stroke }), e = stroke => ({ dur: 0.5, stroke }), s = stroke => ({ dur: 0.25, stroke });
const r = dur => ({ dur, rest: true }), t = () => ({ dur: 1 / 3 });

// The rhythm strand, in the order the research recommends (one or two per level).
export const PATTERNS = [
  { id: 'quarters', level: 1, name: 'Quarter notes', count: '1 2 3 4', beats: 4, notes: [q(), q(), q(), q()] },
  { id: 'eighths', level: 2, name: 'Eighth notes, down-up', count: '1 & 2 & 3 & 4 &', beats: 4, notes: [e('D'), e('U'), e('D'), e('U'), e('D'), e('U'), e('D'), e('U')] },
  { id: 'first-strum', level: 2, name: 'First strumming pattern', count: '1, 2 &, 3 &, 4', beats: 4, notes: [q('D'), e('D'), e('U'), e('D'), e('U'), q('D')] },
  { id: 'rests', level: 3, name: 'Rests on 2 and 4', count: '1 (2) 3 (4)', beats: 4, notes: [q(), r(1), q(), r(1)] },
  { id: 'waltz', level: 3, name: '3/4: one-two-three', count: '1 2 3', beats: 3, notes: [q('D'), q('D'), q('D')] },
  { id: 'syncopation', level: 4, name: 'Syncopation: D DU UDU', count: '1, 2 &, & 4 &', beats: 4, notes: [q('D'), e('D'), e('U'), { dur: 0.5, rest: true, ghost: true, stroke: 'D' }, e('U'), e('D'), e('U')] },
  { id: 'six-eight', level: 4, name: '6/8: ONE two three FOUR five six', count: '1 2 3 4 5 6', beats: 3, unit: 8, notes: [e('D'), e('D'), e('U'), e('D'), e('D'), e('U')] },
  { id: 'shuffle', level: 5, name: 'Shuffle: long-short', count: '1 (trip) let 2 ...', beats: 4, notes: [{ dur: 2 / 3, stroke: 'D' }, { dur: 1 / 3, stroke: 'U' }, { dur: 2 / 3, stroke: 'D' }, { dur: 1 / 3, stroke: 'U' }, { dur: 2 / 3, stroke: 'D' }, { dur: 1 / 3, stroke: 'U' }, { dur: 2 / 3, stroke: 'D' }, { dur: 1 / 3, stroke: 'U' }] },
  { id: 'sixteenths', level: 6, name: 'Sixteenths: 1 e & a', count: '1 e & a 2 e & a', beats: 4, notes: [s('D'), s('U'), s('D'), s('U'), s('D'), s('U'), s('D'), s('U'), e('D'), e('U'), e('D'), e('U')] }
];
export const findPattern = id => PATTERNS.find(p => p.id === id) || null;
const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Counting words for a note start (in beats): 1 & 2 &, 1 e & a, 1 trip let.
function countAt(b) {
  const beat = Math.floor(b + 1e-6), f = b - beat;
  if (f < 0.01) return String(beat + 1);
  if (Math.abs(f - 0.5) < 0.01) return '&';
  if (Math.abs(f - 0.25) < 0.01) return 'e';
  if (Math.abs(f - 0.75) < 0.01) return 'a';
  if (Math.abs(f - 1 / 3) < 0.02) return 'trip';
  if (Math.abs(f - 2 / 3) < 0.02) return 'let';
  return '';
}

// SVG rhythm line. results (optional): [{ error, inWindow }] per played note, drawn
// as markers above the notes (left = early, right = late).
export function rhythmSVG(pattern, { pxPerBeat = 64, results = null, label = '', bars = 1, small = false } = {}) {
  const notes = pattern.notes, beats = pattern.beats, W = 24 + beats * bars * pxPerBeat, H = small ? 64 : 104;
  const top = small ? 8 : 34, stemTop = top + 4, head = top + 34, count = head + 22;
  let out = `<line class="rl-staff" x1="8" x2="${W - 8}" y1="${head}" y2="${head}"/>`;
  let played = 0;
  for (let bar = 0; bar < bars; bar++) {
    let b = 0;
    const x0 = 16 + bar * beats * pxPerBeat;
    if (bar) out += `<line class="rl-bar" x1="${x0 - 8}" x2="${x0 - 8}" y1="${top}" y2="${head + 8}"/>`;
    const starts = notes.map(n => { const st = b; b += n.dur; return st; });
    notes.forEach((n, i) => {
      const x = x0 + starts[i] * pxPerBeat + 6;
      if (!small) out += `<text class="rl-count" x="${x}" y="${count}" text-anchor="middle">${countAt(starts[i])}</text>`;
      if (n.rest) {
        out += `<rect class="rl-rest" x="${x - 5}" y="${head - 10}" width="10" height="6" rx="1"/>`;
        if (n.ghost && !small) out += `<text class="rl-stroke ghost" x="${x}" y="${top - 6}" text-anchor="middle">${n.stroke === 'U' ? '↑' : '↓'}</text>`;
        return;
      }
      const open = n.dur >= 2;
      out += `<ellipse class="rl-head${open ? ' open' : ''}" cx="${x}" cy="${head}" rx="6.5" ry="5"/>`;
      if (n.dur < 4) out += `<line class="rl-stem" x1="${x + 6}" x2="${x + 6}" y1="${head - 2}" y2="${stemTop}"/>`;
      if (n.stroke && !small) out += `<text class="rl-stroke" x="${x}" y="${top - 6}" text-anchor="middle">${n.stroke === 'U' ? '↑' : '↓'}</text>`;
      if (results && results[played]) {
        const res = results[played], dx = Math.max(-22, Math.min(22, res.error * 0.35));
        out += `<circle class="rl-hit ${res.inWindow ? 'good' : 'bad'}" cx="${x + dx}" cy="${top + 10}" r="5"><title>${res.error > 0 ? '+' : ''}${res.error} ms</title></circle>`;
      } else if (results) out += `<text class="rl-miss" x="${x}" y="${top + 14}" text-anchor="middle">–</text>`;
      played++;
    });
    // beams: notes shorter than a beat that start inside the same beat
    for (let beat = 0; beat < beats; beat++) {
      const group = notes.map((n, i) => ({ n, st: starts[i] })).filter(({ n, st }) => !n.rest && n.dur < 1 - 1e-6 && st >= beat - 1e-6 && st < beat + 1 - 1e-6);
      if (group.length < 2) { group.forEach(({ n, st }) => { const x = x0 + st * pxPerBeat + 12; out += `<path class="rl-flag" d="M${x} ${stemTop}q8 6 6 14"/>`; if (n.dur <= 0.25) out += `<path class="rl-flag" d="M${x} ${stemTop + 6}q8 6 6 14"/>`; }); continue; }
      const xa = x0 + group[0].st * pxPerBeat + 12, xb = x0 + group[group.length - 1].st * pxPerBeat + 12;
      out += `<line class="rl-beam" x1="${xa}" x2="${xb}" y1="${stemTop}" y2="${stemTop}"/>`;
      if (group.every(g => g.n.dur <= 0.25 + 1e-6)) out += `<line class="rl-beam" x1="${xa}" x2="${xb}" y1="${stemTop + 6}" y2="${stemTop + 6}"/>`;
      if (group.some(g => Math.abs(g.n.dur * 3 - Math.round(g.n.dur * 3)) < 1e-6 && Math.round(g.n.dur * 3) % 3)) out += `<text class="rl-tuplet" x="${(xa + xb) / 2}" y="${stemTop - 4}" text-anchor="middle">3</text>`;
    }
  }
  return `<svg class="rhythm-line${small ? ' small' : ''}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label || pattern.name + ': ' + pattern.count)}">${out}</svg>`;
}
