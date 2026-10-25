import { describe, expect, it } from 'vitest';
import { armorReduction, compareText, computeGear, makeAmulet, makeArmor, makeRing, makeWeapon, rollItems, rollTier } from './items';

describe('ekwipunek', () => {
  it('broÅ„ to drabina ataku bez rzadkoÅ›ci', () => {
    const atk = [1, 2, 3, 4, 5].map(t => makeWeapon('wojownik', t).atk!);
    expect(atk).toEqual([5, 7, 9, 14, 22]);
  });
  it('pancerz roÅ›nie z poziomem', () => {
    const a = [1, 2, 3, 4, 5].map(t => makeArmor(t).armor!);
    for (let i = 1; i < a.length; i++) expect(a[i]).toBeGreaterThan(a[i - 1]);
  });
  it('sumuje bonusy z przedmiotÃ³w', () => {
    const g = computeGear({ bron: makeWeapon('mag', 3), pancerz: makeArmor(2), amulet: makeAmulet('kiel', 2), pierscien: makeRing('sila', 4) });
    expect(g.atk).toBe(10);
    expect(g.armor).toBe(4);
    expect(g.mods.crit).toBeCloseTo(0.08);
    expect(g.stats.sila).toBe(3);
  });
  it('redukcja obraÅ¼eÅ„ ma sufit', () => {
    expect(armorReduction(0, 0)).toBe(0);
    expect(armorReduction(1000, 20)).toBe(0.6);
  });
  it('porÃ³wnanie pokazuje rÃ³Å¼nicÄ™ ataku', () => {
    expect(compareText(makeWeapon('wojownik', 4), makeWeapon('wojownik', 2))).toContain('+7 ataku');
  });
  it('skrzynia daje trzy rÃ³Å¼ne przedmioty i realny awans', () => {
    const have = { bron: makeWeapon('lowca', 3), pancerz: makeArmor(3) };
    for (let i = 0; i < 40; i++) {
      const items = rollItems('lowca', 4, 3, Math.random, 0.3, have);
      expect(items.length).toBe(3);
      expect(new Set(items.map(x => x.id)).size).toBe(3);
      expect(items.some(x => x.slot === 'relikt' || x.tier > (have[x.slot as 'bron' | 'pancerz']?.tier ?? 0))).toBe(true);
    }
  });
  it('stopieÅ„ roÅ›nie z czasem', () => {
    expect(rollTier(0, () => 1)).toBe(1);
    expect(rollTier(400, () => 1)).toBe(4);
    expect(rollTier(900, () => 0)).toBe(5);
  });
});

import { ACHS, BOSS_NAME, DIFF, ET, PHASES, RUN_TIME, phaseAt } from './data';

describe('dane œwiata', () => {
  it('fazy s¹ uporz¹dkowane i pokrywaj¹ ca³y bieg', () => {
    expect(PHASES[0].t0).toBe(0);
    for (let i = 1; i < PHASES.length; i++) expect(PHASES[i].t0).toBeGreaterThan(PHASES[i - 1].t0);
    expect(phaseAt(0)).toBe(PHASES[0]);
    expect(phaseAt(RUN_TIME)).toBe(PHASES[PHASES.length - 1]);
  });
  it('ka¿da faza losuje tylko znane typy wrogów', () => {
    for (const p of PHASES) for (const t of [0, 100, 200, 300, 400, 500]) for (const id of p.mix(t)) expect(ET[id], id).toBeDefined();
  });
  it('bossowie maj¹ nazwy, a trudnoœci rosn¹', () => {
    for (const b of ['krypta', 'alfa', 'krol']) { expect(ET[b]).toBeDefined(); expect(BOSS_NAME[b]).toBeTruthy(); }
    expect(DIFF[0].hp).toBeGreaterThan(DIFF[1].hp);
    expect(DIFF[1].hp).toBeGreaterThan(DIFF[2].hp);
    expect(new Set(ACHS.map(a => a.id)).size).toBe(ACHS.length);
  });
});
