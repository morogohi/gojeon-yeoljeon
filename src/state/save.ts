import { STORIES } from '../content/stories';
import { HEROES } from '../content/heroes';
import type { SrsCard } from '../engine/srs';
import type { PlaySession, Phase } from '../engine/session';
import type { BattleState } from '../engine/battle';
import type { Question, QKind } from '../engine/questions';

/** 저장 형식 버전. 1 → 2: seen(만난 한자), session(이어 하기), settings.level·puzzle 추가 */
export const SAVE_VERSION = 2;

export interface SaveData {
  version: 2;
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
  /** 대전·복습에서 한 번이라도 풀어 본 한자(누적, 줄지 않는다) */
  seen: string[];
  /** 진행 중인 고사(한 번에 하나) */
  session: PlaySession | null;
}

export type LearnLevel = 'new' | 'some' | 'deep';
export const LEARN_LEVELS: LearnLevel[] = ['new', 'some', 'deep'];
export interface PuzzlePref { scope: 'learned' | 'all'; mode: 'timed' | 'practice' }

export interface Settings {
  large: boolean;          // 큰 글씨
  sound: boolean;          // 읽어 주기
  dailyGoal: number;       // 하루 목표 문제 수
  reminder: string | null; // 매일 알림 'HH:MM' (앱에서만)
  /** 학습 경험(생년월일 대신). null: 아직 고르지 않음 */
  level: LearnLevel | null;
  /** 퍼즐에서 사용자가 직접 고른 방식. null: 기본값(배운 성어 + 시간 제한 없음) */
  puzzle: PuzzlePref | null;
}

export const DAILY_GOALS = [10, 20, 30];

