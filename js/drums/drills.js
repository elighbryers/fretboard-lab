// Drum drills (docs/research-drums.md D3, D4): Read it tap it, Hear it tap it back, Stickings and
// rudiments, and Internal time (gap click, fading click, tempo ladder). Tapping is always enough;
// an e-kit (MIDI) works on every pad. Results go to the review items, the log and the timing chart.
import { registerDrill } from '../practice/drills.js';
import { register } from '../registry.js';
import { scoredRun } from './player.js';
import { scoreHits, DRUM_WINDOWS } from './score.js';
import { level, windowSeg } from './player.js';
import { grooveAbcMap } from './notation.js';
import { renderAbc } from '../notation.js';
import { rhythmGrid, countOf } from '../rhythm-grid.js';
import { context, now, click } from '../audio.js';
import { hit } from '../drumkit.js';
import { audioTimeOf } from '../timing.js';
import { tapPad, offsetMs, calibrationLine } from '../timing-ui.js';
import { recordAnswer, addLog, addTimingSession, getSettings, setSetting, recordClean, getTempo } from '../storage.js';
import { esc, pick, shuffle } from '../ui.js';

register('ownDrillsOnly', true);

import { RHYTHMS, RUDIMENTS, rhythmGroove, findRhythm, findRudiment, stickingGroove } from './rudiments.js';
export { RHYTHMS, RUDIMENTS, rhythmGroove, findRhythm, findRudiment, stickingGroove };

/* ---------- Read it, tap it ---------- */
function readDrill(el, { byEar = false } = {}) {
  let n = 0, stop = null;
  const next = () => {
    stop?.();
    n++;
    const pool = RHYTHMS.slice(0, Math.min(RHYTHMS.length, 3 + n)), r = pick(pool), g = rhythmGroove(r);
    el.innerHTML = `<p class="prompt">${byEar ? 'Listen to the rhythm (▶ Hear it), then tap it back on the snare.' : `Read it, then tap it on the snare: <b>${esc(r.name)}</b>.`}</p>
      ${byEar ? '' : '<div class="staff-box" id="dd-staff"></div>'}<div id="dd-run"></div>
      <div class="row"><button id="dd-next">Next rhythm →</button><span class="muted small">Round ${n}</span></div>`;
    if (!byEar) renderAbc(el.querySelector('#dd-staff'), grooveAbcMap(g).abc);
    stop = scoredRun(el.querySelector('#dd-run'), { groove: g, bpm: r.sub === 3 ? 70 : 80, bars: 2, samePiece: false, showGrid: !byEar, drill: byEar ? 'drum-ear' : 'drum-read',
      onDone: res => {
        const ok = res.played >= res.total * 0.8 && res.extra <= 1;
        recordAnswer(byEar ? `groove-ear:${r.id}` : `count:${r.id}`, ok, 3000);
        addLog({ minutes: 1, activity: `Drill: ${byEar ? 'Hear it, tap it back' : 'Read it, tap it'}`, detail: `${r.name}: ${res.inTime}/${res.total} in time`, drill: byEar ? 'drum-ear' : 'drum-read', score: res.inTime, total: res.total });
        if (byEar) { el.querySelector('#dd-run').insertAdjacentHTML('afterbegin', `<p class="msg">It was: <b>${esc(r.name)}</b>.</p>`); }
      } });
    el.querySelector('#dd-next').onclick = next;
  };
  next();
  return () => stop?.();
}
registerDrill({ id: 'drum-read', own: true, title: 'Read it, tap it', blurb: 'See a rhythm on the grid and staff; tap it in time', mount: el => readDrill(el) });
registerDrill({ id: 'drum-ear', own: true, title: 'Hear it, tap it back', blurb: 'The app plays a bar; you tap it back', mount: el => readDrill(el, { byEar: true }) });

