// Piano: loaded only when Piano is the instrument (js/app.js). Registers the Keyboard tab,
// the lesson adapter (lessons place keys as MIDI numbers), the piano sound, drills, tools,
// play-alongs, lessons and progress with the shared screens (js/registry.js).
import { register } from '../registry.js';
import { Keyboard, nameOct, keyItem } from './keyboard.js';
import { preferredName } from '../theory.js';
import pianoTab from './tab.js';

register('instrumentTab', pianoTab);
// Lesson positions on piano are { midi } (or a plain MIDI number); a key on the board is { s: 0, f: midi }.
register('lessonAdapter', {
  toSF: p => ({ s: 0, f: typeof p === 'number' ? p : p.midi }),
  board: (host, view, opts = {}) => new Keyboard(host, { view, labels: 'none', lock: opts.mode === 'tap', noGlideAnswers: true, ...opts }),
  describe: (s, f) => nameOct(f),
  noteItem: ({ f }) => keyItem(f),
  nameAt: (s, f) => preferredName(f),
  midiOf: (s, f) => f,
  tuning: null
});
const foot = document.querySelector('footer');
if (foot) foot.textContent = 'Piano';
import { usePianoSound } from './sound.js';
usePianoSound();
import './drills.js';
const sub = document.querySelector('header .title p');
if (sub) sub.textContent = 'See scales and chords on the keys. Tap any key to hear it.';
