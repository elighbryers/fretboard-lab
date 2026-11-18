// The timing chart on the Progress tab (bass and drums): average early/late and spread per
// session, from js/storage.js timing sessions. Shared, so drums uses the same section.
import { getTimingHistory } from './storage.js';
import { timingChart } from './charts.js';
import { fmtDay } from './stats.js';
import { esc } from './ui.js';

const NAMES = { 'lock-kick': 'Lock to the kick', 'lesson-kick': 'Lesson: roots on the kick', 'drum-play': 'Drum play-along', 'drum-tap': 'Drum timing' };
export function timingSection(title = 'Timing', sub = 'Each column is a session: the dot is how early or late you were on average, the bar is your spread (consistency). The shaded band is ±30 ms.') {
  return {
    id: 'p-timing', title, sub,
    render(body, width) {
      const rows = getTimingHistory().slice(-20);
      if (!rows.length) { body.innerHTML = '<p class="muted">No timing sessions yet. Try Lock to the kick in Practice → Drills.</p><p class="chart-note"></p>'; return; }
      const last = rows[rows.length - 1];
      body.innerHTML = timingChart(rows.map((r, i) => ({ bias: r.bias, spread: r.spread, label: i === 0 || i === rows.length - 1 ? fmtDay(r.day) : '',
        tip: `${fmtDay(r.day)} · ${NAMES[r.drill] || r.drill} at ${r.bpm} bpm: ${r.bias === 0 ? 'on time' : `${Math.abs(r.bias)} ms ${r.bias < 0 ? 'early' : 'late'}`} on average, spread ±${r.spread} ms${r.hitRate != null ? `, ${Math.round(r.hitRate * 100)}% in ±${r.window || 60} ms` : ''}` })), { width, label: 'Timing per session' }) +
        `<p class="chart-note">Last session: ${esc(NAMES[last.drill] || last.drill)}, ${last.bias === 0 ? 'on time' : `${Math.abs(last.bias)} ms ${last.bias < 0 ? 'early' : 'late'}`} on average, spread ±${last.spread} ms.</p>`;
    }
  };
}
