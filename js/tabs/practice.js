// Practice tab: the note quiz (every answer is saved for spaced review), plus
// the metronome and drone from the sound engine.
import { NOTES, KEY_NAMES } from '../theory.js';
import { Fretboard } from '../fretboard.js';
import { metronome, droneStart, droneStop, droneOn } from '../audio.js';
import { recordAnswer, addLog } from '../storage.js';

const q = { target: null, score: 0, streak: 0, strings: 'low', shownAt: 0 };
let session = null; // { start, last, answers, correct } for the practice log
let fb, el;
const $ = sel => el.querySelector(sel);
const LOW = [4, 5]; // A and low E string indexes

function msg(text, color) { $('#q-msg').textContent = text; $('#q-msg').style.color = color || ''; }
function scoreText() { $('#q-score').textContent = `Score ${q.score} · Streak ${q.streak}`; }

function newTarget() {
  let t;
  do { t = Math.floor(Math.random() * 12); } while (t === q.target);
  q.target = t;
  q.shownAt = performance.now();
  $('#q-note').textContent = NOTES[t];
}

function applyStrings() { fb.set({ focus: q.strings === 'low' ? { strings: LOW } : null }); }

function answer({ s, f, pc, string, focused }) {
  if (!focused) { msg('Stick to the low E and A strings for now.', 'var(--muted)'); return; }
  const ok = pc === q.target, ms = performance.now() - q.shownAt;
  recordAnswer(`note:${NOTES[q.target]}@s${string.num}`, ok, ms);
  const t = Date.now();
  session = session || { start: t, answers: 0, correct: 0 };
  session.last = t; session.answers++; if (ok) session.correct++;
  fb.mark(s, f, ok);
  if (ok) {
    q.score++; q.streak++;
    msg(`Yes, that's ${NOTES[q.target]} (string ${string.num}, fret ${f}).`, 'var(--good)');
    scoreText();
    setTimeout(() => { fb.clearMarks(); newTarget(); }, 700);
  } else {
    q.streak = 0;
    q.shownAt = performance.now();
    msg(`That's ${NOTES[pc]}. Try again.`, 'var(--bad)');
    scoreText();
  }
}

function endSession() {
  if (!session) return;
  const s = session;
  session = null;
  addLog({ minutes: Math.max(1, Math.round((s.last - s.start) / 60000)), activity: 'Note quiz', detail: `${s.answers} answers, ${s.correct} correct` });
}

/* ---------- tools ---------- */
function paintMetro() {
  $('#m-toggle').textContent = metronome.running ? '■ Stop' : '▶ Start';
  $('#m-toggle').classList.toggle('primary', !metronome.running);
  $('#m-beats').innerHTML = Array.from({ length: metronome.beatsPerBar }, (_, i) => `<i data-b="${i}"></i>`).join('');
}
function paintDrone() { $('#d-toggle').textContent = droneOn() ? '■ Stop drone' : '▶ Drone'; }

export default {
  id: 'practice',
  title: 'Practice',
  icon: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',

  mount(section) {
    el = section;
    el.innerHTML = `
      <h2>Note quiz</h2>
      <div class="quizbar">
        <div class="target">Find: <span id="q-note">–</span></div>
        <label>Strings<select id="q-strings"><option value="low">Low E and A only</option><option value="all">All six</option></select></label>
        <div class="score" id="q-score">Score 0 · Streak 0</div>
        <button id="q-skip">Skip</button>
      </div>
      <div id="q-board"></div>
      <div class="info"><small>Tap the neck to find the note. Say its name out loud as you go.</small></div>
      <div class="msg" id="q-msg"></div>

      <h2>Tools</h2>
      <div class="tools">
        <div class="tool">
          <h3>Metronome</h3>
          <div class="row">
            <label>Tempo<input id="m-bpm" type="number" min="20" max="300" value="${metronome.bpm}" inputmode="numeric"></label>
            <input id="m-slider" type="range" min="40" max="220" value="${metronome.bpm}" aria-label="Tempo">
            <label>Beats<select id="m-bar"><option>2</option><option>3</option><option selected>4</option><option>6</option></select></label>
            <button id="m-toggle"></button>
          </div>
          <div class="beats" id="m-beats" aria-hidden="true"></div>
        </div>
        <div class="tool">
          <h3>Drone</h3>
          <div class="row">
            <label>Key<select id="d-key"></select></label>
            <button id="d-toggle"></button>
          </div>
          <small class="muted">A steady root note to play scales and find notes against.</small>
        </div>
      </div>`;

    fb = new Fretboard($('#q-board'), { mode: 'tap', onTap: answer, ariaLabel: 'Fretboard for the note quiz' });
    applyStrings();
    $('#q-strings').onchange = e => { q.strings = e.target.value; applyStrings(); };
    $('#q-skip').onclick = () => { q.streak = 0; scoreText(); fb.clearMarks(); msg(''); newTarget(); };

    const setBpm = v => { metronome.setBpm(v); $('#m-bpm').value = metronome.bpm; $('#m-slider').value = metronome.bpm; };
    $('#m-bpm').onchange = e => setBpm(e.target.value);
    $('#m-slider').oninput = e => setBpm(e.target.value);
    $('#m-bar').onchange = e => { metronome.beatsPerBar = +e.target.value; paintMetro(); };
    $('#m-toggle').onclick = () => { metronome.running ? metronome.stop() : metronome.start(); paintMetro(); };
    metronome.listen(beat => {
      if (!el || el.hidden) return;
      el.querySelectorAll('#m-beats i').forEach(i => i.className = +i.dataset.b === beat ? (beat === 0 ? 'on accent' : 'on') : '');
    });
    paintMetro();

    KEY_NAMES.forEach((k, i) => $('#d-key').add(new Option(k, i)));
    $('#d-key').value = 9;
    $('#d-key').onchange = e => { if (droneOn()) droneStart(+e.target.value); };
    $('#d-toggle').onclick = () => { droneOn() ? droneStop() : droneStart(+$('#d-key').value); paintDrone(); };
    paintDrone();

    // Log the quiz session when the page is closed or put in the background.
    window.addEventListener('pagehide', endSession);
    document.addEventListener('visibilitychange', () => { if (document.hidden) endSession(); });
  },

  show() {
    fb.clearMarks();
    msg('');
    newTarget();
  },

  hide() { endSession(); }
};
