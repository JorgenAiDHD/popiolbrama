export type StatId = 'sila' | 'zwin' | 'krz' | 'umysl' | 'wiara';
export type Stats = Record<StatId, number>;
export const STAT_IDS: StatId[] = ['sila', 'zwin', 'krz', 'umysl', 'wiara'];
export const STAT_INFO: Record<StatId, { name: string; text: string }> = {
  sila: { name: 'Siła', text: '+3% obrażeń, ciosy +2% więcej' },
  zwin: { name: 'Zwinność', text: '+2% prędkości, +1% słabego punktu, krótszy unik' },
  krz: { name: 'Krzepa', text: '+8 życia, +0,15 regeneracji' },
  umysl: { name: 'Umysł', text: '+2% szybsze moce, +3% doświadczenia' },
  wiara: { name: 'Wiara', text: '+2% mniej obrażeń, życie za zabicie' },
};
export const CLASS_STATS: Record<string, Stats> = {
  wojownik: { sila: 4, zwin: 1, krz: 3, umysl: 0, wiara: 1 },
  mag: { sila: 0, zwin: 1, krz: 1, umysl: 4, wiara: 2 },
  lowca: { sila: 1, zwin: 4, krz: 1, umysl: 1, wiara: 1 },
  czarnoksieznik: { sila: 1, zwin: 1, krz: 1, umysl: 3, wiara: 2 },
  paladyn: { sila: 3, zwin: 0, krz: 3, umysl: 0, wiara: 3 },
  lotr: { sila: 2, zwin: 4, krz: 0, umysl: 2, wiara: 0 },
  druid: { sila: 1, zwin: 2, krz: 2, umysl: 2, wiara: 2 },
  szaman: { sila: 1, zwin: 1, krz: 2, umysl: 3, wiara: 2 },
};
export const FREE_POINTS = 3;
export const emptyStats = (): Stats => ({ sila: 0, zwin: 0, krz: 0, umysl: 0, wiara: 0 });

export type Slot = 'bron' | 'pancerz' | 'amulet' | 'pierscien' | 'relikt';
export const SLOTS: Slot[] = ['bron', 'pancerz', 'amulet', 'pierscien', 'relikt'];
export const SLOT_NAME: Record<Slot, string> = { bron: 'Broń', pancerz: 'Pancerz', amulet: 'Amulet', pierscien: 'Pierścień', relikt: 'Relikt' };

export interface Mods { crit: number; speed: number; lifesteal: number; xp: number; hp: number; dmg: number; magnet: number; regen: number; cdr: number; dodgeCd: number; rerolls: number }
export const emptyMods = (): Mods => ({ crit: 0, speed: 0, lifesteal: 0, xp: 0, hp: 0, dmg: 0, magnet: 0, regen: 0, cdr: 0, dodgeCd: 0, rerolls: 0 });

export type Rarity = 'zwykly' | 'magiczny' | 'rzadki' | 'unikalny';
export interface Item {
  id: string; slot: Slot; name: string; tier: number; desc: string;
  atk?: number; armor?: number; stats?: Partial<Stats>; mods?: Partial<Mods>; fx?: string;
  rarity?: Rarity; cls?: string; lines?: string[]; base?: string;
}
export type Gear = Partial<Record<Slot, Item>>;

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
const WEAPONS: Record<string, { names: string[]; atk: number[] }> = {
  wojownik: { names: ['Zardzewiały miecz', 'Miedziany miecz', 'Brązowy miecz', 'Żelazny miecz', 'Klinga popiołu'], atk: [5, 7, 9, 14, 22] },
  mag: { names: ['Sucha żerdź', 'Żerdź żaru', 'Żerdź cierniowa', 'Żerdź grobu', 'Berło popiołu'], atk: [5, 7, 10, 15, 22] },
  lowca: { names: ['Drewniany łuk', 'Jesionowy łuk', 'Łuk myśliwski', 'Żelazny łuk', 'Cięciwa bramy'], atk: [5, 7, 10, 15, 22] },
  czarnoksieznik: { names: ['Sierp grabarza', 'Kościany sierp', 'Żelazny sierp', 'Sierp echa', 'Kosa żniwiarza'], atk: [5, 7, 10, 15, 22] },
  paladyn: { names: ['Maczuga wikariusza', 'Miedziany młot', 'Brązowy młot', 'Żelazny młot', 'Młot świtu'], atk: [5, 7, 9, 14, 22] },
  lotr: { names: ['Zardzewiały nóż', 'Miedziany sztylet', 'Brązowy sztylet', 'Stalowy sztylet', 'Kieł nocy'], atk: [4, 6, 9, 14, 21] },
  druid: { names: ['Sękaty kij', 'Kij z jesionu', 'Kij omszały', 'Kij korzeni', 'Kij matki lasu'], atk: [5, 7, 10, 15, 22] },
  szaman: { names: ['Kościany kostur', 'Kostur z kłów', 'Kostur burzy', 'Kostur gromu', 'Totem niebios'], atk: [5, 7, 10, 15, 22] },
};
const ARMORS = { names: ['Łachmany', 'Skórzana kurta', 'Kolczuga', 'Płytowy napierśnik', 'Zbroja popiołu'], armor: [2, 4, 7, 11, 16] };

