// A scored drum run (docs/research-drums.md F3), shared by drum drills, lessons and play-alongs:
// a count-in, a click (or the groove), you play the pattern on the pads / keys / an e-kit, then a
// summary that keeps early/late (bias) apart from consistency (spread), with every hit shown.
// Easy / Normal / Strict windows; per-device calibration (MIDI has its own). Never blocks anything.
import { context, now, click, metronome } from '../audio.js';
import { hit } from '../drumkit.js';
import { audioTimeOf } from '../timing.js';
import { offsetMs, calibrationLine, runCalibration } from '../timing-ui.js';
import { getSettings, setSetting, addTimingSession } from '../storage.js';
import { DRUM_WINDOWS, scoreHits } from './score.js';
import { stepsOf, piece } from './kit.js';
import { rhythmGrid } from '../rhythm-grid.js';
import { padsHTML, wirePads, flashPad } from './tab.js';
import { midiOn, listenMidi } from '../midi.js';
import { fromGM } from './kit.js';
import { esc } from '../ui.js';

export const level = () => getSettings().drumWindow || 'easy';
export const windowSeg = () => `<div class="seg" id="ds-win" role="group" aria-label="Timing window">${Object.entries(DRUM_WINDOWS).map(([k, w]) =>
  `<button data-w="${k}" aria-pressed="${k === level()}">${k[0].toUpperCase() + k.slice(1)} ±${w.inTime}</button>`).join('')}</div>`;

// Expected hits of a groove for `bars` bars starting at t0.
export function expectedHits(groove, t0, bpm, bars = 1, only = null) {
  const spb = 60 / bpm, out = [], per = groove.beats * groove.sub;
  for (let b = 0; b < bars; b++) Object.entries(groove.hits).forEach(([p, steps]) => {
    if (only && !only.includes(p)) return;
    steps.forEach(s => { if (s < per) out.push({ t: t0 + (b * per + s) / groove.sub * spb, piece: p, step: s }); });
  });
  return out.sort((a, b) => a.t - b.t);
}

