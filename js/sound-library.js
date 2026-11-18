// The Sound choice for each instrument: the built-in synth or a recorded sample set.
// Sets live in sounds/<instrument>/<id>/ (made by tools/sounds/build.py from CC0 and public-domain
// libraries; js/sound-sets.js lists them). Only the chosen set downloads, after the first tap,
// and the synth plays until it has arrived. The service worker keeps every file it fetched, so
// a set works offline once it has been heard. Guitar has only the synth.
//
//   wireSound('bass', { apply: set => setVoice(set ? noteVoice(set) : bassVoice) });
//   soundPickerHTML('bass')   // a <select> that every copy keeps in sync (Fretboard More, Settings)
import { context } from './audio.js';
import { getSettings, setSetting } from './storage.js';
import { SOUND_SETS } from './sound-sets.js';
// (not ui.js's esc: that module needs a page, and the bass sound is unit-tested without one)
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const SYNTH = { id: 'synth', name: 'Synth', about: 'Made in the browser, nothing to download' };
// The piano's original sample set (sounds/piano/*.mp3, played by js/piano/sound.js with smplr).
const SALAMANDER = { id: 'salamander', name: 'Salamander Grand', about: 'Yamaha C5 grand', source: 'Alexander Holm', licence: 'CC BY 3.0 (credit required)' };
const DEFAULTS = { bass: 'growlybass', piano: 'salamander', drums: 'big-rusty' };

export const soundOptions = inst => [SYNTH, ...(inst === 'piano' ? [SALAMANDER] : []), ...(SOUND_SETS[inst] || [])];
export function chosenSound(inst) {
  const id = (getSettings().soundSets || {})[inst];
  return soundOptions(inst).some(o => o.id === id) ? id : DEFAULTS[inst] || 'synth';
}
const changed = new Set();
export function chooseSound(inst, id) {
  setSetting('soundSets', { ...(getSettings().soundSets || {}), [inst]: id });
  changed.forEach(fn => fn(inst, id));
}

/* ---------- loading ---------- */
const sets = new Map();   // 'bass/growlybass' -> Promise<{ meta, files }>
const status = {};        // inst -> 'loading' | 'ready' | 'failed'
function paintStatus(inst) {
  const id = chosenSound(inst), o = soundOptions(inst).find(x => x.id === id);
  const text = id === 'synth' || id === 'salamander' ? '' : status[inst] === 'loading' ? 'Downloading… the synth plays until it arrives.' : status[inst] === 'failed' ? "Couldn't download it, so the synth is playing." : o?.about || '';
  document.querySelectorAll(`[data-sound-status="${inst}"]`).forEach(x => { x.textContent = text; });
}

// Where the sound starts in a decoded file: MP3 decoders may add a little silence first.
export function onset(data, sampleRate) {
  let peak = 0;
  const n = Math.min(data.length, Math.round(sampleRate * 0.25));
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(data[i]));
  for (let i = 0; i < n; i++) if (Math.abs(data[i]) > peak * 0.03) return Math.max(0, i / sampleRate - 0.001);
  return 0;
}

export function loadSet(inst, id) {
  const key = `${inst}/${id}`;
  if (sets.has(key)) return sets.get(key);
  const base = new URL(`../sounds/${inst}/${id}/`, import.meta.url);
  const p = (async () => {
    const c = context();
    if (!c) throw new Error('no audio');
    const meta = await (await fetch(new URL('set.json', base))).json();
    const files = await Promise.all(meta.files.map(async f => {
      const res = await fetch(new URL(f.file, base));
      if (!res.ok) throw new Error(`${f.file}: ${res.status}`);
      const buf = await c.decodeAudioData(await res.arrayBuffer());
      return { ...f, buf, off: onset(buf.getChannelData(0), buf.sampleRate) };
    }));
    return { meta, files };
  })();
  sets.set(key, p);
  p.catch(() => sets.delete(key));
  return p;
}

