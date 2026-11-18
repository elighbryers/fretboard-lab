// Metronome tool: big tempo, time signature, subdivisions, accent, tap tempo,
// pulsing beat dots and volume. Settings are remembered.
import { metronome } from '../audio.js';
import { getSettings, setSetting } from '../storage.js';
import { volumeHTML } from '../ui.js';
import { mountGroove } from './groove-ui.js';

export const MIN_BPM = 30, MAX_BPM = 250;
const SIGS = { '2/4': [2, 0], '3/4': [3, 0], '4/4': [4, 0], '6/8': [6, 3] }; // beats per bar, secondary accent group
const SUBDIVS = [[1, 'Quarter', '♩'], [2, 'Eighth', '♪♪'], [3, 'Triplet', '3'], [4, 'Sixteenth', '♬♬']];

// Apply saved settings to the shared metronome engine.
export function applyMetronomeSettings(m = getSettings().metronome) {
  metronome.setBpm(m.bpm);
  [metronome.beatsPerBar, metronome.group] = SIGS[m.sig] || SIGS['4/4'];
  metronome.subdiv = m.subdiv;
  metronome.accent = m.accent;
}

export default {
  id: 'metronome',
  title: 'Metronome',
  blurb: 'Click or drum grooves, chord loops, tap tempo',
  icon: '<svg viewBox="0 0 24 24"><path d="M8 21h8l-3-17h-2zM12 14l5-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>',

  mount(el) {
    let m = { ...getSettings().metronome };
    const save = () => { setSetting('metronome', m); applyMetronomeSettings(m); paint(); };
    applyMetronomeSettings(m);
    el.innerHTML = `
      <div class="metro">
        <div class="seg mode-seg" id="mt-mode" role="group" aria-label="Click or groove"><button data-m="click">Click</button><button data-m="groove">Groove</button></div>
        <div class="bpm-row">
          <button class="round" id="mt-minus" aria-label="Slower">−</button>
          <div class="bpm-big"><b id="mt-bpm"></b><span>bpm</span></div>
          <button class="round" id="mt-plus" aria-label="Faster">+</button>
        </div>
        <input type="range" id="mt-slider" min="${MIN_BPM}" max="${MAX_BPM}" aria-label="Tempo">
        <div class="mt-click">
        <div class="beat-dots" id="mt-dots" aria-hidden="true"></div>
        <div class="row center">
          <button class="primary big" id="mt-go"></button>
          <button class="big" id="mt-tap">Tap tempo</button>
        </div>
        <div class="field"><span class="lbl">Time signature</span>
          <div class="seg" id="mt-sig">${Object.keys(SIGS).map(s => `<button data-v="${s}">${s}</button>`).join('')}</div></div>
        <div class="field"><span class="lbl">Subdivision</span>
          <div class="seg" id="mt-sub">${SUBDIVS.map(([n, name, sym]) => `<button data-v="${n}" aria-label="${name}"><span aria-hidden="true">${sym}</span> ${name}</button>`).join('')}</div></div>
        <label class="check"><input type="checkbox" id="mt-accent"> Accent beat 1</label>
        ${volumeHTML('metroVol', 'Volume')}
        </div>
        <div class="mt-groove" hidden></div>
      </div>`;
    const $ = s => el.querySelector(s);

    function paint() {
      $('#mt-bpm').textContent = m.bpm;
      $('#mt-slider').value = m.bpm;
      $('#mt-minus').disabled = m.bpm <= MIN_BPM;
      $('#mt-plus').disabled = m.bpm >= MAX_BPM;
      el.querySelectorAll('#mt-sig button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === m.sig));
      el.querySelectorAll('#mt-sub button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.v === m.subdiv));
      $('#mt-accent').checked = m.accent;
      $('#mt-go').textContent = metronome.running ? '■ Stop' : '▶ Start';
      const n = (SIGS[m.sig] || SIGS['4/4'])[0];
      if ($('#mt-dots').children.length !== n) $('#mt-dots').innerHTML = Array.from({ length: n }, (_, i) => `<i data-b="${i}"${i === 0 ? ' class="one"' : ''}></i>`).join('');
    }
    const setBpm = v => { m.bpm = Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(+v) || 80)); save(); grooveUi?.setBpm(m.bpm); };
    // Click or Groove (drums + chord pad on the same tempo). Remembered in settings.metroMode.
    let grooveUi = null;
    const setMode = mode => {
      setSetting('metroMode', mode);
      el.querySelectorAll('#mt-mode button').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === mode));
      $('.mt-click').hidden = mode !== 'click';
      $('.mt-groove').hidden = mode !== 'groove';
      if (mode === 'groove' && !grooveUi) { metronome.stop(); paint(); grooveUi = mountGroove($('.mt-groove'), { bpm: () => m.bpm, onBpm: setBpm }); }
      if (mode === 'click' && grooveUi) { grooveUi.stop(); grooveUi = null; $('.mt-groove').innerHTML = ''; applyMetronomeSettings(m); }
    };
    $('#mt-mode').onclick = e => { const b = e.target.closest('button'); if (b) setMode(b.dataset.m); };

    $('#mt-minus').onclick = () => setBpm(m.bpm - 1);
    $('#mt-plus').onclick = () => setBpm(m.bpm + 1);
    $('#mt-slider').oninput = e => setBpm(e.target.value);
    $('#mt-sig').onclick = e => { const b = e.target.closest('button'); if (b) { m.sig = b.dataset.v; save(); } };
    $('#mt-sub').onclick = e => { const b = e.target.closest('button'); if (b) { m.subdiv = +b.dataset.v; save(); } };
    $('#mt-accent').onchange = e => { m.accent = e.target.checked; save(); };
    $('#mt-go').onclick = () => { metronome.running ? metronome.stop() : metronome.start(); paint(); };

    // Tap tempo: average of the last few taps; a 2-second pause starts over.
    let taps = [];
    $('#mt-tap').onclick = () => {
      const t = performance.now();
      if (taps.length && t - taps[taps.length - 1] > 2000) taps = [];
      taps = [...taps, t].slice(-5);
      if (taps.length >= 2) {
        const gaps = taps.slice(1).map((x, i) => x - taps[i]);
        setBpm(60000 / (gaps.reduce((a, b) => a + b, 0) / gaps.length));
      }
    };

    // Pulse the dot for each beat (beat 1 is pink), so it works with the sound low.
    const off = metronome.listen(beat => {
      const dot = el.querySelector(`#mt-dots i[data-b="${beat}"]`);
      if (!dot) return;
      dot.classList.remove('pulse'); void dot.offsetWidth; dot.classList.add('pulse');
    });
    paint();
    setMode(getSettings().metroMode === 'groove' ? 'groove' : 'click');

    return () => {
      off();
      grooveUi?.stop();
      // Leaving the screen stops the click, unless a practice routine is using it.
      if (!document.body.classList.contains('routine-running')) metronome.stop();
    };
  }
};
