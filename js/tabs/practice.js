// Practice tab: five cards (Metronome, Timer, Drills, Play-along, Log). Each
// tool lives in js/practice/ and opens at #practice?tool=<id>.
import metronomeTool from '../practice/metronome.js';
import timerTool from '../practice/timer.js';
import drillsTool from '../practice/drills.js';
import playalongTool from '../practice/playalong.js';
import logTool from '../practice/log.js';
import { minutesOn, getStreak } from '../storage.js';
import { planLine, wirePlanLine } from '../plan.js';
import { go } from '../router.js';

// Tool: { id, title, blurb, icon, mount(el, params) -> cleanup }
const TOOLS = [metronomeTool, timerTool, drillsTool, playalongTool, logTool];
let el, cleanup = null;

function home() {
  const streak = getStreak();
  el.innerHTML = `
    <p class="today">This week: <b>${streak.weekDays} of 7 days</b> · Today: <b>${minutesOn()} min</b></p>
    ${planLine()}
    <div class="cards">${TOOLS.map(t => `
      <a class="card-link" href="#practice?tool=${t.id}">
        <span class="card-ico" aria-hidden="true">${t.icon}</span>
        <span><b>${t.title}</b><small>${t.blurb}</small></span>
      </a>`).join('')}</div>`;
  wirePlanLine(el, () => go('learn'));
}

export default {
  id: 'practice',
  title: 'Practice',
  icon: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',

  mount(section) { el = section; },

  show(params) {
    cleanup?.();
    cleanup = null;
    const tool = TOOLS.find(t => t.id === params.get('tool'));
    if (!tool) { home(); return; }
    el.innerHTML = `<div class="tool-head"><a class="back" href="#practice">← Practice</a><h2>${tool.title}</h2></div><div class="tool-body"></div>`;
    cleanup = tool.mount(el.querySelector('.tool-body'), params) || null;
  },

  hide() { cleanup?.(); cleanup = null; }
};
