// Saved progress in localStorage under one versioned key.
// Shape (version 3):
// {
//   version: 3,
//   instrument: 'guitar' | 'bass' | 'piano' | 'drums',   // the instrument being learned right now
//   // ---- per instrument: progress that only means something on that instrument ----
//   instruments: { [instrumentId]: {
//     lessons:  { [lessonId]: { unlocked, completed, lastScore, bestScore, attempts, completedAt, playBpm } },
//     items:    { [itemId]: {...} }   // position items only ("note:G@s5", "chordshape:c"): they feed the heat map
//     placement: 0 | level number the placement quiz opened (levels below it are open too)
//     tempos:   { [exerciseId]: { best, title, unit?, history: [{ day, bpm }] } }  // highest clean bpm (or best
//               count, unit 'changes', for one-minute chord changes), best per day
//     goals:    { [goalId]: { started: day, days: [day], checks: { [checkId]: day } } }  // multi-week goals
//     review:   { day, queue: [itemId], index, results: [{ id, ok, from, to }], done, bonus, key, seconds } | null  // today's session
//   } },
//   // ---- shared, app-wide ----
//   items:    { [itemId]: { attempts, correct, avgMs, lastSeen, ...schedule } }  // theory items (facts, degrees,
//             intervals, chord tones, ear training, rhythms): the same item on every instrument (js/review.js)
//   log:      [ { id, date: 'YYYY-MM-DD', time: 'HH:MM', minutes, activity, detail, instrument,
//                 drill?, lesson?, score?, total?,   // drills and lesson checks
//                 tab?, pct?, bpm? } ],              // play-alongs
//   days:     ['YYYY-MM-DD', ...]   // every day with practice; the streak is counted from this
//   streak:   { current, best, lastDay },  // kept for older data; best is a floor
//   confusions: { 'a-b': count }   // intervals mixed up, by semitones from the root (sorted), e.g. '3-4' = m3/M3
//   milestones: { [badgeId]: { at, seen } }
//   settings: { labels, sound, metroVol, droneVol, tabVol, tabClickVol,
//               metronome: { bpm, sig: '4/4', subdiv: 1, accent: true } },
//   practice: { custom: [{ name, minutes, bpm }], drills: { [drillId]: options }, tabTempo: { [tabId]: percent } },
//   fretboard: { last: {setup}, favorites: ['scale:dorian', 'chord:m7'], setups: [{ name, ...setup }], moreOpen }
// }
// A fretboard setup: { key, kind: 'scale'|'chord', id, labels, from, to, ... }
// Item ids: "note:G@s5" = note G on string 5 (A string), "interval:m3", "chord:Am" ...
// Times are ms since epoch; days are 'YYYY-MM-DD' in local time.
// The rest of the app calls getLesson, recordAnswer, allItems... as before: they read and
// write the current instrument's part, or the shared part, as the item or record needs.

import { schedule, isDue } from './review.js';

const KEY = 'fretboard-lab';
export const VERSION = 3;

// Instruments the app knows about. Only the ready ones can be picked in Settings.
export const INSTRUMENTS = [
  { id: 'guitar', name: 'Guitar', ready: true },
  { id: 'bass', name: 'Bass', ready: false },
  { id: 'piano', name: 'Piano', ready: false },
  { id: 'drums', name: 'Drums', ready: false }
];
// Items tied to one instrument's neck or shapes; every other item is shared theory.
const POSITION_ITEM = /^(note|chordshape):/;
export const isPositionItem = id => POSITION_ITEM.test(id);

const blankInstrument = () => ({ lessons: {}, items: {}, placement: 0, tempos: {}, goals: {}, review: null });

const blank = () => ({
  version: VERSION,
  instrument: 'guitar',
  instruments: { guitar: blankInstrument() },
  items: {},
  log: [],
  days: [],
  streak: { current: 0, best: 0, lastDay: null },
  confusions: {},
  milestones: {},
  settings: {
    labels: 'notes', sound: true, metroVol: 0.7, droneVol: 0.5, tabVol: 0.8, tabClickVol: 0.6,
    metronome: { bpm: 80, sig: '4/4', subdiv: 1, accent: true }
  },
  practice: { custom: null, drills: {}, tabTempo: {} },
  fretboard: { last: null, favorites: [], setups: [], moreOpen: false }
});

