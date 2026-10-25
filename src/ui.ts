import { ACHS, CLASSES, DIFF, SK, TALENTS, TOMES, talentCost } from './data';
import { ARKANA, DECK_SLOTS, PAKTY, pactEffects } from './arkana';
import { CLASS_STATS, FREE_POINTS, Gear, Item, SLOTS, SLOT_NAME, STAT_IDS, STAT_INFO, Slot, StatId } from './items';
import { RARITY, itemColor, rarityOf } from './loot';
import { classIcon, skillIcon, slotIcon } from './icons';
import { RODY, rod as rodById, rodOpens, rodStats } from './rody';
import { Meta, isUnlocked, maxTalent, talent } from './meta';
import { platform } from './platform';

export const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

export interface MenuCtx {
  meta: Meta; sel: { cls: number; start: number };
  onGo(): void; onSelClass(i: number): void; onSelStart(i: number): void; onBuyClass(i: number): void;
  onBuyTalent(id: string): void; onName(n: string): void; onToggle(k: 'mute' | 'calm' | 'hq' | 'diff'): void; onAlloc(id: StatId, d: number): void;
  onBuyArkan(id: string): void; onDeck(id: string): void; onPakt(id: string): void; onRod(id: string): void;
}
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
export { fmt };

export function initMenu(c: MenuCtx) {
  const col = $('menucol');
  col.innerHTML = `
    <h1>Popiółbrama</h1>
    <p class="sub">Alfa v0.3. Idziesz. Reszta dzieje się sama. Trzy strefy, trzech strażników, przystanie po drodze.</p>
    <button class="big" id="go">Nowa droga</button>
    <h3>Ród</h3><div id="rd"></div>
    <h3>Droga</h3><div id="cl"></div><div id="pv"></div>
    <h3>Moc startowa</h3><div id="st" class="row"></div>
    <h3 id="alh"></h3><div id="al"></div>
    <h3>Imię</h3><input id="nm" maxlength="16" />
    <h3 id="ashh"></h3><div id="tl"></div>
    <h3 id="ark"></h3><div id="ar"></div>
    <h3 id="pkh"></h3><div id="pk"></div>
    <h3>Tomy do odblokowania</h3><div id="tu"></div>
    <h3>Kronika</h3><div id="ac"></div>
    <h3>Ustawienia</h3>
    <div class="row"><button class="shop" id="tgm"></button><button class="shop" id="tgc"></button><button class="shop" id="tgq"></button><button class="shop" id="tgd"></button></div>
    <p class="sub" id="foot"></p>`;
  const nm = $<HTMLInputElement>('nm');
  nm.value = c.meta.name;
  nm.oninput = () => c.onName(nm.value || 'Strażnik');
  $('go').onclick = () => c.onGo();
  $('tgm').onclick = () => c.onToggle('mute');
  $('tgc').onclick = () => c.onToggle('calm');
  $('tgq').onclick = () => c.onToggle('hq');
  $('tgd').onclick = () => c.onToggle('diff');
  refreshMenu(c);
}

