// "When will you practise?" A plan made in advance ("after work, 10 minutes")
// makes practising more likely (implementation intentions: Gollwitzer & Sheeran,
// d = .65; see docs/research-guitar-v2.md 3.2). Asked once on the Learn home;
// "Not now" hides it. The plan shows on the Practice home, where it can be changed.
import { getSettings, setSetting } from './storage.js';
import { esc } from './ui.js';

const WHEN = ['With morning coffee', 'At lunch', 'After work', 'After dinner', 'Before bed'];
const MINUTES = [5, 10, 15, 20];

export const needsPlan = () => { const s = getSettings(); return !s.plan && !s.planSkipped; };

export function planCardHTML() {
  if (!needsPlan()) return '';
  return `
    <div class="plan-card" id="plan-card">
      <b>When will you practise?</b>
      <p class="muted">Picking a moment now makes it much easier to keep going.</p>
      <div class="chips" id="plan-when">${WHEN.map(w => `<button data-w="${esc(w)}" aria-pressed="false">${esc(w)}</button>`).join('')}</div>
      <div class="chips" id="plan-min" aria-label="How long">${MINUTES.map(m => `<button data-m="${m}" aria-pressed="${m === 10}">${m} min</button>`).join('')}</div>
      <div class="row"><button class="primary" id="plan-save" disabled>Save my plan</button><button class="quiet-inline" id="plan-skip">Not now</button></div>
    </div>`;
}

// Wire the card's buttons; onDone re-renders the page.
export function wirePlanCard(root, onDone) {
  const card = root.querySelector('#plan-card');
  if (!card) return;
  let when = null, minutes = 10;
  const pick = (group, btn) => group.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === btn));
  card.querySelector('#plan-when').onclick = e => { const b = e.target.closest('button'); if (!b) return; when = b.dataset.w; pick(e.currentTarget, b); card.querySelector('#plan-save').disabled = false; };
  card.querySelector('#plan-min').onclick = e => { const b = e.target.closest('button'); if (!b) return; minutes = +b.dataset.m; pick(e.currentTarget, b); };
  card.querySelector('#plan-save').onclick = () => { setSetting('plan', { when, minutes }); onDone(); };
  card.querySelector('#plan-skip').onclick = () => { setSetting('planSkipped', true); onDone(); };
}

export function planLine() {
  const p = getSettings().plan;
  if (!p) return '';
  return `<p class="plan-line">Your plan: <b>${esc(p.when.toLowerCase())}, ${p.minutes} minutes</b>. <button class="link-btn" id="plan-change">Change</button></p>`;
}
export function wirePlanLine(root, onDone) {
  root.querySelector('#plan-change')?.addEventListener('click', () => { setSetting('plan', null); setSetting('planSkipped', false); onDone(); });
}
