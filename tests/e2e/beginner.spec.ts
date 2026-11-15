// v0.8 회귀: 중단 후 이어 하기, 보상 중복 방지, 방어와 오답 분리, 입문 퍼즐, 학습 지표, 입문 지원, 키보드, 백업, 날짜 경계
import { test, expect, type Page } from '@playwright/test';
import { PLAY, SAVE_KEY, seedReturningUser, overflowX } from './fixtures';

const DAY = PLAY('2026-11-11');
const NEXT = PLAY('2026-11-12');
const saved = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), SAVE_KEY);

/** 기존 학습 사용자(sagi-01 복원, 인상여 출전·완벽 방어 1회)로 문경지교 대전 1번 문제까지 간다 */
async function toBattle(page: Page) {
  await seedReturningUser(page);
  await page.goto(`${DAY}#story-sagi-02`);
  await page.locator('.scene').waitFor();
  while (!(await page.locator('.choice').first().isVisible())) await page.getByTestId('next').click();
  await page.locator('.choice[data-correct="1"]').click();
  await page.getByTestId('to-original').click();
  await page.getByTestId('start-battle').click();
  await expect(page.locator('.q-progress')).toHaveText('1 / 8');
}

test('E-14 이야기 장면에서 새로고침 → 이어 하기는 실제 멈춘 장면으로, 처음부터 보기도 고를 수 있다', async ({ page }) => {
  await seedReturningUser(page);
  await page.goto(`${DAY}#story-sagi-02`);
  await expect(page.getByTestId('scene-no')).toHaveText('장면 1 / 4');
  await expect(page.getByTestId('recap')).toContainText('완벽귀조');
  await page.getByTestId('next').click();
  await page.getByTestId('next').click();
  await expect(page.getByTestId('scene-no')).toHaveText('장면 3 / 4');
  await page.reload();
  await expect(page.getByTestId('resume-where')).toHaveText('刎頸之交 문경지교 · 이야기 장면 3 / 4');
  await page.getByTestId('resume-continue').click();
  await expect(page.getByTestId('scene-no')).toHaveText('장면 3 / 4');
  // 이전 장면 보기
  await page.getByTestId('prev').click();
  await expect(page.getByTestId('scene-no')).toHaveText('장면 2 / 4');
  // 홈에서도 멈춘 곳이 보인다
  await page.goto(`${DAY}#home`);
  await expect(page.getByTestId('resume-session-where')).toHaveText('이야기 장면 2 / 4');
  await page.getByTestId('resume-session').click();
  await page.getByTestId('resume-restart').click();
  await expect(page.getByTestId('scene-no')).toHaveText('장면 1 / 4');
});

test('E-15 선택 결과·원문 단계도 새로고침 뒤 그대로', async ({ page }) => {
  await seedReturningUser(page);
  await page.goto(`${DAY}#story-sagi-02`);
  await page.locator('.scene').waitFor();
  while (!(await page.locator('.choice').first().isVisible())) await page.getByTestId('next').click();
  await page.locator('.choice:not([data-correct])').first().click();
  await page.reload();
  await page.getByTestId('resume-continue').click();
  await expect(page.locator('.choice-feedback')).toContainText('실제 역사는 달랐어요');
  await expect(page.locator('.choice.wrong')).toContainText('✗ 내 선택');
  await expect(page.locator('.choice:not([disabled])')).toHaveCount(0); // 다시 고를 수 없다
  await page.getByTestId('to-original').click();
  await page.reload();
  await expect(page.getByTestId('resume-where')).toContainText('원문 읽기');
  await page.getByTestId('resume-continue').click();
  await expect(page.getByTestId('start-battle')).toBeVisible();
  await page.getByTestId('start-battle').click();
  // 오답 선택이었으므로 보너스 생명 없음(새로고침으로 바뀌지 않음)
  await expect(page.getByTestId('hp')).toHaveAttribute('aria-label', '남은 생명 3/3');
});

