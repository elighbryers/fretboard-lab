// Small shared UI pieces: remembered volume sliders and formatting helpers.
import { getSettings, setSetting } from './storage.js';
import { metronome, setDroneVolume } from './audio.js';

// Volume settings (0..1, saved in settings) and how each one is applied.
// tabVol / tabClickVol are read by the play-along player when it schedules notes.
const APPLY = {
  metroVol: v => metronome.setVolume(v),
  droneVol: v => setDroneVolume(v),
  tabVol: () => {},
  tabClickVol: () => {}
};

export function applyVolumes() {
  const s = getSettings();
  Object.keys(APPLY).forEach(k => APPLY[k](s[k]));
}

// <label> with a range input. Every copy of the same slider stays in sync.
export const volumeHTML = (key, label) =>
  `<label class="vol"><span>${label}</span><input type="range" min="0" max="100" data-vol="${key}" value="${Math.round(getSettings()[key] * 100)}" aria-label="${label}"></label>`;

document.addEventListener('input', e => {
  const key = e.target.dataset && e.target.dataset.vol;
  if (!key || !(key in APPLY)) return;
  const v = e.target.value / 100;
  setSetting(key, v);
  APPLY[key](v);
  document.querySelectorAll(`[data-vol="${key}"]`).forEach(x => { if (x !== e.target) x.value = e.target.value; });
});

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const clock = sec => { sec = Math.max(0, Math.ceil(sec)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; };
export const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pick = a => a[Math.floor(Math.random() * a.length)];
