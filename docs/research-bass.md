# Fretboard Lab: Bass Guitar Research

_Researched 2026-11-14. Every source in the Sources list was opened. Anything we could not check is marked **unverified**. This builds on `docs/research-findings.md` (round one, guitar), which already covers the general learning research (retrieval, spacing, interleaving, deliberate practice). We do not repeat that evidence here; we only add what is new or bass-specific._

## Summary

- **Bass courses teach rhythm and hands first, then roots, then theory.** All the methods we checked (Hal Leonard/Friedland, Berklee Bass Performance 101, BassBuzz, TalkingBass, SBL Players Path, Friedland's walking-bass book, Carol Kaye; Simandl for context) put rhythm, plucking, fretting-hand technique and muting in the first lessons. Bass lines then build in the same order: roots → root-5-octave → arpeggios/chord tones → approach notes → walking. Slap, pick and tapping come late. No method starts with the whole neck. Tab comes first; bass clef is a side track.
- **About half the theory can be shared with guitar.** In the proposed 42-lesson bass path, 10 lessons are fully shared, 11 share the concept with bass-specific practice, and 21 are bass-only (rhythm, technique, roots, approach notes, walking, groove).
- **The research on groove supports "lock with the kick" more than "lay back".** Listeners prefer bass–drum offsets under about 20 ms (Hofmann et al. 2017, n = 25). Shifts of 55 ms and more sharply cut pleasantness (Engel et al. 2022). Exaggerated microtiming lowers groove (Senn et al. 2016, n = 159). Whether small "behind the beat" offsets help is disputed. All of these are listening studies; **no study tests how bass students best learn to lock in.** The general learning evidence (retrieval, spacing) is unchanged from round one and is not bass-specific.
- **The apps leave a clear gap.** Multi-instrument apps (Yousician, Fender Play, Rocksmith+) treat bass as secondary: their song choice targets guitarists, and bass detection is weaker. The dedicated bass courses (BassBuzz, SBL, TalkingBass) are well liked, but they are video courses with no interactive neck, drills or spaced review. Their graduates ask for applied theory, chord charts, and making bass lines over drums. SBL's free drum-looper app shows that bassists want grooves rather than a click.
- **The main new technology is drums and timing, not sound.** Free CC0 bass samples exist (Karoryfer Growlybass and others) and can be cut down to about 1–1.5 MB for phones. Web MIDI does not work on any Safari, including iPhone. Mic detection on low notes is slow (≥50 ms needed for the low E) and makes octave errors, so grade by pitch class and never block progress. Bluetooth headphones added 244–484 ms on the Android phones SoundGuys tested, so timing drills need a per-device calibration tap.
- **Effort to add bass: medium.** The tuning and fretboard code already handle any string count. The lesson player, review engine and theory cards carry over. The new work is the groove player, 21 new bass-only lessons plus 11 adapted ones, bass play-along content, a timing meter with calibration, and the bass sound.

---

## A. Curriculum order

### A1. What seven methods teach, and in what order

| Course | Topic order (abbreviated) | What is taught first | How we know / confidence |
|---|---|---|---|
| **Hal Leonard Bass Method** (Ed Friedland, 2nd ed., Books 1–3) | Bk 1: tuning and playing position → musical symbols and rhythms → notes in the first five frets → "must-know bass lines, grooves and techniques". Bk 2: the box shape → moveable boxes → notes in 5th position → major and minor scale patterns → a classic blues line → shuffle → tablature. Bk 3 / Complete Edition: on to "slapping, popping, and playing great pop songs". | Tuning, posture, reading rhythm, first-position notes | Medium. Publisher and retailer topic lists, no full table of contents. |
| **Berklee Online, Bass Performance 101** (Appleman & Morris; Level 1, but assumes you can already play simple lines and read tab or notation) | 1 Half steps, chromatic scale, **left-hand muting** → 2 blues and major/minor pentatonic → 3 major scale → 4 scale degrees, diatonic triads, tenths, Motown → 5 **time, rhythm and groove: playing ahead, behind**, slap and pop → 6 midterm (song form) → 7 minor scales and triads → 8 diatonic harmony, inversions, modes, metronome → 9 ostinato lines, harmonics → 10 tritones, pedal points, double stops → 11 articulation, "what makes a great bass line" → 12 final project | Half steps and the chromatic scale, with muting | High. Syllabus read on the course page. |
| **BassBuzz, Beginner to Badass** (Josh Fossgreen; 107 lessons, 86 songs with backing tracks) | Tuning → the 12-note system → exploring the neck → plucking and right-hand technique → slides → left-hand technique → finger roll → gear → **rhythm, syncopation, "the beat ruler"** → reading tab → string crossing → "music reading made easy" → time signatures → notes on the neck → shuffle, two-beat feel → 12-bar blues → scales (blues, major/minor, pentatonics) → intervals → bass-line creation and improvising → root notes, arpeggios and triads → chords, progressions, Nashville numbers → dynamics → walking bass → muting → triplets → octaves → slap and pop → key signatures → speed → pick technique → ear training and transcribing → jamming → advanced slap, tapping, harmonics | Tuning and the 12-note system, then plucking technique | High for order (official lessons overview; it showed 66 of the 107 lesson titles). |
| **TalkingBass, Beginner Bass Guitar** (Mark Smith; 10 lessons) | 1 The basics → 2 the fretting hand → 3 navigating the fretboard → 4 rhythm basics → 5 notes on the neck → 6 **muting and technique** → 7 two-finger picking → 8 the major scale → 9 five simple bass riffs → 10 the next step. (The larger *Bassic Fundamentals* course has 48 lessons in 4 modules covering technique, "locking in with a drummer", theory, fretboard, sight reading and chord charts; its order is not published.) | Basics, then the fretting hand | High for the 10-lesson course (product page). |
| **Scott's Bass Lessons, Players Path** (9 levels) | Performance-based. Level 1 "just started" → L2 simple bass lines → L3 reads some tab, plays along with songs → L4 grooves comfortably → L5 adds technique → **L6 adds slapping** → L7 plays by ear, improvises → **L8 sight-reads tab or notation, scales and modes** → L9 odd time signatures. Each level: performance pieces, song projects, a final assessment. | Playing simple lines to tracks | Medium. Levels are described by what the player can do, not by topic. SBL's help page listing its beginner courses (Bass 101, Functional Theory, Bass Foundations, Essential Sight Reading) returned 404, so that list is **unverified**. |
| **Ed Friedland, *Building Walking Bass Lines*** (Hal Leonard, 64 pp.) | Roots only (half-note "two feel") → root, 5th, octave → chromatic approach notes to roots and 5ths → dominant approach (from a 5th above/below) → combining chromatic and dominant approaches → scale approach (ends Part 1 over "I Got Rhythm" changes) → Part 2: 3rds, modes (Mixolydian, Dorian), minor and harmonic minor, pentatonics, arpeggios, ii–V–I and "indirect resolution" | Roots and the two feel | Medium. Two independent reviews agree on the order; no publisher table of contents. |
| **Carol Kaye, *How to Play the Electric Bass*** (1969, rewritten 2004; 28 pp.) | Styles → choosing and using a **pick** → setup (tuning, action, pickups, strings, amps) → learning current bass lines and playing along → Kaye's own session lines. Reviewer: "If you're looking for basic scales and diagrams, this is not the book for you." | Real bass lines, by style | Medium (one review). |
| _Context:_ **Simandl, *New Method for the Double Bass*** Bk 1 (upright, classical) | How to hold bass and bow → open strings → moves up the neck a half step at a time (half position, 1st, 2nd … to the octave G) → one- and two-octave major, melodic minor and chromatic scales with fingerings → ornaments → orchestral excerpts | Holding the instrument, open strings, half position | Medium (one detailed review and retailer summaries). |
| _Context:_ **Fender Play, bass** | Five levels; pick a rock or funk (also R&B, blues, pop) path; skills include counting rhythm, slap, slides, walking bass, moveable patterns, pick playing, arpeggios, building bass lines, "locking in with the rhythm section". | A first riff (as for guitar) | Low (launch coverage, no syllabus). |

### A2. Where they agree

1. **Rhythm is taught first or nearly first, before scales.** BassBuzz has rhythm, syncopation and its "beat ruler" before any scale; TalkingBass has "rhythm basics" as lesson 4 of 10, before the major scale; Hal Leonard teaches rhythm patterns in Book 1 next to the first notes. This differs from round-one guitar courses, where rhythm sits inside chord strumming.
2. **Left-hand technique and muting come early.** Berklee pairs left-hand muting with its very first lesson; TalkingBass has "muting and technique" as lesson 6 of 10. (BassBuzz's dedicated "Muting" lesson appears later in the list, but technique and string-crossing lessons come first.)
3. **Roots → root-5-octave → arpeggios/triads → approach notes → walking.** Friedland is built entirely on this ladder; BassBuzz puts "how to use root notes" and "arpeggios and triads" before "walking bass lines"; Berklee does triads in lesson 4.
4. **Pentatonic and blues before or alongside the major scale.** Berklee lesson 2 (blues, pentatonics) comes before lesson 3 (major scale). BassBuzz introduces the blues scale first in its scales block. TalkingBass goes straight to the major scale.
5. **Slap, pop, tapping, harmonics come late.** BassBuzz near the end; Hal Leonard in the last part of the complete edition; SBL at Level 6 of 9. Berklee is the exception (lesson 5), but its course assumes a year of playing.
6. **Playing with a band or track is the goal from early on.** BassBuzz ships 86 songs with backing tracks; SBL's whole path is performance pieces; Kaye's book is play-along lines; Fender Play stresses locking in with the rhythm section.

### A3. Where they differ

- **Reading.** Hal Leonard teaches notation first and lists tablature as a Book 2 topic (though the publisher now describes the Complete Edition as "written in TAB format", so the 2nd edition may show both). BassBuzz does tab early (lesson ~17) and "music reading made easy" right after. SBL leaves sight-reading to Level 8. Simandl is reading-only. TalkingBass sells sight reading as a separate 'all levels' course. **Chord charts** are named only by TalkingBass (*Bassic Fundamentals*) and implied by Friedland (lines built "from song chord charts").
- **Fingers or pick.** Every method teaches fingerstyle first except Kaye, who treats the pick as a main technique. BassBuzz has pick technique near the end.
- **Theory weight.** Berklee and Friedland are theory-led; Kaye and SBL Players Path are repertoire-led; BassBuzz mixes both.
- **Whole neck.** As with guitar, nobody starts with the whole neck. Hal Leonard: first five frets, then 5th position. Simandl: half a step at a time. TalkingBass and BassBuzz: notes on the neck after the first technique and rhythm lessons.

### A4. How theory, technique and reading fit together (what we take from this)

- **Technique runs underneath every level, not as one unit.** Plucking with alternating fingers, one-finger-per-fret in the fretting hand, and muting with both hands are introduced in the first few lessons (TalkingBass 2, 6, 7; BassBuzz 4–9; Berklee 1) and then practised through every later topic. Slap, pop and pick are late electives.
- **Theory is taught as bass-line material.** Every method introduces scales and arpeggios as things to build lines from (BassBuzz "Creating bass lines with the major scale"; Berklee "diatonic triads… Motown"; Friedland's whole book).
- **Reading:** tab first for speed, bass clef as an optional track, chord charts once chords are taught. This is the BassBuzz/TalkingBass pattern and matches the round-one guitar finding that tab-first beginners' courses (Berklee Guitar for Beginners) work.

---

## B. How people learn bass best

### B1. General learning principles (not bass-specific)

Round one (see `docs/research-findings.md` §2) found: retrieval practice and spacing are **strong** for facts (Roediger & Karpicke 2006; Cepeda et al. 2006), deliberate practice is **moderate** (Macnamara et al. 2014: about 21% of variance in music), interleaving is **limited** in music (Carter & Grahn 2016, 10 clarinetists), and short daily sessions rest mainly on general research. **No bass-specific study of any of these was found.** Everything below that concerns note names, intervals and chord tones on bass inherits that evidence as an extrapolation.

One addition for motor skills: in a finger-tapping study of 62 right-handers, practice raised speed by "nearly 60 percent" within a session, and a night's sleep added a further **20 percent**, while 12 hours awake added "no significant improvement" (Walker et al. 2002, as reported by ScienceDaily). This supports short daily sessions with sleep in between for finger patterns (plucking alternation, fingerings). It is a lab tapping task, not bass.

### B2. Why the bass carries the beat: evidence on low notes and timing

| Study | What was done | Result | What it means for us |
|---|---|---|---|
| **Hove, Marie, Bruce & Trainor 2014** (PNAS) | EEG (n = 17) and tapping (n = 18). Two piano tones (196 Hz and 466 Hz) together every 500 ms; occasionally one came 50 ms early. | Brain responses to timing errors were larger when the **low** tone was early (F(1,16) = 16.56, P < 0.001). Tappers shifted more after an early low tone (14 ms) than an early high tone (11 ms), P = 0.014. | The authors call this a "low-voice superiority effect for timing" and argue it explains why bass instruments carry rhythm. |
| **Wojtczak, Mehta & Oxenham 2017** (PNAS) | EEG (n = 17) and threshold tests (7–13 listeners per condition). | Found "no superiority of low frequencies in timing judgments". Instead: listeners tolerate a **late low note** better than a late high note. They attribute this to cochlear delays, not pitch. | **Sources disagree.** Safe conclusion: the ear treats bass timing differently from treble timing; whether bass timing is "more noticed" is contested. |

### B3. Microtiming and groove: does "playing behind the beat" make it groove?

| Study | N and design | Result |
|---|---|---|
| **Butterfield 2010** _(as summarised by Kilchenmann & Senn 2015; not opened directly)_ | Listeners judged bass–drum offsets in jazz | Listeners barely knew which instrument led and could not reliably detect offsets of **30 ms or less**. |
| **Frühauf, Kopiez & Platz 2013** _(as summarised by Kilchenmann & Senn 2015)_ | Online study, rock drum pattern | **Perfectly quantized** versions rated best; bigger shifts, especially early ones, lowered ratings. |
| **Davies et al. 2013** _(as summarised by Kilchenmann & Senn 2015)_ | Samba, funk and jazz clips | Versions with microtiming got lower groove ratings: "microtiming does not increase groove". |
| **Kilchenmann & Senn 2015** (Frontiers) | 160 listeners (79 experts); bass-and-drum duo recordings of swing (150 bpm) and funk (100 bpm); real performance offsets scaled from 0% to 200%. Original funk offsets SD 5.3 ms; swing SD 22.8 ms. | Experts **moved their heads more** at 60% of the original offsets than at full quantization (p = 0.004, small-to-medium effect). Non-experts showed no effect. |
| **Senn, Kilchenmann, von Georgi & Bullerjahn 2016** (Frontiers) | Same design, 159 listeners rating groove (Entrainment, Enjoyment, Irritation). | Quantized and original timing rated **equally high**. **Exaggerated** offsets (+40% to +100%) lowered groove; experts got irritated sooner (from about +40%) than non-experts (about +80%). Peak near −60%. "PDs are not mandatory for music to groove." |
| **Hofmann, Wesolowski & Goebl 2017** (J. New Music Research) | Jazz trios (2 bassists, 3 drummers); 25 listeners chose preferred versions. | Bass vs ride cymbal averaged +2.1 ms; bassists trailed the hi-hat by 7–26 ms. Listeners preferred bass–drum offsets **below 19 ms** over both the original and fully quantized timing ("tight-interlocked rhythm section"). |
| **Engel et al. 2022** (Frontiers in Neuroscience) | Samba percussion; one drum shifted 0/28/55/83 ms; 12 behavioural + 21 fMRI participants. | Pleasantness 8.9 (0 ms), 8.4 (28 ms, not significantly different), 4.5 (55 ms), 2.7 (83 ms). Being in sync recruited motor areas more. |
| **van der Steen & Keller 2013** (review) | Ensemble timing | Trained ensemble musicians typically show asynchronies of **30–50 ms** between notes meant to be together. |
| **Câmara et al. 2020** (JASA) _(read via the University of Oslo news story; full text not accessible)_ | Skilled guitarists, bassists and drummers told to play on, behind, or ahead of the beat | Players did place notes where instructed, and also changed the **sound** (heavier, longer) when laying back. "10–20 milliseconds may be enough for hearing a difference." Sample size **unverified**. |

**What this means for teaching bass**
- **Evidence is moderate and consistent on one point: tight beats bass–drum alignment.** Asynchronies under about 20 ms are preferred or unnoticed (Hofmann 2017; Engel 2022; Butterfield); large or exaggerated offsets clearly hurt groove (Senn 2016; Engel 2022). So the first timing goal for a learner is "lock with the kick", and an app's "in time" window can be ±20–30 ms for experts, wider for beginners.
- **"Behind the beat" is a real, controllable skill (Câmara 2020), but whether it adds groove is contested** (Kilchenmann 2015 yes, for experts' movement; Frühauf, Davies, Senn 2016 no). Teach it as an advanced feel exercise in Level 6, not as a rule.
- **These are listening studies.** We found **no** study measuring how bass students learn to lock in, or comparing practising with a drum loop vs a click. Recommending drum loops over a click is reasoned from the above plus every method's emphasis on playing with a band, not tested.

### B4. Muting and other technique

**No controlled study of bass muting technique was found.** Its importance rests on teaching practice: Berklee puts left-hand muting in lesson 1; TalkingBass gives it a full lesson; BassBuzz a lesson. Treat it as expert consensus, not research evidence.

### B5. Summary table

| Principle | Evidence (bass-specific?) | Use in the bass module |
|---|---|---|
| Retrieval, spacing | Strong, general (round one) | Same review deck, bass items (notes on 4 strings, chord tones, approach tones) |
| Sleep/short sessions for finger skills | Moderate, general motor (Walker 2002: +20% overnight) | 10–15 min daily; technique drills short |
| Bass–drum alignment drives groove | Moderate, several listening studies (N 25–160) | Lock-to-kick drills with a timing meter; ±20–30 ms "tight" window |
| Behind/ahead feel | Mixed; real but disputed value | Advanced elective in Level 6 |
| Low notes and timing | Contested (Hove 2014 vs Wojtczak 2017) | Explain bass's rhythm role, don't overclaim |
| Muting, one-finger-per-fret | Teacher consensus only | Technique cards in every level |

---

## C. Existing apps and what users say

> As in round one, Reddit and TalkBass.com threads could not be fetched (TalkBass returned 403). We used Trustpilot, the App Store, the BassBuzz community forum (which has open threads comparing bass courses), Customsforge, and press reviews. Forum samples skew towards committed learners.

| App / platform | Model and price | What people like | Most common complaints |
|---|---|---|---|
| **Yousician** (guitar, bass, piano, ukulele, voice) | Subscription | Structured progression, tempo and loop tools; 4.5/5 from 22k UK App Store ratings | Trustpilot (3.9/5, 1,322 reviews; 9% one-star): auto-renewal and charges after cancelling; repetitive lessons; weak note recognition (one reviewer: it fails to detect notes "above fret 5 on the low E string"). A bassist: "most of the songs are targeted towards singers and guitarists", with play-along tracks moving to MIDI guitar. Yousician has a help article titled "Bass sound recognition issues" (page blocked to us, 403). |
| **Fender Play** (bass added Sept 2018) | $10/month or $90/year at launch | Short lessons by several instructors, five levels, choice of rock/funk/R&B/blues/pop path, close-up camera angles, skills library (slap, walking bass, arpeggios, "locking in with the rhythm section") | No interactive feedback and no way to ask the instructor (Expert Reviews); BassBuzz forum users call its advanced lessons weak ("6–7 levels below" another service) and see it as a gateway to selling gear. Search snippets claimed Fender's beta feedback mode is "guitar but not bass"; we could not open the source (Guitar World page truncated): **unverified**. |
| **BassBuzz, Beginner to Badass** | One-time purchase | Step-by-step pacing, the teacher's energy, beginner-friendly, 86 songs with backing tracks, cheaper than private lessons | From its own review thread: a whole slap module "killed my momentum"; "a lot of bars… to remember"; wants "more on chords", practice tips earlier. After finishing, students ask for full songs at slow/medium/full speed, "applied music theory", chord charts and Nashville numbers, "vamping with drums and creating bass lines". Forum users find the course navigation "a bit confusing". |
| **Scott's Bass Lessons** (SBL; also the free SBL Groove Trainer app) | $199/year membership, 14-day trial | Trustpilot 4.8/5 from 839 reviews: structured paths, expert working-musician teachers, community and live sessions. Groove Trainer app (4.8/5, 154 ratings): metronome, tuner, drum looper with live drummer samples, chord drone; "replaces all of my other apps". | "Scott Devine talks a lot"; tech-support and account-access problems (Trustpilot summary); subscription in US dollars and "carpet-bombed with emails" (forum). Groove Trainer users ask for a visual tempo display and looping chord changes. |
| **TalkingBass** (Mark Smith) | One-time course purchases ($49–$260), frequent sales, 500+ free YouTube lessons | Thorough, "music school feel", responsive teacher, weekly live Q&A; *Chord Tone Essentials* singled out | "Soup to nuts" coverage makes it hard to see what's essential; long sight-reading drills ("many and many and long long long"); a style "not for everyone, possibly most especially beginners". |
| **Rocksmith+** (Ubisoft; guitar and bass, real instrument via cable or mic) | £12.99/month | Feedback, dynamic difficulty, Riff Repeater, wide library | "Significant technical errors with note detection" with an amplified electric guitar; the Real Tone cable fixes it (NME). Bass players on Customsforge (Rocksmith 2014) report missed F and F♯ notes and that it "just doesn't do well on some of the bass tones", stuck at 70–80% on down-tuned songs. |
| **Fretonomy** (fretboard trainer) | 4-string and 5-string bass $2.99 each; 6-string bass listed | Supports 4/5/6-string bass and custom tunings | Bugs (one review: "the 23rd fret is wrong" on 6-string bass). See round one for its general reviews. |
| **Bass Fretboard Addict** | Lite + paid add-ons (Eb tuning $4.99) | Notes, chords, ear training, sight reading; 5-string bass added | Too few ratings to show; reviews on the page are developer-chosen. |

### What this adds up to

1. **Bass is a second-class citizen in multi-instrument apps.** Yousician's song choice targets guitarists and singers; Fender Play's bass gets weaker reviews than its guitar; Rocksmith's detection struggles with low and down-tuned notes.
2. **The dedicated bass courses are video courses.** BassBuzz, SBL and TalkingBass are well liked but are watch-then-play. None has an interactive fretboard, drills that check your answer, or spaced review. Students finishing them ask for the very things an app does well: applied theory, chord charts, creating bass lines over drums, slowed-down practice tracks.
3. **Practice tools that bassists value are grooves, not clicks.** SBL built a whole free app around a drum looper plus chord drone, and its users want looping chord changes, which is our backing-track feature.
4. **Microphone detection is worse on bass than on guitar** (Yousician help page title, Trustpilot, Rocksmith reports). This confirms round one's rule: never block progress on detection.
5. **Pricing complaints carry over** (auto-renew, US-dollar subscriptions, email volume).

**Gaps Fretboard Lab can fill:** an interactive, no-video bass theory path (chord tones, approach notes, walking lines) with tap-to-answer drills; a groove trainer with drum loops and looping chord changes built into lessons rather than a separate app; spaced review of bass fretboard and chord-tone facts; timing feedback against a drum loop that never locks you out; and 5-string and drop-D support from day one.

## D. Mapping every app module to bass

_This section is design reasoning built on sections A–C. Where it rests on evidence, the source is named; the rest is our recommendation. A quick look at the code: `js/theory.js` already stores a tuning as a list of strings with MIDI numbers, and `js/fretboard.js` draws `tuning.strings.length` strings, so 4-, 5- and 6-string necks are mostly data. Lesson positions use guitar string numbers (6 = low E), which collide with bass numbering (on bass, string 4 is the low E and string 5 the low B); keep positions as `{ string, fret }` per instrument and let each instrument own its numbering._

### D1. Instrument view (fretboard)

| | Guitar today | Bass |
|---|---|---|
| **Strings and tunings** | 6-string standard | **4-string E A D G** (E1–G2, MIDI 28/33/38/43) default; **5-string B E A D G** (low B0, MIDI 23); **drop D** (D A D G); **6-string B E A D G C**; optional half-step down (E♭). Store each as a tuning in `TUNINGS`. |
| **Neck length** | 0–15 | 0–20 (most basses have 20–24 frets); default view 0–12 |
| **Scales** | 31 | Keep all; add **"bass view" presets**: major and minor scale in one-finger-per-fret position (4-fret box), pentatonics, blues, Mixolydian, Dorian. Hal Leonard's "box shape" and "moveable boxes" (Book 2) are this. |
| **Chords** | 27 strummed voicings | Chords on bass are shown as **arpeggios and chord tones**, not strum shapes: root-5-octave, root-3-5, root-3-5-♭7 (and 10ths, Berklee lesson 4). Add a "chord-tone view": pick a chord, see every R/3/5/7 on the neck in the existing colour code. |
| **New shape overlays** | Position view, CAGED | **Root-5-octave shape** (one string up, two frets up; octave two strings up, two frets up) and its fifth-below version; **approach-tone overlay**: for a target chord, mark the half step above and below the root and the 5th above/below (Friedland's chromatic and dominant approaches). |
| **Scale over chord** | Yes | Becomes **"line over chart"**: a chord chart scrolls; the neck lights the current chord's tones, and the next chord's root flashes as the target on beat 4. |
| **Drone, heat map, left-handed, player's view, tap to hear** | Yes | Keep all. Tap-to-hear needs a bass sound (section F). |

### D2. Guided Learn path

Same six-step lesson player (hear, learn, see, try, play, check). What changes:
- The **"play" step uses a drum loop instead of a click** by default (D4), so every lesson practises locking in.
- **New card type: rhythm grid.** Rhythm comes first in the bass methods (A2), so lessons need a one-bar, 16-step grid where the learner taps where the notes fall, hears the result with drums, and the app highlights which notes land with the kick. This is the Ableton Learning Music pattern from round one (toggle, hear, sandbox).
- **Technique cards** (plucking alternation, muting, one-finger-per-fret) can't be checked by tapping. Use short "do this, then tick when done" cards with an animated hand diagram and an optional mic check that never blocks.
- **Placement quiz**: share the theory questions with guitar; add bass-only items (bass neck notes, chord tones, rhythm reading).

### D3. Drills

| Guitar drill | Bass equivalent | Design |
|---|---|---|
| Note finder | **Note finder, bass neck** | Same, with 4/5-string necks; weight E and A strings first, as round one recommends for guitar. |
| Hear it, find it (over a drone) | **Find the root** | A chord or short progression plays (piano or guitar pad, drums); tap the root of each chord on the bass neck. Bass's first job is the root, so this is the core ear drill. |
| — | **Hear the bassline, play it back** | A 1–2 bar original bassline plays over drums using only R, 5, octave (later 3 and approach notes); the learner taps it note by note, then plays it on their bass. Graded on pitch by tap, optional mic. |
| — | **Lock to the kick** | A drum loop plays; tap (on screen or a key) on every kick, or play roots on the bass with the mic. The app shows each hit as early/late in ms against a ±30 ms "tight" band, widening to ±60 ms for beginners. The research on bass–drum alignment (B3) supports the target; the evidence for training it this way is **untested**. Must calibrate latency first (F3). |
| Interval trainer | **Interval trainer (shared)** + **chord-tone spotter** | Same intervals; add "name this chord tone": a chord sounds, a bass note sounds, answer R/3/5/7. |
| — | **Approach-note drill** | Shown chord A going to chord B, tap a note a half step above/below B's root on beat 4. |

### D4. Practice tools

- **Metronome → groove player.** Keep the lookahead scheduler; add drum patterns: rock 8ths, four-on-the-floor, half-time, shuffle, funk 16ths, two-feel/walking swing, bossa, reggae one-drop, 12/8. Mute options: **kick only**, **kick + snare**, full kit, and "drop out" bars (the drums go silent for a bar and come back, so you can check that you held time). Users of SBL's Groove Trainer asked for a **visual tempo display** and **looping chord changes**; build both in.
- **Chord drone + groove**: SBL added a chord drone under the drum loop; we already have a drone and a looping backing track, so combine them: a drum loop + chord progression loop with the bass part removed.
- **Practice timer routines**: bass routine template, e.g. 2 min technique (plucking, muting), 4 min lock-to-kick, 4 min lesson material, 3 min play-along, 2 min review.
- **Practice log**: same.

### D5. Play-along

- **Format: bass tab (4/5 lines) by default, with optional bass clef notation** drawn under it. Most beginner methods teach tab early and treat notation as a parallel or later track (A3). Show chord symbols above the tab so the learner sees which chord tone each note is.
- **Always with drums** (plus an optional chord pad), and **a "bass removed / bass guide" toggle**: hear the line played by the app, then mute it and play.
- **Tempo, count-in, loop** stay. Add a per-bar loop and an auto-speed-up (+5 bpm each clean loop).
- **Content:** only original or public-domain material. Public-domain melodies can supply chord progressions (e.g. "Amazing Grace", "Greensleeves", "When the Saints Go Marching In", traditional 12-bar blues forms), with original basslines written for them. Original grooves per style (rock 8ths, Motown-style chromatic approach, funk octaves, reggae one-drop, walking blues) are the main content. Never transcribe recorded basslines.

### D6. Daily review

Same Leitner engine and boxes. Bass items:
- **Facts:** note at string/fret (bass neck, including B string), chord spellings as R/3/5/7, scale degrees, intervals as shapes (bass shapes differ from guitar: no B-string shift, every string a 4th apart).
- **Bass-specific facts:** where the 5th and octave are from any root; approach notes (half step above/below a target root); tenths.
- **Rhythm items:** read a one-bar rhythm and tap it with the drums (graded by timing window). These are motor items; review them more often and keep them short (B1: spacing evidence is limited for motor skills).
- **Interleave** once a level is done: find-the-root, chord-tone spotter and note-finder mixed.

### D7. Progress

Keep streaks, minutes, accuracy and the heat map (per bass string and fret). Add a **timing chart**: average early/late offset and spread per session from lock-to-kick drills, so learners see their timing tighten. Milestones: "first walking chorus", "locked within ±30 ms for 8 bars".

### D8. Planned features

- **Ear training tab:** add find-the-root, play-back-the-bassline, and progression recognition (shared with guitar).
- **AI custom lessons:** generate original basslines over a chosen progression and style, checked against rules (roots on beat 1, approach note on beat 4).
- **Accounts and sync:** progress should be per instrument, with shared theory items counted once (see E).
- **Monetization:** round one and section C both find billing complaints (auto-renew, trials); keep pricing simple and one-time where possible.

### D9. Teaching without video: interactive examples that work for bass

| Example | Why it works | Bass use |
|---|---|---|
| **Ableton Learning Music** step sequencer (round one) | Toggle steps, hear the result immediately, sandbox at the end | Rhythm grid for bass + kick: put notes on the kick and hear it lock |
| **Groove Trainer-style drum looper** (SBL) | Real-feel drums replace a click; users say it "replaces all of my other apps" | Default backing for every play step |
| **Chord-tone neck highlighting** (our scale-over-chord) | Colour code R/3/5 on the neck while the chord sounds | Line-over-chart walking lessons |
| **"Try before reveal"** (round one, Brilliant) | Learner commits, then sees and hears the answer | "Tap the approach note into the next chord" |
| **Bass-removed play-along** (BassBuzz backing tracks; Hal Leonard PLAYBACK+ slow-down and loop) | Practising with a band context | Every play-along has a bass on/off toggle and slow-down |

Rules from round one (§4) all carry over. Two bass additions: (1) **always pair the neck with the drums**, because the musical point of a bass note is where it sits against the kick; (2) **show the chord chart above the neck**, because a bass note's meaning depends on the chord.

## E. Recommended 6-level path

**Key:** **[S]** = theory lesson that can be **shared with guitar** (same concept and card text; only the neck diagram and sounds swap). **[B]** = must be **bass-specific**. **[S*]** = shared concept, bass-specific application (reuse the explanation cards, write new see/try/play steps).

Design principles taken from section A: rhythm and technique from Level 1 (A2.1–2); roots → root-5-octave → triads/arpeggios → approach notes → walking (A2.3, Friedland); pentatonic/blues alongside the major scale (Berklee); slap, pick, tapping late or optional (A2.5); tab first, bass clef optional, chord charts from Level 4 (A3); improvising/creating lines in every level (round one finding, BassBuzz "bass line creation"). Every play step runs over a drum loop.

| # | Level | Lesson topics | Playing challenge |
|---|---|---|---|
| **1** | **The neck, the pulse and your hands** | 1. Strings E A D G (and B on 5-string), string and fret numbers **[B]** · 2. Plucking with alternating index/middle fingers; thumb anchor **[B]** · 3. The fretting hand: one finger per fret, fingertip pressure **[B]** · 4. The pulse: quarter notes, counting 1-2-3-4, playing with a kick drum **[B]** · 5. The musical alphabet and half/whole steps **[S]** · 6. Natural notes on the E and A strings; octave shape (two strings up, two frets up) **[S*]** · 7. Muting: fretting-hand release and plucking-hand rest-stroke **[B]** | Over a rock drum loop at 70 bpm, play the root the app names (e.g. "A on the E string") on beat 1 of each bar for 8 bars, landing with the kick (timing shown, never blocks). |
| **2** | **Roots and rhythm** | 1. Eighth notes and rests; the rhythm grid **[B]** · 2. Root notes on chord changes (chord chart basics: one chord per bar) **[B]** · 3. Sharps and flats; finding any note via octaves **[S]** · 4. Root-5th and root-5th-octave shape **[B]** · 5. Reading bass tab **[B]** · 6. Syncopation: notes off the beat, locking to kick patterns **[B]** · 7. Create: a 1-bar groove from R, 5, 8 **[B]** | Play an original 4-chord progression (e.g. G–C–D–G) with roots in 8ths, then root-5-octave, along with the drums; then make up a 2-bar root-5-octave groove and loop it for 30 seconds. |
| **3** | **Major scale, keys and the pentatonic** | 1. W-W-H-W-W-W-H; one-octave major scale in one-finger-per-fret position **[S*]** · 2. Scale degrees 1–7 **[S]** · 3. Moving the box to any key **[S*]** · 4. Key signatures and circle of 5ths (light) **[S]** · 5. Relative minor; natural minor box **[S*]** · 6. Major and minor pentatonic; blues scale **[S*]** · 7. Create: a line from scale notes that starts and ends on the root **[B]** | Play the C major scale up and down in 8ths with a drum loop at 80 bpm; then improvise a bassline from the A minor pentatonic for 60 seconds over an Am drone + groove. |
| **4** | **Intervals and chord tones** | 1. Intervals as distances from the root; bass shapes (every string a 4th apart, no B-string shift) **[S*]** · 2. Major vs minor 3rd (confusable pair) **[S]** · 3. Building triads R-3-5; major/minor/diminished **[S]** · 4. Arpeggios on bass: R-3-5-8 and R-5-8-10 (tenths) **[B]** · 5. 7th chords as R-3-5-♭7 / 7 arpeggios **[S*]** · 6. Chords of a major key **[S]** · 7. Hearing chord tones: is this note R, 3 or 5? **[S*]** | Read a chord chart (C–Am–F–G) and play an arpeggio line (R-3-5-3) for each chord with the drums; then the app plays a chord + bass note and you name the chord tone (8 of 10). |
| **5** | **Progressions and connecting chords** | 1. Roman numerals and the Nashville number system **[S]** · 2. I–IV–V and the 12-bar blues; the shuffle feel **[S*]** · 3. I–V–vi–IV **[S]** · 4. Chromatic approach notes (half step into the next root) **[B]** · 5. Dominant (5th-above/below) and scale approach notes **[B]** · 6. Recognising progressions by ear; following the bass **[S*]** · 7. Song form: verse, chorus, bridge on a chart **[S]** | Play a 12-bar blues in A with a shuffle groove using R-3-5-6-♭7 patterns and an approach note into each chord change; then pick out an original progression by ear (multiple choice). |
| **6** | **Groove and walking** | 1. The two-feel and the four-feel (Friedland's starting point) **[B]** · 2. Walking bass: roots on beat 1, chord tones, approach on beat 4 **[B]** · 3. Walking over ii–V–I **[B]** · 4. Groove styles: Motown-style 8ths, funk 16ths and octaves, reggae one-drop **[B]** · 5. Feel: playing on, behind and ahead of the beat; note length and dynamics **[B]** · 6. Modes for bass lines: Mixolydian and Dorian **[S*]** · 7. Electives: slap and pop, pick playing, 5-string low B **[B]** | Walk two choruses of an original 12-bar blues in F at 100 bpm with a swing drum loop, landing on the root of each chord on beat 1 and approaching each change on beat 4. Optional: record and log it. |

**How much is shared.** Of 42 lessons, 10 are fully shared **[S]**, 11 are shared concept / bass application **[S*]**, and 21 are bass-only **[B]**. Theory cards (note names, steps, scales, keys, intervals, triads, numerals, progressions) can be written once with an `instrument` parameter for the neck and sound; rhythm, technique, roots-and-approach, walking and groove must be written new. Shared items should be **one review item counted once** across instruments (e.g. "the 3rd of C is E"), while neck-position items are per instrument.

**Bass-clef reading** is not in the core path (only SBL Level 8 and Hal Leonard make it central). Offer it as an optional side track ("read it in bass clef") on the same play-alongs.

## F. Technology

### F1. Sound: a realistic bass in the browser

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Karplus-Strong (current pluck), retuned for bass** | Zero download; the app already has it; Julius Smith's extended KS adds pick position (comb filter), pick direction and a dynamic-level low-pass for brightness, plus a tuning all-pass for exact pitch at long delay lengths | Sounds like a plucked string but thin for bass unless the damping/brightness filters are tuned; no finger "thump" or fret noise | Good default for tap-to-hear and drills. Lower brightness, longer decay, pick position near the bridge for a fingerstyle tone. **Untested by us**: needs listening tests on phone speakers, which roll off low frequencies. |
| **Free multisamples** | Realistic; round robins and velocity layers available | Download size; licences need checking | Best for play-alongs and the "hear the bassline" drill. Load lazily. |

**Free electric bass sample sets (licences as listed by the SFZ Instruments catalogue; check the licence file in each download before shipping):**

| Set | Instrument | Licence | Download size | Notes |
|---|---|---|---|---|
| **Karoryfer Growlybass** | Squier Jazz bass, direct, both pickups | CC0-1.0 (catalogue); Bedroom Producers Blog: "royalty-free for all commercial and non-commercial use" | ~160 MB | 310 samples: sustains with 4 velocity layers × 4 round robins, staccato, releases, pick scrapes; 24-bit WAV + SFZ |
| **Karoryfer Fashionbass** | Jazz-style bass | CC0-1.0 | 302 MB | Search snippets say every minor third, 5 velocity layers: **unverified** |
| **Karoryfer Swagbass** | Bass with fabric on the body (dull, down-tuned, hip-hop) | CC0-1.0 | 138 MB | 331 samples, 24-bit WAV (official page) |
| **Karoryfer Black and Blue Basses** | Two 5-string basses | CC0-1.0 | 961 MB | Useful for the low B |
| **Karoryfer Pastabass** | Squier Bass VI | CC0-1.0 | 301 MB | Baritone/6-string bass tone |
| **Project 16 Rickenbacker 4001** | Rickenbacker 4001 (fingered, muted, slap) | **CC-BY-NC-SA-3.0: non-commercial, so not usable if the app is monetised** | 508 MB | |
| **freesound.org** | Scattered CC0 single notes (e.g. "B String B0", a 139-sound "Charvel Electric Bass" pack) | Per sound (filter CC0) | small | No complete chromatic set confirmed |
| _Upright (context)_ **Karoryfer Meatbass** | 1958 double bass, 434 samples | **Sources disagree**: CC0 (SFZ catalogue), GPL-3 (KVR), CC-BY-3.0 (Bedroom Producers Blog, about Karoryfer in general) | — | Check the bundled licence |
| _Upright (context)_ **Philharmonia samples** | Orchestral instruments incl. strings | Free incl. commercial use, but must not be "made available 'as is' (i.e. as samples or as a sampler instrument)" | — | Shipping raw files to every browser arguably makes them available as is: **legal risk, avoid** |
| _Upright (context)_ **VSCO 2 Community Edition** | Chamber orchestra | CC0 | 3 GB, ~3,000 samples | Whether it contains double bass pizzicato is **unverified** |

**File size for phones (our estimate, not measured).** The libraries above are 138–961 MB as 24-bit WAV, far too big. A web set needs only: one sample every 3 semitones from B0 to about D♯4 (≈14 notes), one or two velocity layers, ~2 s each, mono, trimmed, encoded as MP3/AAC at ~96 kbps ≈ 24 KB/s → **≈50 KB per note, ≈0.7 MB per layer, ≈1.4 MB for two layers.** Pitch-shift neighbours with `playbackRate` (±1 semitone is usually inaudible on bass). CC0 means re-encoding and trimming is allowed without attribution.

**Drums** for the groove player can be synthesised (kick = pitched sine sweep, snare = noise + tone, hats = filtered noise) for zero download, with an optional small sampled kit later. (Recommendation; drum sample licensing not researched here.)

### F2. Input

**Tapping (primary, always available).** Every drill and lesson step must be completable by tapping the neck or a big "tap" pad. This is round one's rule and section C reconfirms it: mic detection is worse on bass than guitar.

**Web MIDI.** caniuse (checked 2026-11-14): supported in Chrome (desktop and Android 157), Edge and Firefox desktop (108+); **not supported in Safari on macOS or iOS in any version**, nor Firefox for Android. A third-party Safari extension adds it on macOS 18.4+ (userland, not WebKit). MDN: requires HTTPS (secure context), a user permission prompt, and may be blocked by a `midi` permissions policy. Global support ≈81%. **So MIDI cannot be relied on for iPhone users, who are likely a large share.** MIDI bass controllers and bass-to-MIDI pickups exist but are niche (**unverified**: we did not research product support for bass). Treat MIDI as an optional desktop/Android extra.

**Microphone pitch detection for bass.**
- **Why bass is harder.** Autocorrelation methods (YIN and MPM/McLeod are both autocorrelation-based) need at least two periods of the wave (Wikipedia, Pitch detection algorithm). Fonseca & Tavares (2019, SBCM) state that this puts the delay "close to 50 ms for the lowest notes (41.2 Hz)" on a 4-string; for a 5-string low B (30.9 Hz) two periods are ≈65 ms. Their bass-specific method needed 1.1 periods (≈27 ms) and had a **15% error rate, half of YIN's** at the same short window (528 notes, 3 basses); YIN does better when given more than 2 periods.
- **Octave errors.** Detectors can lock onto a louder overtone instead of the fundamental (Wikipedia). An Adobe forum user reports a spectral display showing bass notes an octave high (forum post, not research). One developer reports McLeod's method is inaccurate at low pitches because of a cutoff, which YIN does not have (sevagh/pitch-detection README).
- **Real-world reports.** Yousician has a support article on "Bass sound recognition issues" (blocked to us); a Yousician user says detection fails above fret 5 on the low E; Rocksmith players report missed F/F♯ on bass and poor detection on down-tuned strings.
- **Design so it never blocks progress:**
  1. Use YIN (or a YIN-FFT) with a ≥100 ms window for pitch, since lessons don't need instant response; accept a note if the **pitch class** matches (**any octave**), which removes octave errors from grading.
  2. Ask for mic audio with `echoCancellation`, `noiseSuppression` and `autoGainControl` set to `false` (MDN constraints; these are designed for speech).
  3. A visible **"I played it" / "mark correct"** button on every mic check; mic results feed stats but never lock a lesson.
  4. Recommend headphones or a USB interface for amp-less basses; phone microphones and speakers both lose the lowest frequencies (**unverified**, we found no measurement).

### F3. Timing: measuring rhythm accuracy in the browser

- **What the API offers.** `AudioContext.outputLatency` (estimate of the delay from the audio graph to the speaker) is supported in Chrome 102+, Firefox 70+, **Safari 18.4+ (macOS and iOS)**, "Baseline 2025"; `baseLatency` and `getOutputTimestamp()` in Chrome 57–58+, Firefox 70+, Safari 14.1+ (MDN browser-compat-data). MDN warns the value "varies by platform and available hardware", so it is an estimate.
- **Bluetooth headphones add a lot.** SoundGuys measured Android Bluetooth latency with Google's WALT tester (100 tests per phone per codec): averages **SBC 308 ms, aptX 316 ms, LDAC 324 ms, AAC 369 ms**; per phone from 244 ms (Pixel 3 XL) to 484 ms (Huawei Mate 20 Pro). Google's own figures for top phones are "just under 40 ms" (quoted by SoundGuys, 2021 update). That is 10–20× bigger than the ±20–30 ms "tight" window from section B, and `outputLatency` may not include it all (**unverified**).
- **Input latency** (mic to `AnalyserNode`/AudioWorklet) is not reported by any API we checked.
- **Design:**
  1. **Calibrate once per device/headphone:** play 8 clicks, the user taps (or plucks) along; store the median offset; repeat if the output device changes. Use `outputLatency` only as a starting guess.
  2. **Grade taps against the scheduled audio time** (`AudioContext.currentTime` / `getOutputTimestamp()`), not `Date.now()`.
  3. **Show timing, don't gate on it.** Display early/late in ms with a forgiving band for beginners (±60 ms), tightening to ±30 ms; never fail a lesson on timing.
  4. **Warn when Bluetooth is likely** (big calibration offset) and suggest wired headphones or the phone speaker for timing drills.

## Sources

### A. Curriculum
- Hal Leonard Bass Method Book 1 (2nd ed.): https://www.halleonard.com/product/695067/hal-leonard-bass-method-book-1
- Hal Leonard Electric Bass Method, Complete Edition: https://www.halleonard.com/product/695073/hal-leonard-electric-bass-method-complete-edition
- Hal Leonard Bass Method Complete Edition (PLAYBACK+ page): https://www.halleonard.com/product/695074/hal-leonard-bass-method-book-3
- Riverton Music, Hal Leonard Bass Method Book 2 topics: https://www.rivertonmusic.com/p-10888-hal-leonard-bass-method-book-2-2nd-edition.aspx
- Berklee Online, Bass Performance 101: https://online.berklee.edu/courses/bass-performance-101
- BassBuzz, Beginner to Badass lessons overview: https://www.bassbuzz.com/beginner-to-badass/lessons-overview
- BassBuzz course page: https://www.bassbuzz.com/courses/beginner-to-badass
- TalkingBass home and course list: https://www.talkingbass.net/
- TalkingBass, Beginner Bass Guitar: https://members.talkingbass.net/product/beginner-bass-guitar/
- TalkingBass, Bassic Fundamentals: https://members.talkingbass.net/product/bassic-fundamentals-course/
- TalkingBass lesson map: https://www.talkingbass.net/lessonmap/
- Scott's Bass Lessons, Players Path: https://playerspath.scottsbasslessons.com
- Bass Musician Magazine, review of *Building Walking Bass Lines*: https://bassmusicianmagazine.com/2020/02/review-hal-leonards-building-walking-bass-lines-by-ed-friedland/amp/
- Bass Book Review blog, *Building Walking Bass Lines*: https://bassbookreview.blogspot.com/2011/07/building-walking-bass-lines-by-ed.html
- Guitar Girl Magazine, Carol Kaye *How to Play the Electric Bass*: https://guitargirlmag.com/?p=99499
- The Bass-ic Blog, Simandl method review: https://thebass-icblog.blogspot.com/2020/05/bass-method-books-part-1-simandl.html
- Engadget, Fender Play adds bass (2018): https://www.engadget.com/2018-09-06-fender-play-music-instruction-bass-lessons.html

### B. Learning and groove research
- Hove, Marie, Bruce & Trainor 2014, PNAS (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC4104866
- Wojtczak, Mehta & Oxenham 2017, PNAS (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC5293018
- Kilchenmann & Senn 2015, Frontiers in Psychology: https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2015.01232/full
- Senn, Kilchenmann, von Georgi & Bullerjahn 2016, Frontiers in Psychology: https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2016.01487/full
- Hofmann, Wesolowski & Goebl 2017, J. New Music Research (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC5706983
- Engel et al. 2022, Frontiers in Neuroscience (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC8915847
- van der Steen & Keller 2013, ADAM model (Frontiers): https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2013.00253/full
- University of Oslo RITMO, on Câmara et al. 2020: https://uio.no/ritmo/english/news-and-events/news/2020/a-fraction-of-a-second-is-all-you-need
- AIP SciLight, on Câmara et al. 2026 JND study: https://www.aip.org/scilights/can-you-feel-the-groove
- ScienceDaily, Walker et al. 2002 sleep and motor skill: https://www.sciencedaily.com/releases/2002/07/020702065823.htm
- Round one (general learning evidence): docs/research-findings.md

### C. Apps and reviews
- Trustpilot, Scott's Bass Lessons: https://www.trustpilot.com/review/scottsbasslessons.com
- Trustpilot, Yousician: https://www.trustpilot.com/review/yousician.com
- App Store (UK), Yousician: https://apps.apple.com/gb/app/id959883039
- App Store, SBL Groove Trainer: https://apps.apple.com/app/id1571452765
- App Store, Fretonomy: https://apps.apple.com/us/app/fretonomy-learn-fretboard/id1279576225
- App Store, Bass Fretboard Addict Lite: https://apps.apple.com/om/app/id420135078
- BassBuzz forum, Beginner to Badass reviews (page 6): https://forum.bassbuzz.com/t/beginner-to-badass-reviews/4459?page=6
- BassBuzz forum, what users want next: https://forum.bassbuzz.com/t/what-would-you-like-to-see-in-the-next-course
- BassBuzz forum, Fender Play review: https://forum.bassbuzz.com/t/fender-play-review/50688
- BassBuzz forum, TalkingBass and SBL: https://forum.bassbuzz.com/t/talkingbass-and-sbl/35381?page=3
- BassBuzz forum, B2B vs TalkingBass/SBL: https://forum.bassbuzz.com/t/have-you-done-b2b-and-talkingbass-scotts/24685?page=2
- Expert Reviews, Fender Play: https://www.expertreviews.co.uk/archived/fender-play-review-guitar-bass-ukulele-lessons
- NME, Rocksmith+ review: https://www.nme.com/reviews/rocksmith-review-bloated-but-undeniably-useful-3304271
- Customsforge, Rocksmith bass F/F♯ detection: https://customsforge.com/topic/23106-game-has-trouble-registering-f-and-f-on-bass

### F. Technology
- caniuse, Web MIDI: https://caniuse.com/midi
- MDN, Web MIDI API: https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API
- MDN, AudioContext.outputLatency: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/outputLatency
- MDN browser-compat-data, AudioContext: https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/AudioContext.json
- MDN, echoCancellation constraint: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/echoCancellation
- SoundGuys, Android Bluetooth latency: https://soundguys.com/android-bluetooth-latency-22732
- Fonseca & Tavares 2019, low-latency f0 for electric bass (SBCM): https://sol.sbc.org.br/index.php/sbcm/article/download/10433/10300
- Wikipedia, Pitch detection algorithm: https://en.wikipedia.org/wiki/Pitch_detection_algorithm
- sevagh/pitch-detection README: https://github.com/sevagh/pitch-detection/blob/cc2e6678b80839ff2382baec007a28cb6b0d6b2d/README.md
- Julius O. Smith, Extended Karplus-Strong: https://ccrma.stanford.edu/~jos/pasp/Extended_Karplus_Strong_Algorithm.html
- SFZ Instruments, basses catalogue (licences, sizes): https://sfzinstruments.github.io/basses
- Bedroom Producers Blog, Growlybass: https://bedroomproducersblog.com/2014/08/25/growlybass-free-samples/
- Karoryfer, Swagbass: https://shop.karoryfer.com/pages/free-swagbass
- freesound, CC0 electric bass search: https://freesound.org/search/?q=electric+bass+note&f=license%3A%22Creative+Commons+0%22
- Philharmonia sound samples (licence): https://philharmonia.co.uk/audio-sound-samples/
- Versilian VSCO 2 Community Edition: https://versilian-studios.com/vsco-community/

### Tried but couldn't access (not used as evidence)
- Berklee Online "Bass for Beginners" (404; no such course page)
- SBL help article "Do you have courses for Beginners?" (404); SBL beginner course list is therefore unverified
- TalkBass.com threads (403), Reddit (blocked, as in round one)
- Yousician support article "Bass sound recognition issues" (403)
- Hove et al. 2014 on pnas.org (403; read via PMC instead)
- Câmara et al. 2020, JASA full text (publisher redirect returned an unrelated abstract; University of Oslo summary used instead)
- Câmara et al. 2026 JND study on EBSCO (403)
- Repp & Su 2013 sensorimotor synchronisation review (Springer login)
- Butterfield 2010, Frühauf et al. 2013, Davies et al. 2013 originals (cited only via Kilchenmann & Senn 2015)
- Matsushita & Nomura, bass/drum asynchrony and groove (not found)
- Guitar World Fender Play review and MusicRadar Fender Play bass article (page bodies truncated)
- RTINGS latency article (body not returned)
- Shopper Approved BassBuzz reviews (did not load)
- technosound.gr *Building Walking Bass Lines* contents (bot check)
- YIN paper PDF at audition.ens.fr (certificate error); Archives of Acoustics bass f0 page (DNS failure)
- sciencegate abstract for Fonseca & Tavares (403; full PDF read instead)
