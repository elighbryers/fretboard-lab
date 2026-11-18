// Drills: tap-to-answer practice with instant feedback. Each drill: choose
// strings / frets and 10 or 20 rounds, then a score at the end. Every answer is
// saved to the per-item stats (heat map, future daily review). Wrong answers
// never lock you out: you see the right answer and move on.
import { NOTES, KEY_NAMES, pcOf, midiAt, lookup, parseFormula, spell, preferredName, noteAbove } from '../theory.js';
import { Fretboard } from '../fretboard.js';
import { pluckAt, context, now, droneStart, droneStop, droneOn } from '../audio.js';
import { recordAnswer, recordConfusion, addLog, getPracticePrefs, updatePracticePrefs, getInstrument } from '../storage.js';
import { volumeHTML, esc, pick, shuffle } from '../ui.js';
import { tuningOf } from '../instruments.js';

const tuning = tuningOf(getInstrument()), ALL = [0, 1, 2, 3, 4, 5], MAX_FRET = 15;
const ORD = { 1: 'root', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th' };
// "b3" -> "flat 3rd", "#4" -> "sharp 4th", "R" -> "root"
const degreeWords = label => {
  if (label === 'R') return 'root';
  const m = /^(b|#)?(\d)$/.exec(label);
  return (m[1] === 'b' ? 'flat ' : m[1] === '#' ? 'sharp ' : '') + ORD[m[2]];
};
const CHROMATIC = ['R', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7'];

const IV = {
  m3: { semis: 3, name: 'minor 3rd', deg: 'b3' }, M3: { semis: 4, name: 'major 3rd', deg: '3' },
  P4: { semis: 5, name: 'perfect 4th', deg: '4' }, P5: { semis: 7, name: 'perfect 5th', deg: '5' },
  m6: { semis: 8, name: 'minor 6th', deg: 'b6' }, M6: { semis: 9, name: 'major 6th', deg: '6' },
  m7: { semis: 10, name: 'minor 7th', deg: 'b7' }, M7: { semis: 11, name: 'major 7th', deg: '7' }
};
// Confusable pairs are drilled together (research: interleave easily confused items).
const IV_SETS = { 'm3-M3': ['m3', 'M3'], 'P4-P5': ['P4', 'P5'], 'm6-M6': ['m6', 'M6'], 'm7-M7': ['m7', 'M7'], all: Object.keys(IV) };
const IV_SET_LABELS = { 'm3-M3': 'm3 / M3', 'P4-P5': '4th / 5th', 'm6-M6': 'm6 / M6', 'm7-M7': 'm7 / M7', all: 'All pairs' };
const NAME_ABOVE = semis => ['unison', 'minor 2nd', 'major 2nd', 'minor 3rd', 'major 3rd', 'perfect 4th', 'tritone', 'perfect 5th', 'minor 6th', 'major 6th', 'minor 7th', 'major 7th'][semis];

const HEAR_SCALES = { major: 'Major', 'minor-pentatonic': 'Minor pentatonic', minor: 'Natural minor' };

export const DRILLS = [
  { id: 'notes', title: 'Note finder', blurb: 'Find a named note on the neck',
    defaults: { strings: [4, 5], from: 0, to: 12, rounds: 10 } },
  { id: 'hear', title: 'Hear it, find it', blurb: 'A drone sets the key; find the note you hear',
    defaults: { key: 7, scale: 'major', level: 'easy', strings: ALL, from: 0, to: 12, rounds: 10 } },
  { id: 'intervals', title: 'Interval trainer', blurb: 'Find or name intervals, confusable pairs together',
    defaults: { mode: 'find', set: 'm3-M3', strings: ALL, from: 0, to: 12, rounds: 10 } }
];

const optsFor = d => ({ ...d.defaults, ...(getPracticePrefs().drills[d.id] || {}) });
const saveOpts = (id, o) => updatePracticePrefs({ drills: { ...getPracticePrefs().drills, [id]: o } });
const positions = o => o.strings.flatMap(s => Array.from({ length: o.to - o.from + 1 }, (_, k) => {
  const f = o.from + k, midi = midiAt(s, f);
  return { s, f, midi, pc: pcOf(midi) };
}));
const playAt = (midi, delay = 0) => { if (context()) pluckAt(midi, now() + 0.03 + delay); };

/* ---------- setup screen ---------- */
function setup(el, d, start) {
  const o = optsFor(d);
  const seg = (id, items, val) => `<div class="seg" id="${id}">${items.map(([v, l]) => `<button data-v="${v}" aria-pressed="${String(v) === String(val)}">${l}</button>`).join('')}</div>`;
  const fretOpts = sel => Array.from({ length: MAX_FRET + 1 }, (_, f) => `<option value="${f}"${f === sel ? ' selected' : ''}>${f}</option>`).join('');
  let extra = '';
  if (d.id === 'hear') extra = `
    <div class="row"><label>Key<select id="dr-key">${KEY_NAMES.map((k, i) => `<option value="${i}"${i === o.key ? ' selected' : ''}>${k}</option>`).join('')}</select></label></div>
    <div class="field"><span class="lbl">Scale</span>${seg('dr-scale', Object.entries(HEAR_SCALES), o.scale)}</div>
    <div class="field"><span class="lbl">Difficulty</span>${seg('dr-level', [['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']], o.level)}
      <small class="muted">Easy: root, 3rd, 5th · Medium: the whole scale · Hard: any of the 12 notes</small></div>
    ${volumeHTML('droneVol', 'Drone volume')}`;
  if (d.id === 'intervals') extra = `
    <div class="field"><span class="lbl">Mode</span>${seg('dr-mode', [['find', 'Find it on the neck'], ['ear', 'Name it by ear']], o.mode)}</div>
    <div class="field"><span class="lbl">Intervals</span>${seg('dr-set', Object.entries(IV_SET_LABELS), o.set)}</div>`;
  el.innerHTML = `
    <div class="drill-setup">
      <p class="muted">${d.blurb}.</p>
      ${extra}
      <div class="field"><span class="lbl">Strings</span>
        <div class="seg strings" id="dr-strings">${[5, 4, 3, 2, 1, 0].map(s => `<button data-s="${s}" aria-pressed="${o.strings.includes(s)}">${tuning.strings[s].name}</button>`).join('')}</div></div>
      <div class="row"><label>From fret<select id="dr-from">${fretOpts(o.from)}</select></label><label>To fret<select id="dr-to">${fretOpts(o.to)}</select></label></div>
      <div class="field"><span class="lbl">Rounds</span>${seg('dr-rounds', [[10, '10'], [20, '20']], o.rounds)}</div>
      <button class="primary big" id="dr-start">▶ Start</button>
    </div>`;
  const $ = s => el.querySelector(s);
  el.querySelectorAll('.seg:not(.strings)').forEach(g => g.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    g.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
  });
  $('#dr-strings').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    const on = b.getAttribute('aria-pressed') !== 'true';
    if (!on && el.querySelectorAll('#dr-strings [aria-pressed="true"]').length === 1) return; // keep at least one
    b.setAttribute('aria-pressed', on);
  };
  const val = id => el.querySelector(`#${id} [aria-pressed="true"]`)?.dataset.v;
  $('#dr-start').onclick = () => {
    const n = { ...o };
    n.strings = [...el.querySelectorAll('#dr-strings [aria-pressed="true"]')].map(b => +b.dataset.s).sort();
    n.from = Math.min(+$('#dr-from').value, +$('#dr-to').value);
    n.to = Math.max(+$('#dr-from').value, +$('#dr-to').value);
    n.rounds = +val('dr-rounds');
    if (d.id === 'hear') Object.assign(n, { key: +$('#dr-key').value, scale: val('dr-scale'), level: val('dr-level') });
    if (d.id === 'intervals') Object.assign(n, { mode: val('dr-mode'), set: val('dr-set') });
    saveOpts(d.id, n);
    start(n);
  };
}

/* ---------- the running drill: shared shell ---------- */
function run(el, d, o, { onAgain, onOptions }) {
  el.innerHTML = `
    <div class="drill-run">
      <div class="drill-top"><span id="dr-round"></span><span id="dr-score"></span><button class="quiet-btn" id="dr-quit">End</button></div>
      <p class="prompt" id="dr-prompt"></p>
      <div class="row" id="dr-tools"></div>
      <div id="dr-board"></div>
      <div class="choices" id="dr-choices"></div>
      <div class="msg" id="dr-msg" aria-live="polite"></div>
      <button class="primary big" id="dr-next" hidden>Next →</button>
    </div>`;
  const $ = s => el.querySelector(s);
  const startedAt = Date.now();
  let round = 0, score = 0, answered = 0, current = null, finished = false, autoTimer = null;
  const fb = new Fretboard($('#dr-board'), {
    view: [o.from, o.to], mode: 'tap', labels: 'none',
    focus: o.strings.length < 6 ? { strings: o.strings } : null,
    onTap: t => current && current.tap && current.tap(t)
  });
  const ui = {
    fb, o,
    prompt: html => { $('#dr-prompt').innerHTML = html; },
    msg: (text, kind = '') => { const m = $('#dr-msg'); m.textContent = text; m.className = 'msg ' + kind; },
    tools: html => { $('#dr-tools').innerHTML = html; },
    choices: html => { $('#dr-choices').innerHTML = html; },
    // Call once per round with whether the first try was right.
    result(firstTryRight) { answered++; if (firstTryRight) score++; paintTop(); },
    showNext() { $('#dr-next').hidden = false; $('#dr-next').focus({ preventScroll: true }); },
    autoNext(ms) { autoTimer = setTimeout(next, ms); }
  };
  const paintTop = () => { $('#dr-round').textContent = `Round ${Math.min(round, o.rounds)} of ${o.rounds}`; $('#dr-score').textContent = `Score ${score}`; };

  function next() {
    clearTimeout(autoTimer);
    if (finished) return;
    if (round >= o.rounds) return finish();
    round++;
    $('#dr-next').hidden = true;
    fb.clearMarks();
    fb.setDots([]);
    ui.msg(''); ui.tools(''); ui.choices('');
    paintTop();
    current = d.round(ui);
  }

  function finish(early = false) {
    if (finished) return;
    finished = true;
    clearTimeout(autoTimer);
    current?.end?.();
    d.end?.(o);
    if (answered > 0) {
      addLog({ minutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)), activity: `Drill: ${d.title}`,
        detail: `${score}/${early ? answered : o.rounds}${early ? ' (ended early)' : ''} · ${d.summary(o)}`,
        drill: d.id, score, total: early ? answered : o.rounds });
    }
    if (early && answered === 0) { onOptions(); return; }
    const total = early ? answered : o.rounds, pct = total ? Math.round(100 * score / total) : 0;
    el.innerHTML = `
      <div class="done-card">
        <h3>${pct >= 80 ? 'Great work!' : pct >= 50 ? 'Good practice.' : 'Keep at it.'}</h3>
        <div class="score-big">${score}<span>/${total}</span></div>
        <p class="muted">${esc(d.summary(o))}${early ? ' · ended early' : ''}</p>
        <div class="row center">
          <button class="primary big" id="dr-again">Again</button>
          <button class="big" id="dr-opts">${d.optionsLabel || 'Change options'}</button>
          <a class="button-link" href="#practice?tool=drills">All drills</a>
        </div>
      </div>`;
    el.querySelector('#dr-again').onclick = onAgain;
    el.querySelector('#dr-opts').onclick = onOptions;
  }

  $('#dr-next').onclick = next;
  $('#dr-quit').onclick = () => finish(true);
  d.begin?.(o);
  next();
  return () => { if (!finished) { finished = true; clearTimeout(autoTimer); current?.end?.(); d.end?.(o); if (answered > 0) addLog({ minutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)), activity: `Drill: ${d.title}`, detail: `${score}/${answered} (left early) · ${d.summary(o)}`, drill: d.id, score, total: answered }); } };
}

