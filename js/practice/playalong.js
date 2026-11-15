// Play-along: a tab library and a tab player. The tab scrolls under a fixed
// playhead, the current note lights up on the tab and on a small fretboard.
// All sound is scheduled ahead on the Web Audio clock (like the metronome).
import { PLAYALONG, findTab, barBeats, timeline } from '../playalong/index.js';
import { Fretboard } from '../fretboard.js';
import { pluckAt, click, context, now } from '../audio.js';
import { TUNINGS, midiAt, preferredName, pcOf } from '../theory.js';
import { getSettings, getPracticePrefs, updatePracticePrefs, addLog, getTempo, recordClean, startBelow } from '../storage.js';
import { SpeedTrainer, trainerSetupHTML, trainerStatusHTML } from '../speed.js';
import { volumeHTML, esc } from '../ui.js';

const tuning = TUNINGS.standard;
const sIndex = string => tuning.strings.findIndex(x => x.num === string); // guitar string number -> board index
const BW = 48, LEFT = 44, TOP = 26, GAP = 18; // tab drawing: px per beat, margins, line gap
const AHEAD = 0.15, LOOKAHEAD_MS = 25;

function library(el) {
  const filter = getPracticePrefs().tabFilter || 'all';
  const rows = PLAYALONG.filter(t => filter === 'all' || t.difficulty === filter);
  const tempos = getPracticePrefs().tabTempo;
  el.innerHTML = `
    <div class="seg" id="pa-filter">${[['all', 'All'], ['easy', 'Easy'], ['medium', 'Medium']].map(([v, l]) =>
      `<button data-v="${v}" aria-pressed="${v === filter}">${l}</button>`).join('')}</div>
    <ul class="tab-list">${rows.map(t => `
      <li><a href="#practice?tool=playalong&tab=${t.id}">
        <span><b>${esc(t.title)}</b><small>${esc(t.source)} · ${t.time.join('/')}</small></span>
        <span class="meta"><span class="pill ${t.difficulty}">${t.difficulty}</span><small>${t.bpm} bpm${tempos[t.id] && tempos[t.id] !== 100 ? ` · ${tempos[t.id]}%` : ''}</small></span>
      </a></li>`).join('')}</ul>`;
  el.querySelector('#pa-filter').onclick = e => {
    const b = e.target.closest('button');
    if (b) { updatePracticePrefs({ tabFilter: b.dataset.v }); library(el); }
  };
}

