# Fretboard Lab: Guitar Research, Second Pass

_Researched 2026-11-14. Builds on docs/research-findings.md (round one). Every source in the Sources list was opened. Claims that could not be checked are marked **unverified**._

## Summary

- **The theory order from round one holds up. The missing piece is the hands.** JustinGuitar's real course order, recovered from archived pages, agrees with the big moves: notes in a small area first, scale before chords-in-keys, triads before barre chords, improvising from Grade 2, blues first. But Fretboard Lab teaches no chords, strumming or rhythm until Level 4 (the first strummed chord is in L4-1), while its Play steps ask for power chords, barre chords and "any shape you know." **Add a short Hands strand and a Rhythm strand to every level** (2.3–2.5).
- **Specific lesson changes:** move the circle of fifths from L2 to L5 (as "keys, capo, transposing"), bring minor pentatonic box 1 forward to L2, swap the L1 landmarks lesson for open-position notes, merge cadences into the L5 progression lessons, and add a L5 lesson on ♭VII and secondary dominants. Hooktheory's data shows these are more common than many textbook topics (2.3).
- **Learning-science corrections:** recent bias-corrected meta-analyses found that external focus (g ≈ 0.01–0.15), reduced feedback frequency (no effect) and self-controlled practice (possibly null) are much weaker than textbooks say, and that "sleep improves skills overnight" is not supported once publication bias is removed. What survives: retrieval, spacing *in days* (now with music-specific support, Katz et al. 2025), interleaving similar items (g = .42), and **counting clean reps rather than minutes** (Duke et al. 2009).
- **"90% of guitarists quit in year one" is an unpublished Fender executive estimate** with no method or sample published. Don't cite it as data. Music-dropout research points to competence, autonomy and relatedness, and names theory lessons felt as irrelevant as a dropout reason.
- **Review algorithm:** in the open benchmark (350M reviews), **SM-2 predicted recall worse than a constant guess**, and FSRS-6 was the most accurate of the classic algorithms, even with default parameters. Keep Leitner for now, never switch to SM-2, and move fact items to FSRS (`ts-fsrs`, MIT, works without a build step). Schedule motor items with a clean-tempo ladder instead.
- **Play-along gaps vs Songsterr/Guitar Pro/Soundslice/UG:** no progressive speed trainer, no rhythm or notation display, no second part to mute or solo. A live fretboard under the tab would be unique.
- **Ear training order:** scale degrees in a key → intervals (in melodies and in a key) → chord quality → bass motion and progressions → short melodic dictation answered on the fretboard. The evidence base is thin; this order follows the music-cognition research on scale-degree vs interval strategies and expert practice.

---

## 1. Gaps from round one

### 1.1 JustinGuitar's course order

**How we got it:** justinguitar.com and its community forum block automated fetches (Cloudflare "Just a moment..."). The Internet Archive's copies of the course pages (captured Oct–Nov 2026) contain the module data the site embeds in each page, including the "Module N" label, so the order below is primary and **verified**.

**Beginner Course, Grade 1** ("Quickstart"), modules 0–7. Justin's FAQ on the same page: "Most students finish Grade 1 in 6-8 weeks", practice "4 times a week for 20 minutes each session", and self-assessment milestones instead of tests: tune with a tuner; play "the 8 essential beginner chords (A, D, E, Am, Dm, Em, C, G)"; "30 changes in 1 minute"; "Old Faithful strumming pattern consistently at 80 beats per minute"; "at least 5 easy songs".

| Module | Title (as published) | What it adds |
|---|---|---|
| 0 | Before You Begin: Guitar Basics | Tuning, chord boxes, holding the pick, finger strumming, finger placement |
| 1 | A & D Chords: Play Your First Song! | A and D, the "One Minute Changes" exercise, bars and beats, first song |
| 2 | Rhythm & Chord Changes + Your First Riff! | How strumming works, faster changes, E chord, first riff |
| 3 | Capo, Minor Chords & Up Strums | Capo, Am/Em, up strums |
| 4 | Metronome, Stretches & THE Pattern | Metronome, stretch exercise, "the most useful strumming pattern", Dm, reading tab |
| 5 | Basic Theory & Strumming Development | "a taste of (practical) Music Theory", songbook, C chord, a riff |
| 6 | 6:8 Time, Fast Changes & Alternate Picking | G chord, 6/8 time, alternate picking |
| 7 | Air Changes, Dynamics & Consolidation! | Air changes, dynamics, consolidation |

**Grade 2** ("Rocking the Guitar and that F Chord"), modules 8–14: 8 Your first scale, pick tricks, 8th-note strumming, **notes in the open position** · 9 The F chord, pinky workout, **C major scale, chords in keys** · 10 Alternate picking, hammer-ons, **improvisation**, common progressions · 11 Sus chords, fingerstyle, songwriting first steps · 12 Power chords, palm muting, writing riffs · 13 Blues: 12-bar, shuffle, **easy blues improvisation** · 14 "PRO upgrade": strumming patterns, playing standing up and without looking.

**Grade 3** ("The Last Beginner Grade"), modules 15–22: 15 Practice better, **using your ears, jamming and transcribing basics** · 16 Melodies, moving chords up the neck · 17 Finger strums, **easy triads** · 18 Open tuning, legato with the **A minor pentatonic**, triad "chips" · 19 Song practice, singing, power-chord "detective" · 20 **Chords in Keys** made easy, lifted barre trick · 21 Double strumming, **vibrato**, loopers · 22 Consolidation and **barre chords "for real"**.

**Intermediate (Grade 4) modules** listed on the archived intermediate page: E Shape Barre Chords, Major Scale Maestro 1, Rhythm Maestro ("understanding, writing, and reading rhythm"), Essential Blues Lead Guitar, Blues Licks, Blues Guitar Studies, Mix Rhythm & Lead. (Order within Grade 4 was not labelled on the page.)

**What this tells us**
- Justin's order is **technique and songs first, theory in small doses**: open chords and strumming for ~8 modules before any scale; theory arrives as "chords in keys" (modules 9 and 20) and the major scale "maestro" only at intermediate level.
- **Notes on the neck start small**: "notes in the open position" in module 8, not a whole-neck unit. This matches round one's advice for Level 1.
- **Improvising appears in Grade 2** (module 10, then blues in 13), with the minor pentatonic used for legato in Grade 3. That supports round one's "improvise early" advice.
- **Triads (Grade 3) come before barre chords (end of Grade 3) and before E-shape barres and CAGED-type thinking (Grade 4).**
- **Chord-change speed is a measured skill** ("30 changes in 1 minute"), and rhythm (Old Faithful at 80 bpm) is an explicit milestone. Fretboard Lab has neither.
- He teaches **ears and transcription in Grade 3** and a full rhythm-reading module at intermediate level.

### 1.2 Forum opinions (Reddit, StackExchange, other forums)

**Access:** reddit.com and old.reddit.com still return 403 or a blank app shell. We read Reddit through the Arctic Shift archive API (arctic-shift.photon-reddit.com), which serves the original posts and comments; links below point to the original Reddit threads. Comment scores are as archived and can be lower than live scores. music.stackexchange.com was read through the official Stack Exchange API.

