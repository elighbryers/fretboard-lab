// App shell: builds the tab bar, routes #hash -> tab, wires global settings.
import { unlock, setMuted, supported as audioSupported } from './audio.js';
import { getSettings, setSetting, onSave } from './storage.js';
import { checkMilestones } from './stats.js';
import { parseHash } from './router.js';
import { applyVolumes } from './ui.js';
import { mountTimerBar } from './practice/timer.js';
import { setupPWA } from './pwa.js';
import learn from './tabs/learn.js';
import fretboard from './tabs/fretboard.js';
import practice from './tabs/practice.js';
import progress from './tabs/progress.js';
import ear from './tabs/ear.js';

// Each tab: { id, title, icon, soon?, mount(el), show(params), hide() }
const TABS = [learn, fretboard, practice, progress, ear];
const HOME = 'learn';
const $ = id => document.getElementById(id);

const nav = $('tabs'), main = $('views');
const sections = {}, mounted = new Set();
let current = null;

TABS.forEach(t => {
  const a = document.createElement('a');
  a.href = '#' + t.id;
  a.dataset.tab = t.id;
  a.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${t.icon}</svg><span>${t.title}</span>` +
    (t.soon ? '<em>Soon</em>' : '');
  nav.appendChild(a);
  const sec = document.createElement('section');
  sec.id = 'view-' + t.id;
  sec.hidden = true;
  main.appendChild(sec);
  sections[t.id] = sec;
});

function route() {
  let { id, params } = parseHash();
  let tab = TABS.find(t => t.id === id);
  if (!tab) { tab = TABS.find(t => t.id === HOME); history.replaceState(null, '', '#' + HOME); params = new URLSearchParams(); }
  if (current && current !== tab) { current.hide?.(); sections[current.id].hidden = true; }
  if (!mounted.has(tab.id)) { tab.mount(sections[tab.id]); mounted.add(tab.id); }
  sections[tab.id].hidden = false;
  tab.show?.(params);
  current = tab;
  nav.querySelectorAll('a').forEach(a => a.toggleAttribute('aria-current', a.dataset.tab === tab.id));
  document.title = tab.id === HOME ? 'Fretboard Lab' : `${tab.title} · Fretboard Lab`;
}

/* ---------- sound toggle ---------- */
const soundBtn = $('sound');
function paintSound() {
  const on = getSettings().sound;
  soundBtn.setAttribute('aria-pressed', on);
  soundBtn.textContent = on ? '🔊 Sound on' : '🔇 Sound off';
}
soundBtn.onclick = () => { setSetting('sound', !getSettings().sound); setMuted(!getSettings().sound); paintSound(); };
setMuted(!getSettings().sound);
applyVolumes();
paintSound();
if (!audioSupported) soundBtn.textContent = 'No audio in this browser';

/* ---------- a small dot on Progress when a badge is newly earned ---------- */
const dot = document.createElement('i');
dot.className = 'dot';
dot.title = 'New badge';
nav.querySelector('[data-tab="progress"]').appendChild(dot);
const paintDot = () => { dot.hidden = !checkMilestones().some(b => b.fresh); };
onSave(paintDot);

setupPWA($('install-hint'));
unlock();
mountTimerBar($('timer-bar'));
window.addEventListener('hashchange', route);
route();
paintDot();
