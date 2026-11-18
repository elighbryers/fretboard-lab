// Lesson pieces for instruments beyond guitar (used by js/lesson-player.js):
// - a rhythm-grid card (bass, drums): one bar, the notes lit, heard with drums
// - a technique card: one idea, a three-item checklist ticked by the learner
// - a rhythm-grid task: hear a rhythm, tap where the notes fall, check it
// - the "roots on the kick" step (bass Level 1 challenge): timing shown, never blocking
// Grid data: { beats: 4, sub: 4, notes: [steps], kick: [steps], snare?: [steps], midi: 33, bpm: 80 }
import { rhythmGrid, countOf } from './rhythm-grid.js';
import { pluckAt, now, context } from './audio.js';
import { hit } from './drumkit.js';
import { groove } from './groove.js';
import { score } from './timing.js';
import { tapPad, offsetMs, calibrationLine } from './timing-ui.js';
import { addTimingSession, recordAnswer } from './storage.js';
import { esc } from './ui.js';

const rowsFor = (g, editable) => [
  { id: 'notes', label: g.label || 'Bass', cells: editable ? [] : g.notes, editable, preview: () => g.midi && pluckAt(g.midi, (context()?.currentTime || 0) + 0.02, 0.8) },
  ...(g.kick ? [{ id: 'kick', label: 'Kick', cells: g.kick, mark: '◆' }] : []),
  ...(g.snare ? [{ id: 'snare', label: 'Snare', cells: g.snare, mark: '▲' }] : [])
];
const sounds = g => ({
  notes: t => (g.midi ? pluckAt(g.midi, t, 0.9) : hit(g.piece || 'snare', t, 0.8)),
  kick: t => hit('kick', t, 0.9),
  snare: t => hit('snare', t, 0.7),
  hat: t => hit('hat', t, 0.45)
});
// Hats on every 8th, so the pulse is always there.
const hats = g => Array.from({ length: (g.beats || 4) * 2 }, (_, i) => i * (g.sub || 4) / 2);

export function gridCard(host, g) {
  host.innerHTML = '<div class="rg-host"></div><div class="row"><button class="primary" data-g="play">▶ Hear it with drums</button></div>';
  const grid = rhythmGrid(host.querySelector('.rg-host'), { beats: g.beats || 4, sub: g.sub || 4, rows: rowsFor(g, false) });
  host.querySelector('[data-g="play"]').onclick = () => grid.play({ bpm: g.bpm || 80, bars: 2, sounds: { ...sounds(g), hat: sounds(g).hat }, override: { hat: hats(g) } });
  return () => grid.stop();
}

export function techniqueCard(host, items, onAll) {
  const done = new Set();
  host.innerHTML = `<ul class="technique">${items.map((t, i) => `<li><label class="check"><input type="checkbox" data-t="${i}"> ${t}</label></li>`).join('')}</ul>
    <p class="muted small">Try each one on your instrument, then tick it.</p>`;
  host.querySelectorAll('input').forEach(b => b.onchange = () => { b.checked ? done.add(b.dataset.t) : done.delete(b.dataset.t); if (done.size === items.length) onAll?.(); });
  return () => {};
}

