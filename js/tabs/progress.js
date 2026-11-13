// Progress tab. Placeholder: shows what storage already tracks.
import { NOTES, midiAt, pcOf, TUNINGS } from '../theory.js';
import { Fretboard } from '../fretboard.js';
import { allItems, dueItems, getStreak, getLog, resetAll } from '../storage.js';

let el, fb;
const $ = sel => el.querySelector(sel);
const tuning = TUNINGS.standard;
const noteItem = (s, f) => `note:${NOTES[pcOf(midiAt(s, f, tuning))]}@s${tuning.strings[s].num}`;

export default {
  id: 'progress',
  title: 'Progress',
  icon: '<path d="M5 20V12M12 20V5M19 20v-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',

  mount(section) {
    el = section;
    el.innerHTML = `
      <h2>Progress</h2>
      <div class="stats" id="p-stats"></div>
      <h3>Note quiz accuracy by position</h3>
      <p class="muted">Green = mostly right, red = mostly wrong. Empty squares haven't been tried yet.</p>
      <div id="p-board"></div>
      <h3>Practice log</h3>
      <ul class="log" id="p-log"></ul>
      <button id="p-reset" class="quiet">Reset all progress</button>`;
    fb = new Fretboard($('#p-board'), { mode: 'show', ariaLabel: 'Heat map of note quiz accuracy' });
    $('#p-reset').onclick = () => {
      if (confirm('Delete all saved progress, stats and practice log on this device?')) { resetAll(); this.show(); }
    };
  },

  show() {
    const items = allItems(), notes = Object.entries(items).filter(([id]) => id.startsWith('note:'));
    const attempts = notes.reduce((a, [, it]) => a + it.attempts, 0), correct = notes.reduce((a, [, it]) => a + it.correct, 0);
    const streak = getStreak();
    $('#p-stats').innerHTML = [
      ['Day streak', streak.current + (streak.practicedToday ? ' ✓' : '')],
      ['Best streak', streak.best],
      ['Quiz answers', attempts],
      ['Accuracy', attempts ? Math.round(100 * correct / attempts) + '%' : '–'],
      ['Due for review', dueItems().length]
    ].map(([k, v]) => `<div><b>${v}</b><span>${k}</span></div>`).join('');

    const score = (s, f) => { const it = items[noteItem(s, f)]; return it ? it.correct / it.attempts : null; };
    const dots = [];
    tuning.strings.forEach((_, s) => { for (let f = 0; f <= 15; f++) if (score(s, f) != null) dots.push({ s, f, role: 'plain' }); });
    fb.setHeatmap(score).setDots(dots);

    const log = getLog().slice(-10).reverse();
    $('#p-log').innerHTML = log.length
      ? log.map(e => `<li><b>${e.date}</b> · ${e.activity} · ${e.minutes} min${e.detail ? ' · ' + e.detail : ''}</li>`).join('')
      : '<li class="muted">Nothing logged yet. Finish a quiz session and it shows up here.</li>';
  }
};
