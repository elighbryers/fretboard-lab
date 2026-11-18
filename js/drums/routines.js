// Drum practice routines for the practice timer (docs/research-drums.md D4): rudiments, a tempo
// ladder and a timing check, plus a groove of the day.
import { register } from '../registry.js';
register('routines', {
  'drums-warmup': { name: 'Drum warm-up 15', blurb: 'Rudiments, tempo ladder, internal time, a groove', blocks: [
    { name: 'Singles and doubles', minutes: 3, bpm: 60, open: 'drills&drill=drum-sticking' },
    { name: 'Paradiddle tempo ladder', minutes: 3, open: 'drills&drill=drum-sticking' },
    { name: 'Internal time: gap click', minutes: 3, open: 'drills&drill=drum-time' },
    { name: 'Read it, tap it', minutes: 3, open: 'drills&drill=drum-read' },
    { name: 'Play-along groove', minutes: 3, open: 'playalong' }
  ] },
  'drums-rudiments': { name: 'Rudiments 10', blurb: 'One rudiment per block, slow to fast', blocks: [
    { name: 'Single strokes', minutes: 2, bpm: 70, open: 'drills&drill=drum-sticking' },
    { name: 'Double strokes', minutes: 2, bpm: 60, open: 'drills&drill=drum-sticking' },
    { name: 'Paradiddles', minutes: 2, bpm: 60, open: 'drills&drill=drum-sticking' },
    { name: 'Flams and drags', minutes: 2, bpm: 50, open: 'drills&drill=drum-sticking' },
    { name: '5- and 9-stroke rolls', minutes: 2, bpm: 50, open: 'drills&drill=drum-sticking' }
  ] }
});