test('E-16 대전 오답 후 새로고침: 같은 문제·같은 상태, 방어는 부활하지 않고 오답은 오답으로 남는다', async ({ page }) => {
  await toBattle(page);
  const before = (await saved(page)).session.battle.questions;
  const prompt = await page.locator('.quiz-prompt').textContent();
  await page.locator('.opt:not([data-correct])').first().click();
  // 학습 결과와 게임 효과를 따로 알려 준다
  await expect(page.getByTestId('answer-result')).toContainText('✗ 조금 달라요. 정답:');
  await expect(page.getByTestId('game-effect')).toContainText('인상여의 완벽 방어 덕분에 생명은 줄지 않았어요. 남은 방어 0번 · 이 문제는 틀린 문제로 기록돼요.');
  await expect(page.getByTestId('memory-tip')).toContainText('기억 도움:');
  await expect(page.locator('.opt.wrong .mark')).toHaveText('✗ ');
  await expect(page.locator('.opt.right .mark')).toHaveText('✓ ');
  await expect(page.getByTestId('skill')).toHaveText('완벽 방어 0');

  await page.reload();
  await expect(page.getByTestId('resume-where')).toContainText('한자 대전 1 / 8');
  await page.getByTestId('resume-continue').click();
  // 답한 직후 상태 그대로: 같은 문제, 같은 설명, 방어 0, 생명 4/4
  await expect(page.locator('.quiz-prompt')).toHaveText(prompt!);
  await expect(page.getByTestId('answer-result')).toContainText('조금 달라요');
  await expect(page.getByTestId('skill')).toHaveText('완벽 방어 0');
  await expect(page.getByTestId('hp')).toHaveAttribute('aria-label', '남은 생명 4/4');
  const after = await saved(page);
  expect(after.session.battle.questions).toEqual(before); // 다시 추첨하지 않음
  expect(after.session.battle.log).toEqual([{ cardKey: before[0].cardKey, correct: false }]);
  await page.getByTestId('continue').click();
  await expect(page.locator('.q-progress')).toHaveText('2 / 8');

  // 답하기 전 상태에서 새로고침: 2번 문제 그대로
  const p2 = await page.locator('.quiz-prompt').textContent();
  await page.reload();
  await page.getByTestId('resume-continue').click();
  await expect(page.locator('.q-progress')).toHaveText('2 / 8');
  await expect(page.locator('.quiz-prompt')).toHaveText(p2!);
});

test('E-17 결과 화면 새로고침·재진입으로 별·인물·학습량이 늘지 않는다', async ({ page }) => {
  await toBattle(page);
  for (let i = 1; i <= 8; i++) {
    await expect(page.locator('.q-progress')).toHaveText(`${i} / 8`);
    await page.locator('.opt[data-correct="1"]').click();
  }
  await expect(page.getByTestId('result')).toBeVisible();
  const a = await saved(page);
  expect(a.stars['sagi-02']).toBe(3);
  await page.reload();
  await expect(page.getByTestId('result')).toBeVisible();
  await expect(page.getByTestId('hero-reward')).toContainText('廉頗');
  await page.reload();
  const b = await saved(page);
  expect([b.stars, b.heroes, b.daily, b.cards, b.seen]).toEqual([a.stars, a.heroes, a.daily, a.cards, a.seen]);
  // 다른 화면으로 나가면 끝난 진행은 정리되고, 다시 들어오면 새로 시작
  await page.goto(`${DAY}#map-sagi`);
  await page.goto(`${DAY}#story-sagi-02`);
  await expect(page.getByTestId('scene-no')).toHaveText('장면 1 / 4');
  const c = await saved(page);
  expect([c.stars, c.heroes, c.daily]).toEqual([a.stars, a.heroes, a.daily]);
});

test('E-18 다른 고사에 들어가면 하던 고사를 알려 주고, 그만두면 푼 문제만 기록된다', async ({ page }) => {
  await toBattle(page);
  await page.locator('.opt:not([data-correct])').first().click();
  await page.goto(`${DAY}#story-nonyu-02`);
  await expect(page.getByTestId('other-session')).toContainText('刎頸之交 문경지교 · 한자 대전 1 / 8');
  await page.getByTestId('other-resume').click();
  await expect(page.getByTestId('resume-prompt')).toBeVisible();
  await page.goto(`${DAY}#story-nonyu-02`);
  const answeredBefore = (await saved(page)).daily['2026-11-11'].answered;
  await page.getByTestId('other-abandon').click();
  await expect(page.getByTestId('scene-no')).toHaveText('장면 1 / 3');
  const s = await saved(page);
  expect(s.daily['2026-11-11'].answered).toBe(answeredBefore + 1);
  expect(s.stars['sagi-02']).toBe(2); // 원래 기록 그대로(보상 없음)
  expect(s.session.storyId).toBe('nonyu-02');
});