| Topic | What forum users say (with source) | Implication for Fretboard Lab |
|---|---|---|
| **How to learn the notes on the neck** | Top Stack Exchange answer (score 26): learn open strings, then the string-to-string relationships and octave shapes (including the G–B shift), then a single fret across all strings, and a "Satriani exercise": with a metronome under 60 bpm, play one note in every place you can find it, one per beat. Second answer: one note per day, find it on every string. ([SE 1621](https://music.stackexchange.com/questions/1621/)) | Matches Level 1. Add the "one note everywhere, one per click" drill to Drills and the Level 1 Play step. |
| **Notes vs CAGED vs intervals** | r/guitarlessons "one piece of theory that helped you master the fretboard": top replies are triads/inversions on string sets, then "CAGED, Triads, and LEARNING YOUR DAMN SCALES", and one dissent: "CAGED teaches a set of movable chord shapes... knowing a shape is not the same thing as knowing the neck." ([thread](https://www.reddit.com/r/guitarlessons/comments/1u3g2rz/)) | Teach triads on string sets early, and keep note-naming drills alongside CAGED so shapes do not replace note knowledge. |
| **CAGED confusion** | "Struggling with CAGED" (263 points): the top advice is to learn intervals and triads first and know where R, 3, 5 sit in each shape, then alter one chord tone at a time; another: "Drop the CAGED approach for now and prioritize learning triads." ([thread](https://www.reddit.com/r/guitarlessons/comments/1to1sgy/)) Stack Exchange answers call CAGED "one way of looking at the fretboard", useful for mapping chords to scales, and note 3NPS is popular with metal/legato players; one argues it is really "only 2 shapes". ([SE 82611](https://music.stackexchange.com/questions/82611/), [SE 37964](https://music.stackexchange.com/questions/37964/)) | Keep CAGED, but put three-string triads first (already true in Level 4) and label R/3/5 inside every CAGED shape. |
| **CAGED vs 3NPS** | A Berklee alumnus (36 points): "I don't recall anyone enforcing how you played the forms"; metal players used 3NPS, "blues/jazz/rock/funk guys" used a pentatonic-plus-modes view; "any system that lets you see functions across the fretboard are good" and "you need to be able to visualize scale degrees no matter the system." ([thread](https://www.reddit.com/r/guitarlessons/comments/138rkxu/)) | The app's interval labels are the system-neutral layer. Offer 3NPS as an alternate view in Instrument, not as a separate path. |
| **JustinGuitar** | "Has anybody actually tried justinguitar and improved?" top answer "Yes" (161); "You'll improve if you follow the videos... in the correct order. If you're just bouncing around randomly on YouTube then you probably won't." ([thread](https://www.reddit.com/r/guitarlessons/comments/1f6w3yd/)) | A fixed path matters; keep the Learn path as the default home. |
| **Gamification** | "Rapid enshittification of Justin Guitar (app)": replies prefer the website; "Gamification actually turns me off... I lost the streak. That streak didn't really matter much to me anyway. Is it going to keep nagging me?" ([thread](https://www.reddit.com/r/guitarlessons/comments/1s3tvlo/)) | Keep streaks gentle (see 3.2): no nagging, no loss-framed notifications. |
| **Ear training** | "Why is ear training so hard?": after 3 months of interval and scale-degree drills the poster still cannot dictate melodies. Top reply (27): "music is notes moving over chords... Learn chord movements first"; others: transcribe nursery rhymes, sing everything, and "Guessing intervals is the worst... memorize feeling interval make over the backing chord." ([thread](https://www.reddit.com/r/guitarlessons/comments/1f0f6t0/)) | Supports functional (in-key) ear training over isolated intervals, plus short melodic dictation of public-domain tunes. See 4.8. |
| **Triad practice** | A 124-point routine: "One string set. One quality. Three inversions." Metronome at 60, bump to 72 when no hesitation; "about 3 weeks before triads started jumping out." A reply: find the shapes without a click first, then add the click. ([thread](https://www.reddit.com/r/guitarlessons/comments/1r1ieot/)) | A model drill for Level 4: a triad-inversion drill per string set, untimed first, then gated on tempo. |
| **Muting** | A 167-point post: "Learn how to mute strings you're not playing — it's as important as learning how to fret." ([thread](https://www.reddit.com/r/guitarlessons/comments/xvdunx/)) | Muting belongs in Level 3 (power chords) and Level 4 (chords). |
| **Free, no-tracking apps** | A free fretboard app got 738 points; repeated comments praise "free with no in-app purchases". ([thread](https://www.reddit.com/r/guitarlessons/comments/1qnwjag/)) | Confirms round one's pricing finding. |

**What we still could not get:** jazzguitar.be, UMGF, the Guitar Tricks forum and the JustinGuitar community forum (all returned 403 to both fetch tools). The Gear Page returned a challenge page. The Ultimate Guitar forum index loaded, but search engines did not surface a relevant UG thread, so none is cited. Reddit evidence is anecdote from self-selected posters and should be read as opinion, not data.

### 1.3 Round-one claims re-checked

| Round-one claim | Status now | Detail |
|---|---|---|
| JustinGuitar course order: "Unverified" | **Confirmed and filled in** | Grades 1–4 module order from archived course pages (1.1). |
| "The general [interleaving] meta-analysis is unverified" | **Confirmed, with nuance** | Brunmair & Richter 2019: 59 studies, 238 effect sizes, g = 0.42. Strongest for similar categories; **blocking beat interleaving for word learning (g = −0.39)**. |
| "A keyboard study reportedly found gains only with a 24-hour gap, which suggests sleep matters": unverified | **Confirmed study; interpretation corrected** | Simmons 2011 (JRME, n = 29): accuracy gains in session 2 only with a 24-hour gap; speed gains with 6- and 24-hour gaps. But a 2022 bias analysis of 88 effect sizes found "no consolidation-based, absolute performance gain following sleep" (Rickard et al.). Say "day gaps help", not "sleep makes you better". |
| Spacing: "limited for motor skills... one piano study found no effect, but its gaps were only minutes apart" | **Updated** | Correct as stated, and a 2025 study (Katz et al.) found a strong spacing effect for learning a melody with 2-day or 1-week gaps, tested 3 weeks later. Spacing at day scale now has music-specific support. |
| Deliberate practice: ~21% of variance (Macnamara 2014); r = .61 (Platz 2014) | **Add a caveat** | Macnamara & Maitra 2019 failed to replicate Ericsson's violinist study; the effect was "substantial, but considerably smaller." Also: *how* you practise (share of correct trials) predicted retention better than *how much* (Duke et al. 2009). |
| "Give feedback right away" | **Still fine; reasoning updated** | The textbook claim that less frequent feedback helps learning was not supported in a 61-paper meta-analysis (McKay et al. 2022), so immediate feedback carries no hidden cost. |
| Fender Play: "Riff- and song-based path... Low (press release only)" | **Upgraded to verified** | Seven stages read from Fender's own page (2.1). |
| "Users also complain most about... aggressive subscription billing" | Consistent | Forum praise for free/no-IAP apps (1.2). |
| Reddit coverage: none | **Filled** via the Arctic Shift archive (1.2). | |
| Brunmair & Richter 2019, Simmons 2011: "not accessible" | **Now read** (abstracts). | |
| Level 1 "Landmarks 5/7/12" as a lesson | **Changed** | Replace with open-position notes; fold the landmarks into lesson 4 (2.3). |
| Level 2 lesson 5 "circle of fifths (light)" | **Changed** | Move it to Level 5 (2.3). |
| Section 5 has no technique or rhythm | **Gap** | Add Hands and Rhythm strands (2.3–2.5). |

---

## 2. Curriculum, deeper

### 2.1 More methods

| Method | Order / approach (verified) | Theory? | What Fretboard Lab should take |
|---|---|---|---|
| **JustinGuitar** (see 1.1) | Open chords + strumming → chord changes as a timed skill → scale and notes in open position (Grade 2) → improvising and blues → triads, ears, chords in keys, vibrato, barre chords (Grade 3) → major scale, rhythm reading, blues lead (Grade 4) | Small doses, always applied | Timed chord changes, rhythm milestones, songs at every stage |
| **Fender Play** (archived fender.com/play, Oct 2026) | Seven stages shown on the page: basics, first chords and riffs → power chords, **reading tabs and the musical alphabet** → **Em pentatonic**, movable power chords, eighth-note rhythms → **Am pentatonic**, alternate picking, palm muting → hammer-ons/pull-offs, syncopation, more open chords → **barre chords, slides, vibrato**, slash chords → double stops, **bends**, arpeggio picking. Every stage is built around licensed hit songs. | Light ("music theory – like reading tabs and the musical alphabet") | Pentatonic before barre chords; bends late; a technique named at every stage. We cannot use licensed songs. |
| **Guitar Tricks Core Learning System** (archived page, Aug 2025) | Guitar Fundamentals 1 (holding, tuning, first chords, easy songs) → Fundamentals 2 (more chords, riffs, fingerpicking, complex strumming) → Style courses (blues, rock, country, etc.) | Embedded in style courses | A shared foundation, then a *style choice*. Supports offering style tracks after Level 2. |
| **Marty Music** (martymusic.com, archived Oct 2026) | Song-first: "No confusing theory, no boring drills—just easy-to-follow lessons designed to get you playing real songs fast." One-time purchase, "No memberships, no recurring." | Deliberately none | The audience exists that fears theory. Fretboard Lab's pitch must be "theory that makes you play better", with songs (PD/original) in every level. |
| **Troy Grady, Cracking the Code** | Technique science from slow-motion filming of experts. The Primer covers "escape motion", choosing a string-change path (USX/DSX), "chunking fast passages," and speed tests. On his forum Grady argues slow playing is "simply a different technique... So the slow reps don't do anything" for fast picking, and recommends practising at "Warp Three", "the speed at which high-speed technique emerges", which is "not a specific bpm". His own story: "Multiple attempts at slow, concerted metronome practice didn't help." | Not theory | For picking speed specifically, slow practice is not enough. Add short "burst" exercises (a 4–6 note fragment at target tempo, then rest) alongside slow, clean practice. This is one expert's view, not tested in a controlled study. |
| **TrueFire** (truefire.com/guitar-lessons) | A large library browsed by Courses, Lessons, Methods, Jams, Learning Paths, Songs and Educators, filtered by instrument, style, skill level and curriculum. Subscriptions promise "Unlimited learning paths," "Unlimited jams" and "Interactive video tools". **No beginner path order was visible** on the pages we could open. One Reddit user says they "watch truefire courses daily". | Varies by course | Jam tracks as a first-class item: Fretboard Lab's backing tracks could be a browsable "Jams" list. |
| **Mick Goodrick, *The Advancing Guitarist*** (1987) | Hal Leonard: "Rather than a step-by-step method book, the information is presented in a general essay format", covering "basic fingerboard mechanics • modes, scales and chords • contemporary harmony". Secondary sources describe his one-string ("unitar") approach of playing up and down a single string, which he called "ice skating". **The exact wording is unverified**: we did not read the book. | Advanced | A "one string" view and drill: scales and melodies along one string teach the neck *horizontally*, the counterweight to box shapes. |
| **Ted Greene, *Chord Chemistry*** (1971; Alfred) | A chord-voicing reference, described by retailers as a classic for "two generations" of guitarists. **Its method was not verified** (the publisher page returned 429). | Advanced harmony | Out of scope for Levels 1–6. A possible "Level 7: voicings" later. |

### 2.2 CAGED vs 3-notes-per-string, and how pros learned the neck

**What the sources agree on**
- **No single system is "the" way.** Stack Exchange answers call CAGED "one way of looking at the fretboard" with advantages and disadvantages. A Berklee alumnus said no one enforced a form at Berklee: metal players used 3NPS while "blues/jazz/rock/funk guys" used a pentatonic-plus-modes view. The shared requirement is "you need to be able to visualize scale degrees no matter the system" (1.2).
- **CAGED's strength is linking chords to scales**, and it lines up with the five pentatonic boxes (Stack Exchange 37964). **3NPS's strength is consistent fingering for legato and fast picking**, at the cost of wider stretches and patterns that do not line up with chord shapes (Stack Exchange 82611, 37964).
- **The common failure is memorising shapes without knowing notes or intervals.** Forum users say "knowing a shape is not the same thing as knowing the neck," and advise learning triads first, then R/3/5 in each CAGED shape (1.2).
- **Pros' accounts vary.** The Stack Exchange answer attributes a "Satriani exercise" to Joe Satriani: under 60 bpm, play one note in every place on the neck, one per beat. **The attribution is unverified.** Goodrick's one-string view is a third system, built on horizontal movement. We could not verify specific interview quotes from well-known players on how they learned the neck, so we make no claims about them.

**Recommendation for Fretboard Lab**
1. **Keep CAGED as the main map** (it fits the chord-first Levels 4–6), but **teach it through triads**, as the app already does in L4-4 before L4-5.
2. **Label intervals inside every shape**, everywhere. This is the system-neutral layer every source agrees on.
3. **Add a 3NPS view and a one-string view** to the Instrument tab (toggle), and one optional lesson in Level 6: "Three other ways to see the same scale: 3NPS, one string, CAGED." This costs little and answers the most-asked forum question.
4. **Don't sell CAGED as "learning the neck".** Pair every CAGED lesson with a note-naming check ("name the root of this shape").

### 2.3 Level-by-level review (6 levels x 7 lessons)

**The biggest gap across the path is not in the theory order. It is that the app never teaches the hands.** The first chord strummed in any Play step is open C in **L4-1**. Before that, L3-4 asks for power chords "muting the other strings", and later Play steps ask for things never taught: L4-3 says "Strum along with any shape you know", L5-2 says "Strum A7, D7 and E7", and L4-5 asks for barre chords. Every course checked teaches open chords and strumming from week one: JustinGuitar (A, D in Module 1; all eight open chords in Grade 1), Fender Play (first chords at stage 1), Hal Leonard Book 1 (round one). The fix is a short **"Hands" strand inside each level** (section 2.4), not a reorder of the theory.

**Second gap: rhythm is never taught** (section 2.5). **Third: there is no real music until the play-along tab** (section 2.6).

The theory order itself (notes → major scale → intervals → chords/CAGED → progressions → improvising) holds up. JustinGuitar's Grades 1–4 agree on the big moves: notes in a small area first, scale before chords-in-keys, triads before barre chords and CAGED, improvising from Grade 2, blues as the first improvising context. Changes are marked **Keep**, **Move**, **Change**, **Add** or **Merge**.

#### Level 1: The neck and note names

| # | As built | Verdict | Specific change | Why (source) |
|---|---|---|---|---|
| 1 | String names and fret numbers | Keep | Add a "hold the guitar, fret just behind the fret wire" card and an open **Em** chord (2 fingers) to Play, so lesson 1 ends with a sound that is music. | JustinGuitar Module 0–1 teaches posture and a first chord before anything else. |
| 2 | Musical alphabet | Keep | — | — |
| 3 | Whole and half steps | Keep | Play: a one-string melody (e.g., "Ode to Joy" on the B string, which needs only W/H steps). | Goodrick's one-string view (2.1); PD melody. |
| 4 | Natural notes on E and A strings | Keep | — | Matches every source (1.2). |
| 5 | Octave shapes | Keep | Add the "one note everywhere, one per click" drill (Stack Exchange 1621) as Play. | Forum consensus. |
| 6 | Sharps and flats | Keep | — | — |
| 7 | Landmarks 5/7/12 | Change | Swap in **"Notes in the open position (frets 0–3, all strings)"**, and fold the landmarks into lesson 4 as a card. | JustinGuitar Module 8; the open position is where beginners' chords and melodies live. |
| Hands | none | **Add** | Em, Am, then E, A, D shapes taught as finger shapes with "one-minute changes" (count changes between two chords in 60 s). | JustinGuitar milestone: "30 changes in 1 minute". |
| Rhythm | none | **Add** | Quarter notes, counting "1 2 3 4", down-strums on the click. | Rhythm is JustinGuitar Module 2 and Berklee MT101's first topic. |
| Challenge | 10 notes, 3 s each | Keep | Add a second part: change Em↔Am in time at 60 bpm for 8 bars. | Measures the hands, not just knowledge. |

#### Level 2: The major scale and keys

| # | As built | Verdict | Specific change | Why |
|---|---|---|---|---|
| 1 | Major scale pattern (one string) | Keep | Play: "Joy to the World" (Lowell Mason's tune, published 1836; its first phrase steps down the major scale 8-7-6-5-4-3-2-1, by our own analysis), or "Ode to Joy" in G. | PD melodies that *are* the scale. |
| 2 | One-octave shapes | Keep | — | — |
| 3 | Scale degrees 1–7 | Keep | Add degree ear-training over the drone here (hear-it-find-it, degrees 1, 3, 5 only). | Functional ear training belongs with scale degrees (4.8). |
| 4 | Moving the shape | Keep | — | — |
| 5 | Keys and circle of fifths | **Move** to Level 5 (as "keys and the capo"). | Keys matter when progressions are being transposed; at L2 it is abstract. JustinGuitar puts capo in Grade 1 but "chords in keys" in Grades 2–3. |
| 6 | Relative minor | Keep | — | — |
| 7 | Major pentatonic | Change | Teach **major and minor pentatonic as one shape set** (G major pentatonic = E minor pentatonic). Play "Amazing Grace" (the app's own tab uses only G A B D E: major pentatonic). | Fender Play teaches Em pentatonic at stage 3; Berklee Beginners teaches pentatonic before open chords. The minor pentatonic box 1 is the most-used soloing shape and should not wait until L6-1. |
| New 5 | — | **Add** "Minor pentatonic box 1 and your first blues lick" (replaces the moved circle-of-fifths lesson). | As above; JustinGuitar Grade 2 Module 13 starts blues improvising. |
| Hands | — | **Add** | C and G chords; alternate picking on single notes (scale up and down). | JustinGuitar Modules 5–6. |
| Rhythm | — | **Add** | Eighth notes; constant down-up strumming motion; the first strumming pattern (D, D-U, U-D-U). | JustinGuitar Module 4; Fender stage 3. |

#### Level 3: Intervals

| # | As built | Verdict | Specific change | Why |
|---|---|---|---|---|
| 1 | Intervals from the root | Keep | — | — |
| 2 | Shapes for 3rd, 5th, octave | Keep | — | — |
| 3 | Major and minor 3rds | Keep | Use the pair in review immediately (confusable pair). | Brunmair & Richter: interleaving helps most for similar categories (3.1). |
| 4 | 4ths, 5ths and power chords | Keep | Add a palm-muting card and a fretting-hand muting card. | Fender stage 4; forum "learn how to mute" (1.2). |
| 5 | 6ths and 7ths | Keep | Use **PD reference melodies** for each interval where one exists (see 2.6). | — |
| 6 | Hearing intervals in a key | Keep | — | — |
| 7 | Mixed interval drill | Keep | — | — |
| Hands | — | **Add** | Hammer-ons and pull-offs on the minor pentatonic; Dm and the "easy F" (top 4 strings). | JustinGuitar Grades 2–3; Fender stage 5. |
| Rhythm | — | **Add** | Rests and muted strums; ties; 3/4 time (use Amazing Grace / Greensleeves, both in 3/4 in the app). | JustinGuitar Module 6 (6/8). |

#### Level 4: Chords and CAGED

| # | As built | Verdict | Specific change | Why |
|---|---|---|---|---|
| 1 | Building triads 1-3-5 | Keep | Since open chords will already be known, show *which strings of open C are R, 3, 5*. | Connects shapes the hands know to theory: the "why" competitors lack. |
| 2 | Major, minor, diminished | Keep | Add **sus2/sus4** as "replace the 3rd" (one card). | JustinGuitar Module 11; forum advice to alter one chord tone at a time (1.2). |
| 3 | Chords in a key | Keep | — | JustinGuitar Modules 9 and 20. |
| 4 | Triads on three strings | Keep (good) | Make it the anchor: one string set, three inversions, untimed then 60→72 bpm. | Reddit triad routine (1.2). |
| 5 | CAGED: one chord, five shapes | Keep | Label R/3/5 inside each shape; add "name the root" check questions. | 2.2. |
| 6 | Linking shapes | Keep | — | — |
| 7 | 7th chords | Keep | — | — |
| Hands | — | **Add** | Full barre chords (E and A shapes) as a multi-week technique goal with the top-4-strings fallback already in L4-5; one-minute changes with barres. | JustinGuitar: barres "for real" only at the end of Grade 3 and E-shape barres in Grade 4, so it is late and needs time. |
| Rhythm | — | **Add** | Syncopation (the "missing down-strum"); 6/8 feel. | Fender stage 5 "syncopation". |

#### Level 5: Progressions

| # | As built | Verdict | Specific change | Why |
|---|---|---|---|---|
| 1 | Roman numerals | Keep | — | — |
| 2 | I-IV-V and 12-bar blues | Keep | Teach the shuffle/swing feel here (rhythm). Use "St. Louis Blues" (W. C. Handy, 1914, PD) as the listening example. | — |
| 3 | I-V-vi-IV | Keep | — | Hooktheory: I–V–vi–IV is "the most popular progression" (1,385 tabs, far ahead of the rest). |
| 4 | ii-V-I | Keep, but lighter | Keep (L6-7 needs it), but frame it as jazz's cadence. | Not in Hooktheory's top progression list; jazz-specific. |
| 5 | Cadences: V to I | **Merge** into lessons 2 and 4. | Frees a slot. | — |
| New 5 | — | **Add** "Borrowed and outside chords: ♭VII and V/vi". | Hooktheory's common list: "Cadencing via ♭VII" (580 tabs), "Secondary dominant" (644), "Expanding with V/vi" (583) are all more common than many textbook topics. |
| 6 | Hearing progressions | Keep | Add **bass-line listening first** ("is the bass going up or down?") before naming numerals. | Forum: "learn chord movements first" (1.2). Hooktheory's #2 is "Stepwise bass down". |
| 7 | One position | Keep | — | — |
| Moved in | Keys and circle of fifths (from L2) | **Add** as "Keys, the capo and transposing". | Practical reason to know keys: play a progression in any key. | JustinGuitar Module 3 (capo). |
| Rhythm | — | **Add** | Strumming patterns over the backing track; changing chords on beat 4 "and". | JustinGuitar Module 7 "air changes". |

#### Level 6: Improvising

| # | As built | Verdict | Specific change | Why |
|---|---|---|---|---|
| 1 | Minor pentatonic in five positions | Change | Box 1 is now in Level 2, so this becomes "linking boxes 1–2, then 3–5 via CAGED". Spread the five boxes over review rather than one lesson. | Too much for one lesson; boxes are motor patterns that need day-scale spacing (3.1). |
| 2 | Aiming for chord tones | Keep | — | — |
| 3 | Phrasing | Keep | — | — |
| 4 | Bends, slides, vibrato | Keep, but **split** | Slides move to the Level 3 hands strand. Bends + vibrato stay here with pitch-matching (bend to the target note, already in the lesson). | Fender: slides and vibrato at stage 6, bends at 7; JustinGuitar: vibrato in Grade 3. |
| 5 | Blues: b3, b5, b7 | Keep | — | — |
| 6 | Modes: Dorian, Mixolydian | Keep | Use PD modal tunes: "Drunken Sailor" and "Scarborough Fair" (traditional melody only) for Dorian, "Old Joe Clark" for Mixolydian (all listed as examples by Wikipedia). | Real music for modes. |
| 7 | Soloing over ii-V-I | Keep | — | — |
| Add (optional) | — | **Add** "Other maps: 3NPS and one-string" as a bonus lesson. | 2.2. |
| Hands | — | **Add** | Speed bursts for picking (Grady), double stops. | Fender stage 7; 2.1. |
| Rhythm | — | **Add** | Sixteenths, starting phrases off the beat. | — |

**Net effect:** the six levels and their theory spine stay. Two lessons move (circle of fifths → L5; minor pentatonic box 1 → L2), one merges (cadences), two are added (borrowed chords, open-position notes), and each level gets a Hands strand and a Rhythm strand (about 2–3 short items per level, 5 minutes each, shown as a "Hands & rhythm" card in the level, not new full lessons).

### 2.4 Technique alongside theory

Where the courses place each technique (stage numbers are each course's own):

| Technique | JustinGuitar | Fender Play (7 stages) | Recommended level in Fretboard Lab |
|---|---|---|---|
| Posture, pick grip, fretting behind the wire | Module 0 | Stage 1 | L1 |
| Open chords + timed changes | Grade 1 (A, D, E, Am, Em, Dm, C, G), "30 changes in 1 minute" | Stage 1–2 | L1–L2 (Em, Am, E, A, D, then C, G) |
| Strumming (down, then down-up) | Modules 1–4 | Stages 1–3 | L1–L2 |
| Alternate picking | Module 6, again Module 10 | Stage 4 | L2 |
| Palm muting / fretting-hand muting | Module 12 | Stage 4 | L3 (with power chords) |
| Hammer-ons, pull-offs | Module 10, legato Module 18 | Stage 5 | L3 |
| Slides | — | Stage 6 | L3 |
| Barre chords | "Easy" F Module 9, full barres Module 22, E-shape Grade 4 | Stage 6 | L4 (multi-week goal, fallback shapes) |
| Vibrato | Module 21 | Stage 6 | L6 |
| Bends | (Grade 4 blues lead) | Stage 7 | L6 |
| Fast picking | — | — | L6 bonus (Grady bursts) |

**How to run technique in an app without a microphone gate**
- **Timed self-tests, honestly self-scored.** One-minute changes: the app runs a 60-second timer and the learner enters a count. This is JustinGuitar's method and needs no detection. Log the number and chart it.
- **Tempo ladders.** For each technique item, store the highest bpm the learner marked "clean" and start the next session a little below it. This follows Duke et al. 2009: correct reps matter more than time spent.
- **Optional mic check, forgiving.** Use the mic only to confirm onset timing or the pitch of a bend target, never to lock progress (round one).
- **Short and frequent.** 3–5 minutes of hands work per session, spread over days. Motor items gain from day-scale gaps (Simmons 2011, Katz 2025), not minute gaps (Wiseheart 2017).

### 2.5 Rhythm and timing

**How courses teach it:** JustinGuitar treats rhythm as a core skill from Module 1 ("bars and beats") and Module 2 ("how strumming... works"). Its Grade 1 milestone is a strumming pattern "at 80 beats per minute," and the intermediate level has a whole "Rhythm Maestro" module for "understanding, writing, and reading rhythm." Fender Play names a rhythm skill at stages 3 ("eighth-note rhythms") and 5 ("syncopation"). Berklee's Music Theory 101 starts with rhythm (round one).

**Research:** we found little that tests rhythm-teaching methods for guitar. Sensorimotor synchronisation (tapping with a beat) is a large research field (Repp & Su 2013 review). One small randomised study (Rönnqvist et al. 2018, 24 soccer players, 12 sessions of metronome-synchronisation training over 4 weeks) found significant timing improvement, so timing is trainable with feedback. The music-specific evidence on *how* to teach it is mostly expert practice.

**Recommendations**
1. **A rhythm strand per level** (2.3): L1 quarters → L2 eighths and constant strumming motion → L3 rests, ties, 3/4 → L4 syncopation, 6/8 → L5 shuffle/swing and changing chords on time → L6 sixteenths and off-beat phrase starts.
2. **Rhythm notation in the tab player.** Show stems/beams or note-length bars under the tab. Ultimate Guitar's tab player has a "Notation" setting (its help page). We did not check how other players show rhythm. The app's tabs already store durations.
3. **Tap-the-rhythm drills with timing feedback.** The learner taps (screen or spacebar) along with a pattern; the app reports early/late in milliseconds per beat and a summary ("you rush the 'and' of 2"). Calibrate latency first: `AudioContext.outputLatency` gives the browser's estimate of output delay (MDN: "Baseline 2025", may not work on older browsers), plus a one-time tap-to-click calibration.
4. **Strumming-pattern trainer.** Show the down/up arrows with ghost strokes (the hand keeps moving on missed strums), looped over the backing track.
5. **Count-in and click on every Play step** (most already do), with a "click on 2 and 4" option for swing feel at Level 5.

### 2.6 Songs without copyright problems

**The rule we checked:** in the US, musical compositions published in 1930 entered the public domain on 1 January 2026. Compositions and sound recordings have separate terms: recordings from 1925 entered in 2026, and a later recording or arrangement of a public-domain song can still be copyrighted (Duke Center for the Study of the Public Domain). The 2026 class includes "I Got Rhythm", "Georgia On My Mind", "Body and Soul" and "On the Sunny Side of the Street". **Caution:** these are public domain *in the US*. Other countries use life-plus-70 rules, so Hoagy Carmichael's "Georgia" (he died in 1981) is **not** public domain in life+70 countries. For a worldwide web app, prefer pre-1900 traditional material and original pieces. This is not legal advice.

**How good courses connect theory to music without licences**
- **Original études in a style** (Leavitt and Hal Leonard methods are built on these; Berklee courses use original examples, round one).
- **Traditional melodies** chosen because they demonstrate the concept (scale, mode, interval).
- **Form analysis instead of songs.** Teach the 12-bar blues, AABA (32-bar) form and verse–chorus as forms. Hooktheory teaches with numerals so a progression can be discussed without reproducing a recording (round one). Practise them over original backing tracks.

**Public-domain material by level** (traditional or pre-1900 unless noted; play-along tabs must be our own arrangements):

| Level | Melody / form | What it teaches |
|---|---|---|
| L1 | "Ode to Joy" (Beethoven, 1824) on one string; "Frère Jacques" (traditional) | Note names, W/H steps along a string |
| L2 | "Joy to the World" (Mason, 1836) | Major scale stepping down 8→1 |
| L2 | "Amazing Grace" ("New Britain", set to the words in 1835) | Major pentatonic (the app's tab uses G A B D E) |
| L3 | "Greensleeves" (traditional; in the app already) | Minor key, 3/4, the raised 6th and 7th (F#, G# appear in the app's tab) |
| L3 | Interval references: openings of "Twinkle, Twinkle" (P5) and "Amazing Grace" (P4), by our analysis | Hearing intervals inside melodies |
| L4 | "Oh! Susanna" (Foster, 1848), "Clementine" (traditional) | I, IV, V and I, V7 accompaniment |
| L5 | Pachelbel's Canon progression (c. 1680) | I–V–vi–iii–IV–I–IV–V; Hooktheory lists "Pachelbel's progression" among common progressions (200 tabs) |
| L5 | 12-bar blues form; "St. Louis Blues" (Handy, 1914) as a listening example | I–IV–V blues form, shuffle |
| L5 | AABA 32-bar form over "rhythm changes", with an **original** melody | Form and ii–V movement. "I Got Rhythm" is PD in the US only, so write a new tune over the form rather than using its melody. |
| L6 | "Drunken Sailor", "Scarborough Fair" (traditional melody only, not the 1966 arrangement) | Dorian |
| L6 | "Old Joe Clark" (traditional) | Mixolydian |
| L6 | Original call-and-response blues licks (the app already has `call-and-response-a.js`) | Phrasing |

**Verdict on the current play-along list** (10 tabs: chromatic warm-up, G major scale, G pentatonic lick, A minor pentatonic riff, call-and-response, pop triads in G, Ode to Joy, Amazing Grace, Greensleeves, E blues shuffle): all are original or traditional, which is good. Missing pieces: something for each level's new Hands/Rhythm items (strumming-pattern tracks), a modal tune, and a full 12-bar chorus with chords **and** melody.

---

## 3. Learning science, deeper

**The big picture first.** Since round one, the motor-learning field has published a series of bias-corrected re-analyses ("robust Bayesian meta-analysis") by McKay, Carter and colleagues. They found that several textbook rules (external focus, reduced feedback frequency, self-controlled practice) rest on small, under-powered studies, and that after correcting for publication bias their average effects are **small or near zero**. A 2022 re-analysis did the same to "sleep makes you better overnight." The principles that survive best are still **retrieval, spacing for fact-like material, and the amount of correct practice**. The app should be built on those and treat the rest as low-cost defaults, not selling points.

### 3.1 Motor learning

| Principle | Best evidence (numbers) | Verdict | What the app should do |
|---|---|---|---|
| **Contextual interference / practice variability** (mixing tasks instead of blocking them) | Brady 2004 meta-analysis: 61 studies, 139 effect sizes, mean ES **.38**; lab studies .57 vs applied studies **.19**; adults .50 vs children .10; mean statistical power .43. Lage et al. 2022 (9 studies): serial practice (A-B-C-A-B-C) works as well as random. Brunmair & Richter 2019 (interleaving in category learning, 59 studies, 238 effect sizes): **g = 0.42** overall, strongest when categories are similar to each other (paintings g = 0.67, maths 0.34), and **blocking won for words (g = −0.39)**. | **Moderate, smaller in real settings.** No bias-corrected re-analysis yet. | Block a new skill inside its lesson, then mix it in review and Drills. A fixed rotation (serial) is fine; it does not need to be random. Mix *similar* items (m3/M3, 4th/5th, Am/C) since that is where interleaving helps most. |
| **Spacing for motor and music skills** | Wiseheart et al. 2017: a 17-note piano sequence, gaps of 0–15 minutes, **no spacing effect**. Simmons 2011: 29 musicians, a 9-note keyboard sequence, sessions 5 min / 6 h / 24 h apart; accuracy improved in session 2 **only in the 24-hour group**. Katz et al. 2025: a four-phrase melody learned massed vs 2 days apart vs 1 week apart, recall tested 3 weeks later: "strong evidence" for spacing, and **no difference between 2-day and 1-week gaps**. Vardal et al. 2022: observational data on 162,417 League of Legends players; those who spread play over longer windows reached higher performance. Ebersbach & Nazari 2020 (N = 235): no spacing benefit for maths procedures. | **Moderate for day-scale gaps in music; no effect at minute-scale gaps.** Round one's "spacing limited for motor skills" was right only for minute gaps. | Space *days*, not minutes. For melodies and technique, a review a couple of days later is enough; there is no need for 30-day gaps on motor items. Use Leitner/FSRS gaps for facts only (see 4.6). |
| **Sleep and overnight gains** | Walker et al. 2002 reported a **20%** overnight speed gain on finger tapping. Rickard, Pan & Gupta 2022 re-analysed 88 effect sizes and found "pronounced publication bias" and concluded "**there is no consolidation-based, absolute performance gain following sleep**." Duke et al. 2009: an early 5-minute rest break during training gave the largest overnight gains (two small experiments). | **Weak and contested.** Round one's line "gains only with a 24-hour gap, which suggests sleep matters" should be softened: day gaps help (Simmons 2011, Katz 2025), but "sleep makes you better" is not established. | Keep "come back tomorrow" as advice, framed as spacing, not as a sleep promise. A short break early in a session is cheap and harmless. |
| **Amount vs quality of practice** | Duke, Simmons & Cash 2009: 17 advanced pianists. Practice time and number of trials did **not** predict next-day performance; the share of *correct* trials did (r = −.71 with rank for complete trials; more incorrect trials predicted worse rank, r = .48). Macnamara & Maitra 2019 failed to replicate Ericsson's violinist finding; the practice effect was "substantial, but considerably smaller." Macnamara et al. 2014 meta: practice explains ~21% of music performance variance (round one). | **Moderate (small samples, consistent direction).** | Measure *clean reps*, not minutes. In Play steps, the default tempo should be one where the learner is mostly right: lower the bpm automatically after misses (with the mic) or ask "clean?" after each pass. Show "clean passes" in Progress alongside minutes. |
| **Slow practice** | No controlled study we found tests "practise slowly then speed up" for guitar. Indirect support: accuracy during practice predicts retention (Duke 2009). Troy Grady argues the opposite risk: some fast picking motions are different movements from slow ones, so very slow practice does not always transfer (see 2.1). | **Expert consensus, little direct evidence.** | Default to slow-and-clean for chord changes, scales and melodies; for picking-speed work, add short "speed bursts" at target tempo (Grady). |
| **Chunking** | Chunking is well documented in sequence learning (e.g., baboons form fewer, longer chunks with practice, Tosatto et al. 2024; review, Ding 2025). No music-teaching trial checked. | **Strong as a description of how sequences are learned; untested as a teaching method.** | Teach riffs and melodies in 1–2 bar chunks, loop each, then join (the play-along already loops bars). |
| **Mental practice** | Toth et al. 2020 re-ran Driskell et al.'s 1994 meta-analysis on 37 newer studies: "small but significant positive effect" (**r = 0.131**) after publication-bias checks. | **Small, real.** Not a substitute for physical practice. | Offer an optional "away from the guitar" review: see the shape, hear it, tap it on screen. The app's tap tasks already are a form of this. |
| **Feedback frequency** (reduced, summary, bandwidth) | The "guidance hypothesis" (Winstein & Schmidt 1990) says feedback after every trial helps now but hurts later. McKay et al. 2022 meta-analysis: 61 papers, k = 75, N = 2,228: "**no significant effect of reduced feedback frequency at any time point**." | **The textbook rule is not supported.** | No need to withhold feedback. Give immediate right/wrong in drills (good for retrieval). For playing, prefer *summary* feedback after a pass ("2 misses, both on the B string") because it is less distracting, not because of the guidance hypothesis. |
| **Focus of attention** | Chua et al. 2021 meta: external focus beat internal focus for retention, g = 0.58. McKay et al. 2024 bias-corrected re-analysis of the same data: **g = 0.01 to 0.15**, with Bayes factors favouring no effect. Music: Duke et al. 2011 (16 music majors) found focusing on the sound was most accurate. | **Contested; probably small.** | Cue the *sound* ("make the note ring clearly") rather than finger mechanics where that is natural; it costs nothing. Don't promise it works. |
| **Self-controlled practice and "enhanced expectancies"** | McKay et al. 2022: after bias correction, effects are "small, uncertain, and potentially null"; average study power was 6%. | **Not supported.** | Letting learners choose is still good for motivation (see 3.2), but do not expect it to speed learning. |

### 3.2 Motivation, habits and quitting

**The "90% quit" claim: primary source and verdict.**
- The figure comes from **Fender CEO Andy Mooney** in interviews. In a GAMA Q&A dated 7 March 2019 he said: "90 percent of those first-time players abandon the instrument in the first year, if not the first 90 days," and "45 percent of all of the guitars that we sell every year go to first-time players." He described the source only as "an update and expansion of research we did three years ago in the US." He also said that cutting abandonment by 10% could "double the size of the entire market," and that players who stay have "a lifetime value of $10,000 or more."
- Yahoo Finance (4 Nov 2019) and Live for Live Music (20 Nov 2019) repeat the 90% from Mooney's talks. Neither describes a method or sample. A 2017 Forbes interview reportedly gave **95%** (**unverified**: Forbes returned 403; seen only in a search summary).
- Fender's published 2018 study (with Egg Strategy and Daniel Levitin, US and UK) reported motives, not dropout: "72% of the respondents said they picked up the guitar to gain a new life skill or to better themselves," 61% wanted to play songs for personal enjoyment, and video tutorials ranked as the most useful resource, above private lessons (Digital Music News). No sample size was given.
- **Verdict:** an unpublished company estimate from a guitar maker selling a lesson subscription. There is no published method, no definition of "abandon" and no sample size. Use it as "Fender says", never as a statistic. We found **no peer-reviewed dropout rate for adult guitar learners**.

**What research on quitting music does say** (all school/child samples, so the transfer to adult self-learners is an assumption):
- Evans, McPherson & Davidson 2012 (a 10-year longitudinal cohort): ceasing was associated with lower **competence, relatedness and autonomy** than when the same people were most engaged. Their open-ended reasons matched these three needs.
- Wieser et al. 2024 (N = 140, Austria): satisfying those three needs predicted autonomous motivation, which was negatively associated with tendency to drop out.
- Kavčič Pucihar et al. 2024 (Slovenia, qualitative): **"music theory and solfège"** lessons were among the most prominent external reasons for dropout, along with competing commitments and the teacher's approach. This is a warning for a theory-led app: theory has to feel useful on the instrument right away.

**Habits and streaks**
- Lally et al. 2010 (96 volunteers, daily behaviour for 12 weeks): time to reach 95% of peak automaticity ranged **18 to 254 days**. "**Missing one opportunity to perform the behaviour did not materially affect the habit formation process.**" Habits formed best with a consistent context (e.g., "after breakfast").
- Silverman & Barasch (seven studies, SSRN 2022): showing an *intact* streak increases engagement compared with showing a *broken* one, and the drop is softened when people can "repair" a broken streak.
- Gollwitzer & Sheeran 2006 (94 independent tests): if-then plans ("When I finish dinner, I'll do 10 minutes of review") had a **d = .65** effect on goal attainment.
- Forum evidence (1.2): some adults find streak nagging off-putting.

**How to apply it**
1. **Forgiving streaks.** Count practice days per week ("4 of 7 days") as the main number, keep the consecutive-day streak secondary, and offer a free weekly "repair". Lally shows a missed day does no harm, and Silverman & Barasch show repair limits the damage of a broken streak. No loss-framed notifications.
2. **An if-then plan at onboarding.** "When will you practise? After ___." Then a gentle reminder at that time (if notifications are added).
3. **Make competence visible.** Before/after recordings, clean-tempo graphs, "you can now play X". This targets the competence need that predicts staying.
4. **Autonomy.** Let users choose a style track (blues, folk, pop) and a song goal at the start. Fender's data says the main motives are life skill and playing songs for fun, not theory.
5. **Relatedness.** Hard for a solo app. Cheap options: share a recording, duet play-alongs (the app plays the other part), or a later community feature.
6. **Plateaus.** No good guitar-specific data was found. Practical response: when accuracy has been flat for 2 weeks on an item, switch the drill type (variability) or lower the tempo and rebuild.

### 3.3 Evidence table

| Principle | Type of evidence | Effect size (as published → bias-corrected where available) | Confidence for guitar |
|---|---|---|---|
| Retrieval practice | Many experiments and reviews (round one) | Large in verbal learning | High for facts, assumed for motor |
| Spacing, days apart | Meta-analyses (verbal); music: Simmons 2011 (n = 29), Katz 2025 | Large (verbal); positive in two music studies | Medium–high |
| Spacing, minutes apart | Wiseheart 2017 | None | Don't rely on it |
| Interleaving / contextual interference | Brunmair & Richter 2019; Brady 2004 | g = .42; ES .38 (applied .19) | Medium |
| Correct reps over time spent | Duke et al. 2009 (n = 17) | r = −.71 | Medium |
| Mental practice | Toth et al. 2020 (37 studies) | r = .13 | Medium (small) |
| Implementation intentions | Gollwitzer & Sheeran 2006 (94 tests) | d = .65 | Medium (not tested in music) |
| Sleep-specific gains | Walker 2002 → Rickard et al. 2022 | 20% → none | Low |
| External focus | Chua 2021 → McKay 2024 | g = .58 → .15 | Low |
| Reduced feedback frequency | McKay et al. 2022 | none | Low |
| Self-controlled practice | McKay et al. 2022 | small → possibly null | Low (but keep choice for motivation) |

---

## 4. Every app module

### 4.1 Instrument view
- **What others do:** Fender Play and Yousician have no theory explorer of this depth. muted.io toggles notes, intervals and degrees (round one). Ultimate Guitar's tab player offers a Fretboard view and left-handed layout (UG help page).
- **Improvements:**
  1. **Scale-system views:** CAGED (exists as position view), **3NPS**, and **one string** (Goodrick's "ice skating"). These answer the most common forum question (2.2).
  2. **Triad string-set filter:** show only major/minor triads on strings 3-2-1, 4-3-2, etc., with inversions labelled (the forum's favourite route to the neck, 1.2).
  3. **"Chords of the key" strip:** tap I–vii° to see each chord's triads light up inside the current scale. This joins Instrument to Level 4–5 content.
  4. **Hide-and-reveal mode:** dots hidden until tapped, which turns any view into retrieval practice.

### 4.2 Guided Learn path
- **What others do:** JustinGuitar's modules each end with a practice routine and self-assessed milestones, and students "finish Grade 1 in 6-8 weeks" at "4 times a week for 20 minutes". Fender Play gates by stage. Yousician uses a level path. Reddit: "You'll improve if you follow the videos... in the correct order" (1.2).
- **Research:** retrieval and spacing (round one). Self-determination studies: competence, autonomy and relatedness predict continuing (3.2). Theory lessons that feel irrelevant are a dropout reason in music schools (Kavčič Pucihar 2024).
- **Improvements:**
  1. Apply the level tables in 2.3 (Hands and Rhythm strands, two moves, one merge, two adds).
  2. **End each level with a "routine" card** ("for the next week: 3 min changes, 5 min review, 5 min play-along"), like JustinGuitar's end-of-module routines.
  3. **A style choice after Level 2** (blues / folk / pop) that only changes which PD/original pieces and backing grooves appear, as Guitar Tricks does with style courses.
  4. **Placement quiz:** add 3 self-report hands questions ("Can you change G→C in time at 60 bpm?") so a player who knows theory but not chords, or the reverse, lands in the right place for each strand.

### 4.3 Drills
- **Existing:** note finder, hear-it-find-it over a drone, interval trainer.
- **Research:** interleave similar items (Brunmair & Richter, g = .67 for highly similar visual categories, .34 for maths). Block when new. Measure correct reps (Duke 2009).
- **Add these drills** (each is small):
  1. **One note everywhere:** "find every G, one per click" (Stack Exchange 1621).
  2. **Triad inversions:** one string set, one quality, three inversions; untimed, then tempo-gated (60 → 72 bpm).
  3. **Chord-change timer:** 60 seconds, the learner enters a count, the app charts it (JustinGuitar's "30 changes in 1 minute").
  4. **Rhythm tap:** tap along with patterns, get ms early/late (2.5).
  5. **Bass direction:** hear two chords and say whether the bass goes up or down, as a first step to progression ear training (4.8).
  6. **Name the shape's root:** a CAGED shape lights up; name the root (2.2).

### 4.4 Practice tools (metronome, timer, routines, log)
- **What others do:** JustinGuitar's "Practice Assistant" tracks progress on exercises across sessions. Guitar Pro's and Soundslice's **speed trainers** raise tempo each loop. Soundslice lets you set initial speed, final speed, step size and passes per speed, and can "play a count-in before each loop" that "will use the tempo of the upcoming iteration."
- **Research:** correct reps over time (Duke 2009). If-then plans, d = .65 (Gollwitzer & Sheeran 2006). Day-scale spacing for motor items (3.1).
- **Improvements:**
  1. **Auto-built daily routine** from what is due: hands (3 min) → review (5 min) → today's lesson (5 min) → play-along (2–5 min). The timer already supports routines; fill them automatically.
  2. **Metronome speed trainer:** start/end bpm, step, passes per step, and a count-in before each pass (Soundslice's model).
  3. **"Clean bpm" log per exercise:** the highest bpm marked clean, charted over weeks. This is the motor-skill equivalent of a review box.
  4. **Onboarding if-then plan:** "When will you practise? After ___."

### 4.5 Play-along
**What the leading players offer** (from each product's own pages):

| Feature | Songsterr Plus | Guitar Pro 8 | Ultimate Guitar tab player | Soundslice | Fretboard Lab today |
|---|---|---|---|---|---|
| Speed change without pitch change | Yes (Plus) | Yes; speed trainer 10–300% | −10% to 150% ("Tempo") | Yes | 50–150% |
| Loop a section | Yes (Plus) | Yes | Yes | Yes | Yes (tap bars) |
| Progressive speed trainer | not listed | Yes ("increases... speed with each repetition") | not listed | Yes, with count-in per pass | **No** |
| Count-in | not listed | Yes, including between loop passes | Yes | Yes | Yes |
| Solo/mute tracks | Yes (Plus) | Mixer (not verified) | Backing track on/off | — | **No** (single line) |
| Notation option | not listed | (not verified) | Yes ("Notation" setting) | Yes | **No** |
| Fretboard view / left-handed | not listed | Fretboard view (not verified) | Yes / Yes | — | Instrument view exists, not linked to tab |
| Synced original audio | Yes (Plus) | Audio track | Backing track | Yes | Synth only |
| Transpose / pitch shift | Pitch shift (Plus) | — | Transpose; pitch ±5 semitones | — | **No** |

Yousician's "note highway" with microphone scoring is the other model. Round one found its detection complaints were the top user complaint, so we do not recommend copying it as a gate.

**Improvements, in priority order**
1. **Speed trainer on loops** (start %, end %, step, passes per step, count-in each pass). Small, and every serious player has it.
2. **Rhythm under the tab** (note-length bars or stems) and an optional **standard-notation line**. Durations are already stored.
3. **Live fretboard under the tab:** the current note lights on a mini fretboard with interval labels relative to the current chord. This is unique, and it ties play-along to theory.
4. **Two-part tabs** (melody + chords or bass) with mute/solo, so learners can play either part over the other.
5. **Chord symbols and Roman numerals above the tab** for every PD piece, so each play-along is also an analysis lesson.

### 4.6 Daily review: Leitner vs SM-2 vs FSRS

**Evidence from the open SRS benchmark** (open-spaced-repetition/srs-benchmark: about 10,000 Anki users and 350 million evaluated reviews; lower log loss and RMSE are better):

| Algorithm | Log loss | RMSE (bins) | AUC | Source version |
|---|---|---|---|---|
| FSRS-6 (21 parameters, fitted per user) | 0.321 | 0.046 | 0.706 | README, June 2025 commit `f0cc6814c0` |
| FSRS-6 with default parameters (no fitting) | 0.339 | 0.072 | 0.689 | same |
| Constant baseline ("AVG", the user's average recall) | 0.363 | 0.088 | 0.509 | same |
| Anki's SM-2 variant | 0.490 | 0.128 | 0.597 | same |
| SM-2 (original) | 0.547 | 0.148 | 0.601 | same |
| Leitner | **not benchmarked** | — | — | — |

The current README (Sept 2026) has moved on to FSRS-7 and neural models and no longer lists SM-2. FSRS-6 there scores log loss 0.346, and FSRS-7 0.340.

**What the docs say**
- **SM-2** (Woźniak, 1990): grades 0–5; intervals 1 day, then 6 days, then the previous interval × E-Factor; EF never below 1.3; a grade below 3 restarts repetitions. It is fixed, with no per-user fitting.
- **Anki's manual:** FSRS is "an alternative to Anki's legacy SuperMemo 2 (SM-2) algorithm." Default desired retention is 90%, and workload rises steeply above that. FSRS may perform poorly with "less than a few hundred" reviews, and re-optimising "once every month is sufficient."
- **Library:** `ts-fsrs` (MIT licence, supports ES modules, CommonJS and UMD, actively maintained; latest version 6.0.0 on npm/jsDelivr) works in a no-build web app.

**Verdict**
- **Do not switch to SM-2.** In this benchmark it predicted recall worse than a constant guess.
- **Leitner is acceptable as a first version** for a small deck. It is transparent and the current rules (quick correct moves up at most once a day, slow correct stays, wrong goes to box 1) are sensible. But it was not benchmarked, and fixed gaps (1/3/7/14/30) ignore how hard each item is for this learner.
- **Move fact-like items to FSRS** (note at a fret, interval shape, chord spelling, degree name, key signature) once the learner has a few hundred reviews. Use default parameters until then: FSRS-6 with default parameters still beat SM-2 and the constant baseline. Map answers: wrong → Again, slow correct → Hard, quick correct → Good, quick correct on an "easy" streak → Easy.
- **Don't use flashcard scheduling for motor items** (chord changes, scale at tempo, riffs). The benchmark is built on flashcard data, and motor learning gains from day-scale gaps without needing 30-day intervals (3.1). Use the clean-bpm ladder (4.4) and bring each motor item back every 2–7 days, staying near the edge of clean tempo.
- **Ear items (degrees, intervals by ear):** schedule at the *category* level (e.g., "b3 vs 3 in a key") rather than per audio example, and interleave similar categories (Brunmair & Richter). This is our extrapolation; no benchmark covers perceptual categories.
- **Caveat:** all benchmark data comes from Anki users studying mostly verbal flashcards. Calibration on guitar facts is an assumption.

### 4.7 Progress
- **What others do:** Yousician's profile shows a "streak timeline, badges and activity report" (yousician.com). JustinGuitar's milestones are skills (changes per minute, a strumming pattern at 80 bpm, 5 songs).
- **Research:** competence feelings predict continuing (Evans et al. 2012). Showing an intact rather than broken streak raises engagement, and "repair" softens the damage (Silverman & Barasch). A missed day does not hurt habit formation (Lally).
- **Improvements:**
  1. **Skill milestones over badges:** "30 changes/min (G↔C)", "major scale clean at 90 bpm", "names any note on strings 6–5 in under 2 s".
  2. **Practice days per week** as the headline habit number. Keep the streak, with a weekly repair.
  3. **Before/after recordings** (optional mic, stored locally) at the start and end of each level.
  4. **Clean-bpm graphs** per technique item.
  5. Keep the heat map and weakest items, which are already strong.

### 4.8 Ear training (planned tab)

**What to train, in what order, and how strong the evidence is**

| Order | Skill | Evidence | Notes |
|---|---|---|---|
| 1 | **Scale degrees in a key** (drone or cadence, then a note; answer by tapping the fret) | Scale-degree listening is how moderately experienced listeners code tonal melodies (Dowling 1986, reviewed by Lake). Diatonic context gives a significant but small accuracy gain for pitch intervals over no context (Graves Jackson & Oxenham 2017). The Functional Ear Trainer ("distinguish between tones in the context of a particular musical key", 4.9★ from 3.9K ratings) is built on this. The forum supports it (1.2). | The app already does this (hear-it-find-it). Start with 1-3-5, then add 2, 4, 6, 7, then chromatic degrees. |
| 2 | **Intervals, melodic then harmonic**, with confusable pairs together | Interval strategies suit atonal or tonally vague material; scale-degree strategies suit tonal melodies; the best listeners use both flexibly (Lake). One small 2-week online interval training study found "only a small effect of training on interval identification" (Bissmeyer et al. 2022). | Keep the interval trainer, but teach intervals inside melodies (PD reference tunes, 2.6) and in a key. |
| 3 | **Chord quality** (major / minor / diminished / dominant 7) | No controlled study found. | Pairs with Level 4. Start with major vs minor only. |
| 4 | **Bass motion, then progressions** (I–IV–V, I–V–vi–IV, the ♭VII) | Forum: "music is notes moving over chords... Learn chord movements first" (1.2). Hooktheory frequency data says which to learn first. | Pairs with Level 5. |
| 5 | **Short melodic dictation** (2–4 bars of PD tunes; answer on the fretboard) | Lake recommends a sequence: isolation drills → "target practice" (spot a target degree inside a melody) → full context. | The answer method (tap frets) is Fretboard Lab's advantage: no notation needed. |

**General design:** short daily sets (the Functional Ear Trainer's own claim is 10 minutes a day; that is the developer's claim, not evidence), interleaved categories, answers by fretboard tap or by playing (optional mic), and a "resolve to the tonic" sound after each answer.

### 4.9 Planned: AI lessons, accounts, monetisation
- **AI custom lessons:** no research reviewed. Product judgement: generate lessons only from the app's own theory engine (the lesson kit already computes note names), so that every note name and interval shown is computed, not generated text. Use AI to *choose and sequence* existing drills from the learner's weak spots rather than to write theory.
- **Accounts and sync:** needed before FSRS per-user fitting is useful across devices. Export/import already exists.
- **Monetisation:** the evidence still points the same way as round one. The most-upvoted app post on r/guitarlessons in our sample (738 points) was praised for being "free with no in-app purchases". Marty Music advertises one-time purchases ("No memberships, no recurring"). Functional Ear Trainer is free plus a $19.99 one-time upgrade. Tenuto is $4.99 one-time (round one). A rant about JustinGuitar's app turning toward XP-style gamification drew agreement (1.2). Recommendation: free core path and drills; a one-time or low annual "supporter" tier for extras (more PD/original tracks, sync, AI routines); no auto-renew tricks.

---

## Sources

All opened during this pass. Reddit threads were read through the Arctic Shift archive API (https://arctic-shift.photon-reddit.com/api), which returns the original post and comment text. Stack Exchange answers were read through api.stackexchange.com. Study abstracts were read through Europe PMC, Crossref or Semantic Scholar where publisher pages blocked access, and the DOI link is given.

### Courses and methods
- JustinGuitar Beginner Grade 1 (archived 2026-11-04): http://web.archive.org/web/20261104223637/https://www.justinguitar.com/classes/beginner-guitar-course-grade-one
- JustinGuitar Beginner Grade 2 (archived 2026-11-04): http://web.archive.org/web/20261104222737/https://www.justinguitar.com/classes/beginner-guitar-course-grade-two
- JustinGuitar Beginner Grade 3 (archived 2026-11-07): http://web.archive.org/web/20261107223945/https://www.justinguitar.com/classes/beginner-guitar-course-grade-three
- JustinGuitar Intermediate (archived 2026-11-04): http://web.archive.org/web/20261104223637/https://www.justinguitar.com/classes/intermediate-guitar-course-grade-four
- Fender Play (archived 2026-10-11): http://web.archive.org/web/20261011052937/https://www.fender.com/play
- Guitar Tricks Core Learning System (archived 2025-08-26): http://web.archive.org/web/20250826185856/https://www.guitartricks.com/core-learning-system
- Marty Music (archived 2026-10-17): http://web.archive.org/web/20261017041905/https://www.martymusic.com
- TrueFire guitar lessons: https://truefire.com/guitar-lessons/
- Troy Grady, Pickslanting Primer: https://troygrady.com/primer/
- Troy Grady, The Cracking the Code Story: https://troygrady.com/about/cracking-the-code-story/
- Troy Grady forum, "Learning at Warp Three Speed": https://forum.troygrady.com/t/learning-at-warp-three-speed/92078
- Hal Leonard, The Advancing Guitarist (Goodrick): https://www.halleonard.com/product/603009/the-advancing-guitarist
- Brent Baldwin, Mick Goodrick and the Advancing Guitarist: https://www.brentbaldwinmusic.com/black-market-measures/mick-goodrick-and-the-advancing-guitarist
- Hooktheory, common chord progressions: https://www.hooktheory.com/theorytab/common-chord-progressions

### Forums
- r/guitarlessons, "How do you memorize the fretboard...": https://www.reddit.com/r/guitarlessons/comments/1w6h8th/
- r/guitarlessons, "What was the one piece of guitar theory...": https://www.reddit.com/r/guitarlessons/comments/1u3g2rz/
- r/guitarlessons, "Struggling with CAGED": https://www.reddit.com/r/guitarlessons/comments/1to1sgy/
- r/guitarlessons, "Understanding the fretboard for improvisation... CAGED and 3NPS": https://www.reddit.com/r/guitarlessons/comments/1c9p5ns/
- r/guitarlessons, "The 7-shape Berklee scale system": https://www.reddit.com/r/guitarlessons/comments/138rkxu/
- r/guitarlessons, "Has anybody actually tried justinguitar and improved?": https://www.reddit.com/r/guitarlessons/comments/1f6w3yd/
- r/guitarlessons, "Rapid enshittifaction of Justin Guitar (app)": https://www.reddit.com/r/guitarlessons/comments/1s3tvlo/
- r/guitarlessons, "Why is ear training so ... hard?": https://www.reddit.com/r/guitarlessons/comments/1f0f6t0/
- r/guitarlessons, "How I practice triads": https://www.reddit.com/r/guitarlessons/comments/1r1ieot/
- r/guitarlessons, muting tip: https://www.reddit.com/r/guitarlessons/comments/xvdunx/
- r/guitarlessons, "I built a free app to help visualize the fretboard": https://www.reddit.com/r/guitarlessons/comments/1qnwjag/
- Music SE 1621, learning the notes on the fretboard: https://music.stackexchange.com/questions/1621/
- Music SE 82611, is CAGED the main way: https://music.stackexchange.com/questions/82611/
- Music SE 37964, what's CAGED good for: https://music.stackexchange.com/questions/37964/

### Learning science
- Brady 2004, contextual interference meta-analysis: https://doi.org/10.2466/pms.99.1.116-126
- Lage et al. 2022, serial vs random practice: https://doi.org/10.1123/jmld.2021-0020
- Brunmair & Richter 2019, interleaving meta-analysis: https://doi.org/10.1037/bul0000209
- Wiseheart et al. 2017, no spacing effect in piano learning: https://doi.org/10.1371/journal.pone.0182986
- Simmons 2011, distributed practice in musicians: https://doi.org/10.1177/0022429411424798
- Katz et al. 2025, spaced learning and melodic memory: https://doi.org/10.1177/03057356251401906
- Vardal et al. 2022, distributed practice in a MOBA game: https://doi.org/10.1371/journal.pone.0275843
- Ebersbach & Nazari 2020, no spacing effect for maths procedures: https://doi.org/10.3389/fpsyg.2020.00811
- Walker et al. 2002, sleep and motor skill: https://doi.org/10.1016/s0896-6273(02)00746-8
- Rickard, Pan & Gupta 2022, publication bias in sleep consolidation: https://doi.org/10.1037/xlm0001090
- Duke, Allen, Cash & Simmons 2009, early vs late rest breaks: https://doi.org/10.1111/j.1749-6632.2009.04795.x
- Duke, Simmons & Cash 2009, "It's Not How Much; It's How": https://doi.org/10.1177/0022429408328851
- Duke et al. 2011, focus of attention in music: https://doi.org/10.1177/0022429410396093
- Macnamara & Maitra 2019, deliberate practice replication: https://doi.org/10.1098/rsos.190327
- Toth et al. 2020, mental practice meta-analytic replication: https://pure.ul.ie/en/publications/does-mental-practice-still-enhance-performance-a-24-year-follow-u/
- McKay et al. 2022, reduced feedback frequency meta-analysis (preprint abstract): https://doi.org/10.31234/osf.io/v2cp7 (published: https://doi.org/10.1016/j.psychsport.2022.102165)
- Chua et al. 2021, external focus meta-analysis: https://doi.org/10.1037/bul0000335
- McKay et al. 2024, external focus bias-corrected re-analysis: https://doi.org/10.1037/bul0000451
- McKay et al. 2022, self-controlled practice and expectancies re-analysis: https://doi.org/10.31234/osf.io/3nhtc
- Tosatto et al. 2024, chunking and sequence length: https://doi.org/10.1007/s10071-024-01835-z
- Ding 2025, sequence chunking review: https://doi.org/10.1016/j.tics.2025.01.014
- UT Austin CML, Intelligent Music Practice: https://cml.music.utexas.edu/online-resources/intelligent-music-practice
- Repp & Su 2013, sensorimotor synchronization review: https://doi.org/10.3758/s13423-012-0371-2
- Rönnqvist et al. 2018, metronome training: https://doi.org/10.3389/fpsyg.2018.02469

### Motivation and dropout
- GAMA Q&A with Andy Mooney (2019): https://teachingguitarworkshops.org/gama-qa-with-andy-mooney/
- Live for Live Music (2019): https://liveforlivemusic.com/news/fender-new-guitarists-abandon-instrument-2019/
- Yahoo Finance (2019): https://finance.yahoo.com/news/fender-guitar-app-170710534.html
- Digital Music News, Fender 2018 study: https://www.digitalmusicnews.com/2018/10/17/new-guitar-female/
- Evans, McPherson & Davidson 2012: https://doi.org/10.1177/0305735612441736
- Wieser et al. 2024: https://doi.org/10.3389/fpsyg.2024.1378843
- Kavčič Pucihar et al. 2024: https://doi.org/10.3389/fpsyg.2024.1385840
- Lally et al. 2010, habit formation: https://doi.org/10.1002/ejsp.674
- Silverman & Barasch, broken streaks (SSRN): https://doi.org/10.2139/ssrn.4050655
- Gollwitzer & Sheeran 2006, implementation intentions: https://doi.org/10.1016/s0065-2601(06)38002-1

### App modules
- Songsterr Plus: https://www.songsterr.com/a/wa/plus
- Guitar Pro home: https://www.guitar-pro.com/
- Guitar Pro 8 docs, playback speed: https://www.guitar-pro.com/docs/gp8/audio/playback/speed
- Ultimate Guitar help, tab tools: https://help.ultimate-guitar.com/en/articles/14880177-what-are-tab-tools-and-how-to-use-them
- Soundslice help, speed training: https://www.soundslice.com/help/en/player/basic/286/speed-training/
- Yousician guitar page (archived 2026-11-10): http://web.archive.org/web/20261110040454/https://www.yousician.com/guitar
- SRS benchmark README (current): https://github.com/open-spaced-repetition/srs-benchmark
- SRS benchmark README (June 2025, with SM-2 rows): https://github.com/open-spaced-repetition/srs-benchmark/blob/f0cc6814c0/README.md
- SuperMemo SM-2 description: https://super-memory.com/english/ol/sm2.htm
- Anki manual, deck options (FSRS): https://docs.ankiweb.net/deck-options.html
- ts-fsrs: https://github.com/open-spaced-repetition/ts-fsrs
- Functional Ear Trainer (App Store): https://apps.apple.com/app/id1088761926
- Graves Jackson & Oxenham 2017, tonal context and interval perception: https://doi.org/10.3389/fpsyg.2017.01753
- Lake, "Interval and Scale-Degree Strategies in Melodic Perception", Journal of Music Theory Pedagogy (year not visible in the extracted text): https://journals.ou.edu/jmtp/article/download/778/1619/1609
- Bissmeyer et al. 2022, interval training: https://doi.org/10.3389/fnins.2022.903924
- MDN, AudioContext.outputLatency: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/outputLatency

### Songs and public domain
- Duke CSPD, Public Domain Day 2026: https://cspd.law.duke.edu/publicdomainday/2026/
- Wikipedia, Dorian mode: https://en.wikipedia.org/wiki/Dorian_mode
- Wikipedia, Mixolydian mode: https://en.wikipedia.org/wiki/Mixolydian_mode
- Wikipedia, Amazing Grace: https://en.wikipedia.org/wiki/Amazing_Grace
- Wikipedia, Joy to the World: https://en.wikipedia.org/wiki/Joy_to_the_World
- Fretboard Lab's own tabs (pitch content computed from js/playalong/*.js)

## Tried but could not access
- justinguitar.com and community.justinguitar.com (live): Cloudflare 403. Used archived copies instead. The "practical music theory" class page had no recent archive.
- reddit.com, old.reddit.com, api.reddit.com: 403 or empty app shell. Used Arctic Shift instead. PullPush API: rate-limited ("does not provide free scraping resources for agents").
- jazzguitar.be forum, umgf.com, guitartricks.com forum and guitartricks.com core page (live), The Gear Page (challenge page): blocked.
- classcentral.com (JustinGuitar syllabus mirror): 403.
- fender.com/play/paths (live), Fender support centre: 403. Used the archived fender.com/play page.
- Forbes 2017 Fender interview ("95%" figure): 403. The figure is **unverified**.
- MusicRadar "90% of beginner guitar players give up" article: page body cut off.
- Rolling Stone (paywall redirect) and NPR transcript (timeout) on the Fender 2018 study.
- PubMed pages (cookie wall). Used Europe PMC and Crossref for abstracts.
- Full texts and numeric results of Driskell et al. 1994, Donovan & Radosevich 1999, Lee & Genovese 1988, Winstein & Schmidt 1990, Simmons & Duke 2006: abstracts unavailable, so they are not used as evidence beyond being named.
- Alfred (Chord Chemistry) and Music Junction (Advancing Guitarist) pages: 429 Too Many Requests. jazzguitarlessons.net review: 403.
- Steve Vai Guitar Workout (Hal Leonard page loaded without a description). No player interview on "how I learned the neck" was verified.
