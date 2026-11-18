// Drums: loaded only when Drums is the instrument (js/app.js). Registers the Kit tab, drum
// lessons, drills, play-alongs, review and progress with the shared screens (js/registry.js).
import { register } from '../registry.js';
import drumTab from './tab.js';

register('instrumentTab', drumTab);
register('noNeck', true);
const foot = document.querySelector('footer');
if (foot) foot.textContent = 'Drums';
const sub = document.querySelector('header .title p');
if (sub) sub.textContent = 'See grooves on the grid and the staff. Tap any drum to hear it.';
import './drills.js';
import './routines.js';
import drumPlayalong from './playalong.js';
register('tools', [drumPlayalong]);
import { PadBoard, padIndex } from './board.js';
import { KIT } from './kit.js';
import { scoredRun } from './player.js';
// Lesson positions on drums are pads: { string: 0, fret: index in KIT }.
register('lessonAdapter', {
  toSF: p => ({ s: 0, f: p.fret }),
  board: (host, view, opts = {}) => new PadBoard(host, { ...opts }),
  describe: (s, f) => `the ${KIT[f].name.toLowerCase()}`,
  noteItem: ({ f }) => `pad:${KIT[f].id}`,
  nameAt: (s, f) => KIT[f].name,
  midiOf: () => 0,
  tuning: null
});
// A drum Play step: play the groove with the click, scored with the calibrated windows. Next is
// always available: timing is shown, never required.
register('steps', {
  drumplay(body, d, last, api) {
    body.innerHTML = `<p>${d.text}</p><div class="dp-run"></div>`;
    api.setReady(true);
    return scoredRun(body.querySelector('.dp-run'), { groove: d.groove, bpm: d.bpm || 70, bars: d.bars || 2, samePiece: d.samePiece !== false, only: d.only || null, drill: 'lesson' });
  }
});
import { registerPath } from '../lessons/index.js';
import { DRUM_LEVELS } from './lessons/index.js';
registerPath('drums', DRUM_LEVELS);
