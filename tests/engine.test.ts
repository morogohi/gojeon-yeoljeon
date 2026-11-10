import { createRng } from '../src/engine/rng';
import { battleQuestions, reviewQuestion, type Question } from '../src/engine/questions';
import { createBattle, answer, useSkill, starsOf, canUseSkill, type BattleState } from '../src/engine/battle';
import { review, dueQueue, newCard, addDays, MIN_EASE } from '../src/engine/srs';
import { applyClear, applyLog, isUnlocked, restoration, rankOf, touchStreak, levelOf } from '../src/engine/rewards';
import { createPuzzle, tap, pickPuzzleStories, IDIOM_SCORE, TIME_BONUS } from '../src/engine/puzzle';
import { defaultSave, loadSave, persistSave, SAVE_KEY, type KV } from '../src/state/save';
import { STORIES, getStory } from '../src/content/stories';
import { HANJA } from '../src/content/hanja';

const S1 = getStory('sagi-01')!;
const TODAY = '2026-11-09';

function memKV(): KV & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) };
}

function playAll(s: BattleState, wrongAt: number[] = []): BattleState {
  while (!s.over) {
    const q = s.questions[s.index];
    const choice = wrongAt.includes(s.index) ? (q.answer + 1) % 4 : q.answer;
    s = answer(s, choice).state;
  }
  return s;
}

