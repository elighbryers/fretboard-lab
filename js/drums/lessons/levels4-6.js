// Drum Levels 4-6 (docs/research-drums.md E): triplets, swing and shuffle; coordination and
// independence; time, feel and your own parts. Original patterns only.
import { D, task, tap, choice, kit, seq, pads, dgrid, dgridTask, tech, board, play } from './kit.js';

const T12 = [...Array(12).keys()], E8 = [0, 2, 4, 6, 8, 10, 12, 14];
const SHUF = { ride: 'x.xx.xx.xx.x', snare: '...x.....x..', kick: 'x.....x.....' };
const JAZZ = { ride: 'x..x.xx..x.x', phat: '...x.....x..', kick: 'g.....g.....' };
const FUNK = { hat: 'x.x.x.x.x.x.x.x.', snare: '....X..g.g..X..g', kick: 'x.....x...x..x..' };
const OPEN_HAT = { hat: 'x.x.x...x.x.x...', ohat: '......x.......x.', snare: '....x.......x...', kick: 'x.......x.......' };
const LINEAR = { hat: 'x...x...x...x...', snare: '..x.......x.....', kick: '.x.x..x..x.x..x.' };
const ONEDROP = { hat: 'x.x.x.x.x.x.x.x.', rim: '........X.......', kick: '........x.......' };
const BOSSA = { hat: 'x.x.x.x.x.x.x.x.', rim: 'x..x..x...x..x..', kick: 'x..xx..xx..xx..x' };
const WALTZ = { hat: 'x.x.x.x.x.x.', snare: '....x...x...', kick: 'x...........' };
const L = (id, title, s) => ({ id, title, review: s.review, steps: { hear: s.hear, learn: { cards: s.cards }, see: s.see, try: { view: [0, 9], tasks: s.tasks }, play: { name: 'Play it', ...s.play }, check: { pass: 3, view: [0, 9], questions: s.questions } } });
const seeIt = (text, sequence, bpm = 160) => ({ text, view: [0, 9], sequence, bpm });
const ear = (prompt, parts, options, answer, item, opts = {}) => choice(prompt, options, answer, item, { sound: kit(parts, opts.bpm || 90, 2, opts.grid ? { sub: 3 } : {}) });

