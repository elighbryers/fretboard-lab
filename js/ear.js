// Ear training: five tracks, answered by tapping the fretboard (docs/research-app-features.md 1).
//   1 Scale degrees in a key  2 Intervals in melodies  3 Chord quality
//   4 Bass motion and progressions  5 Melodic dictation of public-domain tunes
// Every question is a "round" with the same small ui interface the drills and the
// daily review use, so the Ear tab and the review ask them the same way:
//   round(ui, want) -> { tap({ s, f, pc, midi }), end() }
// Every answer is recorded with recordAnswer, so it feeds the daily review.
import { pcOf, midiAt, parseNote, spell, preferredName, TUNINGS } from './theory.js';
import { droneStart, droneStop, droneOn, voicing, strumAt, pluckAt, context, now } from './audio.js';
import { recordAnswer, getSettings, setSetting } from './storage.js';
import { chordOf } from './progressions.js';
import { esc, pick } from './ui.js';

const tuning = TUNINGS.standard;
const CHROMATIC = ['R', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7'];
const ORD = { 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th' };
export const degreeWords = l => l === 'R' ? 'root' : (l[0] === 'b' ? 'flat ' : l[0] === '#' ? 'sharp ' : '') + ORD[l.replace(/\D/g, '')];
const IV = { m3: 3, M3: 4, P4: 5, P5: 7, m6: 8, M6: 9, m7: 10, M7: 11 };
const IV_NAMES = { m3: 'minor 3rd', M3: 'major 3rd', P4: 'perfect 4th', P5: 'perfect 5th', m6: 'minor 6th', M6: 'major 6th', m7: 'minor 7th', M7: 'major 7th' };
const CHORD_NAMES = { major: 'major', minor: 'minor', dim: 'diminished', maj7: 'major 7', '7': 'dominant 7', m7: 'minor 7' };
export const KEYS = ['G', 'C', 'D', 'A', 'E', 'F'];

// Public-domain melodies, as semitones from the tonic and lengths in beats.
export const TUNES = [
  { id: 'row', name: 'Row, Row, Row Your Boat', credit: 'traditional, published 1852', notes: [0, 0, 0, 2, 4, 4, 2, 4, 5, 7], beats: [1, 1, 0.67, 0.33, 1, 0.67, 0.33, 0.67, 0.33, 2] },
  { id: 'mary', name: 'Mary Had a Little Lamb', credit: 'traditional, 1830s', notes: [4, 2, 0, 2, 4, 4, 4], beats: [1, 1, 1, 1, 1, 1, 2] },
  { id: 'frere', name: 'Frère Jacques', credit: 'traditional French round', notes: [0, 2, 4, 0, 0, 2, 4, 0], beats: [1, 1, 1, 1, 1, 1, 1, 1] },
  { id: 'joy', name: 'Joy to the World', credit: 'tune by Lowell Mason, 1839', notes: [12, 11, 9, 7, 5, 4, 2, 0], beats: [2, 1.5, 0.5, 3, 1, 2, 2, 3] },
  { id: 'twinkle', name: 'Twinkle, Twinkle, Little Star', credit: 'French folk tune, 1700s', notes: [0, 0, 7, 7, 9, 9, 7], beats: [1, 1, 1, 1, 1, 1, 2] },
  { id: 'saints', name: 'When the Saints Go Marching In', credit: 'traditional spiritual', notes: [0, 4, 5, 7, 0, 4, 5, 7], beats: [1, 1, 1, 5, 1, 1, 1, 5] },
  { id: 'ode', name: 'Ode to Joy', credit: 'Beethoven, 1824', notes: [4, 4, 5, 7, 7, 5, 4, 2, 0], beats: [1, 1, 1, 1, 1, 1, 1, 1, 1] },
  { id: 'susanna', name: 'Oh! Susanna', credit: 'Stephen Foster, 1848', notes: [0, 2, 4, 7, 7, 9, 7, 4, 0], beats: [0.5, 0.5, 1, 1, 1.5, 0.5, 1, 1, 1.5] },
  { id: 'grace', name: 'Amazing Grace', credit: 'tune "New Britain", 1830s', notes: [-5, 0, 4, 0, 4, 2, 0, -3, -5], beats: [1, 2, 0.5, 0.5, 2, 1, 2, 1, 2] }
];
const tuneById = id => TUNES.find(t => t.id === id);

export const TRACKS = [
  { id: 'degrees', title: 'Scale degrees in a key', blurb: 'A drone sets the key; tap the note you hear.',
    levels: [
      { name: '1, 3 and 5', pool: ['R', '3', '5'] },
      { name: 'Add 2 and 4', pool: ['R', '2', '3', '4', '5'] },
      { name: 'The major scale', pool: ['R', '2', '3', '4', '5', '6', '7'] },
      { name: 'Minor keys', pool: ['R', '2', 'b3', '4', '5', 'b6', 'b7'], minor: true },
      { name: 'All 12 notes', pool: CHROMATIC }] },
  { id: 'intervals', title: 'Intervals in melodies', blurb: 'Two notes of a melody; tap the second one.',
    levels: [
      { name: '3rds and 5ths', pool: ['M3', 'P5'] }, { name: 'Major or minor 3rd', pool: ['m3', 'M3'] },
      { name: '4th or 5th', pool: ['P4', 'P5'] }, { name: 'Minor or major 6th', pool: ['m6', 'M6'] },
      { name: 'Minor or major 7th', pool: ['m7', 'M7'] }, { name: 'All of them', pool: Object.keys(IV) }] },
  { id: 'chords', title: 'Chord quality', blurb: 'Hear a chord; tap its 3rd (and more).',
    levels: [
      { name: 'Major or minor: the 3rd', kinds: ['major', 'minor'], tones: ['3'] },
      { name: 'Add diminished: 3rd and 5th', kinds: ['major', 'minor', 'dim'], tones: ['3', '5'] },
      { name: '7th chords: 3rd and 7th', kinds: ['maj7', '7', 'm7'], tones: ['3', '7'] }] },
  { id: 'bass', title: 'Bass motion and progressions', blurb: 'Follow the bass: tap where the next chord\'s root went.',
    levels: [
      { name: 'I to IV or V', romans: ['IV', 'V'] }, { name: 'Add vi and ii', romans: ['IV', 'V', 'vi', 'ii'] },
      { name: 'Add iii and bVII', romans: ['ii', 'iii', 'IV', 'V', 'vi', 'bVII'] },
      { name: 'Whole progressions', progs: [['I', 'V', 'vi', 'IV'], ['I', 'IV', 'V', 'I'], ['vi', 'IV', 'I', 'V'], ['I', 'vi', 'IV', 'V'], ['I', 'bVII', 'IV', 'I']] }] },
  { id: 'dictation', title: 'Melodic dictation', blurb: 'Public-domain tunes: tap the notes you hear, in order.',
    levels: [
      { name: 'Stepwise tunes, 5 notes', tunes: ['row', 'mary', 'frere', 'joy'], len: 5 },
      { name: 'Leaps, 6 notes', tunes: ['twinkle', 'saints', 'ode', 'susanna'], len: 6 },
      { name: 'Whole phrases', tunes: TUNES.map(t => t.id), len: 9 }] }
];
export const findTrack = id => TRACKS.find(t => t.id === id);

/* ---------- adaptive level per track (settings.ear) ---------- */
// Up a level at 80% over the last 20 answers; down one after 10 answers under 50%.
const earState = () => ({ key: 'G', ...(getSettings().ear || {}) });
export const trackState = id => ({ level: 0, recent: [], best: 0, ...(earState()[id] || {}) });
export function setTrackLevel(id, level) { const st = earState(); st[id] = { ...trackState(id), level, recent: [] }; setSetting('ear', st); }
export const earKey = () => earState().key;
export const setEarKey = k => { const st = earState(); st.key = k; setSetting('ear', st); };
// Record one answer for the track; returns 'up' | 'down' | null.
export function trackAnswer(id, ok) {
  const st = earState(), t = trackState(id), max = findTrack(id).levels.length - 1;
  t.recent = [...t.recent, ok ? 1 : 0].slice(-20);
  let change = null;
  const rate = xs => xs.reduce((a, x) => a + x, 0) / xs.length;
  if (t.recent.length >= 20 && rate(t.recent) >= 0.8 && t.level < max) { t.level++; t.recent = []; change = 'up'; }
  else if (t.recent.length >= 10 && rate(t.recent.slice(-10)) < 0.5 && t.level > 0) { t.level--; t.recent = []; change = 'down'; }
  t.best = Math.max(t.best || 0, t.level);
  st[id] = t;
  setSetting('ear', st);
  return change;
}

/* ---------- shared helpers ---------- */
// Positions in view holding pitch class pc (optionally only some strings).
function spotsIn(ui, pc, strings = [0, 1, 2, 3, 4, 5]) {
  const out = [];
  strings.forEach(s => { for (let f = ui.o.from; f <= ui.o.to; f++) if (pcOf(midiAt(s, f)) === pcOf(pc)) out.push({ s, f, midi: midiAt(s, f) }); });
  return out;
}
const nearest = (list, s, f) => list.slice().sort((a, b) => Math.abs(a.s - s) + Math.abs(a.f - f) - Math.abs(b.s - s) - Math.abs(b.f - f))[0];
// A note of pitch class pc near midi `around` (for playing).
const near = (pc, around) => { let m = around - pcOf(around) + pcOf(pc); if (m - around > 6) m -= 12; if (around - m > 6) m += 12; return m; };
const nameIn = (keyPc, label, minor) => {
  if (label === 'R') return spell(keyPc, minor ? '1 2 b3' : '1 2 3').root;
  return spell(keyPc, `1 ${label}`).notes[1];
};
function playNotes(notes, { bpm = 100, delay = 0.1 } = {}) {
  if (!context()) return;
  let t = now() + delay;
  notes.forEach(([m, beats = 1]) => { if (m != null) pluckAt(m, t); t += beats * 60 / bpm; });
}
// I-IV-V-I in a key: sets the key in the ear (Functional Ear Trainer style).
export function cadence(keyPc, minor = false, delay = 0.05) {
  if (!context()) return 0;
  const t0 = now() + delay, beat = 0.42;
  const chords = minor ? [[0, 'minor'], [5, 'minor'], [7, 'major'], [0, 'minor']] : [[0, 'major'], [5, 'major'], [7, 'major'], [0, 'major']];
  chords.forEach(([up, kind], i) => strumAt(voicing(keyPc + up, kind), t0 + i * beat, { volume: 0.55 }));
  return delay + chords.length * beat + 0.2;
}
// Test hook: the expected answer pitch classes of the current question, in order.
const expect = pcs => { if (typeof window !== 'undefined') window.__earAnswer = pcs.map(pcOf); };
const playTools = (ui, buttons) => {
  ui.tools(buttons.map(([id, label]) => `<button class="${id === 'ear-again' ? 'primary' : ''}" id="${id}">${label}</button>`).join(''));
  buttons.forEach(([id, , fn]) => { ui.$('#' + id).onclick = fn; });
};

/* ---------- 1. scale degrees in a key ---------- */
export function degreeRound(ui, { key, label, minor = false, drone = true }) {
  const keyPc = parseNote(key), pc = pcOf(keyPc + CHROMATIC.indexOf(label)), shownAt = performance.now();
  const target = pick(spotsIn(ui, pc)), tonic = near(keyPc, target.midi);
  const name = nameIn(keyPc, label, minor), keyName = `${spell(keyPc, minor ? '1 2 b3' : '1 2 3').root} ${minor ? 'minor' : 'major'}`;
  let done = false;
  if (drone && !droneOn()) droneStart(keyPc);
  expect([pc]);
  ui.prompt(`Listen in <b>${esc(keyName)}</b>, then tap the note you heard.`);
  const play = () => playNotes([[target.midi]], { delay: 0.3 });
  playTools(ui, [['ear-again', '▶ Play again', play], ['ear-key', 'Hear the key', () => cadence(keyPc, minor)]]);
  play();
  return {
    tap({ s, f, pc: tp }) {
      if (done) return;
      done = true;
      const ok = tp === pc;
      recordAnswer(`ear:${label}`, ok, performance.now() - shownAt);
      ui.fb.mark(s, f, ok, ok ? name : preferredName(tp));
      if (!ok) { const at = nearest(spotsIn(ui, pc), s, f); ui.fb.mark(at.s, at.f, true, name, true); }
      playNotes([[target.midi, 1], [tonic, 2]], { delay: 0.2, bpm: 90 });  // the answer, resolving to the tonic
      ui.msg(`${ok ? 'Yes! ' : ''}That's ${name}, the ${degreeWords(label)} of ${keyName}. Hear it lead home to ${nameIn(keyPc, 'R', minor)}.`, ok ? 'good' : 'bad');
      ui.result(ok);
      ui.showNext();
    }
  };
}

/* ---------- 2. intervals in melodies ---------- */
export function intervalRound(ui, { key, id }) {
  const keyPc = parseNote(key), semis = IV[id], shownAt = performance.now();
  // first note: a note of the key, low enough that the second note fits in view
  const pool = [0, 2, 4, 5, 7].map(d => pcOf(keyPc + d));
  const starts = pool.flatMap(pc => spotsIn(ui, pc, [5, 4, 3])).filter(p => p.midi + semis <= midiAt(0, ui.o.to));
  const first = pick(starts), second = first.midi + semis, a = preferredName(first.midi), b = spell(pcOf(first.midi), `1 ${['', '', '', 'b3', '3', '4', '', '5', 'b6', '6', 'b7', '7'][semis]}`).notes[1];
  let done = false;
  ui.fb.setDots([{ s: first.s, f: first.f, label: a, role: 'root' }]);
  expect([second]);
  ui.prompt(`A melody goes from <b>${esc(a)}</b> to another note. Tap the second note.`);
  const play = () => playNotes([[first.midi, 1], [second, 2]], { bpm: 90, delay: 0.2 });
  playTools(ui, [['ear-again', '▶ Play again', play]]);
  play();
  return {
    tap({ s, f, pc }) {
      if (done) return;
      if (s === first.s && f === first.f) { ui.msg(`That's the first note, ${a}. Tap the second one.`, 'muted'); return; }
      done = true;
      const ok = pc === pcOf(second);
      recordAnswer(`interval-ear:${id}`, ok, performance.now() - shownAt);
      ui.fb.mark(s, f, ok, ok ? b : preferredName(pc));
      if (!ok) { const at = nearest(spotsIn(ui, pcOf(second)), s, f); ui.fb.mark(at.s, at.f, true, b, true); }
      playNotes([[first.midi, 1], [second, 1], [null, 0.5], [first.midi, 0.01], [second, 2]], { bpm: 90, delay: 0.2 });
      ui.msg(`${ok ? 'Yes! ' : ''}Up a ${IV_NAMES[id]}: ${a} to ${b}.`, ok ? 'good' : 'bad');
      ui.result(ok);
      ui.showNext();
    }
  };
}

/* ---------- 3. chord quality: tap the 3rd (then the 5th or 7th) ---------- */
const FORMULA = { major: '1 3 5', minor: '1 b3 5', dim: '1 b3 b5', maj7: '1 3 5 7', '7': '1 3 5 b7', m7: '1 b3 5 b7' };
const TONE_OF = {
  major: { 3: 4, 5: 7 }, minor: { 3: 3, 5: 7 }, dim: { 3: 3, 5: 6 },
  maj7: { 3: 4, 5: 7, 7: 11 }, '7': { 3: 4, 5: 7, 7: 10 }, m7: { 3: 3, 5: 7, 7: 10 }
};
const TONE_LABEL = { 3: '3rd', 5: '5th', 7: '7th' };
export function chordRound(ui, { kind, tones = ['3'] }) {
  const roots = spotsIn(ui, pick([0, 2, 4, 5, 7, 9]), [5, 4]).filter(p => p.f <= Math.min(ui.o.to, 7));
  const root = roots.length ? pick(roots) : spotsIn(ui, 9, [5])[0], rootPc = pcOf(root.midi), shownAt = performance.now();
  const rootName = spell(rootPc, '1 3 5').root;
  const spelled = spell(rootPc, FORMULA[kind]).notes;
  const wants = tones.map(t => ({ t, pc: pcOf(rootPc + TONE_OF[kind][t]), name: spelled[[3, 5, 7].indexOf(+t) + 1] }));
  let k = 0, allOk = true;
  ui.fb.setDots([{ s: root.s, f: root.f, label: 'R', role: 'root' }]);
  expect(wants.map(w => w.pc));
  const ask = () => ui.prompt(`Here's the root, <b>${esc(rootName)}</b>. Tap the chord's <b>${TONE_LABEL[wants[k].t]}</b>.${wants.length > 1 ? ` <span class="muted">${k + 1} of ${wants.length}</span>` : ''}`);
  const play = () => {
    if (!context()) return;
    const v = voicing(rootPc, kind), t0 = now() + 0.15;
    v.forEach((m, i) => pluckAt(m, t0 + i * 0.32, 0.8));
    strumAt(v, t0 + v.length * 0.32 + 0.3, { volume: 0.75 });
  };
  playTools(ui, [['ear-again', '▶ Play again', play]]);
  ask();
  play();
  return {
    tap({ s, f, pc }) {
      if (k >= wants.length) return;
      if (s === root.s && f === root.f) { ui.msg('That\'s the root. Tap the note asked for.', 'muted'); return; }
      const w = wants[k], ok = pc === w.pc;
      allOk = allOk && ok;
      ui.fb.mark(s, f, ok, ok ? w.name : preferredName(pc), k > 0);
      if (!ok) { const at = nearest(spotsIn(ui, w.pc), s, f); ui.fb.mark(at.s, at.f, true, w.name, true); }
      k++;
      if (k < wants.length) { ui.msg(ok ? 'Yes!' : `The ${TONE_LABEL[w.t]} is ${w.name}.`, ok ? 'good' : 'bad'); ask(); return; }
      recordAnswer(`chord-ear:${kind}`, allOk, performance.now() - shownAt);
      play();
      ui.msg(`${allOk ? 'Yes! ' : ''}That was ${rootName} ${CHORD_NAMES[kind]}: ${wants.map(x => `the ${TONE_LABEL[x.t]} is ${x.name}`).join(', ')}.`, allOk ? 'good' : 'bad');
      ui.result(allOk);
      ui.showNext();
    }
  };
}

/* ---------- 4. bass motion: tap where the next chord's root went ---------- */
export function bassRound(ui, { key, romans }) {
  const keyPc = parseNote(key), shownAt = performance.now();
  const chords = romans.map(r => chordOf(key, r));
  const first = spotsIn(ui, chords[0].root, [5, 4]).filter(p => p.f <= Math.min(ui.o.to, 7))[0] || spotsIn(ui, chords[0].root)[0];
  let k = 1, allOk = true;
  const label = r => r.replace(/b(?=[IV])/g, '♭');
  ui.fb.setDots([{ s: first.s, f: first.f, label: label(romans[0]), role: 'root' }]);
  expect(chords.slice(1).map(c => c.root));
  const ask = () => ui.prompt(romans.length === 2
    ? `In ${esc(spell(keyPc, '1 3').root)}: the first chord is <b>${esc(chords[0].name)}</b>. Tap the root of the next chord.`
    : `In ${esc(spell(keyPc, '1 3').root)}: tap the root of chord <b>${k + 1}</b> of ${romans.length}.`);
  const play = () => {
    if (!context()) return;
    const t0 = now() + 0.15;
    chords.forEach((c, i) => strumAt(voicing(c.root, c.chord), t0 + i * 0.9, { volume: 0.75 }));
  };
  playTools(ui, [['ear-again', '▶ Play again', play]]);
  ask();
  play();
  return {
    tap({ s, f, pc }) {
      if (k >= chords.length) return;
      const c = chords[k], ok = pc === pcOf(c.root);
      allOk = allOk && ok;
      recordAnswer(`bass:${romans[k]}`, ok, performance.now() - shownAt);
      ui.fb.mark(s, f, ok, ok ? label(romans[k]) : preferredName(pc), true);
      if (!ok) { const at = nearest(spotsIn(ui, c.root), s, f); ui.fb.mark(at.s, at.f, true, label(romans[k]), true); }
      k++;
      if (k < chords.length) { ui.msg(ok ? `Yes: ${c.name} (${label(romans[k - 1])}).` : `That chord was ${c.name} (${label(romans[k - 1])}).`, ok ? 'good' : 'bad'); ask(); return; }
      play();
      ui.msg(`${allOk ? 'Yes! ' : ''}${chords.map(x => x.name).join(' – ')}: ${romans.map(label).join('–')}.`, allOk ? 'good' : 'bad');
      ui.result(allOk);
      ui.showNext();
    }
  };
}

/* ---------- 5. melodic dictation ---------- */
export function dictationRound(ui, { key, tune: tuneId, len }) {
  const tune = tuneById(tuneId), keyPc = parseNote(key), n = Math.min(len || tune.notes.length, tune.notes.length), shownAt = performance.now();
  // the tonic register: keep every note inside the view
  const lowest = midiAt(5, ui.o.from), highest = midiAt(0, ui.o.to);
  let tonic = 48 + pcOf(keyPc - 48);
  while (tonic + Math.min(...tune.notes) < lowest) tonic += 12;
  while (tonic + Math.max(...tune.notes) > highest && tonic - 12 + Math.min(...tune.notes) >= lowest) tonic -= 12;
  const midis = tune.notes.slice(0, n).map(x => tonic + x), names = spell(keyPc, '1 2 3 4 5 6 7').byPc;
  const nm = m => names[pcOf(m)] || preferredName(m);
  const firstAt = spotsIn(ui, pcOf(midis[0])).sort((a, b) => Math.abs(a.midi - midis[0]) - Math.abs(b.midi - midis[0]) || b.s - a.s)[0];
  let k = 1, right = 0;
  ui.fb.setDots([{ s: firstAt.s, f: firstAt.f, label: nm(midis[0]), role: 'root' }]);
  expect(midis.slice(1));
  const ask = () => ui.prompt(`A ${n}-note melody in ${esc(spell(keyPc, '1 3').root)} major starts on <b>${esc(nm(midis[0]))}</b>. Tap note <b>${k + 1}</b> of ${n}.`);
  const play = () => { const d = cadence(keyPc); playNotes(midis.map((m, i) => [m, tune.beats[i]]), { bpm: 100, delay: d + 0.2 }); };
  playTools(ui, [['ear-again', '▶ Play again', play]]);
  ask();
  play();
  return {
    tap({ s, f, pc }) {
      if (k >= n) return;
      const want = midis[k], ok = pc === pcOf(want);
      if (ok) right++;
      ui.fb.mark(s, f, ok, ok ? nm(want) : preferredName(pc), true);
      if (!ok) { const at = nearest(spotsIn(ui, pcOf(want)), s, f); ui.fb.mark(at.s, at.f, true, nm(want), true); }
      k++;
      if (k < n) { ui.msg(ok ? 'Yes!' : `That note was ${nm(want)}.`, ok ? 'good' : 'bad'); ask(); return; }
      const allOk = right === n - 1;
      recordAnswer(`dictation:${tune.id}`, allOk, performance.now() - shownAt);
      playNotes(midis.map((m, i) => [m, tune.beats[i]]), { bpm: 100, delay: 0.3 });
      ui.msg(`${allOk ? 'Yes! ' : `${right} of ${n - 1} notes right. `}That's the start of "${tune.name}" (${tune.credit}): ${midis.map(nm).join(' ')}.`, allOk ? 'good' : 'bad');
      ui.result(allOk);
      ui.showNext();
    }
  };
}

/* ---------- a question for a track at a level ---------- */
export function nextQuestion(trackId, level, key) {
  const L = findTrack(trackId).levels[level], k = key === 'random' ? pick(KEYS) : key;
  if (trackId === 'degrees') return { round: degreeRound, want: { key: k, label: pick(L.pool), minor: !!L.minor } };
  if (trackId === 'intervals') return { round: intervalRound, want: { key: k, id: pick(L.pool) } };
  if (trackId === 'chords') return { round: chordRound, want: { kind: pick(L.kinds), tones: L.tones } };
  if (trackId === 'bass') return { round: bassRound, want: { key: pick(KEYS), romans: L.progs ? pick(L.progs) : ['I', pick(L.romans)] } };
  return { round: dictationRound, want: { key: pick(KEYS), tune: pick(L.tunes), len: L.len } };
}

// Review items this module can ask: bass:<roman>, dictation:<tune>.
export function asEarRound(id) {
  const [kind, rest] = id.split(':');
  if (kind === 'bass' && rest) { try { chordOf('C', rest); } catch { return null; } return { round: bassRound, want: { key: pick(KEYS), romans: ['I', rest] } }; }
  if (kind === 'dictation' && tuneById(rest)) return { round: dictationRound, want: { key: pick(KEYS), tune: rest, len: 5 } };
  return null;
}
export const stopEar = () => { if (droneOn()) droneStop(); };