/* ---------- players ---------- */
// A pitched set: the nearest sample, repitched (sets have one every 3 semitones).
// Layer 0 is the normal touch; a volume above 1 (an accent) picks the harder layer.
export function noteVoice(set, level = 0.9) {
  const layers = [...new Set(set.files.map(f => f.layer))].sort();
  const byLayer = layers.map(l => set.files.filter(f => f.layer === l));
  return (midi, t, volume, out) => {
    const c = context();
    const list = byLayer[volume > 1 && byLayer.length > 1 ? byLayer.length - 1 : 0];
    const f = list.reduce((a, b) => (Math.abs(b.midi - midi) < Math.abs(a.midi - midi) ? b : a));
    const src = c.createBufferSource(), g = c.createGain();
    src.buffer = f.buf;
    src.playbackRate.value = 2 ** ((midi - f.midi) / 12);
    g.gain.value = level * Math.min(1.2, volume);
    src.connect(g).connect(out);
    src.start(t, f.off);
    return t;
  };
}
// A drum kit: { piece: [soft, hard] }. Pieces the kit doesn't have return false (the synth plays them).
export function kitVoice(set, level = 1) {
  const pieces = {};
  set.files.forEach(f => { (pieces[f.piece] ||= [])[f.layer] = f; });
  return (piece, t, velocity, bus) => {
    const ls = pieces[piece];
    if (!ls) return false;
    const f = (velocity >= 0.9 && ls[1]) || ls[0] || ls[1];
    const c = context(), src = c.createBufferSource(), g = c.createGain();
    src.buffer = f.buf;
    g.gain.value = level * Math.min(1.2, velocity);
    src.connect(g).connect(bus);
    src.start(t, f.off);
    return true;
  };
}

// Load the chosen set after the first tap (audio needs a gesture) and whenever the choice
// changes. apply(set | null): null means "use the synth" (also while a set downloads).
// special: choices handled by the instrument itself (the piano's Salamander).
export function wireSound(inst, { apply, special = {} }) {
  let gen = 0;
  const go = async () => {
    const id = chosenSound(inst), mine = ++gen;
    if (special[id]) { apply(null); special[id](); status[inst] = 'ready'; paintStatus(inst); return; }
    apply(null);
    if (id === 'synth') { paintStatus(inst); return; }
    status[inst] = 'loading'; paintStatus(inst);
    try {
      const set = await loadSet(inst, id);
      if (mine !== gen) return;
      apply(set); status[inst] = 'ready';
    } catch (e) {
      console.warn(`The ${id} sound could not load; using the synth.`, e);
      status[inst] = 'failed';
    }
    paintStatus(inst);
  };
  const first = () => { window.removeEventListener('pointerdown', first, true); window.removeEventListener('keydown', first, true); go(); };
  window.addEventListener('pointerdown', first, true);
  window.addEventListener('keydown', first, true);
  changed.add(i => { if (i === inst) go(); });
}

/* ---------- the picker ---------- */
export const hasSoundChoice = inst => soundOptions(inst).length > 1;
export const soundPickerHTML = inst => !hasSoundChoice(inst) ? '' : `<label class="sound-pick">Sound<select data-sound="${inst}">${soundOptions(inst).map(o =>
  `<option value="${o.id}"${o.id === chosenSound(inst) ? ' selected' : ''}>${esc(o.name)}</option>`).join('')}</select></label>
  <small class="muted sound-status" data-sound-status="${inst}" aria-live="polite"></small>`;
if (typeof document !== 'undefined') document.addEventListener('change', e => {
  const inst = e.target.dataset?.sound;
  if (!inst) return;
  chooseSound(inst, e.target.value);
  document.querySelectorAll(`[data-sound="${inst}"]`).forEach(x => { if (x !== e.target) x.value = e.target.value; });
  paintStatus(inst);
});
// Fill in the status line next to freshly drawn pickers.
export const paintSoundStatus = inst => paintStatus(inst);

// The About page: every sound set with its licence.
export function soundCreditsHTML() {
  const rows = [['Piano', SALAMANDER], ...Object.entries(SOUND_SETS).flatMap(([inst, list]) => list.map(s => [inst[0].toUpperCase() + inst.slice(1), s]))];
  return `<ul class="credits">${rows.map(([inst, s]) => `<li><b>${esc(s.name)}</b> (${esc(inst.toLowerCase())}): ${esc(s.about)}. ${esc(s.source)}, ${esc(s.licence)}.</li>`).join('')}</ul>`;
}
