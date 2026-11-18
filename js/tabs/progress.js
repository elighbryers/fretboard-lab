// Progress tab: the most useful numbers at the top, details further down.
// All numbers come from js/stats.js; charts are plain SVG from js/charts.js.
import { NOTES, midiAt, pcOf } from '../theory.js';
import { Fretboard } from '../fretboard.js';
import { exportData, readExport, importData, resetAll, seeMilestones, today, getSettings, setSetting, getDays, allTempos, INSTRUMENTS, getInstrument, setInstrument, activeTuning } from '../storage.js';
import { storagePersisted, isStandalone } from '../pwa.js';
import { glance, dailyMinutes, weeklyAccuracy, calendar, weakest, noteStats, confusedPairs, drillStats, tabStats,
  checkMilestones, fmtMin, fmtDay } from '../stats.js';
import { bars, line, calendarGrid, spark } from '../charts.js';
import { hashFor } from '../router.js';
import { esc } from '../ui.js';
import { tuningOf, itemNum } from '../instruments.js';
import { micSettingsHTML, wireMicSettings } from '../mic.js';
import { midiSettingsHTML, wireMidiSettings } from '../midi.js';

let el, fb, pending = null, resizeTimer = null;
const $ = sel => el.querySelector(sel);
const tuning = activeTuning(); // the heat map is per instrument
const noteItem = (s, f) => `note:${NOTES[pcOf(midiAt(s, f, tuning))]}@s${itemNum(tuning, s)}`;
const pct = x => Math.round(100 * x) + '%';
const secs = ms => (ms / 1000).toFixed(1) + ' s';
// Calendar shading: practiced days get 1-4 by minutes.
const calLevel = d => !d.practiced && !d.minutes ? 0 : d.minutes >= 40 ? 4 : d.minutes >= 20 ? 3 : d.minutes >= 10 ? 2 : 1;
const plural = (n, w, many = w + 's') => `${n} ${n === 1 ? w : many}`;

const section = (id, title, sub = '') => `
  <section class="p-card" id="${id}"><h3>${title}</h3>${sub ? `<p class="muted sub">${sub}</p>` : ''}<div class="p-body"></div></section>`;