const AMULETS: { id: string; name: string; text: (t: number) => string; mods: (t: number) => Partial<Mods> }[] = [
  { id: 'kiel', name: 'Kieł wilka', text: t => `+${4 * t}% słabego punktu`, mods: t => ({ crit: 0.04 * t }) },
  { id: 'mgla', name: 'Mglisty talizman', text: t => `+${3 * t}% prędkości`, mods: t => ({ speed: 0.03 * t }) },
  { id: 'krew', name: 'Krwawy wisior', text: t => `${(1.5 * t).toFixed(1)}% obrażeń leczy`, mods: t => ({ lifesteal: 0.015 * t }) },
  { id: 'oko', name: 'Oko mędrca', text: t => `+${6 * t}% doświadczenia`, mods: t => ({ xp: 0.06 * t }) },
  { id: 'burs', name: 'Bursztynowy amulet', text: t => `+${12 * t} życia`, mods: t => ({ hp: 12 * t }) },
  { id: 'gniew', name: 'Znak gniewu', text: t => `+${4 * t}% obrażeń`, mods: t => ({ dmg: 0.04 * t }) },
];
const RING_ADJ = ['Miedziany', 'Brązowy', 'Żelazny', 'Srebrny', 'Popielny'];
const RING_NAME: Record<StatId, string> = { sila: 'Siły', zwin: 'Zwinności', krz: 'Krzepy', umysl: 'Umysłu', wiara: 'Wiary' };
const ringVal = (t: number) => 1 + Math.floor(t / 2);

export const RELICS: Item[] = [
  { id: 'r-wrona', slot: 'relikt', name: 'Szczątek wrony', tier: 0, desc: 'Klejnoty lecą do ciebie z daleka.', mods: { magnet: 4 } },
  { id: 'r-zab', slot: 'relikt', name: 'Ząb alfy', tier: 0, desc: 'Unik wraca o 35% szybciej.', mods: { dodgeCd: 0.35 } },
  { id: 'r-czara', slot: 'relikt', name: 'Popielna czara', tier: 0, desc: 'Poziom leczy 15% życia.', fx: 'czara' },
  { id: 'r-lod', slot: 'relikt', name: 'Lodowy kamień', tier: 0, desc: 'Trafienia spowalniają wrogów.', fx: 'lod' },
  { id: 'r-pieczec', slot: 'relikt', name: 'Złamana pieczęć', tier: 0, desc: '+2 przerzuty kart.', mods: { rerolls: 2 } },
  { id: 'r-dzwon', slot: 'relikt', name: 'Grabarski dzwon', tier: 0, desc: 'Unik wyzwala falę uderzeniową.', fx: 'dzwon' },
  { id: 'r-lampa', slot: 'relikt', name: 'Lampa grobowa', tier: 0, desc: '+12% obrażeń.', mods: { dmg: 0.12 } },
  { id: 'r-rozaniec', slot: 'relikt', name: 'Kościany różaniec', tier: 0, desc: 'Moce wracają o 10% szybciej.', mods: { cdr: 0.1 } },
  { id: 'r-serce', slot: 'relikt', name: 'Serce bagien', tier: 0, desc: 'Regeneracja +2 na sekundę.', mods: { regen: 2 } },
];

