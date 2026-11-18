// Piano play-along (docs/research-piano.md D4, D5): one data format (js/piano/pieces.js), three
// views — a horizontal piano roll with a "falling notes onto keys" option, a grand staff and a
// chord chart — over a keyboard that lights each note. Wait mode pauses for the right key
// ("Keep going" doesn't). Practise one hand while the app plays the other (right hand first,
// then left, then both). Tap a bar to loop it. The tempo trainer starts at 60%, adds 5% after
// 3 clean runs and drops 10% after a miss, and the log records goals ("3 clean runs at 80 bpm").
import { PIECES, findPiece, pieceEvents, barsOf } from './pieces.js';
import { Keyboard, nameOct, isBlack, landscapePhone, onLandscapeChange, colorPref, setColorPref, colorToggleHTML } from './keyboard.js';
import { TempoTrainer } from './tempo.js';
import { LH_PATTERNS, lhBar } from './voicing.js';
import { metronome, pluckAt, now, click } from '../audio.js';
import { parseChordName } from '../progressions.js';
import { pcOf, preferredName, lookup, parseFormula } from '../theory.js';
import { roleOf } from '../fretboard.js';
import { renderAbc, abcPitch, abcLen } from '../notation.js';
import { getPracticePrefs, updatePracticePrefs, addLog, recordClean, getTempo } from '../storage.js';
import { micOn, listenNotes } from '../mic.js';
import { esc } from '../ui.js';

