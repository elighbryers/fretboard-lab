// The shared fretboard component. Every screen that shows a neck uses this.
//
//   const fb = new Fretboard(containerEl, { view: [0, 5], labels: 'intervals', mode: 'tap', onTap });
//   fb.showSet(rootPc, SCALES.Major);        // dots for a scale/chord, colored by degree
//   fb.setDots([{ s: 5, f: 3 }], rootPc);    // or any explicit positions
//   fb.mark(s, f, true);                     // green/red answer feedback
//   fb.setHeatmap((s, f) => score0to1);      // per-position overlay
//   fb.playSequence([{s,f}, [{s,f},{s,f}], null], { bpm: 120 });  // light + sound in time
//
// Strings are indexed high to low like tab: s = 0 is the top line (high e).
import { TUNINGS, NOTES, INTERVALS, pcOf, midiAt } from './theory.js';
import { pluck, pluckAt, context, now } from './audio.js';

/* ---------- the one color code ----------
   Which degrees get which role lives here; the colors themselves are the
   --deg-* variables in css/styles.css. Both 3rds share the 3rd color. */
export const ROLES = [
  { id: 'root', label: 'Root', semitones: [0] },
  { id: 'third', label: '3rd', semitones: [3, 4] },
  { id: 'fifth', label: '5th', semitones: [7] },
  { id: 'other', label: 'Other notes', semitones: [] }
];
export const roleOf = rel => (rel == null ? 'other' : (ROLES.find(r => r.semitones.includes(pcOf(rel))) || ROLES[3]).id);

export function legendHTML() {
  return '<div class="legend">' + ROLES.map(r =>
    `<span><i class="sw role-${r.id}"></i>${r.label}</span>`).join('') + '</div>';
}

/* ---------- geometry ---------- */
const TOP = 36, GAP = 40, INLAYS = [3, 5, 7, 9, 15, 17, 19, 21], DOUBLE = [12, 24];
const dist = n => 1 - Math.pow(2, -n / 12); // real fret spacing

// A full neck uses a 1000-unit-wide drawing that scrolls on phones. A short
// range (a lesson's frets 0–5) gets a narrower drawing so it fits the screen
// at a tappable size instead of shrinking.
function geometry(from, to, nStrings) {
  const open = from === 0, first = Math.max(1, from);
  const NUT = open ? 64 : 40;
  const columns = to - first + 1 + (open ? 1 : 0), wide = columns >= 12;
  const W = wide ? 1000 : NUT + (to - first + 1) * 76 + 20, END = W - 20;
  const d0 = dist(first - 1), span = dist(to) - d0;
  const fx = n => NUT + (END - NUT) * (dist(n) - d0) / span;          // x of fret wire n
  const cx = n => (n === 0 ? NUT - 30 : (fx(n - 1) + fx(n)) / 2);     // middle of fret n
  const cellX = n => (n === 0 ? [NUT - 58, NUT] : [fx(n - 1), fx(n)]);
  const sy = s => TOP + s * GAP;
  const H = sy(nStrings - 1) + 44;
  return { open, first, NUT, END, W, wide, fx, cx, cellX, sy, H };
}

export class Fretboard {
  constructor(el, opts = {}) {
    this.o = {
      tuning: TUNINGS.standard,
      view: [0, 15],          // frets drawn: [from, to]
      labels: 'notes',        // 'notes' | 'intervals' | 'none'
      mode: 'show',           // 'show' | 'tap' | 'sequence'
      playOnTap: true,
      onTap: null,            // mode 'tap': ({ s, f, midi, pc, note, string, focused }) => void
      focus: null,            // { frets: [a, b], strings: [indexes] } - everything else is dimmed
      ariaLabel: 'Guitar fretboard',
      ...opts
    };
    this.root = null;
    this.dots = [];
    this.marks = [];
    this.lit = [];
    this.heat = null;
    this._seq = 0;
    this.playing = false;

    this.wrap = document.createElement('div');
    this.wrap.className = 'board-wrap';
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('role', 'img');
    this.wrap.appendChild(this.svg);
    el.appendChild(this.wrap);
    this.svg.addEventListener('click', e => this._click(e));
    this.render();
  }

  set(opts) { Object.assign(this.o, opts); this.render(); return this; }

  // Dots for every position of a scale/chord. `formula` = semitones above root.
  showSet(rootPc, formula) {
    const [from, to] = this.o.view, set = formula.map(pcOf);
    this.root = rootPc;
    this.dots = [];
    this.o.tuning.strings.forEach((str, s) => {
      for (let f = from; f <= to; f++) if (set.includes(pcOf(str.midi + f - rootPc))) this.dots.push({ s, f });
    });
    this.render();
    return this;
  }

