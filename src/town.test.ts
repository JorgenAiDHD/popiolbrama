import { describe, expect, it } from 'vitest';
import { FLASK_COST, GOLD_RATE, SHARPEN_ATK, forgeCost, freshTown, goldFor, harden, itemPrice, makeOffers, pay, sharpen } from './town';
import { makeArmor, makeWeapon } from './items';

describe('przystań', () => {
  it('grosze: zwykły wróg mało, elita więcej, strażnik dużo', () => {
    expect(goldFor(2, false, false)).toBeCloseTo(2 * GOLD_RATE);
    expect(goldFor(2, true, false)).toBeGreaterThan(goldFor(2, false, false) * 2);
    expect(goldFor(0, false, true)).toBeGreaterThanOrEqual(50);
  });
  it('kuźnia drożeje z każdym ulepszeniem, ród Kuźników daje zniżkę', () => {
    expect(forgeCost(1)).toBeGreaterThan(forgeCost(0));
    expect(forgeCost(0, 0.25)).toBeLessThan(forgeCost(0));
    expect(forgeCost(0, 0.25)).toBe(Math.round(35 * 0.75));
  });
  it('naostrzenie i hartowanie zmieniają kopię, nie oryginał', () => {
    const w = makeWeapon('mag', 2), a = makeArmor(2);
    const w2 = sharpen(w), a2 = harden(a);
    expect(w2.atk).toBe((w.atk ?? 0) + SHARPEN_ATK);
    expect(w.atk).toBe(makeWeapon('mag', 2).atk);
    expect(a2.armor).toBeGreaterThan(a.armor ?? 0);
    expect(w2.lines!.length).toBe(2);
    expect(sharpen(w2).lines!.length).toBe(3);
  });
  it('płatność odejmuje albo odmawia', () => {
    expect(pay(100, FLASK_COST)).toBe(60);
    expect(pay(10, FLASK_COST)).toBeNull();
    expect(pay(FLASK_COST, FLASK_COST)).toBe(0);
  });
  it('oferty Miry: trzy przedmioty, ceny dodatnie, tylko dla klasy', () => {
    for (const c of ['wojownik', 'szaman', 'lotr']) {
      const o = makeOffers(c, 3, {});
      expect(o.length).toBe(3);
      for (const x of o) { expect(x.price).toBeGreaterThan(0); if (x.item.cls) expect(x.item.cls).toBe(c); }
    }
  });
  it('rzadszy przedmiot kosztuje więcej', () => {
    const base = makeWeapon('lowca', 3);
    expect(itemPrice({ ...base, rarity: 'rzadki' })).toBeGreaterThan(itemPrice({ ...base, rarity: 'zwykly' }));
  });
  it('świeży stan przystani jest pusty', () => {
    expect(freshTown()).toEqual({ sharpen: 0, harden: 0, rested: false, altar: false, bought: [] });
  });
});
