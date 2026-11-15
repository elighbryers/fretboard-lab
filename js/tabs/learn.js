// Learn tab (home): today's review, the path map, the lesson player at
// #learn?lesson=<id>, the daily review at #learn?review=1 and the placement
// quiz at #learn?placement=1.
import { LEVELS, nodesOf, findLesson } from '../lessons/index.js';
import { runLesson } from '../lesson-player.js';
import { runPlacement } from '../placement.js';
import { getLesson } from '../storage.js';
import { levelOpen, levelDone, nodeOpen, nextUp } from '../path.js';
import { go } from '../router.js';
import { runReview, reviewCardHTML, startReview, planToday } from '../review-screen.js';
import { esc } from '../ui.js';
import { planCardHTML, wirePlanCard } from '../plan.js';
import { findSkill, renderSkill, skillRowHTML } from '../skills.js';

let el, cleanup = null;

function renderMap() {
  const up = nextUp();
  const anyDone = LEVELS.some(L => L.level && nodesOf(L.level).some(n => getLesson(n.id).completed));
  const label = (L, n) => (n.challenge ? n.title : `Lesson ${nodesOf(L.level).indexOf(n) + 1}`);
  el.innerHTML = `
    ${planCardHTML()}
    ${reviewCardHTML()}
    ${up ? (() => { const L = LEVELS[up.levelIndex]; return `<a class="continue" href="#learn?lesson=${up.node.id}">
      <span class="muted">${anyDone ? 'Continue' : 'Start here'} · Level ${up.levelIndex + 1}</span>
      <b>${label(L, up.node)}: ${esc(up.node.title)}</b>
      <span class="go">▶</span></a>`; })() : ''}
    ${!anyDone ? '<a class="link placement-link" href="#learn?placement=1">Already play? Take the placement quiz →</a>' : ''}
    <h2>Your path</h2>
    <ol class="path">${LEVELS.map((L, li) => {
      if (!L.level) return `
      <li class="level locked">
        <div class="level-head"><div class="num">${li + 1}</div><div><h3>${L.title}</h3><p>${L.blurb}</p>
          <div class="row"><span class="pill">🔒 Coming soon</span>${L.peek ? `<a class="link" href="${L.peek.link}">${L.peek.label} →</a>` : ''}</div></div></div>
      </li>`;
      const open = levelOpen(li), nodes = nodesOf(L.level);
      if (!open) return `
      <li class="level locked">
        <div class="level-head"><div class="num">${li + 1}</div><div><h3>${L.title}</h3><p>${L.blurb}</p>
          <div class="row"><span class="pill">🔒 Finish the Level ${li} Challenge to open</span>${L.peek ? `<a class="link" href="${L.peek.link}">${L.peek.label} →</a>` : ''}</div></div></div>
      </li>`;
      return `
      <li class="level open${levelDone(li) ? ' done' : ''}">
        <div class="level-head"><div class="num">${levelDone(li) ? '✓' : li + 1}</div><div><h3>${L.title}</h3><p>${L.blurb}</p></div></div>
        ${skillRowHTML(li + 1)}
        <ol class="nodes">${nodes.map((n, i) => {
          const p = getLesson(n.id), nodeIsOpen = nodeOpen(li, i), cur = up && up.node === n;
          const state = p.completed ? 'done' : cur ? 'current' : nodeIsOpen ? 'open' : 'locked';
          const icon = p.completed ? '✓' : !nodeIsOpen ? '🔒' : n.challenge ? '★' : i + 1;
          const total = n.challenge ? '' : '/4';
          const sub = p.completed ? (n.challenge ? 'Done' : `Done · best ${p.bestScore}${total}`) : !nodeIsOpen ? 'Locked' : n.steps || n.flow ? 'Ready' : 'Content coming soon';
          const inner = `<span class="dot">${icon}</span><span class="txt"><b>${esc(n.title)}</b><small>${sub}</small></span>`;
          return `<li class="node ${state}${n.challenge ? ' challenge' : ''}">${nodeIsOpen ? `<a href="#learn?lesson=${n.id}">${inner}</a>` : `<div>${inner}</div>`}</li>`;
        }).join('')}</ol>
      </li>`;
    }).join('')}</ol>`;
  wirePlanCard(el, renderMap);
  const start = el.querySelector('#rv-start');
  if (start) start.onclick = () => { startReview(planToday()); go('learn', { review: 1 }); };
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
    if (params.get('review')) {
      cleanup = runReview(el, { onExit: () => go('learn') });
      window.scrollTo(0, 0);
      return;
    }
    const skill = params.get('skill') && findSkill(params.get('skill'));
    if (skill) {
      el.innerHTML = `
        <div class="lesson"><div class="card skill-card">
          <div class="step-name">Hands &amp; rhythm · Level ${skill.level}</div>
          <h2>${esc(skill.kind === 'chord' ? skill.title : skill.title)}</h2>
          <div class="step-body" id="sk-body"></div>
          <a class="button-link" href="#learn">← Back to the path</a>
        </div></div>`;
      cleanup = renderSkill(el.querySelector('#sk-body'), skill);
      window.scrollTo(0, 0);
      return;
    }
    if (params.get('placement')) {
      cleanup = runPlacement(el, { onExit: () => go('learn') });
      window.scrollTo(0, 0);
      return;
    }
    const found = params.get('lesson') && findLesson(params.get('lesson'));
    if (found) {
      const idx = nodesOf(found.level).indexOf(found.lesson);
      if (!nodeOpen(found.levelIndex, idx)) { go('learn'); return; }
      if (!found.lesson.steps && !found.lesson.flow) { renderPlaceholder(found.lesson); return; }
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
