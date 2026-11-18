// Lesson validator: node tools/validate-lessons.mjs [level numbers...] [--update-snapshot]
// No level numbers = all six. Checks every guitar lesson's data (positions, prompts that
// name the right string, card and question counts, review items), the shared theory
// cards (js/lessons/cards.js) and each instrument's string numbering, and that the
// guitar lessons are byte-for-byte what tools/guitar-lessons.snapshot.json recorded.
// After changing a lesson on purpose, run with --update-snapshot to record the new version.
import { readFileSync, writeFileSync } from 'fs';
const R = new URL('../js/', import.meta.url).href;
const { LEVELS, nodesOf, itemsOf, factQuestion } = await import(R + 'lessons/index.js');
const T = await import(R + 'theory.js');
const { CARDS, placeCard, autoPlace, cardNotes } = await import(R + 'lessons/cards.js');
const { makeKit } = await import(R + 'lessons/kit.js');
const { INSTRUMENT_DEFS, tuningOf } = await import(R + 'instruments.js');
const args = process.argv.slice(2);
let pass = 0, fail = 0;
const ok = (c, n, x = '') => { c ? pass++ : fail++; if (!c) console.log(`FAIL  ${n}${x !== '' ? '  — ' + x : ''}`); };
const OPEN = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 };
const NAMES = { 'low E': 6, A: 5, D: 4, G: 3, B: 2, 'high e': 1 };
const list = a => (Array.isArray(a) ? a : [a]);
const levels = args.filter(a => /^\d$/.test(a)).map(Number);
if (!levels.length) levels.push(1, 2, 3, 4, 5, 6);
const sentences = t => (t.replace(/<[^>]+>/g, '').match(/[.!?](\s|$)/g) || []).length;

