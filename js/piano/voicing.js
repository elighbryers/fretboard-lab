// Piano voicing helpers, pure (tested in tests/piano.test.mjs): triad inversions, voice leading
// to the nearest chord tones, and left-hand accompaniment patterns (docs/research-piano.md D1, E).
import { lookup, parseFormula, pcOf } from '../theory.js';

// The chord's pitch classes (root first) and degree labels.
export function chordTones(rootPc, chordId) {
  const degs = parseFormula(lookup('chord', chordId).formula);
  return degs.map(d => ({ pc: pcOf(rootPc + d.semi), label: d.label, role: d.role, semi: d.semi }));
}

// Root position, 1st and 2nd inversion of a triad, starting at or above `floor`.
// -> [[midi, midi, midi] x3] (low to high)
export function inversions(rootPc, chordId, floor = 60) {
  const tones = chordTones(rootPc, chordId).slice(0, 3);
  const base = floor + pcOf(rootPc - floor);
  const rootPos = tones.map(t => base + t.semi);
  return [0, 1, 2].map(inv => {
    const v = rootPos.slice(inv).concat(rootPos.slice(0, inv).map(m => m + 12));
    while (v[0] - 12 >= floor) v.forEach((_, i) => { v[i] -= 12; });
    return v;
  });
}

// Voice lead from one voicing (sorted midis) to the next chord: try every inversion in nearby
// octaves and keep the one that moves the least in total; ties keep the lower one.
export function nearestVoicing(prev, rootPc, chordId) {
  const size = prev.length, tones = chordTones(rootPc, chordId).slice(0, size).map(t => t.pc);
  let best = null;
  for (let low = prev[0] - 7; low <= prev[0] + 7; low++) {
    if (!tones.includes(pcOf(low))) continue;
    // build upward from `low` using each chord tone once
    const order = tones.slice().sort((a, b) => pcOf(a - low) - pcOf(b - low));
    const v = [low];
    for (let i = 1; i < order.length; i++) { let m = v[i - 1] + 1; while (pcOf(m) !== order[i]) m++; v.push(m); }
    if (v[v.length - 1] - v[0] > 12) continue;
    const cost = v.reduce((a, m, i) => a + Math.abs(m - prev[i]), 0);
    if (!best || cost < best.cost) best = { v, cost };
  }
  return best.v;
}
// A whole progression: start from the root-position chord at `floor`, then nearest voicings.
export function voiceLead(chords, floor = 60) {
  const out = [inversions(chords[0].root, chords[0].chord, floor)[0]];
  chords.slice(1).forEach(c => out.push(nearestVoicing(out[out.length - 1], c.root, c.chord)));
  return out;
}
// Which notes stay (common tones) and where each moving note goes, for the animation.
export function moves(from, to) {
  const stay = from.filter(m => to.includes(m));
  const fromMoving = from.filter(m => !to.includes(m)), toMoving = to.filter(m => !from.includes(m));
  return { stay, pairs: fromMoving.map((m, i) => [m, toMoving[i]]) };
}

/* ---------- left-hand patterns ----------
   One bar of 4/4 (or 3/4) for a chord: [{ beat, midis, dur }] in the left-hand register
   (the root between C2 and B2, MIDI 36-47). */
export const LH_PATTERNS = {
  root: 'Root',
  fifth: 'Root + 5th',
  octave: 'Octave',
  broken: 'Broken chord',
  alberti: 'Alberti bass',
  boogie: 'Boogie bass',
  shell: 'Shell voicing (R + 3 or 7)'
};
export function lhBar(pattern, rootPc, chordId, beats = 4) {
  const r = 36 + pcOf(rootPc - 36), t = chordTones(rootPc, chordId), third = r + (t.find(x => x.role === 'third')?.semi ?? 4);
  const fifth = r + (t.find(x => x.role === 'fifth')?.semi ?? 7), sev = t.find(x => (x.semi % 12) >= 10);
  const ev = (beat, midis, dur = 1) => ({ beat, midis: [].concat(midis), dur });
  switch (pattern) {
    case 'fifth': return [ev(0, [r, fifth], beats)];
    case 'octave': return beats === 3 ? [ev(0, [r, r + 12], 3)] : [ev(0, [r, r + 12], 2), ev(2, [r, r + 12], 2)];
    case 'broken': return beats === 3 ? [ev(0, r), ev(1, fifth), ev(2, third + 12)] : [ev(0, r), ev(1, fifth), ev(2, third + 12), ev(3, fifth)];
    case 'alberti': {
      // low-high-middle-high in eighths over a close chord an octave up: root, 5th, 3rd, 5th
      const n = [r + 12, fifth + 12, third + 12, fifth + 12];
      return Array.from({ length: beats * 2 }, (_, i) => ev(i / 2, n[i % 4], 0.5));
    }
    case 'boogie': { const six = r + 9, b7 = r + 10;
      const line = [r, third, fifth, six, b7, six, fifth, third];
      return Array.from({ length: beats * 2 }, (_, i) => ev(i / 2, line[i % 8], 0.5)); }
    case 'shell': return [ev(0, [r, sev ? r + sev.semi : third], beats)];
    default: return [ev(0, r, beats)];
  }
}