/* ---------- 1. Note finder (the original note quiz, with range options) ---------- */
DRILLS[0].summary = o => `${o.strings.length === 6 ? 'all strings' : o.strings.map(s => tuning.strings[s].name).reverse().join(' ')} · frets ${o.from}–${o.to}`;
let lastTarget = null;
// want: { pc, s, once? } to ask for one note on one string (weak-spot review).
// once: one try only; a miss shows and plays the answer (daily review).
DRILLS[0].round = (ui, want) => {
  const pcs = [...new Set(positions(ui.o).map(p => p.pc))];
  let target = want?.pc;
  if (want) { ui.fb.o.focus = { strings: [want.s] }; ui.fb.render(); }
  else do { target = pick(pcs); } while (pcs.length > 1 && target === lastTarget);
  lastTarget = target;
  let shownAt = performance.now(), firstTry = true, solved = false;
  ui.prompt(`Find: <span class="target">${preferredName(target)}</span>${want ? ` on string ${tuning.strings[want.s].num}` : ''}`);
  if (!want?.once) ui.tools('<button id="dr-skip">Skip</button>');
  if (!want?.once) document.getElementById('dr-skip').onclick = () => { if (!solved) { solved = true; ui.result(false); } ui.autoNext(0); };
  return {
    tap({ s, f, pc, string, focused }) {
      if (solved) return;
      if (!focused) { ui.msg('Stick to the selected strings.', 'muted'); return; }
      const ok = pc === target;
      recordAnswer(`note:${NOTES[target]}@s${string.num}`, ok, performance.now() - shownAt);
      shownAt = performance.now();
      ui.fb.mark(s, f, ok, preferredName(pc));
      if (ok) {
        solved = true;
        ui.result(firstTry);
        ui.msg(`Yes, that's ${preferredName(target)} (string ${string.num}, fret ${f}).`, 'good');
        ui.autoNext(800);
      } else if (want?.once) {
        solved = true;
        const at = positions(ui.o).find(p => p.s === want.s && p.pc === target);
        ui.result(false);
        if (at) { ui.fb.mark(at.s, at.f, true, preferredName(target), true); playAt(at.midi, 0.35); }
        ui.msg(`That's ${preferredName(pc)}. ${preferredName(target)} on string ${tuning.strings[want.s].num} is at fret ${at ? at.f : '?'}, shown in green.`, 'bad');
        ui.showNext();
      } else {
        firstTry = false;
        ui.msg(`That's ${preferredName(pc)}. Try again.`, 'bad');
      }
    }
  };
};