export function refreshMenu(c: MenuCtx) {
  const m = c.meta;
  const curRod = rodById(m.rod);
  const rd = $('rd'); rd.innerHTML = '';
  for (const r of RODY) {
    const b = document.createElement('button'); b.className = 'cls' + (r.id === curRod.id ? ' sel' : ''); b.style.setProperty('--c', '#e9c46a');
    const rs = rodStats(r), bonus = STAT_IDS.filter(k => rs[k]).map(k => `${rs[k] > 0 ? '+' : ''}${rs[k]} ${STAT_INFO[k].name}`).join(', ');
    b.innerHTML = `<b>${r.name}</b> · ${r.gift.name}<small>${r.lore} ${bonus}. ${r.gift.text}.${r.opens === 'all' ? ' Wszystkie drogi.' : ` Drogi: ${r.opens.map(id => CLASSES.find(x => x.id === id)?.name).join(', ')}.`}</small>`;
    b.onclick = () => c.onRod(r.id); rd.appendChild(b);
  }
  const cl = $('cl'); cl.innerHTML = '';
  CLASSES.forEach((k, i) => {
    const own = m.classes.includes(k.id), open = rodOpens(curRod, k.id);
    const b = document.createElement('button');
    b.className = 'cls' + (i === c.sel.cls ? ' sel' : '') + (own && open ? '' : ' lock'); b.style.setProperty('--c', k.css);
    b.innerHTML = `${classIcon(k.id, k.css)}<b>${k.name}</b> · ${k.bar}${!open ? ` · zamknięta dla rodu ${curRod.name}` : own ? '' : ` · ${k.cost} popiołu`}<small>${k.role}. ${k.desc}</small>`;
    b.onclick = () => { if (!open) return; if (own) c.onSelClass(i); else c.onBuyClass(i); };
    cl.appendChild(b);
  });
  const cur = CLASSES[c.sel.cls];
  const pv = $('pv');
  pv.style.setProperty('--c', cur.css);
  pv.innerHTML = `<div class="pv"><div class="pvh">${classIcon(cur.id, cur.css)}<b>${cur.name}</b><em>${cur.role}</em></div>
    <p>HP ${cur.hp} · tempo ${cur.speed} · pasek: ${cur.bar} (${cur.evtName})</p>
    <div class="pvs">${[cur.basic, ...cur.skills].map((id, i) => `<span class="pvi" title="${SK[id].name}">${skillIcon(id, cur.css)}<small>${i === 0 ? 'auto: ' : ''}${SK[id].name}</small></span>`).join('')}</div>
    ${cur.specs.map(s => `<p><b>${s.name}</b> (poz. 4): ${s.text}</p>`).join('')}</div>`;
  const st = $('st'); st.innerHTML = '';
  cur.starters.forEach((id, i) => {
    const b = document.createElement('button');
    b.className = 'shop' + (i === c.sel.start ? ' on' : ''); b.innerHTML = `${skillIcon(id, cur.css)} ${SK[id].name}`;
    b.onclick = () => c.onSelStart(i); st.appendChild(b);
  });
  $('ashh').textContent = `Ołtarz popiołu: ${m.ash}`;
  const base = CLASS_STATS[cur.id], rs0 = rodStats(curRod);
  const used = STAT_IDS.reduce((s, k) => s + (m.alloc[k] || 0), 0), free = FREE_POINTS - used;
  $('alh').textContent = `Statystyki startowe (wolne punkty: ${free})`;
  const al = $('al'); al.innerHTML = '';
  for (const k of STAT_IDS) {
    const row = document.createElement('div'); row.className = 'srow';
    row.innerHTML = `<span><b>${STAT_INFO[k].name}</b> ${Math.max(0, base[k] + rs0[k] + (m.alloc[k] || 0))}<small>${STAT_INFO[k].text}</small></span>`;
    const minus = document.createElement('button'); minus.textContent = '−'; minus.disabled = (m.alloc[k] || 0) <= 0; minus.onclick = () => c.onAlloc(k, -1);
    const plus = document.createElement('button'); plus.textContent = '+'; plus.disabled = free <= 0; plus.onclick = () => c.onAlloc(k, 1);
    row.append(minus, plus); al.appendChild(row);
  }
  const ac = $('ac'); ac.innerHTML = '';
  for (const a of ACHS) {
    const d = document.createElement('div'); const ok = m.ach.includes(a.id);
    d.className = 'tu' + (ok ? ' ok' : ''); d.textContent = `${ok ? '✓' : '·'} ${a.name}: ${a.text}`; ac.appendChild(d);
  }
  const tl = $('tl'); tl.innerHTML = '';
  let branch = '';
  for (const t of TALENTS) {
    if (t.branch !== branch) { branch = t.branch; const h = document.createElement('div'); h.className = 'br'; h.textContent = branch; tl.appendChild(h); }
    const lvl = talent(m, t.id), cost = talentCost(lvl), maxed = lvl >= maxTalent(t.id);
    const b = document.createElement('button'); b.className = 'shop';
    b.textContent = `${t.name} ${lvl}/${t.max} (${t.text})${maxed ? '' : ` — ${cost}`}`;
    b.disabled = maxed || m.ash < cost; b.onclick = () => c.onBuyTalent(t.id); tl.appendChild(b);
  }
  const ar = $('ar'); ar.innerHTML = '';
  $('ark').textContent = `Talia Arkanów (${m.deck.length}/${DECK_SLOTS})`;
  for (const a of ARKANA) {
    const has = m.arkana.includes(a.id), inDeck = m.deck.includes(a.id);
    const b = document.createElement('button'); b.className = 'shop' + (inDeck ? ' on' : '') + (has ? '' : ' lock');
    if (has) { b.innerHTML = `<b>${a.name}</b> ${inDeck ? '(w talii)' : ''}<small>${a.text}</small>`; b.onclick = () => c.onDeck(a.id); b.disabled = !inDeck && m.deck.length >= DECK_SLOTS; }
    else if (a.src.type === 'buy') { b.innerHTML = `<b>${a.name}</b> — ${a.src.cost} popiołu<small>${a.text}</small>`; b.disabled = m.ash < a.src.cost; b.onclick = () => c.onBuyArkan(a.id); }
    else { b.innerHTML = `<b>${a.name}</b> — wyzwanie<small>${a.src.text}. ${a.text}</small>`; b.disabled = true; }
    ar.appendChild(b);
  }
  const heat = pactEffects(m.pakty).heat;
  $('pkh').textContent = `Pakty (ciężar ${heat}, popiół x${pactEffects(m.pakty).ashMult.toFixed(2)})`;
  const pk = $('pk'); pk.innerHTML = '';
  for (const p of PAKTY) {
    const b = document.createElement('button'); b.className = 'shop' + (m.pakty.includes(p.id) ? ' on' : '');
    b.innerHTML = `<b>${p.name}</b> · ciężar ${p.heat}<small>${p.text}</small>`; b.onclick = () => c.onPakt(p.id); pk.appendChild(b);
  }
  const tu = $('tu'); tu.innerHTML = '';
  for (const t of TOMES) {
    if (t.unlock.type === 'start') continue;
    const d = document.createElement('div'); const ok = isUnlocked(m, t);
    d.className = 'tu' + (ok ? ' ok' : ''); d.textContent = `${t.name}: ${ok ? 'odblokowany' : t.unlock.text}`; tu.appendChild(d);
  }
  $('tgm').textContent = m.mute ? 'Dźwięk: wyłączony' : 'Dźwięk: włączony';
  $('tgc').textContent = m.calm ? 'Mniej błysków: tak' : 'Mniej błysków: nie';
  $('tgq').textContent = m.hq ? 'Grafika: wysoka' : 'Grafika: niska';
  $('tgd').textContent = `Trudność: ${DIFF[m.diff]?.name ?? 'Normalna'}`;
  const ctl = platform.primaryTouch
    ? 'Dotknij i przeciągnij kciukiem: ruch. Przycisk UNIK po prawej. II: pauza.'
    : 'WASD ruch, Shift lub prawy przycisk myszy unik, Spacja skok, Esc pauza, C postać, F pełny ekran, kółko myszy zoom, Enter start. Pad: lewa gałka, A unik, X skok, Start pauza.';
  $('foot').innerHTML = `Najdłuższa droga: ${fmt(m.best)}. Śmierci: ${m.deaths}.<br>${ctl}<br><span style="color:#777">Wykryto: ${platform.label}</span>`;
}

