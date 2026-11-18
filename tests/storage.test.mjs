// Storage migration and export/import: node --test tests/
// Realistic old profiles (version 1 from before Step 2, version 4 from Step 7) must keep
// every lesson, item, log entry and tempo after migrating to version 5.
import test from 'node:test';
import assert from 'node:assert/strict';

const mem = new Map();
globalThis.localStorage = { getItem: k => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: k => mem.delete(k) };

const V1 = {
  version: 1,
  lessons: { 'l1-1': { unlocked: true, completed: true, lastScore: 4, bestScore: 4, attempts: 2, completedAt: 1700000000000 },
    'l2-5': { unlocked: true, completed: true, lastScore: 3, bestScore: 3, attempts: 1, completedAt: 1700100000000 } },
  items: { 'note:G@s6': { attempts: 5, correct: 4, avgMs: 2100, lastSeen: 1700000000000, box: 3, dueDay: '2023-11-20' },
    'interval:m3': { attempts: 3, correct: 3, avgMs: 1500, lastSeen: 1700000000000, box: 2, dueDay: '2023-11-18' },
    'chordshape:em': { attempts: 2, correct: 2, avgMs: 900, lastSeen: 1700000000000, box: 2, dueDay: '2023-11-19' } },
  log: [{ date: '2023-11-14', minutes: 12, activity: 'Lesson: String names', detail: 'Check 4/4' }],
  streak: { current: 2, best: 5, lastDay: '2023-11-14' },
  confusions: { '3-4': 2 }, milestones: { 'first-lesson': { at: 1700000000000, seen: true } },
  settings: { labels: 'intervals', sound: true }, placement: 2, tempos: { 'lesson:l1-1': { best: 72, title: 'x', history: [{ day: '2023-11-14', bpm: 72 }] } }
};
const V4 = {
  version: 4, instrument: 'guitar',
  instruments: { guitar: { lessons: { 'l1-1': { unlocked: true, completed: true, bestScore: 4, attempts: 1, completedAt: 1 } }, items: { 'note:A@s5': { attempts: 1, correct: 1, avgMs: 1, lastSeen: 1 } },
    placement: 0, tempos: {}, goals: {}, review: null } },
  items: { 'interval:P5': { attempts: 2, correct: 1, avgMs: 2000, lastSeen: 2 } }, log: [{ id: 'a', date: '2026-11-01', time: '10:00', minutes: 5, activity: 'Drill', detail: '', instrument: 'guitar' }],
  days: ['2026-11-01'], streak: { current: 1, best: 1, lastDay: '2026-11-01' }, confusions: {}, milestones: {},
  settings: { labels: 'notes', sound: true, metronome: { bpm: 90, sig: '4/4', subdiv: 1, accent: true } }, practice: { custom: null, drills: {}, tabTempo: {} },
  fretboard: { last: null, favorites: [], setups: [] }
};

mem.set('fretboard-lab', JSON.stringify(V1));
const S = await import('../js/storage.js');

test('version 1 migrates to 5 with nothing lost', () => {
  const d = S.exportData().data;
  assert.equal(d.version, 5);
  assert.equal(d.instrument, 'guitar');
  const g = d.instruments.guitar;
  assert.ok(g.lessons['l1-1'].completed && g.lessons['l5-keys'].completed && !g.lessons['l2-5']);
  assert.ok(g.items['note:G@s6'] && g.items['chordshape:em'] && d.items['interval:m3']);
  assert.ok(g.items['note:G@s6'].fsrs, 'note items moved to FSRS');
  assert.equal(g.placement, 2);
  assert.equal(g.tempos['lesson:l1-1'].best, 72);
  assert.deepEqual(g.timing, []);
  assert.equal(g.tuning, null);
  assert.equal(d.log.length, 1);
  assert.equal(d.log[0].instrument, 'guitar');
  assert.equal(d.settings.labels, 'intervals');
  assert.equal(d.confusions['3-4'], 2);
});

test('a version 4 export imports (merge) into version 5 without losing either side', () => {
  S.importData({ app: 'fretboard-lab', data: V4 }, 'merge');
  const d = S.exportData().data;
  assert.ok(d.instruments.guitar.items['note:A@s5'] && d.instruments.guitar.items['note:G@s6']);
  assert.ok(d.items['interval:P5'] && d.items['interval:m3']);
  assert.equal(d.log.length, 2);
});

test('instruments keep separate positions, lessons, tuning and timing', () => {
  S.recordAnswer('note:C@s3', true, 1000);   // guitar: C on the G string
  S.setInstrument('bass');
  assert.equal(S.getItem('note:C@s3'), null, 'guitar position item not visible on bass');
  S.recordAnswer('note:C@s3', true, 1000);   // bass: C on the A string
  S.recordAnswer('interval:M3', true, 1000);  // shared theory
  S.setTuningId('five');
  S.addTimingSession({ drill: 'kick', bpm: 80, n: 16, bias: -12, spread: 20, hitRate: 0.8 });
  assert.equal(S.activeTuning().strings.length, 5);
  assert.equal(S.getTimingHistory().length, 1);
  S.setInstrument('guitar');
  assert.equal(S.getItem('note:C@s3').attempts, 1);
  assert.ok(S.getItem('interval:M3'), 'shared theory item visible on guitar');
  assert.equal(S.activeTuning().strings.length, 6);
  assert.equal(S.getTimingHistory().length, 0);
  const d = S.exportData().data;
  assert.equal(d.instruments.bass.tuning, 'five');
  assert.equal(d.instruments.guitar.items['note:C@s3'].attempts, 1);
});

test('all four instruments keep their own progress; theory stays shared', () => {
  const pos = { guitar: 'note:E@s1', bass: 'note:G@s1', piano: 'key:F#', drums: 'pad:snare' };
  for (const [inst, id] of Object.entries(pos)) { S.setInstrument(inst); S.recordAnswer(id, true, 900); S.completeLesson(inst[0] + '-test', 4); S.recordAnswer('interval:P5', true, 900); }
  for (const [inst, id] of Object.entries(pos)) {
    S.setInstrument(inst);
    assert.ok(S.getItem(id), `${inst} sees its own ${id}`);
    Object.entries(pos).filter(([i]) => i !== inst).forEach(([, other]) => { if (other !== id) assert.equal(S.getItem(other)?.attempts ?? 0, other.startsWith('note:') && id.startsWith('note:') ? (S.getItem(other)?.attempts ?? 0) : 0, `${inst} does not see ${other}`); });
    assert.ok(S.getLesson(inst[0] + '-test').completed);
    Object.keys(pos).filter(i => i !== inst).forEach(i => assert.equal(S.getLesson(i[0] + '-test').completed, false, `${inst} does not see ${i}'s lesson`));
    assert.equal(S.getItem('interval:P5').attempts >= 4, true, 'shared theory item counted on every instrument');
  }
  S.setInstrument('guitar');
});

test('export then replace-import round-trips', () => {
  const before = JSON.stringify(S.exportData().data);
  S.importData(S.exportData(), 'replace');
  assert.equal(JSON.stringify(S.exportData().data), before);
});

test('a broken file is refused with a readable error', () => {
  assert.throws(() => S.readExport({ app: 'x', data: { version: 'nope' } }), /isn't a Fretboard Lab progress file/);
});
