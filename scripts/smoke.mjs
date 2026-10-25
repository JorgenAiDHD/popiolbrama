import { chromium } from 'playwright';
import { createServer } from 'vite';

const PORT = 5199;
const server = await createServer({ server: { port: PORT, host: '127.0.0.1' }, logLevel: 'error' });
await server.listen();

const errors = [];
let failed = false;
const check = (ok, msg) => { console.log((ok ? 'OK   ' : 'FAIL ') + msg); if (!ok) failed = true; };

const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 900, height: 600 } });
await ctx.addInitScript(() => {
  localStorage.setItem('popiolbrama.meta2', JSON.stringify({ ash: 1000, classes: ['wojownik', 'mag', 'lowca', 'czarnoksieznik'], stats: { kills: 1000, runs: 5, wins: 1, bossKills: 1, longest: 200 }, mute: true }));
});
const page = await ctx.newPage();
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

const snap = () => page.evaluate(() => window.__g.snap());
async function pickCards() {
  for (let i = 0; i < 40; i++) {
    const s = await snap();
    if (s.state !== 'levelup') return;
    await page.waitForTimeout(450);
    await page.click('#lvl .card');
    await page.waitForTimeout(100);
  }
}

async function runClass(index, name) {
  await page.goto(`http://127.0.0.1:${PORT}/?debug`);
  await page.waitForSelector('#go');
  check((await page.locator('#al .srow').count()) === 5, `${name}: panel statystyk startowych`);
  await page.click(`#cl .cls:nth-child(${index + 1})`);
  await page.click('#go');
  await page.waitForTimeout(400);
  let s = await snap();
  check(s.state === 'play', `${name}: start gry`);
  check(s.gear.bron && s.gear.pancerz, `${name}: startowy ekwipunek (${s.gear.bron}, ${s.gear.pancerz})`);
  check(s.stats.krz >= 1, `${name}: statystyki policzone`);
  await page.evaluate(() => window.__g.god(true));
  await page.waitForTimeout(9000);
  s = await snap();
  check(s.kills > 0, `${name}: wrogowie giną samo (${s.kills} po ${s.T.toFixed(0)} s)`);
  await page.keyboard.down('KeyD');
  for (const [step, xpAmount] of [[20, 120], [25, 300], [25, 500], [30, 900]]) {
    await page.evaluate(([w, x]) => { window.__g.warp(w); window.__g.xp(x); }, [step, xpAmount]);
    await page.waitForTimeout(700);
    await pickCards();
  }
  s = await snap();
  check(s.state === 'play', `${name}: po wyborach wraca do play (${s.state})`);
  check(s.level >= 5, `${name}: poziom ${s.level} >= 5`);
  check(s.spec !== '', `${name}: wybrano specjalizację (${s.spec})`);
  check(s.enemies > 0, `${name}: są wrogowie (${s.enemies})`);
  await page.evaluate(() => { window.__g.warp(360); window.__g.xp(2500); });
  await page.waitForTimeout(1500);
  await pickCards();
  s = await snap();
  check(s.T > 440, `${name}: minął czas bossa (T=${s.T.toFixed(0)})`);
  check(s.phase === 2, `${name}: faza Bagno Kości`);
  check(await page.isVisible('#bossbar'), `${name}: pasek bossa widoczny`);
  await page.keyboard.press('KeyC');
  await page.waitForSelector('#pause:not(.hide) .sheet');
  check((await page.textContent('#pause .sheet')).includes('Statystyki'), `${name}: karta postaći na C`);
  await page.keyboard.press('Escape');
  check(s.awans, `${name}: awans odebrany`);
  await page.keyboard.up('KeyD');
  await page.screenshot({ path: `smoke-${name}.png` });
}

try {
  await runClass(0, 'wojownik');
  await runClass(1, 'mag');
  await runClass(2, 'lowca');
  await runClass(3, 'czarnoksieznik');

  // śmierć i ekran końca
  await page.goto(`http://127.0.0.1:${PORT}/?debug`);
  await page.click('#go');
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  await page.waitForSelector('#pause:not(.hide)');
  check(true, 'pauza otwiera się na Esc');
  await page.click('#pq');
  await page.waitForSelector('#end:not(.hide)');
  check(true, 'ekran końca po porzuceniu drogi');
  await page.click('#tomenu');
  await page.waitForSelector('#go');
  check(true, 'powrót do menu');

  // spacja w polu imienia
  await page.fill('#nm', '');
  await page.focus('#nm');
  await page.keyboard.type('A B');
  check((await page.inputValue('#nm')) === 'A B', 'spacja działa w polu imienia');
} catch (e) {
  failed = true; console.log('FAIL wyjątek testu: ' + e.message);
}

check(errors.length === 0, `brak błędów konsoli (${errors.length})`);
errors.slice(0, 10).forEach(e => console.log('  ' + e));
await browser.close();
await server.close();
process.exit(failed ? 1 : 0);