// ---------- HUD ----------
export interface HudView {
  hp: number; max: number; res: number; resName: string; resCss: string; xp: number; need: number; time: string; phase: string;
  level: number; kills: number; chips: string[]; info: string; boss?: { name: string; frac: number } | null; flask?: string; gold?: number;
}
export function updateHud(v: HudView) {
  $('hpf').style.width = Math.max(0, (v.hp / v.max) * 100) + '%';
  $('hpt').textContent = `${Math.ceil(v.hp)} / ${v.max}`;
  const rf = $('rsf'); rf.style.width = Math.min(100, v.res) + '%'; rf.style.background = v.resCss;
  $('rst').textContent = `${v.resName} ${Math.floor(v.res)}`;
  $('xpf').style.width = (v.xp / v.need) * 100 + '%';
  $('stat').innerHTML = `${v.time}<br>${v.phase}<br>Poz. ${v.level} · ${v.kills}${v.gold !== undefined ? `<br><span class="gold">Grosze ${v.gold}</span>` : ''}${v.flask ? `<br>${v.flask}` : ''}`;
  const chips = $('chips'); const key = v.chips.join('|');
  if (chips.dataset.k !== key) { chips.dataset.k = key; chips.innerHTML = v.chips.map(c => `<span>${c}</span>`).join(''); }
  $('info').textContent = v.info;
  const bb = $('bossbar');
  if (v.boss) { bb.classList.remove('hide'); $('bossname').textContent = v.boss.name; $('bossf').style.width = Math.max(0, v.boss.frac * 100) + '%'; }
  else bb.classList.add('hide');
}

