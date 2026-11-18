// The Keyboard tab (replaces the Fretboard tab when Piano is the instrument). Free play with
// the same color code: key, scale or chord, labels, Play it; under More: range (61 or 88 keys),
// W/H steps, fingering (show RH / LH / both), inversions side by side, voice leading,
// left-hand patterns, scale over chord, drone and the heat map (docs/research-piano.md D1).
// Links: #fretboard?key=G&scale=major (the same links as the guitar Fretboard tab).
import { KEY_NAMES, SCALE_GROUPS, CHORD_GROUPS, lookup, parseFormula, spell, parseNote, pcOf, preferredName } from '../theory.js';
import { Keyboard, miniMap, nameOct, keyItem } from './keyboard.js';
import { legendHTML } from '../fretboard.js';
import { droneStart, droneStop, droneOn, metronome, pluckAt, context, now } from '../audio.js';
import { replaceParams } from '../router.js';
import { allItems, getFretboardPrefs, updateFretboardPrefs } from '../storage.js';
import { volumeHTML, esc } from '../ui.js';
import { inversions, voiceLead, moves, LH_PATTERNS, lhBar } from './voicing.js';
import { scaleFingering } from './fingering.js';
import { chordOf } from '../progressions.js';

const DEFAULT = { key: 0, kind: 'scale', id: 'major', labels: 'intervals', range: 'auto', steps: false, hands: 'none', heat: false, lh: 'broken', overlayChord: '' };
let el, kb, st, voiceTimer = [], lhOff = null, startedDrone = false;
const $ = s => el.querySelector(s);
const opt = (v, n, cur) => `<option value="${v}"${String(v) === String(cur) ? ' selected' : ''}>${esc(n)}</option>`;
const current = () => lookup(st.kind, st.id) || lookup('scale', 'major');

// The default window: a focus octave on phones in portrait, ~2.5 octaves in landscape, 61 keys on desktop.
export function defaultRange(width = window.innerWidth) {
  if (width < 520) return [60, 76];
  if (width < 1000) return [48, 84];
  return [36, 96];
}
const range = () => (st.range === '88' ? [21, 108] : st.range === '61' ? [36, 96] : defaultRange());

function draw() {
  const item = current(), degs = parseFormula(item.formula), sp = spell(st.key, degs), [lo, hi] = range();
  const byPc = new Map(degs.map((d, k) => [pcOf(st.key + d.semi), { label: d.label, role: d.role, name: sp.notes[k] }]));
  let chord = null;
  if (st.kind === 'scale' && st.overlayChord) { const c = lookup('chord', st.overlayChord); chord = new Map(parseFormula(c.formula).map(d => [pcOf(st.key + d.semi), d])); }
  const dots = [];
  for (let m = lo; m <= hi; m++) {
    const x = byPc.get(pcOf(m));
    if (!x) continue;
    const lbl = st.labels === 'notes' ? x.name : st.labels === 'intervals' ? x.label : '';
    if (chord) { const c = chord.get(pcOf(m)); dots.push(c ? { s: 0, f: m, role: c.role, label: st.labels === 'none' ? '' : st.labels === 'notes' ? x.name : c.label } : { s: 0, f: m, role: 'other', quiet: true }); }
    else dots.push(st.labels === 'none' ? { s: 0, f: m, role: 'bare', ring: x.role === 'root' } : { s: 0, f: m, role: x.role, label: lbl });
  }
  const fing = st.kind === 'scale' && st.hands !== 'none' ? scaleFingering(st.key, st.id, st.hands) : null;
  kb.set({ view: [lo, hi], dimOutside: st.kind === 'scale', steps: st.steps, fingers: fing?.map || null });
  kb.setHeatmap(st.heat ? heat() : null);
  kb.setDots(dots, st.key);
  $('#kt-key').value = st.key;
  $('#kt-item').value = `${st.kind}:${st.id}`;
  el.querySelectorAll('#kt-labels button').forEach(b => b.setAttribute('aria-pressed', b.dataset.l === st.labels));
  $('#kt-info').innerHTML = `<b>${esc(sp.root)} ${esc(item.name)}</b>: ${sp.notes.map(esc).join('  ')}<small>Formula: ${esc(item.formula)}</small>` +
    (fing ? `<small>${esc(fing.note)}</small>` : st.hands !== 'none' && st.kind === 'scale' ? '<small>Fingering is shown for C, G, D, A, E and F major and A minor (checked against standard scale fingerings).</small>' : '');
  $('#kt-range').value = st.range; $('#kt-steps').checked = st.steps; $('#kt-hands').value = st.hands; $('#kt-heat').checked = st.heat; $('#kt-lh').value = st.lh;
  $('#kt-ov').value = st.overlayChord; $('#kt-ov').disabled = st.kind !== 'scale';
  paintInversions(sp.root);
  replaceParams('fretboard', { key: sp.root, [st.kind]: st.id, labels: st.labels === 'intervals' ? null : st.labels });
  updateFretboardPrefs({ pianoLast: { ...st } });
  setTimeout(() => kb.scrollTo(60 + pcOf(st.key), true), 0);
}
const heat = () => { const items = allItems(); return m => { const it = items[keyItem(m)]; return it ? it.correct / it.attempts : null; }; };
const change = patch => { Object.assign(st, patch); draw(); };

