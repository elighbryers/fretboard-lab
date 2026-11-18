// The piano keyboard view (docs/research-piano.md D1). Same shape as the Fretboard component,
// so the lesson player, drills and review can use it: a key is { s: 0, f: midi }.
//
//   const kb = new Keyboard(el, { view: [60, 72], mode: 'tap', onTap: ({ midi, pc, note }) => ... });
//   kb.setDots([{ s: 0, f: 60, label: 'R', role: 'root' }], rootPc);   // dots near the front of each key
//   kb.mark(0, 64, true); kb.highlight([{ s: 0, f: 67 }]); kb.playSequence([{ s: 0, f: 60 }, ...], { bpm });
//
// Keys are about 44 px wide on touch screens; the strip scrolls sideways inside its own box
// (the page never does), and scrolling is locked while a task is active (lock: true).
// Middle C (C4, MIDI 60) is always marked. Colors come from the --deg-* variables; every dot
// carries a label, and black-key dots get an outline. Finger numbers sit above the keys for the
// right hand and below for the left (never colour for hands). Multi-touch: Pointer Events per
// pointerId, touch-action none, pointercancel = pointerup, sliding across keys plays them (glissando).
import { NOTES, INTERVALS, pcOf, preferredName } from '../theory.js';
import { pluck, pluckAt, context, now } from '../audio.js';
import { roleOf } from '../fretboard.js';
import { midiOn, listenMidi } from '../midi.js';

// A MIDI keyboard plays into the keyboard on screen that's waiting for an answer (or the
// newest visible one), exactly like a tap, with the note's event time on the audio clock.
const live = new Set();
let midiStop = null;
export function routeMidi(midi, velocity, audioTime) {
  const shown = [...live].filter(k => k.wrap.isConnected && k.wrap.offsetParent !== null);
  const target = shown.reverse().find(k => k.o.mode === 'tap') || shown[0];
  target?._press(midi, { midi: true, velocity, audioTime });
  return !!target;
}
function ensureMidi() { if (!midiStop && midiOn()) midiStop = listenMidi({ onNote: routeMidi }); }

const BLACK = new Set([1, 3, 6, 8, 10]);
export const isBlack = midi => BLACK.has(pcOf(midi));
// The review item for a key (per instrument): 'key:F#' - the note's name, any octave.
export const keyItem = midi => `key:${preferredName(midi)}`;
export const nameOct = midi => `${preferredName(midi)}${Math.floor(midi / 12) - 1}`;
// White keys between two MIDI notes (inclusive).
export const whitesIn = (lo, hi) => { let n = 0; for (let m = lo; m <= hi; m++) if (!isBlack(m)) n++; return n; };

