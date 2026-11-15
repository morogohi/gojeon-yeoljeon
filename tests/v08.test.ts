// v0.8: 이어 하기, 보상 중복 방지, 방어와 오답 기록 분리, 학습 지표 분리, 퍼즐 입문, 뜻 활용 문제, 저장 형식 이전
import { STORIES } from '../src/content/stories';
import { HANJA } from '../src/content/hanja';
import { EASY, TERMS, USAGE, usageOf } from '../src/content/learn';
import { defaultSave, exportCode, importCode, loadSave, persistSave, loadIssues, BROKEN_KEY, SAVE_KEY, type KV, type SaveData } from '../src/state/save';
import { createRng } from '../src/engine/rng';
import { battleQuestions, reviewQuestion, usageQuestion } from '../src/engine/questions';
import { answer, answerAt, createBattle, type BattleState } from '../src/engine/battle';
import { abandonSession, isResumable, newSession, sessionLabel, settleBattle } from '../src/engine/session';
import { applyClear, applyLog, hanjaStats, memoryOf, restoration } from '../src/engine/rewards';
import { recordAnswers, todayProgress } from '../src/engine/stats';
import { dueQueue, addDays } from '../src/engine/srs';
import { createPuzzle, puzzlePool, tap, type PuzzleState } from '../src/engine/puzzle';

const T = '2026-11-11';
const S2 = STORIES.find((s) => s.id === 'sagi-02')!;
const memKV = (): KV & { map: Map<string, string> } => {
  const map = new Map<string, string>();
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) };
};

/** sagi-02 대전 진행 세션. answers: 앞에서부터 정답(true)/오답(false) */
function battleSave(answers: boolean[], opts: { shield?: number } = {}): SaveData {
  const base = applyClear(defaultSave(), STORIES[0], 3).save; // sagi-01 복원, 인상여 합류
  const sess = newSession('sagi-02', 7, T);
  let b: BattleState = createBattle(battleQuestions(createRng(7), S2), { bonusHp: true, skill: opts.shield ? 'shield' : null, skillUses: opts.shield ?? 0 });
  for (const ok of answers) {
    const q = b.questions[b.index];
    b = answer(b, ok ? q.answer : (q.answer + 1) % q.options.length).state;
  }
  return { ...base, session: { ...sess, phase: 'battle', battle: b, heroId: opts.shield ? 'insangyeo' : null } };
}

describe('V 이어 하기와 보상', () => {
  it('V-01 대전 결과는 한 번만 반영된다(결과 재진입·새로고침으로 별·인물·학습량이 늘지 않음)', () => {
    const s = battleSave([true, true, true, true, true, true, true, true]);
    const once = settleBattle(s, S2, T);
    expect(once.result.stars).toBe(3);
    expect(once.save.session!.phase).toBe('result');
    const twice = settleBattle(once.save, S2, T);
    expect(twice.save).toBe(once.save);
    // 저장 → 불러오기 뒤에도 같은 결과, 다시 반영해도 그대로
    const kv = memKV();
    persistSave(kv, once.save);
    const loaded = loadSave(kv);
    expect(loaded.session!.result).toEqual(once.result);
    const again = settleBattle(loaded, S2, T).save;
    expect([again.stars, again.heroes, again.daily, again.cards]).toEqual([once.save.stars, once.save.heroes, once.save.daily, once.save.cards]);
  });

  it('V-02 그만두기: 이미 답한 문제만 학습 기록에 남고 별·인물은 주지 않는다', () => {
    const s = battleSave([false, true]);
    const next = abandonSession(s, T);
    expect(next.session).toBeNull();
    expect(next.stars['sagi-02']).toBeUndefined();
    expect(next.heroes.yeompa).toBeUndefined();
    expect(next.daily[T]).toEqual({ answered: 2, correct: 1 });
    const missed = s.session!.battle!.log[0].cardKey;
    expect(next.cards[missed].lapses).toBe(1);
    // 이야기 단계에서 그만두면 기록할 것이 없다
    const scene = { ...defaultSave(), session: { ...newSession('sagi-01', 1, T), scene: 2 } };
    expect(abandonSession(scene, T)).toEqual({ ...scene, session: null });
  });

  it('V-03 화면에 떠 있던 문제에만 답이 들어간다(연속 클릭·중복 채점 방지)', () => {
    const b = createBattle(battleQuestions(createRng(3), S2));
    const q = b.questions[0];
    const first = answerAt(b, 0, q.answer);
    expect(first.ignored).toBe(false);
    const dup = answerAt(first.state, 0, q.answer);
    expect(dup.ignored).toBe(true);
    expect(dup.state).toBe(first.state);
    expect(answerAt(first.state, 1, 9).ignored).toBe(true);
    expect(first.state.log).toHaveLength(1);
  });

  it('V-04 방어로 생명이 줄지 않아도 그 문제는 오답으로 기록되고 정답 수에 들지 않는다', () => {
    const s = battleSave([false], { shield: 1 });
    const b = s.session!.battle!;
    expect([b.hp, b.skillUses, b.wrong]).toEqual([b.maxHp, 0, 1]);
    expect(b.log[0].correct).toBe(false);
    const full = battleSave([false, true, true, true, true, true, true, true], { shield: 1 });
    const settled = settleBattle(full, S2, T).save;
    expect(settled.daily[T]).toEqual({ answered: 8, correct: 7 });
    expect(settled.cards[b.log[0].cardKey].reps).toBe(0);
    expect(settled.stars['sagi-02']).toBe(2); // 오답 1개 → 별 2
  });

  it('V-05 진행 단계 표시와 이어 하기 대상', () => {
    const sc = { ...newSession('sagi-02', 1, T), scene: 2 };
    expect(sessionLabel(sc, S2)).toBe('이야기 장면 3 / 4');
    expect(isResumable(newSession('sagi-02', 1, T))).toBe(false);
    expect(isResumable(sc)).toBe(true);
    const b = battleSave([true, false]).session!;
    expect(sessionLabel(b, S2)).toBe('한자 대전 3 / 8');
    expect(sessionLabel({ ...b, last: { q: 1, choice: 0, correct: false, blocked: false } }, S2)).toBe('한자 대전 2 / 8');
  });
});

