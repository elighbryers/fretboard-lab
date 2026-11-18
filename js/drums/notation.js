// Drum notation from a groove, as ABC for abcjs (docs/research-drums.md D1): kick in the bottom
// space, snare on the third space, toms around it, cymbals with x noteheads above, hi-hat foot
// below the staff. One chord per step, so step k of the grid is note k of the staff (the playhead
// moves through both together). Pure: tested in tests/drums.test.mjs.
import { KIT, piece, stepsOf } from './kit.js';

// Note lengths (L:1/16): a 16th-grid step is 1, so a beat is 4; on an 8th-triplet grid each step is 2/3.
const len = (steps, sub) => (sub === 3 ? '2/3' : sub === 2 ? String(steps * 2) : steps === 1 ? '' : String(steps));
// grooveAbcMap(g) -> { abc, index: step -> notation element number (or -1 for a held/rest step) }.
// Inside each beat, a hit lasts until the next hit (16th grids), so a rock beat reads as eighth notes.
export function grooveAbcMap(g, { title = '' } = {}) {
  const n = stepsOf(g), barSteps = g.beats * g.sub, index = new Array(n).fill(-1);
  const at = Array.from({ length: n }, () => []);
  Object.entries(g.hits).forEach(([p, steps]) => steps.forEach(s => { if (s < n) at[s].push(p); }));
  const noteOf = (ps, s) => {
    const notes = ps.map(p => { const st = piece(p).staff; return (st.x ? '!style=x!' : '') + st.pitch; });
    return (ps.some(p => g.accents?.[p]?.includes(s)) ? '!>!' : '') + (notes.length > 1 ? `[${notes.join('')}]` : notes[0]);
  };
  let body = '', el = 0;
  for (let b = 0; b < n / g.sub; b++) {
    const s0 = b * g.sub;
    if (g.sub === 3) {
      body += '(3';
      for (let s = s0; s < s0 + 3; s++) { body += (at[s].length ? noteOf(at[s], s) : 'z') + len(1, 3); index[s] = el++; }
    } else {
      const on = []; for (let s = s0; s < s0 + g.sub; s++) if (at[s].length) on.push(s);
      if (!on.length) { body += 'z' + len(g.sub, g.sub); index[s0] = el++; }
      else {
        if (on[0] > s0) { body += 'z' + len(on[0] - s0, g.sub); index[s0] = el++; }
        on.forEach((s, k) => { const d = (on[k + 1] ?? s0 + g.sub) - s; body += noteOf(at[s], s) + len(d, g.sub); index[s] = el++; });
      }
    }
    body += ' ';
    if (((b + 1) * g.sub) % barSteps === 0) body += '| ';
  }
  return { abc: `X:1\n${title ? `T:${title}\n` : ''}M:${g.beats}/4\nL:1/16\nK:C clef=perc stafflines=5\n${body.trim().replace(/\|$/, '|]')}\n`, index };
}
export const grooveAbc = (g, opts) => grooveAbcMap(g, opts).abc;
// The legend under the staff.
export const LEGEND = KIT.filter(p => p.id !== 'ohat').map(p => ({ id: p.id, name: p.name, where: { F: 'bottom space', A: 'second space', c: 'third space', d: 'fourth line', e: 'fourth space', f: 'top line', g: 'space above, x', a: 'ledger line above, x', D: 'below the staff, x' }[p.staff.pitch] || '' }));
