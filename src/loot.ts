// Łup w stylu Diablo II: jakości, przedrostki/przyrostki (u nas przyrostki w dopełniaczu), unikaty przypisane do klasy.
import { Item, Mods, Rarity, STAT_IDS, STAT_INFO, Slot, StatId, Gear, RELICS, makeAmulet, makeArmor, makeRing, makeWeapon } from './items';

export const RARITY: Record<Rarity, { name: string; css: string; rank: number }> = {
  zwykly: { name: 'Zwykły', css: '#d0d0d0', rank: 0 },
  magiczny: { name: 'Magiczny', css: '#6aa2ff', rank: 1 },
  rzadki: { name: 'Rzadki', css: '#ffd24a', rank: 2 },
  unikalny: { name: 'Unikalny', css: '#ff9a3a', rank: 3 },
};

interface Target { mod?: keyof Mods; stat?: StatId; atk?: boolean; armor?: boolean }
interface AffixDef { id: string; word: string; label: string; slots: Slot[] | null; per: number; unit: 'pct' | 'flat'; target: Target; minTier?: number }

export const AFFIXES: AffixDef[] = [
  { id: 'rzez', word: 'Rzezi', label: 'obrażeń', slots: null, per: 0.025, unit: 'pct', target: { mod: 'dmg' } },
  { id: 'poscig', word: 'Pośpiechu', label: 'szybsze moce', slots: null, per: 0.02, unit: 'pct', target: { mod: 'cdr' } },
  { id: 'wicher', word: 'Wichru', label: 'prędkości', slots: null, per: 0.02, unit: 'pct', target: { mod: 'speed' } },
  { id: 'oko', word: 'Oka', label: 'słabego punktu', slots: null, per: 0.03, unit: 'pct', target: { mod: 'crit' } },
  { id: 'mur', word: 'Muru', label: 'życia', slots: null, per: 8, unit: 'flat', target: { mod: 'hp' } },
  { id: 'wiedza', word: 'Wiedzy', label: 'doświadczenia', slots: null, per: 0.04, unit: 'pct', target: { mod: 'xp' } },
  { id: 'krew', word: 'Krwi', label: 'obrażeń leczy', slots: null, per: 0.008, unit: 'pct', target: { mod: 'lifesteal' } },
  { id: 'mech', word: 'Mchu', label: 'regeneracji na s', slots: null, per: 0.25, unit: 'flat', target: { mod: 'regen' } },
  { id: 'cien', word: 'Cienia', label: 'szybszy unik', slots: null, per: 0.04, unit: 'pct', target: { mod: 'dodgeCd' } },
  { id: 'wrona', word: 'Wrony', label: 'zasięgu zbierania', slots: null, per: 0.8, unit: 'flat', target: { mod: 'magnet' } },
  { id: 'tur', word: 'Tura', label: 'Siły', slots: null, per: 0.4, unit: 'flat', target: { stat: 'sila' } },
  { id: 'wilk', word: 'Wilka', label: 'Zwinności', slots: null, per: 0.4, unit: 'flat', target: { stat: 'zwin' } },
  { id: 'dab', word: 'Dębu', label: 'Krzepy', slots: null, per: 0.4, unit: 'flat', target: { stat: 'krz' } },
  { id: 'sowa', word: 'Sowy', label: 'Umysłu', slots: null, per: 0.4, unit: 'flat', target: { stat: 'umysl' } },
  { id: 'swit', word: 'Świtu', label: 'Wiary', slots: null, per: 0.4, unit: 'flat', target: { stat: 'wiara' } },
  { id: 'ostrze', word: 'Ostrza', label: 'ataku', slots: ['bron', 'pierscien'], per: 1.6, unit: 'flat', target: { atk: true } },
  { id: 'stal', word: 'Stali', label: 'pancerza', slots: ['pancerz', 'amulet', 'pierscien'], per: 1.5, unit: 'flat', target: { armor: true } },
  { id: 'los', word: 'Losu', label: 'przerzutu kart', slots: ['amulet', 'pierscien', 'relikt'], per: 1, unit: 'flat', target: { mod: 'rerolls' }, minTier: 4 },
];

const RARE_A = ['Kieł', 'Szept', 'Żar', 'Cień', 'Zew', 'Całun', 'Szpon', 'Kikut', 'Płacz', 'Wrzask', 'Czerń', 'Gnat'];
const RARE_B = ['Grobu', 'Popiołu', 'Wrony', 'Mgły', 'Bagien', 'Krypty', 'Zmierzchu', 'Cierni', 'Pogrzebu', 'Szczątków'];

