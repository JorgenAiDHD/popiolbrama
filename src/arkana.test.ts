import { describe, expect, it } from 'vitest';
import { ARKANA, DECK_SLOTS, RunSummary, canBuy, deckEffects, earnedArkana, hollowCap, pactEffects, rollBramy, toggleDeck, togglePakt } from './arkana';

const run = (o: Partial<RunSummary> = {}): RunSummary => ({ victory: false, time: 100, kills: 10, level: 3, noHit: false, noDodge: false, bosses: [], heat: 0, diff: 1, fullGear: false, ...o });

describe('arkana', () => {
  it('ma unikalne identyfikatory i każdą kartę da się zdobyć', () => {
    expect(new Set(ARKANA.map(a => a.id)).size).toBe(ARKANA.length);
    for (const a of ARKANA) expect(a.src.type === 'buy' ? a.src.cost > 0 : a.src.text.length > 0).toBe(true);
  });
  it('talia sumuje modyfikatory i zna tylko pierwsze miejsca', () => {
    const e = deckEffects(['szaleniec', 'skapiec', 'pijak', 'wieszcz']);
    expect(e.mods.dmg).toBeCloseTo(0.3);
    expect(e.mods.hpMult).toBeCloseTo(0.75);
    expect(e.mods.ashMult).toBeCloseTo(1.4);
    expect(e.mods.potionCharges).toBe(1);
    expect(e.mods.rerolls).toBe(-1); // czwartej karty (wieszcz) nie liczy
  });
  it('fx z kart trafia do zestawu', () => {
    expect(deckEffects(['kruk', 'szubienica']).fx.has('kruk')).toBe(true);
    expect(deckEffects([]).fx.size).toBe(0);
  });
  it('wyzwania nadają karty raz', () => {
    expect(earnedArkana(run({ kills: 300 }), [])).toEqual(['kruk']);
    expect(earnedArkana(run({ kills: 300 }), ['kruk'])).toEqual([]);
    expect(earnedArkana(run({ bosses: ['krypta'], noHit: true }), [])).toEqual(['wdowa']);
    expect(earnedArkana(run({ bosses: ['krypta'], noHit: false }), [])).toEqual([]);
    expect(earnedArkana(run({ victory: true, noDodge: true }), [])).toEqual(['lis']);
  });
  it('kupno wymaga popiołu i nie dubluje', () => {
    expect(canBuy('szaleniec', 59, [])).toBe(false);
    expect(canBuy('szaleniec', 60, [])).toBe(true);
    expect(canBuy('szaleniec', 600, ['szaleniec'])).toBe(false);
    expect(canBuy('kruk', 9999, [])).toBe(false);
  });
  it('talia ma limit miejsc i nie przyjmuje cudzych kart', () => {
    const owned = ['szaleniec', 'skapiec', 'pijak', 'wieszcz'];
    let d: string[] = [];
    for (const id of owned) d = toggleDeck(d, owned, id);
    expect(d.length).toBe(DECK_SLOTS);
    expect(toggleDeck(d, owned, 'kruk')).toEqual(d);
    expect(toggleDeck(d, owned, 'szaleniec')).not.toContain('szaleniec');
  });
});

describe('pakty', () => {
  it('liczą ciężar i mnożnik popiołu', () => {
    const p = pactEffects(['twardzi', 'wypalenie']);
    expect(p.heat).toBe(3);
    expect(p.ashMult).toBeCloseTo(1.45);
    expect(p.hollow).toBe(true);
    expect(pactEffects([]).heat).toBe(0);
  });
  it('przełącznik ignoruje nieznane pakty', () => {
    expect(togglePakt([], 'xx')).toEqual([]);
    expect(togglePakt(['twardzi'], 'twardzi')).toEqual([]);
  });
  it('wypalenie ma dolną granicę', () => {
    expect(hollowCap(0)).toBe(1);
    expect(hollowCap(5)).toBeCloseTo(0.8);
    expect(hollowCap(100)).toBe(0.4);
  });
});

describe('bramy', () => {
  it('losują trzy różne', () => {
    const b = rollBramy(Math.random);
    expect(b.length).toBe(3);
    expect(new Set(b.map(x => x.id)).size).toBe(3);
  });
});
