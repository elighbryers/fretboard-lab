// Bass play-along (docs/research-bass.md D5): 4- or 5-line bass tab with chord symbols above
// each bar and an optional bass clef staff, always with drums and an optional chord pad.
// "Bass on" plays the line for you; turn it off and play it yourself. Tempo, count-in,
// tap a bar to loop it, and an auto speed-up of +5 bpm after each clean loop.
import { BASS_TABS, findBassTab } from './tabs/index.js';
import { Fretboard } from '../fretboard.js';
import { pluckAt, metronome, now } from '../audio.js';
import { groove, pad, STYLES, MUTES } from '../groove.js';
import { setKitVolume } from '../drumkit.js';
import { parseChordName } from '../progressions.js';
import { preferredName, pcOf } from '../theory.js';
import { tuningOf, itemNum } from '../instruments.js';
import { activeTuning, getPracticePrefs, updatePracticePrefs, addLog, getTempo, recordClean, startBelow } from '../storage.js';
import { renderAbc, toAbc } from '../notation.js';
import { esc } from '../ui.js';

const LESSON = tuningOf('bass'); // tab numbering: 4-string, string 4 = low E
const midiOf = (string, fret) => LESSON.strings.find(x => x.num === string).midi + fret;
const BW = 46, LEFT = 30, TOP = 40, GAP = 20;

// Timeline: [{ i, bar, start (beats from the top), beats, string, fret, midi, rest }]
export function bassTimeline(tab) {
  const bar = tab.time[0] * 4 / tab.time[1];
  let t = 0;
  return tab.notes.map(([string, fret, beats], i) => {
    const e = { i, start: t, beats, bar: Math.floor(t / bar + 1e-6), string, fret, rest: !string, midi: string ? midiOf(string, fret) : null };
    t += beats;
    return e;
  });
}
// Swing: an off-beat 8th lands two-thirds of the way through the beat.
export const swung = (start, swing) => (swing && Math.abs((start % 1) - 0.5) < 1e-6 ? Math.floor(start) + 2 / 3 : start);

function library(el) {
  el.innerHTML = `<p class="muted">Original bass lines with drums. Some sit over public-domain songs' chords. Bass tab: the bottom line is the low E string.</p>
    <ul class="tab-list">${BASS_TABS.map(t => `
    <li><a href="#practice?tool=playalong&tab=${t.id}">
      <span><b>${esc(t.title)}</b><small>${esc(t.source)} · ${t.time.join('/')} · ${esc(STYLES[t.style].name)}</small></span>
      <span class="meta"><span class="pill ${t.difficulty}">${t.difficulty}</span><small>${t.bpm} bpm</small></span>
    </a></li>`).join('')}</ul>`;
}

