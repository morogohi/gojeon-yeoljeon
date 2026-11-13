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
  /** 단어장에 담은 한자 */
  wordbook: string[];
  settings: Settings;
  /** 날짜별 푼 문제 수 (최근 60일만 보관) */
  daily: Record<string, { answered: number; correct: number }>;
  /** 첫 고사 진행 단계를 처음 도달한 날짜 (engine/funnel.ts) */
  events: Record<string, string>;
}

export interface Settings {
  large: boolean;          // 큰 글씨
  sound: boolean;          // 읽어 주기
  dailyGoal: number;       // 하루 목표 문제 수
  reminder: string | null; // 매일 알림 'HH:MM' (앱에서만)
}

export const DAILY_GOALS = [10, 20, 30];

export interface KV {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

export const SAVE_KEY = 'gojeon-yeoljeon:save';

export function defaultSave(): SaveData {
  return {
    version: 1, stars: {}, heroes: {}, cards: {}, streak: { last: '', count: 0 }, puzzleBest: 0, partyHeroId: null,
    wordbook: [], settings: { large: false, sound: true, dailyGoal: 10, reminder: null }, daily: {}, events: {},
  };
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
  // v0.5에서 늘어난 항목: 없으면 기본값 (예전 세이브와 호환)
  if (Array.isArray(r.wordbook)) d.wordbook = [...new Set(r.wordbook.filter((c) => typeof c === 'string' && [...c].length === 1))];
  const st = r.settings as Partial<Settings> | undefined;
  if (st && typeof st === 'object') {
    d.settings = {
      large: st.large === true,
      sound: st.sound !== false,
      dailyGoal: DAILY_GOALS.includes(Number(st.dailyGoal)) ? Number(st.dailyGoal) : 10,
      reminder: typeof st.reminder === 'string' && /^\d{2}:\d{2}$/.test(st.reminder) ? st.reminder : null,
    };
  }
  for (const [k, v] of Object.entries(r.daily ?? {})) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && v && typeof v.answered === 'number') d.daily[k] = { answered: v.answered, correct: Number(v.correct) || 0 };
  }
  for (const [k, v] of Object.entries(r.events ?? {})) {
    if (/^[a-z0-9_]{1,24}$/.test(k) && typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) d.events[k] = v;
  }
  return d;
}

/** 백업 코드: 세이브 JSON 을 base64 로 감싼다. 기기를 옮길 때 쓴다. */
export function exportCode(data: SaveData): string {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return `GJ1:${btoa(bin)}`;
}

export function importCode(code: string): SaveData | null {
  const m = code.trim().match(/^GJ1:([A-Za-z0-9+/=]+)$/);
  if (!m) return null;
  try {
    const bin = atob(m[1]);
    const json = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    const raw = JSON.parse(json);
    if (!raw || raw.version !== 1) return null;
    return sanitize(raw);
  } catch {
    return null;
  }
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
