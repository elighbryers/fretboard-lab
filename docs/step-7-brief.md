# Step 7 brief: groundwork for multiple instruments

Saved for later. Order agreed on 2026-11-15: finish Steps 2–5, stop for the
Supabase setup (Step 6), build Step 6, then do this step.

---

Read CLAUDE.md, docs/research-master-plan.md (sections 1 and 4) and
docs/research-bass.md (section D) first.

Build Step 7 of the master plan: the groundwork for multiple instruments.
Nothing should look different to a guitar user when this is done, and no
saved progress may be lost. Work in the order below, test each part, and
make a local git commit after each one. Don't push until I say so.

## 1. Progress per instrument (storage)

- Add a top-level "instrument" setting (default "guitar") to the stored
  profile, with a version bump and a migration so existing data moves over
  safely.
- Keep these per instrument:
  - lesson progress
  - position items (e.g. "G on string 5")
  - heat map
  - placement results
  - clean-tempo records
- Keep these shared and app-wide:
  - theory items (facts, scale degrees, intervals, chord spellings, ear training)
  - streak
  - practice days
  - the practice log
- Add an "instrument" field to every practice log entry.
- Update export/import merge and the Supabase sync so they handle the new
  shape, including merging old exports.
- Test the migration on a copy of realistic old data and confirm nothing is
  lost.

## 2. Instrument switch (UI)

- Add an instrument picker in settings: Guitar (active), Bass, Piano and
  Drums shown as "coming soon".
- Switching instruments changes which progress, heat map and lessons are
  shown; shared stats stay the same.

## 3. Lessons in note and degree terms (theory-card refactor)

- Today lesson positions are written in guitar string numbers (6 = low E),
  which clash with bass (string 4 = low E). Refactor so theory content
  (Learn cards, review items, ear questions) is stored as notes, degrees
  and intervals, and each instrument's view places them on its own neck or
  keys.
- Give each instrument its own string numbering and tunings; keep
  { string, fret } positions only inside instrument-specific steps (See,
  Try, Play).
- Build a shared "theory card" library that guitar lessons now pull from,
  so bass and piano lessons can reuse the same cards later.
- Extend the automated lesson validator so every lesson still checks out
  after the refactor. Every existing guitar lesson must work exactly as
  before.

## 4. FSRS for fact items (review scheduler)

- Add ts-fsrs (MIT licence, loadable without a build step) and use it with
  default parameters for fact-like items:
  - notes
  - intervals
  - chord spellings
  - scale degrees
  - ear training
- Keep playing skills (rhythm, chord changes, speed exercises) on the
  clean-tempo ladder instead.
- Migrate existing Leitner review data into FSRS so nobody loses their
  review history (map each box to a sensible starting stability).
- The daily review should look and feel the same to the user.

## 5. Quality

- Run every lesson, drill, the daily review and the ear training tab end to
  end on guitar.
- Test switching instruments back and forth with no data mixed up.
- Test export, import and sync with old and new data.
- Tell me what changed behind the scenes and what to check by hand.