test('E-19 손상된 진행 정보: 앱이 멈추지 않고 안내하며 기존 기록은 지우지 않는다', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript((k) => {
    if (localStorage.getItem(k)) return;
    localStorage.setItem(k, JSON.stringify({
      version: 2, stars: { 'sagi-01': 3 }, heroes: { insangyeo: { level: 1, xp: 0 } }, cards: {}, streak: { last: '', count: 0 }, puzzleBest: 0, partyHeroId: 'insangyeo',
      wordbook: [], settings: { large: false, sound: true, dailyGoal: 10, reminder: null, level: null, puzzle: null }, daily: {}, events: {}, seen: ['完'],
      session: { storyId: 'sagi-02', phase: 'battle', scene: 3, picked: 0, bonusHp: true, seed: 1, heroId: null, battle: { questions: 'broken' }, last: null, result: null, updated: '2026-11-10' },
    }));
  }, SAVE_KEY);
  await page.goto(`${DAY}#story-sagi-02`);
  await expect(page.getByTestId('session-notice')).toContainText('처음부터 시작해요');
  await expect(page.getByTestId('scene-no')).toHaveText('장면 1 / 4');
  const s = await saved(page);
  expect([s.stars, s.seen]).toEqual([{ 'sagi-01': 3 }, ['完']]);
  expect(errors).toEqual([]);
});

test('E-20 퍼즐 입문: 학습량 0은 예제, 1편은 성어 1개·패 4개, 3편은 3개. 기본은 시간 제한 없음, 고른 방식은 기억', async ({ page }) => {
  await page.goto(`${DAY}#puzzle`);
  await expect(page.getByTestId('scope-sample')).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByTestId('mode-practice')).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByTestId('puzzle-first-story')).toBeVisible();
  await page.getByTestId('puzzle-start').click();
  await expect(page.locator('.tile')).toHaveCount(4);
  for (const ch of '完璧歸趙') await page.locator(`.tile[data-char="${ch}"]:not(.gone)`).first().click();
  await expect(page.getByTestId('puzzle-done')).toContainText('한 성어를 모두 맞췄다');

  // 기존 학습 사용자(3편): 배운 성어 3개 = 패 12개, 안 배운 성어는 없음
  const ctx = await page.context().browser()!.newContext();
  const p = await ctx.newPage();
  await seedReturningUser(p);
  await p.goto(`${DAY}#puzzle`);
  await expect(p.getByTestId('scope-learned')).toHaveAttribute('aria-checked', 'true');
  await expect(p.getByTestId('scope-learned')).toContainText('배운 성어 3개 · 한자 패 12개');
  await p.getByTestId('puzzle-start').click();
  await expect(p.locator('.tile')).toHaveCount(12);
  const readings = (await p.locator('.targets li').allTextContents()).map((x) => x.trim()).sort();
  expect(readings).toEqual(['문경지교', '온고지신', '완벽귀조'].sort());
  await p.waitForTimeout(1500);
  await expect(p.getByTestId('clock')).toHaveText('연습'); // 시간 만료로 끝나지 않는다
  // 사용자가 60초 도전을 고르면 다음에도 유지
  await p.goto(`${DAY}#home`);
  await p.goto(`${DAY}#puzzle`);
  await p.getByTestId('mode-timed').click();
  await p.goto(`${DAY}#home`);
  await p.goto(`${DAY}#puzzle`);
  await expect(p.getByTestId('mode-timed')).toHaveAttribute('aria-checked', 'true');
  await ctx.close();
});

