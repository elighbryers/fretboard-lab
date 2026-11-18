// Drum items in the Daily review (docs/research-drums.md D6): drum names and staff positions on
// the pads, counting (tap the rhythm you hear in a grid), stickings by name, grooves and feels
// by ear. One try each; a miss shows the answer.
import { register } from '../registry.js';
import { recordAnswer, getTimingHistory, getLog, getLesson, allTempos } from '../storage.js';
import { KIT, piece, fromPatterns } from './kit.js';
import { PadBoard, padIndex } from './board.js';
import { gridTask } from '../lesson-extras.js';
import { RHYTHMS, RUDIMENTS, findRhythm, findRudiment } from './rudiments.js';
import { STYLES } from '../groove.js';
import { playSound } from '../sound.js';
import { timingSection } from '../timing-progress.js';
import { esc, shuffle } from '../ui.js';

const hideBoard = ui => { const b = ui.fb.wrap.parentElement; b.hidden = true; return () => { b.hidden = false; }; };
const WHERE = { kick: 'the bottom space', snare: 'the third space', tom3: 'the second space', tom2: 'the fourth line', tom1: 'the top space', ride: 'the top line (x)', hat: 'the space above the staff (x)', crash: 'the ledger line above (x)', phat: 'below the staff (x)' };

function padRound(ui, id, want, prompt) {
  const restore = hideBoard(ui), host = document.createElement('div'), shownAt = performance.now();
  ui.fb.wrap.parentElement.before(host);
  ui.prompt(prompt);
  let done = false;
  const b = new PadBoard(host, { mode: 'tap', onTap: ({ f }) => {
    if (done) return; done = true;
    const ok = KIT[f].id === want;
    recordAnswer(id, ok, performance.now() - shownAt);
    b.mark(0, f, ok); if (!ok) b.mark(0, padIndex(want), true, '', true);
    ui.result(ok); ui.msg(`${ok ? 'Yes! ' : ''}That is the ${piece(want).name.toLowerCase()}.`, ok ? 'good' : 'bad');
    ok ? ui.autoNext(900) : ui.showNext();
  } });
  return { end: () => { host.remove(); restore(); } };
}
function choiceRound(ui, id, { prompt, options, answer, sound, explain }) {
  const restore = hideBoard(ui), shownAt = performance.now();
  let done = false, stop = () => {};
  ui.prompt(esc(prompt));
  if (sound) { const play = () => { stop(); stop = playSound(sound); }; ui.tools('<button id="rvd-again">▶ Play again</button>'); document.getElementById('rvd-again').onclick = play; play(); }
  ui.choices(shuffle(options).map(o => `<button data-o="${esc(o)}">${esc(o)}</button>`).join(''));
  document.getElementById('dr-choices').onclick = e => {
    const b = e.target.closest('button'); if (!b || done) return; done = true;
    const ok = b.dataset.o === answer;
    recordAnswer(id, ok, performance.now() - shownAt);
    document.querySelectorAll('#dr-choices button').forEach(x => { x.disabled = true; if (x.dataset.o === answer) x.classList.add('good'); else if (x === b) x.classList.add('bad'); });
    ui.result(ok); ui.msg(explain, ok ? 'good' : 'bad'); ok ? ui.autoNext(1100) : ui.showNext();
  };
  return { end: () => { stop(); restore(); } };
}
function countRound(ui, id, steps, sub = 4) {
  const restore = hideBoard(ui), host = document.createElement('div');
  ui.fb.wrap.parentElement.before(host);
  ui.prompt('Listen, then tap where the notes fall.');
  let done = false;
  const stop = gridTask(host, { grid: { notes: steps, piece: 'snare', label: 'Snare', sub, beats: 4, bpm: 80 }, item: id }, {
    onRight: () => { if (done) return; done = true; ui.result(true); ui.msg('Yes!', 'good'); ui.autoNext(1100); },
    onWrong: t => { if (done) return; done = true; ui.result(false); ui.msg(t, 'bad'); ui.showNext(); }
  });
  return { end: () => { stop(); host.remove(); restore(); } };
}
const GROOVE_EARS = { rock: 'rock8', shuffle: 'shuffle', funk: 'funk16', jazz: 'walking', onedrop: 'onedrop', bossa: 'bossa', 'rock-and3': 'rock8', 'fill-on-1': 'rock8' };
const grooveSound = st => { const s = STYLES[st]; return { seq: [null], kit: fromPatterns(s.parts, { beats: s.beats, sub: s.grid }), bpm: s.bpm, bars: 2 }; };