function checkPos(where, p, view) {
  ok(p && p.string >= 1 && p.string <= 6 && Number.isInteger(p.fret), `${where}: a real position`, JSON.stringify(p));
  if (view && p) ok(p.fret >= view[0] && p.fret <= view[1], `${where}: fret ${p.fret} inside view ${view}`, JSON.stringify(p));
}
// "Tap G on the A string" / "Tap F# on the low E string": the answer must be that note on that string.
function checkPrompt(where, prompt, answers) {
  const m = /Tap (?:any )?([A-G][#b]?) on the (low E|A|D|G|B|high e) string/.exec(prompt);
  if (!m) return;
  const pc = T.parseNote(m[1]), s = NAMES[m[2]];
  list(answers).forEach(a => ok(a.string === s && (OPEN[a.string] + a.fret) % 12 === pc, `${where}: "${m[0]}" matches the answer`, JSON.stringify(a)));
}

for (const n of levels) {
  const L = LEVELS[n - 1].level;
  ok(!!L, `level ${n} has content`);
  if (!L) continue;
  ok(L.lessons.length >= 7 && L.lessons.length <= 8, `level ${n}: 7-8 lessons`, L.lessons.length);
  ok(L.placement?.length === 3, `level ${n}: 3 placement questions`);
  L.lessons.forEach((les, li) => {
    const st = les.steps || {}, id = les.id;
    for (const k of ['hear', 'learn', 'see', 'try', 'play', 'check']) ok(!!st[k], `${id}: has ${k}`);
    if (!st.check) return;
    ok(st.hear?.sound?.seq?.length > 0, `${id}: Hear it has a sound`);
    const cards = st.learn?.cards || [];
    ok(cards.length >= 2 && cards.length <= 3, `${id}: 2-3 Learn cards`, cards.length);
    cards.forEach((c, k) => {
      ok(sentences(c.text) <= 2, `${id} card ${k + 1}: at most 2 sentences`, c.text);
      ok(c.board?.dots?.length > 0, `${id} card ${k + 1}: has a fretboard with dots`);
      (c.board?.dots || []).forEach(d => checkPos(`${id} card ${k + 1}`, d, c.board.view));
    });
    ok(st.see?.sequence?.length > 0 && !!st.see?.view, `${id}: See it has a sequence`);
    st.see?.sequence?.flatMap(x => (x ? list(x) : [])).forEach(p => checkPos(`${id} see`, p, st.see.view));
    if (li >= 0 && n > 1) ok(!!st.see?.link, `${id}: See it has Open in Fretboard`);
    ok(st.try?.tasks?.length === 3, `${id}: 3 Try tasks`, st.try?.tasks?.length);
    (st.try?.tasks || []).forEach((t, k) => {
      list(t.answer).forEach(a => checkPos(`${id} try ${k + 1}`, a, t.view || st.try.view));
      checkPrompt(`${id} try ${k + 1}`, t.prompt, t.answer);
      (t.dots || []).forEach(d => checkPos(`${id} try ${k + 1} dot`, d, t.view || st.try.view));
    });
    ok(st.play?.bpm >= 40 && st.play?.bpm <= 160, `${id}: Play it has a default bpm`, st.play?.bpm);
    if (n >= 2) ok(true, '');
    const qs = st.check.questions;
    ok(qs.length === 4 && st.check.pass === 3, `${id}: 4 questions, pass 3`);
    const taps = qs.filter(q => q.type === 'tap').length;
    ok(taps >= 2, `${id}: mostly tapping (${taps} of 4)`);
    if (li >= 2) ok(qs.some(q => /^From (Lesson|Level) \d/.test(q.prompt)), `${id}: one question reviews an earlier lesson`);
    qs.forEach((q, k) => {
      if (q.type === 'tap') { list(q.answer).forEach(a => checkPos(`${id} q${k + 1}`, a, q.view || st.check.view)); checkPrompt(`${id} q${k + 1}`, q.prompt, q.answer); }
      else ok(q.options.includes(q.answer) && !!q.item, `${id} q${k + 1}: choice has its answer and a review item`);
    });
    ok(itemsOf(les).length >= 3, `${id}: registers review items`, itemsOf(les).length);
  });
  const ch = L.challenge;
  ok(!!ch.flow?.length, `level ${n}: challenge has steps`);
  ok(['check', 'timed'].includes(ch.flow?.[ch.flow.length - 1]?.type), `level ${n}: challenge ends with something to pass`);
  if (n >= 2) ok(ch.flow.some(s => s.type === 'play' && (s.drone || s.backing) && s.seconds) || L.lessons.some(l => l.steps.play?.seconds), `level ${n}: includes an improvising task`);
  (L.placement || []).forEach((q, k) => { if (q.type === 'tap') list(q.answer).forEach(a => checkPos(`level ${n} placement ${k + 1}`, a, q.view || [0, 12])); });
}

/* ---------- the guitar lessons are exactly as recorded ---------- */
const snapFile = new URL('./guitar-lessons.snapshot.json', import.meta.url);
const snap = { levels: LEVELS.map(x => ({ title: x.title, blurb: x.blurb, level: x.level })), items: {}, facts: {} };
for (const lv of LEVELS) for (const n of nodesOf(lv.level)) {
  snap.items[n.id] = itemsOf(n);
  for (const id of itemsOf(n).filter(i => i.startsWith('fact:'))) snap.facts[id] = factQuestion(id);
}
const json = JSON.stringify(snap, (k, v) => (typeof v === 'function' ? `[fn ${v.name}]` : v));
if (args.includes('--update-snapshot')) { writeFileSync(snapFile, json); console.log('snapshot updated'); }
ok(json === readFileSync(snapFile, 'utf8'), 'guitar lessons match the recorded snapshot exactly (run with --update-snapshot after an intended change)');

/* ---------- shared theory cards ---------- */
const GEO = /\b(string|strings|fret|frets|neck|shape|shapes|barre|finger|fingers|pick|strum|open|CAGED|capo|box|position|positions|thumb|low E|high e|tab)\b/i;
const used = new Set();
for (const lv of LEVELS) for (const n of nodesOf(lv.level)) (n.steps?.learn?.cards || []).forEach(c => { const id = Object.keys(CARDS).find(k => CARDS[k].text === c.text); if (id) used.add(id); });
const guitarKit = makeKit('guitar'), bass4 = makeKit('bass'), bass5 = makeKit('bass', 'five');
for (const [id, c] of Object.entries(CARDS)) {
  ok(used.has(id), `card ${id}: used by a guitar lesson`);
  ok(!GEO.test(c.text), `card ${id}: text is instrument-free`, c.text);
  ok(c.theory.length > 0 && c.theory.every(g => !('string' in g) && !('fret' in g) && (g.notes || (g.key && g.kind && g.id && g.labels?.length))), `card ${id}: music stored as notes/degrees, no positions`);
  ok(cardNotes(id).length > 0, `card ${id}: gives notes for a keyboard`);
  for (const [name, kit] of [['4-string bass', bass4], ['5-string bass', bass5]]) {
    let placed = null; try { placed = autoPlace(id, kit, [0, 12]); } catch (e) { placed = e.message; }
    ok(placed && placed.board && placed.text === c.text, `card ${id}: places on a ${name}`, typeof placed === 'string' ? placed : '');
    if (placed?.board) { let back = true; try { placeCard(id, placed.board, kit.pcAt); } catch { back = false; } ok(back, `card ${id}: the ${name} placement passes the card check`); }
  }
}
let refused = false;
try { placeCard('l3-1.1', { view: [0, 7], dots: [{ string: 5, fret: 3, label: 'R', role: 'root' }, { string: 4, fret: 3, label: '3', role: 'third' }] }, guitarKit.pcAt); } catch { refused = true; }
ok(refused, 'a card placed on the wrong fret is refused (D labelled as the 3rd above C)');

/* ---------- each instrument's own string numbering ---------- */
ok(guitarKit.midiOf(6, 0) === 40 && guitarKit.STRING[6] === 'low E', 'guitar: string 6 is the low E (MIDI 40)');
ok(bass4.midiOf(4, 0) === 28 && bass4.STRING[4] === 'E' && bass4.ALL.join() === '4,3,2,1', 'bass: string 4 is the low E (MIDI 28), four strings');
ok(bass5.midiOf(5, 0) === 23 && bass5.ALL.join() === '5,4,3,2,1', '5-string bass: string 5 is the low B (MIDI 23)');
ok(tuningOf('guitar') === T.TUNINGS.standard, 'guitar uses the existing standard tuning object (nothing changes on screen)');
ok(['standard', 'five', 'dropD', 'six'].every(t => INSTRUMENT_DEFS.bass.tunings[t].strings.every((s, i, a) => i === 0 || s.midi < a[i - 1].midi)), 'bass tunings run high to low like guitar tab');
/* ---------- bass play-alongs: positions, bar lengths, chord symbols, downbeats ---------- */
const { BASS_TABS } = await import(R + 'bass/tabs/index.js');
const { parseChordName } = await import(R + 'progressions.js');
for (const tab of BASS_TABS) {
  const where = `bass tab ${tab.id}`, bar = tab.time[0] * 4 / tab.time[1];
  ok(tab.chords.every(c => parseChordName(c)), `${where}: chord symbols parse`, tab.chords.join(' '));
  let pos = 0, barIdx = 0, crossed = false;
  const total = tab.notes.reduce((a, n) => a + n[2], 0);
  ok(Math.abs(total - bar * tab.chords.length) < 1e-6, `${where}: ${tab.chords.length} bars of ${tab.time.join('/')}`, `${total} beats`);
  for (const [string, fret, beats] of tab.notes) {
    ok(string >= 0 && string <= 4 && Number.isInteger(fret) && fret >= 0 && fret <= 20 && beats > 0, `${where}: a real position`, `${string}/${fret}/${beats}`);
    if (Math.abs(pos) < 1e-6) {
      const c = parseChordName(tab.chords[barIdx]);
      const tones = c ? T.parseFormula(T.lookup('chord', c.chord).formula).map(d => T.pcOf(c.root + d.semi)) : [];
      const pc = string ? T.pcOf(bass4.midiOf(string, fret)) : null;
      ok(pc == null || tones.includes(pc), `${where} bar ${barIdx + 1}: starts on a tone of ${tab.chords[barIdx]} (or a rest)`, pc == null ? '' : T.NOTES[pc]);
    }
    pos += beats;
    if (pos > bar + 1e-6) crossed = true;
    if (pos >= bar - 1e-6) { pos -= bar; barIdx++; }
  }
  ok(!crossed, `${where}: no note crosses a bar line`);
  ok(tab.source && !/happy birthday/i.test(tab.title), `${where}: has a source and isn't Happy Birthday`);
}

/* ---------- piano pieces: bar lengths per hand, ranges, chord symbols, notes in the key ---------- */
const { PIECES, midiOfName, pieceEvents } = await import(R + 'piano/pieces.js');
const { lhBar } = await import(R + 'piano/voicing.js');
for (const pc of PIECES) {
  const where = `piano piece ${pc.id}`, bar = pc.time[0] * 4 / pc.time[1], bars = pc.chords.length;
  ok(pc.chords.every(c => parseChordName(c)), `${where}: chord symbols parse`, pc.chords.join(' '));
  for (const [hand, list] of [['RH', pc.rh], ['LH', pc.lh]]) {
    if (!list) continue;
    const total = list.reduce((a, x) => a + x[1], 0);
    ok(Math.abs(total - bar * bars) < 1e-6, `${where} ${hand}: ${bars} bars of ${pc.time.join('/')}`, `${total} beats`);
    let pos = 0, crossed = false;
    list.forEach(([, b]) => { const inBar = pos % bar; if (inBar + b > bar + 1e-6) crossed = true; pos += b; });
    ok(!crossed, `${where} ${hand}: no note crosses a bar line`);
  }
  const minor = /m$/.test(pc.key), keyName = pc.key.replace(/m$/, ''), scale = pc.scale || (minor ? 'minor' : 'major');
  const inKey = new Set(T.parseFormula(T.lookup('scale', scale).formula).map(d => T.pcOf(T.parseNote(keyName) + d.semi)));
  pc.rh.filter(x => x[0]).forEach(([note]) => {
    const m = midiOfName(note);
    ok(m >= 36 && m <= 96, `${where}: ${note} in a comfortable range`);
    ok(inKey.has(T.pcOf(m)) || (pc.chromatic || []).includes(note), `${where}: ${note} is in ${pc.key} ${scale} (or listed as chromatic)`);
  });
  const ev = pieceEvents(pc, (pat, c, beats) => { const x = parseChordName(c); return lhBar(pat, x.root, x.chord, beats); });
  ok(ev.some(e => e.hand === 'L') && ev.some(e => e.hand === 'R'), `${where}: both hands have notes`);
  ev.filter(e => e.hand === 'L' && pc.lh).forEach(e => {
    const c = parseChordName(pc.chords[e.bar]), tones = T.parseFormula(T.lookup('chord', c.chord).formula).map(d => T.pcOf(c.root + d.semi));
    ok(e.midis.every(m => tones.includes(T.pcOf(m))), `${where} bar ${e.bar + 1}: written left hand plays tones of ${pc.chords[e.bar]}`);
  });
  ok(!/happy birthday/i.test(pc.title) && /public domain|Original/.test(pc.source), `${where}: public domain or original`);
}

/* ---------- other instruments' paths: bass (and later piano, drums) ---------- */
// Positions are checked against each instrument's own numbering and js/theory.js: every tap
// answer must sound the note its prompt names, and every review item must match its position.
const BASS_NAMES = { E: 4, A: 3, D: 2, G: 1 };
const bassPaths = await import(R + 'bass/lessons/index.js').then(m => m.BASS_LEVELS).catch(e => { ok(false, 'bass lessons load', e.message); return []; });
function checkFretted(kit, names, where, p, view) {
  const strings = kit.ALL;
  ok(p && strings.includes(p.string) && Number.isInteger(p.fret) && p.fret >= 0 && p.fret <= 20, `${where}: a real position`, JSON.stringify(p));
  if (view && p) ok(p.fret >= view[0] && p.fret <= view[1], `${where}: fret ${p.fret} inside view ${view}`, JSON.stringify(p));
}
function checkFrettedPrompt(kit, names, where, prompt, answers) {
  const m = new RegExp(`(?:Tap|tap) (?:any )?([A-G][#b]?) on the (${Object.keys(names).join('|')}) string`).exec(prompt);
  if (!m) return;
  const pc = T.parseNote(m[1]), s = names[m[2]];
  list(answers).forEach(a => ok(a.string === s && T.pcOf(kit.midiOf(a.string, a.fret)) === pc, `${where}: "${m[0]}" matches the answer`, JSON.stringify(a)));
}
// A tap's review item: the note at that spot, or a degree / chord tone that sounds there.
function itemOk(kit, item, p, prompt = '', names = BASS_NAMES) {
  const pc = T.pcOf(kit.midiOf(p.string, p.fret));
  // "Tap a major 3rd above G (G is on the E string, fret 3)": the answer must be that interval above that spot.
  const iv = /^interval:(\w+)$/.exec(item || '');
  if (iv) {
    const m = /above ([A-G][#b]?) \(\1 is on the (\w) string, fret (\d+)\)/.exec(prompt), semis = T.INTERVAL_IDS.indexOf(iv[1]);
    if (!m || semis < 0) return false;
    const root = kit.midiOf(names[m[2]], +m[3]);
    return T.pcOf(root) === T.parseNote(m[1]) && kit.midiOf(p.string, p.fret) - root === semis;
  }
  if (item === `note:${T.NOTES[pc]}@s${p.string}`) return true;
  const m = /^(degree|tone):([A-G][#b]?):([\w-]+):(R|bb?\d|#?\d)$/.exec(item || '');
  if (!m) return false;
  const degs = T.parseFormula(T.lookup(m[1] === 'degree' ? 'scale' : 'chord', m[3]).formula), d = degs.find(x => x.label === m[4]);
  return !!d && T.pcOf(T.parseNote(m[2]) + d.semi) === pc;
}
function validatePath(name, levels, kit, names, spec = null) {
  const POS = spec?.pos || ((w, p, v) => checkFretted(kit, names, w, p, v)), PROMPT = spec?.prompt || ((w, pr, a) => checkFrettedPrompt(kit, names, w, pr, a)), ITEM = spec?.item || ((it, p, pr) => itemOk(kit, it, p, pr, names));
  ok(levels.length === 6 || (name === 'drums' && levels.length >= 1), `${name}: six levels`, levels.length);
  levels.forEach((lv, n) => {
    const L = lv.level, where0 = `${name} level ${n + 1}`;
    ok(L.lessons.length === 7, `${where0}: 7 lessons`, L.lessons.length);
    ok(L.placement?.length === 3, `${where0}: 3 placement questions`);
    L.lessons.forEach((les, li) => {
      const st = les.steps, id = les.id;
      for (const k of ['hear', 'learn', 'see', 'try', 'play', 'check']) ok(!!st[k], `${id}: has ${k}`);
      ok(st.hear?.sound?.seq?.length > 0 || st.hear?.sound?.prog?.length > 0, `${id}: Hear it has a sound`);
      const cards = st.learn?.cards || [];
      ok(cards.length >= 2 && cards.length <= 3, `${id}: 2-3 Learn cards`, cards.length);
      cards.forEach((c, k) => {
        ok(sentences(c.text) <= 2, `${id} card ${k + 1}: at most 2 sentences`, c.text);
        ok(c.board?.dots?.length > 0 || c.grid?.notes?.length > 0 || c.technique?.length === 3, `${id} card ${k + 1}: has a neck, a rhythm grid or a 3-item technique checklist`);
        (c.board?.dots || []).forEach(d => POS(`${id} card ${k + 1}`, d, c.board.view));
        if (c.grid) ok(c.grid.notes.every(i => i >= 0 && i < c.grid.beats * c.grid.sub), `${id} card ${k + 1}: grid steps inside the bar`);
        const shared = Object.entries(CARDS).find(([, x]) => x.text === c.text);
        if (shared) { let back = true; try { placeCard(shared[0], c.board, kit.pcAt); } catch (e) { back = e.message; } ok(back === true, `${id} card ${k + 1}: shared card ${shared[0]} placed correctly`, back); }
      });
      ok(st.see?.sequence?.length > 0, `${id}: See it has a sequence`);
      st.see?.sequence?.flatMap(x => (x ? list(x) : [])).forEach(p => POS(`${id} see`, p, st.see.view));
      if (n > 0) ok(!!st.see?.link, `${id}: See it has Open in Fretboard`);
      ok(st.try?.tasks?.length === 3, `${id}: 3 Try tasks`, st.try?.tasks?.length);
      (st.try?.tasks || []).forEach((t, k) => {
        if (t.grid) { ok(t.grid.notes.length > 0 && !!t.item, `${id} try ${k + 1}: rhythm task with a review item`); return; }
        list(t.answer).forEach(a => POS(`${id} try ${k + 1}`, a, t.view || st.try.view));
        PROMPT(`${id} try ${k + 1}`, t.prompt, t.answer);
        ok(ITEM(t.item, list(t.answer)[0], t.prompt), `${id} try ${k + 1}: review item matches the position`, t.item);
      });
      ok(st.play?.bpm >= 40 && st.play?.bpm <= 160, `${id}: Play it has a default bpm`, st.play?.bpm);
      (st.play?.follow || []).filter(Boolean).flatMap(list).filter(Boolean).forEach(p => POS(`${id} play`, p, st.play.view));
      const qs = st.check.questions;
      ok(qs.length === 4 && st.check.pass === 3, `${id}: 4 questions, pass 3`);
      ok(qs.filter(q => q.type === 'tap').length >= 2, `${id}: at least 2 of 4 questions are taps`);
      if (li >= 2) ok(qs.some(q => /^From (Lesson|Level) \d/.test(q.prompt)), `${id}: one question reviews an earlier lesson`);
      qs.forEach((q, k) => {
        if (q.type === 'tap') {
          list(q.answer).forEach(a => POS(`${id} q${k + 1}`, a, q.view || st.check.view));
          PROMPT(`${id} q${k + 1}`, q.prompt, q.answer);
          ok(ITEM(q.item, list(q.answer)[0], q.prompt), `${id} q${k + 1}: review item matches the position`, q.item);
        } else ok(q.options.includes(q.answer) && !!q.item, `${id} q${k + 1}: choice has its answer and a review item`);
      });
      ok(itemsOf(les).length >= 3, `${id}: registers review items`, itemsOf(les).length);
    });
    const ch = L.challenge;
    ok(ch.flow?.length > 0 && ['check', 'timed', 'timedkeys', 'timedtriads'].includes(ch.flow[ch.flow.length - 1].type), `${where0}: challenge ends with something to pass`);
    ch.flow.filter(f => f.type === 'check').flatMap(f => f.questions.map(q => [q, f])).forEach(([q, f], k) => {
      if (q.type === 'tap') { list(q.answer).forEach(a => POS(`${where0} challenge q${k + 1}`, a, q.view || f.view)); PROMPT(`${where0} challenge q${k + 1}`, q.prompt, q.answer); }
      else ok(q.options.includes(q.answer), `${where0} challenge q${k + 1}: has its answer`);
    });
    ch.flow.filter(f => f.type === 'kickroots').forEach(f => f.roots.forEach(r => {
      const m = /^([A-G][#b]?) on the (\w) string$/.exec(r.label);
      ok(m && T.pcOf(kit.midiOf(r.pos.string, r.pos.fret)) === T.parseNote(m[1]) && names[m[2]] === r.pos.string, `${where0} challenge: "${r.label}" is right`);
    }));
    (L.placement || []).forEach((q, k) => { if (q.type === 'tap') { list(q.answer).forEach(a => POS(`${where0} placement ${k + 1}`, a)); PROMPT(`${where0} placement ${k + 1}`, q.prompt, q.answer); } });
  });
  // Lesson ids are unique.
  const ids = levels.flatMap(l => nodesOf(l.level).map(x => x.id));
  ok(new Set(ids).size === ids.length, `${name}: lesson ids are unique`);
}
if (bassPaths.length) validatePath('bass', bassPaths, bass4, BASS_NAMES);

/* ---------- piano: keys are { string: 0, fret: midi } ---------- */
const pianoPaths = await import(R + 'piano/lessons/index.js').then(m => m.PIANO_LEVELS).catch(e => { ok(false, 'piano lessons load', e.message); return []; });
const pianoKit = { pcAt: (s, f) => T.pcOf(f), midiOf: (s, f) => f };
const nameMidi = n => midiOfName(n);
const pianoSpec = {
  pos: (where, p, view) => {
    ok(p && p.string === 0 && Number.isInteger(p.fret) && p.fret >= 21 && p.fret <= 108 && (p.midi == null || p.midi === p.fret), `${where}: a real key`, JSON.stringify(p));
    if (view && p) ok(p.fret >= view[0] && p.fret <= view[1], `${where}: key ${p.fret} inside view ${view}`, JSON.stringify(p));
  },
  prompt: (where, prompt, answers) => {
    const m = /^(?:From (?:Lesson|Level) \d+: )?(?:Tap|Build) (?:the |a |an |any )?([A-G][#b]?)(\d)?(?![\w#])(?! (?:major|minor|chord))/.exec(prompt);
    if (m) list(answers).forEach(a => ok(T.pcOf(a.fret) === T.parseNote(m[1]) && (!m[2] || Math.floor(a.fret / 12) - 1 === +m[2]), `${where}: "${m[0]}" matches the answer`, JSON.stringify(a)));
    const st = /(half|whole) step above ([A-G][#b]?\d)/.exec(prompt);
    if (st) list(answers).forEach(a => ok(a.fret - nameMidi(st[2]) === (st[1] === 'half' ? 1 : 2), `${where}: "${st[0]}" matches the answer`, JSON.stringify(a)));
    const iv = /(minor 3rd|major 3rd|perfect 4th|perfect 5th|minor 6th|major 6th|minor 7th|major 7th|octave) above ([A-G][#b]?\d)/.exec(prompt);
    if (iv) list(answers).forEach(a => ok(a.fret - nameMidi(iv[2]) === (iv[1] === 'octave' ? 12 : T.INTERVAL_NAMES.indexOf(iv[1])), `${where}: "${iv[0]}" matches the answer`, JSON.stringify(a)));
  },
  item: (item, p, prompt) => {
    const m = p.fret, pc = T.pcOf(m);
    if (item === `key:${T.preferredName(pc)}`) return true;
    const st = /^staff:(treble|bass)@([A-G][#b]?\d)$/.exec(item || '');
    if (st) return nameMidi(st[2]) === m;
    const iv = /^interval:(\w+)$/.exec(item || '');
    if (iv) { const r = /above ([A-G][#b]?\d)/.exec(prompt); return !!r && m - nameMidi(r[1]) === T.INTERVAL_IDS.indexOf(iv[1]); }
    const dg = /^(degree|tone):([A-G][#b]?):([\w-]+):(R|bb?\d|#?\d)$/.exec(item || '');
    if (dg) { const d = T.parseFormula(T.lookup(dg[1] === 'degree' ? 'scale' : 'chord', dg[3]).formula).find(x => x.label === dg[4]); return !!d && T.pcOf(T.parseNote(dg[2]) + d.semi) === pc; }
    return /^(keysig|ear|inversion|fingering):/.test(item || '');
  }
};
if (pianoPaths.length) validatePath('piano', pianoPaths, pianoKit, {}, pianoSpec);

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
