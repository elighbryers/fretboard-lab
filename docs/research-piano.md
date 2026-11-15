# Fretboard Lab: Piano / Keyboard Research

_Researched 2026-11-14 to 2026-11-15. Every source under Sources was opened. Claims I could not check against an opened page are marked **unverified**. Companion to `docs/research-findings.md` (guitar, round one)._

## Summary

- **Methods agree on the start, disagree on reading.** Faber, Alfred and Berklee all begin with finger numbers, black-key orientation and five-finger positions (C, G, Middle C). Thumb-under scales come later (Faber unit 12 of 16), and primary chords I–IV–V7 close the first book. The split is reading-first (Faber intervallic, Alfred Middle C) vs chords-first (Alfred Adult "chord approach", Scott Houston, Berklee Piano Chords 101, Pianote's pop progression in stage 1). The only comparison study found, a small 2019 thesis on children, favoured Middle C reading. **Recommendation: a chords-and-lead-sheet spine with a light reading track running alongside**, which suits a theory app.
- **Theory order matches guitar.** Major scale → intervals → triads → inversions/voice leading → progressions → improvising. About 24 of 42 proposed lessons can share theory content with guitar if lessons are stored in pitch terms.
- **Piano practice evidence (small but direct):** how you practise beats how long (Duke, Simmons & Cash 2009: practice time didn't predict next-day results; % of clean run-throughs did, r = −.71). The best pianists played hands together early, fixed errors at their exact spot and changed tempo sensibly. Sleep between sessions improved keyboard accuracy (Simmons 2011). Random-order practice won on a 2-day test even though pianists believed the opposite (Abushanab & Bishara 2013).
- **Falling notes help novices start faster but don't teach reading** (Rogers et al. 2014: n = 56 and n = 18; learners said "You do not learn sight-reading").
- **Competitors** (Simply Piano, flowkey, Skoove, Yousician, Playground Sessions, Piano Marvel, Synthesia, Pianote, Melodics) are song-followers. Users complain about billing, mic detection (especially chords), songs disappearing, and missing theory/reading. None makes chords, voicings, lead sheets and improvising a measured core skill.
- **Technology:** good free samples exist (Salamander CC BY 3.0, 2 MB web subset; Splendid Grand, public domain, ~20 MB full web set; Iowa "without restrictions"); **smplr** (MIT) is the best loader. **Web MIDI does not work on any iPhone/iPad browser or in Safari** (WebKit cites fingerprinting), so iPhone users must tap or use the mic. Polyphonic mic detection is unreliable and must never block progress. Bluetooth adds ~100–200 ms, so rhythm scoring needs calibration.
- **Effort: medium.** The engines (lessons, review, drills, metronome, progress) carry over; the new work is a keyboard renderer, a sample loader, notation rendering, a piano play-along view and about 18 piano-specific lessons.

## A. Curriculum order

### A1. What the courses teach, and in what order

| Course | Topic order (abbreviated) | What's taught first | Confidence |
|---|---|---|---|
| **Faber, *Adult Piano Adventures All-in-One Book 1*** (16 units, 184 pp.) | U1 Introduction to playing (black-key pieces "Raindrops", "Thunder"; C pentascale warm-up) → U2 Orientation to the staff → U3 Reading reinforcement → U4 More staff reading → U5 Bass clef reading → U6 Eighth notes → U7 Treble space notes F-A-C-E → U8 Treble C pentascale → U9 G pentascales in 3 locations → U10 Sharps and flats → U11 Intervals: 4ths, 5ths, 6ths → U12 C major scale → U13 G7 chord → U14 Primary chords in C → U15 G major scale → U16 Primary chords in G | Finger numbers and black-key groups, then playing by ear/rote before the staff | High (publisher's unit list, pianoadventures.com/qr/ff1302) |
| **Faber reading philosophy** | Note recognition + intervallic reading taught together; five-finger positions build "visual, kinesthetic, and aural pattern recognition"; multi-key (D, A, minor five-finger patterns) at Level 2A of the children's course | Intervals/patterns alongside note names | High (Faber's "Pattern Recognition" article) |
| **Alfred's Basic Piano Library** (children's Complete Level 1, publisher overview) | Black keys (finger numbers) → white keys in Middle C position (letter-notes) → grand staff, C position → intervals 2nds–5ths in C position → G position, sharps/flats → Middle C on the staff, eighth notes → G position an octave higher, **pedaling** → Middle D position, half/whole steps → tetrachords, C and G major scales | Black keys, then Middle C position | High (alfred.com course overview) |
| **Alfred's Basic Adult Piano Course / Adult All-in-One Book 1** | Publisher: "A beginning course for adults who prefer a **chord approach**"; "teaches chords for both hands"; All-in-One adds theory, technic and "a thorough explanation of chord theory." Repertoire is mostly folk/public-domain (Ode to Joy, Greensleeves, Aura Lee, Scarborough Fair, When the Saints, The Entertainer) | Chords for both hands alongside reading; the unit-by-unit order is **unverified** (only unofficial scans show it) | Medium (publisher pages; no official TOC) |
| **Hal Leonard Adult Piano Method Book 1** | Publisher: lessons, solos, technique and theory in one book, "step-by-step sequence designed with adult learners in mind," 150+ accompaniments with slow-down/loop player. Series promo: "Improvisation threaded throughout all levels" | **Unverified** (no TOC found) | Low |
| **Berklee Online, Berklee Keyboard Method** (12 lessons; requires 1 yr on an instrument and basic reading) | 1 Treble clef, finger numbers, five-note position C–G, thumb study → 2 Bass clef → 3 Grand staff, hands together → 4 Black keys/accidentals → 5 Independence between hands (blues) → 6 Major/minor triads, inversions, slash chords, harmonizing → 7 Diatonic triads, voice leading I–IV–V–I and I–V–vi–IV → 8 LH chords from lead sheets → 9 RH chords, comping → 10 LH shell voicings, ii–V–I → 11 Guide tones → 12 Three-part voicings, blues | Reading in a five-note position, then chords and lead sheets from lesson 6 | High (course page) |
| **Berklee Online, Piano Chords 101** | Major triads + inversions → minor → dim/aug → voice leading → maj7/7 → ear ID of qualities (midterm) → m7, m7b5 → dim7 → sus → add9/7sus4 → slash chords → styles. **Every lesson reads chords from a lead sheet** | Major scale and major triads with inversions | High |
| **Berklee Online, Private Piano Lesson Level 1** (no prerequisites) | Posture → major scales and root-position triad arpeggios → hands-together scales 4 octaves at 65 bpm in C, G, D, A, E, B → I–IV–V–I, I–vi–ii–V–I → notated piece + chord-symbol improvisation piece (RH melody, LH voice-led chords) | Posture, scales, triads | High |
| **Pianote / Musora piano method** (12 stages, ~400 lessons) | 1 Hands separately then together, note values, reading notes, first chord progression ("The Pop Progression") → 2 Grand staff/bass clef, chords + melody, intervals → 3 Triads, arpeggios → 4 A minor scale, hands together → 5 Major/minor chords, inversions, diatonic chords → 6 Rhythm, broken chords → 7 12-bar blues, key signatures, 7th chords, comping → 8 Clef landmarks, sight-reading → 9 Sus chords, chord charts → 10 Blues, pentatonic/blues scales → 11 Aug/dim → 12 Waltz, Alberti bass | Basics + reading notes + a pop progression in stage 1 | High for the current site (musora.com/piano). An older Musora FAQ (now 404) put reading in Level 5; the method has changed |
| **Scott Houston, *Play Piano in a Flash*** | RH plays the melody one note at a time; LH plays simple chords; "an absolute minimum of note-reading." Current online course: RH melody → simple LH chords C, F, G → combine | Melody + LH chords from a lead sheet | High for the approach (Hachette publisher page); course details from search snippet of pianoinaflash.com only (**unverified**) |
| **Bill Hilton** (billspianopages.com, *How to Really Play the Piano*) | Self-described focus: "Piano skills, music theory, improvisation, creativity and musicianship"; free beginners' course on YouTube | **Unverified** (no TOC found) | Low |

### A2. Where they agree
- **Five-finger positions first.** Every method that shows its order (Faber, Alfred, Berklee Keyboard Method) starts with finger numbers and a five-note hand position (C, then G, plus Middle C in Alfred). Scales with thumb-under come **later**: Faber unit 12 of 16, Alfred at the end of Level 1.
- **Black keys as orientation.** Faber and Alfred both start on black-key groups to learn finger numbers and the keyboard geography before letter names.
- **Order of theory matches the guitar findings.** Five-finger patterns → whole/half steps → major scale → intervals → triads → primary chords I–IV–V(7) → inversions and voice leading → 7th chords. Faber teaches intervals (unit 11) before the major scale (unit 12) but uses 2nds and 3rds from unit 3; Berklee Keyboard Method does triads in lesson 6 and diatonic progressions in lesson 7.
- **Primary chords (I, IV, V7) close the first book** in both Faber Adult and Alfred.
- **Pedaling comes late** (Alfred: second half of Level 1; Berklee: lesson 10 of Technique 101).

### A3. Where they differ: reading-first vs chords-first

| Approach | Who | Strength | Weakness |
|---|---|---|---|
| **Middle C** (both thumbs share Middle C; read note by note) | Older Alfred, partly Alfred Basic | Easy single-note naming | Ties fingers to notes; reading outside the position lags (common criticism) |
| **Intervallic / landmark** (read up/down/step/skip from a few landmark notes) | Faber ("intervallic reading is pattern recognition... not a substitute for note recognition") | Reading in "chunks," transposes easily | Note naming can lag |
| **Multi-key** (five-finger positions in many keys early) | Faber Level 2A; Berklee Private Lesson (C, G, D, A, E, B scales) | Builds key sense and theory | More to remember early |
| **Chords-first / lead sheet** (RH melody, LH chords from symbols) | Scott Houston; Alfred Adult ("adults who prefer a chord approach"); Berklee Chords 101; Pianote | Fast to "real" playing; matches pop and the app's theory focus | Classical reading not developed |

**Evidence on the debate is thin.** The one comparison found is a University of Ottawa master's thesis (DiCienzo 2019) on children aged 7–11. Contrary to the author's hypothesis, **Middle C students outperformed mixed-intervallic students on every test except keyboard identification and 3-note patterns in G position**. Participant numbers were not shown on the abstract page; it is a single small study of children, so treat it as weak evidence. No study comparing chords-first to reading-first for adults was found.

**What this means for the app.** The modern methods are converging on a hybrid: five-finger positions and reading in stage 1, chords and lead sheets very early (Pianote's first stage includes a pop progression; Berklee Keyboard Method reaches lead sheets by lesson 8). Fretboard Lab's strength is theory, so a chords-and-lead-sheet spine with **light staff reading running alongside** (landmark notes plus intervals, which reuses the interval lessons) fits the evidence and the gap in the market (see C).

### A4. Where technique fits
- **Posture and hand shape:** first lesson in every method (Berklee Private Lesson lists posture first; Faber has a "3-Minute Technique" section in every unit, per retailer listings, **unverified** on the publisher site).
- **Finger numbers:** first lesson everywhere (1 = thumb).
- **Hand independence:** Berklee devotes lesson 5 to it, after both clefs and the grand staff. Pianote does hands separately then together in stage 1.
- **Thumb-under scales:** after five-finger positions; Faber unit 12, Alfred end of Level 1, Berklee "thumb study" every lesson.
- **Pedaling:** late Level 1 or later.

## B. How people learn piano best

The general learning-science findings from round one still apply (retrieval: 61% vs 40% recall after a week, Roediger & Karpicke 2006; spacing: meta-analysis of 317 experiments, Cepeda et al. 2006; deliberate practice explains about 21% of the variance in music performance, Macnamara et al. 2014; see `docs/research-findings.md` §2). The studies below are the **piano/keyboard-specific** ones I could open.

| Finding | Study (opened) | Numbers | Strength | What the app should do |
|---|---|---|---|---|
| **How you practise beats how long.** Total practice time, total trials and complete run-throughs did **not** predict next-day performance. The share of correct run-throughs did. | Duke, Simmons & Cash 2009, *JRME* 56(4): 17 graduate/advanced piano majors learned 3 bars of Shostakovich, retested 24 h later (full PDF read) | No significant link with practice time. Rank correlated with % of all trials correct, r = −.51; % of complete trials correct, r = −.71; number of incorrect trials, r = .48 (negative r = better rank). Top 3 pianists: ≥20% of all starts were complete, correct performances | Moderate (small n, correlational, experts) | Set **goals, not minutes** ("3 clean runs at 70 bpm"), track the % of clean runs, and praise clean repetitions over raw counts |
| **What the best pianists did with errors.** All top 3: (A) played **hands together early**, (E) fixed errors immediately, (F) found the exact location and source of each error, (G) **varied tempo systematically, slowing down enough and not speeding up too much**, (H) repeated the spot until stable. When they changed tempo, the first try at the new tempo was nearly always right | Same paper, list A–K | None of the 14 lower-ranked pianists showed all three of F, G, H | Moderate | Practice tools: **tap a bar to loop it**, an auto "slow down 10% after a miss, speed up 5% after 3 clean runs" mode, and a "where did it go wrong?" marker |
| **Sleep consolidates accuracy.** Musicians learning a 9-note keyboard sequence in 3 sessions improved accuracy in session 2 **only** if the sessions were 24 h apart (with sleep); speed rose in all groups | Simmons 2011, *JRME*: 29 non-pianist music majors; gaps of 5 min (n = 9), 6 h, or 24 h (full PDF read) | 24-h group accuracy: F(2,18) = 4.92, p = .020, η² = .35; no change for 6 h or 5 min. Session 3 speed gain: +12 bpm for 6 h and 24 h groups vs +2 bpm for 5 min | Moderate (small, simple task) | Short daily sessions; "come back tomorrow" messaging; review the hard bar first thing next day |
| **Related sleep studies** | Simmons & Duke 2006 (sleep and a keyboard melody); Duke & Davis 2006; Cash 2009; Duke, Allen, Cash & Simmons 2009 (rest breaks) | Titles only seen on UT Austin's CML list; the Simmons & Duke 2006 PDF is a scan I couldn't extract. **Details unverified** | — | — |
| **Random (interleaved) order wins later, feels worse now.** Pianists practised melodies in fixed or random order. Fixed order was faster during practice; random order was faster on a test **2 days later**. Pianists wrongly predicted fixed order would be better | Abushanab & Bishara 2013, *Memory & Cognition* 41(6): n = 25 piano-trained participants (abstract via Epistemonikos) | Effect sizes not seen (full text not accessible) | Moderate | Mix pieces/drills in review once each is learned; tell the user mixed practice feels harder but sticks |
| **Mental practice helps, less than real practice.** Expert pianists practised a Brahms arpeggio exercise for 2 × 7 min either mentally (hand covered) or physically | Bernardi et al. 2013, *Frontiers in Human Neuroscience*: 3 groups × 8 pianists | Mental practice reduced wrong notes by T2 (p = .047); physical practice improved at T1 (p = .001) and T2 (p < .001) and had fewer errors than mental at both points | Limited (experts, n = 8/group) | Offer a "no instrument? listen and finger along on the table" mode as a supplement, never a replacement |
| **Hands together early** | Brown 1933 (self-study) and Rubin-Rabson 1939 (trained musicians), as summarised on a blog: hands together was "more efficient"; one hands-together run worth about two RH + two LH runs | Original papers not opened: **unverified**. Consistent with Duke et al. 2009 item A | Weak | Default to **hands separately briefly, then together soon**; let the user mute/auto-play either hand |
| **Falling notes speed up first attempts but don't teach reading.** Novices learning RH melodies did better with a piano roll projected onto the keys than with Synthesia (on-screen piano roll) or Finale (sheet music) | Rogers et al. 2014, Ulm University "P.I.A.N.O." (full PDF read): study 1 n = 56 novices, within-subjects; study 2 n = 18, 15 min/day for 5 days | Correct notes: projection > Synthesia, F(1,44) = 120.4, η² = .73; > sheet music, F(1,44) = 173.3, η² = .80. Lower cognitive load than both. Day 5: 88% correct durations. Learners said: "Without the system I would not be able to play the song", "You do not learn sight-reading" | Moderate for short-term playing; **no transfer test** without the display | Piano roll is the best on-ramp for playing a piece, but pair it with notation and chord symbols if reading is a goal |
| **Expert practice volume** | Ericsson, Krampe & Tesch-Römer 1993, pianist figures as retold by Hambrick et al. 2014 (search snippet only): expert pianists ~10,000 h of deliberate practice by age 20 vs ~2,000 h for amateurs | **Unverified** (didn't open the paper); Macnamara 2014 found practice explains a minority of the variance | — | Don't promise "X hours to mastery" |

**Reading strategies.** Faber's argument that reading in "chunks" (patterns and intervals) beats note-by-note reading is a pedagogical claim; the only comparison found (DiCienzo 2019 thesis, children) actually favoured the Middle C approach on most tests (see A3). Treat chunked/interval reading as reasonable, not proven.

**Things I looked for and did not find solid piano evidence on:** chunking (beyond Gruson 1988 cited inside Duke et al.: the best predictor of skill level was repeating larger sections rather than single notes), slow practice as a separate variable (only Duke's tempo variation), and the ideal session length for adult piano beginners. McPherson 2005 (157 beginning instrumentalists over 3 years, cited by Duke et al.) found strategy rather than time predicted achievement; the original was not opened.

**Bottom line for design:** short daily sessions with a sleep gap; goals measured in clean repetitions; error-spot looping with automatic tempo changes; hands-together soon; mixed review once items are learned; falling notes as a beginner aid but not the only notation.

## C. Existing apps and what users say

> **Coverage note.** Reddit is blocked to the fetch tool, and Piano World forum pages now redirect to a paywalled bot gateway (tollbit) that would not resolve, so forum quotes from Piano World below come only from search-result excerpts and are marked **unverified**. App Store and Trustpilot pages were opened. App Store pages show only a handful of reviews, so the quotes are a small sample.

| App | Model / format | Ratings seen | What people like | Most common complaints |
|---|---|---|---|---|
| **Simply Piano** (JoyTunes/Hello Simply) | Guided courses, falling notes then simplified staff; mic or MIDI; 2 free courses, $19.99–$179.99 in-app plans, auto-renew | App Store 4.7 (864K ratings). Trustpilot **1.8** (29 reviews, 66% one-star) | "The learning curve seemed almost non-existent"; 5-minute workouts; cheaper than lessons | **Billing**: "This is a subscription trap"; **detection**: "constantly does not pick up some notes", accepts wrong chords and rejects right ones with both hands; **thin theory**: mostly 4/4, "no key signatures beyond C major and A minor" (JustUseApp review summary); little timing feedback. No metronome during backing tracks (Guitar Chalk, 2026) |
| **flowkey** | Song library with pianist video + sheet music; wait mode, loop, hand select; mic or MIDI; $19.99–$179.99 plans | App Store 4.7 (66K). Trustpilot **4.0** (423 reviews) | **Wait mode** ("stops and waits for me if I hit a wrong key"); adult-feeling design; video of real hands | **Songs removed** ("they don't keep the songs"); mic struggles with chords; "keep yelling at you for one note"; only right/wrong feedback, nothing on dynamics or pedal for advanced players |
| **Skoove** | Structured lessons, mic/MIDI | Trustpilot **2.5** (74 reviews, 53% one-star) | Engaging, structured, "part of my daily morning routine" | Charged annual fee with no reminder; slow refunds; app locking; note recognition; wants tempo control on all steps and more sheet-music/exam material |
| **Playground Sessions** | Video teachers + interactive score + backing tracks, MIDI-focused | Trustpilot **4.1** (132 reviews, 73% five-star) | "Actual teachers (great teachers) breaking everything down"; "The backing tracks are AMAZING"; accuracy scoring; easy cancel | **Audio latency** on Windows ("unusable... due to audio latency"); loop markers hard to place; score highlights wrong notes; slow support; difficulty jumps in Rookie level |
| **Piano Marvel** | Method + 30,000-song library, **SASR sight-reading tests**, 18 levels; MIDI, newer mic option; $17.99 / $129.99 | App Store 4.7 (5.6K). Trustpilot: only 2 reviews (not meaningful) | Rating system gives "a good indication of exactly what you know"; "judged by a computer who does a pretty accurate job"; teachers/schools use it | Crashes, upload button missing on iPad, grace notes scored wrong, questionable fingerings, slow support |
| **Piano by Yousician** | Gamified falling tiles onto a staff; mic/MIDI; free 10 min/day | App Store 4.7 (23K) | Levels and progression; "guitar hero style tiles, falling from the top of the screen to the staff"; song variety | Detection ("50% of the time this app doesn't pick up my D note"); wants to be taught to read; no wait mode, "even [25% speed] is too fast"; "$169 a year... might as well hire a private teacher"; 10-minute free limit |
| **Synthesia** | Falling notes onto a keyboard, optional sheet music, wait mode, hands separate, finger hints, opens any MIDI file; 150 songs | Site lists "Unlock for $39 $29" (one-time not stated on page) | Cheap, flexible, works with any MIDI file | Forum consensus (search excerpts, **unverified**): visual rote learning, "it's all visual rote"; one user said even notation mode "pulls back my music sheet reading ability"; awkward hand position and fingering with no teacher |
| **Pianote** (Musora) | Video method, 12 stages, practice-alongs | Trustpilot **4.7** (69 reviews) | Friendly instructors; "knowing what to practice and short practice sessions has been the key"; own pace | "A lot of basic repetition"; "a mosh-mash of disconnected exercises"; camera angles |
| **Melodics** (keys + pads + drums) | Short rhythm-focused lessons with MIDI; subscription | App Store (iPad) 4.6 (402) | Good for rhythm, chords and melody on keys; works with USB MIDI | Yearly-only price; Feb 2025 forced "new key experience" broke paid songs without notice |

### Patterns across reviews (roughly most common first)
1. **Billing and paywalls**: surprise annual renewals (Simply Piano, Skoove), high yearly prices (Yousician $169), free limits (Yousician 10 min/day). Same as guitar.
2. **Detection that blocks progress**: microphone misses notes and especially chords (Simply Piano, flowkey, Yousician). Wait modes that stall on one note frustrate users. MIDI is far more reliable (Piano Marvel praised as "pretty accurate"), but Playground Sessions shows **latency** can ruin rhythm scoring.
3. **Song-following, not musicianship**: the leading apps teach you to follow falling notes or a score. Reviews ask to be taught to read ("teach how to read sheet music for beginners"), and an independent review says Simply Piano covers few key signatures. None of the consumer apps makes chords, lead sheets, voicings or improvising a core, measured skill, though flowkey has tutorials on "scales, chords, and improvisation."
4. **Content disappears** when licensed songs are removed (flowkey, Yousician, Melodics). Original and public-domain material avoids this entirely.
5. **No technique feedback**: no app can see hand position or fingering; forum posters blame self-taught apps for awkward hands (search excerpt, **unverified**).

### Gaps Fretboard Lab can fill
- **Theory-first piano that you play**: chords, inversions, voice leading, lead sheets and improvising over progressions as the main path, which Berklee teaches (A1) but consumer apps don't.
- **Honest assessment**: tap/MIDI as the main input, microphone optional and never blocking.
- **Reading as a parallel skill track**, not a gate: landmark-and-interval reading drills in the daily review, so learners who want to read can, without falling-notes dependence.
- **Owned content**: original and public-domain pieces only, so nothing vanishes.
- **Fair pricing** (same as guitar finding).

## D. Mapping every app module to piano

### D0. The key fact behind every design choice
On a guitar, one pitch has several places; on a piano, **each pitch has exactly one key**, and the layout repeats every octave. So piano needs no "position" or CAGED system, but it does need **hand position, fingering and two hands**. Theory is easier to *see* on keys (the scale pattern is visible in white/black keys), which makes the keyboard a strong theory display, even for guitarists.

### D1. Instrument view → Keyboard view

**How many keys fit.** A real white key is about **23.5 mm** wide; an octave spans 164–165 mm (Wikipedia, "Musical keyboard"). The comfortable touch target is **44 × 44 CSS px** (WCAG 2.2 SC 2.5.5, enhanced), with 24 px as the absolute minimum (SC 2.5.8). Apple's 44 pt guideline is widely cited but I could not load Apple's page (**unverified** from the source). Using white keys of 40–48 px:

| Screen | Usable width (typical CSS px) | White keys at ~44 px | Octaves | Recommendation |
|---|---|---|---|---|
| Phone portrait | ~360–430 | 8–10 | **~1¼** | Show one focus octave plus a few keys (e.g. C–E, 10 white keys). Add a thin **88-key mini-map** above it to drag the window. For two-hand material, **stack two rows**: LH range below, RH range above, each about an octave (like the split views in some synth apps; design suggestion, not from a source) |
| Phone landscape | ~740–930 | 17–21 | **~2½–3** | Default for "play" and play-along steps; prompt to rotate when a lesson needs two hands |
| Tablet | ~768–1366 | 17–31 | 2½–4½ | 3–4 octaves |
| Desktop | 1000+ | — | **4–7¼** | Default to 61 keys (5 octaves, C2–C7); option for full 88 |

Width figures are typical device widths, my estimate rather than a cited spec. On-screen keys on a phone are roughly 3× narrower than real ones, so **tapping is for answering and exploring, not for playing pieces with real fingering**. Playing happens on a real instrument (or MIDI).

**Scrolling and zooming.** Auto-scroll the window to the lesson's range ("focus" like the guitar `view: [0, 5]`), let a two-finger pinch/drag or the mini-map change it, and lock scrolling while a task is active so a slip doesn't scroll instead of tapping. Always label **Middle C** (C4) with a small marker, because every method uses it as the anchor (A1).

**Scales and chords on keys with the color code.** Keep the guitar code exactly: root pink, 3rd blue, 5th lavender, with "R/3/5" or note names **inside a dot near the front of the key** (round-one rule 3: labels on the instrument). Black-key dots need a light outline for contrast. Grey out keys outside the scale. The C major vs other-key pattern (which black keys are in) is the "aha" moment, so a "scale shape" toggle that shows W/H steps between keys reuses the Level 1–2 lessons.

**Hand position and fingering.** Finger numbers 1–5 are universal (A4). Show them as small numbers above the key (not inside the R/3/5 dot, which already carries meaning). Distinguish hands by **placement and outline, not color** (e.g. RH numbers above the keyboard, LH numbers below, or solid vs ring), so the color code stays reserved for chord function. Show a five-finger "hand bracket" over the five keys of a pentascale. P.I.A.N.O. researchers found fingering for **every** note overwhelmed beginners and showed only "important finger switches" (Rogers et al. 2014); do the same for scales (mark only thumb crossings).

**Inversions and voicings.** Show the three positions of a triad side by side with R/3/5 labels so learners see that the colors stay the same while the order changes. Animate **voice leading**: keys that stay put (common tones) remain lit, moving keys slide to the nearest chord tone. This is how Berklee teaches I–IV–V and I–V–vi–IV (A1). Later: LH shells (R–7, R–3) and RH three-note voicings (Berklee lessons 10–12).

**Left-hand patterns** (a selectable "LH pattern" menu for the drone/backing and play-alongs): root only → root + 5th → octave → broken chord → Alberti bass (Pianote stage 12) → boogie bass (Pianote stage 10) → shell voicings. Houston's book lists rolled chords, root-alone, root-and-fifth and arpeggios as the core LH ideas (table of contents snippet, **unverified**).

**What stays:** 31 scales, 27 chords, scale-over-chord, drone, heat map, tap to hear, player's view equivalents (no left-handed mode is needed for piano; instead offer "show LH/RH/both").

### D2. Guided Learn path
Same six-step lesson shape (hear, learn, see, try, play, check) and same engine. Changes:
- `board` becomes an instrument-neutral `view` (keys instead of string/fret). A `pos` becomes a MIDI note number plus optional `hand` and `finger`.
- The "play" step says "at your piano" and uses the metronome and hands-separate tools.
- Add a **technique card type**: a static hand-shape illustration with a three-item checklist ("curved fingers, loose wrist, thumb on the side tip"), since posture can't be judged by the app.
- Placement quiz: add "Can you read the treble clef? Bass clef? Do you know your major triads?" to place adults with prior lessons.

### D3. Drills (guitar → piano equivalents)

| Guitar drill | Piano equivalent | Notes |
|---|---|---|
| Note finder | **Key finder**: "Tap the F#", "Tap every D", "Tap the A above Middle C" | Same as musictheory.net's "Keyboard Reverse Identification" ("Identify the note by pressing a piano key") |
| — (new) | **Staff reader**: a note on the treble/bass/grand staff, tap the key. Teach landmarks (Middle C, treble G, bass F, high/low C) then intervals from them | Answers by tapping keys, not choosing letters, to keep retrieval tied to the instrument |
| Hear-it-find-it over a drone | Same: drone sets the key, a note sounds, tap its key; explain by scale degree | musictheory.net has "Keyboard Ear Training: Listen and press the piano key of the played note"; Fretboard Lab adds the key context and the "why" |
| Interval trainer | Shared engine; answer by tapping the two keys or naming | Same items as guitar |
| — (new) | **Chord builder / chord quality by ear**: "Build E♭ minor" (tap 3 keys), "Major, minor, dim or aug?" by ear, "Which inversion?" | Berklee Chords 101 makes ear ID of chord qualities a midterm topic |
| — (new) | **Key signature drill**: show signature, tap the tonic; circle of fifths | Shared theory with guitar |

### D4. Practice tools
- **Metronome**: shared as is.
- **Tempo trainer**: from Duke, Simmons & Cash 2009, the best pianists slowed down enough after errors and didn't speed up too much. Build "start at 60%, +5% after 3 clean runs, −10% after a miss."
- **Loop a bar / spot**: tap a bar to loop it (Playground Sessions users complain loop markers are hard to place; make it bar-snapped).
- **Hands separately / together**: mute or auto-play either hand. Default progression: RH, LH, then together early (Duke item A).
- **Practice timer routines**: piano routines (5-finger warm-up, scale of the week, chord progressions in 3 keys, reading 5 min, piece).
- **Practice log**: log goals hit ("3 clean runs at 80 bpm"), not just minutes (Duke 2009).

### D5. Play-along: piano roll vs sheet music vs chord chart

| Format | Evidence and opinion | Best use |
|---|---|---|
| **Falling notes / piano roll** | Novices played more correct notes and had lower cognitive load with a piano roll than with sheet music; projected onto the keys was best, Synthesia-style on-screen roll in between (Rogers et al. 2014, n = 56 and n = 18). Users and teachers worry about dependence and no reading ("You do not learn sight-reading"); forum posters call Synthesia "visual rote" (**unverified** excerpts). Yousician users like "tiles falling... to the staff" | First melodies and two-hand coordination; always optional |
| **Sheet music (staff)** | Needed for classical repertoire and exams; Skoove and Yousician users ask for more of it; Piano Marvel's SASR reading tests are a selling point | Reading track; public-domain classics |
| **Chord chart / lead sheet** | Core of Berklee Chords 101 (every lesson) and the Houston method; none of the consumer apps measures it | **Main format for the path** from Level 3: melody (roll or staff) + chord symbols, LH plays a chosen pattern |

**Recommendation:** one data format, three renderings. The existing scrolling-tab player becomes a horizontal piano roll (time left→right, like Ableton Learning Music, so it fits phone landscape and the current playhead code) with a **"notes falling onto keys" option**, a **staff option**, and a **chord-chart option**. Add **wait mode** (flowkey's most praised feature) but let users switch to "keep going" (complaints about stalling on one note). Original and public-domain material only (see E).

### D6. Daily review (Leitner deck items for piano)
- Key names (tap the key).
- Staff notes: treble, bass, ledger lines around Middle C.
- Key signatures (major and relative minor).
- Chord spellings: triads in all keys, then 7ths ("tap D7").
- Inversions by sight and by ear.
- Scale fingerings as facts: "In C major RH ascending, the thumb crosses under after which finger?" (3), "Which major scales share the C-major fingering?" (C, G, D, A, E per standard fingering charts; the specific fingering list is **unverified** here and should be checked against a scale book before use).
- Shared with guitar: intervals, scale degrees, chord quality by ear, progressions by ear, Roman numerals.
Interleave once learned (Abushanab & Bishara 2013).

### D7. Progress
Same streaks, minutes and accuracy charts. Heat map over the **keyboard** (which keys/staff notes you're slow on) and a **staff heat map** (ledger lines are the usual weak spot). Track tempo reached per piece and hands separately/together.

### D8. Planned items
- **Ear training tab**: fully shared; answers on keys or fretboard depending on the selected instrument.
- **AI custom lessons**: same lesson schema with keyboard positions.
- **Accounts/sync**: store progress per instrument plus shared theory items once (a learned interval counts on both).
- **Monetization**: same honest pricing; piano adds no licensing cost if content stays original/public-domain.

### D9. Teaching without video (piano specifics)
Round-one rules all apply (one idea per card, sound with the highlight, try before reveal). What works for keyboard:
- **musictheory.net**: highlighted key → name it; name → press the key; keys → identify interval/scale/chord. Simple, instant, tappable.
- **Ableton Learning Music**: piano roll you click to edit and hear, building to free play (round one).
- **Chrome Music Lab Song Maker**: grid you tap to make and share songs; built on Web Audio, Web MIDI and Tone.js (Chrome Music Lab experiments page).
- **What piano adds**: hand-shape and posture can't be shown on keys. Use one static illustration per technique idea, a short checklist, and the play step at the real instrument. Show a hand-bracket and finger numbers in the "see" step, playing each finger's note as it lights.

## E. Recommended 6-level path

**Design basis.** Follows the method consensus (A2): finger numbers and five-finger positions first, scales with thumb-under after, triads and primary chords by the end of the first book, inversions and voice leading next, lead sheets and 7th chords after (Berklee Keyboard Method lessons 6–12). Keeps the guitar path's theory order (scale before intervals, improvising in every level) so theory lessons can be shared. Reading runs as a **parallel track** (one reading lesson per level plus staff items in daily review), a hybrid of the reading-first and chords-first camps (A3).

Key: **S** = theory lesson that can be shared with guitar (same text and sound, rendered on keys instead of frets). **P** = piano-specific. **S/P** = shared concept, piano-specific board and play step.

| # | Level | Lesson topics | Playing challenge | Public-domain pieces (arrange yourself) |
|---|---|---|---|---|
| **1** | **The keyboard and note names** | 1. Sitting, hand shape, finger numbers 1–5 **(P)** · 2. Black-key groups of 2 and 3; the musical alphabet on white keys **(S/P)** · 3. Middle C and octaves (low/high) **(P)** · 4. Whole and half steps (E–F and B–C have no black key) **(S)** · 5. Sharps and flats, one key with two names **(S)** · 6. C five-finger position, RH then LH **(P)** · 7. Reading 1: the staff and three landmark notes (Middle C, treble G, bass F) **(P; could later serve guitar notation)** | Find 10 named keys in under 3 s each, then play a five-finger melody RH and LH separately in time with the metronome | Ode to Joy theme (Beethoven, 1824); Hot Cross Buns (trad.); Aura Lee (1861); Mary Had a Little Lamb (melody 1830s, trad.) |
| **2** | **The major scale and keys** | 1. W-W-H-W-W-W-H on the keys **(S)** · 2. C major scale fingering: thumb under, finger over **(P)** · 3. Scale degrees 1–7 **(S)** · 4. G and F major; five-finger positions in G and F **(S/P)** · 5. Key signatures and the circle of fifths (light) **(S)** · 6. Relative minor; A minor five-finger position **(S/P)** · 7. Major pentatonic; the black keys are G♭ major pentatonic **(S/P)** | Play C and G major one octave, hands separately, at 60 bpm. Then improvise 60 s on the black keys over a LH open fifth drone | Minuet in G (Petzold, attr. Bach, BWV Anh. 114), RH; Lightly Row (trad.); Twinkle Twinkle / "Ah vous dirai-je" (French folk); Simple Gifts (1848) |
| **3** | **Intervals and both hands** | 1. Intervals as distances from the root, by scale degree **(S)** · 2. Reading 2: steps and skips on the staff (intervallic reading) **(P)** · 3. Major vs minor 3rd **(S)** · 4. 4ths, 5ths, octaves; LH root–5th **(S/P)** · 5. 6ths and 7ths **(S)** · 6. Bass clef, grand staff, and hands together **(P)** · 7. Hearing intervals in a key (drone, tap the degree) **(S)** | The app plays a note over a drone: tap it and name the interval. Then play a two-hand piece with LH fifths at a steady tempo | Amazing Grace ("New Britain" melody, 1835) with LH fifths; Greensleeves (trad.); Shenandoah (trad.) |
| **4** | **Chords, inversions and voice leading** _(piano's equivalent of CAGED: one chord, many shapes)_ | 1. Triads from 1-3-5 **(S)** · 2. Major, minor, diminished, augmented **(S)** · 3. Chords on each degree of a major key **(S)** · 4. Root position, 1st and 2nd inversion **(S/P)** · 5. Voice leading I–IV–V–I with the nearest inversion **(P)** · 6. Reading 3: chord symbols and a lead sheet; LH chords + RH melody **(P)** · 7. 7th chords (maj7, 7, m7) **(S)** | Play I–IV–V7–I in C, G and F with smooth voice leading at 70 bpm; build any triad the app names in under 3 s | When the Saints Go Marching In (trad.) with LH chords; Joy to the World (Handel attr./Mason, 1839); Pachelbel Canon progression (c. 1700) |
| **5** | **Progressions and accompaniment** | 1. Roman numerals **(S)** · 2. I–IV–V and the 12-bar blues; LH shuffle/boogie bass **(S/P)** · 3. I–V–vi–IV with RH voice-led triads **(S/P)** · 4. ii–V–I with LH shell voicings (R–7, R–3) **(P)** · 5. Cadences: V–I pull **(S)** · 6. Accompaniment patterns: broken chords, arpeggios, Alberti bass; **sustain pedal** **(P)** · 7. Recognizing progressions by ear **(S)** | Accompany an original melody from a chord chart in two keys with the backing track, using two different LH patterns. Then pick the progression by ear | Mozart Sonata K. 545, opening (Alberti bass); Clementi Sonatina Op. 36 No. 1, first theme; Joplin, The Entertainer (1902), simplified |
| **6** | **Improvising and lead-sheet playing** | 1. Minor pentatonic and blues scale over a LH blues pattern **(S/P)** · 2. Targeting chord tones on chord changes **(S)** · 3. Phrasing: call and response, space, repetition **(S)** · 4. Comping: rhythms and RH three-note voicings over LH roots **(P)** · 5. Melody with chords underneath in the RH **(P)** · 6. Modes intro: Dorian, Mixolydian **(S)** · 7. Improvising over ii–V–I **(S)** | Play a 12-bar blues: LH shuffle or shells, RH improvises, landing on a chord tone at each change. Optionally record and log it | Satie, Gymnopédie No. 1 (1888; LH pattern + pedal); W. C. Handy, St. Louis Blues (1914) as a lead sheet; Joplin, Maple Leaf Rag (1899) A section, simplified |

**Copyright notes.** Musical compositions published in 1930 or earlier are in the US public domain as of 1 January 2026; recordings follow a different clock (Duke Center for the Study of the Public Domain). Every piece above is far older, but **modern editions and arrangements can be copyrighted**, so arrange from the original melody yourself and use original backing tracks. Avoid "Happy Birthday" (even though Faber and Alfred include it) and pop songs. Alongside these, write original études for each lesson as the guitar path does.

**Counts.** Of 42 lessons, about 24 are **S** or **S/P** (theory written once, rendered per instrument) and about 18 are **P**. Daily review items for intervals, scale degrees, chord spellings, key signatures and progressions are shared; key-finding, staff-reading and fingering items are piano-only.

**Architecture implication.** Today a guitar lesson stores positions as `{ string, fret }`. For sharing, store theory lessons in **pitch terms** (note names, degrees, MIDI numbers) and let each instrument's kit place them (`kit.js` already "works out every note name"). Instrument-specific steps ("play") get per-instrument variants.

## F. Technology

### F1. Piano sound in the browser

**Synthesis vs samples.** Karplus-Strong works for plucked strings, but no simple synthesis model sounds like an acoustic piano; every library I checked (smplr, Tone.js Sampler, soundfont-player) uses recorded samples, repitched between sampled notes. Keep the current synth as an instant fallback while samples load.

| Sample set | Instrument | License (as stated by the source) | Size (measured or stated) | Notes |
|---|---|---|---|---|
| **Salamander Grand Piano** (Alexander Holm) | Yamaha C5, 16 velocity layers, sampled every minor third | **CC BY 3.0** ("Licence: CC-by", README in Tone.js audio repo; sfzinstruments repo says CC BY 3.0 Unported). **Attribution required** | Tone.js-hosted web subset: **30 notes (A0–C8 in minor thirds), one velocity: 2.0 MB as MP3, 6.9 MB as OGG** (measured via GitHub API) | Best small set; credit "Salamander Grand Piano by Alexander Holm, CC BY 3.0" on an About page |
| **Splendid Grand Piano** (AKAI) | Steinway, 4 velocity layers | "**Public Domain** samples by AKAI... released as public domain in early 2000" (README; no formal license file) | smplr's web version: **226 OGG files = 19.9 MB; 226 M4A = 23.8 MB** (measured); original FLAC set 256 MB | Default piano in **smplr**; load a subset with `notesToLoad` |
| **University of Iowa MIS piano** | Steinway Model B, pp/mf/ff, chromatic | "may be downloaded and used for any projects, without restrictions" (MIS home page) | AIFF 16-bit/44.1 kHz stereo, **1.1–12.9 MB per note** | Raw recordings; would need trimming and compressing yourself |
| **FluidR3_GM soundfont** (via gleitz/midi-js-soundfonts) | General MIDI piano, 1 layer | **CC BY 3.0** | `acoustic_grand_piano-mp3.js` = **2.6 MB** (all 88 notes, base64) | Easiest, sounds plainer |
| **MusyngKite soundfont** | GM piano | **CC BY-SA 3.0** (share-alike) | 2.3 MB (mp3.js) | Share-alike terms; avoid unless you accept them |

| Library | License | Status | Fit |
|---|---|---|---|
| **smplr** (danigb) | MIT (README) | Active (pushed Nov 2026) | Recommended: `SplendidGrandPiano`, `Soundfont`, plus `ElectricPiano`; `notesToLoad`, velocity, `CacheStorage`, load progress; can play once one sample loads |
| **Tone.js Sampler** | MIT | Active | Good if you adopt Tone.js; repitches from a few samples (`urls` + `baseUrl`, `onload`) |
| **soundfont-player** | MIT | **Archived**; README says use smplr | Don't start new work on it |

**Loading strategy for phones** (design recommendation):
1. Self-host the 30-note Salamander MP3 subset (~2 MB) or a trimmed Splendid subset, rather than relying on GitHub Pages, which smplr's README warns "rate-limits requests per second."
2. Load the **lesson's octave range first** (e.g. C3–C5 is 9 Salamander samples in minor thirds, roughly 0.6 MB as MP3 at the sizes above), then the rest in the background; play the existing synth until each sample arrives.
3. Cache with the Cache Storage API / a service worker so repeat visits are instant and offline.
4. One velocity layer is enough for theory lessons; add a second layer only for play-along.
5. Keep decoded audio small: decoded PCM is much larger than MP3, so load ranges rather than all 88 notes on low-memory phones (general Web Audio behaviour; size of the effect **unverified** here).

### F2. Input

**On-screen keys (multi-touch).** Use Pointer Events keyed by `pointerId`, with `touch-action: none` on the keyboard so the browser doesn't scroll or zoom while chords are tapped (MDN, "Multi-touch interaction"), and treat `pointercancel`/`pointerleave` like `pointerup` (MDN). Allow glissando (a pointer moving across keys triggers new notes). Keys need ~44 CSS px width (WCAG 2.5.5) — see D1.

**MIDI keyboards (Web MIDI API).**
- Supported: Chrome 43+, Edge 79+, Firefox 108+, Samsung Internet, Chrome for Android (caniuse; caniuse shows only the current Android version). Global support about **81%** of users (caniuse).
- **Not supported in Safari on macOS or any iPhone/iPad browser.** WebKit's tracking-prevention page lists the "Web MIDI API" among features "we have decided to not yet implement due to fingerprinting, security, and other concerns." The WebKit bug (107250) has been open since 2013 with status NEW and no assignee. Because App Store guideline 2.5.6 requires iOS browsers to use WebKit (except via special entitlements in the EU and Japan), **Chrome and Firefox on iPhone have no Web MIDI either**. A third-party Safari extension adds it on macOS with Safari 18.4+ (caniuse note) but is not something to rely on.
- Requires HTTPS and a user permission prompt; can be blocked by the `midi` Permissions Policy (MDN). Vercel serves HTTPS, so this is fine.
- **Implication:** MIDI is a desktop/Android bonus. iPhone users (likely a large share) will use tapping and, optionally, the microphone. A native wrapper (e.g. a future iOS app using CoreMIDI) would be the only way to get MIDI on iPhone (design inference).

**Microphone (acoustic piano).**
- Polyphonic piano transcription is still imperfect even offline: Google Magenta's Onsets and Frames reported a note F1 of **50.22** (with offsets) versus **23.14** for the previous best, a ">100% relative improvement... on the MAPS dataset" (Magenta blog; arXiv 1710.11153). That's on clean recordings, not phone mics in living rooms.
- Spotify's **basic-pitch-ts** (Apache-2.0) is a "lightweight" instrument-agnostic, polyphonic audio-to-MIDI model runnable in JS, but its README gives no accuracy or latency numbers and it hasn't been updated since May 2023 (GitHub API).
- Users of Simply Piano, flowkey and Yousician complain mostly about chord and specific-note misses (section C).
- **Design rule (same as guitar): never block progress on the mic.** Use it only for single-note or "did a chord of roughly the right notes start on the beat" checks, accept any octave, offer "I played it" and "mark correct" overrides, and default the "play" step to self-assessment. Use a simple pitch detector for single notes (the app's guitar drills can share it) and treat polyphonic detection as an experiment behind a flag.

### F3. Timing and rhythm accuracy

| Source of delay | What's known | What to do |
|---|---|---|
| **Audio output** | `AudioContext.outputLatency` estimates the time from the audio graph to the output device; MDN marks it "Baseline 2025" (works across current browsers since March 2025) | Read `outputLatency` (and `baseLatency`) and subtract when scoring taps against the metronome |
| **Bluetooth headphones** | A2DP adds roughly **100–200 ms** (Unity developer docs); other secondary sources give 100–300 ms depending on codec (search results only, **unverified**). Yousician reports reducing wireless delay on iOS but gives no method or figures | Add a one-time **calibration**: user taps along to 8 clicks; store the median offset per output device. Warn when Bluetooth output is likely |
| **Touch input** | Touch-to-event delay varies by device; no authoritative figure found (**unverified**) | Use `event.timeStamp` on `pointerdown` (not the time the handler runs) and the same calibration offset |
| **MIDI input** | The Web MIDI spec sets the message's `timeStamp` to "the time the message was received by the system" as a high-resolution timestamp (W3C Web MIDI draft) | Score MIDI using `event.timeStamp` mapped to the AudioContext clock; MIDI is the most precise input. Playground Sessions users show audio-output latency still ruins scoring on some platforms (section C), so calibration still matters |
| **Scoring windows** | No piano-specific standard found | Use generous windows for beginners (e.g. ±100 ms "good", ±50 ms "great"; design suggestion), show early/late as a dot on a timeline rather than pass/fail |

**Notation rendering** (for the staff drills and sheet-music play-along): **VexFlow** (MIT, "rendering music notation & guitar tablature", active), **abcjs** (MIT license text, active; ABC text format is compact for authoring lessons), **OpenSheetMusicDisplay** (BSD-3-Clause, renders MusicXML, active). For hand-authored lessons, abcjs or VexFlow keep files tiny and need no build step if loaded from a CDN (licenses checked via GitHub).

## Sources

All opened during this research.

### A. Curriculum
- Faber, Adult Piano Adventures All-in-One Book 1, online support (unit list): https://pianoadventures.com/qr/ff1302/
- Faber, Adult Piano Adventures Level 1 product page: https://pianoadventures.com/piano-books/adult-piano-adventures/level-1/
- Faber, "Pattern Recognition" (reading philosophy): https://pianoadventures.com/?p=3137
- Faber, teaching FAQ: https://pianoadventures.com/piano-books/basic-faqs/teaching/
- Piano book index, Faber Adult Book 1 track list: https://piano-book-index.pages.dev/books/faber-lesson-1
- Alfred's Basic Piano Library Complete Level 1, course overview: https://www.alfred.com/pages/alfreds-basic-piano-complete-levels-course-overview
- Alfred's Basic Adult All-in-One Course Book 1: https://www.alfred.com/alfreds-basic-adult-all-in-one-course-book-1/p/00-5753/
- Alfred's Basic Adult Piano Course Lesson Book 1 ("chord approach"): https://www.alfred.com/alfreds-basic-adult-piano-course-lesson-book-1/p/00-2236/
- Hal Leonard Adult Piano Method Book 1: https://www.halleonard.com/product/296441/hal-leonard-adult-piano-method-book-1
- Hal Leonard Student Piano Library promo (PDF): https://www.halleonard.com/bin/PromoEducationalKeyboardHlspl.pdf
- Berklee Online, Berklee Keyboard Method: https://online.berklee.edu/courses/berklee-keyboard-method
- Berklee Online, Piano Chords 101: https://online.berklee.edu/courses/piano-chords-101
- Berklee Online, Private Piano Lesson Level 1: https://online.berklee.edu/courses/private-piano-lesson-level-1
- Berklee Online, Piano Technique 101: https://online.berklee.edu/courses/piano-technique-101
- Musora / Pianote method stages: https://www.musora.com/piano#method
- Hachette, Scott Houston, Play Piano in a Flash: https://www.hachettebookgroup.com/titles/scott-houston/play-piano-in-a-flash/9781401307660/
- Bill Hilton, Bill's Piano Pages: https://www.billspianopages.com/
- DiCienzo 2019, Middle C vs mixed intervallic reading (University of Ottawa thesis record): https://ruor.uottawa.ca/items/91b91a8b-a32c-4b1c-b5d2-6127d321ef65

### B. Learning research
- Duke, Simmons & Cash 2009, "It's Not How Much; It's How" (full PDF via UT Austin CML): https://utexas.box.com/s/aj7slheiyw3b2npx5v5cb43xho3bg5nx
- Simmons 2011, "Distributed Practice and Procedural Memory Consolidation in Musicians' Skill Learning" (full PDF): https://utexas.box.com/s/kwg2t3ltly0ncr8xww96ugccunzvklxp
- UT Austin Center for Music Learning, skill learning research list: https://cml.music.utexas.edu/research/skill-learning-and-procedural-memory
- Structural Learning briefing on Duke et al. 2009: https://www.structural-learning.com/research-briefings/practise-the-hard-bit
- Abushanab & Bishara 2013 abstract (Epistemonikos): https://www.epistemonikos.org/en/documents/71a54ccef125b6ecb6f1c3e42790ca68c7d899f3
- Bernardi et al. 2013, mental practice in pianists (Frontiers): https://www.frontiersin.org/articles/10.3389/fnhum.2013.00451/full
- Training the Musical Brain blog, hands together (Brown 1933, Rubin-Rabson 1939 summaries): http://trainingthemusicalbrain.blogspot.com/2012/03/hands-together.html
- Rogers et al. 2014, P.I.A.N.O.: Faster Piano Learning with Interactive Projection (Ulm University PDF): https://www.uni-ulm.de/fileadmin/website_uni_ulm/iui.inst.100/1-hci/hci-paper/2014/2014-gugenheimer-piano.pdf
- Jim Davies, summary of Ericsson et al. 1993: https://www.jimdavies.org/summaries/ericsson1993.html

### C. Apps and reviews
- Trustpilot, JoyTunes (Simply Piano): https://www.trustpilot.com/review/joytunes.com
- Trustpilot, flowkey: https://www.trustpilot.com/review/flowkey.com
- Trustpilot, Skoove: https://www.trustpilot.com/review/skoove.com
- Trustpilot, Playground Sessions: https://www.trustpilot.com/review/playgroundsessions.com
- Trustpilot, Piano Marvel: https://www.trustpilot.com/review/pianomarvel.com
- Trustpilot, Pianote: https://www.trustpilot.com/review/pianote.com
- App Store, Simply Piano: https://apps.apple.com/us/app/simply-piano-learn-piano-fast/id1019442026
- JustUseApp, Simply Piano reviews: https://justuseapp.com/en/app/1019442026/simply-piano-by-joytunes/reviews
- App Store, flowkey: https://apps.apple.com/us/app/flowkey-learn-to-play-piano/id1020357408
- App Store, Piano Marvel: https://apps.apple.com/us/app/piano-marvel-lessons-music/id1016751878
- App Store, Piano by Yousician reviews: https://apps.apple.com/us/app/piano-by-yousician/id1469033443?see-all=reviews&platform=iphone
- App Store, Melodics for iPad reviews: https://apps.apple.com/us/app/melodics-for-ipad/id1474895145?see-all=reviews
- Synthesia: https://synthesiagame.com/
- Guitar Chalk, flowkey vs Simply Piano: https://www.guitarchalk.com/flowkey-vs-simply-piano/

### D. Module mapping and design
- Wikipedia, Musical keyboard (key dimensions): https://en.wikipedia.org/wiki/Musical_keyboard
- W3C, Understanding WCAG 2.2 SC 2.5.8 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- musictheory.net exercises: https://www.musictheory.net/exercises
- Chrome Music Lab experiments: https://musiclab.chromeexperiments.com/Experiments

### E. Path
- Duke Center for the Study of the Public Domain, Public Domain Day 2026: https://cspd.law.duke.edu/publicdomainday/2026/

### F. Technology
- Salamander Grand Piano (sfzinstruments): https://github.com/sfzinstruments/SalamanderGrandPiano
- Tone.js audio repo (Salamander web subset; README license read at https://raw.githubusercontent.com/Tonejs/audio/master/salamander/README): https://github.com/Tonejs/audio
- Splendid Grand Piano (sfzinstruments): https://github.com/sfzinstruments/SplendidGrandPiano
- smplr web version of Splendid Grand (README and file sizes via GitHub API): https://github.com/smpldsnds/sfzinstruments-splendid-grand-piano
- University of Iowa MIS piano: https://theremin.music.uiowa.edu/MISpiano.html
- University of Iowa MIS terms: https://theremin.music.uiowa.edu/MIS.html
- gleitz/midi-js-soundfonts: https://github.com/gleitz/midi-js-soundfonts
- smplr: https://github.com/danigb/smplr
- soundfont-player (archived): https://github.com/danigb/soundfont-player
- Tone.js Sampler docs: https://tonejs.github.io/docs/15.0.4/classes/Sampler.html
- caniuse, Web MIDI API: https://caniuse.com/midi
- MDN, Web MIDI API: https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API
- MDN, MIDIMessageEvent: https://developer.mozilla.org/en-US/docs/Web/API/MIDIMessageEvent
- W3C Web MIDI API editor's draft: https://webaudio.github.io/web-midi-api/
- WebKit, Tracking Prevention (features not implemented): https://webkit.org/tracking-prevention/
- WebKit Bugzilla 107250, Web MIDI API: https://bugs.webkit.org/show_bug.cgi?id=107250
- Apple, App Review Guidelines (2.5.6): https://developer.apple.com/app-store/review/guidelines/
- MDN, AudioContext.outputLatency: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/outputLatency
- MDN, Multi-touch interaction with pointer events: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Multi-touch_interaction
- Spotify basic-pitch-ts: https://github.com/spotify/basic-pitch-ts
- Magenta, Onsets and Frames: https://magenta.tensorflow.org/onsets-frames
- arXiv 1710.11153, Onsets and Frames: https://arxiv.org/abs/1710.11153
- Unity Vivox docs, Bluetooth profile comparison (A2DP latency): https://docs.unity.com/en-us/vivox-core/developer-guide/android/bluetooth-profile-comparison
- Yousician blog, wireless headphones: https://yousician.com/blog/new-feature-play-with-airpods-and-other-wireless-headphones
- VexFlow: https://github.com/vexflow/vexflow · abcjs: https://github.com/paulrosen/abcjs · OpenSheetMusicDisplay: https://github.com/opensheetmusicdisplay/opensheetmusicdisplay

## Tried but not accessible

Not used as evidence, or used only as clearly marked **unverified** search excerpts:
- **Reddit** (r/piano): blocked to the fetch tool.
- **Piano World forums** (e.g. "Why isn't Synthesia recommended (alongside reading)?", "What are bad habits?"): redirect to a bot paywall (tollbit) that would not resolve. Quotes in C come from search excerpts only.
- **Musora FAQ, Pianote Method table of contents** (faq.musora.com/article/810): 404; pianote.com/method redirects to musora.com (used instead).
- **Sheet Music Plus** product and "look inside" pages for Alfred: 403.
- **Berklee Online** "piano-for-beginners" and "keyboard-basics" URLs: 404 (courses don't exist under those names).
- **PubMed** abstracts (Abushanab & Bishara 2013; Bernardi 2013): cookie wall; used Epistemonikos and Frontiers instead.
- **PMC** article on left-hand practice (PMC9971940): redirect not followed (PMC blocked in round one).
- **Simmons & Duke 2006** (sleep and keyboard melody) PDF: scanned image, text not extractable.
- **symposium.music.org**, "Does retrieval practice enhance memorization of piano melodies?": 403.
- **Apple Human Interface Guidelines** (44 pt touch target) and **Material Design** (48 dp): pages rendered empty.
- **RTINGS** headphone latency article: content not returned.
- **Skoove** home page: content not returned.
- **musical-u.com** interview with Bill Hilton: timed out twice.
- Unofficial scans of Alfred method books (anyflip, studocu, pdfroom, vdoc.pub) were deliberately **not** used.
