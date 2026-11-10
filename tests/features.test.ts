import { recordAnswers, todayProgress, weekReport, toggleWord, mistakes, reportText } from '../src/engine/stats';
import { defaultSave, exportCode, importCode, loadSave, SAVE_KEY, type KV } from '../src/state/save';
import { reviewQuestion } from '../src/engine/questions';
import { createRng } from '../src/engine/rng';
import { glossOf } from '../src/content/gloss';

const T = '2026-11-11';

describe('U-17 날짜별 학습 기록·하루 목표', () => {
  it('쌓이고, 60일 넘은 기록은 버린다', () => {
    let s = recordAnswers(defaultSave(), '2026-08-01', 5, 3);
    s = recordAnswers(s, T, 8, 6);
    s = recordAnswers(s, T, 2, 2);
    expect(s.daily[T]).toEqual({ answered: 10, correct: 8 });
    expect(s.daily['2026-08-01']).toBeUndefined();
    expect(todayProgress(s, T)).toEqual({ answered: 10, goal: 10, done: true });
  });
  it('주간 리포트: 7일, 정답률, 목표 달성일', () => {
    let s = recordAnswers(defaultSave(), '2026-11-09', 10, 9);
    s = recordAnswers(s, T, 4, 2);
    const r = weekReport(s, T);
    expect(r.days).toHaveLength(7);
    expect(r.days.at(-1)!.date).toBe(T);
    expect([r.answered, r.correct, r.accuracy, r.activeDays, r.goalDays]).toEqual([14, 11, 79, 2, 1]);
    expect(reportText(r, '사관')).toContain('정답률 79%');
  });
});

describe('U-18 단어장·오답 노트', () => {
  it('담으면 오늘 복습 카드가 생기고, 다시 누르면 빠진다', () => {
    let s = toggleWord(defaultSave(), '城', T);
    expect(s.wordbook).toEqual(['城']);
    expect(s.cards['h:城'].due).toBe(T);
    s = toggleWord(s, '城', T);
    expect(s.wordbook).toEqual([]);
  });
  it('사전 밖이 아닌 원문 한자도 복습 문제로 낼 수 있다', () => {
    const q = reviewQuestion(createRng(1), 'h:城');
    expect(q.options[q.answer]).toMatch(/재 성|城/);
  });
  it('오답 노트는 많이 틀린 순', () => {
    const s = { ...defaultSave(), cards: { 'h:璧': { ease: 2, interval: 1, due: T, reps: 0, lapses: 1 }, 'h:趙': { ease: 2, interval: 1, due: T, reps: 0, lapses: 3 }, 'h:完': { ease: 2.5, interval: 3, due: T, reps: 2, lapses: 0 } } };
    expect(mistakes(s).map((m) => m.key)).toEqual(['h:趙', 'h:璧']);
  });
});

describe('U-19 백업 코드·예전 세이브 호환', () => {
  it('내보내기 → 가져오기 왕복 (한글·한자 포함)', () => {
    const s = { ...toggleWord(defaultSave(), '璧', T), settings: { large: true, sound: false, dailyGoal: 20, reminder: '20:00' } };
    const code = exportCode(s);
    expect(code.startsWith('GJ1:')).toBe(true);
    expect(importCode(code)).toEqual(s);
  });
  it('잘못된 코드는 null', () => {
    expect(importCode('hello')).toBeNull();
    expect(importCode('GJ1:@@@')).toBeNull();
    expect(importCode(`GJ1:${btoa('{"version":2}')}`)).toBeNull();
  });
  it('v0.4 세이브(새 항목 없음)는 기본값으로 채운다', () => {
    const map = new Map<string, string>();
    const kv: KV = { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) };
    map.set(SAVE_KEY, JSON.stringify({ version: 1, stars: { 'sagi-01': 3 }, heroes: {}, cards: {}, streak: { last: T, count: 2 }, puzzleBest: 0, partyHeroId: null }));
    const s = loadSave(kv);
    expect(s.stars['sagi-01']).toBe(3);
    expect(s.settings).toEqual(defaultSave().settings);
    expect(s.wordbook).toEqual([]);
  });
  it('설정 값이 허용 범위를 벗어나면 기본값', () => {
    const bad = { ...defaultSave(), settings: { large: 'yes', sound: false, dailyGoal: 999, reminder: '7시' } };
    expect(importCode(exportCode(bad as never))!.settings).toEqual({ large: false, sound: false, dailyGoal: 10, reminder: null });
  });
  it('사전 note: 원문에서 다르게 읽는 글자를 알려 준다', () => {
    expect(glossOf('見')!.note).toContain('현');
    expect(glossOf('則')!.eum).toBe('즉');
  });
});
