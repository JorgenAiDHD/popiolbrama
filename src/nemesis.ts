// Nemesis (wersja A): wróg, który cię zabił, dostaje imię i wraca w następnym biegu silniejszy. Po zabiciu znika.

export interface Nemesis { type: string; name: string }

export const NEMESIS_TYPES = ['szczur', 'wilk', 'szkielet', 'topielec', 'czarownik', 'zgnilec'];
export const NEMESIS_HP = 1.3;
export const NEMESIS_DMG = 1.3;
export const NEMESIS_SPAWN = 60; // sekunda biegu, w której wraca
export const NEMESIS_ASH = 15;

const FIRST = ['Gryzoń', 'Kostur', 'Szept', 'Zgryz', 'Popiołek', 'Wrzask', 'Kruczy', 'Łamignat', 'Szpon', 'Mglisty', 'Kopciuch', 'Cierń'];
const LAST = ['z Rowu', 'Bez Oka', 'Szary', 'z Bagna', 'Pogrobowiec', 'Cichy', 'Zgniły', 'z Krypty', 'Wygłodzony', 'Krzywy'];

/** Zabójca z hurtBy: tylko zwykły wróg (także jego pocisk); slam, wybuch i bossowie nie dają nemezis. */
export function killerType(hurtBy: string): string | null {
  return NEMESIS_TYPES.includes(hurtBy) ? hurtBy : null;
}

export function makeNemesis(type: string, rand: () => number): Nemesis {
  const pick = <T,>(a: T[]) => a[Math.min(a.length - 1, Math.floor(rand() * a.length))];
  return { type, name: `${pick(FIRST)} ${pick(LAST)}` };
}

/** Po śmierci: ten sam wróg zostaje, nowy zabójca zastępuje poprzedniego. */
export function afterDeath(current: Nemesis | null, hurtBy: string, rand: () => number): Nemesis | null {
  const t = killerType(hurtBy);
  if (!t) return current;
  if (current && current.type === t) return current;
  return makeNemesis(t, rand);
}