export interface KV {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

export const SAVE_KEY = 'gojeon-yeoljeon:save';

export function defaultSave(): SaveData {
  return {
    version: 2, stars: {}, heroes: {}, cards: {}, streak: { last: '', count: 0 }, puzzleBest: 0, partyHeroId: null,
    wordbook: [], settings: { large: false, sound: true, dailyGoal: 10, reminder: null, level: null, puzzle: null }, daily: {}, events: {},
    seen: [], session: null,
  };
}

/** 마지막으로 불러온 세이브에서 버린 것(손상된 진행 등). 화면에서 한 번 안내한다. */
export const loadIssues: { droppedSession: boolean; brokenSave: boolean } = { droppedSession: false, brokenSave: false };
export const BROKEN_KEY = 'gojeon-yeoljeon:save-broken';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const KINDS: QKind[] = ['char2hun', 'hun2char', 'blank', 'meaning', 'picture', 'usage', 'similar'];
const int = (v: unknown, lo: number, hi: number) => Number.isInteger(v) && (v as number) >= lo && (v as number) <= hi;

function validQuestion(q: unknown): q is Question {
  const x = q as Question;
  return !!x && typeof x === 'object' && KINDS.includes(x.kind) && typeof x.label === 'string' && typeof x.prompt === 'string'
    && Array.isArray(x.options) && x.options.length >= 2 && x.options.length <= 4 && x.options.every((o) => typeof o === 'string')
    && int(x.answer, 0, x.options.length - 1) && typeof x.cardKey === 'string' && /^(h|i):/.test(x.cardKey) && typeof x.explain === 'string';
}

function validBattle(b: unknown): b is BattleState {
  const x = b as BattleState;
  if (!x || typeof x !== 'object' || !Array.isArray(x.questions) || x.questions.length < 1 || x.questions.length > 12) return false;
  if (!x.questions.every(validQuestion)) return false;
  const n = x.questions.length;
  return int(x.index, 0, n) && int(x.maxHp, 1, 9) && int(x.hp, 0, x.maxHp) && int(x.wrong, 0, n) && int(x.combo, 0, n) && int(x.maxCombo, 0, n)
    && typeof x.enemyHp === 'number' && int(x.skillUses, 0, 9) && (x.skill === null || ['shield', 'heal', 'reveal', 'insight'].includes(x.skill))
    && Array.isArray(x.removed) && x.removed.every((r) => int(r, 0, 3)) && (x.hint === null || typeof x.hint === 'string')
    && typeof x.over === 'boolean' && typeof x.won === 'boolean'
    && Array.isArray(x.log) && x.log.length === x.index && x.log.every((l, i) => !!l && l.cardKey === x.questions[i].cardKey && typeof l.correct === 'boolean');
}

/** 저장된 진행을 검사한다. 하나라도 어긋나면 버린다(null). 다른 기록은 건드리지 않는다. */
export function sanitizeSession(raw: unknown, storyIds: Set<string>): PlaySession | null {
  const s = raw as PlaySession;
  if (!s || typeof s !== 'object' || !storyIds.has(s.storyId)) return null;
  const story = STORIES.find((x) => x.id === s.storyId)!;
  const phases: Phase[] = ['scene', 'original', 'battle', 'result'];
  if (!phases.includes(s.phase) || !int(s.scene, 0, story.scenes.length - 1) || typeof s.bonusHp !== 'boolean' || !int(s.seed, 0, 2 ** 32 - 1)) return null;
  if (s.picked !== null && !int(s.picked, 0, 3)) return null;
  if (s.heroId != null && !HEROES.some((x) => x.id === s.heroId)) return null;
  if (typeof s.updated !== 'string' || !DATE.test(s.updated)) return null;
  const needBattle = s.phase === 'battle' || s.phase === 'result';
  if (needBattle !== (s.battle !== null && s.battle !== undefined)) return null;
  if (s.battle && !validBattle(s.battle)) return null;
  if (s.battle && s.battle.questions.some((q) => q.cardKey.startsWith('i:') && q.cardKey !== `i:${story.id}`)) return null;
  let last = null;
  if (s.last) {
    const b = s.battle;
    const l = s.last;
    if (!b || !int(l.q, 0, b.questions.length - 1) || l.q !== b.index - 1 || !int(l.choice, 0, 3) || typeof l.correct !== 'boolean' || typeof l.blocked !== 'boolean') return null;
    last = { q: l.q, choice: l.choice, correct: l.correct, blocked: l.blocked };
  }
  let result = null;
  if (s.phase === 'result') {
    const r = s.result;
    if (!r || !int(r.stars, 0, 3) || typeof r.newHero !== 'boolean' || typeof r.levelUp !== 'boolean' || !s.battle!.over) return null;
    result = { stars: r.stars, newHero: r.newHero, levelUp: r.levelUp };
  } else if (s.result) return null;
  if (s.phase === 'battle' && s.battle!.over && !last) return null; // 끝난 대전은 결과 단계여야 한다
  return { storyId: s.storyId, phase: s.phase, scene: s.scene, picked: s.picked ?? null, bonusHp: s.bonusHp, seed: s.seed, heroId: s.heroId ?? null, battle: s.battle ?? null, last, result, updated: s.updated };
}

/**
 * v1 → v2: 과거 기록에서 '만난 한자'를 보수적으로 만든다.
 * - 복습 카드가 있고 한 번이라도 답한 흔적(reps ≥ 1 또는 lapses ≥ 1)이 있는 한자
 * - 복원한 고사(별 ≥ 1)의 성어 한자(대전에서 반드시 출제된다)
 * 단어장에 담기만 한 글자(답한 적 없음)는 넣지 않는다.
 */
export function migrateSeen(cards: Record<string, SrsCard>, stars: Record<string, number>): string[] {
  const seen = new Set<string>();
  for (const [k, c] of Object.entries(cards)) if (k.startsWith('h:') && (c.reps >= 1 || c.lapses >= 1)) seen.add(k.slice(2));
  for (const st of STORIES) if ((stars[st.id] ?? 0) >= 1) for (const ch of st.idiom) seen.add(ch);
  return [...seen];
}

function sanitize(raw: unknown): SaveData {
  const d = defaultSave();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Omit<Partial<SaveData>, 'version'> & { version?: number };
  if (r.version !== 1 && r.version !== 2) return d;
  const storyIds = new Set(STORIES.map((s) => s.id));
  const heroIds = new Set(HEROES.map((h) => h.id));
  for (const [k, v] of Object.entries(r.stars ?? {})) if (storyIds.has(k) && [0, 1, 2, 3].includes(v as number)) d.stars[k] = v as 0 | 1 | 2 | 3;
  for (const [k, v] of Object.entries(r.heroes ?? {})) if (heroIds.has(k) && v && typeof v.level === 'number') d.heroes[k] = { level: v.level, xp: v.xp ?? 0 };
  for (const [k, v] of Object.entries(r.cards ?? {})) {
    if (v && typeof v.due === 'string' && DATE.test(v.due)) d.cards[k] = { ease: Number(v.ease) || 2.5, interval: Number(v.interval) || 0, due: v.due, reps: Number(v.reps) || 0, lapses: Number(v.lapses) || 0 };
  }
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
      level: LEARN_LEVELS.includes(st.level as LearnLevel) ? (st.level as LearnLevel) : null,
      puzzle: st.puzzle && ['learned', 'all'].includes(st.puzzle.scope) && ['timed', 'practice'].includes(st.puzzle.mode) ? { scope: st.puzzle.scope, mode: st.puzzle.mode } : null,
    };
  }
  for (const [k, v] of Object.entries(r.daily ?? {})) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && v && typeof v.answered === 'number') d.daily[k] = { answered: v.answered, correct: Number(v.correct) || 0 };
  }
  for (const [k, v] of Object.entries(r.events ?? {})) {
    if (/^[a-z0-9_]{1,24}$/.test(k) && typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) d.events[k] = v;
  }
  // v2 항목. v1 세이브는 기존 기록으로 보수적으로 채운다.
  d.seen = r.version === 2
    ? (Array.isArray(r.seen) ? [...new Set(r.seen.filter((c) => typeof c === 'string' && [...c].length === 1))] : migrateSeen(d.cards, d.stars))
    : migrateSeen(d.cards, d.stars);
  if (r.version === 2 && r.session) {
    d.session = sanitizeSession(r.session, storyIds);
    if (!d.session) loadIssues.droppedSession = true;
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
    if (!raw || (raw.version !== 1 && raw.version !== 2)) return null;
    // 다른 기기의 진행 중 대전은 옮기지 않는다(백업은 기록을 옮기는 용도)
    return { ...sanitize({ ...raw, session: null }), session: null };
  } catch {
    return null;
  }
}

export function loadSave(kv: KV | null): SaveData {
  if (!kv) return defaultSave();
  let s: string | null = null;
  try {
    s = kv.getItem(SAVE_KEY);
    return s ? sanitize(JSON.parse(s)) : defaultSave();
  } catch {
    // 읽을 수 없는 세이브는 지우지 않고 따로 보관한 뒤 새로 시작한다(설정의 안내로 알린다)
    loadIssues.brokenSave = !!s;
    if (s) { try { kv.setItem(BROKEN_KEY, s); } catch { /* 보관도 못 하면 그대로 둔다 */ } }
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
