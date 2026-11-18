// Hands & rhythm strands: short skill items that run alongside the theory path
// (docs/research-guitar-v2.md 2.3-2.5). Chords, timed chord changes, technique,
// rhythm patterns and a multi-week barre goal. They never gate progress.
// Opened at #learn?skill=<id>, from each level's "Hands & rhythm" row, and as a
// small panel inside the lesson Play steps that need them.
import { inKey, P } from './lessons/kit.js';
import { Fretboard } from './fretboard.js';

import { playSound } from './sound.js';
import { metronome } from './audio.js';
import { rhythmSVG, findPattern } from './rhythm.js';
import { recordClean, getTempo, recordAnswer, getItem, getGoal, practiseGoal, checkGoal, today } from './storage.js';
import { esc, clock } from './ui.js';
import { tuningOf } from './instruments.js';

const STR = { 6: 'low E', 5: 'A', 4: 'D', 3: 'G', 2: 'B', 1: 'high e' };
// A chord shape: [[string, fret, finger?]], strings not listed are not played.
// Every note of a shape is checked against its chord when this file loads (a wrong fret throws).
const checked = (chord, shape) => { shape.forEach(([s, f]) => chord.dot(s, f)); return chord; };
const chordSkill = (id, level, name, root, kind, shape, tip, extra = {}) => ({ id, level, kind: 'chord', name, title: `${name} chord`, chord: checked(inKey(root, 'chord', kind), shape), shape, tip, ...extra });

