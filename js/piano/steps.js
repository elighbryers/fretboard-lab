// Piano step types for challenges (registered with the lesson player):
//   timedkeys:   "Find 10 named keys in under 3 s each" (research-piano.md E, Level 1)
//   timedtriads: "Build any triad the app names in under 3 s" (Level 4)
// Both pass at `pass` of `rounds` and record review items.
import { register } from '../registry.js';
import { Keyboard, keyItem, nameOct } from './keyboard.js';
import { recordAnswer } from '../storage.js';
import { pcOf, preferredName, parseNote, lookup, parseFormula, spell } from '../theory.js';
import { pick } from '../ui.js';

function timed(body, d, last, api, mode) {
  const rounds = d.rounds || 10, secs = d.seconds || 3, pass = d.pass ?? 8;
  body.innerHTML = `<p>${d.text}</p><button class="primary big" id="tk-go">▶ Start</button>`;
  let timer = null, raf = null, kb = null;
  const start = () => {
    let round = 0, score = 0, target = null, shownAt = 0, got = new Set(), lastName = '';
    body.innerHTML = `<div class="drill-top"><span id="tk-round"></span><span id="tk-score"></span></div><p class="prompt" id="tk-prompt"></p>
      <div class="time-bar"><i id="tk-time"></i></div><div id="tk-kb"></div><div class="msg" id="tk-msg"></div>`;
    const $ = s => body.querySelector(s);
    kb = new Keyboard($('#tk-kb'), { view: d.view || [55, 79], mode: 'tap', lock: true, noGlideAnswers: true, full88: true, onTap: ({ midi }) => answer(midi) });
    const finish = () => { const passed = score >= pass; if (passed && last) api.complete(score, rounds); body.innerHTML = api.resultHTML(passed, score, rounds, pass); api.wireResult(body, start); };
    const next = () => {
      if (round >= rounds) return finish();
      round++; kb.clearMarks(); kb.setDots([]); got = new Set();
      let name; do { name = mode === 'keys' ? pick(d.names || ['C', 'D', 'E', 'F', 'G', 'A', 'B']) : `${pick(['C', 'D', 'E', 'F', 'G', 'A', 'Bb'])} ${pick(d.qualities || ['major', 'minor'])}`; } while (name === lastName);
      lastName = name;
      target = mode === 'keys' ? { pcs: [parseNote(name)], name } : (() => { const [r, q] = name.split(' '); return { pcs: parseFormula(lookup('chord', q).formula).map(x => pcOf(parseNote(r) + x.semi)), name, root: r, q }; })();
      $('#tk-round').textContent = `Round ${round} of ${rounds}`; $('#tk-score').textContent = `Score ${score}`;
      $('#tk-prompt').innerHTML = mode === 'keys' ? `Tap <span class="target">${name}</span>` : `Build <span class="target">${name}</span>`;
      $('#tk-msg').textContent = '';
      shownAt = performance.now();
      const tick = () => { const left = Math.max(0, shownAt + secs * 1000 - performance.now()); const b = $('#tk-time'); if (b) b.style.width = (100 * left / (secs * 1000)) + '%'; if (left > 0) raf = requestAnimationFrame(tick); };
      cancelAnimationFrame(raf); tick();
    };
    const answer = midi => {
      if (!target || target.done) return;
      const ms = performance.now() - shownAt, inTime = ms <= secs * 1000, ok = target.pcs.includes(pcOf(midi));
      kb.mark(0, midi, ok, ok ? preferredName(midi) : undefined, true);
      if (mode === 'triads' && ok) { got.add(pcOf(midi)); if (got.size < target.pcs.length) return; }
      target.done = true; cancelAnimationFrame(raf);
      const right = ok && inTime;
      recordAnswer(mode === 'keys' ? `key:${target.name}` : `tone:${target.root}:${target.q}:${target.q === 'minor' ? 'b3' : '3'}`, ok, ms);
      if (right) score++;
      $('#tk-msg').textContent = ok ? (inTime ? `Yes, ${(ms / 1000).toFixed(1)} s.` : `Right, but ${(ms / 1000).toFixed(1)} s. Aim for under ${secs}.`) : mode === 'keys' ? `That's ${nameOct(midi)}.` : `${preferredName(midi)} isn't in ${target.name} (${spell(parseNote(target.root), lookup('chord', target.q).formula).notes.join(' ')}).`;
      $('#tk-msg').className = 'msg ' + (right ? 'good' : 'bad');
      timer = setTimeout(next, right ? 700 : 1500);
    };
    next();
  };
  body.querySelector('#tk-go').onclick = start;
  if (last) api.setReady(false);
  return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
}
register('steps', {
  timedkeys: (body, d, last, api) => timed(body, d, last, api, 'keys'),
  timedtriads: (body, d, last, api) => timed(body, d, last, api, 'triads')
});
export const _k = keyItem;