// A rhythm task: hear it, tap the cells, Check. onRight() once it matches. Retry until right.
export function gridTask(host, task, { onRight, onWrong }) {
  const g = task.grid, shownAt = performance.now();
  host.innerHTML = `<div class="row"><button class="primary" data-g="hear">▶ Hear the rhythm</button><button data-g="mine">▶ Hear mine</button></div>
    <div class="rg-host"></div><div class="row"><button class="primary" data-g="check">Check</button></div>`;
  const grid = rhythmGrid(host.querySelector('.rg-host'), { beats: g.beats || 4, sub: g.sub || 4, rows: rowsFor(g, true) });
  const s = sounds(g), play = cells => grid.play({ bpm: g.bpm || 80, bars: 2, sounds: { ...s }, override: { notes: cells, hat: hats(g) } });
  host.querySelector('[data-g="hear"]').onclick = () => play(g.notes);
  host.querySelector('[data-g="mine"]').onclick = () => play(grid.cells('notes'));
  let first = true;
  host.querySelector('[data-g="check"]').onclick = () => {
    const ok = grid.check('notes', g.notes);
    if (task.item && first) recordAnswer(task.item, ok, performance.now() - shownAt);
    first = false;
    if (ok) onRight?.(); else onWrong?.(`Not quite: ✕ marks an extra note, ○ a missing one. The notes fall on ${g.notes.map(i => countOf(i, g.sub || 4)).join(' ')}.`);
  };
  setTimeout(() => play(g.notes), 300);
  return () => grid.stop();
}

// Bass Level 1 challenge: over a drum loop, the app names a root each bar; play it (and tap)
// on beat 1 with the kick. Timing is shown; the step always lets you carry on.
export function kickRootsStep(body, d, { setReady }) {
  const bars = d.bars || 8, bpm = d.bpm || 70;
  body.innerHTML = `<p>${d.text}</p><p class="small">${calibrationLine()}</p>
    <p class="target-big" id="kr-root" aria-live="polite"></p>
    <button class="tap-pad" id="kr-pad" aria-label="Tap on beat 1 as you play the root">Tap on beat 1</button>
    <p class="msg" id="kr-msg" aria-live="polite"></p>
    <div class="row"><button class="primary" id="kr-go">▶ Start drums</button></div>`;
  const $ = s => body.querySelector(s);
  let detach = null, running = false, timers = [];
  const stop = () => { detach?.(); detach = null; timers.forEach(clearTimeout); timers = []; if (groove.running) groove.stop(); running = false; $('#kr-go').textContent = '▶ Start drums'; };
  $('#kr-go').onclick = () => {
    if (running) { stop(); return; }
    if (!context()) return;
    running = true; $('#kr-go').textContent = '■ Stop';
    const taps = [], downbeats = [];
    detach = tapPad($('#kr-pad'), t => taps.push(t));
    groove.start({ style: d.style || 'rock8', bpm, onBeat: (beat, t, bar) => {
      if (beat !== 0) return;
      const k = bar - 1, r = d.roots[Math.max(0, k) % d.roots.length];
      if (bar === 0) timers.push(setTimeout(() => { $('#kr-root').innerHTML = `Get ready: first root <b>${esc(d.roots[0].label)}</b>`; }, Math.max(0, (t - now()) * 1000)));
      if (k >= 0 && k < bars) { downbeats.push(t); timers.push(setTimeout(() => { $('#kr-root').innerHTML = `Bar ${k + 1} of ${bars}: <b>${esc(r.label)}</b>`; }, Math.max(0, (t - now() - 60 / bpm) * 1000))); }
      if (k === bars) timers.push(setTimeout(() => {
        stop();
        const res = score(downbeats, taps, { offsetMs: offsetMs(), window: d.window || 60 });
        addTimingSession({ drill: 'lesson-kick', bpm, n: res.played, bias: res.bias, spread: res.spread, hitRate: Math.round(res.hitRate * 100) / 100, window: d.window || 60, bars });
        $('#kr-root').textContent = '';
        $('#kr-msg').innerHTML = res.played ? `<b>${res.hits} of ${bars}</b> downbeats within ±${d.window || 60} ms. On average ${res.lean === 'on time' ? 'right with the kick' : `${Math.abs(res.bias)} ms ${res.lean}`}; consistency ±${res.spread} ms. Tap Next to carry on.`
          : 'No taps this time. That\'s fine: tapping is only for the timing readout. Tap Next to carry on.';
        $('#kr-msg').className = 'msg good';
        setReady(true);
      }, Math.max(0, (t - now()) * 1000) + 150));
    } });
  };
  return stop;
}
