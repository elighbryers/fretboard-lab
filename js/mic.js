// The optional microphone (guitar, bass and piano single notes). Off by default; turned on
// under Progress → Settings. It only ever adds information: every mic check has an
// "I played it" button, results feed stats, and nothing is locked behind it
// (docs/research-bass.md F2, research-piano.md F2). Not used for drums.
//
//   const stop = listenNotes(note => ...)   // { midi, pc, cents } once a note holds steady
//   micCheck(host, { pcs: [9], label: 'A', onResult: ok => ... })  // a small panel
import { context } from './audio.js';
import { yin, stabilizer, chroma, loudestPcs } from './pitch.js';
import { getSettings, setSetting, getInstrument, recordMic } from './storage.js';
import { preferredName } from './theory.js';
import { esc } from './ui.js';

export const micSupported = () => !!navigator.mediaDevices?.getUserMedia;
export const micOn = () => !!getSettings().mic && micSupported() && getInstrument() !== 'drums';
export const setMicOn = on => setSetting('mic', !!on);
export const polyOn = () => !!getSettings().micPoly;

const FFT = 8192; // 186 ms at 44.1 kHz: more than two periods of a low B (30.9 Hz)
let stream = null, analyser = null, users = 0, starting = null;

async function open() {
  if (analyser) return analyser;
  if (starting) return starting;
  starting = (async () => {
    const c = context();
    // Speech processing hurts music: echo cancellation, noise suppression and auto gain off.
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const src = c.createMediaStreamSource(stream);
    analyser = c.createAnalyser();
    analyser.fftSize = FFT;
    analyser.smoothingTimeConstant = 0;
    src.connect(analyser); // not to the speakers
    return analyser;
  })();
  try { return await starting; } finally { starting = null; }
}
function close() {
  if (--users > 0) return;
  users = 0;
  stream?.getTracks().forEach(t => t.stop());
  stream = null; analyser = null;
}

// Listen for steady notes. onNote({ midi, pc, cents }); onLevel(rms, freq) on every frame.
// Returns stop(). onError(message) if the browser or the person says no.
export function listenNotes(onNote, { onLevel, onError, onChord } = {}) {
  let stopped = false, timer = null;
  users++;
  const st = stabilizer(3);
  open().then(a => {
    if (stopped) return;
    const buf = new Float32Array(a.fftSize), sr = a.context.sampleRate, mags = new Float32Array(a.frequencyBinCount);
    const tick = () => {
      if (stopped) return;
      a.getFloatTimeDomainData(buf);
      const r = yin(buf, sr);
      onLevel?.(r.rms, r.freq);
      const n = r.clarity > 0.8 ? st.push(r.freq) : st.push(0);
      if (n) onNote(n);
      if (onChord && polyOn()) {
        a.getFloatFrequencyData(mags);
        const lin = Array.from(mags, db => Math.pow(10, db / 20));
        if (r.rms > 0.01) onChord(loudestPcs(chroma(lin, sr, a.fftSize)));
      }
      timer = setTimeout(tick, 60);
    };
    tick();
  }).catch(e => {
    users = Math.max(0, users - 1);
    onError?.(e && e.name === 'NotAllowedError' ? 'The microphone is blocked. You can allow it in your browser settings, or just tap "I played it".' : 'No microphone found. Tap "I played it" instead.');
  });
  return () => { if (stopped) return; stopped = true; clearTimeout(timer); close(); };
}

// A mic check panel for one target (any octave). Always shows "I played it".
// onResult(true|false, how) with how = 'mic' | 'self'. Returns stop().
export function micCheck(host, { pcs, label, onResult, prompt }) {
  const name = label || [].concat(pcs).map(preferredName).join(' or ');
  host.innerHTML = `<div class="mic-check" role="group" aria-label="Microphone check">
      <p>${esc(prompt || `Play ${name} on your instrument.`)}</p>
      ${micOn() ? `<div class="mic-row"><span class="mic-dot" aria-hidden="true"></span><span class="mic-heard" aria-live="polite">Listening…</span>
        <span class="mic-level" aria-hidden="true"><i></i></span></div><p class="mic-tip muted small" hidden>The signal is weak. Get closer to the speaker or amp, or use headphones and an audio interface.</p>` : ''}
      <div class="row"><button class="primary" data-mic="self">✓ I played it</button></div>
    </div>`;
  let done = false, weak = 0, stop = () => {};
  const finish = (ok, how) => { if (done) return; done = true; stop(); onResult?.(ok, how); };
  host.querySelector('[data-mic="self"]').onclick = () => finish(true, 'self');
  if (micOn()) {
    const heard = host.querySelector('.mic-heard'), bar = host.querySelector('.mic-level i'), tip = host.querySelector('.mic-tip');
    stop = listenNotes(n => {
      const ok = [].concat(pcs).includes(n.pc);
      heard.textContent = `Heard ${preferredName(n.pc)}${ok ? ' ✓' : ''}`;
      recordMic(ok);
      if (ok) finish(true, 'mic');
    }, {
      onLevel: rms => { bar.style.width = Math.min(100, rms * 400) + '%'; weak = rms > 0.002 && rms < 0.01 ? weak + 1 : 0; tip.hidden = weak < 30; },
      onError: msg => { heard.textContent = msg; }
    });
  }
  return () => { done = true; stop(); };
}

// The settings block (Progress → Settings).
export const micSettingsHTML = () => !micSupported() ? '' : `
  <fieldset class="mic-settings"><legend>Microphone</legend>
    <label class="check"><input type="checkbox" id="set-mic"${getSettings().mic ? ' checked' : ''}> Use microphone to hear single notes</label>
    <p class="muted small">Off by default. When it's on, Play steps and drills can listen for the note you play on guitar, bass or piano
      (any octave counts). Your browser asks first, the sound never leaves this device, and you can always tap "I played it" instead.
      It is not used for drums. Low bass notes need a clear signal: headphones or an audio interface help.</p>
    <label class="check"><input type="checkbox" id="set-mic-poly"${getSettings().micPoly ? ' checked' : ''}> Experimental: show the notes of chords I play (never graded)</label>
  </fieldset>`;
export function wireMicSettings(root) {
  root.querySelector('#set-mic')?.addEventListener('change', e => setMicOn(e.target.checked));
  root.querySelector('#set-mic-poly')?.addEventListener('change', e => setSetting('micPoly', e.target.checked));
}
