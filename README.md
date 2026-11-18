# fretboard-lab

A web app for learning music theory on guitar, bass, piano and drums. Plain HTML, CSS and
ES modules: no framework and no build step. Vercel (or any static host) serves the
files as they are.

Product direction lives in [docs/research-findings.md](docs/research-findings.md).

## Running it locally

ES modules don't load from `file://`, so serve the folder:

```
python3 tools/serve.py 8000
```

Then open http://localhost:8000 (or http://<your Wi-Fi address>:8000 on a phone).
`tools/serve.py` is `python3 -m http.server` plus `Cache-Control: no-store`, so the
browser never keeps an old or half-saved file. On local addresses the service
worker removes itself and its saved copy. If the app ever fails to start, the
page shows "Reload fresh", which re-downloads every file.

**Keep the project out of an iCloud-optimised folder.** Desktop and Documents
synced with iCloud ("Optimize Mac Storage") can hand programs a partly
downloaded file when the disk is nearly full, which breaks a module and leaves
the app blank.

## How the files fit together

```
index.html            page shell: header, tab bar, empty #views, loads js/app.js
manifest.json         installable web app: name, icons, dark theme color, standalone
sw.js                 service worker: network first, saved copy when offline (cache fretboard-lab-v1)
icons/                app icon (icon.svg) and its PNG sizes (180 Apple, 192, 512 incl. maskable)
js/pwa.js             registers sw.js, asks for persistent storage, iPhone "Add to Home Screen" hint
css/styles.css        all styles, including the --deg-* degree colors
js/app.js             builds the tab bar, routes #hash -> tab, sound on/off
js/router.js          hash helpers: parseHash, go, replaceParams, fretboardLink
js/theory.js          scale/chord catalog (degree formulas), spelling, tunings, helpers
js/audio.js           plucked string, strummed chords, drone, metronome, backing track (one AudioContext)
js/sound.js           one way to describe a short sound (notes, chords, drone) for lessons, review, placement
js/progressions.js    Roman numerals -> chords in a key (I-V-vi-IV, ii-V-I, the 12-bar blues)
js/fretboard.js       the shared Fretboard component + the degree color rule
js/storage.js         saved progress in localStorage (versioned): shared parts + one part per instrument
js/instruments.js     each instrument's string numbering and tunings (guitar, bass 4/5/6-string, drop D; piano, drums)
js/lesson-player.js   plays one lesson: Hear, Learn, See, Try, Play, Check (challenges: any order, plus a timed step)
js/lessons/index.js   the six levels, in the research order
js/lessons/kit.js     helpers for writing lessons: makeKit(instrument) gives positions in that neck's numbering
js/lessons/cards.js   shared theory cards: Learn-card text + music as notes and degrees, placed by each instrument
js/lessons/level1-6.js  each level's 7 lessons, its challenge and 3 placement questions, as data
js/path.js            which levels and lessons are open; what's next
js/placement.js       the placement quiz (#learn?placement=1)
js/tabs/learn.js      Learn (home): review card, path map, and the player at #learn?lesson=<id>
js/tabs/fretboard.js  free-play fretboard: picker, More options, saved setups
js/tabs/practice.js   Practice home: five cards, routes #practice?tool=<id>
js/practice/metronome.js   tempo, time signature, subdivisions, tap tempo
js/practice/timer.js       routines of timed blocks (+ the bar shown while one runs)
js/practice/drills.js      Note finder, Hear it find it, Interval trainer
js/practice/playalong.js   tab library and scrolling tab player
js/practice/log.js         practice log: grouped by week/day, add/edit/delete
js/practice/rhythm.js      Rhythm: tap along, early/late and spread, calibration
js/playalong/*.js     play-along tabs as data (one file per tab, listed in index.js)
js/ui.js              shared volume sliders and small helpers
js/tabs/progress.js   at-a-glance tiles, charts, weak spots, drill/tab stats, badges, export/import
js/review.js          spaced review (FSRS for facts, Leitner boxes for chord shapes and rhythms) and today's session; pure logic
js/vendor/ts-fsrs.js  ts-fsrs 5.4.2 (MIT), unmodified, so FSRS loads without a build step or a CDN
tools/validate-lessons.mjs   lesson validator: node tools/validate-lessons.mjs (see Lessons below)
js/review-screen.js   the Daily review: the card on Learn, one question at a time, the end screen
js/stats.js           the Progress numbers, worked out from saved data (and badge rules)
js/charts.js          plain-SVG bar, line and calendar charts
js/tabs/ear.js        Ear Training tab: five tracks, 10-question sessions, adaptive levels
js/ear.js             ear-training questions (degrees, intervals, chords, bass motion, dictation), shared with the review
js/skills.js          Hands & rhythm strands: chord shapes, one-minute changes, technique, rhythms, barre goal
js/speed.js           speed trainer (up after 3 clean runs, down after a miss)
js/timing.js          timing engine: taps vs beats on the audio clock, windows, calibration maths (pure)
js/timing-ui.js       tap pad, per-device calibration screen, window setting
js/rhythm.js          rhythm patterns and the SVG rhythm line
js/plan.js            "When will you practise?" plan
js/pwa.js, sw.js      installable app, offline copy, persistent storage, iPhone hint
```