function player(el, tab) {
  const tl = timeline(tab), notes = tl.filter(e => !e.rest), bb = barBeats(tab);
  const total = tl.length ? tl[tl.length - 1].start + tl[tl.length - 1].beats : 0, bars = Math.round(total / bb);
  const prefs = getPracticePrefs(), toggles = { countIn: true, hear: true, click: true, ...(prefs.tabToggles || {}) };
  let pct = prefs.tabTempo[tab.id] || 100;
  // Restart a little below the best clean tempo (stored in bpm).
  const exId = `tab:${tab.id}`, best = getTempo(exId);
  const snap = v => Math.min(150, Math.max(50, Math.round(v / 5) * 5));
  if (best) pct = snap(startBelow(best.best) / tab.bpm * 100);
  const maxFret = Math.max(5, ...notes.map(n => n.fret)) + 1;

  // Ticks: every note start and every beat (for the click), in order.
  const tickMap = new Map();
  // Keyed to 1e-6 beat so triplet starts (2/3, 1/3) merge with beats, but the exact time is kept.
  const tickAt = b => { const k = Math.round(b * 1e6); if (!tickMap.has(k)) tickMap.set(k, { beat: b, notes: [], click: null }); return tickMap.get(k); };
  notes.forEach(n => tickAt(n.start).notes.push(n));
  for (let b = 0; b < total - 1e-6; b++) tickAt(b).click = b % bb === 0 ? 2 : 1;
  const ticks = [...tickMap.values()].sort((a, b) => a.beat - b.beat);

  const W = LEFT + total * BW + 60, H = TOP + 5 * GAP + 26, lineY = string => TOP + (string - 1) * GAP;
  let svg = '';
  for (let s = 1; s <= 6; s++) svg += `<line class="pa-line" x1="0" x2="${W}" y1="${lineY(s)}" y2="${lineY(s)}"/>`;
  for (let b = 0; b <= bars; b++) {
    const x = LEFT + b * bb * BW - 6;
    svg += `<line class="pa-bar" x1="${x}" x2="${x}" y1="${lineY(1)}" y2="${lineY(6)}"/>`;
    if (b < bars) svg += `<text class="pa-barno" x="${x + 6}" y="${TOP - 10}">${b + 1}</text>` +
      `<rect class="pa-hit" data-bar="${b}" x="${x}" y="0" width="${bb * BW}" height="${H}"/>`;
  }
  svg += '<rect class="pa-loop" id="pa-loop-rect" x="0" y="2" width="0" height="' + (H - 4) + '" hidden/>';
  notes.forEach(n => {
    const x = LEFT + n.start * BW, y = lineY(n.string);
    svg += `<g class="pa-note" data-i="${n.i}"><rect x="${x - 3}" y="${y - 9}" width="${String(n.fret).length * 9 + 6}" height="18" rx="4"/><text x="${x}" y="${y + 5}">${n.fret}</text></g>`;
  });

  el.innerHTML = `
    <div class="pa">
      <div class="pa-head"><b>${esc(tab.title)}</b><span class="pill ${tab.difficulty}">${tab.difficulty}</span><small class="muted">${esc(tab.source)} · ${tab.time.join('/')}</small></div>
      <div class="tabview" id="pa-view">
        <svg id="pa-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tab for ${esc(tab.title)}">${svg}</svg>
        <div class="pa-strings" aria-hidden="true">${[1, 2, 3, 4, 5, 6].map(s => `<span style="top:${lineY(s) - 8}px">${tuning.strings[sIndex(s)].name}</span>`).join('')}</div>
        <div class="playhead" aria-hidden="true"></div>
      </div>
      <p class="pa-status" id="pa-status" aria-live="polite"></p>
      <div id="pa-board"></div>
      <div class="pa-controls">
        <button class="primary big" id="pa-play">▶ Play</button>
        <label class="grow tempo-l"><span>Tempo <b id="pa-pct"></b> · <span id="pa-bpm"></span> bpm</span>
          <input type="range" id="pa-tempo" min="50" max="150" step="5" value="${pct}"></label>
      </div>
      <div class="row toggles">
        <button id="pa-clean" title="Played that cleanly? Save this tempo.">✓ Clean run</button>
        <button id="pa-trainer" aria-expanded="false">Speed trainer</button>
      </div>
      <div class="trainer" id="pa-tr" hidden></div>
      <div class="row toggles">
        <button id="pa-loop">Loop a section</button>
        <label class="check"><input type="checkbox" id="pa-countin"> Count-in</label>
        <label class="check"><input type="checkbox" id="pa-hear"> Hear the tab</label>
        <label class="check"><input type="checkbox" id="pa-click"> Click</label>
      </div>
      <div class="row vols">${volumeHTML('tabVol', 'Tab volume')}${volumeHTML('tabClickVol', 'Click volume')}</div>
    </div>`;
  const $ = s => el.querySelector(s);
  const fb = new Fretboard($('#pa-board'), { view: [0, Math.min(15, maxFret)], labels: 'notes', playOnTap: true, ariaLabel: 'Current note on the fretboard' });
  ['countIn', 'hear', 'click'].forEach(k => {
    const box = $(`#pa-${k.toLowerCase()}`);
    box.checked = toggles[k];
    box.onchange = () => { toggles[k] = box.checked; updatePracticePrefs({ tabToggles: { ...toggles } }); };
  });

  /* ---------- transport ---------- */
  let playing = false, startPos = 0, segs = [], k = 0, segBeat = 0, segTime = 0, endAt = Infinity, schedTimer = null, raf = 0;
  let loop = null, loopMode = 'off', loopA = null, playedSec = 0, topPct = 0, playFrom = 0, lastLit = -1, logged = false;
  const beatSec = () => 60 / (tab.bpm * pct / 100);
  const region = () => (loop ? loop : [0, total]);
  const firstTick = beat => { const i = ticks.findIndex(t => t.beat >= beat - 1e-6); return i < 0 ? ticks.length : i; };
  const vol = key => getSettings()[key];

  function schedule() {
    const ahead = now() + (document.hidden ? 1.2 : AHEAD), [r0, r1] = region(), bs = beatSec();
    for (;;) {
      if (k >= ticks.length || ticks[k].beat >= r1 - 1e-6) {
        const end = segTime + (r1 - segBeat) * bs;
        if (!loop) { endAt = end + 0.3; break; }
        if (end > ahead) break;
        segBeat = r0; segTime = end; segs.push({ t: end, beat: r0 }); k = firstTick(r0);
        continue;
      }
      const tk = ticks[k], tt = segTime + (tk.beat - segBeat) * bs;
      if (tt > ahead) break;
      if (toggles.hear) tk.notes.forEach(n => pluckAt(midiAt(sIndex(n.string), n.fret), tt, vol('tabVol')));
      if (toggles.click && tk.click) click(tt, tk.click, vol('tabClickVol'));
      k++;
    }
    schedTimer = setTimeout(schedule, LOOKAHEAD_MS);
  }

  const posAt = t => {
    if (!playing) return startPos;
    let seg = segs[0];
    for (const s of segs) if (s.t <= t) seg = s;
    return t < segs[0].t ? segs[0].beat : seg.beat + (t - seg.t) / beatSec();
  };

  function play(countIn = toggles.countIn) {
    if (!context() || playing) return;
    const [r0, r1] = region();
    if (startPos < r0 - 1e-6 || startPos >= r1 - 1e-6) startPos = r0;
    const t = now() + 0.1, bs = beatSec();
    let t0 = t;
    if (countIn) { for (let b = 0; b < bb; b++) click(t + b * bs, b === 0 ? 2 : 1, Math.max(vol('tabClickVol'), 0.4)); t0 = t + bb * bs; }
    segBeat = startPos; segTime = t0; segs = [{ t: t0, beat: startPos }]; k = firstTick(startPos); endAt = Infinity;
    playing = true; playFrom = t0; topPct = Math.max(topPct, pct);
    schedule();
    paint();
    raf = requestAnimationFrame(frame);
  }

  function pause(resetTo = null) {
    if (!playing) return;
    const p = posAt(now());
    clearTimeout(schedTimer);
    playedSec += Math.max(0, now() - playFrom);
    playing = false;
    cancelAnimationFrame(raf);
    // Resume from the start of the note that was sounding.
    const cur = tl.filter(e => e.start <= p + 1e-6).pop();
    startPos = resetTo != null ? resetTo : cur ? cur.start : 0;
    paint();
  }

  function frame() {
    if (!playing) return;
    const t = now();
    if (trainer) {
      const passes = segs.filter(sg => sg.t <= t).length;
      if (passes > seenPasses) { const first = seenPasses === 0; seenPasses = passes; if (!first) onPass(); if (!playing) return; }
    }
    if (t >= endAt) { pause(0); $('#pa-status').textContent = 'Done! Play again, or loop a tricky bar.'; draw(0); return; }
    draw(posAt(t), t < segs[0].t);
    raf = requestAnimationFrame(frame);
  }

  function draw(p, countingIn = false) {
    const view = $('#pa-view');
    $('#pa-svg').style.transform = `translateX(${Math.round(view.clientWidth * 0.3 - (LEFT + p * BW))}px)`;
    const cur = notes.find(n => p >= n.start - 1e-6 && p < n.start + n.beats - 1e-6);
    const i = cur ? cur.i : -1;
    if (i !== lastLit) {
      el.querySelector('.pa-note.now')?.classList.remove('now');
      if (cur) el.querySelector(`.pa-note[data-i="${i}"]`)?.classList.add('now');
      fb.highlight(cur ? [{ s: sIndex(cur.string), f: cur.fret, role: 'third', label: preferredName(pcOf(midiAt(sIndex(cur.string), cur.fret))) }] : []);
      lastLit = i;
    }
    if (playing) $('#pa-status').textContent = countingIn ? 'Count-in…' : `Bar ${Math.min(bars, Math.floor(p / bb + 1e-6) + 1)} of ${bars}${loop ? ' · looping' : ''}`;
  }

  function paint() {
    $('#pa-play').textContent = playing ? '❚❚ Pause' : '▶ Play';
    $('#pa-pct').textContent = pct + '%';
    $('#pa-bpm').textContent = Math.round(tab.bpm * pct / 100);
    const lr = $('#pa-loop-rect');
    if (loop) { lr.removeAttribute('hidden'); lr.setAttribute('x', LEFT + loop[0] * BW - 6); lr.setAttribute('width', (loop[1] - loop[0]) * BW); }
    else lr.setAttribute('hidden', '');
    $('#pa-loop').textContent = loopMode === 'pickA' ? 'Tap the start bar…' : loopMode === 'pickB' ? 'Now tap the end bar…' :
      loop ? `Looping bars ${loop[0] / bb + 1}–${loop[1] / bb} · Clear` : 'Loop a section';
    $('#pa-loop').setAttribute('aria-pressed', !!loop || loopMode !== 'off');
    if (!playing) { draw(startPos); if (!/^(Done|Saved|Starting|Goal)/.test($('#pa-status').textContent)) $('#pa-status').textContent = loopMode !== 'off' ? 'Tap a bar on the tab.' : 'Tap a bar to start there.'; }
  }

  /* ---------- clean runs and the speed trainer ---------- */
  let trainer = null, seenPasses = 0, missed = false;
  const curBpm = () => Math.round(tab.bpm * pct / 100);
  const bestNote = () => { const b = getTempo(exId); return b ? `best clean ${b.best} bpm` : ''; };
  const setPct = v => { pct = v; $('#pa-tempo').value = pct; updatePracticePrefs({ tabTempo: { ...getPracticePrefs().tabTempo, [tab.id]: pct } }); };
  $('#pa-clean').onclick = () => {
    const b = recordClean(exId, curBpm(), tab.title);
    $('#pa-status').textContent = `Saved: ${curBpm()} bpm clean. Your best is ${b.best} bpm.`;
  };
  function trainerPanel() {
    const tr = $('#pa-tr');
    if (!trainer) {
      tr.innerHTML = trainerSetupHTML({ unit: '%', start: Math.min(pct, 100), end: 100, steps: [5, 10], step: 5, min: 50, max: 150 });
      tr.querySelector('[data-tr="go"]').onclick = () => {
        const v = k => +tr.querySelector(`[data-tr="${k}"]`).value;
        trainer = new SpeedTrainer({ start: v('start'), end: v('end'), step: v('step') });
        if (!loop) loop = [0, total];
        setPct(trainer.tempo);
        if (playing) pause(loop[0]);
        startPos = loop[0]; seenPasses = 0; missed = false;
        play(true);
        trainerPanel();
      };
      return;
    }
    tr.innerHTML = `<div class="trainer-run"><div class="tr-status">${trainerStatusHTML(trainer, '%', bestNote())}</div>
      <button class="big tr-missed" id="pa-missed" aria-pressed="${missed}">✗ Missed it</button>
      <button class="quiet-inline" id="pa-tr-stop">Stop trainer</button></div>`;
    tr.querySelector('#pa-missed').onclick = () => { missed = true; tr.querySelector('#pa-missed').setAttribute('aria-pressed', 'true'); };
    tr.querySelector('#pa-tr-stop').onclick = () => { trainer = null; trainerPanel(); };
  }
  // One time through the loop: clean unless "Missed it" was tapped.
  function onPass() {
    const clean = !missed, bpm = curBpm();
    missed = false;
    if (clean) recordClean(exId, bpm, tab.title);
    const r = trainer.pass(clean);
    if (r.change === 'goal') {
      $('#pa-status').textContent = `Goal reached: ${r.tempo}% clean, 3 times in a row.`;
      trainer = null;
    } else if (r.tempo !== pct) {
      setPct(r.tempo);
      pause(loop[0]);
      seenPasses = 0;
      play(true);  // a count-in before each new tempo
    }
    trainerPanel();
  }
  $('#pa-trainer').onclick = () => {
    const tr = $('#pa-tr'), open = tr.hidden;
    tr.hidden = !open;
    $('#pa-trainer').setAttribute('aria-expanded', open);
    if (open) trainerPanel();
  };

  $('#pa-play').onclick = () => (playing ? pause() : play());
  $('#pa-tempo').oninput = e => {
    pct = +e.target.value;
    if (trainer) { trainer = null; trainerPanel(); }
    updatePracticePrefs({ tabTempo: { ...getPracticePrefs().tabTempo, [tab.id]: pct } });
    if (playing) { pause(); play(false); } else paint();
  };
  $('#pa-loop').onclick = () => {
    if (loop || loopMode !== 'off') { loop = null; loopMode = 'off'; if (trainer) { trainer = null; trainerPanel(); } }
    else loopMode = 'pickA';
    paint();
  };
  $('#pa-svg').onclick = e => {
    const hit = e.target.closest('.pa-hit');
    if (!hit) return;
    const bar = +hit.dataset.bar;
    if (loopMode === 'pickA') { loopA = bar; loopMode = 'pickB'; paint(); return; }
    if (loopMode === 'pickB') {
      const a = Math.min(loopA, bar), b = Math.max(loopA, bar);
      loop = [a * bb, (b + 1) * bb]; loopMode = 'off';
      if (playing) { pause(loop[0]); play(); } else { startPos = loop[0]; paint(); }
      return;
    }
    if (playing) { pause(bar * bb); play(false); } else { startPos = bar * bb; $('#pa-status').textContent = ''; paint(); }
  };
  if (best) $('#pa-status').textContent = `Starting at ${pct}%, a little below your best clean tempo (${best.best} bpm).`;
  const onResize = () => draw(posAt(now()));
  window.addEventListener('resize', onResize);
  paint();

  return () => {
    pause();
    window.removeEventListener('resize', onResize);
    if (!logged && playedSec >= 20) {
      logged = true;
      addLog({ minutes: Math.max(1, Math.round(playedSec / 60)), activity: `Play-along: ${tab.title}`, detail: `${pct}% tempo${loop ? `, looped bars ${loop[0] / bb + 1}–${loop[1] / bb}` : ''}`,
        tab: tab.id, pct: topPct, bpm: Math.round(tab.bpm * topPct / 100) });
    }
  };
}

export default {
  id: 'playalong',
  title: 'Play-along',
  blurb: 'Tabs that scroll in time',
  icon: '<svg viewBox="0 0 24 24"><path d="M3 6h18M3 10h18M3 14h18M3 18h18" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="10" r="2.2" fill="currentColor"/><circle cx="15" cy="14" r="2.2" fill="currentColor"/></svg>',

  mount(el, params) {
    const tab = findTab(params.get('tab'));
    if (!tab) { library(el); return; }
    const head = el.closest('.tool-body')?.previousElementSibling;
    head?.querySelector('a.back')?.setAttribute('href', '#practice?tool=playalong');
    if (head?.querySelector('a.back')) head.querySelector('a.back').textContent = '← Tabs';
    return player(el, tab);
  }
};
