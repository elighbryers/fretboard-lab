// Hash routes: #tab or #tab?key=value. Tabs read params when shown; links like
// #fretboard?key=G&scale=major open a tab preloaded.

export function parseHash(hash = location.hash) {
  const [id, qs = ''] = hash.replace(/^#\/?/, '').split('?');
  return { id: id || '', params: new URLSearchParams(qs) };
}

export function hashFor(id, params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString();
  return '#' + id + (qs ? '?' + qs : '');
}

export const go = (id, params) => { location.hash = hashFor(id, params); };

// Keep the address bar in sync with on-screen choices without adding history entries.
export const replaceParams = (id, params) => history.replaceState(null, '', hashFor(id, params));

// "Open in Fretboard": fretboardLink({ key: 'G', scale: 'major' }) or ({ key: 'A', chord: 'm7', labels: 'intervals' })
export const fretboardLink = params => hashFor('fretboard', params);