function player(el, tab) {
  const tl = bassTimeline(tab), notes = tl.filter(e => !e.rest), barBeats = tab.time[0] * 4 / tab.time[1], bars = tab.chords.length;
  const chords = tab.chords.map(parseChordName);
  const prefs = { bassOn: true, padOn: true, countIn: true, autoUp: false, staff: false, mute: 'full', ...(getPracticePrefs().bassTab || {}) };
  const savePrefs = () => updatePracticePrefs({ bassTab: prefs });
  const exId = `bass-tab:${tab.id}`, best = getTempo(exId);
  let bpm = best ? Math.max(40, Math.min(tab.bpm, startBelow(best.best))) : tab.bpm;
  let loop = null, running = false, missed = false, startedAt = 0, passes = 0, timers = [];
  const strings = activeTuning().strings.length >= 5 ? 5 : 4, H = TOP + (strings - 1) * GAP + 30, W = LEFT + bars * barBeats * BW + 20;
  const y = s => TOP + (s - 1) * GAP;
  let svg = '';
  for (let s = 1; s <= strings; s++) svg += `<line class="pa-line" x1="0" x2="${W}" y1="${y(s)}" y2="${y(s)}"/><text class="pa-barno" x="2" y="${y(s) + 4}">${LESSON.strings.find(x => x.num === s)?.name || 'B'}</text>`;
  for (let b = 0; b <= bars; b++) {
    const x = LEFT + b * barBeats * BW - 6;
    svg += `<line class="pa-bar" x1="${x}" x2="${x}" y1="${y(1)}" y2="${y(strings)}"/>`;
    if (b < bars) svg += `<text class="pa-chord" x="${x + 8}" y="${TOP - 18}">${esc(tab.chords[b])}</text><text class="pa-barno" x="${x + 8}" y="${H - 4}">${b + 1}</text>` +
      `<rect class="pa-hit" data-bar="${b}" x="${x}" y="0" width="${barBeats * BW}" height="${H}"/>`;
  }
  svg += `<rect class="pa-loop" id="bt-loop" x="0" y="2" width="0" height="${H - 4}" hidden/>`;
  notes.forEach(n => {
    const x = LEFT + n.start * BW;
    svg += `<g class="pa-note" data-i="${n.i}"><rect x="${x - 3}" y="${y(n.string) - 9}" width="${String(n.fret).length * 9 + 6}" height="18" rx="4"/><text x="${x}" y="${y(n.string) + 5}">${n.fret}</text></g>`;
  });
  const seg = (id, items, val) => `<div class="seg" id="${id}">${Object.entries(items).map(([k, v]) => `<button data-v="${k}" aria-pressed="${k === val}">${v}</button>`).join('')}</div>`;
  el.innerHTML = `
    <div class="pa bass-pa">
      <div class="pa-head"><b>${esc(tab.title)}</b><span class="pill ${tab.difficulty}">${tab.difficulty}</span><small class="muted">${esc(tab.source)} · ${tab.time.join('/')} · ${esc(STYLES[tab.style].name)}${tab.swing ? ' (swung 8ths)' : ''}</small></div>
      <div class="tabview" id="bt-view"><svg class="tab-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Bass tab with chord symbols">${svg}</svg></div>
      <div id="bt-staff" class="staff-box" ${prefs.staff ? '' : 'hidden'}></div>
      <p class="now-chord" id="bt-now" aria-live="polite"></p>
      <div class="tempo"><button class="icon" id="bt-slower" aria-label="Slower">−</button>
        <input type="range" id="bt-bpm" min="40" max="${Math.round(tab.bpm * 1.5)}" value="${bpm}" aria-label="Tempo">
        <button class="icon" id="bt-faster" aria-label="Faster">+</button><output><b id="bt-bpm-out">${bpm}</b> bpm</output></div>
      <div class="row"><button class="primary big" id="bt-go">▶ Play</button><button id="bt-missed" hidden>✗ Missed it</button></div>
      <div class="row toggles">
        <label class="check"><input type="checkbox" id="bt-bass"${prefs.bassOn ? ' checked' : ''}> Bass on (the app plays the line)</label>
        <label class="check"><input type="checkbox" id="bt-pad"${prefs.padOn ? ' checked' : ''}> Chord pad</label>
        <label class="check"><input type="checkbox" id="bt-count"${prefs.countIn ? ' checked' : ''}> Count-in bar</label>
        <label class="check"><input type="checkbox" id="bt-auto"${prefs.autoUp ? ' checked' : ''}> Speed up 5 bpm after each clean loop</label>
        <label class="check"><input type="checkbox" id="bt-staffon"${prefs.staff ? ' checked' : ''}> Show bass clef</label>
      </div>
      <div class="field"><span class="lbl">Drums</span>${seg('bt-mute', MUTES, prefs.mute)}</div>
      <label class="vol"><span>Drums</span><input type="range" min="0" max="100" value="80" id="bt-vol-drums" aria-label="Drum volume"></label>
      <p class="muted small" id="bt-loopmsg">Tap a bar to loop it; tap it again to loop the whole piece.</p>
      <p class="msg" id="bt-msg" aria-live="polite"></p>
      <div id="bt-neck"></div>
    </div>`;
  const $ = s => el.querySelector(s);
  const fb = new Fretboard($('#bt-neck'), { view: [0, 12], labels: 'notes', tuning: activeTuning(), ariaLabel: 'Bass neck showing the note being played' });
  const neckOf = n => { const t = activeTuning(), s = t.strings.findIndex((_, i) => itemNum(t, i) === n.string); return { s, f: n.midi - t.strings[s].midi }; };
  const msg = (t, k = '') => { $('#bt-msg').textContent = t; $('#bt-msg').className = 'msg ' + k; };

  const paintLoop = () => {
    const r = $('#bt-loop');
    r.toggleAttribute('hidden', !loop);
    if (loop) { r.setAttribute('x', LEFT + loop[0] * barBeats * BW - 6); r.setAttribute('width', (loop[1] - loop[0] + 1) * barBeats * BW); }
    $('#bt-loopmsg').textContent = loop ? `Looping bar ${loop[0] + 1}. Tap it again to play the whole piece.` : 'Tap a bar to loop it; tap it again to loop the whole piece.';
  };
  $('#bt-view').onclick = e => {
    const h = e.target.closest('.pa-hit'); if (!h) return;
    const b = +h.dataset.bar;
    loop = loop && loop[0] === b ? null : [b, b];
    paintLoop();
  };
  const setBpm = v => { bpm = Math.max(40, Math.min(Math.round(tab.bpm * 1.5), Math.round(v))); $('#bt-bpm').value = bpm; $('#bt-bpm-out').textContent = bpm; if (running) groove.set({ bpm }); };
  $('#bt-bpm').oninput = e => setBpm(e.target.value);
  $('#bt-slower').onclick = () => setBpm(bpm - 2);
  $('#bt-faster').onclick = () => setBpm(bpm + 2);
  const tog = (id, key, after) => { $(id).onchange = e => { prefs[key] = e.target.checked; savePrefs(); after?.(); }; };
  tog('#bt-bass', 'bassOn'); tog('#bt-pad', 'padOn'); tog('#bt-count', 'countIn'); tog('#bt-auto', 'autoUp');
  tog('#bt-staffon', 'staff', () => { $('#bt-staff').hidden = !prefs.staff; if (prefs.staff) drawStaff(); });
  $('#bt-mute').onclick = e => { const b = e.target.closest('button'); if (!b) return; prefs.mute = b.dataset.v; savePrefs(); el.querySelectorAll('#bt-mute button').forEach(x => x.setAttribute('aria-pressed', x === b)); if (running) groove.set({ mute: prefs.mute }); };
  $('#bt-vol-drums').oninput = e => setKitVolume(e.target.value / 100);
  $('#bt-missed').onclick = () => { missed = true; $('#bt-missed').setAttribute('aria-pressed', 'true'); };

  // Bass clef: written an octave above where the bass sounds (the usual bass convention).
  function drawStaff() {
    const written = tl.map((e, k) => ({ midi: e.rest ? null : e.midi + 12, beats: e.beats, chord: Math.abs(e.start - e.bar * barBeats) < 1e-6 && (k === 0 || tl[k - 1].bar !== e.bar) ? tab.chords[e.bar] : null }));
    renderAbc($('#bt-staff'), toAbc(written, { time: tab.time, clef: 'bass', preferFlats: /b|F/.test(tab.key) && !/#/.test(tab.key) }));
  }
  if (prefs.staff) drawStaff();

  const lightNote = n => {
    el.querySelectorAll('.pa-note.now').forEach(x => x.classList.remove('now'));
    const g = el.querySelector(`.pa-note[data-i="${n.i}"]`);
    if (g) { g.classList.add('now'); const v = $('#bt-view'), x = LEFT + n.start * BW; if (x < v.scrollLeft + 40 || x > v.scrollLeft + v.clientWidth - 80) v.scrollLeft = x - 60; }
    const c = chords[n.bar], p = neckOf(n);
    fb.setDots([{ ...p, role: pcOf(n.midi) === c.root ? 'root' : 'other', label: preferredName(n.midi) }], c.root);
  };
  const at = (t, fn) => timers.push(setTimeout(fn, Math.max(0, (t - now()) * 1000)));

  function start() {
    stop(true);
    running = true; passes = 0; missed = false; startedAt = Date.now();
    $('#bt-go').textContent = '■ Stop';
    $('#bt-missed').hidden = false; $('#bt-missed').setAttribute('aria-pressed', 'false');
    const lead = prefs.countIn ? 1 : 0;
    let lastSongBar = -1;
    groove.start({ style: tab.style, bpm, mute: prefs.mute, onBeat: (beat, t, gbar) => {
      const rel = gbar - lead;
      if (rel < 0) { if (beat === 0) at(t, () => { $('#bt-now').innerHTML = 'Count-in…'; }); return; }
      const span = loop ? loop[1] - loop[0] + 1 : bars;
      const songBar = (loop ? loop[0] : 0) + (rel % span);
      if (beat === 0 && rel > 0 && rel % span === 0) onPass();
      const spb = 60 / metronome.bpm, c = chords[songBar];
      if (beat === 0) {
        if (prefs.padOn) pad(c.root, c.chord, t, spb * barBeats * 0.98);
        const nx = chords[(songBar + 1) % bars];
        at(t, () => { $('#bt-now').innerHTML = `Bar ${songBar + 1}: <b>${esc(tab.chords[songBar])}</b> · next ${esc(nx ? tab.chords[(songBar + 1) % bars] : '')}`; });
      }
      lastSongBar = songBar;
      // notes starting in this beat of this bar
      for (const n of notes) {
        if (n.bar !== songBar) continue;
        const inBar = n.start - songBar * barBeats;
        if (inBar < beat - 1e-6 || inBar >= beat + 1 - 1e-6) continue;
        const nt = t + (swung(inBar, tab.swing) - beat) * spb;
        if (prefs.bassOn) pluckAt(n.midi, nt, 0.95);
        at(nt, () => lightNote(n));
      }
    } });
  }
  function onPass() {
    passes++;
    const clean = !missed;
    missed = false;
    $('#bt-missed').setAttribute('aria-pressed', 'false');
    if (clean) recordClean(exId, bpm, `${tab.title} (bass)`);
    if (clean && prefs.autoUp && bpm + 5 <= Math.round(tab.bpm * 1.5)) { setBpm(bpm + 5); msg(`Clean loop! Up to ${bpm} bpm.`, 'good'); }
    else if (!clean) msg('Loop again at this tempo.', '');
  }
  function stop(silent) {
    timers.forEach(clearTimeout); timers = [];
    if (groove.running) groove.stop();
    if (running && !silent) {
      const mins = Math.round((Date.now() - startedAt) / 60000);
      if (Date.now() - startedAt > 20000) addLog({ minutes: Math.max(1, mins), activity: `Play-along: ${tab.title}`, detail: `${bpm} bpm${loop ? `, bar ${loop[0] + 1} looped` : ''}`, tab: tab.id, pct: Math.round(100 * bpm / tab.bpm), bpm });
    }
    running = false;
    $('#bt-go').textContent = '▶ Play';
    $('#bt-missed').hidden = true;
    el.querySelectorAll('.pa-note.now').forEach(x => x.classList.remove('now'));
  }
  $('#bt-go').onclick = () => (running ? stop() : start());
  paintLoop();
  return () => stop();
}

export default {
  id: 'playalong', title: 'Play-along', blurb: 'Bass lines with drums and chords',
  icon: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="10" r="2.2" fill="currentColor"/></svg>',
  mount(el, params) {
    const tab = findBassTab(params.get('tab'));
    if (!tab) { library(el); return; }
    const head = el.closest('.tool-body')?.previousElementSibling?.querySelector('h2');
    if (head) head.textContent = tab.title;
    return player(el, tab);
  }
};