export const level4 = {
  id: 'drums-level-4', title: 'Triplets, swing and shuffle',
  lessons: [
    L('d4-1', 'Eighth-note triplets: 1 trip let', { review: ['count:triplets'],
      hear: { text: 'Triplets on the snare: three even notes per beat.', sound: kit({ snare: 'xxxxxxxxxxxx' }, 70, 1, { sub: 3 }) },
      cards: [dgrid('A triplet splits a beat into three. Count "1 trip let, 2 trip let".', T12, { sub: 3 }), dgrid('Accent the first of each three to feel the beat.', [0, 3, 6, 9], { sub: 3 }),
        { text: 'Play triplets hand to hand: R L R, L R L. The lead hand switches every beat.', board: board(pads(['snare'], { snare: 'RLR' })) }],
      see: seeIt('Triplets: R L R L R L.', seq(['snare', 'snare', 'snare', 'snare', 'snare', 'snare']), 210),
      tasks: [dgridTask('Tap triplets on beats 1 and 2.', [0, 1, 2, 3, 4, 5], { sub: 3, item: 'count:triplets' }), dgridTask('Tap only the beats.', [0, 3, 6, 9], { sub: 3 }), task('Tap the drum to practise triplets on: the snare.', 'snare')],
      play: play('Play triplets on the snare with the click, R L R L R L, accenting each beat.', { snare: 'xxxxxxxxxxxx' }, { bpm: 60, bars: 2, opts: { sub: 3 } }),
      questions: [choice('How many triplet eighths are in one beat?', ['3', '2', '4'], '3', 'fact:triplets-per-beat'),
        choice('How do you count triplets?', ['1 trip let', '1 e & a', '1 & 2 &'], '1 trip let', 'count:triplets'),
        tap('Tap the snare.', 'snare'), tap('From Level 3: tap the cymbal for a chorus, the ride.', 'ride')] }),
    L('d4-2', 'Straight and swung eighths', { review: ['feel-ear:swing'],
      hear: { text: 'Straight eighths, then swung: long-short, long-short.', sound: kit({ ride: 'x.x.x.x.x.x.x.x.' }, 90, 1) },
      cards: [dgrid('Straight eighths split the beat in half: even.', E8, { piece: 'ride' }), dgrid('Swung eighths play the first and last notes of a triplet: long, short.', [0, 2, 3, 5, 6, 8, 9, 11], { piece: 'ride', sub: 3 }),
        { text: 'Swing is a feel, often written as straight eighths with "swing" at the top.', board: board(pads(['ride'], { ride: 'swing' })) }],
      see: seeIt('Swung eighths on the ride.', seq(['ride', 'ride', 'ride', 'ride']), 120),
      tasks: [dgridTask('Tap swung eighths for beats 1 and 2 (on the triplet grid).', [0, 2, 3, 5], { sub: 3, piece: 'ride' }), task('Tap the cymbal for swing time: the ride.', 'ride'), dgridTask('Now straight eighths for comparison.', [0, 2, 4, 6], { piece: 'ride' })],
      play: play('Play swung eighths on the ride: "doo-ba doo-ba".', { ride: 'x.xx.xx.xx.x' }, { bpm: 80, opts: { sub: 3 } }),
      questions: [ear('Listen: straight or swung?', { ride: 'x.xx.xx.xx.x' }, ['Swung', 'Straight'], 'Swung', 'feel-ear:swing', { grid: true }),
        ear('And this one?', { ride: 'x.x.x.x.x.x.x.x.' }, ['Straight', 'Swung'], 'Straight', 'feel-ear:straight'),
        tap('Tap the ride.', 'ride'), tap('From Lesson 1: tap the drum for triplets, the snare.', 'snare')] }),
    L('d4-3', 'The shuffle', { review: ['groove-ear:shuffle'],
      hear: { text: 'A shuffle: swung ride, backbeat, kick on 1 and 3.', sound: kit(SHUF, 96, 2, { sub: 3 }) },
      cards: [dgrid('The shuffle swings every eighth: right hand on the ride or hi-hat, long-short.', [0, 2, 3, 5, 6, 8, 9, 11], { piece: 'ride', sub: 3 }), dgrid('Add the backbeat on 2 and 4.', [3, 9], { sub: 3 }), dgrid('Add the kick on 1 and 3.', [0, 6], { piece: 'kick', sub: 3 })],
      see: seeIt('The shuffle, eighth by eighth.', seq([['ride', 'kick'], 'ride', ['ride', 'snare'], 'ride', ['ride', 'kick'], 'ride', ['ride', 'snare'], 'ride']), 190),
      tasks: [dgridTask('Tap the shuffle ride pattern.', [0, 2, 3, 5, 6, 8, 9, 11], { sub: 3, piece: 'ride' }), dgridTask('Tap the backbeat.', [3, 9], { sub: 3 }), task('Tap the drum on 1 and 3: the kick.', 'kick')],
      play: play('Play the shuffle slowly. Then try "12-Bar Shuffle" in Practice → Play-along.', SHUF, { bpm: 75, opts: { sub: 3 } }),
      questions: [ear('Listen: which groove is this?', SHUF, ['Shuffle', 'Rock 8ths', 'Funk'], 'Shuffle', 'groove-ear:shuffle', { grid: true }),
        tap('Tap the cymbal for the shuffle pattern: the ride.', 'ride'), tap('From Lesson 2: tap the cymbal for swing time, the ride.', 'ride'),
        choice('A shuffle uses…', ['Swung eighths', 'Straight sixteenths', 'Only quarter notes'], 'Swung eighths', 'fact:shuffle-swung')] }),
    L('d4-4', '12/8 and 6/8 feel', {
      hear: { text: 'A 6/8 groove: two big beats, each split in three.', sound: kit({ hat: 'xxxxxx', snare: '...x..', kick: 'x.....' }, 66, 2, { beats: 2, sub: 3 }) },
      cards: [{ text: '6/8 has six eighth notes per bar, felt as two beats of three: "1 2 3 4 5 6".', board: board(pads(['hat', 'snare', 'kick'])) },
        dgrid('Kick on 1, snare on 4: the classic 6/8 groove.', [0, 1, 2, 3, 4, 5], { piece: 'hat', sub: 3, beats: 2 }),
        { text: '12/8 is the same feel over four beats: twelve eighths, counted in threes.', board: board(pads(['hat'])) }],
      see: seeIt('6/8: kick on 1, snare on 4.', seq([['hat', 'kick'], 'hat', 'hat', ['hat', 'snare'], 'hat', 'hat']), 180),
      tasks: [dgridTask('Tap where the snare goes in 6/8 (count 4).', [3], { sub: 3, beats: 2 }), dgridTask('Tap where the kick goes (count 1).', [0], { sub: 3, beats: 2, piece: 'kick' }), task('Tap the cymbal playing all six eighths: the hi-hat.', 'hat')],
      play: play('Play the 6/8 groove: hi-hat on every eighth, kick on 1, snare on 4. Try "Six-Eight Sway" in Play-along.', { hat: 'xxxxxx', snare: '...x..', kick: 'x.....' }, { bpm: 60, opts: { beats: 2, sub: 3 } }),
      questions: [choice('6/8 is felt as…', ['Two beats of three', 'Six even beats', 'Three beats of two'], 'Two beats of three', 'fact:six-eight-feel'),
        choice('How many eighth notes in a bar of 12/8?', ['12', '8', '6'], '12', 'fact:twelve-eight'),
        tap('Tap the drum on count 4 of 6/8: the snare.', 'snare'), tap('From Lesson 3: tap the drum on 1 and 3 in the shuffle, the kick.', 'kick')] }),
    L('d4-5', 'Triplet fills', {
      hear: { text: 'A one-beat triplet fill down the toms, then the crash.', sound: kit({ ride: 'x.xx.xx.x...', snare: '...x.....xxx', kick: 'x.....x.....' }, 90, 2, { sub: 3 }) },
      cards: [dgrid('A triplet fill: three notes per beat. Count "4 trip let", then land on 1.', [9, 10, 11], { sub: 3 }),
        { text: 'Move it round the toms: snare, high tom, floor tom.', board: board(pads(['snare', 'tom1', 'tom3'])) },
        { text: 'Triplet fills suit shuffles and 12/8; they keep the swing going.', board: board(pads(['crash', 'kick'])) }],
      see: seeIt('Snare, high tom, floor tom, crash.', seq(['snare', 'tom1', 'tom3', ['crash', 'kick']]), 200),
      tasks: [dgridTask('Tap a one-beat triplet fill on beat 4.', [9, 10, 11], { sub: 3 }), task('Tap the middle drum of the fill: the high tom.', 'tom1'), task('Tap the last drum of the fill: the floor tom.', 'tom3')],
      play: play('Play three bars of shuffle and a triplet fill on beat 4.', { ride: 'x.xx.xx.x...', snare: '...x.....xxx', kick: 'x.....x.....' }, { bpm: 70, opts: { sub: 3 } }),
      questions: [choice('A one-beat triplet fill has how many notes?', ['3', '4', '2'], '3', 'fact:triplet-fill-notes'),
        tap('Tap the high tom.', 'tom1'), tap('From Lesson 4: tap the drum on count 4 in 6/8, the snare.', 'snare'),
        choice('Triplet fills fit best in…', ['Shuffles and 12/8', 'Straight 16th funk', 'Only ballads'], 'Shuffles and 12/8', 'fact:triplet-fill-fit')] }),
    L('d4-6', 'Jazz ride pattern with the hi-hat foot', { review: ['groove-ear:jazz'],
      hear: { text: 'The jazz ride pattern: "ding, ding-a-ding", with the hi-hat foot on 2 and 4.', sound: kit(JAZZ, 120, 2, { sub: 3 }) },
      cards: [dgrid('Ride: 1, 2, the "let" of 2, 3, 4, the "let" of 4 (swung).', [0, 3, 5, 6, 9, 11], { piece: 'ride', sub: 3 }), dgrid('Left foot closes the hi-hat on 2 and 4.', [3, 9], { piece: 'phat', sub: 3 }),
        { text: 'The kick "feathers" very softly on each beat, felt more than heard.', board: board(pads(['ride', 'phat', 'kick'])) }],
      see: seeIt('Ride pattern with the hi-hat foot.', seq(['ride', ['ride', 'phat'], 'ride', 'ride', ['ride', 'phat'], 'ride']), 160),
      tasks: [dgridTask('Tap the jazz ride pattern.', [0, 3, 5, 6, 9, 11], { sub: 3, piece: 'ride' }), dgridTask('Tap the hi-hat foot.', [3, 9], { sub: 3, piece: 'phat' }), task('Tap the foot that plays the hi-hat: the hi-hat foot.', 'phat')],
      play: play('Play the ride pattern and the hi-hat foot on 2 and 4. Try the Walking swing groove in the metronome too.', JAZZ, { bpm: 90, opts: { sub: 3 } }),
      questions: [ear('Listen: which groove is this?', JAZZ, ['Jazz ride', 'Shuffle', 'Rock'], 'Jazz ride', 'groove-ear:jazz', { grid: true, bpm: 120 }),
        tap('Tap the hi-hat foot.', 'phat'), tap('From Lesson 5: tap the high tom.', 'tom1'),
        choice('In jazz the hi-hat foot plays on…', ['2 and 4', '1 and 3', 'Every beat'], '2 and 4', 'fact:jazz-hat-2-4')] }),
    L('d4-7', 'Straight, swing or triplets by ear', { review: ['feel-ear:triplets'],
      hear: { text: 'Straight eighths, swung eighths, then full triplets.', sound: kit({ hat: 'x.x.x.x.x.x.x.x.' }, 90, 1) },
      cards: [{ text: 'Straight eighths are even, two per beat.', board: board(pads(['hat'])) }, { text: 'Swing has two per beat, long-short. Triplets have three per beat, even.', board: board(pads(['ride'])) },
        tech('Tap your foot on the beat and count along to tell them apart.', ['Count "1 &" for straight', 'Count "1 – let" for swing', 'Count "1 trip let" for triplets'])],
      see: seeIt('Triplets on the ride.', seq(['ride', 'ride', 'ride', 'ride', 'ride', 'ride']), 210),
      tasks: [dgridTask('Tap triplets for one beat.', [0, 1, 2], { sub: 3, piece: 'ride' }), dgridTask('Tap swung eighths for one beat.', [0, 2], { sub: 3, piece: 'ride' }), task('Tap the cymbal you have been listening to: the ride.', 'ride')],
      play: play('Switch between straight eighths and a shuffle every two bars, starting with the shuffle.', SHUF, { bpm: 80, opts: { sub: 3 } }),
      questions: [ear('Straight, swung or triplets?', { ride: 'xxxxxxxxxxxx' }, ['Triplets', 'Swung', 'Straight'], 'Triplets', 'feel-ear:triplets', { grid: true }),
        ear('And this?', { ride: 'x.xx.xx.xx.x' }, ['Swung', 'Straight', 'Triplets'], 'Swung', 'feel-ear:swing', { grid: true }),
        tap('Tap the ride.', 'ride'), tap('From Lesson 6: tap the hi-hat foot.', 'phat')] })
  ],
  challenge: { id: 'd4-ch', title: 'Level 4 Challenge', challenge: true, flow: [
    { type: 'drumplay', name: '12-bar shuffle', text: 'Play a 12-bar blues shuffle with a fill in bar 12 (Practice → Play-along "12-Bar Shuffle" has the backing), then switch to straight eighths on cue.', groove: { beats: 4, sub: 3, bars: 1, hits: { ride: [0, 2, 3, 5, 6, 8, 9, 11], snare: [3, 9], kick: [0, 6] } }, bpm: 80, bars: 4 },
    { type: 'check', name: 'Check it', pass: 3, view: [0, 9], questions: [
      ear('Straight or swung?', { ride: 'x.xx.xx.xx.x' }, ['Swung', 'Straight'], 'Swung', 'feel-ear:swing', { grid: true }),
      choice('6/8 is felt as…', ['Two beats of three', 'Six even beats', 'Three beats of two'], 'Two beats of three', 'fact:six-eight-feel'),
      tap('Tap the hi-hat foot.', 'phat'), tap('Tap the ride.', 'ride')] }
  ] },
  placement: [
    choice('How do you count triplets?', ['1 trip let', '1 e & a', '1 & 2 &'], '1 trip let', 'count:triplets'),
    ear('Listen: straight or swung?', { ride: 'x.xx.xx.xx.x' }, ['Swung', 'Straight'], 'Swung', 'feel-ear:swing', { grid: true }),
    tap('Tap the foot that closes the hi-hat on 2 and 4 in jazz.', 'phat')
  ]
};

