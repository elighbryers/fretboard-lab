# Overnight report: bass, piano and drums

Branch: `instruments` (from `main` at f6d7ccd). This file is updated with every commit.

Note: the very first test push (before any work) was refused with HTTP 403 ("Claude doesn't have
GitHub access"), but pushes worked from the first real commit on, so every section was pushed.

## 1. Summary

(Filled in as work progresses; see the log below.)

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
