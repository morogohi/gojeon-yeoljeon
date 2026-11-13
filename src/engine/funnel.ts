import type { SaveData } from '../state/save';

/**
 * 첫 고사(완벽귀조) 진행 단계. 이용자가 어디서 멈추는지 보려고 단계마다
 * '처음 도달한 날짜'만 기기 안에 남긴다. 개인정보는 없다.
 */
export const FIRST_STORY = 'sagi-01';

export const FUNNEL_STEPS = [
  { key: 'first_open', label: '처음 실행' },
  { key: 's1_scene', label: '첫 고사 장면 시작' },
  { key: 's1_choice', label: '인물 선택' },
  { key: 's1_original', label: '원문 읽기' },
  { key: 's1_battle', label: '대전 시작' },
  ...Array.from({ length: 8 }, (_, i) => ({ key: `s1_q${i + 1}`, label: `${i + 1}번 문제` })),
  { key: 's1_clear', label: '첫 고사 복원' },
  { key: 's1_hero', label: '첫 인물 합류' },
  { key: 'review_next_day', label: '다음 날 이후 복습' },
] as const;

export type FunnelKey = (typeof FUNNEL_STEPS)[number]['key'];

/** 처음 도달한 단계만 기록한다(이미 있으면 그대로). 바뀌었는지도 돌려준다. */
export function markStep(save: SaveData, key: FunnelKey, today: string): { save: SaveData; first: boolean } {
  if (save.events[key]) return { save, first: false };
  return { save: { ...save, events: { ...save.events, [key]: today } }, first: true };
}

/** 첫 고사를 복원한 날보다 뒤에 복습하면 '다음 날 이후 복습'으로 본다 */
export function isNextDayReview(save: SaveData, today: string): boolean {
  const clear = save.events.s1_clear;
  return !!clear && today > clear;
}

export function funnelSummary(save: SaveData): { key: string; label: string; date: string | null }[] {
  return FUNNEL_STEPS.map((s) => ({ key: s.key, label: s.label, date: save.events[s.key] ?? null }));
}
