// Music theory data and helpers. Pure functions only: no DOM, no audio.
// Pitch classes (pc) are 0–11 with C = 0. MIDI note 60 = middle C.

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const KEY_NAMES = ['C', 'C# / Db', 'D', 'D# / Eb', 'E', 'F', 'F# / Gb', 'G', 'G# / Ab', 'A', 'A# / Bb', 'B'];

// Short interval labels by semitones above the root (used inside dots).
export const INTERVALS = ['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
// Long names, and the short id used for spaced-review items ("interval:m3").
export const INTERVAL_NAMES = ['unison', 'minor 2nd', 'major 2nd', 'minor 3rd', 'major 3rd', 'perfect 4th',
  'tritone', 'perfect 5th', 'minor 6th', 'major 6th', 'minor 7th', 'major 7th'];
export const INTERVAL_IDS = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7'];

// Formulas are semitones above the root. Display name -> formula.
export const SCALES = {
  'Major': [0, 2, 4, 5, 7, 9, 11],
  'Natural minor': [0, 2, 3, 5, 7, 8, 10],
  'Major pentatonic': [0, 2, 4, 7, 9],
  'Minor pentatonic': [0, 3, 5, 7, 10],
  'Blues': [0, 3, 5, 6, 7, 10],
  'Dorian': [0, 2, 3, 5, 7, 9, 10],
  'Mixolydian': [0, 2, 4, 5, 7, 9, 10]
};
export const CHORDS = {
  'Major': [0, 4, 7],
  'Minor': [0, 3, 7],
  'Dominant 7': [0, 4, 7, 10],
  'Major 7': [0, 4, 7, 11],
  'Minor 7': [0, 3, 7, 10],
  'Diminished': [0, 3, 6],
  'Power (5)': [0, 7]
};

// URL-friendly ids for links like #fretboard?key=G&scale=major
export const SCALE_SLUGS = {
  'major': 'Major', 'minor': 'Natural minor', 'natural-minor': 'Natural minor',
  'major-pentatonic': 'Major pentatonic', 'minor-pentatonic': 'Minor pentatonic',
  'blues': 'Blues', 'dorian': 'Dorian', 'mixolydian': 'Mixolydian'
};
export const CHORD_SLUGS = {
  'major': 'Major', 'minor': 'Minor', 'dom7': 'Dominant 7', '7': 'Dominant 7',
  'maj7': 'Major 7', 'm7': 'Minor 7', 'dim': 'Diminished', '5': 'Power (5)', 'power': 'Power (5)'
};
export const slugOf = (map, name) => Object.keys(map).find(k => map[k] === name);

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
export function fretsOf(pc, s, tuning = TUNINGS.standard, maxFret = 15) {
  const out = [];
  for (let f = pcOf(pc - tuning.strings[s].midi); f <= maxFret; f += 12) out.push(f);
  return out;
}

// Every {s, f} position of pitch class `pc` on the neck.
export function positionsOf(pc, tuning = TUNINGS.standard, maxFret = 15) {
  return tuning.strings.flatMap((_, s) => fretsOf(pc, s, tuning, maxFret).map(f => ({ s, f })));
}

export const midiAt = (s, f, tuning = TUNINGS.standard) => tuning.strings[s].midi + f;

// Where to play an exact MIDI note for a hand sitting at `nearFret` (used to light
// up sequences). Prefers the lowest string inside the hand's reach (one fret
// back, four forward), skipping strings in `avoid`; otherwise the closest fret.
export function positionForMidi(midi, nearFret = 0, { tuning = TUNINGS.standard, maxFret = 15, avoid = new Set() } = {}) {
  const cands = tuning.strings
    .map((str, s) => ({ s, f: midi - str.midi }))
    .filter(p => p.f >= 0 && p.f <= maxFret && !avoid.has(p.s));
  if (!cands.length) return null;
  const inReach = cands.filter(p => p.f >= nearFret - 1 && p.f <= nearFret + 4);
  if (inReach.length) return inReach.reduce((a, b) => (b.s > a.s ? b : a));
  return cands.reduce((a, b) => (Math.abs(b.f - nearFret) < Math.abs(a.f - nearFret) ? b : a));
}
