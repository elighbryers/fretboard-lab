// Shared theory cards: the Learn-it cards whose idea is the same on every instrument.
// Each card is text plus its music in instrument-free terms (js/research-master-plan.md
// section 1): a key + scale or chord and the degrees or note names it shows, or a list
// of notes. Nothing here knows about strings, frets or keys of a piano.
//
// An instrument's lesson places a card on its own view:
//   guitar: card('l3-1.1', { view, dots })  (js/lessons/kit.js) checks every dot against
//           the card's music and throws if they disagree, so the text can't drift from the neck.
//   later instruments: autoPlace(id, kit, view) finds the positions on any fretted neck
//           (bass, 5-string ...); cardNotes(id) gives the notes for a keyboard.
// Cards that describe guitar geometry ("one string up, one fret back") stay in the
// guitar lessons: they aren't theory, and a bass or piano lesson can't reuse them.
// Ids are the lesson and card the idea first appeared in.
import { parseNote, parseFormula, spell, lookup, pcOf } from '../theory.js';

export const CARDS = {
  // The musical alphabet
  'l1-2.1': { text: 'Music uses seven letters, A to G. After G it starts again at A.',
    theory: [{ notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] }] },
  // Whole and half steps
  'l1-3.3': { text: 'B to C and E to F are half steps. Every other pair of letters is a whole step.',
    theory: [{ notes: ['D', 'E', 'F', 'G'] }] },
  // The major scale pattern
  'l2-1.1': { text: 'A major scale is seven notes and then the first note again. The steps between them always follow one pattern.',
    theory: [{ key: 'G', kind: 'scale', id: 'major', mode: 'note', labels: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'] }] },
  'l2-1.2': { text: 'The pattern is W W H W W W H: whole, whole, half, whole, whole, whole, half.',
    theory: [{ key: 'G', kind: 'scale', id: 'major', mode: 'note', labels: ['G', 'A', 'B', 'C'] }] },
  'l2-1.3': { text: 'The two half steps come after the 3rd note and after the 7th. In G those are B to C and F# to G.',
    theory: [{ key: 'G', kind: 'scale', id: 'major', mode: 'note', labels: ['B', 'C', 'F#', 'G'] }] },
  // Scale degrees 1 to 7
  'l2-3.1': { text: 'Each note has a number, its scale degree. The root is degree 1, and we write it R.',
    theory: [{ key: 'G', kind: 'scale', id: 'major', mode: 'deg', labels: ['R', '2', '3', '4', '5', '6', '7'] }] },
  'l2-3.2': { text: 'The root, 3rd and 5th matter most. Together they make the key\'s main chord.',
    theory: [{ key: 'G', kind: 'scale', id: 'major', mode: 'deg', labels: ['R', '3', '5'] }] },
  'l2-3.3': { text: 'Numbers work in every key. In G the 3rd is B, and in C the 3rd is E.',
    theory: [{ key: 'G', kind: 'scale', id: 'major', mode: 'deg', labels: ['3'] }, { key: 'C', kind: 'scale', id: 'major', mode: 'deg', labels: ['3'] }] },
  // The relative minor
  'l2-6.1': { text: 'Play the notes of G major starting on its 6th note, E, and you get E minor.',
    theory: [{ key: 'E', kind: 'scale', id: 'minor', mode: 'note', labels: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'] }] },
  'l2-6.3': { text: 'From E, the degrees are 1 2 b3 4 5 b6 b7. The flat 3rd is what makes it sound minor.',
    theory: [{ key: 'E', kind: 'scale', id: 'minor', mode: 'deg', labels: ['R', '2', 'b3', '4', '5', 'b6', 'b7'] }] },
  // The major pentatonic
  'l2-7.1': { text: 'Take the 4th and 7th out of the major scale. The five notes left are the major pentatonic.',
    theory: [{ key: 'G', kind: 'scale', id: 'major-pentatonic', mode: 'deg', labels: ['R', '2', '3', '5', '6'] }] },
  'l2-7.2': { text: 'With no half steps left, every note sounds good over the key\'s chord. That makes it great for first solos.',
    theory: [{ key: 'G', kind: 'scale', id: 'major-pentatonic', mode: 'note', labels: ['G', 'A', 'B', 'D', 'E'] }] },
  // The minor pentatonic, box 1
  'l2-minpent.1': { text: 'Play G major pentatonic from its relative minor, E, and you have E minor pentatonic: the same five notes.',
    theory: [{ key: 'E', kind: 'scale', id: 'minor-pentatonic', mode: 'deg', labels: ['R', 'b3', '4', '5', 'b7'] }] },
  'l2-minpent.3': { text: 'Your first blues lick: G, E, D, C, then home to A.',
    theory: [{ key: 'A', kind: 'scale', id: 'minor-pentatonic', mode: 'deg', labels: ['b7', '5', '4', 'b3', 'R'] }] },
  // Intervals from the root
  'l3-1.1': { text: 'An interval is the distance from the root to another note.',
    theory: [{ key: 'C', kind: 'scale', id: 'chromatic', mode: 'deg', labels: ['R', '3'] }] },
  'l3-1.2': { text: 'We name it by the scale degree it lands on. C to E is a 3rd, and C to G is a 5th.',
    theory: [{ key: 'C', kind: 'scale', id: 'chromatic', mode: 'deg', labels: ['R', '3', '5'] }] },
  'l3-1.3': { text: 'Count the root as 1. C, D, E is three letters, so C to E is a 3rd.',
    theory: [{ key: 'C', kind: 'scale', id: 'chromatic', mode: 'deg', labels: ['R', '2', '3'] }] },
  // 4ths, 5ths and power chords
  'l3-4.3': { text: 'Root and 5th together (often with the octave) is a power chord, written G5.',
    theory: [{ key: 'G', kind: 'scale', id: 'chromatic', mode: 'deg', labels: ['R', '5'] }] },
  // Hearing intervals in a key
  'l3-6.1': { text: 'A drone holds the root under everything. Each degree has its own feeling against it.',
    theory: [{ key: 'G', kind: 'scale', id: 'major', mode: 'deg', labels: ['R'] }] },
  // Mixed interval drill
  'l3-7.1': { text: 'Here are all eight intervals you know, from one root.',
    theory: [{ key: 'C', kind: 'scale', id: 'chromatic', mode: 'deg', labels: ['R', 'b3', '3', '4', '5', 'b6', '6', 'b7', '7'] }] },
  'l3-7.2': { text: 'They come in confusable pairs: minor and major 3rds, 4ths and 5ths, minor and major 6ths and 7ths.',
    theory: [{ key: 'C', kind: 'scale', id: 'chromatic', mode: 'deg', labels: ['R', 'b3', '3', '4', '5'] }] },
  // Building triads from 1-3-5
  'l4-1.1': { text: 'A chord is three or more notes played together. The simplest, a triad, is the root, 3rd and 5th.',
    theory: [{ key: 'C', kind: 'chord', id: 'major', mode: 'deg', labels: ['R', '3', '5'] }] },
  'l4-1.2': { text: 'Take every other note of the scale: C, skip D, E, skip F, G.',
    theory: [{ key: 'C', kind: 'scale', id: 'major', mode: 'note', labels: ['C', 'D', 'E', 'F', 'G'] }] },
  // Major, minor and diminished
  'l4-2.1': { text: 'A major triad is the root, a major 3rd and a perfect 5th. It sounds bright.',
    theory: [{ key: 'G', kind: 'chord', id: 'major', mode: 'deg', labels: ['R', '3', '5'] }] },
  'l4-2.3': { text: 'Lower the 5th as well, to b5, and it is diminished. It sounds tense.',
    theory: [{ key: 'G', kind: 'chord', id: 'dim', mode: 'deg', labels: ['R', 'b3', 'b5'] }] },
  // 7th chords
  'l4-7.1': { text: 'Add a 7th to a triad and you get a 7th chord. Major 7 is R 3 5 7 and sounds dreamy.',
    theory: [{ key: 'G', kind: 'chord', id: 'maj7', mode: 'deg', labels: ['R', '7', '3', '5'] }] },
  'l4-7.2': { text: 'Dominant 7, written just "7", is R 3 5 b7. It sounds bluesy and wants to move.',
    theory: [{ key: 'G', kind: 'chord', id: '7', mode: 'deg', labels: ['R', '5', 'b7', '3'] }] },
  'l4-7.3': { text: 'Minor 7 is R b3 5 b7. It sounds smooth and mellow.',
    theory: [{ key: 'G', kind: 'chord', id: 'm7', mode: 'deg', labels: ['R', '5', 'b7', 'b3'] }] },
  // Keys, the capo and transposing
  'l5-keys.1': { text: 'A key is the set of notes a song uses. G major has one sharp, F#, and D major has two, F# and C#.',
    theory: [{ key: 'D', kind: 'scale', id: 'major', mode: 'note', labels: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'] }] },
  'l5-keys.2': { text: 'Each step up a 5th adds a sharp: C, G, D, A. This ring of keys is the circle of fifths.',
    theory: [{ key: 'C', kind: 'scale', id: 'major', mode: 'note', labels: ['C'] }, { key: 'G', kind: 'scale', id: 'major', mode: 'note', labels: ['G'] }, { key: 'D', kind: 'scale', id: 'major', mode: 'note', labels: ['D'] }, { key: 'A', kind: 'scale', id: 'major', mode: 'note', labels: ['A'] }] },
  // ♭VII and secondary dominants
  'l5-b7.3': { text: 'Spot them by the note from outside the key, like the D# in B7.',
    theory: [{ key: 'B', kind: 'chord', id: '7', mode: 'deg', labels: ['R', '3', 'b7', '5'] }] },
  // A progression in one position
  'l5-7.3': { text: 'Move to the closest notes of the next chord. From G to Em, only one note changes: D goes up to E.',
    theory: [{ key: 'G', kind: 'chord', id: 'major', mode: 'note', labels: ['B', 'D', 'G'] }, { key: 'E', kind: 'chord', id: 'minor', mode: 'note', labels: ['E'] }] },
  // Aiming for chord tones
  'l6-2.1': { text: 'Chord tones are the notes of the chord that is playing. Landing on one makes your line sound connected.',
    theory: [{ key: 'A', kind: 'chord', id: 'minor', mode: 'deg', labels: ['R', 'b3', '5'] }] },
  'l6-2.2': { text: 'When the chord changes, aim for a note of the new chord. Over C, aim for C, E or G.',
    theory: [{ key: 'C', kind: 'chord', id: 'major', mode: 'deg', labels: ['R', '3', '5'] }] },
  'l6-2.3': { text: 'Notes in both chords, here C and E, are safe bridges across the change.',
    theory: [{ key: 'A', kind: 'scale', id: 'minor-pentatonic', mode: 'note', labels: ['C', 'E'] }] },
  // Phrasing: call, response and space
  'l6-3.1': { text: 'A phrase is a short musical sentence. Leave space between phrases, like taking a breath.',
    theory: [{ key: 'A', kind: 'scale', id: 'minor-pentatonic', mode: 'deg', labels: ['b3', '4', '5'] }] },
  'l6-3.2': { text: 'Call and response: play a phrase, then answer it with a similar one that ends somewhere new.',
    theory: [{ key: 'A', kind: 'scale', id: 'minor-pentatonic', mode: 'deg', labels: ['b3', '4', '5', 'b7', 'R'] }] },
  'l6-3.3': { text: 'Repeat a good idea two or three times before changing it. Repetition makes a solo stick.',
    theory: [{ key: 'A', kind: 'scale', id: 'minor-pentatonic', mode: 'deg', labels: ['b3', '4', '5'] }] },
  // Bends, slides and vibrato
  'l6-4.3': { text: 'Vibrato is a small, steady wobble on a held note. Use it on the last note of a phrase.',
    theory: [{ key: 'A', kind: 'scale', id: 'minor-pentatonic', mode: 'deg', labels: ['R'] }] },
  // The blues sound: b3, b5 and b7
  'l6-5.1': { text: 'Add the b5 to the minor pentatonic and you have the blues scale.',
    theory: [{ key: 'A', kind: 'scale', id: 'blues', mode: 'deg', labels: ['R', 'b3', '4', 'b5', '5', 'b7'] }] },
  'l6-5.2': { text: 'Over A7, the b3 (C) rubs against the chord\'s own 3rd (C#). That rub is the blues.',
    theory: [{ key: 'A', kind: 'scale', id: 'chromatic', mode: 'deg', labels: ['b3', '3'] }] },
  'l6-5.3': { text: 'The b7 (G) is also in A7, so it always sounds at home over the blues.',
    theory: [{ key: 'A', kind: 'scale', id: 'blues', mode: 'deg', labels: ['b7'] }] },
  // Modes: Dorian and Mixolydian
  'l6-6.1': { text: 'A mode is a major scale started on a different note. Dorian is minor with a bright 6th: 1 2 b3 4 5 6 b7.',
    theory: [{ key: 'A', kind: 'scale', id: 'dorian', mode: 'deg', labels: ['R', '2', 'b3', '4', '5', '6', 'b7'] }] },
  'l6-6.2': { text: 'Mixolydian is major with a b7: 1 2 3 4 5 6 b7. It is the sound of a dominant 7 chord.',
    theory: [{ key: 'A', kind: 'scale', id: 'mixolydian', mode: 'deg', labels: ['R', '2', '3', '4', '5', '6', 'b7'] }] },
  'l6-6.3': { text: 'Use Dorian over a minor 7 chord and Mixolydian over a dominant 7. The 6 and the 3 make the difference.',
    theory: [{ key: 'A', kind: 'scale', id: 'dorian', mode: 'deg', labels: ['6'] }, { key: 'A', kind: 'scale', id: 'mixolydian', mode: 'deg', labels: ['3'] }] },
  // Soloing over a ii-V-I
  'l6-7.1': { text: 'Over ii-V-I, aim for each chord\'s 3rd. In C that is F over Dm7, B over G7 and E over Cmaj7.',
    theory: [{ key: 'D', kind: 'chord', id: 'm7', mode: 'deg', labels: ['b3'] }, { key: 'G', kind: 'chord', id: '7', mode: 'deg', labels: ['3'] }, { key: 'C', kind: 'chord', id: 'maj7', mode: 'deg', labels: ['3'] }] },
  'l6-7.3': { text: 'Fill the gaps with the C major scale. It fits all three chords.',
    theory: [{ key: 'C', kind: 'scale', id: 'major', mode: 'deg', labels: ['5', '6', '7', 'R', '2', '3', '4'] }] }
};

// What a theory group says about one pitch class: { label, role } or null.
function meaning(g, pc) {
  if (g.notes) {
    const name = g.notes.find(n => parseNote(n) === pc);
    return name ? { label: name } : null;
  }
  const keyPc = parseNote(g.key), degs = parseFormula(lookup(g.kind, g.id).formula), sp = spell(keyPc, degs);
  const k = degs.findIndex(d => pcOf(keyPc + d.semi) === pc);
  if (k < 0) return null;
  return { label: g.mode === 'note' ? sp.notes[k] : degs[k].label, role: degs[k].role };
}
// The pitch classes a group shows (one per label or note).
function groupPcs(g) {
  if (g.notes) return g.notes.map(n => ({ label: n, pc: parseNote(n) }));
  const keyPc = parseNote(g.key), degs = parseFormula(lookup(g.kind, g.id).formula), sp = spell(keyPc, degs);
  return g.labels.map(label => {
    const k = degs.findIndex((d, i) => (g.mode === 'note' ? sp.notes[i] : d.label) === label);
    if (k < 0) throw new Error(`${label} is not in ${g.key} ${g.id}`);
    return { label, pc: pcOf(keyPc + degs[k].semi), role: degs[k].role };
  });
}

export const findCard = id => CARDS[id] || null;
// Note names a card shows, for instruments without frets (piano).
export const cardNotes = id => CARDS[id].theory.flatMap(g => groupPcs(g).map(x => x.label));

// Place a card on an instrument's view at given positions. pcAt(string, fret) is that
// instrument's pitch lookup. Every dot must be one of the card's notes or degrees,
// labelled the same way, and every note or degree must appear; otherwise it throws.
// Returns the Learn card the lesson player shows: { text, board }.
export function placeCard(id, board, pcAt) {
  const c = CARDS[id];
  if (!c) throw new Error(`no theory card ${id}`);
  for (const d of board.dots) {
    const ok = c.theory.some(g => { const m = meaning(g, pcAt(d.string, d.fret)); return m && m.label === d.label && (g.notes || m.role === d.role); });
    if (!ok) throw new Error(`card ${id}: string ${d.string} fret ${d.fret} labelled ${d.label} isn't in the card's music`);
  }
  for (const g of c.theory) for (const x of groupPcs(g)) {
    if (!board.dots.some(d => d.label === x.label && pcOf(pcAt(d.string, d.fret)) === x.pc)) throw new Error(`card ${id}: ${x.label} isn't shown`);
  }
  return { text: c.text, board };
}

// Put a card on any fretted neck: for each note or degree, its lowest position in the
// view (lowest string first). kit = makeKit(instrument) from js/lessons/kit.js.
export function autoPlace(id, kit, view = [0, 12]) {
  const c = CARDS[id], dots = [];
  for (const g of c.theory) for (const x of groupPcs(g)) {
    const at = kit.spots(x.pc, { from: view[0], to: view[1] })[0];
    if (!at) throw new Error(`card ${id}: no ${x.label} on this neck in frets ${view}`);
    dots.push({ ...at, label: x.label, ...(x.role ? { role: x.role } : {}) });
  }
  return { text: c.text, board: { view, dots } };
}
