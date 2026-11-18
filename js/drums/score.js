// Drum timing scores (docs/research-drums.md F3), built on js/timing.js. Pure and tested.
// Windows after calibration: Easy "in time" ±50 / "tight" ±25 ms, Normal ±35 / ±18, Strict ±25 / ±12.
// A window is capped below half the gap between notes, so a hit can't count for the wrong note.
// Early/late (bias) is reported separately from consistency (spread); timing never fails a lesson.
import { mean, spread } from '../timing.js';

export const DRUM_WINDOWS = { easy: { inTime: 50, tight: 25 }, normal: { inTime: 35, tight: 18 }, strict: { inTime: 25, tight: 12 } };
export const capWindow = (ms, gapMs) => Math.min(ms, Math.max(5, Math.floor(gapMs / 2) - 1));

// expected: [{ t, piece }], hits: [{ t, piece }] (seconds, audio clock). samePiece: a hit must be on
// the right drum to count (multi-pad tapping and e-kits); false for one-pad drills.
export function scoreHits(expected, hits, { offsetMs = 0, level = 'easy', samePiece = true, maxMs = 150 } = {}) {
  const sorted = expected.slice().sort((a, b) => a.t - b.t);
  const gaps = sorted.slice(1).map((e, i) => (e.t - sorted[i].t) * 1000).filter(g => g > 1);
  const minGap = gaps.length ? Math.min(...gaps) : 1000;
  const w = DRUM_WINDOWS[level] || DRUM_WINDOWS.easy, inTime = capWindow(w.inTime, minGap), tight = Math.min(w.tight, inTime);
  const match = Math.min(maxMs, Math.max(inTime * 2, minGap / 2));
  const cands = [];
  hits.forEach((h, hi) => expected.forEach((e, ei) => {
    if (samePiece && h.piece && e.piece && h.piece !== e.piece) return;
    const err = (h.t - offsetMs / 1000 - e.t) * 1000;
    if (Math.abs(err) <= match) cands.push({ hi, ei, err });
  }));
  cands.sort((a, b) => Math.abs(a.err) - Math.abs(b.err));
  const usedH = new Set(), usedE = new Set(), notes = [];
  for (const c of cands) { if (usedH.has(c.hi) || usedE.has(c.ei)) continue; usedH.add(c.hi); usedE.add(c.ei); notes.push({ ...expected[c.ei], error: Math.round(c.err), inTime: Math.abs(c.err) <= inTime, tight: Math.abs(c.err) <= tight }); }
  notes.sort((a, b) => a.t - b.t);
  const errs = notes.map(n => n.error), bias = Math.round(mean(errs)), sd = Math.round(spread(errs));
  return { window: inTime, tightWindow: tight, total: expected.length, played: notes.length, missed: expected.length - notes.length, extra: hits.length - notes.length,
    inTime: notes.filter(n => n.inTime).length, tight: notes.filter(n => n.tight).length, hitRate: expected.length ? notes.filter(n => n.inTime).length / expected.length : 0,
    bias, spread: sd, lean: Math.abs(bias) < Math.max(6, inTime / 4) ? 'on time' : bias < 0 ? 'early' : 'late', notes,
    missedHits: expected.filter((_, i) => !usedE.has(i)) };
}
// Where in the bar you tend to rush or drag: average error per step (for the timing heat map).
export function stepErrors(notes, stepOf) {
  const by = {};
  notes.forEach(n => { const s = stepOf(n); (by[s] ||= []).push(n.error); });
  return Object.fromEntries(Object.entries(by).map(([s, e]) => [s, Math.round(mean(e))]));
}