export const SKILLS = [
  // ---- Level 1: first chords, quarter-note strumming ----
  chordSkill('em', 1, 'Em', 'E', 'minor', [[6, 0], [5, 2, 2], [4, 2, 3], [3, 0], [2, 0], [1, 0]], 'Two fingers: middle and ring finger on fret 2. Strum all six strings.'),
  { id: 'quarters', level: 1, kind: 'rhythm', pattern: 'quarters', title: 'Strum quarter notes', text: 'One down-strum on every click. Count out loud: 1, 2, 3, 4.' },
  chordSkill('am', 1, 'Am', 'A', 'minor', [[5, 0], [4, 2, 2], [3, 2, 3], [2, 1, 1], [1, 0]], 'Start strumming from the A string. Keep your fingertips just behind the frets.'),
  chordSkill('e', 1, 'E', 'E', 'major', [[6, 0], [5, 2, 2], [4, 2, 3], [3, 1, 1], [2, 0], [1, 0]], 'Em plus one finger: your first finger on the G string, fret 1.'),
  { id: 'changes-em-am', level: 1, kind: 'changes', a: 'em', b: 'am', title: 'One-minute changes: Em and Am', goal: 30 },
  chordSkill('a', 1, 'A', 'A', 'major', [[5, 0], [4, 2, 1], [3, 2, 2], [2, 2, 3], [1, 0]], 'Three fingers side by side on fret 2. Start from the A string.'),
  chordSkill('d', 1, 'D', 'D', 'major', [[4, 0], [3, 2, 1], [2, 3, 3], [1, 2, 2]], 'A small triangle of fingers. Strum only the top four strings.'),
  { id: 'changes-a-d', level: 1, kind: 'changes', a: 'a', b: 'd', title: 'One-minute changes: A and D', goal: 30 },
  // ---- Level 2: C and G, alternate picking, eighths ----
  chordSkill('c', 2, 'C', 'C', 'major', [[5, 3, 3], [4, 2, 2], [3, 0], [2, 1, 1], [1, 0]], 'A staircase of fingers: 3, 2, 1. Skip the low E string.'),
  chordSkill('g', 2, 'G', 'G', 'major', [[6, 3, 2], [5, 2, 1], [4, 0], [3, 0], [2, 0], [1, 3, 3]], 'Middle finger on the low E, first finger on the A, ring finger on the high e.'),
  { id: 'changes-c-g', level: 2, kind: 'changes', a: 'c', b: 'g', title: 'One-minute changes: C and G', goal: 30 },
  { id: 'alt-picking', level: 2, kind: 'technique', title: 'Alternate picking', text: 'Pick down, up, down, up: never two in the same direction. Play G major up and down on one string, two notes per click.', view: [0, 15], follow: [3, 5, 7, 8, 10, 12, 14, 15].map(f => P(6, f)), per: 0.5, bpm: 60, strokes: true },
  { id: 'eighths', level: 2, kind: 'rhythm', pattern: 'eighths', title: 'Eighth notes, down-up', text: 'Keep your hand moving down and up all the time: down on the number, up on the "and".' },
  { id: 'first-strum', level: 2, kind: 'rhythm', pattern: 'first-strum', title: 'Your first strumming pattern', text: 'D, D-U, D-U, D. The hand keeps moving down-up, even when it misses the strings.' },
  // ---- Level 3: muting, hammer-ons and pull-offs, slides; rests and 3/4 ----
  { id: 'muting', level: 3, kind: 'technique', title: 'Muting', text: 'Power chords sound clean when the other strings are quiet. Let your first finger lightly touch the strings below, and rest the side of your picking hand on the strings by the bridge for a chunky palm mute.', view: [0, 9], follow: [[P(6, 3), P(5, 5), P(4, 5)], [P(6, 5), P(5, 7), P(4, 7)]], per: 2, bpm: 70 },
  { id: 'hammer-pull', level: 3, kind: 'technique', title: 'Hammer-ons and pull-offs', text: 'Pick fret 5, then hammer your ring finger onto fret 7 without picking. Then pull it off with a little flick to sound fret 5 again.', view: [3, 9], follow: [P(3, 5), P(3, 7), P(3, 7), P(3, 5)], per: 1, bpm: 60 },
  { id: 'slides', level: 3, kind: 'technique', title: 'Slides', text: 'Pick fret 5 on the G string and slide the same finger up to fret 7, keeping the pressure on so it keeps ringing.', view: [3, 9], follow: [P(3, 5), P(3, 7)], per: 2, bpm: 60 },
  { id: 'rests', level: 3, kind: 'rhythm', pattern: 'rests', title: 'Rests on 2 and 4', text: 'Strum on 1 and 3; on 2 and 4 rest your hand on the strings to stop the sound.' },
  { id: 'waltz', level: 3, kind: 'rhythm', pattern: 'waltz', title: '3/4 time', text: 'Three beats to a bar: ONE two three. Lean on the first strum.' },
  // ---- Level 4: barre chords (multi-week), syncopation, 6/8 ----
  { id: 'barre', level: 4, kind: 'goal', title: 'Barre chords (a few weeks)', text: 'Barres take most players weeks. Start with the easy F on four strings, then the full F, then Bm. A little every day beats a long session.',
    shapes: [
      { name: 'Easy F', chord: checked(inKey('F', 'chord', 'major'), [[4, 3], [3, 2], [2, 1], [1, 1]]), shape: [[4, 3, 3], [3, 2, 2], [2, 1, 1], [1, 1, 1]], tip: 'Your first finger flattens over the top two strings at fret 1.' },
      { name: 'F (E shape)', chord: checked(inKey('F', 'chord', 'major'), [[6, 1], [5, 3], [4, 3], [3, 2], [2, 1], [1, 1]]), shape: [[6, 1, 1], [5, 3, 3], [4, 3, 4], [3, 2, 2], [2, 1, 1], [1, 1, 1]], tip: 'First finger across all six strings at fret 1; roll it slightly onto its bony side.' },
      { name: 'Bm (A shape)', chord: checked(inKey('B', 'chord', 'minor'), [[5, 2], [4, 4], [3, 4], [2, 3], [1, 2]]), shape: [[5, 2, 1], [4, 4, 3], [3, 4, 4], [2, 3, 2], [1, 2, 1]], tip: 'Barre fret 2 from the A string; skip the low E.' }
    ],
    checks: [['ring', 'Easy F: every string rings when you pick them one by one'], ['full', 'Full F: all six strings ring'], ['change', 'Change from C to F within four beats at 60 bpm'], ['song', 'Play C, F, G, C for a minute without stopping'], ['bm', 'Bm: all five strings ring']] },
  { id: 'syncopation', level: 4, kind: 'rhythm', pattern: 'syncopation', title: 'Syncopation', text: 'D, D-U, (miss) U-D-U. The miss on beat 3 makes the "and" jump out.' },
  { id: 'six-eight', level: 4, kind: 'rhythm', pattern: 'six-eight', title: '6/8 time', text: 'Six quick beats in two groups: ONE two three FOUR five six.' },
  // ---- Level 5: 7th chord shapes for the blues, shuffle ----
  chordSkill('a7', 5, 'A7', 'A', '7', [[5, 0], [4, 2, 2], [3, 0], [2, 2, 3], [1, 0]], 'Like A, with the G string left open: that adds the b7.'),
  chordSkill('d7', 5, 'D7', 'D', '7', [[4, 0], [3, 2, 2], [2, 1, 1], [1, 2, 3]], 'An upside-down D triangle. Top four strings only.'),
  chordSkill('e7', 5, 'E7', 'E', '7', [[6, 0], [5, 2, 2], [4, 0], [3, 1, 1], [2, 0], [1, 0]], 'Like E, with the D string left open.'),
  { id: 'changes-a7-d7', level: 5, kind: 'changes', a: 'a7', b: 'd7', title: 'One-minute changes: A7 and D7', goal: 30 },
  { id: 'shuffle', level: 5, kind: 'rhythm', pattern: 'shuffle', title: 'Shuffle feel', text: 'Long-short, long-short: like a heartbeat. The blues lives here.' },
  // ---- Level 6: sixteenths ----
  { id: 'sixteenths', level: 6, kind: 'rhythm', pattern: 'sixteenths', title: 'Sixteenth notes', text: 'Four strums per beat: 1 e & a. Small, relaxed movements from the wrist.' }
];
export const findSkill = id => SKILLS.find(s => s.id === id) || null;
export const skillsOf = level => SKILLS.filter(s => s.level === level);

