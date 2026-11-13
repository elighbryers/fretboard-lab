// Plays one lesson from data (see js/lessons/level1.js for the shape): six steps,
// one card at a time, with Back/Next and a progress bar.
import { TUNINGS, NOTES, midiAt, pcOf } from './theory.js';
import { Fretboard } from './fretboard.js';
import { pluckAt, context, now, metronome } from './audio.js';
import { recordAnswer, completeLesson, unlockLesson, addLog, getLesson, setLessonBpm } from './storage.js';

const STEPS = [
  ['hear', 'Hear it'], ['learn', 'Learn it'], ['see', 'See it'],
  ['try', 'Try it'], ['play', 'Play it'], ['check', 'Check it']
];
const tuning = TUNINGS.standard;
const PLAY_BPM = { min: 40, max: 160, default: 60 }; // Play it tempo range for every lesson

// Guitar numbering in lesson data -> board indexes.
const toSF = ({ string, fret }) => ({ s: tuning.strings.findIndex(x => x.num === string), f: fret });
const describe = (s, f) => `string ${tuning.strings[s].num}, ${f === 0 ? 'open' : 'fret ' + f}`;
const noteItem = ({ s, f }) => `note:${NOTES[pcOf(midiAt(s, f))]}@s${tuning.strings[s].num}`;

