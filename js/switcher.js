// The instrument switcher in the header (next to "Sound on") and the one place that changes
// instrument, also used by Progress -> Settings. Each instrument's code is loaded before the
// first screen (js/app.js), so switching reloads the page: it fades out, keeps the same tab
// (every instrument has the same tab ids) and fades back in.
import { INSTRUMENTS, getInstrument, setInstrument } from './storage.js';
import { parseHash } from './router.js';

export const INSTRUMENT_ICONS = {
  guitar: '<path d="M14.5 3.5l6 6M17.5 6.5l-6.6 6.6"/><path d="M10.6 9.4c-1.6-.9-3.8-.6-5.2.8-1.3 1.3-.9 2.9-2.2 4.2-.8.8-.7 2.4.9 4s3.2 1.7 4 .9c1.3-1.3 2.9-.9 4.2-2.2 1.4-1.4 1.7-3.6.8-5.2"/><circle cx="9" cy="15" r="1.2"/>',
  bass: '<path d="M13.5 2.5l8 8M17.5 6.5l-7.4 7.4"/><path d="M9.6 10.4C8 9.5 5.6 9.8 4.2 11.2c-1.2 1.2-.8 2.6-1.8 3.6-.8.8-.6 2.6 1.2 4.4s3.6 2 4.4 1.2c1-1 2.4-.6 3.6-1.8 1.4-1.4 1.7-3.8.8-5.4"/><path d="M15 3.5l.8.8M17 5.5l.8.8"/>',
  piano: '<rect x="2.5" y="5" width="19" height="14" rx="1.5"/><path d="M7.25 19v-5M12 19v-5M16.75 19v-5"/><path d="M6 5v9h2.5V5M10.75 5v9h2.5V5M15.5 5v9H18V5" fill="currentColor"/>',
  drums: '<ellipse cx="12" cy="9" rx="8" ry="3"/><path d="M4 9v7c0 1.7 3.6 3 8 3s8-1.3 8-3V9"/><path d="M4 13l3 1.5M20 13l-3 1.5M9 4l5 4M16 3l-3 5"/>'
};
const icon = id => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${INSTRUMENT_ICONS[id]}</svg>`;
const FADE = 'switching-instrument';

// Change instrument and redraw every tab, staying on the current one. Tab parameters (a lesson,
// a play-along piece) belong to the old instrument, so only the tab itself is kept.
export function switchInstrument(id) {
  if (id === getInstrument() || !INSTRUMENTS.some(i => i.id === id)) return;
  setInstrument(id);
  const tab = parseHash().id;
  try { sessionStorage.setItem(FADE, '1'); } catch { }
  document.documentElement.classList.add('fade-out');
  setTimeout(() => {
    if (tab) history.replaceState(null, '', '#' + tab);
    location.reload();
  }, 160);
}

export function mountSwitcher(host) {
  const cur = INSTRUMENTS.find(i => i.id === getInstrument()) || INSTRUMENTS[0];
  host.className = 'inst-switch';
  host.innerHTML = `<button id="inst-btn" aria-haspopup="true" aria-expanded="false" aria-controls="inst-menu" title="Change instrument">
      ${icon(cur.id)}<span>${cur.name}</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>
    <div class="inst-menu" id="inst-menu" role="menu" aria-label="Instrument" hidden>
      ${INSTRUMENTS.filter(i => i.ready).map(i => `<button role="menuitemradio" aria-checked="${i.id === cur.id}" data-inst="${i.id}">${icon(i.id)}<span>${i.name}</span>${i.id === cur.id ? '<b aria-hidden="true">✓</b>' : ''}</button>`).join('')}
    </div>`;
  const btn = host.querySelector('#inst-btn'), menu = host.querySelector('#inst-menu');
  const items = [...menu.querySelectorAll('[data-inst]')];
  const open = show => {
    menu.hidden = !show;
    btn.setAttribute('aria-expanded', show);
    if (show) (items.find(b => b.getAttribute('aria-checked') === 'true') || items[0]).focus();
  };
  btn.onclick = () => open(menu.hidden);
  menu.onclick = e => {
    const b = e.target.closest('[data-inst]'); if (!b) return;
    open(false);
    if (b.dataset.inst === cur.id) { btn.focus(); return; }
    btn.querySelector('span').textContent = INSTRUMENTS.find(i => i.id === b.dataset.inst).name;
    switchInstrument(b.dataset.inst);
  };
  menu.addEventListener('keydown', e => {
    const i = items.indexOf(document.activeElement);
    if (e.key === 'Escape') { open(false); btn.focus(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus(); }
  });
  document.addEventListener('pointerdown', e => { if (!menu.hidden && !host.contains(e.target)) open(false); });
}

// After a switch, fade the new instrument in.
export function fadeInAfterSwitch() {
  let was = false;
  try { was = sessionStorage.getItem(FADE) === '1'; sessionStorage.removeItem(FADE); } catch { }
  if (!was) return;
  // index.html already added .fade-in before the first paint; take it off to fade in.
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove('fade-in')));
}
