// Drum play-along (docs/research-drums.md D5): a static page with the current bar's step grid and
// the whole chart in drum notation, one playhead moving through both, form markers (section names)
// above the bars, and a drumless backing (a soft chord pad and a bass note). "App plays the drums"
// lets you hear it first; turn it off to play it yourself. Optional scoring with the pads, keys
// or an e-kit (timing never blocks). Tap a bar in the chart to loop it.
import { SONGS, findSong, barGroove, songGroove } from './songs.js';
import { grooveAbcMap } from './notation.js';
import { piece } from './kit.js';
import { hit } from '../drumkit.js';
import { pad } from '../groove.js';
import { parseChordName } from '../progressions.js';
import { metronome, now, pluckAt, context, click } from '../audio.js';
import { rhythmGrid } from '../rhythm-grid.js';
import { renderAbc } from '../notation.js';
import { padsHTML, wirePads } from './tab.js';
import { audioTimeOf } from '../timing.js';
import { offsetMs } from '../timing-ui.js';
import { scoreHits } from './score.js';
import { level, windowSeg } from './player.js';
import { addLog, addTimingSession, recordClean, getPracticePrefs, updatePracticePrefs } from '../storage.js';
import { esc } from '../ui.js';

function library(el) {
  el.innerHTML = `<p class="muted">Original grooves and fills with a drumless backing. Hear it first, then play it yourself.</p>
    <ul class="tab-list">${SONGS.map(s => `<li><a href="#practice?tool=playalong&tab=${s.id}"><span><b>${esc(s.title)}</b><small>${esc(s.source)} · ${s.meter || s.beats + '/4'} · ${s.bars.length} bars</small></span>
      <span class="meta"><span class="pill ${s.difficulty}">${s.difficulty}</span><small>${s.bpm} bpm</small></span></a></li>`).join('')}</ul>`;
}

