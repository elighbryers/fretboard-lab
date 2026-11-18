// Piano drills (docs/research-piano.md D3): Key finder, Staff reader, Hear it find it (over a
// drone), Interval trainer, Chord builder / chord quality / inversions, Key signatures.
// Every answer is a tap on the keys (a MIDI keyboard plays into them too; the microphone can
// answer single-note rounds). Results feed the review items and the log; nothing is locked.
import { NOTES, KEY_NAMES, pcOf, preferredName, spell, lookup, parseFormula, INTERVAL_NAMES, INTERVAL_IDS, parseNote } from '../theory.js';
import { registerDrill } from '../practice/drills.js';
import { register } from '../registry.js';
import { Keyboard, nameOct, keyItem, isBlack } from './keyboard.js';
import { pluckAt, context, now, droneStart, droneStop } from '../audio.js';
import { recordAnswer, recordMic, addLog, getSettings, setSetting } from '../storage.js';
import { renderAbc, abcPitch } from '../notation.js';
import { micOn, listenNotes } from '../mic.js';
import { inversions } from './voicing.js';
import { esc, pick, shuffle } from '../ui.js';

register('ownDrillsOnly', true);
const play = (midis, gap = 0) => { const c = context(); if (c) [].concat(midis).forEach((m, i) => pluckAt(m, c.currentTime + 0.05 + i * gap)); };

/* ---------- a small shell: N rounds, a keyboard, a score ---------- */
function shell(el, d, { view = [48, 84], rounds = 10, staff = false }) {
  el.innerHTML = `<div class="drill-run">
    <div class="drill-top"><span id="pd-round"></span><span id="pd-score"></span><button class="quiet-btn" id="pd-quit">End</button></div>
    <p class="prompt" id="pd-prompt"></p><div class="row" id="pd-tools"></div>
    ${staff ? '<div class="staff-box" id="pd-staff"></div>' : ''}
    <div id="pd-kb"></div><div class="choices" id="pd-choices"></div>
    <div class="msg" id="pd-msg" aria-live="polite"></div><button class="primary big" id="pd-next" hidden>Next →</button></div>`;
  const $ = s => el.querySelector(s), startedAt = Date.now();
  let round = 0, score = 0, answered = 0, current = null, timer = null, finished = false;
  const kb = new Keyboard($('#pd-kb'), { view, mode: 'tap', lock: true, noGlideAnswers: true, full88: true, onTap: t => current?.tap?.(t) });
  const ui = {
    kb, el, $,
    prompt: h => { $('#pd-prompt').innerHTML = h; },
    tools: h => { $('#pd-tools').innerHTML = h; },
    choices: h => { $('#pd-choices').innerHTML = h; },
    msg: (t, k = '') => { $('#pd-msg').textContent = t; $('#pd-msg').className = 'msg ' + k; },
    staff: abc => renderAbc($('#pd-staff'), abc, { staffwidth: 220, scale: 1.4 }),
    result(ok) { answered++; if (ok) score++; paint(); },
    next(ms = 900) { timer = setTimeout(next, ms); },
    showNext() { $('#pd-next').hidden = false; }
  };
  const paint = () => { $('#pd-round').textContent = `Round ${Math.min(round, rounds)} of ${rounds}`; $('#pd-score').textContent = `Score ${score}`; };
  function next() {
    clearTimeout(timer);
    current?.end?.();
    if (round >= rounds) return finish();
    round++; $('#pd-next').hidden = true; kb.clearMarks(); kb.setDots([]); ui.msg(''); ui.tools(''); ui.choices('');
    paint();
    current = d.round(ui, round);
  }
  function finish(early) {
    if (finished) return;
    finished = true; current?.end?.(); droneStop();
    if (answered) addLog({ minutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)), activity: `Drill: ${d.title}`, detail: `${score}/${answered}`, drill: d.id, score, total: answered });
    el.innerHTML = `<div class="done-card"><h3>${score >= answered * 0.8 ? 'Great work!' : 'Good practice.'}</h3><div class="score-big">${score}<span>/${answered}</span></div>
      <div class="row center"><button class="primary big" id="pd-again">Again</button><a class="button-link" href="#practice?tool=drills">All drills</a></div></div>`;
    el.querySelector('#pd-again').onclick = () => { finished = false; round = 0; score = 0; answered = 0; shell(el, d, { view, rounds, staff }); };
  }
  $('#pd-next').onclick = next;
  $('#pd-quit').onclick = () => finish(true);
  next();
  return () => { clearTimeout(timer); if (!finished) finish(true); };
}
// One-try answer helper: marks the key, records the item, moves on (or shows the answer).
function answer(ui, { ok, item, shownAt, tapped, right, label, explain }) {
  if (item) recordAnswer(item, ok, performance.now() - shownAt);
  ui.result(ok);
  ui.kb.mark(0, tapped, ok, ok ? label : undefined, true);
  if (!ok && right != null) [].concat(right).forEach(m => ui.kb.mark(0, m, true, preferredName(m), true));
  ui.msg(explain || (ok ? 'Yes!' : 'Not quite: the answer is in green.'), ok ? 'good' : 'bad');
  ok ? ui.next(900) : ui.showNext();
}

