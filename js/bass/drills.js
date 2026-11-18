// Bass drills (docs/research-bass.md D3), added to Practice → Drills when Bass is the
// instrument: Find the root, Hear the bassline and play it back, Lock to the kick,
// Chord-tone spotter and Approach notes. The Note finder already works on the bass neck
// (E and A strings by default). Taps are always enough; the microphone is optional.
import { midiAt, pcOf, preferredName, spell, lookup, parseFormula, KEY_NAMES } from '../theory.js';
import { registerDrill } from '../practice/drills.js';
import { context, now, pluckAt, metronome } from '../audio.js';
import { pad, groove, STYLES, kickBeats } from '../groove.js';
import { hit } from '../drumkit.js';
import { chordOf } from '../progressions.js';
import { recordAnswer, recordMic, addLog, addTimingSession, getSettings, setSetting, earnMilestones } from '../storage.js';
import { micOn, listenNotes } from '../mic.js';
import { score } from '../timing.js';
import { tapPad, offsetMs, calibrationLine, runCalibration } from '../timing-ui.js';
import { esc, pick, shuffle } from '../ui.js';

const KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'];
const PROGS = [['I', 'IV', 'V', 'I'], ['I', 'vi', 'IV', 'V'], ['I', 'V', 'vi', 'IV'], ['ii', 'V', 'I', 'I'], ['I', 'IV', 'I', 'V']];
// The positions of a pitch class (or exact midi) in the drill's range.
const spotsOf = (ui, test) => {
  const out = [];
  ui.o.strings.forEach(s => { for (let f = ui.o.from; f <= ui.o.to; f++) { const m = midiAt(s, f); if (test(m)) out.push({ s, f, midi: m }); } });
  return out;
};
const playChord = (c, delay = 0.05, dur = 1.4) => { const ctx = context(); if (ctx) pad(c.root, c.chord, ctx.currentTime + delay, dur); };
const playNote = (midi, delay = 0.05) => { const ctx = context(); if (ctx) pluckAt(midi, ctx.currentTime + delay); };

/* ---------- Find the root ---------- */
registerDrill({
  id: 'bass-root', title: 'Find the root', blurb: 'A progression plays; tap each chord\'s root',
  defaults: { strings: [3, 2], from: 0, to: 12, rounds: 10 },
  summary: o => `${o.rounds} progressions`,
  round(ui) {
    const key = pick(KEYS), prog = pick(PROGS).map(r => chordOf(key, r));
    let k = 0, clean = true, done = false;
    const chips = () => prog.map((c, i) => `<span class="chip-q${i < k ? ' ok' : i === k ? ' now' : ''}">${i < k ? esc(c.name) : i === k ? '?' : '·'}</span>`).join(' ');
    const ask = () => { ui.prompt(`Key of ${key}. Tap the root of chord ${k + 1}: ${chips()}`); playChord(prog[k]); };
    const all = () => prog.forEach((c, i) => playChord(c, 0.05 + i * 1.3, 1.25));
    ui.tools('<button id="br-all">▶ Whole progression</button> <button id="br-one">▶ This chord</button>');
    document.getElementById('br-all').onclick = all;
    document.getElementById('br-one').onclick = () => playChord(prog[k]);
    all();
    setTimeout(() => !done && ui.prompt(`Key of ${key}. Tap the root of chord ${k + 1}: ${chips()}`), 50);
    return {
      tap({ s, f, pc }) {
        if (done) return;
        const c = prog[k], ok = pc === pcOf(c.root);
        ui.fb.mark(s, f, ok, preferredName(pc), true);
        if (!ok) { clean = false; ui.msg(`That's ${preferredName(pc)}. Listen again: what's the lowest, most "home" note of this chord?`, 'bad'); playChord(c); return; }
        ui.msg(`Yes: ${c.name}, root ${c.rootName}.`, 'good');
        k++;
        if (k < prog.length) { setTimeout(() => { ui.fb.clearMarks(); ask(); }, 600); return; }
        done = true;
        ui.result(clean);
        ui.msg(`${clean ? 'All four first time!' : 'Done.'} ${prog.map(x => x.name).join(' – ')} (${prog.map(x => x.roman).join(' ')} in ${key}).`, clean ? 'good' : '');
        ui.showNext();
      }
    };
  }
});