export class Keyboard {
  constructor(el, opts = {}) {
    this.o = {
      view: [48, 72],         // [lowest, highest] MIDI note shown
      labels: 'none',         // 'notes' | 'intervals' | 'none'
      mode: 'show',           // 'show' | 'tap' | 'sequence'
      playOnTap: true,
      onTap: null,
      focus: null,            // { keys: [lo, hi] } - keys outside are dimmed
      dimOutside: false,      // grey out keys without a dot (scales)
      fingers: null,          // { [midi]: { n: 1-5, hand: 'R' | 'L' } }
      bracket: null,          // { lo, hi, hand } five-finger hand position
      steps: false,           // W/H labels between neighbouring dots
      lock: false,            // no scrolling while a task is active
      keyWidth: null,         // px; default 44 on touch, fitted on desktop
      ariaLabel: 'Piano keyboard',
      ...opts
    };
    this.root = null; this.dots = []; this.marks = []; this.lit = []; this.heat = null; this._seq = 0; this.playing = false;
    this.down = new Map(); // pointerId -> midi
    this.wrap = document.createElement('div');
    this.wrap.className = 'kb-wrap';
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('role', 'group');
    this.wrap.appendChild(this.svg);
    el.appendChild(this.wrap);
    const keyAt = e => { const k = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('[data-midi]'); return k && this.svg.contains(k) ? +k.dataset.midi : null; };
    this.svg.addEventListener('pointerdown', e => {
      const k = e.target.closest('[data-midi]'); if (!k) return;
      e.preventDefault();
      try { this.svg.setPointerCapture?.(e.pointerId); } catch { }
      this.down.set(e.pointerId, +k.dataset.midi);
      this._press(+k.dataset.midi, e);
    });
    this.svg.addEventListener('pointermove', e => {
      if (!this.down.has(e.pointerId)) return;
      const m = keyAt(e);
      if (m != null && m !== this.down.get(e.pointerId)) { this.down.set(e.pointerId, m); this._press(m, e, true); }
    });
    const up = e => { this.down.delete(e.pointerId); };
    this.svg.addEventListener('pointerup', up);
    this.svg.addEventListener('pointercancel', up);
    this.svg.addEventListener('lostpointercapture', up);
    // keyboard access: Enter/Space on a focused key
    this.svg.addEventListener('keydown', e => {
      const k = e.target.closest?.('[data-midi]');
      if (k && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); this._press(+k.dataset.midi, e); }
    });
    live.add(this);
    ensureMidi();
    this.render();
  }

  set(opts) { Object.assign(this.o, opts); this.render(); return this; }
  setDots(dots, rootPc = null) { this.dots = dots.slice(); this.root = rootPc; this.render(); return this; }
  clear() { this.dots = []; this.marks = []; this.lit = []; this.root = null; this.render(); return this; }
  mark(s, f, ok, label, keep = false) { this.marks = [...(keep ? this.marks : []), { f, ok, label }]; this.render(); return this; }
  clearMarks() { this.marks = []; this.render(); return this; }
  setHeatmap(fn) { this.heat = fn; this.render(); return this; }
  highlight(keys) { this.lit = keys.map(k => (typeof k === 'number' ? k : k.f)); this.render(); return this; }
  stopSequence() { this._seq++; this.lit = []; this.playing = false; this.render(); }
  // Each step is one beat: a key { s, f }, an array of keys (a chord) or null (rest).
  playSequence(steps, { bpm = 120 } = {}) {
    const id = ++this._seq, beat = 60 / bpm, lead = 0.05, t0 = context() ? now() + lead : 0;
    this.playing = true;
    steps.forEach((step, i) => {
      if (!step) return;
      const group = Array.isArray(step) ? step : [step];
      group.forEach(p => pluckAt(p.f, t0 + i * beat));
      setTimeout(() => { if (this._seq === id) { this.lit = group.map(p => p.f); this.render(); this.scrollTo(group[0].f); } }, (lead + i * beat) * 1000);
    });
    return new Promise(done => setTimeout(() => { if (this._seq === id) { this.lit = []; this.playing = false; this.render(); } done(); }, (lead + steps.length * beat) * 1000));
  }
  // Scroll the strip so a key is in view (never while locked by a task... unless asked).
  scrollTo(midi, force = false) {
    if (this.o.lock && !force) return;
    const x = this._x?.(midi);
    if (x == null) return;
    const w = this.wrap.clientWidth;
    if (x < this.wrap.scrollLeft + 20 || x > this.wrap.scrollLeft + w - 60) this.wrap.scrollLeft = Math.max(0, x - w / 3);
  }

  _press(midi, e, glide = false) {
    if (this.o.mode === 'sequence' && this.playing) return;
    if (this.o.playOnTap) pluck(midi);
    this.svg.querySelectorAll(`[data-midi="${midi}"]`).forEach(k => { k.classList.remove('down'); void k.getBBox; k.classList.add('down'); setTimeout(() => k.classList.remove('down'), 160); });
    if (this.o.mode === 'tap' && this.o.onTap && !(glide && this.o.noGlideAnswers)) {
      const pc = pcOf(midi);
      this.o.onTap({ s: 0, f: midi, midi, pc, note: NOTES[pc], focused: this._focused(midi), name: nameOct(midi), event: e });
    }
  }
  _focused(m) { const fo = this.o.focus; return !fo || (m >= fo.keys[0] && m <= fo.keys[1]); }
  _label(d, pc) {
    if (d.label != null) return d.label;
    if (this.o.labels === 'notes') return preferredName(pc);
    if (this.o.labels === 'intervals') return this.root == null ? preferredName(pc) : INTERVALS[pcOf(pc - this.root)];
    return '';
  }

  render() {
    let [lo, hi] = this.o.view;
    if (isBlack(lo)) lo--; if (isBlack(hi)) hi++;
    const touch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
    const nW = whitesIn(lo, hi), avail = this.wrap.clientWidth || 360;
    const KW = this.o.keyWidth || (touch ? 44 : Math.max(26, Math.min(44, Math.floor(avail / nW)))), KH = Math.round(KW * 3.6), BW = Math.round(KW * 0.62), BH = Math.round(KH * 0.62);
    const TOP = 22, BOT = 36, H = TOP + KH + BOT, W = nW * KW;
    const xs = {}; let wx = 0;
    for (let m = lo; m <= hi; m++) { if (isBlack(m)) xs[m] = wx - BW / 2; else { xs[m] = wx; wx += KW; } }
    this._x = m => xs[m];
    const dotAt = new Map(this.dots.map(d => [d.f, d])), litSet = new Set(this.lit), markAt = new Map(this.marks.map(m => [m.f, m]));
    let whites = '', blacks = '', over = '';
    const keyCls = m => {
      let c = isBlack(m) ? 'kb-black' : 'kb-white';
      if (!this._focused(m) || (this.o.dimOutside && this.dots.length && !dotAt.has(m))) c += ' dim';
      if (litSet.has(m)) c += ' lit';
      return c;
    };
    const aria = m => `${nameOct(m)}${m === 60 ? ' (Middle C)' : ''}`;
    for (let m = lo; m <= hi; m++) {
      const b = isBlack(m), x = xs[m], w = b ? BW : KW, h = b ? BH : KH;
      const heat = this.heat ? this.heat(m) : null;
      const heatFill = heat == null ? '' : heat < 0 ? ' kb-heat-none' : '';
      const rect = `<rect class="${keyCls(m)}${heatFill}" data-midi="${m}" x="${x + (b ? 0 : 0.5)}" y="${TOP}" width="${w - (b ? 0 : 1)}" height="${h}" rx="${b ? 3 : 5}" tabindex="${this.o.mode === 'tap' ? 0 : -1}" role="button" aria-label="${aria(m)}"${heat != null && heat >= 0 ? ` style="fill:hsl(${Math.round(heat * 125)} 60% ${b ? 30 : 75}%)"` : ''}/>`;
      if (b) blacks += rect; else whites += rect;
      // Middle C: a small marker under the key
      if (m === 60) over += `<text class="kb-mid" x="${x + KW / 2}" y="${TOP + KH + 31}" text-anchor="middle">C4</text><circle class="kb-mid-dot" cx="${x + KW / 2}" cy="${TOP + KH - 8}" r="3"/>`;
      // the dot: near the front of the key
      const d = dotAt.get(m), mk = markAt.get(m), lit = litSet.has(m);
      const cx = x + w / 2, cy = TOP + h - (b ? 16 : 22), r = Math.min(15, w / 2 - 3);
      if (mk) {
        over += `<g class="fb-mark ${mk.ok ? 'good' : 'bad'}"><circle cx="${cx}" cy="${cy}" r="${r + 1}"/>` + (mk.ok
          ? `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="12">${mk.label ?? preferredName(m)}</text>`
          : `<path class="fb-x" d="M${cx - 5} ${cy - 5}L${cx + 5} ${cy + 5}M${cx + 5} ${cy - 5}L${cx - 5} ${cy + 5}"/>`) + '</g>';
      } else if (d || lit) {
        const dd = d || { f: m }, rel = this.root == null ? null : pcOf(m - this.root), role = dd.role || roleOf(rel);
        const lbl = dd.quiet && !lit ? '' : role === 'bare' ? '' : this._label(dd, pcOf(m)) || (rel == null ? preferredName(m) : INTERVALS[rel]);
        over += `<g class="fb-dot role-${role}${b ? ' on-black' : ''}${lit ? ' lit' : ''}${dd.ring ? ' ring' : ''}${dd.quiet && !lit ? ' quiet' : ''}"><circle cx="${cx}" cy="${cy}" r="${dd.quiet && !lit ? 6 : r}"/>` +
          (lbl ? `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="${String(lbl).length > 2 ? 10 : 12}">${lbl}</text>` : '') + '</g>';
      }
      // finger numbers: right hand above the keys, left hand below
      const fg = this.o.fingers?.[m];
      if (fg) over += `<text class="kb-finger ${fg.hand === 'L' ? 'lh' : 'rh'}" x="${x + w / 2}" y="${fg.hand === 'L' ? TOP + KH + 16 : TOP - 6}" text-anchor="middle">${fg.n}</text>`;
    }
    // W/H steps between neighbouring dots
    if (this.o.steps && this.dots.length > 1) {
      const ds = this.dots.map(d => d.f).sort((a, b) => a - b);
      ds.slice(1).forEach((m, i) => { const gap = m - ds[i]; if (gap === 1 || gap === 2) over += `<text class="kb-step" x="${(xs[m] + xs[ds[i]]) / 2 + KW / 2}" y="${TOP + KH + 16}" text-anchor="middle">${gap === 2 ? 'W' : 'H'}</text>`; });
    }
    // five-finger hand bracket
    const br = this.o.bracket;
    if (br && xs[br.lo] != null && xs[br.hi] != null) {
      const y = br.hand === 'L' ? TOP + KH + 4 : TOP - 4, x1 = xs[br.lo] + 4, x2 = xs[br.hi] + (isBlack(br.hi) ? BW : KW) - 4, dy = br.hand === 'L' ? 6 : -6;
      over += `<path class="kb-bracket" d="M${x1} ${y + dy}V${y}H${x2}V${y + dy}"/><text class="kb-finger" x="${(x1 + x2) / 2}" y="${y + dy * 2.6}" text-anchor="middle">${br.hand === 'L' ? 'LH' : 'RH'}</text>`;
    }
    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    this.svg.setAttribute('width', W);
    this.svg.setAttribute('height', H);
    this.svg.setAttribute('aria-label', this.o.ariaLabel);
    this.svg.classList.toggle('tappable', this.o.mode === 'tap' || this.o.playOnTap);
    this.wrap.classList.toggle('locked', !!this.o.lock);
    this.svg.innerHTML = whites + blacks + over;
  }
}