// Returns a cleanup function (stops sound, metronome and timers).
export function runLesson(el, lesson, { next, onExit, onContinue }) {
  const steps = STEPS.filter(([k]) => lesson.steps[k]);
  const startedAt = Date.now();
  let i = 0, ready = false, stepCleanup = null;

  el.innerHTML = `
    <div class="lesson">
      <div class="lesson-top">
        <button class="icon" id="ls-exit" aria-label="Leave lesson">✕</button>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${steps.length}"><i></i></div>
        <span id="ls-count"></span>
      </div>
      <div class="card" id="ls-card"></div>
      <div class="lesson-nav">
        <button id="ls-back">Back</button>
        <button id="ls-next" class="primary">Next</button>
      </div>
    </div>`;
  const $ = sel => el.querySelector(sel);
  const card = $('#ls-card');

  function setReady(r) { ready = r; $('#ls-next').disabled = !r; }

  function show(n) {
    stepCleanup?.();
    stepCleanup = null;
    i = n;
    const [key, name] = steps[i];
    $('.bar i').style.width = `${(100 * (i + 1)) / steps.length}%`;
    $('.bar').setAttribute('aria-valuenow', i + 1);
    $('#ls-count').textContent = `${i + 1}/${steps.length}`;
    $('#ls-back').disabled = i === 0;
    $('#ls-next').hidden = key === 'check';
    $('#ls-next').textContent = key === 'play' ? 'Done' : 'Next';
    card.innerHTML = `<div class="step-name">${name}</div><h2>${lesson.title}</h2><div class="step-body"></div>`;
    setReady(true);
    stepCleanup = RENDER[key](card.querySelector('.step-body'), lesson.steps[key]) || null;
  }

  $('#ls-back').onclick = () => i > 0 && show(i - 1);
  $('#ls-next').onclick = () => ready && i < steps.length - 1 && show(i + 1);
  $('#ls-exit').onclick = onExit;

  /* ---------- step renderers: (body, data) -> optional cleanup ---------- */
  const board = (host, view, opts = {}) => new Fretboard(host, { view, labels: 'none', ...opts });

  function playSeq(sequence, bpm) {
    if (!context()) return;
    const t0 = now() + 0.05, beat = 60 / bpm;
    sequence.map(toSF).forEach((p, k) => pluckAt(midiAt(p.s, p.f), t0 + k * beat));
  }

  const RENDER = {
    hear(body, d) {
      body.innerHTML = `<p>${d.text}</p><button class="primary big" id="st-play">▶ Play</button>`;
      body.querySelector('#st-play').onclick = () => playSeq(d.sequence, d.bpm);
    },

    learn(body, d) {
      body.innerHTML = `<p>${d.text}</p><ul class="points">${d.points.map(p => `<li>${p}</li>`).join('')}</ul><div class="st-board"></div>`;
      if (d.board) board(body.querySelector('.st-board'), d.board.view).setDots(d.board.dots.map(x => ({ ...toSF(x), label: x.label })));
    },

    see(body, d) {
      body.innerHTML = `<p>${d.text}</p><button class="primary" id="st-play">▶ Play</button><div class="st-board"></div>`;
      const fb = board(body.querySelector('.st-board'), d.view, { mode: 'sequence' });
      const pos = d.sequence.map(toSF);
      fb.setDots(pos);
      body.querySelector('#st-play').onclick = () => fb.playSequence(pos, { bpm: d.bpm });
      return () => fb.stopSequence();
    },

    try(body, d) {
      let t = 0, timer;
      body.innerHTML = `<p class="prompt" id="st-prompt"></p><div class="st-board"></div><div class="msg" id="st-msg"></div>`;
      const msg = (text, color) => { const m = body.querySelector('#st-msg'); m.textContent = text; m.style.color = color || ''; };
      const ask = () => {
        body.querySelector('#st-prompt').innerHTML = `${d.tasks[t].prompt} <span class="muted">${t + 1} of ${d.tasks.length}</span>`;
        fb.clearMarks();
      };
      let shownAt = performance.now();
      const fb = board(body.querySelector('.st-board'), d.view, {
        mode: 'tap', labels: 'none',
        onTap: ({ s, f }) => {
          if (t >= d.tasks.length) return;
          const want = toSF(d.tasks[t].answer), ok = s === want.s && f === want.f;
          recordAnswer(noteItem(want), ok, performance.now() - shownAt);
          shownAt = performance.now();
          fb.mark(s, f, ok);
          if (!ok) { msg(`That's ${describe(s, f)}. Try again.`, 'var(--bad)'); return; }
          msg(`Yes! ${describe(s, f)} is ${NOTES[pcOf(midiAt(s, f))]}.`, 'var(--good)');
          t++;
          if (t < d.tasks.length) timer = setTimeout(() => { ask(); msg(''); }, 800);
          else { setReady(true); body.querySelector('#st-prompt').textContent = 'All done. Tap Next.'; }
        }
      });
      setReady(false);
      ask();
      return () => clearTimeout(timer);
    },

    play(body, d) {
      const clamp = v => Math.min(PLAY_BPM.max, Math.max(PLAY_BPM.min, Math.round(+v) || PLAY_BPM.default));
      let bpm = clamp(getLesson(lesson.id).playBpm ?? d.bpm ?? PLAY_BPM.default);
      body.innerHTML = `<p>${d.text}</p>
        <div class="tempo">
          <button class="icon" id="st-slower" aria-label="Slower">−</button>
          <input type="range" id="st-bpm" min="${PLAY_BPM.min}" max="${PLAY_BPM.max}" value="${bpm}" aria-label="Tempo in beats per minute">
          <button class="icon" id="st-faster" aria-label="Faster">+</button>
          <output id="st-bpm-out"><b>${bpm}</b> bpm</output>
        </div>
        <div class="row"><button class="primary" id="st-metro">▶ Start metronome</button></div>
        <div class="st-board"></div>
        <p class="muted">Tap Done when you've played along.</p>`;
      const fb = board(body.querySelector('.st-board'), d.view, { labels: 'none' });
      const pos = d.follow.map(toSF);
      fb.setDots(pos);
      const saved = { bpm: metronome.bpm, beats: metronome.beatsPerBar, running: metronome.running };
      let count = 0;
      const off = metronome.listen(() => { fb.highlight([pos[count % pos.length]]); count++; });
      const setBpm = v => {
        bpm = clamp(v);
        body.querySelector('#st-bpm').value = bpm;
        body.querySelector('#st-bpm-out b').textContent = bpm;
        body.querySelector('#st-slower').disabled = bpm <= PLAY_BPM.min;
        body.querySelector('#st-faster').disabled = bpm >= PLAY_BPM.max;
        if (metronome.running) metronome.setBpm(bpm);
        setLessonBpm(lesson.id, bpm);
      };
      body.querySelector('#st-bpm').oninput = e => setBpm(e.target.value);
      body.querySelector('#st-slower').onclick = () => setBpm(bpm - 1);
      body.querySelector('#st-faster').onclick = () => setBpm(bpm + 1);
      body.querySelector('#st-slower').disabled = bpm <= PLAY_BPM.min;
      body.querySelector('#st-faster').disabled = bpm >= PLAY_BPM.max;
      const btn = body.querySelector('#st-metro');
      btn.onclick = () => {
        if (metronome.running) { metronome.stop(); fb.highlight([]); btn.textContent = '▶ Start metronome'; return; }
        metronome.stop();
        metronome.setBpm(bpm);
        metronome.beatsPerBar = d.beatsPerBar || 4;
        count = 0;
        metronome.start();
        btn.textContent = '■ Stop';
        setReady(true);
      };
      setReady(false);
      return () => {
        off();
        if (metronome.running && !saved.running) metronome.stop();
        metronome.setBpm(saved.bpm);
        metronome.beatsPerBar = saved.beats;
      };
    },

    check(body, d) {
      let q = 0, score = 0, shownAt, fb;

      const answered = (ok, item, feedback) => {
        recordAnswer(item, ok, performance.now() - shownAt);
        if (ok) score++;
        const fbEl = body.querySelector('#st-msg');
        fbEl.textContent = ok ? 'Correct!' : feedback;
        fbEl.style.color = ok ? 'var(--good)' : 'var(--bad)';
        body.querySelector('#st-qnext').hidden = false;
        body.querySelector('#st-qnext').focus();
      };

      const ask = () => {
        const x = d.questions[q];
        shownAt = performance.now();
        body.innerHTML = `<p class="prompt">${x.prompt} <span class="muted">Question ${q + 1} of ${d.questions.length}</span></p>
          <div class="st-answer"></div><div class="msg" id="st-msg"></div>
          <button class="primary" id="st-qnext" hidden>${q + 1 < d.questions.length ? 'Next question' : 'See result'}</button>`;
        body.querySelector('#st-qnext').onclick = () => { q++; q < d.questions.length ? ask() : result(); };
        const host = body.querySelector('.st-answer');
        if (x.type === 'choice') {
          host.innerHTML = `<div class="choices">${x.options.map(o => `<button data-o="${o}">${o}</button>`).join('')}</div>`;
          host.querySelectorAll('button').forEach(b => b.onclick = () => {
            host.querySelectorAll('button').forEach(o => {
              o.disabled = true;
              if (o.dataset.o === x.answer) o.classList.add('good');
              else if (o === b) o.classList.add('bad');
            });
            answered(b.dataset.o === x.answer, x.item, `Not quite. The answer is ${x.answer}.`);
          });
        } else {
          const want = toSF(x.answer);
          let done = false;
          fb = board(host, d.view, {
            mode: 'tap', labels: 'none',
            onTap: ({ s, f }) => {
              if (done) return;
              done = true;
              const ok = s === want.s && f === want.f;
              fb.mark(s, f, ok);
              if (!ok) fb.mark(want.s, want.f, true, null, true);
              answered(ok, noteItem(want), `Not quite. You tapped ${describe(s, f)}; the answer is shown in green.`);
            }
          });
        }
      };

      const result = () => {
        const passed = score >= d.pass;
        if (passed) {
          completeLesson(lesson.id, score);
          if (next) unlockLesson(next.id);
          addLog({ minutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)), activity: `Lesson: ${lesson.title}`, detail: `Check ${score}/${d.questions.length}` });
        }
        body.innerHTML = passed
          ? `<div class="result good"><b>Lesson complete!</b><p>You got ${score} of ${d.questions.length}.</p></div>
             ${next ? `<button class="primary big" id="st-cont">Continue: ${next.title}</button>` : ''}
             <button id="st-path">Back to path</button>`
          : `<div class="result bad"><b>${score} of ${d.questions.length}</b><p>You need ${d.pass} to pass. Have another go.</p></div>
             <button class="primary big" id="st-retry">Try again</button>
             <button id="st-path">Back to path</button>`;
        body.querySelector('#st-cont')?.addEventListener('click', onContinue);
        body.querySelector('#st-retry')?.addEventListener('click', () => { q = 0; score = 0; ask(); });
        body.querySelector('#st-path').onclick = onExit;
      };

      setReady(false);
      ask();
    }
  };

  show(0);
  return () => stepCleanup?.();
}