  // Explicit dots: [{ s, f, label?, role? }]. Pass rootPc to get degree colors and interval labels.
  setDots(dots, rootPc = null) { this.dots = dots.slice(); this.root = rootPc; this.render(); return this; }
  clear() { this.dots = []; this.marks = []; this.lit = []; this.root = null; this.render(); return this; }

  // Answer feedback on one dot. keep = true adds to the marks already shown.
  mark(s, f, ok, label, keep = false) { this.marks = [...(keep ? this.marks : []), { s, f, ok, label }]; this.render(); return this; }
  clearMarks() { this.marks = []; this.render(); return this; }

  // fn(s, f) -> 0..1 (or null for no data); pass null to remove.
  setHeatmap(fn) { this.heat = fn; this.render(); return this; }

  // Each step is one beat: a position, an array of positions (strummed), or null (rest).
  // Each dot lights at the moment its note sounds. Resolves when finished.
  playSequence(steps, { bpm = 120, strum = 0.04 } = {}) {
    const id = ++this._seq, beat = 60 / bpm, lead = 0.05, t0 = context() ? now() + lead : 0;
    this.playing = true;
    steps.forEach((step, i) => {
      if (!step) return;
      const group = Array.isArray(step) ? step : [step], start = lead + i * beat;
      group.forEach((p, j) => pluckAt(midiAt(p.s, p.f, this.o.tuning), t0 + i * beat + j * strum));
      setTimeout(() => { if (this._seq === id) { this.lit = group; this.render(); } }, start * 1000);
    });
    const total = (lead + steps.length * beat) * 1000;
    return new Promise(done => setTimeout(() => {
      if (this._seq === id) { this.lit = []; this.playing = false; this.render(); }
      done();
    }, total));
  }
  // Light positions without sound (e.g. following a metronome); [] to clear.
  highlight(positions) { this.lit = positions.slice(); this.render(); return this; }
  stopSequence() { this._seq++; this.lit = []; this.playing = false; this.render(); }

  /* ---------- internals ---------- */
  _focused(s, f) {
    const fo = this.o.focus;
    if (!fo) return true;
    return (!fo.frets || (f >= fo.frets[0] && f <= fo.frets[1])) && (!fo.strings || fo.strings.includes(s));
  }

  _label(dot, pc) {
    if (dot.label != null) return dot.label;
    if (this.o.labels === 'notes') return NOTES[pc];
    if (this.o.labels === 'intervals') return this.root == null ? NOTES[pc] : INTERVALS[pcOf(pc - this.root)];
    return '';
  }

  _click(e) {
    const h = e.target.closest('.hit');
    if (!h) return;
    if (this.o.mode === 'sequence' && this.playing) return;
    const s = +h.dataset.s, f = +h.dataset.f, midi = midiAt(s, f, this.o.tuning), pc = pcOf(midi);
    if (this.o.playOnTap) pluck(midi);
    if (this.o.mode === 'tap' && this.o.onTap) {
      this.o.onTap({ s, f, midi, pc, note: NOTES[pc], string: this.o.tuning.strings[s], focused: this._focused(s, f) });
    }
  }

