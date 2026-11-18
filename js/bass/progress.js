// Bass on the Progress tab: the timing chart and bass milestones (docs/research-bass.md D7).
// The heat map per string and fret is the shared one, drawn on the bass neck.
import { register } from '../registry.js';
import { getLesson, getTimingHistory, getLog } from '../storage.js';
import { timingSection } from '../timing-progress.js';
import { BASS_TABS } from './tabs/index.js';

register('progress', [timingSection('Timing: you and the kick')]);
const bassTabIds = new Set(BASS_TABS.map(t => t.id));
register('badges', [
  { id: 'bass-level-1', glyph: 'B1', title: 'Bass Level 1 complete', how: 'Finish the bass Level 1 Challenge', test: () => getLesson('b1-ch').completed },
  { id: 'bass-first-walk', glyph: '🚶', title: 'First walking chorus', how: 'Finish the walking-bass lesson or play the walking blues play-along',
    test: () => getLesson('b6-2').completed || getLog().some(e => e.tab === 'walking-blues-f') },
  { id: 'bass-locked-30', glyph: '±30', title: 'Locked within ±30 ms for 8 bars', how: 'In Lock to the kick, play 8 bars with 80% of kicks within ±30 ms',
    test: () => getTimingHistory().some(t => t.window <= 30 && t.bars >= 8 && t.hitRate >= 0.8) },
  { id: 'bass-grooves-5', glyph: '5♪', title: 'Five bass grooves', how: 'Play along with five different bass lines',
    test: () => new Set(getLog().filter(e => bassTabIds.has(e.tab)).map(e => e.tab)).size >= 5 }
]);
