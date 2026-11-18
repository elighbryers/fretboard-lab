// Fretboard tab: free play. A few controls up front (key, scale/chord, labels,
// Play it); everything else sits under "More".
// Links: #fretboard?key=G&scale=major (or chord=m7) &labels=intervals &pos=5-8
import { KEY_NAMES, SCALE_GROUPS, CHORD_GROUPS, NOTES, lookup, parseFormula, spell, parseNote, pcOf, midiAt, positionForMidi } from '../theory.js';
import { Fretboard, legendHTML } from '../fretboard.js';
import { droneStart, droneStop, droneOn } from '../audio.js';
import { volumeHTML } from '../ui.js';
import { replaceParams } from '../router.js';
import { getFretboardPrefs, updateFretboardPrefs, allItems, getInstrument, activeTuning } from '../storage.js';
import { tuningOf, itemNum, instrumentDef } from '../instruments.js';
import { registered } from '../registry.js';

// Guitar: 15 frets, whole neck. Bass: 20 frets, showing 0-12 until you widen it.
const DEF = instrumentDef(getInstrument()), FRETS = DEF.frets || 15, START_TO = getInstrument() === 'bass' ? 12 : FRETS;
// Extra tools for this instrument (js/bass/fretboard-panel.js): a More section and, when one of
// its views is on, the dots to draw instead of the plain scale or chord.
let panel = null; // set in mount(): instrument code registers after this module loads
const DEFAULT = {
  key: 9, kind: 'scale', id: 'minor-pentatonic', labels: 'notes', from: 0, to: START_TO,
  overlayRoot: null, overlayChord: '', heat: false, leftHanded: false, playerView: false
};
// Chords offered for "scale over chord"
const OVERLAY_CHORDS = ['major', 'minor', 'dim', 'aug', 'sus4', '5', '7', 'maj7', 'm7', 'm7b5', 'dim7', '6', 'm6', '9'];

let state = { ...DEFAULT }, fb, el, pickerKind = 'scale', startedDrone = false;
const $ = sel => el.querySelector(sel);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const current = () => lookup(state.kind, state.id) || lookup('scale', 'minor-pentatonic');
const wholeNeck = () => state.from === 0 && state.to >= START_TO;
// What an instrument's panel can see and do.
const api = () => ({ el, fb, state, change, compute, FRETS, START_TO, wholeNeck: wholeNeck() });

/* ---------- drawing ---------- */
function compute() {
  const item = current(), degs = parseFormula(item.formula), sp = spell(state.key, degs);
  const scale = new Map(); // rel -> { label, role, name }
  degs.forEach((d, k) => { const rel = pcOf(d.semi); if (!scale.has(rel)) scale.set(rel, { label: d.label, role: d.role, name: sp.notes[k] }); });
  let chord = null;
  if (state.kind === 'scale' && state.overlayChord && state.overlayRoot != null) {
    const c = lookup('chord', state.overlayChord), cd = parseFormula(c.formula), cs = spell(state.overlayRoot, cd);
    chord = { item: c, root: cs.root, notes: [], map: new Map() }; // pc -> { label, role, name }
    cd.forEach((d, k) => {
      const pc = pcOf(state.overlayRoot + d.semi), name = sp.byPc[pc] || cs.notes[k];
      chord.notes.push(name);
      if (!chord.map.has(pc)) chord.map.set(pc, { label: d.label, role: d.role, name });
    });
    chord.root = sp.byPc[pcOf(state.overlayRoot)] || cs.root;
  }
  return { item, degs, sp, scale, chord };
}

