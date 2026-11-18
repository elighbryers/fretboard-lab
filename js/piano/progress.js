// Piano on the Progress tab (docs/research-piano.md D7): a keyboard heat map (key finder),
// a staff heat map (staff reader: ledger lines are the usual weak spot), and pieces with the
// tempo reached and hands separate / together. Piano milestones too.
import { register } from '../registry.js';
import { Keyboard, keyItem } from './keyboard.js';
import { allItems, allTempos, getLog, getLesson } from '../storage.js';
import { PIECES } from './pieces.js';
import { midiOfName } from './pieces.js';
import { esc } from '../ui.js';

const acc = it => (it ? it.correct / it.attempts : null);
const STAFF = { treble: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'], bass: ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'] };
const cell = (label, a) => `<span class="sh-cell${a == null ? ' none' : ''}" style="${a == null ? '' : `background:hsl(${Math.round(a * 125)} 60% 40%)`}" title="${esc(label)}: ${a == null ? 'not tried' : Math.round(a * 100) + '%'}">${esc(label)}</span>`;

register('progress', [
  { id: 'p-keys', title: 'Keys and staff notes', sub: 'Key finder and staff reader accuracy. Green is solid, red often missed, grey not tried yet.',
    render(body) {
      const items = allItems();
      body.innerHTML = '<div class="pk-kb"></div><h4>Treble staff</h4><div class="sh-row" id="sh-treble"></div><h4>Bass staff</h4><div class="sh-row" id="sh-bass"></div><p class="chart-note"></p>';
      const kb = new Keyboard(body.querySelector('.pk-kb'), { view: [60, 71], keyWidth: 30, playOnTap: false, ariaLabel: 'Heat map of key finder accuracy' });
      kb.setHeatmap(m => { const a = acc(items[keyItem(m)]); return a == null ? -1 : a; });
      for (const clef of ['treble', 'bass']) body.querySelector('#sh-' + clef).innerHTML = STAFF[clef].map(n => cell(n, acc(items[`staff:${clef}@${n}`]))).join('');
    } },
  { id: 'p-pieces', title: 'Pieces', sub: 'The fastest clean tempo for each piece, and whether you have played it hands separately and together.',
    render(body) {
      const t = allTempos(), log = getLog();
      const rows = PIECES.map(p => {
        const best = t[`piece:${p.id}`], mine = log.filter(e => e.tab === p.id).map(e => e.detail || '');
        const hands = ['right hand', 'left hand', 'hands together'].filter(h => mine.some(d => d.includes(h)));
        return best || hands.length ? `<tr><td>${esc(p.title)}</td><td>${best ? `${best.best} bpm (${Math.round(100 * best.best / p.bpm)}%)` : '–'}</td><td>${hands.join(', ') || '–'}</td></tr>` : '';
      }).join('');
      body.innerHTML = rows ? `<table class="p-table"><thead><tr><th>Piece</th><th>Clean tempo</th><th>Played</th></tr></thead><tbody>${rows}</tbody></table>` : '<p class="muted">No pieces yet. Try one in Practice → Play-along.</p>';
    } }
]);
register('badges', [
  { id: 'piano-level-1', glyph: 'P1', title: 'Piano Level 1 complete', how: 'Finish the piano Level 1 Challenge', test: () => getLesson('p1-ch').completed },
  { id: 'piano-hands-together', glyph: '🙌', title: 'Hands together', how: 'Play a piece with both hands in Play-along', test: () => getLog().some(e => /hands together/.test(e.detail || '') && PIECES.some(p => p.id === e.tab)) },
  { id: 'piano-staff-25', glyph: '𝄞', title: 'Staff reader', how: 'Read 25 staff notes correctly', test: () => Object.entries(allItems()).filter(([id]) => id.startsWith('staff:')).reduce((a, [, it]) => a + it.correct, 0) >= 25 },
  { id: 'piano-full-speed', glyph: '100%', title: 'Full speed', how: 'Reach a piece\'s written tempo with the tempo trainer', test: () => Object.entries(allTempos()).some(([id, t]) => id.startsWith('piece:') && t.best >= (PIECES.find(p => `piece:${p.id}` === id)?.bpm || 999)) }
]);
export const _m = midiOfName;
