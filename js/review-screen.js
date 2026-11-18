// Daily review: today's session from js/review.js, one question at a time.
// Questions reuse the drill rounds (js/practice/drills.js) in one-try mode, so
// answers land in the same stats and schedule as everything else. The session
// is saved after every answer, so Pause (or a reload) resumes where you were.
import { midiAt, pcOf, parseNote, lookup, parseFormula, spell, preferredName } from './theory.js';
import { playSound } from './sound.js';
import { strum, voicing } from './audio.js';
import { Fretboard } from './fretboard.js';
import { droneStart, droneStop, droneOn } from './audio.js';
import { allItems, getItem, recordAnswer, getLesson, getReview, setReview, addLog, getPracticePrefs, today } from './storage.js';
import { buildSession, estimateMinutes, boxOf, GAPS } from './review.js';
import { finishedLessonItems, factQuestion } from './lessons/index.js';
import { asRound, DRILLS } from './practice/drills.js';
import { itemName } from './stats.js';
import { esc, shuffle } from './ui.js';
import { SKILLS, findSkill } from './skills.js';
import { asEarRound } from './ear.js';
import { PATTERNS, findPattern, rhythmSVG } from './rhythm.js';
import { pluckAt, click as clickAt, now as audioNow, context } from './audio.js';

/* ---------- item types beyond the drills ----------
   degree:G:major:3     tap the 3rd of G major (anywhere on the neck)
   tone:G:major:3       tap the 3rd of the G major chord
   chord-ear:minor      hear a chord, name its kind */
