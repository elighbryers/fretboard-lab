// Bass tools on the Fretboard tab (docs/research-bass.md D1): tuning, one-finger-per-fret
// boxes, the chord-tone view, the root-5-octave shape, approach tones into a target chord
// and "line over chart" (a looping chord chart; the neck lights the current chord's tones
// and the next chord's root flashes on beat 4).
import { lookup, parseFormula, spell, pcOf, midiAt, NOTES } from '../theory.js';
import { INSTRUMENT_DEFS, itemNum } from '../instruments.js';
import { getTuningId, setTuningId, activeTuning } from '../storage.js';
import { metronome } from '../audio.js';
import { chordOf } from '../progressions.js';
import { esc } from '../ui.js';
import { groove } from '../groove.js';

// Each box: the scale and which finger plays the root on the lowest E string
// (finger 1 = the box starts at the root's fret, finger 2 = one fret below it).
export const BOXES = [
  { id: 'major', name: 'Major', finger: 2 },
  { id: 'minor', name: 'Natural minor', finger: 1 },
  { id: 'major-pentatonic', name: 'Major pentatonic', finger: 2 },
  { id: 'minor-pentatonic', name: 'Minor pentatonic', finger: 1 },
  { id: 'blues', name: 'Blues', finger: 1 },
  { id: 'mixolydian', name: 'Mixolydian', finger: 2 },
  { id: 'dorian', name: 'Dorian', finger: 1 }
];
// The 4-fret window [from, to] of a box in a key on this neck: the root on the E string
// (item number 4), moved up an octave if the box would start below the nut.
export function boxWindow(keyPc, box, tuning = activeTuning()) {
  const e = tuning.strings.findIndex((_, s) => itemNum(tuning, s) === 4);
  let root = pcOf(keyPc - tuning.strings[e].midi);
  const start = () => root - (box.finger - 1);
  if (start() < 1 && root < 12) root += 12;
  return { from: start(), to: start() + 3, rootFret: root, string: e };
}

const TONE_CHORDS = ['major', 'minor', '7', 'maj7', 'm7', 'm7b5', 'dim'];
const CHARTS = {
  'I-IV-V-I': ['I', 'IV', 'V', 'I'],
  'I-V-vi-IV': ['I', 'V', 'vi', 'IV'],
  'ii-V-I-I': ['ii7', 'V7', 'Imaj7', 'Imaj7'],
  '12-bar blues': ['I7', 'IV7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7']
};
const VIEWS = [['scale', 'Scale or chord (as above)'], ['box', 'One-finger-per-fret box'], ['tones', 'Chord tones (R 3 5 7)'],
  ['r58', 'Root-5th-octave shape'], ['approach', 'Approach tones into a chord'], ['chart', 'Line over chart']];

let view = 'scale', box = 'minor-pentatonic', tones = '7', chart = 'I-IV-V-I', running = null, chartBar = 0, flash = false;

// Chord tones of a chord as dots on the whole neck (R 3 5 7 in the color code).
function chordDots(rootPc, chordId, api, extra = {}) {
  const t = activeTuning(), degs = parseFormula(lookup('chord', chordId).formula), sp = spell(rootPc, degs);
  const byPc = new Map(degs.map((d, k) => [pcOf(rootPc + d.semi), { label: api.state.labels === 'notes' ? sp.notes[k] : d.label, role: d.role }]));
  const out = [];
  t.strings.forEach((str, s) => { for (let f = 0; f <= api.FRETS; f++) { const x = byPc.get(pcOf(str.midi + f)); if (x) out.push({ s, f, ...x, ...extra }); } });
  return out;
}

