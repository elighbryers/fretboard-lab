// Spaced review, Leitner style. Pure logic: no storage, no DOM, and every
// function takes the time (or day) it should use, so tests can fake the clock.
//
// Five boxes; an item in box n comes back GAPS[n - 1] days after its last answer.
//   correct and quick (under QUICK_MS)  -> up one box (at most once a day)
//   correct but slow                    -> same box
//   wrong                               -> box 1, due tomorrow
// A miss sticks for the rest of that day: a later right answer the same day
// (e.g. a second try in a drill) doesn't move the item up again.
//
// Schedule fields kept on each item in storage: { box, dueDay: 'YYYY-MM-DD', upDay, missDay }

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

// The new schedule fields after one answer.
export function schedule(it, correct, ms, now = Date.now()) {
  const day = dayOf(now);
  let box = boxOf(it), { upDay = null, missDay = null } = it;
  if (!correct) { box = 1; missDay = day; }
  else if (ms < QUICK_MS && upDay !== day && missDay !== day) { box = Math.min(GAPS.length, box + 1); upDay = day; }
  return { box, dueDay: addDays(day, GAPS[box - 1]), upDay, missDay };
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