/* ---------- Hear the bassline, play it back ---------- */
// One-bar original lines as scale degrees (semitones above the root), easiest first:
// roots, root-5-octave, then 3rds and an approach note.
const LINES = [
  [0, 0, 0, 0], [0, 0, 7, 7], [0, 7, 12, 7], [0, 12, 7, 0], [0, 7, 12, 12],
  [0, 4, 7, 12], [0, 3, 7, 12], [0, 7, 10, 12], [0, 4, 7, 11], [0, 7, 5, 6]
];
registerDrill({
  id: 'bass-line', title: 'Hear the bassline, play it back', blurb: 'A short line plays over drums; tap it back note by note',
  defaults: { strings: [3, 2, 1], from: 0, to: 12, rounds: 10 },
  summary: o => `${o.rounds} lines`,
  begin() { this.n = 0; },
  round(ui) {
    const n = (this.n = (this.n || 0) + 1), pool = LINES.slice(0, Math.min(LINES.length, 3 + n));
    const keyPc = pick([4, 5, 7, 9, 0, 2]), rootMidi = 28 + pcOf(keyPc - 4), line = pick(pool).map(x => rootMidi + x);
    let k = 0, clean = true, done = false, stopMic = () => {};
    const play = () => {
      const c = context(); if (!c) return;
      const t0 = c.currentTime + 0.1, spb = 60 / 84;
      for (let bar = 0; bar < 2; bar++) for (let b = 0; b < 4; b++) {
        const t = t0 + (bar * 4 + b) * spb;
        pluckAt(line[b], t, 0.9);
        hit(b % 2 ? 'snare' : 'kick', t, 0.7); hit('hat', t, 0.6); hit('hat', t + spb / 2, 0.4);
      }
    };
    const prompt = () => ui.prompt(`Tap the line back: note ${k + 1} of 4 <span class="muted">(starts on ${preferredName(keyPc)})</span>`);
    ui.tools('<button id="bl-again">▶ Hear it again</button>' + (micOn() ? ' <span class="muted" id="bl-mic">🎤 Or play it on your bass</span>' : ''));
    document.getElementById('bl-again').onclick = play;
    play(); prompt();
    const accept = () => {
      k++;
      if (k < 4) { prompt(); return; }
      done = true; stopMic();
      ui.result(clean);
      ui.msg(clean ? 'Spot on, every note first time.' : 'Got it. Hear it once more and play it on your bass.', clean ? 'good' : '');
      ui.showNext();
    };
    stopMic = micOn() ? listenNotes(nn => {
      if (done) return;
      const ok = nn.pc === pcOf(line[k]);
      recordMic(ok);
      const m = document.getElementById('bl-mic'); if (m) m.textContent = `🎤 Heard ${preferredName(nn.pc)}${ok ? ' ✓' : ''}`;
      if (ok) { spotsOf(ui, mm => mm === line[k]).slice(0, 1).forEach(p => ui.fb.mark(p.s, p.f, true, preferredName(line[k]), true)); accept(); }
    }) : () => {};
    return {
      end: () => stopMic(),
      tap({ s, f, midi }) {
        if (done) return;
        const ok = midi === line[k] || (k === 0 && pcOf(midi) === pcOf(line[0]) && Math.abs(midi - line[0]) === 12);
        ui.fb.mark(s, f, ok, preferredName(midi), true);
        if (!ok) { clean = false; ui.msg(pcOf(midi) === pcOf(line[k]) ? 'Right note name, wrong octave. Try again.' : `That's ${preferredName(midi)}. Try again.`, 'bad'); return; }
        ui.msg('');
        if (k === 0 && midi !== line[0]) line.forEach((_, i) => { line[i] += midi - line[0] + 0; });
        accept();
      }
    };
  }
});

