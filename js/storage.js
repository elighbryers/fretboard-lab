// Saved progress in localStorage under one versioned key.
// Shape (version 1):
// {
//   version: 1,
//   lessons:  { [lessonId]: { unlocked, completed, lastScore, bestScore, attempts, completedAt, playBpm } },
//   items:    { [itemId]: { attempts, correct, avgMs, lastSeen, box, dueDay, upDay, missDay } }  // spaced review (js/review.js)
//   log:      [ { id, date: 'YYYY-MM-DD', time: 'HH:MM', minutes, activity, detail,
//                 drill?, lesson?, score?, total?,   // drills and lesson checks
//                 tab?, pct?, bpm? } ],              // play-alongs
//   days:     ['YYYY-MM-DD', ...]   // every day with practice; the streak is counted from this
//   streak:   { current, best, lastDay },  // kept for older data; best is a floor
//   confusions: { 'a-b': count }   // intervals mixed up, by semitones from the root (sorted), e.g. '3-4' = m3/M3
//   milestones: { [badgeId]: { at, seen } }
//   placement: 0 | level number the placement quiz opened (levels below it are open too)
//   review:   { day, queue: [itemId], index, results: [{ id, ok, from, to }], done, bonus, key, seconds } | null  // today's session
//   settings: { labels, sound, metroVol, droneVol, tabVol, tabClickVol,
//               metronome: { bpm, sig: '4/4', subdiv: 1, accent: true } },
//   practice: { custom: [{ name, minutes, bpm }], drills: { [drillId]: options }, tabTempo: { [tabId]: percent } },
//   fretboard: { last: {setup}, favorites: ['scale:dorian', 'chord:m7'], setups: [{ name, ...setup }], moreOpen }
// }
// A fretboard setup: { key, kind: 'scale'|'chord', id, labels, from, to, ... }
// Item ids: "note:G@s5" = note G on string 5 (A string), "interval:m3", "chord:Am" ...
// Times are ms since epoch; days are 'YYYY-MM-DD' in local time.

import { schedule, isDue } from './review.js';

const KEY = 'fretboard-lab';
export const VERSION = 1;

const blank = () => ({
  version: VERSION,
  lessons: {},
  items: {},
  log: [],
  days: [],
  streak: { current: 0, best: 0, lastDay: null },
  confusions: {},
  milestones: {},
  review: null,
  placement: 0,
  settings: {
    labels: 'notes', sound: true, metroVol: 0.7, droneVol: 0.5, tabVol: 0.8, tabClickVol: 0.6,
    metronome: { bpm: 80, sig: '4/4', subdiv: 1, accent: true }
  },
  practice: { custom: null, drills: {}, tabTempo: {} },
  fretboard: { last: null, favorites: [], setups: [], moreOpen: false }
});

// Each entry upgrades data from version N to N+1. Add one when the shape changes.
const MIGRATIONS = {
  // 1: data => { ...; data.version = 2; return data; }
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
  if (!Array.isArray(out.log) || !Array.isArray(out.days) || typeof out.items !== 'object' || typeof out.lessons !== 'object') throw new Error('missing parts');
  // Older data: give log entries ids, and build the practice-day list from the log and old streak.
  out.log = out.log.map(e => ({ time: '', ...e, id: e.id || newId() }));
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
  const it = data.items[itemId] || { attempts: 0, correct: 0, avgMs: 0, lastSeen: 0 };
  ms = Math.min(MAX_MS, Math.max(0, Math.round(ms || 0)));
  it.attempts++;
  if (correct) it.correct++;
  it.avgMs = Math.round(it.avgMs + (ms - it.avgMs) / it.attempts);
  it.lastSeen = t;
  Object.assign(it, schedule(it, correct, ms, t));
  delete it.due; delete it.interval; // older schedule fields
  data.items[itemId] = it;
  touchStreak();
  save();
  return { ...it };
}

export const getItem = id => data.items[id] ? { ...data.items[id] } : null;
export const allItems = () => JSON.parse(JSON.stringify(data.items));
export const dueItems = (prefix = '', day = today()) =>
  Object.keys(data.items).filter(id => id.startsWith(prefix) && isDue(data.items[id], day));

/* ---------- placement quiz ---------- */
export const getPlacement = () => data.placement || 0;
export function setPlacement(level) { data.placement = Math.max(getPlacement(), level); save(); }

/* ---------- today's review session (kept so a reload can resume it) ---------- */
export const getReview = () => data.review ? JSON.parse(JSON.stringify(data.review)) : null;
export function setReview(r) { data.review = r ? JSON.parse(JSON.stringify(r)) : null; save(); }

/* ---------- lessons ---------- */
export const getLesson = id => ({ unlocked: false, completed: false, lastScore: null, bestScore: null, attempts: 0, ...data.lessons[id] });
export function unlockLesson(id) { data.lessons[id] = { ...getLesson(id), unlocked: true }; save(); }
// The learner's tempo on a lesson's Play it card.
export function setLessonBpm(id, bpm) { data.lessons[id] = { ...getLesson(id), playBpm: bpm }; save(); }
export function completeLesson(id, score) {
  const l = getLesson(id);
  data.lessons[id] = {
    ...l, unlocked: true, completed: true, attempts: l.attempts + 1, lastScore: score,
    bestScore: l.bestScore == null ? score : Math.max(l.bestScore, score), completedAt: Date.now()
  };
  touchStreak();
  save();
}

/* ---------- practice log and daily streak ---------- */
// Entries: { id, date, time, minutes, activity, detail }. Adding one counts its
// day as practiced (also for entries added later for an earlier day).
export function addLog(entry) {
  const e = { date: today(), time: nowTime(), minutes: 0, activity: '', detail: '', ...entry, id: newId() };
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
export function getStreak() {
  const set = new Set(data.days), t = today();
  let day = set.has(t) ? t : shiftDay(t, -1), current = 0;
  while (set.has(day)) { current++; day = shiftDay(day, -1); }
  let best = 0, run = 0, prev = null;
  for (const d of data.days) { run = prev && dayDiff(prev, d) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = d; }
  return { current, best: Math.max(best, data.streak.best || 0), practicedToday: set.has(t) };
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

function merge(a, b) {
  const out = JSON.parse(JSON.stringify(a));
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
  // An item's stats come as a set: keep whichever copy has more answers (then the newer one).
  for (const [id, it] of Object.entries(b.items)) {
    const m = out.items[id];
    if (!m || it.attempts > m.attempts || (it.attempts === m.attempts && it.lastSeen > m.lastSeen)) out.items[id] = it;
  }
  const ids = new Set(out.log.map(e => e.id));
  b.log.forEach(e => { if (!ids.has(e.id)) out.log.push(e); });
  out.log.sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time));
  out.days = [...new Set([...out.days, ...b.days])].sort();
  out.streak.best = Math.max(out.streak.best || 0, b.streak.best || 0);
  out.placement = Math.max(out.placement || 0, b.placement || 0);
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
