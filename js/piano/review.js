// Piano items in the Daily review, asked on the keys (docs/research-piano.md D6): key names,
// staff notes, key signatures, chord spellings and degrees, intervals, scale degrees by ear,
// inversions and fingering facts. Each is one try; a miss shows the answer.
import { register } from '../registry.js';
import { Keyboard, nameOct } from './keyboard.js';
import { recordAnswer } from '../storage.js';
import { renderAbc } from '../notation.js';
import { staffAbc } from './drills.js';
import { midiOfName } from './pieces.js';
import { inversions } from './voicing.js';
import { parseNote, pcOf, preferredName, lookup, parseFormula, spell, INTERVAL_IDS, INTERVAL_NAMES } from '../theory.js';
import { context, pluckAt, droneStart, droneStop } from '../audio.js';
import { esc, pick, shuffle } from '../ui.js';

register('noNeck', true);
const hideBoard = ui => { const b = ui.fb.wrap.parentElement; b.hidden = true; return () => { b.hidden = false; }; };
const play = (ms, gap = 0) => { const c = context(); if (c) [].concat(ms).forEach((m, i) => pluckAt(m, c.currentTime + 0.05 + i * gap)); };

// A keyboard question: want(midi) -> ok; right = keys to show on a miss.
function keysRound(ui, id, { prompt, view = [55, 79], staff, want, right, explain, sound, before }) {
  const restore = hideBoard(ui), host = document.createElement('div'), shownAt = performance.now();
  ui.fb.wrap.parentElement.before(host);
  host.innerHTML = `${staff ? '<div class="staff-box rv-staff"></div>' : ''}<div class="rv-kb"></div>`;
  if (staff) renderAbc(host.querySelector('.rv-staff'), staff, { staffwidth: 220, scale: 1.4 });
  before?.();
  if (sound) { ui.tools('<button id="rvp-again">▶ Play again</button>'); document.getElementById('rvp-again').onclick = sound; sound(); }
  ui.prompt(prompt);
  let done = false;
  const kb = new Keyboard(host.querySelector('.rv-kb'), { view, mode: 'tap', lock: true, noGlideAnswers: true, onTap: ({ midi }) => {
    if (done) return; done = true;
    const ok = want(midi);
    recordAnswer(id, ok, performance.now() - shownAt);
    kb.mark(0, midi, ok, ok ? preferredName(midi) : undefined, true);
    if (!ok) [].concat(right).forEach(m => kb.mark(0, m, true, preferredName(m), true));
    ui.result(ok);
    ui.msg(`${ok ? 'Yes! ' : ''}${explain}`, ok ? 'good' : 'bad');
    ok ? ui.autoNext(1000) : ui.showNext();
  } });
  return { end: () => { droneStop(); host.remove(); restore(); } };
}
function choiceRound(ui, id, { prompt, options, answer, sound, explain }) {
  const restore = hideBoard(ui), shownAt = performance.now();
  let done = false;
  ui.prompt(esc(prompt));
  if (sound) { ui.tools('<button id="rvp-again">▶ Play again</button>'); document.getElementById('rvp-again').onclick = sound; sound(); }
  ui.choices(options.map(o => `<button data-o="${esc(o)}">${esc(o)}</button>`).join(''));
  document.getElementById('dr-choices').onclick = e => {
    const b = e.target.closest('button'); if (!b || done) return; done = true;
    const ok = b.dataset.o === answer;
    recordAnswer(id, ok, performance.now() - shownAt);
    document.querySelectorAll('#dr-choices button').forEach(x => { x.disabled = true; if (x.dataset.o === answer) x.classList.add('good'); else if (x === b) x.classList.add('bad'); });
    ui.result(ok); ui.msg(explain, ok ? 'good' : 'bad'); ok ? ui.autoNext(1100) : ui.showNext();
  };
  return { end: restore };
}
const ORD = { 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th', 9: '9th' };
const words = l => (l === 'R' ? 'root' : `${l.startsWith('bb') ? 'double-flat ' : l.startsWith('b') ? 'flat ' : l.startsWith('#') ? 'sharp ' : ''}${ORD[l.replace(/\D/g, '')] || l}`);
const an = n => (/^[AEF]/.test(n) ? 'an' : 'a');
const allOf = (pc, [lo, hi]) => { const out = []; for (let m = lo; m <= hi; m++) if (pcOf(m) === pcOf(pc)) out.push(m); return out; };

const ROUNDS = [
  { re: /^key:([A-G][#b]?)$/, round: (ui, id, m) => { const pc = parseNote(m[1]); return keysRound(ui, id, { prompt: `Tap ${an(m[1])} <span class="target">${m[1]}</span>.`, want: x => pcOf(x) === pc, right: allOf(pc, [55, 79]), explain: `${m[1]} is shown in green.` }); } },
  { re: /^staff:(treble|bass)@([A-G][#b]?\d)$/, round: (ui, id, m) => { const t = midiOfName(m[2]); return keysRound(ui, id, { prompt: `Tap this note (${m[1]} clef).`, view: m[1] === 'bass' ? [36, 64] : [55, 84], staff: staffAbc(t, m[1]), want: x => x === t, right: t, explain: `That note is ${nameOct(t)}.` }); } },
  { re: /^keysig:([A-G][#b]?)$/, round: (ui, id, m) => { const pc = parseNote(m[1]); return keysRound(ui, id, { prompt: 'Which major key has this signature? Tap its tonic.', staff: `X:1\nL:1/1\nK:${m[1]} clef=treble\nx|`, want: x => pcOf(x) === pc, right: allOf(pc, [55, 79]), explain: `It is ${m[1]} major.` }); } },
  { re: /^(degree|tone):([A-G][#b]?):([\w-]+):(R|bb?\d|#?\d)$/, round: (ui, id, m) => {
    const kind = m[1] === 'degree' ? 'scale' : 'chord', item = lookup(kind, m[3]), degs = parseFormula(item.formula), d = degs.find(x => x.label === m[4]);
    const pc = pcOf(parseNote(m[2]) + d.semi), name = spell(parseNote(m[2]), degs).notes[degs.indexOf(d)], what = `${m[2]} ${item.name.replace(/ \(.*\)$/, '').toLowerCase()}${kind === 'chord' ? ' chord' : ''}`;
    return keysRound(ui, id, { prompt: `Tap the ${words(m[4])} of ${esc(what)}.`, want: x => pcOf(x) === pc, right: allOf(pc, [55, 79]).slice(0, 2), explain: `The ${words(m[4])} of ${what} is ${name}.` }); } },
  { re: /^interval:(m3|M3|P4|P5|m6|M6|m7|M7)$/, round: (ui, id, m) => {
    const semis = INTERVAL_IDS.indexOf(m[1]), root = 60 + Math.floor(Math.random() * 7);
    return keysRound(ui, id, { prompt: `Tap a ${INTERVAL_NAMES[semis]} above ${nameOct(root)}.`, want: x => x === root + semis, right: root + semis, explain: `${nameOct(root + semis)} is a ${INTERVAL_NAMES[semis]} above ${nameOct(root)}.`, before: () => setTimeout(() => play(root), 100) }); } },
  { re: /^ear:(R|b?[2-7]|#4)$/, round: (ui, id, m) => {
    const d = parseFormula('1 2 3 4 5 6 7 b3 b6 b7 #4 b2').find(x => x.label === m[1]), key = pick([0, 2, 5, 7]), midi = 60 + key + d.semi;
    return keysRound(ui, id, { prompt: `A drone sets the key of ${preferredName(key)}. Tap the note you hear.`, want: x => pcOf(x) === pcOf(midi), right: midi, explain: `That was ${preferredName(midi)}, the ${m[1] === 'R' ? 'root' : m[1]} of ${preferredName(key)}.`,
      before: () => droneStart(key, 3), sound: () => setTimeout(() => play(midi), 600) }); } },
  { re: /^interval-ear:(m3|M3|P4|P5|m6|M6|m7|M7)$/, round: (ui, id, m) => {
    const semis = INTERVAL_IDS.indexOf(m[1]), root = 55 + Math.floor(Math.random() * 10), opts = shuffle([m[1], ...shuffle(['m3', 'M3', 'P4', 'P5', 'm6', 'M6', 'm7', 'M7'].filter(x => x !== m[1])).slice(0, 2)]);
    return choiceRound(ui, id, { prompt: 'Which interval is this?', options: opts.map(o => INTERVAL_NAMES[INTERVAL_IDS.indexOf(o)]), answer: INTERVAL_NAMES[semis], sound: () => play([root, root + semis], 0.6), explain: `It was a ${INTERVAL_NAMES[semis]}.` }); } },
  { re: /^chord-ear:(major|minor|dim|aug|maj7|7|m7)$/, round: (ui, id, m) => {
    const root = 55 + Math.floor(Math.random() * 7), v = parseFormula(lookup('chord', m[1]).formula).map(d => root + d.semi), names = { major: 'Major', minor: 'Minor', dim: 'Diminished', aug: 'Augmented', maj7: 'Major 7', '7': 'Dominant 7', m7: 'Minor 7' };
    const set = ['maj7', '7', 'm7'].includes(m[1]) ? ['maj7', '7', 'm7'] : ['major', 'minor', 'dim', 'aug'];
    return choiceRound(ui, id, { prompt: 'Which kind of chord is this?', options: set.map(x => names[x]), answer: names[m[1]], sound: () => play(v), explain: `It was ${names[m[1]].toLowerCase()}.` }); } },
  { re: /^inversion:(root|1st|2nd)$/, round: (ui, id, m) => {
    const k = ['root', '1st', '2nd'].indexOf(m[1]), root = pick([0, 2, 5, 7, 9]), v = inversions(root, pick(['major', 'minor']), 57)[k], labels = ['Root position', '1st inversion', '2nd inversion'];
    return choiceRound(ui, id, { prompt: 'Which inversion is this triad?', options: labels, answer: labels[k], sound: () => play(v), explain: `The lowest note is the ${['root', '3rd', '5th'][k]}: ${labels[k].toLowerCase()}.` }); } },
  { re: /^fingering:C-major-RH$/, round: (ui, id) => choiceRound(ui, id, { prompt: 'C major, right hand going up: the thumb crosses under after which finger?', options: ['3', '4', '2'], answer: '3', explain: '1 2 3, thumb under, 1 2 3 4 5. The same fingering works for G, D, A and E major.' }) }
];
register('review', ROUNDS.map(r => ({ askable: id => r.re.test(id), round: (ui, id) => r.round(ui, id, r.re.exec(id)) })));