/* ---------- Chord-tone spotter ---------- */
const TONE_CHORDS = ['major', 'minor', '7', 'm7', 'maj7'];
registerDrill({
  id: 'bass-tones', title: 'Chord-tone spotter', blurb: 'A chord and a bass note sound: is the note R, 3, 5 or 7?',
  defaults: { strings: [3, 2], from: 0, to: 12, rounds: 10 }, noBoard: true, frets: false,
  summary: o => `${o.rounds} chord tones`,
  round(ui) {
    const root = Math.floor(Math.random() * 12), chordId = pick(TONE_CHORDS), degs = parseFormula(lookup('chord', chordId).formula);
    const d = pick(degs), answer = d.label === 'R' ? 'R' : d.label.replace('b', ''), bass = 28 + pcOf(root + d.semi - 4);
    const name = spell(root, degs).root + (chordId === 'major' ? '' : chordId === 'minor' ? 'm' : chordId);
    const shownAt = performance.now();
    const play = () => { playChord({ root, chord: chordId }, 0.05, 1.8); playNote(bass, 0.05); };
    let done = false;
    ui.prompt(`${/^[AEF]/.test(name) ? 'An' : 'A'} ${esc(name)} chord with a bass note under it. Which chord tone is the bass playing?`);
    ui.tools('<button id="ct-again">▶ Hear it again</button>');
    document.getElementById('ct-again').onclick = play;
    const opts = ['R', '3', '5', '7'].filter(o => degs.some(x => (x.label === 'R' ? 'R' : x.label.replace('b', '')) === o));
    ui.choices(opts.map(o => `<button data-o="${o}">${o === 'R' ? 'R (root)' : o}</button>`).join(''));
    document.getElementById('dr-choices').onclick = e => {
      const b = e.target.closest('button'); if (!b || done) return;
      done = true;
      const ok = b.dataset.o === answer;
      recordAnswer(`toneear:${answer}`, ok, performance.now() - shownAt);
      document.querySelectorAll('#dr-choices button').forEach(x => { x.disabled = true; if (x.dataset.o === answer) x.classList.add('good'); else if (x === b) x.classList.add('bad'); });
      ui.result(ok);
      ui.msg(`${ok ? 'Yes! ' : ''}The bass played ${preferredName(bass)}, the ${d.label === 'R' ? 'root' : d.label} of ${name}.`, ok ? 'good' : 'bad');
      ok ? ui.autoNext(1300) : ui.showNext();
    };
    play();
    return {};
  }
});