export function makeWeapon(cls: string, tier: number): Item {
  const w = WEAPONS[cls] ?? WEAPONS.wojownik, i = Math.min(4, Math.max(0, tier - 1));
  return { id: `w-${cls}-${tier}`, slot: 'bron', name: w.names[i], tier, atk: w.atk[i], desc: `Atak ${w.atk[i]}` };
}
export function makeArmor(tier: number): Item {
  const i = Math.min(4, Math.max(0, tier - 1));
  return { id: `p-${tier}`, slot: 'pancerz', name: ARMORS.names[i], tier, armor: ARMORS.armor[i], desc: `Pancerz ${ARMORS.armor[i]}` };
}
export function makeAmulet(kind: string, tier: number): Item {
  const a = AMULETS.find(x => x.id === kind) ?? AMULETS[0];
  return { id: `a-${a.id}-${tier}`, slot: 'amulet', name: `${a.name} ${ROMAN[tier - 1]}`, tier, mods: a.mods(tier), desc: a.text(tier) };
}
export function makeRing(stat: StatId, tier: number): Item {
  const v = ringVal(tier);
  return { id: `o-${stat}-${tier}`, slot: 'pierscien', name: `${RING_ADJ[tier - 1]} pierścień ${RING_NAME[stat]}`, tier, stats: { [stat]: v }, desc: `+${v} ${STAT_INFO[stat].name}` };
}

export function rollTier(t: number, rng: () => number = Math.random, bonus = 0) {
  return Math.max(1, Math.min(5, 1 + Math.floor(t / 110) + (rng() < 0.25 ? 1 : 0) + bonus));
}
export function rollItems(cls: string, tier: number, n = 3, rng: () => number = Math.random, relicChance = 0.3, have: Gear = {}): Item[] {
  const pool: Item[] = [
    makeWeapon(cls, tier), makeArmor(tier),
    makeAmulet(AMULETS[(rng() * AMULETS.length) | 0].id, tier),
    makeRing(STAT_IDS[(rng() * STAT_IDS.length) | 0], tier),
  ];
  if (rng() < relicChance) {
    const owned = have.relikt?.id;
    const rs = RELICS.filter(r => r.id !== owned);
    pool.push(rs[(rng() * rs.length) | 0]);
  }
  for (let i = pool.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const better = pool.filter(it => it.slot !== 'relikt' && (have[it.slot]?.tier ?? 0) < it.tier);
  const out = pool.slice(0, n);
  if (better.length && !out.some(o => better.includes(o))) out[out.length - 1] = better[0];
  return out;
}

export interface GearSum { atk: number; armor: number; stats: Stats; mods: Mods; fx: Set<string> }
export function computeGear(g: Gear): GearSum {
  const sum: GearSum = { atk: 0, armor: 0, stats: emptyStats(), mods: emptyMods(), fx: new Set() };
  for (const s of SLOTS) {
    const it = g[s]; if (!it) continue;
    sum.atk += it.atk ?? 0; sum.armor += it.armor ?? 0;
    for (const k of STAT_IDS) sum.stats[k] += it.stats?.[k] ?? 0;
    for (const k of Object.keys(sum.mods) as (keyof Mods)[]) sum.mods[k] += it.mods?.[k] ?? 0;
    if (it.fx) sum.fx.add(it.fx);
  }
  return sum;
}

export function compareText(n: Item, old?: Item): string {
  if (!old) return 'Nowy slot';
  if (n.slot === 'relikt' || n.slot === 'amulet' || n.slot === 'pierscien') return `zamiast: ${old.name}`;
  const d = (label: string, a: number, b: number) => (a !== b ? `${a > b ? '+' : ''}${a - b} ${label}` : '');
  const parts = [d('ataku', n.atk ?? 0, old.atk ?? 0), d('pancerza', n.armor ?? 0, old.armor ?? 0)].filter(Boolean);
  return parts.length ? `${parts.join(', ')} (zamiast: ${old.name})` : `równe (zamiast: ${old.name})`;
}
export const armorReduction = (armor: number, wiara: number) => Math.min(0.6, armor / (armor + 25) + wiara * 0.02);
