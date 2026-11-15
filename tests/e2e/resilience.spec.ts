import { test, expect } from '@playwright/test';
import { PLAY, seedReturningUser } from './fixtures';

const errorsOf = (page: import('@playwright/test').Page) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
};

test('R-01 하위 경로 자산·해시 라우팅: 직접 진입, 뒤로·앞으로, 자산 404 없음 @smoke', async ({ page }) => {
  const failed: string[] = [];
  page.on('response', (r) => {
    const u = new URL(r.url());
    if (u.hostname === 'localhost' && r.status() >= 400) failed.push(`${r.status()} ${u.pathname}`);
  });
  const errors = errorsOf(page);
  // 공유 링크처럼 고사 화면으로 바로 들어온다
  await page.goto(`${PLAY()}#story-sagi-01`);
  await expect(page.locator('.scene')).toBeVisible();
  await expect(page).toHaveURL(/\/gojeon-yeoljeon\/play\/\?e2e=1.*#story-sagi-01$/);
  await page.goto(`${PLAY()}#codex-heroes`);
  await page.goBack();
  await expect(page.locator('.scene')).toBeVisible();
  await page.goForward();
  await expect(page.locator('.hero-grid')).toBeVisible();
  // 매니페스트·아이콘이 하위 경로 기준으로 풀린다
  const manifest = await page.evaluate(() => (document.querySelector('link[rel="manifest"]') as HTMLLinkElement).href);
  expect(manifest).toContain('/gojeon-yeoljeon/play/manifest.webmanifest');
  const res = await page.request.get(manifest);
  expect(res.status()).toBe(200);
  expect(failed).toEqual([]);
  expect(errors).toEqual([]);
  // 빌드 커밋 표기가 있다 (배포 후 검사가 이 값을 비교한다)
  await expect(page.locator('meta[name="build-sha"]')).toHaveAttribute('content', /.+/);
});

test('R-02 저장 실패(localStorage 사용 불가)에도 플레이가 되고 오류가 없다', async ({ page }) => {
  await page.addInitScript(() => {
    const deny = () => { throw new DOMException('denied', 'SecurityError'); };
    Object.defineProperty(window, 'localStorage', { get: deny, configurable: true });
  });
  const errors = errorsOf(page);
  await page.goto(`${PLAY()}#home`);
  await page.getByTestId('first-start').click();
  await expect(page.locator('.scene')).toBeVisible();
  await page.getByTestId('next').click();
  expect(errors).toEqual([]);
});

test('R-03 음성 합성이 없는 브라우저에서 소리 버튼이 오류 없이 무시된다', async ({ page }) => {
  await page.addInitScript(() => {
    // @ts-expect-error 테스트용으로 음성 합성 제거
    delete window.speechSynthesis;
    // @ts-expect-error
    delete window.SpeechSynthesisUtterance;
  });
  const errors = errorsOf(page);
  await page.goto(`${PLAY()}#story-sagi-05`);
  await page.getByTestId('listen-reading').click();
  await page.locator('.original-text .hz').first().click();
  await page.getByTestId('sheet-speak').click();
  await expect(page.getByTestId('hanja-sheet')).toBeVisible();
  expect(errors).toEqual([]);
});

test('R-04 오프라인이 되어도 이미 연 게임은 계속 진행되고 기록이 남는다', async ({ page, context }) => {
  const errors = errorsOf(page);
  await seedReturningUser(page);
  await page.goto(`${PLAY()}#home`);
  await expect(page.getByTestId('continue-story')).toBeVisible();
  await context.setOffline(true);
  await page.getByTestId('continue-story').click();
  await expect(page.locator('.scene')).toBeVisible();
  await page.goto(`${PLAY()}#codex-words`).catch(() => undefined); // 오프라인 새 탐색은 실패할 수 있다
  await page.evaluate(() => { location.hash = '#codex-words'; });
  await expect(page.getByTestId('wordbook')).toBeVisible();
  await context.setOffline(false);
  expect(errors).toEqual([]);
});

test('R-05 기존 사용자 기록이 다른 테스트에 새지 않는다(격리)', async ({ page }) => {
  await page.goto(`${PLAY()}#home`);
  await expect(page.getByTestId('home-first')).toBeVisible();
});
