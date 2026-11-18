import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.window = globalThis.window || {};
const L = await import('../js/sound-library.js');
const { SOUND_SETS } = await import('../js/sound-sets.js');
import { readFileSync, existsSync } from 'node:fs';

test('onset skips the silence an MP3 decoder may add', () => {
  const sr = 1000, x = new Float32Array(500);
  for (let i = 40; i < 500; i++) x[i] = Math.sin(i) * 0.8;
  assert.ok(Math.abs(L.onset(x, sr) - 0.039) < 0.002);
  assert.equal(L.onset(new Float32Array(100), sr), 0);
});

test('sound choices: synth first, guitar has no picker, every listed set exists with a licence', () => {
  assert.equal(L.hasSoundChoice('guitar'), false);
  for (const inst of ['bass', 'piano', 'drums']) {
    const opts = L.soundOptions(inst);
    assert.equal(opts[0].id, 'synth');
    assert.ok(opts.some(o => o.id === L.chosenSound(inst)), `${inst} default is an option`);
  }
  for (const [inst, list] of Object.entries(SOUND_SETS)) for (const s of list) {
    const dir = new URL(`../sounds/${inst}/${s.id}/`, import.meta.url);
    const meta = JSON.parse(readFileSync(new URL('set.json', dir)));
    assert.match(s.licence, /CC0|Public domain/, `${s.id} licence`);
    assert.ok(existsSync(new URL('LICENSE.txt', dir)), `${s.id} LICENSE.txt`);
    assert.ok(meta.files.length >= 8, `${s.id} files`);
    for (const f of meta.files) assert.ok(existsSync(new URL(f.file, dir)), `${s.id}/${f.file}`);
  }
});
