// Plays one lesson from data (see js/lessons/level1.js for the shape): six steps,
// one card at a time, with Back/Next and a progress bar. Challenges use `flow`
// (an ordered list of steps) and may add a timed step.
import { NOTES, midiAt, pcOf, preferredName, parseNote } from './theory.js';
import { Fretboard } from './fretboard.js';
import { context, metronome, droneStart, droneStop, backing } from './audio.js';
import { groove, STYLES, MUTES } from './groove.js';
import { volumeHTML, esc, clock } from './ui.js';
import { recordMic, recordAnswer, completeLesson, unlockLesson, addLog, getLesson, setLessonBpm, getTempo, recordClean, startBelow } from './storage.js';
import { SpeedTrainer, trainerSetupHTML, trainerStatusHTML } from './speed.js';
import { findSkill, renderSkill } from './skills.js';
import { fretboardLink } from './router.js';
import { playSound, parseChord } from './sound.js';
import { chordOf } from './progressions.js';
import { tuningOf, itemNum, indexOfNum } from './instruments.js';
import { getInstrument, activeTuning } from './storage.js';
import { registered } from './registry.js';
import { micOn, listenNotes } from './mic.js';
import { gridCard, techniqueCard, gridTask, kickRootsStep } from './lesson-extras.js';

const STEPS = [
  ['hear', 'Hear it'], ['learn', 'Learn it'], ['see', 'See it'],
  ['try', 'Try it'], ['play', 'Play it'], ['check', 'Check it']
];
const NAMES = Object.fromEntries(STEPS);
const PLAY_BPM = { min: 40, max: 160, default: 60 }; // Play it tempo range for every lesson
const list = a => (Array.isArray(a) ? a : [a]);

// How the player draws an instrument and reads taps. Lesson positions are written in the
// instrument's lesson numbering (guitar: string 6 = low E; bass: string 4 = low E, as in
// js/instruments.js) and shown on the neck the learner picked (5-string bass, drop D ...):
// each position moves to the string with the same item number, at the same pitch.
// Piano and drums register their own adapter (a keyboard or a step grid) with the same shape.
export function frettedAdapter(lessonTuning, boardTuning) {
  const midiOfPos = ({ string, fret }) => lessonTuning.strings.find(x => x.num === string).midi + fret;
  const toSF = p => {
    const s = indexOfNum(boardTuning, p.string);
    return { s, f: midiOfPos(p) - boardTuning.strings[s].midi };
  };
  return {
    toSF,
    board: (host, view, opts) => new Fretboard(host, { view, labels: 'none', tuning: boardTuning, ...opts }),
    describe: (s, f) => `string ${boardTuning.strings[s].num}, ${f === 0 ? 'open' : 'fret ' + f}`,
    noteItem: ({ s, f }) => `note:${NOTES[pcOf(midiAt(s, f, boardTuning))]}@s${itemNum(boardTuning, s)}`,
    nameAt: (s, f) => preferredName(midiAt(s, f, boardTuning)),
    tuning: boardTuning
  };
}
// Chosen on first use: instrument code registers its adapter after this module loads.
let A = null;
const ad = () => A || (A = registered('lessonAdapter') || frettedAdapter(tuningOf(getInstrument()), activeTuning()));
const toSF = p => ad().toSF(p), describe = (s, f) => ad().describe(s, f), noteItem = p => ad().noteItem(p);
const tuningNow = () => ad().tuning || tuningOf('guitar'); // the timed challenge (fretted instruments only)
// Dots in lesson data ({ string, fret, label, role, quiet }) -> board dots.
// No role = the neutral 'other' color; the fretboard labels every dot (note name if no label is given).
const toDots = dots => (dots || []).map(d => ({ ...toSF(d), label: d.label, role: d.role, quiet: d.quiet }));
// A play-along step's backing chords: absolute ('G:major') or numerals in a key.
const backingChords = (b, key) => b.progression ? b.progression.map(r => chordOf(key, r)) : b.chords.map(parseChord);

