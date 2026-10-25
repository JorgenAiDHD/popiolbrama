import { describe, expect, it } from 'vitest';
import { ICON_CLASSES, ICON_KINDS, classIcon, elementColor, elementOf, skillIcon, slotIcon } from './icons';
import { SK } from './data';
import { SLOTS } from './items';

const valid = (s: string) => /^<svg [^>]*viewBox="0 0 24 24"[^>]*>.+<\/svg>$/.test(s) && !s.includes('undefined');

describe('ikony', () => {
  it('każda moc ma poprawną ikonę', () => {
    for (const id of Object.keys(SK)) expect(valid(skillIcon(id, '#d9822b')), id).toBe(true);
  });
  it('każdy rodzaj mocy ma własny kształt', () => {
    const shapes = new Set(ICON_KINDS.map(k => skillIcon(Object.values(SK).find(s => s.kind === k && !s.tags.some(t => ['ogień', 'lód', 'jad', 'błyskawica', 'dusza'].includes(t)))?.id ?? Object.values(SK).find(s => s.kind === k)!.id, '#fff')));
    expect(shapes.size).toBe(ICON_KINDS.length);
  });
  it('sloty i klasy mają ikony, klasy się różnią', () => {
    for (const s of SLOTS) expect(valid(slotIcon(s))).toBe(true);
    expect(ICON_CLASSES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(ICON_CLASSES.map(c => classIcon(c))).size).toBe(ICON_CLASSES.length);
  });
  it('żywioł nadaje kolor i znak', () => {
    expect(elementOf('zagiew')).toBe('ogień');
    expect(elementColor('zagiew')).toBe(0xff7a2a);
    expect(elementColor('ciecie')).toBeNull();
    expect(skillIcon('zagiew')).toContain('#ff7a2a');
    expect(skillIcon('ciecie', '#123456')).toContain('#123456');
  });
});
