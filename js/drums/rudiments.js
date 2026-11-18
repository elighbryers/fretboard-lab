// Rhythms and rudiments as data (pure, also read by the lesson validator).
// One-bar rhythms on the snare, easiest first (16th grid unless sub is 3).
export const RHYTHMS = [
  { id: 'quarters', name: 'Quarter notes', steps: [0, 4, 8, 12] },
  { id: 'half-rests', name: 'Quarters with rests on 2 and 4', steps: [0, 8] },
  { id: 'eighths', name: 'Eighth notes', steps: [0, 2, 4, 6, 8, 10, 12, 14] },
  { id: 'quarter-eighths', name: 'Quarter, two eighths', steps: [0, 4, 6, 8, 12, 14] },
  { id: 'and-of-2', name: 'Kick on the & of 2', steps: [0, 6, 8] },
  { id: 'sixteenths', name: 'Sixteenth notes', steps: [...Array(16).keys()] },
  { id: 'one-e-and-a', name: '1 e & a, then quarters', steps: [0, 1, 2, 3, 4, 8, 12] },
  { id: 'gallop', name: 'Eighth + two sixteenths', steps: [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15] },
  { id: 'syncopated', name: 'Syncopation', steps: [0, 3, 6, 10, 12] },
  { id: 'dotted', name: 'Dotted eighth + sixteenth', steps: [0, 3, 4, 7, 8, 11, 12, 15] },
  { id: 'triplets', name: 'Eighth-note triplets', steps: [...Array(12).keys()], sub: 3 },
  { id: 'shuffle', name: 'Shuffle (triplet with the middle left out)', steps: [0, 2, 3, 5, 6, 8, 9, 11], sub: 3 }
];
export const rhythmGroove = r => ({ beats: 4, sub: r.sub || 4, bars: 1, hits: { snare: r.steps } });
export const findRhythm = id => RHYTHMS.find(r => r.id === id);

// Rudiments in the research order (PAS 40 starter set), as stickings over 16ths or triplets.
export const RUDIMENTS = [
  { id: 'singles', name: 'Single strokes', sticking: 'RLRLRLRLRLRLRLRL' },
  { id: 'doubles', name: 'Double strokes', sticking: 'RRLLRRLLRRLLRRLL' },
  { id: 'paradiddle', name: 'Paradiddle', sticking: 'RLRRLRLLRLRRLRLL' },
  { id: 'flam', name: 'Flam (grace note before the main note)', sticking: 'lR..rL..lR..rL..', grace: true },
  { id: 'flam-tap', name: 'Flam tap', sticking: 'lRR.rLL.lRR.rLL.', grace: true },
  { id: 'drag', name: 'Drag (two grace notes)', sticking: 'llR.rrL.llR.rrL.', grace: true },
  { id: 'five-stroke', name: '5-stroke roll', sticking: 'RRLLR...LLRRL...' },
  { id: 'nine-stroke', name: '9-stroke roll', sticking: 'RRLLRRLLR.......' }
];
export const findRudiment = id => RUDIMENTS.find(r => r.id === id);
// A sticking string -> a groove on two "pads", R and L (lower case = grace note, '.' = rest).
export function stickingGroove(sticking) {
  const hits = { R: [], L: [] };
  [...sticking].forEach((c, i) => { if (c === '.') return; hits[c.toUpperCase()].push(i); });
  return { beats: 4, sub: 4, bars: 1, hits };
}

