// Browser side of the timing engine (js/timing.js): the tap pad, per-device
// calibration (stored in settings.timing) and the window setting. Shared by
// every rhythm feature. Nothing here ever blocks progress: an uncalibrated
// device is scored with no offset, and calibrating is always optional.
import { context, now, click } from './audio.js';
import { getSettings, setSetting } from './storage.js';
import { audioTimeOf, deviceKey, calibrate, WINDOWS, WINDOW_NAMES } from './timing.js';

let deviceChanged = false;
navigator.mediaDevices?.addEventListener?.('devicechange', () => { deviceChanged = true; });

const timingSettings = () => ({ calibrations: {}, window: 'normal', ...(getSettings().timing || {}) });
const saveTiming = patch => setSetting('timing', { ...timingSettings(), ...patch });

export const getWindow = () => timingSettings().window;
export const setWindow = w => saveTiming({ window: w });

// The calibration for the current output, or null. stale = the device list changed since.
export function currentCalibration() {
  const ctx = context();
  if (!ctx) return null;
  const c = timingSettings().calibrations[deviceKey(ctx)];
  return c ? { ...c, stale: deviceChanged } : null;
}
export const offsetMs = () => currentCalibration()?.offsetMs || 0;

// A big pad that reports tap times on the audio clock. Touch, mouse, Space or Enter.
// onTap(audioTime). Returns a detach function.
export function tapPad(pad, onTap) {
  const hit = e => {
    const ctx = context();
    if (!ctx) return;
    pad.classList.remove('flash'); void pad.offsetWidth; pad.classList.add('flash');
    onTap(audioTimeOf(e.timeStamp, ctx));
  };
  const down = e => { e.preventDefault(); hit(e); };
  const key = e => { if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat && !e.target.closest('input,select,textarea')) { e.preventDefault(); hit(e); } };
  pad.addEventListener('pointerdown', down);
  document.addEventListener('keydown', key);
  return () => { pad.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key); };
}

// Clicks at audio times; returns the times. level 2 = accent.
export function scheduleClicks(count, bpm, { lead = 0.4, accentEvery = 4, volume = 0.9 } = {}) {
  const t0 = now() + lead, spb = 60 / bpm, times = [];
  for (let i = 0; i < count; i++) { const t = t0 + i * spb; click(t, i % accentEvery === 0 ? 2 : 1, volume); times.push(t); }
  return times;
}

export const windowSegHTML = (id = 'tm-window') =>
  `<div class="seg" id="${id}" role="group" aria-label="Timing window">${Object.keys(WINDOWS).map(w =>
    `<button data-w="${w}" aria-pressed="${w === getWindow()}">${WINDOW_NAMES[w]} ±${WINDOWS[w]}</button>`).join('')}</div>`;
export function wireWindowSeg(root, onChange, id = 'tm-window') {
  const seg = root.querySelector('#' + id);
  seg.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    setWindow(b.dataset.w);
    seg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    onChange?.(b.dataset.w);
  };
}

export function calibrationLine() {
  const c = currentCalibration();
  if (!c) return '<span class="muted">Not calibrated for this speaker or headphones yet.</span>';
  const when = new Date(c.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `Calibrated: your taps land <b>${c.offsetMs} ms</b> after the click on this output (${when}).` +
    (c.bluetooth ? ' <span class="warn">That is a big delay, which usually means Bluetooth. Wired headphones or the speaker are more accurate; scores are corrected either way.</span>' : '') +
    (c.stale ? ' <span class="warn">Your audio devices changed. Calibrate again if you switched headphones.</span>' : '');
}

// The calibration screen: 4 clicks to listen, then tap along with the next 8.
export function runCalibration(host, { onDone, bpm = 90 } = {}) {
  let detach = null, timer = null;
  host.innerHTML = `
    <div class="calib">
      <p><b>Calibrate your timing</b> for this speaker or headphones. Listen to 4 clicks, then tap along with the next 8.</p>
      <div class="calib-dots" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<i class="${i < 4 ? 'listen' : ''}"></i>`).join('')}</div>
      <button class="tap-pad" id="calib-pad" aria-label="Tap here in time with the clicks">Tap</button>
      <p class="msg" id="calib-msg" aria-live="polite"></p>
      <div class="row"><button class="primary" id="calib-go">▶ Start</button><button class="quiet-inline" id="calib-cancel">Not now</button></div>
    </div>`;
  const $ = s => host.querySelector(s), taps = [];
  const stop = () => { detach?.(); detach = null; clearTimeout(timer); };
  $('#calib-cancel').onclick = () => { stop(); onDone?.(null); };
  $('#calib-go').onclick = () => {
    if (!context()) return;
    stop(); taps.length = 0;
    $('#calib-pad').hidden = false; host.querySelector('.calib-dots').hidden = false;
    $('#calib-msg').textContent = 'Listen…'; $('#calib-msg').className = 'msg muted';
    const times = scheduleClicks(12, bpm, { accentEvery: 4 }), clicks = times.slice(4);
    const dots = host.querySelectorAll('.calib-dots i');
    times.forEach((t, i) => setTimeout(() => { dots[i]?.classList.add('on'); if (i === 4) $('#calib-msg').textContent = 'Tap along now!'; }, Math.max(0, (t - now()) * 1000)));
    detach = tapPad($('#calib-pad'), t => taps.push(t));
    timer = setTimeout(() => {
      stop();
      dots.forEach(d => d.classList.remove('on'));
      const r = calibrate(clicks, taps.filter(t => t > clicks[0] - 0.4));
      if (!r.ok) { $('#calib-msg').textContent = `Only ${r.n} taps matched the clicks. Try again: tap right on each click.`; $('#calib-msg').className = 'msg bad'; return; }
      const ctx = context(), cal = { offsetMs: r.offsetMs, spreadMs: r.spreadMs, bluetooth: r.bluetooth, at: Date.now() };
      saveTiming({ calibrations: { ...timingSettings().calibrations, [deviceKey(ctx)]: cal } });
      deviceChanged = false;
      $('#calib-msg').innerHTML = `Done: your taps land <b>${r.offsetMs} ms</b> after the click here. Scores will correct for it.` +
        (r.bluetooth ? '<br><span class="warn">That is a big delay, which usually means Bluetooth headphones. Wired or the speaker is more accurate.</span>' : '');
      $('#calib-msg').className = 'msg good';
      // Done: put the pad and dots away so there's only one tap pad on screen.
      $('#calib-pad').hidden = true; host.querySelector('.calib-dots').hidden = true;
      $('#calib-go').textContent = 'Calibrate again';
      onDone?.(cal);
    }, (clicks[7] - now() + 0.6) * 1000);
  };
  return stop;
}
