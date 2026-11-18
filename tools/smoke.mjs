// Headless browser check: node tools/smoke.mjs [instrument ...] [--landscape]
// (--landscape: a phone on its side, 844 x 390, instead of upright, 390 x 844)
// Serves the folder, opens every tab (and a few deep links) for each instrument with
// Chromium (Playwright), and fails on any console error or uncaught exception.
// Extra routes per instrument can be listed in ROUTES below.
import { spawn } from 'child_process';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = new URL('..', import.meta.url).pathname;
const port = 8700 + Math.floor(Math.random() * 200);
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));

const COMMON = ['#learn', '#fretboard', '#practice', '#practice?tool=metronome', '#practice?tool=timer', '#practice?tool=drills',
  '#practice?tool=rhythm', '#practice?tool=playalong', '#practice?tool=log', '#progress', '#ear', '#learn?review=1', '#learn?placement=1'];
const ROUTES = {
  guitar: ['#learn?lesson=l1-1', '#practice?tool=playalong&tab=ode-to-joy'],
  bass: [], piano: [], drums: []
};
let extra = {};
try { extra = (await import('./smoke-routes.mjs')).default; } catch { }
const want = process.argv.slice(2).filter(a => !a.startsWith('-'));
const instruments = want.length ? want : ['guitar', 'bass', 'piano', 'drums'];
const VIEW = process.argv.includes('--landscape') ? { width: 844, height: 390 } : { width: 390, height: 844 };

const browser = await chromium.launch();
let failures = 0, checked = 0;
for (const inst of instruments) {
  const page = await browser.newPage({ viewport: VIEW, hasTouch: true, isMobile: true });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto(`http://127.0.0.1:${port}/index.html#learn`);
  await page.evaluate(i => {
    const raw = localStorage.getItem('fretboard-lab');
    const d = raw ? JSON.parse(raw) : null;
    if (d) { d.instrument = i; localStorage.setItem('fretboard-lab', JSON.stringify(d)); }
    else localStorage.setItem('fretboard-lab:smoke-instrument', i);
  }, inst);
  // A blank profile: set the instrument through the app's own storage on first load.
  await page.reload();
  await page.evaluate(async i => { const s = await import('./js/storage.js'); s.setInstrument(i); }, inst);
  await page.reload();
  await page.waitForFunction(() => window.__appStarted, null, { timeout: 8000 }).catch(() => errors.push('app did not start'));
  const routes = [...COMMON, ...(ROUTES[inst] || []), ...((extra[inst]) || [])];
  for (const r of routes) {
    const before = errors.length;
    await page.evaluate(h => { location.hash = h; }, r);
    await page.waitForTimeout(250);
    // Click the first primary button on the screen (starts a lesson step, a drill...) to exercise it.
    await page.locator('#views section:not([hidden]) button.primary').first().click({ timeout: 500 }).catch(() => {});
    await page.waitForTimeout(250);
    const bodyText = await page.evaluate(() => [...document.querySelectorAll('#views > section')].filter(s => !s.hidden).map(s => s.innerText).join(''));
    if (!bodyText.trim()) errors.push(`${r}: empty screen`);
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (scrollW > 2) errors.push(`${r}: page scrolls sideways by ${scrollW}px`);
    checked++;
    if (errors.length > before) errors.splice(before, 0, `-- at ${inst} ${r}`);
  }
  const started = await page.evaluate(() => window.__appStarted === true);
  if (!started) errors.push('app not started');
  if (errors.length) { failures += errors.length; console.log(`FAIL ${inst}:\n  ` + errors.join('\n  ')); }
  else console.log(`ok   ${inst}${VIEW.width > VIEW.height ? ' (landscape)' : ''}: ${routes.length} screens, no console errors`);
  await page.close();
}
await browser.close();
server.kill();
console.log(`\n${checked} screens checked, ${failures} problems`);
process.exitCode = failures ? 1 : 0;
