import { describe, expect, it } from 'vitest';
import { AFFIXES, RARITY, UNIQUES, itemScore, rarityOf, rollLoot, rollRarity, uniqueChance, uniqueFor, withRarity } from './loot';
import { computeGear, makeWeapon, makeArmor, makeRing } from './items';

const seq = (...v: number[]) => { let i = 0; return () => v[i++ % v.length]; };
const CLASSES = ['wojownik', 'mag', 'lowca', 'czarnoksieznik', 'paladyn', 'lotr', 'druid', 'szaman'];

describe('loot', () => {
  it('każda klasa ma unikat z efektem i tylko swoją bronią', () => {
    expect(new Set(UNIQUES.map(u => u.id)).size).toBe(UNIQUES.length);
    for (const c of CLASSES) { const u = uniqueFor(c); expect(u?.fx).toBeTruthy(); expect(u?.cls).toBe(c); }
  });
  it('jakości: zwykły bez afiksów, magiczny 1-2, rzadki 3-4', () => {
    const base = makeWeapon('wojownik', 3);
    expect(withRarity(base, 'zwykly').lines).toEqual([base.desc]);
    for (let i = 0; i < 40; i++) {
      const m = withRarity(base, 'magiczny'), r = withRarity(base, 'rzadki');
      expect(m.lines!.length - 1).toBeGreaterThanOrEqual(1); expect(m.lines!.length - 1).toBeLessThanOrEqual(2);
      expect(r.lines!.length - 1).toBeGreaterThanOrEqual(3); expect(r.lines!.length - 1).toBeLessThanOrEqual(4);
      expect(m.rarity).toBe('magiczny'); expect(r.rarity).toBe('rzadki');
    }
  });
  it('afiks naprawdę zmienia statystyki i nie psuje bazy', () => {
    const base = makeArmor(4);
    const r = withRarity(base, 'rzadki', seq(0.1, 0.3, 0.5, 0.7, 0.2));
    const sum = computeGear({ pancerz: r }), plain = computeGear({ pancerz: base });
    expect(itemScore(r)).toBeGreaterThan(itemScore(base));
    expect(sum.armor).toBeGreaterThanOrEqual(plain.armor);
    expect(base.rarity).toBeUndefined(); // oryginał nietknięty
  });
  it('afiksy w przedmiocie nie powtarzają się i respektują miejsce', () => {
    const w = makeWeapon('mag', 5);
    for (let i = 0; i < 60; i++) {
      const it = withRarity(w, 'rzadki');
      expect(new Set(it.lines).size).toBe(it.lines!.length);
      expect((it.armor ?? 0)).toBe(0); // "pancerz" nie trafia na broń
    }
    expect(AFFIXES.filter(a => a.target.atk).every(a => a.slots?.includes('bron'))).toBe(true);
  });
  it('rozkład jakości: wyższy poziom i premia dają więcej rzadkich', () => {
    const count = (tier: number, bonus: number) => { let r = 0; for (let i = 0; i < 4000; i++) if (rollRarity(tier, bonus) === 'rzadki') r++; return r; };
    expect(count(5, 1)).toBeGreaterThan(count(1, 0) * 1.5);
  });
  it('unikat tylko dla swojej klasy, rzadko bez premii, często od strażnika', () => {
    expect(uniqueChance(1, 0)).toBeLessThan(0.05);
    expect(uniqueChance(3, 1)).toBeGreaterThan(0.2);
    let wrong = 0;
    for (const c of CLASSES) for (let i = 0; i < 200; i++) for (const it of rollLoot({ cls: c, tier: 4, bonus: 1 })) if (it.cls && it.cls !== c) wrong++;
    expect(wrong).toBe(0);
    let seen = 0;
    for (let i = 0; i < 300; i++) if (rollLoot({ cls: 'lotr', tier: 4, bonus: 1 }).some(it => it.id === 'u-lotr')) seen++;
    expect(seen).toBeGreaterThan(20);
  });
  it('ułamkowy stopień (premia sklepu) nie psuje nazw', () => {
    for (const tier of [1.5, 2.5, 3.5, 0.5, 5.5]) for (let i = 0; i < 100; i++) for (const it of rollLoot({ cls: 'mag', tier, bonus: 0.5 })) {
      expect(it.name, String(tier)).not.toContain('undefined');
      expect(it.desc).not.toContain('undefined');
      expect(Number.isInteger(it.tier)).toBe(true);
    }
  });
  it('nazwy magicznych pierścieni łączą dopełniacze spójnie', () => {
    const ring = { ...makeRing('sila', 2) };
    const m = withRarity(ring, 'magiczny', seq(0.1, 0.9, 0.5));
    expect(m.name).toMatch(/ i \S+$/);
  });
  it('nie oferuje unikatu, który już masz założony', () => {
    const have = { bron: { ...makeWeapon('mag', 5), id: 'u-mag' } };
    for (let i = 0; i < 200; i++) expect(rollLoot({ cls: 'mag', tier: 5, bonus: 1, have }).some(it => it.id === 'u-mag')).toBe(false);
  });
  it('zwraca n przedmiotów z kolorem jakości', () => {
    const l = rollLoot({ cls: 'druid', tier: 2 });
    expect(l.length).toBe(3);
    for (const it of l) expect(RARITY[rarityOf(it)].css).toMatch(/^#/);
  });
});