// Each entry upgrades data from version N to N+1. Add one when the shape changes.
const MIGRATIONS = {
  // Version 2 moved lessons: the circle-of-fifths lesson (l2-5) became Level 5's
  // "Keys, the capo and transposing" (l5-keys). Its progress moves with it.
  1: d => {
    if (d.lessons?.['l2-5']) { d.lessons['l5-keys'] = { ...d.lessons['l2-5'] }; delete d.lessons['l2-5']; }
    d.version = 2;
    return d;
  },
  // Version 3 split progress by instrument. Everything saved so far was guitar: its lessons,
  // position items, placement, clean tempos, goals and today's review move under
  // instruments.guitar; theory items, the log, practice days and the streak stay shared.
  2: d => {
    const guitar = { ...blankInstrument(), lessons: d.lessons || {}, placement: d.placement || 0,
      tempos: d.tempos || {}, goals: d.goals || {}, review: d.review || null };
    const shared = {};
    for (const [id, it] of Object.entries(d.items || {})) (POSITION_ITEM.test(id) ? guitar.items : shared)[id] = it;
    for (const k of ['lessons', 'placement', 'tempos', 'goals', 'review']) delete d[k];
    d.items = shared;
    d.instruments = { guitar };
    d.instrument = 'guitar';
    d.log = (d.log || []).map(e => ({ instrument: 'guitar', ...e }));
    d.version = 3;
    return d;
  }
};

function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch { return blank(); }
  if (!raw) return blank();
  try {
    return normalize(JSON.parse(raw));
  } catch (e) {
    // Keep the unreadable copy so nothing is silently lost, then start fresh.
    try { localStorage.setItem(KEY + ':backup', raw); } catch { }
    console.warn('Saved progress could not be read; starting fresh.', e);
    return blank();
  }
}

// Bring saved (or imported) data up to the current shape. Throws if it can't.
function normalize(d) {
  if (!d || typeof d !== 'object' || typeof d.version !== 'number') throw new Error('not Fretboard Lab progress');
  while (d.version < VERSION && MIGRATIONS[d.version]) d = MIGRATIONS[d.version](d);
  if (d.version !== VERSION) throw new Error('unknown version ' + d.version);
  const b = blank();
  const out = { ...b, ...d, streak: { ...b.streak, ...d.streak }, settings: { ...b.settings, ...d.settings },
    fretboard: { ...b.fretboard, ...d.fretboard }, practice: { ...b.practice, ...d.practice } };
  out.settings.metronome = { ...b.settings.metronome, ...(d.settings || {}).metronome };
  if (!Array.isArray(out.log) || !Array.isArray(out.days) || typeof out.items !== 'object' || !out.instruments || typeof out.instruments !== 'object') throw new Error('missing parts');
  if (!INSTRUMENTS.some(i => i.id === out.instrument)) out.instrument = 'guitar';
  out.instruments = Object.fromEntries(Object.entries(out.instruments).map(([k, v]) => {
    if (!v || typeof v !== 'object' || (v.lessons && typeof v.lessons !== 'object')) throw new Error('missing parts');
    return [k, { ...blankInstrument(), ...v }];
  }));
  if (!out.instruments[out.instrument]) out.instruments[out.instrument] = blankInstrument();
  // Older data: give log entries ids, and build the practice-day list from the log and old streak.
  out.log = out.log.map(e => ({ time: '', instrument: 'guitar', ...e, id: e.id || newId() }));
  if (!d.days) {
    const days = new Set(out.log.map(e => e.date));
    if (out.streak.lastDay) for (let k = 0; k < Math.max(1, out.streak.current); k++) days.add(shiftDay(out.streak.lastDay, -k));
    out.days = [...days].sort();
  }
  return out;
}

// Listeners run once after a burst of saves (the Progress tab dot uses this).
const listeners = new Set();
let notifying = false;
export const onSave = fn => { listeners.add(fn); return () => listeners.delete(fn); };
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { console.warn('Could not save progress', e); }
  if (listeners.size && !notifying) { notifying = true; queueMicrotask(() => { notifying = false; listeners.forEach(fn => fn()); }); }
}

const DAY = 86400000;
export const today = (t = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const dayDiff = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / DAY);
export const shiftDay = (day, n) => today(new Date(day + 'T12:00').getTime() + n * DAY);
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const nowTime = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

let data = load(); // after the helpers it uses

/* ---------- instrument ---------- */
// The current instrument's part of the profile, and where an item lives.
const inst = () => data.instruments[data.instrument] || (data.instruments[data.instrument] = blankInstrument());
const itemsFor = id => (POSITION_ITEM.test(id) ? inst().items : data.items);