function draw() {
  const { item, degs, sp, scale, chord } = compute();
  const dots = [], tuning = activeTuning();
  const label = info => (state.labels === 'notes' ? info.name : state.labels === 'intervals' ? info.label : '');
  tuning.strings.forEach((str, s) => {
    for (let f = 0; f <= FRETS; f++) {
      const pc = pcOf(str.midi + f), inScale = scale.get(pcOf(pc - state.key)), inChord = chord?.map.get(pc);
      // "Dots" mode hides the names to quiz yourself, so the dots go neutral too (color
      // would otherwise be the only clue); the root keeps an outline.
      const bare = x => ({ s, f, role: 'bare', ring: x.role === 'root' });
      if (chord) {
        if (inChord) dots.push(state.labels === 'none' ? bare(inChord) : { s, f, role: inChord.role, label: label(inChord) });
        else if (inScale) dots.push({ s, f, role: 'other', quiet: true });
      } else if (inScale) dots.push(state.labels === 'none' ? bare(inScale) : { s, f, role: inScale.role, label: label(inScale) });
    }
  });
  const own = panel?.dots?.(api());
  if (own) { dots.length = 0; dots.push(...own); }
  fb.set({
    view: [0, Math.max(START_TO, state.to)],
    focus: wholeNeck() ? null : { frets: [state.from, state.to] },
    leftHanded: state.leftHanded, playerView: state.playerView
  });
  fb.setHeatmap(state.heat ? heatScore() : null);
  fb.setDots(dots, state.key);

  // controls reflect state
  $('#fb-key').value = state.key;
  $('#fb-pick').innerHTML = `<span>${esc(sp.root)} · ${esc(item.name)}</span><span aria-hidden="true">▾</span>`;
  el.querySelectorAll('#fb-labels button').forEach(b => b.setAttribute('aria-pressed', b.dataset.l === state.labels));
  $('#fb-from').value = state.from;
  $('#fb-to').value = state.to;
  $('#fb-whole').disabled = state.from === 0 && state.to === FRETS;
  $('#fb-left').checked = state.leftHanded;
  $('#fb-player').checked = state.playerView;
  $('#fb-heat').checked = state.heat;
  paintOverlay(sp, degs);
  paintDrone(sp);
  panel?.paint?.(api());

  const heatNote = state.heat && !hasQuizData() ? '<small>No quiz answers yet. Do a few rounds in Practice and your weak spots show up here.</small>' : '';
  $('#fb-heat-note').innerHTML = heatNote;
  $('#fb-info').innerHTML =
    `<b>${esc(sp.root)} ${esc(item.name)}</b>: ${sp.notes.map(esc).join('  ')}` +
    `<small>Formula: ${esc(item.formula)}</small>` +
    (chord ? `<small>Chord tones of <b>${esc(chord.root)} ${esc(chord.item.name.toLowerCase())}</b> (${chord.notes.map(esc).join(' ')}) stand out; other scale notes are small.</small>` : '');
  renderSaved();
}

function paintOverlay(sp, degs) {
  const wrap = $('#fb-overlay');
  if (state.kind !== 'scale') { wrap.innerHTML = '<small class="muted">Pick a scale to highlight a chord inside it.</small>'; return; }
  const roots = degs.map((d, k) => ({ pc: pcOf(state.key + d.semi), name: sp.notes[k] }))
    .filter((r, k, a) => a.findIndex(x => x.pc === r.pc) === k);
  if (state.overlayRoot == null || !roots.some(r => r.pc === state.overlayRoot)) state.overlayRoot = roots[0].pc;
  wrap.innerHTML = `
    <label>Chord root<select id="fb-ov-root">${roots.map(r => `<option value="${r.pc}">${esc(r.name)}</option>`).join('')}</select></label>
    <label>Chord<select id="fb-ov-chord"><option value="">Off</option>${OVERLAY_CHORDS.map(id => `<option value="${id}">${esc(lookup('chord', id).name)}</option>`).join('')}</select></label>`;
  $('#fb-ov-root').value = state.overlayRoot;
  $('#fb-ov-chord').value = state.overlayChord;
  $('#fb-ov-root').onchange = e => change({ overlayRoot: +e.target.value });
  $('#fb-ov-chord').onchange = e => change({ overlayChord: e.target.value });
}

function paintDrone(sp) {
  const on = droneOn() && startedDrone;
  $('#fb-drone').textContent = on ? `■ Stop drone` : `▶ Drone on ${sp.root}`;
  $('#fb-drone').setAttribute('aria-pressed', on);
}

/* ---------- weak spots (from Practice quiz answers) ---------- */
const hasQuizData = () => Object.keys(allItems()).some(id => id.startsWith('note:'));
function heatScore() {
  const items = allItems(), tuning = activeTuning();
  return (s, f) => {
    const it = items[`note:${NOTES[pcOf(midiAt(s, f, tuning))]}@s${itemNum(tuning, s)}`];
    return it ? it.correct / it.attempts : null;
  };
}

/* ---------- state changes, memory, URL ---------- */
function change(patch) {
  Object.assign(state, patch);
  if (state.from > state.to) [state.from, state.to] = [state.to, state.from];
  if (patch.key != null && droneOn() && startedDrone) droneStart(state.key);
  updateFretboardPrefs({ last: { ...state } });
  draw();
  syncUrl();
}

function syncUrl() {
  const sp = spell(state.key, parseFormula(current().formula));
  replaceParams('fretboard', {
    key: sp.root, [state.kind]: state.id,
    labels: state.labels === 'notes' ? null : state.labels,
    pos: wholeNeck() ? null : `${state.from}-${state.to}`
  });
}

