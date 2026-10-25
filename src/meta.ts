import { CLASSES, TALENTS, TOMES, Tome } from './data';
import { FREE_POINTS, StatId, emptyStats } from './items';
import { platform } from './platform';
import type { Nemesis } from './nemesis';

export interface Stats { kills: number; runs: number; wins: number; bossKills: number; longest: number }
export interface Meta {
  ash: number; talents: Record<string, number>; classes: string[]; deaths: number; best: number;
  stats: Stats; mute: boolean; calm: boolean; name: string; alloc: Record<StatId, number>; ach: string[]; hq: boolean; diff: number;
  arkana: string[]; deck: string[]; pakty: string[]; bestHeat: number; nemesis: Nemesis | null; rod: string;
}
const KEY = 'popiolbrama.meta2';
const fresh = (): Meta => ({
  ash: 0, talents: {}, classes: CLASSES.filter(c => c.cost === 0).map(c => c.id), deaths: 0, best: 0,
  stats: { kills: 0, runs: 0, wins: 0, bossKills: 0, longest: 0 }, mute: false, calm: false, name: 'Strażnik',
  alloc: { ...emptyStats(), krz: FREE_POINTS }, ach: [], diff: 1, hq: !platform.lowPower,
  arkana: [], deck: [], pakty: [], bestHeat: 0, nemesis: null, rod: 'bramicze',
});
export function loadMeta(): Meta {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const f = fresh();
    return { ...f, ...raw, stats: { ...f.stats, ...(raw.stats || {}) }, talents: { ...(raw.talents || {}) }, alloc: { ...f.alloc, ...(raw.alloc || {}) }, ach: raw.ach || [], arkana: raw.arkana || [], deck: raw.deck || [], pakty: raw.pakty || [] };
  } catch { return fresh(); }
}
export const saveMeta = (m: Meta) => localStorage.setItem(KEY, JSON.stringify(m));
export const talent = (m: Meta, id: string) => m.talents[id] || 0;

export function isUnlocked(m: Meta, t: Tome) {
  const u = t.unlock;
  if (u.type === 'start') return true;
  if (u.type === 'kills') return m.stats.kills >= u.n;
  if (u.type === 'longest') return m.stats.longest >= u.n;
  return m.stats.bossKills >= u.n;
}
export const unlockedTomes = (m: Meta) => TOMES.filter(t => isUnlocked(m, t)).map(t => t.id);
export const maxTalent = (id: string) => TALENTS.find(t => t.id === id)!.max;