export const getInstrument = () => data.instrument;
// Switch instruments. Shared progress (theory items, log, streak) is untouched; the
// instrument's own lessons, positions, placement and tempos are kept until it's picked again.
export function setInstrument(id) {
  if (!INSTRUMENTS.some(i => i.id === id) || id === data.instrument) return;
  data.instrument = id;
  inst();
  save();
}

/* ---------- settings ---------- */
export const getSettings = () => ({ ...data.settings });
export function setSetting(key, value) { data.settings[key] = value; save(); }

/* ---------- practice tab: custom routine, drill options, tab tempos ---------- */
export const getPracticePrefs = () => JSON.parse(JSON.stringify(data.practice));
export function updatePracticePrefs(patch) { Object.assign(data.practice, patch); save(); }

/* ---------- fretboard tab: favorites, saved setups, last setup ---------- */
export const getFretboardPrefs = () => JSON.parse(JSON.stringify(data.fretboard));
export function updateFretboardPrefs(patch) { Object.assign(data.fretboard, patch); save(); }

/* ---------- spaced-review items ---------- */
const MAX_MS = 30000;

// Record one answer from a lesson, drill or the daily review. Updates the
// stats and the item's Leitner box (see js/review.js for the rules).
export function recordAnswer(itemId, correct, ms) {
  const t = Date.now();
  const store = itemsFor(itemId);
  const it = store[itemId] || { attempts: 0, correct: 0, avgMs: 0, lastSeen: 0 };
  ms = Math.min(MAX_MS, Math.max(0, Math.round(ms || 0)));
  it.attempts++;
  if (correct) it.correct++;
  it.avgMs = Math.round(it.avgMs + (ms - it.avgMs) / it.attempts);
  it.lastSeen = t;
  Object.assign(it, schedule(it, correct, ms, t));
  delete it.due; delete it.interval; // older schedule fields
  store[itemId] = it;
  touchStreak();
  save();
  return { ...it };
}

export const getItem = id => (itemsFor(id)[id] ? { ...itemsFor(id)[id] } : null);
// Shared theory items plus the current instrument's position items.
const visibleItems = () => ({ ...data.items, ...inst().items });
export const allItems = () => JSON.parse(JSON.stringify(visibleItems()));
export const dueItems = (prefix = '', day = today()) => {
  const all = visibleItems();
  return Object.keys(all).filter(id => id.startsWith(prefix) && isDue(all[id], day));
};

/* ---------- clean tempo: the highest bpm an exercise was played cleanly ---------- */
export const getTempo = id => (inst().tempos[id] ? JSON.parse(JSON.stringify(inst().tempos[id])) : null);
export const allTempos = () => JSON.parse(JSON.stringify(inst().tempos));
export function recordClean(id, bpm, title, unit) {
  bpm = Math.round(bpm);
  const t = inst().tempos[id] || { best: 0, title, history: [] }, d = today();
  t.title = title || t.title;
  if (unit) t.unit = unit;
  t.best = Math.max(t.best, bpm);
  const h = t.history.find(x => x.day === d);
  if (h) h.bpm = Math.max(h.bpm, bpm); else t.history.push({ day: d, bpm });
  inst().tempos[id] = t;
  touchStreak();
  save();
  return { ...t };
}
// Where to start next time: a little below the best clean tempo.
export const startBelow = best => Math.max(30, Math.round(best * 0.9));

/* ---------- multi-week goals (e.g. barre chords) ---------- */
export const getGoal = id => (inst().goals[id] ? JSON.parse(JSON.stringify(inst().goals[id])) : null);
function goal(id) { return inst().goals[id] || (inst().goals[id] = { started: today(), days: [], checks: {} }); }
export function practiseGoal(id) { const g = goal(id); if (!g.days.includes(today())) g.days.push(today()); touchStreak(); save(); return getGoal(id); }
export function checkGoal(id, checkId, on = true) { const g = goal(id); if (on) g.checks[checkId] = today(); else delete g.checks[checkId]; save(); return getGoal(id); }

/* ---------- placement quiz ---------- */
export const getPlacement = () => inst().placement || 0;
export function setPlacement(level) { inst().placement = Math.max(getPlacement(), level); save(); }

/* ---------- today's review session (kept so a reload can resume it) ---------- */
export const getReview = () => (inst().review ? JSON.parse(JSON.stringify(inst().review)) : null);
export function setReview(r) { inst().review = r ? JSON.parse(JSON.stringify(r)) : null; save(); }

