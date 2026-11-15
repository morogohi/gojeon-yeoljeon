import type { Page } from '@playwright/test';

/** 테스트 날짜·시드 고정: e2e=1 이면 시드 12345, today 로 날짜 고정 (src/state/store.ts) */
export const PLAY = (today = '2026-11-11') => `play/?e2e=1&today=${today}`;
export const SAVE_KEY = 'gojeon-yeoljeon:save';

/**
 * 기존 학습 사용자 상태. Playwright 는 테스트마다 새 브라우저 컨텍스트(빈 저장소)를 쓰므로
 * 실제 사용자 기록과 섞이지 않는다. 이 값은 그 격리된 컨텍스트에만 심는다.
 */
export function returningSave(today = '2026-11-11') {
  const card = (reps: number) => ({ ease: 2.5, interval: 3, due: '2026-11-20', reps, lapses: 0 });
  return {
    version: 1,
    stars: { 'sagi-01': 3, 'sagi-02': 2, 'nonyu-01': 1 },
    heroes: { insangyeo: { level: 2, xp: 3 }, yeompa: { level: 1, xp: 0 }, gongja: { level: 1, xp: 0 } },
    cards: Object.fromEntries(['完', '璧', '歸', '趙', '刎', '頸', '之', '交', '溫', '故', '知', '新'].map((c) => [`h:${c}`, card(1)])),
    streak: { last: today, count: 4 },
    puzzleBest: 420,
    partyHeroId: 'insangyeo',
    wordbook: ['陳'],
    settings: { large: false, sound: true, dailyGoal: 10, reminder: null },
    daily: { [today]: { answered: 6, correct: 5 } },
    events: { first_open: '2026-11-08', s1_clear: '2026-11-08' },
  };
}

/** 페이지를 열기 전에 격리된 저장소에 기존 사용자 기록을 심는다(처음 한 번만). */
export async function seedReturningUser(page: Page, today = '2026-11-11'): Promise<void> {
  await page.addInitScript(([key, data]) => {
    if (!window.localStorage.getItem(key as string)) window.localStorage.setItem(key as string, data as string);
  }, [SAVE_KEY, JSON.stringify(returningSave(today))]);
}

/** 화면이 가로로 넘치는지(px). 0 이하이면 정상. */
export function overflowX(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}