/* ---------- Stickings and rudiments ---------- */
registerDrill({ id: 'drum-sticking', own: true, title: 'Stickings and rudiments', blurb: 'RLRL, RRLL, paradiddles, flams, drags, rolls on two pads',
  mount(el) {
    let st = { rud: 'singles', bpm: 60, ...(getSettings().drumSticking || {}) }, stop = null;
    const draw = () => {
      stop?.();
      const r = findRudiment(st.rud), g = stickingGroove(r.sticking), best = getTempo(`rudiment:${r.id}`);
      el.innerHTML = `<div class="row"><label>Rudiment<select id="dr-rud">${RUDIMENTS.map(x => `<option value="${x.id}"${x.id === r.id ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
        <label>Tempo<select id="dr-bpm">${[50, 60, 70, 80, 90, 100, 110, 120].map(v => `<option${v === st.bpm ? ' selected' : ''}>${v}</option>`).join('')}</select></label></div>
        <p class="sticking" aria-label="Sticking">${[...r.sticking].map(c => `<span class="${c === '.' ? 'rest' : c === c.toLowerCase() ? 'grace' : ''}">${c === '.' ? '·' : c.toUpperCase()}</span>`).join('')}</p>
        <p class="muted small">R = right hand, L = left. Small letters are grace notes: play them quietly, just before the main note. Tap the R and L pads (or F and J on a keyboard).${best ? ` Your best clean tempo: ${best.best} bpm.` : ''}</p>
        <div class="stick-pads"><button class="pad" data-hand="L"><b>L</b><span class="limb limb-L">left</span><kbd>F</kbd></button><button class="pad" data-hand="R"><b>R</b><span class="limb limb-R">right</span><kbd>J</kbd></button></div>
        <div class="row">${windowSeg()}</div><p class="msg" id="sk-msg"></p><div class="lk-hits" id="sk-hits"></div>
        <div class="row center"><button class="primary big" id="sk-go">▶ Start (2 bars)</button></div>`;
      el.querySelector('#dr-rud').onchange = e => { st.rud = e.target.value; setSetting('drumSticking', st); draw(); };
      el.querySelector('#dr-bpm').onchange = e => { st.bpm = +e.target.value; setSetting('drumSticking', st); };
      el.querySelector('#ds-win').onclick = e => { const b = e.target.closest('button'); if (!b) return; setSetting('drumWindow', b.dataset.w); el.querySelectorAll('#ds-win button').forEach(x => x.setAttribute('aria-pressed', x === b)); };
      let taps = [], running = false, timers = [];
      const press = (hand, e) => { if (!running) { hit('snare', undefined, hand === 'R' ? 0.8 : 0.65); return; } const c = context(); hit('snare', undefined, hand === 'R' ? 0.8 : 0.65); taps.push({ piece: hand, t: audioTimeOf(e.timeStamp, c) }); const p = el.querySelector(`[data-hand="${hand}"]`); p.classList.remove('flash'); void p.offsetWidth; p.classList.add('flash'); };
      el.querySelector('.stick-pads').addEventListener('pointerdown', e => { const b = e.target.closest('[data-hand]'); if (b) { e.preventDefault(); press(b.dataset.hand, e); } });
      const key = e => { if (e.repeat) return; const h = e.key.toLowerCase() === 'f' ? 'L' : e.key.toLowerCase() === 'j' ? 'R' : null; if (h) { e.preventDefault(); press(h, e); } };
      document.addEventListener('keydown', key);
      el.querySelector('#sk-go').onclick = () => {
        const c = context(); if (!c || running) return;
        running = true; taps = [];
        const spb = 60 / st.bpm, t0 = c.currentTime + 0.2 + 4 * spb;
        for (let i = 0; i < 4; i++) click(c.currentTime + 0.2 + i * spb, i === 0 ? 2 : 1, 0.9);
        for (let i = 0; i < 8; i++) click(t0 + i * spb, i % 4 === 0 ? 2 : 1, 0.4);
        el.querySelector('#sk-msg').textContent = 'Count-in… then play!';
        timers.push(setTimeout(() => {
          running = false;
          const exp = [0, 1].flatMap(b => Object.entries(g.hits).flatMap(([hand, steps]) => steps.map(s => ({ t: t0 + (b * 16 + s) / 4 * spb, piece: hand, step: s }))));
          const res = scoreHits(exp, taps.map(h => ({ ...h, t: h.t - offsetMs() / 1000 })), { level: level(), samePiece: true });
          const clean = res.played >= res.total * 0.9 && res.extra <= 1;
          recordAnswer(`sticking:${r.id}`, clean, 3000);
          if (clean && res.hitRate >= 0.8) recordClean(`rudiment:${r.id}`, st.bpm, r.name);
          addTimingSession({ drill: 'drum-sticking', bpm: st.bpm, n: res.played, bias: res.bias, spread: res.spread, hitRate: Math.round(res.hitRate * 100) / 100, window: res.window, bars: 2 });
          addLog({ minutes: 1, activity: `Rudiment: ${r.name}`, detail: `${res.played}/${res.total} right hand on the right note, ${res.inTime} in time at ${st.bpm} bpm`, drill: 'drum-sticking', score: res.inTime, total: res.total });
          el.querySelector('#sk-hits').innerHTML = res.notes.map(nn => `<span class="hit ${nn.tight ? 'tight' : nn.inTime ? 'in' : 'out'}">${nn.piece} ${nn.error > 0 ? '+' : ''}${nn.error}</span>`).join('') + (res.missed ? `<span class="hit miss">${res.missed} missed or wrong hand</span>` : '');
          el.querySelector('#sk-msg').innerHTML = `<b>${res.played} of ${res.total}</b> with the right hand, ${res.inTime} in time. ${res.lean === 'on time' ? 'On time on average' : `${Math.abs(res.bias)} ms ${res.lean} on average`}, consistency ±${res.spread} ms.` + (clean && res.hitRate >= 0.8 ? ` Clean! Try ${st.bpm + 10} bpm next.` : '');
        }, (t0 + 8 * spb - c.currentTime + 0.4) * 1000));
      };
      stop = () => { document.removeEventListener('keydown', key); timers.forEach(clearTimeout); };
    };
    draw();
    return () => stop?.();
  } });

/* ---------- Internal time: gap click, fading click, tempo ladder ---------- */
export const MODES = { gap: 'Gap click: 2 bars on, 2 bars off', fade: 'Fading click: it gets quieter until it\'s gone', ladder: 'Tempo ladder: up 4 bpm after a clean pass, down after a sloppy one' };
// Pure: which bars of a gap-click run are silent (on, off bars repeating).
export const silentBar = (bar, on = 2, off = 2) => bar % (on + off) >= on;
// Pure: click volume in a fading run of `bars` bars (full for the first bar, then down to 0).
export const fadeVolume = (bar, bars = 8) => Math.max(0, 1 - bar / (bars - 2));
// Pure: the next tempo on a ladder.
export const ladderNext = (bpm, clean, step = 4, min = 40, max = 200) => Math.max(min, Math.min(max, clean ? bpm + step : bpm - step));
registerDrill({ id: 'drum-time', own: true, title: 'Internal time', blurb: 'Gap click, fading click and tempo ladders: keep time when the click goes',
  mount(el) {
    let st = { mode: 'gap', bpm: 80, ...(getSettings().drumTime || {}) }, detach = null, timers = [];
    el.innerHTML = `<p class="muted">Tap the pad (or Space) on every beat, and keep going when the click drops out. Your time in the silent bars is scored separately.</p>
      <div class="field"><span class="lbl">Mode</span><div class="seg" id="it-mode">${Object.entries(MODES).map(([k, v]) => `<button data-m="${k}" aria-pressed="${k === st.mode}">${v.split(':')[0]}</button>`).join('')}</div><small class="muted" id="it-desc"></small></div>
      <div class="row"><label>Tempo<select id="it-bpm">${[60, 70, 80, 90, 100, 110, 120].map(v => `<option${v === st.bpm ? ' selected' : ''}>${v}</option>`).join('')}</select></label></div>
      <div class="row">${windowSeg()}</div><p class="small">${calibrationLine()}</p>
      <div class="beat-dots" id="it-dots" aria-hidden="true">${[0, 1, 2, 3].map(i => `<i data-b="${i}"${i ? '' : ' class="one"'}></i>`).join('')}</div>
      <p class="target-big" id="it-state" aria-live="polite"></p>
      <button class="tap-pad" id="it-pad" aria-label="Tap on every beat">Tap on every beat</button>
      <p class="msg" id="it-msg" aria-live="polite"></p>
      <div class="row center"><button class="primary big" id="it-go">▶ Start</button></div>`;
    const $ = s => el.querySelector(s);
    const desc = () => { $('#it-desc').textContent = MODES[st.mode]; };
    desc();
    $('#it-mode').onclick = e => { const b = e.target.closest('button'); if (!b) return; st.mode = b.dataset.m; setSetting('drumTime', st); el.querySelectorAll('#it-mode button').forEach(x => x.setAttribute('aria-pressed', x === b)); desc(); };
    $('#it-bpm').onchange = e => { st.bpm = +e.target.value; setSetting('drumTime', st); };
    $('#ds-win').onclick = e => { const b = e.target.closest('button'); if (!b) return; setSetting('drumWindow', b.dataset.w); el.querySelectorAll('#ds-win button').forEach(x => x.setAttribute('aria-pressed', x === b)); };
    const pulse = (beat, t) => timers.push(setTimeout(() => { const d = $(`#it-dots i[data-b="${beat}"]`); if (d) { d.classList.remove('pulse'); void d.offsetWidth; d.classList.add('pulse'); } }, Math.max(0, (t - now()) * 1000)));
    const stop = () => { detach?.(); detach = null; timers.forEach(clearTimeout); timers = []; };
    // One pass: `bars` bars of quarter notes after a 1-bar count-in. Returns a promise of { all, silent }.
    const pass = (bpm, bars, vol) => new Promise(done => {
      const c = context(), spb = 60 / bpm, t0 = c.currentTime + 0.2 + 4 * spb, beats = [], silentBeats = [], taps = [];
      for (let i = 0; i < 4; i++) click(c.currentTime + 0.2 + i * spb, i === 0 ? 2 : 1, 0.9);
      for (let b = 0; b < bars; b++) {
        const v = vol(b);
        timers.push(setTimeout(() => { $('#it-state').textContent = v > 0 ? `Bar ${b + 1}${v < 1 ? ' (quieter)' : ''}` : `Bar ${b + 1}: no click, keep going!`; }, Math.max(0, (t0 + b * 4 * spb - now()) * 1000)));
        for (let k = 0; k < 4; k++) { const t = t0 + (b * 4 + k) * spb; beats.push(t); if (v <= 0) silentBeats.push(t); if (v > 0) { click(t, k === 0 ? 2 : 1, v * 0.8); pulse(k, t); } }
      }
      detach = tapPad($('#it-pad'), t => taps.push({ t }));
      timers.push(setTimeout(() => {
        detach?.(); detach = null;
        const adj = taps.map(h => ({ t: h.t - offsetMs() / 1000 }));
        const all = scoreHits(beats.map(t => ({ t })), adj, { level: level(), samePiece: false });
        const silent = scoreHits(silentBeats.map(t => ({ t })), adj.filter(h => silentBeats.some(s => Math.abs(h.t - s) < spb / 2)), { level: level(), samePiece: false });
        done({ all, silent });
      }, (t0 + bars * 4 * spb - c.currentTime + 0.4) * 1000));
    });
    const report = (r, label) => `${label}: <b>${r.all.inTime}/${r.all.total}</b> in time overall; in the silent bars <b>${r.silent.inTime}/${r.silent.total}</b>, ${r.silent.lean === 'on time' ? 'on time' : `${Math.abs(r.silent.bias)} ms ${r.silent.lean}`} (drift), consistency ±${r.silent.spread || r.all.spread} ms.`;
    $('#it-go').onclick = async () => {
      if (!context()) return;
      stop();
      $('#it-go').disabled = true;
      if (st.mode === 'ladder') {
        let bpm = st.bpm, rungs = [];
        for (let k = 0; k < 5; k++) {
          $('#it-msg').textContent = `Rung ${k + 1} of 5: ${bpm} bpm`;
          const r = await pass(bpm, 2, () => 1), clean = r.all.hitRate >= 0.8;
          rungs.push(`${bpm}${clean ? '✓' : '✗'}`);
          addTimingSession({ drill: 'drum-ladder', bpm, n: r.all.played, bias: r.all.bias, spread: r.all.spread, hitRate: Math.round(r.all.hitRate * 100) / 100, window: r.all.window, bars: 2 });
          if (clean) recordClean('drum-ladder', bpm, 'Tempo ladder');
          bpm = ladderNext(bpm, clean);
        }
        $('#it-msg').innerHTML = `Ladder: ${rungs.join(' → ')}. Next time start at ${Math.max(40, Math.min(...rungs.map(x => parseInt(x))))} bpm or a little higher.`;
        addLog({ minutes: 2, activity: 'Drill: Tempo ladder', detail: rungs.join(' → '), drill: 'drum-time' });
      } else {
        const bars = 8, vol = st.mode === 'gap' ? b => (silentBar(b) ? 0 : 1) : b => fadeVolume(b, bars);
        const r = await pass(st.bpm, bars, vol);
        $('#it-msg').innerHTML = report(r, st.mode === 'gap' ? 'Gap click' : 'Fading click');
        $('#it-msg').className = 'msg ' + (r.silent.hitRate >= 0.8 ? 'good' : '');
        addTimingSession({ drill: st.mode === 'gap' ? 'drum-gap' : 'drum-fade', bpm: st.bpm, n: r.all.played, bias: r.silent.played ? r.silent.bias : r.all.bias, spread: r.silent.played ? r.silent.spread : r.all.spread, hitRate: Math.round(r.all.hitRate * 100) / 100, window: r.all.window, bars });
        addLog({ minutes: 1, activity: `Drill: ${st.mode === 'gap' ? 'Gap click' : 'Fading click'}`, detail: `${r.silent.inTime}/${r.silent.total} in time without the click at ${st.bpm} bpm`, drill: 'drum-time', score: r.silent.inTime, total: r.silent.total });
      }
      $('#it-state').textContent = '';
      $('#it-go').disabled = false;
    };
    return stop;
  } });
export const _x = { countOf, rhythmGrid, shuffle, DRUM_WINDOWS };
