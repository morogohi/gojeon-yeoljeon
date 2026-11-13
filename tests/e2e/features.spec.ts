import { test, expect } from '@playwright/test';

const DAY = '/play/?e2e=1&today=2026-11-11';

test('E-09 원문 한자를 누르면 훈음·소리·단어장 팝업, 단어장에서 집중 복습', async ({ page }) => {
  // 아직 잠긴 고사(배수지진)는 원문 카드만 바로 열린다
  await page.goto(`${DAY}#story-sagi-05`);
  await expect(page.locator('.original-text')).toBeVisible();
  await expect(page.getByTestId('original-reading')).toHaveText('내사만인선행, 출, 배수진.');
  await page.locator('.original-text .hz[data-char="陳"]').click();
  const sheet = page.getByTestId('hanja-sheet');
  await expect(sheet).toContainText('베풀');
  await expect(sheet).toContainText('陣과 통해');
  await page.getByTestId('sheet-speak').click(); // 소리 기능이 오류 없이 실행되는지
  await page.getByTestId('sheet-book').click();
  await expect(page.getByTestId('sheet-book')).toHaveText('단어장에서 빼기');
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await page.locator('.idiom-chars .char-tile[data-char="背"]').click();
  await expect(page.getByTestId('hanja-sheet')).toContainText('등');
  await page.locator('.sheet-close').click();

  await page.goto(`${DAY}#codex-words`);
  await expect(page.getByTestId('wordbook').locator('[data-char="陳"]')).toBeVisible();
  await page.getByTestId('focus-review').click();
  await expect(page.locator('.review-progress')).toHaveText('1 / 1');
  await page.locator('.opt[data-correct="1"]').click();
  await expect(page.getByTestId('review-done')).toBeVisible();
});

test('E-10 설정: 큰 글씨, 하루 목표, 백업 → 초기화 → 복원', async ({ page }) => {
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
  await expect(page.getByTestId('share-card')).toBeVisible();

  await page.goto(`${DAY}#home`);
  await expect(page.getByTestId('daily-goal')).toContainText('8 / 10문제');
  await page.getByTestId('open-settings').click();
  await page.getByTestId('set-large').click();
  await expect(page.locator('body')).toHaveClass(/large/);
  await page.getByTestId('set-goal').getByText('20문제').click();
  await page.getByTestId('backup-make').click();
  const code = await page.getByTestId('backup-code').inputValue();
  expect(code).toMatch(/^GJ1:/);
  await page.getByTestId('reset').click();
  await page.getByTestId('reset').click();
  await expect(page.getByTestId('settings-msg')).toContainText('진행을 지웠다');
  await page.getByTestId('restore-input').fill(code);
  await page.getByTestId('restore-apply').click();
  await expect(page.getByTestId('settings-msg')).toContainText('복원한 고사 1편');
  await page.goto(`${DAY}#home`);
  await expect(page.getByTestId('daily-goal')).toContainText('8 / 20문제');

  await page.getByTestId('daily-goal').click();
  await expect(page.getByTestId('report-stats')).toContainText('100%');
  await expect(page.getByTestId('report-stats')).toContainText('1편');
});

test('E-11 다음 시즌 예고와 360px 레이아웃', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  for (const route of ['map-sagi', 'settings', 'report', 'codex-words']) {
    await page.goto(`${DAY}#${route}`);
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), route).toBeLessThanOrEqual(0);
  }
  await page.goto(`${DAY}#map-sagi`);
  await expect(page.getByTestId('season-teaser')).toContainText('맹자·장자');
});

test('E-12 접근성: 탭 선택 상태, 남은 생명 수치 안내, 퍼즐 연습 모드, 복습→집중 복습 연결', async ({ page }) => {
  await page.goto(`${DAY}#map-nonyu`);
  await expect(page.getByTestId('book-nonyu')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('book-sagi')).toHaveAttribute('aria-selected', 'false');

  await page.goto(`${DAY}#story-sagi-01`);
  await page.locator('.scene').waitFor();
  while (!(await page.locator('.choice').first().isVisible())) await page.getByTestId('next').click();
  await page.locator('.choice:not([data-correct])').first().click();
  await page.getByTestId('to-original').click();
  await page.getByTestId('start-battle').click();
  await expect(page.getByTestId('hp')).toHaveAttribute('aria-label', '남은 생명 3/3');
  await page.locator('.opt:not([data-correct])').first().click();
  await expect(page.getByTestId('hp')).toHaveAttribute('aria-label', '남은 생명 2/3');
  await expect(page.locator('.hero-bar [role="status"]')).toHaveText('남은 생명 2/3');
  // 대전을 끝까지 마쳐야 오답이 기록된다
  await page.getByTestId('continue').click();
  for (let i = 2; i <= 8; i++) {
    await expect(page.locator('.q-progress')).toHaveText(`${i} / 8`);
    await page.locator('.opt[data-correct="1"]').click();
  }
  await expect(page.getByTestId('result')).toBeVisible();

  // 오답 노트가 생겼으니 정기 복습이 없어도 집중 복습으로 이어진다
  await page.goto(`${DAY}#review`);
  await expect(page.getByTestId('review-empty')).toBeVisible();
  await page.getByTestId('to-focus').click();
  await expect(page.locator('.review-progress')).toHaveText(/^1 \/ \d+$/);

  await page.goto(`${DAY}#puzzle`);
  await page.getByTestId('mode-practice').click();
  await page.getByTestId('puzzle-start').click();
  await expect(page.getByTestId('clock')).toHaveText('연습');
  await page.waitForTimeout(1500);
  await expect(page.getByTestId('clock')).toHaveText('연습');
});

test('E-13 결과·홈·기록의 한자 수가 같고, 집중 복습의 뒤로는 들어온 곳으로 간다', async ({ page }) => {
  await page.goto(`${DAY}#story-sagi-01`);
  await page.locator('.scene').waitFor();
  while (!(await page.locator('.choice').first().isVisible())) await page.getByTestId('next').click();
  await page.locator('.choice[data-correct="1"]').click();
  await page.getByTestId('to-original').click();
  await page.getByTestId('start-battle').click();
  // 1번은 일부러 틀리고 나머지는 맞힌다 (평가 재현: 7/8)
  await page.locator('.opt:not([data-correct])').first().click();
  await page.getByTestId('continue').click();
  for (let i = 2; i <= 8; i++) {
    await expect(page.locator('.q-progress')).toHaveText(`${i} / 8`);
    await page.locator('.opt[data-correct="1"]').click();
  }
  const met = page.getByTestId('met-hanja');
  await expect(met).toContainText('이번 고사에서 만난 한자 4자 · 익힘 3 · 다시 볼 글자 1');

  await page.goto(`${DAY}#home`);
  await expect(page.getByTestId('learned-count')).toHaveText('익힌 한자 3자 / 44자');
  await page.goto(`${DAY}#report`);
  await expect(page.getByTestId('report-stats')).toContainText('3자');

  await page.getByTestId('report-focus').click();
  await expect(page.locator('.review-progress')).toBeVisible();
  await page.locator('.back').click();
  await expect(page).toHaveURL(/#report$/);

  await page.goto(`${DAY}#codex-words`);
  await page.getByTestId('focus-review').click();
  await page.locator('.back').click();
  await expect(page).toHaveURL(/#codex-words$/);

  await page.goto(`${DAY}#review`);
  await page.getByTestId('to-focus').click();
  await page.locator('.back').click();
  await expect(page).toHaveURL(/#review$/);
});