/* ---------- Key finder ---------- */
const NAMED = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'F#', 'Bb', 'Eb', 'C#', 'Ab'];
registerDrill({ id: 'piano-keys', own: true, title: 'Key finder', blurb: 'Tap the F#, tap every D, tap the A above Middle C',
  mount: el => shell(el, { id: 'piano-keys', title: 'Key finder', round(ui, n) {
    const name = pick(n < 4 ? NAMED.slice(0, 7) : NAMED), pc = parseNote(name), kind = n % 3 === 0 ? 'every' : n % 3 === 1 ? 'one' : 'above';
    const shownAt = performance.now(), [lo, hi] = ui.kb.o.view, all = []; for (let m = lo; m <= hi; m++) if (pcOf(m) === pc) all.push(m);
    const above = 60 + pcOf(pc - 60) + (pc === 0 ? 12 : 0);
    let found = new Set(), done = false;
    ui.prompt(kind === 'every' ? `Tap every <span class="target">${name}</span> you can see.` : kind === 'above' ? `Tap the <span class="target">${name}</span> just above Middle C.` : `Tap a <span class="target">${name}</span>.`);
    const stopMic = micOn() && kind === 'one' ? listenNotes(nn => { if (!done && nn.pc === pc) { done = true; recordMic(true); answer(ui, { ok: true, item: `key:${preferredName(pc)}`, shownAt, tapped: all[0], label: name, explain: `Yes, you played ${name}.` }); } }) : () => {};
    return { end: stopMic, tap({ midi }) {
      if (done) return;
      if (kind === 'every') {
        if (pcOf(midi) !== pc) { done = true; answer(ui, { ok: false, item: `key:${preferredName(pc)}`, shownAt, tapped: midi, right: all, explain: `That's ${preferredName(midi)}. Every ${name} is shown in green.` }); return; }
        found.add(midi); ui.kb.mark(0, midi, true, name, true);
        if (found.size === all.length) { done = true; recordAnswer(`key:${preferredName(pc)}`, true, performance.now() - shownAt); ui.result(true); ui.msg(`All ${all.length}! Each one is ${name}, an octave apart.`, 'good'); ui.next(1100); }
        return;
      }
      const ok = kind === 'above' ? midi === above : pcOf(midi) === pc;
      done = true;
      answer(ui, { ok, item: `key:${preferredName(pc)}`, shownAt, tapped: midi, right: kind === 'above' ? above : all.slice(0, 3), label: name,
        explain: ok ? `Yes, ${nameOct(midi)}.` : `That's ${nameOct(midi)}. ${kind === 'above' ? `The ${name} above Middle C is ${nameOct(above)}` : `${name} is shown in green`}.` });
    } };
  } }, { view: [48, 76] })
});

/* ---------- Staff reader ---------- */
// Landmarks first (Middle C, treble G, bass F, high C, low C), then notes a step or two away.
export const LANDMARKS = [{ midi: 60, clef: 'treble', name: 'Middle C' }, { midi: 67, clef: 'treble', name: 'Treble G' }, { midi: 53, clef: 'bass', name: 'Bass F' },
  { midi: 72, clef: 'treble', name: 'High C' }, { midi: 48, clef: 'bass', name: 'Low C' }, { midi: 60, clef: 'bass', name: 'Middle C' }];
