# Fretboard Lab: Research Part 3 — App-wide Features

_Researched 2026-11-14 (prices and limits read that day). Every source under Sources was opened unless marked otherwise. Claims that could not be checked are marked **unverified**. Builds on [research-findings.md](research-findings.md) (round one)._

## Summary

1. **Ear training:** make the core skill **scale degrees in a key** (drone/cadence first, then "tap the note you heard" on the neck/keys/pad), with intervals-in-context, chord quality, progressions/dictation and (for drums) rhythm tap-back as supporting tracks. Cognitive research (Karpinski 2021) and the 4.9-rated Functional Ear Trainer back the key-context approach; interval skill still predicts dictation (28.9% of variance, Nichols & Springer 2022). Expect major/minor to be hard — ~70% of listeners can't classify fast major/minor tone-scrambles (Mednicoff et al. 2018). No competitor answers on an instrument; that is the gap.
2. **AI custom lessons:** have Claude write a compact **lesson spec** (catalog ids, degrees, prompts) via **structured outputs**, and let `kit.js`/`theory.js` compute every note and fret; reject anything that fails validation. That is the Khanmigo lesson (it added a calculator because LLMs miscompute). Estimated cost per lesson: ~$0.003 (Haiku 5.5), ~$0.04 (Sonnet 5.5), ~$0.08 (Opus 5.5). Guard with sign-in, per-user quotas (Upstash or a Postgres row), a Haiku on-topic screen, and an Anthropic Console spend cap. Vercel Hobby (300 s max, streaming OK) is technically enough, but its terms allow only "personal or non-commercial use" — move to Pro ($20/mo) once you charge.
3. **Accounts & sync:** **Supabase** (50K MAU free; Postgres + RLS). Free projects **pause after a week of inactivity** and have no backups → use Pro ($25/mo) before real users depend on it. Sync the existing localStorage blob as one JSONB row and reuse the app's merge-import rules (union logs/days, max scores, latest review state). Keep signed-out use fully local; neutral age screen at sign-up; delete-account button; plain privacy policy. COPPA's amended rule is fully in force (22 Apr 2026).
4. **Monetization:** guided apps charge $120–$180/yr; theory/ear tools $5–$15 once; Musora gives a 90-day and BassBuzz a 180-day guarantee. Trustpilot reviews show the anger comes from trials converting to annual charges and hard cancellation. FTC click-to-cancel was **vacated** (July 2025; new rulemaking began March 2026), but ROSCA, ~30 state laws and the EU withdrawal button (from 19 June 2026) still apply. Recommended: generous free tier, **one Plus plan (annual + lifetime)**, AI credit top-ups, no card-up-front trials, via **Stripe Checkout + Billing with Managed Payments (merchant of record, +3.5%)**. On Apple link-outs: the Ninth Circuit (Dec 2025) let Apple charge "some commission"; the Supreme Court took the case (June 2026) — still open; a web PWA avoids it.
5. **Design:** palette contrast is excellent (all pastels ≥9.7:1 on the background, dark text on pastels ≥9.3:1); fix red text (#D91E25 = 3.79:1) and grey text. **The 3rd (blue) and 5th (lavender) become nearly identical for protanopes/deuteranopes** (ΔE00 5.2 / 2.9) → always show labels or shapes in dots, and darken the 5th (e.g. #9B7FD1). Skip tutorial carousels (NN/g); progressive disclosure, max 2 levels. Make the fretboard an ARIA grid with roving tabindex. **iOS Safari deletes localStorage after 7 days without a visit unless the app is on the Home Screen** → PWA install hint, `storage.persist()`, sync, export.
6. **Gamification:** small real learning effects (g = .49 cognitive, Sailer & Homner 2020); leaderboards/badges can backfire (Hanus & Fox 2015); broken streaks reduce engagement, softened by "repair" (Silverman & Barasch 2023). Keep a forgiving streak with freezes/repair, mastery badges, no global leaderboard, no guilt notifications.
7. **Growth:** comparable fretboard tools got 195–258 points on Show HN with dozens of requests Fretboard Lab already meets (sound, spaced review, ear mode). Sequence: polish mobile → small beta → Show HN → careful Reddit posts → SEO scale pages generated from the theory engine → short videos → Product Hunt.

## 1. Ear training tab

### 1.1 What the evidence says

| Finding | Evidence | Strength | Design consequence |
|---|---|---|---|
| **Hearing in a key (scale degrees) is how tonal listening works** | Karpinski (Music Theory Online 27.2, 2021): listeners' "first and most fundamental process … is to infer the tonic," and "our perception of scale degrees *depends on* our perception of the tonic"; systems that "label the tonic first" (do-based minor or scale-degree numbers) "most closely model this mental process." Arthur (Music Perception 35(3), 2018): scale degrees carry fairly consistent "qualia" for musicians and non-musicians, but the local chord changes them (abstract and secondary summaries only). | Moderate (cognitive theory + perception studies; not training trials) | Make **scale degree in a key** the core skill: always set the key first (drone or cadence), then ask for the degree. Use the app's existing degree numbers (1, b3, 5…) rather than solfège syllables, and do-based (1 = tonic) minor. |
| **Scale-degree strategy beats interval-only strategy for tonal dictation** | Dowling (1986), via a review summarized in search results: students who thought in scale degrees "succeeded far better" than interval-recognizers, on 4 melodies; the best listeners switch strategies. **Secondary only — unverified.** | Weak (old, small) | Teach intervals *as* scale degrees from the tonic (already the plan in Level 3). |
| **…but interval identification still predicts dictation** | Nichols & Springer (J. Research in Music Education 70(1), 2022; N = 35 college musicians): interval identification contributed **28.9% of the variance** in melodic dictation scores after controlling for musical experience. | Moderate (correlational) | Keep an interval trainer, but in context and as a supporting drill, not the main path. |
| **Interval learning is hard and practice alone may not be enough** | Little, Cheng & Wright (Attention, Perception & Psychophysics, 2019; N = 28): "a regimen of continuous practice yielded no learning," while practice plus passive exposure to the same stimuli raised accuracy from 68.9% to 88.2% (p = .002); "Musical-interval learning is so difficult, in part, because of the abstraction required." Non-musicians' pitch-ratio thresholds can exceed a semitone. | Moderate (small lab study, one interval) | Mix active questions with **passive listening** (the "Hear" step, drone play-along, hearing the answer replayed in context after each question). Short, frequent sessions. |
| **Many people can't hear major vs minor at first** | Mednicoff, Mejia, Rashid & Chubb (JASA 144(4), 2018), replicating Chubb et al. 2013: "most listeners (≈ 70%) perform near chance in classifying rapid tone-scrambles"; "musical training is neither necessary nor sufficient." This is for fast tone-scrambles, not ordinary chords. | Moderate (replicated, but artificial stimulus) | Expect chord-quality ear training to be the hardest beginner task: start with slow arpeggios and block chords side by side, give the 3rd its own color (already blue), allow "play it again," and never gate progress on it. |
| **Absolute pitch is partly trainable in adult musicians** | Wong, Cheung, Ngan & Wong (Psychonomic Bulletin & Review, 2025), per Psychonomic Society summary: 25 hours over 8 weeks, musicians learned on average **7 pitches at ~90% accuracy in ~2 s**, with transfer to an untrained instrument. | Moderate (small, trained musicians) | Optional advanced "note names by ear" drill only; not core. |
| **Rhythm dictation for drums** | No training study found in this research. EarMaster, Perfect Ear and teoria offer rhythm dictation/tap-back; this is practice-based design, not evidence. | Weak | Build tap-back first (hear a bar → tap it), then pick-the-notation, then write it on a grid. |

**Overall:** the strongest case is for **functional (key-context) ear training tied to the instrument**, with intervals and chord qualities as supporting drills. This matches round-one's "hear it, find it, play it" recommendation. No controlled study compares training *methods* head-to-head for app learners; describe the approach as consistent with the research, not proven by it.

### 1.2 What the best ear-training apps do (App Store pages read 2026-11-14)

| App | Approach | Price | Rating | What users say |
|---|---|---|---|---|
| **Functional Ear Trainer** (Alain Benbassat / miles.be) | Teaches "to distinguish between tones in the context of a particular musical key"; cadence sets the key; skill "carries over to other keys" | Free; "Plus" $19.99 | **4.9 (3.9K)** | "doing 10-minutes a day has done wonders for my pitch"; "This app limits its scope but delivers results" |
| **EarMaster** | Broad curriculum: intervals, chords, inversions, scales, progressions, melodies, rhythm, sight-singing; rhythm dictation and tap-back with instant feedback | Free core; bundles $7.99–$14.99; modules $0.99–$3.99 | 4.6 (430) | "It's really worth the money"; exercises "well thought out" |
| **Complete Ear Trainer** (Binary Guilt) | 150+ progressive drills, 4 levels / 28 chapters; Easy mode (50+ drills); Arcade mode | Free; Full $6.99 one-time | 4.7 (203) | "This app is changing my world!"; but "the difficulty curve is bizarrely steep" even in Easy mode |
| **Perfect Ear** | Everything: intervals, chords, scales, rhythm (read/write/imitate), melodic dictation, sight reading, absolute pitch, a fretboard trainer, custom drills, streaks | Free; packs $0.99–$4.99; Premium $14.99 | 4.7 (1.9K) | "a bit glitchy and it need[s] some depth"; custom range limits annoy teachers |
| **ToneDear** (web) | Intervals, chords, scales, progressions, perfect pitch, **Scale Degrees (functional)**, **Intervals in Context (functional)**, melodic dictation by major-scale degree | Price model not stated | — | — |
| **musictheory.net / Tenuto** | Keyboard, Note, Interval, Scale, Chord ear training; Exercise Customizer; no scale-degree exercise on the site | Web free; Tenuto app $4.99 one-time | 4.7 (669) | Round one: very customizable but overwhelming for beginners |
| **teoria.com** | Rhythmic dictation using patterns, four-voice dictation, harmonic progressions | Donation-supported, no ads | — | — |

**Patterns worth copying:** set the key with a cadence or drone (FET, ToneDear); progressive chapters with an easy mode (Complete Ear Trainer); tap-back rhythm (EarMaster, Perfect Ear); one-time pricing. **Pitfalls users name:** steep difficulty jumps, glitchy rhythm input, overwhelming option screens, and drills that don't connect to an instrument.

**Fretboard Lab's gap to fill:** none of these apps answer on a **fretboard / bass neck / keyboard / drum pad**. Perfect Ear has a fretboard *trainer* but not ear-to-fretboard questions. The app's "answer by tapping the instrument" design is a genuine differentiator.

### 1.3 Recommended design

**One tab, four tracks, answers on the instrument:**

| Order | Track | Guitar / bass | Piano | Drums |
|---|---|---|---|---|
| 1 | **Degrees in a key** (core) | Drone or I–IV–V–I cadence → note plays → tap it on the neck (any octave accepted) → app names the degree and replays it resolving to 1. Start with 1-3-5, then 1–7 major, then minor, then chromatic. | Same, answering on keys | — |
| 2 | **Intervals in context** | Root sounds, second note sounds → tap it; label as a degree ("that's the b3 — a minor 3rd"). Confusable pairs together (m3/M3, P4/P5, m7/M7), as already in the interval trainer and `confusions`. | Same | — |
| 3 | **Chord quality & function** | Major/minor first (slow arpeggio, then block); then dim, 7ths; then "which degree is this chord on?" (I, IV, V, vi) | Same | — |
| 4 | **Progressions & melodies** | Pick the progression from 3 choices (I–V–vi–IV, ii–V–I, 12-bar); then 3–5-note melodic dictation entered on the neck | Same | **Rhythm**: tap-back a 1-bar pattern → choose the matching notation → write it on a 16-step grid; then fills and time feels |

**Rules (from the evidence above and round one):**
- Always establish the key; never ask an isolated interval without context in the core track.
- Accept any octave and any string; the skill is the degree, not the fret.
- After every answer, replay the correct note **resolving to the tonic** (passive exposure + meaning).
- Every item becomes a review item (`ear-degree:b3@G` etc.) in the existing Leitner review; interleave once each track's basics are learned.
- Adaptive difficulty: add a new degree only at ≥80% over the last 20; drop back on repeated misses (answers the "bizarrely steep" complaint).
- 5–10 minute sessions with a visible "done for today."
- Microphone answers optional, never required (round-one finding).
- For drums, the answer surface is a pad grid (kick/snare/hat), not text.

## 2. AI custom lessons

**Goal:** the learner types a topic ("Dorian over a ii–V", "why does the B string shift shapes?") and gets a lesson in the app's own six-step format (Hear, Learn, See, Try, Play, Check), generated by Claude through a Vercel serverless function.

### 2.1 The core design decision: let the model choose, let the theory engine spell

The biggest risk is wrong theory (a wrong note in a scale, a mislabelled interval, a dot on the wrong fret). Evidence that this is a real risk in AI tutoring:

- Khan Academy says plainly that generative AI "wasn't designed for math" and can give wrong answers. Its fix was to stop letting the model compute: it built a calculator tool so Khanmigo can "solve numerical problems instead of relying on AI's predictive capabilities," and found Khanmigo "more accurate when it can draw on human-generated exercises, steps, hints, and solutions" (Khan Academy blog, Feb 2025). It published no error rates.
- Common Sense Media rates Khanmigo "low risk" overall but warns chatbots "perform best with fiction, not facts," and that inside a trusted platform users are "less likely … to realize they should be checking" (risk assessment, Aug 2024).
- Duolingo says it "constantly review[s] AI-generated explanations" for factual correctness (via StoryLearning review). Its 2025 "AI-first" push and 148 AI-built courses (TechCrunch, 30 Apr 2025) triggered a public backlash; users posted about dropping 530- and 900-day streaks and subscriptions (The 74, 3 Jun 2025). The article gives no concrete examples of wrong content, so the backlash was as much about trust and jobs as accuracy.

Fretboard Lab already has the right tool: `js/lessons/kit.js` computes every label and answer from `js/theory.js`, and "a dot that isn't in its key throws when the file loads." The same rule should apply to AI lessons:

1. **The model never writes note names, fret numbers or degree labels as free text that reaches the screen.** It writes a compact *lesson spec*: key, scale/chord id from the catalog, which degrees to show, which strings/fret window, prompts and explanations in plain words, and quiz questions that reference degrees ("tap the b3").
2. **The server (or the browser) expands the spec with `kit.js` / `theory.js`** into the real lesson object: `inKey(key, kind, id).spots('b3')`, `.dot(string, fret)`, etc. Anything that doesn't resolve (unknown scale id, degree not in the scale, fret off the neck) is a validation error.
3. **Text checks.** Scan the explanation text for note names and interval names and check each against the spelled scale (e.g., if the text says "the 3rd of G major is B," compute it). Reject or regenerate on mismatch. This is cheap string work against `spell()`.
4. **On failure, retry once with the validator's error message**, then fall back to "We couldn't build that lesson; here is the closest built-in lesson" (link into the Learn path). Never show an unvalidated lesson.
5. **Label it.** Show "AI-generated lesson, checked by the theory engine" and a "Report a problem" button that saves the spec for review.

This puts the model where it is strong (choosing an order, writing friendly explanations, picking examples) and keeps it out of what it gets wrong (computing pitches), which is exactly the Khanmigo lesson.

### 2.2 Getting reliable JSON from the Claude API (official docs, read 2026-11-14)

| Feature | What the docs say | Use in Fretboard Lab |
|---|---|---|
| **Structured outputs** (`output_config.format` with `type: "json_schema"`) | Constrained decoding: "Always valid: No JSON parsing errors," "Guaranteed field types and required fields." Available on all current models. Exceptions where output may not match: `stop_reason: "refusal"` and `"max_tokens"` (truncated). Enum *capitalization* is not guaranteed — compare case-insensitively. | Main mechanism. Schema = the lesson spec. |
| **Schema limits** | Not supported: recursive schemas, `minimum`/`maximum`, `minLength`/`maxLength`, array constraints beyond `minItems` 0/1; `additionalProperties` must be `false`. Explicit limits: 20 strict tools, **24 optional parameters total**, 16 union-type parameters. Required properties are emitted before optional ones. First request has extra latency while the grammar compiles; grammars are cached 24 h. | Keep the spec flat; make most fields required; enforce ranges (fret 0–15, string 1–6) in your own validator. |
| **Strict tool use** (`strict: true`) | Same grammar pipeline, for tool inputs. On Opus 5.5 / Sonnet 5.5, forced `tool_choice` (`any`/`tool`) returns a 400; the tool-use docs list no "any/tool" token count for them. | Not needed: structured outputs is the simpler path for "just give me JSON." |
| **Incompatibilities** | Citations + `output_config.format` = 400. Prefill is incompatible (and prefill is removed on current models anyway). | Don't use either. |
| **Streaming** | SSE events (`message_start`, `content_block_delta`, `message_stop`, `ping`, and `error` events such as `overloaded_error` mid-stream). Structured outputs "stream like normal responses"; you must accumulate before final parse. | Stream to show progress ("Writing your lesson… 40%"); parse and validate at the end. |
| **Prompt caching** | Min cacheable prefix 512 tokens on Opus 5.5 / Sonnet 5.5 / Haiku 5.5. 5-minute TTL default (1 h optional). Writes 1.25× base input (5 m) or 2× (1 h); reads 0.1× base, but **0.05× on Opus 5.5 and Sonnet 5.5**. Up to 4 breakpoints; a top-level `cache_control` gives automatic caching. Cache reads don't count toward input-token rate limits. | Put the long, fixed part (system prompt, catalog of scale/chord ids, 2 example specs) first and cache it; the user's topic goes last. |
| **Refusals** | `stop_reason: "refusal"` returns HTTP 200, billed, output may not match the schema. | Treat as "couldn't build lesson." |

**Abuse screening pattern from Anthropic's own guide** ("Mitigate jailbreaks"): pre-screen user input with a lightweight model (Claude Haiku 5.5) using structured outputs to return a boolean, "treat a response with `stop_reason: \"refusal\"` as a harmful verdict," and throttle/ban repeat offenders. Anthropic has no separate moderation endpoint; the content-moderation guide recommends Haiku 5.5 for cost. For a music app a cheaper first gate is an **on-topic check**: the same Haiku call returns `{on_topic: boolean}` ("is this a music-theory / instrument topic?"). Off-topic requests are refused before the expensive call.

### 2.3 Models and pricing (Anthropic pricing page, read 2026-11-14)

Current lineup per the models overview: Claude Fable 5.2, Claude Opus 5.5, Claude Sonnet 5.5, Claude Haiku 5.5 (Mythos 5.2 is limited-availability). All 1M context, 128K max output.

| Model | Input $/MTok | 5-min cache write | Cache read | Output $/MTok | Notes |
|---|---|---|---|---|---|
| Claude Fable 5.2 | $8 | $10 | $0.20 | $40 | Most capable; overkill here |
| Claude Opus 5.5 | $4 | $5 | $0.20 | $20 | Docs' default "for most workloads"; thinking always on, default effort `medium` |
| Claude Sonnet 5.5 | $2 | $2.50 | $0.10 | $10 | "Best combination of speed and intelligence" |
| Claude Haiku 5.5 (prompts ≤100K) | $0.10 | $0.125 | $0.01 | $0.50 | "Fastest"; $0.50/$2.50 above 100K-token prompts |
| Batch API | 50% off input and output | | | | Not useful for live requests |

Also: the tool-use system prompt adds 286 tokens on these models; `inference_geo: "us"` adds a 1.1× multiplier.

### 2.4 Per-lesson cost estimate

**Measured baseline:** the seven Level 3 lessons serialize to 3,333–4,689 characters of JSON (average ≈3,800). The docs say 1M tokens ≈ 2.5M characters on the current tokenizer, so a full lesson object is ≈1,500 tokens. A compact spec that the theory engine expands should be smaller (≈800–1,200 tokens; **estimate**).

**Assumptions (estimates, not measurements):** cached prefix (system prompt + catalog + 2 examples) ≈6,000 tokens; user topic ≈50 tokens; output ≈1,500 tokens of spec + 1,000–2,500 tokens of thinking (thinking is billed as output); 20% of lessons need one retry; one Haiku screening call (~400 in / 20 out).

| Model for generation | Cost per lesson (cache hit) | Cost per lesson (cache miss) | 1,000 lessons/month |
|---|---|---|---|
| Haiku 5.5 | ≈$0.002–0.003 | ≈$0.003 | ≈$3 |
| Sonnet 5.5 | ≈$0.03–0.05 | ≈$0.04–0.06 | ≈$35–60 |
| Opus 5.5 | ≈$0.06–0.10 | ≈$0.08–0.12 | ≈$70–120 |

(Example arithmetic, Sonnet 5.5 cache hit: 6,000 × $0.10/M + 50 × $2/M + 3,500 output × $10/M ≈ $0.0006 + $0.0001 + $0.035 ≈ $0.036; × 1.2 for retries ≈ $0.043.) Haiku screening adds ≈$0.00005 per request. **Measure the real numbers with `usage` fields on 20–50 test topics before setting quotas.** Recommendation: start on Sonnet 5.5 at low/medium effort, run the same test topics on Haiku 5.5, and keep whichever passes the validator most often; validator-pass rate is a free, objective eval.

**Spend cap:** Anthropic accounts have a monthly spend cap by tier (Start $500, Build $1,000, Scale $200,000), and you can set your own lower limit in the Console; at your own limit requests return HTTP 400 until reset. Set it to e.g. $25/month at launch — this is the hard backstop if every other limit fails. Rate limits at the Start tier are 4,000 RPM and 2M input / 400K output tokens per minute for Opus 5.5, Sonnet 5.5 and Haiku 5.5, far beyond what a small app needs; new organizations may start in a lower "Evaluation tier."

### 2.5 Vercel: streaming, timeouts and plan limits (Vercel docs, read 2026-11-14)

| | Hobby (free) | Pro ($20/month + usage) |
|---|---|---|
| Function max duration (Fluid compute, Node.js) | 300 s default and maximum | 300 s default, up to 800 s; 1,800 s beta |
| Memory | 2 GB / 1 vCPU | up to 4 GB / 2 vCPU |
| Included usage | 1M invocations, 4 active-CPU hours, 360 GB-hrs memory, 100 GB transfer | $20 credit, then $0.60/1M invocations, $0.128/CPU-hr, $0.0106/GB-hr |
| Over the limit | Capped; "cannot purchase additional usage"; may wait 30 days | Pay as you go, spend management available |
| Commercial use | **Terms §4: "You shall only use the Services under a Hobby plan for your personal or non-commercial use."** ("Commercial" is not defined.) | Allowed |

- Max duration "includes time spent … sending the response, including streamed responses." A lesson generation should finish in well under 60 s, so 300 s is ample even on Hobby.
- Active CPU billing excludes time "waiting for I/O (e.g. calling AI models …)," so a function that mostly waits on Claude is cheap.
- Request/response body limit is 4.5 MB, but "the response body limit doesn't apply to streamed responses." Streaming is on by default for Node.js functions; plain `api/*.js` functions (no Next.js) can return a streamed `Response`.
- Edge runtime functions must start responding within 25 s and can stream up to 300 s.
- **Implication:** the moment the app takes money (subscriptions or credit packs), it must move to Vercel Pro ($20/month) to comply with the Hobby terms.

### 2.6 Abuse limits

| Layer | What | Tool / cost |
|---|---|---|
| 1. Auth | AI lessons require a signed-in account (no anonymous calls), so limits are per user, not per IP | Supabase Auth (section 3) |
| 2. Input cap | Topic ≤200 characters; reject URLs/code blocks; strip control characters | Your function |
| 3. Rate limit | e.g. 3 requests/minute and 5 lessons/day free, 50/month paid, enforced per user id (and per IP as a backstop) | `@upstash/ratelimit` (sliding window or token bucket) on Upstash Redis. Free tier: 500K commands/month, 250 MB, 1 database; then $0.20 per 100K commands (pricing page, read 2026-11-14). Vercel KV no longer exists — Vercel moved KV stores to Upstash in Dec 2024 and now points to Marketplace Redis. Alternatively a quota row in Postgres (Supabase) — fine at this scale. |
| 4. Screen | Haiku 5.5 on-topic + harmlessness check with structured boolean output | ≈$0.00005/request |
| 5. Output cap | `max_tokens` around 6,000–8,000 (spec + thinking); reject longer | — |
| 6. Spend cap | Anthropic Console monthly limit; Vercel Pro spend management | — |
| 7. Repeat offenders | Count refusals per user; lock AI lessons after N | — |
| 8. Cache popular topics | Store validated specs keyed by a normalized topic; serve "Dorian mode" from cache for everyone | Saves most of the cost for common topics |

Upstash notes: its ratelimit library is HTTP-based for serverless, has an ephemeral in-memory cache that blocks repeat offenders without a Redis call, and if Redis doesn't answer in time "the request is allowed by default" — so keep the Anthropic spend cap as the true backstop.

### 2.7 Prompt design notes

- **System prompt:** who the learner is (instrument, current level from saved progress), the six-step format, the rule "never compute pitches; reference degrees and catalog ids," the plain-language style rules already in `docs/research-findings.md` §4 (one idea per card, 1–2 sentences, try before reveal).
- **Give the catalog as data:** list the valid scale and chord ids from `SCALE_GROUPS`/`CHORD_GROUPS` and the degree names they contain, so the model can only pick real ones (an `enum` in the schema works for ids).
- **Two worked examples** (an existing lesson converted to spec form) inside the cached prefix.
- **Instrument field:** the same spec should later target bass (4 strings), piano (keys) and drums (rhythm grid); make `instrument` a required enum from day one.
- **Keep reasoning out of the JSON:** the structured-outputs docs warn that a property asking for step-by-step reasoning "might lead to a `reasoning_extraction` refusal"; ask for a short `why` sentence instead.

### 2.8 What users think of AI lessons elsewhere

| Product | AI feature | What reviewers say |
|---|---|---|
| **Duolingo Max** | Roleplay, Video Call (Max-only); Explain My Answer (free to all since 1 Jan 2026) | StoryLearning (data as of 19 Sep 2026): Max "adds no new lessons"; worth it only for a narrow learner who freezes when speaking. Price shown only in-app. The 2025 AI-first backlash shows users punish perceived quality drops and opaque AI content. |
| **Khanmigo** | AI tutor | Accuracy problems in math led Khan Academy to add a calculator tool and ground answers in human-written content (blog, Feb 2025). Common Sense: "low risk," but accuracy and over-trust concerns. Secondary reports of a WSJ test finding arithmetic errors — **unverified** (WSJ paywalled). |
| **Speak** | AI conversation tutor, custom lessons | LanguaTalk (updated 2 Nov 2026; a competitor, so biased): polished, accurate speech recognition, but feedback "brief and lacks depth or personalization," recognition "overly lenient," limited variety. 3/5. |
| **Music apps** | Artie (AI piano teacher) is the clearest example found; a May 2026 review says AI "really personalises the learning experience" (artmaster.com — **only search snippet seen; unverified**). No independent reviews of AI-generated *guitar theory* lessons were found. | Gap: no music app we could find generates theory lessons validated against a theory engine. |

**Takeaways for Fretboard Lab:** (1) users value AI for *personal explanation* more than for new curriculum; (2) shallow or wrong AI content erodes trust in the whole app; (3) be transparent that a lesson is AI-generated and checked; (4) keep AI lessons an add-on to the hand-built path, not a replacement.

## 3. Accounts and sync

### 3.1 What needs syncing

Today all progress is one versioned localStorage key (`fretboard-lab`, shape documented in `js/storage.js`) with lessons, review items (Leitner boxes), log, days, streak, confusions, milestones, settings, practice presets and fretboard setups. Export/import already supports **merge** ("keep the higher or newer value of each") and **replace**. That merge logic is the seed of a sync engine.

### 3.2 Backend options (pricing pages read 2026-11-14)

| | **Supabase** (Postgres + Auth) | **Firebase** (Firestore + Auth) | **Clerk + a database** | **PocketBase** (self-host) |
|---|---|---|---|---|
| Free tier | 50,000 MAU; 500 MB database per project; 5 GB egress; 1 GB storage; 500K Edge Function calls; 2 active projects; **no automatic backups** | Spark: 50K MAU auth; Firestore 1 GiB stored, 50K reads/day, 20K writes/day, 20K deletes/day, 10 GiB egress/month; Cloud Functions not available on Spark | Clerk Hobby: 50,000 monthly retained users per app, "Secured by Clerk" branding can't be removed; you still need a database (e.g. Supabase/Neon) | Free software (MIT); you pay for a server |
| Paid entry | Pro from $25/month: 100K MAU, 8 GB disk, 250 GB egress, daily backups kept 7 days, $10 compute credit | Blaze pay-as-you-go (Functions 2M invocations/month no-cost) | Clerk Pro $25/month ($20 billed annually), $0.02 per retained user from 50,001 | A small VPS (**cost not researched**) |
| Inactivity | **Free projects pause after 1 week of inactivity** ("a few user requests to the database each day over the previous week is enough to keep the project from being paused"); warning email ~1 week before; restorable for up to 1 year. Paid plans never pause. | No pausing found | — | — |
| Data model fit | SQL; JSONB column holds the blob; RLS for per-user rows | Document store; one doc per user fits the blob | Depends on DB | SQLite-backed collections |
| Security model | Row Level Security policies in SQL | Security Rules | Clerk JWT + DB policies | Collection rules |
| Lock-in | Low (it's Postgres; open source) | High (proprietary) | Medium | Low, but **"full backward compatibility is not guaranteed before reaching v1.0.0"** (README; current v0.42.2) |
| Ops burden | None | None | Two vendors | You run, patch and back up a server |

**Notes:**
- A Firestore per-user document fits the blob model, but the 20K writes/day free cap means saving after every answer (as the app does today) would need batching for even a few hundred daily users.
- Supabase Auth supports email/password, magic link, OTP, ~20 OAuth providers (Apple, Google, …) and phone. **Anonymous sign-ins** create a real user with an `is_anonymous` JWT claim that can later be converted by linking an email or OAuth identity; Supabase "strongly recommend[s]" CAPTCHA/Turnstile because anonymous users can bloat the database, and anonymous users lose access if they sign out or clear storage.
- **RLS essentials (Supabase docs):** "a table in an exposed schema without RLS is readable and writable by any role with a grant on it." Enable RLS on every table, write one policy per operation, use `(select auth.uid()) = user_id` (the `select` wrapper lets Postgres cache it), and index the `user_id` column. Views bypass RLS unless created with `security_invoker = true`.

**Recommendation: Supabase.** Same vendor for auth, database and (via a quota table) AI-lesson usage; generous free MAU; standard Postgres. Start on Free while testing, but **move to Pro ($25/month) before real users depend on it**, because Free has no backups and pauses after a quiet week.

### 3.3 Blob vs normalized tables

| Approach | How | Pros | Cons |
|---|---|---|---|
| **A. One JSONB blob per user** | `progress(user_id pk, data jsonb, version int, updated_at, device_id)` | Matches localStorage exactly; one upsert; migrations stay in `MIGRATIONS`; tiny code change | Whole-blob conflicts; can't query across users cheaply; blob grows (log array) |
| **B. Normalized** | tables for `lessons`, `items`, `log_entries`, `days`, `settings` | Per-row merging; analytics; leaderboards possible | Big rewrite; every shape change is a SQL migration |
| **C. Hybrid (recommended)** | Blob for small, last-write-wins state (settings, fretboard setups, placement, milestones) + an **append-only `log_entries` table** (and optionally `items`) | Log entries never conflict (union by `id`); blob stays small | Two sync paths |

Start with **A** (smallest change, uses the existing merge code), and split out the log into its own table only if blobs grow large.

### 3.4 Conflict handling (offline-first)

Fretboard Lab is already "local-first" in the sense of Kleppmann et al.'s 2019 Ink & Switch essay: the primary copy lives on the device, so there are "no spinners," and it works offline. The essay found that with good merge rules users "surprisingly rarely encounter conflicts," and criticizes pushing conflicts onto users (Dropbox "conflicted copies"). Full CRDTs are not needed here because the data is naturally mergeable:

| Field | Merge rule |
|---|---|
| `log` | Union by entry `id` (deletes need a tombstone `{id, deleted: true}`) |
| `days` | Set union → streak recomputed from it (the app already derives the streak from `days`) |
| `lessons[id]` | `completed` = OR; `bestScore` = max; `attempts` = max; `unlocked` = OR |
| `items[id]` (review) | Keep the record with the later `lastSeen` (Leitner box moves are sequential, so latest wins) |
| `confusions` | Max per key (or sum of per-device deltas if you track them) |
| `milestones` | Union, earliest `at` |
| `settings`, `fretboard` | Last-write-wins by `updated_at` |
| `review` (today's session) | Device-local; don't sync |

**Sync loop:** on load and every N minutes / on `visibilitychange`: pull server blob → `merge(local, server)` → save locally → push if changed, with a `version` check (`update … where version = $old`) and retry on mismatch. Keep localStorage as the source of truth so the app works signed out. This is the existing "merge import" run automatically.

### 3.5 Privacy basics

| Topic | What applies | Source |
|---|---|---|
| **GDPR (EU/UK users)** | Need a lawful basis (contract for providing the account; consent for optional analytics/marketing); data minimization; **right to erasure** — the controller must "erase personal data without undue delay" when a ground applies (Art. 17); children: default digital consent age **16**, member states may lower it, "not below 13" (Art. 8) | gdpr-info.eu Arts. 8, 17 |
| **CCPA/CPRA (California)** | Applies to a "business" above **$26,625,000** annual gross revenue (adjusted from $25M, effective 1 Jan 2025) or meeting the other volume tests; a small indie app is very likely below it, but following its rules (access, delete, no selling) costs little | CPPA monetary thresholds page |
| **COPPA (US, under 13)** | A general-audience site is covered only with "actual knowledge that a child under age 13 is the person providing personal information"; age questions are not required, but if you ask, use a **neutral** screen (free entry of birth month/year, not "I am over 12" checkboxes or year lists that stop at 13+). Once you know a user is a child, get verifiable parental consent or delete their data. Amended rule published 22 Apr 2025, effective 23 Jun 2025, **full compliance required by 22 Apr 2026**. | FTC COPPA FAQ; Hunton/BBB summaries of the amendment dates |

**Is Fretboard Lab "directed to children"?** Guitar/piano/drum learning appeals to kids, and pastel colors plus badges could look kid-oriented. Keep it general-audience: no child-directed marketing, no cartoon characters aimed at kids. Practical recommendation:
1. **Signed-out use collects nothing** (data stays in localStorage), so kids can use the full core app with no account.
2. At sign-up, a **neutral age screen**; under 13 (or under 16 in the EU, to be safe) → explain that accounts aren't available yet and keep using the app without one. Do not store the birthdate beyond the check. (A parental-consent flow is a large effort; skip it.)
3. **Collect only** email (or OAuth id) and the progress blob. No real names, no free-text profiles, no public usernames, no chat.
4. **Delete account** button that deletes the auth user and all rows (cascade), plus **export** (already exists). Apple also requires in-app account deletion for apps that offer account creation (**unverified** here; check App Store Review Guidelines 5.1.1(v) if you go native).
5. **Privacy policy** page in plain language: what is stored, where (Supabase region), processors (Supabase, Vercel, Anthropic for AI lessons, Stripe/Paddle for payments), retention, how to delete, contact email. AI lesson topics are sent to Anthropic — say so.
6. Pick an EU or US Supabase region deliberately and list it.

This is not legal advice; a template from a reputable generator plus a lawyer review before charging money is the usual indie path (**unverified practice, not researched**).

## 4. Monetization

### 4.1 How comparable apps price (pages read 2026-11-14; US prices)

App Store "In-App Purchases" lists are the most reliable public price source, but Apple shows them without labels for region or test variant, so duplicate names at different prices are common.

| App | Model | Prices seen (source) | Free tier |
|---|---|---|---|
| **Yousician** | Subscription | One Instrument $19.99/mo or $119.99/yr; Premium+ $29.99/mo, $159.99–$179.99/yr, 3 months $59.99; an IAP literally named "Yousician Subscription Free Trial: $119.99" (App Store) | Limited daily play (per round-one research); rating 4.6 (139K) |
| **Fender Play** | Subscription | $7.99–$19.99/mo; $44.99–$149.99/yr (10 unlabelled IAPs); "get 14 days free" (App Store) | Trial only |
| **JustinGuitar app** (Musopia) | Subscription + one-time unlock | Full Access $8.99/mo, $64.99/yr; Unlimited $10.99–$19.99/mo, $99.99–$129.99/yr; "Learn Guitar Pass" $89.99; "Unlock Guitar Lessons & Songs" $9.99 (App Store). JustinGuitar's website lessons are free (round one could not open justinguitar.com) | Free web course |
| **Simply Piano** | Subscription | Individual $24.95/mo(?) and Family $34.95; 12 months Premium with trial $119.99–$149.99; 3 months $74.99; description: "Subscriptions cannot be cancelled during the active subscription period" (App Store) | Trial; Simply Guitar not checked separately |
| **flowkey** | Subscription | Classic $19.99–$119.99; Premium $24.99–$179.99 (App Store, unlabelled); 7-day trial on yearly plan (search summary of listing) | Some free songs/lessons |
| **Melodics** | Subscription (Standard / Premium, monthly or annual) | Plan structure from Melodics support; prices **unverified** (third-party tracker: Standard $99.99/yr, Premium $149.88/yr, Dec 2025) | Free account required |
| **BassBuzz** (Beginner to Badass) | **One-time** course | "$197 One-time Payment" or "$39.97 PAY PLAN"; "full 180-day money-back guarantee"; "30 Hours of Beginner's Lessons" (bassbuzz.com) | 7 free starter lessons by email |
| **Drumeo** (Musora) | Subscription | $30/mo or $279/yr with songs; $25/mo or $229/yr lessons-only; 7-day free trial with a reminder before billing; **90-day money-back guarantee "even if you forget to cancel"** (drumeo.com/choose-plan) | Trial |
| **Pianote** (Musora) | Subscription + lifetime | Pianote+ 1 year $240 (Musora shop, search snippet); lifetime "price of 5 years … ($1200 total)" (search snippet; pianote.com/lifetime returned 404) — **unverified** | Trial |
| **Fretonomy** | Freemium + subscription + one-time unlocks | Premium $2.99/mo(?) / $23.99/yr(?); single instruments $2.99; All Instruments $99 (labels inferred); "Every game and tool is open in the free version" (App Store) | Generous |
| **Tenuto** (musictheory.net) | **One-time** | $4.99, 4.7 (669 ratings) (App Store); the website exercises are free | Free web version |
| **EarMaster** | Freemium + **one-time** bundles | Free core; Beginner's Course bundle $7.99; General / Jazz / Customized / Vocal Trainer bundles $14.99 each; single modules $0.99–$3.99 (App Store) | Interval & chord ID free |

**Patterns:** (1) the big guided apps charge $120–$180/yr; (2) theory/ear tools charge $5–$15 once; (3) Musora and BassBuzz compete on guarantees (90 / 180 days); (4) free web versions (musictheory.net, JustinGuitar) coexist with paid apps; (5) no one we found sells AI credit packs for music lessons.

### 4.2 Fair vs predatory: what users say

| Source | What users report |
|---|---|
| Trustpilot, Yousician (3.9, 1,322 reviews) | "Started free trial … cancelled the same day, but they still took €139.99" (Nov 2025); cancelled a 7-day trial immediately, yearly charge six days later (Feb 2026); "Annual auto renewal with no notice until the payment has been taken is annoying" (Jan 2026). Counter-example: "I forgot to cancel - I got refunded immediately on request" (Dec 2025). |
| Trustpilot, Simply (hellosimply.com, 2.9, only 12 reviews, unclaimed) | "Offered a 7 day trial and charged £89.99 immediately" (Apr 2026); refunded but never cancelled, charged £104 a year later (Nov 2026); "they make it impossible to manage your account" (Dec 2024). Small sample. |
| App Store, Yousician | "The app told me I needed to subscribe to the premium version to continue" after intro exercises (Dec 2024). |
| Round-one research (§3) | "Paywalls, surprise trials and auto-renew" was the #2 complaint across guitar apps; Tenuto's $4.99 one-time and Fret Pro's one-time pricing were praised as fair. |

**What reads as fair:** a real free tier that is useful on its own; prices shown before sign-up; trial reminders before charging (Drumeo does this); cancel in two clicks on the web; refunds without argument (Drumeo's 90-day, BassBuzz's 180-day guarantees); one-time or lifetime options. **What reads as predatory:** trials that convert to a year, no renewal notice, price shown only in-app, cancellation only through support.

### 4.3 The law on subscriptions (status as of 2026-11-14)

| Rule | Status | Source |
|---|---|---|
| **FTC "Click-to-Cancel" (amended Negative Option Rule)** | **Not in force.** Vacated in full by the Eighth Circuit in July 2025 on procedural grounds. The FTC restarted rulemaking: draft ANPRM to OIRA 30 Jan 2026, ANPRM announced 11 Mar 2026, comments closed 13 Apr 2026 (~100 comments). No replacement rule yet. | Gibson Dunn (27 Feb 2026, updated 11 Mar 2026); Jones Day (May 2026) |
| **ROSCA (federal statute)** | In force and enforced: clearly disclose material terms before taking billing info, get express informed consent, provide a simple way to stop recurring charges. | Gibson Dunn |
| **State auto-renewal laws** | ~30 states; California's requires, among other things, an annual reminder of the upcoming renewal. | Jones Day |
| **EU "withdrawal button"** (Directive (EU) 2023/2673, new CRD Art. 11a) | Applies from **19 June 2026** to online B2C contracts that carry a statutory withdrawal right: a continuously available "withdraw from contract here" button, a confirmation step, and an email acknowledgement. Fines in Germany up to €2M or 4% of turnover. Whether and how it applies to digital subscriptions where the consumer waived the 14-day right on immediate access is **not confirmed** in the sources read. | Greenberg Traurig (May 2026) |

**Practical rule for Fretboard Lab:** behave as if click-to-cancel were law (it is in effect via ROSCA, state laws and EU rules): cancel online in as many steps as sign-up, email before every annual renewal and before a trial converts, and let a merchant of record handle the EU withdrawal mechanics.

### 4.4 Payment providers (pricing pages read 2026-11-14)

| Provider | Fee | Who handles sales tax / VAT | Notes |
|---|---|---|---|
| **Stripe** (you are the merchant) | 2.9% + 30¢ US cards; +1.5% international cards; +1% currency conversion; **Billing 0.7%** of recurring volume; **Stripe Tax** 0.5% per transaction (no-code) where you're registered | You register and file (Stripe Tax calculates) | Cheapest; you own tax compliance everywhere you cross thresholds |
| **Stripe Managed Payments** (Stripe is merchant of record) | **+3.5%** on top of Payments fees (and Billing for subscriptions) | Stripe: sales tax/VAT/GST in 80+ countries, fraud, disputes, transaction-level support | US-based businesses eligible; supports "Online courses and training" and SaaS; only via Checkout or Payment Links; subscriptions via Billing; Stripe "can issue refunds within 60 days" and applies cooling-off rules. Lemon Squeezy is being folded into it (Lemon Squeezy blog, 28 Jan 2026). |
| **Paddle** (MoR) | 5% + 50¢ per transaction; "Products valued under $10 require contacting Paddle for bespoke pricing" | Paddle collects and remits | Mature MoR; covers chargebacks |
| **Lemon Squeezy** (MoR) | 5% + 50¢; "small additional fees" for non-US payments | Lemon Squeezy | Transitioning to Stripe Managed Payments; acknowledges slower support during transition — **avoid for a new build** |

**Effective fee examples** (my arithmetic from the published rates; US card, no conversion):

| Charge | Stripe + Billing (+ Tax) | Stripe Managed Payments + Billing | Paddle | Apple IAP (Small Business 15%) |
|---|---|---|---|---|
| $5 monthly | $0.48 (+$0.03 tax) ≈ 10% | $0.66 ≈ 13% | $0.75 ≈ 15% (may need bespoke pricing under $10) | $0.75 = 15% |
| $40 yearly | $1.74 (+$0.20) ≈ 5% | $3.14 ≈ 8% | $2.50 ≈ 6% | $6.00 = 15% |
| $30 lifetime (one-time, no Billing) | $1.17 ≈ 4% | $2.22 ≈ 7% | $2.00 ≈ 7% | $4.50 = 15% |

Small monthly prices are eaten by the fixed per-transaction fee, which is another argument for **annual and one-time** pricing.

**Recommendation: Stripe Checkout + Billing with Managed Payments (MoR).** One vendor, Stripe handles VAT/sales tax and refunds, and if the app outgrows the 3.5% you can switch the same Stripe account to self-managed tax. Paddle is the fallback if Managed Payments eligibility review fails.

### 4.5 App stores vs web payments

| | Apple App Store | Google Play |
|---|---|---|
| Rate | Small Business Program: **15%** for developers with up to $1M proceeds in the prior year (Apple). Standard rate (generally 30%) not stated on that page. | Outside US/EEA/UK/JP/AU: 15% on first $1M, 30% above, 15% on auto-renewing subscriptions. **US:** a new table effective 30 Jun 2026; auto-renewing subscriptions 10% + 5% billing fee (Google Play Console Help). |
| US external links | April 2025: district court found Apple in contempt and barred it from charging fees on link-out purchases. **Ninth Circuit, 11 Dec 2025:** upheld the injunction in part, held "the Company can charge some commission on link-out purchases," allowed Apple to require parity in size/placement between IAP and links, and remanded to set terms. **Supreme Court granted cert 30 Jun 2026** (No. 25-1311) on the civil-contempt standard; pending, no argument date in Apple's 10-K (FY2026). Wikipedia says Apple could not charge for external purchases during the remand phase — **not confirmed**; what commission (if any) applies today is **unsettled**. | Not researched in depth. |

**For a web app this mostly doesn't matter:** a PWA sold on the web pays only card/MoR fees. If you later wrap it as a native app, expect store rules (and possibly a commission on linked purchases) to change again; design the account so a web purchase unlocks everything (a "reader"-style model) and treat in-app purchase as optional.

### 4.6 Recommended model for Fretboard Lab

1. **Free forever:** the whole guitar Learn path Levels 1–3, the fretboard, all drills, metronome, daily review, progress, export — everything that runs locally. This is the growth engine and directly answers the round-one complaints.
2. **"Fretboard Lab Plus" — one price, annual or lifetime:** e.g. **$29/year or $59 lifetime** (**suggested, not researched**: priced between Tenuto/EarMaster one-time tools and $120+/yr guided apps). Unlocks Levels 4–6, bass/piano/drum paths as they ship, cloud sync, and a monthly allowance of AI lessons (e.g. 30).
3. **AI lesson top-ups:** small credit packs (e.g. 50 lessons for $5) for heavy users, priced at ≥5× the measured API cost.
4. **No trial-to-annual conversions.** If a trial exists, no card up front; or a 30-day no-questions refund instead of a trial.
5. **Renewal email 7 days before**, cancel in Settings, refunds on request.

## 5. Design and usability

### 5.1 Onboarding

- **NN/g (Kendrick, 2020):** "we don't recommend deck-of-cards onboarding"; avoid onboarding "whenever possible"; NN/g's own testing found deck-of-cards tutorials "didn't improve task performance"; users are unlikely to remember tutorial content. Onboarding is justified when the app needs user information to start, or key features are unfamiliar. Contextual tips at the moment a feature becomes actionable work better.
- **Implication for Fretboard Lab:** no tutorial carousel. First screen = one question ("New to guitar, or know some already?") → either Lesson 1-1 immediately or the placement quiz (already built). Instrument choice (guitar / bass / piano / drums) is the only other upfront question once more instruments exist, because it changes everything. No sign-up before the first lesson; offer an account only when there's something to protect (after the first lesson or first streak day), framed as "save your progress across devices."
- Contextual tips once: first time the heat map has data, first due review, first time "player's view" is relevant.
- Round one (§4) already found the same pattern in Ableton Learning Music and Chrome Music Lab: you start doing immediately, no account.

### 5.2 Keeping a feature-rich app simple

- **Progressive disclosure (Nielsen, NN/g, 2006):** show core options first, defer advanced ones to a secondary screen; improves "learnability, efficiency of use, and error rate"; "designs that go beyond 2 disclosure levels typically have low usability"; "the very fact that something appears on the initial display tells users that it's important."
- The app already does this in places (the Fretboard tab's "More options"). Apply it everywhere:
  - **Home = one next action** ("Continue: Lesson 3-4" + "Daily review: 8 due"), with the path map below.
  - **Tabs:** keep 5 (Learn, Fretboard, Practice, Ear, Progress). Put AI lessons inside Learn ("Ask for a lesson"), not as a sixth tab.
  - **Drill setup:** a "Start" button with sensible defaults; options behind one "Customize" disclosure (answers Tenuto's "overwhelming" complaint from round one).
  - **Unlock features as they become relevant:** e.g., hide CAGED options in the Fretboard picker until Level 4 is reached or the user opens "More."
  - **Instrument switch** at the top level; each instrument shows only its own content.

### 5.3 Color contrast — computed for the current palette

Computed with the WCAG 2.x relative-luminance formula (script in this session; values not rounded up). Thresholds: **4.5:1** normal text, **3:1** large text (18 pt / 14 pt bold) (SC 1.4.3); **3:1** for UI components and graphics needed to understand content (SC 1.4.11) — "2.999:1 fails."

**Foreground on background**

| Color | Hex | on bg #0F0F14 | on panel #18181F | on board #14141A | Verdict |
|---|---|---|---|---|---|
| Text | #EDEDF2 | 16.38 | 15.13 | 15.72 | Pass AAA |
| Muted | #A9A9B8 | 8.24 | 7.61 | 7.91 | Pass AAA |
| Baby blue | #89CFF0 | 11.15 | 10.30 | 10.70 | Pass AAA |
| Baby pink | #F4C2C2 | 12.14 | 11.22 | 11.66 | Pass AAA |
| Lavender | #C3B1E1 | 9.74 | 8.99 | 9.34 | Pass AAA |
| Good | #57C98E | 9.24 | 8.54 | 8.87 | Pass AAA |
| **Bad** | #D91E25 | **3.79** | **3.50** | 3.64 | **Fails as text** (OK for icons/borders ≥3:1) |
| **Other-degree grey** | #6E6E7C | **3.81** | 3.52 | 3.66 | Passes 3:1 as a dot; **fails as text** |
| String | #9393A3 | 6.32 | 5.84 | 6.07 | Pass |
| Fret | #4B4B58 | 2.23 | 2.06 | 2.14 | Below 3:1 — fine only if frets are decorative context (they are, since fret numbers are shown) |
| Line | #34343F | 1.56 | 1.44 | 1.49 | Decorative only |

**Text on filled colors (dots, buttons)**

| Fill | Dark text #15151B | White #FFFFFF |
|---|---|---|
| Baby blue | **10.60** ✓ | 1.71 ✗ |
| Baby pink | **11.55** ✓ | 1.57 ✗ |
| Lavender | **9.26** ✓ | 1.96 ✗ |
| Good green | **8.79** ✓ | 2.07 ✗ |
| Bad red | 3.60 ✗ | **5.04** ✓ (app uses white `--on-bad`) |
| Grey #6E6E7C | 3.62 ✗ | **5.02** ✓ (app uses white `--deg-other-text`) |

**Verdict:** the palette is strong for contrast. The app already pairs each fill with the right text color. Two fixes: (1) don't use `--bad` #D91E25 for text on dark backgrounds — use a lighter red such as **#FF6B6B (6.89:1)** or #F87171 (6.91:1) for text, keep #D91E25 for fills with white text; (2) don't use the grey #6E6E7C for text; if a grey label is needed use **#80808E (4.91:1 on bg, 4.54 on panel)**. Also note the three pastels are nearly the same lightness (pink vs blue 1.09:1, blue vs lavender 1.14:1), so they are told apart by hue alone — which matters below.

### 5.4 Color-blindness check of the degree code

**Method:** simulated each degree color with the Machado, Oliveira & Fernandes (IEEE TVCG 2009) physiologically based model at severity 1.0 (dichromacy; matrix values checked against the authors' published table), then measured perceptual difference with CIEDE2000 (ΔE00). Rough guide (**rule of thumb, not a standard**): ΔE00 below ~5 is hard to tell apart for small dots; above ~15 is clearly distinct. About 1 in 12 men have color vision deficiency, red-green types most commonly (US National Eye Institute).

| Pair | Normal | Protanopia | Deuteranopia | Tritanopia |
|---|---|---|---|---|
| Root pink vs 3rd blue | 39.6 | 18.2 | 25.7 | 56.2 |
| Root pink vs 5th lavender | 19.0 | 20.1 | 24.1 | 17.4 |
| **3rd blue vs 5th lavender** | 25.7 | **5.2** | **2.9** | 33.6 |
| 5th lavender vs other grey | 27.2 | 25.9 | 26.0 | 25.8 |
| Good green vs bad red | 72.1 | 37.0 | 21.7 (lightness ratio only 1.91) | 68.1 |

Simulated colors (deuteranopia): pink → #D6D2C1 (beige), blue → #AFC1F0, lavender → #ABB9E0 — **the 3rd and the 5th become nearly the same periwinkle** for protanopes and deuteranopes (together the large majority of color-blind users). Pink stays distinguishable as a warm beige/grey.

**Verdict:** the code fails for the most common color-vision deficiencies on exactly the distinction the app teaches most (3rd vs 5th). Fixes, in order of value:

1. **Redundant encoding (required by WCAG SC 1.4.1, "Color is not used as the only visual means of conveying information"):** always show the degree label inside the dot (R, 3, b3, 5…) — the app's labels mode already does this; when the user picks "no labels," keep a **shape** code: root = square/rounded-square, 3rd = circle, 5th = diamond (or a ring), other = small dot. Shapes work in every simulation and in grayscale.
2. **Darken the 5th:** replacing lavender #C3B1E1 with a deeper violet such as **#9B7FD1** keeps the brand family and, in the same simulation, raises the worst pair across normal, protan, deutan and tritan vision to ΔE00 ≥15.4 (3rd vs 5th becomes 16.0 for deuteranopes). Dark text on it is 5.5:1 (passes); it is 5.8:1 against the background. (Alternatives tested: a pale gold 5th works for red-green but drops to 6.7 vs pink in tritanopia; mint fails.)
3. **Right/wrong marks** already use color; add ✓/✗ glyphs (good vs bad have a lightness ratio of only 1.91 under deuteranopia).
4. Add a **"color-blind friendly" setting** only if testing shows a need; with labels/shapes plus the darker 5th, the default can serve everyone.
5. Verify with a real simulator (e.g., Chrome DevTools "Emulate vision deficiencies") on the actual fretboard — this report's check is computational only.

### 5.5 Phone-first layout

- WCAG 2.2 SC 2.5.8 (AA): targets "at least 24 by 24 CSS pixels," or smaller with spacing so a 24 px circle around each doesn't touch another target. Apple's HIG recommends ~44×44 pt tap areas (**unverified**; the HIG page didn't render).
- A 12-fret, 6-string neck on a 375 px-wide phone gives ~28 px per fret column in portrait if shown whole — borderline. The app's 6-fret window on phones (README) is the right call: ~55 px per fret. Keep tap areas larger than the drawn dot (invisible hit-rects), allow landscape for the full neck, and keep the bottom tab bar (already built).
- One primary action per screen, reachable by thumb (bottom half).

### 5.6 Screen-reader access for the SVG fretboard

| Mode | Pattern | Source |
|---|---|---|
| Display only (lesson "See" step) | `<svg role="img" aria-labelledby="t">` with a `<title>` such as "G major scale, frets 2–5: G on string 6 fret 3 (root)…"; plus a visible or visually-hidden list of the notes | Accessible-SVG guidance (TPGi, Deque, axe rule `svg-img-alt`: img/graphics-document roles need an accessible name) |
| Tap-to-answer (Try, Check, drills) | Treat the neck as an **interactive grid**: `role="grid"`, one `row` per string, `gridcell` per fret, each cell focusable and announced ("String 5, fret 3, C"); arrow keys move between frets and strings; Home/End to first/last fret; Enter/Space answers. Only one cell in the tab order (**roving tabindex**: current cell `tabindex="0"`, others `-1`, update on arrow keys — the browser then scrolls it into view). | WAI-ARIA APG Grid pattern; APG "Developing a Keyboard Interface" |
| Feedback | An `aria-live="polite"` region announcing "Correct: C is the root" / "Not quite: that's D, the 2nd" | — |
| Audio-first alternative | Ear-training questions can be answered by choosing a degree name from buttons as well as tapping the neck | — |

Rendering cells as real `<button>` elements inside an HTML table overlaid on (or instead of) the SVG is often simpler and more robust than ARIA on SVG shapes (**design judgment, not tested here**). Test with VoiceOver on iOS and NVDA on Windows.

### 5.7 Progressive web app (installable, offline)

**Why this matters more than it looks:** WebKit's tracking prevention "deletes all cookies created in JavaScript and all other script-writeable storage" — including **localStorage, IndexedDB and service-worker caches** — after seven days without user interaction with the site, but "the first-party domain of home screen web applications is exempt from ITP's 7-day cap." A learner who uses Fretboard Lab in Safari, then takes a week off, **can lose all progress**. Mitigations: encourage "Add to Home Screen" on iOS, call `navigator.storage.persist()` (WebKit grants it "based on heuristics like whether the website is opened as a Home Screen Web App"), offer cloud sync (section 3), and keep export visible.

| Topic | Status | Source |
|---|---|---|
| Install on iOS | Since iOS/iPadOS 26 "every website added to the Home Screen opens as a web app" by default; "Giving users a web app experience simply no longer requires a manifest file"; Safari has "zero requirements for 'installability'" (WebKit, Safari 26.0, 15 Sep 2025). There is no automatic install prompt on iOS (`beforeinstallprompt` is not described for Safari) — show your own "Share → Add to Home Screen" hint. | WebKit blog |
| Install on Chrome/Android | Manifest with name/short_name, 192 px and 512 px icons, start_url, display standalone etc.; HTTPS; engagement heuristic (a tap and 30 s on page) | web.dev install criteria |
| Push notifications on iOS | Since iOS 16.4, only for Home Screen web apps, and permission may be requested only "in response to direct user interaction"; no Apple Developer Program membership needed; Declarative Web Push in iOS 18.4 | WebKit blog (Feb 2023; Safari 18.4) |
| Badging | Badging API for Home Screen web apps (iOS 16.4) | WebKit blog |
| Storage quota | Browser apps: origin quota up to 60% of disk; eviction is per origin, least-recently-used; default "best-effort" persistence | WebKit storage policy post (Aug 2023) |
| Offline | A service worker that precaches `index.html`, CSS, all `js/` modules (no build step makes this a simple list) — the app is fully client-side, so it can work 100% offline; AI lessons and sync queue until online | — |

**Recommendation (small effort):** add `manifest.webmanifest`, icons, a cache-first service worker with a versioned cache name, an iOS "Add to Home Screen" hint after the second visit, and `navigator.storage.persist()`. Use web push only for an opt-in daily review reminder (and never for streak guilt — see section 6).

## 6. Gamification

### 6.1 Evidence

| Source | What it found | Strength |
|---|---|---|
| **Sailer & Homner 2020**, *Educational Psychology Review* 32(1), meta-analysis | Small positive effects on **cognitive** learning (g = .49, 95% CI [.30, .69], k = 19, N = 1,686), **motivational** (g = .36, k = 16, N = 2,246) and **behavioral** outcomes (g = .25, CI [.04, .46], k = 9, N = 951). Only the cognitive effect "was stable in a subsplit of studies employing high methodological rigor." For behavior, "inclusion of game fiction and combining competition with collaboration were particularly effective." | Strong for "small, real effect on learning"; weaker for motivation |
| **Hamari, Koivisto & Sarsa 2014**, HICSS, review of 24 empirical studies | Mostly positive results, but "the effects are greatly dependent on the context in which the gamification is being implemented" and on the users (abstract via search; full text not opened) | Moderate, dated |
| **Deci, Koestner & Ryan 1999**, *Psychological Bulletin*, 128 experiments (overjustification) | Expected **tangible** rewards undermine free-choice intrinsic motivation; **positive feedback enhanced** free-choice behavior (d = 0.33) and self-reported interest (d = 0.31). Exact sub-effect sizes from abstract fragments in search results — **numbers unverified** (PDFs unreadable, PubMed blocked). The 2001 follow-up (Deci, Koestner & Ryan) describes the undermining effect of tangible rewards as "substantial"; Cameron & Pierce (1994) argued it was minimal — a long-running dispute. | Strong (direction); numbers unverified here |
| **Self-determination theory** (selfdeterminationtheory.org) | Intrinsic motivation is supported by autonomy, competence and relatedness; Cognitive Evaluation Theory covers "how factors such as rewards, interpersonal controls, and ego-involvements impact intrinsic motivation." | Theory |
| **Hanus & Fox 2015**, *Computers & Education* 80, 71 students over a 16-week semester | Course with leaderboard + badges: students became less motivated, less satisfied and less empowered than the non-gamified section, and lower intrinsic motivation was linked to lower final-exam scores (from index-page summaries; **abstract not opened** — ScienceDirect returned 403) | Moderate (one quasi-experiment) |
| **Silverman & Barasch 2023**, *Journal of Consumer Research* 49(6), 7 studies | "Intact streaks highlighted via behavioral logs increase consumers' subsequent engagement … relative to when broken streaks are highlighted"; the effect "is independent of actual past behavior and depends solely on how that behavior is represented"; it is "amplified when consumers attribute a break … to themselves" and "attenuated when consumers can 'repair' a broken streak." | Strong (multi-study, peer-reviewed) |
| **Duolingo blog** (company data, no published methods) | Learners reaching a 7-day streak are "3.6 times more likely to complete their course" (Mansur, Jan 2022 — observational, selection bias likely); allowing two streak freezes raised daily active learners by a relative +0.38%; decoupling the streak from the daily goal (any one lesson counts) raised day-14 retention 3.3% and new learners on a streak 19%, but "fewer learners were actually reaching their daily goals" (Yu, Nov 2020). Duolingo cites Penn/UCLA research that goal "slack" can be more motivating than rigid rules, and acknowledges that breaking a streak "can feel demotivating." | Weak–moderate (A/B tests, self-reported by a company that profits from engagement) |
| Round one (§3) | App-review complaint: gamification "rewards repetition, not skill"; lessons "all feel very similar" | User reports |

### 6.2 What helps vs hurts

| Mechanic | Verdict | Why |
|---|---|---|
| **Streaks** | Helps, if forgiving | Intact streaks raise engagement; broken ones hurt, especially when users blame themselves; "repair" softens it (Silverman & Barasch). Counting any one activity (not a big daily goal) grew habit formation (Duolingo). |
| **Streak freezes / repair** | Helps | Directly supported by both sources. |
| **Badges for mastery** ("all 12 notes on the A string under 2 s") | Helps (informational feedback → competence) | Positive, informational feedback enhances intrinsic motivation; aligns rewards with skill, not grind. |
| **Badges for volume** ("100 drills") | Neutral to harmful | Rewards repetition, the exact round-one complaint. |
| **XP / points** | Weak | Little specific evidence; risks overjustification if it becomes the goal. Show *skill* metrics (accuracy, speed, heat map) instead. |
| **Global leaderboards** | Avoid | Hanus & Fox negative result; social comparison demotivates most people who aren't near the top. Sailer & Homner favor competition **combined with collaboration**. |
| **Friends / shared goals** | Optional, later | Collaboration plus light competition was the effective combination; Duolingo reports friend streaks help (company data). Requires accounts and raises child-safety questions (section 3). |
| **Loss-aversion notifications** ("Your streak will die!") | Avoid | Self-blame amplifies the broken-streak effect; Silverman suggested avoiding "you broke your streak" messages (U. Delaware interview, search snippet). |
| **Game fiction / story** | Possibly helps behavior | Moderator in Sailer & Homner; low priority for a theory app. |

### 6.3 Recommendations for Fretboard Lab (all small effort)

1. **Keep the streak, make it kind:** any practice activity counts (a 2-minute review is enough); 2 automatic freezes per week; "repair yesterday" by doing two sessions today; call it a "practice streak," show the calendar rather than a single big number.
2. **When a streak breaks, show the long view:** "You practiced 23 of the last 30 days" (frames the log as mostly intact, which the JCR research suggests protects engagement). Never use guilt copy.
3. **Badges = mastery milestones** tied to the heat map, review boxes and level challenges; retire volume badges.
4. **No global leaderboard.** If social features come later, use friend-only, cooperative goals ("our band practiced 5 days this week").
5. **Make progress visible as skill:** median answer time per string, % of fretboard mastered, intervals graduated to box 5 — the competence signal SDT says matters.
6. **Autonomy:** let users choose what to practice today (the path suggests, never forces); placement quiz to skip known material (already built).

## 7. Growth (finding the first users without spending money)

> **Coverage gap:** Reddit pages (site rules, r/Guitar wiki, founder posts) could not be fetched, and Indie Hackers posts returned 403. Founder write-ups specific to music-learning apps are scarce; the strongest evidence below is Hacker News launch threads for directly comparable fretboard/theory tools.

### 7.1 Case studies

| Case | What happened | Lessons |
|---|---|---|
| **Fretboardfly** — "Show HN: I created a game to memorize the fretboard" (26 May 2023) | **258 points, 141 comments.** Liked: concept, bass & left-handed modes, untimed practice mode. Criticized: "feels like it gives a lot of negative feedback right from the get go," "wow, level zero is hard," stress from the timer, a "repugnant" wrong-answer sound, back-button hijacking, autoplaying sound, mobile touch bugs. Requests: spaced-repetition beginner mode, fading hints, show the right answer after a miss, **play the note**, alternate tunings, intervals/chords/scales, more instruments, ear-training mode. | HN guitar threads are a huge free focus group. Nearly every request is something Fretboard Lab already has (spaced review, sound, scale degrees, ear training) — strong signal for a Show HN. Fix mobile and audio-consent issues first. |
| **Cadence** — "Show HN: Cadence, a guitar theory app" (22 Oct 2025) | **195 points, 89 comments.** Solo, built on the side for ~1 year; $30 lifetime or $3/month, no ads, no account required. "I love your pricing model, enough to make me download the app." Criticisms: dark-mode icon contrast, machine translations, iOS audio pops, being prompted to create an account, "Theory does not equal practice." Stack: Flutter, PocketBase on a €5/month VPS, RevenueCat. Hardest part: "staying consistent for more than a year alone without really any feedback." | Lifetime pricing and no-account use earn goodwill on HN. Expect the "theory ≠ playing" objection — answer with the "Play" step and play-alongs. Get feedback much earlier than a year. |
| **StringScales** — Show HN (14 Aug 2024) | 27 points, 18 comments. Free scale visualizer "without … paywalling features like CAGED or 3NPS." Liked the looks and CAGED; requests for rotated/vertical boards and chord charts. | A visualizer alone draws modest interest; the guided path + ear training is the stronger hook. |
| **AudioCipher** (Starter Story, 13 Apr 2021) | MIDI word-to-melody plugin: 200+ sales / $3,000+ in 10 weeks. The Apple App Store "was a pain to get into and ended up being a complete bust" (no organic sales); a plugin-marketplace ad lost ~$500; one influencer giveaway (ProducerGrind) drove ~$600 in a weekend; ~50% of website sales came from direct/organic search; TikTok tests got ~8× Instagram's views. | For music tools: own website + creator partnerships beat marketplaces; short-form video gets reach. (This founder did spend on Facebook ads.) |
| **FormulaBot** (Tiny Empires, not music) | A post in r/Excel went viral; no login, free use; later ~15 free tools drive ~75% of traffic; 1.2M users in 3 years; "Google was being used less for information, but more for utilities." | Free single-purpose utilities rank well and convert. Fretboard Lab's free fretboard, metronome and drills are exactly such utilities. |

### 7.2 Channel rules (read 2026-11-14)

| Channel | Rules / evidence | How to use it |
|---|---|---|
| **Hacker News (Show HN)** | "Show HN is for something you've made that other people can play with"; ideally no "signups or emails"; landing pages excluded; asking friends to upvote or comment is prohibited. | Post once the guided path, ear tab and phone layout are solid. Write a plain first comment: what it is, why, stack (no build step, Web Audio), what's free. Stay in the thread all day. Fretboard Lab's no-account, local-first design fits HN's norms. |
| **Product Hunt** | Share organically, reply to comments, mention it in communities you're already in. Avoid "mass-messaging users," rewards for upvotes and "coordinated voting efforts"; ranking "considers more than just upvotes"; no paid ads on launch day (search summary of Launch Guide). | Secondary; general tech audience, not guitarists. Launch after HN with a polished page and short demo GIFs. |
| **Reddit** (r/guitar, r/musictheory, r/bass, r/piano, r/drums, r/WeAreTheMusicMakers, r/SideProject) | Could not read Reddit's own self-promotion rules (blocked). A search summary of the r/Guitar wiki says links to a site you own must follow Reddit's self-promotion guidelines and the subreddit's spam rules; a marketing blog cites a "no more than 10% self-promotion" rule — **unverified**. | Read each sidebar first; participate for weeks before posting; disclose "I made this"; prefer subreddit-designated feedback threads; post a useful free thing (e.g., "interactive CAGED explorer, no signup"), not a pitch. |
| **SEO** | Google's guidance: "prioritize helpful, reliable information that's created to benefit people"; demonstrate "first-hand expertise"; "using extensive automation to produce content on many topics" is a warning sign, and AI content made "for the primary purpose of manipulating search rankings" violates spam policy. Search volumes for "guitar scales" etc. were **not measured** (no keyword tool access). | Make shareable, indexable pages: `/scales/g-dorian` with an interactive neck, the notes, degrees, sound and a "practice this" button — generated from `theory.js` (one page per key × scale is thousands of pages; keep them genuinely useful and canonical, and avoid thin duplicates). Hash routes (`#fretboard?key=G`) aren't indexed separately; SEO pages need real paths. **Don't** mass-publish AI-written articles. |
| **YouTube / TikTok / Shorts** | No direct evidence for music *apps*; AudioCipher saw ~8× reach on TikTok vs Instagram. | 15–30 s screen captures: "Every G on the neck in 10 seconds," "Why the B string breaks the pattern," "Hear the difference: major vs minor 3rd." The fretboard visuals and synthesized audio are ready-made content. Partner with small guitar-teacher channels by giving them a free embed/tool rather than asking for promotion. |
| **Free tools as lead magnets** | FormulaBot and indie "engineering as marketing" posts (search summaries; mostly unverified self-reports). | The free Fretboard tab, a metronome, a "chord namer," and a printable scale-sheet generator are lead magnets that need no account. Add a quiet "Start the guided path" link on each. |
| **Teachers** | — (not researched) | A free "teacher link": a URL that opens a specific lesson or fretboard setup (the router already supports this) is a natural way for teachers to share. |

### 7.3 Recommended sequence (zero budget)

1. **Fix the basics HN commenters punish:** phone touch, no autoplay sound before interaction, no back-button traps, gentle first-level difficulty, visible correct answer after a miss.
2. **Private beta via 5–10 guitar learners** (friends, a local teacher) for 2–4 weeks; watch them use it.
3. **Show HN** (weekday morning US time; one post, honest first comment).
4. **Reddit**: one helpful post per relevant subreddit, spaced weeks apart, following each sidebar.
5. **SEO scale/chord pages** generated from the theory engine, each with sound and a CTA.
6. **Short videos** weekly from the app's own visuals.
7. **Product Hunt** once there are testimonials and the bass/piano tracks give a bigger story.

## Sources

All opened 2026-11-14 unless noted.

### 1. Ear training
- Karpinski 2021, "A Cognitive Basis for Choosing a Solmization System," Music Theory Online 27.2: https://www.mtosmt.org/ojs/index.php/mto/article/view/616/148
- Nichols & Springer 2022, JRME 70(1), abstract: https://pure.psu.edu/en/publications/interval-identification-predicts-success-in-melodic-dictation/
- Little, Cheng & Wright 2019, interval learning (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC6384134
- Mednicoff, Mejia, Rashid & Chubb 2018, JASA (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC6192795
- Psychonomic Society summary of Wong et al. 2025 (adult absolute pitch): https://featuredcontent.psychonomic.org/from-pitchy-to-pitch-perfect-training-absolute-pitch-in-adults/
- Functional Ear Trainer (App Store): https://apps.apple.com/app/id1088761926 ; miles.be: https://www.miles.be/
- EarMaster (App Store): https://apps.apple.com/us/app/earmaster-music-theory/id1105030163
- Complete Ear Trainer (App Store): https://apps.apple.com/us/app/complete-ear-trainer/id1012455471
- Perfect Ear (App Store): https://apps.apple.com/us/app/perfect-ear-ear-trainer/id1440768353
- ToneDear: https://tonedear.com/
- musictheory.net exercises: https://www.musictheory.net/exercises
- teoria.com exercises: https://www.teoria.com/en/exercises/
- Tenuto (App Store): https://apps.apple.com/us/app/tenuto/id459313476
- Arthur 2018 (scale-degree qualia) and Dowling 1986 — search summaries only (see "couldn't access")

### 2. AI custom lessons
- Anthropic pricing: https://platform.claude.com/docs/en/about-claude/pricing.md
- Anthropic models overview: https://platform.claude.com/docs/en/about-claude/models/overview.md
- Structured outputs: https://platform.claude.com/docs/en/build-with-claude/structured-outputs.md
- Tool use overview: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview.md
- Streaming: https://platform.claude.com/docs/en/build-with-claude/streaming.md
- Prompt caching: https://platform.claude.com/docs/en/build-with-claude/prompt-caching.md
- Rate limits: https://platform.claude.com/docs/en/api/rate-limits.md
- Mitigate jailbreaks: https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks.md
- Content moderation guide: https://platform.claude.com/docs/en/about-claude/use-case-guides/content-moderation.md
- Vercel Functions limits: https://vercel.com/docs/functions/limitations
- Vercel streaming: https://vercel.com/docs/functions/streaming-functions
- Vercel pricing: https://vercel.com/pricing ; Hobby plan: https://vercel.com/docs/plans/hobby ; fair use: https://vercel.com/docs/limits/fair-use-guidelines ; terms §4: https://vercel.com/legal/terms
- Vercel Redis / KV sunset note: https://vercel.com/docs/storage/vercel-kv
- Upstash Redis pricing: https://upstash.com/pricing/redis ; ratelimit overview: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview ; algorithms: https://upstash.com/docs/redis/sdks/ratelimit-ts/algorithms
- Khan Academy, Khanmigo math updates (Feb 2025): https://blog.khanacademy.org/khanmigo-math-computation-and-tutoring-updates/
- Common Sense Media, Khanmigo risk assessment: https://institute.commonsensemedia.org/risk-assessments/khanmigo
- StoryLearning, Duolingo Max review: https://storylearning.com/duolingo-max-review
- TechCrunch, Duolingo 148 AI courses (30 Apr 2025): https://techcrunch.com/2025/04/30/duolingo-launches-148-courses-created-with-ai-after-sharing-plans-to-replace-contractors-with-ai
- The 74, Duolingo AI backlash (3 Jun 2025): https://www.the74million.org/article/as-duolingo-turns-to-ai-some-users-say-language-app-has-joined-the-dark-side/
- LanguaTalk, Speak review: https://languatalk.com/blog/speak-app-review/
- Measured locally: serialized size of the Level 3 lesson objects (js/lessons/level3.js)

### 3. Accounts and sync
- Supabase pricing: https://supabase.com/pricing
- Supabase project pausing: https://supabase.com/docs/guides/platform/free-project-pausing
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Auth: https://supabase.com/docs/guides/auth ; anonymous sign-ins: https://supabase.com/docs/guides/auth/auth-anonymous
- Firebase pricing: https://firebase.google.com/pricing
- Clerk pricing: https://clerk.com/pricing
- PocketBase: https://pocketbase.io/ ; README: https://github.com/pocketbase/pocketbase
- Kleppmann et al. 2019, "Local-first software" (Ink & Switch): https://www.inkandswitch.com/essay/local-first/
- GDPR Art. 8: https://gdpr-info.eu/art-8-gdpr/ ; Art. 17: https://gdpr-info.eu/art-17-gdpr/
- CPPA monetary thresholds: https://cppa.ca.gov/regulations/cpi_adjustment.html
- FTC COPPA FAQ: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- COPPA amendment dates — search summaries of Hunton, BBB National Programs, Foley Hoag (not opened individually; dates consistent across sources)

### 4. Monetization
- App Store listings: Yousician https://apps.apple.com/us/app/yousician-learn-play-music/id959883039 ; Fender Play https://apps.apple.com/us/app/fender-play-guitar-lessons/id1226057939 ; JustinGuitar https://apps.apple.com/us/app/justin-guitar-lessons-songs/id1176125504 ; Simply Piano https://apps.apple.com/us/app/simply-piano-by-joytunes/id1019442026 ; flowkey https://apps.apple.com/us/app/flowkey-learn-to-play-piano/id1020357408 ; Fretonomy https://apps.apple.com/us/app/fretonomy-learn-fretboard/id1279576225
- BassBuzz Beginner to Badass: https://www.bassbuzz.com/lessons/beginner
- Drumeo plans: https://www.drumeo.com/choose-plan
- Melodics support (plans): https://support.melodics.com/en/articles/8044669-how-to-subscribe-to-melodics
- Trustpilot Yousician: https://www.trustpilot.com/review/yousician.com ; Simply: https://www.trustpilot.com/review/hellosimply.com
- Gibson Dunn, FTC negative option rulemaking (27 Feb 2026, upd. 11 Mar 2026): https://www.gibsondunn.com/ftc-restarts-negative-option-rulemaking-after-eighth-circuit-vacatur-enforcement-under-rosca-continues/
- Jones Day, FTC revives click-to-cancel (May 2026): https://www.jonesday.com/en/insights/2026/05/ftc-revives-clicktocancel-rule-new-risks-for-subscription-businesses
- Greenberg Traurig, EU withdrawal button (May 2026): https://www.gtlaw.com/en/insights/2026/5/eu-consumer-law-new-withdrawal-button-requirements-for-online-contracts
- Stripe pricing: https://stripe.com/pricing ; Managed Payments: https://docs.stripe.com/payments/managed-payments ; eligibility: https://docs.stripe.com/payments/managed-payments/eligibility
- Paddle pricing: https://www.paddle.com/pricing
- Lemon Squeezy pricing: https://www.lemonsqueezy.com/pricing ; 2026 update (28 Jan 2026): https://www.lemonsqueezy.com/blog/2026-update
- Apple Small Business Program: https://developer.apple.com/app-store/small-business-program/
- Google Play service fees: https://support.google.com/googleplay/android-developer/answer/112622
- Apple Form 10-K FY2026 (legal proceedings, Epic): https://www.sec.gov/Archives/edgar/data/0000320193/000032019326000026/aapl-20260926.htm
- Wikipedia, Epic Games v. Apple: https://en.wikipedia.org/wiki/Epic_Games_v._Apple

### 5. Design and usability
- WCAG 2.2 Understanding 1.4.3: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html ; 1.4.1: https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html ; 1.4.11: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html ; 2.5.8: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Machado, Oliveira & Fernandes 2009 (CVD simulation model): https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
- National Eye Institute, color blindness: https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/color-blindness
- WAI-ARIA APG Grid pattern: https://www.w3.org/WAI/ARIA/apg/patterns/grid/ ; Keyboard interface: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
- NN/g, progressive disclosure (2006): https://www.nngroup.com/articles/progressive-disclosure/ ; mobile onboarding (2020): https://www.nngroup.com/articles/mobile-app-onboarding/
- WebKit tracking prevention (7-day storage cap): https://webkit.org/tracking-prevention/
- WebKit storage policy (Aug 2023): https://webkit.org/blog/14403/web-push-for-web-apps-on-ios-and-ipados/ (URL slug is misleading; the post is about storage)
- WebKit Safari 26.0 (Home Screen web apps): https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
- WebKit web push on iOS 16.4 (via search summary of https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- web.dev install criteria: https://web.dev/articles/install-criteria
- Contrast and simulation values computed in this session with the WCAG luminance formula, Machado 2009 severity-1.0 matrices and CIEDE2000

### 6. Gamification
- Sailer & Homner 2020, abstract (Augsburg repository): https://opus.bibliothek.uni-augsburg.de/opus4/frontdoor/index/index/docId/109056
- Silverman & Barasch 2023, JCR, abstract: https://udspace.udel.edu/items/42ce576b-8e1f-429a-8541-e29e48dbcfbb
- Duolingo, streak habit research (Mansur, Jan 2022): https://blog.duolingo.com/how-duolingo-streak-builds-habit/
- Duolingo, improving the streak (Yu, Nov 2020): https://blog.duolingo.com/improving-the-streak/
- Self-determination theory overview: https://selfdeterminationtheory.org/theory/
- Hamari et al. 2014, Deci et al. 1999, Hanus & Fox 2015 — search summaries only (see below)

### 7. Growth
- Show HN guidelines: https://news.ycombinator.com/showhn.html
- Show HN: fretboard memorization game (2023): https://news.ycombinator.com/item?id=36084503
- Show HN: Cadence (2025): https://news.ycombinator.com/item?id=45566730
- Show HN: StringScales (2024): https://news.ycombinator.com/item?id=41243901
- Starter Story, AudioCipher (2021): https://www.starterstory.com/how-to-sell-music-software
- Tiny Empires, FormulaBot: https://tinyempires.substack.com/p/12-million-users-as-a-solo-founder
- Product Hunt, sharing your post: https://help.producthunt.com/en/articles/2690626-how-do-i-share-my-post ; launch guide index: https://help.producthunt.com/en/collections/19793093-launch-guide
- Google Search Central, helpful content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content

## Tried but couldn't access

- **Reddit** (site self-promotion wiki, r/Guitar rules wiki via a mirror) — blocked or failed; the "10% rule" is unverified.
- **Indie Hackers** posts (MyGuitarTuner, free-tool traffic posts) — HTTP 403.
- **Deci, Koestner & Ryan 1999** PDFs (washington.edu, selfdeterminationtheory.org) — unreadable font encoding; PubMed required cookies. Effect sizes quoted from search-result abstract fragments are marked unverified.
- **Hanus & Fox 2015** (ScienceDirect 403; index pages without abstract) — findings from index-page summaries.
- **Hamari, Koivisto & Sarsa 2014** summary page — 404; abstract details from search results.
- **Chubb et al. 2013** PDF — 404 (used the 2018 replication instead).
- **Arthur 2018** (Music Perception) and **Dowling 1986** — only secondary summaries; a JMTP PDF on interval vs scale-degree hearing was a scanned image.
- **Nichols & Springer 2022** full PDF — unreadable; used the Penn State abstract page.
- **WSJ** Khanmigo math test — paywalled; secondary only.
- **Yousician pricing page** (404), **Fender Play pricing page** (403), **Melodics pricing page** (404), **Pianote lifetime page** (404), **Taylor Wessing** EU withdrawal article (403).
- **Apple Human Interface Guidelines** accessibility page — didn't render; 44 pt target is unverified. Apple's standard 30% commission and the App Store account-deletion rule (5.1.1(v)) not confirmed on an Apple page.
- **Product Hunt "How to promote your launch"** article — not found; used the "share your post" article.
- **The Next Web** (Instinct guitar app beta) — redirect not followed; not used.
- **muted.io** founder growth story — none found.
- Keyword search-volume data for "guitar scales"-type queries — no tool access; not measured.
