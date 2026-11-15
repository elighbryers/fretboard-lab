// Practice log: everything the app logs automatically, plus entries you add
// for practice away from the app. Grouped by week and day, newest first.
import { getLog, addLog, updateLog, deleteLog, today, shiftDay, getStreak, minutesOn } from '../storage.js';
import { esc } from '../ui.js';

const dayLabel = d => new Date(d + 'T12:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
// Monday of the week a day falls in.
const weekOf = d => { const wd = (new Date(d + 'T12:00').getDay() + 6) % 7; return shiftDay(d, -wd); };

export default {
  id: 'log',
  title: 'Log',
  blurb: 'Every session, plus practice away from the app',
  icon: '<svg viewBox="0 0 24 24"><path d="M6 3h10l3 3v15H6z M9 9h7M9 13h7M9 17h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',

  mount(el) {
    let adding = false, editing = null;
    const $ = s => el.querySelector(s);

    const form = (e = {}) => `
      <div class="log-form">
        <div class="row">
          <label>Date<input type="date" name="date" value="${e.date || today()}" max="${today()}"></label>
          ${e.id ? `<label>Time<input type="time" name="time" value="${e.time || ''}"></label>` : ''}
          <label>Minutes<input type="number" name="minutes" min="1" max="600" value="${e.minutes || 15}" inputmode="numeric"></label>
        </div>
        ${e.id ? `<label>What<input type="text" name="activity" maxlength="60" value="${esc(e.activity || '')}"></label>` : ''}
        <label>Note<input type="text" name="detail" maxlength="120" value="${esc(e.detail || '')}" placeholder="e.g. Band rehearsal, worked on barre chords"></label>
        <div class="row"><button class="primary" data-act="save">Save</button><button data-act="cancel">Cancel</button></div>
      </div>`;
    const read = box => Object.fromEntries([...box.querySelectorAll('input')].map(i => [i.name, i.value]));

    function paint() {
      const log = getLog().sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
      const weeks = new Map();
      log.forEach(e => {
        const w = weekOf(e.date);
        if (!weeks.has(w)) weeks.set(w, new Map());
        const days = weeks.get(w);
        if (!days.has(e.date)) days.set(e.date, []);
        days.get(e.date).push(e);
      });
      const thisWeek = [...(weeks.get(weekOf(today()))?.values() || [])].flat().reduce((a, e) => a + e.minutes, 0);
      const s = getStreak();
      el.innerHTML = `
        <div class="stats">
          <div><b>${minutesOn()}</b><span>min today</span></div>
          <div><b>${thisWeek}</b><span>min this week</span></div>
          <div><b>${s.current}</b><span>day streak</span></div>
        </div>
        ${adding ? `<div class="add-box">${form()}</div>` : '<button class="primary big" id="lg-add">+ Add entry</button>'}
        ${log.length ? '' : '<p class="muted">Nothing yet. Timer routines, drills and play-alongs are logged here automatically.</p>'}
        ${[...weeks.entries()].map(([w, days]) => {
          const total = [...days.values()].flat().reduce((a, e) => a + e.minutes, 0);
          return `<section class="week"><h3>Week of ${dayLabel(w)} <span class="muted">· ${total} min</span></h3>
            ${[...days.entries()].map(([d, entries]) => `
              <div class="day"><h4>${d === today() ? 'Today' : dayLabel(d)} <span class="muted">· ${entries.reduce((a, e) => a + e.minutes, 0)} min</span></h4>
              <ul>${entries.map(e => editing === e.id ? `<li data-id="${e.id}">${form(e)}</li>` : `
                <li data-id="${e.id}">
                  <div><b>${esc(e.activity || 'Practice')}</b> <span class="muted">${e.time ? esc(e.time) + ' · ' : ''}${e.minutes} min</span>
                  ${e.detail ? `<small>${esc(e.detail)}</small>` : ''}</div>
                  <div class="row tight"><button class="icon" data-act="edit" aria-label="Edit entry">✎</button><button class="icon" data-act="del" aria-label="Delete entry">✕</button></div>
                </li>`).join('')}</ul></div>`).join('')}
          </section>`;
        }).join('')}`;
    }

    el.onclick = e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.id === 'lg-add') { adding = true; editing = null; paint(); el.querySelector('.add-box input[name=minutes]')?.focus(); return; }
      const act = btn.dataset.act, li = btn.closest('li[data-id]'), id = li?.dataset.id;
      if (act === 'cancel') { adding = false; editing = null; paint(); }
      if (act === 'save') {
        const v = read(btn.closest('.log-form'));
        const minutes = Math.max(1, Math.round(+v.minutes || 0));
        const date = v.date && v.date <= today() ? v.date : today();
        if (id) updateLog(id, { date, time: v.time, minutes, activity: v.activity || 'Practice', detail: v.detail });
        else addLog({ date, minutes, activity: 'Practice (away from the app)', detail: v.detail, ...(date === today() ? {} : { time: '' }) });
        adding = false; editing = null; paint();
      }
      if (act === 'edit') { editing = id; adding = false; paint(); }
      if (act === 'del' && confirm('Delete this entry?')) { deleteLog(id); paint(); }
    };
    paint();
  }
};