/* ---------- lessons ---------- */
export const getLesson = id => ({ unlocked: false, completed: false, lastScore: null, bestScore: null, attempts: 0, ...inst().lessons[id] });
export function unlockLesson(id) { inst().lessons[id] = { ...getLesson(id), unlocked: true }; save(); }
// The learner's tempo on a lesson's Play it card.
export function setLessonBpm(id, bpm) { inst().lessons[id] = { ...getLesson(id), playBpm: bpm }; save(); }
export function completeLesson(id, score) {
  const l = getLesson(id);
  inst().lessons[id] = {
    ...l, unlocked: true, completed: true, attempts: l.attempts + 1, lastScore: score,
    bestScore: l.bestScore == null ? score : Math.max(l.bestScore, score), completedAt: Date.now()
  };
  touchStreak();
  save();
}

/* ---------- practice log and daily streak ---------- */
// Entries: { id, date, time, minutes, activity, detail, instrument }. Adding one counts its
// day as practiced (also for entries added later for an earlier day).
export function addLog(entry) {
  const e = { date: today(), time: nowTime(), minutes: 0, activity: '', detail: '', instrument: data.instrument, ...entry, id: newId() };
  e.minutes = Math.max(0, Math.round(+e.minutes || 0));
  data.log.push(e);
  touchStreak(e.date);
  save();
  return { ...e };
}
export function updateLog(id, patch) {
  const e = data.log.find(x => x.id === id);
  if (!e) return;
  Object.assign(e, patch, { id });
  e.minutes = Math.max(0, Math.round(+e.minutes || 0));
  touchStreak(e.date);
  save();
}
export function deleteLog(id) { data.log = data.log.filter(x => x.id !== id); save(); }
export const getLog = () => data.log.map(e => ({ ...e }));
export const getDays = () => data.days.slice();
export const minutesOn = (day = today()) => data.log.filter(e => e.date === day).reduce((a, e) => a + e.minutes, 0);

function touchStreak(day = today()) {
  if (!data.days.includes(day)) { data.days.push(day); data.days.sort(); }
  const s = getStreak();
  data.streak = { current: s.current, best: s.best, lastDay: data.days[data.days.length - 1] };
}

// Current streak: consecutive practice days ending today (or yesterday, so a
// streak stays alive until a whole day is missed).
// A kinder streak: one missed day per week (Monday to Sunday) counts as a rest day
// and doesn't break it. Today never counts as missed until it's over.
const mondayOf = day => shiftDay(day, -((new Date(day + 'T12:00').getDay() + 6) % 7));
export function getStreak(t = today()) {
  const set = new Set(data.days), first = data.days[0];
  // current: walk back from today (or yesterday) through practiced days and one rest day per week
  let day = set.has(t) ? t : shiftDay(t, -1), current = 0;
  const rested = new Set();
  while (first && day >= first) {
    if (set.has(day)) current++;
    // a single missed day between practice days, once per week, is a rest day
    else if (!rested.has(mondayOf(day)) && set.has(shiftDay(day, -1))) rested.add(mondayOf(day));
    else break;
    day = shiftDay(day, -1);
  }
  // best: the same rule over the whole history
  let best = 0, run = 0;
  const restedAll = new Set();
  for (let d = first; first && d <= t; d = shiftDay(d, 1)) {
    if (set.has(d)) { run++; best = Math.max(best, run); }
    else if (d !== t && !restedAll.has(mondayOf(d)) && set.has(shiftDay(d, 1))) restedAll.add(mondayOf(d));
    else if (d !== t) { run = 0; }
  }
  const mon = mondayOf(t);
  let weekDays = 0;
  for (let d = mon; d <= t; d = shiftDay(d, 1)) if (set.has(d)) weekDays++;
  return { current, best: Math.max(best, current, data.streak.best || 0), practicedToday: set.has(t), weekDays,
    restUsedThisWeek: rested.has(mon) };
}

/* ---------- mix-ups and milestones ---------- */
// Two intervals (semitones above the root) mixed up once: asked for `want`, answered `got`.
export function recordConfusion(want, got) {
  if (want === got || want < 0 || got < 0 || want > 11 || got > 11) return;
  const k = Math.min(want, got) + '-' + Math.max(want, got);
  data.confusions[k] = (data.confusions[k] || 0) + 1;
  save();
}
export const getConfusions = () => ({ ...data.confusions });

export const getMilestones = () => JSON.parse(JSON.stringify(data.milestones));
// ids: badges earned now. Returns the ones that are new.
export function earnMilestones(ids) {
  const fresh = ids.filter(id => !data.milestones[id]);
  fresh.forEach(id => { data.milestones[id] = { at: Date.now(), seen: false }; });
  if (fresh.length) save();
  return fresh;
}
export function seeMilestones() {
  let changed = false;
  Object.values(data.milestones).forEach(m => { if (!m.seen) { m.seen = true; changed = true; } });
  if (changed) save();
}

