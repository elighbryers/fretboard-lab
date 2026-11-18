// Optional MIDI input (keyboards and e-drum kits) through Web MIDI. Chrome, Edge and Firefox
// on desktop and Chrome on Android support it; Safari (Mac and iPhone) and every iPhone
// browser don't, so there the option simply isn't shown (docs/research-piano.md F2).
// Notes carry their event time, mapped to the audio clock, for timing scores.
//   const stop = listenMidi({ onNote: (midi, velocity, audioTime) => ..., onOff: midi => ... })
import { context } from './audio.js';
import { audioTimeOf } from './timing.js';
import { getSettings, setSetting } from './storage.js';

export const midiSupported = () => typeof navigator !== 'undefined' && typeof navigator.requestMIDIAccess === 'function';
export const midiOn = () => midiSupported() && !!getSettings().midi;

// Pure: a raw MIDI message -> { type: 'on' | 'off' | 'other', note, velocity, channel }.
// Note-on with velocity 0 is a note-off (running status keyboards send that).
export function parseMidiMessage(data) {
  const [status = 0, note = 0, velocity = 0] = data || [];
  const kind = status & 0xf0, channel = (status & 0x0f) + 1;
  if (kind === 0x90 && velocity > 0) return { type: 'on', note, velocity, channel };
  if (kind === 0x80 || (kind === 0x90 && velocity === 0)) return { type: 'off', note, velocity: 0, channel };
  return { type: 'other', note, velocity, channel };
}

let access = null;
async function getAccess() {
  if (!access) access = await navigator.requestMIDIAccess({ sysex: false });
  return access;
}

// Listen on every connected input (and ones plugged in later). Returns stop().
// clock(eventTimeStamp) -> audio time; defaults to the shared timing engine.
export function listenMidi({ onNote, onOff, onDevices, onError }, clock = ts => (context() ? audioTimeOf(ts, context()) : 0)) {
  let stopped = false, acc = null;
  const handler = e => {
    if (stopped) return;
    const m = parseMidiMessage(e.data);
    if (m.type === 'on') onNote?.(m.note, m.velocity / 127, clock(e.timeStamp), m.channel);
    else if (m.type === 'off') onOff?.(m.note, clock(e.timeStamp));
  };
  const attach = () => {
    const names = [];
    acc.inputs.forEach(input => { input.onmidimessage = handler; names.push(input.name); });
    onDevices?.(names);
  };
  if (!midiSupported()) { onError?.('MIDI is not available in this browser.'); return () => {}; }
  getAccess().then(a => { if (stopped) return; acc = a; attach(); a.onstatechange = attach; })
    .catch(() => onError?.('MIDI access was not allowed.'));
  return () => { stopped = true; if (acc) { acc.inputs.forEach(i => { if (i.onmidimessage === handler) i.onmidimessage = null; }); acc.onstatechange = null; } };
}

// The settings block: hidden where Web MIDI doesn't exist (Safari, iPhone).
export const midiSettingsHTML = () => !midiSupported() ? '' : `
  <fieldset class="midi-settings"><legend>MIDI keyboard or e-drum kit</legend>
    <label class="check"><input type="checkbox" id="set-midi"${getSettings().midi ? ' checked' : ''}> Use a MIDI keyboard or e-drum kit</label>
    <p class="muted small">Plug it in by USB (or Bluetooth MIDI), then play: the app reads the notes or drum hits with their exact timing. Tapping the screen always works too.</p>
    <p class="muted small" id="set-midi-devices" aria-live="polite"></p>
  </fieldset>`;
export function wireMidiSettings(root) {
  const box = root.querySelector('#set-midi');
  if (!box) return;
  let stop = null;
  const show = () => {
    stop?.(); stop = null;
    const out = root.querySelector('#set-midi-devices');
    if (!box.checked) { out.textContent = ''; return; }
    stop = listenMidi({ onDevices: names => { out.textContent = names.length ? `Connected: ${names.join(', ')}` : 'No MIDI device found yet. Plug one in.'; }, onError: m => { out.textContent = m; } });
  };
  box.addEventListener('change', e => { setSetting('midi', e.target.checked); show(); });
  if (box.checked) show();
}