/* ---------- saved setups ---------- */
const SETUP_KEYS = ['key', 'kind', 'id', 'labels', 'from', 'to', 'overlayRoot', 'overlayChord'];
function renderSaved() {
  const setups = getFretboardPrefs().setups;
  $('#fb-saved').hidden = !setups.length;
  $('#fb-saved').innerHTML = setups.length ? '<span class="muted">Saved:</span>' + setups.map((x, i) =>
    `<span class="chip"><button data-load="${i}">${esc(x.name)}</button><button data-del="${i}" aria-label="Delete ${esc(x.name)}">×</button></span>`).join('') : '';
}
function saveSetup() {
  const input = $('#fb-save-name'), name = input.value.trim() || defaultName();
  const setup = { name };
  SETUP_KEYS.forEach(k => setup[k] = state[k]);
  updateFretboardPrefs({ setups: [...getFretboardPrefs().setups.filter(x => x.name !== name), setup] });
  input.value = '';
  $('#fb-save-msg').textContent = `Saved "${name}".`;
  renderSaved();
}
function defaultName() {
  const sp = spell(state.key, parseFormula(current().formula));
  return `${sp.root} ${current().name}` + (wholeNeck() ? '' : ` (frets ${state.from}–${state.to})`);
}

/* ---------- picker ---------- */
const favs = () => getFretboardPrefs().favorites;
const onPickerKey = e => { if (e.key === 'Escape') closePicker(); };
function openPicker() {
  pickerKind = state.kind;
  document.addEventListener('keydown', onPickerKey);
  $('#pk-q').value = '';
  $('#fb-picker').hidden = false;
  document.body.classList.add('no-scroll');
  renderPicker();
  if (matchMedia('(pointer: fine)').matches) $('#pk-q').focus();
  else $('.picker-sheet').focus();
}
function closePicker() {
  document.removeEventListener('keydown', onPickerKey);
  $('#fb-picker').hidden = true;
  document.body.classList.remove('no-scroll');
  $('#fb-pick').focus();
}
function renderPicker() {
  const q = $('#pk-q').value.trim().toLowerCase();
  el.querySelectorAll('#pk-kind button').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === pickerKind));
  const groupsFor = kind => (kind === 'chord' ? CHORD_GROUPS : SCALE_GROUPS);
  // Match from the start of any word: "lyd" finds Lydian and Lydian dominant, not Mixolydian.
  const match = it => !q || ` ${it.name.toLowerCase().replace(/[()"]/g, ' ')}`.includes(' ' + q) || it.id.startsWith(q);
  const row = (kind, it) => {
    const fav = favs().includes(`${kind}:${it.id}`), cur = state.kind === kind && state.id === it.id;
    return `<li class="pk-row${cur ? ' current' : ''}">
      <button class="pk-pick" data-kind="${kind}" data-id="${it.id}"${cur ? ' aria-current="true"' : ''}><span class="nm">${esc(it.name)}</span><span class="fm">${esc(it.formula)}</span></button>
      <button class="pk-star" data-fav="${kind}:${it.id}" aria-pressed="${fav}" aria-label="${fav ? 'Remove' : 'Add'} ${esc(it.name)} ${fav ? 'from' : 'to'} favorites">${fav ? '★' : '☆'}</button></li>`;
  };
  const sections = [];
  const favItems = favs().filter(f => f.startsWith(pickerKind + ':')).map(f => lookup(pickerKind, f.split(':')[1])).filter(Boolean).filter(match);
  if (favItems.length) sections.push(['★ Favorites', favItems]);
  groupsFor(pickerKind).forEach(gp => { const items = gp.items.filter(match); if (items.length) sections.push([gp.name, items]); });
  let html = sections.map(([name, items]) => `<h4>${esc(name)}</h4><ul>${items.map(it => row(pickerKind, it)).join('')}</ul>`).join('');
  if (!sections.length) {
    const other = pickerKind === 'scale' ? 'chord' : 'scale';
    const n = groupsFor(other).flatMap(gp => gp.items).filter(match).length;
    html = `<p class="muted pk-empty">No ${pickerKind}s match "${esc(q)}".` +
      (n ? ` <button class="link-btn" id="pk-other">Show ${n} in ${other === 'chord' ? 'Chords' : 'Scales'}</button>` : '') + '</p>';
  }
  $('#pk-list').innerHTML = html;
  $('#pk-other')?.addEventListener('click', () => { pickerKind = pickerKind === 'scale' ? 'chord' : 'scale'; renderPicker(); });
}

