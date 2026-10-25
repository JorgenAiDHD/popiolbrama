// Arkana: rzadkie karty z talii. Kupuje się je za popiół albo zdobywa za wyzwanie.
// Pakty: dobrowolny ciężar przed biegiem (jak Heat w Hadesie), daje więcej popiołu.

export interface DeckMods {
  dmg: number; hpMult: number; ashMult: number; rerolls: number; speed: number; crit: number;
  potionHeal: number; potionCharges: number; enemyHp: number; startLevels: number; dodgeCd: number;
}
export const emptyDeck = (): DeckMods => ({
  dmg: 0, hpMult: 1, ashMult: 1, rerolls: 0, speed: 0, crit: 0, potionHeal: 0, potionCharges: 0, enemyHp: 0, startLevels: 0, dodgeCd: 0,
});

export interface RunSummary {
  victory: boolean; time: number; kills: number; level: number; noHit: boolean; noDodge: boolean;
  bosses: string[]; heat: number; diff: number; fullGear: boolean;
}
export type Source =
  | { type: 'buy'; cost: number }
  | { type: 'challenge'; text: string; test: (r: RunSummary) => boolean };

export interface Arkan {
  id: string; name: string; text: string; src: Source; mods?: Partial<DeckMods>; fx?: string;
}

export const DECK_SLOTS = 3;

export const ARKANA: Arkan[] = [
  { id: 'szubienica', name: 'Szubienica', text: 'Raz na bieg zamiast śmierci wstajesz z 40% życia i falą.', src: { type: 'buy', cost: 120 }, fx: 'szubienica' },
  { id: 'szaleniec', name: 'Szaleniec', text: '+30% obrażeń, -25% życia.', src: { type: 'buy', cost: 60 }, mods: { dmg: 0.3, hpMult: 0.75 } },
  { id: 'skapiec', name: 'Skąpiec', text: '+40% popiołu z biegu, -1 przerzut.', src: { type: 'buy', cost: 80 }, mods: { ashMult: 1.4, rerolls: -1 } },
  { id: 'pijak', name: 'Pijak', text: 'Fiolka leczy o połowę więcej i ma +1 ładunek.', src: { type: 'buy', cost: 70 }, mods: { potionHeal: 0.5, potionCharges: 1 } },
  { id: 'dlug', name: 'Dług', text: 'Zaczynasz od 4 poziomu. Wrogowie mają +12% życia.', src: { type: 'buy', cost: 90 }, mods: { startLevels: 3, enemyHp: 0.12 } },
  { id: 'czerwony', name: 'Czerwony Król', text: 'Słaby punkt leczy 3 życia. +5% słabego punktu.', src: { type: 'buy', cost: 100 }, mods: { crit: 0.05 }, fx: 'czerwony' },
  { id: 'wieszcz', name: 'Wieszcz', text: '+2 przerzuty kart.', src: { type: 'buy', cost: 110 }, mods: { rerolls: 2 } },
  {
    id: 'kruk', name: 'Kruk', text: 'Co 25. ubity zostawia skrzynię.',
    src: { type: 'challenge', text: 'Ubij 250 wrogów w jednym biegu', test: r => r.kills >= 250 }, fx: 'kruk',
  },
  {
    id: 'blyskawica', name: 'Burza w butelce', text: 'Co 12 s piorun w trzech wrogów.',
    src: { type: 'challenge', text: 'Pokonaj Alfę', test: r => r.bosses.includes('alfa') }, fx: 'blyskawica',
  },
  {
    id: 'wdowa', name: 'Wdowa', text: 'Pierwszy cios w każdego wroga boli o 60% mocniej.',
    src: { type: 'challenge', text: 'Pokonaj Stróża krypty bez trafienia', test: r => r.bosses.includes('krypta') && r.noHit }, fx: 'wdowa',
  },
  {
    id: 'kowal', name: 'Kowal', text: 'Zaczynasz ze skrzynią przedmiotów.',
    src: { type: 'challenge', text: 'Zapełnij wszystkie miejsca ekwipunku', test: r => r.fullGear }, fx: 'kowal',
  },
  {
    id: 'lis', name: 'Lis', text: '+15% prędkości, unik wraca o 30% szybciej.',
    src: { type: 'challenge', text: 'Wygraj bez uniku', test: r => r.victory && r.noDodge }, mods: { speed: 0.15, dodgeCd: 0.3 },
  },
];
export const arkan = (id: string) => ARKANA.find(a => a.id === id);

