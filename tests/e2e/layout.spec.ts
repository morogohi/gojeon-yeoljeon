import { test, expect } from '@playwright/test';
import { PLAY, seedReturningUser, overflowX } from './fixtures';

// 요구 폭: 360(소형 폰), 390(기준 폰), 768(태블릿), 1440(데스크톱)
const WIDTHS = [360, 390, 768, 1440];

for (const width of WIDTHS) {
  test.describe(`L-${width} ${width}px`, () => {
    test.use({ viewport: { width, height: width >= 768 ? 1000 : 800 } });

    test(`L-01 신규 사용자 화면 ${width}px: 가로 넘침 없음, 핵심 요소 보임`, async ({ page }) => {
      const routes: [string, string][] = [
        ['home', '[data-testid="first-start"]'],
        ['map-sagi', '[data-story="sagi-01"]'],
        ['story-sagi-01', '.scene'],
        ['codex-heroes', '.hero-grid'],
        ['puzzle', '[data-testid="puzzle-start"]'],
        ['settings', '[data-testid="set-large"]'],
      ];
      for (const [route, selector] of routes) {
        await page.goto(`${PLAY()}#${route}`);
        await expect(page.locator(selector).first(), route).toBeVisible();
        expect(await overflowX(page), route).toBeLessThanOrEqual(0);
      }
    });

    test(`L-02 기존 학습 사용자 화면 ${width}px`, async ({ page }) => {
      await seedReturningUser(page);
      await page.goto(`${PLAY()}#home`);
      await expect(page.getByTestId('home-first')).toHaveCount(0);
      await expect(page.getByTestId('learned-count')).toHaveText('익힌 한자 12자 / 44자');
      await expect(page.getByTestId('continue-story')).toBeVisible();
      expect(await overflowX(page)).toBeLessThanOrEqual(0);
      for (const route of ['report', 'codex-words', 'map-nonyu']) {
        await page.goto(`${PLAY()}#${route}`);
        expect(await overflowX(page), route).toBeLessThanOrEqual(0);
      }
    });

    test(`L-03 홍보·안내 페이지 ${width}px`, async ({ page }) => {
      for (const path of ['./', 'support.html', 'privacy.html']) {
        await page.goto(path);
        await expect(page.locator('h1').first(), path).toBeVisible();
        expect(await overflowX(page), path).toBeLessThanOrEqual(0);
      }
    });
  });
}
