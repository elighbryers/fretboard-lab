// Saved progress in localStorage under one versioned key.
// Shape (version 1):
// {
//   version: 1,
//   lessons:  { [lessonId]: { unlocked, completed, lastScore, bestScore, attempts, completedAt, playBpm } },
//   items:    { [itemId]: { attempts, correct, avgMs, lastSeen, due, interval } }  // spaced review
//   log:      [ { date: 'YYYY-MM-DD', minutes, activity, detail } ],
//   streak:   { current, best, lastDay },
//   settings: { labels: 'notes' | 'intervals' | 'none', sound: true }
// }
// Item ids: "note:G@s5" = note G on string 5 (A string), "interval:m3", "chord:Am" ...
// Times are ms since epoch; `interval` is the review gap in days.

const KEY = 'fretboard-lab';
export const VERSION = 1;

const blank = () => ({
  version: VERSION,
  lessons: {},
  items: {},
  log: [],
  streak: { current: 0, best: 0, lastDay: null },
  settings: { labels: 'notes', sound: true }
});

// Each entry upgrades data from version N to N+1. Add one when the shape changes.
const MIGRATIONS = {
  // 1: data => { ...; data.version = 2; return data; }
};

let data = load();

function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch { return blank(); }
  if (!raw) return blank();
  try {
    let d = JSON.parse(raw);
    while (d.version < VERSION && MIGRATIONS[d.version]) d = MIGRATIONS[d.version](d);
    if (d.version !== VERSION) throw new Error('unknown version ' + d.version);
    const b = blank();
    return { ...b, ...d, streak: { ...b.streak, ...d.streak }, settings: { ...b.settings, ...d.settings } };
  } catch (e) {
    // Keep the unreadable copy so nothing is silently lost, then start fresh.
    try { localStorage.setItem(KEY + ':backup', raw); } catch { }
    console.warn('Saved progress could not be read; starting fresh.', e);
    return blank();
  }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { console.warn('Could not save progress', e); }
}

const DAY = 86400000;
export const today = (t = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const dayDiff = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / DAY);

/* ---------- settings ---------- */
export const getSettings = () => ({ ...data.settings });
export function setSetting(key, value) { data.settings[key] = value; save(); }

/* ---------- spaced-review items ---------- */
const FAST_MS = 3000, MAX_MS = 30000;

// Record one answer. Correct answers push the next review further out (faster
// answers further still); a miss brings the item back in 10 minutes.
export function recordAnswer(itemId, correct, ms) {
  const t = Date.now();
  const it = data.items[itemId] || { attempts: 0, correct: 0, avgMs: 0, lastSeen: 0, due: t, interval: 0 };
  ms = Math.min(MAX_MS, Math.max(0, Math.round(ms || 0)));
  it.attempts++;
  if (correct) it.correct++;
  it.avgMs = Math.round(it.avgMs + (ms - it.avgMs) / it.attempts);
  it.lastSeen = t;
  if (correct) {
    it.interval = it.interval ? it.interval * (ms <= FAST_MS ? 2.5 : 1.5) : (ms <= FAST_MS ? 1 : 0.5);
    it.due = t + it.interval * DAY;
  } else {
    it.interval = 0;
    it.due = t + 10 * 60000;
  }
  data.items[itemId] = it;
  touchStreak();
  save();
  return { ...it };
}

export const getItem = id => data.items[id] ? { ...data.items[id] } : null;
export const allItems = () => JSON.parse(JSON.stringify(data.items));
export const dueItems = (prefix = '', t = Date.now()) =>
  Object.keys(data.items).filter(id => id.startsWith(prefix) && data.items[id].due <= t);

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
export function addLog(entry) {
  data.log.push({ date: today(), minutes: 0, activity: '', detail: '', ...entry });
  touchStreak();
  save();
}
export const getLog = () => data.log.slice();

function touchStreak() {
  const s = data.streak, d = today();
  if (s.lastDay === d) return;
  s.current = s.lastDay && dayDiff(s.lastDay, d) === 1 ? s.current + 1 : 1;
  s.best = Math.max(s.best, s.current);
  s.lastDay = d;
}

// Current streak, counting a streak as alive until a whole day is missed.
export function getStreak() {
  const s = data.streak;
  const alive = s.lastDay && dayDiff(s.lastDay, today()) <= 1;
  return { current: alive ? s.current : 0, best: s.best, practicedToday: s.lastDay === today() };
}

export function resetAll() { data = blank(); save(); }