// Root position, 1st and 2nd inversion side by side, with R/3/5 labels.
function paintInversions(rootName) {
  const box = $('#kt-inv');
  if (st.kind !== 'chord' || !['major', 'minor', 'dim', 'aug', 'sus2', 'sus4'].includes(st.id)) { box.innerHTML = '<p class="muted small">Pick a triad (major, minor, diminished…) to see its inversions.</p>'; return; }
  const inv = inversions(st.key, st.id, 60), degs = parseFormula(lookup('chord', st.id).formula);
  box.innerHTML = ['Root position', '1st inversion', '2nd inversion'].map((n, i) => `<div class="kt-inv"><b>${n}</b><div data-inv="${i}"></div></div>`).join('');
  inv.forEach((v, i) => {
    const k = new Keyboard(box.querySelector(`[data-inv="${i}"]`), { view: [v[0] - (v[0] % 12 === 0 ? 0 : 0), v[2]], keyWidth: 24, ariaLabel: `${rootName} ${n(i)}` });
    k.setDots(v.map(m => { const d = degs.find(x => pcOf(st.key + x.semi) === pcOf(m)); return { s: 0, f: m, role: d.role, label: d.label }; }), st.key);
    box.querySelector(`[data-inv="${i}"]`).onclick = () => v.forEach((m, j) => pluckAt(m, now() + 0.02 + j * 0.03));
  });
  function n(i) { return ['root position', '1st inversion', '2nd inversion'][i]; }
}

// I-IV-V-I with the nearest voicing: common tones stay lit, moving notes slide.
function playVoiceLeading() {
  voiceTimer.forEach(clearTimeout); voiceTimer = [];
  const keyName = spell(st.key, '1').root, chords = ['I', 'IV', 'V', 'I'].map(r => chordOf(keyName, r)), vl = voiceLead(chords, 60);
  const label = (c, m) => { const d = parseFormula(lookup('chord', c.chord).formula).find(x => pcOf(c.root + x.semi) === pcOf(m)); return { role: d?.role || 'other', label: d?.label || '' }; };
  kb.set({ dimOutside: false, fingers: null, steps: false });
  kb.scrollTo(60, true);
  vl.forEach((v, i) => voiceTimer.push(setTimeout(() => {
    const c = chords[i], mv = i ? moves(vl[i - 1], v) : { stay: [], pairs: [] };
    kb.setDots(v.map(m => ({ s: 0, f: m, ...label(c, m), ring: mv.stay.includes(m) })), c.root);
    v.forEach(m => pluckAt(m, now() + 0.02));
    $('#kt-vl-msg').innerHTML = `<b>${esc(c.name)}</b> (${c.roman})${i ? ` · ${mv.stay.map(nameOct).join(', ') || 'no note'} stays (outlined), ${mv.pairs.map(([a, b]) => `${nameOct(a)} → ${nameOct(b)}`).join(', ')} move` : ''}`;
    if (i) slide(mv.pairs);
  }, i * 1300)));
  voiceTimer.push(setTimeout(draw, vl.length * 1300 + 600));
}
// Moving keys slide from where they were to the nearest new chord tone.
function slide(pairs) {
  const svg = kb.svg, ns = 'http://www.w3.org/2000/svg';
  pairs.forEach(([a, b]) => {
    const xa = kb._x(a), xb = kb._x(b);
    if (xa == null || xb == null) return;
    const g = document.createElementNS(ns, 'circle');
    g.setAttribute('class', 'kb-ghost'); g.setAttribute('cx', xa + 18); g.setAttribute('cy', 40); g.setAttribute('r', 8);
    g.style.transition = 'transform .6s ease'; svg.appendChild(g);
    requestAnimationFrame(() => { g.style.transform = `translateX(${xb - xa}px)`; });
    setTimeout(() => g.remove(), 900);
  });
}