export default {
  id: 'progress',
  title: 'Progress',
  icon: '<path d="M5 20V12M12 20V5M19 20v-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',

  mount(sec) {
    el = sec;
    el.innerHTML = `
      <h2>Progress</h2>
      <p class="p-note" id="p-note" hidden></p>
      <div class="backup-nudge" id="p-backup" hidden></div>
      <div class="tiles" id="p-tiles"></div>
      ${section('p-minutes', 'Practice minutes, last 30 days')}
      ${section('p-acc', 'Quiz and drill accuracy, by week', 'Share of drill rounds and lesson questions answered right.')}
      ${section('p-cal', 'Practice calendar, last 16 weeks', 'Each square is a day. Darker means more minutes.')}
      <section class="p-card" id="p-weak"><h3>Weak spots</h3>
        <p class="muted sub">Note finder accuracy by position. Tap a square for the details<span class="phone-only">, swipe the neck for frets up to 12</span>.</p>
        <div id="p-board"></div>
        <div class="heat-key" aria-hidden="true"><span><i class="hk-bad"></i>Often missed</span><span><i class="hk-mid"></i>Getting there</span><span><i class="hk-good"></i>Solid</span><span><i class="hk-none"></i>Not tried yet</span></div>
        <p class="chart-note" id="p-board-note"></p>
        <h4>Your 5 weakest</h4><div id="p-weakest"></div>
        <h4>Mixed-up pairs</h4><div id="p-pairs"></div>
      </section>
      <section class="p-card"><h3>Drills</h3><div id="p-drills"></div></section>
      <section class="p-card"><h3>Play-along tabs</h3><div id="p-tabs"></div></section>
      <section class="p-card"><h3>Clean tempo and chord changes</h3><p class="muted sub">The fastest you've played each exercise cleanly (next time it starts a little below this), and your best one-minute chord changes.</p><div id="p-tempos"></div></section>
      <section class="p-card"><h3>Milestones</h3><div class="badges" id="p-badges"></div></section>
      <section class="p-card" id="p-settings"><h3>Settings</h3>
        <fieldset class="instrument-pick"><legend>Instrument</legend>
          ${INSTRUMENTS.map(i => `<label class="${i.ready ? '' : 'soon'}"><input type="radio" name="p-instrument" value="${i.id}"
            ${i.id === getInstrument() ? 'checked' : ''} ${i.ready || i.id === getInstrument() ? '' : 'disabled'}>
            ${esc(i.name)}${i.ready ? '' : ' <span class="muted">· coming soon</span>'}</label>`).join('')}
        </fieldset>
        <p class="muted small">Lessons, the fretboard heat map, placement and clean tempos are kept separately for each
          instrument. The theory you've learned, your streak and the practice log are shared.</p>
        ${micSettingsHTML()}
        ${midiSettingsHTML()}
      </section>
      <section class="p-card"><h3>Your data</h3>
        <p class="muted sub">Progress is saved in this browser only. Export it to keep a copy or move it to another device.</p>
        <p class="export-status" id="p-export-status"></p>
        <div class="row">
          <button id="p-export">Export progress</button>
          <label class="button-like"><input type="file" id="p-import" accept=".json,application/json" hidden>Import progress</label>
        </div>
        <div id="p-import-box" hidden></div>
        <p class="muted" id="p-data-msg" aria-live="polite"></p>
        <button id="p-reset" class="quiet">Reset all progress</button>
      </section>`;

    fb = new Fretboard($('#p-board'), { mode: 'tap', view: [0, 12], labels: 'none', playOnTap: false,
      ariaLabel: 'Heat map of note finder accuracy', onTap: ({ s, f }) => this.boardNote(s, f) });

    // Tap or hover any chart mark to read its value under the chart.
    const tip = e => {
      const t = e.target.closest('[data-tip]'), card = t?.closest('.p-card');
      if (!t || !card) return;
      card.querySelectorAll('.on').forEach(x => x.classList.remove('on'));
      t.classList.add('on');
      card.querySelector('.chart-note').textContent = t.dataset.tip;
    };
    el.addEventListener('click', tip);
    el.addEventListener('mouseover', tip);

    // Switching instruments swaps which lessons, heat map and tempos every tab shows, so reload them all.
    el.querySelector('.instrument-pick').onchange = e => { setInstrument(e.target.value); location.reload(); };
    wireMicSettings(el);
    wireMidiSettings(el);
    $('#p-export').onclick = () => this.exportNow();
    this.exportNow = () => {
      setSetting('lastExport', Date.now());  // first, so the file carries its own export date
      const blob = new Blob([JSON.stringify(exportData(), null, 1)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `fretboard-lab-progress-${today()}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      $('#p-data-msg').textContent = 'Saved a copy to your downloads.';
      this.backupStatus();
    };
    $('#p-import').onchange = async e => {
      const file = e.target.files[0];
      e.target.value = '';
      if (file) this.askImport(file);
    };
    $('#p-reset').onclick = () => {
      if (confirm('Delete all saved progress, stats and practice log on this device? This cannot be undone.')) { resetAll(); this.show(); }
    };
    window.addEventListener('resize', () => {
      if (el.hidden) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.charts(), 150);
    });
  },

  show() {
    const imported = sessionStorage.getItem('fl-imported');
    sessionStorage.removeItem('fl-imported');
    const badges = checkMilestones(), fresh = badges.filter(b => b.fresh);
    const note = $('#p-note');
    note.hidden = !(imported || fresh.length);
    note.textContent = imported ? `Progress imported (${imported === 'merge' ? 'merged with this device' : 'replaced this device'}).`
      : fresh.length ? `New badge${fresh.length > 1 ? 's' : ''}: ${fresh.map(b => b.title).join(', ')}` : '';
    seeMilestones();

    this.tiles();
    this.charts();
    this.weakSpots();
    this.tables();
    $('#p-badges').innerHTML = badges.map(b => `
      <div class="badge${b.earned ? ' earned' : ''}" title="${esc(b.earned ? b.title : b.how)}">
        <span class="badge-ico" aria-hidden="true">${b.glyph}</span>
        <span><b>${b.title}${b.fresh ? ' <em>New</em>' : ''}</b><small>${b.earned ? 'Earned ' + fmtDay(today(b.at)) : b.how}</small></span>
      </div>`).join('');
    $('#p-import-box').hidden = true;
    $('#p-data-msg').textContent = '';
    this.backupStatus();
  },

  // "Last export: <date>", whether the browser keeps storage, and a gentle nudge
  // after 2 weeks without an export (counted from the first practice day if never).
  backupStatus() {
    const last = getSettings().lastExport, days = getDays(), now = Date.now(), TWO_WEEKS = 14 * 86400000;
    const since = last || (days.length ? new Date(days[0] + 'T12:00').getTime() : null);
    const kept = storagePersisted() || isStandalone();
    $('#p-export-status').innerHTML = `Last export: <b>${last ? fmtDay(today(last), { month: 'short', day: 'numeric', year: 'numeric' }) : 'never'}</b>` +
      (kept ? ' · <span class="ok">This browser keeps your progress.</span>' : '');
    const overdue = since != null && now - since > TWO_WEEKS;
    const box = $('#p-backup');
    box.hidden = !overdue;
    if (!overdue) return;
    const weeks = Math.floor((now - since) / (7 * 86400000));
    box.innerHTML = `<span>${last ? `It's been ${weeks} weeks since your last export.` : "You haven't exported your progress yet."} A copy keeps it safe if this browser clears its data.</span>
      <button id="p-backup-now">Export now</button>`;
    box.querySelector('#p-backup-now').onclick = () => this.exportNow();
  },

  tiles() {
    const g = glance();
    $('#p-tiles').innerHTML = [
      // Practice days this week is the headline; the streak forgives one rest day a week.
      ['This week', `${g.streak.weekDays} of 7 days`, g.streak.practicedToday ? 'Practised today ✓' : ''],
      ['Streak', plural(g.streak.current, 'day'), `Best ${g.streak.best}${g.streak.current ? ` · ${g.streak.restUsedThisWeek ? 'rest day used this week' : '1 rest day this week'}` : ''}`],
      ['Today', fmtMin(g.today)],
      ['Minutes this week', fmtMin(g.week)],
      ['All time', fmtMin(g.all)],
      ['Learn path', g.path.text]
    ].map(([k, v, hint]) => `<div class="tile"><span>${k}</span><b>${esc(v)}</b>${hint ? `<small>${hint}</small>` : ''}</div>`).join('');
  },

  charts() {
    const width = Math.max(260, $('#p-minutes').clientWidth - 32);
    const t = today();

    const days = dailyMinutes(30), total = days.reduce((a, d) => a + d.minutes, 0);
    const practiced = days.filter(d => d.minutes).length;
    $('#p-minutes .p-body').innerHTML = total
      ? bars(days.map((d, i) => ({
          v: d.minutes, tip: `${fmtDay(d.day, { weekday: 'short', month: 'short', day: 'numeric' })}: ${fmtMin(d.minutes)}`,
          label: i === days.length - 1 ? 'Today' : (days.length - 1 - i) % 7 === 0 ? fmtDay(d.day) : ''
        })), { width, label: `Practice minutes per day for the last 30 days, ${total} minutes in total` }) +
        `<p class="chart-note">${fmtMin(total)} over ${plural(practiced, 'day')}. Tap a bar for that day.</p><a class="link small" href="#practice?tool=log">Full practice log →</a>`
      : '<p class="empty">No practice logged in the last 30 days yet. Drills, lessons and the timer add minutes here.</p>';

    const weeks = weeklyAccuracy(12), withData = weeks.filter(w => w.pct != null);
    $('#p-acc .p-body').innerHTML = withData.length
      ? line(weeks.map((w, i) => ({
          v: w.pct, tip: w.total ? `Week of ${fmtDay(w.week)}: ${w.pct}% (${w.right} of ${w.total} right)` : `Week of ${fmtDay(w.week)}: no drills or quizzes`,
          label: i === weeks.length - 1 ? 'This week' : (weeks.length - 1 - i) % 4 === 0 ? fmtDay(w.week) : ''
        })), { width, label: 'Accuracy per week for the last 12 weeks' }) +
        `<p class="chart-note">Latest: ${withData[withData.length - 1].pct}% in the week of ${fmtDay(withData[withData.length - 1].week)}. Tap a week for details.</p>`
      : '<p class="empty">Finish a drill or a lesson quiz to start this chart.</p>';

    const cal = calendar(16), any = cal.flat().some(d => d.practiced || d.minutes);
    $('#p-cal .p-body').innerHTML = any
      ? `<div class="cal-wrap">${calendarGrid(cal.map(wk => wk.map(d => ({
          ...d, level: calLevel(d),
          tip: `${fmtDay(d.day, { weekday: 'short', month: 'short', day: 'numeric' })}: ${d.practiced || d.minutes ? (d.minutes ? fmtMin(d.minutes) : 'practiced') : 'no practice'}${d.day === t ? ' (today)' : ''}`
        }))), { width, label: 'Practice days over the last 16 weeks', month: day => fmtDay(day, { month: 'short' }) })}</div>
        <div class="cal-key" aria-hidden="true">Less <i class="cal-0"></i><i class="cal-1"></i><i class="cal-2"></i><i class="cal-3"></i><i class="cal-4"></i> More</div>
        <p class="chart-note">${plural(cal.flat().filter(d => d.practiced || d.minutes).length, 'practice day')} in 16 weeks. Tap a day for details.</p>`
      : '<p class="empty">Your practice days will fill in here, one square per day.</p>';
  },

  weakSpots() {
    const stat = noteStats(noteItem);
    this.stat = stat;
    fb.setHeatmap((s, f) => { const x = stat(s, f); return x ? x.acc : -1; });
    fb.clearMarks();
    const tried = tuning.strings.some((_, s) => Array.from({ length: 13 }, (_, f) => stat(s, f)).some(Boolean));
    $('#p-board-note').textContent = tried ? 'Tap a square to see how you did there.' : 'Nothing tried yet. Play the Note finder drill and your results fill in here.';

    const weak = weakest(5, 3);
    $('#p-weakest').innerHTML = weak.length ? `
      <ol class="weak-list">${weak.map(w => `
        <li><b>${esc(w.name)}</b><span class="meter" aria-hidden="true"><i style="width:${Math.max(4, Math.round(100 * w.acc))}%"></i></span>
          <small>${pct(w.acc)} right · ${secs(w.ms)} avg · ${plural(w.attempts, 'try', 'tries')}</small></li>`).join('')}</ol>
      <a class="button-link primary" id="p-practice" href="${hashFor('practice', { tool: 'drills', drill: 'review', items: weak.map(w => w.id).join(',') })}">Practice these (10 rounds)</a>`
      : '<p class="empty">Nothing here yet. Items show up after you\'ve tried them at least 3 times in the drills, and missed at least once.</p>';

    const pairs = confusedPairs(2, 4);
    $('#p-pairs').innerHTML = pairs.length
      ? `<ul class="pairs">${pairs.map(p => `<li><b>${p.a}</b> ↔ <b>${p.b}</b><small>mixed up ${plural(p.count, 'time')}</small></li>`).join('')}</ul>
         <p class="muted small">The Interval trainer drills these pairs side by side.</p>`
      : '<p class="empty">No mix-ups yet. If you confuse two intervals, like a minor and a major 3rd, they show up here.</p>';
  },

  boardNote(s, f) {
    const x = this.stat(s, f), name = `${NOTES[pcOf(midiAt(s, f, tuning))]} on string ${tuning.strings[s].num}${f ? ', fret ' + f : ', open'}`;
    fb.mark(s, f, !x || x.acc >= 0.5, NOTES[pcOf(midiAt(s, f, tuning))]);
    $('#p-board-note').textContent = x ? `${name}: ${x.correct} of ${x.attempts} right (${pct(x.acc)}).` : `${name}: not tried yet.`;
  },

  tables() {
    const drills = drillStats();
    $('#p-drills').innerHTML = drills.some(d => d.sessions)
      ? `<table class="stat-table"><thead><tr><th>Drill</th><th>Sessions</th><th>Best</th><th>Average</th></tr></thead><tbody>${drills.map(d =>
          `<tr><td><a href="#practice?tool=drills&drill=${d.id}">${d.title}</a></td><td>${d.sessions}</td><td>${d.best == null ? '–' : d.best + '%'}</td><td>${d.avg == null ? '–' : d.avg + '%'}</td></tr>`).join('')}</tbody></table>`
      : '<p class="empty">No drills played yet. <a href="#practice?tool=drills">Try one</a>: they take about two minutes.</p>';

    const tabs = tabStats();
    $('#p-tabs').innerHTML = tabs.some(t => t.times)
      ? `<table class="stat-table"><thead><tr><th>Tab</th><th>Times</th><th>Top tempo</th></tr></thead><tbody>${tabs.map(t =>
          `<tr><td><a href="#practice?tool=playalong&tab=${t.id}">${esc(t.title)}</a></td><td>${t.times || '–'}</td><td>${t.pct ? `${t.bpm} bpm <small class="muted">(${t.pct}%)</small>` : '–'}</td></tr>`).join('')}</tbody></table>`
      : '<p class="empty">No play-alongs yet. <a href="#practice?tool=playalong">Pick a tab</a> and play along for 20 seconds or more.</p>';

    const tempos = Object.entries(allTempos()).sort((a, b) => (b[1].history.at(-1)?.day || '').localeCompare(a[1].history.at(-1)?.day || ''));
    $('#p-tempos').innerHTML = tempos.length
      ? `<ul class="tempo-list">${tempos.map(([id, t]) => {
          const vals = t.history.map(h => h.bpm), first = vals[0], gain = vals.length > 1 ? vals.at(-1) - first : 0;
          return `<li><span class="tl-name"><b>${esc(t.title || id)}</b><small>${t.history.length} day${t.history.length === 1 ? '' : 's'}${gain > 0 ? ` · up ${gain} ${t.unit === 'changes' ? 'changes' : 'bpm'}` : ''}</small></span>
            ${spark(vals, { label: `${t.title}: ${vals.join(', ')} ${t.unit || 'bpm'}` })}<span class="tl-best">${t.best}<small> ${t.unit === 'changes' ? 'changes' : 'bpm'}</small></span></li>`;
        }).join('')}</ul>`
      : '<p class="empty">Tap <b>✓ Clean run</b> in a Play step or a play-along to start tracking your clean tempo.</p>';
  },

  async askImport(file) {
    const box = $('#p-import-box'), msg = $('#p-data-msg');
    let parsed, d;
    try { parsed = JSON.parse(await file.text()); d = readExport(parsed); }
    catch (e) { box.hidden = true; msg.textContent = e instanceof SyntaxError ? "That file couldn't be read. Choose a file made with Export progress." : e.message; return; }
    pending = parsed;
    const when = parsed.exportedAt ? ` from ${fmtDay(parsed.exportedAt.slice(0, 10), { month: 'short', day: 'numeric', year: 'numeric' })}` : '';
    const parts = Object.values(d.instruments);
    const lessons = parts.reduce((n, x) => n + Object.values(x.lessons).filter(l => l.completed).length, 0);
    const items = Object.keys(d.items).length + parts.reduce((n, x) => n + Object.keys(x.items).length, 0);
    msg.textContent = '';
    box.hidden = false;
    box.innerHTML = `
      <p><b>Import ${esc(file.name)}${when}?</b><br>
        <span class="muted">${plural(d.log.length, 'practice entry', 'practice entries')}, ${plural(lessons, 'lesson')} done, ${plural(items, 'quiz item')}.</span></p>
      <p class="muted small"><b>Merge</b> keeps the higher or newer value of everything on this device and the file.
        <b>Replace</b> makes this device match the file exactly; what's here now is lost.</p>
      <div class="row"><button class="primary" id="p-merge">Merge</button><button id="p-replace">Replace</button><button class="quiet-inline" id="p-cancel">Cancel</button></div>`;
    const done = mode => { importData(pending, mode); pending = null; sessionStorage.setItem('fl-imported', mode); location.reload(); };
    box.querySelector('#p-merge').onclick = () => done('merge');
    box.querySelector('#p-replace').onclick = () => { if (confirm('Replace all progress on this device with the file?')) done('replace'); };
    box.querySelector('#p-cancel').onclick = () => { pending = null; box.hidden = true; };
  }
};