function player(el, song) {
  const prefs = { appDrums: true, backing: true, score: false, ...(getPracticePrefs().drumSong || {}) };
  const save = () => updatePracticePrefs({ drumSong: prefs });
  let bpm = song.bpm, loop = null, running = false, timers = [], off = null, taps = [], expected = [], detachPads = null, startedAt = 0, bar = 0;
  const per = song.beats * song.sub, whole = songGroove(song), map = grooveAbcMap(whole);
  el.innerHTML = `<div class="pa drum-pa">
    <div class="pa-head"><b>${esc(song.title)}</b><span class="pill ${song.difficulty}">${song.difficulty}</span><small class="muted">${esc(song.source)}</small></div>
    <div class="form-bar" id="dp-form">${song.bars.map((b, i) => `<button class="fb-bar${b.fill ? ' fill' : ''}" data-bar="${i}" aria-label="Bar ${i + 1}${b.section ? ', ' + b.section : ''}${b.fill ? ', fill' : ''}"><small>${esc(b.section || '')}</small><b>${i + 1}</b><i>${esc(song.chords[i])}</i></button>`).join('')}</div>
    <p class="now-chord" id="dp-now"></p>
    <div id="dp-grid"></div>
    <div class="staff-box" id="dp-staff"></div>
    <div class="tempo"><button class="icon" id="dp-slower" aria-label="Slower">−</button><output><b id="dp-bpm">${bpm}</b> bpm</output><button class="icon" id="dp-faster" aria-label="Faster">+</button></div>
    <div class="row toggles">
      <label class="check"><input type="checkbox" id="dp-app"${prefs.appDrums ? ' checked' : ''}> The app plays the drums (turn off to play them yourself)</label>
      <label class="check"><input type="checkbox" id="dp-back"${prefs.backing ? ' checked' : ''}> Backing (chords and bass)</label>
      <label class="check"><input type="checkbox" id="dp-score"${prefs.score ? ' checked' : ''}> Score my timing (tap the pads below, keys or an e-kit)</label></div>
    <div class="row">${windowSeg()}</div>
    <div class="row"><button class="primary big" id="dp-go">▶ Play</button></div>
    <p class="muted small" id="dp-loopmsg">Tap a bar above to loop it.</p>
    <p class="msg" id="dp-msg" aria-live="polite"></p><div class="lk-hits" id="dp-hits"></div>
    <div class="ds-pads" id="dp-pads" ${prefs.score ? '' : 'hidden'}>${padsHTML()}</div></div>`;
  const $ = s => el.querySelector(s);
  renderAbc($('#dp-staff'), map.abc, { abcjs: { add_classes: true } });
  let grid = null;
  const showBar = b => {
    bar = b;
    const g = barGroove(song, b);
    grid = rhythmGrid($('#dp-grid'), { beats: song.beats, sub: song.sub, rows: Object.keys(songGroove(song).hits).map(p => ({ id: p, label: `${piece(p).name} · ${piece(p).limb}`, cells: g.hits[p] || [], mark: piece(p).staff.x ? '×' : '●' })) });
    el.querySelectorAll('.fb-bar').forEach(x => x.classList.toggle('now', +x.dataset.bar === b));
    const sec = [...song.bars.slice(0, b + 1)].reverse().find(x => x.section)?.section;
    $('#dp-now').innerHTML = `Bar ${b + 1} of ${song.bars.length}${sec ? ` · <b>${esc(sec)}</b>` : ''} · ${esc(song.chords[b])}${song.bars[b].fill ? ' · <b>fill</b>' : ''}`;
  };
  const light = (b, s) => {
    grid?.light(s);
    el.querySelectorAll('#dp-staff .now').forEach(x => x.classList.remove('now'));
    const idx = map.index[b * per + s];
    if (idx >= 0) el.querySelectorAll(`#dp-staff .abcjs-mm${b}.abcjs-n${idx}`).forEach(x => x.classList.add('now'));
  };
  showBar(0);
  $('#dp-form').onclick = e => { const b = e.target.closest('[data-bar]'); if (!b) return; const i = +b.dataset.bar; loop = loop === i ? null : i; el.querySelectorAll('.fb-bar').forEach(x => x.classList.toggle('looped', +x.dataset.bar === loop)); $('#dp-loopmsg').textContent = loop != null ? `Looping bar ${loop + 1}. Tap it again to play the whole chart.` : 'Tap a bar above to loop it.'; if (!running) showBar(loop ?? 0); };
  const setBpm = v => { bpm = Math.max(40, Math.min(200, v)); $('#dp-bpm').textContent = bpm; if (running) metronome.setBpm(bpm); };
  $('#dp-slower').onclick = () => setBpm(bpm - 4); $('#dp-faster').onclick = () => setBpm(bpm + 4);
  const tog = (id, key, after) => { $(id).onchange = e => { prefs[key] = e.target.checked; save(); after?.(); }; };
  tog('#dp-app', 'appDrums'); tog('#dp-back', 'backing'); tog('#dp-score', 'score', () => { $('#dp-pads').hidden = !prefs.score; });
  $('#ds-win').onclick = e => { const b = e.target.closest('button'); if (!b) return; import('../storage.js').then(s => s.setSetting('drumWindow', b.dataset.w)); el.querySelectorAll('#ds-win button').forEach(x => x.setAttribute('aria-pressed', x === b)); };

  function start() {
    stop(true);
    running = true; taps = []; expected = []; startedAt = Date.now();
    $('#dp-go').textContent = '■ Stop'; $('#dp-hits').innerHTML = ''; $('#dp-msg').textContent = '';
    const c = context(), saved = { bpm: metronome.bpm, beats: metronome.beatsPerBar, vol: metronome.volume };
    metronome.stop(); metronome.setBpm(bpm); metronome.beatsPerBar = song.beats; metronome.subdiv = 1; metronome.setVolume(0);
    if (prefs.score) detachPads = wirePads($('#dp-pads'), (id, e) => taps.push({ piece: id, t: e?.midiTime ?? audioTimeOf(e.timeStamp, c), midi: e?.midiTime != null }));
    const unsub = metronome.schedule((beat, t, gbar) => {
      const spb = 60 / metronome.bpm, rel = gbar - 1;
      if (rel < 0) { click(t, beat === 0 ? 2 : 1, 0.8); return; }   // one bar count-in
      const b = loop != null ? loop : rel % song.bars.length;
      if (loop == null && rel >= song.bars.length) { if (beat === 0) timers.push(setTimeout(() => stop(), Math.max(0, (t - now()) * 1000))); return; }
      const g = barGroove(song, b);
      if (beat === 0) {
        timers.push(setTimeout(() => showBar(b), Math.max(0, (t - now()) * 1000 - 20)));
        if (prefs.backing) { const ch = parseChordName(song.chords[b]); pad(ch.root, ch.chord, t, spb * song.beats * 0.97); pluckAt(36 + ((ch.root - 36) % 12 + 12) % 12, t, 0.6); }
      }
      for (let k = 0; k < song.sub; k++) {
        const s = beat * song.sub + k, at = t + k * spb / song.sub;
        Object.entries(g.hits).forEach(([p, steps]) => { if (steps.includes(s)) { if (prefs.appDrums) hit(p, at, 0.75); expected.push({ t: at, piece: p, step: s, bar: b }); } });
        timers.push(setTimeout(() => running && light(b, s), Math.max(0, (at - now()) * 1000)));
      }
    });
    off = () => { unsub(); metronome.stop(); metronome.setBpm(saved.bpm); metronome.beatsPerBar = saved.beats; metronome.setVolume(saved.vol); };
    metronome.start();
  }
  function stop(silent) {
    timers.forEach(clearTimeout); timers = []; off?.(); off = null; detachPads?.(); detachPads = null;
    if (running && !silent) {
      if (prefs.score && taps.length) {
        const adj = taps.map(h => ({ ...h, t: h.t - (h.midi ? offsetMs('midi') : offsetMs()) / 1000 }));
        const r = scoreHits(expected.filter(e => e.t <= now()), adj, { level: level(), samePiece: true });
        $('#dp-msg').innerHTML = `<b>${r.inTime} of ${r.total}</b> hits in time (±${r.window} ms). ${r.lean === 'on time' ? 'On time on average' : `${Math.abs(r.bias)} ms ${r.lean} on average`}, consistency ±${r.spread} ms.`;
        $('#dp-hits').innerHTML = r.notes.slice(0, 64).map(n => `<span class="hit ${n.tight ? 'tight' : n.inTime ? 'in' : 'out'}" title="${esc(piece(n.piece).name)}">${n.error > 0 ? '+' : ''}${n.error}</span>`).join('');
        addTimingSession({ drill: 'drum-play', bpm, n: r.played, bias: r.bias, spread: r.spread, hitRate: Math.round(r.hitRate * 100) / 100, window: r.window, bars: song.bars.length, steps: Object.fromEntries(r.notes.map(n => [n.step, n.error])) });
        if (r.hitRate >= 0.8) recordClean(`drum-song:${song.id}`, bpm, song.title);
      }
      if (Date.now() - startedAt > 15000) addLog({ minutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)), activity: `Play-along: ${song.title}`, detail: `${bpm} bpm${prefs.appDrums ? ' (listening)' : ''}`, tab: song.id, bpm, pct: Math.round(100 * bpm / song.bpm) });
    }
    running = false; light(bar, -1);
    $('#dp-go').textContent = '▶ Play';
  }
  $('#dp-go').onclick = () => (running ? stop() : start());
  return () => stop();
}

export default {
  id: 'playalong', title: 'Play-along', blurb: 'Original grooves and fills on a grid and the drum staff',
  icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 5l5 4M19 5l-5 4" stroke="currentColor" stroke-width="2"/></svg>',
  mount(el, params) {
    const song = findSong(params.get('tab'));
    if (!song) { library(el); return; }
    const head = el.closest('.tool-body')?.previousElementSibling?.querySelector('h2');
    if (head) head.textContent = song.title;
    return player(el, song);
  }
};
