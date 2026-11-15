// 고사 진행 세션: 이야기 장면 → 선택 → 원문 → 한자 대전 → 결과를 저장해 새로고침·재접속 뒤 이어 한다.
// 문제는 대전을 시작할 때 한 번 뽑아 세션에 저장한다. 새로고침으로 다시 뽑지 않는다.
import type { BattleState } from './battle';
import { starsOf } from './battle';
import type { Story } from '../content/types';
import type { SaveData } from '../state/save';
import { applyClear, applyLog } from './rewards';
import { recordAnswers } from './stats';

export type Phase = 'scene' | 'original' | 'battle' | 'result';

export interface LastAnswer {
  q: number;          // 답한 문제 번호(0부터)
  choice: number;
  correct: boolean;
  blocked: boolean;   // 인물 능력(방어)이 생명 감소를 막았는지
}

export interface SessionResult {
  stars: 0 | 1 | 2 | 3;
  newHero: boolean;
  levelUp: boolean;
}

export interface PlaySession {
  storyId: string;
  phase: Phase;
  scene: number;
  picked: number | null;   // 선택 장면에서 고른 보기
  bonusHp: boolean;
  seed: number;
  heroId: string | null;   // 대전에 나선 인물(대전 중 출전 인물을 바꿔도 이 판은 그대로)
  battle: BattleState | null;
  last: LastAnswer | null; // 답한 뒤 아직 다음 문제로 넘어가지 않음
  result: SessionResult | null; // 보상을 반영한 결과(다시 반영하지 않는다)
  updated: string;
}

export function newSession(storyId: string, seed: number, today: string, phase: Phase = 'scene'): PlaySession {
  return { storyId, phase, scene: 0, picked: null, bonusHp: false, seed: seed >>> 0, heroId: null, battle: null, last: null, result: null, updated: today };
}

/** 처음 화면에서 한 걸음이라도 나아갔는지 */
export function hasProgress(s: PlaySession | null): boolean {
  return !!s && (s.phase !== 'scene' || s.scene > 0 || s.picked !== null);
}

/** 이어 할 대상인지(결과까지 끝난 세션은 이어 하기 대상이 아니다) */
export function isResumable(s: PlaySession | null): s is PlaySession {
  return !!s && s.phase !== 'result' && hasProgress(s);
}

export function sessionLabel(s: PlaySession, story: Story): string {
  switch (s.phase) {
    case 'scene': return `이야기 장면 ${Math.min(s.scene + 1, story.scenes.length)} / ${story.scenes.length}`;
    case 'original': return '원문 읽기';
    case 'battle': {
      const b = s.battle;
      return b ? `한자 대전 ${Math.min((s.last ? s.last.q : b.index) + 1, b.questions.length)} / ${b.questions.length}` : '한자 대전';
    }
    default: return '결과 보기';
  }
}

/**
 * 대전이 끝났을 때 한 번만 보상·학습 기록을 반영한다. 같은 세션에 결과가 이미 있으면 그대로 돌려준다.
 */
export function settleBattle(save: SaveData, story: Story, today: string): { save: SaveData; result: SessionResult } {
  const s = save.session;
  if (!s || s.storyId !== story.id || !s.battle) throw new Error('settleBattle: 진행 중인 대전이 없다');
  if (s.result) return { save, result: s.result };
  const b = s.battle;
  const st = starsOf(b);
  let next = applyLog(save, b.log, today);
  next = recordAnswers(next, today, b.log.length, b.log.filter((l) => l.correct).length);
  const clear = applyClear(next, story, st);
  const result: SessionResult = { stars: st, newHero: clear.newHero, levelUp: clear.levelUp };
  return { save: { ...clear.save, session: { ...s, phase: 'result', result, updated: today } }, result };
}

/**
 * 진행 중인 세션을 그만둔다. 대전에서 이미 답한 문제는 학습 기록(복습 카드·푼 문제 수)에 남긴다.
 * 별·인물 보상은 주지 않는다. 처음부터 다시 해서 오답 기록을 지우거나 문제를 다시 뽑는 이득이 없게 한다.
 */
export function abandonSession(save: SaveData, today: string): SaveData {
  const s = save.session;
  if (!s) return save;
  let next: SaveData = { ...save, session: null };
  if (s.phase === 'battle' && s.battle && s.battle.log.length && !s.result) {
    const log = s.battle.log;
    next = applyLog(next, log, today);
    next = recordAnswers(next, today, log.length, log.filter((l) => l.correct).length);
  }
  return next;
}
