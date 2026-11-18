// Ear Training on drums: rhythm dictation and groove recognition (docs/research-drums.md D8).
const TRACKS = [
  ['Hear it, tap it back', 'The app plays a bar; tap the rhythm back on the pads.', '#practice?tool=drills&drill=drum-ear'],
  ['Grooves and feels by ear', 'Straight, swung or triplets; which style? Lessons 4.7 and 6.4, plus the daily review.', '#learn?lesson=d4-7'],
  ['Internal time', 'Keep the pulse when the click drops out.', '#practice?tool=drills&drill=drum-time']
];
export default {
  id: 'ear', title: 'Ear Training',
  icon: '<path d="M8 15c0 3 2 5 4 5s3-1 3-3c0-3 4-4 4-9a7 7 0 0 0-14 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  mount(el) {
    el.innerHTML = `<h2>Ear Training</h2><p class="muted">For drummers, ear training is rhythm: hear it, count it, play it back. Your answers come back in the daily review.</p>
      <div class="cards">${TRACKS.map(([t, b, h]) => `<a class="card-link" href="${h}"><span><b>${t}</b><small>${b}</small></span></a>`).join('')}</div>`;
  }
};
