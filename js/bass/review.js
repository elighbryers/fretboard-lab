// Bass items in the Daily review: chord tones by ear (toneear:R|3|5|7, shared ear training)
// and bass rhythms (rhythm:bass-0-6-8: tap the rhythm you hear in the grid, one try).
import { register } from '../registry.js';
import { recordAnswer } from '../storage.js';
import { context, pluckAt } from '../audio.js';
import { pad } from '../groove.js';
import { lookup, parseFormula, spell, pcOf } from '../theory.js';
import { gridTask } from '../lesson-extras.js';
import { pick } from '../ui.js';

const board = ui => ui.fb.wrap.parentElement;
const CHORDS = { R: ['major', 'minor', '7'], 3: ['major', 'minor', '7', 'm7'], 5: ['major', 'minor', '7'], 7: ['7', 'maj7', 'm7'] };

function toneRound(ui, id) {
  const want = id.split(':')[1], chordId = pick(CHORDS[want]), root = Math.floor(Math.random() * 12);
  const degs = parseFormula(lookup('chord', chordId).formula), d = degs.find(x => (x.label === 'R' ? 'R' : x.label.replace('b', '')) === want);
  const bass = 28 + pcOf(root + d.semi - 4), name = spell(root, degs).root + ({ major: '', minor: 'm' }[chordId] ?? chordId);
  const play = () => { const c = context(); if (!c) return; pad(root, chordId, c.currentTime + 0.05, 1.8); pluckAt(bass, c.currentTime + 0.05); };
  const shownAt = performance.now();
  let done = false;
  board(ui).hidden = true;
  ui.prompt(`A ${name} chord with a bass note. Which chord tone is the bass?`);
  ui.tools('<button id="rvb-again">▶ Hear it again</button>');
  document.getElementById('rvb-again').onclick = play;
  const opts = ['R', '3', '5', '7'].filter(o => degs.some(x => (x.label === 'R' ? 'R' : x.label.replace('b', '')) === o));
  ui.choices(opts.map(o => `<button data-o="${o}">${o === 'R' ? 'R (root)' : o}</button>`).join(''));
  document.getElementById('dr-choices').onclick = e => {
    const b = e.target.closest('button'); if (!b || done) return;
    done = true;
    const ok = b.dataset.o === want;
    recordAnswer(id, ok, performance.now() - shownAt);
    document.querySelectorAll('#dr-choices button').forEach(x => { x.disabled = true; if (x.dataset.o === want) x.classList.add('good'); else if (x === b) x.classList.add('bad'); });
    ui.result(ok);
    ui.msg(`${ok ? 'Yes! ' : ''}It was the ${want === 'R' ? 'root' : want} of ${name}.`, ok ? 'good' : 'bad');
    ok ? ui.autoNext(1200) : ui.showNext();
  };
  play();
  return { end: () => { board(ui).hidden = false; } };
}

function rhythmRound(ui, id) {
  const notes = id.slice('rhythm:bass-'.length).split('-').map(Number);
  board(ui).hidden = true;
  const host = document.createElement('div');
  board(ui).before(host);
  let done = false;
  ui.prompt('Listen, then tap where the bass notes fall.');
  const stop = gridTask(host, { grid: { notes, kick: [0, 8], midi: 33, bpm: 80, beats: 4, sub: 4 }, item: id }, {
    onRight: () => { if (done) return; done = true; ui.result(true); ui.msg('Yes! That\'s the rhythm.', 'good'); ui.autoNext(1200); },
    onWrong: text => { if (done) return; done = true; ui.result(false); ui.msg(text, 'bad'); ui.showNext(); }
  });
  return { end: () => { stop(); host.remove(); board(ui).hidden = false; } };
}

register('review', [
  { askable: id => /^toneear:(R|3|5|7)$/.test(id), round: toneRound },
  { askable: id => /^rhythm:bass-\d+(-\d+)*$/.test(id), round: rhythmRound }
]);
