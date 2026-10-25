import { EVOS, Evo, Kind, SK, SYNS, Syn, TOMES } from './data';

export const needFor = (level: number) => Math.round(8 + 4 * Math.pow(level, 1.8));
export const hitsForRank = (rank: number) => (rank >= 4 ? 3 : rank >= 2 ? 2 : 1);
export const radiusMult = (rank: number) => 1 + (rank >= 3 ? 0.2 : 0) + (rank >= 5 ? 0.2 : 0);
export const spawnRate = (t: number) => 1.5 + t / 60;

const STACK: Record<Kind, string[]> = {
  arc: ['', 'dokłada drugi cios.', 'sięga dalej.', 'dokłada trzeci cios.', 'sięga jeszcze szerzej.'],
  nova: ['', 'dokłada drugą falę.', 'sięga dalej.', 'dokłada trzecią falę.', 'sięga jeszcze szerzej.'],
  proj: ['', 'dokłada drugi pocisk.', 'leci grubiej i przebija.', 'dokłada trzeci pocisk.', 'leci jeszcze grubiej.'],
  aura: ['', 'trwa dłużej i grubiej.', 'trwa dłużej i grubiej.', 'trwa dłużej i grubiej.', 'trwa pełny czas.'],
  strike: ['', 'dokłada uderzenie.', 'dokłada uderzenie.', 'dokłada uderzenie.', 'dokłada uderzenie.'],
  orbit: ['', 'dokłada ostrze.', 'dokłada ostrze.', 'dokłada ostrze.', 'dokłada ostrze.'],
};
export const stackText = (kind: Kind, nextRank: number) => STACK[kind][Math.min(4, nextRank - 1)] ?? '';

export interface OwnedLite { id: string; rank: number }
const ownedKinds = (owned: OwnedLite[]) => new Set(owned.map(o => SK[o.id].kind));
const ownedTags = (owned: OwnedLite[]) => new Set(owned.flatMap(o => SK[o.id].tags));

export function synActive(s: Syn, tomes: Record<string, number>, owned: OwnedLite[]) {
  if (!(tomes[s.a] > 0)) return false;
  if (s.reqKind && !ownedKinds(owned).has(s.reqKind)) return false;
  return s.b.length === 0 || s.b.some(b => tomes[b] > 0);
}
export const activeSyns = (tomes: Record<string, number>, owned: OwnedLite[]) => SYNS.filter(s => synActive(s, tomes, owned));

export function synHint(tomeId: string, tomes: Record<string, number>, owned: OwnedLite[]) {
  const after = { ...tomes, [tomeId]: (tomes[tomeId] || 0) + 1 };
  for (const s of SYNS) {
    if (!synActive(s, tomes, owned) && synActive(s, after, owned)) return `Splot: ${s.name}`;
  }
  for (const s of SYNS) {
    if (synActive(s, tomes, owned)) continue;
    if (s.a === tomeId && s.b.length) return `Para: ${tomeName(s.b[0])} → ${s.name}`;
    if (s.b.includes(tomeId)) return `Para: ${tomeName(s.a)} → ${s.name}`;
  }
  return undefined;
}
const tomeName = (id: string) => TOMES.find(t => t.id === id)?.name ?? id;

export function evoEligible(owned: OwnedLite[], tomes: Record<string, number>): Evo[] {
  return EVOS.filter(e => owned.some(o => o.id === e.from && o.rank >= 4) && (tomes[e.tome] || 0) >= 1);
}

export interface PoolIn {
  owned: OwnedLite[]; tomes: Record<string, number>; unlocked: string[];
  classSkills: string[]; basic: string; maxSkills: number;
}
export interface CardDef { kind: 'rank' | 'new' | 'tome' | 'evo'; id: string; w: number; evo?: Evo }

export function buildPool(p: PoolIn): CardDef[] {
  const pool: CardDef[] = [];
  const kinds = ownedKinds(p.owned), tags = ownedTags(p.owned);
  for (const e of evoEligible(p.owned, p.tomes)) pool.push({ kind: 'evo', id: e.id, w: 100, evo: e });
  for (const o of p.owned) if (o.rank < 5) pool.push({ kind: 'rank', id: o.id, w: 1.6 });
  const skillCount = p.owned.filter(o => o.id !== p.basic).length;
  if (skillCount < p.maxSkills) for (const id of p.classSkills) if (!p.owned.some(o => o.id === id) && !EVOS.some(e => p.owned.some(o => o.id === e.to) && e.from === id)) {
    pool.push({ kind: 'new', id, w: 2.4 });
  }
  for (const t of TOMES) {
    if (!p.unlocked.includes(t.id) || (p.tomes[t.id] || 0) >= 3) continue;
    if (t.req === 'proj' && !kinds.has('proj')) continue;
    if (t.req === 'cios' && !tags.has('cios')) continue;
    let w = 1;
    if (synHint(t.id, p.tomes, p.owned)?.startsWith('Splot')) w = 3;
    pool.push({ kind: 'tome', id: t.id, w });
  }
  return pool;
}

export function pickCards(pool: CardDef[], n: number, rng: () => number = Math.random): CardDef[] {
  const out: CardDef[] = [];
  const rest = pool.slice();
  const evos = rest.filter(c => c.kind === 'evo');
  for (const e of evos.slice(0, n)) { out.push(e); rest.splice(rest.indexOf(e), 1); }
  while (out.length < n && rest.length) {
    const total = rest.reduce((s, c) => s + c.w, 0);
    let r = rng() * total, i = 0;
    for (; i < rest.length - 1; i++) { r -= rest[i].w; if (r <= 0) break; }
    out.push(rest[i]); rest.splice(i, 1);
  }
  return out;
}
