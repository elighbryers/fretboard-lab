// Drum Levels 1-3 (docs/research-drums.md E). Rhythm, meter and form ideas are written
// instrument-free; grip, kit, stickings, grooves and fills are drum-only.
import { D, task, tap, choice, kit, seq, pads, dgrid, dgridTask, tech, board, play } from './kit.js';

const Q = [0, 4, 8, 12], E8 = [0, 2, 4, 6, 8, 10, 12, 14], S16 = [...Array(16).keys()];
const ROCK = { hat: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.......' };
const ROCK2 = { hat: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.x.....' };
const HAT16 = { hat: 'xxxxxxxxxxxxxxxx', snare: '....x.......x...', kick: 'x.......x.......' };
const PDIDDLE = { hat: 'x.xx.x..x.xx.x..', snare: '.x..x.xx.x..x.xx', kick: 'x.......x.......' };
const ROCK_SEQ = seq([['hat', 'kick'], 'hat', ['hat', 'snare'], 'hat', ['hat', 'kick'], 'hat', ['hat', 'snare'], 'hat']);

const L = (id, title, s) => ({ id, title, review: s.review, steps: { hear: s.hear, learn: { cards: s.cards }, see: s.see, try: { view: [0, 9], tasks: s.tasks }, play: { name: 'Play it', ...s.play }, check: { pass: 3, view: [0, 9], questions: s.questions } } });
const seeIt = (text, sequence, bpm = 160, dots) => ({ text, view: [0, 9], sequence, bpm, dots, link: null });

export const level1 = {
  id: 'drums-level-1', title: 'Pulse, counting and the kit',
  lessons: [
    L('d1-1', 'The kit and the limb code', {
      hear: { text: 'Kick, snare, hi-hat, toms, ride and crash, one after another.', sound: { seq: [null], kit: { beats: 8, sub: 1, hits: { kick: [0], snare: [1], hat: [2], tom1: [3], tom2: [4], tom3: [5], ride: [6], crash: [7] } }, bpm: 90, bars: 1 } },
      cards: [
        { text: 'The kick (bass drum) is played with the right foot, the snare with the left hand.', board: board(pads(['kick', 'snare'])) },
        { text: 'The hi-hat and the cymbals usually go to the right hand; the left foot works the hi-hat pedal.', board: board(pads(['hat', 'ride', 'crash', 'phat'])) },
        { text: 'Every pad shows its limb: R right hand, L left hand, RF right foot, LF left foot.', board: board(pads(['hat', 'snare', 'kick', 'phat'])) }
      ],
      see: seeIt('Around the kit: kick, snare, hi-hat, high tom, floor tom, crash.', seq(['kick', 'snare', 'hat', 'tom1', 'tom3', 'crash']), 90),
      tasks: [task('Tap the snare.', 'snare'), task('Tap the kick.', 'kick'), task('Tap the floor tom.', 'tom3')],
      play: { text: 'At your kit or on the pads: play each drum once, naming it and the limb: kick (right foot), snare (left hand), hi-hat (right hand).', type: 'drumplay', groove: { beats: 4, sub: 1, bars: 1, hits: { kick: [0], snare: [1], hat: [2], crash: [3] } }, bpm: 60, bars: 2 },
      questions: [tap('Tap the hi-hat.', 'hat'), tap('Tap the crash.', 'crash'),
        choice('Which limb plays the kick?', ['Right foot', 'Left hand', 'Left foot'], 'Right foot', 'fact:kick-right-foot'),
        choice('What does LF mean on a pad?', ['Left foot', 'Loud and fast', 'Left fill'], 'Left foot', 'fact:limb-lf')]
    }),
    L('d1-2', 'Pulse and tempo: tap with the click', {
      hear: { text: 'A click at 70 beats per minute, then 110. Tempo is how fast the pulse is.', sound: { seq: [null], kit: { beats: 4, sub: 1, hits: { rim: [0, 1, 2, 3] } }, bpm: 70, bars: 2 } },
      cards: [
        dgrid('The pulse is the steady beat you tap your foot to.', Q, { piece: 'rim', label: 'Click' }),
        { text: 'Tempo is measured in beats per minute (bpm): 60 is one a second, 120 two a second.', board: board(pads(['snare'])) },
        tech('Calibrate once per speaker or headphones, so the app knows your delay.', ['Use the Calibrate button on any Play step', 'Tap right on each click', 'Repeat it if you switch to Bluetooth headphones'], 'grip')
      ],
      see: seeIt('Quarter notes on the snare with the click.', seq(['snare', 'snare', 'snare', 'snare']), 80),
      tasks: [dgridTask('Tap the four beats of the bar.', Q), task('Tap the drum you will play the beat on: the snare.', 'snare'), dgridTask('Now only beats 1 and 3.', [0, 8])],
      play: { text: 'Play quarter notes on the snare with the click. Your timing is shown: early or late, and how steady.', type: 'drumplay', groove: { beats: 4, sub: 1, bars: 1, hits: { snare: [0, 1, 2, 3] } }, bpm: 70, bars: 4 },
      questions: [choice('120 bpm is how many beats a second?', ['2', '1', '4'], '2', 'fact:bpm-120'),
        tap('Tap the snare.', 'snare'), tap('From Lesson 1: tap the kick.', 'kick'),
        choice('What does "tempo" mean?', ['How fast the beat is', 'How loud', 'Which drum'], 'How fast the beat is', 'fact:tempo')]
    }),
    L('d1-3', 'Quarter notes, rests and 4/4', {
      review: ['count:0-4-8-12', 'count:0-8'],
      hear: { text: 'Four quarter notes, then quarters with rests on 2 and 4.', sound: kit({ snare: 'x...x...x...x...' }, 80, 1) },
      cards: [dgrid('In 4/4 there are four beats in a bar. Count "1 2 3 4".', Q), dgrid('A rest is a silent beat that still counts. Here 2 and 4 are rests.', [0, 8]),
        { text: 'The time signature 4/4 means four quarter-note beats in each bar.', board: board(pads(['snare'], { snare: '4/4' })) }],
      see: seeIt('Snare on 1 and 3, rests on 2 and 4.', seq(['snare', null, 'snare', null]), 80),
      tasks: [dgridTask('Tap quarter notes on all four beats.', Q), dgridTask('Tap beats 1 and 3 only.', [0, 8]), dgridTask('Tap beats 2 and 4 only.', [4, 12])],
      play: play('Play the snare on 1 and 3, rest on 2 and 4, counting out loud.', { snare: 'x.......x.......' }, { bpm: 70 }),
      questions: [choice('How many quarter notes fill a bar of 4/4?', ['4', '8', '2'], '4', 'fact:quarters-per-bar'),
        choice('A rest means…', ['Silence that still counts', 'Play louder', 'Stop the song'], 'Silence that still counts', 'fact:rest-meaning'),
        tap('Tap the snare.', 'snare'), tap('From Lesson 1: tap the hi-hat.', 'hat')]
    }),
    L('d1-4', 'Eighth notes: 1 & 2 &', {
      review: ['count:0-2-4-6-8-10-12-14'],
      hear: { text: 'Eighth notes on the hi-hat: two per beat.', sound: kit({ hat: 'x.x.x.x.x.x.x.x.' }, 80, 2) },
      cards: [dgrid('An eighth note is half a beat. Count "1 & 2 & 3 & 4 &".', E8, { piece: 'hat' }), dgrid('The "&" falls exactly halfway between the beats.', [0, 2, 4, 6], { piece: 'hat' }),
        { text: 'Eighth notes on the hi-hat are the backbone of most rock beats.', board: board(pads(['hat'], { hat: 'R' })) }],
      see: seeIt('Eighths on the hi-hat, counted 1 & 2 & 3 & 4 &.', seq(['hat', 'hat', 'hat', 'hat', 'hat', 'hat', 'hat', 'hat']), 160),
      tasks: [dgridTask('Tap eighth notes on the hi-hat.', E8, { piece: 'hat' }), dgridTask('Tap only the "&"s.', [2, 6, 10, 14], { piece: 'hat' }), task('Tap the drum that plays these eighths: the hi-hat.', 'hat')],
      play: play('Play eighth notes on the hi-hat with your right hand, counting "1 & 2 &".', { hat: 'x.x.x.x.x.x.x.x.' }, { bpm: 70 }),
      questions: [choice('How many eighth notes are in one beat?', ['2', '4', '1'], '2', 'fact:eighths-per-beat'),
        choice('How do you count eighth notes?', ['1 & 2 & 3 & 4 &', '1 2 3 4', '1 e & a'], '1 & 2 & 3 & 4 &', 'fact:count-eighths'),
        tap('Tap the hi-hat.', 'hat'), tap('From Lesson 3: tap the drum you played on 1 and 3, the snare.', 'snare')]
    }),
    L('d1-5', 'Grip, strokes and the kick', {
      hear: { text: 'Full strokes on the snare: let the stick bounce back up.', sound: kit({ snare: 'x...x...x...x...' }, 70, 1) },
      cards: [
        tech('Hold the stick about a third of the way up, between thumb and first finger; the other fingers wrap loosely.', ['Find the balance point where the stick bounces most', 'Thumbs face each other or up, not stiff', 'Keep a small gap in your palm'], 'grip'),
        tech('A full stroke starts high, hits, and lets the stick rebound back up.', ['Start the tip about 30 cm above the drum', 'Throw it down and let it bounce up', 'Catch it at the top, ready for the next one'], 'grip'),
        tech('Kick heel-down: your heel stays on the pedal plate and your ankle does the work.', ['Rest your whole foot on the pedal', 'Lift the toes and press down from the ankle', 'Let the beater come back off the head'], 'pedal')
      ],
      see: seeIt('Snare full strokes, then the kick on each beat.', seq(['snare', 'snare', 'snare', 'snare', 'kick', 'kick', 'kick', 'kick']), 80),
      tasks: [task('Tap the drum the full strokes are played on: the snare.', 'snare'), task('Tap the drum the heel-down foot plays: the kick.', 'kick'), task('Tap the drum the other foot plays: the hi-hat foot.', 'phat')],
      play: play('Play four full strokes on the snare, then four kicks heel-down, with the click.', { snare: 'x...x...........', kick: '........x...x...' }, { bpm: 60 }),
      questions: [choice('After a full stroke the stick should…', ['Rebound back up', 'Stay on the drum', 'Be pressed into the head'], 'Rebound back up', 'fact:full-stroke'),
        choice('In heel-down kick playing, the heel…', ['Stays on the pedal', 'Lifts high', 'Is off the pedal'], 'Stays on the pedal', 'fact:heel-down'),
        tap('Tap the kick.', 'kick'), tap('From Lesson 4: tap the drum for eighth notes, the hi-hat.', 'hat')]
    }),
    L('d1-6', 'Your first rock beat, one limb at a time', {
      review: ['groove-ear:rock'],
      hear: { text: 'The rock beat: hi-hat eighths, snare on 2 and 4, kick on 1 and 3.', sound: kit(ROCK, 80, 2) },
      cards: [dgrid('Start with the right hand: eighth notes on the hi-hat.', E8, { piece: 'hat' }), dgrid('Add the left hand: snare on beats 2 and 4. That is the backbeat.', [4, 12], { piece: 'snare' }),
        dgrid('Add the right foot: kick on beats 1 and 3, together with the hi-hat.', [0, 8], { piece: 'kick' })],
      see: seeIt('All three limbs together, one eighth at a time.', ROCK_SEQ, 160),
      tasks: [dgridTask('Tap where the snare goes.', [4, 12]), dgridTask('Tap where the kick goes.', [0, 8], { piece: 'kick' }), task('Tap the drum that plays every eighth: the hi-hat.', 'hat')],
      play: play('Play the rock beat: hat eighths, snare on 2 and 4, kick on 1 and 3. Start slow.', ROCK, { bpm: 60 }),
      questions: [choice('In the basic rock beat, the snare plays on…', ['2 and 4', '1 and 3', 'Every eighth'], '2 and 4', 'fact:backbeat'),
        choice('Listen. Is this the rock beat?', ['Yes', 'No, it is a shuffle'], 'Yes', 'groove-ear:rock', { sound: kit(ROCK, 90, 2) }),
        tap('Tap the drum on 1 and 3: the kick.', 'kick'), tap('From Lesson 5: tap the drum you play heel-down, the kick.', 'kick')]
    }),
    L('d1-7', 'Reading the drum staff', {
      review: ['staff:drum@kick', 'staff:drum@snare', 'staff:drum@hat'],
      hear: { text: 'The rock beat again: now read it on the staff.', sound: kit(ROCK, 80, 1) },
      cards: [
        { text: 'Drum notation uses one staff. The kick sits in the bottom space, the snare in the third space.', board: board(pads(['kick', 'snare'], { kick: 'bottom', snare: '3rd sp' })) },
        { text: 'Cymbals use x noteheads above the staff: hi-hat just above the top line.', board: board(pads(['hat', 'ride', 'crash'], { hat: 'x', ride: 'x', crash: 'x' })) },
        { text: 'Toms sit between: high tom near the top, floor tom in the second space. The hi-hat foot is an x below the staff.', board: board(pads(['tom1', 'tom2', 'tom3', 'phat'])) }
      ],
      see: seeIt('Kick (bottom space), snare (third space), hi-hat (x above).', seq(['kick', 'snare', 'hat']), 70),
      tasks: [task('Which drum is in the bottom space? Tap it.', 'kick', { item: 'staff:drum@kick' }), task('Which drum is in the third space? Tap it.', 'snare', { item: 'staff:drum@snare' }),
        task('Which cymbal is the x just above the staff? Tap it.', 'hat', { item: 'staff:drum@hat' })],
      play: play('Read the rock beat from the Kit tab\'s staff while you play it.', ROCK, { bpm: 70 }),
      questions: [choice('Cymbals are written with…', ['x noteheads', 'Round noteheads', 'Numbers'], 'x noteheads', 'fact:cymbal-x'),
        tap('Tap the drum written in the second space: the floor tom.', 'tom3', { item: 'staff:drum@tom3' }),
        tap('Tap the drum written in the bottom space.', 'kick', { item: 'staff:drum@kick' }),
        tap('From Lesson 6: tap the drum that plays the backbeat, the snare.', 'snare')]
    })
  ],
  challenge: { id: 'd1-ch', title: 'Level 1 Challenge', challenge: true, flow: [
    { type: 'drumplay', name: 'Rock beat', text: 'Play the rock beat for 8 bars at 70 bpm, aiming for 80% of hits within ±50 ms. Your timing is shown; it never holds you back.', groove: { beats: 4, sub: 4, bars: 1, hits: { hat: E8, snare: [4, 12], kick: [0, 8] } }, bpm: 70, bars: 8 },
    { type: 'check', name: 'Check it', pass: 3, view: [0, 9], questions: [
      tap('Tap the drum in the third space.', 'snare', { item: 'staff:drum@snare' }), tap('Tap the drum played by the left foot.', 'phat'),
      choice('Eighth notes are counted…', ['1 & 2 & 3 & 4 &', '1 2 3 4', '1 trip let'], '1 & 2 & 3 & 4 &', 'fact:count-eighths'),
      choice('In the rock beat the kick plays on…', ['1 and 3', '2 and 4', 'Every eighth'], '1 and 3', 'fact:kick-1-3')] }
  ] },
  placement: [
    choice('Can you read rhythms? How many eighth notes fill a bar of 4/4?', ['8', '4', '16'], '8', 'fact:eighths-per-bar'),
    tap('Tap the drum written in the third space of the drum staff.', 'snare', { item: 'staff:drum@snare' }),
    choice('Coordination: in a basic rock beat, which limbs play on beat 1?', ['Right hand and right foot', 'Both hands', 'Left hand only'], 'Right hand and right foot', 'fact:rock-beat-1')
  ]
};

export const level2 = {
  id: 'drums-level-2', title: 'Grooves and first fills',
  lessons: [
    L('d2-1', 'Eighth rests and the kick on "&"', {
      review: ['count:0-6-8'],
      hear: { text: 'The rock beat with an extra kick on the "&" of 3.', sound: kit(ROCK2, 85, 2) },
      cards: [dgrid('An eighth rest is half a beat of silence. Here the kick rests, then lands on the "&".', [0, 8, 10], { piece: 'kick' }),
        dgrid('Count it: "1 & 2 & 3 AND 4 &". The kick lands on that "and".', [0, 8, 10], { piece: 'kick', snare: [4, 12] }),
        { text: 'The hands keep the same pattern; only the foot changes.', board: board(pads(['hat', 'snare', 'kick'])) }],
      see: seeIt('Kick on 1, 3 and the & of 3.', seq([['hat', 'kick'], 'hat', ['hat', 'snare'], 'hat', ['hat', 'kick'], ['hat', 'kick'], ['hat', 'snare'], 'hat']), 160),
      tasks: [dgridTask('Tap the kick: 1, 3 and the & of 3.', [0, 8, 10], { piece: 'kick' }), dgridTask('Tap a kick on 1 and the & of 2.', [0, 6], { piece: 'kick' }), task('Tap the drum that plays on the "&": the kick.', 'kick')],
      play: play('Play the rock beat with the extra kick on the & of 3.', ROCK2, { bpm: 70 }),
      questions: [choice('An eighth rest lasts…', ['Half a beat', 'A whole beat', 'A bar'], 'Half a beat', 'fact:eighth-rest'),
        choice('Listen: does the kick land on the "&" of 3?', ['Yes', 'No'], 'Yes', 'groove-ear:rock-and3', { sound: kit(ROCK2, 85, 2) }),
        tap('Tap the kick.', 'kick'), tap('From Level 1: tap the drum written in the third space, the snare.', 'snare', { item: 'staff:drum@snare' })]
    }),
    L('d2-2', 'The backbeat and the click on 2 and 4', {
      hear: { text: 'The click on 2 and 4 only, like a band\'s backbeat.', sound: kit({ rim: '....x.......x...', snare: '....x.......x...' }, 90, 2) },
      cards: [dgrid('The backbeat is beats 2 and 4. Most pop and rock songs put the snare there.', [4, 12]),
        dgrid('Practising with the click on 2 and 4 makes you feel 1 and 3 yourself.', [4, 12], { piece: 'rim', label: 'Click' }),
        tech('Make the backbeat strong and even.', ['Play the snare on 2 and 4 a little louder', 'Keep the hi-hat lighter', 'Listen for every backbeat sounding the same'], 'grip')],
      see: seeIt('Snare backbeat over hi-hat eighths.', ROCK_SEQ, 160),
      tasks: [dgridTask('Tap the backbeat.', [4, 12]), dgridTask('Tap beats 1 and 3, the ones you feel yourself.', [0, 8], { piece: 'kick' }), task('Tap the drum that plays the backbeat.', 'snare')],
      play: play('Play the rock beat while the click only sounds on 2 and 4.', ROCK, { bpm: 75 }),
      questions: [choice('The backbeat is on beats…', ['2 and 4', '1 and 3', '1 only'], '2 and 4', 'fact:backbeat'),
        tap('Tap the backbeat drum.', 'snare'), tap('From Lesson 1: tap the drum that lands on the "&" of 3.', 'kick'),
        choice('Why practise with the click on 2 and 4?', ['You feel 1 and 3 yourself', 'It is louder', 'It is faster'], 'You feel 1 and 3 yourself', 'fact:click-2-4')]
    }),
    L('d2-3', 'Sixteenth notes: 1 e & a', {
      review: ['count:0-1-2-3-4-5-6-7-8-9-10-11-12-13-14-15'],
      hear: { text: 'Sixteenth notes on the snare: four per beat.', sound: kit({ snare: 'xxxxxxxxxxxxxxxx' }, 70, 1) },
      cards: [dgrid('A sixteenth note is a quarter of a beat. Count "1 e & a 2 e & a".', S16), dgrid('"e" and "a" sit between the eighths.', [1, 3, 5, 7]),
        { text: 'Play sixteenths with alternating hands: R L R L.', board: board(pads(['snare'], { snare: 'RLRL' })) }],
      see: seeIt('Sixteenths on the snare, R L R L.', seq(['snare', 'snare', 'snare', 'snare', 'snare', 'snare', 'snare', 'snare']), 280),
      tasks: [dgridTask('Tap all sixteenths of beats 1 and 2.', [0, 1, 2, 3, 4, 5, 6, 7]), dgridTask('Tap only the "e"s of beats 1 and 2.', [1, 5]), dgridTask('Tap "1 e & a" then quarters.', [0, 1, 2, 3, 4, 8, 12])],
      play: play('Play sixteenth notes on the snare, alternating R L R L, slowly and evenly.', { snare: 'xxxxxxxxxxxxxxxx' }, { bpm: 60, bars: 2 }),
      questions: [choice('How many sixteenths are in one beat?', ['4', '2', '3'], '4', 'fact:sixteenths-per-beat'),
        choice('How do you count sixteenths?', ['1 e & a', '1 & 2 &', '1 trip let'], '1 e & a', 'fact:count-sixteenths'),
        tap('Tap the snare.', 'snare'), tap('From Lesson 2: tap the backbeat drum.', 'snare')]
    }),
    L('d2-4', 'Single and double strokes; sticking', {
      review: ['sticking:singles', 'sticking:doubles'],
      hear: { text: 'Singles R L R L, then doubles R R L L.', sound: kit({ snare: 'xxxxxxxxxxxxxxxx' }, 60, 1) },
      cards: [
        { text: 'Sticking says which hand plays each note: R for right, L for left, written above the notes.', board: board(pads(['snare'], { snare: 'R L' })) },
        tech('Single strokes alternate hands: R L R L.', ['Play R L R L slowly on a pad or the snare', 'Keep both sticks at the same height', 'Speed up only when it is even']),
        tech('Double strokes play two per hand: R R L L. The second stroke uses the bounce.', ['Play R R L L slowly with two wrist strokes', 'Then let the second one bounce', 'Keep the two notes equally loud'])
      ],
      see: seeIt('R R L L on the snare.', seq(['snare', 'snare', 'snare', 'snare']), 120),
      tasks: [task('Singles start with the right hand: tap the snare to begin.', 'snare', { item: 'sticking:singles' }), task('Doubles: tap the snare for the first R.', 'snare', { item: 'sticking:doubles' }), dgridTask('Tap where the right hand plays in R R L L R R L L (16ths).', [0, 1, 4, 5, 8, 9, 12, 13])],
      play: play('Play double strokes R R L L in sixteenths with the click. Practice → Drills → Stickings scores each hand.', { snare: 'xxxxxxxxxxxxxxxx' }, { bpm: 55, bars: 2 }),
      questions: [choice('The sticking R R L L is…', ['Double strokes', 'Single strokes', 'A paradiddle'], 'Double strokes', 'sticking:doubles'),
        choice('R L R L is…', ['Single strokes', 'Double strokes', 'A flam'], 'Single strokes', 'sticking:singles'),
        tap('Tap the snare.', 'snare'), tap('From Lesson 1: tap the drum that lands on the "&" of 3, the kick.', 'kick')]
    }),
    L('d2-5', 'Moving around the toms', {
      hear: { text: 'High tom, mid tom, floor tom: high to low.', sound: kit({ tom1: 'x...', tom2: '....x...', tom3: '........x...', snare: '............x...' }, 90, 1) },
      cards: [{ text: 'Toms go from high to low: high tom, mid tom, floor tom. Moving down sounds like a fall.', board: board(pads(['tom1', 'tom2', 'tom3'])) },
        tech('Move around the kit with your arms, not by twisting your body.', ['Play snare, high tom, mid tom, floor tom slowly', 'Lead with the right hand going down', 'Keep the sticks low between drums'], 'grip'),
        { text: 'The floor tom is usually on your right, the high and mid toms above the kick.', board: board(pads(['tom1', 'tom2', 'tom3'])) }],
      see: seeIt('Snare, high tom, mid tom, floor tom.', seq(['snare', 'tom1', 'tom2', 'tom3']), 100),
      tasks: [task('Tap the highest tom.', 'tom1'), task('Tap the lowest tom.', 'tom3'), task('Tap the tom in the middle.', 'tom2')],
      play: play('Play quarter notes around the kit: snare, high tom, mid tom, floor tom.', { snare: 'x...............', tom1: '....x...........', tom2: '........x.......', tom3: '............x...' }, { bpm: 70 }),
      questions: [choice('Which tom has the lowest sound?', ['Floor tom', 'High tom', 'Mid tom'], 'Floor tom', 'fact:floor-tom-lowest'),
        tap('Tap the floor tom.', 'tom3'), tap('Tap the high tom.', 'tom1'),
        tap('From Lesson 4: tap the drum you practise doubles on, the snare.', 'snare')]
    }),
    L('d2-6', 'Fills that land on the crash', {
      hear: { text: 'Three bars of beat, a one-beat fill, then a crash on "1".', sound: kit({ hat: 'x.x.x.x.x.x.....', snare: '....x.......xxxx', kick: 'x.......x.......' }, 90, 2) },
      cards: [dgrid('A fill breaks the pattern for a beat or two at the end of a phrase.', [12, 13, 14, 15]),
        { text: 'A fill ends by landing on "1" of the next bar with the crash and the kick together.', board: board(pads(['crash', 'kick'])) },
        dgrid('A two-beat fill starts on beat 3: snare, then down the toms.', [8, 9, 10, 11, 12, 13, 14, 15])],
      see: seeIt('One-beat fill on the snare, then crash + kick.', seq(['snare', 'snare', 'snare', 'snare', ['crash', 'kick']]), 240),
      tasks: [dgridTask('Tap a one-beat fill on beat 4 (sixteenths).', [12, 13, 14, 15]), task('Tap the cymbal a fill lands on.', 'crash'), task('Tap the drum that lands with it on "1".', 'kick')],
      play: play('Play three bars of rock beat and a one-beat fill, landing on the crash.', { hat: 'x.x.x.x.x.x.....', snare: '....x.......xxxx', kick: 'x.......x.......' }, { bpm: 70, bars: 4 }),
      questions: [choice('Where does a fill usually land?', ['On "1" of the next bar', 'On beat 3', 'On the "&" of 4'], 'On "1" of the next bar', 'fact:fill-lands-on-1'),
        tap('Tap the crash.', 'crash'), tap('From Lesson 5: tap the lowest tom, the floor tom.', 'tom3'),
        choice('Listen: does this fill land on beat 1?', ['Yes', 'No'], 'Yes', 'groove-ear:fill-on-1', { sound: kit({ snare: '............xxxx', crash: 'x...............', kick: 'x...............' }, 90, 2) })]
    }),
    L('d2-7', 'Four-bar phrases: groove × 3 + fill', {
      hear: { text: 'Groove, groove, groove, fill: a four-bar phrase.', sound: kit({ hat: 'x.x.x.x.x.x.....', snare: '....x.......xxxx', kick: 'x.......x.......' }, 100, 4) },
      cards: [{ text: 'Music comes in phrases of 4 and 8 bars. Count the bars: "1 2 3 4, 2 2 3 4…".', board: board(pads(['snare'])) },
        { text: 'Play the groove for three bars, fill in the fourth, then crash on the next "1".', board: board(pads(['hat', 'snare', 'crash'])) },
        tech('Count bars out loud while you play.', ['Say the bar number on each "1"', 'Fill only in bar 4', 'Crash on the next bar 1'])],
      see: seeIt('Bar 4: the fill, then the crash.', seq([['hat', 'kick'], 'hat', ['hat', 'snare'], 'hat', ['hat', 'kick'], 'hat', 'snare', 'snare', ['crash', 'kick']]), 180),
      tasks: [dgridTask('In bar 4, tap the fill: beat 4 in sixteenths.', [12, 13, 14, 15]), task('Tap what you play on "1" of bar 5: the crash.', 'crash'), dgridTask('In bars 1–3, tap the snare backbeat.', [4, 12])],
      play: { name: 'Play it', type: 'drumplay', text: 'Play four-bar phrases: groove × 3 and a fill. Then try "Rock Steady" in Practice → Play-along.', groove: { beats: 4, sub: 4, bars: 1, hits: { hat: E8, snare: [4, 12], kick: [0, 8] } }, bpm: 70, bars: 4 },
      questions: [choice('Common phrase lengths are…', ['4 and 8 bars', '3 and 5 bars', '1 bar'], '4 and 8 bars', 'fact:phrase-length'),
        tap('Tap what lands on "1" after a fill.', 'crash'), tap('From Lesson 6: tap the drum that lands with the crash, the kick.', 'kick'),
        choice('In a four-bar phrase, the fill goes in bar…', ['4', '1', '2'], '4', 'fact:fill-bar-4')]
    })
  ],
  challenge: { id: 'd2-ch', title: 'Level 2 Challenge', challenge: true, flow: [
    { type: 'drumplay', name: '16 bars', text: '16 bars: three bars of groove and a fill, four times, landing every fill on "1". (The play-along "Rock Steady" has a backing track.)', groove: { beats: 4, sub: 4, bars: 1, hits: { hat: E8, snare: [4, 12], kick: [0, 8, 10] } }, bpm: 75, bars: 8 },
    { type: 'check', name: 'Check it', pass: 3, view: [0, 9], questions: [
      tap('Tap the cymbal a fill lands on.', 'crash'), tap('Tap the highest tom.', 'tom1'),
      choice('Sixteenths are counted…', ['1 e & a', '1 & 2 &', '1 trip let'], '1 e & a', 'fact:count-sixteenths'),
      choice('R R L L is…', ['Double strokes', 'Single strokes', 'A paradiddle'], 'Double strokes', 'sticking:doubles')] }
  ] },
  placement: [
    choice('Sixteenths are counted…', ['1 e & a', '1 & 2 &', '1 trip let'], '1 e & a', 'fact:count-sixteenths'),
    choice('Where does a fill usually land?', ['On "1" of the next bar', 'On beat 3', 'On the "&" of 4'], 'On "1" of the next bar', 'fact:fill-lands-on-1'),
    tap('Tap the lowest tom.', 'tom3')
  ]
};

export const level3 = {
  id: 'drums-level-3', title: 'Sixteenths, dynamics and rudiments',
  lessons: [
    L('d3-1', '16th-note hi-hat grooves', {
      hear: { text: 'Sixteenths on the hi-hat over the rock beat.', sound: kit(HAT16, 80, 2) },
      cards: [dgrid('Two-handed: R L R L sixteenths on the hi-hat, the left hand also plays the snare on 2 and 4.', S16, { piece: 'hat', snare: [4, 12] }),
        dgrid('One-handed: the right hand plays all sixteenths alone, at slower tempos.', S16, { piece: 'hat' }),
        tech('Keep the hat soft and the backbeat strong.', ['Play the hat sixteenths quietly', 'Let the snare on 2 and 4 pop out', 'Stay relaxed as you speed up'])],
      see: seeIt('16th hi-hat groove.', seq([['hat', 'kick'], 'hat', 'hat', 'hat', ['hat', 'snare'], 'hat', 'hat', 'hat']), 280),
      tasks: [dgridTask('Tap sixteenths on the hi-hat for beat 1.', [0, 1, 2, 3], { piece: 'hat' }), dgridTask('Tap the snare backbeat under it.', [4, 12]), task('Tap the drum playing sixteenths: the hi-hat.', 'hat')],
      play: play('Play the 16th hi-hat groove at a slow tempo.', HAT16, { bpm: 60 }),
      questions: [choice('Two-handed 16th hi-hats use…', ['R L R L', 'R R R R', 'L L L L'], 'R L R L', 'fact:two-hand-hat'),
        tap('Tap the hi-hat.', 'hat'), tap('From Level 2: tap the cymbal a fill lands on.', 'crash'),
        choice('How many hi-hat notes per bar in a 16th groove?', ['16', '8', '4'], '16', 'fact:sixteen-per-bar')]
    }),
    L('d3-2', 'Kick on "e" and "a"', {
      review: ['count:0-3-8-11'],
      hear: { text: 'The kick on "1", the "a" of 1, "3" and the "a" of 3.', sound: kit({ hat: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x..x....x..x....' }, 80, 2) },
      cards: [dgrid('"e" is the second sixteenth of a beat; "a" is the fourth. Kicks there push the groove forward.', [0, 3, 8, 11], { piece: 'kick' }),
        dgrid('Count it slowly: "1 e & A, 2 e & a, 3 e & A".', [0, 3, 8, 11], { piece: 'kick', snare: [4, 12] }),
        dgrid('Here the kick plays the "e" of 2 instead.', [0, 5, 8], { piece: 'kick' })],
      see: seeIt('Kick on 1 and the "a" of 1.', seq([['hat', 'kick'], 'hat', ['hat', 'snare'], 'hat']), 120),
      tasks: [dgridTask('Tap the kick: 1, a of 1, 3, a of 3.', [0, 3, 8, 11], { piece: 'kick' }), dgridTask('Tap a kick on 1 and the "e" of 2.', [0, 5], { piece: 'kick' }), task('Tap the drum that plays these: the kick.', 'kick')],
      play: play('Play the groove with kicks on 1, the "a" of 1, 3 and the "a" of 3.', { hat: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x..x....x..x....' }, { bpm: 65 }),
      questions: [choice('The "a" is which sixteenth of the beat?', ['The 4th', 'The 2nd', 'The 3rd'], 'The 4th', 'fact:a-fourth-sixteenth'),
        choice('The "e" is which sixteenth of the beat?', ['The 2nd', 'The 4th', 'The 1st'], 'The 2nd', 'fact:e-second-sixteenth'),
        tap('Tap the kick.', 'kick'), tap('From Lesson 1: tap the drum for 16th grooves, the hi-hat.', 'hat')]
    }),
    L('d3-3', 'Dynamics, accents and ghost notes', {
      hear: { text: 'Soft, medium and loud; then accents, then quiet ghost notes between backbeats.', sound: kit({ snare: '....X..g.g..X..g', hat: 'x.x.x.x.x.x.x.x.', kick: 'x.......x.......' }, 80, 2) },
      cards: [{ text: 'Dynamics are how loud you play: p (soft), mf (medium), f (loud). An accent (>) is one louder note.', board: board(pads(['snare'], { snare: '>' })) },
        tech('Accents come from stick height, not force.', ['Play quiet notes from about 3 cm', 'Play accents from about 30 cm', 'Let both rebound the same way']),
        dgrid('Ghost notes are very quiet snare notes between the backbeats. You feel them more than hear them.', [4, 7, 9, 12, 15])],
      see: seeIt('Accent on the backbeat, ghosts between.', seq([['hat', 'kick'], 'hat', ['hat', 'snare'], ['hat', 'snare']]), 120),
      tasks: [dgridTask('Tap the backbeat accents.', [4, 12]), dgridTask('Tap the ghost notes: the "a" of 2 and the "e" of 3.', [7, 9]), task('Tap the drum ghost notes are played on: the snare.', 'snare')],
      play: play('Play the backbeat loud and the ghost notes very soft.', { hat: 'x.x.x.x.x.x.x.x.', snare: '....x..x.x..x...', kick: 'x.......x.......' }, { bpm: 65 }),
      questions: [choice('What does "f" mean in music?', ['Loud', 'Fast', 'Fill'], 'Loud', 'fact:dynamics-f'),
        choice('A ghost note is…', ['A very quiet note', 'A missing note', 'A cymbal'], 'A very quiet note', 'fact:ghost-note'),
        tap('Tap the snare.', 'snare'), tap('From Lesson 2: tap the drum on the "a" of 1, the kick.', 'kick')]
    }),
    L('d3-4', 'The paradiddle and grooves built from it', {
      review: ['sticking:paradiddle'],
      hear: { text: 'R L R R L R L L: a paradiddle, then spread across hi-hat and snare.', sound: kit(PDIDDLE, 70, 2) },
      cards: [{ text: 'The paradiddle is R L R R, L R L L: two singles and a double.', board: board(pads(['snare'], { snare: 'RLRR' })) },
        tech('Learn it slowly on one drum, accenting the first note of each group.', ['Play R L R R L R L L on the snare', 'Accent the first R and the first L', 'Repeat until it flows']),
        dgrid('Put the right hand on the hi-hat and the left on the snare, and it becomes a groove.', [0, 2, 3, 5, 8, 10, 11, 13], { piece: 'hat' })],
      see: seeIt('Paradiddle groove: right hand hat, left hand snare.', seq(['hat', 'snare', 'hat', 'hat', 'snare', 'hat', 'snare', 'snare']), 200),
      tasks: [task('A paradiddle starts with the right hand on the snare: tap it.', 'snare', { item: 'sticking:paradiddle' }), dgridTask('Tap the right hand of R L R R L R L L (16ths).', [0, 2, 3, 5]), task('In the paradiddle groove, the right hand plays which cymbal? Tap it.', 'hat')],
      play: play('Play the paradiddle groove slowly: right hand hi-hat, left hand snare, kick on 1 and 3.', PDIDDLE, { bpm: 55 }),
      questions: [choice('A paradiddle is…', ['R L R R L R L L', 'R R L L', 'R L R L'], 'R L R R L R L L', 'sticking:paradiddle'),
        tap('Tap the snare.', 'snare'), tap('From Lesson 3: tap the drum for ghost notes, the snare.', 'snare'),
        choice('A paradiddle mixes…', ['Singles and a double', 'Only doubles', 'Flams'], 'Singles and a double', 'fact:paradiddle-mix')]
    }),
    L('d3-5', 'Flams and drags', {
      review: ['sticking:flam', 'sticking:drag'],
      hear: { text: 'A flam (one grace note), then a drag (two grace notes).', sound: kit({ snare: 'xx..xxx.' }, 70, 1) },
      cards: [{ text: 'A flam is a soft grace note just before a main note, played by the other hand: "fLAM".', board: board(pads(['snare'], { snare: 'lR' })) },
        tech('Flam: one stick low, one stick high, dropped almost together.', ['Hold the right stick high and the left low', 'Drop both: the low one lands first', 'Then swap hands: rL']),
        { text: 'A drag is two quick grace notes from one hand before the main note.', board: board(pads(['snare'], { snare: 'llR' })) }],
      see: seeIt('Flams on the snare.', seq(['snare', 'snare', 'snare', 'snare']), 90),
      tasks: [task('A flam is played on the snare: tap it.', 'snare', { item: 'sticking:flam' }), task('A drag is played on the snare too: tap it.', 'snare', { item: 'sticking:drag' }), dgridTask('Tap where the main notes of "lR . . rL . ." fall.', [1, 5])],
      play: play('Play flams on every beat: lR, rL, lR, rL. Practice → Drills → Stickings has flam taps and drags.', { snare: 'x...x...x...x...' }, { bpm: 60 }),
      questions: [choice('A flam has how many grace notes?', ['1', '2', '0'], '1', 'sticking:flam'),
        choice('A drag has how many grace notes?', ['2', '1', '3'], '2', 'sticking:drag'),
        tap('Tap the snare.', 'snare'), tap('From Lesson 4: tap the cymbal the right hand plays in the paradiddle groove, the hi-hat.', 'hat')]
    }),
    L('d3-6', '16th-note fills', {
      hear: { text: 'A two-beat 16th fill down the toms, landing on the crash.', sound: kit({ hat: 'x.x.x.x.........', snare: '....x...xxxx....', tom1: '............xx..', tom3: '..............xx', kick: 'x.......' }, 85, 2) },
      cards: [dgrid('A 16th fill: four notes per beat, usually alternating R L R L.', [8, 9, 10, 11, 12, 13, 14, 15]),
        { text: 'Move it around: two notes on each drum going down sounds great.', board: board(pads(['snare', 'tom1', 'tom2', 'tom3'])) },
        { text: 'Keep the tempo: fills are where drummers rush. Count "3 e & a 4 e & a".', board: board(pads(['crash', 'kick'])) }],
      see: seeIt('Snare, snare, high tom, floor tom, then crash.', seq(['snare', 'snare', 'tom1', 'tom3', ['crash', 'kick']]), 240),
      tasks: [dgridTask('Tap a 16th fill on beats 3 and 4.', [8, 9, 10, 11, 12, 13, 14, 15]), task('Tap where the fill ends up before the crash: the floor tom.', 'tom3'), task('Tap the cymbal you land on.', 'crash')],
      play: play('Play three bars of groove and a two-beat 16th fill, landing on the crash. Don\'t rush!', { hat: 'x.x.x.x.........', snare: '....x...xxxx....', tom1: '............xx..', tom3: '..............xx', kick: 'x.......x.......' }, { bpm: 60, bars: 4 }),
      questions: [choice('Where do drummers most often rush?', ['In fills', 'In the groove', 'On the crash'], 'In fills', 'fact:fills-rush'),
        tap('Tap the floor tom.', 'tom3'), tap('From Lesson 5: tap the drum flams are played on, the snare.', 'snare'),
        choice('A two-beat 16th fill has how many notes?', ['8', '4', '16'], '8', 'fact:two-beat-16th-fill')]
    }),
    L('d3-7', 'Song form: verse, chorus, bridge', {
      hear: { text: 'A verse on the hi-hat, a fill, then a chorus on the ride with crashes.', sound: kit({ hat: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.......' }, 95, 2) },
      cards: [{ text: 'Songs have sections: intro, verse, chorus, bridge, ending. Each is usually 4 or 8 bars.', board: board(pads(['hat', 'ride'])) },
        { text: 'Change the groove for each section: hi-hat in the verse, ride or crashes in the chorus.', board: board(pads(['hat', 'ride', 'crash'])) },
        { text: 'Fill into each new section, so the band hears the change coming.', board: board(pads(['snare', 'tom3', 'crash'])) }],
      see: seeIt('Verse groove, fill, chorus crash.', seq([['hat', 'kick'], ['hat', 'snare'], 'snare', ['crash', 'kick']]), 100),
      tasks: [task('Tap the cymbal for a bright chorus: the ride.', 'ride'), task('Tap the cymbal for a quieter verse: the hi-hat.', 'hat'), task('Tap the cymbal that marks a new section: the crash.', 'crash')],
      play: play('Play 4 bars of verse (hi-hat), a fill, and 4 bars of chorus (ride). Then try "Little Song" in Practice → Play-along.', { ride: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.......' }, { bpm: 80 }),
      questions: [choice('The part of a song that returns with the same words is the…', ['Chorus', 'Verse', 'Intro'], 'Chorus', 'fact:chorus'),
        choice('Where do fills usually go?', ['Into a new section', 'In the middle of a verse', 'On every bar'], 'Into a new section', 'fact:fills-into-sections'),
        tap('Tap the ride.', 'ride'), tap('From Lesson 6: tap the cymbal you land on after a fill, the crash.', 'crash')]
    })
  ],
  challenge: { id: 'd3-ch', title: 'Level 3 Challenge', challenge: true, flow: [
    { type: 'drumplay', name: 'Song chart', text: 'Follow a song chart (intro, verse, chorus…): play a verse groove here, then the full "Little Song" chart in Practice → Play-along with the backing.', groove: { beats: 4, sub: 4, bars: 1, hits: { hat: E8, snare: [4, 12], kick: [0, 6, 8] } }, bpm: 80, bars: 4 },
    { type: 'check', name: 'Check it', pass: 3, view: [0, 9], questions: [
      choice('A paradiddle is…', ['R L R R L R L L', 'R R L L', 'R L R L'], 'R L R R L R L L', 'sticking:paradiddle'),
      choice('A flam has how many grace notes?', ['1', '2', '0'], '1', 'sticking:flam'),
      tap('Tap the cymbal for the chorus: the ride.', 'ride'), tap('Tap the drum for ghost notes.', 'snare')] }
  ] },
  placement: [
    choice('A paradiddle is…', ['R L R R L R L L', 'R R L L', 'R L R L'], 'R L R R L R L L', 'sticking:paradiddle'),
    choice('The "a" is which sixteenth of the beat?', ['The 4th', 'The 2nd', 'The 3rd'], 'The 4th', 'fact:a-fourth-sixteenth'),
    tap('Tap the ride.', 'ride')
  ]
};
export const _D = D;
