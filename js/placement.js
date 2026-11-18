// Placement quiz: three questions per level, in order. Two right moves on to the
// next level; the first level with fewer than two right is where you start.
// Questions live in each level's data as `placement: [question, x3]` (same
// format as Check questions).
import { currentLevels, nodesOf } from './lessons/index.js';
import { renderQuestion } from './lesson-player.js';
import { setPlacement, unlockLesson } from './storage.js';
import { esc } from './ui.js';

const NEED = 2;

export function runPlacement(el, { onExit }) {
  const levels = currentLevels().map((L, i) => ({ ...L, n: i + 1 })).filter(L => L.level?.placement?.length);
  let li = 0, q = 0, right = 0, cleanup = null;
  el.innerHTML = `
    <div class="lesson">
      <div class="lesson-top">
        <button class="icon" id="pl-exit" aria-label="Leave the placement quiz">✕</button>
        <div class="bar"><i id="pl-bar"></i></div>
        <span id="pl-count"></span>
      </div>
      <div class="card" id="pl-card"></div>
    </div>`;
  const $ = s => el.querySelector(s);
  $('#pl-exit').onclick = onExit;

  function intro() {
    if (!levels.length) {
      $('#pl-card').innerHTML = `<div class="step-name">Placement quiz</div><h2>Coming soon</h2>
        <div class="step-body"><p class="muted">This instrument's placement quiz isn't ready yet.</p><button id="pl-back">Back</button></div>`;
      $('#pl-back').onclick = onExit;
      return;
    }
    $('#pl-card').innerHTML = `
      <div class="step-name">Placement quiz</div><h2>Find your level</h2>
      <div class="step-body"><p>A few questions per level, starting with the basics. We stop at the first level that's new to you, and open it for you.</p>
      <p class="muted">Lessons below your level stay open, so you can always go back.</p>
      <button class="primary big" id="pl-go">Start</button></div>`;
    $('#pl-go').onclick = ask;
  }

  function ask() {
    cleanup?.();
    const L = levels[li], x = L.level.placement[q];
    const total = levels.length * 3, at = li * 3 + q;
    $('#pl-bar').style.width = (100 * at / total) + '%';
    $('#pl-count').textContent = `Level ${L.n}`;
    $('#pl-card').innerHTML = `
      <div class="step-name">Level ${L.n}: ${esc(L.title)}</div>
      <div class="step-body"><p class="prompt">${x.prompt} <span class="muted">${q + 1} of 3</span></p>
      <div class="st-answer"></div><div class="msg" id="pl-msg"></div>
      <button class="primary" id="pl-next" hidden>Next</button></div>`;
    cleanup = renderQuestion($('.st-answer'), x, {
      onAnswer: ok => {
        if (ok) right++;
        $('#pl-msg').textContent = ok ? 'Correct!' : `Not quite.${x.type === 'choice' ? ` The answer is ${x.answer}.` : ''}`;
        $('#pl-msg').className = 'msg ' + (ok ? 'good' : 'bad');
        $('#pl-next').hidden = false;
        $('#pl-next').focus();
      }
    });
    $('#pl-next').onclick = advance;
  }

  function advance() {
    q++;
    if (q < 3) return ask();
    const passed = right >= NEED;
    q = 0; right = 0;
    if (passed && li < levels.length - 1) { li++; return ask(); }
    finish(passed ? null : levels[li]);
  }

  // failedAt: the level to start at (null = passed every level).
  function finish(failedAt) {
    cleanup?.();
    const L = failedAt || levels[levels.length - 1];
    setPlacement(L.n);
    unlockLesson(nodesOf(L.level)[0].id);
    $('#pl-bar').style.width = '100%';
    $('#pl-card').innerHTML = `
      <div class="step-name">Placement quiz</div>
      <h2>${failedAt ? (L.n === 1 ? 'Start at the beginning' : `Start at Level ${L.n}`) : 'You know a lot already'}</h2>
      <div class="step-body">
        <p>${failedAt ? (L.n === 1 ? 'Level 1 builds the base everything else stands on. You\'ll fly through it.' : `Levels 1 to ${L.n - 1} look solid. Level ${L.n}, <b>${esc(L.title)}</b>, is open for you now.`)
          : `Every level is open. Start with Level ${L.n}, or jump to anything you like.`}</p>
        <button class="primary big" id="pl-done">Go to the path</button>
      </div>`;
    $('#pl-done').onclick = onExit;
  }

  intro();
  return () => cleanup?.();
}