/* ---------- Approach notes ---------- */
const MOVES = [['I', 'IV'], ['I', 'V'], ['I', 'vi'], ['vi', 'IV'], ['IV', 'V'], ['V', 'I'], ['ii', 'V']];
registerDrill({
  id: 'bass-approach', title: 'Approach notes', blurb: 'Chord A goes to chord B: tap the half-step approach into B\'s root',
  defaults: { strings: [3, 2], from: 0, to: 12, rounds: 10 },
  summary: o => `${o.rounds} chord changes`,
  round(ui) {
    const key = pick(KEYS), [ra, rb] = pick(MOVES), a = chordOf(key, ra), b = chordOf(key, rb);
    const want = [pcOf(b.root - 1), pcOf(b.root + 1)];
    let done = false, clean = true;
    const play = () => {
      const c = context(); if (!c) return;
      const t0 = c.currentTime + 0.1, spb = 60 / 90;
      pad(a.root, a.chord, t0, spb * 4);
      for (let i = 0; i < 4; i++) { hit(i % 2 ? 'snare' : 'kick', t0 + i * spb, 0.6); hit('hat', t0 + i * spb, 0.5); }
      pluckAt(28 + pcOf(a.root - 4), t0, 0.9); pluckAt(28 + pcOf(a.root - 4), t0 + 2 * spb, 0.8);
      pad(b.root, b.chord, t0 + 4 * spb, spb * 2);
      hit('kick', t0 + 4 * spb, 0.7); hit('crash', t0 + 4 * spb, 0.4);
    };
    ui.prompt(`${esc(a.name)} → ${esc(b.name)}. On beat 4 of ${esc(a.name)}, lead into ${esc(b.rootName)}: tap a note a half step above or below it.`);
    ui.tools('<button id="ap-again">▶ Hear the change</button>');
    document.getElementById('ap-again').onclick = play;
    play();
    return {
      tap({ s, f, pc, midi }) {
        if (done) return;
        const ok = want.includes(pc);
        ui.fb.mark(s, f, ok, preferredName(pc), true);
        if (!ok) { clean = false; ui.msg(pc === pcOf(b.root) ? `That's ${b.rootName} itself, the target. Go one fret below or above it.` : `That's ${preferredName(pc)}. Find ${b.rootName}, then go one fret away from it.`, 'bad'); return; }
        done = true;
        ui.result(clean);
        // Show the targets near the tap and play approach -> root.
        spotsOf(ui, m => pcOf(m) === pcOf(b.root)).filter(p => Math.abs(p.f - f) <= 2 && Math.abs(p.s - s) <= 1).forEach(p => ui.fb.mark(p.s, p.f, true, b.rootName, true));
        const t = context()?.currentTime || 0;
        pluckAt(midi, t + 0.05); pluckAt(midi + (pcOf(b.root) === pcOf(pc + 1) ? 1 : -1), t + 0.45);
        ui.msg(`Yes: ${preferredName(pc)} is a half step ${pcOf(pc + 1) === pcOf(b.root) ? 'below' : 'above'} ${b.rootName}. Play it on beat 4, then land on ${b.rootName} on beat 1.`, 'good');
        ui.showNext();
      }
    };
  }
});

/* ---------- Lock to the kick ---------- */
// Beginners count within ±60 ms, then ±45, then ±30 (research-bass.md D3, master plan 2).
export const LOCK_LEVELS = [60, 45, 30];
const lockSettings = () => ({ level: 0, style: 'rock8', bpm: 80, bars: 4, ...(getSettings().lockKick || {}) });
// Pure: the kick times of `bars` bars starting at the given bar start times.
export const kickTimes = (style, barStarts, spb) => barStarts.flatMap(t => kickBeats(style).map(b => t + b * spb));

