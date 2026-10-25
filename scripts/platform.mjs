// Test wykrywania platformy i startu z pliku (file://) na zbudowanym dist/index.html.
import { chromium, devices } from 'playwright';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = resolve(import.meta.dirname, '..', 'dist', 'index.html');
if (!existsSync(dist)) { console.error('Brak dist/index.html - uruchom: npm run build'); process.exit(1); }
const url = pathToFileURL(dist).href;

const cases = [
  { name: 'PC', opts: { viewport: { width: 1280, height: 720 } }, expect: { device: 'desktop', touchMode: false, context: 'file' } },
  { name: 'iPhone 13', opts: { ...devices['iPhone 13'] }, expect: { device: 'phone', os: 'ios', touchMode: true } },
  { name: 'Pixel 7', opts: { ...devices['Pixel 7'] }, expect: { device: 'phone', os: 'android', touchMode: true } },
  { name: 'iPad (gen 7)', opts: { ...devices['iPad (gen 7)'] }, expect: { device: 'tablet', touchMode: true } },
];

let failed = false;
const check = (ok, msg) => { console.log((ok ? 'OK   ' : 'FAIL ') + msg); if (!ok) failed = true; };
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

for (const c of cases) {
  const ctx = await browser.newContext(c.opts);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  // bez ?debug: gra ma wstać z pliku i pokazać menu
  await page.goto(url);
  await page.waitForSelector('#go', { timeout: 15000 });
  check(errors.length === 0, `${c.name}: start z pliku bez błędów${errors.length ? ' (' + errors[0] + ')' : ''}`);
  const dev = await page.evaluate(() => document.querySelector('[data-device]')?.getAttribute('data-device'));
  check(dev === c.expect.device, `${c.name}: data-device=${dev}`);
  const menuText = await page.evaluate(() => document.body.innerText);
  check(/Wykryto/.test(menuText), `${c.name}: menu pokazuje wykryte urządzenie`);

  // z ?debug: pełne dane platformy
  await page.goto(url + '?debug');
  await page.waitForSelector('#go');
  const p = await page.evaluate(() => window.__g.platform());
  for (const [k, v] of Object.entries(c.expect)) check(p[k] === v, `${c.name}: ${k}=${p[k]} (oczekiwano ${v})`);
  await ctx.close();
}

await browser.close();
if (failed) process.exit(1);
console.log('Platforma: wszystko OK');