const WHITE_UP = m => { let x = m + 1; while (isBlack(x)) x++; return x; }, WHITE_DOWN = m => { let x = m - 1; while (isBlack(x)) x--; return x; };
export function staffTarget(n, rnd = Math.random) {
  const lm = LANDMARKS[Math.floor(rnd() * LANDMARKS.length)];
  if (n <= 4) return { ...lm, landmark: true };
  let m = lm.midi; const steps = 1 + Math.floor(rnd() * Math.min(3, n / 3)), up = rnd() < 0.5;
  for (let i = 0; i < steps; i++) m = up ? WHITE_UP(m) : WHITE_DOWN(m);
  return { midi: m, clef: lm.clef, from: lm, steps: up ? steps : -steps };
}
export const staffAbc = (midi, clef) => `X:1\nL:1/1\nK:C clef=${clef}\n${abcPitch(midi)}|`;
registerDrill({ id: 'piano-staff', own: true, title: 'Staff reader', blurb: 'A note on the treble or bass staff: tap its key',
  mount: el => shell(el, { id: 'piano-staff', title: 'Staff reader', round(ui, n) {
    const t = staffTarget(n), shownAt = performance.now();
    ui.prompt(t.landmark ? `A landmark: tap this note. <span class="muted">(${t.clef} clef)</span>` : `Tap this note. <span class="muted">Hint: ${Math.abs(t.steps)} step${Math.abs(t.steps) > 1 ? 's' : ''} ${t.steps > 0 ? 'above' : 'below'} ${t.from.name}</span>`);
    ui.staff(staffAbc(t.midi, t.clef));
    let done = false;
    return { tap({ midi }) {
      if (done) return; done = true;
      answer(ui, { ok: midi === t.midi, item: `staff:${t.clef}@${nameOct(t.midi)}`, shownAt, tapped: midi, right: t.midi, label: nameOct(t.midi),
        explain: midi === t.midi ? `Yes: ${nameOct(t.midi)}${t.landmark ? ` (${t.name})` : ''}.` : `That's ${nameOct(midi)}. The note is ${nameOct(t.midi)}${t.landmark ? ` (${t.name})` : ''}.` });
    } };
  } }, { view: [43, 79], staff: true })
});

/* ---------- Hear it, find it (over a drone) ---------- */
const MAJ = parseFormula(lookup('scale', 'major').formula);
registerDrill({ id: 'piano-hear', own: true, title: 'Hear it, find it', blurb: 'A drone sets the key; tap the note you hear, explained by scale degree',
  mount: el => {
    const key = getSettings().pianoHearKey ?? 0;
    droneStart(key, 3);
    const stop = shell(el, { id: 'piano-hear', title: 'Hear it, find it', round(ui, n) {
      const d = pick(n < 4 ? MAJ.filter(x => ['R', '3', '5'].includes(x.label)) : MAJ), midi = 60 + pcOf(key) + d.semi, shownAt = performance.now();
      const sp = spell(key, MAJ), name = sp.notes[MAJ.indexOf(d)];
      ui.prompt(`Key of ${sp.root}. Listen, then tap the note.`);
      ui.tools(`<button id="ph-again">▶ Hear it again</button> <label>Key<select id="ph-key">${KEY_NAMES.map((k, i) => `<option value="${i}"${i === key ? ' selected' : ''}>${k}</option>`).join('')}</select></label>`);
      el.querySelector('#ph-again').onclick = () => play(midi);
      el.querySelector('#ph-key').onchange = e => { setSetting('pianoHearKey', +e.target.value); droneStart(+e.target.value, 3); };
      setTimeout(() => play(midi), 300);
      let done = false;
      return { tap({ midi: m }) {
        if (done) return; done = true;
        const ok = pcOf(m) === pcOf(midi);
        answer(ui, { ok, item: `ear:${d.label}`, shownAt, tapped: m, right: midi, label: name,
          explain: `${ok ? 'Yes! ' : ''}That was ${name}, the ${d.label === 'R' ? 'root' : d.label} of ${sp.root} major.` });
      } };
    } }, { view: [55, 79] });
    return () => { stop(); droneStop(); };
  }
});