/* ---------- export / import ---------- */
export const exportData = () => ({ app: 'fretboard-lab', exportedAt: new Date().toISOString(), data: JSON.parse(JSON.stringify(data)) });

// Check a parsed export file. Returns the normalized data or throws a readable error.
export function readExport(file) {
  const d = file && file.app === 'fretboard-lab' ? file.data : file;
  try { return normalize(JSON.parse(JSON.stringify(d))); }
  catch { throw new Error("This file isn't a Fretboard Lab progress file."); }
}

// mode 'replace': the file wins. mode 'merge': keep the higher / newer value of each.
export function importData(file, mode) {
  const inc = readExport(file);
  data = mode === 'replace' ? inc : merge(data, inc);
  save();
}

// An item's stats come as a set: keep whichever copy has more answers (then the newer one).
function mergeItems(out, inc) {
  for (const [id, it] of Object.entries(inc)) {
    const m = out[id];
    if (!m || it.attempts > m.attempts || (it.attempts === m.attempts && it.lastSeen > m.lastSeen)) out[id] = it;
  }
}

// One instrument's progress from two copies (both already normalized, so the same shape).
function mergeInstrument(out, b) {
  for (const [id, l] of Object.entries(b.lessons)) {
    const m = out.lessons[id];
    if (!m) { out.lessons[id] = l; continue; }
    const newer = (l.completedAt || 0) > (m.completedAt || 0) ? l : m;
    out.lessons[id] = {
      ...m, ...newer,
      unlocked: !!(m.unlocked || l.unlocked), completed: !!(m.completed || l.completed),
      attempts: Math.max(m.attempts || 0, l.attempts || 0),
      bestScore: m.bestScore == null ? l.bestScore : l.bestScore == null ? m.bestScore : Math.max(m.bestScore, l.bestScore),
      playBpm: m.playBpm ?? l.playBpm
    };
  }
  mergeItems(out.items, b.items);
  out.placement = Math.max(out.placement || 0, b.placement || 0);
  for (const [id, g] of Object.entries(b.goals || {})) {
    const m = out.goals[id];
    out.goals[id] = m ? { started: m.started < g.started ? m.started : g.started, days: [...new Set([...m.days, ...g.days])].sort(), checks: { ...g.checks, ...m.checks } } : g;
  }
  for (const [id, t] of Object.entries(b.tempos || {})) {
    const m = out.tempos[id];
    if (!m) { out.tempos[id] = t; continue; }
    const days = new Map(m.history.map(h => [h.day, h.bpm]));
    t.history.forEach(h => days.set(h.day, Math.max(days.get(h.day) || 0, h.bpm)));
    out.tempos[id] = { ...m, best: Math.max(m.best, t.best), history: [...days].map(([day, bpm]) => ({ day, bpm })).sort((x, y) => x.day.localeCompare(y.day)) };
  }
  // Today's review session stays as it is on this device.
}

// Both copies are normalized first (readExport), so an old export arrives already split by instrument.
function merge(a, b) {
  const out = JSON.parse(JSON.stringify(a));
  for (const [k, v] of Object.entries(b.instruments)) {
    if (out.instruments[k]) mergeInstrument(out.instruments[k], v);
    else out.instruments[k] = v;
  }
  mergeItems(out.items, b.items);
  const ids = new Set(out.log.map(e => e.id));
  b.log.forEach(e => { if (!ids.has(e.id)) out.log.push(e); });
  out.log.sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time));
  out.days = [...new Set([...out.days, ...b.days])].sort();
  out.streak.best = Math.max(out.streak.best || 0, b.streak.best || 0);
  for (const [k, n] of Object.entries(b.confusions)) out.confusions[k] = Math.max(out.confusions[k] || 0, n);
  for (const [k, m] of Object.entries(b.milestones)) {
    const o = out.milestones[k];
    out.milestones[k] = o ? { at: Math.min(o.at, m.at), seen: o.seen || m.seen } : m;
  }
  // Settings stay as they are on this device; favorites and saved setups are combined.
  out.fretboard.favorites = [...new Set([...out.fretboard.favorites, ...b.fretboard.favorites])];
  const names = new Set(out.fretboard.setups.map(x => x.name));
  b.fretboard.setups.forEach(x => { if (!names.has(x.name)) out.fretboard.setups.push(x); });
  out.practice.tabTempo = { ...b.practice.tabTempo, ...out.practice.tabTempo };
  return out;
}

export function resetAll() { data = blank(); save(); }