// One question (a Check question, a placement question): renders into host and
// calls onAnswer(ok, item, feedback) once. Returns a cleanup function.
export function renderQuestion(host, x, { view = [0, 12], onAnswer }) {
  let stopSound = () => {}, done = false;
  const sound = x.sound ? `<button class="primary" data-play>▶ Play${x.type === 'choice' ? '' : ' again'}</button>` : '';
  host.innerHTML = `${sound ? `<div class="row">${sound}</div>` : ''}<div class="q-body"></div>`;
  const play = () => { stopSound(); stopSound = playSound(x.sound); };
  host.querySelector('[data-play]')?.addEventListener('click', play);
  const body = host.querySelector('.q-body');
  const shownAt = performance.now();
  const finish = (ok, item, feedback) => {
    if (done) return;
    done = true;
    if (item) recordAnswer(item, ok, performance.now() - shownAt);
    onAnswer(ok, item, feedback);
  };
  if (x.type === 'choice') {
    body.innerHTML = `<div class="choices">${x.options.map(o => `<button data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
    body.querySelectorAll('button').forEach(b => b.onclick = () => {
      if (done) return;
      body.querySelectorAll('button').forEach(o => {
        o.disabled = true;
        if (o.dataset.o === x.answer) o.classList.add('good');
        else if (o === b) o.classList.add('bad');
      });
      finish(b.dataset.o === x.answer, x.item, x.explain || `Not quite. The answer is ${x.answer}.`);
    });
  } else {
    const answers = list(x.answer).map(toSF);
    const fb = ad().board(body, x.view || view, {
      mode: 'tap',
      onTap: ({ s, f }) => {
        if (done) return;
        const hit = answers.find(a => a.s === s && a.f === f), ok = !!hit;
        fb.mark(s, f, ok, ok && x.label ? x.label : undefined);
        if (!ok) answers.slice(0, 3).forEach(a => fb.mark(a.s, a.f, true, x.label, true));
        finish(ok, x.item || noteItem(hit || answers[0]), x.explain || `Not quite. You tapped ${describe(s, f)}; the answer is shown in green.`);
      }
    });
    if (x.dots) fb.setDots(toDots(x.dots));
  }
  if (x.sound) play();
  return () => stopSound();
}

