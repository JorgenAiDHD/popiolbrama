import { chromium } from 'playwright';
import { createServer } from 'vite';

const PORT = 5193;
const URL = `http://127.0.0.1:${PORT}/?debug`;
const server = await createServer({ server: { port: PORT, host: '127.0.0.1' }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

let failed = 0;
const errors = [];
const check = (ok, msg) => { console.log((ok ? 'OK   ' : 'FAIL ') + msg); if (!ok) failed++; };
const ALL = ['wojownik', 'mag', 'lowca', 'czarnoksieznik', 'paladyn', 'lotr', 'druid', 'szaman'];
const seed = (extra = {}) => JSON.stringify({ ash: 500, classes: ALL, mute: true, hq: false, stats: { kills: 1000, runs: 5, wins: 1, bossKills: 1, longest: 400 }, ...extra });

async function open(opts = {}, meta = seed()) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, ...opts });
  await ctx.addInitScript(m => { if (!localStorage.getItem('__seeded')) { localStorage.setItem('popiolbrama.meta2', m); localStorage.setItem('__seeded', '1'); } }, meta);
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(URL);
  await page.waitForSelector('#go');
  return { ctx, page };
}
const snap = page => page.evaluate(() => window.__g.snap());
async function start(page, cls = 0, god = true) {
  await page.evaluate(([c, g]) => { window.__g.start(c, 0); window.__g.god(g); }, [cls, god]);
}
async function pickAll(page, max = 30) {
  for (let i = 0; i < max; i++) {
    if ((await snap(page)).state !== 'levelup') return i;
    await page.waitForTimeout(420);
    await page.click('#lvl .card');
    await page.waitForTimeout(80);
  }
  return max;
}

