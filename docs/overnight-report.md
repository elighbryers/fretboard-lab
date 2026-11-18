# Overnight report: bass, piano and drums

Branch: `instruments` (from `main` at f6d7ccd). This file is updated with every commit.

Note: the very first test push (before any work) was refused with HTTP 403 ("Claude doesn't have
GitHub access"), but pushes worked from the first real commit on, so every section was pushed.

## 1. Summary

### Bass: done

All nine bass sections are built, tested and pushed:
1. **Instrument view:** 4-string (default), 5-string, drop D and 6-string tunings; frets 0–20 with a 0–12
   default view; all scales, labels, drone, heat map, left-handed and player's view, tap to hear. Bass tools
   on the Fretboard tab (More → Bass): one-finger-per-fret boxes (major, minor, both pentatonics, blues,
   Mixolydian, Dorian), chord tones (R 3 5 7), root-5th-octave, approach tones into a chord, and
   "line over chart" (a looping chart with drums; the neck shows the chord tones and flashes the next root
   on beat 4).
2. **Sound:** a Karplus-Strong pluck retuned for bass. **The Growlybass samples could not be downloaded**
   (see section 4), so the synth is the bass sound.
3. **Groove player:** in Practice → Metronome → Groove. Ten styles plus a 3/4 waltz, mute options, drop-out
   bars, a chord pad loop, separate volumes, a big beat display. Every bass Play step runs over it.
4. **Microphone:** optional, off by default (Progress → Settings), YIN with a 186 ms window, graded by note
   name in any octave, echo cancellation / noise suppression / auto gain off, always an "I played it"
   button, a weak-signal tip. Used in the Note finder, bass drills and lesson Play steps. Chord detection
   is an experimental, never-graded setting. MIDI input (shared piece D) is built and hidden where Web MIDI
   doesn't exist.
5. **Drills:** Note finder (E and A strings by default), Find the root, Hear the bassline and play it back,
   Lock to the kick (±60 → ±45 → ±30 ms, calibrated), Chord-tone spotter, Approach notes.
6. **Play-along:** 9 original bass lines (rock 8ths, root-5, Motown-style approach notes, funk octaves,
   reggae one-drop, walking blues, shuffle blues, and lines over Amazing Grace and When the Saints), with
   tab, chord symbols, optional bass clef (abcjs), drums, chord pad, Bass on/off, count-in, bar loop and
   +5 bpm per clean loop.
7. **Learn path:** all 6 levels from research-bass.md section E: 42 lessons, 6 challenges and 18 placement
   questions, with rhythm-grid cards and tasks and technique checklists. Shared lessons reuse the theory
   cards; every level has a "create" task. All validated against theory.js.
8. **Progress:** the heat map works per bass string and fret; a timing chart (bias and spread per session);
   four bass milestones including "First walking chorus" and "Locked within ±30 ms for 8 bars".
9. **Quality:** every bass lesson walked end to end in Chromium, every drill and play-along exercised, the
   daily review tested with bass items, guitar and bass switched back and forth with nothing mixed up.

### Piano: done

1. **Keyboard view:** ~44 px keys on touch screens (fitted to 26–44 px on desktop), a focus octave on phones in
   portrait, about 3 octaves in landscape, 61 keys on desktop (88 option), an 88-key mini-map, Middle C always
   marked, R/3/5 dots near the front of each key (outlined on black keys), grey-out outside the scale, W/H steps,
   finger numbers (RH above, LH below), a five-finger bracket, inversions side by side, I–IV–V–I voice leading
   (common tones stay, moving notes slide), an LH pattern menu, scale over chord, drone, heat map, and
   "show LH / RH / both" fingering. Multi-touch with Pointer Events and glissando.
2. **Sound:** smplr (MIT, vendored) with the Salamander Grand Piano 30-note MP3 subset (2.0 MB, CC BY 3.0,
   credited on Progress → About), self-hosted; the lesson range loads first, the rest in the background, and
   a synth piano plays until samples arrive.
3. **Input:** MIDI keyboards play into whichever on-screen keyboard is waiting for an answer; the mic answers
   single notes.
4. **Drills:** Key finder, Staff reader (landmarks first), Hear it find it over a drone, Interval trainer,
   Chords (build, quality by ear, which inversion), Key signatures.
5. **Practice tools:** tempo trainer (60% → +5% after 3 clean runs, −10% after a miss, goals logged),
   bar-snapped loops, hands separately/together, piano timer routines.
6. **Play-along:** one data format, four views (piano roll, falling notes, grand staff, chord chart), wait
   mode or keep going, 14 pieces (11 public-domain melodies arranged here, 3 original etudes).
7. **Learn path:** all 6 levels from research-piano.md section E (42 lessons, 6 challenges including timed
   key finding and triad building; placement asks about treble clef, bass clef and triads). Reading runs as a
   parallel track (lessons 1.7, 3.2, 3.6, 4.6 plus staff items in review).
8. **Review and progress:** piano items asked on the keys; keyboard and staff heat maps; pieces with clean
   tempo and hands; four piano milestones.
9. **Quality:** phone portrait/landscape and desktop, two-finger chords, slow sample loading, every lesson
   walked, pieces played in all views.

## 2. Commits

| Commit | What it did |
|---|---|

## 3. Assumptions and judgment calls

- **Baseline:** before any change, the lesson validator passed (4875 checks, 0 failed). There was no
  other test suite; I added `tests/` (node:test) and `tools/smoke.mjs` (headless Chromium: every tab
  for every instrument, fails on any console error, empty screen or sideways page scroll), and
  `tools/test-all.sh` to run all three.
- **Instrument code is lazy-loaded** from `js/bass/`, `js/piano/`, `js/drums/` by `js/app.js` before
  the first screen, and plugs into the shared screens through `js/registry.js`. Guitar users download
  none of it. Switching instruments already reloaded the page, so modules can pick their neck at load.
- **The neck free-play helpers use the current instrument's tuning** (`setDefaultTuning` in
  `theory.js`). Lesson code always passes its own tuning, so the guitar lessons are untouched (the
  validator's byte-for-byte snapshot still matches).
- **Bass string numbers in review items:** `note:G@s4` means G on the E string on every bass. On a
  6-string bass (B E A D G C) the usual numbering would make string 4 the A string, so item numbers
  are shifted by one there (C = 0, G = 1 ... B = 5). Lessons written for 4-string bass are shown on a
  5-string, 6-string or drop-D neck by moving each position to the same string at the same pitch
  (drop D: frets on the low string move up 2).
- **Storage version 5:** each instrument part gains `tuning` (null = default) and `timing` (timing
  sessions for the chart). The migration only adds these fields. New per-instrument item prefixes:
  `key:` (piano keys), `staff:`, `fingering:`, `sticking:`. Tested on a realistic version-1 profile and
  a version-4 export (`tests/storage.test.mjs`).
- **Drill options are remembered per instrument** (guitar keeps its old saved options).

## 4. Skipped or changed, and why

## 5. Test results

## 6. Hand-test checklist

## 7. Things for you to decide