registerDrill({
  id: 'bass-kick', title: 'Lock to the kick', blurb: 'Tap (or play roots) with the kick drum; see early or late in ms',
  mount(el) {
    let st = lockSettings(), detach = null, calStop = null, running = false;
    const sel = (id, items, val) => `<select id="${id}">${items.map(([v, n]) => `<option value="${v}"${String(v) === String(val) ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
    el.innerHTML = `<div class="lock">
      <p class="muted">Tap on every kick drum hit, or play a root on your bass with it. Bass and kick together is the heart of a groove.
        Your timing is shown, and it never blocks anything.</p>
      <div class="row"><label>Groove${sel('lk-style', ['rock8', 'four', 'half', 'onedrop', 'funk16'].map(k => [k, STYLES[k].name]), st.style)}</label>
        <label>Tempo${sel('lk-bpm', [60, 70, 80, 90, 100, 110, 120].map(v => [v, v + ' bpm']), st.bpm)}</label>
        <label>Bars${sel('lk-bars', [[4, '4'], [8, '8']], st.bars)}</label></div>
      <p>Target: within <b id="lk-win">±${LOCK_LEVELS[st.level]} ms</b> <span class="muted small">(tightens to ±30 ms as you lock in)</span></p>
      <p class="small" id="lk-cal">${calibrationLine()}</p>
      <div class="row"><button id="lk-calib">Calibrate timing</button></div>
      <div id="lk-calbox"></div>
      <button class="tap-pad" id="lk-pad" aria-label="Tap here on every kick drum">Tap on the kick</button>
      <p class="msg" id="lk-msg" aria-live="polite"></p>
      <div class="lk-hits" id="lk-hits" aria-label="Each kick, early or late"></div>
      <div class="row center"><button class="primary big" id="lk-go">▶ Start</button></div>
    </div>`;
    const $ = s => el.querySelector(s);
    const save = () => setSetting('lockKick', st);
    $('#lk-style').onchange = e => { st.style = e.target.value; save(); };
    $('#lk-bpm').onchange = e => { st.bpm = +e.target.value; save(); };
    $('#lk-bars').onchange = e => { st.bars = +e.target.value; save(); };
    $('#lk-calib').onclick = () => { calStop?.(); calStop = runCalibration($('#lk-calbox'), { onDone: () => { $('#lk-cal').innerHTML = calibrationLine(); $('#lk-calbox').innerHTML = ''; } }); };
    const msg = (h, kind = '') => { $('#lk-msg').innerHTML = h; $('#lk-msg').className = 'msg ' + kind; };
    const stop = () => { detach?.(); detach = null; if (groove.running) groove.stop(); running = false; $('#lk-go').textContent = '▶ Start'; };
    $('#lk-go').onclick = () => {
      if (running) { stop(); msg('Stopped.'); return; }
      if (!context()) return;
      running = true; $('#lk-go').textContent = '■ Stop';
      const taps = [], barStarts = [], spb = 60 / st.bpm, win = LOCK_LEVELS[st.level];
      $('#lk-hits').innerHTML = '';
      msg('Listen for one bar, then tap on every kick.', 'muted');
      detach = tapPad($('#lk-pad'), t => taps.push(t));
      groove.start({ style: st.style, bpm: st.bpm, mute: 'full', onBeat: (beat, t, bar) => {
        if (beat !== 0) return;
        if (bar >= 1 && bar <= st.bars) barStarts.push(t);
        if (bar === 1) setTimeout(() => running && msg('Tap now!', ''), Math.max(0, (t - now()) * 1000));
        if (bar === st.bars + 1) setTimeout(() => finish(), Math.max(0, (t - now()) * 1000) + 200);
      } });
      const finish = () => {
        if (!running) return;
        stop();
        const kicks = kickTimes(st.style, barStarts, spb), first = kicks[0] - 0.2, last = kicks[kicks.length - 1] + 0.2;
        const r = score(kicks, taps.filter(t => t >= first && t <= last), { offsetMs: offsetMs(), window: win });
        $('#lk-hits').innerHTML = r.notes.map(n => `<span class="hit ${n.inWindow ? 'in' : 'out'}" title="${n.error} ms">${n.error > 0 ? '+' : ''}${n.error}</span>`).join('') +
          (r.missed ? `<span class="hit miss">${r.missed} missed</span>` : '');
        const lean = r.lean === 'on time' ? 'right on the kick on average' : `${Math.abs(r.bias)} ms ${r.lean} on average`;
        msg(`<b>${r.hits} of ${r.beats}</b> kicks within ±${win} ms. You were ${lean}; consistency ±${r.spread} ms.` +
          (r.hitRate >= 0.8 && st.level < LOCK_LEVELS.length - 1 ? ` <b>Locked in!</b> Next time the target is ±${LOCK_LEVELS[st.level + 1]} ms.` : ''), r.hitRate >= 0.8 ? 'good' : '');
        addTimingSession({ drill: 'lock-kick', bpm: st.bpm, n: r.played, bias: r.bias, spread: r.spread, hitRate: Math.round(r.hitRate * 100) / 100, window: win, bars: st.bars });
        addLog({ minutes: 1, activity: 'Drill: Lock to the kick', detail: `${r.hits}/${r.beats} within ±${win} ms · ${st.bpm} bpm`, drill: 'bass-kick', score: r.hits, total: r.beats });
        if (win <= 30 && st.bars >= 8 && r.hitRate >= 0.8) earnMilestones(['bass-locked-30']);
        if (r.hitRate >= 0.8 && st.level < LOCK_LEVELS.length - 1) { st.level++; save(); $('#lk-win').textContent = `±${LOCK_LEVELS[st.level]} ms`; }
      };
    };
    return () => { stop(); calStop?.(); };
  }
});

export const _keys = KEY_NAMES;
