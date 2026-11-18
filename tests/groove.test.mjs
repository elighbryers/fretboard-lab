import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.window = globalThis.window || {};
const G = await import('../js/groove.js');

test('every groove pattern fills exactly one bar', () => {
  for (const [id, st] of Object.entries(G.STYLES))
    for (const [piece, pat] of Object.entries(st.parts)) {
      assert.equal(pat.length, st.beats * st.grid, `${id} ${piece}`);
      assert.match(pat, /^[xXg.]+$/, `${id} ${piece}`);
    }
  assert.deepEqual(G.STYLE_IDS.sort(), ['bossa', 'four', 'funk16', 'half', 'onedrop', 'rock8', 'shuffle', 'twelve8', 'twofeel', 'walking', 'waltz'].sort());
});
test('mutes keep the right pieces', () => {
  assert.deepEqual(Object.keys(G.partsFor('rock8', 'kick')), ['kick']);
  assert.deepEqual(Object.keys(G.partsFor('rock8', 'kicksnare')).sort(), ['kick', 'snare']);
  assert.deepEqual(Object.keys(G.partsFor('onedrop', 'kicksnare')).sort(), ['kick', 'rim']);
});
test('drop-out bars', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7].map(b => G.isDropBar(b, 4)), [false, false, false, true, false, false, false, true]);
  assert.deepEqual([0, 1, 2, 3].map(b => G.isDropBar(b, 2)), [false, true, false, true]);
  assert.equal(G.isDropBar(3, 0), false);
});
test('step timing and kick beats', () => {
  assert.equal(G.stepTime('rock8', 10, 4, 0.5), 10.5);       // 16th grid: step 4 = beat 2
  assert.equal(G.stepTime('shuffle', 10, 5, 0.6), 11);        // triplet grid: step 5 = beat 2 + 2/3
  assert.deepEqual(G.kickBeats('rock8'), [0, 2, 2.5]);
  assert.deepEqual(G.kickBeats('four'), [0, 1, 2, 3]);
});
