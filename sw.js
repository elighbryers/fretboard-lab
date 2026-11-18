// Service worker: keeps a copy of the app's files so it opens offline.
// Network first: when online you always get the newest files (and the copy is
// refreshed); when offline the saved copy is used. Saved progress lives in
// localStorage and is never touched here.
//
// Two safeguards (a stale, cut-off module once left the app blank):
// - On a local dev address it does nothing and removes itself, so local edits
//   are never served from a saved copy.
// - It only saves a file when the whole body arrived (length matches the header),
//   and always asks the server whether its copy is current (cache: 'no-cache').
// Bump CACHE when the caching rules change; old copies are deleted on activate.
const CACHE = 'fretboard-lab-v3';
const CORE = ['./', 'index.html', 'css/styles.css', 'js/app.js', 'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
const LOCAL = /^(localhost|127\.|\[::1\]|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(location.hostname) || location.hostname.endsWith('.local');

self.addEventListener('install', e => {
  e.waitUntil((LOCAL ? Promise.resolve() : caches.open(CACHE).then(c => c.addAll(CORE))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('fretboard-lab-') && (LOCAL || k !== CACHE)).map(k => caches.delete(k)));
    if (LOCAL) {
      // Local development: step aside completely and reload open pages without us.
      await self.registration.unregister();
      (await self.clients.matchAll({ type: 'window' })).forEach(c => c.navigate(c.url));
      return;
    }
    await self.clients.claim();
  })());
});

// Save a response only if all of it arrived.
async function saveWhole(req, res) {
  const len = +res.headers.get('content-length');
  const body = await res.clone().arrayBuffer();
  if (len && body.byteLength !== len) return;
  await (await caches.open(CACHE)).put(req, res);
}

// The page sends every file it loaded (js/pwa.js), so all modules are saved
// without keeping a hand-written list here.
self.addEventListener('message', e => {
  if (LOCAL || e.data?.type !== 'cache') return;
  e.waitUntil(Promise.all(e.data.urls.map(u => fetch(u, { cache: 'no-cache' }).then(r => r.ok && saveWhole(u, r)).catch(() => {}))));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (LOCAL || req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => {
    if (res.ok) e.waitUntil(saveWhole(req, res.clone()));
    return res;
  }).catch(async () => (await caches.match(req, { ignoreSearch: true }))
    || (req.mode === 'navigate' ? (await caches.match('./')) || caches.match('index.html') : Response.error())));
});
