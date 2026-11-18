// The drum kit as data (docs/research-drums.md D1, F2): pieces, the limb that usually plays
// each one, its General MIDI note (for e-kits), its place on the drum staff and a keyboard key.
// Pure, shared by the Kit tab, drills, lessons and play-alongs.
export const KIT = [
  { id: 'crash', name: 'Crash', limb: 'R', gm: [49, 57], staff: { pitch: 'a', x: true }, key: 'u' },
  { id: 'ride', name: 'Ride', limb: 'R', gm: [51, 59], staff: { pitch: 'f', x: true }, key: 'i' },
  { id: 'hat', name: 'Hi-hat', limb: 'R', gm: [42], staff: { pitch: 'g', x: true }, key: 'j' },
  { id: 'ohat', name: 'Open hi-hat', limb: 'R', gm: [46], staff: { pitch: 'g', x: true, open: true }, key: 'k' },
  { id: 'tom1', name: 'High tom', limb: 'R', gm: [48, 50], staff: { pitch: 'e' }, key: 'y' },
  { id: 'tom2', name: 'Mid tom', limb: 'L', gm: [45, 47], staff: { pitch: 'd' }, key: 't' },
  { id: 'snare', name: 'Snare', limb: 'L', gm: [38, 40], staff: { pitch: 'c' }, key: 'f' },
  { id: 'rim', name: 'Cross-stick', limb: 'L', gm: [37], staff: { pitch: 'c', x: true }, key: 'r' },
  { id: 'tom3', name: 'Floor tom', limb: 'R', gm: [41, 43], staff: { pitch: 'A' }, key: 'g' },
  { id: 'kick', name: 'Kick', limb: 'RF', gm: [36, 35], staff: { pitch: 'F' }, key: ' ' },
  { id: 'phat', name: 'Hi-hat foot', limb: 'LF', gm: [44], staff: { pitch: 'D', x: true }, key: 'v' }
];
export const piece = id => KIT.find(p => p.id === id);
export const LIMBS = { R: 'Right hand', L: 'Left hand', RF: 'Right foot', LF: 'Left foot' };
// A General MIDI drum note -> piece id (e-kits send these on channel 10).
export const fromGM = note => KIT.find(p => p.gm.includes(note))?.id || null;
// Keyboard: F/J = hands, Space = kick (research-drums.md F2), plus a few more.
export const fromKey = key => KIT.find(p => p.key === key.toLowerCase())?.id || null;

/* ---------- a groove: { beats, sub, bars, hits: { piece: [step, ...] }, accents?: { piece: [step] }, sticking?: ['R','L',...] } ---------- */
export const stepsOf = g => g.beats * g.sub * (g.bars || 1);
// Every hit as { step, piece, accent } sorted by step.
export const hitsOf = g => Object.entries(g.hits).flatMap(([p, steps]) => steps.map(step => ({ step, piece: p, accent: !!g.accents?.[p]?.includes(step) }))).sort((a, b) => a.step - b.step);
// Beat position of a step (in quarter-note beats from the start).
export const beatOf = (g, step) => step / g.sub;
// From the groove-player text patterns ('x.x.') to a groove object.
export const fromPatterns = (parts, { beats = 4, sub = 4 } = {}) => ({ beats, sub, bars: 1, hits: Object.fromEntries(Object.entries(parts).map(([p, s]) => [p, [...s].map((c, i) => (c === '.' ? -1 : i)).filter(i => i >= 0)])) });
