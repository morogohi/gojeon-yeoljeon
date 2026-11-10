import { STORIES } from '../content/stories';
import { HEROES } from '../content/heroes';
import type { SrsCard } from '../engine/srs';

export interface SaveData {
  version: 1;
  stars: Record<string, 0 | 1 | 2 | 3>;
  heroes: Record<string, { level: number; xp: number }>;
  cards: Record<string, SrsCard>;
  streak: { last: string; count: number };
  puzzleBest: number;
  partyHeroId: string | null;
}

export interface KV {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

export const SAVE_KEY = 'gojeon-yeoljeon:save';

export function defaultSave(): SaveData {
  return { version: 1, stars: {}, heroes: {}, cards: {}, streak: { last: '', count: 0 }, puzzleBest: 0, partyHeroId: null };
}

function sanitize(raw: unknown): SaveData {
  const d = defaultSave();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Partial<SaveData>;
  if (r.version !== 1) return d;
  const storyIds = new Set(STORIES.map((s) => s.id));
  const heroIds = new Set(HEROES.map((h) => h.id));
  for (const [k, v] of Object.entries(r.stars ?? {})) if (storyIds.has(k) && [0, 1, 2, 3].includes(v as number)) d.stars[k] = v as 0 | 1 | 2 | 3;
  for (const [k, v] of Object.entries(r.heroes ?? {})) if (heroIds.has(k) && v && typeof v.level === 'number') d.heroes[k] = { level: v.level, xp: v.xp ?? 0 };
  for (const [k, v] of Object.entries(r.cards ?? {})) if (v && typeof v.due === 'string') d.cards[k] = v;
  if (r.streak && typeof r.streak.last === 'string') d.streak = { last: r.streak.last, count: Number(r.streak.count) || 0 };
  d.puzzleBest = Number(r.puzzleBest) || 0;
  d.partyHeroId = r.partyHeroId && heroIds.has(r.partyHeroId) && d.heroes[r.partyHeroId] ? r.partyHeroId : null;
  return d;
}

export function loadSave(kv: KV | null): SaveData {
  if (!kv) return defaultSave();
  try {
    const s = kv.getItem(SAVE_KEY);
    return s ? sanitize(JSON.parse(s)) : defaultSave();
  } catch {
    return defaultSave();
  }
}

export function persistSave(kv: KV | null, data: SaveData): boolean {
  if (!kv) return false;
  try {
    kv.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/** localStorage 를 쓸 수 없으면 메모리 저장소로 폴백 */
export function browserKV(): KV {
  try {
    const ls = window.localStorage;
    const probe = '__gojeon_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    const mem = new Map<string, string>();
    return { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v) };
  }
}