const LEVEL_NAMES = ['', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'];
const lhFn = (pat, c, beats) => { const x = parseChordName(c); return lhBar(pat, x.root, x.chord, beats); };

function library(el) {
  el.innerHTML = `<p class="muted">Public-domain pieces arranged for this app, and original etudes. Play the right hand first, then the left, then both.</p>
    <ul class="tab-list">${PIECES.map(p => `<li><a href="#practice?tool=playalong&tab=${p.id}">
      <span><b>${esc(p.title)}</b><small>${esc(p.source)} · ${p.time.join('/')} · ${LEVEL_NAMES[p.level] || ''}</small></span>
      <span class="meta"><span class="pill ${p.difficulty}">${p.difficulty}</span><small>${p.bpm} bpm</small></span></a></li>`).join('')}</ul>`;
}

// The grand staff as ABC: right hand in treble, left hand in bass, chord symbols above.
export function grandStaffAbc(piece, events) {
  const bar = piece.time[0] * 4 / piece.time[1], total = barsOf(piece) * bar;
  const voice = hand => {
    const ev = events.filter(e => e.hand === hand);
    let t = 0, out = '', lastBar = 0;
    const rest = d => { while (d > 1e-6) { const inBar = bar - (t % bar), r = Math.min(d, inBar); out += 'z' + abcLen(r) + ' '; t += r; d -= r; if (Math.abs(t % bar) < 1e-6) out += '| '; } };
    for (const e of ev) {
      if (e.start > t + 1e-6) rest(e.start - t);
      if (e.start < t - 1e-6) continue; // overlapping notes in one hand: keep the first
      const chord = hand === 'R' && Math.abs(e.start % bar) < 1e-6 ? `"${piece.chords[e.bar]}"` : '';
      const p = e.midis.length > 1 ? `[${e.midis.map(m => abcPitch(m, /b/.test(piece.key))).join('')}]` : abcPitch(e.midis[0], /b/.test(piece.key));
      out += chord + p + abcLen(e.beats) + ' ';
      t += e.beats;
      if (Math.abs(t % bar) < 1e-6) out += '| ';
      lastBar = e.bar;
    }
    if (t < total - 1e-6) rest(total - t);
    return out.trim().replace(/\|$/, '|]') + (void lastBar || '');
  };
  return `X:1\nM:${piece.time.join('/')}\nL:1/8\n%%staves {1 2}\nK:${piece.key.replace(/m$/, 'm')}\nV:1 clef=treble\n${voice('R')}\nV:2 clef=bass\n${voice('L')}\n`;
}

// "C major", "A minor", "G♭ major" for the corner label.
export const keyLabel = key => { const m = /^([A-G])(#|b)?(m?)$/.exec(key || 'C'); return m ? `${m[1]}${m[2] === 'b' ? '♭' : m[2] === '#' ? '♯' : ''} ${m[3] ? 'minor' : 'major'}` : key; };

function player(el, piece) {
  const prefs = { view: 'roll', hand: 'R', wait: false, countIn: true, guide: true, lhPattern: piece.lhPattern || null, ...(getPracticePrefs().pianoPiece || {}) };
  if (!piece.lhPattern) prefs.lhPattern = null;
  const save = () => updatePracticePrefs({ pianoPiece: { view: prefs.view, hand: prefs.hand, wait: prefs.wait, countIn: prefs.countIn, guide: prefs.guide } });
  const bar = piece.time[0] * 4 / piece.time[1], bars = barsOf(piece), total = bars * bar;
  let events = pieceEvents({ ...piece, lhPattern: prefs.lhPattern }, lhFn);
  const allMidis = () => events.flatMap(e => e.midis), lo = () => Math.min(...allMidis()) - 2, hi = () => Math.max(...allMidis()) + 2;
  const twoHands = () => events.some(e => e.hand === 'L') && events.some(e => e.hand === 'R');
  const exId = `piece:${piece.id}`, best = getTempo(exId);
  const trainer = new TempoTrainer({ start: best ? Math.min(100, Math.max(60, Math.round(best.best / piece.bpm * 100) - 5)) : 60 });
  let loop = null, running = false, missed = false, timers = [], startedAt = 0, songPos = 0, raf = null, t0 = 0, waitState = null, color = colorPref('playalong'), land = landscapePhone(), curBar = -1;
  const seg = (id, items, val) => `<div class="seg" id="${id}">${items.map(([v, n]) => `<button data-v="${v}" aria-pressed="${v === val}">${n}</button>`).join('')}</div>`;
  // Phones on their side get the falling-notes layout: sheet music, falling notes, all 88 keys
  // (pp-top, pp-lstaff, pp-lfall, pp-kb). The rest of the controls sit behind Menu.
  el.innerHTML = `<div class="pa piano-pa">
    <div class="pp-top"><button class="pp-menu" aria-expanded="false">☰ Menu</button><b class="pp-title">${esc(piece.title)}</b>
      <span class="kb-corner">${keyLabel(piece.key)}</span><span class="pp-color-slot"></span><button class="primary pp-go">▶ Play</button></div>
    <div class="pp-lstaff" id="pp-lstaff"><div class="pp-band" id="pp-band"></div><div class="pp-lstaff-in" id="pp-lstaff-in"></div></div>
    <div class="pp-lfall" id="pp-lfall" aria-label="Falling notes: each bar falls onto its key; its length is the note's length"><svg id="pp-lfallsvg"></svg></div>
    <div class="pa-head"><b>${esc(piece.title)}</b><span class="pill ${piece.difficulty}">${piece.difficulty}</span><small class="muted">${esc(piece.source)} · ${piece.time.join('/')} · key ${esc(piece.key)}</small></div>
    <p class="rotate-hint" id="pp-rotate" hidden><span aria-hidden="true">↻</span> Turn your phone sideways for the full keyboard <button class="link" id="pp-rotate-x" aria-label="Hide this tip">✕</button></p>
    ${seg('pp-view', [['roll', 'Piano roll'], ['falling', 'Falling notes'], ['staff', 'Staff'], ['chart', 'Chord chart']], prefs.view)}
    <div class="pp-stage" id="pp-stage"></div>
    <div id="pp-kb"></div>
    <p class="now-chord" id="pp-now" aria-live="polite"></p>
    <div class="field"><span class="lbl">Colors</span><span class="pp-color-slot"></span></div>
    <div class="field"><span class="lbl">You play</span>${seg('pp-hand', [['R', 'Right hand'], ['L', 'Left hand'], ['both', 'Both hands']], prefs.hand)}
      <small class="muted">The app plays the other hand. Start with the right hand, then the left, then both.</small></div>
    <div class="row toggles">
      <label class="check"><input type="checkbox" id="pp-wait"${prefs.wait ? ' checked' : ''}> Wait for me (pauses until you play the right key)</label>
      <label class="check"><input type="checkbox" id="pp-guide"${prefs.guide ? ' checked' : ''}> Play my hand softly as a guide</label>
      <label class="check"><input type="checkbox" id="pp-count"${prefs.countIn ? ' checked' : ''}> Count-in bar</label>
    </div>
    ${piece.lhPattern ? `<label>Left-hand pattern<select id="pp-lh">${Object.entries(LH_PATTERNS).map(([k, n]) => `<option value="${k}"${k === prefs.lhPattern ? ' selected' : ''}>${n}</option>`).join('')}</select></label>` : ''}
    <div class="tempo-trainer"><b id="pp-pct"></b> <span class="muted" id="pp-bpm"></span></div>
    <div class="row pp-play-row"><button class="primary big pp-go" id="pp-go">▶ Play</button><button id="pp-missed" hidden>✗ Missed it</button></div>
    <p class="muted small" id="pp-loopmsg">Tap a bar (in the roll or the chart) to loop it.</p>
    <p class="msg" id="pp-msg" aria-live="polite"></p></div>`;
  const $ = s => el.querySelector(s), root = $('.piano-pa');
  const kb = new Keyboard($('#pp-kb'), { view: [lo(), hi()], mode: 'tap', playOnTap: true, noGlideAnswers: true, noAutoZoom: true, full88: true, keyHeightFrac: 0.22, colorMode: color, onTap: t => onKey(t.midi) });
  const msg = (t, k = '') => { $('#pp-msg').textContent = t; $('#pp-msg').className = 'msg ' + k; };
  const bpm = () => trainer.bpm(piece.bpm);
  const paintTempo = () => { $('#pp-pct').textContent = `${trainer.pct}% speed`; $('#pp-bpm').textContent = `${bpm()} bpm · goal: 3 clean runs, then +5%`; };
  const paintGo = () => el.querySelectorAll('.pp-go').forEach(b => { b.textContent = running ? '■ Stop' : '▶ Play'; });
  const chordOfBar = b => parseChordName(piece.chords[b]);
  const roleIn = (m, b) => { const c = chordOfBar(b); return roleOf(pcOf(m - c.root)); };
  // The color class of a note: its hand, or its job in the bar's chord.
  const colorOf = (m, e) => (color === 'hand' ? (e.hand === 'L' ? 'lh' : 'rh') : roleIn(m, e.bar));
  const yours = e => prefs.hand === 'both' || e.hand === prefs.hand;

  // Color toggle (in the landscape top bar and in the controls).
  const paintColor = () => el.querySelectorAll('.pp-color-slot').forEach(s => { s.innerHTML = colorToggleHTML(color); });
  root.addEventListener('click', e => {
    const b = e.target.closest('.color-seg [data-color]'); if (!b) return;
    color = b.dataset.color; setColorPref('playalong', color); kb.setColorMode(color); paintColor(); drawView(); showAt(songPos);
  });

  /* ---------- landscape: the falling-notes layout ---------- */
  function setLand() {
    land = landscapePhone();
    root.classList.toggle('land', land);
    if (!land) root.classList.remove('menu-open');
    $('#pp-rotate').hidden = land || !twoHands() || !matchMedia('(pointer: coarse)').matches || sessionStorage.getItem('pp-rotate-x') === '1';
    if (land) drawStrip();
    kb.render();
  }
  $('#pp-rotate-x').onclick = () => { try { sessionStorage.setItem('pp-rotate-x', '1'); } catch { } $('#pp-rotate').hidden = true; };
  el.querySelector('.pp-menu').onclick = () => {
    const open = root.classList.toggle('menu-open');
    el.querySelector('.pp-menu').setAttribute('aria-expanded', open);
    el.querySelector('.pp-menu').textContent = open ? '✕ Close menu' : '☰ Menu';
    requestAnimationFrame(() => kb.render());
  };
  const unland = onLandscapeChange(setLand);
  // The grand staff on one line; the current bar is highlighted and kept in view.
  let stripFor = '';
  async function drawStrip() {
    const key = `${prefs.lhPattern}|${events.length}`;
    if (stripFor === key) return;
    stripFor = key; curBar = -1;
    const host = $('#pp-lstaff-in');
    // Close staves and no padding so the grand staff fits above the falling notes.
    const abc = grandStaffAbc(piece, events).replace('X:1\n', 'X:1\n%%sysstaffsep 4\n%%musicspace 0\n');
    await renderAbc(host, abc, { staffwidth: Math.max(600, bars * 170), scale: 0.56, abcjs: { add_classes: true, responsive: undefined, paddingtop: 0, paddingbottom: 0 } });
    paintStrip(Math.min(bars - 1, Math.floor(songPos / bar + 1e-6)), true);
  }
  function paintStrip(b, force) {
    if (!land || (b === curBar && !force)) return;
    curBar = b;
    const box = $('#pp-lstaff'), host = $('#pp-lstaff-in');
    host.querySelectorAll('.now').forEach(x => x.classList.remove('now'));
    const els = [...host.querySelectorAll(`.abcjs-m${b}`)];
    els.forEach(x => x.classList.add('now'));
    if (!els.length) return;
    const r0 = host.getBoundingClientRect(), rs = els.map(x => x.getBoundingClientRect()).filter(r => r.width);
    if (!rs.length) return;
    const left = Math.min(...rs.map(r => r.left)) - r0.left - 6, right = Math.max(...rs.map(r => r.right)) - r0.left + 6;
    const band = $('#pp-band');
    band.style.left = left + 'px'; band.style.width = (right - left) + 'px';
    box.scrollTo({ left: Math.max(0, left - box.clientWidth * 0.25), behavior: force ? 'auto' : 'smooth' });
  }
  // Drag the falling notes sideways to move along the keyboard when it's zoomed in.
  {
    let dragX = null;
    const fall = $('#pp-lfall');
    fall.addEventListener('pointerdown', e => { dragX = e.clientX; fall.setPointerCapture?.(e.pointerId); });
    fall.addEventListener('pointermove', e => { if (dragX == null) return; kb.panBy(dragX - e.clientX); dragX = e.clientX; });
    const end = () => { dragX = null; };
    fall.addEventListener('pointerup', end); fall.addEventListener('pointercancel', end);
  }

  /* ---------- portrait views ---------- */
  const BW = 46, SEMI = 9;
  function drawView() {
    const stage = $('#pp-stage');
    stage.className = 'pp-stage ' + prefs.view;
    const byHand = color === 'hand' ? ' byhand' : '';
    if (prefs.view === 'roll') {
      const L = lo(), H = (hi() - L + 1) * SEMI + 26, W = total * BW + 20;
      let s = '';
      for (let b = 0; b <= bars; b++) s += `<line class="pa-bar" x1="${b * bar * BW}" x2="${b * bar * BW}" y1="0" y2="${H}"/>` + (b < bars ? `<text class="pa-chord" x="${b * bar * BW + 4}" y="14">${esc(piece.chords[b])}</text><rect class="pa-hit" data-bar="${b}" x="${b * bar * BW}" y="0" width="${bar * BW}" height="${H}"/>` : '');
      const y = m => 22 + (hi() - m) * SEMI;
      events.forEach((e, i) => e.midis.forEach(m => {
        s += `<g class="pr-note ${e.hand === 'L' ? 'lh' : 'rh'} role-${roleIn(m, e.bar)}${byHand}" data-i="${i}"><rect x="${e.start * BW + 1}" y="${y(m) - SEMI / 2}" width="${Math.max(8, e.beats * BW - 2)}" height="${SEMI + 1}" rx="3"/>` +
          (e.beats * BW > 22 ? `<text x="${e.start * BW + 4}" y="${y(m) + 3}">${preferredName(m)}</text>` : '') + '</g>';
      }));
      s += `<rect class="pa-loop" id="pp-loop" x="0" y="0" width="0" height="${H}" hidden/><line class="pp-head" id="pp-head" x1="0" x2="0" y1="0" y2="${H}"/>`;
      stage.innerHTML = `<div class="pp-roll"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Piano roll: time runs left to right, higher notes are higher; right-hand notes are filled, left-hand notes outlined">${s}</svg></div>`;
    } else if (prefs.view === 'falling') {
      stage.innerHTML = '<div class="pp-fall" aria-label="Falling notes: each note falls onto its key"><svg id="pp-fallsvg"></svg></div>';
    } else if (prefs.view === 'staff') {
      stage.innerHTML = '<div class="staff-box" id="pp-staff"></div>';
      renderAbc($('#pp-staff'), grandStaffAbc(piece, events), { abcjs: { add_classes: true } });
    } else {
      stage.innerHTML = `<div class="pp-chart">${piece.chords.map((c, b) => `<button class="pp-bar" data-bar="${b}"><small>${b + 1}</small><b>${esc(c)}</b></button>`).join('')}</div>`;
    }
    paintLoop();
  }
  const paintLoop = () => {
    const r = $('#pp-loop');
    if (r) { r.toggleAttribute('hidden', !loop); if (loop) { r.setAttribute('x', loop[0] * bar * BW); r.setAttribute('width', (loop[1] - loop[0] + 1) * bar * BW); } }
    el.querySelectorAll('.pp-bar').forEach(b => b.classList.toggle('looped', !!loop && +b.dataset.bar >= loop[0] && +b.dataset.bar <= loop[1]));
    $('#pp-loopmsg').textContent = loop ? `Looping bar ${loop[0] + 1}. Tap it again to play the whole piece.` : 'Tap a bar (in the roll or the chart) to loop it.';
  };
  $('#pp-stage').addEventListener('click', e => {
    const h = e.target.closest('[data-bar]'); if (!h) return;
    const b = +h.dataset.bar; loop = loop && loop[0] === b ? null : [b, b]; paintLoop();
  });
  // Where the music is: light the current notes, move the playhead, highlight the bar.
  function showAt(pos) {
    songPos = pos;
    const b = Math.min(bars - 1, Math.floor(pos / bar + 1e-6)), sounding = events.filter(e => e.start <= pos + 1e-6 && e.start + e.beats > pos + 1e-6);
    if (!waitState) {
      kb.setDots(land ? [] : sounding.flatMap(e => e.midis.map(m => ({ s: 0, f: m, role: roleIn(m, e.bar), hand: e.hand, label: preferredName(m), ring: e.hand === 'L' }))), chordOfBar(b).root);
      kb.light(Object.fromEntries(sounding.flatMap(e => e.midis.map(m => [m, colorOf(m, e)]))));
    }
    const focus = sounding.find(e => yours(e)) || sounding[0];
    if (focus) kb.scrollTo(focus.midis[0], true);
    const head = $('#pp-head');
    if (head) { head.setAttribute('x1', pos * BW); head.setAttribute('x2', pos * BW); const box = $('.pp-roll'); if (box && (pos * BW < box.scrollLeft + 30 || pos * BW > box.scrollLeft + box.clientWidth - 60)) box.scrollLeft = pos * BW - box.clientWidth / 3; }
    el.querySelectorAll('.pp-bar').forEach(x => x.classList.toggle('now', +x.dataset.bar === b));
    el.querySelectorAll('#pp-staff .now').forEach(x => x.classList.remove('now'));
    el.querySelectorAll(`#pp-staff .abcjs-m${b}`).forEach(x => x.classList.add('now'));
    paintStrip(b);
    $('#pp-now').innerHTML = `Bar ${b + 1}: <b>${esc(piece.chords[b])}</b>`;
  }
  // Falling notes: rounded bars as long as the note, named inside, landing on their key as they sound.
  function fallFrame() {
    raf = requestAnimationFrame(fallFrame);
    const pos = songPos + (running && !waitState ? (now() - t0) * bpm() / 60 : 0);
    if (land) return fallLand(pos);
    const svg = $('#pp-fallsvg');
    if (!svg) return;
    const kbsvg = kb.svg, W = +kbsvg.getAttribute('width') || 400, H = 220, PX = 70;
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    let s = '';
    events.forEach(e => { const dy = (e.start - pos) * PX; if (dy > H || dy + e.beats * PX < -4) return;
      e.midis.forEach(m => { const x = kb._x(m); if (x == null) return; const w = isBlack(m) ? 16 : 26;
        s += `<rect class="pf-note ${e.hand === 'L' ? 'lh' : 'rh'} role-${roleIn(m, e.bar)}${color === 'hand' ? ' byhand' : ''}" x="${x + 2}" y="${H - dy - e.beats * PX}" width="${w}" height="${Math.max(6, e.beats * PX - 3)}" rx="4"/>`; }); });
    svg.innerHTML = s;
    $('.pp-fall').scrollLeft = kb.wrap.scrollLeft;
  }
  function fallLand(pos) {
    const box = $('#pp-lfall'), svg = $('#pp-lfallsvg');
    const W = box.clientWidth, H = box.clientHeight;
    if (!W || !H) return;
    const KW = kb._kw(), dx = kb.wrap.getBoundingClientRect().left - box.getBoundingClientRect().left - kb.wrap.scrollLeft;
    const PX = Math.max(36, H / (bar + 1)); // a bar and a beat of music on screen
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    let s = '';
    // octave guides at every C, and a line where each bar begins
    for (let m = 24; m <= 108; m += 12) { const x = kb._x(m); if (x != null) s += `<line class="lf-c" x1="${x + dx}" x2="${x + dx}" y1="0" y2="${H}"/>`; }
    for (let b = Math.ceil(pos / bar); b * bar < pos + H / PX; b++) { const y = H - (b * bar - pos) * PX; s += `<line class="lf-bar" x1="0" x2="${W}" y1="${y}" y2="${y}"/>`; }
    events.forEach(e => {
      const y1 = H - (e.start - pos) * PX, y0 = y1 - e.beats * PX;
      if (y0 > H || y1 < -4) return;
      e.midis.forEach(m => {
        const x = kb._x(m); if (x == null) return;
        const blk = isBlack(m), w = blk ? KW * 0.62 : KW - 2, left = x + dx + (blk ? 0 : 1);
        if (left + w < 0 || left > W) return;
        const h = Math.max(8, e.beats * PX - 3), fs = Math.max(6, Math.min(12, w * 0.62)), name = preferredName(m);
        s += `<g class="lf-note c-${colorOf(m, e)}${e.start <= pos + 1e-6 && e.start + e.beats > pos + 1e-6 ? ' on' : ''}"><rect x="${left}" y="${y1 - h}" width="${w}" height="${h}" rx="${Math.min(6, w / 2.5)}"/>` +
          (h > fs + 2 ? `<text x="${left + w / 2}" y="${y1 - 4}" text-anchor="middle" font-size="${fs}">${name}</text>` : '') + '</g>';
      });
    });
    svg.innerHTML = s;
  }

  /* ---------- playing in time ---------- */
  const at = (t, fn) => timers.push(setTimeout(fn, Math.max(0, (t - now()) * 1000)));
  function start() {
    stop(true);
    running = true; missed = false; startedAt = Date.now();
    paintGo(); $('#pp-missed').hidden = false; $('#pp-missed').setAttribute('aria-pressed', 'false');
    if (prefs.wait) return startWait();
    kb.zoomOut();
    const lead = prefs.countIn ? 1 : 0, saved = { bpm: metronome.bpm, beats: metronome.beatsPerBar, subdiv: metronome.subdiv, vol: metronome.volume };
    metronome.stop(); metronome.setBpm(bpm()); metronome.beatsPerBar = piece.time[0]; metronome.subdiv = 1; metronome.setVolume(0);
    const span = () => (loop ? loop[1] - loop[0] + 1 : bars);
    const off = metronome.schedule((beat, t, gbar) => {
      const spb = 60 / metronome.bpm, rel = gbar - lead;
      click(t, beat === 0 ? 2 : 1, rel < 0 ? 0.8 : 0.35);
      // During the count-in the falling notes are already moving: the music starts at the next bar.
      if (rel < 0) { if (beat === 0) at(t, () => { songPos = loop ? loop[0] * bar : 0; t0 = t + piece.time[0] * spb; }); return; }
      if (beat === 0 && rel > 0 && rel % span() === 0) onPass();
      const songBar = (loop ? loop[0] : 0) + (rel % span()), pos = songBar * bar + beat;
      at(t, () => { t0 = t; showAt(pos); });
      events.filter(e => e.start >= pos - 1e-6 && e.start < pos + 1 - 1e-6).forEach(e => {
        const nt = t + (e.start - pos) * spb, mine = yours(e);
        if (!mine || prefs.guide) e.midis.forEach(m => pluckAt(m, nt, mine ? 0.25 : 0.8));
        // light each note's key as it sounds, in its color
        at(nt, () => { if (running) kb.light({ ...Object.fromEntries(kb.litCls), ...Object.fromEntries(e.midis.map(m => [m, colorOf(m, e)])) }); });
      });
    });
    metronome.start();
    stopPlay = () => { off(); metronome.stop(); metronome.setBpm(saved.bpm); metronome.beatsPerBar = saved.beats; metronome.subdiv = saved.subdiv; metronome.setVolume(saved.vol); };
  }
  let stopPlay = () => {};
  function onPass() {
    const r = trainer.run(!missed, piece.bpm);
    missed = false; $('#pp-missed').setAttribute('aria-pressed', 'false');
    if (r.goal) { recordClean(exId, Math.round(piece.bpm * (r.change === 'up' ? r.pct - trainer.up : r.pct) / 100), piece.title); addLog({ minutes: 1, activity: `Piece: ${piece.title}`, detail: `Goal: ${r.goal}${prefs.hand === 'both' ? ' (hands together)' : prefs.hand === 'R' ? ' (right hand)' : ' (left hand)'}`, tab: piece.id, bpm: bpm(), pct: trainer.pct }); }
    if (r.change !== 'same') { metronome.setBpm(bpm()); paintTempo(); }
    msg(r.change === 'up' ? `${r.goal}! Up to ${trainer.pct}%.` : r.change === 'down' ? `Back to ${trainer.pct}%. Slow is how it gets fast.` : r.change === 'goal' ? `${r.goal} at full speed!` : `Clean run ${trainer.clean} of 3.`, r.change === 'down' ? '' : 'good');
  }
  // Wait mode: step through your hand's notes; the app plays the other hand as you reach it.
  // On a phone held sideways the keyboard zooms to your hand's keys so they're big enough to tap.
  function startWait() {
    const from = loop ? loop[0] * bar : 0, to = loop ? (loop[1] + 1) * bar : total;
    const mine = events.filter(e => yours(e) && e.start >= from - 1e-6 && e.start < to - 1e-6);
    const points = [...new Set(mine.map(e => e.start))].sort((a, b) => a - b);
    waitState = { points, k: 0, got: new Set(), played: new Set() };
    const ms = mine.flatMap(e => e.midis);
    if (ms.length) kb.zoomTo(Math.min(...ms) - 1, Math.max(...ms) + 1);
    stepWait();
  }
  function stepWait() {
    const w = waitState;
    if (!w) return;
    if (w.k >= w.points.length) { onPass(); if (running) startWait(); return; }
    const pos = w.points[w.k];
    kb.clearMarks();
    events.forEach((e, i) => { if (!yours(e) && e.start <= pos + 1e-6 && !w.played.has(i) && (!loop || e.bar >= loop[0])) { w.played.add(i); e.midis.forEach(m => pluckAt(m, now() + 0.02, 0.7)); } });
    showAt(pos);
    const want = events.filter(e => yours(e) && Math.abs(e.start - pos) < 1e-6);
    w.want = want.flatMap(e => e.midis);
    w.got = new Set();
    kb.light({});
    kb.setDots(want.flatMap(e => e.midis.map(m => ({ s: 0, f: m, role: roleIn(m, e.bar), hand: e.hand, label: preferredName(m) }))), chordOfBar(Math.min(bars - 1, Math.floor(pos / bar + 1e-6))).root);
    if (w.want.length) kb.scrollTo(w.want[0], true);
  }
  function onKey(m) {
    const w = waitState;
    if (!w || !w.want) return;
    if (w.want.includes(m)) { w.got.add(m); kb.mark(0, m, true, preferredName(m), true); if (w.want.every(x => w.got.has(x))) { w.k++; setTimeout(stepWait, 80); } }
    else { missed = true; kb.mark(0, m, false, undefined, true); msg(`That's ${nameOct(m)}. Look for the lit key.`, 'bad'); }
  }
  // The microphone can answer wait mode too (any octave).
  let stopMic = () => {};
  function stop(silent) {
    timers.forEach(clearTimeout); timers = []; stopPlay(); stopPlay = () => {};
    if (waitState) kb.zoomOut();
    waitState = null;
    if (running && !silent && Date.now() - startedAt > 20000) addLog({ minutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)), activity: `Piece: ${piece.title}`, detail: `${trainer.pct}% (${bpm()} bpm), ${prefs.hand === 'both' ? 'hands together' : prefs.hand === 'R' ? 'right hand' : 'left hand'}`, tab: piece.id, bpm: bpm(), pct: trainer.pct });
    running = false;
    paintGo(); $('#pp-missed').hidden = true;
    kb.clearMarks(); kb.light({});
  }
  const pickSeg = (id, key, after) => { $(id).onclick = e => { const b = e.target.closest('button'); if (!b) return; prefs[key] = b.dataset.v; save(); el.querySelectorAll(`${id} button`).forEach(x => x.setAttribute('aria-pressed', x === b)); after?.(); }; };
  pickSeg('#pp-view', 'view', () => { drawView(); showAt(songPos); });
  pickSeg('#pp-hand', 'hand', () => { if (running) start(); });
  $('#pp-wait').onchange = e => { prefs.wait = e.target.checked; save(); if (running) start(); };
  $('#pp-guide').onchange = e => { prefs.guide = e.target.checked; save(); };
  $('#pp-count').onchange = e => { prefs.countIn = e.target.checked; save(); };
  $('#pp-lh')?.addEventListener('change', e => { prefs.lhPattern = e.target.value; events = pieceEvents({ ...piece, lhPattern: prefs.lhPattern }, lhFn); kb.set({ view: [lo(), hi()] }); drawView(); if (land) drawStrip(); if (running) start(); });
  $('#pp-missed').onclick = () => { missed = true; $('#pp-missed').setAttribute('aria-pressed', 'true'); };
  el.querySelectorAll('.pp-go').forEach(b => { b.onclick = () => (running ? stop() : start()); });
  if (micOn()) stopMic = listenNotes(nn => { if (waitState?.want) { const m = waitState.want.find(x => pcOf(x) === nn.pc); if (m != null) onKey(m); } });
  paintColor(); paintTempo(); drawView(); setLand(); showAt(0);
  raf = requestAnimationFrame(fallFrame);
  return () => { stop(); stopMic(); cancelAnimationFrame(raf); unland(); kb.destroy(); };
}

export default {
  id: 'playalong', title: 'Play-along', blurb: 'Pieces as a piano roll, falling notes, staff or chord chart',
  icon: '<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zM8 5v9M13 5v9M18 5v9" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  mount(el, params) {
    const piece = findPiece(params.get('tab'));
    if (!piece) { library(el); return; }
    const head = el.closest('.tool-body')?.previousElementSibling?.querySelector('h2');
    if (head) head.textContent = piece.title;
    return player(el, piece);
  }
};
export const _x = { lookup, parseFormula };