describe('V 저장 형식 2와 이전', () => {
  it('V-06 v1 세이브 이전: 기록 유지, 만난 한자는 보수적으로(답한 적 있는 글자 + 복원한 성어)', () => {
    const kv = memKV();
    kv.map.set(SAVE_KEY, JSON.stringify({
      version: 1, stars: { 'sagi-01': 3 }, heroes: { insangyeo: { level: 1, xp: 0 } }, puzzleBest: 120, partyHeroId: 'insangyeo',
      cards: {
        'h:溫': { ease: 2.3, interval: 1, due: T, reps: 0, lapses: 1 }, // 틀린 적 있음 → 만남
        'h:新': { ease: 2.5, interval: 0, due: T, reps: 0, lapses: 0 }, // 단어장에 담기만 → 만남 아님
        'h:完': { ease: 2.5, interval: 3, due: T, reps: 2, lapses: 0 },
      },
      streak: { last: T, count: 3 }, wordbook: ['新'], settings: { large: true, sound: false, dailyGoal: 20, reminder: null }, daily: { [T]: { answered: 5, correct: 4 } }, events: { first_open: T },
    }));
    const s = loadSave(kv);
    expect(s.version).toBe(2);
    expect([...s.seen].sort()).toEqual(['完', '溫', '璧', '歸', '趙'].sort());
    expect(s.seen).not.toContain('新');
    expect([s.stars, s.puzzleBest, s.streak.count, s.wordbook, s.daily[T]]).toEqual([{ 'sagi-01': 3 }, 120, 3, ['新'], { answered: 5, correct: 4 }]);
    expect(s.settings).toEqual({ large: true, sound: false, dailyGoal: 20, reminder: null, level: null, puzzle: null });
    expect(s.session).toBeNull();
  });

  it('V-07 손상된 진행은 버리고 안내하며, 다른 기록은 그대로 둔다', () => {
    const good = battleSave([true, false]);
    const kv = memKV();
    const bad = { ...good, session: { ...good.session!, battle: { ...good.session!.battle!, index: 5 } } }; // 기록 수와 번호 불일치
    kv.map.set(SAVE_KEY, JSON.stringify(bad));
    loadIssues.droppedSession = false;
    const s = loadSave(kv);
    expect(s.session).toBeNull();
    expect(loadIssues.droppedSession).toBe(true);
    expect(s.stars).toEqual(good.stars);
    expect(s.heroes).toEqual(good.heroes);
    for (const broken of [
      { ...good.session!, storyId: 'nope' },
      { ...good.session!, phase: 'result' }, // 끝나지 않은 대전인데 결과 단계
      { ...good.session!, last: { q: 0, choice: 1, correct: true, blocked: false } }, // 마지막 답 번호 불일치
      { ...good.session!, battle: { ...good.session!.battle!, questions: [{ kind: 'x' }] } },
    ]) {
      kv.map.set(SAVE_KEY, JSON.stringify({ ...good, session: broken }));
      expect(loadSave(kv).session).toBeNull();
    }
    // 정상 세션은 그대로 돌아온다
    kv.map.set(SAVE_KEY, JSON.stringify(good));
    expect(loadSave(kv).session).toEqual(good.session);
  });

  it('V-08 읽을 수 없는 세이브는 지우지 않고 따로 보관한다', () => {
    const kv = memKV();
    kv.map.set(SAVE_KEY, '{"version":2, 깨짐');
    loadIssues.brokenSave = false;
    const s = loadSave(kv);
    expect(s).toEqual(defaultSave());
    expect(loadIssues.brokenSave).toBe(true);
    expect(kv.map.get(BROKEN_KEY)).toBe('{"version":2, 깨짐');
  });

  it('V-09 백업: v1 코드도 불러오고, 진행 중 대전은 옮기지 않는다', () => {
    const v1 = { version: 1, stars: { 'sagi-01': 2 }, heroes: {}, cards: { 'h:璧': { ease: 2.5, interval: 1, due: T, reps: 1, lapses: 0 } }, streak: { last: T, count: 1 }, puzzleBest: 0, partyHeroId: null };
    const code = `GJ1:${btoa(unescape(encodeURIComponent(JSON.stringify(v1))))}`;
    const s = importCode(code)!;
    expect(s.version).toBe(2);
    expect(s.stars['sagi-01']).toBe(2);
    expect(s.seen).toContain('璧');
    const withSession = battleSave([true]);
    expect(importCode(exportCode(withSession))!.session).toBeNull();
    expect(importCode(exportCode(withSession))!.stars).toEqual(withSession.stars);
  });
});

