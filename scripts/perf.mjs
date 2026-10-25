import { chromium } from 'playwright';
import { createServer } from 'vite';
const server = await createServer({ server: { port: 5192, host: '127.0.0.1' }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const hq of [false, true]) {
  const ctx = await browser.newContext({ viewport: { width: 800, height: 450 } });
  await ctx.addInitScript(h => localStorage.setItem('popiolbrama.meta2', JSON.stringify({ mute: true, hq: h })), hq);
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5192/?debug');
  await page.waitForSelector('#go');
  await page.click('#go');
  await page.evaluate(() => { window.__g.god(true); window.__g.noSpawn(); window.__g.freeze(true); });
  for (const n of [10, 60, 150]) {
    await page.evaluate(n => { for (let i = 0; i < n; i++) { const a = (i / n) * 6.28 * 3, r = 4 + (i % 9) * 2; window.__g.spawnAt(['szczur', 'wilk', 'szkielet', 'topielec', 'zgnilec', 'czarownik'][i % 6], Math.cos(a) * r, Math.sin(a) * r); } }, n);
    await page.waitForTimeout(3500);
    const s = await page.evaluate(() => ({ ...window.__g.snap(), ...window.__g.calls() }));
    console.log(`hq=${hq} wrogów=${s.enemies} fps=${s.fps} draw calls=${s.calls} trójkąty=${s.tris}`);
    await page.evaluate(() => window.__g.freeze(false));
    await page.evaluate(() => { const g = window.__g; g.smite(); });
    await page.evaluate(() => window.__g.freeze(true));
  }
  await ctx.close();
}
await browser.close(); await server.close();
