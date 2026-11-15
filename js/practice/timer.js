// Practice timer: routines made of timed blocks. The runner keeps going while
// you open the drill or play-along a block points to; a small bar at the top
// of the page shows the current block (see mountTimerBar).
import { metronome, chime } from '../audio.js';
import { addLog, minutesOn, getStreak, getPracticePrefs, updatePracticePrefs } from '../storage.js';
import { volumeHTML, esc, clock } from '../ui.js';
import { applyMetronomeSettings } from './metronome.js';

// A block: { name, minutes, bpm?, open? }  open = where "Open" goes, e.g. 'drills&drill=notes'
export const ROUTINES = {
  quick10: {
    name: 'Quick 10', blurb: 'Warm-up, note finding, play-along',
    blocks: [
      { name: 'Warm-up: chromatic 1-2-3-4', minutes: 3, bpm: 60, open: 'playalong&tab=chromatic-warmup' },
      { name: 'Note finder', minutes: 4, open: 'drills&drill=notes' },
      { name: 'Play-along', minutes: 3, open: 'playalong' }
    ]
  },
  daily15: {
    name: 'Daily 15', blurb: 'Short daily session: warm-up, scales, ear, play-along',
    blocks: [
      { name: 'Warm-up: chromatic 1-2-3-4', minutes: 3, bpm: 60, open: 'playalong&tab=chromatic-warmup' },
      { name: 'Scales at 80 bpm', minutes: 4, bpm: 80 },
      { name: 'Hear it, find it', minutes: 4, open: 'drills&drill=hear' },
      { name: 'Play-along', minutes: 4, open: 'playalong' }
    ]
  }
};
const DEFAULT_CUSTOM = [
  { name: 'Scales', minutes: 5, bpm: 80 },
  { name: 'Note quiz', minutes: 5, open: 'drills&drill=notes' },
  { name: 'Play-along', minutes: 5, open: 'playalong' }
];
const customBlocks = () => getPracticePrefs().custom || DEFAULT_CUSTOM.map(b => ({ ...b }));
const routineFor = id => (id === 'custom' ? { name: 'Custom', blocks: customBlocks() } : ROUTINES[id]);

/* ---------- the runner (one per page) ---------- */
export const runner = {
  state: 'idle',          // idle | running | paused | done
  routine: null, index: 0, left: 0, done: [], clickOn: true,
  speed: 1,               // test hook: #practice?tool=timer&speed=60 runs 60x faster
  _last: 0, _timer: null, _listeners: new Set(), result: null,

  on(fn) { this._listeners.add(fn); return () => this._listeners.delete(fn); },
  _emit() { document.body.classList.toggle('routine-running', this.state === 'running' || this.state === 'paused'); this._listeners.forEach(fn => fn(this)); },
  get block() { return this.routine && this.routine.blocks[this.index]; },

  start(routine, speed = 1) {
    this.stop(false);
    this.routine = { ...routine, blocks: routine.blocks.map(b => ({ ...b })) };
    this.speed = speed;
    this.done = routine.blocks.map(() => 0);
    this.state = 'running';
    this._enter(0);
    this._last = performance.now();
    this._timer = setInterval(() => this._tick(), 200);
    this._emit();
  },
  _enter(i) {
    this.index = i;
    this.left = this.block.minutes * 60;
    this._syncClick();
  },
  _syncClick() {
    const b = this.block;
    if (this.state === 'running' && this.clickOn && b && b.bpm) {
      applyMetronomeSettings();
      metronome.setBpm(b.bpm);
      if (!metronome.running) metronome.start();
    } else if (metronome.running && this._ownsClick) metronome.stop();
    this._ownsClick = !!(this.state === 'running' && this.clickOn && b && b.bpm);
  },
  _tick() {
    if (this.state !== 'running') return;
    const t = performance.now(), dt = (t - this._last) / 1000 * this.speed;
    this._last = t;
    this.done[this.index] += Math.min(dt, Math.max(0, this.left)); // never count past the block's length
    this.left -= dt;
    if (this.left <= 0) this.next();
    else this._emit();
  },
  next() {
    if (this.index + 1 < this.routine.blocks.length) { chime(); this._enter(this.index + 1); this._emit(); }
    else this.finish();
  },
  pause() { if (this.state === 'running') { this.state = 'paused'; this._syncClick(); this._emit(); } },
  resume() { if (this.state === 'paused') { this.state = 'running'; this._last = performance.now(); this._syncClick(); this._emit(); } },
  setClick(on) { this.clickOn = on; this._syncClick(); this._emit(); },
  finish(early = false) {
    clearInterval(this._timer);
    const secs = this.done.reduce((a, b) => a + b, 0), minutes = Math.round(secs / 60);
    if (!early || secs >= 60) {
      const parts = this.routine.blocks.filter((_, i) => this.done[i] >= 1).map(b => b.name);
      addLog({ minutes: Math.max(1, minutes), activity: `Routine: ${this.routine.name}`, detail: parts.join(', ') + (early ? ' (stopped early)' : '') });
    }
    this.result = { name: this.routine.name, minutes: Math.max(1, minutes), early };
    this.state = 'done';
    this._syncClick();
    if (!early) chime();
    this._emit();
  },
  stop(log = true) {
    if (this.state === 'running' || this.state === 'paused') { if (log) this.finish(true); else clearInterval(this._timer); }
  },
  reset() { this.state = 'idle'; this.routine = null; this._emit(); }
};