// Returns a cleanup function (stops sound, metronome and timers).
export function runLesson(el, lesson, { next, onExit, onContinue }) {
  const flow = lesson.flow || STEPS.filter(([k]) => lesson.steps[k]).map(([type]) => ({ type, ...lesson.steps[type] }));
  const startedAt = Date.now();
  let i = 0, ready = false, stepCleanup = null, stepNav = null;

  el.innerHTML = `
    <div class="lesson">
      <div class="lesson-top">
        <button class="icon" id="ls-exit" aria-label="Leave lesson">✕</button>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${flow.length}"><i></i></div>
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
    stepNav = null;
    i = n;
    const step = flow[i], last = i === flow.length - 1;
    $('.bar i').style.width = `${(100 * (i + 1)) / flow.length}%`;
    $('.bar').setAttribute('aria-valuenow', i + 1);
    $('#ls-count').textContent = `${i + 1}/${flow.length}`;
    $('#ls-back').disabled = i === 0;
    $('#ls-next').hidden = last && (step.type === 'check' || step.type === 'timed');
    $('#ls-next').textContent = step.type === 'play' ? 'Done' : 'Next';
    card.innerHTML = `<div class="step-name">${step.name || NAMES[step.type] || ''}</div><h2>${lesson.title}</h2><div class="step-body"></div>`;
    setReady(true);
    stepCleanup = RENDER[step.type](card.querySelector('.step-body'), step, last) || null;
  }

  $('#ls-back').onclick = () => { if (stepNav?.back()) return; if (i > 0) show(i - 1); };
  $('#ls-next').onclick = () => { if (!ready) return; if (stepNav?.next()) return; if (i < flow.length - 1) show(i + 1); };
  $('#ls-exit').onclick = onExit;

  const board = (host, view, opts = {}) => ad().board(host, view, opts);

  // A passed check (or timed round) finishes the lesson when it's the last step.
  function complete(score, total) {
    completeLesson(lesson.id, score);
    if (next) unlockLesson(next.id);
    addLog({ minutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)), activity: `Lesson: ${lesson.title}`, detail: `Check ${score}/${total}`,
      lesson: lesson.id, score, total });
  }
  function resultHTML(passed, score, total, need) {
    return passed
      ? `<div class="result good"><b>${lesson.challenge ? 'Challenge complete!' : 'Lesson complete!'}</b><p>You got ${score} of ${total}.</p></div>
         ${next ? `<button class="primary big" id="st-cont">Continue: ${esc(next.title)}</button>` : ''}
         <button id="st-path">Back to path</button>`
      : `<div class="result bad"><b>${score} of ${total}</b><p>You need ${need} to pass. Have another go.</p></div>
         <button class="primary big" id="st-retry">Try again</button>
         <button id="st-path">Back to path</button>`;
  }
  function wireResult(body, retry) {
    body.querySelector('#st-cont')?.addEventListener('click', onContinue);
    body.querySelector('#st-retry')?.addEventListener('click', retry);
    body.querySelector('#st-path').onclick = onExit;
  }

  /* ---------- step renderers: (body, data, isLast) -> optional cleanup ---------- */
  const RENDER = {
    hear(body, d) {
      const sound = d.sound || { seq: d.sequence, bpm: d.bpm };
      body.innerHTML = `<p>${d.text}</p><button class="primary big" id="st-play">▶ Play</button>`;
      let stop = () => {};
      body.querySelector('#st-play').onclick = () => { stop(); stop = playSound(sound); };
      return () => stop();
    },

    // 2-3 cards, one idea each, each with a small neck. Next/Back move between cards first.
    learn(body, d) {
      const cards = d.cards || [{ text: d.text, points: d.points, board: d.board }];
      let k = 0, cardStop = null;
      const ticked = new Set();
      const paint = () => {
        cardStop?.(); cardStop = null;
        const c = cards[k];
        body.innerHTML = `<p>${c.text}</p>${c.points ? `<ul class="points">${c.points.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
          <div class="st-board"></div>
          ${cards.length > 1 ? `<div class="card-dots" aria-label="Card ${k + 1} of ${cards.length}">${cards.map((_, j) => `<i${j === k ? ' class="on"' : ''}></i>`).join('')}</div>` : ''}`;
        if (c.board) {
          const fb = board(body.querySelector('.st-board'), c.board.view, { focus: c.board.focus ? { strings: c.board.focus.strings?.map(n => toSF({ string: n, fret: 0 }).s), frets: c.board.focus.frets } : null });
          fb.setDots(toDots(c.board.dots));
        }
        if (c.grid) cardStop = gridCard(body.querySelector('.st-board'), c.grid);
        if (c.technique) {
          const host = document.createElement('div');
          body.querySelector('.st-board').before(host);
          techniqueCard(host, c.technique, () => { ticked.add(k); setReady(true); });
          setReady(ticked.has(k));
        } else setReady(true);
      };
      stepNav = {
        next: () => { if (k < cards.length - 1) { k++; paint(); return true; } return false; },
        back: () => { if (k > 0) { k--; paint(); return true; } return false; }
      };
      paint();
      return () => cardStop?.();
    },

    see(body, d) {
      const link = d.link ? `<a class="button-link" href="${fretboardLink(d.link)}">Open in Fretboard →</a>` : '';
      body.innerHTML = `<p>${d.text}</p><div class="row"><button class="primary" id="st-play">▶ Play</button>${link}</div><div class="st-board"></div>`;
      const fb = board(body.querySelector('.st-board'), d.view, { mode: 'sequence' });
      const steps = d.sequence.map(st => st && (Array.isArray(st) ? st.map(toSF) : toSF(st)));
      const flat = d.sequence.flatMap(st => (st ? list(st) : []));
      fb.setDots(toDots(d.dots || flat));
      body.querySelector('#st-play').onclick = () => {
        if (d.drone) droneStart(parseNote(d.drone));
        fb.playSequence(steps, { bpm: d.bpm || 90 }).then(() => { if (d.drone) droneStop(); });
      };
      return () => { fb.stopSequence(); if (d.drone) droneStop(); };
    },

    // Tap-the-neck tasks, retry until right. A task can accept several spots and
    // name the review item it practices.
    try(body, d) {
      let t = 0, timer, stop = () => {};
      body.innerHTML = `<p class="prompt" id="st-prompt"></p><div class="row" id="st-tools"></div><div class="st-board"></div><div class="msg" id="st-msg"></div>`;
      const msg = (text, kind = '') => { const m = body.querySelector('#st-msg'); m.textContent = text; m.className = 'msg ' + kind; };
      let shownAt = performance.now(), fb;
      let gridStop = null;
      const ask = () => {
        const task = d.tasks[t];
        gridStop?.(); gridStop = null;
        body.querySelector('#st-prompt').innerHTML = `${task.prompt} <span class="muted">${t + 1} of ${d.tasks.length}</span>`;
        body.querySelector('.st-board').hidden = !!task.grid;
        if (task.grid) {
          let host = body.querySelector('.st-grid');
          if (!host) { host = document.createElement('div'); host.className = 'st-grid'; body.querySelector('.st-board').before(host); }
          host.hidden = false;
          body.querySelector('#st-tools').innerHTML = '';
          gridStop = gridTask(host, task, {
            onWrong: text => msg(text, 'bad'),
            onRight: () => {
              msg(task.explain || 'Yes! That\'s the rhythm.', 'good');
              t++;
              if (t < d.tasks.length) timer = setTimeout(() => { host.hidden = true; ask(); msg(''); }, 1100);
              else { setReady(true); body.querySelector('#st-prompt').textContent = 'All done. Tap Next.'; }
            }
          });
          return;
        }
        if (body.querySelector('.st-grid')) body.querySelector('.st-grid').hidden = true;
        fb.o.view = task.view || d.view;
        fb.clearMarks();
        fb.setDots(toDots(task.dots));
        body.querySelector('#st-tools').innerHTML = task.sound ? '<button class="primary" id="st-hear">▶ Play</button>' : '';
        if (task.sound) {
          const play = () => { stop(); stop = playSound(task.sound); };
          body.querySelector('#st-hear').onclick = play;
          play();
        }
        shownAt = performance.now();
      };
      fb = board(body.querySelector('.st-board'), d.view, {
        mode: 'tap',
        onTap: ({ s, f }) => {
          if (t >= d.tasks.length) return;
          const task = d.tasks[t], answers = list(task.answer).map(toSF), hit = answers.find(a => a.s === s && a.f === f);
          recordAnswer(task.item || noteItem(hit || answers[0]), !!hit, performance.now() - shownAt);
          shownAt = performance.now();
          fb.mark(s, f, !!hit, hit && task.label ? task.label : undefined);
          if (!hit) { msg(task.hint ? `${task.hint} Try again.` : `That's ${describe(s, f)} (${ad().nameAt(s, f)}). Try again.`, 'bad'); return; }
          msg(task.explain || `Yes! ${describe(s, f)} is ${ad().nameAt(s, f)}.`, 'good');
          t++;
          if (t < d.tasks.length) timer = setTimeout(() => { ask(); msg(''); }, 900);
          else { setReady(true); body.querySelector('#st-prompt').textContent = 'All done. Tap Next.'; }
        }
      });
      setReady(false);
      ask();
      return () => { clearTimeout(timer); stop(); gridStop?.(); };
    },

    // Play on the real guitar: metronome (lights follow the beat), optional drone,
    // optional backing track (with a key choice) and an optional countdown for improvising.
    play(body, d) {
      const id = d.bpmKey ? `${lesson.id}:${d.bpmKey}` : lesson.id;
      const clamp = v => Math.min(PLAY_BPM.max, Math.max(PLAY_BPM.min, Math.round(+v) || PLAY_BPM.default));
      // Each Play step is an exercise with its own best clean tempo; start a little below it.
      const exId = `lesson:${lesson.id}${d.bpmKey ? ':' + d.bpmKey : ''}`, exTitle = `${lesson.title}${d.name ? ' · ' + d.name : ''}`;
      const best = getTempo(exId);
      let bpm = clamp(best ? startBelow(best.best) : (d.bpmKey ? null : getLesson(lesson.id).playBpm) ?? d.bpm ?? PLAY_BPM.default);
      let key = d.backing?.key || d.drone || null;
      const keys = d.backing?.keys || d.keys;
      // Bass (and drums) play over a drum loop instead of a click: the step's own style or the
      // instrument's default. Guitar lessons only get drums when a step asks for them.
      let style = d.groove || (d.drone ? null : registered('playGroove')) || null, mute = 'full';
      const grooveHTML = style ? `<div class="row"><label>Drums<select id="st-style">${Object.entries(STYLES).map(([k, v]) => `<option value="${k}"${k === style ? ' selected' : ''}>${v.name}</option>`).join('')}</select></label>
          <div class="seg" id="st-mute">${Object.entries(MUTES).map(([k, n]) => `<button data-v="${k}" aria-pressed="${k === mute}">${n}</button>`).join('')}</div></div>` : '';
      body.innerHTML = `<p>${d.text}</p>${grooveHTML}
        ${keys ? `<label class="key-pick">Key<select id="st-key">${keys.map(k => `<option${k === key ? ' selected' : ''}>${k}</option>`).join('')}</select></label>` : ''}
        <div class="tempo">
          <button class="icon" id="st-slower" aria-label="Slower">−</button>
          <input type="range" id="st-bpm" min="${PLAY_BPM.min}" max="${PLAY_BPM.max}" value="${bpm}" aria-label="Tempo in beats per minute">
          <button class="icon" id="st-faster" aria-label="Faster">+</button>
          <output id="st-bpm-out"><b>${bpm}</b> bpm</output>
        </div>
        ${volumeHTML('metroVol', 'Click volume')}${d.drone ? volumeHTML('droneVol', 'Drone volume') : ''}
        <div class="row"><button class="primary" id="st-metro">▶ ${style ? (d.backing ? 'Start drums and chords' : 'Start drums') : d.backing ? 'Start backing track' : d.drone ? 'Start drone and click' : 'Start metronome'}</button>
          <span class="countdown" id="st-count"></span></div>
        <div class="row"><button id="st-clean" title="Played that cleanly? Save this tempo.">✓ Clean run</button>
          <button id="st-trainer" aria-expanded="false">Speed trainer</button></div>
        <div class="trainer" id="st-tr" hidden></div>
        <p class="msg muted" id="st-tmsg">${best ? `Your best clean tempo here is ${best.best} bpm, so this starts a little below it.` : ''}</p>
        <p class="now-chord" id="st-chord"></p>
        ${(d.skills || []).length ? `<div class="step-skills"><span class="muted small">Hands &amp; rhythm for this step:</span>
          ${d.skills.map(id => findSkill(id)).filter(Boolean).map(sk => `<button class="skill-chip" data-skill="${sk.id}" aria-expanded="false">${esc(sk.kind === 'chord' ? sk.name + ' chord' : sk.title)}</button>`).join('')}
          <div class="skill-panel" id="st-skill" hidden></div></div>` : ''}
        ${micOn() && d.follow?.length ? '<p class="mic-line muted" id="st-mic" aria-live="polite">🎤 Listening: play along and the lit notes you hit are counted.</p>' : ''}
        <div class="st-board"></div>
        <p class="muted">Tap Done when you've played along.</p>`;
      const $b = s => body.querySelector(s);
      const fb = board($b('.st-board'), d.view || [0, 12], { labels: 'none' });
      const follow = (d.follow || []).map(st => list(st).map(toSF));
      fb.setDots(toDots(d.dots || (d.follow || []).flatMap(list)));
      const per = d.beatsPerStep || 1;
      const saved = { bpm: metronome.bpm, beats: metronome.beatsPerBar, subdiv: metronome.subdiv, group: metronome.group, running: metronome.running };
      let count = 0, timer = null, left = d.seconds || 0;
      const chords = () => d.backing ? backingChords(d.backing, key) : null;
      // One pass = once through the exercise (or its backing progression, or 4 bars).
      const passBeats = () => follow.length ? follow.length * per : d.backing ? chords().length * (d.beatsPerBar || 4) : 4 * (d.beatsPerBar || 4);
      let trainer = null, missed = false, litPcs = [], micHits = 0, micHeard = 0;
      // Optional microphone: count notes that match the lit note (stats only, never grading).
      const stopMic = micOn() && d.follow?.length ? listenNotes(n => {
        const ok = litPcs.includes(n.pc);
        micHeard++; if (ok) micHits++;
        recordMic(ok);
        const m = $b('#st-mic');
        if (m) m.textContent = `🎤 Heard ${preferredName(n.pc)}${ok ? ' ✓' : ''} · ${micHits} of ${micHeard} notes matched the lit note`;
      }, { onError: msg => { const m = $b('#st-mic'); if (m) m.textContent = msg; } }) : () => {};
      const off = metronome.listen((beat, t, bar) => {
        if (trainer && count > 0 && count % passBeats() === 0) onPass();
        if (follow.length && count % per === 0) { fb.highlight(follow[(count / per) % follow.length]); litPcs = follow[(count / per) % follow.length].map(p => pcOf(midiAt(p.s, p.f, tuningNow()))); }
        if (d.backing && beat === 0) {
          const list2 = chords(), c = list2[bar % list2.length];
          $b('#st-chord').innerHTML = `Now: <b>${esc(c.name || '')}</b>${d.backing.progression ? ` <span class="muted">(${esc(c.roman.replace(/b(?=[IV])/g, '♭'))})</span>` : ''}`;
        }
        count++;
      });
      const setBpm = v => {
        bpm = clamp(v);
        $b('#st-bpm').value = bpm;
        $b('#st-bpm-out b').textContent = bpm;
        $b('#st-slower').disabled = bpm <= PLAY_BPM.min;
        $b('#st-faster').disabled = bpm >= PLAY_BPM.max;
        if (metronome.running) metronome.setBpm(bpm);
        if (!d.bpmKey) setLessonBpm(lesson.id, bpm);
      };
      const tmsg = text => { $b('#st-tmsg').textContent = text; };
      // Skill panels (chord shapes, strums, technique) open inline, without leaving the lesson.
      let skillCleanup = null;
      body.querySelectorAll('.skill-chip').forEach(btn => btn.onclick = () => {
        const panel = $b('#st-skill'), open = btn.getAttribute('aria-expanded') !== 'true';
        skillCleanup?.(); skillCleanup = null;
        body.querySelectorAll('.skill-chip').forEach(b => b.setAttribute('aria-expanded', 'false'));
        panel.hidden = !open;
        if (open) { btn.setAttribute('aria-expanded', 'true'); skillCleanup = renderSkill(panel, findSkill(btn.dataset.skill), { compact: true }); }
      });
      $b('#st-clean').onclick = () => { const r = recordClean(exId, bpm, exTitle); tmsg(`Saved: ${bpm} bpm clean. Your best here is ${r.best} bpm.`); };
      function trainerPanel() {
        const tr = $b('#st-tr');
        if (!trainer) {
          tr.innerHTML = trainerSetupHTML({ unit: 'bpm', start: Math.max(PLAY_BPM.min, bpm - (bpm % 2)), end: Math.min(PLAY_BPM.max, bpm + 20 - (bpm % 2)), steps: [2, 4, 6, 10], step: 4, min: PLAY_BPM.min, max: PLAY_BPM.max });
          tr.querySelector('[data-tr="go"]').onclick = () => {
            const v = k => +tr.querySelector(`[data-tr="${k}"]`).value;
            trainer = new SpeedTrainer({ start: v('start'), end: v('end'), step: v('step') });
            missed = false;
            setBpm(trainer.tempo);
            startAll();
            trainerPanel();
          };
          return;
        }
        tr.innerHTML = `<div class="trainer-run"><div class="tr-status">${trainerStatusHTML(trainer, 'bpm')}</div>
          <button class="big tr-missed" id="st-missed" aria-pressed="${missed}">✗ Missed it</button>
          <button class="quiet-inline" id="st-tr-stop">Stop trainer</button></div>`;
        tr.querySelector('#st-missed').onclick = () => { missed = true; tr.querySelector('#st-missed').setAttribute('aria-pressed', 'true'); };
        tr.querySelector('#st-tr-stop').onclick = () => { trainer = null; trainerPanel(); };
      }
      function onPass() {
        const clean = !missed;
        missed = false;
        if (clean) recordClean(exId, bpm, exTitle);
        const r = trainer.pass(clean);
        if (r.change === 'goal') { tmsg(`Goal reached: ${r.tempo} bpm clean, 3 times in a row.`); trainer = null; }
        else if (r.tempo !== bpm) { setBpm(r.tempo); tmsg(r.change === 'up' ? `Up to ${r.tempo} bpm.` : `Back to ${r.tempo} bpm. No rush.`); }
        trainerPanel();
      }
      $b('#st-trainer').onclick = () => {
        const tr = $b('#st-tr'), open = tr.hidden;
        tr.hidden = !open;
        $b('#st-trainer').setAttribute('aria-expanded', open);
        if (open) trainerPanel();
      };
      $b('#st-bpm').oninput = e => setBpm(e.target.value);
      $b('#st-slower').onclick = () => setBpm(bpm - 1);
      $b('#st-faster').onclick = () => setBpm(bpm + 1);
      $b('#st-slower').disabled = bpm <= PLAY_BPM.min;
      $b('#st-faster').disabled = bpm >= PLAY_BPM.max;
      const btn = $b('#st-metro'), label = btn.textContent;
      const stopAll = () => { groove.stop(); backing.stop(); metronome.stop(); if (d.drone) droneStop(); clearInterval(timer); fb.highlight([]); };
      const startAll = () => {
        stopAll();
        count = 0;
        if (d.drone) droneStart(parseNote(key || d.drone));
        if (style) groove.start({ style, bpm, mute, chords: d.backing ? chords() : null });
        else if (d.backing) backing.start(chords(), { bpm, beatsPerBar: d.beatsPerBar || 4 });
        else {
          metronome.setBpm(bpm);
          metronome.beatsPerBar = d.beatsPerBar || 4;
          metronome.subdiv = 1;
          metronome.group = 0;
          metronome.start();
        }
        if (d.seconds) {
          left = d.seconds;
          $b('#st-count').textContent = clock(left);
          timer = setInterval(() => {
            left--;
            $b('#st-count').textContent = left > 0 ? clock(left) : "Time's up!";
            if (left <= 0) { stopAll(); btn.textContent = label; }
          }, 1000);
        }
        btn.textContent = '■ Stop';
        setReady(true);
      };
      btn.onclick = () => { if (metronome.running || backing.running) { stopAll(); btn.textContent = label; } else startAll(); };
      $b('#st-key')?.addEventListener('change', e => { key = e.target.value; if (metronome.running) startAll(); });
      $b('#st-style')?.addEventListener('change', e => { style = e.target.value; if (metronome.running) startAll(); });
      $b('#st-mute')?.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        mute = b.dataset.v;
        body.querySelectorAll('#st-mute button').forEach(x => x.setAttribute('aria-pressed', x === b));
        if (groove.running) groove.set({ mute });
      });
      setReady(false);
      return () => {
        stopMic();
        skillCleanup?.();
        off();
        stopAll();
        if (saved.running) metronome.start();
        metronome.setBpm(saved.bpm);
        metronome.beatsPerBar = saved.beats;
        metronome.subdiv = saved.subdiv;
        metronome.group = saved.group;
      };
    },

    check(body, d, last) {
      let q = 0, score = 0, cleanup = null;
      const pass = d.pass ?? Math.ceil(d.questions.length * 0.75);
      const ask = () => {
        cleanup?.();
        const x = d.questions[q];
        body.innerHTML = `<p class="prompt">${x.prompt} <span class="muted">Question ${q + 1} of ${d.questions.length}</span></p>
          <div class="st-answer"></div><div class="msg" id="st-msg"></div>
          <button class="primary" id="st-qnext" hidden>${q + 1 < d.questions.length ? 'Next question' : 'See result'}</button>`;
        body.querySelector('#st-qnext').onclick = () => { q++; q < d.questions.length ? ask() : result(); };
        cleanup = renderQuestion(body.querySelector('.st-answer'), x, {
          view: d.view,
          onAnswer: (ok, item, feedback) => {
            if (ok) score++;
            const m = body.querySelector('#st-msg');
            m.textContent = ok ? (x.explainRight || 'Correct!') : feedback;
            m.className = 'msg ' + (ok ? 'good' : 'bad');
            body.querySelector('#st-qnext').hidden = false;
            body.querySelector('#st-qnext').focus();
          }
        });
      };
      const result = () => {
        cleanup?.();
        const passed = score >= pass;
        if (passed && last) complete(score, d.questions.length);
        if (!last) {
          body.innerHTML = `<div class="result ${passed ? 'good' : 'bad'}"><b>${score} of ${d.questions.length}</b><p>${passed ? 'Nice. Tap Next.' : 'Have another go, or tap Next to carry on.'}</p></div>
            <button id="st-retry">Try again</button>`;
          body.querySelector('#st-retry').onclick = () => { q = 0; score = 0; ask(); };
          setReady(true);
          return;
        }
        body.innerHTML = resultHTML(passed, score, d.questions.length, pass);
        wireResult(body, () => { q = 0; score = 0; ask(); });
      };
      setReady(false);
      ask();
      return () => cleanup?.();
    },

    // Bass Level 1 challenge: roots on beat 1 with the kick; timing shown, never blocking.
    kickroots(body, d) {
      setReady(false);
      return kickRootsStep(body, d, { setReady });
    },

    // Level 1 challenge: the app names a note; play it, then tap it within the time limit.
    timed(body, d, last) {
      const tuning = tuningNow(), strings = d.strings || [6, 5, 4, 3, 2, 1], [from, to] = d.frets || [0, 12];
      let round = 0, score = 0, target = null, deadline = 0, raf = null, timer = null, shownAt = 0, lastKey = '';
      const pass = d.pass ?? 8;
      body.innerHTML = `<p>${d.text}</p><button class="primary big" id="st-go">▶ Start</button>`;
      const pick = () => {
        let s, pc, key;
        do {
          s = toSF({ string: strings[Math.floor(Math.random() * strings.length)], fret: 0 }).s;
          const f = from + Math.floor(Math.random() * (to - from + 1));
          pc = pcOf(midiAt(s, f, tuning));
          key = s + ':' + pc;
        } while (key === lastKey);
        lastKey = key;
        return { s, pc };
      };
      const start = () => {
        round = 0; score = 0;
        body.innerHTML = `<div class="drill-top"><span id="st-round"></span><span id="st-score"></span></div>
          <p class="prompt" id="st-prompt"></p><div class="time-bar"><i id="st-time"></i></div>
          <div class="st-board"></div><div class="msg" id="st-msg"></div>`;
        const fb = board(body.querySelector('.st-board'), [from, to], {
          mode: 'tap',
          onTap: ({ s, f, pc }) => {
            if (!target || target.done) return;
            if (s !== target.s) { body.querySelector('#st-msg').textContent = `That's string ${tuning.strings[s].num}. Find it on the ${tuning.strings[target.s].name} string.`; return; }
            const ms = performance.now() - shownAt, ok = pc === target.pc, inTime = ms <= d.seconds * 1000;
            target.done = true;
            cancelAnimationFrame(raf);
            recordAnswer(`note:${NOTES[target.pc]}@s${itemNum(tuning, s)}`, ok && inTime, ms);
            if (ok && inTime) score++;
            fb.mark(s, f, ok, preferredName(pc));
            const m = body.querySelector('#st-msg');
            m.textContent = ok ? (inTime ? `Yes, ${(ms / 1000).toFixed(1)} s.` : `Right note, but ${(ms / 1000).toFixed(1)} s. Aim for under ${d.seconds}.`) : `That's ${preferredName(pc)}.`;
            m.className = 'msg ' + (ok && inTime ? 'good' : 'bad');
            timer = setTimeout(nextRound, ok ? 700 : 1400);
          }
        });
        const nextRound = () => {
          if (round >= d.rounds) return finish();
          round++;
          target = pick();
          fb.clearMarks();
          body.querySelector('#st-round').textContent = `Round ${round} of ${d.rounds}`;
          body.querySelector('#st-score').textContent = `Score ${score}`;
          body.querySelector('#st-prompt').innerHTML = `Play <span class="target">${preferredName(target.pc)}</span> on the ${tuning.strings[target.s].name} string (string ${tuning.strings[target.s].num}), then tap it.`;
          body.querySelector('#st-msg').textContent = '';
          fb.o.focus = { strings: [target.s] };
          fb.render();
          shownAt = performance.now();
          deadline = shownAt + d.seconds * 1000;
          const tick = () => {
            const left = Math.max(0, deadline - performance.now());
            const el2 = body.querySelector('#st-time');
            if (el2) el2.style.width = (100 * left / (d.seconds * 1000)) + '%';
            if (left > 0 && !target.done) raf = requestAnimationFrame(tick);
          };
          tick();
        };
        nextRound();
      };
      const finish = () => {
        const passed = score >= pass;
        if (passed && last) complete(score, d.rounds);
        body.innerHTML = resultHTML(passed, score, d.rounds, pass);
        wireResult(body, start);
      };
      body.querySelector('#st-go').onclick = start;
      if (last) setReady(false);
      return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
    }
  };

  show(0);
  return () => stepCleanup?.();
}