describe('U-01 rng', () => {
  it('같은 시드는 같은 수열, 범위 [0,1)', () => {
    const a = createRng(42), b = createRng(42);
    for (let i = 0; i < 1000; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe('문제 생성', () => {
  it('U-02 8문제, 유형 4·2·1·1, 성어 문제가 마지막 2개', () => {
    for (const story of STORIES) {
      const qs = battleQuestions(createRng(1), story);
      expect(qs).toHaveLength(8);
      const count = (k: string) => qs.filter((q) => q.kind === k).length;
      expect([count('char2hun'), count('hun2char'), count('blank'), count('meaning')]).toEqual([4, 2, 1, 1]);
      expect(qs[6].kind).toBe('blank');
      expect(qs[7].kind).toBe('meaning');
    }
  });

  it('U-03 보기 4개는 서로 다르고 정답은 정확히 1개', () => {
    const check = (q: Question) => {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
    };
    for (const story of STORIES) for (let seed = 0; seed < 50; seed++) battleQuestions(createRng(seed), story).forEach(check);
    for (const h of HANJA) check(reviewQuestion(createRng(7), `h:${h.char}`));
  });

  it('U-04 같은 시드 → 같은 문제', () => {
    expect(battleQuestions(createRng(9), S1)).toEqual(battleQuestions(createRng(9), S1));
  });

  it('빈칸 문제의 정답은 성어의 빈칸 글자', () => {
    const q = battleQuestions(createRng(3), S1)[6];
    const pos = [...q.prompt].indexOf('□');
    expect(q.options[q.answer]).toBe([...S1.idiom][pos]);
  });
});

describe('한자 대전', () => {
  const qs = () => battleQuestions(createRng(5), S1);

  it('U-05 전부 정답 → 적 체력 0, 승리, 별 3', () => {
    const s = playAll(createBattle(qs()));
    expect(s.enemyHp).toBe(0);
    expect(s.won).toBe(true);
    expect(starsOf(s)).toBe(3);
    expect(s.maxCombo).toBe(8);
  });

  it('U-06 오답 3개 → 즉시 패배, 이후 답안 무시', () => {
    let s = createBattle(qs());
    for (let i = 0; i < 3; i++) s = answer(s, (s.questions[s.index].answer + 1) % 4).state;
    expect(s.over).toBe(true);
    expect(s.won).toBe(false);
    expect(s.index).toBe(3);
    expect(starsOf(s)).toBe(0);
    expect(answer(s, 0).state).toBe(s);
  });

  it('U-07 오답 1개 → 별 2, 2개 → 별 1', () => {
    expect(starsOf(playAll(createBattle(qs()), [0]))).toBe(2);
    expect(starsOf(playAll(createBattle(qs()), [0, 5]))).toBe(1);
  });

  it('장면 보너스로 체력 4', () => {
    expect(createBattle(qs(), { bonusHp: true }).hp).toBe(4);
  });

  it('U-08 shield는 첫 오답의 체력 감소를 막는다', () => {
    let s = createBattle(qs(), { skill: 'shield', skillUses: 1 });
    expect(canUseSkill(s)).toBe(false); // 자동 발동
    const r = answer(s, (s.questions[0].answer + 1) % 4);
    expect(r.blocked).toBe(true);
    expect(r.state.hp).toBe(3);
    s = answer(r.state, (r.state.questions[1].answer + 1) % 4).state;
    expect(s.hp).toBe(2);
  });

  it('U-08 heal은 최대 체력을 넘지 않고 횟수가 제한된다', () => {
    let s = createBattle(qs(), { skill: 'heal', skillUses: 1 });
    expect(canUseSkill(s)).toBe(false); // 체력 가득
    s = answer(s, (s.questions[0].answer + 1) % 4).state;
    s = useSkill(s, createRng(1));
    expect(s.hp).toBe(3);
    expect(s.skillUses).toBe(0);
    s = answer(s, (s.questions[1].answer + 1) % 4).state;
    expect(useSkill(s, createRng(1)).hp).toBe(2);
  });

  it('U-09 reveal은 정답을 남기고 오답 2개를 지운다', () => {
    const s = useSkill(createBattle(qs(), { skill: 'reveal', skillUses: 1 }), createRng(2));
    const q = s.questions[0];
    expect(s.removed).toHaveLength(2);
    expect(s.removed).not.toContain(q.answer);
    expect(canUseSkill(s)).toBe(false);
  });

  it('insight는 정답의 첫 글자를 보여 준다', () => {
    const s = useSkill(createBattle(qs(), { skill: 'insight', skillUses: 2 }), createRng(2));
    expect(s.hint).toBe([...s.questions[0].options[s.questions[0].answer]][0]);
  });
});

describe('U-10·11 간격 반복', () => {
  it('정답 1일 → 3일 → ×ease', () => {
    let c = review(undefined, true, TODAY);
    expect([c.interval, c.due, c.reps]).toEqual([1, '2026-11-10', 1]);
    c = review(c, true, '2026-11-10');
    expect([c.interval, c.due]).toEqual([3, '2026-11-13']);
    c = review(c, true, '2026-11-13');
    expect(c.interval).toBe(8); // round(3 × 2.5)
  });

  it('오답: 1일, ease −0.2, 하한 1.3, lapses +1', () => {
    let c = review(review(undefined, true, TODAY), false, TODAY);
    expect([c.interval, c.reps, c.lapses, c.ease]).toEqual([1, 0, 1, 2.3]);
    for (let i = 0; i < 10; i++) c = review(c, false, TODAY);
    expect(c.ease).toBe(MIN_EASE);
  });

  it('복습 큐: due ≤ 오늘, 오름차순, 최대 10', () => {
    const cards: Record<string, ReturnType<typeof newCard>> = {};
    for (let i = 0; i < 15; i++) cards[`h:${HANJA[i].char}`] = { ...newCard(TODAY), due: addDays(TODAY, -i) };
    cards['h:未來'] = { ...newCard(TODAY), due: addDays(TODAY, 1) };
    const q = dueQueue(cards, TODAY);
    expect(q).toHaveLength(10);
    expect(q).not.toContain('h:未來');
    expect(q[0]).toBe(`h:${HANJA[14].char}`);
  });
});

describe('보상·진행', () => {
  it('U-12 첫 클리어는 인물 획득, 재클리어는 경험치, 별은 최고 기록', () => {
    let r = applyClear(defaultSave(), S1, 2);
    expect(r.newHero).toBe(true);
    expect(r.save.heroes.insangyeo).toEqual({ level: 1, xp: 0 });
    expect(r.save.partyHeroId).toBe('insangyeo');
    r = applyClear(r.save, S1, 3);
    expect(r.save.heroes.insangyeo).toEqual({ level: 2, xp: 3 });
    expect(r.levelUp).toBe(true);
    r = applyClear(r.save, S1, 1);
    expect(r.save.stars['sagi-01']).toBe(3);
    expect(applyClear(r.save, S1, 0).save).toBe(r.save);
    expect(levelOf(100)).toBe(5);
  });

  it('U-13 개방 규칙', () => {
    const s = defaultSave();
    expect(isUnlocked(s, S1)).toBe(true);
    expect(isUnlocked(s, getStory('nonyu-01')!)).toBe(true);
    expect(isUnlocked(s, getStory('sagi-02')!)).toBe(false);
    expect(isUnlocked(applyClear(s, S1, 1).save, getStory('sagi-02')!)).toBe(true);
  });

  it('U-13 복원률과 사관 등급 경계', () => {
    expect(restoration(defaultSave())).toBe(0);
    const save = applyLog(defaultSave(), HANJA.map((h) => ({ cardKey: `h:${h.char}`, correct: true })), TODAY);
    expect(restoration(save)).toBe(100);
    expect([24, 25, 59, 60, 99, 100].map((p) => rankOf(p).name)).toEqual(['견습 사관', '사관', '사관', '태사', '태사', '태사령']);
  });

  it('같은 판에서 한 번이라도 틀린 카드는 오답 처리', () => {
    const s = applyLog(defaultSave(), [{ cardKey: 'h:璧', correct: true }, { cardKey: 'h:璧', correct: false }], TODAY);
    expect(s.cards['h:璧'].lapses).toBe(1);
  });

  it('U-14 연속 출석', () => {
    let s = touchStreak(defaultSave(), TODAY);
    expect(s.streak).toEqual({ last: TODAY, count: 1 });
    expect(touchStreak(s, TODAY).streak.count).toBe(1);
    s = touchStreak(s, '2026-11-10');
    expect(s.streak.count).toBe(2);
    expect(touchStreak(s, '2026-11-12').streak.count).toBe(1);
  });
});

describe('U-15 성어 퍼즐', () => {
  const stories = STORIES.slice(0, 4);
  it('16칸은 성어 4개의 글자', () => {
    const p = createPuzzle(createRng(1), stories);
    expect(p.tiles.map((t) => t.char).sort()).toEqual(stories.flatMap((s) => [...s.idiom]).sort());
  });

  it('접두 일치 유지, 불일치 초기화, 완성 점수, 전부 완성 보너스', () => {
    let p = createPuzzle(createRng(1), stories);
    const idOf = (ch: string, state = p) => state.tiles.find((t) => t.char === ch && !t.gone && !state.selection.includes(t.id))!.id;
    let r = tap(p, idOf('完'));
    expect(r.event).toBe('keep');
    r = tap(r.state, idOf('囊', r.state));
    expect(r.event).toBe('reset');
    p = r.state;
    for (const [i, s] of stories.entries()) {
      for (const ch of s.idiom) r = tap(p, idOf(ch), 30), (p = r.state);
      expect(r.event).toBe(i === 3 ? 'done' : 'complete');
    }
    expect(p.score).toBe(4 * IDIOM_SCORE + 30 * TIME_BONUS);
  });

  it('개방 고사가 4개 미만이면 앞에서 채운다', () => {
    expect(pickPuzzleStories(createRng(1), [S1], STORIES)).toHaveLength(4);
  });
});

describe('U-16 세이브', () => {
  it('저장 → 불러오기 왕복', () => {
    const kv = memKV();
    const s = applyClear(defaultSave(), S1, 3).save;
    expect(persistSave(kv, s)).toBe(true);
    expect(loadSave(kv)).toEqual(s);
  });

  it('깨진 JSON·버전 불일치 → 새 세이브, 모르는 ID는 버림', () => {
    const kv = memKV();
    kv.setItem(SAVE_KEY, '{oops');
    expect(loadSave(kv)).toEqual(defaultSave());
    kv.setItem(SAVE_KEY, JSON.stringify({ version: 2 }));
    expect(loadSave(kv)).toEqual(defaultSave());
    kv.setItem(SAVE_KEY, JSON.stringify({ ...defaultSave(), stars: { 'sagi-01': 2, 'xx-99': 3 }, heroes: { nobody: { level: 1, xp: 0 } } }));
    expect(loadSave(kv).stars).toEqual({ 'sagi-01': 2 });
    expect(loadSave(kv).heroes).toEqual({});
  });

  it('저장소 오류에도 예외 없음', () => {
    const bad: KV = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('full'); } };
    expect(loadSave(bad)).toEqual(defaultSave());
    expect(persistSave(bad, defaultSave())).toBe(false);
    expect(loadSave(null)).toEqual(defaultSave());
  });
});

import { parseHash } from '../src/state/router';
describe('라우터 해시', () => {
  it('#name-arg 형식을 나눈다', () => {
    expect(parseHash('#story-sagi-01')).toEqual({ name: 'story', arg: 'sagi-01' });
    expect(parseHash('#home')).toEqual({ name: 'home', arg: '' });
    expect(parseHash('')).toEqual({ name: '', arg: '' });
  });
});

import { idiomPicture } from '../src/engine/questions';
describe('그림 문제', () => {
  it('그림 문제는 해당 고사의 삽화와 그 성어를 정답으로 가진다', () => {
    for (const story of STORIES) {
      const q = idiomPicture(createRng(4), story);
      expect(q.art).toBe(story.id);
      expect(q.options[q.answer]).toBe(`${story.idiom} ${story.reading}`);
      expect(new Set(q.options).size).toBe(4);
    }
  });
  it('복습의 성어 카드는 빈칸·뜻·그림 세 유형이 모두 나온다', () => {
    const kinds = new Set<string>();
    for (let seed = 0; seed < 60; seed++) kinds.add(reviewQuestion(createRng(seed), 'i:sagi-01').kind);
    expect([...kinds].sort()).toEqual(['blank', 'meaning', 'picture']);
  });
});
