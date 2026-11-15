// Service worker: keeps a copy of the app's files so it opens offline.
// Network first: when online you always get the newest files (and the copy is
// refreshed); when offline the saved copy is used. Saved progress lives in
// localStorage and is never touched here.
const CACHE = 'fretboard-lab-v1';
const CORE = ['./', 'index.html', 'css/styles.css', 'js/app.js', 'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('fretboard-lab-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// The page sends every file it loaded (js/pwa.js), so all modules are saved
// without keeping a hand-written list here.
self.addEventListener('message', e => {
  if (e.data?.type !== 'cache') return;
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(e.data.urls.map(u => c.add(u).catch(() => {})))));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); e.waitUntil(caches.open(CACHE).then(c => c.put(req, copy))); }
    return res;
  }).catch(async () => (await caches.match(req, { ignoreSearch: true }))
    || (req.mode === 'navigate' ? (await caches.match('./')) || caches.match('index.html') : Response.error())));
});
