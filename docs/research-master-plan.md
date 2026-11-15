# Fretboard Lab: Master Plan

Part 4 of the research. It combines the five research files and cross-checks them:
[research-guitar-v2.md](research-guitar-v2.md), [research-bass.md](research-bass.md), [research-piano.md](research-piano.md), [research-drums.md](research-drums.md) and [research-app-features.md](research-app-features.md).
The original guitar research is [research-findings.md](research-findings.md).
Written 2026-11-15. Every claim here comes from one of those files, which hold the sources. Claims I re-checked myself are listed at the end.

---

## One-page summary

**Where the app stands.** It has a theory path in six levels with 42 lessons and six challenges, sound, a fretboard, drills, spaced review and progress tracking. None of the apps reviewed combines these in this way. The theory order holds up against JustinGuitar, Fender Play, Berklee and the method books.

**The biggest gap is playing, not theory.** The guitar path teaches no chords, strumming or rhythm until Level 4, yet its Play steps ask for muting, barre chords and "any shape you know" ([guitar 2.3](research-guitar-v2.md)). Every bass, drum and piano course reviewed starts with hands and rhythm on day one. Two strands running through every level, Hands and Rhythm, are the single most important change.

**Three things could cost users right now:**
1. **Lost progress on iPhones.** Safari deletes a site's saved data after seven days of Safari use without visiting it, unless the app was added to the Home Screen. Today that data is the only copy of someone's progress ([app-features 5](research-app-features.md); confirmed on WebKit's blog).
2. **Colour-blind users can't tell the 3rd from the 5th.** With protanopia or deuteranopia, blue and lavender look almost the same. Pink stays distinct.
3. **Red and grey text is hard to read.** Both fail WCAG contrast (3.79:1 and 3.81:1; the minimum is 4.5:1). Both are fine as dot colours.

**The learning science, updated:**

| Holds up | Weaker than textbooks claim |
|---|---|
| Testing yourself (retrieval) | "Focus outside your body" |
| Spacing practice across days | Giving less feedback |
| Mixing similar items | Letting learners choose their own practice order |
| Counting clean repetitions, not minutes | "Sleep improves skills overnight" |

The sleep question is disputed between the files; see Cross-check notes.

**The review system:**
- Keep Leitner for now and never switch to SM-2, the classic Anki algorithm. It predicted recall worse than a constant guess in a benchmark of 350 million reviews.
- Move fact items to FSRS, the newer algorithm Anki now offers.
- Schedule playing skills with a clean-tempo ladder instead.

**Ear training is the clearest gap across all four instruments.** Train scale degrees in a key, answered on the instrument. No ear-training app reviewed takes answers on an instrument.

**Adding instruments:**

| Instrument | Effort | Why |
|---|---|---|
| Bass | Medium | The fretboard already handles any number of strings. About half its theory lessons are shared with guitar. |
| Piano | Medium | The engines carry over. It needs a keyboard view, piano sounds and notation. About 24 of 42 lessons share theory with guitar. |
| Drums | Large | A different kind of instrument: a timing engine, kit and grid views, and 42 mostly new lessons. |

Two facts constrain every instrument:
- **Web MIDI (plugging in a keyboard or e-kit) doesn't work in any Safari, on Mac or iPhone.**
- **Bluetooth headphones add roughly 100–480 ms of delay.**

So taps must always be enough to progress, and timing needs per-device calibration.

**Business:**
- **Accounts:** Supabase. Its free projects pause after a week of inactivity, so upgrade to Pro ($25/month) before launch.
- **Payments:** Stripe, with Stripe acting as merchant of record (it handles VAT and sales tax for an extra 3.5%).
- **Pricing:** a generous free tier and one honest Plus plan, annual or lifetime, with no card-up-front trials. Surprise renewals are what users hate most.
- **Hosting:** Vercel's free Hobby plan is for non-commercial use only. Move to Pro ($20/month) before charging.
- **AI lessons:** Claude chooses the lesson's topic and contents; the theory engine works out every note and fret, and any lesson that fails validation is rejected.

**Build order, in one line:** protect data and fix colours → guitar Hands, Rhythm and lesson changes → shared timing engine → ear training tab → accounts and sync → FSRS → bass → AI lessons and payments → piano → drums.

---

## 1. What is shared across instruments, and what isn't

### Shared engines (build once)

| Part | Shared? | Notes |
|---|---|---|
| Theory engine (`theory.js`, `progressions.js`) | ✅ Fully | Scales, chords, spelling and Roman numerals have nothing to do with the instrument. Drums use only the rhythm side. |
| Lesson player (six steps, cards, checks, challenges) | ✅ With adapters | Each instrument supplies its own view (neck, keys, kit/grid), "tap the answer" logic and Play-step hardware. |
| Lesson kit (`kit.js`) | ⚠️ Needs a refactor | Positions are written in guitar string numbers (6 = low E). On bass, string 4 is the low E ([bass E](research-bass.md)). Theory content should be stored as notes and degrees, with each instrument's view placing them ([piano D](research-piano.md)). |
| Daily review | ✅ | Shared facts (intervals, chord spellings, keys, Roman numerals) should be one item across instruments. Position items ("G on string 5", "this key") are per instrument. |
| Ear training tab | ✅ Mostly | Same tracks and order; the answer input is the instrument. Drums add rhythm tap-back ([app-features 1](research-app-features.md)). |
| Metronome, timer, practice log, progress | ✅ | Minutes and streaks are app-wide; lesson progress, heat maps and accuracy are per instrument. |
| Timing engine (new) | ✅ Build once | Needed for the guitar Rhythm strand, bass "lock to the kick" and all drum scoring. Uses audio-clock scheduling, per-device calibration and early/late plus spread ([drums F](research-drums.md)). |
| Groove player / drum loops (new) | ✅ | Bass wants grooves instead of a click ([bass C, D](research-bass.md)); guitar and piano backing tracks benefit too. |
| Sound | ❌ Per instrument | Guitar: today's synthesis. Bass: CC0 Karoryfer samples (about 1 MB trimmed). Piano: Salamander (CC BY, 2 MB web set) or Splendid Grand (public domain). Drums: CC0 Karoryfer kits trimmed below 1 MB, with synthesis as a fallback. |
| Play-along | ⚠️ Shared engine, different views | Guitar and bass: tab plus a rhythm line. Piano: falling notes, staff and chord chart from one data file. Drums: a step grid linked to drum notation. |

### Lessons shared between instruments (from each file's section E)

| Instrument | Fully shared theory | Shared idea, own practice | Only for this instrument |
|---|---|---|---|
| Bass | 10 | 11 | 21 |
| Piano | about 24 can share theory content | (not split out) | about 18 |
| Drums | about 14 (rhythm, meter, song form) | — | about 28 |

**Recommendation:** write a shared "theory card" library (Learn-it cards, review items, ear questions) in note-and-degree terms. Each instrument's lesson then combines those cards with its own See, Try and Play steps.

### Progress for each instrument

- One stored profile, with a top-level `instrument` switch and progress separated by instrument: `lessons`, position items, heat map, placement.
- Shared and app-wide: theory items (`fact:`, `degree:`, `interval-ear:`), streak, practice days and log.
- The log already tags each activity; add an `instrument` field.
- Storage already supports adding fields without breaking old data, and import-merge works per section, so this is a small change to storage.

---

## 2. The 3 features that would set each instrument apart

| Instrument | 1 | 2 | 3 |
|---|---|---|---|
| **Guitar** | **A live fretboard under the scrolling tab**, each note labelled by its interval to the current chord. No tab player reviewed links tab to theory. | **Ear training answered on the fretboard, in a key**: scale degrees → intervals in melodies → chord quality → bass motion and progressions → short dictation of public-domain tunes. | **Theory, technique and rhythm in one path, never gated by the microphone**, with skill milestones (chord changes per minute, highest clean tempo) that song apps don't explain and theory apps don't track. |
| **Bass** | **A groove player in every lesson**: drum styles, kick-only mode, drop-out bars, looping chord changes instead of a click. | **A "lock to the kick" timing meter**: early/late in ms, a forgiving window (±60 ms tightening to ±30 ms), calibrated per device, never blocking progress. | **Bass-line drills over chord charts**: find the root, name the chord tone, tap the approach note into the next chord, hear a line and play it back, all in spaced review. |
| **Piano** | **A voice-leading view**: chord tones keep the colour code through inversions; shared notes stay lit while moving notes slide to the nearest chord tone. Lead-sheet comping becomes a measured skill. | **A tempo trainer based on the Duke study**: loop a bar, slow down after a miss, speed up after three clean runs; log goals, not minutes. | **One play-along, three views**: falling notes, staff or chord chart from the same data, with an optional wait mode. Only original or public-domain pieces, so nothing gets pulled. |
| **Drums** | **Step grid and drum notation linked**, with a playhead. Melodics users ask for notation; a teacher says scrolling lanes hide patterns. | **Fair, calibrated timing scores**: per-device tap calibration, early/late shown separately from consistency, Easy/Normal/Strict windows (beginner "in time" ±50 ms, "tight" ±25 ms). | **Internal-time training**: gap click, fading click, tempo ladders, plus spaced review of counting, stickings and grooves by ear. Today this mostly lives in e-kit hardware. |

---

## 3. Improvements to the existing guitar app, in priority order

From [guitar](research-guitar-v2.md) and [app-features](research-app-features.md), re-ranked by value for the effort and by risk.

| # | Improvement | Why | Effort |
|---|---|---|---|
| 1 | **Protect progress:** Home Screen install (PWA manifest, service worker), `navigator.storage.persist()`, an "add to Home Screen" hint on iPhone, a reminder to export | iPhone Safari deletes saved data after 7 days of Safari use without a visit; it's the only copy | Small |
| 2 | **Colour fixes:** always show a label (or shape) in every dot; change the 5th to #9B7FD1; red text → #FF6B6B; grey text → #80808E | 3rd and 5th hard to tell apart for red-green colour-blind users; two text colours fail WCAG 1.4.3 | Small |
| 3 | **Hands strand in every level:** open chords from Level 1 (Em, Am, E, A, D, then C, G), a timed one-minute chord-change test, muting, hammer-ons, then barre chords as a multi-week goal | Play steps already ask for skills the path never teaches; JustinGuitar's Grade 1 is chords and strumming | Medium |
| 4 | **Rhythm strand in every level:** quarters → eighths with constant strumming motion → rests and 3/4 → syncopation and 6/8 → shuffle → sixteenths; tap-along drill with early/late in ms after calibration | No rhythm is taught; every course reviewed treats it as core | Medium (needs the timing engine) |
| 5 | **Lesson moves:** minor pentatonic box 1 into Level 2 (same shape as the major pentatonic); circle of fifths from L2-5 to Level 5 as "keys, capo, transposing"; replace L1-7 landmarks with open-position notes; merge cadences into the Level 5 progression lessons; add a ♭VII and secondary-dominant lesson | JustinGuitar and Fender Play order; Hooktheory frequency data | Small |
| 6 | **Speed trainer and clean-tempo tracking:** loop with a start and end tempo and a step size; store each exercise's highest clean bpm, restart a little below it, chart it | Every major tab player has one; clean reps predict next-day results (r = −.71, Duke 2009), minutes don't | Small |
| 7 | **Kinder streak:** headline "practice days per week", streak freezes or a weekly repair, no guilt notifications; ask when they plan to practise at onboarding | Broken streaks cut engagement and repair softens it (Silverman & Barasch 2023); implementation intentions d = .65 | Small |
| 8 | **CAGED, 3-notes-per-string and one-string views plus a triad string-set filter** in the Instrument view; "name the root" checks | Fills the CAGED vs 3NPS gap; pros use several systems | Small–Medium |
| 9 | **Rhythm line and optional notation under the tab;** chord symbols and Roman numerals over public-domain pieces; a public-domain repertoire for each level (guitar 2.6) | Tab without rhythm is the top tab-player complaint | Medium |
| 10 | **FSRS for fact items** (`ts-fsrs`, MIT licence, works without a build step, default parameters first); motor items stay on the tempo ladder | SM-2 is worse than a constant guess; FSRS-6 is best even with defaults | Medium |
| 11 | **Fretboard keyboard access:** an ARIA grid with arrow keys; spoken names for dots | Screen-reader users can't use the neck today | Small–Medium |

---

## 4. Recommended build order for everything

Value is relative: ★★★ = high. Each step lists what it depends on.

| Step | What | Effort | Value | Why here |
|---|---|---|---|---|
| 1 | Protect progress (PWA, persist, install hint) and colour/contrast fixes | Small | ★★★ | Stops silent data loss and makes the core colour code readable for colour-blind users ("about 1 in 12 men have color vision deficiency", most often red-green: US National Eye Institute). Needs nothing else. |
| 2 | Guitar lesson moves, speed trainer, clean-tempo tracking, kinder streak | Small | ★★★ | Cheap, direct improvements to what exists. |
| 3 | **Shared timing engine** (audio-clock scoring, per-device calibration, early/late and spread, fading feedback) | Medium | ★★★ | The guitar Rhythm strand, bass and drums all need it; building it once avoids three versions. |
| 4 | **Guitar Hands and Rhythm strands** | Medium | ★★★ | The biggest content gap. Needs step 3 for the rhythm drills. |
| 5 | **Ear training tab** (scale degrees in a key first, then intervals in context, chord quality, progressions, dictation) | Large | ★★★ | The clearest gap in the market for every instrument; reuses drills, drone, review and sound. Replaces today's "Soon" tab. |
| 6 | **Accounts and sync** (Supabase, one JSON row per user, reuse the import-merge rules; signed-out use stays local) | Medium | ★★★ | Ends the iPhone data-loss risk for good and is required before payments or AI quotas. Supabase Pro ($25/month) before real users. |
| 7 | FSRS for facts; per-instrument progress in storage; theory-card refactor (lessons in note/degree terms) | Medium | ★★ | Groundwork so new instruments share content cleanly. Do it before bass. |
| 8 | **Bass** (4- and 5-string views, groove player, lock-to-kick meter, CC0 samples, 21 new and 11 adapted lessons) | Medium | ★★★ | Cheapest new instrument; reuses the fretboard, timing engine and theory cards. |
| 9 | **AI custom lessons** (Claude writes a lesson spec through structured outputs; the theory engine validates; Haiku screens for on-topic requests; per-user quota; Anthropic spend cap) | Medium | ★★ | Needs accounts for quotas. Estimated $0.003–$0.08 per lesson depending on model; measure on test topics. |
| 10 | **Payments and the Plus plan** (Stripe Checkout and Billing with Managed Payments; annual and lifetime; AI credits; renewal email; cancel online; Vercel Pro) | Medium | ★★ | Once there's enough value to sell (ear training, bass, AI credits). No card-up-front trials. |
| 11 | **Piano** (keyboard view for phone and desktop, sample loader with smplr, notation rendering, three-view play-along, about 18 piano-only lessons) | Medium–Large | ★★ | Big market, but needs a notation renderer and a new view; the theory cards from step 7 make it faster. |
| 12 | **Drums** (kit, grid and notation views, timing scoring from step 3, CC0 kit, about 42 lessons) | Large | ★★ | Most new content and least shared theory; the timing engine must be proven first on guitar and bass. |
| Ongoing | Growth: polish mobile → small beta → Show HN → careful Reddit posts → scale pages generated from the theory engine → short videos → Product Hunt | Medium | ★★★ | Start after steps 1–5, when the app's first impression is strong. |

**Why not AI lessons or payments earlier?** Both need accounts, and both depend on trust. One wrong AI-generated note costs credibility, and a paywall before real value invites the trial and renewal anger seen in competitor reviews.

---

## 5. Risks, open questions and things you may be missing

### Risks

| Risk | Detail | Mitigation |
|---|---|---|
| Lost progress on iPhone | 7-day storage deletion in Safari | Steps 1 and 6 |
| Latency and unfair timing scores | Bluetooth adds about 100–480 ms; `outputLatency` only arrived in Safari 18.4 | Per-device calibration; separate bias from spread; never block progress |
| No MIDI on iPhone | WebKit won't implement Web MIDI (fingerprinting concerns) | Taps always enough; MIDI as an extra on desktop and Android |
| Unreliable microphone detection | Low bass notes are slow and jump octaves; chords on piano score about 50/100 even in clean tests; mic detection can't tell kit pieces apart | Mic optional, grade by pitch class, "mark correct" button, never block |
| AI accuracy | One wrong note hurts trust (compare the 2025 backlash against Duolingo's AI content) | The engine computes every note; reject on validation failure; show no unvalidated lesson |
| Legal | Vercel Hobby is non-commercial only; COPPA amended rule in force 22 Apr 2026; EU withdrawal button from 19 Jun 2026; the Apple link-out commission case is at the US Supreme Court | Vercel Pro before charging; neutral age screen; easy cancellation; sell on the web, not in app stores, for now |
| Public-domain material | The tunes are free, but modern editions and arrangements can be copyrighted; "I Got Rhythm" is public domain in the US only | Write every arrangement yourself; use only the chord form with original melodies |
| Thin evidence | Most music-specific studies have 9–60 people; much guidance is borrowed from general motor learning | Treat recommendations as defaults to test, not settled facts |

### Open questions for you

1. **Pricing numbers.** The $29/year and $59 lifetime figures are the researcher's suggestion, not a researched result. Decide after seeing what Plus contains.
2. **Who is the audience?** Adults only, or teens too? This affects COPPA, tone and the age screen.
3. **Mic input at all?** Every file says it must never block progress. Is a "mark correct" button acceptable to you?
4. **Notation.** Piano and drums need real notation rendering (a library or hand-built SVG). That is a significant new component.
5. **Hands-strand content review.** Chord and technique lessons benefit most from a real teacher checking them on a guitar.

### Things you may be missing

- **Testing with real learners:** no research replaces watching 5 beginners use the app.
- **Privacy-friendly analytics,** so you know where people drop off. There's none today.
- **A privacy policy and terms,** needed before accounts.
- **Backups of the AI and sync data:** Supabase free has none.
- **Offline audio caching** once samples arrive (piano 2–20 MB).
- **Lesson-content QA as content grows:** extend the automated validator used for Levels 1–6 to every instrument.

---

## Cross-check notes (where the files disagree, or were corrected)

| Topic | Disagreement or correction | Resolution in this plan |
|---|---|---|
| **Sleep and consolidation** | Piano cites Simmons 2011: keyboard accuracy improved only across a 24-hour gap with sleep. Guitar cites Rickard 2022: no absolute overnight gain after correcting for bias. | Agree on "spread practice across days"; don't claim sleep improves skills by itself. |
| **Bluetooth latency** | Drums: iOS 224 ms on Bluetooth (AirPods Pro 144 ms). Bass: 244–484 ms on Android phones tested. Piano: about 100–200 ms. | Different devices and tests; all agree it's large and variable, so calibrate per device. |
| **Drum methods** | The brief named Dave Black under Hal Leonard; the drums file found his method is Alfred's. | Corrected. |
| **SRS benchmark numbers** | The guitar file's SM-2 figures come from the June 2025 version of the benchmark page. The current page lists FSRS-6 at 0.346 and no longer shows SM-2. | Both versions checked (see below); the recommendation stands. |
| **Deliberate practice** | Round one leaned on Ericsson. Guitar v2 notes Macnamara & Maitra 2019 failed to replicate the violinist study. | Use "quality of practice (clean reps)" rather than "10,000 hours". |
| **"90% of guitarists quit"** | Widely quoted; guitar v2 traced it to an unpublished Fender executive estimate. | Not used as data anywhere. |
| **Reddit** | Blocked for every researcher, as in round one. | Forum opinion comes from other forums and archived pages; marked where unverified. |

### Claims I re-checked myself for this plan (opened 2026-11-15)

- **WCAG contrast ratios:** computed independently. They match app-features exactly: text 16.38:1, blue 11.15, pink 12.14, lavender 9.74, red 3.79, grey 3.81, #FF6B6B 6.89, #80808E 4.91, dark text on #9B7FD1 5.5.
- **iPhone storage deletion:** WebKit says it deletes "all of a website's script-writable storage after seven days of Safari use without user interaction on the site". Home Screen web apps "have their own counter of days of use".
- **Web MIDI support:** caniuse shows Chrome 43+, Edge 79+, Firefox 108+. Safari (macOS) has "no native support" and iOS Safari has none in any version.
- **SRS benchmark:**
  - June 2025 version (commit f0cc6814c0), 9,999 users and 349,923,850 reviews: FSRS-6 0.3214, FSRS-6 default 0.3393, AVG (constant) 0.3630, SM-2 0.547.
  - Current page: FSRS-6 0.3460, AVG 0.3945, no SM-2 row, Leitner not included.

---

## Sources

This plan draws on the Sources lists of the five research files. These are the pages I opened myself to cross-check it:

- WebKit, "Full Third-Party Cookie Blocking and More" (7-day storage cap): https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
- caniuse, Web MIDI API: https://caniuse.com/midi
- open-spaced-repetition, srs-benchmark (current): https://github.com/open-spaced-repetition/srs-benchmark
- open-spaced-repetition, srs-benchmark (June 2025, with SM-2 rows): https://github.com/open-spaced-repetition/srs-benchmark/blob/f0cc6814c0/README.md
- WCAG 2.x relative luminance and contrast formula (computed locally): https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
- US National Eye Institute, Color blindness ("About 1 in 12 men have color vision deficiency"): https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/color-blindness

Main sources behind each section, with full lists in each file:
- Guitar: [research-guitar-v2.md § Sources](research-guitar-v2.md) (94 links)
- Bass: [research-bass.md § Sources](research-bass.md) (57 links)
- Piano: [research-piano.md § Sources](research-piano.md) (71 links)
- Drums: [research-drums.md § Sources](research-drums.md) (76 links)
- App features: [research-app-features.md § Sources](research-app-features.md) (82 links)

### Tried but couldn't access

None for the checks above. The five files list their own inaccessible sources. Recurring ones were Reddit (blocked for every researcher), TalkBass, Piano World, the JustinGuitar live site and forum (read through the Internet Archive instead), and Springer-paywalled reviews (Repp's synchronization reviews).
