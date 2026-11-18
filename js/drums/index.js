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
