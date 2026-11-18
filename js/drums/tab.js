// The Kit tab (replaces the Fretboard tab when Drums is the instrument; docs/research-drums.md D1):
// a kit to tap (pads with limb labels, keyboard keys, e-kit MIDI), and a step grid linked to drum
// notation with a moving playhead and a legend. Grooves from the groove player are presets.
import { KIT, LIMBS, piece, fromGM, fromKey, fromPatterns } from './kit.js';
import { grooveAbcMap, LEGEND } from './notation.js';
import { hit } from '../drumkit.js';
import { STYLES } from '../groove.js';
import { metronome, now } from '../audio.js';
import { rhythmGrid } from '../rhythm-grid.js';
import { renderAbc } from '../notation.js';
import { midiOn, listenMidi } from '../midi.js';
import { getFretboardPrefs, updateFretboardPrefs } from '../storage.js';
import { esc } from '../ui.js';

// Pads laid out roughly like a kit seen from the stool.
const LAYOUT = [['crash', 'ride'], ['hat', 'ohat', 'tom1', 'tom2'], ['snare', 'tom3'], ['phat', 'kick']];
const ROWS = ['crash', 'ride', 'hat', 'ohat', 'tom1', 'tom2', 'snare', 'tom3', 'kick', 'phat'];
let el, grid, off = null, midiStop = null, keyOff = null, st;
const $ = s => el.querySelector(s);

export function flashPad(root, id) { const p = root.querySelector(`[data-pad="${id}"]`); if (p) { p.classList.remove('flash'); void p.offsetWidth; p.classList.add('flash'); } }
// Pads: tap, keys, MIDI. onHit(pieceId, audioTime?) after the sound.
export function padsHTML(left = false) {
  return `<div class="kit${left ? ' lefty' : ''}" role="group" aria-label="Drum kit">${LAYOUT.map(row => `<div class="kit-row">${row.map(id => { const p = piece(id); return `<button class="pad pad-${id}" data-pad="${id}" aria-label="${esc(p.name)} (${LIMBS[p.limb]})"><b>${esc(p.name)}</b><span class="limb limb-${p.limb}">${p.limb}</span>${p.key ? `<kbd>${p.key === ' ' ? 'Space' : p.key.toUpperCase()}</kbd>` : ''}</button>`; }).join('')}</div>`).join('')}</div>`;
}
export function wirePads(root, onHit) {
  const down = e => { const b = e.target.closest('[data-pad]'); if (!b) return; e.preventDefault(); const id = b.dataset.pad; hit(id); flashPad(root, id); onHit?.(id, e); };
  root.addEventListener('pointerdown', down);
  const key = e => { if (e.repeat || e.target.closest('input,select,textarea') || !root.isConnected || root.offsetParent === null) return; const id = fromKey(e.key); if (!id) return; e.preventDefault(); hit(id); flashPad(root, id); onHit?.(id, e); };
  document.addEventListener('keydown', key);
  const stopMidi = midiOn() ? listenMidi({ onNote: (n, v, t) => { const id = fromGM(n); if (!id) return; hit(id, undefined, 0.4 + v); flashPad(root, id); onHit?.(id, { midiTime: t }); } }) : () => {};
  return () => { root.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key); stopMidi(); };
}

function drawGrid() {
  const g = st.groove;
  grid = rhythmGrid($('#dk-grid'), { beats: g.beats, sub: g.sub, rows: ROWS.map(id => ({ id, label: `${piece(id).name} · ${piece(id).limb}`, cells: g.hits[id] || [], editable: true, mark: piece(id).staff.x ? '×' : '●', preview: () => hit(id) })),
    onChange: (row, cells) => { st.groove.hits[row] = cells; save(); drawStaff(); } });
  drawStaff();
}
let staffIndex = [];
function drawStaff() { const m = grooveAbcMap(st.groove); staffIndex = m.index; renderAbc($('#dk-staff'), m.abc, { abcjs: { add_classes: true } }); }
const save = () => updateFretboardPrefs({ drumsLast: st });
function light(step) {
  grid.light(step);
  el.querySelectorAll('#dk-staff .now').forEach(x => x.classList.remove('now'));
  if (step >= 0 && staffIndex[step] >= 0) el.querySelectorAll(`#dk-staff .abcjs-n${staffIndex[step]}`).forEach(x => x.classList.add('now'));
}
function play() {
  if (off) { off(); off = null; metronome.stop(); light(-1); $('#dk-go').textContent = '▶ Play loop'; return; }
  const g = st.groove;
  metronome.stop(); metronome.setBpm(st.bpm); metronome.beatsPerBar = g.beats; metronome.subdiv = 1;
  const saved = metronome.volume; metronome.setVolume(st.click ? 0.5 : 0);
  const unsub = metronome.schedule((beat, t) => {
    const spb = 60 / metronome.bpm;
    for (let k = 0; k < g.sub; k++) {
      const step = beat * g.sub + k, at = t + k * spb / g.sub;
      Object.entries(g.hits).forEach(([p, steps]) => { if (steps.includes(step)) hit(p, at, g.accents?.[p]?.includes(step) ? 1 : 0.75); });
      setTimeout(() => off && light(step), Math.max(0, (at - now()) * 1000));
    }
  });
  off = () => { unsub(); metronome.setVolume(saved); };
  metronome.start();
  $('#dk-go').textContent = '■ Stop';
}

