// The Learn path's rules: which levels and lessons are open, and what's next.
// Levels open in order (finishing a Level Challenge opens the next one); the
// placement quiz can open a later level directly.
import { LEVELS, nodesOf } from './lessons/index.js';
import { getLesson, getPlacement } from './storage.js';

const done = id => getLesson(id).completed;

// li: 0-based level index.
export function levelOpen(li) {
  const L = LEVELS[li];
  if (!L?.level) return false;
  if (li === 0 || getPlacement() > li) return true;
  const prev = LEVELS.slice(0, li).reverse().find(x => x.level);
  if (prev && done(prev.level.challenge.id)) return true;
  return nodesOf(L.level).some(n => getLesson(n.id).unlocked || done(n.id));
}
export const levelDone = li => !!LEVELS[li]?.level && done(LEVELS[li].level.challenge.id);

// A node is open if its level is open and it's first, its predecessor is done,
// or storage unlocked it.
export function nodeOpen(li, i) {
  if (!levelOpen(li)) return false;
  const nodes = nodesOf(LEVELS[li].level);
  return i === 0 || done(nodes[i - 1].id) || getLesson(nodes[i].id).unlocked;
}

// The first open node that isn't done yet: { levelIndex, index, node } or null.
// After the placement quiz, the placed level comes first.
export function nextUp() {
  const p = Math.min(getPlacement(), LEVELS.length) - 1, order = LEVELS.map((_, i) => i);
  if (p > 0) order.unshift(...order.splice(p));
  for (const li of order) {
    if (!levelOpen(li)) continue;
    const nodes = nodesOf(LEVELS[li].level);
    const i = nodes.findIndex((n, k) => nodeOpen(li, k) && !done(n.id));
    if (i >= 0) return { levelIndex: li, index: i, node: nodes[i] };
  }
  return null;
}