/* ---------- 2. Hear it, find it ---------- */
const hearInfo = o => {
  const item = lookup('scale', o.scale), degs = parseFormula(item.formula), sp = spell(o.key, degs);
  const scaleName = `${sp.root} ${HEAR_SCALES[o.scale].toLowerCase()}`;
  const inScale = new Map(degs.map((d, k) => [pcOf(o.key + d.semi), { label: d.label, role: d.role, name: sp.notes[k] }]));
  let pool;
  if (o.level === 'easy') pool = degs.filter(d => d.role !== 'other').map(d => pcOf(o.key + d.semi));
  else if (o.level === 'medium') pool = degs.map(d => pcOf(o.key + d.semi));
  else pool = Array.from({ length: 12 }, (_, i) => i);
  return { scaleName, inScale, pool };
};
DRILLS[1].summary = o => `${spell(o.key, parseFormula(lookup('scale', o.scale).formula)).root} ${HEAR_SCALES[o.scale].toLowerCase()} · ${o.level}`;
DRILLS[1].begin = o => droneStart(o.key);
DRILLS[1].end = () => droneStop();
// want: { label: 'b3' } to ask for one degree (weak-spot review).
DRILLS[1].round = (ui, want) => {
  const { scaleName, inScale, pool } = hearInfo(ui.o);
  const avail = positions(ui.o).filter(p => want ? p.pc === pcOf(ui.o.key + CHROMATIC.indexOf(want.label)) : pool.includes(p.pc));
  const target = pick(avail.length ? avail : positions(ui.o));
  const info = inScale.get(target.pc) || { label: CHROMATIC[pcOf(target.pc - ui.o.key)], name: noteAbove(ui.o.key, CHROMATIC[pcOf(target.pc - ui.o.key)]).note, outside: true };
  let shownAt = performance.now(), done = false;
  ui.prompt(`Listen over the ${esc(scaleName)} drone, then tap the note you heard.`);
  ui.tools('<button class="primary" id="dr-again-play">▶ Play again</button>');
  document.getElementById('dr-again-play').onclick = () => playAt(target.midi);
  playAt(target.midi, 0.5);
  return {
    tap({ s, f, pc, focused }) {
      if (done) return;
      if (!focused) { ui.msg('Stick to the selected strings.', 'muted'); return; }
      done = true;
      const ok = pc === target.pc;
      recordAnswer(`ear:${info.label}`, ok, performance.now() - shownAt);
      if (!ok) recordConfusion(pcOf(target.pc - ui.o.key), pcOf(pc - ui.o.key));
      ui.result(ok);
      ui.fb.mark(s, f, ok, ok ? info.name : undefined);
      if (!ok) ui.fb.mark(target.s, target.f, true, info.name, true);
      playAt(target.midi, 0.15);
      const why = info.outside
        ? `That's ${info.name}, the ${degreeWords(info.label)}, not in ${scaleName}.`
        : `That's ${info.name}, the ${degreeWords(info.label)} of ${scaleName}.`;
      ui.msg((ok ? 'Yes! ' : '') + why, ok ? 'good' : 'bad');
      ui.showNext();
    }
  };
};