export interface Unique { id: string; cls: string; slot: Slot; name: string; base: string; atk: number; mods: Partial<Mods>; stats?: Partial<Record<StatId, number>>; fx: string; text: string }
export const UNIQUES: Unique[] = [
  { id: 'u-wojownik', cls: 'wojownik', slot: 'bron', name: 'Rdza Tura', base: 'Miecz', atk: 17, mods: { dmg: 0.08 }, stats: { sila: 2 }, fx: 'rdza', text: 'Każde cięcie karmi gniew' },
  { id: 'u-mag', cls: 'mag', slot: 'bron', name: 'Berło Zapłonu', base: 'Żerdź', atk: 17, mods: { cdr: 0.08 }, stats: { umysl: 2 }, fx: 'zaplon', text: 'Podpalenia palą o 60% mocniej' },
  { id: 'u-lowca', cls: 'lowca', slot: 'bron', name: 'Cięciwa Echa', base: 'Łuk', atk: 17, mods: { crit: 0.06 }, stats: { zwin: 2 }, fx: 'echostrzal', text: 'Co czwarty strzał leci podwójnie' },
  { id: 'u-czarnoksieznik', cls: 'czarnoksieznik', slot: 'bron', name: 'Kosa Dusz', base: 'Sierp', atk: 17, mods: { lifesteal: 0.01 }, stats: { umysl: 2 }, fx: 'zniwodusz', text: 'Zabici dają podwójnie dusz' },
  { id: 'u-paladyn', cls: 'paladyn', slot: 'bron', name: 'Młot Świtu', base: 'Młot', atk: 17, mods: { hp: 20 }, stats: { wiara: 2 }, fx: 'swit', text: 'Wiara rośnie dwa razy szybciej' },
  { id: 'u-lotr', cls: 'lotr', slot: 'bron', name: 'Sztylet Ciszy', base: 'Sztylet', atk: 16, mods: { speed: 0.06 }, stats: { zwin: 2 }, fx: 'cisza', text: 'Słaby punkt boli o połowę mocniej' },
  { id: 'u-druid', cls: 'druid', slot: 'bron', name: 'Kij Korzeni', base: 'Kij', atk: 17, mods: { regen: 1 }, stats: { krz: 2 }, fx: 'korzen', text: 'Aury spowalniają wrogów' },
  { id: 'u-szaman', cls: 'szaman', slot: 'bron', name: 'Totem Burzy', base: 'Kostur', atk: 17, mods: { cdr: 0.06 }, stats: { umysl: 2 }, fx: 'burzatotem', text: 'Pioruny przeskakują na sąsiada' },
];
export const uniqueFor = (cls: string) => UNIQUES.find(u => u.cls === cls);

function makeUnique(u: Unique): Item {
  const lines = [`Atak ${u.atk}`, u.text];
  return { id: u.id, slot: u.slot, name: u.name, base: u.base, tier: 5, atk: u.atk, mods: u.mods, stats: u.stats, fx: u.fx, rarity: 'unikalny', cls: u.cls, lines, desc: lines.join('. ') };
}

type Rng = () => number;
const pick = <T,>(a: T[], rng: Rng) => a[Math.min(a.length - 1, Math.floor(rng() * a.length))];

export function rollRarity(tier: number, bonus: number, rng: Rng = Math.random): Rarity {
  const w = { zwykly: Math.max(8, 52 - tier * 4 - bonus * 24), magiczny: 34, rzadki: 10 + tier * 2.5 + bonus * 22 };
  const total = w.zwykly + w.magiczny + w.rzadki;
  let r = rng() * total;
  if ((r -= w.zwykly) < 0) return 'zwykly';
  if ((r -= w.magiczny) < 0) return 'magiczny';
  return 'rzadki';
}

export function uniqueChance(tier: number, bonus: number) { return 0.015 + tier * 0.01 + bonus * 0.18; }

function fmt(def: AffixDef, v: number) {
  if (def.unit === 'pct') return `+${Math.round(v * 100)}% ${def.label}`;
  if (def.target.stat) return `+${v} ${def.label}`;
  return `+${Number.isInteger(v) ? v : v.toFixed(1)} ${def.label}`;
}

