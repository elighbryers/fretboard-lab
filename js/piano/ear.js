// Ear Training on piano: the same tracks as guitar (scale degrees in a key first, then intervals,
// chord quality, progressions), answered on the keys. Each card opens a piano drill; the shared
// ear items (ear:, interval-ear:, chord-ear:) feed the same daily review.
const TRACKS = [
  ['Scale degrees in a key', 'A drone sets the key; tap the note you hear.', '#practice?tool=drills&drill=piano-hear'],
  ['Intervals', 'Hear two notes and name the distance, or find it on the keys.', '#practice?tool=drills&drill=piano-intervals'],
  ['Chord quality and inversions', 'Major or minor? Which inversion?', '#practice?tool=drills&drill=piano-chords'],
  ['Progressions by ear', 'Lesson 5.7 and the daily review play progressions to recognise.', '#learn?lesson=p5-7']
];
export default {
  id: 'ear', title: 'Ear Training',
  icon: '<path d="M8 15c0 3 2 5 4 5s3-1 3-3c0-3 4-4 4-9a7 7 0 0 0-14 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  mount(el) {
    el.innerHTML = `<h2>Ear Training</h2><p class="muted">Train your ear in a key, then answer on the keys. Everything you answer here also comes back in your daily review.</p>
      <div class="cards">${TRACKS.map(([t, b, h]) => `<a class="card-link" href="${h}"><span><b>${t}</b><small>${b}</small></span></a>`).join('')}</div>`;
  }
};