/* ---------- 3. Interval trainer ---------- */
DRILLS[2].summary = o => `${o.mode === 'find' ? 'find on the neck' : 'by ear'} · ${IV_SET_LABELS[o.set]}`;
// want: { id: 'm3', mode: 'find'|'ear' } to ask for one interval (weak-spot review).
const pairOf = id => Object.values(IV_SETS).find(set => set.length === 2 && set.includes(id));
DRILLS[2].round = (ui, want) => {
  const mode = want ? want.mode : ui.o.mode, set = want ? pairOf(want.id) : IV_SETS[ui.o.set];
  const id = want ? want.id : pick(set), iv = IV[id], pos = positions(ui.o);
  const roots = pos.filter(p => pos.some(q => q.midi === p.midi + iv.semis));
  const root = pick(roots.length ? roots : pos);
  const { root: rootName, note: targetName } = noteAbove(root.pc, iv.deg);
  const targets = pos.filter(q => q.midi === root.midi + iv.semis);
  let shownAt = performance.now(), done = false;

  if (mode === 'ear') {
    const play = () => { playAt(root.midi); playAt(root.midi + iv.semis, 0.8); playAt(root.midi, 1.8); playAt(root.midi + iv.semis, 1.8); };
    ui.prompt('Name the interval you hear.');
    ui.tools('<button class="primary" id="dr-again-play">▶ Play again</button>');
    document.getElementById('dr-again-play').onclick = play;
    ui.choices(set.map(k => `<button data-iv="${k}">${IV[k].name}</button>`).join(''));
    document.getElementById('dr-choices').onclick = e => {
      const b = e.target.closest('button');
      if (!b || done) return;
      done = true;
      const ok = b.dataset.iv === id;
      recordAnswer(`interval-ear:${id}`, ok, performance.now() - shownAt);
      if (!ok) recordConfusion(iv.semis, IV[b.dataset.iv].semis);
      ui.result(ok);
      document.querySelectorAll('#dr-choices button').forEach(x => {
        x.disabled = true;
        if (x.dataset.iv === id) x.classList.add('good'); else if (x === b) x.classList.add('bad');
      });
      const tgt = targets[0];
      playAt(root.midi, 0.1); playAt(root.midi + iv.semis, 0.7);
      ui.fb.setDots([{ s: root.s, f: root.f, role: 'root', label: rootName }, ...(tgt ? [{ s: tgt.s, f: tgt.f, role: 'third', label: targetName }] : [])]);
      ui.msg(`${ok ? 'Yes! ' : ''}It was a ${iv.name}: ${rootName} up to ${targetName}.`, ok ? 'good' : 'bad');
      ui.showNext();
    };
    play();
    return {};
  }

  ui.fb.setDots([{ s: root.s, f: root.f, role: 'root', label: rootName }]);
  ui.prompt(`Find the <b>${iv.name}</b> above ${rootName}.`);
  ui.tools('<button class="primary" id="dr-again-play">▶ Play root</button>');
  document.getElementById('dr-again-play').onclick = () => playAt(root.midi);
  playAt(root.midi, 0.2);
  return {
    tap({ s, f, midi, pc, focused }) {
      if (done) return;
      if (!focused) { ui.msg('Stick to the selected strings.', 'muted'); return; }
      if (s === root.s && f === root.f) { ui.msg(`That's the root, ${rootName}. Find the ${iv.name} above it.`, 'muted'); return; }
      done = true;
      const ok = midi === root.midi + iv.semis;
      recordAnswer(`interval:${id}`, ok, performance.now() - shownAt);
      if (!ok && midi - root.midi > 0 && midi - root.midi < 12) recordConfusion(iv.semis, midi - root.midi);
      ui.result(ok);
      ui.fb.mark(s, f, ok, ok ? targetName : undefined);
      const best = targets.slice().sort((a, b) => Math.abs(a.f - root.f) - Math.abs(b.f - root.f))[0];
      if (!ok && best) ui.fb.mark(best.s, best.f, true, targetName, true);
      playAt(root.midi, 0.1); playAt(root.midi + iv.semis, 0.7);
      if (ok) ui.msg(`Yes! ${targetName} is a ${iv.name} above ${rootName}.`, 'good');
      else if (pc === pcOf(root.pc + iv.semis)) ui.msg(`Right note (${targetName}), but in another octave. The ${iv.name} is the one just above ${rootName}, shown in green.`, 'bad');
      else {
        const d = midi - root.midi;
        const what = d > 0 && d < 12 ? `a ${NAME_ABOVE(d)} above ${rootName}` : d <= 0 ? `below ${rootName}` : 'more than an octave up';
        ui.msg(`That's ${preferredName(pc)}, ${what}. The ${iv.name} is ${targetName}, shown in green.`, 'bad');
      }
      ui.showNext();
    }
  };
};

