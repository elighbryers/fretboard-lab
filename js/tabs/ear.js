// Ear Training tab: coming soon.
export default {
  id: 'ear',
  title: 'Ear Training',
  soon: true,
  icon: '<path d="M8 9a4 4 0 1 1 8 0c0 3-3 4-3 7a3 3 0 0 1-5 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',

  mount(section) {
    section.innerHTML = `
      <h2>Ear Training <span class="pill">Coming soon</span></h2>
      <p class="muted">Hear it, find it, play it: a drone sets the key, a note sounds, and you find it on the fretboard.</p>`;
  }
};
