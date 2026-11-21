import { HANJA, PACK_HANJA } from '../content/hanja';
import { ALL_STORIES, STORIES, storiesOf } from '../content/stories';
import { getPack } from '../content/packs';
import type { Hanja, Story } from '../content/types';
import type { SaveData } from '../state/save';
import { review, addDays } from './srs';

export const MAX_LEVEL = 5;

export function levelOf(xp: number): number {
  return Math.min(MAX_LEVEL, 1 + Math.floor(xp / 3));
}

export function skillUsesFor(level: number): number {
  return level >= 3 ? 2 : 1;
}

export interface ClearResult {
  save: SaveData;
  newHero: boolean;
  levelUp: boolean;
  bestStars: number;
}

/** 대전 결과 반영. stars 0(패배)이면 진행은 그대로 둔다. */
export function applyClear(save: SaveData, story: Story, stars: 0 | 1 | 2 | 3): ClearResult {
  const prevBest = save.stars[story.id] ?? 0;
  if (stars === 0) return { save, newHero: false, levelUp: false, bestStars: prevBest };
  const heroes = { ...save.heroes };
  const had = heroes[story.heroId];
  let newHero = false;
  let levelUp = false;
  if (!had) {
    heroes[story.heroId] = { level: 1, xp: 0 };
    newHero = true;
  } else {
    const xp = had.xp + stars;
    const level = levelOf(xp);
    levelUp = level > had.level;
    heroes[story.heroId] = { level, xp };
  }
  const best = Math.max(prevBest, stars) as 0 | 1 | 2 | 3;
  return {
    save: { ...save, heroes, stars: { ...save.stars, [story.id]: best }, partyHeroId: save.partyHeroId ?? story.heroId },
    newHero, levelUp, bestStars: best,
  };
}

/** 답안 기록을 SRS 카드에 반영 */
export function applyLog(save: SaveData, log: { cardKey: string; correct: boolean }[], today: string): SaveData {
  const cards = { ...save.cards };
  // 같은 판에서 한 카드가 여러 번 나오면 한 번이라도 틀렸으면 오답으로 본다
  const merged = new Map<string, boolean>();
  for (const { cardKey, correct } of log) merged.set(cardKey, (merged.get(cardKey) ?? true) && correct);
  for (const [k, correct] of merged) cards[k] = review(cards[k], correct, today);
  // 풀어 본 한자는 맞혔든 틀렸든 '만난 한자'로 누적한다(오답으로 줄지 않는다)
  const met = [...merged.keys()].filter((k) => k.startsWith('h:')).map((k) => k.slice(2));
  const seen = met.some((c) => !save.seen.includes(c)) ? [...new Set([...save.seen, ...met])] : save.seen;
  return { ...save, cards, seen };
}

/** 확장팩을 가졌는지(구매·복원으로 save.owned 에 기록) */
export function ownsPack(save: SaveData, packId: string): boolean {
  return save.owned.includes(packId);
}

/** 이 고사를 열 수 있는 권리: 무료 고사, 보유한 팩, 팩의 체험 고사 */
export function isEntitled(save: SaveData, story: Story): boolean {
  if (!story.pack) return true;
  const pack = getPack(story.pack);
  return !!pack && (ownsPack(save, pack.id) || pack.trialIds.includes(story.id));
}

/** 권리가 있고, 같은 원전(책)의 앞 고사를 복원했으면 열린다 */
export function isUnlocked(save: SaveData, story: Story): boolean {
  if (!isEntitled(save, story)) return false;
  const list = storiesOf(story.book);
  const i = list.findIndex((s) => s.id === story.id);
  return i <= 0 || (save.stars[list[i - 1].id] ?? 0) >= 1;
}

export function unlockedStories(save: SaveData): Story[] {
  return ALL_STORIES.filter((s) => isUnlocked(save, s));
}

/** 서고 지표에 들어가는 한자: 무료 44자 + 보유한 팩의 한자 */
export function libraryHanja(save: SaveData): Hanja[] {
  // 팩끼리 겹치는 글자(先 등)는 한 번만 센다
  const all = [...HANJA, ...save.owned.flatMap((id) => PACK_HANJA[id] ?? [])];
  return all.filter((x, i) => all.findIndex((y) => y.char === x.char) === i);
}

/**
 * 한자 지표(홈·도감·기록 공통)
 * - seen 만난 한자: 대전·복습에서 한 번이라도 풀어 본 44자 중 글자 수. 누적이라 오답으로 줄지 않는다.
 * - remembered 기억하는 한자: 만난 한자 중 가장 최근 답이 정답인 글자(복습 카드 reps ≥ 1).
 * - toReview 다시 볼 한자: 만난 한자 중 최근에 틀려서 다시 익히는 글자. 복습에서 맞히면 기억하는 한자로 돌아간다.
 */
export function hanjaStats(save: SaveData): { seen: number; remembered: number; toReview: number; total: number } {
  const seenSet = new Set(save.seen);
  const lib = libraryHanja(save);
  const seen = lib.filter((x) => seenSet.has(x.char));
  const remembered = seen.filter((x) => (save.cards[`h:${x.char}`]?.reps ?? 0) >= 1).length;
  return { seen: seen.length, remembered, toReview: seen.length - remembered, total: lib.length };
}

/** 한 글자의 기억 상태: none(아직 안 만남) / review(다시 볼) / remembered(기억함) / strong(오래 기억함, reps ≥ 3) */
export function memoryOf(save: SaveData, char: string): 'none' | 'review' | 'remembered' | 'strong' {
  const reps = save.cards[`h:${char}`]?.reps ?? 0;
  if (!save.seen.includes(char)) return reps >= 1 ? 'remembered' : 'none';
  return reps >= 3 ? 'strong' : reps >= 1 ? 'remembered' : 'review';
}

/** 서고 복원율 = 만난 한자 ÷ 전체 44자. 누적 성취라 오답으로 줄지 않는다. */
export function restoration(save: SaveData): number {
  const { seen, total } = hanjaStats(save);
  return Math.round((seen / total) * 100);
}

export function rankOf(pct: number): { name: string; hanja: string } {
  if (pct >= 100) return { name: '태사령', hanja: '太史令' };
  if (pct >= 60) return { name: '태사', hanja: '太史' };
  if (pct >= 25) return { name: '사관', hanja: '史官' };
  return { name: '견습 사관', hanja: '見習史官' };
}

export function touchStreak(save: SaveData, today: string): SaveData {
  const { last, count } = save.streak;
  if (last === today) return save;
  const next = last && addDays(last, 1) === today ? count + 1 : 1;
  return { ...save, streak: { last: today, count: next } };
}

const EPOCH = '2026-01-01';

export function todaysStory(today: string): Story {
  const d = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${EPOCH}T00:00:00Z`)) / 86400000);
  return STORIES[((d % STORIES.length) + STORIES.length) % STORIES.length];
}
