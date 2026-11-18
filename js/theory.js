// Music theory data and helpers. Pure functions only: no DOM, no audio.
// Pitch classes (pc) are 0–11 with C = 0. MIDI note 60 = middle C.

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const KEY_NAMES = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];

// Short interval labels by semitones above the root (used inside dots).
export const INTERVALS = ['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
// Long names, and the short id used for spaced-review items ("interval:m3").
export const INTERVAL_NAMES = ['unison', 'minor 2nd', 'major 2nd', 'minor 3rd', 'major 3rd', 'perfect 4th',
  'tritone', 'perfect 5th', 'minor 6th', 'major 6th', 'minor 7th', 'major 7th'];
export const INTERVAL_IDS = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7'];

/* ---------- scale and chord catalog ----------
   Formulas are written with degree names ("1 2 b3 #4 9 bb7"), not just
   semitones, so labels and note spelling come out right: Lydian shows #4,
   Altered shows #2 (not b3), a 9th chord shows 9 (not 2). Groups are shown in
   this order in the picker; ids are used in links (#fretboard?scale=dorian). */
const g = (name, items) => ({ name, items: items.map(([id, label, formula]) => ({ id, name: label, formula })) });

export const SCALE_GROUPS = [
  g('Common', [
    ['major', 'Major (Ionian)', '1 2 3 4 5 6 7'],
    ['minor', 'Natural minor (Aeolian)', '1 2 b3 4 5 b6 b7'],
    ['major-pentatonic', 'Major pentatonic', '1 2 3 5 6'],
    ['minor-pentatonic', 'Minor pentatonic', '1 b3 4 5 b7'],
    ['blues', 'Blues', '1 b3 4 b5 5 b7'],
    ['major-blues', 'Major blues', '1 2 b3 3 5 6']
  ]),
  g('Modes', [
    ['ionian', 'Ionian', '1 2 3 4 5 6 7'],
    ['dorian', 'Dorian', '1 2 b3 4 5 6 b7'],
    ['phrygian', 'Phrygian', '1 b2 b3 4 5 b6 b7'],
    ['lydian', 'Lydian', '1 2 3 #4 5 6 7'],
    ['mixolydian', 'Mixolydian', '1 2 3 4 5 6 b7'],
    ['aeolian', 'Aeolian', '1 2 b3 4 5 b6 b7'],
    ['locrian', 'Locrian', '1 b2 b3 4 b5 b6 b7']
  ]),
  g('Minor', [
    ['harmonic-minor', 'Harmonic minor', '1 2 b3 4 5 b6 7'],
    ['melodic-minor', 'Melodic minor', '1 2 b3 4 5 6 7']
  ]),
  g('Rock and metal', [
    ['phrygian-dominant', 'Phrygian dominant', '1 b2 3 4 5 b6 b7'],
    ['hungarian-minor', 'Hungarian minor', '1 2 b3 #4 5 b6 7'],
    ['double-harmonic', 'Double harmonic', '1 b2 3 4 5 b6 7']
  ]),
  g('Jazz', [
    ['lydian-dominant', 'Lydian dominant', '1 2 3 #4 5 6 b7'],
    ['altered', 'Altered', '1 b2 #2 3 #4 b6 b7'],
    ['bebop-dominant', 'Bebop dominant', '1 2 3 4 5 6 b7 7'],
    ['bebop-major', 'Bebop major', '1 2 3 4 5 #5 6 7'],
    ['dorian-bebop', 'Dorian bebop', '1 2 b3 3 4 5 6 b7']
  ]),
  g('Symmetrical', [
    ['whole-tone', 'Whole tone', '1 2 3 #4 #5 b7'],
    ['diminished-hw', 'Diminished (half-whole)', '1 b2 #2 3 #4 5 6 b7'],
    ['diminished-wh', 'Diminished (whole-half)', '1 2 b3 4 b5 #5 6 7'],
    ['chromatic', 'Chromatic (all 12)', '1 b2 2 b3 3 4 b5 5 b6 6 b7 7']
  ]),
  g('World', [
    ['hirajoshi', 'Hirajoshi', '1 2 b3 5 b6'],
    ['in', 'In (Japanese)', '1 b2 4 5 b6'],
    ['suspended-pentatonic', 'Suspended pentatonic', '1 2 4 5 b7']
  ])
];

export const CHORD_GROUPS = [
  g('Triads', [
    ['major', 'Major', '1 3 5'],
    ['minor', 'Minor', '1 b3 5'],
    ['dim', 'Diminished', '1 b3 b5'],
    ['aug', 'Augmented', '1 3 #5'],
    ['sus2', 'Sus2', '1 2 5'],
    ['sus4', 'Sus4', '1 4 5'],
    ['5', 'Power', '1 5']
  ]),
  g('Sixths and sevenths', [
    ['6', '6', '1 3 5 6'],
    ['m6', 'Minor 6', '1 b3 5 6'],
    ['maj7', 'Major 7', '1 3 5 7'],
    ['7', 'Dominant 7', '1 3 5 b7'],
    ['m7', 'Minor 7', '1 b3 5 b7'],
    ['m7b5', 'Minor 7 flat 5', '1 b3 b5 b7'],
    ['dim7', 'Diminished 7', '1 b3 b5 bb7'],
    ['7sus4', '7sus4', '1 4 5 b7']
  ]),
  g('Extended', [
    ['add9', 'Add9', '1 3 5 9'],
    ['9', '9', '1 3 5 b7 9'],
    ['m9', 'Minor 9', '1 b3 5 b7 9'],
    ['maj9', 'Major 9', '1 3 5 7 9'],
    ['7#9', '7#9 ("Hendrix chord")', '1 3 5 b7 #9']
  ])
];

// Older link names that should keep working.
const ALIASES = {
  scale: { 'natural-minor': 'minor' },
  chord: { 'dom7': '7', 'power': '5' }
};

// lookup('scale', 'dorian') -> { id, name, formula, group, kind } or null
export function lookup(kind, id) {
  const groups = kind === 'chord' ? CHORD_GROUPS : SCALE_GROUPS;
  id = ALIASES[kind]?.[id] || id;
  for (const grp of groups) {
    const it = grp.items.find(x => x.id === id);
    if (it) return { ...it, group: grp.name, kind };
  }
  return null;
}

/* ---------- degrees ---------- */
const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];