register('review', [
  { askable: id => /^pad:(\w+)$/.test(id) && !!piece(id.slice(4)), round: (ui, id) => padRound(ui, id, id.slice(4), `Tap the ${esc(piece(id.slice(4)).name.toLowerCase())}.`) },
  { askable: id => /^staff:drum@(\w+)$/.test(id) && !!WHERE[id.split('@')[1]], round: (ui, id) => { const p = id.split('@')[1]; return padRound(ui, id, p, `Which drum is written in ${WHERE[p]} of the drum staff? Tap it.`); } },
  { askable: id => /^count:(.+)$/.test(id) && (!!findRhythm(id.slice(6)) || /^\d+(-\d+)*$/.test(id.slice(6))), round: (ui, id) => { const r = findRhythm(id.slice(6)); return r ? countRound(ui, id, r.steps, r.sub || 4) : countRound(ui, id, id.slice(6).split('-').map(Number)); } },
  { askable: id => /^sticking:(.+)$/.test(id) && !!findRudiment(id.slice(9)), round: (ui, id) => { const r = findRudiment(id.slice(9)), others = shuffle(RUDIMENTS.filter(x => x.id !== r.id)).slice(0, 2);
    const fmt = x => x.sticking.replace(/\./g, '').toUpperCase().slice(0, 8);
    return choiceRound(ui, id, { prompt: `Which sticking is the ${r.name.toLowerCase()}?`, options: [r, ...others].map(fmt), answer: fmt(r), explain: `${r.name}: ${fmt(r)}.` }); } },
  { askable: id => /^groove-ear:(.+)$/.test(id) && !!GROOVE_EARS[id.slice(11)], round: (ui, id) => { const st = GROOVE_EARS[id.slice(11)], names = ['rock8', 'shuffle', 'funk16', 'onedrop', 'bossa', 'walking'].map(k => STYLES[k].name);
    return choiceRound(ui, id, { prompt: 'Which groove is this?', options: shuffle(names.filter(n => n !== STYLES[st].name)).slice(0, 2).concat(STYLES[st].name), answer: STYLES[st].name, sound: grooveSound(st), explain: `It was ${STYLES[st].name}.` }); } },
  { askable: id => /^feel-ear:(swing|straight|triplets)$/.test(id), round: (ui, id) => { const f = id.slice(9), parts = { swing: 'x.xx.xx.xx.x', straight: 'x.x.x.x.x.x.x.x.', triplets: 'xxxxxxxxxxxx' }[f];
    return choiceRound(ui, id, { prompt: 'Straight, swung or triplets?', options: ['Straight', 'Swung', 'Triplets'], answer: { swing: 'Swung', straight: 'Straight', triplets: 'Triplets' }[f], sound: { seq: [null], kit: fromPatterns({ ride: parts }, { sub: f === 'straight' ? 4 : 3 }), bpm: 90, bars: 2 }, explain: `It was ${f === 'swing' ? 'swung' : f}.` }); } }
]);

/* ---------- progress: timing chart, timing heat map per step, best clean tempos, milestones ---------- */
const STEP = ['1', 'e', '&', 'a', '2', 'e', '&', 'a', '3', 'e', '&', 'a', '4', 'e', '&', 'a'];
register('progress', [
  timingSection('Timing: early, late and steady'),
  { id: 'p-steps', title: 'Where you rush or drag', sub: 'Average early (−) or late (+) per sixteenth of the bar, from scored drum runs. Blue is on time, red rushes, purple drags.',
    render(body) {
      const by = {};
      getTimingHistory().forEach(t => Object.entries(t.steps || {}).forEach(([s, e]) => { (by[s] ||= []).push(e); }));
      const cells = STEP.map((c, s) => { const e = by[s]; const m = e ? Math.round(e.reduce((a, x) => a + x, 0) / e.length) : null;
        const cls = m == null ? 'none' : Math.abs(m) <= 15 ? 'ok' : m < 0 ? 'rush' : 'drag';
        return `<span class="st-cell ${cls}" title="${c}: ${m == null ? 'no data' : `${m > 0 ? '+' : ''}${m} ms`}"><b>${c}</b><small>${m == null ? '–' : (m > 0 ? '+' : '') + m}</small></span>`; }).join('');
      body.innerHTML = `<div class="st-row">${cells}</div>`;
    } }
]);
register('badges', [
  { id: 'drums-level-1', glyph: 'D1', title: 'Drums Level 1 complete', how: 'Finish the drums Level 1 Challenge', test: () => getLesson('d1-ch').completed },
  { id: 'drums-first-groove', glyph: '🥁', title: 'First groove', how: 'Play a scored rock beat with 80% in time', test: () => getTimingHistory().some(t => t.hitRate >= 0.8 && (t.drill === 'lesson' || t.drill === 'drum-play')) },
  { id: 'drums-tight-25', glyph: '±25', title: 'Tight', how: 'Score 80% within the Strict window', test: () => getTimingHistory().some(t => t.window <= 25 && t.hitRate >= 0.8) },
  { id: 'drums-paradiddle-100', glyph: 'RLRR', title: 'Paradiddle at 100', how: 'Play the paradiddle cleanly at 100 bpm', test: () => (allTempos()['rudiment:paradiddle']?.best || 0) >= 100 },
  { id: 'drums-silent-bars', glyph: '🤫', title: 'Steady without the click', how: 'Keep 80% in time through gap-click silent bars', test: () => getTimingHistory().some(t => t.drill === 'drum-gap' && t.hitRate >= 0.8) }
]);
export const _x = { RHYTHMS, getLog };