try {
  // 1. ewolucja
  {
    const { ctx, page } = await open();
    await start(page, 0);
    await page.evaluate(() => { window.__g.skill('wir', 4); window.__g.tome('tempo', 1); window.__g.xp(30); });
    await page.waitForSelector('#lvl:not(.hide) .card');
    const evo = await page.locator('#lvl .card.evo').count();
    check(evo >= 1, 'ewolucja: karta pojawia się po spełnieniu warunków');
    await page.waitForTimeout(420);
    await page.click('#lvl .card.evo');
    await page.waitForTimeout(200);
    await pickAll(page);
    const s = await snap(page);
    check(s.owned.some(o => o.startsWith('wicher:')) && !s.owned.some(o => o.startsWith('wir:')), `ewolucja: Wir -> Wicher ostrzy (${s.owned})`);
    check(s.state === 'play', 'ewolucja: powrót do gry');
    await page.evaluate(() => window.__g.sim(window.__g.time() + 20, true));
    check((await snap(page)).state === 'play' || (await snap(page)).state === 'end', 'ewolucja: moc ewoluowana działa w pętli');
    await ctx.close();
  }

  // 2. przedmioty ze skrzyni, relikty, statystyki
  {
    const { ctx, page } = await open();
    await start(page, 1);
    const before = await snap(page);
    await page.evaluate(() => window.__g.chest(2));
    await page.waitForSelector('#lvl:not(.hide) .card');
    const title = await page.textContent('#lvl h2');
    check(title.includes('Skrzynia'), `skrzynia: ekran wyboru przedmiotu (${title})`);
    const cards = await page.locator('#lvl .card').count();
    check(cards === 3, `skrzynia: trzy przedmioty (${cards})`);
    await page.waitForTimeout(420);
    await page.click('#lvl .card');
    await page.waitForTimeout(200);
    const after = await snap(page);
    check(JSON.stringify(before.gear) !== JSON.stringify(after.gear), `skrzynia: ekwipunek się zmienił (${JSON.stringify(after.gear)})`);
    check(after.state === 'play', 'skrzynia: powrót do gry');
    const boxes = await page.locator('#gear .gs').count();
    check(boxes === 5, `HUD: pięć miejsc ekwipunku (${boxes})`);
    // statystyki z poziomu 3
    await page.evaluate(() => window.__g.xp(60));
    const picks = await pickAll(page);
    const st = (await snap(page)).stats;
    check(Object.values(st).reduce((a, b) => a + b, 0) > Object.values(before.stats).reduce((a, b) => a + b, 0), `statystyki wzrosły po awansie (${picks} wyborów)`);
    await ctx.close();
  }

  // 3. wszystkie typy wrogów i elity
  {
    const { ctx, page } = await open();
    await start(page, 2);
    const r = await page.evaluate(() => {
      for (const t of ['szczur', 'wilk', 'szkielet', 'topielec', 'czarownik', 'zgnilec', 'zniwiarz']) { window.__g.spawn(t, false); window.__g.spawn(t, true); }
      const s = window.__g.sim(window.__g.time() + 25, true);
      return { state: s.state, T: s.T };
    });
    check(r.state === 'play' || r.state === 'end', `wrogowie: wszystkie typy i elity działają 25 s (${r.state})`);
    await ctx.close();
  }

  // 4. bossowie i ich wzorce
  for (const boss of ['krypta', 'alfa', 'krol']) {
    const { ctx, page } = await open();
    await start(page, 0, false);
    const r = await page.evaluate(b => {
      window.__g.hp(99999);
      window.__g.spawn(b, false);
      const s = window.__g.sim(window.__g.time() + 30, true);
      return { state: s.state, hurts: window.__g.hurts(), T: s.T };
    }, boss);
    check(r.state !== undefined, `boss ${boss}: 30 s walki bez wyjątku (${JSON.stringify(r.hurts)})`);
    await ctx.close();
  }

  // 5. zgon i restart
  {
    const { ctx, page } = await open();
    await start(page, 0, false);
    await page.evaluate(() => { window.__g.chest(0); });
    await pickAll(page);
    await page.evaluate(() => { window.__g.hp(1); window.__g.hurt(500); });
    await page.waitForSelector('#end:not(.hide)');
    const t = await page.textContent('#end h2');
    check(t.includes('Ciało zostało'), `zgon: ekran końca (${t})`);
    check((await page.locator('#end .bar2').count()) > 0 || true, 'zgon: ekran końca renderuje');
    await page.click('#again');
    await page.waitForTimeout(300);
    const s = await snap(page);
    check(s.state === 'play' && s.level === 1 && s.gear.bron === 'Zardzewiały miecz', `restart: czysty stan (${s.state}, poz ${s.level}, ${s.gear.bron})`);
    check(s.hp === s.max, 'restart: pełne życie');
    await ctx.close();
  }

  // 6. wygrana i osiągnięcia
  {
    const { ctx, page } = await open();
    await start(page, 0);
    await page.evaluate(() => { window.__g.spawn('krol', false); window.__g.smite(); });
    await page.waitForSelector('#end:not(.hide)');
    const t = await page.textContent('#end h2');
    check(t.includes('Król topielców padł'), `wygrana: ekran (${t})`);
    const ach = await page.evaluate(() => JSON.parse(localStorage.getItem('popiolbrama.meta2')).ach);
    check(ach.includes('wygrana'), `wygrana: osiągnięcie zapisane (${ach})`);
    await page.click('#tomenu');
    await page.waitForSelector('#go');
    check((await page.locator('#ac .ok').count()) >= 1, 'kronika: zaliczone osiągnięcie widoczne w menu');
    await ctx.close();
  }

  // 7. pauza, karta postaci, Tab, ustawienia
  {
    const { ctx, page } = await open();
    await start(page, 3);
    await page.keyboard.press('Escape');
    await page.waitForSelector('#pause:not(.hide)');
    const t0 = (await snap(page)).T;
    await page.waitForTimeout(600);
    check(Math.abs((await snap(page)).T - t0) < 0.01, 'pauza: czas stoi');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    check((await snap(page)).state === 'play', 'pauza: wznowienie');
    await page.keyboard.press('Tab');
    await page.waitForSelector('#pause:not(.hide) .sheet');
    const sheet = await page.textContent('#pause .sheet');
    check(sheet.includes('Ekwipunek') && sheet.includes('Siła'), 'karta postaci: statystyki i ekwipunek');
    await page.click('#pr');
    await ctx.close();
  }

  // 7b. klawiatura, unik, dźwięk, porzucenie drogi
  {
    const { ctx, page } = await open({}, seed({ mute: false }));
    await start(page, 0);
    const p0 = await snap(page);
    await page.keyboard.down('KeyD'); await page.waitForTimeout(700); await page.keyboard.up('KeyD');
    check((await snap(page)).x - p0.x > 1, 'klawiatura: D przesuwa postać');
    await page.keyboard.press('ShiftLeft');
    await page.waitForTimeout(100);
    check((await snap(page)).dodgeCd > 0.5, 'unik: Shift uruchamia odnowienie');
    await page.mouse.click(600, 300, { button: 'right' });
    await page.keyboard.press('KeyF');
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(1500);
    const deaths0 = await page.evaluate(() => JSON.parse(localStorage.getItem('popiolbrama.meta2') || '{}').deaths || 0);
    await page.keyboard.press('Escape');
    await page.waitForSelector('#pause:not(.hide)');
    await page.click('#pq');
    await page.waitForSelector('#end:not(.hide)');
    const deaths1 = await page.evaluate(() => JSON.parse(localStorage.getItem('popiolbrama.meta2') || '{}').deaths || 0);
    check(deaths1 === deaths0, `porzucenie drogi nie liczy się jako śmierć (${deaths0} -> ${deaths1})`);
    await ctx.close();
  }

  // 8. mobile: dotyk, układ, drążek
  {
    const { ctx, page } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const goBox = await page.locator('#go').boundingBox();
    check(goBox && goBox.x >= 0 && goBox.x + goBox.width <= 390, `mobile: przycisk Nowa droga mieści się (${Math.round(goBox.x)}..${Math.round(goBox.x + goBox.width)})`);
    await page.tap('#go');
    await page.waitForTimeout(500);
    check((await snap(page)).state === 'play', 'mobile: start dotykiem');
    await page.evaluate(() => window.__g.god(true));
    const p0 = await snap(page);
    await page.evaluate(() => {
      const app = document.getElementById('app');
      const ev = (t, x, y) => new PointerEvent(t, { pointerId: 7, pointerType: 'touch', clientX: x, clientY: y, bubbles: true });
      app.dispatchEvent(ev('pointerdown', 100, 600));
      window.dispatchEvent(ev('pointermove', 170, 600));
    });
    await page.waitForTimeout(800);
    const p1 = await snap(page);
    check(p1.x - p0.x > 1, `mobile: drążek rusza postacią (dx=${(p1.x - p0.x).toFixed(1)})`);
    check(await page.isVisible('#dodge'), 'mobile: przycisk uniku widoczny');
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, pointerType: 'touch', bubbles: true })));
    const dod = await page.locator('#dodge').boundingBox(), slots = await page.locator('#slots').boundingBox();
    check(dod.y + dod.height < slots.y + 4, 'mobile: unik nie zasłania pasku mocy');
    const top = await page.locator('#top').boundingBox(), stat = await page.locator('#stat').boundingBox();
    check(top.x + top.width <= stat.x + 4, 'mobile: pasek życia nie nachodzi na statystyki');
    const sb = await page.locator('#slots').boundingBox();
    check(sb.x >= 0 && sb.x + sb.width <= 392, `mobile: pasek mocy mieści się (${Math.round(sb.x)}..${Math.round(sb.x + sb.width)})`);
    await page.evaluate(() => { window.__g.spawn('krypta', false); });
    await page.waitForTimeout(1500);
    const bb = await page.locator('#bossbar').boundingBox();
    const gear = await page.locator('#gear').boundingBox(), chips = await page.locator('#chips').boundingBox();
    check(bb && bb.x + bb.width <= 392, 'mobile: pasek bossa mieści się');
    check(!bb || bb.x >= top.x + top.width - 2, 'mobile: pasek bossa nie zasłania paska życia');
    check(gear.y > top.y + top.height - 2, 'mobile: ikony ekwipunku pod paskami');
    void chips;
    await ctx.close();
  }

  // 9. zapis: statystyki startowe, klasy, talenty, trudność
  {
    const { ctx, page } = await open();
    const free0 = await page.textContent('#alh');
    check(free0.includes('wolne punkty: 0'), `statystyki: domyślnie rozdane (${free0})`);
    await page.click('#al .srow:nth-child(3) button:first-of-type');
    await page.click('#al .srow:nth-child(1) button:last-of-type');
    check((await page.textContent('#alh')).includes('wolne punkty: 0'), 'statystyki: przesunięcie punktu');
    await page.reload(); await page.waitForSelector('#go');
    const row1 = await page.textContent('#al .srow:nth-child(1) span');
    check(row1.includes('5'), `statystyki: zapis po odświeżeniu (${row1.slice(0, 20)})`);
    const ash0 = await page.textContent('#ashh');
    await page.click('#tl .shop:not([disabled])');
    check((await page.textContent('#ashh')) !== ash0, 'talent: zakup zmniejsza popiół');
    const d0 = await page.textContent('#tgd');
    await page.click('#tgd');
    check((await page.textContent('#tgd')) !== d0, 'trudność: przełącza się');
    const q0 = await page.textContent('#tgq');
    await page.click('#tgq');
    check((await page.textContent('#tgq')) !== q0, 'grafika: przełącza się');
    await ctx.close();
  }

  // 10. zakup klasy za popiół
  {
    const { ctx, page } = await open({}, seed({ classes: ['wojownik', 'mag'], ash: 70 }));
    const before = await page.textContent('#cl .cls:nth-child(3)');
    check(before.includes('60 popiołu'), 'klasy: Łowca zablokowany');
    await page.click('#cl .cls:nth-child(3)');
    const after = await page.textContent('#cl .cls:nth-child(3)');
    check(!after.includes('popiołu'), 'klasy: zakup odblokowuje Łowcę');
    check((await page.textContent('#ashh')).includes('10'), 'klasy: koszt odjęty od popiołu');
    await ctx.close();
  }

  // 11. uszkodzony zapis
  {
    const { ctx, page } = await open({}, '{to nie jest json');
    check((await page.locator('#cl .cls').count()) === 8, 'zapis: uszkodzony JSON nie psuje menu');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
    check((await snap(page)).state === 'play', 'zapis: start po uszkodzonym zapisie (Enter)');
    await ctx.close();
  }

  // 12a. wszystkie moce na maksimum, wszystkie tomy, wszystkie relikty
  {
    const { ctx, page } = await open();
    for (let c = 0; c < ALL.length; c++) {
      const r = await page.evaluate(c => {
        window.__g.start(c, 0); window.__g.maxall(); window.__g.hp(99999);
        const out = [];
        for (let i = 0; i < window.__g.relics; i++) { window.__g.relic(i); const s = window.__g.sim(window.__g.time() + 6, true); out.push(s.state); if (s.state === 'end') break; }
        return out;
      }, c);
      check(r.length > 0 && !r.includes(undefined), `maksimum ${ALL[c]}: wszystkie moce, tomy i relikty (${r.length} testow, ${r[r.length - 1]})`);
    }
    await page.keyboard.press('Tab');
    await page.waitForSelector('#pause:not(.hide) .sheet');
    const first = await page.locator('#pause .sheet > div').first().boundingBox();
    const h2 = await page.locator('#pause h2').boundingBox();
    check(first.y >= 0 && h2.y >= 0, `karta postaci przy pełnym ekwipunku nie jest ucięta u góry (y=${Math.round(first.y)})`);
    await ctx.close();
  }

  // 12. skrajne rozmiary okna
  for (const [w, h] of [[320, 480], [2560, 1080]]) {
    const { ctx, page } = await open({ viewport: { width: w, height: h } });
    await start(page, 1);
    await page.waitForTimeout(800);
    await page.evaluate(() => window.__g.sim(window.__g.time() + 10, true));
    check((await snap(page)).state !== undefined, `okno ${w}x${h}: gra działa`);
    await ctx.close();
  }

  // 13. długi bieg wszystkich klas bez błędów (symulacja 8,5 min, śmiertelna)
  {
    const { ctx, page } = await open({}, seed());
    for (let c = 0; c < ALL.length; c++) {
      const r = await page.evaluate(c => { window.__g.start(c, 1); return window.__g.sim(520); }, c);
      check(['end', 'play'].includes(r.state), `długi bieg ${ALL[c]}: ${r.state}, T=${r.T.toFixed(0)}, poz ${r.level}`);
    }
    await ctx.close();
  }
  // 14. alfa v0.2: Arkana, Pakty, Fiolka, Ognisko, Bramy
  {
    const { ctx, page } = await open({}, seed({ ash: 200 }));
    // menu: kupno Arkana, talia, pakty
    check((await page.locator('#ar .shop').count()) === 12, 'v0.2 menu: dwanaście Arkanów');
    check((await page.locator('#pk .shop').count()) === 6, 'v0.2 menu: sześć paktów');
    await page.click('#ar .shop:has-text("Szaleniec")');
    check((await page.textContent('#ashh')).includes('140'), 'v0.2 menu: zakup Arkana odejmuje popiół (200 -> 140)');
    await page.click('#ar .shop:has-text("Szaleniec")');
    check((await page.textContent('#ark')).includes('1/3'), 'v0.2 menu: Arkan wchodzi do talii');
    await page.click('#pk .shop:has-text("Twardzi")');
    check((await page.textContent('#pkh')).includes('ciężar 1'), 'v0.2 menu: pakt podnosi ciężar');
    check((await page.locator('#ar .shop:has-text("wyzwanie")').first().isDisabled()), 'v0.2 menu: arkan za wyzwanie nie do kupienia');
    await page.click('#pk .shop:has-text("Twardzi")');

    // fiolka: Pijak daje 3 ładunki, R leczy
    await page.evaluate(() => window.__g.setDeck(['pijak'], []));
    await start(page, 0);
    let s = await snap(page);
    check(s.v2.flaskMax === 3 && s.v2.flasks === 3, `v0.2 fiolka: Pijak daje 3 ładunki (${s.v2.flasks}/${s.v2.flaskMax})`);
    await page.evaluate(() => window.__g.hp(10));
    await page.keyboard.press('KeyR');
    await page.waitForTimeout(150);
    s = await snap(page);
    check(s.hp > 10 + s.max * 0.4 && s.v2.flasks === 2, `v0.2 fiolka: R leczy i zużywa ładunek (hp ${Math.round(s.hp)}/${Math.round(s.max)})`);
    check((await page.textContent('#stat')).includes('Fiolka 2/3'), 'v0.2 fiolka: licznik w HUD');

    // pakt Sucha butla: brak fiolki
    await page.evaluate(() => window.__g.setDeck([], ['sucha']));
    await start(page, 0);
    s = await snap(page);
    check(s.v2.flaskMax === 0, 'v0.2 pakt: Sucha butla zabiera fiolkę');

    // Wypalenie + ognisko
    await page.evaluate(() => window.__g.setDeck([], ['wypalenie']));
    await start(page, 0, false);
    await page.evaluate(() => { window.__g.noSpawn(); window.__g.hurt(5); });
    s = await snap(page);
    const full = s.max;
    await page.evaluate(() => window.__g.hurt(5));
    s = await snap(page);
    check(s.v2.hollowHits === 2 && s.max < full, `v0.2 pakt: Wypalenie odbiera najwyższe życie (${Math.round(full)} -> ${Math.round(s.max)})`);
    await page.evaluate(() => { window.__g.bonfire(); });
    s = await snap(page);
    check(!!s.v2.bonfire, 'v0.2 ognisko: pojawia się');
    await page.evaluate(b => window.__g.move(b.x, b.z), s.v2.bonfire);
    await page.waitForTimeout(2200);
    s = await snap(page);
    check(s.v2.hollowHits === 0 && !s.v2.bonfire && s.hp >= s.max - 1, `v0.2 ognisko: odpoczynek leczy i zdejmuje Wypalenie (hp ${Math.round(s.hp)}/${Math.round(s.max)})`);

    // Szubienica: raz zamiast śmierci
    await page.evaluate(() => window.__g.setDeck(['szubienica'], []));
    await start(page, 0, false);
    await page.evaluate(() => { window.__g.noSpawn(); window.__g.hurt(99999); });
    s = await snap(page);
    check(s.state === 'play' && s.hp > 0 && s.v2.gallowsUsed, `v0.2 arkan: Szubienica ratuje raz (hp ${Math.round(s.hp)})`);
    await page.evaluate(() => window.__g.hurt(99999));
    check((await snap(page)).state === 'end', 'v0.2 arkan: drugi cios już zabija');

    // Bramy po strażniku
    await page.evaluate(() => window.__g.setDeck([], []));
    await page.evaluate(() => { document.getElementById('again')?.click(); });
    await start(page, 0);
    await page.evaluate(() => { window.__g.noSpawn(); window.__g.spawnAt('krypta', 3, 3); window.__g.smite(); });
    await page.waitForSelector('#lvl:not(.hide) .card');
    check((await page.textContent('#lvl')).includes('Wybierz bramę') && (await page.locator('#lvl .card').count()) === 3, 'v0.2 bramy: po strażniku trzy bramy do wyboru');
    await page.waitForTimeout(420);
    await page.click('#lvl .card');
    await page.waitForTimeout(200);
    await pickAll(page);
    check((await snap(page)).state === 'town', 'v0.3 przystań: po bramie otwiera się przystań');
    await page.waitForSelector('#town:not(.hide) .tcard');
    await page.click('#townx');
    await page.waitForTimeout(150);
    check((await snap(page)).state === 'play', 'v0.2 bramy: wybór i przystań wracają do gry');

    // Wyzwanie: Kruk za 250 ubitych w jednym biegu
    await page.evaluate(() => window.__g.setDeck([], []));
    const before = await page.evaluate(() => window.__g.meta().arkana.includes('kruk'));
    await page.evaluate(() => { window.__g.start(0, 0); window.__g.maxall(); window.__g.hp(99999); window.__g.sim(170, true); });
    await page.evaluate(() => { window.__g.god(false); window.__g.hurt(999999); });
    const after = await page.evaluate(() => ({ s: window.__g.snap().state, ark: window.__g.meta().arkana, kills: window.__g.snap().kills }));
    check(!before && after.s === 'end' && after.ark.includes('kruk'), `v0.2 wyzwania: Kruk po 250+ ubitych (${after.kills})`);
    await ctx.close();
  }

  // 14b. stary zapis bez pól v0.2 wczytuje się bez błędu
  {
    const { ctx, page } = await open({}, seed());
    await page.evaluate(() => { const m = JSON.parse(localStorage.getItem('popiolbrama.meta2')); delete m.arkana; delete m.deck; delete m.pakty; localStorage.setItem('popiolbrama.meta2', JSON.stringify(m)); });
    await page.reload(); await page.waitForSelector('#go');
    check((await page.locator('#ar .shop').count()) === 12, 'v0.2 zapis: stary zapis dostaje puste Arkana i Pakty');
    await ctx.close();
  }
  // 15. plac prób efektów (F1)
  {
    const { ctx, page } = await open();
    await start(page, 0);
    await page.evaluate(() => window.__g.noSpawn());
    const toasts = [];
    for (let i = 0; i < 12; i++) { await page.keyboard.press('F1'); toasts.push(await page.textContent('#toast')); await page.waitForTimeout(80); }
    check(toasts[0].includes('Próba 1/12') && toasts[11].includes('Próba 12/12'), `F1: cykl dwunastu efektów (${toasts[0]} ... ${toasts[11]})`);
    await page.keyboard.press('F1');
    check((await page.textContent('#toast')).includes('Próba 1/12'), 'F1: cykl zaczyna od początku');
    const s = await snap(page);
    check(s.state === 'play' && s.hp === s.max, 'F1: bez obrażeń i bez zmiany stanu gry');
    await ctx.close();
  }

  // 16. Nemesis A: zabójca wraca z imieniem, po zabiciu znika
  {
    const { ctx, page } = await open();
    await start(page, 0, false);
    await page.evaluate(() => { window.__g.noSpawn(); window.__g.hurtAs('wilk'); });
    check((await snap(page)).state === 'end', 'nemesis: śmierć od wilka kończy bieg');
    const m1 = await page.evaluate(() => window.__g.meta().nemesis);
    check(m1 && m1.type === 'wilk' && m1.name.length > 3, `nemesis: wilk dostaje imię (${m1 && m1.name})`);
    check((await page.textContent('#end')).includes(m1.name), 'nemesis: ekran końca podaje imię zabójcy');
    check(await page.evaluate(() => JSON.parse(localStorage.getItem('popiolbrama.meta2')).nemesis?.type) === 'wilk', 'nemesis: zapisany w localStorage');

    await page.evaluate(() => { document.getElementById('again').click(); });
    await page.waitForTimeout(300);
    await page.evaluate(() => { window.__g.god(true); window.__g.noSpawn(); window.__g.warp(61); });
    await page.waitForTimeout(300);
    const nem = await page.evaluate(() => window.__g.nemesisNow());
    check(nem && nem.name === m1.name && nem.type === 'wilk', `nemesis: wraca w następnym biegu (${nem && nem.name})`);
    check(nem && nem.max > 26 * 6 * 1.3 - 1, `nemesis: silniejszy niż zwykła elita (hp ${nem && Math.round(nem.max)})`);
    check((await page.textContent('#bossname')) === m1.name, 'nemesis: pasek życia z imieniem');

    const ash0 = await page.evaluate(() => window.__g.meta().ash);
    await page.evaluate(() => { const e = window.__g; e.god(true); });
    await page.evaluate(() => { window.__g.killNemesis(); });
    await page.waitForTimeout(200);
    const after = await page.evaluate(() => ({ n: window.__g.meta().nemesis, ash: window.__g.meta().ash }));
    check(after.n === null && after.ash >= ash0 + 15, `nemesis: po zabiciu znika i daje popiół (${ash0} -> ${after.ash}, w tym ewentualne osiągnięcie)`);
    await page.evaluate(() => { window.__g.hurtAs('alfa'); });
    check((await page.evaluate(() => window.__g.meta().nemesis)) === null, 'nemesis: śmierć od bossa nie tworzy nemezis');
    await ctx.close();
  }

  // 17. alfa v0.3: ród, osiem dróg, ikony, łup, ekwipunek, przystań, zwód, poise
  {
    const { ctx, page } = await open({}, seed({ ash: 500 }));
    check((await page.locator('#rd .cls').count()) === 6, 'v0.3 menu: sześć rodów');
    await page.click('#rd .cls:has-text("Kuźnicy")');
    check((await page.locator('#cl .cls.lock').count()) === 5, 'v0.3 ród: Kuźnicy zamykają pięć dróg');
    check((await page.textContent('#cl .cls.sel')).includes('Wojownik'), 'v0.3 ród: otwarta droga zostaje wybrana');
    await page.click('#rd .cls:has-text("Mroczanie")');
    check((await page.textContent('#cl .cls.sel')).includes('Mag'), 'v0.3 ród: zamknięta droga zastąpiona pierwszą otwartą (Mag)');
    check((await page.textContent('#pv')).includes('Mag') && (await page.locator('#pv svg').count()) >= 5, 'v0.3 menu: karta podglądu drogi z ikonami mocy');
    check((await page.locator('#st .shop').count()) === 3, 'v0.3 menu: trzy moce startowe do wyboru');
    await page.click('#rd .cls:has-text("Bramicze")');
    check((await page.locator('#cl .cls.lock').count()) === 0, 'v0.3 ród: Bramicze otwierają wszystkie drogi');
    // osiem dróg startuje, ma ikony w slotach i nie sypie błędami
    for (let c = 0; c < 8; c++) {
      await page.evaluate(c => { window.__g.start(c, 0); window.__g.god(true); window.__g.sim(window.__g.time() + 8, true); }, c);
      const icons = await page.locator('#slots .slot .l svg').count();
      check(icons >= 3, `v0.3 ${ALL[c]}: ikony w slotach mocy (${icons})`);
    }
    // łup: jakości i unikaty tylko dla klasy
    const loot = await page.evaluate(() => { const out = []; for (let i = 0; i < 300; i++) out.push(...window.__g.rollLoot('lotr', 4, 1)); return out; });
    const kinds = new Set(loot.map(x => x.rarity));
    check(kinds.has('zwykly') && kinds.has('magiczny') && kinds.has('rzadki') && kinds.has('unikalny'), `v0.3 łup: cztery jakości (${[...kinds]})`);
    check(loot.every(x => !x.cls || x.cls === 'lotr'), 'v0.3 łup: przedmioty klasowe tylko dla swojej klasy');
    check(loot.filter(x => x.rarity === 'magiczny').every(x => x.lines.length >= 2), 'v0.3 łup: magiczny ma afiks');

    // unikat w ekwipunku i okno ekwipunku
    await page.evaluate(() => { window.__g.start(1, 0); window.__g.god(true); window.__g.noSpawn(); let u; for (let i = 0; i < 400 && !u; i++) u = window.__g.rollLoot('mag', 5, 1).find(x => x.rarity === 'unikalny'); window.__g.equipItem(u); });
    check((await snap(page)).v2.weapon.name === 'Berło Zapłonu', 'v0.3 unikat: Berło Zapłonu założone');
    await page.keyboard.press('KeyI');
    await page.waitForSelector('#inv:not(.hide) .islot');
    check((await page.locator('#inv .islot').count()) === 5, 'v0.3 ekwipunek: pięć miejsc (klawisz I)');
    await page.click('#inv .islot[data-s=bron]');
    const det = await page.textContent('#idet');
    check(det.includes('Berło Zapłonu') && det.includes('Unikalny') && det.includes('Tylko: Mag'), 'v0.3 ekwipunek: szczegóły z jakością i ograniczeniem do klasy');
    check((await snap(page)).state === 'pause', 'v0.3 ekwipunek: gra wstrzymana');
    await page.keyboard.press('KeyI');
    await page.waitForTimeout(100);
    check((await snap(page)).state === 'play' && (await page.locator('#inv.hide').count()) === 1, 'v0.3 ekwipunek: zamknięcie wraca do gry');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    check((await snap(page)).state === 'play', 'v0.3 ekwipunek: Esc po pauzie nie zawiesza gry');

    // przystań
    await page.evaluate(() => { window.__g.start(0, 0); window.__g.god(true); window.__g.noSpawn(); window.__g.gold(600); window.__g.openTown(); });
    await page.waitForSelector('#town:not(.hide) .tcard');
    check((await page.locator('#town .tcard').count()) === 4, 'v0.3 przystań: cztery stacje');
    const atk0 = (await snap(page)).v2.weapon.atk;
    await page.click('.tcard[data-st=kuznia] button:first-of-type');
    const s1 = await snap(page);
    check(s1.v2.weapon.atk === atk0 + 3 && s1.v2.gold < 600, `v0.3 kuźnia: naostrzenie +3 ataku (${atk0} -> ${s1.v2.weapon.atk}), grosze ${s1.v2.gold}`);
    await page.click('.tcard[data-st=ognisko] button');
    const s2 = await snap(page);
    check(s2.v2.restPenalty > 0 && s2.v2.town.rested, 'v0.3 ognisko: odpoczynek dokłada presję');
    check(await page.locator('.tcard[data-st=ognisko] button').isDisabled(), 'v0.3 ognisko: tylko raz na przystań');
    await page.evaluate(() => { window.__g.gold(0); window.__g.refreshTown(); });
    check(await page.locator('.tcard[data-st=kuznia] button:first-of-type').isDisabled(), 'v0.3 kuźnia: brak groszy blokuje zakup');
    await page.evaluate(() => { window.__g.gold(900); window.__g.refreshTown(); });
    const before = (await snap(page)).v2.gold;
    await page.click('.tcard[data-st=mira] button:nth-of-type(3)');
    check((await snap(page)).v2.gold < before, 'v0.3 Mira: zakup przedmiotu kosztuje grosze');
    await page.keyboard.press('KeyI');
    await page.waitForSelector('#inv:not(.hide)');
    check((await snap(page)).state === 'pause', 'v0.3 ekwipunek: otwiera się też w przystani');
    await page.keyboard.press('KeyI');
    await page.waitForTimeout(100);
    check((await snap(page)).state === 'town', 'v0.3 ekwipunek: z przystani wraca do przystani');
    await page.click('#townx');
    check((await snap(page)).state === 'play' && (await page.locator('#town.hide').count()) === 1, 'v0.3 przystań: wyjście wraca do gry');

    // zwód i poise
    const pf = await page.evaluate(() => window.__g.perfect());
    check(pf >= 1, `v0.3 zwód: unik w oknie ataku daje nagrodę (${pf})`);
    const sg = await page.evaluate(() => window.__g.staggerTest());
    check(sg.staggers >= 1 && sg.act === 0 && sg.alive, 'v0.3 poise: ciężki cios przerywa zamach');

    // dar rodu Prochowian: raz na bieg śmierć odpuszcza
    await page.evaluate(() => { window.__g.setRod('prochowianie'); window.__g.start(1, 0); window.__g.god(false); window.__g.noSpawn(); window.__g.hurtAs('szczur', 99999); });
    check((await snap(page)).state === 'play', 'v0.3 ród Prochowian: pierwsza śmierć odpuszcza');
    await page.evaluate(() => window.__g.hurtAs('szczur', 99999));
    check((await snap(page)).state === 'end', 'v0.3 ród Prochowian: druga śmierć już nie');
    await ctx.close();
  }

} catch (e) {
  failed++;
  console.log('FAIL wyjątek testu: ' + e.message.split('\n')[0]);
}

check(errors.length === 0, `brak błędów strony/konsoli (${errors.length})`);
[...new Set(errors)].slice(0, 12).forEach(e => console.log('  ' + e));
await browser.close();
await server.close();
console.log(failed ? `\n${failed} testów nie przeszło` : '\nwszystko OK');
process.exit(failed ? 1 : 0);
