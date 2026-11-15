// Speed trainer and clean-tempo helpers, shared by lesson Play steps and the
// play-along player. Based on Duke, Simmons & Cash 2009: clean repetitions
// predict progress, so the tempo only goes up after several clean runs in a row.
//
// The trainer works in whatever unit it's given (bpm or tempo %):
//   const t = new SpeedTrainer({ start: 60, end: 90, step: 5 });
//   t.pass(true)  -> { tempo, change: 'same' | 'up' | 'down' | 'goal' }
// Clean run: count it; after `needClean` clean runs in a row, go up a step (or reach the goal).
// Missed run: back down a step (never below the start), and the count starts again.
// No imports, so the trainer logic can be unit-tested outside the browser.
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export class SpeedTrainer {
  constructor({ start, end, step, needClean = 3 }) {
    this.start = Math.min(start, end); this.end = Math.max(start, end); this.step = Math.max(1, step);
    this.needClean = needClean; this.tempo = this.start; this.cleanRun = 0; this.runs = 0; this.reached = false;
  }
  pass(clean) {
    this.runs++;
    if (!clean) {
      this.cleanRun = 0;
      const t = Math.max(this.start, this.tempo - this.step), change = t < this.tempo ? 'down' : 'same';
      this.tempo = t;
      return { tempo: t, change };
    }
    this.cleanRun++;
    if (this.cleanRun < this.needClean) return { tempo: this.tempo, change: 'same' };
    this.cleanRun = 0;
    if (this.tempo >= this.end) { this.reached = true; return { tempo: this.tempo, change: 'goal' }; }
    this.tempo = Math.min(this.end, this.tempo + this.step);
    return { tempo: this.tempo, change: 'up' };
  }
}

// The trainer's setup row and running status, as HTML. unit: 'bpm' or '%'.
export function trainerSetupHTML({ unit, start, end, steps, step, min, max }) {
  const opts = (from, to, by, sel) => { let o = ''; for (let v = from; v <= to; v += by) o += `<option value="${v}"${v === sel ? ' selected' : ''}>${v}${unit === '%' ? '%' : ''}</option>`; return o; };
  const by = unit === '%' ? 5 : 2;
  return `
    <div class="trainer-setup">
      <label>Start<select data-tr="start">${opts(min, max, by, start)}</select></label>
      <label>Goal<select data-tr="end">${opts(min, max, by, end)}</select></label>
      <label>Step<select data-tr="step">${steps.map(v => `<option value="${v}"${v === step ? ' selected' : ''}>${v}${unit === '%' ? '%' : ' bpm'}</option>`).join('')}</select></label>
      <button class="primary" data-tr="go">Start trainer</button>
    </div>
    <p class="muted small">It speeds up after 3 clean runs in a row and slows down a step when you tap <b>Missed it</b>.</p>`;
}

export function trainerStatusHTML(t, unit, note = '') {
  const u = v => (unit === '%' ? `${v}%` : `${v} bpm`);
  return `<span class="tr-now">${u(t.tempo)}</span>
    <span class="tr-dots" aria-label="${t.cleanRun} of ${t.needClean} clean runs">${Array.from({ length: t.needClean }, (_, i) => `<i class="${i < t.cleanRun ? 'on' : ''}"></i>`).join('')}</span>
    <span class="muted small">goal ${u(t.end)}${note ? ' · ' + esc(note) : ''}</span>`;
}
