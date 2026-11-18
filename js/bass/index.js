// Bass: loaded only when Bass is the instrument (js/app.js). Registers the bass tools,
// lessons, drills, play-alongs and sound with the shared screens (js/registry.js).
import { register } from '../registry.js';
import fretboardPanel from './fretboard-panel.js';

register('fretboardPanel', fretboardPanel);
const foot = document.querySelector('footer');
if (foot) foot.textContent = 'Bass · 20 frets';
import { useBassSound } from './sound.js';
useBassSound();
import { register as reg2 } from '../registry.js';
reg2('playGroove', 'rock8'); // every bass Play step runs over a drum loop (research-bass.md D2)
import './drills.js';
import bassPlayalong from './playalong.js';
import { register as reg3 } from '../registry.js';
reg3('tools', [bassPlayalong]);
