import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.window = globalThis.window || {};
const mem = new Map(); globalThis.localStorage = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
globalThis.document = { querySelector: () => null, addEventListener() {}, hidden: false };
const { kickTimes, LOCK_LEVELS } = await import('../js/bass/drills.js');
const { score } = await import('../js/timing.js');

test('lock to the kick: kick times and the tightening windows', () => {
  assert.deepEqual(kickTimes('rock8', [10, 12], 0.5), [10, 11, 11.25, 12, 13, 13.25]);
  assert.deepEqual(LOCK_LEVELS, [60, 45, 30]);
  // taps 40 ms late on every kick: in at ±60 and ±45, out at ±30
  const kicks = kickTimes('four', [0, 2], 0.5), taps = kicks.map(t => t + 0.04);
  assert.equal(score(kicks, taps, { window: 60 }).hits, 8);
  assert.equal(score(kicks, taps, { window: 30 }).hits, 0);
  assert.equal(score(kicks, taps, { window: 30 }).bias, 40);
  // calibration offset removes a steady delay
  assert.equal(score(kicks, taps, { window: 30, offsetMs: 40 }).hits, 8);
});
