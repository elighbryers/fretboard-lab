// The path: six levels in the order from docs/research-findings.md section 5.
// A level with `level` data has lessons; the rest show as "coming soon".
import level1 from './level1.js';
import { fretboardLink } from '../router.js';

export const LEVELS = [
  { title: 'The neck and note names', blurb: 'String names, the musical alphabet, natural notes on the E and A strings, octave shapes.', level: level1 },
  { title: 'The major scale and keys', blurb: 'Build the major scale from whole and half steps, then move it to any key.',
    peek: { label: 'G major on the neck', link: fretboardLink({ key: 'G', scale: 'major', labels: 'intervals' }) } },
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

export function findLesson(id) {
  for (const l of LEVELS) if (l.level) {
    const nodes = nodesOf(l.level), i = nodes.findIndex(n => n.id === id);
    if (i >= 0) return { lesson: nodes[i], next: nodes[i + 1] || null, level: l.level };
  }
  return null;
}
