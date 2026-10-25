// Ród (pochodzenie, jak tło w BG3 / Divinity): wybierany przed drogą, daje atuty i zamyka część dróg.
import type { StatId } from './items';

export interface Rod {
  id: string; name: string; lore: string; stats: Partial<Record<StatId, number>>; opens: string[] | 'all';
  gift: { name: string; text: string; fx: string };
}

export const RODY: Rod[] = [
  { id: 'bramicze', name: 'Bramicze', lore: 'Strażnicy progu. Znoszą wszystko.', stats: { krz: 1 }, opens: 'all', gift: { name: 'Hart progu', text: '+8% doświadczenia', fx: 'prog' } },
  { id: 'jesionianie', name: 'Jesionianie', lore: 'Ludzie lasu, szybcy i uważni.', stats: { zwin: 2, umysl: 1 }, opens: ['lowca', 'druid', 'mag', 'szaman'], gift: { name: 'Szept jesionu', text: 'Po uniku trzy następne ciosy +35%', fx: 'jesion' } },
  { id: 'mroczanie', name: 'Mroczanie', lore: 'Cień ich domu sięga dalej niż dom.', stats: { zwin: 1, krz: -1, umysl: 2 }, opens: ['lowca', 'mag', 'czarnoksieznik', 'lotr'], gift: { name: 'Krok w mrok', text: 'Unik trwa dłużej', fx: 'mrok' } },
  { id: 'turowie', name: 'Turowie', lore: 'Rogaci, uparci, głośni.', stats: { sila: 2, krz: 1, umysl: -1 }, opens: ['wojownik', 'paladyn', 'druid', 'lotr'], gift: { name: 'Gniew tura', text: 'Poniżej połowy życia +20% obrażeń', fx: 'tur' } },
  { id: 'kuznicy', name: 'Kuźnicy', lore: 'Kują, bo inaczej nie umieją.', stats: { sila: 1, zwin: -1, krz: 2 }, opens: ['wojownik', 'paladyn', 'szaman'], gift: { name: 'Skóra żelaza', text: '+3 pancerza, kuźnia tańsza o 25%', fx: 'zelazo' } },
  { id: 'prochowianie', name: 'Prochowianie', lore: 'Żyją na granicy popiołu.', stats: { umysl: 1, wiara: 1 }, opens: ['czarnoksieznik', 'mag', 'szaman'], gift: { name: 'Świt popiołu', text: 'Raz na bieg śmierć odpuszcza', fx: 'swit_p' } },
];

export const rod = (id: string) => RODY.find(r => r.id === id) ?? RODY[0];
export const rodOpens = (r: Rod, clsId: string) => r.opens === 'all' || r.opens.includes(clsId);
export const allowedClasses = (r: Rod, ids: string[]) => ids.filter(c => rodOpens(r, c));

/** Po zmianie rodu: zostaje obecna droga, jeśli jest otwarta, inaczej pierwsza otwarta (z posiadanych). */
export function fixClass(r: Rod, current: string, owned: string[], all: string[]): string {
  if (rodOpens(r, current) && owned.includes(current)) return current;
  return all.find(c => owned.includes(c) && rodOpens(r, c)) ?? current;
}

export function rodStats(r: Rod): Record<StatId, number> {
  return { sila: r.stats.sila ?? 0, zwin: r.stats.zwin ?? 0, krz: r.stats.krz ?? 0, umysl: r.stats.umysl ?? 0, wiara: r.stats.wiara ?? 0 };
}
