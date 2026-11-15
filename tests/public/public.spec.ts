import { test, expect } from '@playwright/test';

// 배포 후 공개 사이트 검사. 새 브라우저 컨텍스트(빈 저장소)라 실제 이용자 기록은 건드리지 않는다.
// EXPECTED_SHA 가 있으면 공개 사이트가 그 커밋으로 바뀌었는지도 확인한다.
const expected = process.env.EXPECTED_SHA;

test('P-01 공개 홍보 페이지와 게임이 같은 커밋으로 열린다', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.hero-title')).toBeVisible();
  await expect(page.locator('.slip-item')).toHaveCount(12);
  const siteSha = await page.locator('meta[name="build-sha"]').getAttribute('content');
  await page.goto('play/');
  const playSha = await page.locator('meta[name="build-sha"]').getAttribute('content');
  expect(playSha).toBe(siteSha);
  if (expected) expect(playSha).toBe(expected);
});

test('P-02 공개 게임: 첫 방문 안내 → 첫 고사 장면 → 원문 팝업 → 해시 라우팅', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('play/#home');
  await expect(page.getByTestId('first-start')).toBeVisible();
  await page.getByTestId('first-start').click();
  await expect(page).toHaveURL(/#story-sagi-01$/);
  await expect(page.locator('.scene')).toBeVisible();
  await page.goto('play/#story-sagi-05'); // 잠긴 고사는 원문 카드만
  await page.locator('.original-text .hz').first().click();
  await expect(page.getByTestId('hanja-sheet')).toBeVisible();
  for (const p of ['support.html', 'privacy.html', 'play/manifest.webmanifest']) {
    const r = await page.request.get(p);
    expect(r.status(), p).toBe(200);
  }
  expect(errors).toEqual([]);
});