// Small bar shown above every screen while a routine runs (except on the timer screen).
export function mountTimerBar(bar) {
  const paint = () => {
    const onTimer = /tool=timer/.test(location.hash);
    const active = runner.state === 'running' || runner.state === 'paused';
    bar.hidden = !active || onTimer;
    if (bar.hidden) return;
    bar.innerHTML = `<a href="#practice?tool=timer">⏱ <b>${esc(runner.block.name)}</b> ${clock(runner.left)}${runner.state === 'paused' ? ' · paused' : ''}</a>`;
  };
  runner.on(paint);
  window.addEventListener('hashchange', paint);
  paint();
}

/* ---------- screens ---------- */
export default {
  id: 'timer',
  title: 'Timer',
  blurb: 'Quick 10, Daily 15 or your own routine',
  icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 13V9M9 2h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',

  mount(el, params) {
    const speed = Math.max(1, Math.min(600, +params.get('speed') || 1));
    let editing = false;
    const $ = s => el.querySelector(s);

    const choose = () => {
      const custom = customBlocks();
      const card = (id, r) => `
        <div class="routine">
          <div><b>${esc(r.name)}</b><small>${r.blocks.map(b => `${b.minutes} min ${esc(b.name)}${b.bpm ? ` @ ${b.bpm}` : ''}`).join(' · ')}</small></div>
          <button class="primary" data-start="${id}">▶ Start</button>
        </div>`;
      el.innerHTML = `
        <p class="muted">Short daily sessions work best. Pick a routine; a soft chime marks each new block.</p>
        ${card('quick10', ROUTINES.quick10)}${card('daily15', ROUTINES.daily15)}
        <div class="routine">
          <div><b>Custom</b><small>${custom.map(b => `${b.minutes} min ${esc(b.name)}${b.bpm ? ` @ ${b.bpm}` : ''}`).join(' · ') || 'No blocks yet'}</small></div>
          <div class="row"><button id="tm-edit">Edit</button><button class="primary" data-start="custom"${custom.length ? '' : ' disabled'}>▶ Start</button></div>
        </div>
        <div id="tm-editor"></div>`;
      el.querySelectorAll('[data-start]').forEach(b => b.onclick = () => runner.start(routineFor(b.dataset.start), speed));
      $('#tm-edit').onclick = () => { editing = !editing; editor(); };
      if (editing) editor();
    };

    // Custom routine editor: name, minutes, optional bpm; reorder and remove.
    const editor = () => {
      const blocks = customBlocks(), host = $('#tm-editor');
      if (!editing) { host.innerHTML = ''; return; }
      const saveBlocks = list => { updatePracticePrefs({ custom: list }); choose(); };
      host.innerHTML = `<div class="editor">${blocks.map((b, i) => `
        <div class="block-row" data-i="${i}">
          <label class="grow">Block<input type="text" data-k="name" value="${esc(b.name)}" maxlength="40"></label>
          <label>Min<input type="number" data-k="minutes" min="1" max="60" value="${b.minutes}"></label>
          <label>BPM<input type="number" data-k="bpm" min="30" max="250" value="${b.bpm || ''}" placeholder="–"></label>
          <div class="row tight">
            <button class="icon" data-act="up" aria-label="Move up"${i === 0 ? ' disabled' : ''}>↑</button>
            <button class="icon" data-act="down" aria-label="Move down"${i === blocks.length - 1 ? ' disabled' : ''}>↓</button>
            <button class="icon" data-act="del" aria-label="Remove block">✕</button>
          </div>
        </div>`).join('')}
        <div class="row"><button id="tm-add">+ Add block</button><button class="primary" id="tm-done">Done</button></div></div>`;
      host.onchange = e => {
        const row = e.target.closest('.block-row'), k = e.target.dataset.k;
        if (!row || !k) return;
        const list = customBlocks(), b = list[+row.dataset.i];
        if (k === 'name') b.name = e.target.value.trim() || 'Block';
        if (k === 'minutes') b.minutes = Math.min(60, Math.max(1, Math.round(+e.target.value) || 1));
        if (k === 'bpm') { const v = Math.round(+e.target.value); if (v >= 30 && v <= 250) b.bpm = v; else delete b.bpm; }
        saveBlocks(list);
      };
      host.onclick = e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const list = customBlocks();
        if (btn.id === 'tm-add') { list.push({ name: 'New block', minutes: 5 }); saveBlocks(list); return; }
        if (btn.id === 'tm-done') { editing = false; choose(); return; }
        const i = +btn.closest('.block-row').dataset.i, act = btn.dataset.act;
        if (act === 'up') [list[i - 1], list[i]] = [list[i], list[i - 1]];
        if (act === 'down') [list[i + 1], list[i]] = [list[i], list[i + 1]];
        if (act === 'del') list.splice(i, 1);
        saveBlocks(list);
      };
    };

    const running = () => {
      const r = runner, b = r.block, n = r.routine.blocks.length, nextB = r.routine.blocks[r.index + 1];
      if (!$('#tm-run')) {
        el.innerHTML = `
          <div class="timer-run" id="tm-run">
            <p class="muted" id="tm-of"></p>
            <h3 class="block-name" id="tm-name"></h3>
            <div class="time-left" id="tm-left" aria-live="off"></div>
            <div class="bar"><i id="tm-bar"></i></div>
            <p class="muted" id="tm-next"></p>
            <div id="tm-open"></div>
            <div class="row center">
              <button class="primary big" id="tm-pause"></button>
              <button class="big" id="tm-skip">Skip block</button>
              <button class="big" id="tm-stop">Stop</button>
            </div>
            <label class="check"><input type="checkbox" id="tm-click"> Metronome for blocks with a tempo</label>
            ${volumeHTML('metroVol', 'Metronome volume')}
          </div>`;
        $('#tm-pause').onclick = () => (runner.state === 'paused' ? runner.resume() : runner.pause());
        $('#tm-skip').onclick = () => runner.next();
        $('#tm-stop').onclick = () => runner.stop();
        $('#tm-click').onchange = e => runner.setClick(e.target.checked);
      }
      $('#tm-of').textContent = `${r.routine.name} · block ${r.index + 1} of ${n}`;
      $('#tm-name').textContent = b.name + (b.bpm ? ` · ${b.bpm} bpm` : '');
      $('#tm-left').textContent = clock(r.left);
      $('#tm-bar').style.width = `${100 * (1 - r.left / (b.minutes * 60))}%`;
      $('#tm-next').textContent = nextB ? `Next: ${nextB.name}` : 'Last block';
      $('#tm-open').innerHTML = b.open ? `<a class="button-link" href="#practice?tool=${b.open}">Open ${esc(b.name.split(':')[0])} →</a>` : '';
      $('#tm-pause').textContent = r.state === 'paused' ? '▶ Resume' : '❚❚ Pause';
      $('#tm-click').checked = r.clickOn;
    };

    const finished = () => {
      const s = getStreak(), res = runner.result;
      el.innerHTML = `
        <div class="done-card">
          <div class="big-emoji" aria-hidden="true">🎸</div>
          <h3>${res.early ? 'Stopped. Every minute counts.' : 'Nice, come back tomorrow'}</h3>
          <p>${esc(res.name)} · ${res.minutes} min logged</p>
          <p class="today">This week: <b>${s.weekDays} of 7 days</b> · Today: <b>${minutesOn()} min</b></p>
          <button class="primary big" id="tm-back">Back to routines</button>
        </div>`;
      $('#tm-back').onclick = () => { runner.reset(); };
    };

    const paint = () => {
      if (runner.state === 'running' || runner.state === 'paused') running();
      else if (runner.state === 'done') finished();
      else if (!el.querySelector('.routine')) choose();
    };
    const off = runner.on(paint);
    if (runner.state === 'idle') choose(); else paint();
    return off;
  }
};