const ORD = { 1: 'root', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th' };
const degreeWords = label => {
  if (label === 'R') return 'root';
  const m = /^(bb|b|#)?(\d)$/.exec(label);
  return m ? (m[1] === 'b' ? 'flat ' : m[1] === '#' ? 'sharp ' : m[1] === 'bb' ? 'double-flat ' : '') + ORD[m[2]] : label;
};
// 'degree:G:major:3' -> { kind, key, keyPc, id, label, pc, name, title }
export function parseDegreeItem(itemId) {
  const m = /^(degree|tone):([A-G][#b]?):([\w-]+):(R|bb?\d|#?\d)$/.exec(itemId);
  if (!m) return null;
  const [, type, key, id, label] = m, kind = type === 'degree' ? 'scale' : 'chord', item = lookup(kind, id);
  if (!item) return null;
  const keyPc = parseNote(key), degs = parseFormula(item.formula), k = degs.findIndex(d => d.label === label);
  if (k < 0) return null;
  const sp = spell(keyPc, degs), what = item.name.replace(/ \(.*\)$/, '').toLowerCase();
  return { type, key: sp.root, keyPc, id, label, pc: pcOf(keyPc + degs[k].semi), name: sp.notes[k],
    title: type === 'degree' ? `${sp.root} ${what}` : `the ${sp.root} ${what} chord` };
}
export const degreeTitle = x => `the ${degreeWords(x.label)} of ${x.title}`;
const EAR_SETS = [['major', 'minor', 'dim'], ['maj7', '7', 'm7']];
const EAR_NAMES = { major: 'Major', minor: 'Minor', dim: 'Diminished', maj7: 'Major 7', '7': 'Dominant 7', m7: 'Minor 7' };
const earSet = id => EAR_SETS.find(s => s.includes(id));

// Items the review screen knows how to ask.
const chordShapeOf = id => { const s = id.startsWith('chordshape:') && findSkill(id.slice(11)); return s && s.kind === 'chord' ? s : null; };
const patternOf = id => (id.startsWith('rhythm:') ? findPattern(id.slice(7)) : null);
export const askable = id => !!asRound(id) || (id.startsWith('fact:') && !!factQuestion(id)) || !!parseDegreeItem(id) || !!chordShapeOf(id) || !!patternOf(id) || !!asEarRound(id)
  || (id.startsWith('chord-ear:') && !!earSet(id.slice(10)));

// Today's saved session, or null if there isn't one for today.
export function todaysReview() {
  const r = getReview();
  return r && r.day === today() ? r : null;
}

// What today's session would hold if started now.
export const planToday = () => buildSession({
  items: allItems(), day: today(), ok: askable,
  lessonItems: finishedLessonItems(id => getLesson(id).completed)
});

export function startReview(plan = planToday()) {
  const key = (getPracticePrefs().drills.hear || {}).key ?? 7;
  setReview({ day: today(), queue: plan.questions, index: 0, results: [], done: false, bonus: plan.bonus, key, seconds: 0 });
}

const itemLabel = id => id.startsWith('fact:') ? factQuestion(id).prompt : itemName(id);

// Tap the degree (or chord tone) anywhere in view. One try; a miss shows and plays it.
function degreeRound(ui, id) {
  const x = parseDegreeItem(id), shownAt = performance.now();
  let done = false;
  ui.prompt(`Tap ${degreeTitle(x)}.`);
  return {
    tap({ s, f, pc, midi }) {
      if (done) return;
      done = true;
      const ok = pc === x.pc;
      recordAnswer(id, ok, performance.now() - shownAt);
      ui.result(ok);
      ui.fb.mark(s, f, ok, ok ? x.name : preferredName(pc));
      if (!ok) {
        let best = null;
        for (let ss = 0; ss < 6; ss++) for (let ff = ui.o.from; ff <= ui.o.to; ff++)
          if (pcOf(midiAt(ss, ff)) === x.pc && (!best || Math.abs(ss - s) + Math.abs(ff - f) < Math.abs(best.s - s) + Math.abs(best.f - f))) best = { s: ss, f: ff };
        if (best) { ui.fb.mark(best.s, best.f, true, x.name, true); playSound({ seq: [null, midiAt(best.s, best.f)], bpm: 150 }); }
      }
      ui.msg(`${ok ? 'Yes! ' : ''}${degreeTitle(x)[0].toUpperCase() + degreeTitle(x).slice(1)} is ${x.name}.`, ok ? 'good' : 'bad');
      ok ? ui.autoNext(900) : ui.showNext();
    }
  };
}

// "Which chord is this?" The shape in neutral dots (root outlined); pick its name.
function chordShapeRound(ui, id) {
  const sk = chordShapeOf(id), shownAt = performance.now();
  const others = shuffle(SKILLS.filter(x => x.kind === 'chord' && x.id !== sk.id && Math.abs(x.level - sk.level) <= 3)).slice(0, 2);
  let done = false;
  ui.fb.o.view = [0, 5];
  ui.fb.setDots(sk.shape.map(([s, f]) => { const d = sk.chord.dot(s, f); return { s: s - 1, f, role: 'bare', ring: d.role === 'root' }; }));
  ui.prompt('Which chord is this?');
  ui.choices(shuffle([sk, ...others]).map(x => `<button data-k="${x.id}">${esc(x.name)}</button>`).join(''));
  ui.$('#dr-choices').onclick = e => {
    const b = e.target.closest('button');
    if (!b || done) return;
    done = true;
    const ok = b.dataset.k === sk.id;
    recordAnswer(id, ok, performance.now() - shownAt);
    ui.$$('#dr-choices button').forEach(x => { x.disabled = true; if (x.dataset.k === sk.id) x.classList.add('good'); else if (x === b) x.classList.add('bad'); });
    ui.fb.setDots(sk.shape.map(([s, f]) => { const d = sk.chord.dot(s, f); return { s: s - 1, f, role: d.role, label: d.label }; }));
    playSound({ seq: [sk.shape.map(([s, f]) => ({ string: s, fret: f }))], bpm: 60 });
    ui.msg(`${ok ? 'Yes! ' : ''}That is ${sk.name}: ${sk.tip}`, ok ? 'good' : 'bad');
    ui.result(ok);
    ok ? ui.autoNext(1400) : ui.showNext();
  };
  return {};
}

// "Which rhythm did you hear?" Plays the pattern over a click; tap the matching rhythm line.
function rhythmRound(ui, id) {
  const pat = patternOf(id), shownAt = performance.now();
  const others = shuffle(PATTERNS.filter(p => p.id !== pat.id && p.beats === pat.beats)).slice(0, 2);
  let done = false;
  const play = () => {
    if (!context()) return;
    const t0 = audioNow() + 0.15, spb = 60 / 80;
    for (let k = 0; k < pat.beats * 2; k++) clickAt(t0 + k * spb, k % pat.beats === 0 ? 2 : 1, 0.6);
    for (let bar = 0; bar < 2; bar++) { let b = bar * pat.beats; pat.notes.forEach(n => { if (!n.rest) pluckAt(76, t0 + b * spb, 0.6); b += n.dur; }); }
  };
  ui.fb.wrap.hidden = true;
  ui.prompt('Which rhythm is this?');
  ui.tools('<button class="primary" id="rv-replay">▶ Play again</button>');
  ui.$('#rv-replay').onclick = play;
  ui.choices(shuffle([pat, ...others]).map(p => `<button class="rhythm-choice" data-p="${p.id}" aria-label="Rhythm option">${rhythmSVG(p, { small: true, pxPerBeat: 40 })}</button>`).join(''));
  ui.$('#dr-choices').onclick = e => {
    const b = e.target.closest('button');
    if (!b || done) return;
    done = true;
    const ok = b.dataset.p === pat.id;
    recordAnswer(id, ok, performance.now() - shownAt);
    ui.$$('#dr-choices button').forEach(x => { x.disabled = true; if (x.dataset.p === pat.id) x.classList.add('good'); else if (x === b) x.classList.add('bad'); });
    ui.msg(`${ok ? 'Yes! ' : ''}That was ${pat.name}: ${pat.count}.`, ok ? 'good' : 'bad');
    ui.result(ok);
    ok ? ui.autoNext(1200) : ui.showNext();
  };
  play();
  return { end() { ui.fb.wrap.hidden = false; } };
}

// Hear a chord on a random root; name its kind from its set of three.
function chordEarRound(ui, id) {
  const kind = id.slice(10), set = earSet(kind), root = Math.floor(Math.random() * 12), shownAt = performance.now();
  let done = false;
  const play = () => strum(voicing(root, kind), 0.05);
  ui.fb.wrap.hidden = true;
  ui.prompt('What kind of chord is this?');
  ui.tools('<button class="primary" id="rv-replay">▶ Play again</button>');
  ui.$('#rv-replay').onclick = play;
  ui.choices(set.map(k => `<button data-k="${k}">${EAR_NAMES[k]}</button>`).join(''));
  ui.$('#dr-choices').onclick = e => {
    const b = e.target.closest('button');
    if (!b || done) return;
    done = true;
    const ok = b.dataset.k === kind;
    recordAnswer(id, ok, performance.now() - shownAt);
    ui.$$('#dr-choices button').forEach(x => { x.disabled = true; if (x.dataset.k === kind) x.classList.add('good'); else if (x === b) x.classList.add('bad'); });
    ui.msg(`${ok ? 'Yes! ' : ''}That was ${preferredName(root)} ${EAR_NAMES[kind].toLowerCase()}.`, ok ? 'good' : 'bad');
    play();
    ui.result(ok);
    ok ? ui.autoNext(1200) : ui.showNext();
  };
  play();
  return { end() { ui.fb.wrap.hidden = false; } };
}
const days = n => n === 1 ? 'tomorrow' : `in ${n} days`;
// Days from today until a 'YYYY-MM-DD' day (the item's real next review).
const untilDay = day => Math.max(1, Math.round((new Date(day + 'T12:00') - new Date(today() + 'T12:00')) / 86400000));

// A Check question from a lesson, asked again.
function factRound(ui, id) {
  const q = factQuestion(id), shownAt = performance.now();
  let done = false, stop = () => {};
  ui.prompt(esc(q.prompt));
  if (q.sound) {
    const play = () => { stop(); stop = playSound(q.sound); };
    ui.tools('<button class="primary" id="rv-replay">▶ Play</button>');
    ui.$('#rv-replay').onclick = play;
    play();
  }
  ui.choices(shuffle(q.options).map(o => `<button data-o="${esc(o)}">${esc(o)}</button>`).join(''));
  ui.fb.wrap.hidden = true;
  ui.$('#dr-choices').onclick = e => {
    const b = e.target.closest('button');
    if (!b || done) return;
    done = true;
    const ok = b.dataset.o === q.answer;
    recordAnswer(id, ok, performance.now() - shownAt);
    ui.$$('#dr-choices button').forEach(x => {
      x.disabled = true;
      if (x.dataset.o === q.answer) x.classList.add('good'); else if (x === b) x.classList.add('bad');
    });
    ui.msg(ok ? 'Yes!' : `The answer is ${q.answer}.`, ok ? 'good' : 'bad');
    ui.result(ok);
    ok ? ui.autoNext(900) : ui.showNext();
  };
  return { end() { ui.fb.wrap.hidden = false; stop(); } };
}

// Returns a cleanup function.
export function runReview(el, { onExit }) {
  let r = todaysReview();
  if (!r) { onExit(); return () => {}; }
  el.innerHTML = `
    <div class="lesson review">
      <div class="lesson-top">
        <button id="rv-pause" class="quiet-inline">Pause</button>
        <div class="bar" role="progressbar" aria-label="Review progress"><i id="rv-bar"></i></div>
        <span id="rv-count"></span>
      </div>
      <div class="card rv-card" id="rv-card">
        <div class="step-name" id="rv-kind"></div>
        <p class="prompt" id="dr-prompt"></p>
        <div class="row" id="dr-tools"></div>
        <div id="dr-board"></div>
        <div class="choices" id="dr-choices"></div>
        <div class="msg" id="dr-msg" aria-live="polite"></div>
        <button class="primary big" id="dr-next" hidden>Next →</button>
      </div>
    </div>`;
  const $ = s => el.querySelector(s);
  const o = { strings: [0, 1, 2, 3, 4, 5], from: 0, to: 12, key: r.key, scale: 'major', level: 'medium' };
  let current = null, shownAt = 0, answered = false, autoTimer = null, closed = false, before = null;
  const fb = new Fretboard($('#dr-board'), { view: [0, 12], mode: 'tap', labels: 'none', onTap: t => current?.tap?.(t) });
  const ui = {
    fb, o, $, $$: s => el.querySelectorAll(s),
    prompt: html => { $('#dr-prompt').innerHTML = html; },
    msg: (text, kind = '') => { const m = $('#dr-msg'); m.textContent = text; m.className = 'msg ' + kind; },
    tools: html => { $('#dr-tools').innerHTML = html; },
    choices: html => { $('#dr-choices').innerHTML = html; },
    // One answer per question; save it straight away.
    result(ok) {
      if (answered) return;
      answered = true;
      const id = r.queue[r.index], after = getItem(id);
      r.results.push({ id, ok, from: before, to: after ? boxOf(after) : 1, next: after?.dueDay });
      r.seconds += Math.min(120, (performance.now() - shownAt) / 1000);
      r.index++;
      setReview(r);
      paintTop();
    },
    showNext() { $('#dr-next').hidden = false; $('#dr-next').focus({ preventScroll: true }); },
    autoNext(ms) { autoTimer = setTimeout(next, ms); }
  };
  const KIND = { note: 'Find the note', ear: 'Hear it, find it', interval: 'Interval', 'interval-ear': 'Interval by ear', fact: 'Quick question',
    degree: 'Scale degree', tone: 'Chord tone', 'chord-ear': 'Chord by ear', chordshape: 'Chord shape', rhythm: 'Rhythm', bass: 'Bass motion', dictation: 'Melody by ear' };
  const paintTop = () => {
    const n = r.queue.length;
    $('#rv-bar').style.width = (100 * r.index / n) + '%';
    $('#rv-count').textContent = `${Math.min(r.index + (answered ? 0 : 1), n)}/${n}`;
  };

  function next() {
    clearTimeout(autoTimer);
    if (closed) return;
    current?.end?.();
    current = null;
    if (r.index >= r.queue.length) return finish();
    const id = r.queue[r.index], it = getItem(id), round = asRound(id);
    before = it ? boxOf(it) : 0;
    // Phones show 6 frets (like the lessons) so the whole question fits with big targets:
    // 0-5, or the window holding the answer when a note question's answer is higher up.
    let view = [0, 12];
    if (matchMedia('(max-width: 700px)').matches) {
      const w = round?.want, f0 = w?.pc != null ? [...Array(12).keys()].find(f => pcOf(midiAt(w.s, f)) === w.pc) : 0;
      view = f0 <= 5 ? [0, 5] : f0 <= 10 ? [5, 10] : [7, 12];
    }
    [o.from, o.to] = view;
    fb.o.view = view;
    answered = false;
    shownAt = performance.now();
    $('#dr-next').hidden = true;
    fb.o.focus = null;
    fb.clearMarks(); fb.setDots([]);
    ui.msg(''); ui.tools(''); ui.choices('');
    $('#rv-kind').textContent = KIND[id.split(':')[0]] || '';
    paintTop();
    if (id.startsWith('fact:')) { if (droneOn()) droneStop(); current = factRound(ui, id); return; }
    if (parseDegreeItem(id)) { if (droneOn()) droneStop(); current = degreeRound(ui, id); return; }
    if (chordShapeOf(id)) { if (droneOn()) droneStop(); current = chordShapeRound(ui, id); return; }
    if (patternOf(id)) { if (droneOn()) droneStop(); current = rhythmRound(ui, id); return; }
    const ear = asEarRound(id);
    if (ear) { if (droneOn()) droneStop(); current = ear.round(ui, ear.want); return; }
    if (id.startsWith('chord-ear:')) { if (droneOn()) droneStop(); current = chordEarRound(ui, id); return; }
    if (!round) { ui.result(true); return next(); }  // no longer askable: skip it quietly
    // The drone plays only for hear-it rounds.
    if (round.drill === DRILLS[1]) { if (!droneOn()) droneStart(r.key); } else if (droneOn()) droneStop();
    current = round.drill.round(ui, { ...round.want, once: true });
  }

  function finish() {
    droneStop();
    r.done = true;
    setReview(r);
    const n = r.results.length, score = r.results.filter(x => x.ok).length;
    addLog({ minutes: Math.max(1, Math.round(r.seconds / 60)), activity: r.bonus ? 'Daily review (bonus round)' : 'Daily review',
      detail: `${score}/${n}`, drill: 'daily', score, total: n });
    const up = r.results.filter(x => x.ok && x.to > x.from && x.from > 0);
    const back = r.results.filter(x => !x.ok);
    const list = (xs, f) => `<ul class="rv-list">${xs.map(x => `<li>${esc(itemLabel(x.id))}${f ? `<small>${f(x)}</small>` : ''}</li>`).join('')}</ul>`;
    $('#rv-card').innerHTML = `
      <div class="done-card rv-done">
        <div class="rv-check" aria-hidden="true">✓</div>
        <h3>Done for today, come back tomorrow.</h3>
        <div class="score-big">${score}<span>/${n}</span></div>
        ${up.length ? `<h4>Moved up (${up.length})</h4>${list(up, x => `next ${days(x.next ? untilDay(x.next) : GAPS[x.to - 1])}`)}` : ''}
        ${back.length ? `<h4>Coming back tomorrow (${back.length})</h4>${list(back)}` : ''}
        ${!up.length && !back.length ? '<p class="muted">Everything stays on schedule.</p>' : ''}
        <div class="row center"><button class="primary big" id="rv-home">Back to Learn</button><a class="button-link" href="#progress">See progress</a></div>
      </div>`;
    $('#rv-pause').hidden = true;
    $('#rv-bar').style.width = '100%';
    $('#rv-home').onclick = onExit;
  }

  $('#dr-next').onclick = next;
  $('#rv-pause').onclick = onExit;
  next();
  return () => { closed = true; clearTimeout(autoTimer); current?.end?.(); droneStop(); };
}

// The "Today's review" card on the Learn home screen.
export function reviewCardHTML() {
  const r = todaysReview();
  if (r && r.done) return `
    <div class="rv-home done"><span class="rv-tick" aria-hidden="true">✓</span>
      <span><b>Today's review is done</b><small>${r.results.filter(x => x.ok).length} of ${r.results.length} right · Back tomorrow</small></span></div>`;
  if (r && r.queue.length) return `
    <div class="rv-home"><span><b>Today's review</b><small>${r.index} of ${r.queue.length} done · about ${estimateMinutes(r.queue.length - r.index)} min left</small></span>
      <a class="button-link primary" href="#learn?review=1">Resume</a></div>`;
  const p = planToday(), n = p.questions.length;
  if (!n) return `
    <div class="rv-home quiet"><span><b>Today's review</b><small>Your review deck fills up as you do lessons and drills.</small></span></div>`;
  const what = p.bonus ? `Nothing due today. Bonus round: ${n} weak spot${n === 1 ? '' : 's'}`
    : `${p.due} due${p.fresh ? ` · ${p.fresh} new` : ''}${n > p.due + p.fresh ? ` · ${n - p.due - p.fresh} weak` : ''}`;
  return `
    <div class="rv-home"><span><b>Today's review</b><small>${what} · about ${estimateMinutes(n)} min${p.carried ? `<br>${p.carried} more wait for tomorrow` : ''}</small></span>
      <button class="primary" id="rv-start">${p.bonus ? 'Start bonus' : 'Start'}</button></div>`;
}
