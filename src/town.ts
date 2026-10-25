// Przystań (po strażniku): ceny, oferty i ulepszenia. Czysta logika, bez DOM i Three.js.
import { Item } from './items';
import { RARITY, itemScore, rarityOf, rollLoot } from './loot';
import type { Gear } from './items';

export const FLASK_COST = 40;
export const REROLL_COST = 45;
export const ALTAR_COST = 40;
export const REST_PENALTY = 0.1; // ognisko leczy, ale wrogowie wracają silniejsi (DS2)
export const SHARPEN_MAX = 5;
export const SHARPEN_ATK = 3;
export const HARDEN_ARMOR = 2;
export const GOLD_RATE = 0.35;

export const goldFor = (xp: number, elite: boolean, boss: boolean) => (boss ? 60 : xp * (elite ? 3 : 1) * GOLD_RATE);
export const forgeCost = (n: number, discount = 0) => Math.round((35 + 15 * n) * (1 - discount));

const RARITY_PRICE = { zwykly: 1, magiczny: 1.4, rzadki: 2, unikalny: 3 };
export const itemPrice = (it: Item) => Math.round((30 + Math.max(0, itemScore(it)) * 4) * RARITY_PRICE[rarityOf(it)]);

export interface Offer { item: Item; price: number }
export function makeOffers(cls: string, tier: number, have: Gear, rng: () => number = Math.random): Offer[] {
  return rollLoot({ cls, tier, n: 3, have, bonus: 0.3, relicChance: 0.2, rng }).map(item => ({ item, price: itemPrice(item) }));
}

const withLine = (it: Item, line: string): Item => { const lines = [...(it.lines ?? [it.desc]), line]; return { ...it, lines, desc: lines.join('. ') }; };
export function sharpen(it: Item): Item { return withLine({ ...it, atk: (it.atk ?? 0) + SHARPEN_ATK }, `Naostrzone +${SHARPEN_ATK} ataku`); }
export function harden(it: Item): Item { return withLine({ ...it, armor: (it.armor ?? 0) + HARDEN_ARMOR }, `Hartowane +${HARDEN_ARMOR} pancerza`); }

export interface TownState { sharpen: number; harden: number; rested: boolean; altar: boolean; bought: string[] }
export const freshTown = (): TownState => ({ sharpen: 0, harden: 0, rested: false, altar: false, bought: [] });

export const canPay = (gold: number, cost: number) => gold >= cost;
/** Zwraca nowe grosze albo null, gdy nie stać. */
export const pay = (gold: number, cost: number): number | null => (gold >= cost ? gold - cost : null);

export const rarityName = (it: Item) => RARITY[rarityOf(it)].name;