export interface SlotView { letter: string; name: string; rank: number; frac: number; active: boolean; icon?: string }
let slotEls: { box: HTMLElement; l: HTMLElement; cd: HTMLElement; pips: HTMLElement }[] = [];
export function buildSlots(css: string) {
  const s = $('slots'); s.innerHTML = ''; slotEls = [];
  for (let i = 0; i < 5; i++) {
    const box = document.createElement('div'); box.className = 'slot empty'; box.style.setProperty('--c', css);
    box.innerHTML = '<span class="l"></span><div class="cd"></div><b class="pips"></b>';
    s.appendChild(box);
    slotEls.push({ box, l: box.querySelector('.l')!, cd: box.querySelector('.cd')!, pips: box.querySelector('.pips')! });
  }
}
export function updateSlots(slots: (SlotView | null)[], res: { frac: number; letter: string; icon?: string }) {
  for (let i = 0; i < 4; i++) {
    const s = slots[i], e = slotEls[i];
    if (!s) continue;
    e.box.classList.remove('empty'); e.box.classList.toggle('act', s.active);
    if (e.l.dataset.k !== s.name) { e.l.dataset.k = s.name; e.l.innerHTML = s.icon ?? s.letter; e.box.title = s.name; }
    e.pips.textContent = '●'.repeat(s.rank) + '○'.repeat(5 - s.rank);
    e.cd.style.height = Math.max(0, Math.min(1, s.frac)) * 100 + '%';
  }
  const e = slotEls[4];
  e.box.classList.remove('empty'); e.box.classList.toggle('act', res.frac >= 1);
  if (e.l.dataset.k !== res.letter) { e.l.dataset.k = res.letter; e.l.innerHTML = res.icon ?? res.letter; }
  e.pips.textContent = '';
  e.cd.style.height = (1 - Math.min(1, res.frac)) * 100 + '%';
}

export function setDodge(frac: number) {
  const d = $('dodge');
  d.style.setProperty('--p', String(Math.round(frac * 360)) + 'deg');
  d.classList.toggle('ready', frac >= 1);
}

let toastT = 0;
export function toast(msg: string) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = window.setTimeout(() => t.classList.remove('show'), 2600);
}

// ---------- karty ----------
export interface CardView { title: string; text: string; tag: string; color: string; pips?: [number, number]; hint?: string; evo?: boolean; score?: number; icon?: string }
let cardKeys: ((e: KeyboardEvent) => void) | null = null;
export function hideCards() {
  $('lvl').classList.add('hide');
  if (cardKeys) { removeEventListener('keydown', cardKeys); cardKeys = null; }
}
export function showCards(o: { title: string; sub?: string; cards: CardView[]; rerolls?: number; onPick(i: number): void; onReroll?(): void }) {
  hideCards();
  const box = $('lvl'); box.classList.remove('hide');
  box.innerHTML = `<h2>${o.title}</h2>${o.sub ? `<div class="sub">${o.sub}</div>` : ''}<div class="cards"></div>`;
  const wrap = box.querySelector('.cards')!;
  const born = performance.now();
  const pick = (i: number) => { if (performance.now() - born < 350) return; hideCards(); o.onPick(i); };
  o.cards.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'card' + (c.evo ? ' evo' : ''); b.style.setProperty('--c', c.color);
    const pips = c.pips ? `<div class="pp">${'●'.repeat(c.pips[0])}<i>${'●'.repeat(Math.max(0, c.pips[1] - c.pips[0]))}</i>${'○'.repeat(Math.max(0, 5 - c.pips[1]))}</div>` : '';
    b.innerHTML = `<span class="k">${i + 1}</span><b>${c.icon ?? ''}${c.title}</b>${pips}<small>${c.text}</small>${c.hint ? `<div class="hint">${c.hint}</div>` : ''}<span class="chip">${c.tag}</span>`;
    b.onclick = () => pick(i); wrap.appendChild(b);
  });
  if (o.onReroll && (o.rerolls ?? 0) > 0) {
    const r = document.createElement('button'); r.className = 'shop rr'; r.textContent = `Przerzuć (${o.rerolls})`;
    r.onclick = () => { if (performance.now() - born < 350) return; hideCards(); o.onReroll!(); };
    box.appendChild(r);
  }
  cardKeys = e => { const n = Number(e.key); if (n >= 1 && n <= o.cards.length) pick(n - 1); };
  addEventListener('keydown', cardKeys);
}

