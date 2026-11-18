# Overnight report: bass, piano and drums

Branch: `instruments` (from `main` at f6d7ccd). 44 commits, 146 files changed. Pull request into `main` is open and not merged.

Note: the very first test push (before any work) was refused with HTTP 403 ("Claude doesn't have
GitHub access"), but pushes worked from the first real commit on, so every section was pushed as it
was finished. The session paused once at your request and resumed at 6:50 am Pacific.

## 1. Summary

| | Done | Partly done | Not done |
|---|---|---|---|
| **Shared pieces** | Groove player (A), microphone (B), notation with abcjs (C), MIDI input (D), registry for lazy-loaded instruments, storage v5 | Polyphonic mic detection is experimental and only shown on the piano Keyboard tab (never graded) | — |
| **Bass** | Sections 1–9 | Sound: synth only (samples blocked) | Optional half-step-down tuning |
| **Piano** | Sections 1–9 | Fingering for the 7 keys I could verify only | Stacked two-row keyboard (LH below, RH above) for two-hand material on phones in portrait: lessons use one scrolling row |
| **Drums** | Sections 1–8 | Sound: synth only (samples blocked); drills from research D3 that are only in lessons/review, not as separate drills: "which grid did you hear", subdivision by ear, fill spotter | Notation "hands up / feet down" stem toggle (all stems up); custom e-kit note remapping (General MIDI map only) |

Guitar works as before: the guitar lessons are byte-for-byte unchanged (validator snapshot), every guitar
screen passes the headless check, and the guitar lessons were walked end to end again at the end.

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

### Drums: done

1. **Views:** a Kit tab with tap pads (kick, snare, cross-stick, hi-hat closed/open/pedal, three toms, ride,
   crash), limb labels on every pad (R, L, RF, LF, never colour alone), keyboard keys, e-kit MIDI, a left-handed
   mirror; a step grid linked to drum notation (kick bottom space, snare third space, x noteheads for cymbals,
   hi-hat foot below) with one playhead through both and a legend.
2. **Sound:** synthesized kit (CC0 samples blocked, see section 4).
3. **Timing scoring:** Easy ±50/±25, Normal ±35/±18, Strict ±25/±12 ms, capped below half the gap between
   notes; a hit must be on the right drum; bias reported separately from spread; per-device calibration plus a
   separate MIDI calibration; never fails a lesson. The mic is not used for drums.
4. **Drills:** Read it tap it, Hear it tap it back, Stickings and rudiments (singles, doubles, paradiddle,
   flam, flam tap, drag, 5- and 9-stroke rolls on R/L pads), Internal time (gap click, fading click, tempo
   ladder, with the silent bars scored separately).
5. **Practice and play-along:** rudiment and warm-up routines in the timer; six original charts (rock with
   fills, ghost-note funk, half-time, 12-bar shuffle, 6/8, a little song form) as grid + notation with a
   playhead, form markers, a drumless backing, app drums on/off, optional scoring, bar loops.
6. **Learn path:** all 6 levels from research-drums.md section E (42 lessons, 6 challenges, 18 placement
   questions on rhythm reading and coordination). Rhythm, meter and form lessons are written without kit
   geometry so they could be shared; there were no rhythm cards in the shared card library to reuse.
7. **Review and progress:** drum names and staff positions on the pads, counting, stickings, grooves and
   feels by ear in the daily review; timing chart; a per-sixteenth rush/drag map; best clean tempos; five
   drum milestones; a drums Ear Training page.
8. **Quality:** the same +20 ms tap offset scores as +20 ms at 60 and 120 bpm; grid and notation in step;
   every drum lesson walked end to end; no console errors.

### Final checks

Switching between all four instruments keeps lessons, positions, tunings, timing and mic stats apart
while theory items stay shared (unit test plus browser checks); export/import works with a version-1
profile, a version-4 export and a version-5 round trip; the app starts offline for all four instruments
after one online visit (tested with a real service worker over HTTPS); no console errors on any of the 76
screens the headless check opens.

## 2. Commits

| Commit | What it did |
|---|---|
| `ccc4052` | Bass 1: instrument view, per-instrument tuning, lazy-loaded instrument code |
| `e8f0b82` | Bass 2: bass sound (Karplus-Strong retuned for bass) |
| `7d35f43` | Bass 3: groove player |
| `fde7cc6` | Bass 4: optional microphone (YIN), MIDI input module |
| `9e453aa` | Bass 5: bass drills |
| `e0214e8` | Bass 6: bass play-along and notation (abcjs) |
| `e527aa6` | Bass 7, Level 1: the neck, the pulse and your hands |
| `28efba9` | Bass 7, Level 2: roots and rhythm (7 lessons, challenge, placement; validator-checked) |
| `bd37c18` | Bass 7, Level 3: major scale, keys and the pentatonic (shared theory cards on the bass neck; validator-checked) |
| `b8db0e5` | Bass 7, Level 4: intervals and chord tones (interval shapes, 3rds, triads, arpeggios and 10ths, 7ths, chords of a key, hearing chord tones; validator now als… |
| `53d954b` | Bass 7, Level 5: progressions and connecting chords (numerals, 12-bar shuffle, I-V-vi-IV, chromatic/dominant/scale approaches, progressions by ear, song form) |
| `16e9061` | Bass 7, Level 6: groove and walking — the bass path is complete (6 levels, 42 lessons, 6 challenges, 18 placement questions incl. rhythm reading) |
| `fc52782` | Bass 8: progress — timing chart (bias and spread per session), bass milestones; shared timing section and instrument badges via the registry |
| `20cf74d` | Bass 9: quality — bass review rounds (chord tones by ear, rhythms), item names, end-to-end checks |
| `f67b4fe` | Piano 1: keyboard view and Keyboard tab |
| `1aceb78` | Piano 2: piano sound — Salamander Grand Piano (CC BY 3.0) 30-note MP3 subset with smplr (MIT) |
| `d7ed718` | Piano 3: MIDI keyboard input (routes to the on-screen keyboard waiting for an answer, with event timing); mic single notes via the shared mic module |
| `17ec03d` | Piano 4 (in progress): piano drills — key finder, staff reader, hear it find it, intervals, chords, key signatures |
| `e8e823b` | Piano 4: piano drills checked end to end (taps, MIDI routed into the key finder, staff and key-signature notation) |
| `a414768` | Piano 5: practice tools — tempo trainer (60% start, +5% after 3 clean runs, -10% after a miss, goals logged), piano and bass timer routines |
| `632dc81` | Piano 6: piano play-along — one data format, piano roll / falling notes / grand staff / chord chart |
| `5b57e0c` | Piano 7, Level 1: the keyboard and note names (7 lessons, timed key-finding challenge, placement) |
| `6dc2640` | Piano 7, Level 2: the major scale and keys (validator-checked, walked end to end) |
| `606958b` | Piano 7, Level 3: intervals and both hands (reading 2: steps and skips; bass clef and grand staff; hearing intervals over a drone) |
| `3a83cdb` | Piano 7, Level 4: chords, inversions and voice leading (reading 3: lead sheets; timed triad-building challenge) |
| `b739c29` | Piano 7, Level 5: progressions and accompaniment (numerals, boogie blues, voice-led I-V-vi-IV, ii-V-I shells, cadences, Alberti and pedal, progressions by ear) |
| `5e758a3` | Piano 7, Level 6: improvising and lead-sheet playing — the piano path is complete (6 levels, 42 lessons, challenges, placement incl. treble/bass clef and tri… |
| `f6d798f` | Piano 8: piano review and progress |
| `e8841dd` | Piano 9: quality — piano Ear Training page (answers on the keys), checks on phone portrait/landscape and desktop, two-finger chords, slow sample loading (syn… |
| `b4c7ced` | Report: piano summary |
| `b7b9358` | Drums 1: the Kit tab — tap pads with limb labels (R, L, RF, LF), keyboard keys and e-kit MIDI; a step grid linked to drum notation (abcjs percussion staff: k… |
| `d631455` | Drums 2: drum sound — the synthesized kit is the sound (CC0 Karoryfer samples were unreachable from the build network); a sample hook stays in place; report … |
| `21d954e` | Drums 3: timing scoring — Easy ±50/±25, Normal ±35/±18, Strict ±25/±12 ms, capped below half the note gap; hits must be on the right drum; bias shown apart f… |
| `c959730` | Drums 4: drum drills and internal time — Read it tap it (grid + staff), Hear it tap it back, Stickings and rudiments in the research order (singles, doubles,… |
| `bdb6433` | Drums 4: fix a sideways page scroll on phones in Read it, tap it |
| `19814a0` | Drums 5: drum play-along and routines |
| `6909558` | Drums 6, Levels 1-3: pulse and the kit, grooves and first fills, sixteenths/dynamics/rudiments |
| `5d9db00` | Drums 6, Levels 4-6: triplets/swing/shuffle, coordination and independence, time/feel/your own parts — the drum path is complete (6 levels, 42 lessons, chall… |
| `aafcb13` | Drums 6: add the cross-stick to the kit data (used by one-drop and bossa; e-kit note 37) |
| `8d5fa83` | Drums 7: drum review and progress — daily review asks drum names and staff positions on the pads, counting (grid), stickings, grooves and feels by ear; Progr… |
| `6311dba` | Drums 8 and final checks: four-instrument storage test, README for bass/piano/drums |
| (this commit) | Final report |

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
- **Groove player inside the Metronome:** "turn the metronome into a groove player" became a Click / Groove
  switch on the Metronome screen, so the plain click is still one tap away. Eleven original styles (the ten
  asked for plus a 3/4 waltz, needed for Amazing Grace).
- **Drop-out bars silence the drums and the chord pad**, so you really are on your own for that bar.
- **Mic grading:** a note counts when it holds for 3 analysis frames (about 180 ms) with YIN clarity over
  0.8; any octave counts. Mic results are counted per instrument (`mic` in storage) and shown nowhere as a
  grade.
- **Lesson numbering:** bass lessons are written for a 4-string (string 4 = low E) and moved to the same
  pitch on 5-string, 6-string or drop-D necks. Piano positions are MIDI numbers; drum positions are pads.
- **Shared theory cards:** bass and piano lessons reuse the shared cards wherever the research marks a lesson
  S or S*/S/P (placed by `autoPlace`, which the validator re-checks). Where no shared card existed for an S
  topic (sharps and flats, Roman numerals, all rhythm topics), I wrote instrument-free text in the lesson
  itself rather than add cards no guitar lesson uses (the validator requires every shared card to be used by
  a guitar lesson, and I did not want to touch guitar lessons).
- **"Every level has a create task":** bass lessons 2.7 and 3.7 are dedicated create lessons; in other levels
  the create task is a timed improvising Play step (e.g. 2-bar line, blues, ii–V–I).
- **Bass Level 1 challenge** uses a new "roots on the kick" step: the app names the root each bar and shows
  your timing if you tap; it always lets you carry on.
- **Piano key size:** 44 px on touch screens; on desktop the keys are fitted between 26 and 44 px so 61 keys
  fit the window (28 px at 1280 px wide). Phones in portrait show one focus octave plus a few keys.
- **Piano sample loading:** smplr Sampler with a preset of 30 regions (each sample covers ±1 semitone); two
  samplers so the lesson range (C3–C6) loads first.
- **Piano pieces:** melodies written from memory of the public-domain originals and harmonised simply.
  Aura Lee and the K. 545 and Entertainer openings are the ones most worth checking by ear.
- **Reading track:** piano reading lessons follow the research table exactly (1.7, 3.2, 3.6, 4.6); levels
  2, 5 and 6 add staff items to the review instead of a reading lesson.
- **Drum notation:** inside each beat a hit lasts until the next hit, so a rock beat reads as eighth notes;
  every stem points up (no hands-up/feet-down split).
- **Drum Play steps** are scored but Next is always available; timing never blocks.
- **Daily review per instrument:** piano and drums ask their items on the keys and pads; the guitar neck is
  never shown for them (their Progress hides the neck heat map and shows their own maps).
- **Ear Training tab** on piano and drums is a short page linking to the instrument's ear drills, because
  the guitar ear-training engine answers on a neck.
- **Committing by level:** each bass and piano level was its own commit; drum levels went in two commits
  (1–3 and 4–6) to save time late in the run.

## 4. Skipped or changed, and why

- **Bass samples (Bass 2) and drum samples (Drums 2): not shipped.** The build environment's network
  blocked karoryfer.com, and the sfzinstruments GitHub repositories for Growlybass and the Karoryfer kits
  were not reachable (GitHub API 403; raw files 404). The brief's fallback was "another CC0 Karoryfer set,
  else the synth only"; every Karoryfer source was blocked the same way, so bass and drums use the built-in
  synthesis. Both sound modules keep a hook for samples (`setVoice` in js/audio.js, `useSamples` in
  js/drumkit.js), so a trimmed CC0 set can be dropped in later without touching anything else.
- **Two-row piano keyboard for two-hand material on phones** (Piano 1): not built; two-hand lesson steps use
  one scrolling keyboard. This is the main piano gap.
- **Polyphonic mic:** behind the experimental setting it only displays the notes it hears on the piano
  Keyboard tab; it never grades anything.
- **Drum stem toggle and e-kit remapping:** not built (see the summary table).
- **Supabase sync:** the brief's README mentions sync, but there is no sync code on `main`, so there was
  nothing to update for the new storage shape.


## 5. Test results

All run at the end of the job, on the final commit:

- **Baseline (before any change):** lesson validator 4875 passed, 0 failed. No other tests existed.
- **Lesson validator:** 16 190 checks passed, 0 failed. Guitar lessons still match the snapshot byte for byte.
  New checks cover every bass, piano and drum lesson (positions, prompts against the answer, review items,
  shared-card placement, rhythm tasks, challenge roots), every bass tab, piano piece and drum chart.
- **Unit tests** (`node --test tests/*.test.mjs`): 34 passed, 0 failed: storage migration from v1 and v4 and
  four-instrument separation, groove patterns, YIN on generated tones from B0 to C6 (including an octave-error
  case and noise), the bass synth's pitch, MIDI parsing with fake events, bass tabs and notation, piano
  voicing/voice leading/LH patterns/fingering/tempo trainer, drum notation, scoring and drills.
- **Headless browser check** (`tools/smoke.mjs`): 76 screens across the four instruments, 0 console errors,
  no empty screens, no sideways page scroll at 390 px.
- **End-to-end lesson walks** in Chromium: every bass, piano and drum lesson and challenge (48 each), and all
  49 guitar lessons and challenges again at the end: every step opened and every check finished, with no
  console errors. (The walker answers checks at random, so it tests the flow, not the scores.)
- **Other browser checks:** mic end to end with Chromium's fake microphone fed a generated 55 Hz bass A
  (Note finder accepted it); MIDI notes routed into the piano key finder; Lock to the kick with simulated taps
  (12/12 within ±60, bias −21 ms reported); drum timing +20 ms read as +20 ms at 60 and 120 bpm; piano on phone
  portrait/landscape/desktop, two-finger chords, samples throttled to 3 s (synth plays until they arrive);
  offline start for all four instruments with a real service worker.

## 6. Hand-test checklist

**Setup:** serve the branch (`python3 tools/serve.py 8000`) or deploy a preview. For MIDI you need HTTPS or
localhost and Chrome/Edge/Firefox on a computer or Android.

Bass (your bass, with and without headphones)
1. Progress → Settings → Instrument: Bass. The page reloads; the footer says "Bass · 20 frets".
2. Fretboard → More → Bass: try each tuning (5-string shows a B string), each Bass view, and Line over chart
   (drums start, the next root flashes on beat 4).
3. Tap notes on the neck: does the synth bass sound like a bass on your phone speaker and on headphones?
4. Practice → Metronome → Groove: every style at slow and fast tempos, Kick only, drop-out bars, chords.
5. Practice → Drills → Lock to the kick: calibrate first, then play roots on your bass while tapping. Does
   the early/late number feel right? Try once with Bluetooth headphones (expect a warning after calibrating).
6. Turn on the microphone (Progress → Settings). Note finder and Hear the bassline: play notes on your bass,
   including low E and (on a 5-string) low B. Does it hear them? Does "I played it" always work?
7. Play-along: Walking Blues in F with Bass on, then off; bass clef; loop a bar; speed-up after clean loops.
8. Learn: do Level 1 Lesson 1 and the Level 1 Challenge.

Guitar (your guitar)
9. Switch back to Guitar: your old lessons, heat map and tempos are all there; nothing from bass shows.
10. Mic in the Note finder and in a lesson Play step. Groove mode works for guitar too.

Piano (your keyboard)
11. Switch to Piano: Keyboard tab on the phone in portrait (one octave plus, keys ~44 px), landscape, desktop.
12. Tap chords with two fingers at once; slide across keys (glissando); drag the mini-map.
13. Listen to the Salamander piano; on first load you hear a softer synth until samples arrive.
14. Plug in a MIDI keyboard (Chrome or Edge on a computer): Progress → Settings → MIDI. Key finder and a
    play-along in Wait mode should accept your keys. On Safari or an iPhone the MIDI option should not appear.
15. Play-along: Ode to Joy in all four views, right hand, left hand, both; Wait for me; tempo trainer goals.
16. Check the fingering shown for C, G, D, A, E and F major against your own scale book.
17. Mic: play single notes in a lesson Play step.

Drums (phone, and an e-kit if you have one)
18. Switch to Drums: Kit tab pads (tap fast with two fingers), keyboard keys on a computer.
19. Grid and notation: edit cells, play the loop; the staff playhead follows the grid.
20. Calibrate (and "Calibrate my e-kit" with MIDI), then Read it tap it at Easy and Strict.
21. Internal time: gap click and fading click; does the silent-bar score match your feel?
22. Play-along: Little Song with "app plays the drums" off and scoring on.

Everyone
23. Export progress, switch instruments, import (merge and replace) an old export from before this branch.
24. Install to the Home Screen, go offline (airplane mode) and open each instrument.
25. Daily review on each instrument after a day with some answers.

## 7. Things for you to decide

1. **Samples:** bass and drums sound synthesized because Karoryfer's sites were unreachable. Download
   Growlybass and a Karoryfer kit yourself (CC0) and I can trim and wire them in, or keep the synth.
2. **Two-row piano keyboard** on phones for two-hand pieces: worth building next, or is landscape enough?
3. **Desktop piano key width:** fitted keys (28 px at 1280 px for 61 keys) vs always 44 px with scrolling.
4. **Shared rhythm cards:** should rhythm, meter and form become shared theory cards (drums, bass and guitar's
   rhythm strand)? That means editing guitar lessons, which I avoided.
5. **Piano melodies:** please play through Aura Lee, the K. 545 opening and The Entertainer opening; I
   arranged them from memory of the originals.
6. **Drum notation stems:** add the "hands up / feet down" option the research mentions?
7. **Merge:** the PR is open and not merged.
