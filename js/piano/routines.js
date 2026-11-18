// Piano practice routines for the practice timer (docs/research-piano.md D4).
import { register } from '../registry.js';
register('routines', {
  'piano-daily': { name: 'Piano daily 20', blurb: 'Warm-up, scale, chords, reading, a piece', blocks: [
    { name: 'Five-finger warm-up, hands separately', minutes: 3, bpm: 60 },
    { name: 'Scale of the week (fingering on the Keyboard tab)', minutes: 4, bpm: 60 },
    { name: 'I–IV–V–I in three keys', minutes: 4, bpm: 70 },
    { name: 'Reading: staff reader', minutes: 4, open: 'drills&drill=piano-staff' },
    { name: 'Your piece (tempo trainer)', minutes: 5, open: 'playalong' }
  ] },
  'piano-quick': { name: 'Piano quick 10', blurb: 'Keys, chords and a piece', blocks: [
    { name: 'Key finder', minutes: 3, open: 'drills&drill=piano-keys' },
    { name: 'Chord builder', minutes: 3, open: 'drills&drill=piano-chords' },
    { name: 'A piece, hands separately', minutes: 4, open: 'playalong' }
  ] }
});