/* ---------- weak-spot review: 10 rounds of chosen items ----------
   Started from the Progress tab with #practice?tool=drills&drill=review&items=note:G%23@s5,interval:m3
   Each round asks one item with the matching drill's round. */
export const REVIEWABLE = /^(note:[A-G]#?@s[1-6]|ear:(R|b?[2-7]|#4)|interval(-ear)?:(m3|M3|P4|P5|m6|M6|m7|M7))$/;
export const asRound = id => {
  if (!REVIEWABLE.test(id)) return null;
  const [kind, rest] = id.split(':');
  if (kind === 'note') {
    const [name, str] = rest.split('@s');
    return { drill: DRILLS[0], want: { pc: NOTES.indexOf(name), s: tuning.strings.findIndex(x => x.num === +str) } };
  }
  if (kind === 'ear') return { drill: DRILLS[1], want: { label: rest } };
  return { drill: DRILLS[2], want: { id: rest, mode: kind === 'interval' ? 'find' : 'ear' } };
};
const REVIEW = {
  id: 'review', title: 'Weak spots', optionsLabel: 'Back to Progress',
  summary: o => `${o.items.length} weak spot${o.items.length === 1 ? '' : 's'}`,
  begin(o) { o.queue = []; },
  end: () => droneStop(),
  round(ui) {
    const o = ui.o;
    if (!o.queue.length) o.queue = shuffle(o.items);
    const r = asRound(o.queue.pop());
    ui.fb.o.focus = null;
    // The drone only plays for "by ear in a key" rounds.
    if (r.drill === DRILLS[1]) { if (!droneOn()) droneStart(o.key); } else droneStop();
    return r.drill.round(ui, r.want);
  }
};

/* ---------- drills tool ---------- */
export default {
  id: 'drills',
  title: 'Drills',
  blurb: 'Note finder, hear it find it, intervals',
  icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>',

  mount(el, params) {
    if (params.get('drill') === 'review') return review(el, params);
    const d = DRILLS.find(x => x.id === params.get('drill'));
    if (!d) {
      el.innerHTML = `<div class="cards">${DRILLS.map(x => `
        <a class="card-link" href="#practice?tool=drills&drill=${x.id}"><span><b>${x.title}</b><small>${x.blurb}</small></span></a>`).join('')}</div>`;
      return;
    }
    let cleanup = null;
    const head = el.closest('.tool-body')?.previousElementSibling?.querySelector('h2');
    if (head) head.textContent = d.title;
    const showSetup = () => { cleanup?.(); cleanup = null; setup(el, d, start); };
    const start = o => { cleanup?.(); cleanup = run(el, d, o, { onAgain: () => start(o), onOptions: showSetup }); };
    showSetup();
    return () => cleanup?.();
  }
};

function review(el, params) {
  const items = (params.get('items') || '').split(',').filter(id => asRound(id));
  const head = el.closest('.tool-body')?.previousElementSibling;
  head?.querySelector('a.back')?.setAttribute('href', '#progress');
  if (head?.querySelector('a.back')) head.querySelector('a.back').textContent = '← Progress';
  if (head?.querySelector('h2')) head.querySelector('h2').textContent = REVIEW.title;
  if (!items.length) {
    el.innerHTML = '<p class="muted">Nothing to review yet. Weak spots show up on the Progress tab after a few drills.</p>';
    return;
  }
  const hear = optsFor(DRILLS[1]);
  const o = { strings: ALL, from: 0, to: 12, rounds: 10, key: hear.key, scale: hear.scale, level: 'medium', items };
  let cleanup = null;
  const start = () => { cleanup?.(); cleanup = run(el, REVIEW, { ...o }, { onAgain: start, onOptions: () => { location.hash = '#progress'; } }); };
  start();
  return () => cleanup?.();
}