export default {
  id: 'fretboard', title: 'Kit',
  icon: '<circle cx="12" cy="14" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 6l6 4M20 6l-6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  mount(section) {
    el = section;
    st = { style: 'rock8', bpm: 80, click: false, left: false, ...(getFretboardPrefs().drumsLast || {}) };
    if (!st.groove) st.groove = fromPatterns(STYLES[st.style].parts, { beats: STYLES[st.style].beats, sub: STYLES[st.style].grid });
    el.innerHTML = `
      <h2>Kit</h2>
      <div class="seg" id="dk-mode" role="group" aria-label="View"><button data-m="kit">Kit</button><button data-m="grid">Grid and notation</button></div>
      <div id="dk-kit"><p class="muted small">Tap a drum to hear it. Letters show the keyboard keys; an e-drum kit works too (Progress → Settings → MIDI).
        The tag on each pad is the limb that usually plays it: R right hand, L left hand, RF right foot, LF left foot.</p>
        ${padsHTML(st.left)}<label class="check"><input type="checkbox" id="dk-left"${st.left ? ' checked' : ''}> Left-handed kit (mirrored)</label></div>
      <div id="dk-gridview" hidden>
        <div class="row"><label>Start from<select id="dk-style">${Object.entries(STYLES).map(([k, v]) => `<option value="${k}"${k === st.style ? ' selected' : ''}>${esc(v.name)}</option>`).join('')}</select></label>
          <button id="dk-clear">Clear</button></div>
        <div id="dk-grid"></div>
        <div class="staff-box" id="dk-staff"></div>
        <details class="legend-box"><summary>Drum staff legend</summary><ul>${LEGEND.map(l => `<li><b>${esc(l.name)}</b>: ${esc(l.where)}</li>`).join('')}</ul>
          <p class="muted small">Cymbals use x noteheads. Hands and feet share one staff; here every stem points up.</p></details>
        <div class="tempo"><button class="icon" id="dk-slower" aria-label="Slower">−</button><output><b id="dk-bpm">${st.bpm}</b> bpm</output><button class="icon" id="dk-faster" aria-label="Faster">+</button></div>
        <label class="check"><input type="checkbox" id="dk-click"${st.click ? ' checked' : ''}> Click</label>
        <div class="row"><button class="primary big" id="dk-go">▶ Play loop</button></div>
      </div>`;
    const setMode = m => { el.querySelectorAll('#dk-mode button').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === m)); $('#dk-kit').hidden = m !== 'kit'; $('#dk-gridview').hidden = m !== 'grid'; st.mode = m; save(); if (m === 'grid' && !grid) drawGrid(); };
    $('#dk-mode').onclick = e => { const b = e.target.closest('button'); if (b) setMode(b.dataset.m); };
    keyOff = wirePads($('#dk-kit'));
    $('#dk-left').onchange = e => { st.left = e.target.checked; save(); $('#dk-kit .kit').classList.toggle('lefty', st.left); };
    $('#dk-style').onchange = e => { st.style = e.target.value; const s = STYLES[st.style]; st.groove = fromPatterns(s.parts, { beats: s.beats, sub: s.grid }); st.bpm = s.bpm; $('#dk-bpm').textContent = st.bpm; save(); if (off) play(); drawGrid(); };
    $('#dk-clear').onclick = () => { st.groove = { ...st.groove, hits: {} }; save(); drawGrid(); };
    const bpm = v => { st.bpm = Math.max(40, Math.min(220, v)); $('#dk-bpm').textContent = st.bpm; metronome.setBpm(st.bpm); save(); };
    $('#dk-slower').onclick = () => bpm(st.bpm - 4); $('#dk-faster').onclick = () => bpm(st.bpm + 4);
    $('#dk-click').onchange = e => { st.click = e.target.checked; save(); metronome.setVolume(st.click ? 0.5 : 0); };
    $('#dk-go').onclick = play;
    setMode(st.mode || 'kit');
  },
  show() {},
  hide() { if (off) play(); }
};