// The left-hand pattern menu: loop the key's I-IV-V-I with the chosen pattern on the metronome.
function toggleLH() {
  if (lhOff) { lhOff(); lhOff = null; metronome.stop(); $('#kt-lh-go').textContent = '▶ Play pattern'; return; }
  const keyName = spell(st.key, '1').root, chords = ['I', 'IV', 'V', 'I'].map(r => chordOf(keyName, r));
  const spb = () => 60 / metronome.bpm;
  const off = metronome.schedule((beat, t, bar) => {
    if (beat !== 0) return;
    const c = chords[bar % chords.length];
    lhBar(st.lh, c.root, c.chord).forEach(e => e.midis.forEach(m => pluckAt(m, t + e.beat * spb(), 0.8)));
  });
  lhOff = off;
  metronome.beatsPerBar = 4; metronome.subdiv = 1;
  metronome.start();
  $('#kt-lh-go').textContent = '■ Stop';
}

export default {
  id: 'fretboard', title: 'Keyboard',
  icon: '<path d="M3 5h18v14H3zM8 5v9M13 5v9M18 5v9M6.5 5v6M11 5v0" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  mount(section) {
    el = section;
    st = { ...DEFAULT, ...(getFretboardPrefs().pianoLast || {}) };
    const groups = (kind, gs) => gs.map(g => `<optgroup label="${esc(g.name)} ${kind === 'chord' ? 'chords' : 'scales'}">${g.items.map(i => opt(`${kind}:${i.id}`, i.name, '')).join('')}</optgroup>`).join('');
    el.innerHTML = `
      <div class="controls fb-main">
        <label>Key<select id="kt-key">${KEY_NAMES.map((k, i) => opt(i, k, st.key)).join('')}</select></label>
        <label class="grow">Scale or chord<select id="kt-item">${groups('scale', SCALE_GROUPS)}${groups('chord', CHORD_GROUPS)}</select></label>
        <div class="field"><span class="lbl">Labels</span><div class="seg" id="kt-labels" role="group" aria-label="Labels">
          <button data-l="notes">Notes</button><button data-l="intervals">Intervals</button><button data-l="none">Dots</button></div></div>
        <div class="fb-actions"><button id="kt-play" class="primary">▶ Play it</button>
          <button id="kt-more" aria-expanded="false">More <span aria-hidden="true">▾</span></button></div>
      </div>
      <div id="kt-board" class="kt-board"></div>
      <div class="info" id="kt-info"></div>
      ${legendHTML()}
      <div class="more" id="kt-more-panel" hidden>
        <section><h3>Keys</h3><div class="row"><label>Range<select id="kt-range">${opt('auto', 'Fit this screen', '')}${opt('61', '61 keys (C2–C7)', '')}${opt('88', '88 keys', '')}</select></label></div>
          <label class="check"><input type="checkbox" id="kt-steps"> Show whole (W) and half (H) steps</label></section>
        <section><h3>Fingering</h3><div class="row"><label>Show<select id="kt-hands">${opt('none', 'No fingering', '')}${opt('RH', 'Right hand (above)', '')}${opt('LH', 'Left hand (below)', '')}${opt('both', 'Both hands', '')}</select></label></div>
          <p class="muted small">Only the thumb crossings are marked, plus the first finger: that's all you need to remember.</p></section>
        <section><h3>Inversions</h3><div id="kt-inv" class="kt-invs"></div></section>
        <section><h3>Voice leading</h3><p class="muted small">I–IV–V–I in this key, each chord moving to its nearest notes.</p>
          <button id="kt-vl">▶ Play I–IV–V–I</button><p class="small" id="kt-vl-msg" aria-live="polite"></p></section>
        <section><h3>Left-hand pattern</h3><div class="row"><label>Pattern<select id="kt-lh">${Object.entries(LH_PATTERNS).map(([k, n]) => opt(k, n, '')).join('')}</select></label>
          <button id="kt-lh-go">▶ Play pattern</button></div>${volumeHTML('metroVol', 'Click volume')}</section>
        <section><h3>Scale over chord</h3><div class="row"><label>Chord on the root<select id="kt-ov">${opt('', 'Off', '')}${['major', 'minor', '7', 'maj7', 'm7'].map(c => opt(c, lookup('chord', c).name, '')).join('')}</select></label></div></section>
        <section><h3>Drone</h3><div class="row"><button id="kt-drone">▶ Drone on the key</button>${volumeHTML('droneVol', 'Drone volume')}</div></section>
        <section><h3>Weak spots</h3><label class="check"><input type="checkbox" id="kt-heat"> Show my key finder weak spots</label></section>
      </div>`;
    kb = new Keyboard($('#kt-board'), { view: range(), labels: st.labels, ariaLabel: 'Piano keyboard showing the selected scale or chord' });
    miniMap($('#kt-board'), kb);
    $('#kt-key').onchange = e => change({ key: +e.target.value });
    $('#kt-item').onchange = e => { const [kind, id] = e.target.value.split(':'); change({ kind, id }); };
    el.querySelectorAll('#kt-labels button').forEach(b => b.onclick = () => change({ labels: b.dataset.l }));
    $('#kt-more').onclick = () => { const p = $('#kt-more-panel'); p.hidden = !p.hidden; $('#kt-more').setAttribute('aria-expanded', !p.hidden); };
    $('#kt-range').onchange = e => change({ range: e.target.value });
    $('#kt-steps').onchange = e => change({ steps: e.target.checked });
    $('#kt-hands').onchange = e => change({ hands: e.target.value });
    $('#kt-heat').onchange = e => change({ heat: e.target.checked });
    $('#kt-lh').onchange = e => { st.lh = e.target.value; if (lhOff) { toggleLH(); toggleLH(); } };
    $('#kt-ov').onchange = e => change({ overlayChord: e.target.value });
    $('#kt-vl').onclick = playVoiceLeading;
    $('#kt-lh-go').onclick = toggleLH;
    $('#kt-drone').onclick = () => { if (droneOn() && startedDrone) { droneStop(); startedDrone = false; } else { droneStart(st.key, 3); startedDrone = true; } };
    $('#kt-play').onclick = () => {
      const degs = parseFormula(current().formula), base = 60 + pcOf(st.key);
      const keys = [...degs.map(d => base + d.semi), ...(st.kind === 'scale' ? [base + 12] : [])].map(f => ({ s: 0, f }));
      kb.playSequence(st.kind === 'scale' ? keys : [keys, null, ...keys], { bpm: 190 });
    };
  },
  show(params) {
    const key = parseNote(params.get('key')), patch = {};
    if (key != null) patch.key = key;
    if (params.has('chord') && lookup('chord', params.get('chord'))) Object.assign(patch, { kind: 'chord', id: lookup('chord', params.get('chord')).id });
    else if (params.has('scale') && lookup('scale', params.get('scale'))) Object.assign(patch, { kind: 'scale', id: lookup('scale', params.get('scale')).id });
    if (['notes', 'intervals', 'none'].includes(params.get('labels'))) patch.labels = params.get('labels');
    change(patch);
  },
  hide() {
    kb?.stopSequence(); voiceTimer.forEach(clearTimeout);
    if (lhOff) toggleLH();
    if (startedDrone && droneOn()) droneStop();
    startedDrone = false;
  }
};
export const _ctx = context;
