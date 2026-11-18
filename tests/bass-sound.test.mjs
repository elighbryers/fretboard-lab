import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.window = globalThis.window || {};
const { bassSamples } = await import('../js/bass/sound.js');
const { yin } = await import('../js/pitch.js').catch(() => ({}));

test('the bass pluck is pitched, decays, and stays in range', () => {
  for (const midi of [23, 28, 40, 55]) {
    const sr = 44100, x = bassSamples(midi, sr);
    const peak = x.reduce((a, v) => Math.max(a, Math.abs(v)), 0);
    assert.ok(peak <= 1.0001 && peak > 0.3, `peak ${peak}`);
    const rms = (a, b) => Math.sqrt(x.slice(a, b).reduce((s, v) => s + v * v, 0) / (b - a));
    assert.ok(rms(sr * 2, sr * 2.5) < rms(0, sr * 0.5), 'it decays');
    if (yin) {
      const f = yin(x.slice(4410, 4410 + 8192), sr).freq, want = 440 * 2 ** ((midi - 69) / 12);
      assert.ok(Math.abs(12 * Math.log2(f / want)) < 0.5, `midi ${midi}: ${f} Hz vs ${want}`);
    }
  }
});
