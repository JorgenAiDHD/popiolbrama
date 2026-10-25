import { describe, expect, it } from 'vitest';
import { EVOS, SK, SYNS, TOMES } from './data';
import { activeSyns, buildPool, evoEligible, hitsForRank, needFor, pickCards, spawnRate, synActive } from './logic';

describe('krzywa doświadczenia', () => {
  it('rośnie monotonicznie', () => {
    for (let l = 1; l < 30; l++) expect(needFor(l + 1)).toBeGreaterThan(needFor(l));
  });
  it('daje 18-24 poziomy z realistycznej puli XP w 8 minut', () => {
    let total = 0, lvl = 0;
    for (let l = 1; total + needFor(l) <= 6000; l++) { total += needFor(l); lvl = l; }
    expect(lvl).toBeGreaterThanOrEqual(18);
    expect(lvl).toBeLessThanOrEqual(24);
  });
  it('pierwszy poziom jest szybki', () => expect(needFor(1)).toBeLessThanOrEqual(14));
});

describe('rangi', () => {
  it('rangi zmieniają liczbę ciosów', () => {
    expect([1, 2, 3, 4, 5].map(hitsForRank)).toEqual([1, 2, 2, 3, 3]);
  });
  it('tempo spawnu rośnie', () => expect(spawnRate(300)).toBeGreaterThan(spawnRate(0)));
});

describe('dane', () => {
  it('ewolucje wskazują istniejące moce i tomy', () => {
    for (const e of EVOS) {
      expect(SK[e.from], e.id).toBeDefined();
      expect(SK[e.to], e.id).toBeDefined();
      expect(TOMES.some(t => t.id === e.tome), e.id).toBe(true);
    }
  });
  it('splot odwołuje się do istniejących tomów', () => {
    for (const s of SYNS) {
      expect(TOMES.some(t => t.id === s.a), s.id).toBe(true);
      for (const b of s.b) expect(TOMES.some(t => t.id === b), s.id).toBe(true);
    }
  });
});

describe('splot', () => {
  const owned = [{ id: 'zagiew', rank: 1 }];
  it('Burza wymaga pocisku', () => {
    const s = SYNS.find(x => x.id === 'burza')!;
    expect(synActive(s, { zywiol: 1 }, owned)).toBe(true);
    expect(synActive(s, { zywiol: 1 }, [{ id: 'ciecie', rank: 1 }])).toBe(false);
  });
  it('wykrywa parę tomów', () => {
    expect(activeSyns({ ilosc: 1, grubosc: 1 }, owned).map(s => s.id)).toContain('salwa');
    expect(activeSyns({ ilosc: 1 }, owned).map(s => s.id)).not.toContain('salwa');
  });
});

describe('pula kart', () => {
  const all = TOMES.map(t => t.id);
  const base = { tomes: {}, unlocked: all, classSkills: ['wir', 'przebicie', 'wyrzut'], basic: 'ciecie', maxSkills: 3 };
  it('nie oferuje tomów pocisku bez pocisków', () => {
    const pool = buildPool({ ...base, owned: [{ id: 'ciecie', rank: 1 }, { id: 'wir', rank: 1 }] });
    const ids = pool.filter(c => c.kind === 'tome').map(c => c.id);
    expect(ids).not.toContain('ilosc');
    expect(ids).not.toContain('grubosc');
    expect(ids).toContain('ostrze');
  });
  it('nie oferuje zablokowanych tomów', () => {
    const pool = buildPool({ ...base, unlocked: ['tempo'], owned: [{ id: 'ciecie', rank: 1 }] });
    expect(pool.filter(c => c.kind === 'tome').map(c => c.id)).toEqual(['tempo']);
  });
  it('ewolucja pojawia się, gdy spełnione warunki, i jest wybrana pierwsza', () => {
    const owned = [{ id: 'ciecie', rank: 1 }, { id: 'wir', rank: 4 }];
    expect(evoEligible(owned, { tempo: 1 }).map(e => e.to)).toEqual(['wicher']);
    const pool = buildPool({ ...base, owned, tomes: { tempo: 1 } });
    const picks = pickCards(pool, 3, () => 0.5);
    expect(picks[0].kind).toBe('evo');
    expect(new Set(picks.map(p => p.kind + p.id)).size).toBe(picks.length);
  });
  it('nie oferuje bazowej mocy po ewolucji', () => {
    const owned = [{ id: 'ciecie', rank: 1 }, { id: 'wicher', rank: 3 }];
    const pool = buildPool({ ...base, owned });
    expect(pool.some(c => c.kind === 'new' && c.id === 'wir')).toBe(false);
  });
  it('limit 3 mocy klasowych', () => {
    const owned = [{ id: 'ciecie', rank: 1 }, { id: 'wir', rank: 1 }, { id: 'przebicie', rank: 1 }, { id: 'wyrzut', rank: 1 }];
    expect(buildPool({ ...base, owned }).some(c => c.kind === 'new')).toBe(false);
  });
  it('wybiera unikalne karty', () => {
    const pool = buildPool({ ...base, owned: [{ id: 'ciecie', rank: 1 }, { id: 'wir', rank: 1 }] });
    for (let i = 0; i < 50; i++) {
      const p = pickCards(pool, 3);
      expect(new Set(p.map(x => x.kind + x.id)).size).toBe(p.length);
    }
  });
});
