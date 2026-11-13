// Learn tab (home): the path map, and the lesson player at #learn?lesson=<id>.
import { LEVELS, nodesOf, findLesson } from '../lessons/index.js';
import { runLesson } from '../lesson-player.js';
import { getLesson } from '../storage.js';
import { go } from '../router.js';

let el, cleanup = null;

// A node is open if it's first, its predecessor is complete, or storage unlocked it.
const isOpen = (nodes, i) => i === 0 || getLesson(nodes[i - 1].id).completed || getLesson(nodes[i].id).unlocked;

// The first open node that isn't complete yet.
function nextUp(nodes) {
  const i = nodes.findIndex((n, k) => isOpen(nodes, k) && !getLesson(n.id).completed);
  return i < 0 ? null : { node: nodes[i], index: i };
}

function renderMap() {
  const level1 = LEVELS[0].level, nodes = nodesOf(level1), up = nextUp(nodes);
  const label = n => (n.challenge ? n.title : `Lesson ${nodes.indexOf(n) + 1}`);
  el.innerHTML = `
    ${up ? `<a class="continue" href="#learn?lesson=${up.node.id}">
      <span class="muted">${nodes.slice(0, up.index).some(n => getLesson(n.id).completed) ? 'Continue' : 'Start here'}</span>
      <b>${label(up.node)}: ${up.node.challenge ? 'find notes against the clock' : up.node.title}</b>
      <span class="go">${up.node.steps || up.node.challenge ? '▶' : '→'}</span></a>` : ''}
    <h2>Your path</h2>
    <ol class="path">${LEVELS.map((L, li) => L.level ? `
      <li class="level open">
        <div class="level-head"><div class="num">${li + 1}</div><div><h3>${L.title}</h3><p>${L.blurb}</p></div></div>
        <ol class="nodes">${nodes.map((n, i) => {
          const p = getLesson(n.id), open = isOpen(nodes, i), cur = up && up.node === n;
          const state = p.completed ? 'done' : cur ? 'current' : open ? 'open' : 'locked';
          const icon = p.completed ? '✓' : !open ? '🔒' : n.challenge ? '★' : i + 1;
          const sub = p.completed ? `Done · best ${p.bestScore}/4` : !open ? 'Locked' : n.steps ? 'Ready' : n.challenge ? 'Ready' : 'Content coming soon';
          const inner = `<span class="dot">${icon}</span><span class="txt"><b>${n.title}</b><small>${sub}</small></span>`;
          return `<li class="node ${state}${n.challenge ? ' challenge' : ''}">${open ? `<a href="#learn?lesson=${n.id}">${inner}</a>` : `<div>${inner}</div>`}</li>`;
        }).join('')}</ol>
      </li>` : `
      <li class="level locked">
        <div class="level-head"><div class="num">${li + 1}</div><div><h3>${L.title}</h3><p>${L.blurb}</p>
          <div class="row"><span class="pill">🔒 Coming soon</span>${L.peek ? `<a class="link" href="${L.peek.link}">${L.peek.label} →</a>` : ''}</div></div></div>
      </li>`).join('')}</ol>`;
}

function renderPlaceholder(lesson) {
  el.innerHTML = `
    <div class="lesson"><div class="card">
      <div class="step-name">${lesson.challenge ? 'Level Challenge' : 'Lesson'}</div>
      <h2>${lesson.title}</h2>
      <p class="muted">This ${lesson.challenge ? 'challenge' : 'lesson'} is coming soon.</p>
      <button id="ls-back-path">Back to path</button>
    </div></div>`;
  el.querySelector('#ls-back-path').onclick = () => go('learn');
}

export default {
  id: 'learn',
  title: 'Learn',
  icon: '<path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',

  mount(section) { el = section; },

  show(params) {
    cleanup?.();
    cleanup = null;
    const found = params.get('lesson') && findLesson(params.get('lesson'));
    if (found) {
      const nodes = nodesOf(found.level), idx = nodes.indexOf(found.lesson);
      if (!isOpen(nodes, idx)) { go('learn'); return; }
      if (!found.lesson.steps) { renderPlaceholder(found.lesson); return; }
      cleanup = runLesson(el, found.lesson, {
        next: found.next,
        onExit: () => go('learn'),
        onContinue: () => go('learn', found.next ? { lesson: found.next.id } : {})
      });
      window.scrollTo(0, 0);
      return;
    }
    renderMap();
  },

  hide() { cleanup?.(); cleanup = null; }
};
