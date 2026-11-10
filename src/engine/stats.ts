import { HANJA } from '../content/hanja';
import { STORIES } from '../content/stories';
import type { SaveData } from '../state/save';
import { addDays, newCard } from './srs';

const KEEP_DAYS = 60;

/** 푼 문제 수를 날짜별로 쌓는다. 60일이 지난 기록은 버린다. */
export function recordAnswers(save: SaveData, today: string, answered: number, correct: number): SaveData {
  const cut = addDays(today, -KEEP_DAYS);
  const daily: SaveData['daily'] = {};
  for (const [k, v] of Object.entries(save.daily)) if (k > cut) daily[k] = v;
  const cur = daily[today] ?? { answered: 0, correct: 0 };
  daily[today] = { answered: cur.answered + answered, correct: cur.correct + correct };
  return { ...save, daily };
}

export function todayProgress(save: SaveData, today: string): { answered: number; goal: number; done: boolean } {
  const answered = save.daily[today]?.answered ?? 0;
  const goal = save.settings.dailyGoal;
  return { answered, goal, done: answered >= goal };
}

export interface WeekReport {
  days: { date: string; answered: number; correct: number }[]; // 오래된 날 → 오늘
  answered: number;
  correct: number;
  accuracy: number; // %
  activeDays: number;
  learnedHanja: number;
  restoredStories: number;
  goalDays: number;
}

export function weekReport(save: SaveData, today: string): WeekReport {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    const d = save.daily[date] ?? { answered: 0, correct: 0 };
    return { date, ...d };
  });
  const answered = days.reduce((a, d) => a + d.answered, 0);
  const correct = days.reduce((a, d) => a + d.correct, 0);
  return {
    days, answered, correct,
    accuracy: answered ? Math.round((correct / answered) * 100) : 0,
    activeDays: days.filter((d) => d.answered > 0).length,
    learnedHanja: HANJA.filter((h) => (save.cards[`h:${h.char}`]?.reps ?? 0) >= 1).length,
    restoredStories: STORIES.filter((s) => (save.stars[s.id] ?? 0) > 0).length,
    goalDays: days.filter((d) => d.answered >= save.settings.dailyGoal).length,
  };
}

export function reportText(r: WeekReport, rankName: string): string {
  return [
    '「고전열전」 이번 주 학습 기록',
    `· 공부한 날 ${r.activeDays}일 / 7일 (목표 달성 ${r.goalDays}일)`,
    `· 푼 문제 ${r.answered}개, 정답률 ${r.accuracy}%`,
    `· 익힌 한자 ${r.learnedHanja}자, 복원한 고사 ${r.restoredStories}편`,
    `· 지금 등급: ${rankName}`,
  ].join('\n');
}

/** 단어장에 담기/빼기. 담을 때 복습 카드가 없으면 오늘 복습에 넣는다. */
export function toggleWord(save: SaveData, char: string, today: string): SaveData {
  const has = save.wordbook.includes(char);
  const wordbook = has ? save.wordbook.filter((c) => c !== char) : [...save.wordbook, char];
  const key = `h:${char}`;
  const cards = !has && !save.cards[key] ? { ...save.cards, [key]: newCard(today) } : save.cards;
  return { ...save, wordbook, cards };
}

/** 자주 틀린 카드 (오답 노트): 틀린 횟수 많은 순 */
export function mistakes(save: SaveData, limit = 30): { key: string; lapses: number }[] {
  return Object.entries(save.cards)
    .filter(([, c]) => c.lapses > 0)
    .sort((a, b) => b[1].lapses - a[1].lapses || (a[0] < b[0] ? -1 : 1))
    .slice(0, limit)
    .map(([key, c]) => ({ key, lapses: c.lapses }));
}