// The daily-review item a skill teaches (chords and rhythms; motor practice stays on the tempo ladder).
export const reviewItemOf = s => s.kind === 'chord' ? `chordshape:${s.id}` : s.kind === 'rhythm' ? `rhythm:${s.pattern}` : null;
// Has the learner done anything with it yet?
export function touched(s) {
  if (s.kind === 'goal') return !!getGoal(s.id)?.days.length;
  if (s.kind === 'changes') return !!getTempo(`changes:${s.id}`);
  const item = reviewItemOf(s);
  return !!(item && getItem(item)) || !!getTempo(`skill:${s.id}`);
}

const tuning = tuningOf('guitar'); // guitar content: positions are in guitar numbering
const sIdx = n => tuning.strings.findIndex(x => x.num === n);
const shapeDots = (chord, shape) => shape.map(([s, f]) => chord.dot(s, f));
const fingerText = shape => shape.filter(x => x[2]).map(([s, f, fi]) => `finger ${fi} on the ${STR[s]} string, fret ${f}`).join(' · ');
const unplayed = shape => [6, 5, 4, 3, 2, 1].filter(n => !shape.some(x => x[0] === n)).map(n => STR[n]);
const strumOf = shape => ({ seq: [shape.map(([s, f]) => P(s, f))], bpm: 60 });

function chordBox(host, chord, shape, view = [0, 5]) {
  const fb = new Fretboard(host, { view, labels: 'intervals', playOnTap: true, ariaLabel: 'Chord shape' });
  fb.setDots(shapeDots(chord, shape).map(d => ({ s: sIdx(d.string), f: d.fret, label: d.label, role: d.role })));
  return fb;
}
const chordInfoHTML = (s, shape) => `<p class="small muted">${fingerText(shape)}${unplayed(shape).length ? ` · don't play: ${unplayed(shape).join(', ')}` : ''}</p>`;

