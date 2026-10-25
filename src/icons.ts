// Proceduralne ikony SVG: moc = kształt rodzaju + znak żywiołu, slot przedmiotu, klasa. Bez plików, działają z file://.
import { SK } from './data';
import type { Slot } from './items';

const ELEM: Record<string, { col: string; glyph: string }> = {
  'ogień': { col: '#ff7a2a', glyph: 'M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z' },
  'lód': { col: '#8fe0ff', glyph: 'M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7' },
  'jad': { col: '#8be05a', glyph: 'M12 2c3 5 6 8 6 12a6 6 0 0 1-12 0c0-4 3-7 6-12z' },
  'błyskawica': { col: '#7fc4ff', glyph: 'M13 2L5 14h6l-2 8 9-13h-6z' },
  'dusza': { col: '#d8d2b8', glyph: 'M12 3a7 7 0 0 0-7 7v4l2 2v4h10v-4l2-2v-4a7 7 0 0 0-7-7zM9 11h2v2H9zm4 0h2v2h-2z' },
};
const ELEM_ORDER = ['ogień', 'lód', 'jad', 'błyskawica', 'dusza'];

const KIND_PATH: Record<string, string> = {
  arc: '<path d="M3 19C5 8 13 3 21 5" /><path d="M7 20C9 12 14 8 20 9" />',
  nova: '<circle cx="12" cy="12" r="5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  proj: '<path d="M3 12h15M13 6l6 6-6 6"/>',
  aura: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="10.5"/>',
  strike: '<path d="M14 2L6 13h5l-2 9 9-13h-5z"/>',
  orbit: '<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="5.5" r="2"/><circle cx="18" cy="14" r="2"/><circle cx="6" cy="14" r="2"/>',
};

const SLOT_PATH: Record<Slot, string> = {
  bron: '<path d="M5 19L17 7M14 4h6v6M4 16l4 4M3 21l3-3"/>',
  pancerz: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M12 8v9M8 12h8"/>',
  amulet: '<path d="M6 3c0 6 3 8 6 8s6-2 6-8"/><path d="M12 11v3"/><path d="M12 14l3 3-3 4-3-4z"/>',
  pierscien: '<ellipse cx="12" cy="15" rx="6" ry="5"/><path d="M9 6h6l2 3H7z"/>',
  relikt: '<path d="M12 2l6 7-6 13L6 9z"/><path d="M6 9h12M12 2v20"/>',
};

const CLASS_PATH: Record<string, string> = {
  wojownik: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M12 7v10M8 11h8"/>',
  mag: '<path d="M12 2l2.5 6 6 .5-4.6 4 1.5 6-5.4-3.4-5.4 3.4 1.5-6-4.6-4 6-.5z"/>',
  lowca: '<path d="M6 3c8 2 12 8 12 18M6 3c-1 8 3 15 12 18M6 3l12 18"/>',
  czarnoksieznik: '<path d="M12 3a7 7 0 0 0-7 7v4l2 2v4h10v-4l2-2v-4a7 7 0 0 0-7-7z"/><path d="M9 11v2M15 11v2M10 20v-2M14 20v-2"/>',
  paladyn: '<path d="M12 2v20M5 8h14"/><circle cx="12" cy="8" r="2.5"/>',
  lotr: '<path d="M5 19L19 5M15 5h4v4M4 20l3-1-2-2z"/><path d="M8 13l3 3"/>',
  druid: '<path d="M4 20C4 9 10 4 20 4c0 10-5 16-16 16z"/><path d="M4 20L14 10"/>',
  szaman: '<path d="M12 2v20"/><path d="M8 6h8M7 11h10M9 16h6"/><path d="M14 3l-3 6h3l-2 6"/>',
};

const wrap = (inner: string, col: string, fill = 'none') => `<svg class="ico" viewBox="0 0 24 24" fill="${fill}" stroke="${col}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

export function elementOf(skillId: string): string | null {
  const tags = SK[skillId]?.tags ?? [];
  return ELEM_ORDER.find(e => tags.includes(e)) ?? null;
}

/** Kolor żywiołu mocy (do pocisków i trafień); null, gdy brak znacznika żywiołu. */
export function elementColor(skillId: string): number | null {
  const e = elementOf(skillId);
  return e ? parseInt(ELEM[e].col.slice(1), 16) : null;
}

const iconCache = new Map<string, string>();
export function skillIcon(skillId: string, classCss = '#e9c46a'): string {
  const key = skillId + classCss; let s = iconCache.get(key);
  if (s) return s;
  const d = SK[skillId];
  const kind = d?.kind ?? 'proj';
  const e = elementOf(skillId);
  const col = e ? ELEM[e].col : classCss;
  const main = `<g>${KIND_PATH[kind] ?? KIND_PATH.proj}</g>`;
  const mark = e ? `<g transform="translate(13 13) scale(0.45)" stroke="${ELEM[e].col}" fill="${ELEM[e].col}" stroke-width="2.4"><path d="${ELEM[e].glyph}"/></g>` : '';
  s = wrap(main + mark, col); iconCache.set(key, s);
  return s;
}

export const slotIcon = (slot: Slot, css = '#d0d0d0') => wrap(SLOT_PATH[slot], css);
export const classIcon = (clsId: string, css = '#e9c46a') => { const k = 'c:' + clsId + css; let s = iconCache.get(k); if (!s) { s = wrap(CLASS_PATH[clsId] ?? CLASS_PATH.wojownik, css); iconCache.set(k, s); } return s; };
export const ICON_KINDS = Object.keys(KIND_PATH);
export const ICON_CLASSES = Object.keys(CLASS_PATH);