test('E-21 복습 오답 뒤에도 만난 한자·서고 복원은 유지, 홈·도감·기록이 같은 지표를 보인다', async ({ page }) => {
  await seedReturningUser(page, '2026-11-20'); // 카드 예정일 = 오늘
  const D = PLAY('2026-11-20');
  await page.goto(`${D}#home`);
  await expect(page.getByTestId('learned-count')).toHaveText('만난 한자 12자 / 44자 · 기억하는 한자 12자 · 다시 볼 한자 0자');
  const pct = await page.getByTestId('restore').textContent();
  await page.goto(`${D}#review`);
  await page.locator('.opt:not([data-correct])').first().click();
  await expect(page.locator('.battle-feedback')).toContainText('만난 한자 수는 그대로');
  await page.goto(`${D}#home`);
  const after = (await saved(page)).cards;
  const wrongIsHanja = Object.values(after).some((c) => (c as { lapses: number }).lapses > 0);
  const expected = wrongIsHanja ? '만난 한자 12자 / 44자 · 기억하는 한자 11자 · 다시 볼 한자 1자' : '만난 한자 12자 / 44자 · 기억하는 한자 12자 · 다시 볼 한자 0자';
  await expect(page.getByTestId('learned-count')).toHaveText(expected);
  await expect(page.getByTestId('restore')).toHaveText(pct!);
  await page.goto(`${D}#codex-hanja`);
  await expect(page.locator('.hint-line')).toContainText(wrongIsHanja ? '만난 한자 12/44 · 기억하는 한자 11 · 다시 볼 한자 1' : '만난 한자 12/44 · 기억하는 한자 12 · 다시 볼 한자 0');
  await expect(page.locator('.hanja-cell[data-memory="review"]')).toHaveCount(wrongIsHanja ? 1 : 0);
  await page.goto(`${D}#report`);
  await expect(page.getByTestId('report-stats')).toContainText('12자만난 한자');
  await expect(page.getByTestId('report-stats')).toContainText(`${wrongIsHanja ? 11 : 12}자기억하는 한자`);
});

test('E-22 입문 지원: 학습 경험 선택(강제 아님), 쉬운 뜻·어려운 말 풀이, 원뜻은 더 알아보기에', async ({ page }) => {
  await page.goto(`${DAY}#home`);
  await expect(page.getByTestId('level-pick')).toBeVisible();
  await page.getByTestId('level-new').click();
  expect((await saved(page)).settings.level).toBe('new');
  await page.getByTestId('level-large').click();
  await expect(page.locator('body')).toHaveClass(/large/);
  await expect(page.getByTestId('tab-review')).toContainText('배운 한자 다시 보기');
  await page.getByTestId('first-start').click();
  await expect(page.getByTestId('idiom-intro')).toContainText('完璧歸趙 완벽귀조');
  await expect(page.getByTestId('idiom-intro')).toContainText('쉬운 뜻 빌린 것을 흠 하나 없이 그대로 돌려주는 것');
  await expect(page.locator('.intro-chars')).toContainText('完 완전할 완');
  await expect(page.getByTestId('terms')).toContainText('전국시대');
  await expect(page.getByTestId('terms')).toContainText('조나라');
  while (!(await page.locator('.choice').first().isVisible())) await page.getByTestId('next').click();
  await page.locator('.choice[data-correct="1"]').click();
  await page.getByTestId('to-original').click();
  await expect(page.getByTestId('idiom-easy')).toContainText('쉬운 풀이');
  await expect(page.locator('.original-tr')).toContainText('원문 번역');
  await expect(page.getByTestId('more')).not.toHaveAttribute('open', '');
  await page.getByTestId('more').locator('summary').click();
  await expect(page.getByTestId('more')).toContainText('원뜻 구슬을 흠 없이 조나라로 돌려보냄');
  // 설정에서 바꿀 수 있다
  await page.goto(`${DAY}#settings`);
  await page.getByTestId('set-level').getByText('깊게 읽기').click();
  expect((await saved(page)).settings.level).toBe('deep');
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    for (const r of ['home', 'story-sagi-01', 'puzzle', 'settings']) {
      await page.goto(`${DAY}#${r}`);
      await page.waitForTimeout(100);
      expect(await overflowX(page), `${width} ${r}`).toBeLessThanOrEqual(0);
    }
  }
});

