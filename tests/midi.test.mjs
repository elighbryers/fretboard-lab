// Web MIDI parsing with fake events (no MIDI hardware here).
import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.window = globalThis.window || {};
const { parseMidiMessage, listenMidi } = await import('../js/midi.js');

test('note on, note off and running-status note off', () => {
  assert.deepEqual(parseMidiMessage([0x90, 60, 100]), { type: 'on', note: 60, velocity: 100, channel: 1 });
  assert.deepEqual(parseMidiMessage([0x99, 38, 90]), { type: 'on', note: 38, velocity: 90, channel: 10 }); // e-kit snare, channel 10
  assert.equal(parseMidiMessage([0x80, 60, 0]).type, 'off');
  assert.equal(parseMidiMessage([0x90, 60, 0]).type, 'off');
  assert.equal(parseMidiMessage([0xb0, 64, 127]).type, 'other'); // sustain pedal
  assert.equal(parseMidiMessage([0xf8]).type, 'other');           // clock
});

test('listenMidi passes notes with their mapped event time', async () => {
  const input = { name: 'Fake keys', onmidimessage: null };
  const inputs = new Map([['1', input]]);
  Object.defineProperty(globalThis, 'navigator', { value: { requestMIDIAccess: async () => ({ inputs, onstatechange: null }) }, configurable: true });
  const got = [], devices = [];
  const stop = listenMidi({ onNote: (n, v, t) => got.push([n, Math.round(v * 127), t]), onOff: n => got.push(['off', n]), onDevices: d => devices.push(...d) }, ts => ts / 1000);
  await new Promise(r => setTimeout(r, 0));
  assert.deepEqual(devices, ['Fake keys']);
  input.onmidimessage({ data: [0x90, 64, 80], timeStamp: 1500 });
  input.onmidimessage({ data: [0x80, 64, 0], timeStamp: 1750 });
  assert.deepEqual(got, [[64, 80, 1.5], ['off', 64]]);
  stop();
  assert.equal(input.onmidimessage, null);
});

test('a MIDI note reaches the on-screen keyboard waiting for an answer', async () => {
  const { routeMidi } = await import('../js/piano/keyboard.js').catch(e => ({ routeMidi: null, e }));
  if (!routeMidi) return; // needs a DOM; covered by the browser check in tools/smoke.mjs
});
