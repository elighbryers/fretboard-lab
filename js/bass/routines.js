// The bass routine template (docs/research-bass.md D4).
import { register } from '../registry.js';
register('routines', {
  'bass-15': { name: 'Bass 15', blurb: 'Technique, lock to the kick, lesson, play-along, review', blocks: [
    { name: 'Technique: plucking and muting', minutes: 2, bpm: 70 },
    { name: 'Lock to the kick', minutes: 4, open: 'drills&drill=bass-kick' },
    { name: 'Lesson material', minutes: 4, bpm: 80 },
    { name: 'Play-along', minutes: 3, open: 'playalong' },
    { name: 'Find the root', minutes: 2, open: 'drills&drill=bass-root' }
  ] }
});
