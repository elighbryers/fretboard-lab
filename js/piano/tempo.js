// The piano tempo trainer (docs/research-piano.md D4, after Duke, Simmons & Cash 2009): start at
// 60% of the piece's tempo, go up 5% after 3 clean runs in a row, down 10% after a miss.
// Pure, tested in tests/piano.test.mjs. pct is a percentage of the written tempo.
export class TempoTrainer {
  constructor({ start = 60, up = 5, down = 10, need = 3, max = 100, min = 30 } = {}) {
    Object.assign(this, { pct: start, up, down, need, max, min, clean: 0, goals: [] });
  }
  // One run through the loop. Returns { pct, change: 'up' | 'down' | 'same' | 'goal', goal? }.
  run(clean, baseBpm) {
    if (!clean) { this.clean = 0; const was = this.pct; this.pct = Math.max(this.min, this.pct - this.down); return { pct: this.pct, change: this.pct < was ? 'down' : 'same' }; }
    this.clean++;
    if (this.clean < this.need) return { pct: this.pct, change: 'same' };
    // A goal hit: "3 clean runs at 80 bpm" is what goes in the log.
    const goal = `${this.need} clean runs at ${Math.round(baseBpm * this.pct / 100)} bpm`;
    this.goals.push(goal);
    this.clean = 0;
    if (this.pct >= this.max) return { pct: this.pct, change: 'goal', goal };
    this.pct = Math.min(this.max, this.pct + this.up);
    return { pct: this.pct, change: 'up', goal };
  }
  bpm(base) { return Math.round(base * this.pct / 100); }
}