// A thin 88-key overview that shows (and drags) the window of a Keyboard's strip.
export function miniMap(el, kb, { lo = 21, hi = 108 } = {}) {
  const box = document.createElement('div');
  box.className = 'kb-mini';
  box.setAttribute('aria-hidden', 'true');
  el.prepend(box);
  const n = whitesIn(lo, hi);
  let html = '', wx = 0;
  for (let m = lo; m <= hi; m++) {
    if (isBlack(m)) html += `<i class="b" style="left:${(wx - 0.3) / n * 100}%"></i>`;
    else { html += `<i class="w${m === 60 ? ' c4' : ''}" style="left:${wx / n * 100}%;width:${100 / n}%"></i>`; wx++; }
  }
  box.innerHTML = html + '<b class="win"></b>';
  const win = box.querySelector('.win');
  const paint = () => {
    const [vlo, vhi] = kb.o.view, sw = kb.wrap.scrollWidth || 1, cw = kb.wrap.clientWidth || 1;
    const start = whitesIn(lo, vlo) - (isBlack(vlo) ? 0 : 1), span = whitesIn(vlo, vhi);
    const a = (start + span * kb.wrap.scrollLeft / sw) / n, b = a + span * Math.min(1, cw / sw) / n;
    win.style.left = a * 100 + '%'; win.style.width = Math.max(2, (b - a) * 100) + '%';
  };
  kb.wrap.addEventListener('scroll', paint);
  // drag on the map: scroll the strip (or move the view window when the strip is all shown)
  const drag = e => {
    const r = box.getBoundingClientRect(), f = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    const [vlo, vhi] = kb.o.view, sw = kb.wrap.scrollWidth, cw = kb.wrap.clientWidth;
    const start = whitesIn(lo, vlo) - (isBlack(vlo) ? 0 : 1), span = whitesIn(vlo, vhi), at = f * n - start;
    if (sw > cw) kb.wrap.scrollLeft = at / span * sw - cw / 2;
    else box.dispatchEvent(new CustomEvent('kbmove', { detail: { whiteIndex: Math.round(f * n) } }));
    paint();
  };
  let dragging = false;
  box.addEventListener('pointerdown', e => { if (kb.o.lock) return; dragging = true; box.setPointerCapture?.(e.pointerId); drag(e); });
  box.addEventListener('pointermove', e => dragging && drag(e));
  box.addEventListener('pointerup', () => { dragging = false; });
  box.addEventListener('pointercancel', () => { dragging = false; });
  paint();
  return { paint };
}
