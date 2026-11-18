import test from 'node:test';
import assert from 'node:assert/strict';
const K = await import('../js/drums/kit.js');
const N = await import('../js/drums/notation.js');

test('kit: GM notes, keys and patterns', () => {
  assert.equal(K.fromGM(36), 'kick'); assert.equal(K.fromGM(38), 'snare'); assert.equal(K.fromGM(42), 'hat'); assert.equal(K.fromGM(46), 'ohat'); assert.equal(K.fromGM(51), 'ride');
  assert.equal(K.fromKey(' '), 'kick'); assert.equal(K.fromKey('F'), 'snare');
  const g = K.fromPatterns({ hat: 'x.x.x.x.x.x.x.x.', snare: '....X.......X...', kick: 'x.......x.......' });
  assert.deepEqual(g.hits.snare, [4, 12]);
  assert.equal(K.stepsOf(g), 16);
});
test('notation: kick bottom space, snare third space, x noteheads, eighth notes for a rock beat', () => {
  const g = K.fromPatterns({ hat: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.......' });
  const { abc, index } = N.grooveAbcMap(g);
  assert.match(abc, /clef=perc/);
  assert.match(abc, /\[!style=x!gF\]2/);   // beat 1: hat + kick, an eighth
  assert.match(abc, /\[!style=x!gc\]2/);   // beat 2: hat + snare
  assert.equal(index.filter(i => i >= 0).length, 8);
  assert.deepEqual(index.slice(0, 4), [0, -1, 1, -1]);
  const tri = N.grooveAbcMap({ beats: 4, sub: 3, bars: 1, hits: { ride: [0, 3, 5, 6, 9, 11] } });
  assert.equal((tri.abc.match(/\(3/g) || []).length, 4);
  assert.equal(tri.index[11], 11);
});
test('drum scores: windows, caps, bias vs spread, right drum', async () => {
  const S = await import('../js/drums/score.js');
  assert.equal(S.capWindow(50, 125), 50);       // 16ths at 120 bpm are 125 ms apart: 50 fits under 62
  assert.equal(S.capWindow(50, 60), 29);         // very fast notes: capped below half the gap
  const exp = [0, 0.5, 1, 1.5].map(t => ({ t, piece: 'snare' }));
  const late = S.scoreHits(exp, exp.map(e => ({ t: e.t + 0.03, piece: 'snare' })), { level: 'easy' });
  assert.deepEqual([late.inTime, late.tight, late.bias, late.spread, late.lean], [4, 0, 30, 0, 'late']);
  assert.equal(S.scoreHits(exp, exp.map(e => ({ t: e.t + 0.03, piece: 'snare' })), { level: 'strict' }).inTime, 0);
  assert.equal(S.scoreHits(exp, exp.map(e => ({ t: e.t + 0.03, piece: 'snare' })), { offsetMs: 30, level: 'strict' }).tight, 4, 'calibration removes a steady delay');
  const wrong = S.scoreHits(exp, exp.map(e => ({ t: e.t, piece: 'kick' })));
  assert.equal(wrong.played, 0, 'the wrong drum does not count');
  assert.equal(S.scoreHits(exp, exp.map(e => ({ t: e.t, piece: 'kick' })), { samePiece: false }).inTime, 4);
  const jitter = S.scoreHits(exp, [0.02, 0.48, 1.02, 1.48].map(t => ({ t, piece: 'snare' })));
  assert.equal(jitter.bias, 0); assert.ok(jitter.spread > 15, 'spread shows inconsistency even with no bias');
});
test('drills: rhythms, stickings, internal time', async () => {
  globalThis.window = globalThis.window || {};
  const mem = new Map(); globalThis.localStorage = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  globalThis.document = globalThis.document || { querySelector: () => null, addEventListener() {}, hidden: false };
  const D = await import('../js/drums/drills.js');
  assert.ok(D.RHYTHMS.every(r => r.steps.every(s => s < 4 * (r.sub || 4))));
  assert.deepEqual(D.stickingGroove(D.findRudiment('paradiddle').sticking).hits.R, [0, 2, 3, 5, 8, 10, 11, 13]);  // RLRR LRLL RLRR LRLL
  assert.ok(D.RUDIMENTS.every(r => r.sticking.length === 16 && /^[RLrl.]+$/.test(r.sticking)));
  assert.deepEqual([0, 1, 2, 3, 4, 5].map(b => D.silentBar(b)), [false, false, true, true, false, false]);
  assert.equal(D.fadeVolume(0), 1); assert.equal(D.fadeVolume(6), 0);
  assert.equal(D.ladderNext(80, true), 84); assert.equal(D.ladderNext(80, false), 76);
});