// ---------- koniec i pauza ----------
export function showEnd(o: { victory: boolean; title: string; lines: string[]; bars: { name: string; frac: number; val: number }[]; unlocks: string[]; css: string; onAgain(): void; onMenu(): void }) {
  const box = $('end'); box.classList.remove('hide');
  box.innerHTML = `<h2>${o.title}</h2>${o.lines.map(l => `<div>${l}</div>`).join('')}
    <div class="bars">${o.bars.map(b => `<div class="bar2"><span>${b.name}</span><i style="width:${Math.max(3, b.frac * 100)}%;background:${o.css}"></i><em>${b.val}</em></div>`).join('')}</div>
    ${o.unlocks.map(u => `<div class="unl">Odblokowano: ${u}</div>`).join('')}
    <button class="big" id="again">Jeszcze raz</button><button class="shop" id="tomenu">Wróć na cmentarz</button>`;
  $('again').onclick = () => { box.classList.add('hide'); o.onAgain(); };
  $('tomenu').onclick = () => { box.classList.add('hide'); o.onMenu(); };
}
export function showPause(o: { muted: boolean; calm: boolean; sheet?: string; onResume(): void; onToggle(k: 'mute' | 'calm'): void; onQuit(): void }) {
  const box = $('pause'); box.classList.remove('hide');
  box.innerHTML = `<h2>Pauza</h2>${o.sheet ? `<div class="sheet">${o.sheet}</div>` : ''}<button class="big" id="pr">Wróć do walki</button>
    <button class="shop" id="pm">${o.muted ? 'Dźwięk: wyłączony' : 'Dźwięk: włączony'}</button>
    <button class="shop" id="pc">${o.calm ? 'Mniej błysków: tak' : 'Mniej błysków: nie'}</button>
    <button class="shop" id="pq">Porzuć drogę</button>`;
  $('pr').onclick = () => o.onResume();
  $('pm').onclick = () => { o.onToggle('mute'); showPause({ ...o, muted: !o.muted }); };
  $('pc').onclick = () => { o.onToggle('calm'); showPause({ ...o, calm: !o.calm }); };
  $('pq').onclick = () => o.onQuit();
}
export const hidePause = () => $('pause').classList.add('hide');

export function updateGear(g: Gear) {
  const box = $('gear'); const key = SLOTS.map(s => g[s]?.id ?? '-').join('|');
  if (box.dataset.k === key) return; box.dataset.k = key;
  box.innerHTML = SLOTS.map(s => {
    const it = g[s], c = it ? itemColor(it) : '#666';
    return `<span class="gs${it ? '' : ' empty'}" style="border-color:${c};color:${c}" title="${it ? `${it.name}: ${it.desc}` : SLOT_NAME[s]}">${slotIcon(s, c)}</span>`;
  }).join('');
}

