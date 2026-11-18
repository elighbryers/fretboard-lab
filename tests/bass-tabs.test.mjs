import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.window = globalThis.window || {};
const mem = new Map(); globalThis.localStorage = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
globalThis.document = { querySelector: () => null, addEventListener() {}, hidden: false };
const { bassTimeline, swung } = await import('../js/bass/playalong.js');
const { BASS_TABS, findBassTab } = await import('../js/bass/tabs/index.js');
const { toAbc, abcPitch, abcLen } = await import('../js/notation.js');

test('about 8 starter pieces, none of them Happy Birthday', () => {
  assert.ok(BASS_TABS.length >= 8);
  assert.ok(BASS_TABS.every(t => !/birthday/i.test(t.title)));
});
test('timeline: bars and pitches', () => {
  const tl = bassTimeline(findBassTab('walking-blues-f'));
  assert.equal(tl.length, 48);
  assert.equal(tl[0].midi, 29);   // F1 on the E string, fret 1
  assert.equal(tl[4].bar, 1);
  assert.equal(tl[47].bar, 11);
});
test('swing moves off-beat 8ths to the last triplet', () => {
  assert.equal(swung(0.5, true), 2 / 3);
  assert.equal(swung(1.5, true), 1 + 2 / 3);
  assert.equal(swung(1, true), 1);
  assert.equal(swung(0.5, false), 0.5);
});
test('ABC notation helpers', () => {
  assert.equal(abcPitch(60), 'C'); assert.equal(abcPitch(48), 'C,'); assert.equal(abcPitch(72), 'c'); assert.equal(abcPitch(84), "c'");
  assert.equal(abcPitch(61), '^C'); assert.equal(abcPitch(61, true), '_D'); assert.equal(abcPitch(40), 'E,,');
  assert.equal(abcLen(1), '2'); assert.equal(abcLen(0.5), ''); assert.equal(abcLen(0.25), '/2'); assert.equal(abcLen(0.75), '3/2'); assert.equal(abcLen(1 / 3), '2/3');
  const abc = toAbc([{ midi: 54, beats: 1 }, { midi: 53, beats: 1 }, { midi: 52, beats: 2 }], { clef: 'bass' });
  assert.match(abc, /\^F,2 =F,2/, 'a natural after a sharp in the same bar');
});
