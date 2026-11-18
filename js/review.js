// Spaced review. Pure logic: no storage, no DOM, and every function takes the time
// (or day) it should use, so tests can fake the clock.
//
// Two schedulers:
//  - FSRS (ts-fsrs, default parameters) for fact-like items: notes on the neck, intervals,
//    scale degrees, chord tones and spellings, facts and every ear-training item. FSRS
//    tracks each item's memory stability and difficulty and asks it again just before
//    it would be forgotten (90% retention target).
//  - Leitner boxes for chord shapes and rhythms, which are playing skills (their speed
//    work lives on the clean-tempo ladder in js/storage.js).
//
// FSRS rules, matching the old boxes so the review feels the same:
//   wrong -> Again, right but slow (QUICK_MS or more) -> Hard, right and quick -> Good.
//   Only the first answer of a day counts, plus a first miss: drills that ask an item
//   five times in a row don't make it look five days better. Every item comes back
//   tomorrow at the earliest (no same-day "learning steps": the review is daily).
//   `box` is still kept (1-5, from stability vs GAPS) for "moved up / back" feedback.
// Schedule fields on an FSRS item: { fsrs: card, box, dueDay, reviewDay, missDay }.
//
// Leitner: five boxes; an item in box n comes back GAPS[n - 1] days after its last answer.
//   correct and quick (under QUICK_MS)  -> up one box (at most once a day)
//   correct but slow                    -> same box
//   wrong                               -> box 1, due tomorrow
// A miss sticks for the rest of that day: a later right answer the same day
// (e.g. a second try in a drill) doesn't move the item up again.
//
// Schedule fields kept on each Leitner item: { box, dueDay: 'YYYY-MM-DD', upDay, missDay }
import { fsrs, generatorParameters, createEmptyCard, Rating, State } from './vendor/ts-fsrs.js';

export const GAPS = [1, 3, 7, 14, 30];
export const QUICK_MS = 3000;
export const CAP = 20;          // questions in one daily session (about 12 minutes)
export const MAX_NEW = 5;       // new items from finished lessons per session
export const MAX_WEAK = 5;      // weak (but not yet due) items per session
export const MIN_PER_Q = 0.6;   // minutes per question, for the estimate

const pad = n => String(n).padStart(2, '0');
export const dayOf = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
export const addDays = (day, n) => dayOf(new Date(day + 'T12:00').getTime() + n * 86400000);

// Older items (before boxes) start in box 1, due the day after they were last seen.
export const boxOf = it => it.box || 1;
export const dueDayOf = it => it.dueDay || addDays(dayOf(it.lastSeen || Date.now()), 1);
export const isDue = (it, day) => dueDayOf(it) <= day;

// The new schedule fields after one answer. With the item id, fact-like items use FSRS.
export function schedule(it, correct, ms, now = Date.now(), id = null) {
  if (id && usesFsrs(id)) return scheduleFsrs(it, correct, ms, now);
  const day = dayOf(now);
  let box = boxOf(it), { upDay = null, missDay = null } = it;
  if (!correct) { box = 1; missDay = day; }
  else if (ms < QUICK_MS && upDay !== day && missDay !== day) { box = Math.min(GAPS.length, box + 1); upDay = day; }
  return { box, dueDay: addDays(day, GAPS[box - 1]), upDay, missDay };
}

/* ---------- FSRS ---------- */
export const FSRS_TYPES = ['note', 'interval', 'interval-ear', 'degree', 'tone', 'fact', 'ear', 'chord-ear', 'bass', 'dictation',
  'toneear', 'key', 'staff', 'keysig', 'inversion', 'fingering', 'count', 'sticking', 'groove-ear', 'feel-ear'];
export const usesFsrs = id => FSRS_TYPES.includes(String(id).split(':')[0]);
const scheduler = fsrs(generatorParameters({ learning_steps: [], relearning_steps: [], enable_short_term: false }));
export const gradeOf = (correct, ms) => (!correct ? Rating.Again : ms < QUICK_MS ? Rating.Good : Rating.Hard);
// A box (1-5) for a stability in days: the same boundaries as the Leitner gaps.
export const boxForStability = stability => 1 + GAPS.slice(1).filter(g => stability >= g).length;

// Cards are saved as JSON: dates as ISO strings.
const saveCard = c => ({ ...c, due: new Date(c.due).toISOString(), last_review: c.last_review ? new Date(c.last_review).toISOString() : null });
const loadCard = c => ({ ...c, due: new Date(c.due), last_review: c.last_review ? new Date(c.last_review) : undefined });
const noon = day => new Date(day + 'T12:00');

function scheduleFsrs(it, correct, ms, now) {
  const day = dayOf(now);
  let { reviewDay = null, missDay = null } = it;
  if (it.fsrs && reviewDay === day && (correct || missDay === day)) {
    // Already counted today: keep the schedule as it is.
    return { fsrs: it.fsrs, box: it.box, dueDay: it.dueDay, reviewDay, missDay };
  }
  const card = it.fsrs ? loadCard(it.fsrs) : createEmptyCard(new Date(now));
  const next = scheduler.next(card, new Date(now), gradeOf(correct, ms)).card;
  if (!correct) missDay = day;
  reviewDay = day;
  // A miss always comes back tomorrow, as with the boxes; otherwise FSRS picks the day (tomorrow at the earliest).
  const dueDay = correct ? [addDays(day, 1), dayOf(next.due.getTime())].sort()[1] : addDays(day, 1);
  return { fsrs: saveCard(next), box: boxForStability(next.stability), dueDay, reviewDay, missDay };
}

