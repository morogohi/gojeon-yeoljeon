import { HANJA } from '../content/hanja';
import { STORIES, storiesOf } from '../content/stories';
import type { Story } from '../content/types';
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
  return { ...save, cards };
}

export function isUnlocked(save: SaveData, story: Story): boolean {
  const list = storiesOf(story.book);
  const i = list.findIndex((s) => s.id === story.id);
  return i <= 0 || (save.stars[list[i - 1].id] ?? 0) >= 1;
}

export function unlockedStories(save: SaveData): Story[] {
  return STORIES.filter((s) => isUnlocked(save, s));
}

export function restoration(save: SaveData): number {
  const learned = HANJA.filter((h) => (save.cards[`h:${h.char}`]?.reps ?? 0) >= 1).length;
  return Math.round((learned / HANJA.length) * 100);
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
