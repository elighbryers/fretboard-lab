import test from 'node:test';
import assert from 'node:assert/strict';
const V = await import('../js/piano/voicing.js');

test('inversions of C major and A minor', () => {
  assert.deepEqual(V.inversions(0, 'major', 60), [[60, 64, 67], [64, 67, 72], [67, 72, 76]]);
  assert.deepEqual(V.inversions(9, 'minor', 57)[0], [57, 60, 64]);
});
test('voice leading I-IV-V-I in C keeps common tones and moves the least', () => {
  const vl = V.voiceLead([{ root: 0, chord: 'major' }, { root: 5, chord: 'major' }, { root: 7, chord: 'major' }, { root: 0, chord: 'major' }], 60);
  assert.deepEqual(vl[0], [60, 64, 67]);
  assert.deepEqual(vl[1], [60, 65, 69]);   // F in 2nd inversion: C stays
  assert.deepEqual(vl[2], [59, 62, 67]);   // G in 1st inversion: G stays
  assert.deepEqual(vl[3], [60, 64, 67]);
  const m = V.moves(vl[0], vl[1]);
  assert.deepEqual(m.stay, [60]);
  assert.deepEqual(m.pairs, [[64, 65], [67, 69]]);
});
test('left-hand patterns', () => {
  assert.deepEqual(V.lhBar('root', 0, 'major'), [{ beat: 0, midis: [36], dur: 4 }]);
  assert.deepEqual(V.lhBar('fifth', 7, 'major')[0].midis, [43, 50]);
  assert.deepEqual(V.lhBar('alberti', 0, 'major').slice(0, 4).map(e => e.midis[0]), [48, 55, 52, 55]);
  assert.equal(V.lhBar('boogie', 9, '7').length, 8);
  assert.deepEqual(V.lhBar('shell', 2, 'm7')[0].midis, [38, 48]);
  assert.equal(V.lhBar('broken', 0, 'major', 3).length, 3);
});
test('scale fingerings: only verified keys, crossings marked', async () => {
  const F = await import('../js/piano/fingering.js');
  assert.deepEqual(F.crossings([1, 2, 3, 1, 2, 3, 4, 5]), [0, 3]);
  assert.deepEqual(F.crossings([5, 4, 3, 2, 1, 3, 2, 1], 'L'), [0, 5]);
  assert.deepEqual(F.crossings([1, 2, 3, 4, 1, 2, 3, 4]), [0, 4]);
  assert.equal(F.fullFingering(11, 'major'), null, 'B major not shown (not verified)');
  const c = F.scaleFingering(0, 'major', 'RH');
  assert.deepEqual(c.map, { 60: { n: 1, hand: 'R' }, 65: { n: 1, hand: 'R' } });   // thumb on C, then on F after finger 3
  const fl = F.scaleFingering(5, 'major', 'LH');
  assert.deepEqual(fl.map, { 53: { n: 5, hand: 'L' }, 62: { n: 3, hand: 'L' } });  // LH F: 5 on F, 3 crosses over to D
});