// An item answered under the old Leitner boxes, moved to FSRS without losing anything:
// its due day is kept, the box becomes a starting stability equal to that box's gap
// (box 3 = 7 days), difficulty comes from its accuracy, and its answer counts stay.
export function leitnerToFsrs(it, now = Date.now()) {
  const box = boxOf(it), stability = GAPS[box - 1], dueDay = dueDayOf(it);
  const acc = it.attempts ? it.correct / it.attempts : 1;
  const out = { ...it };
  delete out.upDay;
  out.fsrs = saveCard({
    due: noon(dueDay), stability, difficulty: acc >= 0.9 ? 4 : acc >= 0.75 ? 5.5 : 7,
    elapsed_days: 0, scheduled_days: stability, learning_steps: 0,
    reps: it.attempts || 0, lapses: Math.max(0, (it.attempts || 0) - (it.correct || 0)),
    state: it.attempts ? State.Review : State.New, last_review: it.lastSeen ? new Date(it.lastSeen) : undefined
  });
  out.box = box;
  out.dueDay = dueDay;
  out.reviewDay = it.upDay || null;
  out.missDay = it.missDay || null;
  return out;
}

/* ---------- today's session ---------- */
// Confusable pairs: both halves of a pair sit next to each other when both are in a session.
const PAIRS = [['m3', 'M3'], ['P4', 'P5'], ['m6', 'M6'], ['m7', 'M7']];
export const partnerOf = id => {
  const m = /^(interval(?:-ear)?):(\w+)$/.exec(id);
  const p = m && PAIRS.find(x => x.includes(m[2]));
  return p ? `${m[1]}:${p[0] === m[2] ? p[1] : p[0]}` : null;
};
export const typeOf = id => id.split(':')[0];

const accuracy = it => it.attempts ? it.correct / it.attempts : 1;

// items: { id: stats } of everything met so far; lessonItems: ids from finished lessons.
// ok(id): whether the review screen can ask this item.
// Returns { questions, due, fresh, carried, bonus }; carried = due items left for tomorrow.
export function buildSession({ items, lessonItems = [], day, ok = () => true, rng = Math.random, cap = CAP }) {
  const met = Object.entries(items).filter(([id]) => ok(id));
  const due = met.filter(([, it]) => isDue(it, day))
    .sort(([, a], [, b]) => dueDayOf(a).localeCompare(dueDayOf(b)) || boxOf(a) - boxOf(b) || accuracy(a) - accuracy(b))
    .map(([id]) => id);
  const picked = due.slice(0, cap);
  const carried = due.length - picked.length;
  const taken = new Set(picked);

  const weak = met.filter(([id, it]) => !taken.has(id) && it.attempts >= 3 && accuracy(it) < 0.8)
    .sort(([, a], [, b]) => accuracy(a) - accuracy(b)).map(([id]) => id);
  for (const id of weak.slice(0, MAX_WEAK)) if (picked.length < cap) { picked.push(id); taken.add(id); }

  const fresh = [...new Set(lessonItems)].filter(id => ok(id) && !items[id]).slice(0, MAX_NEW);
  for (const id of fresh) if (picked.length < cap) { picked.push(id); taken.add(id); }

  // Nothing due and nothing new: a short bonus round of the weakest items instead.
  if (!due.length && !fresh.length) {
    const bonus = met.filter(([, it]) => it.attempts && accuracy(it) < 1)
      .sort(([, a], [, b]) => accuracy(a) - accuracy(b)).slice(0, 8).map(([id]) => id);
    return { questions: interleave(bonus, rng), due: 0, fresh: 0, carried: 0, bonus: true };
  }
  return { questions: interleave(picked, rng), due: due.length, fresh: fresh.length, carried, bonus: false };
}

// Shuffle, glue confusable pairs together, then deal question types out in turn
// so the same kind rarely comes twice in a row.
export function interleave(ids, rng = Math.random) {
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const set = new Set(ids), used = new Set(), units = [];
  for (const id of shuffle(ids)) {
    if (used.has(id)) continue;
    const p = partnerOf(id);
    used.add(id);
    if (p && set.has(p) && !used.has(p)) { used.add(p); units.push([id, p]); } else units.push([id]);
  }
  const byType = new Map();
  units.forEach(u => { const t = typeOf(u[0]); byType.set(t, [...(byType.get(t) || []), u]); });
  const out = [];
  let last = null;
  while (out.length < ids.length) {
    // Take from the type with the most left, skipping the one just used when possible.
    const types = [...byType.entries()].filter(([, q]) => q.length).sort((a, b) => b[1].length - a[1].length);
    const [t, q] = types.find(([t]) => t !== last) || types[0];
    out.push(...q.shift());
    last = t;
  }
  return out;
}

export const estimateMinutes = n => Math.max(1, Math.round(n * MIN_PER_Q));
