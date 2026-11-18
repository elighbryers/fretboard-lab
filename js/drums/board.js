// The kit as a lesson board: the same API as the Fretboard and the Keyboard, so the lesson player,
// review and drills can use it. A pad is { s: 0, f: index in KIT } (js/drums/kit.js).
import { KIT, LIMBS } from './kit.js';
import { hit } from '../drumkit.js';
import { context, now } from '../audio.js';
import { esc } from '../ui.js';

export const padIndex = id => KIT.findIndex(p => p.id === id);
export class PadBoard {
  constructor(el, opts = {}) {
    this.o = { mode: 'show', playOnTap: true, onTap: null, view: null, ...opts };
    this.dots = []; this.marks = []; this.lit = []; this._seq = 0; this.playing = false;
    this.wrap = document.createElement('div');
    this.wrap.className = 'padboard';
    el.appendChild(this.wrap);
    this.wrap.addEventListener('pointerdown', e => {
      const b = e.target.closest('[data-f]'); if (!b) return;
      e.preventDefault();
      const f = +b.dataset.f, p = KIT[f];
      if (this.o.playOnTap) hit(p.id);
      if (this.o.mode === 'tap') this.o.onTap?.({ s: 0, f, piece: p.id, focused: true });
    });
    this.render();
  }
  set(o) { Object.assign(this.o, o); this.render(); return this; }
  setDots(d) { this.dots = d.slice(); this.render(); return this; }
  clear() { this.dots = []; this.marks = []; this.lit = []; this.render(); return this; }
  mark(s, f, ok, label, keep = false) { this.marks = [...(keep ? this.marks : []), { f, ok, label }]; this.render(); return this; }
  clearMarks() { this.marks = []; this.render(); return this; }
  setHeatmap() { return this; }
  highlight(list) { this.lit = list.map(x => (typeof x === 'number' ? x : x.f)); this.render(); return this; }
  stopSequence() { this._seq++; this.lit = []; this.playing = false; this.render(); }
  // Each step is a pad { s, f }, a list of pads (together) or null (rest); one step per beat.
  playSequence(steps, { bpm = 100 } = {}) {
    const id = ++this._seq, beat = 60 / bpm, t0 = context() ? now() + 0.05 : 0;
    this.playing = true;
    steps.forEach((st, i) => {
      if (!st) return;
      const group = Array.isArray(st) ? st : [st];
      group.forEach(p => hit(KIT[p.f].id, t0 + i * beat, 0.8));
      setTimeout(() => { if (this._seq === id) { this.lit = group.map(p => p.f); this.render(); } }, (0.05 + i * beat) * 1000);
    });
    return new Promise(done => setTimeout(() => { if (this._seq === id) { this.lit = []; this.playing = false; this.render(); } done(); }, (0.05 + steps.length * beat) * 1000));
  }
  render() {
    const dot = new Map(this.dots.map(d => [d.f, d])), mark = new Map(this.marks.map(m => [m.f, m])), lit = new Set(this.lit);
    const show = this.dots.length ? KIT.map((_, i) => i) : KIT.map((_, i) => i);
    this.wrap.innerHTML = `<div class="kit pb-kit" role="group" aria-label="Drum kit">${show.map(i => {
      const p = KIT[i], d = dot.get(i), m = mark.get(i);
      return `<button class="pad pb-pad${d ? ' has' : ''}${lit.has(i) ? ' lit' : ''}${m ? (m.ok ? ' good' : ' bad') : ''}" data-f="${i}" aria-label="${esc(p.name)}">
        <b>${esc(p.name)}</b><span class="limb limb-${p.limb}">${esc(d?.label || p.limb)}</span>${m && !m.ok ? '<span class="pb-x" aria-label="wrong">✕</span>' : ''}</button>`;
    }).join('')}</div>`;
  }
}
export const _L = LIMBS;
