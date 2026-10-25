import { chromium } from 'playwright';
import { createServer } from 'vite';
const server = await createServer({ server: { port: 5194, host: '127.0.0.1' }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
await ctx.addInitScript(() => localStorage.setItem('popiolbrama.meta2', JSON.stringify({ classes: ['wojownik', 'mag', 'lowca', 'czarnoksieznik'], mute: true, hq: true, ash: 0 })));
const page = await ctx.newPage();
page.on('pageerror', e => console.log('pageerror', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('console', m.text()); });
await page.goto('http://127.0.0.1:5194/?debug');
await page.waitForSelector('#go');
for (let i = 1; i <= 4; i++) { await page.click(`#cl .cls:nth-child(${i})`); await page.waitForTimeout(900); await page.screenshot({ path: `shot-hero${i}.png`, clip: { x: 560, y: 60, width: 720, height: 600 } }); }
await page.click('#cl .cls:nth-child(1)');
await page.click('#go');
await page.waitForTimeout(500);
await page.evaluate(() => { const g = window.__g; g.god(true); g.noSpawn(); g.freeze(true); g.zoom(0.7); });
await page.evaluate(() => {
  const g = window.__g, row1 = ['szczur', 'wilk', 'szkielet', 'topielec', 'zgnilec', 'czarownik'];
  row1.forEach((t, i) => g.spawnAt(t, -7.5 + i * 3, -3));
  ['krypta', 'alfa', 'krol', 'zniwiarz'].forEach((t, i) => g.spawnAt(t, -9 + i * 6, -13));
  ['szczur', 'szkielet', 'wilk'].forEach((t, i) => g.spawnAt(t, -4 + i * 4, 3, true));
});
await page.waitForTimeout(1200);
await page.screenshot({ path: 'shot-lineup.png' });
await page.evaluate(() => { window.__g.freeze(false); window.__g.zoom(0.8); });
await page.evaluate(() => { const g = window.__g; g.sim(g.time() + 0.01, true); });
await page.waitForTimeout(2500);
await page.screenshot({ path: 'shot-fight.png' });
await browser.close(); await server.close();