  render() {
    const { tuning, view: [from, to], mode } = this.o, strings = tuning.strings, n = strings.length;
    const g = geometry(from, to, n), { fx, cx, cellX, sy, NUT, END, W, H } = g;
    const inView = f => f >= from && f <= to;
    let out = '';

    // plain board, landmark inlays, frets, nut, strings
    out += `<rect class="fb-board" x="${g.open ? NUT : fx(g.first - 1)}" y="${TOP - 16}" width="${END - (g.open ? NUT : fx(g.first - 1))}" height="${sy(n - 1) - TOP + 32}" rx="4"/>`;
    const mid = (sy(0) + sy(n - 1)) / 2;
    INLAYS.filter(f => f >= g.first && f <= to).forEach(f => out += `<circle class="fb-inlay" cx="${cx(f)}" cy="${mid}" r="6"/>`);
    DOUBLE.filter(f => f >= g.first && f <= to).forEach(f =>
      out += `<circle class="fb-inlay" cx="${cx(f)}" cy="${(sy(0) + mid) / 2}" r="6"/><circle class="fb-inlay" cx="${cx(f)}" cy="${(mid + sy(n - 1)) / 2}" r="6"/>`);
    for (let f = g.first; f <= to; f++) out += `<line class="fb-fret" x1="${fx(f)}" x2="${fx(f)}" y1="${TOP - 16}" y2="${sy(n - 1) + 16}"/>`;
    if (g.open) out += `<rect class="fb-nut" x="${NUT - 5}" y="${TOP - 16}" width="7" height="${sy(n - 1) - TOP + 32}"/>`;
    else out += `<line class="fb-fret" x1="${fx(g.first - 1)}" x2="${fx(g.first - 1)}" y1="${TOP - 16}" y2="${sy(n - 1) + 16}"/>`;
    strings.forEach((str, s) => {
      out += `<line class="fb-string" x1="${g.open ? NUT - 40 : fx(g.first - 1)}" x2="${END}" y1="${sy(s)}" y2="${sy(s)}" stroke-width="${1 + s * 0.45}"/>`;
      out += `<text class="fb-text" x="2" y="${sy(s) + 5}" font-size="14">${str.name}</text>`;
    });
    for (let f = from; f <= to; f++) out += `<text class="fb-text" x="${cx(f)}" y="${sy(n - 1) + 42}" text-anchor="middle" font-size="13">${f}</text>`;

    // heat map cells
    if (this.heat) strings.forEach((_, s) => { for (let f = from; f <= to; f++) {
      const v = this.heat(s, f);
      if (v == null) continue;
      const [x0, x1] = cellX(f), hue = Math.round(Math.max(0, Math.min(1, v)) * 125);
      out += `<rect class="fb-heat" x="${x0 + 2}" y="${sy(s) - GAP / 2 + 2}" width="${x1 - x0 - 4}" height="${GAP - 4}" rx="6" fill="hsl(${hue} 65% 45%)"/>`;
    } });

    // dim what isn't the point
    const fo = this.o.focus;
    if (fo) {
      const [x0] = cellX(from), x1 = END;
      strings.forEach((_, s) => { if (fo.strings && !fo.strings.includes(s)) out += `<rect class="fb-dim" x="${x0}" y="${sy(s) - GAP / 2}" width="${x1 - x0}" height="${GAP}"/>`; });
      if (fo.frets) for (let f = from; f <= to; f++) if (f < fo.frets[0] || f > fo.frets[1]) {
        const [a, b] = cellX(f);
        out += `<rect class="fb-dim" x="${a}" y="${TOP - 18}" width="${b - a}" height="${sy(n - 1) - TOP + 36}"/>`;
      }
    }

    // dots, then lit (sequence) dots, then answer marks
    const dot = (d, extra) => {
      const pc = pcOf(midiAt(d.s, d.f, tuning)), rel = this.root == null ? null : pcOf(pc - this.root);
      const role = d.role || roleOf(rel), lbl = this._label(d, pc);
      const dim = this._focused(d.s, d.f) ? '' : ' dim';
      return `<g class="fb-dot role-${role}${dim}${extra}"><circle cx="${cx(d.f)}" cy="${sy(d.s)}" r="15"/>` +
        (lbl ? `<text x="${cx(d.f)}" y="${sy(d.s) + 5}" text-anchor="middle" font-size="13">${lbl}</text>` : '') + '</g>';
    };
    const key = p => p.s + ':' + p.f, litKeys = new Set(this.lit.map(key));
    this.dots.filter(d => inView(d.f) && !litKeys.has(key(d))).forEach(d => out += dot(d, ''));
    this.lit.filter(d => inView(d.f)).forEach(d => out += dot(this.dots.find(x => key(x) === key(d)) || d, ' lit'));
    this.marks.filter(m => inView(m.f)).forEach(m => {
      const pc = pcOf(midiAt(m.s, m.f, tuning));
      out += `<g class="fb-mark ${m.ok ? 'good' : 'bad'}"><circle cx="${cx(m.f)}" cy="${sy(m.s)}" r="16"/>` +
        `<text x="${cx(m.f)}" y="${sy(m.s) + 5}" text-anchor="middle" font-size="13">${m.label ?? NOTES[pc]}</text></g>`;
    });

    // whole-cell tap targets
    strings.forEach((_, s) => { for (let f = from; f <= to; f++) {
      const [a, b] = cellX(f);
      out += `<rect class="hit" data-s="${s}" data-f="${f}" x="${a}" y="${sy(s) - GAP / 2}" width="${b - a}" height="${GAP}"/>`;
    } });

    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    this.svg.setAttribute('aria-label', this.o.ariaLabel);
    this.svg.classList.toggle('wide', g.wide);
    this.svg.style.maxWidth = g.wide ? '' : Math.round(W * 1.4) + 'px';
    this.svg.classList.toggle('tappable', mode === 'tap' || this.o.playOnTap);
    this.svg.innerHTML = out;
  }
}
