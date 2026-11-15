// Rhythm drill: tap along with a pattern over the click; the timing engine
// (js/timing.js) shows early/late per note, the average lean and the spread.
// Calibrate once per speaker/headphones; it's optional and never blocks.
// #practice?tool=rhythm&pattern=<id>   #practice?tool=rhythm&calibrate=1
import { PATTERNS, findPattern, rhythmSVG } from '../rhythm.js';
import { score, patternBeats, WINDOWS, WINDOW_NAMES } from '../timing.js';
import { tapPad, scheduleClicks, offsetMs, getWindow, windowSegHTML, wireWindowSeg, calibrationLine, runCalibration, currentCalibration } from '../timing-ui.js';
import { context, now, pluckAt } from '../audio.js';
import { recordAnswer, addLog, getPracticePrefs, updatePracticePrefs } from '../storage.js';
import { esc } from '../ui.js';

const BARS = 2;

function drill(el, params) {
  const prefs = { pattern: 'quarters', bpm: 70, hear: true, ...(getPracticePrefs().rhythm || {}) };
  if (params.get('pattern') && findPattern(params.get('pattern'))) prefs.pattern = params.get('pattern');
  let pattern = findPattern(prefs.pattern) || PATTERNS[0], bpm = prefs.bpm, hear = prefs.hear;
  let detach = null, timer = null, running = false, stopCal = null;
  const save = () => updatePracticePrefs({ rhythm: { pattern: pattern.id, bpm, hear } });

  el.innerHTML = `
    <div class="rhythm">
      <p class="calib-line" id="rh-cal"></p>
      <div class="row"><button id="rh-calibrate">${currentCalibration() ? 'Calibrate again' : 'Calibrate (30 seconds)'}</button></div>
      <div id="rh-calbox"></div>
      <div class="field"><span class="lbl">Pattern</span>
        <div class="chips" id="rh-patterns">${PATTERNS.map(p => `<button data-p="${p.id}" aria-pressed="${p.id === pattern.id}">${esc(p.name)} <small>L${p.level}</small></button>`).join('')}</div></div>
      <div class="rh-line" id="rh-line"></div>
      <div class="row">
        <label class="grow">Tempo <b id="rh-bpm-out">${bpm}</b> bpm<input type="range" id="rh-bpm" min="40" max="160" value="${bpm}"></label>
        <label class="check"><input type="checkbox" id="rh-hear"${hear ? ' checked' : ''}> Hear the rhythm</label>
      </div>
      <div class="field"><span class="lbl">How strict</span>${windowSegHTML()}</div>
      <button class="primary big" id="rh-go">▶ Start: 1 bar count-in, then ${BARS} bars</button>
      <button class="tap-pad" id="rh-pad" aria-label="Tap here in rhythm">Tap here (or press Space)</button>
      <div class="rh-result" id="rh-result" aria-live="polite"></div>
    </div>`;
  const $ = s => el.querySelector(s);
  const paintLine = (results = null) => { $('#rh-line').innerHTML = rhythmSVG(pattern, { bars: BARS, results, pxPerBeat: 56 }); };
  const paintCal = () => { $('#rh-cal').innerHTML = calibrationLine(); };
  paintLine(); paintCal();

  $('#rh-patterns').onclick = e => {
    const b = e.target.closest('button'); if (!b || running) return;
    pattern = findPattern(b.dataset.p);
    $('#rh-patterns').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    save(); paintLine(); $('#rh-result').innerHTML = '';
  };
  $('#rh-bpm').oninput = e => { bpm = +e.target.value; $('#rh-bpm-out').textContent = bpm; save(); };
  $('#rh-hear').onchange = e => { hear = e.target.checked; save(); };
  wireWindowSeg(el, () => { if (last) show(last); });
  $('#rh-calibrate').onclick = () => {
    stopCal?.();
    stopCal = runCalibration($('#rh-calbox'), { onDone: cal => { paintCal(); $('#rh-calibrate').textContent = 'Calibrate again'; if (!cal) $('#rh-calbox').innerHTML = ''; } });
  };
  if (params.get('calibrate')) $('#rh-calibrate').click();

  let last = null;
  function show({ beats, taps }) {
    const r = score(beats, taps, { offsetMs: offsetMs(), window: getWindow() });
    paintLine(r.notes.length || r.missed ? fill(beats, r) : null);
    const leanText = r.played < 2 ? '' : r.lean === 'on time' ? 'right on the beat on average' : `on average <b>${Math.abs(r.bias)} ms ${r.lean}</b>`;
    $('#rh-result').innerHTML = `
      <div class="rh-score"><b>${r.hits}</b><span> of ${r.beats} in time</span> <small class="muted">(${WINDOW_NAMES[getWindow()]} ±${WINDOWS[getWindow()]} ms)</small></div>
      <p>${r.played ? `You were ${leanText}${r.played > 1 ? `, with a spread of <b>±${r.spread} ms</b>` : ''}.` : 'No taps reached the pad. Tap on the big pad (or press Space) along with the rhythm.'}
        ${r.missed ? ` ${r.missed} note${r.missed > 1 ? 's' : ''} missed.` : ''}${r.extra ? ` ${r.extra} extra tap${r.extra > 1 ? 's' : ''}.` : ''}</p>
      <p class="muted small">${tip(r)}${currentCalibration() ? '' : ' Calibrating makes these numbers more accurate.'}</p>`;
    return r;
  }
  // Results lined up with every note of the pattern (missed notes stay blank).
  function fill(beats, r) {
    const byBeat = new Map(r.notes.map(n => [n.beat, n]));
    return beats.map(b => byBeat.get(b) || null);
  }
  const tip = r => r.played < 2 ? '' : r.spread > 35 ? 'Aim for steadiness first: the spread matters more than the lean.' :
    r.lean === 'early' ? 'You are rushing a little. Let the click come to you.' : r.lean === 'late' ? 'You are a little behind. Lean into each beat.' : 'Nice and steady.';

  $('#rh-go').onclick = () => {
    if (running || !context()) return;
    running = true; $('#rh-go').disabled = true; $('#rh-result').innerHTML = ''; paintLine();
    const per = pattern.beats, spb = 60 / bpm;
    const clicks = scheduleClicks(per * (BARS + 1), bpm, { accentEvery: per, lead: 0.5 });
    const t0 = clicks[per], beats = patternBeats(pattern.notes, bpm, t0, BARS, per);
    if (hear) beats.forEach(t => pluckAt(76, t, 0.5));
    const taps = [];
    detach = tapPad($('#rh-pad'), t => taps.push(t));
    $('#rh-result').innerHTML = '<p class="muted">Count-in… then tap along.</p>';
    timer = setTimeout(() => {
      detach(); detach = null; running = false; $('#rh-go').disabled = false;
      last = { beats, taps: taps.filter(t => t > t0 - 0.2) };
      const r = show(last);
      const ok = r.hitRate >= 0.75;
      recordAnswer(`rhythm:${pattern.id}`, ok, 0);
      addLog({ minutes: 1, activity: 'Drill: Rhythm', detail: `${r.hits}/${r.beats} · ${pattern.name}`, drill: 'rhythm', score: r.hits, total: r.beats });
    }, (t0 + per * BARS * spb - now() + 0.5) * 1000);
  };
  return () => { detach?.(); clearTimeout(timer); stopCal?.(); };
}

export default {
  id: 'rhythm',
  title: 'Rhythm',
  blurb: 'Tap along; see early, late and steady',
  icon: '<svg viewBox="0 0 24 24"><path d="M7 18V6l10-2v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><ellipse cx="5" cy="18" rx="2.6" ry="2" fill="currentColor"/><ellipse cx="15" cy="16" rx="2.6" ry="2" fill="currentColor"/></svg>',
  mount: drill
};
