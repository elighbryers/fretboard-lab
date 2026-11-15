// Installable app and keeping progress safe:
// - registers the service worker (sw.js) so the app opens offline,
// - asks the browser to keep this site's storage (navigator.storage.persist),
// - on iPhone/iPad Safari (not installed), shows a small hint about adding the
//   app to the Home Screen: Safari deletes a site's saved data after 7 days of
//   use without a visit, but not for Home Screen apps. At most once a week.
const HINT_KEY = 'fretboard-lab:install-hint';  // ms when the hint was last shown
const WEEK = 7 * 86400000;
let persisted = null;  // true / false once known, null if the browser can't say

export const storagePersisted = () => persisted;

export const isStandalone = () => navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
// Safari on iPhone/iPad (iPadOS reports itself as a Mac with touch). Other iOS browsers say so in their name.
export function isIOSSafari(ua = navigator.userAgent) {
  const ios = /iP(hone|od|ad)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  return ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua);
}

function registerWorker() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready).then(reg => {
    const urls = [location.href.split('#')[0], ...performance.getEntriesByType('resource').map(r => r.name)]
      .filter(u => u.startsWith(location.origin));
    reg.active?.postMessage({ type: 'cache', urls: [...new Set(urls)] });
  }).catch(e => console.info('Offline copy not available:', e.message));
}

async function askToPersist() {
  try {
    if (!navigator.storage?.persist) return;
    persisted = (await navigator.storage.persisted()) || (await navigator.storage.persist());
  } catch { persisted = null; }
}

function installHint(host) {
  if (!isIOSSafari() || isStandalone()) return;
  let last = 0;
  try { last = +localStorage.getItem(HINT_KEY) || 0; } catch { }
  if (Date.now() - last < WEEK) return;
  try { localStorage.setItem(HINT_KEY, String(Date.now())); } catch { }
  host.innerHTML = `
    <div class="install-hint" role="note">
      <p><b>Add Fretboard Lab to your Home Screen so your progress is kept.</b>
        <span>Tap <span class="share-ico" aria-label="Share">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>
          Share, then <b>Add to Home Screen</b>.</span></p>
      <button class="icon" id="install-hint-close" aria-label="Dismiss">✕</button>
    </div>`;
  host.hidden = false;
  host.querySelector('#install-hint-close').onclick = () => { host.hidden = true; host.innerHTML = ''; };
}

export function setupPWA(hintHost) {
  registerWorker();
  askToPersist();
  installHint(hintHost);
}
