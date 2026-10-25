import { describe, expect, it } from 'vitest';
import { RODY, allowedClasses, fixClass, rod, rodOpens, rodStats } from './rody';
import { CLASSES } from './data';

const IDS = ['wojownik', 'mag', 'lowca', 'czarnoksieznik', 'paladyn', 'lotr', 'druid', 'szaman'];

describe('rody', () => {
  it('są unikalne i mają dar z efektem', () => {
    expect(new Set(RODY.map(r => r.id)).size).toBe(RODY.length);
    for (const r of RODY) expect(r.gift.fx).toBeTruthy();
  });
  it('każda droga jest otwarta przynajmniej dla trzech rodów, wszystkie drogi istnieją w danych', () => {
    for (const id of IDS) {
      expect(CLASSES.some(c => c.id === id), id).toBe(true);
      expect(RODY.filter(r => rodOpens(r, id)).length, id).toBeGreaterThanOrEqual(3);
    }
    for (const r of RODY) if (r.opens !== 'all') for (const c of r.opens) expect(IDS.includes(c), c).toBe(true);
  });
  it('Bramicze otwierają wszystko', () => {
    expect(allowedClasses(rod('bramicze'), IDS)).toEqual(IDS);
    expect(allowedClasses(rod('kuznicy'), IDS)).toEqual(['wojownik', 'paladyn', 'szaman']);
  });
  it('zmiana rodu zachowuje otwartą drogę albo wybiera pierwszą otwartą z posiadanych', () => {
    expect(fixClass(rod('kuznicy'), 'wojownik', IDS, IDS)).toBe('wojownik');
    expect(fixClass(rod('kuznicy'), 'mag', IDS, IDS)).toBe('wojownik');
    expect(fixClass(rod('kuznicy'), 'mag', ['mag', 'szaman'], IDS)).toBe('szaman');
    expect(fixClass(rod('kuznicy'), 'mag', ['mag'], IDS)).toBe('mag'); // brak otwartej: nie gubi wyboru
  });
  it('nieznany ród to Bramicze, statystyki są kompletne', () => {
    expect(rod('xx').id).toBe('bramicze');
    expect(rodStats(rod('mroczanie'))).toEqual({ sila: 0, zwin: 1, krz: -1, umysl: 2, wiara: 0 });
  });
});