export function deckEffects(ids: string[]): { mods: DeckMods; fx: Set<string> } {
  const mods = emptyDeck(), fx = new Set<string>();
  for (const id of ids.slice(0, DECK_SLOTS)) {
    const a = arkan(id);
    if (!a) continue;
    if (a.fx) fx.add(a.fx);
    const m = a.mods;
    if (!m) continue;
    mods.dmg += m.dmg ?? 0; mods.hpMult *= m.hpMult ?? 1; mods.ashMult *= m.ashMult ?? 1; mods.rerolls += m.rerolls ?? 0;
    mods.speed += m.speed ?? 0; mods.crit += m.crit ?? 0; mods.potionHeal += m.potionHeal ?? 0; mods.potionCharges += m.potionCharges ?? 0;
    mods.enemyHp += m.enemyHp ?? 0; mods.startLevels += m.startLevels ?? 0; mods.dodgeCd += m.dodgeCd ?? 0;
  }
  return { mods, fx };
}

/** Arkana zdobyte za wyzwanie w tym biegu, których jeszcze nie ma w kolekcji. */
export function earnedArkana(r: RunSummary, owned: string[]): string[] {
  return ARKANA.filter(a => a.src.type === 'challenge' && !owned.includes(a.id) && a.src.test(r)).map(a => a.id);
}

export function canBuy(id: string, ash: number, owned: string[]) {
  const a = arkan(id);
  return !!a && a.src.type === 'buy' && !owned.includes(id) && ash >= a.src.cost;
}

/** Zmienia skład talii: wkłada lub zdejmuje arkan, nie przekracza limitu miejsc, nie zna obcych kart. */
export function toggleDeck(deck: string[], owned: string[], id: string): string[] {
  if (deck.includes(id)) return deck.filter(d => d !== id);
  if (!owned.includes(id) || deck.length >= DECK_SLOTS) return deck;
  return [...deck, id];
}

// ---------- Pakty ----------
export interface Pakt { id: string; name: string; text: string; heat: number }
export const PAKTY: Pakt[] = [
  { id: 'twardzi', name: 'Twardzi', text: 'Wrogowie mają +25% życia.', heat: 1 },
  { id: 'rojowisko', name: 'Rojowisko', text: 'Hordy gęstsze o 25%.', heat: 1 },
  { id: 'szybcy', name: 'Szybcy', text: 'Wrogowie biegną o 15% szybciej.', heat: 1 },
  { id: 'sucha', name: 'Sucha butla', text: 'Bez fiolki. Ognisko nie leczy.', heat: 1 },
  { id: 'wypalenie', name: 'Wypalenie', text: 'Każde trafienie odbiera 4% najwyższego życia do ogniska (min. 40%).', heat: 2 },
  { id: 'zniwiarz', name: 'Rychły Żniwiarz', text: 'Żniwiarz przychodzi 90 s wcześniej.', heat: 2 },
];
export interface PactFx { heat: number; enemyHp: number; spawn: number; enemySpeed: number; noPotion: boolean; hollow: boolean; reaperEarly: number; ashMult: number }
export function pactEffects(ids: string[]): PactFx {
  const on = (id: string) => ids.includes(id);
  const heat = PAKTY.filter(p => on(p.id)).reduce((s, p) => s + p.heat, 0);
  return {
    heat, enemyHp: on('twardzi') ? 0.25 : 0, spawn: on('rojowisko') ? 1.25 : 1, enemySpeed: on('szybcy') ? 1.15 : 1,
    noPotion: on('sucha'), hollow: on('wypalenie'), reaperEarly: on('zniwiarz') ? 90 : 0, ashMult: 1 + heat * 0.15,
  };
}
export const togglePakt = (ids: string[], id: string) => (ids.includes(id) ? ids.filter(x => x !== id) : PAKTY.some(p => p.id === id) ? [...ids, id] : ids);

// ---------- Bramy (nagroda po strażniku, jak drzwi w Hadesie) ----------
export interface Brama { id: string; name: string; text: string }
export const BRAMY: Brama[] = [
  { id: 'krew', name: 'Brama Krwi', text: 'Pełne życie i +30 najwyższego życia do końca biegu.' },
  { id: 'skrzynia', name: 'Brama Skrzyń', text: 'Dwie skrzynie z przedmiotami.' },
  { id: 'moc', name: 'Brama Mocy', text: 'Jedna z twoich mocy rośnie o rangę.' },
  { id: 'ogien', name: 'Brama Ognia', text: '+15% obrażeń do końca biegu, ale hordy gęstsze o 20%.' },
];
export function rollBramy(rand: () => number): Brama[] {
  const pool = BRAMY.slice();
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, 3);
}

// ---------- Fiolka (mikstura w stylu Diablo) ----------
export const POTION_BASE = 2;
export const POTION_HEAL = 0.3;
export const POTION_KILLS = 250; // tyle zabitych wypełnia jeden ładunek

// ---------- Wypalenie (Dark Souls 2) ----------
export const HOLLOW_STEP = 0.04;
export const HOLLOW_MIN = 0.4;
export const hollowCap = (hits: number) => Math.max(HOLLOW_MIN, 1 - hits * HOLLOW_STEP);