export function scoredRun(host, { groove, bpm = 70, bars = 2, title = '', samePiece = true, only = null, drill = 'drum-tap', onDone, showGrid = true, accompany = 'click' }) {
  host.innerHTML = `<div class="drum-run">
    ${showGrid ? '<div class="ds-grid"></div>' : ''}
    <div class="row">${windowSeg()}</div>
    <p class="small ds-cal">${calibrationLine()}</p>
    <div class="row"><button class="small" id="ds-cal">Calibrate</button>${midiOn() ? '<button class="small" id="ds-cal-midi">Calibrate my e-kit</button>' : ''}<button class="small" id="ds-hear">▶ Hear it</button></div>
    <div class="ds-calbox"></div>
    <div class="ds-pads">${padsHTML()}</div>
    <p class="msg" id="ds-msg" aria-live="polite"></p><div class="lk-hits" id="ds-hits"></div>
    <div class="row center"><button class="primary big" id="ds-go">▶ Start (${bars} bar${bars > 1 ? 's' : ''} at ${bpm} bpm)</button></div></div>`;
  const $ = s => host.querySelector(s);
  const grid = showGrid ? rhythmGrid($('.ds-grid'), { beats: groove.beats, sub: groove.sub, rows: Object.keys(groove.hits).filter(p => !only || only.includes(p)).map(p => ({ id: p, label: `${piece(p).name} · ${piece(p).limb}`, cells: groove.hits[p], mark: piece(p).staff.x ? '×' : '●' })) }) : null;
  $('#ds-win').onclick = e => { const b = e.target.closest('button'); if (!b) return; setSetting('drumWindow', b.dataset.w); host.querySelectorAll('#ds-win button').forEach(x => x.setAttribute('aria-pressed', x === b)); };
  let calStop = null;
  $('#ds-cal').onclick = () => { calStop?.(); calStop = runCalibration($('.ds-calbox'), { onDone: () => { $('.ds-cal').innerHTML = calibrationLine(); } }); };
  $('#ds-cal-midi')?.addEventListener('click', () => { calStop?.(); calStop = runCalibration($('.ds-calbox'), { key: 'midi', input: push => listenMidi({ onNote: (n, v, t) => push(t) }), onDone: () => { $('.ds-cal').innerHTML = calibrationLine(); } }); });
  const spb = 60 / bpm, steps = groove.beats * groove.sub;
  const playGroove = (t0, vol = 0.8) => expectedHits(groove, t0, bpm, 1, only).forEach(e => hit(e.piece, e.t, vol));
  $('#ds-hear').onclick = () => { const c = context(); if (c) { const t0 = c.currentTime + 0.1; playGroove(t0); playGroove(t0 + groove.beats * spb); grid?.play({ bpm, bars: 2, sounds: {} }); } };
  let detach = null, timers = [], running = false;
  const stop = () => { detach?.(); detach = null; timers.forEach(clearTimeout); timers = []; running = false; grid?.light(-1); };
  $('#ds-go').onclick = () => {
    const c = context(); if (!c || running) return;
    running = true;
    const taps = [], countIn = groove.beats, t0 = c.currentTime + 0.2 + countIn * spb;
    for (let i = 0; i < countIn; i++) click(c.currentTime + 0.2 + i * spb, i === 0 ? 2 : 1, 0.9);
    for (let i = 0; i < bars * groove.beats; i++) if (accompany === 'click') click(t0 + i * spb, i % groove.beats === 0 ? 2 : 1, 0.45);
    for (let s = 0; s < bars * steps; s++) timers.push(setTimeout(() => grid?.light(s % steps), Math.max(0, (t0 + s / groove.sub * spb - now()) * 1000)));
    $('#ds-msg').textContent = 'Count-in… then play!'; $('#ds-msg').className = 'msg muted'; $('#ds-hits').innerHTML = '';
    const unPads = wirePads($('.ds-pads'), (id, e) => taps.push({ piece: id, t: e?.midiTime ?? audioTimeOf(e.timeStamp, c), midi: e?.midiTime != null }));
    detach = unPads;
    timers.push(setTimeout(() => {
      stop();
      const exp = expectedHits(groove, t0, bpm, bars, only);
      // MIDI hits use the MIDI calibration; taps and keys the output device's.
      const adj = taps.map(h => ({ ...h, t: h.t - (h.midi ? offsetMs('midi') : offsetMs()) / 1000 }));
      const r = scoreHits(exp, adj, { level: level(), samePiece });
      $('#ds-hits').innerHTML = r.notes.map(n => `<span class="hit ${n.tight ? 'tight' : n.inTime ? 'in' : 'out'}" title="${esc(piece(n.piece).name)} ${n.error} ms">${n.error > 0 ? '+' : ''}${n.error}</span>`).join('') + (r.missed ? `<span class="hit miss">${r.missed} missed</span>` : '');
      const lean = r.lean === 'on time' ? 'on time on average' : `${Math.abs(r.bias)} ms ${r.lean} on average`;
      $('#ds-msg').innerHTML = `<b>${r.inTime} of ${r.total}</b> in time (±${r.window} ms), ${r.tight} tight (±${r.tightWindow}). You were ${lean}; consistency ±${r.spread} ms.${r.missed ? ` ${r.missed} missed${samePiece ? ' (or on another drum)' : ''}.` : ''}`;
      $('#ds-msg').className = 'msg ' + (r.hitRate >= 0.8 ? 'good' : '');
      if (r.played) addTimingSession({ drill, bpm, n: r.played, bias: r.bias, spread: r.spread, hitRate: Math.round(r.hitRate * 100) / 100, window: r.window, bars, steps: Object.fromEntries(r.notes.map(n => [n.step, n.error])) });
      onDone?.(r);
    }, Math.max(0, (t0 + bars * groove.beats * spb - now() + 0.4) * 1000)));
  };
  return () => { stop(); calStop?.(); };
}
export const _m = metronome;