export default {
  html() {
    const t = getTuningId() || 'standard';
    return `<section><h3>Bass</h3>
      <div class="row"><label>Tuning<select id="bp-tuning">${Object.entries(INSTRUMENT_DEFS.bass.tunings).map(([id, x]) =>
        `<option value="${id}"${id === t ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label></div>
      <div class="row"><label class="grow">Bass view<select id="bp-view">${VIEWS.map(([v, n]) => `<option value="${v}">${n}</option>`).join('')}</select></label></div>
      <div class="row" id="bp-opts"></div>
      <p class="muted small" id="bp-note"></p></section>`;
  },

  mount(api) {
    const $ = s => api.el.querySelector(s);
    $('#bp-tuning').onchange = e => { setTuningId(e.target.value === 'standard' ? null : e.target.value); location.reload(); };
    $('#bp-view').onchange = e => { this.stop(); view = e.target.value; this.enter(api); };
  },

  // Switching views sets up the key/scale/range the view needs.
  enter(api) {
    if (view === 'box') { const b = BOXES.find(x => x.id === box), w = boxWindow(api.state.key, b); api.change({ kind: 'scale', id: box, from: Math.max(0, w.from), to: w.to }); }
    else if (view === 'tones') api.change({ kind: 'chord', id: tones, labels: api.state.labels === 'none' ? 'intervals' : api.state.labels, from: 0, to: api.START_TO });
    else api.change({});
  },

  paint(api) {
    const $ = s => api.el.querySelector(s), opts = $('#bp-opts'), note = $('#bp-note');
    if (!opts) return;
    $('#bp-view').value = view;
    const sel = (id, items, val) => `<select id="${id}">${items.map(([v, n]) => `<option value="${v}"${v === val ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
    const key = spell(api.state.key, '1').root;
    if (view === 'box') {
      opts.innerHTML = `<label>Box${sel('bp-box', BOXES.map(b => [b.id, b.name]), box)}</label>`;
      const b = BOXES.find(x => x.id === box);
      note.textContent = `One finger per fret: your ${b.finger === 1 ? 'first' : 'second'} finger plays the root, ${key}, on the E string. Each finger covers one of the four lit frets.`;
      $('#bp-box').onchange = e => { box = e.target.value; this.enter(api); };
    } else if (view === 'tones') {
      opts.innerHTML = `<label>Chord${sel('bp-tones', TONE_CHORDS.map(c => [c, lookup('chord', c).name]), tones)}</label>`;
      note.textContent = 'On bass a chord is played one note at a time. These are its chord tones everywhere on the neck: an arpeggio is any path through them.';
      $('#bp-tones').onchange = e => { tones = e.target.value; this.enter(api); };
    } else if (view === 'r58') {
      opts.innerHTML = '';
      note.textContent = `Root on the E or A string; the 5th is one string up and two frets up, the octave two strings up and two frets up. The 5th below sits on the same fret, one string down.`;
    } else if (view === 'approach') {
      opts.innerHTML = '';
      note.textContent = `Approach notes lead into ${key}: a half step below or above the root (½), or the chord's 5th (V) just before it. Play one on beat 4, land on the root on beat 1.`;
    } else if (view === 'chart') {
      opts.innerHTML = `<label>Chart${sel('bp-chart', Object.keys(CHARTS).map(c => [c, c]), chart)}</label>
        <button class="primary" id="bp-go">${running ? '■ Stop' : '▶ Start chart'}</button><span class="now-chord" id="bp-now"></span>`;
      note.textContent = 'The chart loops with drums. The neck shows the current chord\'s tones; the next chord\'s root flashes on beat 4.';
      $('#bp-chart').onchange = e => { chart = e.target.value; if (running) this.start(api); else api.change({}); };
      $('#bp-go').onclick = () => { running ? this.stop() : this.start(api); api.change({}); };
      this.paintNow(api);
    } else { opts.innerHTML = ''; note.textContent = ''; }
  },

  // The dots for the bass views that aren't a plain scale or chord (null = draw as usual).
  dots(api) {
    const t = activeTuning(), key = api.state.key;
    if (view === 'r58') {
      const out = [], lab = (l, n) => (api.state.labels === 'notes' ? n : l);
      const names = spell(key, '1 5').notes;
      t.strings.forEach((str, s) => {
        if (s < 2) return; // roots on the lower strings only, so the octave fits two strings up
        for (let f = 0; f <= api.FRETS - 2; f++) if (pcOf(str.midi + f) === pcOf(key)) {
          out.push({ s, f, role: 'root', label: lab('R', names[0]) });
          out.push({ s: s - 1, f: f + 2, role: 'fifth', label: lab('5', names[1]) });
          out.push({ s: s - 2, f: f + 2, role: 'root', label: lab('R', names[0]) });
          if (s + 1 < t.strings.length && f >= 0) out.push({ s: s + 1, f, role: 'fifth', label: lab('5', names[1]) });
        }
      });
      return dedupe(out);
    }
    if (view === 'approach') {
      const chordId = api.state.kind === 'chord' ? api.state.id : 'major';
      const out = chordDots(key, ['major', 'minor', '7', 'maj7', 'm7'].includes(chordId) ? chordId : 'major', api);
      const below = pcOf(key - 1), above = pcOf(key + 1), names = { [below]: '½', [above]: '½' };
      t.strings.forEach((str, s) => { for (let f = 0; f <= api.FRETS; f++) {
        const pc = pcOf(str.midi + f);
        if (pc in names) out.push({ s, f, role: 'other', label: api.state.labels === 'notes' ? spell(key, pc === below ? '1 7' : '1 b2').notes[1] : '½', ring: true });
      } });
      // the 5th (V) is already a chord tone; mark it as an approach too (ring)
      return out.map(d => (d.label === '5' || (api.state.labels === 'notes' && pcOf(midiAt(d.s, d.f, t)) === pcOf(key + 7)) ? { ...d, ring: true } : d));
    }
    if (view === 'chart') {
      const list = CHARTS[chart].map(r => chordOf(keyName(api), r)), c = list[chartBar % list.length];
      const out = chordDots(c.root, c.chord, api);
      if (flash) {
        const nx = list[(chartBar + 1) % list.length];
        t.strings.forEach((str, s) => { for (let f = 0; f <= api.FRETS; f++) if (pcOf(str.midi + f) === pcOf(nx.root)) out.push({ s, f, role: 'root', label: '→', ring: true }); });
      }
      return dedupe(out);
    }
    return null;
  },

  paintNow(api) {
    const el = api.el.querySelector('#bp-now');
    if (!el) return;
    const list = CHARTS[chart].map(r => chordOf(keyName(api), r)), c = list[chartBar % list.length], nx = list[(chartBar + 1) % list.length];
    el.innerHTML = running ? `Now: <b>${esc(c.name)}</b> · next <b>${esc(nx.name)}</b>` : `Chart: ${list.map(x => esc(x.name)).join(' · ')}`;
  },

  start(api) {
    this.stop();
    const list = CHARTS[chart].map(r => chordOf(keyName(api), r));
    chartBar = 0; flash = false;
    groove.start({ style: 'rock8', bpm: metronome.bpm || 80, chords: list });
    running = metronome.listen((beat, t, bar) => {
      chartBar = bar; flash = beat === 3;
      api.change({});
    });
  },
  stop() { if (running) { running(); running = null; groove.stop(); } flash = false; },
  hide() { this.stop(); }
};

function dedupe(dots) {
  const seen = new Set();
  return dots.filter(d => { const k = d.s + ':' + d.f; if (seen.has(k) || d.s < 0) return false; seen.add(k); return true; });
}
export const _test = { CHARTS, NOTES };
const keyName = api => spell(api.state.key, '1').root;
