import { test, expect, type Page } from '@playwright/test';
import { STORIES } from '../../src/content/stories';

const DAY1 = '/play/?e2e=1&today=2026-11-09';
const DAY2 = '/play/?e2e=1&today=2026-11-10';

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // 웹폰트(Google Fonts)는 네트워크가 막힌 환경에서 실패할 수 있고, 그때는 시스템 글꼴로 대체되므로 제외한다
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)\.com/.test(m.location().url ?? '')) errors.push(m.text()); });
  return errors;
}

async function playScenes(page: Page, pickCorrect: boolean) {
  // 화면 전환(hashchange)이 끝난 뒤 장면을 넘긴다
  await page.locator('.scene').waitFor();
  while (!(await page.locator('.choice').first().isVisible())) await page.getByTestId('next').click();
  const choice = pickCorrect ? page.locator('.choice[data-correct="1"]') : page.locator('.choice:not([data-correct])').first();
  await choice.click();
  await page.getByTestId('to-original').click();
  await expect(page.getByTestId('art-card').locator('svg')).toBeVisible();
  await page.getByTestId('start-battle').click();
}

async function answerAllCorrect(page: Page) {
  for (let i = 1; i <= 8; i++) {
    await expect(page.locator('.q-progress')).toHaveText(`${i} / 8`);
    await page.locator('.opt[data-correct="1"]').click();
  }
  await expect(page.getByTestId('result')).toBeVisible();
}

test.describe.serial('첫 플레이 → 저장 → 복습', () => {
  let page: Page;
  let errors: string[];
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    errors = watchErrors(page);
  });
  test.afterAll(async () => page.close());

  test('E-01 첫 고사를 전부 맞히면 별 3개와 인상여 획득', async () => {
    await page.goto(`${DAY1}#home`);
    await expect(page.getByTestId('restore')).toHaveText('0%');
    await page.getByTestId('tab-map').click();
    await page.locator('[data-story="sagi-01"]').click();
    await playScenes(page, true);
    await expect(page.locator('.life.on')).toHaveCount(4);
    await answerAllCorrect(page);
    await expect(page.locator('.result .stars .on')).toHaveCount(3);
    await expect(page.getByTestId('hero-reward')).toContainText('藺相如');
    expect(errors).toEqual([]);
  });

  test('E-02 새로고침 후에도 진행이 유지된다', async () => {
    await page.goto(`${DAY1}#map-sagi`);
    await page.reload();
    await expect(page.locator('[data-story="sagi-01"] .stars .on')).toHaveCount(3);
    await expect(page.locator('[data-story="sagi-02"]')).toBeVisible();
    await page.goto(`${DAY1}#codex-heroes`);
    await expect(page.locator('.hero-card.party')).toContainText('인상여');
    await page.goto(`${DAY1}#codex-album`);
    await expect(page.locator('.album .art-card')).toHaveCount(1);
    await expect(page.locator('.album .art-card figcaption')).toContainText('完');
    await page.goto(`${DAY1}#home`);
    await expect(page.getByTestId('restore')).not.toHaveText('0%');
  });

  test('E-04 다음 날 복습 배지가 뜨고, 복습하면 사라진다', async () => {
    await page.goto(`${DAY1}#home`);
    await expect(page.getByTestId('review-badge')).toHaveCount(0);
    await page.goto(`${DAY2}#home`);
    await expect(page.getByTestId('review-badge')).toHaveText('5');
    await expect(page.getByTestId('streak')).toHaveText('연속 2일');
    await page.getByTestId('tab-review').click();
    for (let i = 0; i < 5; i++) {
      await expect(page.locator('.review-progress')).toHaveText(`${i + 1} / 5`);
      await page.locator('.opt[data-correct="1"]').click();
    }
    await expect(page.getByTestId('review-done')).toBeVisible();
    await page.goto(`${DAY2}#home`);
    await expect(page.getByTestId('review-badge')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

test('E-03 오답 3번이면 패배하고 진행은 저장되지 않는다', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto(`${DAY1}#story-sagi-01`);
  await playScenes(page, false);
  await expect(page.locator('.life.on')).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    await page.locator('.opt:not([data-correct])').first().click();
    if (i < 2) await page.getByTestId('continue').click();
  }
  await expect(page.getByTestId('result')).toContainText('글자가 다시 흩어졌다');
  await expect(page.locator('.result .stars .on')).toHaveCount(0);
  await page.goto(`${DAY1}#map-sagi`);
  await expect(page.locator('[data-story="sagi-02"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('E-05 성어 퍼즐: 시작 화면에서 고르고, 네 개를 완성하면 완료 화면', async ({ page }) => {
  await page.goto(`${DAY1}#puzzle`);
  // 처음에는 배운 성어가 없으므로 '배운 성어'는 잠기고 '전체 성어'가 골라져 있다. 시작 전에는 시간이 흐르지 않는다.
  await expect(page.getByTestId('scope-learned')).toBeDisabled();
  await expect(page.getByTestId('scope-all')).toHaveAttribute('aria-checked', 'true');
  await page.waitForTimeout(1200);
  await page.getByTestId('puzzle-start').click();
  await expect(page.getByTestId('clock')).toHaveText('60초');
  const readings = await page.locator('.targets li').allTextContents();
  expect(readings).toHaveLength(4);
  for (const r of readings) {
    const story = STORIES.find((s) => s.reading === r.trim())!;
    for (const ch of story.idiom) {
      await page.locator(`.tile[data-char="${ch}"]:not(.gone):not(.sel)`).first().click();
    }
  }
  await expect(page.getByTestId('puzzle-done')).toContainText('네 성어를 모두 맞췄다');
});

for (const width of [360, 390, 430]) {
  test(`E-06 ${width}px 가로 스크롤 없음, 콘솔 오류 0`, async ({ page }) => {
    const errors = watchErrors(page);
    await page.setViewportSize({ width, height: 800 });
    for (const route of ['home', 'map-sagi', 'map-nonyu', 'story-sagi-01', 'codex-heroes', 'codex-hanja', 'codex-album', 'review', 'puzzle']) {
      await page.goto(`${DAY1}#${route}`);
      await page.waitForTimeout(150);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(over, route).toBeLessThanOrEqual(0);
    }
    await page.goto(`${DAY1}#story-sagi-01`);
    await playScenes(page, true);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(over, 'battle').toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}