// Render a skill into host. compact: inside a lesson Play step (no metronome of its own).
// Returns a cleanup function.
export function renderSkill(host, s, { compact = false } = {}) {
  const cleanups = [];
  const done = () => cleanups.forEach(f => f());
  const metroBlock = (bpm, id) => compact ? '' : `
    <div class="row"><button class="primary" data-sk="metro">▶ Click at <span data-sk="bpm">${bpm}</span> bpm</button>
      <input type="range" data-sk="tempo" min="40" max="160" value="${bpm}" aria-label="Tempo">
      <button data-sk="clean">✓ Clean run</button></div>
    <p class="msg muted" data-sk="msg">${getTempo(id) ? `Your best clean tempo: ${getTempo(id).best} bpm.` : ''}</p>`;
  const wireMetro = (id, title, bpm, onBeat) => {
    if (compact) return;
    const $ = sel => host.querySelector(`[data-sk="${sel}"]`);
    const saved = { bpm: metronome.bpm, beats: metronome.beatsPerBar, running: metronome.running };
    let count = 0;
    const off = metronome.listen(() => { onBeat?.(count++); });
    $('tempo').oninput = e => { bpm = +e.target.value; $('bpm').textContent = bpm; if (metronome.running) metronome.setBpm(bpm); };
    $('metro').onclick = () => {
      if (metronome.running) { metronome.stop(); $('metro').firstChild.textContent = '▶ Click at '; return; }
      metronome.setBpm(bpm); metronome.beatsPerBar = 4; metronome.subdiv = 1; metronome.group = 0; count = 0; metronome.start();
      $('metro').firstChild.textContent = '■ Stop · ';
    };
    $('clean').onclick = () => {
      const r = recordClean(id, bpm, title);
      if (reviewItemOf(s)) recordAnswer(reviewItemOf(s), true, 0);
      $('msg').textContent = `Saved: ${bpm} bpm clean. Your best is ${r.best} bpm.`;
    };
    cleanups.push(() => { off(); if (metronome.running && !saved.running) metronome.stop(); metronome.setBpm(saved.bpm); metronome.beatsPerBar = saved.beats; });
  };

  if (s.kind === 'chord') {
    const pattern = findPattern(s.level >= 2 ? 'first-strum' : 'quarters');
    host.innerHTML = `
      <p>${esc(s.tip)}</p><div class="sk-board"></div>${chordInfoHTML(s, s.shape)}
      <div class="row"><button data-sk="hear">▶ Hear it</button>${compact ? `<a class="button-link" href="#learn?skill=${s.id}">Practise ${esc(s.name)} →</a>` : ''}</div>
      ${compact ? '' : `<h4>Strum it</h4><div class="rh-line">${rhythmSVG(pattern)}</div>${metroBlock(60, `skill:${s.id}`)}`}`;
    chordBox(host.querySelector('.sk-board'), s.chord, s.shape);
    let stop = () => {};
    host.querySelector('[data-sk="hear"]').onclick = () => { stop(); stop = playSound(strumOf(s.shape)); if (reviewItemOf(s)) recordAnswer(reviewItemOf(s), true, 0); };
    cleanups.push(() => stop());
    wireMetro(`skill:${s.id}`, `${s.name} chord`, 60);
  } else if (s.kind === 'changes') {
    const A = findSkill(s.a), B = findSkill(s.b), id = `changes:${s.id}`, best = getTempo(id);
    host.innerHTML = `
      <p>Switch between ${esc(A.name)} and ${esc(B.name)} for one minute, strumming once after each change. Count every change. Aim for ${s.goal}.</p>
      <div class="sk-pair"><div><b>${esc(A.name)}</b><div class="sk-a"></div></div><div><b>${esc(B.name)}</b><div class="sk-b"></div></div></div>
      ${compact ? `<a class="button-link" href="#learn?skill=${s.id}">Take the one-minute test →</a>` : `
      <div class="changes-test">
        <div class="ct-clock" data-sk="clock">1:00</div>
        <button class="primary big" data-sk="go">▶ Start the minute</button>
        <div class="ct-count" data-sk="count" hidden>
          <span>How many changes did you make?</span>
          <div class="row"><button data-sk="minus" aria-label="One less">−</button><input type="number" data-sk="n" min="0" max="120" value="20" inputmode="numeric"><button data-sk="plus" aria-label="One more">+</button>
          <button class="primary" data-sk="save">Save</button></div>
        </div>
        <p class="msg muted" data-sk="msg">${best ? `Your best: ${best.best} changes in a minute.` : ''}</p>
      </div>`}`;
    chordBox(host.querySelector('.sk-a'), A.chord, A.shape);
    chordBox(host.querySelector('.sk-b'), B.chord, B.shape);
    if (!compact) {
      const $ = sel => host.querySelector(`[data-sk="${sel}"]`);
      let timer = null;
      $('go').onclick = () => {
        let left = 60;
        $('go').disabled = true; $('count').hidden = true; $('clock').textContent = clock(left);
        // window.__skillSpeed: a test-only speed-up (like the timer's &speed=).
        timer = setInterval(() => {
          left--; $('clock').textContent = clock(left);
          if (left <= 0) { clearInterval(timer); $('clock').textContent = "Time's up!"; $('count').hidden = false; $('go').disabled = false; $('go').textContent = '▶ Again'; $('n').focus(); }
        }, 1000 / (window.__skillSpeed || 1));
      };
      $('minus').onclick = () => { $('n').value = Math.max(0, +$('n').value - 1); };
      $('plus').onclick = () => { $('n').value = Math.min(120, +$('n').value + 1); };
      $('save').onclick = () => {
        const n = Math.max(0, Math.min(120, Math.round(+$('n').value || 0)));
        const r = recordClean(id, n, s.title, 'changes');
        $('msg').textContent = n >= r.best && r.history.length > 1 ? `${n} changes: a new best!` : `Saved: ${n} changes. Your best is ${r.best}.`;
        $('count').hidden = true;
      };
      cleanups.push(() => clearInterval(timer));
    }
  } else if (s.kind === 'rhythm') {
    const pattern = findPattern(s.pattern);
    host.innerHTML = `
      <p>${esc(s.text)}</p><div class="rh-line">${rhythmSVG(pattern, { bars: 1 })}</div>
      <div class="row"><button data-sk="hear">▶ Hear it</button><a class="button-link" href="#practice?tool=rhythm&pattern=${pattern.id}">Tap it in the Rhythm drill →</a></div>`;
    let stop = () => {};
    host.querySelector('[data-sk="hear"]').onclick = () => {
      stop();
      const beat = 60 / 80, seq = [];
      let b = 0;
      pattern.notes.forEach(n => { const k = Math.round(b * 12); seq[k] = n.rest ? null : 76; b += n.dur; });
      for (let k = 0; k < Math.round(pattern.beats * 12); k++) if (seq[k] === undefined) seq[k] = null;
      stop = playSound({ seq: [...seq, ...seq], bpm: 80 * 12 });
    };
    cleanups.push(() => stop());
  } else if (s.kind === 'technique') {
    host.innerHTML = `<p>${esc(s.text)}</p><div class="sk-board"></div>${metroBlock(s.bpm, `skill:${s.id}`)}`;
    const fb = new Fretboard(host.querySelector('.sk-board'), { view: s.view, labels: 'notes', ariaLabel: s.title });
    const steps = s.follow.map(x => (Array.isArray(x) ? x : [x]).map(p => ({ s: sIdx(p.string), f: p.fret })));
    fb.setDots(steps.flat());
    wireMetro(`skill:${s.id}`, s.title, s.bpm, c => { const k = Math.floor(c / (s.per || 1)) % steps.length; fb.highlight(steps[k]); });
  } else if (s.kind === 'goal') {
    const paint = () => {
      const g = getGoal(s.id), week = g ? Math.floor((new Date(today() + 'T12:00') - new Date(g.started + 'T12:00')) / (7 * 86400000)) + 1 : 1;
      host.innerHTML = `
        <p>${esc(s.text)}</p>
        <p class="goal-status">${g ? `Week ${week} · practised on ${g.days.length} day${g.days.length === 1 ? '' : 's'}` : 'Not started yet'}${g?.days.includes(today()) ? ' · today ✓' : ''}</p>
        ${compact ? `<a class="button-link" href="#learn?skill=${s.id}">Open the barre chord goal →</a>` : `
        <button class="primary" data-sk="today"${g?.days.includes(today()) ? ' disabled' : ''}>${g?.days.includes(today()) ? 'Practised today ✓' : 'I practised barres today'}</button>
        <ul class="goal-checks">${s.checks.map(([id, label]) => `<li><label class="check"><input type="checkbox" data-check="${id}"${g?.checks[id] ? ' checked' : ''}> ${esc(label)}</label></li>`).join('')}</ul>
        ${s.shapes.map((x, i) => `<h4>${esc(x.name)}</h4><p class="small">${esc(x.tip)}</p><div class="sk-shape" data-i="${i}"></div>${chordInfoHTML(x, x.shape)}`).join('')}`}`;
      if (compact) return;
      host.querySelector('[data-sk="today"]').onclick = () => { practiseGoal(s.id); paint(); };
      host.querySelectorAll('[data-check]').forEach(c => c.onchange = () => { checkGoal(s.id, c.dataset.check, c.checked); });
      host.querySelectorAll('.sk-shape').forEach(el => { const x = s.shapes[+el.dataset.i]; chordBox(el, x.chord, x.shape, [0, 5]); });
    };
    paint();
  }
  return done;
}

// The "Hands & rhythm" row for a level on the Learn path.
export function skillRowHTML(level) {
  const list = skillsOf(level);
  if (!list.length) return '';
  return `<div class="hands-row"><span class="hr-title">Hands &amp; rhythm</span>
    <div class="hr-chips">${list.map(s => `<a class="hr-chip${touched(s) ? ' done' : ''}" href="#learn?skill=${s.id}">${touched(s) ? '✓ ' : ''}${esc(s.kind === 'chord' ? s.name : s.title)}</a>`).join('')}</div></div>`;
}
