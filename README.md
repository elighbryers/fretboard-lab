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
js/theory.js          scale/chord catalog (degree formulas), spelling, tunings, helpers
js/audio.js           plucked string, drone, metronome (one AudioContext)
js/fretboard.js       the shared Fretboard component + the degree color rule
js/storage.js         saved progress in localStorage (versioned)
js/lesson-player.js   plays one lesson: Hear, Learn, See, Try, Play, Check
js/lessons/index.js   the six levels, in the research order
js/lessons/level1.js  Level 1 lessons as data
js/tabs/learn.js      Learn (home): path map, and the player at #learn?lesson=<id>
js/tabs/fretboard.js  free-play fretboard: picker, More options, saved setups
js/tabs/practice.js   Practice home: five cards, routes #practice?tool=<id>
js/practice/metronome.js   tempo, time signature, subdivisions, tap tempo
js/practice/timer.js       routines of timed blocks (+ the bar shown while one runs)
js/practice/drills.js      Note finder, Hear it find it, Interval trainer
js/practice/playalong.js   tab library and scrolling tab player
js/practice/log.js         practice log: grouped by week/day, add/edit/delete
js/playalong/*.js     play-along tabs as data (one file per tab, listed in index.js)
js/ui.js              shared volume sliders and small helpers
js/tabs/progress.js   at-a-glance tiles, charts, weak spots, drill/tab stats, badges, export/import
js/review.js          spaced review (Leitner boxes 1, 3, 7, 14, 30 days) and building today's session; pure logic
js/review-screen.js   the Daily review: the card on Learn, one question at a time, the end screen
js/stats.js           the Progress numbers, worked out from saved data (and badge rules)
js/charts.js          plain-SVG bar, line and calendar charts
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
js/storage.js, which updates the item's Leitner box from js/review.js:
quick and right = up a box (once a day), right but slow = same box,
wrong = box 1, due tomorrow. Today's session: due/overdue first, then weak
items, then up to 5 new items from finished lessons, capped at 20, with
confusable interval pairs next to each other. The session is saved after every
answer (`review` in storage), so Pause or a reload resumes it. Nothing due =
a bonus round of weak spots. On phones questions show a 6-fret window.
