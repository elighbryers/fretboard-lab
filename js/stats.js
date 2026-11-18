// Numbers for the Progress tab, worked out from saved progress (js/storage.js).
// Nothing here saves except checkMilestones(), which records newly earned badges.
import { allItems, getLog, getStreak, getLesson, getConfusions, getMilestones, earnMilestones, getDays, today, shiftDay } from './storage.js';
import { registeredList } from './registry.js';
import { countOf } from './rhythm-grid.js';
import { currentLevels, nodesOf } from './lessons/index.js';
import { PLAYALONG } from './playalong/index.js';
import { nextUp } from './path.js';

const DRILL_NAMES = { notes: 'Note finder', hear: 'Hear it, find it', intervals: 'Interval trainer' };
const IV_NAMES = ['root', 'minor 2nd', 'major 2nd', 'minor 3rd', 'major 3rd', 'perfect 4th', 'tritone',
  'perfect 5th', 'minor 6th', 'major 6th', 'minor 7th', 'major 7th'];
const IV_IDS = { m3: 3, M3: 4, P4: 5, P5: 7, m6: 8, M6: 9, m7: 10, M7: 11 };
const ORD = { 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th' };

export const fmtMin = m => m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
export const fmtDay = (day, opts = { month: 'short', day: 'numeric' }) => new Date(day + 'T12:00').toLocaleDateString(undefined, opts);
// Monday of the week a day falls in.
export const weekOf = day => shiftDay(day, -((new Date(day + 'T12:00').getDay() + 6) % 7));

/* ---------- the log, with structured fields filled in for older entries ---------- */
// Older entries only have text ("Drill: Note finder", "7/10 · ..."), so read the numbers back out of it.
function entries() {
  return getLog().map(e => {
    const out = { ...e };
    const m = /^(\d+)\/(\d+)/.exec(e.detail || '') || /Check (\d+)\/(\d+)/.exec(e.detail || '');
    if (out.drill == null && /^Drill: /.test(e.activity)) {
      const t = e.activity.slice(7);
      out.drill = Object.keys(DRILL_NAMES).find(k => DRILL_NAMES[k] === t) || (t === 'Weak spots' ? 'review' : t);
    }
    if (out.lesson == null && /^Lesson: /.test(e.activity)) out.lesson = e.activity.slice(8);
    if (out.score == null && (out.drill || out.lesson) && m) { out.score = +m[1]; out.total = +m[2]; }
    if (out.tab == null && /^Play-along: /.test(e.activity)) {
      out.tab = PLAYALONG.find(t => t.title === e.activity.slice(12))?.id || null;
      const p = /(\d+)% tempo/.exec(e.detail || '');
      if (out.tab && p) { out.pct = +p[1]; out.bpm = Math.round(PLAYALONG.find(t => t.id === out.tab).bpm * out.pct / 100); }
    }
    return out;
  });
}

const minutesBy = log => log.reduce((m, e) => (m[e.date] = (m[e.date] || 0) + e.minutes, m), {});

/* ---------- at a glance ---------- */
export function learnPath() {
  const up = nextUp();
  if (!up) return { level: currentLevels().length, text: 'All levels done' };
  const L = currentLevels()[up.levelIndex].level, n = up.levelIndex + 1;
  if (up.node.challenge) return { level: n, text: `Level ${n} · challenge next` };
  const done = L.lessons.filter(x => getLesson(x.id).completed).length;
  return { level: n, text: `Level ${n} · ${done} of ${L.lessons.length}` };
}

export function glance() {
  const log = getLog(), t = today(), mon = weekOf(t), streak = getStreak();
  const sum = f => log.filter(f).reduce((a, e) => a + e.minutes, 0);
  return {
    streak, path: learnPath(),
    today: sum(e => e.date === t),
    week: sum(e => e.date >= mon && e.date <= t),
    all: sum(() => true)
  };
}

/* ---------- charts ---------- */
// [{ day, minutes }] for the last n days, oldest first.
export function dailyMinutes(n = 30) {
  const by = minutesBy(getLog()), t = today();
  return Array.from({ length: n }, (_, k) => { const day = shiftDay(t, k - n + 1); return { day, minutes: by[day] || 0 }; });
}

// [{ week, right, total, pct|null }] for the last n weeks (drill rounds and lesson-check questions).
export function weeklyAccuracy(n = 12) {
  const thisWeek = weekOf(today()), rows = Array.from({ length: n }, (_, k) => ({ week: shiftDay(thisWeek, 7 * (k - n + 1)), right: 0, total: 0 }));
  entries().filter(e => e.total > 0).forEach(e => {
    const r = rows.find(x => x.week === weekOf(e.date));
    if (r) { r.right += e.score; r.total += e.total; }
  });
  return rows.map(r => ({ ...r, pct: r.total ? Math.round(100 * r.right / r.total) : null }));
}

// Weeks (Monday first) covering the last n weeks: [[{ day, minutes, practiced, future }, x7], ...]
export function calendar(n = 16) {
  const by = minutesBy(getLog()), days = new Set(getDays()), t = today(), start = shiftDay(weekOf(t), -7 * (n - 1));
  return Array.from({ length: n }, (_, w) => Array.from({ length: 7 }, (_, d) => {
    const day = shiftDay(start, w * 7 + d);
    return { day, minutes: by[day] || 0, practiced: days.has(day), future: day > t };
  }));
}

/* ---------- weak spots ---------- */
export const DRILLABLE = /^(note|ear|interval|interval-ear):/;

// "note:G#@s5" -> "G# on string 5", "interval-ear:m3" -> "minor 3rd by ear"
export function itemName(id) {
  const [kind, rest] = id.split(':');
  if (kind === 'note') { const [n, s] = rest.split('@s'); return `${n} on string ${s}`; }
  if (kind === 'ear') {
    if (rest === 'R') return 'the root, in a key';
    const m = /^(b|#)?(\d)$/.exec(rest);
    return m ? `${m[1] === 'b' ? 'flat ' : m[1] === '#' ? 'sharp ' : ''}${ORD[m[2]]}, in a key` : rest;
  }
  if (kind === 'interval') return `${IV_NAMES[IV_IDS[rest]] || rest} on the neck`;
  if (kind === 'interval-ear') return `${IV_NAMES[IV_IDS[rest]] || rest} by ear`;
  if (kind === 'degree' || kind === 'tone') {
    const [key, scale, label] = id.split(':').slice(1);
    const deg = label === 'R' ? 'root' : (/^b/.test(label) ? 'flat ' : '') + (ORD[label.replace(/\D/g, '')] || label);
    return kind === 'degree' ? `${deg} of ${key} ${scale.replace(/-/g, ' ')}` : `${deg} of the ${key} ${scale} chord`;
  }
  if (kind === 'bass') return `bass motion from I to ${rest.replace(/b(?=[IV])/g, '♭')}`;
  if (kind === 'dictation') return `melody by ear: ${{ row: 'Row, Row, Row Your Boat', mary: 'Mary Had a Little Lamb', frere: 'Frère Jacques', joy: 'Joy to the World', twinkle: 'Twinkle, Twinkle', saints: 'When the Saints', ode: 'Ode to Joy', susanna: 'Oh! Susanna', grace: 'Amazing Grace' }[rest] || rest}`;
  if (kind === 'chordshape') return `${rest.toUpperCase().replace('M', 'm')} chord shape`;
  if (kind === 'rhythm' && rest.startsWith('bass-')) return `bass rhythm on ${rest.slice(5).split('-').map(n => (+n % 4 ? `${countOf(+n)} of ${Math.floor(+n / 4) + 1}` : countOf(+n))).join(', ')}`;
  if (kind === 'toneear') return `${rest === 'R' ? 'root' : ORD[rest]} of a chord, by ear`;
  // piano and drums items
  if (kind === 'key') { const [n, o] = rest.split('@'); return `${n}${o ?? ''} on the keyboard`; }
  if (kind === 'staff') { const [clef, n] = rest.split('@'); return `${n} on the ${clef} staff`; }
  if (kind === 'keysig') return `the key signature of ${rest}`;
  if (kind === 'inversion') return `${rest.replace(':', ' ')} inversion`;
  if (kind === 'fingering') return `fingering: ${rest.replace(/-/g, ' ')}`;
  if (kind === 'sticking') return `${rest.replace(/-/g, ' ')} sticking`;
  if (kind === 'count') return `counting ${rest.replace(/-/g, ' ')}`;
  if (kind === 'groove-ear') return `${rest.replace(/-/g, ' ')} groove by ear`;
  if (kind === 'feel-ear') return `${rest} feel by ear`;
  if (kind === 'rhythm') return `${{ quarters: 'quarter notes', eighths: 'eighth notes', 'first-strum': 'first strumming pattern', rests: 'rests on 2 and 4', waltz: '3/4 time', syncopation: 'syncopation', 'six-eight': '6/8 time', shuffle: 'shuffle', sixteenths: 'sixteenth notes' }[rest] || rest} (rhythm)`;
  if (kind === 'chord-ear') return `${{ major: 'major', minor: 'minor', dim: 'diminished', maj7: 'major 7', '7': 'dominant 7', m7: 'minor 7' }[rest] || rest} chord by ear`;
  return id;
}

// Lowest accuracy first, among drillable items tried at least `min` times. Ties: slower first.
export function weakest(n = 5, min = 3) {
  return Object.entries(allItems())
    .filter(([id, it]) => DRILLABLE.test(id) && it.attempts >= min)
    .map(([id, it]) => ({ id, name: itemName(id), attempts: it.attempts, acc: it.correct / it.attempts, ms: it.avgMs }))
    .filter(x => x.acc < 1)
    .sort((a, b) => a.acc - b.acc || b.ms - a.ms)
    .slice(0, n);
}

// Note-finder stats per position: fn(s, f, tuning) -> { acc, attempts } or null.
export function noteStats(itemAt) {
  const items = allItems();
  return (s, f) => { const it = items[itemAt(s, f)]; return it && it.attempts ? { acc: it.correct / it.attempts, attempts: it.attempts, correct: it.correct } : null; };
}

// [{ a, b, count }] most-confused interval pairs, by name.
export function confusedPairs(min = 2, n = 4) {
  return Object.entries(getConfusions())
    .map(([k, count]) => { const [x, y] = k.split('-').map(Number); return { a: IV_NAMES[x], b: IV_NAMES[y], count }; })
    .filter(p => p.count >= min)
    .sort((p, q) => q.count - p.count)
    .slice(0, n);
}

/* ---------- drill and tab stats ---------- */
export function drillStats() {
  const log = entries();
  return Object.entries(DRILL_NAMES).map(([id, title]) => {
    const runs = log.filter(e => e.drill === id && e.total > 0), pcts = runs.map(e => e.score / e.total);
    return {
      id, title, sessions: runs.length,
      best: runs.length ? Math.round(100 * Math.max(...pcts)) : null,
      avg: runs.length ? Math.round(100 * pcts.reduce((a, p) => a + p, 0) / runs.length) : null
    };
  });
}

export function tabStats() {
  const log = entries();
  return PLAYALONG.map(t => {
    const runs = log.filter(e => e.tab === t.id), top = runs.reduce((a, e) => Math.max(a, e.pct || 0), 0);
    return { id: t.id, title: t.title, times: runs.length, pct: top || null, bpm: top ? Math.round(t.bpm * top / 100) : null };
  });
}

/* ---------- milestones ---------- */
// Instruments add their own badges (registered from js/bass/ etc.); a badge with `earnedElsewhere`
// is earned by the drill or lesson that knows (earnMilestones) and its test is never true here.
const allBadges = () => [...BADGES, ...registeredList('badges')];
const notesFound = () => Object.entries(allItems()).filter(([id]) => /^(note|ear):/.test(id)).reduce((a, [, it]) => a + it.correct, 0);

export const BADGES = [
  { id: 'first-lesson', glyph: '1', title: 'First lesson', how: 'Finish any lesson',
    test: () => currentLevels().some(l => l.level && nodesOf(l.level).some(x => getLesson(x.id).completed)) },
  { id: 'level-1', glyph: 'L1', title: 'Level 1 complete', how: 'Finish every Level 1 lesson and the challenge',
    test: () => !!currentLevels()[0]?.level && nodesOf(currentLevels()[0].level).every(x => getLesson(x.id).completed) },
  { id: 'streak-3', glyph: '3', title: '3-day streak', how: 'Practice 3 days in a row', test: s => s.streak.best >= 3 },
  { id: 'streak-7', glyph: '7', title: '7-day streak', how: 'Practice 7 days in a row', test: s => s.streak.best >= 7 },
  { id: 'streak-30', glyph: '30', title: '30-day streak', how: 'Practice 30 days in a row', test: s => s.streak.best >= 30 },
  { id: 'notes-100', glyph: '100', title: '100 notes found', how: 'Find 100 notes in drills and lessons', test: s => s.notes >= 100 },
  { id: 'notes-500', glyph: '500', title: '500 notes found', how: 'Find 500 notes in drills and lessons', test: s => s.notes >= 500 },
  { id: 'first-tab', glyph: '♪', title: 'First play-along', how: 'Play along with a tab for 20 seconds or more', test: s => s.tabs > 0 },
  { id: 'hours-10', glyph: '10h', title: '10 hours practiced', how: 'Log 10 hours of practice in total', test: s => s.minutes >= 600 }
];

// Earned badges with dates; records any newly earned ones. Returns [{ ...badge, earned, at, fresh }].
export function checkMilestones() {
  const BADGES = allBadges();
  const log = getLog();
  const s = { streak: getStreak(), notes: notesFound(), tabs: entries().filter(e => e.tab).length, minutes: log.reduce((a, e) => a + e.minutes, 0) };
  earnMilestones(BADGES.filter(b => b.test(s)).map(b => b.id));
  const got = getMilestones();
  return BADGES.map(b => ({ ...b, earned: !!got[b.id], at: got[b.id]?.at || null, fresh: got[b.id] ? !got[b.id].seen : false }));
}