/* ---------- Play it (same notes and timing as before; dots light as they sound) ---------- */
function playIt() {
  if (panel?.playIt?.(api())) return;
  const degs = parseFormula(current().formula), base = (getInstrument() === 'bass' ? 28 : 40) + ((state.key - 4 + 12) % 12), hand = base - (getInstrument() === 'bass' ? 28 : 40);
  if (state.kind === 'scale') {
    fb.playSequence([...degs.map(d => d.semi), 12].map(r => positionForMidi(base + r, hand)), { bpm: 60 / 0.32 });
  } else {
    const used = new Set();
    const shape = degs.map(d => { const p = positionForMidi(base + d.semi, hand, { avoid: used }); if (p) used.add(p.s); return p; }).filter(Boolean);
    fb.playSequence([shape, null, null, ...shape], { bpm: 60 / 0.35 });
  }
}

/* ---------- tab ---------- */
export default {
  id: 'fretboard',
  title: 'Fretboard',
  icon: '<path d="M3 7h18M3 12h18M3 17h18M8 5v14M14 5v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',

  mount(section) {
    el = section;
    panel = registered('fretboardPanel') || null;
    const fretOpts = Array.from({ length: FRETS + 1 }, (_, f) => `<option value="${f}">${f}</option>`).join('');
    el.innerHTML = `
      <div class="controls fb-main">
        <label>Key<select id="fb-key">${KEY_NAMES.map((k, i) => `<option value="${i}">${k}</option>`).join('')}</select></label>
        <div class="field grow"><span class="lbl">Scale or chord</span><button id="fb-pick" class="picker-btn" aria-haspopup="dialog"></button></div>
        <div class="field"><span class="lbl">Labels</span>
          <div class="seg" id="fb-labels" role="group" aria-label="Labels">
            <button data-l="notes">Notes</button><button data-l="intervals">Intervals</button><button data-l="none">Dots</button>
          </div></div>
        <div class="fb-actions">
          <button id="fb-play" class="primary">▶ Play it</button>
          <button id="fb-more" aria-expanded="false" aria-controls="fb-more-panel">More <span aria-hidden="true">▾</span></button>
        </div>
      </div>
      <div class="saved-row" id="fb-saved" hidden></div>
      <div id="fb-board"></div>
      <div class="info" id="fb-info"></div>
      ${legendHTML()}
      <div class="more" id="fb-more-panel" hidden>
        <section><h3>Position</h3>
          <div class="row"><label>From fret<select id="fb-from">${fretOpts}</select></label>
          <label>To fret<select id="fb-to">${fretOpts}</select></label>
          <button id="fb-whole">Whole neck</button></div></section>
        <section><h3>Scale over chord</h3><div class="row" id="fb-overlay"></div></section>
        <section><h3>Drone</h3>
          <div class="row"><button id="fb-drone" aria-pressed="false"></button>
          ${volumeHTML('droneVol', 'Drone volume')}</div></section>
        <section><h3>Weak spots</h3>
          <label class="check"><input type="checkbox" id="fb-heat"> Show my quiz weak spots</label>
          <div id="fb-heat-note" class="muted"></div></section>
        <section><h3>View</h3>
          <label class="check"><input type="checkbox" id="fb-left"> Left-handed</label>
          <label class="check"><input type="checkbox" id="fb-player"> Player's view (low E on top)</label></section>
        ${panel ? panel.html() : ''}
        <section><h3>Save this setup</h3>
          <div class="row"><label class="grow">Name<input type="text" id="fb-save-name" maxlength="40" placeholder="e.g. Blues in A, position 5"></label>
          <button id="fb-save" class="primary">Save</button></div>
          <div class="muted" id="fb-save-msg" aria-live="polite"></div></section>
      </div>
      <div class="picker" id="fb-picker" hidden>
        <div class="picker-backdrop" id="pk-backdrop"></div>
        <div class="picker-sheet" role="dialog" aria-modal="true" aria-label="Choose a scale or chord" tabindex="-1">
          <div class="picker-head">
            <input type="search" id="pk-q" placeholder="Search, e.g. lyd" aria-label="Search scales and chords" autocomplete="off">
            <button class="icon" id="pk-close" aria-label="Close">✕</button>
          </div>
          <div class="seg" id="pk-kind" role="group" aria-label="Scales or chords"><button data-k="scale">Scales</button><button data-k="chord">Chords</button></div>
          <div class="picker-list" id="pk-list"></div>
        </div>
      </div>`;

    const prefs = getFretboardPrefs();
    state = { ...DEFAULT, ...(prefs.last || {}) };
    if (!lookup(state.kind, state.id)) Object.assign(state, { kind: DEFAULT.kind, id: DEFAULT.id });
    fb = new Fretboard($('#fb-board'), { mode: 'show', view: [0, START_TO], ariaLabel: `${DEF.id === 'bass' ? 'Bass neck' : 'Fretboard'} showing the selected scale or chord` });

    const more = $('#fb-more-panel'), moreBtn = $('#fb-more');
    const setMore = open => { more.hidden = !open; moreBtn.setAttribute('aria-expanded', open); moreBtn.classList.toggle('on', open); };
    setMore(prefs.moreOpen);
    moreBtn.onclick = () => { const open = more.hidden; setMore(open); updateFretboardPrefs({ moreOpen: open }); };

    $('#fb-key').onchange = e => change({ key: +e.target.value, overlayRoot: null });
    el.querySelectorAll('#fb-labels button').forEach(b => b.onclick = () => change({ labels: b.dataset.l }));
    $('#fb-play').onclick = playIt;
    $('#fb-from').onchange = e => change({ from: +e.target.value });
    $('#fb-to').onchange = e => change({ to: +e.target.value });
    $('#fb-whole').onclick = () => change({ from: 0, to: FRETS });
    panel?.mount?.(api());
    $('#fb-heat').onchange = e => change({ heat: e.target.checked });
    $('#fb-left').onchange = e => change({ leftHanded: e.target.checked });
    $('#fb-player').onchange = e => change({ playerView: e.target.checked });
    $('#fb-drone').onclick = () => {
      if (droneOn() && startedDrone) { droneStop(); startedDrone = false; }
      else { droneStart(state.key); startedDrone = true; }
      paintDrone(spell(state.key, parseFormula(current().formula)));
    };
    $('#fb-save').onclick = saveSetup;
    $('#fb-save-name').onkeydown = e => { if (e.key === 'Enter') saveSetup(); };
    $('#fb-saved').onclick = e => {
      const setups = getFretboardPrefs().setups, load = e.target.closest('[data-load]'), del = e.target.closest('[data-del]');
      if (load) { const x = setups[+load.dataset.load]; const patch = {}; SETUP_KEYS.forEach(k => { if (k in x) patch[k] = x[k]; }); change(patch); }
      if (del) { updateFretboardPrefs({ setups: setups.filter((_, i) => i !== +del.dataset.del) }); renderSaved(); }
    };

    // picker
    $('#fb-pick').onclick = openPicker;
    $('#pk-close').onclick = closePicker;
    $('#pk-backdrop').onclick = closePicker;
    $('#pk-q').oninput = renderPicker;
    el.querySelectorAll('#pk-kind button').forEach(b => b.onclick = () => { pickerKind = b.dataset.k; renderPicker(); });
    $('#pk-list').onclick = e => {
      const star = e.target.closest('.pk-star'), pick = e.target.closest('.pk-pick');
      if (star) {
        const f = star.dataset.fav, list = favs();
        updateFretboardPrefs({ favorites: list.includes(f) ? list.filter(x => x !== f) : [...list, f] });
        renderPicker();
        $(`#pk-list .pk-star[data-fav="${f}"]`)?.focus(); // keep keyboard focus on the star
      } else if (pick) {
        change({ kind: pick.dataset.kind, id: pick.dataset.id });
        closePicker();
      }
    };
  },

  show(params) {
    const patch = {}, key = parseNote(params.get('key'));
    if (key != null) patch.key = key;
    if (params.has('chord') && lookup('chord', params.get('chord'))) Object.assign(patch, { kind: 'chord', id: lookup('chord', params.get('chord')).id });
    else if (params.has('scale') && lookup('scale', params.get('scale'))) Object.assign(patch, { kind: 'scale', id: lookup('scale', params.get('scale')).id });
    if (['notes', 'intervals', 'none'].includes(params.get('labels'))) patch.labels = params.get('labels');
    const pos = /^(\d+)-(\d+)$/.exec(params.get('pos') || '');
    if (pos) Object.assign(patch, { from: Math.min(FRETS, +pos[1]), to: Math.min(FRETS, +pos[2]) });
    if (Object.keys(patch).length) {
      if (patch.key != null || patch.id) patch.overlayRoot = null;
      // A link sets the view it describes: whole neck and default labels unless it says otherwise.
      change({ labels: 'notes', from: 0, to: START_TO, ...patch });
    } else { draw(); syncUrl(); }
  },

  hide() {
    fb.stopSequence();
    panel?.hide?.(api());
    if (startedDrone && droneOn()) droneStop();
    startedDrone = false;
    if (!$('#fb-picker').hidden) closePicker();
  }
};
