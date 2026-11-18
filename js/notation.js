// Notation (shared piece C): abcjs 6.6.4 (MIT, vendored in js/vendor/, loaded on first use
// only, so guitar users never download it). Bass clef for bass, treble/bass/grand staff for
// piano, and the drum staff (percussion clef) for drums all go through here.
//   await renderAbc(host, abcText, { scale, staffwidth })
// abcText is ABC notation; toAbc* helpers build it from the app's own data.
import { NOTES } from './theory.js';

let loading = null;
export function loadAbc() {
  if (window.ABCJS) return Promise.resolve(window.ABCJS);
  if (!loading) loading = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = new URL('./vendor/abcjs-basic-min.js', import.meta.url).href;
    s.onload = () => res(window.ABCJS);
    s.onerror = () => { loading = null; rej(new Error('notation library did not load')); };
    document.head.appendChild(s);
  });
  return loading;
}

// Draw ABC into host. Returns the abcjs tune object (or null if the library can't load).
export async function renderAbc(host, abc, opts = {}) {
  try {
    const A = await loadAbc();
    const width = Math.max(260, (host.clientWidth || 340) - 8);
    return A.renderAbc(host, abc, { responsive: 'resize', add_classes: true, staffwidth: opts.staffwidth || width, paddingleft: 0, paddingright: 0, scale: opts.scale || 1, foregroundColor: 'currentColor', ...opts.abcjs })[0];
  } catch {
    host.innerHTML = '<p class="muted small">Notation could not load. The tab and grid still work.</p>';
    return null;
  }
}

/* ---------- pure helpers (tested in tests/notation.test.mjs) ---------- */
// A MIDI note as an ABC pitch, spelled with sharps or flats: 60 -> 'C', 48 -> 'C,', 72 -> 'c', 61 -> '^C' or '_D'.
export function abcPitch(midi, preferFlats = false) {
  const FLAT = ['C', '_D', 'D', '_E', 'E', 'F', '_G', 'G', '_A', 'A', '_B', 'B'];
  const SHARP = ['C', '^C', 'D', '^D', 'E', 'F', '^F', 'G', '^G', 'A', '^A', 'B'];
  const pc = ((midi % 12) + 12) % 12, oct = Math.floor(midi / 12) - 1; // MIDI 60 = C4
  let name = (preferFlats ? FLAT : SHARP)[pc];
  const acc = name.length > 1 ? name[0] : '', letter = name.slice(-1);
  if (oct >= 5) return acc + letter.toLowerCase() + "'".repeat(oct - 5);
  return acc + letter + ','.repeat(4 - oct);
}
// A length in quarter-note beats as an ABC length with L:1/8: 1 -> '2', .5 -> '', 2 -> '4', 1.5 -> '3', .25 -> '/2', 1/3 (triplet) -> '2/3'.
export function abcLen(beats) {
  const eighths = beats * 2;
  if (Math.abs(eighths - 1) < 1e-6) return '';
  if (Math.abs(eighths - Math.round(eighths)) < 1e-6) return String(Math.round(eighths));
  if (Math.abs(eighths * 2 - Math.round(eighths * 2)) < 1e-6) { const h = Math.round(eighths * 2); return h === 1 ? '/2' : `${h}/2`; }
  const thirds = Math.round(eighths * 3);
  return `${thirds}/3`;
}
// Notes [{ midi | null, beats, chord? }] in bars -> an ABC tune body with bar lines.
// clef: 'bass' | 'treble'; chord symbols in quotes above.
export function toAbc(notes, { time = [4, 4], clef = 'treble', title = '', key = 'C', preferFlats = false, bpm } = {}) {
  const bar = time[0] * 4 / time[1];
  let out = `X:1\n${title ? `T:${title}\n` : ''}M:${time[0]}/${time[1]}\nL:1/8\n${bpm ? `Q:1/4=${bpm}\n` : ''}K:${key} clef=${clef}\n`, pos = 0, line = 0;
  // Accidentals last to the end of the bar in ABC, so a natural after a sharp needs '='.
  let seen = new Map();
  for (const n of notes) {
    let p = n.midi == null ? 'z' : abcPitch(n.midi, preferFlats);
    if (n.midi != null) {
      const acc = /^[_^]/.test(p) ? p[0] : '', base = p.replace(/^[_^=]/, '');
      if (!acc && seen.get(base)) p = '=' + base;
      seen.set(base, acc);
    }
    out += (n.chord ? `"${n.chord}"` : '') + p + abcLen(n.beats) + ' ';
    pos += n.beats;
    if (Math.abs(pos - bar) < 1e-6 || pos > bar) { pos = 0; seen = new Map(); out += '| '; if (++line % 4 === 0) out += '\n'; }
  }
  return out.trim().replace(/\|$/, '|]');
}
export const _NOTES = NOTES;