/* ---------- Interval trainer ---------- */
const IVS = ['m3', 'M3', 'P4', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'];
registerDrill({ id: 'piano-intervals', own: true, title: 'Interval trainer', blurb: 'Tap the key an interval above, or name it by ear',
  mount: el => shell(el, { id: 'piano-intervals', title: 'Interval trainer', round(ui, n) {
    const id = pick(n < 5 ? ['m3', 'M3', 'P5'] : IVS), semis = id === 'P8' ? 12 : INTERVAL_IDS.indexOf(id), root = 55 + Math.floor(Math.random() * 12), shownAt = performance.now();
    const name = id === 'P8' ? 'octave' : INTERVAL_NAMES[semis], byEar = n % 2 === 0;
    ui.kb.setDots([{ s: 0, f: root, role: 'root', label: 'R' }], pcOf(root));
    let done = false;
    if (byEar) {
      ui.prompt('Hear two notes. Which interval is it?');
      ui.tools('<button id="pi-again">▶ Hear it again</button>');
      el.querySelector('#pi-again').onclick = () => play([root, root + semis], 0.6);
      play([root, root + semis], 0.6);
      const opts = shuffle([id, ...shuffle(IVS.filter(x => x !== id)).slice(0, 2)]);
      ui.choices(opts.map(o => `<button data-o="${o}">${o === 'P8' ? 'octave' : INTERVAL_NAMES[INTERVAL_IDS.indexOf(o)]}</button>`).join(''));
      el.querySelector('#pd-choices').onclick = e => {
        const b = e.target.closest('button'); if (!b || done) return; done = true;
        const ok = b.dataset.o === id;
        if (id !== 'P8') recordAnswer(`interval-ear:${id}`, ok, performance.now() - shownAt);
        ui.result(ok); ui.kb.mark(0, root + semis, true, preferredName(root + semis), true);
        ui.msg(`${ok ? 'Yes: ' : 'It was '}a ${name}.`, ok ? 'good' : 'bad'); ok ? ui.next(1100) : ui.showNext();
      };
      return {};
    }
    ui.prompt(`Tap a${/^[aeiou]/.test(name) ? "n" : ""} <span class="target">${name}</span> above ${nameOct(root)}.`);
    play(root);
    return { tap({ midi }) {
      if (done) return; done = true;
      answer(ui, { ok: midi === root + semis, item: id === 'P8' ? null : `interval:${id}`, shownAt, tapped: midi, right: root + semis, label: preferredName(midi),
        explain: midi === root + semis ? `Yes: ${nameOct(midi)}, ${semis} keys above.` : `A ${name} above ${nameOct(root)} is ${nameOct(root + semis)}, ${semis} half steps up.` });
    } };
  } }, { view: [55, 79] })
});

/* ---------- Chord builder, chord quality by ear, which inversion ---------- */
const QUAL = { major: 'major', minor: 'minor', dim: 'diminished', aug: 'augmented' };
registerDrill({ id: 'piano-chords', own: true, title: 'Chords: build, hear, invert', blurb: 'Build Eb minor; major or minor by ear; which inversion?',
  mount: el => shell(el, { id: 'piano-chords', title: 'Chords', round(ui, n) {
    const shownAt = performance.now(), kind = ['build', 'ear', 'inv'][n % 3];
    const rootName = pick(['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Eb', 'Ab', 'F#']), root = parseNote(rootName), q = pick(n < 6 ? ['major', 'minor'] : Object.keys(QUAL));
    const tones = parseFormula(lookup('chord', q).formula).map(d => pcOf(root + d.semi)), title = `${rootName} ${QUAL[q]}`;
    let done = false;
    if (kind === 'build') {
      const got = new Set(), wrong = [];
      ui.prompt(`Build <span class="target">${esc(title)}</span>: tap its three notes.`);
      return { tap({ midi }) {
        if (done) return;
        if (tones.includes(pcOf(midi))) { if (!got.has(pcOf(midi))) { got.add(pcOf(midi)); ui.kb.mark(0, midi, true, preferredName(midi), true); } }
        else { wrong.push(midi); ui.kb.mark(0, midi, false, undefined, true); }
        if (got.size === 3 || wrong.length >= 2) {
          done = true;
          const ok = got.size === 3 && !wrong.length, names = spell(root, lookup('chord', q).formula).notes;
          recordAnswer(`tone:${rootName}:${q}:${parseFormula(lookup('chord', q).formula)[1].label}`, ok, performance.now() - shownAt);
          ui.result(ok); ui.msg(`${title} is ${names.join(' ')}.`, ok ? 'good' : 'bad');
          [...Array(3)].forEach((_, i) => play(60 + pcOf(root - 60) + parseFormula(lookup('chord', q).formula)[i].semi));
          ok ? ui.next(1300) : ui.showNext();
        }
      } };
    }
    const v = inversions(root, q === 'aug' || q === 'dim' ? q : q, 57), inv = kind === 'inv' ? Math.floor(Math.random() * 3) : 0;
    ui.tools('<button id="pc-again">▶ Hear it again</button>');
    el.querySelector('#pc-again').onclick = () => play(v[inv]);
    play(v[inv]);
    const opts = kind === 'ear' ? (n < 6 ? ['major', 'minor'] : Object.keys(QUAL)) : ['root position', '1st inversion', '2nd inversion'];
    const right = kind === 'ear' ? q : opts[inv];
    ui.prompt(kind === 'ear' ? 'Which kind of chord is this?' : `Which inversion of ${esc(title)} is this?`);
    if (kind === 'inv') ui.kb.setDots(v[inv].map(m => ({ s: 0, f: m, role: 'bare' })));
    ui.choices(opts.map(o => `<button data-o="${o}">${o}</button>`).join(''));
    el.querySelector('#pd-choices').onclick = e => {
      const b = e.target.closest('button'); if (!b || done) return; done = true;
      const ok = b.dataset.o === right;
      recordAnswer(kind === 'ear' ? `chord-ear:${q}` : `inversion:${['root', '1st', '2nd'][inv]}`, ok, performance.now() - shownAt);
      el.querySelectorAll('#pd-choices button').forEach(x => { x.disabled = true; if (x.dataset.o === right) x.classList.add('good'); else if (x === b) x.classList.add('bad'); });
      ui.result(ok);
      ui.msg(kind === 'ear' ? `${title}.` : `The lowest note is the ${['root', '3rd', '5th'][inv]}, so it is in ${right}.`, ok ? 'good' : 'bad');
      ok ? ui.next(1200) : ui.showNext();
    };
    return {};
  } }, { view: [55, 79] })
});

/* ---------- Key signatures ---------- */
export const SIG_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'];
registerDrill({ id: 'piano-keysig', own: true, title: 'Key signatures', blurb: 'See a key signature, tap the major key\'s tonic',
  mount: el => shell(el, { id: 'piano-keysig', title: 'Key signatures', round(ui, n) {
    const key = pick(n < 4 ? SIG_KEYS.slice(0, 3).concat(['F']) : SIG_KEYS), pc = parseNote(key), shownAt = performance.now();
    ui.prompt('This is a major key signature. Tap the key it belongs to (its tonic).');
    ui.staff(`X:1\nL:1/1\nK:${key} clef=treble\nx|`);
    let done = false;
    return { tap({ midi }) {
      if (done) return; done = true;
      const ok = pcOf(midi) === pc, sharps = SIG_KEYS.indexOf(key);
      answer(ui, { ok, item: `keysig:${key}`, shownAt, tapped: midi, right: 60 + pcOf(pc - 60), label: key,
        explain: `${ok ? 'Yes: ' : ''}${key} major (${sharps === 0 ? 'no sharps or flats' : sharps <= 6 ? `${sharps} sharp${sharps > 1 ? 's' : ''}` : `${sharps - 6} flat${sharps > 7 ? 's' : ''}`}).` });
    } };
  } }, { view: [55, 79], staff: true })
});
export const _N = NOTES;
