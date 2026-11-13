// Fretboard tab: free play. Pick a key and a scale or chord, see it, hear it.
// Accepts #fretboard?key=G&scale=major (or chord=m7) and &labels=intervals.
import { NOTES, KEY_NAMES, INTERVALS, SCALES, CHORDS, SCALE_SLUGS, CHORD_SLUGS, slugOf, parseNote, positionForMidi } from '../theory.js';
import { Fretboard, legendHTML } from '../fretboard.js';
import { replaceParams } from '../router.js';
import { getSettings, setSetting } from '../storage.js';

const state = { root: 9, kind: 'scale', type: 'Minor pentatonic', labels: 'notes' };
let fb, el;
const $ = sel => el.querySelector(sel);
const formula = () => (state.kind === 'scale' ? SCALES : CHORDS)[state.type];

function fillTypes() {
  const t = $('#fb-type'), list = state.kind === 'scale' ? SCALES : CHORDS;
  t.innerHTML = '';
  Object.keys(list).forEach(k => t.add(new Option(k, k)));
  if (!(state.type in list)) state.type = t.options[0].value;
  t.value = state.type;
}

function draw() {
  $('#fb-root').value = state.root;
  $('#fb-kind').value = state.kind;
  fillTypes();
  $('#fb-labels').value = state.labels;
  fb.set({ labels: state.labels });
  fb.showSet(state.root, formula());
  const set = formula();
  $('#fb-info').innerHTML = `<b>${NOTES[state.root]} ${state.type.toLowerCase()}</b>: ${set.map(r => NOTES[(state.root + r) % 12]).join('  ')}` +
    `<small>Formula: ${set.map(r => INTERVALS[r]).join('  ')}</small>`;
}

function syncUrl() {
  const kindSlug = slugOf(state.kind === 'scale' ? SCALE_SLUGS : CHORD_SLUGS, state.type);
  replaceParams('fretboard', { key: NOTES[state.root], [state.kind]: kindSlug, labels: state.labels === 'notes' ? null : state.labels });
}

function change() { draw(); syncUrl(); }

// Same notes and timing as the original "Play it": a scale goes up one octave
// from the low E string; a chord is strummed, then arpeggiated. Each dot now
// lights as it sounds.
function playIt() {
  const set = formula(), base = 40 + ((state.root - 4 + 12) % 12), hand = base - 40;
  if (state.kind === 'scale') {
    const steps = [...set, 12].map(r => positionForMidi(base + r, hand));
    fb.playSequence(steps, { bpm: 60 / 0.32 });
  } else {
    const used = new Set();
    const shape = set.map(r => { const p = positionForMidi(base + r, hand, { avoid: used }); used.add(p.s); return p; });
    // strum on beat 0, then the arpeggio 0.35s apart (starts at 1.05s; the original used 1.2s)
    fb.playSequence([shape, null, null, ...shape], { bpm: 60 / 0.35 });
  }
}

export default {
  id: 'fretboard',
  title: 'Fretboard',
  icon: '<path d="M3 7h18M3 12h18M3 17h18M8 5v14M14 5v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',

  mount(section) {
    el = section;
    el.innerHTML = `
      <div class="controls">
        <label>Key<select id="fb-root"></select></label>
        <label>Show<select id="fb-kind"><option value="scale">Scale</option><option value="chord">Chord</option></select></label>
        <label>Type<select id="fb-type"></select></label>
        <label>Labels<select id="fb-labels"><option value="notes">Note names</option><option value="intervals">Intervals</option><option value="none">Dots only</option></select></label>
        <button id="fb-play" class="primary">▶ Play it</button>
      </div>
      <div id="fb-board"></div>
      <div class="info" id="fb-info"></div>
      ${legendHTML()}`;
    KEY_NAMES.forEach((k, i) => $('#fb-root').add(new Option(k, i)));
    state.labels = getSettings().labels;
    fb = new Fretboard($('#fb-board'), { mode: 'show', labels: state.labels, ariaLabel: 'Fretboard showing the selected scale or chord' });
    $('#fb-root').onchange = e => { state.root = +e.target.value; change(); };
    $('#fb-kind').onchange = e => { state.kind = e.target.value; change(); };
    $('#fb-type').onchange = e => { state.type = e.target.value; change(); };
    $('#fb-labels').onchange = e => { state.labels = e.target.value; setSetting('labels', state.labels); change(); };
    $('#fb-play').onclick = playIt;
  },

  show(params) {
    const key = parseNote(params.get('key'));
    if (key != null) state.root = key;
    if (params.has('chord') && CHORD_SLUGS[params.get('chord')]) { state.kind = 'chord'; state.type = CHORD_SLUGS[params.get('chord')]; }
    else if (params.has('scale') && SCALE_SLUGS[params.get('scale')]) { state.kind = 'scale'; state.type = SCALE_SLUGS[params.get('scale')]; }
    if (['notes', 'intervals', 'none'].includes(params.get('labels'))) state.labels = params.get('labels');
    draw();
  },

  hide() { fb.stopSequence(); }
};
