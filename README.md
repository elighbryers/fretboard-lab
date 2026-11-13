# fretboard-lab

A web app for learning music theory on the guitar fretboard. Plain HTML, CSS and
ES modules: no framework and no build step. Vercel (or any static host) serves the
files as they are.

Product direction lives in [docs/research-findings.md](docs/research-findings.md).

## Running it locally

ES modules don't load from `file://`, so serve the folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## How the files fit together

```
index.html            page shell: header, tab bar, empty #views, loads js/app.js
css/styles.css        all styles, including the --deg-* degree colors
js/app.js             builds the tab bar, routes #hash -> tab, sound on/off
js/router.js          hash helpers: parseHash, go, replaceParams, fretboardLink
js/theory.js          notes, intervals, scale/chord formulas, tunings, helpers
js/audio.js           plucked string, drone, metronome (one AudioContext)
js/fretboard.js       the shared Fretboard component + the degree color rule
js/storage.js         saved progress in localStorage (versioned)
js/lesson-player.js   plays one lesson: Hear, Learn, See, Try, Play, Check
js/lessons/index.js   the six levels, in the research order
js/lessons/level1.js  Level 1 lessons as data
js/tabs/learn.js      Learn (home): path map, and the player at #learn?lesson=<id>
js/tabs/fretboard.js  free-play fretboard (was "Explore")
js/tabs/practice.js   note quiz + metronome and drone
js/tabs/progress.js   streak, accuracy, heat map, practice log
js/tabs/ear.js        Ear Training: coming soon
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
`level1.js`. Positions use guitar numbering (string 6 = low E, fret 0 = open). A
lesson without `steps` shows as "coming soon". Lessons unlock in order: passing
Check it (3 of 4 by default) unlocks the next one.

**Routes:** `#learn` (home), `#learn?lesson=l1-1`, `#fretboard`, `#practice`, `#progress`, `#ear`.
`#fretboard` accepts `key` (G, F#, Bb…), `scale` or `chord` (slugs listed in
`theory.js`), and `labels` (`notes`, `intervals` or `none`). Use
`fretboardLink({ key, scale })` to build an "Open in Fretboard" link.

**Fretboard component:** `new Fretboard(el, options)`. It supports a fret range
(`view`), dimming everything except the focus (`focus`), labels, `show`, `tap`
and `sequence` modes, right/wrong marks, a heat map and `playSequence` (each dot
lights as it sounds). The usage example is at the top of `js/fretboard.js`.

**Colors:** the root is always the same color, both 3rds share another, and the
5th has its own. Everything else is neutral. Roles are assigned in `ROLES` in
`js/fretboard.js`, and the colors are the `--deg-*` variables in
`css/styles.css`.

**Saved data:** a single localStorage key, `fretboard-lab`, with a `version`
field. The full shape is documented at the top of `js/storage.js`. If you change
the shape, bump `VERSION` and add a migration to `MIGRATIONS`. Quiz answers are
saved as review items such as `note:G@s5` (G on string 5).
