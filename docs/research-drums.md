# Fretboard Lab: Drums Research

_Researched 2026-11-14. Every source under Sources was opened and read. Claims we could not check are marked **unverified**. Companion to `docs/research-findings.md` (guitar, round one)._

## Summary

- **Every drum method teaches rhythm in the same order:** quarter notes → 8ths → 16ths → triplets → syncopation → compound and odd meters. They also all start with a brief grip lesson and require a metronome from day one. Hal Leonard, Alfred, Reed and Drumeo agree, and the 6-level path in section E follows this order. "Theory" on drums is mostly rhythm and song form, which other instruments share, so about a third of the lessons can be shared.
- **Timing needs numbers to score fairly.** Professional drummers still scatter by about 9–16 ms (one standard deviation), and everyone taps slightly early. Rhythm games grade from about ±16–23 ms for the best grade out to ±135–180 ms for a hit. A fair beginner window after calibration is about ±50 ms ("in time") and ±25 ms ("tight"), with early/late bias reported separately from consistency.
- **Latency is the biggest technical risk.** Tap-to-sound on iOS averaged 61 ms wired vs 224 ms over Bluetooth (AirPods Pro 144 ms). Browsers expose `outputLatency` only from Safari 18.4. So **tap-along calibration per output device is mandatory**, and clicks must be scheduled on the audio clock.
- **Web MIDI works on Chrome, Edge and Firefox but not on any iPhone browser.** Microphone detection is fine for "when" on a practice pad but unreliable for "which drum" on a full kit. Taps and keys must always be enough to progress.
- **Competitors split in two.** Melodics gives feedback but no notation (and users call its scoring "too lenient"); Drumeo teaches with video and sheet music but never listens. Yousician has no drums at all. No app links a step grid to standard notation, and internal-time training (Roland's "Quiet Count") is found mainly in e-kit hardware.
- **Learning evidence for drums is thin.** It is mostly expert vs novice comparisons with 9–25 drummers per group. Two useful findings: (1) quantized playing grooves as well as human feel; only exaggerated timing hurts (Senn et al. 2016). (2) Constant live feedback creates dependence (guidance hypothesis), so fade the meter and the click. We found **no study** comparing practice with and without a click.
- **Free sounds are available.** CC0 acoustic kits (Karoryfer's Big Rusty/Unruly/Swirly, Virtuosity) can be trimmed to under 1 MB for phones; synthesized drums are the zero-download fallback. Avoid Hydrogen's GMkit (non-free origin) and Freesound CC-BY-NC sounds.
- **Effort: large.** The lesson engine, metronome, review and progress code carry over, but drums need a new kit/grid/notation view, a timing-scoring engine with calibration, MIDI input, a drum sample set and about 42 lessons of new content.

## A. Curriculum order

### A1. What nine well-known methods teach, and in what order

> **Correction to the brief:** Dave Black's beginner method is *Alfred's* Drum Method (Black and Feldstein, Alfred, 1987), not a Hal Leonard book. Hal Leonard's drumset method is by Kennan Wylie with Gregg Bissonette. Both are included below.

| Course | Type | Topic order (abbreviated) | What is taught first | Confidence |
|---|---|---|---|---|
| **Hal Leonard Drumset Method Bk 1** (Wylie and Bissonette, 2017) | Beginner drumset | Parts of the kit → care → grips and strokes → L1 Getting started → L2 Music reading basics → L3 Coordination → L4 8th notes → L5 Toms → L6 Ties and rests → L7 New strokes → L8 Drum fills → L9 More grooves and fills → **L10 Musical form** → L11 16th notes → L12 New rhythms → L13 16th-note fills → L14 Triplets → L15 Jazz → L16 Shuffle → L17 New meters (Book 2: independence, half-time, syncopation, funk, ghost notes, jazz) | Kit setup, matched grip, strokes, then reading and coordination together. Early exercises are sticking strings (LLLL RRRR, LLRR LLRR, LRLR, LRLL RLRR...) | High (table of contents read from publisher sample) |
| **Alfred's Drum Method Bk 1** (Black and Feldstein) | Beginner snare/concert | Snare drum → getting ready (grip) → bass drum → cymbals → Elements of Music → L1 quarter notes and rests → L2–5 eighths and eighth rests → L6 dotted halves/quarters → L7–10 sixteenths and rests → L11 dotted 8th–16th → L12 2/4 → ... → L19–20 9-, 13-, 17-stroke rolls → L21 3/4 → L22–23 triplets → L24 7-stroke roll → L25 cut time → L27–28 flam, flam accent, flam tap, flamacue → L29–33 6/8 → L34–35 drag, ruff. One page per lesson, a solo after each section (23 solos), real march parts | Grip (it recommends *traditional* grip, matched as alternative), then quarter notes | High (TOC read from publisher sample) |
| **Stone, *Stick Control*** (1935) | Hands-only technique ("conditioners") | Single Beat Combinations (72 sixteen-stroke R/L patterns) → ... → Flam Beats (192 patterns); 21 pages of practice rhythms; "How to Practice" page. Triplet and short-roll sections are listed only in a search snippet (**unverified**) | Pure sticking permutations on one surface, no reading of rhythm beyond 8ths | Medium (a detailed review; the scanned sample would not extract) |
| **Reed, *Progressive Steps to Syncopation*** (Alfred ed. 1996) | Reading | Part 1 note-reading: quarter notes/rests → same "in unison" (hands and feet together) → "independently" → 8ths → dotted 8th–16th → 8th triplets → 16ths → 8th rests. Part 2 Syncopation sets and exercises → accented 8ths → accented dotted 8th–16th → accented triplets → ... | Quarter notes and rests, then the same rhythms played with two limbs | High (TOC read from publisher sample) |
| **Chester, *The New Breed*** | Advanced independence | 39 "systems" (ostinatos for three limbs) while reading a melody line with the fourth limb, and singing/counting quarter note, backbeat, upbeat and melody aloud | Simple time-keeping systems, then harder coordination; assumes the student already reads | Medium (publisher page + PAS article + secondary descriptions; no TOC) |
| **Igoe, *Groove Essentials 1.0*** | Groove library + play-along | ~47 grooves (book page also says 52) grouped by style: rock → funk/R&B → swing/jazz → world (20 world grooves). Each at two tempos, with and without a band | Simple rock beats | Medium (publisher page; groove count conflicts on the page itself) |
| **PAS 40 International Drum Rudiments** | Reference list, not a course | I. Roll rudiments (15: single-stroke 3, multiple-bounce 2, double-stroke open 10) · II. Diddle (4) · III. Flam (11) · IV. Drag (10). Practice "open (slow) to close (fast) to open (slow)" | Single stroke roll is #1 | High (official PAS PDF read) |
| **Berklee Online, Drum Set Performance 101** | College course (needs 1 year playing + Music Theory 101) | 1 The Basics: time, click tracks → 2 repertoire, listening → 3 "Table of Time" and ghost notes → 4 single-stroke roll, 32nds, heel up/down → 5 double-stroke roll, bossa nova → 6 samba → 7 half-time shuffle → 8 compound meter → 9 Afro-Cuban 6/8 → 10 jazz shuffle → 11 swing → 12 cha-cha | Time and the click, grip, playing area, hand balance | High (course page). Not a true beginner course |
| **Drumeo** (Musora) | Video lesson path | Musora's drums page now shows a **12-level path**, 33–36 lessons each: L1 hi-hat and snare, ride and floor tom, single strokes, kick, grooves, first full song → L2 8th-note fills, toms, 16ths, crashes → L3 four-on-the-floor, flams, ghost notes → L4 cross-stick, speed, switching hands → L5 6/8 and 12/8 → L6 double strokes, syncopation → L7 accents, hi-hat pedal, 4-way coordination, dynamics → L8 rock/pop → L9 pocket and ghost notes → L10 metal/double bass → L11 jazz → L12 shuffle | Hi-hat and snare together; a full song within about 10 days | Medium. The older "Drumeo Method" is described elsewhere as 10 levels (L1 basics, L2 theory and ear training, L3 grips and pedal technique, L4 Moeller); that table of contents page now returns 404, so the 10-level version is **unverified** and may have been replaced |

### A2. Where they agree

- **Grip and stroke come before anything else**, but only briefly. Hal Leonard, Alfred and Berklee all start with grip, then move straight to playing. Matched grip is now the default for drumset (Hal Leonard calls it "the more basic" grip). Alfred, a snare/concert method, still recommends traditional grip first.
- **Rhythm values are taught in the same order everywhere:** quarter notes and rests → 8ths → 16ths → triplets → dotted figures and syncopation → compound meter (6/8, 12/8). Alfred, Reed, Hal Leonard and Drumeo all follow it. Odd or "new" meters come last.
- **Hands first, then add the feet, then play them together.** Hal Leonard's L3 is "Coordination" right after reading basics; Reed teaches the same rhythm "in unison" and then "independently"; Drumeo's L1 adds the kick after hi-hat and snare.
- **Fills come after the first grooves**, and 16th-note fills after 16th-note grooves (Hal Leonard L8 and L13; Drumeo L2).
- **Rudiments are spread out, not front-loaded.** Single strokes appear first; doubles, flams, drags and rolls come gradually (Alfred L19–35; Drumeo flams at L3, doubles at L6; Berklee singles L4, doubles L5).
- **The metronome is required from day one.** Hal Leonard: "Always use a metronome to reinforce good time-keeping," repeat each line "up to 10 times, at a minimum," "Go slowly," "Record yourself." Berklee's first lesson is time and click tracks.
- **Song form is part of a drum method**, which surprised us: Hal Leonard has a whole lesson on "Musical Form" (L10), Drumeo's older path reportedly had "create a roadmap for any song" (**unverified**), and Berklee assigns listening.

### A3. Where they differ

- **Reading first or playing first.** Alfred and Reed are reading-first (every lesson is a notated rhythm). Drumeo is playing-first (a groove on the first day, a song in 10 days). Hal Leonard sits between: reading basics in Lesson 2, but grooves from Lesson 3.
- **Snare/rudimental vs drumset.** Alfred and Stick Control build hands on a single surface; Hal Leonard and Drumeo put you on the whole kit at once. Most teachers combine one of each (for example a drumset method + Stick Control) — this is common practice, but we found no published survey showing how common, so treat it as **unverified**.
- **Moeller.** Only the older Drumeo Method names it as an early topic (Level 4); the printed beginner methods do not name it at all. It fits as an intermediate technique topic, not beginner content.
- **Notation conventions differ.** Drumeo notes that "traditional" notation stems hands up and feet down, while "modern" notation stems everything up, and students should read both.

### A4. How theory, technique and reading fit together

| Strand | What it covers on drums | Where it sits in the methods |
|---|---|---|
| **"Theory" (rhythm theory)** | Note and rest values, counting ("1 e & a", "1 trip let"), time signatures, subdivision, dynamics, accents, form (verse/chorus, 4- and 8-bar phrases, repeats, codas) | Taught alongside each new note value. Drumeo's reading guide orders it: staff and drum clef → time signature and tempo → note values and noteheads → rests → sticking/accents → dynamics → repeats and codas → charts |
| **Technique** | Grip (matched; traditional optional), full/down/tap/up strokes, rebound, Moeller (later), rudiments, bass drum heel-down vs heel-up, hi-hat foot, limb independence | Grip and strokes first; rudiments gradually; independence grows from "hands together with kick" to four-way (Drumeo L7) to Chester-style systems (advanced) |
| **Reading** | The drum staff: neutral (percussion) clef, a legend, one line/space per kit piece, x noteheads for cymbals | Starts at Lesson 2 in Hal Leonard. Based on PAS recommendations in Norman Weinberg's *Guide to Standardized Drumset Notation*; Wikipedia's summary gives a "fairly standard" five-piece layout: bass drum in the bottom space, snare on the third space, toms above and below, hi-hat (stick) and ride above the staff with x noteheads, hi-hat (foot) below the staff with an x, crash on a ledger line. It also notes non-pitched notation is "less standardized," so pieces include a legend |

**Takeaway for the app.** Unlike guitar, drum "theory" is almost entirely rhythm: note values, counting, subdivision, meter and form. Those are the same for every instrument, so they can be shared lessons. Technique (sticking, rudiments, limb coordination) and the drum staff are drum-only.

## B. How people learn drums best

The round-one guitar findings (retrieval, spacing, interleaving, deliberate practice) still apply and are not repeated here. This section adds what is specific to drums: timing, coordination, groove and feedback.

### B1. Timing: what "accurate" means in numbers

| Finding | Numbers | Source | Strength |
|---|---|---|---|
| People tapping along to a metronome tap slightly **early** (the "negative mean asynchrony") | "Several tens of milliseconds" before the click for non-musicians | Pollok et al. 2017, introduction, citing Repp and Su 2013 | Strong: one of the most replicated results in timing research |
| Musicians are early by less than non-musicians | "Often 10–30 vs. 20–80 ms" (citing Aschersleben 2002; Repp and Doggett 2007) | Quoted in a search snippet of Manning and Schutz 2016; we could not open the paper or the originals | **Unverified** numbers; direction is consistent across sources |
| Percussionists keep a steadier beat than non-percussionists | Coefficient of variation of tap intervals **5.2% vs 11.5%** while finding the beat (t(50) = 4.17, p < .001); lower absolute asynchrony (t(50) = 7.13, p < .001). 25 percussionists vs 30 non-percussionists | Cameron and Grahn 2014 | Moderate (one study, cross-sectional) |
| But drummers are no better than other trained musicians | 9 drummers, 11 pianists, 10 singers, 12 string players, 14 non-musicians: all musician groups beat non-musicians, but "no significant differences between musician groups for the vast majority of task measures" | Matthews et al. 2016 | Moderate (small groups). Suggests general rhythm training transfers across instruments, which supports sharing rhythm lessons |
| A professional drummer's natural spread | Pro drummer tapping one hand with a click at 180 BPM: SD **15.6 ms**. Jeff Porcaro's one-hand 16th-note hi-hat (no click): intervals average 157 ms with SD **8.7 ms** | Räsänen et al. 2015 (citing Hennig et al. 2011 for the 15.6 ms) | Moderate (single performers, but precise measurement) |
| Human timing errors are not random noise | Fluctuations show "long-range correlations"; listeners "strongly prefer" long-range correlated fluctuations over random ones when music is humanized | Hennig et al. 2011; Räsänen et al. 2015 | Moderate |

**What this means for scoring.** Even professionals scatter by about 9–16 ms (one SD), and everyone tends to land a little early. A fair scoring window for a learner must be several times wider than that, should not punish a consistent small early bias, and should report **consistency** (spread) separately from **accuracy** (average early/late). See F3 for the windows rhythm games use.

### B2. Groove and microtiming

- **Perfectly on the grid is not worse, and "feel" is not required for groove.** Senn et al. 2016 scaled the timing deviations of real bass-and-drums performances (swing and funk). 79 expert and 81 non-expert listeners rated fully quantized and original performances "equally high on groove"; ratings fell only when deviations were **exaggerated** beyond what the players originally did. Experts were more sensitive to the changes. The paper reports that two earlier studies (Frühauf et al. 2013; Davies et al. 2013) found large deviations lowered groove ratings.
- **Implication:** the app can safely teach "play on the grid" first. Pushing and pulling the beat on purpose (laid-back snare, etc.) is an advanced topic, not a beginner one. Strength: moderate (listener ratings, not a learning study).

### B3. Limb independence and coordination

- **Two-hand rhythms are controlled as one combined pattern at slow tempos.** Professional pianists playing 3-against-4 and syncopated two-hand rhythms "relied on integrated timing control" at slower tempos, merging both hands into one reference frame, and switched to independent "parallel" timing only at fast tempos (Krampe et al. 2000). Practical reading: beginners should learn a groove as **one composite pattern** (count where each limb falls on "1 e & a"), which is exactly what a step grid shows. Strength: moderate (experts only).
- **Too much live guidance creates dependence.** In Maslovat et al. 2009, learners of a new two-hand coordination pattern who got continuous feedback did best during practice, but their accuracy and stability dropped when the feedback changed or was removed; the discrete-feedback group improved. Schmidt et al. 1989 found that feedback summarised after 5–15 trials gave better retention than feedback after every trial in a timing task. This is the "guidance hypothesis." Strength: moderate to strong in the motor-learning literature, but not tested on drummers.
- **Implication:** a live "early/late" meter on every hit is great for the first tries but should fade: show a summary after each pass, then hide the meter, then drop the click (see D4, gap click).

### B4. Practising with or without a click

- **We found no controlled study comparing practice with a click against practice without one for long-term timing.** Searches of Europe PMC and the web turned up only opinion pieces, a 2025 conference paper on in-performance click devices for drummers (link returned 404, **unverified**), and the general guidance-hypothesis studies above.
- Methods all require the click from day one (Hal Leonard: "Always use a metronome"; Berklee lesson 1 "time, click tracks"), and Chester's *New Breed* adds singing/counting aloud while playing.
- **Best inference** (not proven): use the click while learning, then remove it in steps (click on 2 and 4 only, then one bar on / one bar off, then silent bars) so the internal pulse is tested. This also matches the guidance hypothesis. Mark it in the app as good practice, not as a research finding.

### B5. Spacing, interleaving and short sessions for drum skills

- **Spacing over minutes did not help a motor sequence.** Wiseheart et al. 2017 taught novices a 17-note piano sequence with 0–15 minute gaps and found "no spacing effect" for note accuracy, key pressure or timing consistency. The gaps were short; spacing over days for motor skills is not well tested in music. Keep spaced review for **fact-like** drum items (note values, counting, stickings, rudiment names, notation symbols, recognising a groove by ear) and treat days-apart groove practice as sensible, not proven.
- **Interleaving** (Carter and Grahn 2016, from round one): leaning positive but mostly not significant in 10 clarinettists. Mix drill types only after each is learned.
- **Deliberate practice** and **slow-then-faster** practice are what every method prescribes (Hal Leonard "Go slowly... Be repetitive... Record yourself"; PAS "open (slow) to close (fast) to open (slow)"). The tempo-ladder tool in D4 follows this.

**Caveats:** drum-specific learning studies are rare and small (9–25 drummers per group). Most numbers above describe how experts differ from novices, not how novices improve. Present timing targets as "what good players do," not as proof that a drill works.

## C. Existing apps and what users say

> **No Reddit coverage**, as in round one: Reddit is blocked to the fetch tool, and we found no Drummerworld threads about these apps. Sources are App Store pages, Trustpilot, publisher manuals, and two forums (KVR Audio, Drummer Cafe). App Store pages show only a handful of reviews, so complaints are indicative, not counted.

> **Names in the brief we could not find:** "Senseii Drums", "Drumi" and "BeatSchool" returned no matching app in searches; they may be misspelled, renamed or very small. **Yousician does not teach drums**: its home page lists "guitar, bass, ukulele, piano and singing."

### C1. App by app

| App | What it is | Price (US, as listed) | What people like | Most common complaints |
|---|---|---|---|---|
| **Melodics (drums)** | Game-style lessons; hears acoustic kits and practice pads through the phone mic, e-kits over MIDI/Bluetooth; you calibrate first. Shows animated notes, not sheet music: left hand blue, right hand yellow; hits coloured "early (orange), late (purple), missed (red), or perfect (green)"; optional "traditional note ordering" to match sheet-music order; left-handed mode | First 20 lessons free; $34.99/month or $179.99/year. App Store 4.7 (663 ratings); Trustpilot 4.4 (105 reviews) | "Brilliant method of letting you play along and instantly reflecting your precision"; "Duolingo for musicians"; real-time feedback improves timing; low latency over MIDI | Scoring too lenient ("a green even with strikes that would sound sloppy"); no path to standard notation; unclear MIDI connection status; glitches after updates; surprise charges after trials; VoiceOver inaccessible; one forum user struggled to separate the hands until slowing down |
| **Drumeo / Musora app** | Video lesson paths (12 levels), 5,000+ transcribed songs with sheet music, looping, tempo, drum removal | $29.99/month (Musora); App Store 4.7 (~3K ratings); Trustpilot (drumeo.com) 4.4 from 91 reviews | "The teachers are top notch"; good skill progression; huge song library | **Does not listen to you** (no automated feedback described anywhere on its pages); buggy video playback; "new format confusing" after the Musora merge; a lifetime member lost access to other instruments without warning |
| **Complete Rhythm Trainer** | General (not drum-only) rhythm reading and tapping: 252 drills in 4 levels, 5 drill types (imitate by ear, read, dictation, two-voice read/dictation), polyrhythms, custom drills | Free + $6.99 one-time. App Store 4.7 (106 ratings) | Structured progression, variety of drill types, fair one-time price | Calibration prompt with headphones then a broken start button; tempo not adjustable in some modes; instrument "auto plays in the read modes (not associated with the user's tap)"; custom-drill generator errors |
| **Roland V-Drums "Coach" mode** (TD-02, TD-17, TD-25 modules) | Built into e-kits. **Time Check**: % of hits in time, live AHEAD/BEHIND graph, strictness EASY/Normal/HARD; TD-25 scores kick and snare over eight bars. **Quiet Count**: click plays a few bars, then goes silent (TD-25: fades to nearly inaudible), then % of hits in tempo. **Warm Ups**: Change-Up (note values shorten every two bars from half notes and back), Auto Up/Down (+1 BPM per beat to a max, then back down), Time Check; final grade EXCELLENT! to START OVER; 5/10/15-minute versions | Comes with the kit | (Manufacturer feature; no user reviews collected) | — |
| **Drum Coach** (Upbeat Studio) | Guided plans, sheet music with a cursor that follows video, drum-set and hands-and-feet views; full kit, e-kit (beta), pad or hands | $14.99/month, $49.99/year, $249.99 lifetime. App Store 4.7 (448) | "Best tutorial free drum app I have found in the last 3 years" | Practice "very static, even at different levels"; voiceover can't be silenced; no count of days practised |
| **Drums: Learn & Play Beat Games** (MWM) | Tap-the-pads kit with song lessons | Weekly $7.99, yearly $40.99. App Store 4.4 (~32K) | Simple and fun (search summary only, **unverified**) | Reports misses when tapping correctly and "the beat doesn't match the drum sound" (a latency symptom); freezes; "free download but not free to play" |
| **Drumgenius** (Projazz Lab) | Library of 500+ real drum loops in 21 styles with notes on history, plus a metronome with 22 clave patterns, "silence mode," count-in | Credits or $12.99 lifetime. App Store 4.5 (234) | "Polished app using drum beats instead of a basic metronome click"; "fun and educational" | A 2025 update and new pricing called a "cash grab" |
| **Groove Scribe** (Lou Montulli, open source) | Browser tool: click a grid, get standard drum notation, hear it played, share by URL. Plain HTML/CSS/JS; renders notation via abc2svg and plays with MIDI.js | Free | (Widely shared tool; no review data collected) | — |

### C2. Rhythm games and lanes vs notation

- Drum teacher writing in Drummer Cafe (Ziker): game skills "do not necessarily transfer over to playing real drums"; "Rock Band's 3D scrolling note charts make it difficult to recognize complex rhythmic patterns quickly," and stationary notation is "vastly superior in this respect." He found students from Rock Band "respond well to colored drumset charts," which helped them move to standard reading.
- Positive anecdotes exist (a PC Gamer writer, a Clone Hero user, a Harmonix co-founder) but they are self-reports. We found **no controlled study** comparing lanes with notation for learning drums.
- Melodics markets itself as notation-free, and its reviewers ask for a path to notation. Drumeo and Drum Coach use sheet music. No app we found offers **both views of the same groove, linked**.

### C3. Recurring complaints, roughly most common first

1. **Scoring that doesn't feel fair**: too lenient (Melodics), or misses reported for correct hits and sound out of sync (MWM). Both point to timing windows and latency (see F).
2. **Subscriptions and surprise charges** (Melodics trials, MWM weekly plans, Musora access changes, Drumgenius repricing).
3. **No feedback at all** in video-led apps (Drumeo), versus game apps that give feedback but don't teach reading or "why."
4. **Static, repetitive practice** (Drum Coach).
5. **Device and connection problems**: unclear MIDI status, calibration that breaks with headphones, bugs after updates.

### C4. Gaps Fretboard Lab could fill

- **Notation and grid, linked.** Show the same groove as a step grid and as standard drum notation, toggled or side by side, so learners move from one to the other (Ziker's coloured-chart observation; Melodics users asking for notation).
- **Honest, adjustable timing scoring** with early/late shown separately and a strictness setting, as Roland's kits do, plus calibration that works with headphones.
- **Internal-time training** (Roland's Quiet Count) is in hardware but rare in apps we checked.
- **Rhythm theory with the "why"**: counting, subdivision and form, which video apps cover only in passing and game apps skip.
- **Fair pricing and nothing that blocks progress** when detection fails, as in round one.

## D. Mapping every app module to drums

### D1. Instrument view → "Kit view"

The fretboard is replaced by **three linked views of the same groove**. The step grid is the main one.

| View | What it shows | Why |
|---|---|---|
| **Step grid** (main view) | Rows = kit pieces (crash, ride, hi-hat, snare, toms, kick, hi-hat foot); columns = 16th-note steps, with the count ("1 e & a") printed under each column. Each cell carries its limb label (R, L, RF, LF) inside it, the way guitar dots carry "R" or "b3" | Shows a groove as one combined pattern, which is how players control two-hand rhythms at slower tempos (Krampe et al. 2000). Ableton's beats lessons and Groove Scribe are both built on a clickable grid. Fits a phone: 16 columns × ~20 px = 320 px, inside a 360 px screen with 16 px gutters |
| **Notation** | Standard drum staff with a legend (kick in the bottom space, snare on the third space, x noteheads for cymbals, hi-hat foot below the staff). Toggle stems: "hands up / feet down" vs "all up" | Methods teach reading from lesson 2 (Hal Leonard), and Drumeo says students should read both stem styles. A drum teacher found coloured notation helps game players move to reading (Ziker) |
| **Kit diagram** | Top-down kit; tap a drum to hear it; pieces light up as they sound | Vocabulary (what is a floor tom?), free play, and the "which drum" link |

- **Limb colours** are fixed app-wide, like the root colour on guitar: one colour each for right hand, left hand, right foot and left foot. Melodics uses blue for left hand and yellow for right; any choice works if it never changes.
- **Left-handed mode** mirrors the kit and the limbs (Melodics offers this). The guitar "player's view" becomes "from the drum stool" vs "from the audience" for the kit diagram.
- **Phone vs desktop.** Phone portrait: one bar of grid at a time with swipe between bars, notation as a toggle, a 2–6 pad tap area at the bottom. Desktop: grid and notation stacked, kit diagram beside them, keyboard keys shown on the pads.
- **Guitar features that carry over:** the drone becomes a click or a looping bass/keys backing; scale-over-chord becomes "groove over form" (verse/chorus colouring along the top); the fretboard heat map becomes a **timing heat map** per step and per limb ("you rush the 'a' of 4").

### D2. Guided Learn path

Keep the six-step lesson shape. It maps cleanly:

| Step | Guitar today | Drums |
|---|---|---|
| hear | A sound plays | The groove or rhythm plays, with the count spoken or shown |
| learn | Cards with a fretboard | Cards with a grid or staff, one idea each ("the snare plays on 2 and 4") |
| see | Dots light in time | Grid cells light in time with the sound and the count; one limb at a time, then together |
| try | Tap the right fret | Tap the right cell, or tap the pattern on the pads, untimed first |
| play | Play along with the metronome | Play along with the click, scored with the calibrated timing windows in F3 |
| check | Choice and tap questions | "Which grid matches what you heard?", "Count this bar", "Which drum is on the third space?" |

The data format can follow `js/lessons/level1.js`: a drum lesson swaps `{ string, fret }` positions for `{ step, piece, limb }` cells, and `bpm`/`beatsPerBar` already exist.

### D3. Drills (the note finder and hear-it-find-it equivalents)

| Drill | What happens | Based on |
|---|---|---|
| **Count it** | A note is highlighted in a bar; tap its count syllable ("&", "e", "trip") | Methods teach counting with every new note value |
| **Read it, tap it** | A bar of notation or grid appears; tap it in time | Reed's reading lessons; Complete Rhythm Trainer's "reading" drills |
| **Hear it, tap it back** (call and response) | The app plays 1–2 bars; you tap them back; scored for rhythm then timing | Complete Rhythm Trainer's "imitation" drills; Chester's sing-and-play idea |
| **Hear it, find it** | A groove plays; pick the matching grid or notation from 3–4 options (confusable pairs: kick on "&" vs on "a") | Rhythm dictation (Complete Rhythm Trainer); round-one "hear it, find it" |
| **Subdivision by ear** | Is this quarters, 8ths, triplets or 16ths? Straight or swung? | Rhythm-value order in every method |
| **Steady pulse** | Tap with the click, then keep going through silent bars; score the silent bars | Roland Quiet Count |
| **Sticking** | Name ↔ sticking (paradiddle = RLRR LRLL); play it on two pads, then on a tempo ladder | PAS 40; Stick Control |
| **Fill spotter** | Hear 4–8 bars; tap the bar where the fill happens, or whether it lands on "1" | Form and fills in Hal Leonard and Drumeo |

### D4. Practice tools

- **Metronome** (exists): add an accent map, **click on 2 and 4 only**, and **gap click** (N bars on, M bars off, Roland Quiet Count), plus a **fading click** (the TD-25 fades the click "until it is nearly inaudible").
- **Tempo ladder:** start slow, rise by a few BPM after each clean pass, fall back after a sloppy one; or Roland's Auto Up/Down (+1 BPM per beat up to a maximum, then back down). Matches PAS's "open (slow) to close (fast) to open (slow)."
- **Rudiment routines:** a starter set of PAS rudiments (singles, doubles, paradiddle, flam, flam tap, drag, 5- and 9-stroke rolls) plus generated Stick Control-style R/L permutations. The 2^16 permutations are maths, not a copy of the book; don't reproduce Stone's pages.
- **Warm-up routine** like Roland's 5/10/15-minute presets: note values that shorten every two bars, then a tempo ladder, then a timing check, ending in a grade.
- **Groove library:** **original** grooves by style (rock, pop, funk, shuffle, half-time, 6/8, bossa, samba, reggae), each at two tempos with and without backing, as Groove Essentials does. Note that Groove Essentials and Drumgenius are commercial libraries; write our own patterns.
- **Practice timer and log** (exist): unchanged; add per-exercise "best clean BPM."

### D5. Play-along

- **Recommended format: a static page of grid or notation with a moving playhead**, extending the current scrolling-tab player (tempo, count-in, loop already exist). Show 2–4 bars at once so patterns can be recognised. A drum teacher argues 3D scrolling charts make it "difficult to recognize complex rhythmic patterns quickly" and that stationary notation is "vastly superior in this respect" (Ziker). No controlled study settles lanes vs notation, so this rests on teacher opinion plus the C1 complaints.
- **Grid ↔ notation toggle on the same chart** fills the gap that no reviewed app covers.
- **Form markers** (intro, verse, chorus, fill bars) above the bars, and backing tracks that are original and drumless.
- An optional horizontal "lane" view is just the grid scrolling, so it costs little to add later if users ask.

### D6. Daily review (Leitner, as today)

- **Fact items (spaced review fits best):** note and rest values; counting syllables; time-signature meanings; drum-staff positions and symbols; rudiment name ↔ sticking; groove-by-ear (which grid?); subdivision by ear; form terms.
- **Short performance items:** "tap this one bar" with a timing score; graded on the rhythm being right first, timing second.
- **Weak spots:** by beat position (late on "a"), by limb (left hand weak), by note value (triplets). Mix types once each is learned (interleaving), and pair confusables (kick on "&" vs "a"; triplet vs dotted 8th–16th).

### D7. Progress

- Keep streaks, minutes and milestones.
- Add **timing charts:** average offset (early/late) and spread over time, per tempo.
- **Best clean BPM** per rudiment and groove.
- **Timing heat map** across the 16 steps and the four limbs.

### D8. Planned features

- **Ear-training tab:** rhythm dictation and groove recognition belong there too, shared with other instruments.
- **AI custom lessons:** generate practice grooves and fills in the grid format at a chosen level, because grooves are small, checkable data. Grade them with the same timing engine.
- **Accounts/sync:** store calibration offsets per device, not per account.
- **Monetization:** keep timing feedback free on taps and keys, since the main competitor complaints are paywalls and surprise charges.

### D9. Drums and pitch theory: thin, and that's fine

Drums share almost no pitch theory with guitar. What does carry over:
- **Rhythm theory:** note values, meter, subdivision, syncopation and swing. This is most of drum theory.
- **Song form:** sections, 4- and 8-bar phrases, repeats, codas. Hal Leonard devotes a whole lesson to it.
- **Dynamics and accents.**
- **Listening to the band:** following a bass line or a chord change to know where the form is.

Tuning is real but practical (Hal Leonard covers "tuning & maintenance"): heads, tension, toms spaced apart in pitch. Keep it as one light lesson, not a theory unit. Don't invent drum "harmony" content to match guitar's depth.

### D10. Teaching drums without video

| Example | What it does | What to borrow |
|---|---|---|
| **Ableton Learning Music, Beats chapter** | 10 short lessons from "Make beats" through tempo, backbeats and bars to "Play with beats"; you click a grid that shows "the 'inside' of a musical pattern" | Grid-first, hear-and-toggle, sandbox at the end. (It uses famous songs; we must use originals) |
| **Groove Scribe** | Click a grid, get notation and playback instantly | Live link between grid and notation |
| **Melodics** | Animated notes, hand colours, timing colours; no sheet music | Instant early/late colours; "wait mode" that pauses until you hit the right pad |
| **Roland Coach** | Text-only screens: Time Check, Quiet Count, Warm Ups with grades | Short, gradeable timing exercises with no video at all |
| **Hal Leonard audio** | Every example has a demo track and a play-along track without drums | Pair every groove with "hear it" and "play with the band" versions |

**Rules for a drum lesson card** (adapted from round one): one idea per card; the cell lights the moment its sound plays; count syllables under the grid; add one limb at a time, then combine; have the learner try before revealing; show a still diagram of grip or foot motion with one sentence instead of video; end each unit in the grid sandbox.

## E. Recommended 6-level path

Built on section A: grip and kit first but brief; note values in the universal order (quarters → 8ths → 16ths → triplets → syncopation → compound and odd meters); hands, then add the kick, then four limbs; fills after grooves; rudiments spread out; click from day one; form taught explicitly.

**Key:** **[S]** = can be shared with other instruments (rhythm reading, counting, time signatures, form, metronome skills, dynamics); **[D]** = must be drum-specific.

| # | Level | Lesson topics | Playing challenge |
|---|---|---|---|
| **1** | **Pulse, counting and the kit** | 1. The kit and the limb code: R, L, RF, LF (vocabulary card) [D] · 2. Pulse and tempo: tap with the click (also calibrates latency) [S] · 3. Quarter notes and rests, bars, 4/4, counting "1 2 3 4" [S] · 4. Eighth notes, "1 & 2 &" [S] · 5. Grip, full stroke and rebound, kick heel-down (diagrams + self-check) [D] · 6. First rock beat: 8ths on hi-hat, snare on 2 and 4, kick on 1 and 3, learned one limb at a time [D] · 7. Reading the drum staff: the legend [D] | Play the rock beat for 8 bars at 70 BPM, with at least 80% of hits within ±50 ms after calibration, then 4 more bars with the click on 2 and 4 only |
| **2** | **Grooves and first fills** | 1. Eighth rests and kick on the "&" [S reading / D application] · 2. The backbeat and the click on 2 and 4 [S] · 3. Sixteenth notes, "1 e & a" [S] · 4. Single and double strokes; sticking notation (RLRL, RRLL) [D] · 5. Moving around the toms [D] · 6. One- and two-beat fills that land on the crash on "1" [D] · 7. Four-bar phrases: groove × 3 + fill [S form] | 16 bars with an original backing loop: three bars of groove and one bar of fill, four times, landing every fill on "1" |
| **3** | **Sixteenths, dynamics and rudiments** | 1. 16th-note hi-hat grooves (two-handed, one-handed) [D] · 2. Kick on "e" and "a" [D] · 3. Dynamics and accents (p, mf, f, >) [S]; ghost notes introduced [D] · 4. Paradiddle and grooves built from it [D] · 5. Flam and drag (grace notes) [D] · 6. 16th-note fills [D] · 7. Song form: verse, chorus, bridge, 8-bar sections, where fills go [S] | Follow an original song chart (intro–verse–chorus–verse–chorus–end) with the backing track, changing groove per section and filling into each new section |
| **4** | **Triplets, swing and shuffle** | 1. Eighth-note triplets, "1 trip let" [S] · 2. Straight vs swung eighths [S] · 3. The shuffle [D] · 4. 12/8 and 6/8 feel (compound meter) [S] · 5. Triplet fills [D] · 6. Basic jazz ride pattern with hi-hat foot on 2 and 4 [D] · 7. Hearing straight, swing and triplet feels by ear [S] | A 12-bar blues shuffle with the backing track and a fill in bar 12, then switch to a straight-eighth groove on cue |
| **5** | **Coordination and independence** | 1. Hi-hat foot under hand patterns (four-limb coordination) [D] · 2. Reading kick rhythms under a fixed hand pattern (Reed/Chester style) [D] · 3. Syncopation and accented-8th reading [S] · 4. Ghost notes in funk grooves [D] · 5. Open and closed hi-hat [D] · 6. Linear patterns (no two limbs at once) [D] · 7. Other meters: 3/4, then 5/4 and 7/8 [S] | Sight-read 8 bars of syncopated kick rhythms under a hi-hat/snare pattern, then play a 3/4 groove for 8 bars |
| **6** | **Time, feel and your own parts** | 1. Internal time: gap click and fading click [S] · 2. Tempo control: not rushing fills; tempo ladders [S/D] · 3. Playing on top of or behind the beat, on purpose and lightly (big deviations lower groove: Senn et al. 2016) [D] · 4. Style tour with original patterns: funk, pop, reggae one-drop, bossa nova, samba basics [D] · 5. Writing a drum part for a song form in the grid editor [S form / D content] · 6. Trading fours: call and response with the app [D; same idea as guitar improvising] · 7. Kit setup and tuning basics (light) [D] | Write a part for an original song chart in the grid, then play it with the backing track while the click drops out every other 4 bars, with at least 80% of hits within ±35 ms. Optionally trade fours with the app |

**Throughout every level:** counting, reading, rudiment and groove-by-ear items feed the spaced review deck. The tempo ladder and gap click become part of the daily routine from Level 2. Every lesson ends with a tap-or-play quiz; taps or keys are always enough to pass.

**How the path follows section A:**
- The Level 1–2 note-value order matches Alfred, Reed and Hal Leonard.
- Fills after grooves and form by Level 2–3 match Hal Leonard (L8–L10) and Drumeo (L2).
- Paradiddle, flam and drag in Level 3 sit between Drumeo (flams at L3) and Alfred (flams at L27).
- Triplets and shuffle in Level 4 match Hal Leonard (L14–L16), Drumeo (L5, L11–12) and Berklee.
- Four-way coordination in Level 5 matches Drumeo (L7) and Hal Leonard Book 2.
- Odd meters come late everywhere.
- Internal time and feel come last because they need everything else first; Berklee starts there only because its students already play.

**Shared lessons across instruments** (one engine, instrument-specific "play" step): pulse and tempo, note values and counting, time signatures, eighths/sixteenths/triplets, swing, syncopation reading, dynamics, song form, gap-click and tempo-ladder skills, rhythm ear training.
**Drum-only:** the kit and limb code, grip/strokes/feet, the drum staff, stickings and rudiments, grooves, fills, independence, ghost notes, hi-hat technique, styles, tuning.

## F. Technology

Drums depend on timing far more than guitar does, so this is the riskiest part of the plan. The good news: everything needed exists in browsers today, except MIDI on iPhone.

### F1. Sound in the browser

**Option 1: synthesize (no downloads).** Kicks and toms are a single oscillator whose pitch sweeps down fast (Tone.js's `MembraneSynth` is built exactly this way: pitch starts high and falls over `pitchDecay` seconds, `octaves` controls how far). Snares and hi-hats are filtered noise plus a short envelope. This fits the app's existing Karplus-Strong/Web Audio approach, costs zero bytes, and sounds like an 808/electronic kit, not an acoustic one. Good enough for drills and counting; weaker for "hear a real groove."

**Option 2: samples.** Free, licence-clean acoustic kits exist, but the full libraries are far too big for a phone. Use a small subset.

| Kit | Licence | Full download | Notes |
|---|---|---|---|
| **Big Rusty Drums** (Karoryfer) | CC0 (public domain) | 2.3 GB | Made free in 2023 with Unruly Drums, Swirly Drums and Frankensnare |
| **Unruly Drums** (Karoryfer) | CC0 | 2 GB | |
| **Swirly Drums** (Karoryfer) | CC0 | 1.6 GB | |
| **Frankensnare** (Karoryfer) | CC0 | 900 MB | Snares only |
| **Virtuosity Drums** (Versilian) | CC0 | 1.1 GB | Jazz kit; up to 36 dynamic layers on snare/toms/kick, 4 round robins on cymbals |
| **SM Drums** | Public domain | 2.2+ GB | |
| **DRS Kit** (DrumGizmo) | CC-BY 4.0 (credit required) | 754 MB | 13 mic channels |
| **Muldjord Kit** (DrumGizmo) | CC-BY 4.0 | 347 MB | |
| **Naked Drums** | CC-BY 4.0 | 1.3 GB | |
| **Salamander Drumkit** | CC-BY-SA 3.0 (share-alike) | ~370 MB | Share-alike adds obligations; avoid unless needed |
| **Hydrogen kits** | Mixed: GPL-2, CC-BY, CC-BY-SA, CC0, some with licences only "assumed" by Debian packagers | small | **Avoid GMkit/GMRockKit**: Debian found it "derived from non-free sources" (Roland XV-5080) with an "undefined license" |
| **Freesound** | Each sound is CC0, CC-BY or CC-BY-NC | per sound | Use CC0 or CC-BY only; CC-BY-NC forbids earning money, which conflicts with planned monetization |

**Phone budget (our arithmetic, not a measured source):** one second of mono 16-bit 44.1 kHz audio is 88 KB as WAV; compressed it is roughly a tenth of that. A practice kit of ~9 pieces (kick, snare, cross-stick, closed/open/pedal hi-hat, 2–3 toms, ride, crash) × 2–3 velocity layers × ~1 s each is ~25 one-shots, well under 1 MB compressed, and a few MB once decoded to float data in memory. Take one close-mic, mono, short-tail version of each hit from a CC0 kit (Big Rusty, Unruly or Virtuosity), trim, normalise and ship it lazily on first use of the drums tab. Keep synthesized sounds as the instant fallback.

### F2. Input

| Input | How | Support | Reliability | Use it for |
|---|---|---|---|---|
| **Screen taps** | `pointerdown` (not `click`), `touch-action: none`, read `event.timeStamp` | All browsers | Timing is good after calibration; a pad grid can't teach real limb motion | Default on phones: rhythm reading, tap-along, call-and-response with 2–4 pads |
| **Keyboard** | `keydown`, ignore `event.repeat`, read `event.timeStamp` | All desktop browsers | Good; key travel adds a little latency (**unverified**, no source found) | Default on desktop: e.g. F/J = hands, Space = kick, with a limb legend |
| **MIDI e-kit** | Web MIDI API: `navigator.requestMIDIAccess()`; needs HTTPS and a user permission; messages carry a `timeStamp` on the same clock as other events | **Chrome 43+, Edge 79+, Firefox 108+, Chrome Android. Not Safari on Mac or iPhone** (caniuse). Every iPhone browser must use Apple's WebKit (App Review Guideline 2.5.6, with EU/Japan exceptions), so no iPhone browser supports it | Best: exact hits, velocity, which drum | Real practice on e-kits. Map General MIDI drum notes on channel 10: kick 36 (35), snare 38, side stick 37, closed hi-hat 42, pedal hi-hat 44, open hi-hat 46, toms 41/43/45/47/48/50, crash 49, ride 51, ride bell 53. Let users remap, since kits differ (Melodics users report remapping problems) |
| **Microphone** (practice pad or acoustic kit) | `getUserMedia` with `echoCancellation: false` (plus `noiseSuppression`/`autoGainControl` off), onset detection in an `AudioWorklet` | AudioWorklet: Chrome 66+, Firefox 76+, Safari 14.1+, iOS 14.5+ | Detecting **when** a single pad is hit in a quiet room is a solved, reliable problem. Telling **which** drum on a full kit, with music playing, is hard: research drum-transcription systems are scored with 20–50 ms tolerances and still miss hits (Vogl et al. 2016; a transcription paper reports cymbals are transcribed less precisely than drums: search snippet only, **unverified**). Click bleed into the mic must be avoided (headphones) | Optional "timing only" checks on a practice pad. Never for grading which drum was hit |

**Never block progress** (round-one lesson, same for drums): taps and keys are always enough to pass a lesson; MIDI and microphone are optional extras; every graded "play" step has "I played it" self-check and a "mark correct" override; a failed detection is never a fail.

### F3. Timing: measuring accuracy fairly

**Two clocks.** The click is scheduled on the audio clock (`AudioContext.currentTime`); hits arrive with `event.timeStamp` on the page clock (same as `performance.now()`). Convert between them with `AudioContext.getOutputTimestamp()` (Chrome 57+, Firefox 70+, Safari 14.1+, iOS 14.5+), and add `outputLatency` (the delay from the audio graph to the speaker: Chrome 102+, Firefox 70+, **Safari/iOS only from 18.4**) or fall back to `baseLatency` (widely available since 2021). Timestamps are rounded to 0.1 ms (Chrome) or 1 ms (Safari, Firefox), which is fine; Firefox's "resist fingerprinting" mode rounds to 16.7 ms, too coarse for strict grading.

**Latency you can't see from code.**
- Tap to sound on an iPad/iPhone averaged **61 ms wired vs 224 ms over Bluetooth** (Coyle 2016, which includes touch and app delay). His later test measured AirPods 274 ms, AirPods 2 178 ms and AirPods Pro 144 ms.
- A Pixel phone's best-case audio round trip (in to out) was 18 ms in Google's own measurements, with older devices at 32–38 ms. Superpowered calls ≤10 ms "professional audio quality."
- End-to-end touch latency on commercial touch devices was reported as 60–200 ms (Ng et al. 2012, via a citing paper: **unverified**).
- An informal forum test found ~50–60 ms extra audio lag in Chrome on one Android phone versus ~10 ms in Samsung's browser (**anecdotal**).

So a constant offset of 50–300 ms is normal and differs per device and per headphone. **Calibration is not optional.**

**How rhythm games calibrate.** Rock Band and Clone Hero keep separate audio and video offsets; Clone Hero's tool has you strum to audio and visual cues, averages the offsets, and shows a hit-window display; it suggests 0–5 ms video offset for a monitor and 30–100+ ms for a TV. Rock Band's manual steps are 10–15 ms, and repeat results within ±15 ms are "golden." Rhythm Quest's developer calibrates audio by eye with a silent tap test, because tap sounds would themselves be delayed.

**Recommended calibration for Fretboard Lab:**
1. **Audio offset:** play 16 clicks at 90–100 BPM; the learner taps along; drop the first 4; take the **median** offset; show the spread. Repeat if spread is large.
2. Store the offset **per output device** and re-run it when headphones change. If the offset is above ~150 ms, say "Bluetooth headphones add delay; wired headphones or the speaker will be more accurate." (Threshold is our suggestion.)
3. MIDI kits get their own offset (usually small).
4. The calibration screen doubles as the first "tap in time" lesson.

**What window is fair?**

| Source | Tightest grade | Middle | Loosest "hit" |
|---|---|---|---|
| StepMania defaults (source code) | ±22.5 ms | ±45 / ±90 ms | ±135 / ±180 ms |
| osu!mania at OD 5 | ±16 ms | ±49 / ±82 ms | ±112 / ±136 ms |
| osu! (standard) at OD 5 | ±50 ms | ±100 ms | ±150 ms |
| Roland V-Drums Time Check | EASY / Normal / HARD settings (no ms published) | | |
| Human data (B1) | Pro drummer SD 9–16 ms; musicians early by ~10–30 ms (**unverified**) | | |

**Recommendation (our design, derived from the table):**
- After calibration, beginners score **"in time" within ±50 ms and "tight" within ±25 ms**; offer Normal (±35/±18) and Strict (±25/±12), like Roland's EASY/Normal/HARD.
- Cap the window below **half the gap between notes** so a hit can't count for the wrong note: 16th notes at 120 BPM are 125 ms apart, so the window must be under ±62 ms.
- Report **average offset** ("you're 20 ms early") separately from **spread** ("consistency ±14 ms"), and don't mark a hit wrong for a small, steady early bias. Musicians naturally play slightly early (B1).
- Summarise after each pass instead of only flashing every hit (guidance hypothesis, B3).

**Risks.** (1) Bluetooth latency changes over time and between sessions, so stale calibration gives unfair scores; re-check quietly (median offset drifting more than ~30 ms → prompt). (2) `outputLatency` is new in Safari (18.4); older iPhones must rely on calibration alone. (3) Busy main thread: schedule clicks with the existing lookahead scheduler on the audio clock, never with `setTimeout` alone, and timestamp hits from the event, not when the handler runs. (4) No Web MIDI on iPhone at all.

## Sources

### Curriculum
- Hal Leonard Drumset Method Book 1 (Wylie and Bissonette), publisher sample with table of contents: https://hudsonmusic.com/wp-content/uploads/kennanwyliedrumsetmethod1-sample.pdf
- Hal Leonard Drumset Method Book 1, product page: https://www.halleonard.com/product/209864/hal-leonard-drumset-method-book-1
- Alfred's Drum Method Book 1 (Black and Feldstein), sample with table of contents: https://hudsonmusic.com/wp-content/uploads/alfreddrumbook1-sample.pdf
- Alfred's Drum Curriculum Guide: https://content.alfred.com/catpages/00-20877.pdf
- Reed, Progressive Steps to Syncopation, sample with table of contents: https://hudsonmusic.com/wp-content/uploads/alfredsyncopation-sample.pdf
- Nexus Percussion, review of Stone's Stick Control: https://www.nexuspercussion.com/?p=7040
- Hal Leonard, The New Breed (Chester): https://www.halleonard.com/product/6620100/the-new-breed
- PAS, Studying The New Breed: Introduction (Latham): https://pas.org/?p=27593
- Hudson Music, Groove Essentials 1.0 book: https://hudsonmusic.com/product/groove-essentials-1-0-book
- PAS International Drum Rudiments page: https://pas.org/resources/rudiments
- PAS rudiments PDF: https://pas.org/wp-content/uploads/2024/04/pas-rudiments.pdf
- Vic Firth 40 essential rudiments: https://ae.vicfirth.com/education/40-essential-rudiments/
- Berklee Online, Drum Set Performance 101: https://online.berklee.edu/courses/drum-set-performance-101
- Musora drums (Drumeo lesson path, pricing): https://www.musora.com/drums
- Drumeo beginner page: https://www.drumeo.com/beginner
- Drumeo, How to read drum music: https://www.drumeo.com/beat/how-to-read-drum-music/
- Wikipedia, Percussion notation (citing Weinberg/PAS): https://en.wikipedia.org/wiki/Percussion_notation

### Learning research
- Pollok et al. 2017, drummers' motor timing (Frontiers): https://www.frontiersin.org/articles/10.3389/fnhum.2017.00183/full
- Cameron and Grahn 2014, percussionists' timing (Europe PMC full text): https://www.ebi.ac.uk/europepmc/webservices/rest/PMC4262051/fullTextXML
- Matthews et al. 2016, instrument-specific training and rhythm: https://www.frontiersin.org/articles/10.3389/fpsyg.2016.00069/pdf
- Scheurich et al. 2018, rate flexibility (Frontiers): https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2018.00458/pdf
- Räsänen et al. 2015, Porcaro hi-hat fluctuations (PLoS ONE): https://www.ebi.ac.uk/europepmc/webservices/rest/PMC4454559/fullTextXML
- Hennig et al. 2011, fluctuations in human musical rhythms (PLoS ONE): https://www.ebi.ac.uk/europepmc/webservices/rest/PMC3202537/fullTextXML
- Senn et al. 2016, microtiming and groove (Frontiers): https://www.ebi.ac.uk/europepmc/webservices/rest/PMC5050221/fullTextXML
- Wiseheart et al. 2017, lack of spacing effects in piano learning: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC5553926/fullTextXML
- Maslovat et al. 2009, guidance hypothesis, bimanual coordination (abstract via Europe PMC): https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1080/00222895.2009.10125923%22&resultType=core
- Schmidt et al. 1989, summary knowledge of results (abstract via Europe PMC): https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1037//0278-7393.15.2.352%22&resultType=core
- Krampe et al. 2000, bimanual rhythm production (abstract via Europe PMC): https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1037//0096-1523.26.1.206%22&resultType=core
- Carter and Grahn 2016 (from round one): https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2016.01251/full

### Apps and users
- App Store, Melodics drums: https://apps.apple.com/us/app/melodics-real-drum-learning/id6504540940
- Trustpilot, Melodics: https://www.trustpilot.com/review/melodics.com
- Melodics app settings (support): https://support.melodics.com/en/articles/6777096-melodics-app-settings
- KVR Audio forum, Learning finger drumming with Melodics: https://www.kvraudio.com/forum/viewtopic.php?p=6369447
- App Store, Drumeo/Musora: https://apps.apple.com/us/app/drumeo/id1460388277
- Trustpilot, Drumeo: https://www.trustpilot.com/review/drumeo.com
- Yousician home page (instrument list): https://yousician.com/
- App Store, Complete Rhythm Trainer: https://apps.apple.com/us/app/-/id1550799056
- Roland TD-17 owner's manual (Coach mode): https://static.roland.com/assets/media/pdf/TD-17_eng01_W.pdf
- Roland TD-25 owner's manual: https://cdn.roland.com/assets/media/pdf/TD-25_e03_W.pdf
- Roland TD-02 owner's manual: https://static.roland.com/assets/media/pdf/TD-02_eng01_W.pdf
- Roland V31 reference, Quiet Count: https://static.roland.com/manuals/v31_reference_v200/en-US/408041227412880139.html
- App Store, Drum Coach (Upbeat Studio): https://apps.apple.com/us/app/-/id6443453750
- App Store, Drums: Learn & Play Beat Games (MWM): https://apps.apple.com/us/app/drums-learn-play-beat-games/id1381436705
- App Store, Drumgenius: https://apps.apple.com/us/app/drumgenius/id492279351
- GrooveScribe on GitHub: https://github.com/montulli/GrooveScribe
- Drummer Cafe, Rock Band making millions of new drummers part deux (Ziker): https://drummercafe.com/featured/articles/rock-band-making-millions-of-new-drummers-part-deux

### Teaching without video
- Ableton Learning Music, Make beats: https://learningmusic.ableton.com/make-beats/make-beats.html

### Technology
- MDN, Web MIDI API: https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API
- caniuse, Web MIDI: https://caniuse.com/midi
- Apple App Review Guidelines (2.5.6 WebKit): https://developer.apple.com/app-store/review/guidelines/
- Wikipedia, General MIDI (percussion key map): https://en.wikipedia.org/wiki/General_MIDI
- MDN, AudioContext.outputLatency: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/outputLatency
- caniuse, outputLatency: https://caniuse.com/mdn-api_audiocontext_outputlatency
- caniuse, getOutputTimestamp: https://caniuse.com/mdn-api_audiocontext_getoutputtimestamp
- MDN, AudioContext.baseLatency: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/baseLatency
- MDN, Event.timeStamp: https://developer.mozilla.org/en-US/docs/Web/API/Event/timeStamp
- caniuse, AudioWorklet: https://caniuse.com/mdn-api_audioworklet
- MDN, echoCancellation constraint: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/echoCancellation
- Stephen Coyle, Bluetooth latency (2016): https://stephencoyle.net/latency/
- Stephen Coyle, AirPods Pro latency: https://stephencoyle.net/airpods-pro
- Android audio latency measurements (AOSP docs, archived): https://android.googlesource.com/platform/docs/source.android.com/+/0c5edfedac38fa45dc734e3fc50c697744f56ba8/en/devices/audio/latency_measurements.html
- Android Developers Blog, WALT: https://android-developers.googleblog.com/2016/04/a-new-method-to-measure-touch-and-audio.html
- Superpowered web browser latency test: https://superpowered.com/webbrowserlatency
- osu! wiki, Overall difficulty (hit windows): https://osu.ppy.sh/wiki/en/Beatmap/Overall_difficulty
- StepMania source, Player.cpp (timing window defaults): https://raw.githubusercontent.com/stepmania/stepmania/5_1-new/src/Player.cpp
- Clone Hero wiki, Calibrating audio and video: https://wiki.clonehero.net/books/guides-and-tutorials/page/calibrating-audio-and-video
- Rhythm Quest devlog 10 (calibration): https://rhythmquestgame.com/devlog/10.html
- Vogl et al. 2016, RNNs for drum transcription (ISMIR): https://archives.ismir.net/ismir2016/paper/000269.pdf
- Tone.js MembraneSynth docs: https://tonejs.github.io/docs/15.0.4/classes/MembraneSynth.html
- SFZ Instruments, drums (licences and sizes): https://sfzinstruments.github.io/drums
- DrumGizmo kits: https://drumgizmo.org/wiki/doku.php?id=kits
- DrumGizmo DRS Kit: https://drumgizmo.org/wiki/doku.php?id=kits:drskit
- Versilian Studios, Virtuosity Drums: https://versilian-studios.com/virtuosity-drums/
- Freesound FAQ (licences): https://freesound.org/help/faq/
- Debian hydrogen-drumkits copyright file: https://metadata.ftp-master.debian.org/changelogs/main/h/hydrogen-drumkits/stable_copyright
- Debian bug report on Hydrogen GMkit licence: https://alioth-lists.debian.net/pipermail/pkg-multimedia-maintainers/2017-March/058203.html

## Tried but could not access

- **Repp 2005 and Repp and Su 2013 reviews** (Springer login wall); their findings are cited here only through Pollok et al. 2017.
- **Manning and Schutz 2016** and the **Aschersleben 2002 / Repp and Doggett 2007** originals. The "10–30 vs 20–80 ms" musician/non-musician figure comes from a search snippet and is marked **unverified**.
- **Tapping ahead of time** (Yang et al., Springer login wall).
- **Bickmore et al. 2025, IOA paper on metronome devices for drummers** (404).
- **Repp and Doggett abstract on Bohrium** (bot wall).
- **Fujii et al. 2010** drummers' bimanual coordination full text (not retrieved).
- **Stick Control sample PDF** (scanned images, no text). We used a review instead.
- **Drumeo Method 10-level table of contents** (faq.musora.com, 404). Older 10-level structure **unverified**.
- **Groove Scribe live site** (mikeslessons.com, 403). We used the GitHub repo instead.
- **Melodics vs Drumeo page** and **Melodics notation-apps blog** (empty body when fetched).
- **Product Hunt Melodics reviews** (no reviews).
- **Senseii Drums, Drumi, BeatSchool** (not found under these names).
- **Drumgenius review in College Music Symposium** (403).
- **Rock Band calibration help (Harmonix Zendesk)** and **FlashFlashRevolution StepMania thread** (403). StepMania windows were taken from source code instead.
- **RTINGS Bluetooth latency page** (no data in fetched text).
- **Current AOSP latency page** (no table in fetched text; archived version used).
- **MIREX onset-detection results** (expired certificate).
- **Ng et al. 2012 and Deber et al. 2015** touch-latency papers (not retrieved). Touch latency range **unverified**.
- **Hydrogen manual licensing chapter** (certificate error).
- **Opera dev article on synthesizing drum sounds** (redirects to blog home).
- **Chrome Music Lab Rhythm** (page had no description).
- **Reddit r/drums and Drummerworld** (Reddit blocked; no relevant Drummerworld threads found).