describe('V 학습 지표', () => {
  it('V-10 복습 오답: 만난 한자·서고 복원율은 그대로, 기억하는 한자만 줄고 다시 볼 한자가 는다', () => {
    let s = applyLog(defaultSave(), ['完', '璧', '歸'].map((c) => ({ cardKey: `h:${c}`, correct: true })), T);
    const before = hanjaStats(s);
    const pct = restoration(s);
    expect(before).toEqual({ seen: 3, remembered: 3, toReview: 0, total: HANJA.length });
    s = applyLog(s, [{ cardKey: 'h:璧', correct: false }], addDays(T, 1));
    expect(hanjaStats(s)).toEqual({ seen: 3, remembered: 2, toReview: 1, total: HANJA.length });
    expect(restoration(s)).toBe(pct);
    expect(memoryOf(s, '璧')).toBe('review');
    // 다시 맞히면 기억하는 한자로 돌아온다
    s = applyLog(s, [{ cardKey: 'h:璧', correct: true }], addDays(T, 2));
    expect(memoryOf(s, '璧')).toBe('remembered');
    expect(hanjaStats(s).remembered).toBe(3);
  });

  it('V-11 날짜 경계: 목표는 날마다 새로 세고, 복습은 예정일에 열린다', () => {
    let s = { ...defaultSave(), settings: { ...defaultSave().settings, dailyGoal: 10 } };
    s = recordAnswers(s, T, 10, 8);
    expect(todayProgress(s, T)).toEqual({ answered: 10, goal: 10, done: true });
    expect(todayProgress(s, addDays(T, 1))).toEqual({ answered: 0, goal: 10, done: false });
    s = applyLog(s, [{ cardKey: 'h:完', correct: true }], T); // 다음 복습은 내일
    expect(dueQueue(s.cards, T)).toEqual([]);
    expect(dueQueue(s.cards, addDays(T, 1))).toEqual(['h:完']);
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('V 퍼즐', () => {
  const solve = (start: PuzzleState): PuzzleState => {
    let s = start;
    for (const idiom of s.idioms.map((i) => i.idiom)) {
      for (const ch of idiom) {
        const t = s.tiles.find((x) => x.char === ch && !x.gone && !s.selection.includes(x.id))!;
        const r = tap(s, t.id);
        expect(r.event).not.toBe('reset');
        s = r.state;
      }
    }
    return s;
  };

  it('V-12 학습량 0·1·2·3·4·5편: 배운 성어만, 크기는 배운 만큼(최대 4), 0편은 예제 1개', () => {
    expect(puzzlePool(createRng(1), 'sample', [], STORIES).map((s) => s.id)).toEqual(['sagi-01']);
    for (const n of [1, 2, 3, 4, 5]) {
      const learned = STORIES.slice(0, n);
      for (let seed = 0; seed < 10; seed++) {
        const pool = puzzlePool(createRng(seed), 'learned', learned, STORIES);
        expect(pool).toHaveLength(Math.min(n, 4));
        pool.forEach((x) => expect(learned).toContain(x));
        const p = createPuzzle(createRng(seed), pool);
        expect(p.tiles).toHaveLength(Math.min(n, 4) * 4);
        expect(solve(p).done).toBe(true);
      }
    }
  });

  it('V-13 겹치는 글자(之·交 등)가 있는 모든 4성어 조합도 끝까지 풀린다', () => {
    let combos = 0;
    const n = STORIES.length;
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) for (let d = c + 1; d < n; d++) {
      const pick = [STORIES[a], STORIES[b], STORIES[c], STORIES[d]];
      expect(solve(createPuzzle(createRng(a * 1000 + d), pick)).done).toBe(true);
      combos += 1;
    }
    expect(combos).toBe(495);
  });
});

describe('V 입문 콘텐츠와 뜻 활용 문제', () => {
  it('V-14 쉬운 풀이는 12편 모두 있고 원문 번역·원뜻과 다르다. 어려운 말 풀이는 실제 장면에 나온다', () => {
    for (const s of STORIES) {
      expect(EASY[s.id], s.id).toBeTruthy();
      expect(EASY[s.id]).not.toBe(s.original.translation);
      expect(EASY[s.id]).not.toBe(s.meaning);
    }
    const scenes = STORIES.flatMap((s) => s.scenes.map((x) => x.text)).join('\n');
    for (const t of TERMS) expect(scenes, t.word).toContain(t.word);
  });

  it('V-15 뜻 활용 문제: 보기 4개가 서로 다르고 정답은 하나, 근거가 있다', () => {
    const ids = new Set(STORIES.map((s) => s.id));
    expect(USAGE.length).toBeGreaterThanOrEqual(4);
    for (const u of USAGE) {
      expect(ids.has(u.storyId) && ids.has(u.answer)).toBe(true);
      expect(new Set([u.answer, ...u.distractors]).size).toBe(4);
      u.distractors.forEach((d) => expect(ids.has(d)).toBe(true));
      expect(u.explain.length).toBeGreaterThan(10);
      for (let seed = 0; seed < 5; seed++) {
        const q = usageQuestion(createRng(seed), u);
        expect(new Set(q.options).size).toBe(4);
        const answer = STORIES.find((s) => s.id === u.answer)!;
        expect(q.options.filter((o) => o === `${answer.idiom} ${answer.reading}`)).toHaveLength(1);
        expect(q.options[q.answer]).toBe(`${answer.idiom} ${answer.reading}`);
        expect(q.cardKey).toBe(`i:${u.storyId}`);
      }
    }
  });

  it('V-16 뜻 활용 문제는 해당 고사의 복습에 섞이고, 기록·이어 하기 저장 형식을 통과한다', () => {
    for (const id of new Set(USAGE.map((u) => u.storyId))) {
      const kinds = new Set<string>();
      for (let seed = 0; seed < 80; seed++) kinds.add(reviewQuestion(createRng(seed), `i:${id}`).kind);
      for (const u of usageOf(id)) expect(kinds.has(u.kind)).toBe(true);
    }
    // 복습 기록: 성어 카드로 남는다
    const s = applyLog(defaultSave(), [{ cardKey: 'i:sagi-02', correct: true }], T);
    expect(s.cards['i:sagi-02'].reps).toBe(1);
    // 진행 저장 검사: 새 유형 문제가 든 대전도 저장 → 불러오기 왕복
    const q = usageQuestion(createRng(1), USAGE[0]);
    const base = battleSave([]);
    const b = { ...base.session!.battle!, questions: [...base.session!.battle!.questions.slice(0, 7), q] };
    const kv = memKV();
    persistSave(kv, { ...base, session: { ...base.session!, battle: b } });
    expect(loadSave(kv).session!.battle!.questions[7]).toEqual(q);
  });
});
