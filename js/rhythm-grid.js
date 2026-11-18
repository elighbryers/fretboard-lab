// A one-bar step grid: rows of cells (bass notes, kick, snare ...), the count under each column
// ("1 e & a"), a playhead that moves in time with the sound. Bass lessons use it as the rhythm
// card (tap where the notes fall, hear it with drums); drums use it as the main view.
//   const g = rhythmGrid(host, { beats: 4, sub: 4, rows: [{ id: 'bass', label: 'Bass', cells: [0, 8], editable: true }, ...] })
//   g.cells('bass') -> [0, 8];  g.play({ bpm, sounds: { bass: (t, step) => ..., kick: (t) => hit('kick', t) } })
import { context } from './audio.js';

export const COUNTS = { 4: ['', 'e', '&', 'a'], 2: ['', '&'], 3: ['', 'trip', 'let'], 1: [''] };
// The count syllable of a step: step 0 -> '1', 2 -> '&', 5 -> 'e' (sub = steps per beat).
export const countOf = (step, sub = 4) => { const b = Math.floor(step / sub) + 1, k = step % sub; return k === 0 ? String(b) : COUNTS[sub][k]; };

export function rhythmGrid(host, { beats = 4, sub = 4, rows, onChange, labels = true } = {}) {
  const n = beats * sub;
  const state = Object.fromEntries(rows.map(r => [r.id, new Set(r.cells || [])]));
  let timers = [], marks = {};
  host.innerHTML = `<div class="rgrid" style="--cols:${n}" role="group" aria-label="Rhythm grid, ${beats} beats">
    ${rows.map(r => `<div class="rg-row" data-row="${r.id}"><span class="rg-label">${r.label}</span>${Array.from({ length: n }, (_, i) =>
      `<button class="rg-cell${i % sub === 0 ? ' beat' : ''}" data-step="${i}" ${r.editable ? '' : 'disabled'} aria-label="${r.label}, count ${countOf(i, sub)}${i % sub === 0 ? '' : ` of beat ${Math.floor(i / sub) + 1}`}"></button>`).join('')}</div>`).join('')}
    ${labels ? `<div class="rg-row rg-counts" aria-hidden="true"><span class="rg-label"></span>${Array.from({ length: n }, (_, i) => `<span class="${i % sub === 0 ? 'beat' : ''}">${countOf(i, sub)}</span>`).join('')}</div>` : ''}
  </div>`;
  const paint = () => rows.forEach(r => host.querySelectorAll(`[data-row="${r.id}"] .rg-cell`).forEach(c => {
    const i = +c.dataset.step, on = state[r.id].has(i), m = marks[r.id]?.[i];
    c.classList.toggle('on', on); c.setAttribute('aria-pressed', on);
    c.classList.toggle('good', m === 'good'); c.classList.toggle('bad', m === 'bad'); c.classList.toggle('missing', m === 'missing');
    c.textContent = m === 'bad' ? '✕' : m === 'missing' ? '○' : on ? (r.mark || '●') : '';
  }));
  host.querySelector('.rgrid').addEventListener('click', e => {
    const c = e.target.closest('.rg-cell'); if (!c || c.disabled) return;
    const row = c.closest('.rg-row').dataset.row, i = +c.dataset.step, set = state[row];
    set.has(i) ? set.delete(i) : set.add(i);
    marks = {};
    paint();
    onChange?.(row, [...set].sort((a, b) => a - b));
    const r = rows.find(x => x.id === row);
    if (set.has(i)) r.preview?.();
  });
  paint();
  const api = {
    cells: id => [...state[id]].sort((a, b) => a - b),
    set(id, cells) { state[id] = new Set(cells); marks = {}; paint(); },
    // Compare a row with a target: marks right (good), extra (bad) and missing cells. Returns true if equal.
    check(id, target) {
      const want = new Set(target), have = state[id], m = {};
      have.forEach(i => { m[i] = want.has(i) ? 'good' : 'bad'; });
      want.forEach(i => { if (!have.has(i)) m[i] = 'missing'; });
      marks = { ...marks, [id]: m };
      paint();
      return have.size === want.size && [...want].every(i => have.has(i));
    },
    // Play `bars` bars: sounds[rowId](audioTime, step) for every on cell; the column lights as it plays.
    play({ bpm = 80, sounds = {}, bars = 1, override = {} } = {}) {
      api.stop();
      const c = context(); if (!c) return 0;
      const t0 = c.currentTime + 0.1, stepDur = 60 / bpm / sub;
      for (let b = 0; b < bars; b++) for (let i = 0; i < n; i++) {
        const t = t0 + (b * n + i) * stepDur;
        Object.keys(sounds).forEach(id => { const cells = override[id] || state[id]; if (cells && (cells.has ? cells.has(i) : cells.includes(i))) sounds[id](t, i); });
        timers.push(setTimeout(() => { host.querySelectorAll('.rg-cell.now, .rg-counts .now').forEach(x => x.classList.remove('now')); host.querySelectorAll(`[data-step="${i}"]`).forEach(x => x.classList.add('now')); host.querySelectorAll('.rg-counts span')[i]?.classList.add('now'); }, (t - c.currentTime) * 1000));
      }
      const end = t0 + bars * n * stepDur;
      timers.push(setTimeout(() => host.querySelectorAll('.now').forEach(x => x.classList.remove('now')), (end - c.currentTime) * 1000));
      return end;
    },
    stop() { timers.forEach(clearTimeout); timers = []; host.querySelectorAll('.now').forEach(x => x.classList.remove('now')); }
  };
  return api;
}