/** Dokłada losowe afiksy zgodnie z jakością. Zwykły przedmiot zwraca się bez zmian. */
export function withRarity(item: Item, rarity: Rarity, rng: Rng = Math.random): Item {
  if (rarity === 'zwykly' || rarity === 'unikalny') return { ...item, rarity: 'zwykly', lines: [item.desc] };
  const n = rarity === 'magiczny' ? (rng() < 0.55 ? 1 : 2) : (rng() < 0.55 ? 3 : 4);
  const pool = AFFIXES.filter(a => (!a.slots || a.slots.includes(item.slot)) && (a.minTier ?? 0) <= item.tier);
  const chosen: AffixDef[] = [];
  while (chosen.length < n && pool.length) chosen.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  const out: Item = { ...item, mods: { ...(item.mods ?? {}) }, stats: { ...(item.stats ?? {}) }, rarity, base: item.name };
  const f = rarity === 'rzadki' ? 1.1 : 1;
  const lines = [item.desc];
  for (const a of chosen) {
    const raw = a.per * item.tier * (0.8 + rng() * 0.5) * f;
    const v = a.unit === 'flat' && a.target.mod !== 'regen' && a.target.mod !== 'magnet' ? Math.max(1, Math.round(raw)) : a.unit === 'pct' ? Math.round(raw * 100) / 100 : Math.round(raw * 10) / 10;
    const t = a.target;
    if (t.mod) out.mods![t.mod] = (out.mods![t.mod] ?? 0) + v;
    else if (t.stat) out.stats![t.stat] = (out.stats![t.stat] ?? 0) + v;
    else if (t.atk) out.atk = (out.atk ?? 0) + v;
    else if (t.armor) out.armor = (out.armor ?? 0) + v;
    lines.push(fmt(a, v));
  }
  out.name = rarity === 'magiczny' ? `${item.name}${item.slot === 'amulet' || item.slot === 'pierscien' ? ' i ' : ' '}${chosen[0].word}` : `${pick(RARE_A, rng)} ${pick(RARE_B, rng)}`;
  out.id = `${item.id}-${rarity[0]}${chosen.map(c => c.id[0]).join('')}${Math.floor(rng() * 1000)}`;
  out.lines = lines; out.desc = lines.join('. ');
  return out;
}

export interface LootOpts { cls: string; tier: number; n?: number; rng?: Rng; relicChance?: number; have?: Gear; bonus?: number }
export function rollLoot(o: LootOpts): Item[] {
  const rng = o.rng ?? Math.random, n = o.n ?? 3, bonus = o.bonus ?? 0, have = o.have ?? {};
  const tier = Math.max(1, Math.min(5, Math.round(o.tier)));
  const base: Item[] = [
    makeWeapon(o.cls, tier), makeArmor(tier),
    makeAmulet(['kiel', 'mgla', 'krew', 'oko', 'burs', 'gniew'][Math.floor(rng() * 6)], tier),
    makeRing(STAT_IDS[Math.floor(rng() * STAT_IDS.length)], tier),
  ];
  const pool = base.map(it => withRarity(it, rollRarity(tier, bonus, rng), rng));
  if (rng() < (o.relicChance ?? 0.3)) {
    const rs = RELICS.filter(r => r.id !== have.relikt?.id);
    const r = pick(rs, rng);
    pool.push({ ...r, rarity: 'rzadki', lines: [r.desc] });
  }
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const out = pool.slice(0, n);
  const u = uniqueFor(o.cls);
  if (u && have.bron?.id !== u.id && rng() < uniqueChance(tier, bonus)) out[out.length - 1] = makeUnique(u);
  else {
    const better = pool.filter(it => it.slot !== 'relikt' && (have[it.slot]?.tier ?? 0) < it.tier);
    if (better.length && !out.some(x => better.includes(x))) out[out.length - 1] = better[0];
  }
  return out;
}

export const rarityOf = (it?: Item): Rarity => it?.rarity ?? 'zwykly';
export const itemColor = (it?: Item) => RARITY[rarityOf(it)].css;
export const statLine = (k: StatId, v: number) => `+${v} ${STAT_INFO[k].name}`;

/** Prosty wynik siły przedmiotu do porównań (bot, podgląd): atak, pancerz, premie. */
export function itemScore(it: Item): number {
  const m = it.mods ?? {};
  let s = (it.atk ?? 0) * 1.2 + (it.armor ?? 0);
  s += (m.dmg ?? 0) * 60 + (m.cdr ?? 0) * 50 + (m.crit ?? 0) * 40 + (m.speed ?? 0) * 30 + (m.hp ?? 0) * 0.25 + (m.xp ?? 0) * 15 + (m.lifesteal ?? 0) * 120 + (m.regen ?? 0) * 3 + (m.dodgeCd ?? 0) * 25;
  for (const k of STAT_IDS) s += (it.stats?.[k] ?? 0) * 3;
  if (it.rarity === 'unikalny') s += 12;
  return Math.round(s * 10) / 10;
}
