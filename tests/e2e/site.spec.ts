import { test, expect } from '@playwright/test';

test('E-07 홍보 페이지: 고사 12편, 플레이 버튼으로 게임 진입', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('.hero-title')).toBeVisible();
  await expect(page.locator('.slip-item')).toHaveCount(12);
  await expect(page.locator('.slip-item').first()).toContainText('完璧歸趙');
  for (const img of await page.locator('img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
  await page.locator('.hero .btn.primary').click();
  await expect(page).toHaveURL(/\/play\/(#home)?$/);
  await expect(page.locator('.home-head')).toBeVisible();
  expect(errors).toEqual([]);
});

test('E-08 안내·개인정보 페이지가 열리고 360px에서 가로 스크롤이 없다', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  for (const [path, heading] of [['/', '한 고사는'], ['/support.html', '안내·문의'], ['/privacy.html', '개인정보처리방침']]) {
    await page.goto(path);
    await expect(page.locator('h1, h2').filter({ hasText: heading }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), path).toBeLessThanOrEqual(0);
  }
});