test('E-23 기존 사용자는 학습 경험 선택 없이 지금 흐름 그대로', async ({ page }) => {
  await seedReturningUser(page);
  await page.goto(`${DAY}#home`);
  await expect(page.getByTestId('level-pick')).toHaveCount(0);
  await expect(page.getByTestId('continue-story')).toBeVisible();
});

test('E-24 키보드: 원문 한자 팝업 열기·안에서 초점 이동·Esc 로 닫으면 원래 글자로 초점 복귀', async ({ page }) => {
  await page.goto(`${DAY}#story-sagi-05`); // 잠긴 고사는 원문 카드만
  const hz = page.locator('.original-text .hz').first();
  await hz.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('hanja-sheet')).toBeVisible();
  await expect(page.locator('.sheet-close')).toBeFocused();
  for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
  const inside = await page.evaluate(() => !!document.activeElement?.closest('.sheet'));
  expect(inside).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('hanja-sheet')).toHaveCount(0);
  await expect(hz).toBeFocused();
});

test('E-25 음성 미지원: 글로 이유를 알려 주고 텍스트 학습은 그대로', async ({ page }) => {
  await page.addInitScript(() => {
    // @ts-expect-error 테스트용으로 음성 합성 제거
    delete window.speechSynthesis;
  });
  await page.goto(`${DAY}#story-sagi-05`);
  await page.getByTestId('listen-reading').click();
  await expect(page.getByTestId('listen-status')).toHaveText('이 기기에서는 소리를 낼 수 없어요. 글로 읽어 보세요.');
  await expect(page.getByTestId('original-reading')).toBeVisible();
  await page.locator('.original-text .hz').first().click();
  await page.getByTestId('sheet-speak').click();
  await expect(page.getByTestId('sheet-sound-msg')).toContainText('글로 읽어 보세요');
  await expect(page.locator('.sheet-hun')).toBeVisible();
});

test('E-26 백업: 잘못된 코드는 기존 기록을 지우지 않고, 만든 코드는 그대로 복원된다', async ({ page }) => {
  await seedReturningUser(page);
  await page.goto(`${DAY}#settings`);
  const before = await saved(page);
  await page.getByTestId('backup-make').click();
  const code = await page.getByTestId('backup-code').inputValue();
  expect(code.startsWith('GJ1:')).toBe(true);
  await page.getByTestId('restore-input').fill('GJ1:망가진코드');
  await page.getByTestId('restore-apply').click();
  await expect(page.getByTestId('settings-msg')).toContainText('지금 기록은 그대로 두었다');
  expect(await saved(page)).toEqual(before);
  // 다른 기기(새 저장소)로 옮기기
  const ctx = await page.context().browser()!.newContext();
  const p = await ctx.newPage();
  await p.goto(`${DAY}#settings`);
  await p.getByTestId('restore-input').fill(code);
  await p.getByTestId('restore-apply').click();
  await expect(p.getByTestId('settings-msg')).toContainText('복원한 고사 3편');
  const moved = await saved(p);
  expect([moved.stars, moved.cards, moved.seen, moved.version]).toEqual([before.stars, before.cards, before.seen, 2]);
  await ctx.close();
});

test('E-27 날짜 경계: 다음 날에는 목표를 새로 세고 복습이 열린다', async ({ page }) => {
  await page.goto(`${DAY}#story-sagi-01`);
  await page.locator('.scene').waitFor();
  while (!(await page.locator('.choice').first().isVisible())) await page.getByTestId('next').click();
  await page.locator('.choice[data-correct="1"]').click();
  await page.getByTestId('to-original').click();
  await page.getByTestId('start-battle').click();
  for (let i = 1; i <= 8; i++) {
    await expect(page.locator('.q-progress')).toHaveText(`${i} / 8`);
    await page.locator('.opt[data-correct="1"]').click();
  }
  await expect(page.getByTestId('result')).toBeVisible();
  await page.goto(`${DAY}#home`);
  await expect(page.getByTestId('daily-goal')).toContainText('8 / 10문제');
  await expect(page.getByTestId('review-badge')).toHaveCount(0);
  await page.goto(`${NEXT}#home`);
  await expect(page.getByTestId('daily-goal')).toContainText('0 / 10문제');
  await expect(page.getByTestId('review-badge')).toBeVisible();
});
