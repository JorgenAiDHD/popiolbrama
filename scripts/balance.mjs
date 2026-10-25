import { chromium } from 'playwright';
import { createServer } from 'vite';

const RUNS = Number(process.argv[2] || 4);
const server = await createServer({ server: { port: 5197, host: '127.0.0.1' }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 500, height: 400 } });
await ctx.addInitScript(() => localStorage.setItem('popiolbrama.meta2', JSON.stringify({ classes: ['wojownik', 'mag', 'lowca', 'czarnoksieznik', 'paladyn', 'lotr', 'druid', 'szaman'], mute: true, stats: { kills: 1000, runs: 5, wins: 1, bossKills: 1, longest: 200 } })));
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://127.0.0.1:5197/?debug');
const names = ['wojownik', 'mag', 'lowca', 'czarnoksieznik', 'paladyn', 'lotr', 'druid', 'szaman'];
const only = (process.argv[3] || '0,1,2,3,4,5,6,7').split(',').map(Number);
// czwarty argument "boss": boty walczące wręcz idą do bossa (domyślnie nie, dla porównywalności z wcześniejszymi wynikami)
const bossBot = process.argv[4] === 'boss';
await page.evaluate(v => window.__g.botBoss(v), bossBot);
console.log(bossBot ? 'bot: wręcz idzie do bossa' : 'bot: domyślny (wręcz goni najbliższego)');
for (const c of only) {
  const rows = [];
  for (let r = 0; r < RUNS; r++) {
    const res = await page.evaluate(([c, r]) => { window.__g.start(c, r % 2); return window.__g.sim(520); }, [c, r]);
    rows.push(res);
  }
  const wins = rows.filter(r => r.bosses.includes('krol')).length;
  const avg = k => (rows.reduce((s, r) => s + r[k], 0) / rows.length).toFixed(1);
  console.log(`${names[c].padEnd(15)} wygrane ${wins}/${RUNS}  śr.czas ${avg('T')}s  śr.poziom ${avg('level')}  śr.zabici ${avg('kills')}  spec ${rows.map(r => r.spec || '-').join(',')}`);
  console.log('   końcowe moce:', rows[0].owned.join(' '), '| tomy:', JSON.stringify(rows[0].tomes));
  const bc = rows.reduce((m, r) => { for (const b of r.bosses) m[b] = (m[b] || 0) + 1; return m; }, {});
  const hb = rows.reduce((m, r) => { for (const [k, v] of Object.entries(r.hurtBy)) m[k] = (m[k] || 0) + v; return m; }, {});
  const topHurt = Object.entries(hb).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k}:${Math.round(v / rows.length)}`).join(' ');
  const dm = rows.reduce((m, r) => { for (const [k, v] of Object.entries(r.dmg)) m[k] = (m[k] || 0) + v; return m; }, {});
  const topDmg = Object.entries(dm).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k}:${Math.round(v / rows.length)}`).join(' ');
  console.log(`   bossowie (ile prób pokonało): ${JSON.stringify(bc)} | obrażenia od: ${topHurt} | zadane: ${topDmg}`);
}
if (errors.length) console.log('BŁĘDY:', errors.slice(0, 5));
await browser.close(); await server.close();
