// Where lazily loaded instruments plug in. Guitar is built into the app; bass, piano
// and drums live in js/bass/, js/piano/ and js/drums/ and are only downloaded when
// that instrument is picked (js/app.js imports js/<id>/index.js before the first
// screen). Each one registers what it adds here, and the shared screens ask for it:
//
//   lessonAdapter   how the lesson player draws positions and turns taps into answers
//   fretboardPanel  extra tools on the Fretboard tab (bass presets, chord tones ...)
//   drills          extra Practice drills: [{ id, title, blurb, mount(el, params) -> cleanup }]
//   tools           extra Practice tools (same shape as js/practice/*.js)
//   playalong       the instrument's play-along library and player
//   instrumentTab   replaces the Fretboard tab (piano keyboard, drum kit)
//   progress        extra Progress sections: { html(), paint(el) }
//   review          extra review rounds: { askable(id), round(ui, id) }
//   placement       extra placement questions
//
// Nothing here imports app code, so any module may import it.
const parts = {};
export const register = (key, value) => { parts[key] = value; };
export const registered = key => parts[key];
export const registeredList = key => parts[key] || [];
export function registerMany(obj) { Object.entries(obj).forEach(([k, v]) => register(k, v)); }
