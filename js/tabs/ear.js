// Ear Training tab: five tracks in the research order, answered on the
// fretboard (js/ear.js). #ear (home) and #ear?track=<id> (a 10-question session).
import { Fretboard } from '../fretboard.js';
import { TRACKS, findTrack, trackState, trackAnswer, setTrackLevel, nextQuestion, cadence, stopEar, earKey, setEarKey, KEYS } from '../ear.js';
import { parseNote } from '../theory.js';
import { addLog, minutesOn } from '../storage.js';
import { esc } from '../ui.js';

const ROUNDS = 10;
let el, cleanup = null;

function home() {
  const key = earKey();
  el.innerHTML = `
    <h2>Ear Training</h2>
    <p class="muted">Hear it, find it: every answer is a tap on the neck. Start at the top; each track adds new sounds when you're ready.</p>
    <label class="key-pick">Key for scale degrees and intervals
      <select id="ear-key">${[...KEYS, 'random'].map(k => `<option value="${k}"${k === key ? ' selected' : ''}>${k === 'random' ? 'A different key each time' : k}</option>`).join('')}</select></label>
    <ol class="ear-tracks">${TRACKS.map((t, i) => {
      const st = trackState(t.id), L = t.levels[st.level], acc = st.recent.length ? Math.round(100 * st.recent.reduce((a, x) => a + x, 0) / st.recent.length) : null;
      return `<li><a class="card-link ear-track" href="#ear?track=${t.id}">
        <span class="card-ico" aria-hidden="true">${i + 1}</span>
        <span><b>${esc(t.title)}</b><small>${esc(t.blurb)}</small>
          <small class="ear-level">Level ${st.level + 1} of ${t.levels.length}: ${esc(L.name)}${acc != null ? ` · ${acc}% lately` : ''}</small></span></a></li>`;
    }).join('')}</ol>`;
  el.querySelector('#ear-key').onchange = e => setEarKey(e.target.value);
}

function session(track) {
  let level = trackState(track.id).level, q = 0, score = 0, answered = false, current = null, timer = null, closed = false;
  const startedAt = Date.now(), changes = [];
  const phone = matchMedia('(max-width: 700px)').matches;
  el.innerHTML = `
    <div class="tool-head"><a class="back" href="#ear">← Ear Training</a><h2>${esc(track.title)}</h2></div>
    <div class="seg ear-levels" id="ear-levels" role="group" aria-label="Level">${track.levels.map((L, i) =>
      `<button data-l="${i}" aria-pressed="${i === level}" title="${esc(L.name)}">${i + 1}</button>`).join('')}</div>
    <p class="muted small" id="ear-level-name"></p>
    <div class="lesson-top"><div class="bar"><i id="ear-bar"></i></div><span id="ear-count"></span></div>
    <div class="card ear-card">
      <p class="prompt" id="dr-prompt"></p>
      <div class="row" id="dr-tools"></div>
      <div id="dr-board"></div>
      <div class="choices" id="dr-choices"></div>
      <div class="msg" id="dr-msg" aria-live="polite"></div>
      <button class="primary big" id="dr-next" hidden>Next →</button>
    </div>`;
  const $ = s => el.querySelector(s);
  const o = { from: 0, to: phone ? 7 : 12 };
  const fb = new Fretboard($('#dr-board'), { view: [o.from, o.to], mode: 'tap', labels: 'none', onTap: t => current?.tap?.(t) });
  const ui = {
    fb, o, $, $$: s => el.querySelectorAll(s),
    prompt: html => { $('#dr-prompt').innerHTML = html; },
    msg: (text, kind = '') => { const m = $('#dr-msg'); m.textContent = text; m.className = 'msg ' + kind; },
    tools: html => { $('#dr-tools').innerHTML = html; },
    choices: html => { $('#dr-choices').innerHTML = html; },
    result(ok) {
      if (answered) return;
      answered = true;
      if (ok) score++;
      const change = trackAnswer(track.id, ok);
      if (change) {
        level = trackState(track.id).level;
        changes.push(change === 'up' ? `Level up: ${track.levels[level].name}.` : `Back to level ${level + 1} for a bit: ${track.levels[level].name}.`);
        paintLevels();
      }
      paintTop();
    },
    showNext() { $('#dr-next').hidden = false; $('#dr-next').focus({ preventScroll: true }); },
    autoNext(ms) { timer = setTimeout(next, ms); }
  };
  const paintTop = () => {
    $('#ear-bar').style.width = `${100 * (q - (answered ? 0 : 1)) / ROUNDS}%`;
    $('#ear-count').textContent = `${Math.min(q, ROUNDS)}/${ROUNDS} · ${score} right`;
  };
  const paintLevels = () => {
    el.querySelectorAll('#ear-levels button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.l === level));
    $('#ear-level-name').textContent = `Level ${level + 1}: ${track.levels[level].name}`;
  };
  $('#ear-levels').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    level = +b.dataset.l; setTrackLevel(track.id, level); paintLevels();
  };

  function next() {
    clearTimeout(timer);
    if (closed) return;
    current?.end?.();
    if (q >= ROUNDS) return finish();
    q++;
    answered = false;
    $('#dr-next').hidden = true;
    fb.clearMarks(); fb.setDots([]);
    ui.msg(''); ui.tools(''); ui.choices('');
    paintTop();
    const { round, want } = nextQuestion(track.id, level, earKey());
    current = round(ui, want);
  }

  function finish() {
    stopEar();
    const mins = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    addLog({ minutes: mins, activity: `Ear training: ${track.title}`, detail: `${score}/${ROUNDS}`, drill: 'ear', score, total: ROUNDS });
    el.querySelector('.ear-card').innerHTML = `
      <div class="done-card">
        <h3>${score >= 8 ? 'Great ears!' : score >= 5 ? 'Good listening.' : 'Every session trains your ear.'}</h3>
        <div class="score-big">${score}<span>/${ROUNDS}</span></div>
        ${changes.map(c => `<p class="good-note">${esc(c)}</p>`).join('')}
        <p class="muted">Done for today? Short sessions most days work best. ${minutesOn()} min practised today.</p>
        <div class="row center"><button class="primary big" id="ear-again">Again</button><a class="button-link" href="#ear">All tracks</a></div>
      </div>`;
    el.querySelector('#ear-again').onclick = () => { cleanup?.(); cleanup = session(track); };
  }

  $('#dr-next').onclick = next;
  paintLevels();
  // Scale degrees: hear the key first.
  if (track.id === 'degrees') {
    const key = earKey() === 'random' ? 'G' : earKey();
    $('#dr-prompt').textContent = 'First, the key…';
    timer = setTimeout(next, cadence(parseNote(key)) * 1000);
  } else next();
  return () => { closed = true; clearTimeout(timer); current?.end?.(); stopEar(); };
}

export default {
  id: 'ear',
  title: 'Ear Training',
  icon: '<path d="M8 9a4 4 0 1 1 8 0c0 3-3 4-3 7a3 3 0 0 1-5 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  mount(section) { el = section; },
  show(params) {
    cleanup?.(); cleanup = null;
    const track = findTrack(params.get('track'));
    if (track) cleanup = session(track); else home();
    window.scrollTo(0, 0);
  },
  hide() { cleanup?.(); cleanup = null; }
};