// ---------- ekwipunek (klawisz I) ----------
export interface InvView {
  title: string; classCss: string; classId: string; items: Partial<Record<Slot, Item>>; classTag: string;
  stats: string; powers: string; extra?: string; onClose(): void;
}
export const itemDetail = (it: Item | undefined, slot: Slot, classId: string): string => {
  if (!it) return `<h4 style="color:#888">${SLOT_NAME[slot]}</h4><p><em>Puste miejsce. Zdobycz z elit, skrzyń i strażników.</em></p>`;
  const r = RARITY[rarityOf(it)], lines = (it.lines ?? [it.desc]).map(l => `<p>${l}</p>`).join('');
  const only = it.cls ? `<p class="only">Tylko: ${CLASSES.find(c => c.id === it.cls)?.name ?? it.cls}${it.cls === classId ? '' : ' (nie twoja droga)'}</p>` : '';
  const base = it.base && it.base !== it.name ? `<p><em>${it.base}</em></p>` : '';
  return `<h4 style="color:${r.css}">${it.name}</h4><p><em>${r.name} · ${SLOT_NAME[slot]}${it.tier ? ` · stopień ${it.tier}` : ''}</em></p>${base}${lines}${only}`;
};
export function showInventory(o: InvView) {
  const box = $('inv'); box.classList.remove('hide'); $('hud').classList.add('dim');
  box.innerHTML = `<h2>${o.title}</h2>
    <div class="invgrid">${SLOTS.map(s => { const it = o.items[s], c = it ? itemColor(it) : '#555'; return `<button class="islot${it ? '' : ' empty'}" data-s="${s}" style="--c:${c}">${slotIcon(s, c)}${it ? it.name : SLOT_NAME[s]}</button>`; }).join('')}</div>
    <div class="idetail" id="idet"><h4>Wybierz miejsce</h4><p><em>Dotknij przedmiotu, by zobaczyć szczegóły.</em></p></div>
    <div class="st">${o.stats}${o.powers}</div>${o.extra ?? ''}
    <button class="big" id="invx">Zamknij (I)</button>`;
  const det = box.querySelector('#idet')!;
  box.querySelectorAll<HTMLButtonElement>('.islot').forEach(b => {
    b.onclick = () => { box.querySelectorAll('.islot').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); const s = b.dataset.s as Slot; det.innerHTML = itemDetail(o.items[s], s, o.classId); };
  });
  $('invx').onclick = () => o.onClose();
}
export const hideInventory = () => { $('inv').classList.add('hide'); $('hud').classList.remove('dim'); };

// ---------- przystań ----------
export interface TownAction { label: string; cost: number; enabled: boolean; onClick(): void }
export interface TownStation { id: string; title: string; text: string; color: string; icon: string; actions: TownAction[] }
export function showTown(o: { title: string; sub: string; gold: number; stations: TownStation[]; onLeave(): void }) {
  const box = $('town'); box.classList.remove('hide'); $('hud').classList.add('dim');
  box.innerHTML = `<h2>${o.title}</h2><div class="sub">${o.sub}</div><div class="sub gold">Grosze: ${o.gold}</div><div class="tcards"></div><button class="big" id="townx">Ruszaj dalej</button>`;
  const wrap = box.querySelector('.tcards')!;
  for (const s of o.stations) {
    const d = document.createElement('div'); d.className = 'tcard'; d.style.setProperty('--c', s.color); d.dataset.st = s.id;
    d.innerHTML = `<b>${s.icon}${s.title}</b><small>${s.text}</small>`;
    for (const a of s.actions) {
      const b = document.createElement('button'); b.textContent = a.cost ? `${a.label} — ${a.cost}` : a.label; b.disabled = !a.enabled; b.onclick = () => a.onClick(); d.appendChild(b);
    }
    wrap.appendChild(d);
  }
  $('townx').onclick = () => o.onLeave();
}
export const hideTown = () => { $('town').classList.add('hide'); $('hud').classList.remove('dim'); };

const markEls: HTMLElement[] = [];
export function setMarkers(ms: { x: number; y: number; kind: string }[]) {
  const layer = $('marks');
  while (markEls.length < ms.length) { const e = document.createElement('div'); layer.appendChild(e); markEls.push(e); }
  const pad = 36, w = innerWidth, h = innerHeight;
  markEls.forEach((e, i) => {
    const m = ms[i];
    if (!m) { e.style.display = 'none'; return; }
    const cx = Math.min(w - pad, Math.max(pad, m.x)), cy = Math.min(h - 120, Math.max(pad + 60, m.y));
    const off = cx !== m.x || cy !== m.y;
    e.style.display = off || m.kind === 'boss' ? 'block' : 'none';
    e.className = 'mk ' + m.kind; e.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    e.textContent = m.kind === 'boss' ? '\u2620' : m.kind === 'chest' ? '\u25c6' : '\u2726';
  });
}