The dependencies only go downwards. Tabs use the engines (`fretboard`, `audio`,
`theory`, `storage`, `router`), and the engines never import from tabs.
`theory.js` imports nothing.

**Adding a tab:** create `js/tabs/<id>.js` exporting
`{ id, title, icon, mount(section), show(params), hide() }`, then add it to `TABS`
in `js/app.js`. `mount` runs once. `show` runs on every visit with the hash's
query params, for example `#fretboard?key=G&scale=major`.

**Lessons are content, not code.** Each lesson is an object in
`js/lessons/levelN.js`. The shape of every step is documented at the top of
`level1.js`. Guitar positions use guitar numbering (string 6 = low E, fret 0 = open);
each instrument has its own numbering in `js/instruments.js` (on bass, string 4 is the low E).
Write labels and answers with `js/lessons/kit.js` (`inKey('G', 'scale', 'major').dot(6, 3)`,
`.spots('3')`, `above(root, 4)`; a bass lesson uses `makeKit('bass')`): a dot that isn't in
its key throws when the file loads, so text and neck can't disagree.

**Theory cards.** A Learn card whose idea is the same on every instrument lives in
`js/lessons/cards.js` as text plus its music (a key + scale or chord and the degrees or
notes it shows). A guitar lesson places it with `card('l3-1.1', { view, dots })`, which
checks every dot against the card's music; bass and piano lessons can reuse the same card
(`autoPlace(id, makeKit('bass'))`, `cardNotes(id)`). Cards about guitar geometry ("one string
up, one fret back") stay in the guitar lesson. Positions only appear in an instrument's
own See, Try and Play steps (and its tap questions).

**Lesson validator.** `node tools/validate-lessons.mjs` (or `... 3 4` for some levels) checks
every lesson (positions, prompts that name the right string, counts, review items), every
theory card (used, instrument-free, places on a 4- and 5-string bass), each instrument's
string numbering, and that the guitar lessons match `tools/guitar-lessons.snapshot.json`
byte for byte. After changing a lesson on purpose, run it with `--update-snapshot`. Lessons unlock in order: passing Check it (3 of 4)
unlocks the next one, and passing a Level Challenge opens the next level. The
placement quiz asks 3 questions per level and opens the first level you miss
(2 of 3 needed to move on). Each lesson's `review` ids, plus its tasks and
questions, feed the Daily review.

**Routes:** `#learn` (home), `#learn?lesson=l1-1`, `#fretboard`, `#practice`, `#progress`, `#ear`, `#learn?review=1` (today's review), `#practice?tool=drills&drill=review&items=note:G%23@s5,interval-ear:m3` (weak-spot review, 10 rounds).
`#fretboard` accepts `key` (G, F#, Bb…), `scale` or `chord` (ids in the
`theory.js` catalog), `labels` (`notes`, `intervals` or `none`) and `pos` (e.g. `5-8`). Use
`fretboardLink({ key, scale })` to build an "Open in Fretboard" link.

**Fretboard component:** `new Fretboard(el, options)`. It supports a fret range
(`view`), dimming everything except the focus (`focus`), labels, left-handed and
player's-view flips (`leftHanded`, `playerView`), quiet background dots, `show`,
`tap` and `sequence` modes, right/wrong marks, a heat map and `playSequence` (each dot
lights as it sounds). The usage example is at the top of `js/fretboard.js`.

**Colors:** every color is a CSS variable at the top of `css/styles.css`. The
palette is baby blue, baby pink and white, with deeper shades wherever text or
dots need contrast. The fretboard color code is `--deg-root` (deep pink),
`--deg-third` (deep blue), `--deg-fifth` (purple) and `--deg-other` (light grey).
`parseFormula` in `js/theory.js` decides which degree gets which role (Altered's
#2 is not a 3rd; a diminished chord's b5 is its 5th).

**Scales and chords:** `SCALE_GROUPS` and `CHORD_GROUPS` in `js/theory.js` hold
every formula as degree names ("1 2 b3 #4 9"), so labels read #4, b5 or 9 rather
than a semitone guess. `spell(key, formula)` writes the notes for the key: one
letter per degree, Db rather than C# when that needs fewer accidentals. To add a
scale, add one line to a group.

**Saved data:** a single localStorage key, `fretboard-lab`, with a `version`
field. The full shape is documented at the top of `js/storage.js`. If you change
the shape, bump `VERSION` and add a migration to `MIGRATIONS`. Quiz answers are
saved as review items such as `note:G@s5` (G on string 5).

**Per instrument.** `instrument` says which instrument is being learned (Progress →
Settings). Each instrument keeps its own lessons, position items (`note:`, `chordshape:`;
they feed the heat map), placement, clean tempos, goals and today's review under
`instruments[id]`. Theory items (facts, degrees, intervals, chord tones, ear training,
rhythms), the log (each entry tagged with its `instrument`), practice days, the streak and
badges are shared. `getLesson`, `recordAnswer`, `allItems` and the rest read and write the
right part on their own.

## Bass, piano and drums

Each instrument besides guitar lives in its own folder and is downloaded only when it is picked
(Progress → Settings → Instrument). `js/app.js` imports `js/<instrument>/index.js` before the first
screen; that file registers what the instrument adds through `js/registry.js`:

```
js/registry.js         where instrument code plugs into the shared screens (lessonAdapter, instrumentTab,
                       tools, drills, review rounds, progress sections, badges, routines, step types, earTab)
js/groove.js           the groove player engine: original drum patterns, mutes, drop-out bars, chord pad
js/drumkit.js          the synthesized drum kit (no downloads); a recorded kit can take over (useSamples)
js/sound-library.js    the Sound choice per instrument: synth or a sample set, loaded only when picked
js/sound-sets.js       the list of sets in sounds/ (written by tools/sounds/build.py)
js/switcher.js         the instrument switcher in the header (and Settings): reloads on the same tab
js/practice/groove-ui.js  the Groove mode of the Metronome
js/pitch.js, js/mic.js the optional microphone: YIN pitch detection, any-octave grading, "I played it"
js/midi.js             optional Web MIDI (keyboards, e-kits), hidden where unsupported
js/notation.js         abcjs (vendored, MIT) loaded on demand: bass clef, grand staff, drum staff
js/rhythm-grid.js      the one-bar step grid (bass rhythm cards, drum grids)
js/lesson-extras.js    rhythm-grid cards and tasks, technique cards with drawings, roots-on-the-kick step
js/timing-progress.js  the timing chart on Progress (bias and spread per session)
js/bass/               neck tools, bass sound, drills, play-alongs (tabs/), lessons/ (6 levels), review, progress
js/piano/              keyboard view and Keyboard tab, sampler (Salamander, sounds/piano), drills, tempo trainer,
                       pieces and the four-view play-along, lessons/ (6 levels), review, progress, ear page
js/drums/              Kit tab (pads, grid, notation), scoring, drills, songs and play-along, lessons/, review
```

Lessons for every instrument use the same lesson shape and player. Positions are each
instrument's own: bass `{ string, fret }` with string 4 = low E, piano keys `{ string: 0, fret: midi }`,
drum pads `{ string: 0, fret: index in js/drums/kit.js }`. Write them with each instrument's
`lessons/kit.js`. `node tools/validate-lessons.mjs` checks every instrument's lessons and play-alongs
against `theory.js`. Saved data is version 5 (per-instrument `tuning`, `timing`, `mic`).

**Piano on a phone held sideways** (`js/piano/keyboard.js` `full88`, `js/piano/playalong.js`): all 88 keys
across the width, pinch or ctrl+wheel to zoom, two fingers to drag; tap tasks zoom to their keys (about 44 px).
Play-along fills the screen: the grand staff on one line with the current bar highlighted, falling-note bars
(length = note length, name inside) and keys that light in their note's color. Color by hand (LH blue, RH
green) or by chord tone; Menu brings back the header and controls. Upright phones get two stacked rows for
two-hand pieces (RH on top, LH below) and a "turn your phone sideways" tip.

**Sounds** (`sounds/<instrument>/<id>/`): each set has `set.json` (files and their real pitch), mono 96 kbps
MP3s and `LICENSE.txt`. They are made from raw SFZ libraries kept outside the repo (`~/sound-samples`) by
`python3 tools/sounds/build.py [id ...]` (needs macOS `afconvert`, `lame` and Python 3.9–3.12). Only CC0 or
public-domain libraries are used; add a set to `SETS` in that file. One sample every 3 semitones (2 velocity
layers for bass, 1 for piano), drums one soft and one hard hit per kit piece. Never commit the raw WAV/FLAC.

**Tests:** `tools/test-all.sh` runs the validator, `node --test tests/*.test.mjs` and
`tools/smoke.mjs` twice, upright (390 x 844) and sideways (`--landscape`, 844 x 390): every tab for every
instrument in headless Chromium; extra screens in `tools/smoke-routes.mjs`. Playwright isn't a project
dependency: install it anywhere and point `NODE_PATH` at its `node_modules`.

**Credits:** abcjs and smplr (MIT), ts-fsrs (MIT), Salamander Grand Piano by Alexander Holm (CC BY 3.0),
listed on Progress → About and in `js/vendor/README.md`. The CC0 and public-domain sound sets (Karoryfer
Samples, Versilian Studios VSCO 2 CE, AKAI's Splendid Grand) are listed on Progress → About too.

## Play-along tabs

Each tab is a file in `js/playalong/` with no code, only data, and is listed in
`js/playalong/index.js`:

```js
export default {
  id: 'ode-to-joy',                 // used in links: #practice?tool=playalong&tab=ode-to-joy
  title: 'Ode to Joy',
  source: 'Beethoven, public domain',
  bpm: 100,                         // original tempo (quarter notes per minute)
  time: [4, 4],                     // beats per bar, beat unit (3/4, 6/8 also work)
  difficulty: 'easy',               // 'easy' | 'medium' (library filter)
  notes: [
    [4, 2, 1],                      // [string, fret, beats]: string 6 = low E ... 1 = high e
    [4, 2, 1.5], [4, 0, .5],        // beats in quarter notes: 1 = quarter, .5 = eighth, 2/3 + 1/3 = shuffle
    [0, 0, 2]                       // string 0 = rest
  ]
};
```

Rules: single notes only, each bar's beats must add up to the time signature, and
only original material or public-domain melodies.

## Practice timer test hook

`#practice?tool=timer&speed=60` runs routines 60 times faster. It's meant for
testing a whole routine in seconds, and normal links never include it.


## Progress data

Drill, lesson and play-along log entries carry numbers as well as text
(`drill, score, total` / `lesson, score, total` / `tab, pct, bpm`); older
text-only entries are read back by js/stats.js. Interval mix-ups are counted in
`confusions` by semitones (`'3-4'` = minor/major 3rd). Export writes
`{ app: 'fretboard-lab', exportedAt, data }`; import can merge (keep the higher
or newer value of each) or replace.

## Daily review

Every answer (lessons, drills, the review) goes through `recordAnswer` in
js/storage.js, which updates the item's schedule from js/review.js.
Fact-like items (notes, intervals, degrees, chord tones, facts, ear training) use
FSRS with default parameters: wrong = Again (back tomorrow), right but slow = Hard,
right and quick = Good; only the first answer of a day counts (plus a first miss).
Chord shapes and rhythms keep Leitner boxes: quick and right = up a box (once a day),
right but slow = same box, wrong = box 1, due tomorrow. Version 4 of the saved data
moved older box items to FSRS keeping each due day (box n = a starting stability of
1, 3, 7, 14 or 30 days). Today's session: due/overdue first, then weak
items, then up to 5 new items from finished lessons, capped at 20, with
confusable interval pairs next to each other. The session is saved after every
answer (`review` in storage), so Pause or a reload resumes it. Nothing due =
a bonus round of weak spots. On phones questions show a 6-fret window.

## Keeping progress safe

Progress lives in localStorage, and iPhone Safari deletes a site's storage after
7 days of Safari use without a visit, unless the app was added to the Home Screen.
So the app is installable (manifest.json, sw.js) and opens offline, calls
`navigator.storage.persist()` on load, shows iPhone Safari users a dismissible
"Add to Home Screen" hint at most once a week (`fretboard-lab:install-hint`
holds when it was last shown), and the Progress tab shows "Last export" with a
gentle reminder after 2 weeks. The service worker caches whatever the page
loads, so new files need no list; it is network first, so changes show up on
the next load. The service worker only runs on https or localhost, not on a
plain-http LAN address.

Colors: every colored dot carries a label (interval, note name, or its own
label), so color is never the only clue; the "Dots" label mode on the Fretboard
tab switches to neutral dots with the root outlined. Text colors that must pass
contrast use `--bad-text` and `--grey-text`; `--bad` and `--deg-other` are for fills.

## Practice science in the app

- **Clean tempo:** every Play step, play-along tab and technique item is an
  exercise with a highest clean bpm (`tempos` in storage). It starts a little
  below that next time; the speed trainer goes up a step after 3 clean runs in
  a row and down a step after "Missed it". One-minute chord changes are stored
  the same way with `unit: 'changes'`.
- **Kinder streak:** one missed day per week (Monday to Sunday) is a rest day
  and doesn't break the streak. The headline is practice days this week.
- **Timing:** `js/timing.js` scores taps on the Web Audio clock (tap times come
  through `getOutputTimestamp`), with Easy ±60, Normal ±40 and Strict ±25 ms,
  and reports lean (early/late) separately from spread. Calibration (listen to
  4 clicks, tap 8) is stored per output device and always optional.
- **Ear training:** five tracks in `js/ear.js` (scale degrees in a key with a
  drone and cadence, intervals in melodies, chord quality by tapping the 3rd,
  5th or 7th, bass motion, dictation of public-domain tunes). Levels move up
  at 80% over the last 20 answers and down after 10 answers under 50%. The
  same question functions serve the daily review (`ear:`, `interval-ear:`,
  `chord-ear:`, `bass:`, `dictation:` items).
- **Lesson data version 2:** lessons moved (see Step 2 in the git log); the
  storage migration carries old progress over.