export const level5 = {
  id: 'drums-level-5', title: 'Coordination and independence',
  lessons: [
    L('d5-1', 'The hi-hat foot under the hands', {
      hear: { text: 'A ride groove with the hi-hat foot on every beat.', sound: kit({ ride: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.......', phat: 'x...x...x...x...' }, 80, 2) },
      cards: [dgrid('Four limbs: ride (R), snare (L), kick (RF) and hi-hat foot (LF) on every beat.', [0, 4, 8, 12], { piece: 'phat' }),
        tech('Add one limb at a time.', ['Hands alone: ride and backbeat', 'Add the kick on 1 and 3', 'Add the hi-hat foot on every beat, slowly']),
        { text: 'Independence means each limb keeps its own pattern while the others play theirs.', board: board(pads(['ride', 'snare', 'kick', 'phat'])) }],
      see: seeIt('All four limbs on beat 1, then the backbeat.', seq([['ride', 'kick', 'phat'], 'ride', ['ride', 'snare', 'phat'], 'ride']), 160),
      tasks: [dgridTask('Tap the hi-hat foot on every beat.', [0, 4, 8, 12], { piece: 'phat' }), task('Tap the limb-pad played by the left foot: the hi-hat foot.', 'phat'), task('Tap the cymbal the right hand plays here: the ride.', 'ride')],
      play: play('Play the ride groove and add the hi-hat foot on every beat.', { ride: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.......', phat: 'x...x...x...x...' }, { bpm: 65 }),
      questions: [choice('Independence means…', ['Each limb keeps its own pattern', 'All limbs play together', 'Playing only with hands'], 'Each limb keeps its own pattern', 'fact:independence'),
        tap('Tap the hi-hat foot.', 'phat'), tap('From Level 4: tap the cymbal for the jazz ride pattern, the ride.', 'ride'),
        choice('How many limbs play in a four-way groove?', ['4', '3', '2'], '4', 'fact:four-limbs')] }),
    L('d5-2', 'Reading kick rhythms under a hand pattern', { review: ['count:kick-reading'],
      hear: { text: 'The hands stay the same; the kick reads a new rhythm each bar.', sound: kit({ hat: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x..x..x...x.....' }, 80, 2) },
      cards: [dgrid('Keep hi-hat eighths and backbeat fixed. Read only the kick line.', [0, 3, 6, 10], { piece: 'kick', snare: [4, 12] }),
        { text: 'Read the kick out loud first ("1, a, & of 2, & of 3"), then play it under the hands.', board: board(pads(['kick'])) },
        dgrid('A harder one: kick on the "e" of 2 and the "a" of 3.', [0, 5, 11], { piece: 'kick', snare: [4, 12] })],
      see: seeIt('Kick reading under the rock hands.', seq([['hat', 'kick'], 'hat', ['hat', 'snare'], ['hat', 'kick']]), 140),
      tasks: [dgridTask('Tap this kick line: 1, the "a" of 1, the & of 2, the & of 3.', [0, 3, 6, 10], { piece: 'kick', item: 'count:kick-reading' }), dgridTask('Tap: 1, the "e" of 2, the "a" of 3.', [0, 5, 11], { piece: 'kick' }), task('Tap the drum you are reading: the kick.', 'kick')],
      play: play('Keep the hands steady and play the kick line 1, a of 1, & of 2, & of 3.', { hat: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x..x..x...x.....' }, { bpm: 60 }),
      questions: [choice('When reading kick lines, the hands…', ['Keep the same pattern', 'Copy the kick', 'Stop'], 'Keep the same pattern', 'fact:kick-reading'),
        tap('Tap the kick.', 'kick'), tap('From Lesson 1: tap the hi-hat foot.', 'phat'),
        choice('The "a" of 1 is which sixteenth?', ['The 4th of beat 1', 'The 2nd of beat 1', 'Beat 2'], 'The 4th of beat 1', 'fact:a-fourth-sixteenth')] }),
    L('d5-3', 'Syncopation and accented eighths', { review: ['count:syncopated'],
      hear: { text: 'Accents off the beat: on the "&"s.', sound: kit({ snare: 'x.X.x.X.x.X.x.X.' }, 90, 1) },
      cards: [dgrid('Syncopation puts weight off the beat, on an "&" or "e"/"a".', [2, 6, 10, 14]), dgrid('Read accents on eighths: play every eighth, accent the marked ones.', [0, 3, 6, 10, 12]),
        { text: 'Played on the crash and kick, accents become band "hits".', board: board(pads(['crash', 'kick'])) }],
      see: seeIt('Accents on the "&"s.', seq(['snare', 'snare', 'snare', 'snare']), 180),
      tasks: [dgridTask('Tap the syncopated rhythm: 1, a of 1, & of 2, & of 3, 4.', [0, 3, 6, 10, 12], { item: 'count:syncopated' }), dgridTask('Tap only the "&"s.', [2, 6, 10, 14]), task('Tap the cymbal for band hits: the crash.', 'crash')],
      play: play('Play eighths on the snare, accenting the "&"s.', { snare: 'x.X.x.X.x.X.x.X.' }, { bpm: 70 }),
      questions: [choice('Syncopation means…', ['Weight off the beat', 'Very fast notes', 'No accents'], 'Weight off the beat', 'fact:syncopation'),
        tap('Tap the crash.', 'crash'), tap('From Lesson 2: tap the drum you read under the hands, the kick.', 'kick'),
        choice('An accent (>) means…', ['Play that note louder', 'Play it shorter', 'Skip it'], 'Play that note louder', 'fact:accent')] }),
    L('d5-4', 'Ghost notes in funk grooves', { review: ['groove-ear:funk'],
      hear: { text: 'A funk groove: loud backbeat, ghost notes in between.', sound: kit(FUNK, 92, 2) },
      cards: [dgrid('Funk adds ghost notes on the snare around the backbeat: here the "a" of 2 and the "e" of 3.', [4, 7, 9, 12, 15]),
        tech('Ghosts come from very low sticks.', ['Play the backbeat from 25–30 cm', 'Play ghosts from 2–3 cm', 'Keep the hi-hat steady through it']),
        dgrid('The kick syncopates too: 1, the & of 2, the & of 3 and the "a" of 3.', [0, 6, 10, 13], { piece: 'kick' })],
      see: seeIt('Funk: backbeat and ghost notes.', seq([['hat', 'kick'], 'hat', ['hat', 'snare'], ['hat', 'snare']]), 120),
      tasks: [dgridTask('Tap the ghost notes and backbeats on the snare.', [4, 7, 9, 12, 15]), dgridTask('Tap the funk kick.', [0, 6, 10, 13], { piece: 'kick' }), task('Tap the drum for ghost notes: the snare.', 'snare')],
      play: play('Play the funk groove slowly; keep ghosts very soft. Try "Ghost Note Funk" in Play-along.', FUNK, { bpm: 60 }),
      questions: [ear('Listen: which groove is this?', FUNK, ['Funk', 'Shuffle', 'Bossa'], 'Funk', 'groove-ear:funk', { bpm: 92 }),
        tap('Tap the snare.', 'snare'), tap('From Lesson 3: tap the cymbal for hits, the crash.', 'crash'),
        choice('Ghost notes are played…', ['Very softly', 'Loudly', 'On the crash'], 'Very softly', 'fact:ghost-note')] }),
    L('d5-5', 'Open and closed hi-hat', {
      hear: { text: 'Closed hi-hat, with an open "tsss" on the & of 2 and the & of 4.', sound: kit(OPEN_HAT, 90, 2) },
      cards: [{ text: 'Open the hi-hat by lifting the left foot; close it by pressing down. Written as o (open) and + (closed).', board: board(pads(['hat', 'ohat', 'phat'])) },
        dgrid('Open on the "&" of 2 and 4; close it with the foot on the next beat.', [6, 14], { piece: 'ohat' }),
        tech('Open and close in time.', ['Play hat eighths with the foot pressed', 'Lift the foot as you hit the & of 2', 'Press it down again exactly on beat 3'], 'pedal')],
      see: seeIt('Closed, closed, closed, open.', seq(['hat', 'hat', 'hat', 'ohat']), 160),
      tasks: [dgridTask('Tap where the hi-hat opens.', [6, 14], { piece: 'ohat' }), task('Tap the open hi-hat.', 'ohat'), task('Tap the foot that opens and closes it: the hi-hat foot.', 'phat')],
      play: play('Play the open hi-hat groove: open on the & of 2 and 4, close on 3 and 1.', OPEN_HAT, { bpm: 70 }),
      questions: [choice('How do you open the hi-hat?', ['Lift the left foot', 'Press the left foot', 'Hit it harder'], 'Lift the left foot', 'fact:open-hat'),
        tap('Tap the open hi-hat.', 'ohat'), tap('From Lesson 4: tap the drum for ghost notes, the snare.', 'snare'),
        choice('An "o" over a hi-hat note means…', ['Open', 'Off', 'One'], 'Open', 'fact:hat-o')] }),
    L('d5-6', 'Linear patterns', {
      hear: { text: 'A linear groove: no two limbs ever play at the same time.', sound: kit(LINEAR, 85, 2) },
      cards: [dgrid('In a linear pattern each sixteenth has one sound only: hat, kick or snare.', [0, 4, 8, 12], { piece: 'hat' }),
        { text: 'It sounds busy but each limb plays little. Learn it as one line: H K S K…', board: board(pads(['hat', 'kick', 'snare'])) },
        dgrid('The kick fills most of the gaps here.', [1, 3, 6, 9, 11, 14], { piece: 'kick' })],
      see: seeIt('Hat, kick, snare, kick… one at a time.', seq(['hat', 'kick', 'snare', 'kick', 'hat', null, 'kick', null]), 300),
      tasks: [dgridTask('Tap the hi-hat notes of the linear pattern.', [0, 4, 8, 12], { piece: 'hat' }), dgridTask('Tap the snare notes.', [2, 10]), task('Tap the drum that fills most of the gaps: the kick.', 'kick')],
      play: play('Play the linear pattern very slowly, saying "hat kick snare kick".', LINEAR, { bpm: 50 }),
      questions: [choice('In a linear pattern…', ['No two limbs play at once', 'All limbs play together', 'Only cymbals play'], 'No two limbs play at once', 'fact:linear'),
        tap('Tap the kick.', 'kick'), tap('From Lesson 5: tap the open hi-hat.', 'ohat'),
        choice('Linear grooves are learned best…', ['As one line, slowly', 'At full speed first', 'With the eyes closed only'], 'As one line, slowly', 'fact:linear-learn')] }),
    L('d5-7', 'Other meters: 3/4, then 5/4 and 7/8', {
      hear: { text: 'A 3/4 groove: three beats per bar.', sound: kit(WALTZ, 100, 2, { beats: 3 }) },
      cards: [dgrid('3/4 has three beats per bar: kick on 1, snare on 2 and 3.', [0], { piece: 'kick', beats: 3 }),
        { text: '5/4 has five beats, often felt as 3 + 2. 7/8 has seven eighths, felt as 2 + 2 + 3.', board: board(pads(['kick', 'snare'])) },
        tech('Count every bar out loud until the odd meter feels natural.', ['Count "1 2 3" for 3/4', 'Count "1 2 3 1 2" for 5/4', 'Count "1 2 1 2 1 2 3" for 7/8'])],
      see: seeIt('3/4: kick, snare, snare.', seq(['kick', 'snare', 'snare', 'kick', 'snare', 'snare']), 110),
      tasks: [dgridTask('Tap the snare in a 3/4 bar.', [4, 8], { beats: 3 }), dgridTask('Tap the kick in a 3/4 bar.', [0], { piece: 'kick', beats: 3 }), task('Tap the drum on beat 1 of 3/4: the kick.', 'kick')],
      play: play('Play the 3/4 groove for 8 bars, counting "1 2 3".', WALTZ, { bpm: 80, bars: 8, opts: { beats: 3 } }),
      questions: [choice('How many beats are in a bar of 3/4?', ['3', '4', '6'], '3', 'fact:three-four'),
        choice('7/8 is often felt as…', ['2 + 2 + 3', '4 + 3 + 1', '7 even beats'], '2 + 2 + 3', 'fact:seven-eight'),
        tap('Tap the kick.', 'kick'), tap('From Lesson 6: tap the drum that fills the gaps in the linear pattern, the kick.', 'kick')] })
  ],
  challenge: { id: 'd5-ch', title: 'Level 5 Challenge', challenge: true, flow: [
    { type: 'drumplay', name: 'Kick reading', text: 'Sight-read syncopated kick rhythms under hi-hat and snare: this line, then make up your own for 8 bars.', groove: { beats: 4, sub: 4, bars: 1, hits: { hat: E8, snare: [4, 12], kick: [0, 3, 6, 10, 13] } }, bpm: 60, bars: 4 },
    { type: 'drumplay', name: '3/4 groove', text: 'Now a 3/4 groove for 8 bars.', groove: { beats: 3, sub: 4, bars: 1, hits: { hat: [0, 2, 4, 6, 8, 10], snare: [4, 8], kick: [0] } }, bpm: 80, bars: 8 },
    { type: 'check', name: 'Check it', pass: 3, view: [0, 9], questions: [
      tap('Tap the open hi-hat.', 'ohat'), tap('Tap the foot that opens the hi-hat.', 'phat'),
      choice('In a linear pattern…', ['No two limbs play at once', 'All limbs play together', 'Only cymbals play'], 'No two limbs play at once', 'fact:linear'),
      choice('How many beats are in a bar of 3/4?', ['3', '4', '6'], '3', 'fact:three-four')] }
  ] },
  placement: [
    choice('Independence means…', ['Each limb keeps its own pattern', 'All limbs play together', 'Playing only with hands'], 'Each limb keeps its own pattern', 'fact:independence'),
    ear('Listen: which groove is this?', FUNK, ['Funk', 'Shuffle', 'Bossa'], 'Funk', 'groove-ear:funk', { bpm: 92 }),
    tap('Tap the open hi-hat.', 'ohat')
  ]
};

export const level6 = {
  id: 'drums-level-6', title: 'Time, feel and your own parts',
  lessons: [
    L('d6-1', 'Internal time: gap click and fading click', {
      hear: { text: 'Two bars of click, then two bars of silence: keep the beat in your head.', sound: kit({ rim: 'x...x...x...x...' }, 80, 2) },
      cards: [{ text: 'Good time lives in you, not the click. A gap click goes silent for bars so you can check.', board: board(pads(['snare'])) },
        { text: 'A fading click gets quieter until it is gone. Keep playing at the same tempo.', board: board(pads(['hat'])) },
        tech('Feel the beat in your body.', ['Count out loud through the silent bars', 'Nod or tap your foot on every beat', 'Notice if you speed up when the click stops'])],
      see: seeIt('Hi-hat quarters with the click, then without.', seq(['hat', 'hat', 'hat', 'hat']), 80),
      tasks: [dgridTask('Tap the beats you keep through a silent bar.', [0, 4, 8, 12], { piece: 'hat' }), task('Tap the cymbal to keep time on: the hi-hat.', 'hat'), task('Tap the drum for the backbeat under it: the snare.', 'snare')],
      play: play('Play the rock beat; then open Practice → Drills → Internal time for the gap and fading click, scored in the silent bars.', { hat: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.......' }, { bpm: 80, bars: 4 }),
      questions: [choice('A gap click…', ['Goes silent for some bars', 'Gets faster', 'Plays only on 1'], 'Goes silent for some bars', 'fact:gap-click'),
        tap('Tap the hi-hat.', 'hat'), tap('From Level 5: tap the open hi-hat.', 'ohat'),
        choice('When the click stops, most players tend to…', ['Speed up', 'Slow down a lot', 'Stay perfect'], 'Speed up', 'fact:rush-without-click')] }),
    L('d6-2', 'Tempo control: no rushing fills; tempo ladders', {
      hear: { text: 'A fill played steady, landing exactly on 1.', sound: kit({ hat: 'x.x.x.x.x.x.....', snare: '....x.......xxxx', kick: 'x.......x.......' }, 80, 2) },
      cards: [{ text: 'Fills tempt you to rush. Count the fill: "4 e & a, 1", and land exactly on the crash.', board: board(pads(['snare', 'crash'])) },
        { text: 'A tempo ladder goes up a few bpm after each clean pass, and back down after a sloppy one.', board: board(pads(['snare'])) },
        tech('Climb a ladder, then come back down.', ['Start 10 bpm below comfortable', 'Go up 4 bpm after each clean pass', 'Finish slow again'])],
      see: seeIt('A steady fill into the crash.', seq(['snare', 'snare', 'snare', 'snare', ['crash', 'kick']]), 240),
      tasks: [dgridTask('Tap the fill on beat 4.', [12, 13, 14, 15]), task('Tap where the fill lands: the crash.', 'crash'), task('Tap the drum for the fill: the snare.', 'snare')],
      play: play('Play groove + fill at a tempo ladder: start slow and go up 4 bpm each clean pass.', { hat: 'x.x.x.x.x.x.....', snare: '....x.......xxxx', kick: 'x.......x.......' }, { bpm: 60, bars: 4 }),
      questions: [choice('After a sloppy pass on a tempo ladder you…', ['Go back down', 'Go up anyway', 'Stop'], 'Go back down', 'fact:ladder-down'),
        tap('Tap the crash.', 'crash'), tap('From Lesson 1: tap the cymbal to keep time on, the hi-hat.', 'hat'),
        choice('The usual place to rush is…', ['Fills', 'Long notes', 'Rests'], 'Fills', 'fact:fills-rush')] }),
    L('d6-3', 'On top of or behind the beat, lightly', {
      hear: { text: 'The same groove, right on the beat.', sound: kit({ hat: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.......' }, 85, 2) },
      cards: [{ text: 'Playing a hair early feels urgent; a hair late feels laid back. "A hair" means 10–20 ms.', board: board(pads(['snare'])) },
        { text: 'Research found big offsets make grooves worse, so only push or pull a tiny bit, on purpose.', board: board(pads(['snare', 'kick'])) },
        tech('Master "on the beat" first.', ['Check your bias in a scored run', 'Aim for a bias near 0 ms', 'Only then try leaning a little late on the snare'])],
      see: seeIt('Snare backbeat: right on 2 and 4.', seq([['hat', 'kick'], ['hat', 'snare'], ['hat', 'kick'], ['hat', 'snare']]), 85),
      tasks: [dgridTask('Tap the backbeat you will place carefully.', [4, 12]), task('Tap the drum you lean late for a laid-back feel: the snare.', 'snare'), task('Tap the drum that stays on the beat: the kick.', 'kick')],
      play: play('Play the groove and watch your bias in the result: aim for on time, then try a tiny bit late on purpose.', { hat: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.......' }, { bpm: 80, bars: 4 }),
      questions: [choice('Is a 100 ms late snare a good laid-back feel?', ['No, it is far too much', 'Yes', 'Only in funk'], 'No, it is far too much', 'fact:feel-small-offsets'),
        choice('"Bias" in your timing result means…', ['How early or late on average', 'How consistent', 'How loud'], 'How early or late on average', 'fact:bias'),
        tap('Tap the snare.', 'snare'), tap('From Lesson 2: tap the crash.', 'crash')] }),
    L('d6-4', 'Style tour: funk, pop, reggae, bossa, samba', { review: ['groove-ear:onedrop', 'groove-ear:bossa'],
      hear: { text: 'Reggae one-drop: nothing on beat 1, kick and rim on 3.', sound: kit(ONEDROP, 76, 2) },
      cards: [dgrid('One-drop: the kick and cross-stick "drop" together on beat 3 only.', [8], { piece: 'kick' }),
        dgrid('Bossa nova: a steady kick figure and a cross-stick pattern on the rim.', [0, 3, 6, 10, 13], { piece: 'rim', label: 'Cross-stick' }),
        { text: 'Samba drives eighths on the kick and hi-hat, with a busy hand pattern on top.', board: board(pads(['kick', 'hat'])) }],
      see: seeIt('Bossa: hat eighths over the kick figure.', seq([['hat', 'kick'], 'hat', 'hat', ['hat', 'kick']]), 140),
      tasks: [dgridTask('Tap the one-drop kick.', [8], { piece: 'kick' }), dgridTask('Tap the bossa cross-stick pattern.', [0, 3, 6, 10, 13], { piece: 'rim', label: 'Cross-stick' }), task('Tap the drum the cross-stick is played on: the snare.', 'snare')],
      play: play('Play the one-drop: hat eighths, kick and cross-stick together on 3. Try the styles in the groove player too.', ONEDROP, { bpm: 70 }),
      questions: [ear('Listen: which style?', ONEDROP, ['Reggae one-drop', 'Rock', 'Shuffle'], 'Reggae one-drop', 'groove-ear:onedrop', { bpm: 76 }),
        ear('And this one?', BOSSA, ['Bossa nova', 'Funk', '6/8'], 'Bossa nova', 'groove-ear:bossa', { bpm: 120 }),
        tap('Tap the kick.', 'kick'), tap('From Lesson 3: tap the drum you can lean late on, the snare.', 'snare')] }),
    L('d6-5', 'Write a part for a song form', {
      hear: { text: 'A simple part: hi-hat verse, ride chorus, fills between.', sound: kit({ ride: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.x.....' }, 95, 2) },
      cards: [{ text: 'Writing a part: pick a groove for each section, then decide where the fills go.', board: board(pads(['hat', 'ride', 'crash'])) },
        { text: 'Use the Kit tab\'s grid: tap cells to build the groove and see it as notation.', board: board(pads(['kick', 'snare', 'hat'])) },
        tech('Make the chorus lift.', ['Verse: hi-hat, simple kick', 'Chorus: ride or open hat, more kick', 'Fill in the last bar before each new section'])],
      see: seeIt('Verse hat, fill, chorus ride.', seq([['hat', 'kick'], ['hat', 'snare'], 'snare', ['crash', 'kick'], ['ride', 'kick'], ['ride', 'snare']]), 120),
      tasks: [dgridTask('Write a verse hi-hat line: eighths.', E8, { piece: 'hat' }), dgridTask('Write a chorus kick: 1, 3 and the & of 3.', [0, 8, 10], { piece: 'kick' }), task('Tap the cymbal for the chorus: the ride.', 'ride')],
      play: play('Build your part in the Kit tab grid, then play it here over 4 bars.', { ride: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.x.....' }, { bpm: 80 }),
      questions: [choice('A chorus usually feels…', ['Bigger than the verse', 'Quieter than the verse', 'Exactly the same'], 'Bigger than the verse', 'fact:chorus-lift'),
        tap('Tap the ride.', 'ride'), tap('From Lesson 4: tap the drum for the one-drop with the rim, the kick.', 'kick'),
        choice('Where do fills go in a part?', ['Before a new section', 'Every bar', 'Never'], 'Before a new section', 'fact:fills-into-sections')] }),
    L('d6-6', 'Trading fours', {
      hear: { text: 'Four bars of groove, then four bars of solo: "trading fours".', sound: kit({ snare: 'x..x..x.xx..x...', tom1: '..x.....', tom3: '.......x' }, 100, 2) },
      cards: [{ text: 'Trading fours: the band plays four bars, then you solo for four, back and forth.', board: board(pads(['snare', 'tom1', 'tom3'])) },
        { text: 'Keep the form: count the four bars of your solo and come back in on time.', board: board(pads(['crash'])) },
        tech('Answer what you heard.', ['Copy a rhythm from the previous four bars', 'Change it a little', 'End your four on beat 1 with the crash'])],
      see: seeIt('A short solo idea around the toms.', seq(['snare', 'tom1', 'tom2', 'tom3', ['crash', 'kick']]), 160),
      tasks: [dgridTask('Tap a solo rhythm: 1, the "a" of 1, & of 2, 3, & of 3.', [0, 3, 6, 8, 10]), task('Tap where your four bars end: the crash.', 'crash'), task('Tap the drum to start your solo on: the snare.', 'snare')],
      play: play('Play four bars of groove, then four bars of your own solo, and land on 1. Repeat.', { hat: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.......' }, { bpm: 85, bars: 8 }),
      questions: [choice('Trading fours means…', ['Taking turns soloing for four bars', 'Playing four times louder', 'Four drummers at once'], 'Taking turns soloing for four bars', 'fact:trading-fours'),
        tap('Tap the crash.', 'crash'), tap('From Lesson 5: tap the ride.', 'ride'),
        choice('After your four-bar solo you…', ['Come back in on time', 'Keep soloing', 'Stop the song'], 'Come back in on time', 'fact:solo-come-back')] }),
    L('d6-7', 'Kit setup and tuning basics', {
      hear: { text: 'Toms tuned apart: high, mid, low.', sound: kit({ tom1: 'x...', tom2: '....x...', tom3: '........x...' }, 80, 1) },
      cards: [tech('Set up so everything is in easy reach.', ['Sit so your thighs slope slightly down', 'Snare between your knees, a little above them', 'Hi-hat and ride reachable without stretching'], 'grip'),
        tech('Tune each tom with even tension all round.', ['Tap near each lug and listen', 'Tighten in small, equal turns', 'Space the toms apart in pitch']),
        { text: 'High tom highest, floor tom lowest: evenly spaced pitches make fills sing.', board: board(pads(['tom1', 'tom2', 'tom3'])) }],
      see: seeIt('Tom pitches high to low.', seq(['tom1', 'tom2', 'tom3']), 90),
      tasks: [task('Tap the drum tuned highest of the toms: the high tom.', 'tom1'), task('Tap the drum tuned lowest: the floor tom.', 'tom3'), task('Tap the drum between your knees: the snare.', 'snare')],
      play: play('Check your setup, then play quarter notes around the toms listening to the pitches.', { tom1: 'x...............', tom2: '....x...........', tom3: '........x.......', snare: '............x...' }, { bpm: 70 }),
      questions: [choice('When tuning a drum, tighten…', ['Evenly, in small turns', 'One lug all the way', 'Only the top lug'], 'Evenly, in small turns', 'fact:tuning-even'),
        tap('Tap the floor tom.', 'tom3'), tap('From Lesson 6: tap the crash.', 'crash'),
        choice('Where should the snare sit?', ['Between your knees, a little above them', 'Far to the right', 'Above your head'], 'Between your knees, a little above them', 'fact:snare-position')] })
  ],
  challenge: { id: 'd6-ch', title: 'Level 6 Challenge', challenge: true, flow: [
    { type: 'drumplay', name: 'Your part', text: 'Write a part for "Little Song" in the Kit grid, then play it here; switch on the Gap click in Internal time to let the click drop out every other 4 bars. Aim for 80% within ±35 ms (Normal).', groove: { beats: 4, sub: 4, bars: 1, hits: { hat: E8, snare: [4, 12], kick: [0, 8, 10] } }, bpm: 90, bars: 8 },
    { type: 'check', name: 'Check it', pass: 3, view: [0, 9], questions: [
      ear('Which style?', ONEDROP, ['Reggae one-drop', 'Rock', 'Shuffle'], 'Reggae one-drop', 'groove-ear:onedrop', { bpm: 76 }),
      choice('Trading fours means…', ['Taking turns soloing for four bars', 'Playing four times louder', 'Four drummers at once'], 'Taking turns soloing for four bars', 'fact:trading-fours'),
      tap('Tap the cymbal you land a fill on.', 'crash'), tap('Tap the lowest tom.', 'tom3')] }
  ] },
  placement: [
    choice('A gap click…', ['Goes silent for some bars', 'Gets faster', 'Plays only on 1'], 'Goes silent for some bars', 'fact:gap-click'),
    ear('Listen: which style?', ONEDROP, ['Reggae one-drop', 'Rock', 'Shuffle'], 'Reggae one-drop', 'groove-ear:onedrop', { bpm: 76 }),
    tap('Tap the drum you lean late on for a laid-back feel.', 'snare')
  ]
};
export const _D = D;
