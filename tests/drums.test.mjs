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
