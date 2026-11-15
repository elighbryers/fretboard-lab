// The path: six levels in the order from docs/research-findings.md section 5.
// A level with `level` data has lessons; the rest show as "coming soon".
import level1 from './level1.js';
import level2 from './level2.js';
import { fretboardLink } from '../router.js';
import { NOTES, TUNINGS, midiAt, pcOf } from '../theory.js';

export const LEVELS = [
  { title: 'The neck and note names', blurb: 'String names, the musical alphabet, natural notes on the E and A strings, octave shapes.', level: level1 },
  { title: 'The major scale and keys', blurb: 'Build the major scale from whole and half steps, then move it to any key.', level: level2 },
  { title: 'Intervals', blurb: 'Hear and find distances from the root: 3rds, 5ths, octaves and more.',
    peek: { label: 'Intervals in C', link: fretboardLink({ key: 'C', scale: 'major', labels: 'intervals' }) } },
  { title: 'Chords and CAGED', blurb: 'Triads from 1-3-5, the chords in a key, and the five CAGED shapes.',
    peek: { label: 'G major chord tones', link: fretboardLink({ key: 'G', chord: 'major', labels: 'intervals' }) } },
  { title: 'Progressions', blurb: 'Roman numerals, I–IV–V, the pop progression, ii–V–I, and hearing them.' },
  { title: 'Improvising', blurb: 'Pentatonic positions, landing on chord tones, phrasing and the blues.',
    peek: { label: 'A minor pentatonic', link: fretboardLink({ key: 'A', scale: 'minor-pentatonic' }) } }
];

// Lessons in unlock order for a level, with the challenge last.
export const nodesOf = level => [...level.lessons, level.challenge];

// A lesson (or challenge) by id, with the node after it: the next lesson in its
// level, or after a challenge the first lesson of the next level with content.
export function findLesson(id) {
  for (let li = 0; li < LEVELS.length; li++) {
    const l = LEVELS[li];
    if (!l.level) continue;
    const nodes = nodesOf(l.level), i = nodes.findIndex(n => n.id === id);
    if (i < 0) continue;
    const after = LEVELS.slice(li + 1).find(x => x.level);
    return { lesson: nodes[i], next: nodes[i + 1] || (after ? nodesOf(after.level)[0] : null), level: l.level, levelIndex: li };
  }
  return null;
}

/* ---------- review items a lesson introduces ---------- */
const tuning = TUNINGS.standard;
// { string, fret } in guitar numbering -> "note:A@s5"
export const noteItemAt = ({ string, fret }) => `note:${NOTES[pcOf(midiAt(tuning.strings.findIndex(x => x.num === string), fret, tuning))]}@s${string}`;

// Every review id a lesson asks about (Try it taps, Check questions, and an optional `review: [ids]`).
export function itemsOf(lesson) {
  const st = lesson.steps || {}, ids = [...(lesson.review || [])];
  const steps = lesson.flow || Object.values(st);
  const first = a => (Array.isArray(a) ? a[0] : a);
  steps.forEach(step => {
    (step.tasks || []).forEach(t => ids.push(t.item || noteItemAt(first(t.answer))));
    (step.questions || []).forEach(q => ids.push(q.type === 'choice' ? q.item : q.item || noteItemAt(first(q.answer))));
  });
  return [...new Set(ids.filter(Boolean))];
}

// Ids from the lessons a learner has finished. isDone(id) -> bool.
export const finishedLessonItems = isDone =>
  LEVELS.filter(l => l.level).flatMap(l => nodesOf(l.level)).filter(n => isDone(n.id)).flatMap(itemsOf);

// The Check question behind a "fact:" item, for asking it again in review.
export function factQuestion(id) {
  for (const l of LEVELS) if (l.level) for (const n of nodesOf(l.level)) {
    const steps = n.flow || Object.values(n.steps || {});
    const q = steps.flatMap(st => st.questions || []).find(q => q.type === 'choice' && q.item === id);
    if (q) return q;
  }
  return null;
}
