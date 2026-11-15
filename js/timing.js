// Timing engine: scores taps against beats on the Web Audio clock. Pure logic
// with no imports, so it can be unit-tested (and shared by guitar, bass and
// drums). Browser glue (tap pad, calibration screen, per-device storage) is in
// js/timing-ui.js.
//
// All times are audio-clock seconds (AudioContext.currentTime), never Date.now().
// Errors are milliseconds: negative = early, positive = late.
// Research: docs/research-drums.md F and research-guitar-v2.md 2.5.

export const WINDOWS = { easy: 60, normal: 40, strict: 25 };   // ± ms counted as "in time"
export const WINDOW_NAMES = { easy: 'Easy', normal: 'Normal', strict: 'Strict' };
export const BLUETOOTH_MS = 100;   // a calibration offset this big usually means Bluetooth audio
export const MATCH_MS = 150;       // a tap further than this from every beat is an extra tap

export const median = xs => { if (!xs.length) return 0; const s = xs.slice().sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
export const mean = xs => (xs.length ? xs.reduce((a, x) => a + x, 0) / xs.length : 0);
// Spread: standard deviation (how consistent), separate from bias (how early/late on average).
export const spread = xs => { if (xs.length < 2) return 0; const m = mean(xs); return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1)); };

// Pair each tap with the nearest unpaired beat within maxMs (closest pairs first).
// beats, taps: audio times in seconds. offsetMs is subtracted from every tap first
// (the device's calibration). Returns { pairs: [{ beat, tap, error }], missed: [beat], extra: [tap] }.
export function matchTaps(beats, taps, { offsetMs = 0, maxMs = MATCH_MS } = {}) {
  const adj = taps.map(t => t - offsetMs / 1000), cands = [];
  adj.forEach((t, ti) => beats.forEach((b, bi) => { const e = (t - b) * 1000; if (Math.abs(e) <= maxMs) cands.push({ ti, bi, e }); }));
  cands.sort((a, b) => Math.abs(a.e) - Math.abs(b.e));
  const usedT = new Set(), usedB = new Set(), pairs = [];
  for (const c of cands) {
    if (usedT.has(c.ti) || usedB.has(c.bi)) continue;
    usedT.add(c.ti); usedB.add(c.bi);
    pairs.push({ beat: beats[c.bi], tap: taps[c.ti], error: c.e });
  }
  pairs.sort((a, b) => a.beat - b.beat);
  return { pairs, missed: beats.filter((_, i) => !usedB.has(i)), extra: taps.filter((_, i) => !usedT.has(i)) };
}

// Score a run. window: 'easy' | 'normal' | 'strict' (or a number of ms).
// bias: mean error (negative = rushing), spread: consistency, hitRate: in-window share of all beats.
export function score(beats, taps, { offsetMs = 0, window = 'normal' } = {}) {
  const w = typeof window === 'number' ? window : WINDOWS[window] ?? WINDOWS.normal;
  const { pairs, missed, extra } = matchTaps(beats, taps, { offsetMs });
  const errors = pairs.map(p => p.error), hits = errors.filter(e => Math.abs(e) <= w).length;
  const bias = mean(errors), sd = spread(errors);
  const lean = Math.abs(bias) < Math.max(8, w / 4) ? 'on time' : bias < 0 ? 'early' : 'late';
  return {
    window: w, beats: beats.length, played: pairs.length, missed: missed.length, extra: extra.length,
    hits, hitRate: beats.length ? hits / beats.length : 0,
    bias: Math.round(bias), spread: Math.round(sd), lean,
    notes: pairs.map(p => ({ beat: p.beat, error: Math.round(p.error), inWindow: Math.abs(p.error) <= w })),
    missedBeats: missed
  };
}

// Calibration: clicks the learner heard and the taps they made along with them.
// The offset is the median of (tap - click), so a few stray taps don't matter.
// Needs at least 5 matched taps; anything over BLUETOOTH_MS is flagged.
export function calibrate(clicks, taps, { maxMs = 400 } = {}) {
  const { pairs } = matchTaps(clicks, taps, { maxMs });
  const errors = pairs.map(p => p.error);
  if (errors.length < 5) return { ok: false, n: errors.length };
  const offsetMs = Math.round(median(errors));
  return { ok: true, n: errors.length, offsetMs, spreadMs: Math.round(spread(errors)), bluetooth: offsetMs > BLUETOOTH_MS };
}

// When a tap happened, on the audio clock: maps an event's timeStamp (performance
// clock, ms) through AudioContext.getOutputTimestamp(), which pairs the audio time
// now coming out of the speakers with performance time. That already counts the
// output latency the browser knows about; calibration covers the rest (touch delay,
// Bluetooth). Older browsers: fall back to currentTime minus the reported latency.
export function audioTimeOf(eventMs, ctx, perfNow = () => performance.now()) {
  const ts = ctx.getOutputTimestamp ? ctx.getOutputTimestamp() : null;
  if (ts && ts.performanceTime > 0) return ts.contextTime + (eventMs - ts.performanceTime) / 1000;
  const latency = (ctx.outputLatency || 0) + (ctx.baseLatency || 0);
  return ctx.currentTime - latency + (eventMs - perfNow()) / 1000;
}

// A key for "this output device": the audio sink (where browsers expose it) plus the
// browser's latency estimate in 20 ms steps. Plugging in headphones usually changes it.
export function deviceKey(ctx) {
  const sink = typeof ctx.sinkId === 'string' && ctx.sinkId ? ctx.sinkId : 'default';
  const ms = Math.round(((ctx.outputLatency || 0) + (ctx.baseLatency || 0)) * 1000 / 20) * 20;
  return `${sink}|${ms}`;
}

// Beat times for a rhythm pattern starting at t0: pattern = [{ dur, rest? }] in beats.
export function patternBeats(pattern, bpm, t0 = 0, bars = 1, beatsPerBar = 4) {
  const spb = 60 / bpm, out = [];
  for (let bar = 0; bar < bars; bar++) {
    let b = bar * beatsPerBar;
    for (const n of pattern) { if (!n.rest) out.push(t0 + b * spb); b += n.dur; }
  }
  return out;
}
