// The groove player screen (inside the Metronome tool, "Groove" mode): drum styles, mute
// options, drop-out bars, a looping chord pad with its own volume, and a big visual tempo
// display. Settings are remembered in settings.groove. Every instrument can use it.
import { metronome } from '../audio.js';
import { groove, STYLES, MUTES, DROPOUTS, setPadVolume, isDropBar } from '../groove.js';
import { setKitVolume } from '../drumkit.js';
import { getSettings, setSetting } from '../storage.js';
import { chordOf } from '../progressions.js';
import { KEY_NAMES, spell } from '../theory.js';
import { esc } from '../ui.js';

export const CHARTS = {
  off: { name: 'No chords', romans: [] },
  'I-IV-V-I': { name: 'I–IV–V–I', romans: ['I', 'IV', 'V', 'I'] },
  'I-V-vi-IV': { name: 'I–V–vi–IV', romans: ['I', 'V', 'vi', 'IV'] },
  'ii-V-I': { name: 'ii–V–I', romans: ['ii7', 'V7', 'Imaj7', 'Imaj7'] },
  blues: { name: '12-bar blues', romans: ['I7', 'IV7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'] },
  'i-iv': { name: 'i–iv (minor vamp)', romans: ['vi', 'ii', 'vi', 'ii'] }
};
const DEFAULTS = { style: 'rock8', mute: 'full', dropout: 0, chart: 'off', key: 9, drumVol: 0.8, padVol: 0.5, clickVol: 0 };
export const grooveSettings = () => ({ ...DEFAULTS, ...(getSettings().groove || {}) });
const save = g => setSetting('groove', g);
export const chartChords = (chart, keyPc) => {
  const key = spell(keyPc, '1').root;
  return (CHARTS[chart] || CHARTS.off).romans.map(r => chordOf(key, r));
};

export function mountGroove(el, { bpm, onBpm }) {
  let g = grooveSettings();
  setKitVolume(g.drumVol); setPadVolume(g.padVol);
  const sel = (id, items, val) => `<select id="${id}">${Object.entries(items).map(([v, n]) => `<option value="${v}"${String(v) === String(val) ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
  el.innerHTML = `
    <div class="groove">
      <div class="gv-display" id="gv-display" aria-live="off">
        <div class="gv-beats" id="gv-beats"></div>
        <div class="gv-meta"><span id="gv-bar">Bar –</span><span id="gv-chord"></span><span class="gv-drop" id="gv-drop" hidden>Drop-out: keep time!</span></div>
      </div>
      <div class="row"><label class="grow">Style${sel('gv-style', Object.fromEntries(Object.entries(STYLES).map(([k, v]) => [k, v.name])), g.style)}</label>
        <button class="small" id="gv-style-bpm">Use its tempo</button></div>
      <div class="field"><span class="lbl">Drums</span><div class="seg" id="gv-mute">${Object.entries(MUTES).map(([k, n]) => `<button data-v="${k}" aria-pressed="${k === g.mute}">${n}</button>`).join('')}</div></div>
      <div class="field"><span class="lbl">Drop-out bars</span><div class="seg" id="gv-drop-seg">${Object.entries(DROPOUTS).map(([k, n]) => `<button data-v="${k}" aria-pressed="${+k === g.dropout}">${n}</button>`).join('')}</div>
        <small class="muted">The drums stop for a bar. Keep playing, and see if you land with them when they come back.</small></div>
      <div class="row"><label>Chords${sel('gv-chart', Object.fromEntries(Object.entries(CHARTS).map(([k, v]) => [k, v.name])), g.chart)}</label>
        <label>Key${sel('gv-key', Object.fromEntries(KEY_NAMES.map((k, i) => [i, k])), g.key)}</label></div>
      <label class="vol"><span>Drums</span><input type="range" min="0" max="100" id="gv-vol-drums" value="${Math.round(g.drumVol * 100)}" aria-label="Drum volume"></label>
      <label class="vol"><span>Chord pad</span><input type="range" min="0" max="100" id="gv-vol-pad" value="${Math.round(g.padVol * 100)}" aria-label="Chord pad volume"></label>
      <label class="vol"><span>Click</span><input type="range" min="0" max="100" id="gv-vol-click" value="${Math.round(g.clickVol * 100)}" aria-label="Click volume"></label>
      <div class="row center"><button class="primary big" id="gv-go">▶ Start groove</button></div>
    </div>`;
  const $ = s => el.querySelector(s);
  const chords = () => chartChords(g.chart, g.key);
  const paintBeats = () => {
    const n = STYLES[g.style].beats;
    $('#gv-beats').innerHTML = Array.from({ length: n }, (_, i) => `<i data-b="${i}"${i === 0 ? ' class="one"' : ''}>${i + 1}</i>`).join('');
  };
  const update = patch => { Object.assign(g, patch); save(g); if (groove.running) groove.set({ ...patch, chords: chords() }); };
  const start = () => {
    groove.start({ style: g.style, bpm: bpm(), mute: g.mute, dropout: g.dropout, chords: chords(), click: g.clickVol });
    $('#gv-go').textContent = '■ Stop';
  };
  // Beat display, timed to the sound with metronome.listen.
  const off = metronome.listen((beat, t, bar) => paintBeat(beat, bar, groove.running && isDropBar(bar, g.dropout)));
  function paintBeat(beat, bar, drop) {
    const dot = $(`#gv-beats i[data-b="${beat}"]`);
    if (dot) { dot.classList.remove('pulse'); void dot.offsetWidth; dot.classList.add('pulse'); }
    $('#gv-bar').textContent = `Bar ${bar + 1}`;
    $('#gv-drop').hidden = !drop;
    $('#gv-display').classList.toggle('dropping', !!drop);
    const c = groove.running && groove.chordAt(bar);
    $('#gv-chord').innerHTML = c ? `Chord: <b>${esc(c.name)}</b>` : '';
  }
  paintBeats();
  $('#gv-style').onchange = e => { update({ style: e.target.value }); paintBeats(); };
  $('#gv-style-bpm').onclick = () => onBpm(STYLES[g.style].bpm);
  $('#gv-mute').onclick = e => { const b = e.target.closest('button'); if (!b) return; el.querySelectorAll('#gv-mute button').forEach(x => x.setAttribute('aria-pressed', x === b)); update({ mute: b.dataset.v }); };
  $('#gv-drop-seg').onclick = e => { const b = e.target.closest('button'); if (!b) return; el.querySelectorAll('#gv-drop-seg button').forEach(x => x.setAttribute('aria-pressed', x === b)); update({ dropout: +b.dataset.v }); };
  $('#gv-chart').onchange = e => update({ chart: e.target.value });
  $('#gv-key').onchange = e => update({ key: +e.target.value });
  $('#gv-vol-drums').oninput = e => { setKitVolume(e.target.value / 100); update({ drumVol: e.target.value / 100 }); };
  $('#gv-vol-pad').oninput = e => { setPadVolume(e.target.value / 100); update({ padVol: e.target.value / 100 }); };
  $('#gv-vol-click').oninput = e => update({ clickVol: e.target.value / 100 });
  $('#gv-go').onclick = () => { if (groove.running) { groove.stop(); $('#gv-go').textContent = '▶ Start groove'; } else start(); };
  return {
    setBpm: v => { if (groove.running) groove.set({ bpm: v }); },
    stop: () => { off(); if (groove.running) groove.stop(); }
  };
}