// "b3" -> { name: 'b3', number: 3, acc: -1, semi: 3 }; "9" -> semi 14; "bb7" -> semi 9
export function parseDegree(name) {
  const m = /^(bb|b|##|#)?(\d+)$/.exec(name);
  if (!m) throw new Error('bad degree ' + name);
  const acc = { bb: -2, b: -1, '#': 1, '##': 2 }[m[1]] || 0, number = +m[2];
  const semi = MAJOR_STEPS[(number - 1) % 7] + 12 * Math.floor((number - 1) / 7) + acc;
  return { name, number, acc, semi };
}

// The color role of each degree in a formula. A 3rd or 5th with an accidental
// (b5 in Blues, #2 in Altered is a 2nd) only counts as "the" 5th when the
// formula has no plain 5 - so a diminished chord's b5 is its fifth.
export function parseFormula(formula) {
  const degs = formula.trim().split(/\s+/).map(parseDegree);
  const has = n => degs.some(d => d.number === n && d.acc === 0);
  return degs.map(d => {
    const base = ((d.number - 1) % 7) + 1;
    let role = 'other';
    if (base === 1) role = 'root';
    else if (base === 3 && (d.acc === 0 || d.acc === -1)) role = 'third';
    else if (base === 5 && (d.acc === 0 || !has(5))) role = 'fifth';
    return { ...d, label: d.name === '1' ? 'R' : d.name, role };
  });
}

/* ---------- spelling ---------- */
// Spell a degree from a root written with letter index L and pitch class rootPc.
function spellDegree(L, rootPc, d) {
  const letter = (L + d.number - 1) % 7, target = pcOf(rootPc + d.semi);
  let acc = pcOf(target - LETTER_PC[letter]);
  if (acc > 6) acc -= 12;
  return { name: LETTERS[letter] + (acc > 0 ? '#'.repeat(acc) : 'b'.repeat(-acc)), acc };
}

// How the root may be written: a white key only as itself (C, never B#); a
// black key either way (pc 1 -> C# or Db).
function rootSpellings(pc) {
  const out = [];
  LETTER_PC.forEach((lp, L) => {
    const acc = pcOf(pc - lp) > 6 ? pcOf(pc - lp) - 12 : pcOf(pc - lp);
    if (Math.abs(acc) <= 1) out.push({ L, acc });
  });
  const natural = out.filter(o => o.acc === 0);
  return natural.length ? natural : out;
}

// When both spellings of a black-key root need the same number of accidentals,
// use the common one: flats for Db, Eb, Ab, Bb; sharps for F# and C#.
const PREFER_SHARP = { 1: true, 3: false, 6: true, 8: false, 10: false };

// A single note name with no context: C# Eb F# Ab Bb.
export const preferredName = pc => {
  pc = pcOf(pc);
  const nat = LETTER_PC.indexOf(pc);
  if (nat >= 0) return LETTERS[nat];
  return PREFER_SHARP[pc] ? LETTERS[LETTER_PC.indexOf(pc - 1)] + '#' : LETTERS[LETTER_PC.indexOf(pc + 1)] + 'b';
};

// Spell a scale or chord in a key: picks C# vs Db (etc.) by whichever needs
// fewer accidentals (ties: PREFER_SHARP), then gives one letter per degree.
// Double sharps/flats are written the way players do (F## -> G, Bbb -> A).
// Returns { root: 'Bb', notes: ['Bb','C','D',...], byPc: { pc: name } }.
export function spell(rootPc, formula) {
  const degs = typeof formula === 'string' ? parseFormula(formula) : formula;
  let best = null;
  for (const r of rootSpellings(pcOf(rootPc))) {
    const notes = degs.map(d => spellDegree(r.L, rootPc, d));
    const score = notes.reduce((a, n) => a + Math.abs(n.acc) + (Math.abs(n.acc) > 1 ? 3 : 0), 0);
    const tieWin = best && score === best.score && (r.acc > 0) === !!PREFER_SHARP[pcOf(rootPc)];
    if (!best || score < best.score || tieWin) best = { score, notes };
  }
  const names = best.notes.map((n, k) => (Math.abs(n.acc) > 1 ? preferredName(rootPc + degs[k].semi) : n.name)), byPc = {};
  degs.forEach((d, k) => { const pc = pcOf(rootPc + d.semi); if (!(pc in byPc)) byPc[pc] = names[k]; });
  return { root: names[0], notes: names, byPc };
}

// The note a degree above a root, spelled: noteAbove(9, 'b3') -> 'C'; noteAbove(4, '3') -> 'G#'.
export function noteAbove(rootPc, degree) {
  const sp = spell(rootPc, `1 ${degree}`);
  return { root: sp.root, note: sp.notes[1] };
}

// Tunings are data so other instruments can be added. Strings run high to low,
// matching tab (index 0 = top line). `num` is the conventional string number.
export const TUNINGS = {
  standard: {
    name: 'Standard',
    strings: [
      { name: 'e', num: 1, midi: 64 },
      { name: 'B', num: 2, midi: 59 },
      { name: 'G', num: 3, midi: 55 },
      { name: 'D', num: 4, midi: 50 },
      { name: 'A', num: 5, midi: 45 },
      { name: 'E', num: 6, midi: 40 }
    ]
  }
};

// The neck most helpers use when no tuning is passed: guitar standard until the app
// picks another instrument's tuning at start-up (js/storage.js). Lesson code always
// passes its own tuning, so this only changes free-play screens.
let defaultTuning = TUNINGS.standard;
export const setDefaultTuning = t => { defaultTuning = t || TUNINGS.standard; };
export const getDefaultTuning = () => defaultTuning;

export const pcOf = midi => ((midi % 12) + 12) % 12;
export const noteName = pc => NOTES[pcOf(pc)];
export const midiToFreq = midi => 440 * Math.pow(2, (midi - 69) / 12);

// "G", "F#", "Bb", "c#" -> pitch class, or null.
export function parseNote(name) {
  const m = /^([A-Ga-g])([#b♯♭]?)$/.exec(String(name || '').trim());
  if (!m) return null;
  const base = NOTES.indexOf(m[1].toUpperCase());
  const acc = m[2] === '#' || m[2] === '♯' ? 1 : m[2] ? -1 : 0;
  return pcOf(base + acc);
}

// Pitch classes in a key, in scale order. notesInKey(7, SCALES.Major) -> G A B C D E F#
export const notesInKey = (rootPc, formula) => formula.map(r => pcOf(rootPc + r));

// Ascending interval from note a to note b (pitch classes or MIDI numbers).
export function intervalBetween(a, b) {
  const semitones = pcOf(b - a);
  return { semitones, label: INTERVALS[semitones], id: INTERVAL_IDS[semitones], name: INTERVAL_NAMES[semitones] };
}

// Frets (0..maxFret) where pitch class `pc` sits on string index `s`.
export function fretsOf(pc, s, tuning = defaultTuning, maxFret = 15) {
  const out = [];
  for (let f = pcOf(pc - tuning.strings[s].midi); f <= maxFret; f += 12) out.push(f);
  return out;
}

// Every {s, f} position of pitch class `pc` on the neck.
export function positionsOf(pc, tuning = defaultTuning, maxFret = 15) {
  return tuning.strings.flatMap((_, s) => fretsOf(pc, s, tuning, maxFret).map(f => ({ s, f })));
}

export const midiAt = (s, f, tuning = defaultTuning) => tuning.strings[s].midi + f;

// Where to play an exact MIDI note for a hand sitting at `nearFret` (used to light
// up sequences). Prefers the lowest string inside the hand's reach (one fret
// back, four forward), skipping strings in `avoid`; otherwise the closest fret.
export function positionForMidi(midi, nearFret = 0, { tuning = defaultTuning, maxFret = 15, avoid = new Set() } = {}) {
  const cands = tuning.strings
    .map((str, s) => ({ s, f: midi - str.midi }))
    .filter(p => p.f >= 0 && p.f <= maxFret && !avoid.has(p.s));
  if (!cands.length) return null;
  const inReach = cands.filter(p => p.f >= nearFret - 1 && p.f <= nearFret + 4);
  if (inReach.length) return inReach.reduce((a, b) => (b.s > a.s ? b : a));
  return cands.reduce((a, b) => (Math.abs(b.f - nearFret) < Math.abs(a.f - nearFret) ? b : a));
}
