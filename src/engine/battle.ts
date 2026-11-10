import type { SkillKind } from '../content/types';
import type { Question } from './questions';
import { type Rng, shuffle } from './rng';

export const BASE_HP = 3;
export const ENEMY_HP = 100;

export interface BattleState {
  questions: Question[];
  index: number;
  hp: number;
  maxHp: number;
  enemyHp: number;
  wrong: number;
  combo: number;
  maxCombo: number;
  skill: SkillKind | null;
  skillUses: number;       // 남은 사용 횟수 (shield는 남은 방어 횟수)
  removed: number[];       // 현재 문제에서 지운 보기
  hint: string | null;     // 현재 문제 힌트
  over: boolean;
  won: boolean;
  log: { cardKey: string; correct: boolean }[];
}

export interface BattleOptions {
  bonusHp?: boolean;
  skill?: SkillKind | null;
  skillUses?: number;
}

export function createBattle(questions: Question[], opts: BattleOptions = {}): BattleState {
  const maxHp = BASE_HP + (opts.bonusHp ? 1 : 0);
  return {
    questions, index: 0, hp: maxHp, maxHp, enemyHp: ENEMY_HP, wrong: 0, combo: 0, maxCombo: 0,
    skill: opts.skill ?? null, skillUses: opts.skill ? (opts.skillUses ?? 1) : 0,
    removed: [], hint: null, over: false, won: false, log: [],
  };
}

export function current(s: BattleState): Question | undefined {
  return s.questions[s.index];
}

export interface AnswerResult {
  state: BattleState;
  correct: boolean;
  blocked: boolean; // shield가 막았는지
}

export function answer(s: BattleState, choice: number): AnswerResult {
  const q = current(s);
  if (s.over || !q) return { state: s, correct: false, blocked: false };
  const correct = choice === q.answer;
  const dmg = ENEMY_HP / s.questions.length;
  let { hp, skillUses, combo, wrong } = s;
  let blocked = false;
  if (correct) {
    combo += 1;
  } else {
    combo = 0;
    wrong += 1;
    if (s.skill === 'shield' && skillUses > 0) {
      skillUses -= 1;
      blocked = true;
    } else {
      hp -= 1;
    }
  }
  const enemyHp = correct ? Math.max(0, Math.round((s.enemyHp - dmg) * 10) / 10) : s.enemyHp;
  const index = s.index + 1;
  const dead = hp <= 0;
  const finished = index >= s.questions.length;
  const state: BattleState = {
    ...s, hp, skillUses, combo, wrong, enemyHp, index,
    maxCombo: Math.max(s.maxCombo, combo),
    removed: [], hint: null,
    over: dead || finished,
    won: !dead && finished,
    log: [...s.log, { cardKey: q.cardKey, correct }],
  };
  return { state, correct, blocked };
}

export function canUseSkill(s: BattleState): boolean {
  if (s.over || !s.skill || s.skill === 'shield' || s.skillUses <= 0) return false;
  if (s.skill === 'heal') return s.hp < s.maxHp;
  if (s.skill === 'reveal') return s.removed.length === 0;
  if (s.skill === 'insight') return s.hint === null;
  return false;
}

export function useSkill(s: BattleState, rng: Rng): BattleState {
  if (!canUseSkill(s)) return s;
  const q = current(s)!;
  const next = { ...s, skillUses: s.skillUses - 1 };
  switch (s.skill) {
    case 'heal':
      return { ...next, hp: Math.min(s.maxHp, s.hp + 1) };
    case 'reveal': {
      const wrongIdx = q.options.map((_, i) => i).filter((i) => i !== q.answer);
      return { ...next, removed: shuffle(rng, wrongIdx).slice(0, 2) };
    }
    case 'insight':
      return { ...next, hint: [...q.options[q.answer]][0] };
    default:
      return s;
  }
}

/** 패배 0 / 오답 0 → 3 / 1 → 2 / 2 이상 → 1 */
export function starsOf(s: BattleState): 0 | 1 | 2 | 3 {
  if (!s.won) return 0;
  if (s.wrong === 0) return 3;
  if (s.wrong === 1) return 2;
  return 1;
}
