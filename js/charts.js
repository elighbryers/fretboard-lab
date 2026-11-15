// Small plain-SVG charts for the Progress tab. Each returns an SVG string drawn
// at the real pixel width (so text stays readable on phones). Every mark has a
// hit area with data-tip; the page shows that text when it's tapped or hovered.
import { esc } from './ui.js';

const svg = (w, h, body, label) =>
  `<svg class="chart-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">${body}</svg>`;
// Axis tops whose halves are whole numbers.
const niceMax = m => [4, 10, 20, 30, 40, 60, 90, 120, 180, 240].find(s => s >= m) || Math.ceil(m / 120) * 120;
const anchorAt = (i, n) => i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle';

// rows: [{ v, tip, label? }] -> bar chart from 0.
export function bars(rows, { width, height = 160, label }) {
  const L = 30, R = 2, T = 10, B = 24, pw = width - L - R, ph = height - T - B, base = T + ph;
  const max = niceMax(Math.max(1, ...rows.map(r => r.v)));
  const step = pw / rows.length, bw = Math.max(2, step - 2), y = v => base - v / max * ph;
  let out = '';
  [0, max / 2, max].forEach(v => {
    out += `<line class="ch-grid${v ? '' : ' base'}" x1="${L}" x2="${width - R}" y1="${y(v)}" y2="${y(v)}"/>`;
    out += `<text class="ch-axis" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
  });
  rows.forEach((r, i) => {
    const x = L + i * step + (step - bw) / 2;
    if (r.v > 0) {
      const top = y(r.v), rr = Math.min(4, bw / 2, base - top);
      out += `<path class="ch-bar" d="M${x},${base}V${top + rr}Q${x},${top} ${x + rr},${top}H${x + bw - rr}Q${x + bw},${top} ${x + bw},${top + rr}V${base}Z"/>`;
    }
    if (r.label) {
      const a = anchorAt(i, rows.length), lx = a === 'start' ? x : a === 'end' ? x + bw : x + bw / 2;
      out += `<text class="ch-axis" x="${lx}" y="${height - 6}" text-anchor="${a}">${esc(r.label)}</text>`;
    }
    out += `<rect class="ch-hit" x="${L + i * step}" y="${T}" width="${step}" height="${ph}" data-tip="${esc(r.tip)}"/>`;
  });
  return svg(width, height, out, label);
}

// rows: [{ v: 0..100 | null, tip, label? }] -> line chart; gaps where there's no data.
export function line(rows, { width, height = 160, label }) {
  const L = 38, R = 14, T = 18, B = 24, pw = width - L - R, ph = height - T - B, base = T + ph;
  const step = pw / rows.length, x = i => L + step * (i + 0.5), y = v => base - v / 100 * ph;
  let out = '';
  [0, 50, 100].forEach(v => {
    out += `<line class="ch-grid${v ? '' : ' base'}" x1="${L}" x2="${width - R}" y1="${y(v)}" y2="${y(v)}"/>`;
    out += `<text class="ch-axis" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}%</text>`;
  });
  let d = '';
  rows.forEach((r, i) => { if (r.v != null) d += `${i && rows[i - 1].v != null ? 'L' : 'M'}${x(i)},${y(r.v)}`; });
  if (d) out += `<path class="ch-line" d="${d}"/>`;
  rows.forEach((r, i) => {
    if (r.v != null) out += `<circle class="ch-dot" cx="${x(i)}" cy="${y(r.v)}" r="4"/>`;
    if (r.label) out += `<text class="ch-axis" x="${x(i)}" y="${height - 6}" text-anchor="${anchorAt(i, rows.length)}">${esc(r.label)}</text>`;
  });
  const last = rows.map((r, i) => [r, i]).filter(([r]) => r.v != null).pop();
  if (last) out += `<text class="ch-value" x="${x(last[1])}" y="${y(last[0].v) - 9}" text-anchor="${last[1] === rows.length - 1 ? 'end' : 'middle'}">${last[0].v}%</text>`;
  rows.forEach((r, i) => { out += `<rect class="ch-hit" x="${L + i * step}" y="${T - 10}" width="${step}" height="${ph + 10}" data-tip="${esc(r.tip)}"/>`; });
  return svg(width, height, out, label);
}

// weeks: [[{ day, level 0-4, future, tip }, x7 Monday first], ...] -> contribution-style grid.
export function calendarGrid(weeks, { width, label, month }) {
  const L = 30, T = 18, gap = 3, cell = Math.max(10, Math.min(20, Math.floor((width - L) / weeks.length) - gap));
  const pitch = cell + gap, w = L + weeks.length * pitch, h = T + 7 * pitch;
  let out = '', lastLabel = -3;
  ['Mon', '', 'Wed', '', 'Fri', '', ''].forEach((t, d) => { if (t) out += `<text class="ch-axis" x="0" y="${T + d * pitch + cell - 2}">${t}</text>`; });
  weeks.forEach((wk, c) => {
    const m = month(wk[0].day);
    if (c - lastLabel >= 3 && (c === 0 || m !== month(weeks[c - 1][0].day))) {
      out += `<text class="ch-axis" x="${L + c * pitch}" y="${T - 6}">${esc(m)}</text>`;
      lastLabel = c;
    }
    wk.forEach((d, r) => {
      if (d.future) return;
      out += `<rect class="cal cal-${d.level}" x="${L + c * pitch}" y="${T + r * pitch}" width="${cell}" height="${cell}" rx="3" data-tip="${esc(d.tip)}"/>`;
    });
  });
  return svg(w, h, out, label);
}

// A small trend line (no axes): values oldest first. The last point gets a dot.
export function spark(values, { width = 120, height = 32, label }) {
  if (!values.length) return '';
  const lo = Math.min(...values), hi = Math.max(...values), span = hi - lo || 1, pad = 4;
  const x = i => values.length === 1 ? width - pad : pad + i * (width - 2 * pad) / (values.length - 1);
  const y = v => height - pad - (v - lo) / span * (height - 2 * pad);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const last = values.length - 1;
  return svg(width, height, `${values.length > 1 ? `<path class="ch-line thin" d="${d}"/>` : ''}<circle class="ch-dot" cx="${x(last)}" cy="${y(values[last])}" r="3.5"/>`, label);
}
