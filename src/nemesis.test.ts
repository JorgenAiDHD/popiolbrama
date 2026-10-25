import { describe, expect, it } from 'vitest';
import { NEMESIS_TYPES, afterDeath, killerType, makeNemesis } from './nemesis';

describe('nemesis', () => {
  it('rozpoznaje zabójców, którzy mogą wrócić', () => {
    for (const t of NEMESIS_TYPES) expect(killerType(t)).toBe(t);
    expect(killerType('czarownik')).toBe('czarownik');
    for (const x of ['krypta', 'alfa', 'krol', 'slam', 'wybuch', 'pocisk', '', '?', 'zniwiarz']) expect(killerType(x)).toBeNull();
  });
  it('nadaje imię i zachowuje typ', () => {
    const n = makeNemesis('wilk', () => 0);
    expect(n.type).toBe('wilk');
    expect(n.name.split(' ').length).toBeGreaterThanOrEqual(2);
    expect(makeNemesis('wilk', () => 0.9999).name.length).toBeGreaterThan(0);
  });
  it('śmierć od bossa albo pułapki nie zmienia nemezis', () => {
    const cur = { type: 'szczur', name: 'Zgryz Szary' };
    expect(afterDeath(cur, 'alfa', Math.random)).toBe(cur);
    expect(afterDeath(null, 'slam', Math.random)).toBeNull();
  });
  it('ten sam zabójca zostaje, nowy go zastępuje', () => {
    const cur = { type: 'szczur', name: 'Zgryz Szary' };
    expect(afterDeath(cur, 'szczur', Math.random)).toBe(cur);
    const n = afterDeath(cur, 'wilk', Math.random);
    expect(n?.type).toBe('wilk');
    expect(n).not.toBe(cur);
  });
});
