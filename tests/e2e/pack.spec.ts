// 확장팩(상품): 지도·체험·잠금 미리보기·보호자 확인·구매·복원·지표, 홍보 페이지
import { test, expect, type Page } from '@playwright/test';
import { SAVE_KEY } from './fixtures';

const DAY = 'play/?e2e=1&today=2026-11-21';
const saved = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), SAVE_KEY);

async function playToResult(page: Page, id: string) {
  await page.goto(`${DAY}#story-${id}`);
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
}

test('E-29 열전 지도 「명장」: 확장팩 안내, 체험 고사는 열리고 나머지는 미리보기와 확장팩 안내', async ({ page }) => {
  await page.goto(`${DAY}#map-sagi`);
  await expect(page.getByTestId('season-teaser')).toContainText('先則制人');
  await expect(page.getByTestId('season-teaser')).toContainText('鷄口牛後');
  await expect(page.getByTestId('season-teaser')).toContainText('狐假虎威');
  await expect(page.getByTestId('season-teaser')).toContainText('守株待兔');
  await page.getByTestId('book-myeongjang').click();
  await expect(page.getByTestId('pack-banner')).toContainText('사기의 명장들');
  await expect(page.locator('[data-story="mj-01"]')).toBeVisible();
  await expect(page.locator('[data-story="mj-02"]')).toHaveAttribute('data-paid', '1');
  await expect(page.locator('[data-story="mj-02"]')).toContainText('破釜沈舟');
  await page.locator('[data-story="mj-02"]').click();
  // 잠긴 고사도 그림으로 보는 유래와 원문은 미리 볼 수 있다
  await expect(page.getByTestId('storyboard').locator('.panel')).toHaveCount(4);
  await expect(page.getByTestId('pack-locked')).toBeVisible();
  await expect(page.getByTestId('start-battle')).toHaveCount(0);
  await page.getByTestId('to-pack').click();
  await expect(page.getByTestId('pack-screen')).toBeVisible();
  await expect(page.getByTestId('pack-list').locator('li')).toHaveCount(4);
  await expect(page.getByTestId('b2b-contact')).toHaveAttribute('href', /^mailto:support\.um09@gmail\.com/);
});

test('E-30 체험: 첫 고사 「선즉제인」을 끝까지 하고 항량이 합류, 2편은 여전히 확장팩', async ({ page }) => {
  await playToResult(page, 'mj-01');
  await expect(page.getByTestId('hero-reward')).toContainText('項梁');
  await expect(page.getByTestId('lesson')).toContainText('선즉제인');
  await page.goto(`${DAY}#map-myeongjang`);
  await expect(page.locator('[data-story="mj-02"]')).toHaveAttribute('data-paid', '1');
  const s = await saved(page);
  expect([s.stars['mj-01'], s.owned]).toEqual([3, []]);
});

test('E-31 구매: 보호자 확인을 통과해야 결제로 넘어가고, 구매하면 확장팩이 열리고 서고 지표가 늘어난다', async ({ page }) => {
  await page.goto(`${DAY}&billing=ok#pack-pack-generals`);
  await page.getByTestId('pack-buy').click();
  const gate = page.getByTestId('parent-gate');
  await expect(gate).toBeVisible();
  await page.getByTestId('gate-answer').fill('1');
  await page.getByTestId('gate-ok').click();
  await expect(gate).toContainText('답이 맞지 않아요');
  expect((await saved(page)).owned).toEqual([]);
  const answer = await gate.getAttribute('data-answer');
  await page.getByTestId('gate-answer').fill(answer!);
  await page.getByTestId('gate-ok').click();
  await expect(page.getByTestId('pack-msg')).toContainText('구매가 완료됐어요');
  await expect(page.getByTestId('pack-play')).toBeVisible();
  expect((await saved(page)).owned).toEqual(['pack-generals']);
  await page.goto(`${DAY}#codex-hanja`);
  await expect(page.locator('.hint-line')).toContainText('만난 한자 0/59');
  await expect(page.locator('.hanja-cell')).toHaveCount(59);
  // 1편을 깨면 2편이 열린다
  await playToResult(page, 'mj-01');
  await page.goto(`${DAY}#map-myeongjang`);
  await expect(page.locator('[data-story="mj-02"]')).not.toHaveAttribute('data-paid', '1');
  await page.locator('[data-story="mj-02"]').click();
  await expect(page.locator('.scene')).toBeVisible();
});

test('E-32 웹(결제 없음): 보호자 확인 뒤 앱에서 구매하라고 안내하고 아무것도 열지 않는다. 취소·오류도 그대로', async ({ page }) => {
  for (const [q, text] of [['', '앱에서 구매할 수 있어요'], ['&billing=cancel', '구매를 취소했어요'], ['&billing=error', '구매를 마치지 못했어요']]) {
    await page.goto(`${DAY}${q}#home`);
    await page.goto(`${DAY}${q}#pack-pack-generals`);
    await page.getByTestId('pack-buy').click();
    await page.getByTestId('gate-answer').fill((await page.getByTestId('parent-gate').getAttribute('data-answer'))!);
    await page.getByTestId('gate-ok').click();
    await expect(page.getByTestId('pack-msg')).toContainText(text);
    expect((await saved(page)).owned).toEqual([]);
  }
});

test('E-33 구매 복원: 스토어에 산 기록이 있으면 다시 열린다', async ({ page }) => {
  await page.goto(`${DAY}&billing=owned#pack-pack-generals`);
  await page.getByTestId('pack-restore').click();
  await expect(page.getByTestId('pack-msg')).toContainText('다시 열었어요');
  expect((await saved(page)).owned).toEqual(['pack-generals']);
});

test('E-34 홍보 페이지: 확장팩 4편, 광고 없음·보호자 구매·단체 문의 안내, 안내·개인정보 페이지에 연락처', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#slip-list .slip-item')).toHaveCount(12);
  await expect(page.locator('#pack-list .slip-pack')).toHaveCount(16); // 확장팩 4종 × 4편
  await expect(page.locator('#pack-list')).toContainText('무료 체험');
  await expect(page.locator('#pricing')).toContainText('광고도 회원가입도 없습니다');
  await page.goto('support.html');
  await expect(page.locator('main')).toContainText('보호자 확인');
  await expect(page.locator('main')).toContainText('support.um09@gmail.com');
  await page.goto('privacy.html');
  await expect(page.locator('main')).toContainText('앱 내 구매');
  await expect(page.locator('main')).toContainText('Mysitic Cho');
});

test('E-35 확장팩 2 「전국시대의 책사들」: 책사 탭, 체험 고사 「계구우후」 완주, 2편은 확장팩, 팩 화면은 2번째 팩', async ({ page }) => {
  await page.goto(`${DAY}#map-sagi`);
  await page.getByTestId('season-pack-strategists').click();
  await expect(page.getByTestId('pack-screen')).toContainText('확장팩 2');
  await expect(page.getByTestId('pack-list')).toContainText('奇貨可居');
  await playToResult(page, 'cs-01');
  await expect(page.getByTestId('hero-reward')).toContainText('蘇秦');
  await page.goto(`${DAY}#map-chaeksa`);
  await expect(page.getByTestId('pack-banner')).toContainText('전국시대의 책사들');
  await expect(page.locator('[data-story="cs-02"]')).toHaveAttribute('data-paid', '1');
  await page.locator('[data-story="cs-03"]').click();
  await expect(page.getByTestId('storyboard')).toContainText('함곡관');
  await expect(page.getByTestId('to-pack')).toHaveAttribute('href', '#pack-pack-strategists');
});

test('E-36 확장팩 3 「우화 속 지혜」: 우화 탭, 체험 고사 「호가호위」 완주, 2편부터 확장팩, 그림으로 보는 유래', async ({ page }) => {
  await page.goto(`${DAY}#map-sagi`);
  await page.getByTestId('season-pack-fables').click();
  await expect(page.getByTestId('pack-screen')).toContainText('확장팩 3');
  await expect(page.getByTestId('pack-list')).toContainText('愚公移山');
  await playToResult(page, 'uh-01');
  await expect(page.getByTestId('hero-reward')).toContainText('江乙');
  await expect(page.getByTestId('lesson')).toContainText('호가호위');
  await page.goto(`${DAY}#map-uhwa`);
  await expect(page.getByTestId('pack-banner')).toContainText('우화 속 지혜');
  await expect(page.locator('[data-story="uh-02"]')).toHaveAttribute('data-paid', '1');
  await page.locator('[data-story="uh-03"]').click();
  await expect(page.getByTestId('storyboard')).toContainText('도요새');
  await expect(page.getByTestId('to-pack')).toHaveAttribute('href', '#pack-pack-fables');
});

test('E-37 확장팩 4 「한비자의 이야기」: 한비자 탭, 체험 고사 「수주대토」 완주, 2편부터 확장팩, 그림으로 보는 유래', async ({ page }) => {
  await page.goto(`${DAY}#map-sagi`);
  await page.getByTestId('season-pack-hanfei').click();
  await expect(page.getByTestId('pack-screen')).toContainText('확장팩 4');
  await expect(page.getByTestId('pack-list')).toContainText('老馬之智');
  await playToResult(page, 'hb-01');
  await expect(page.getByTestId('hero-reward')).toContainText('韓非');
  await expect(page.getByTestId('lesson')).toContainText('수주대토');
  await page.goto(`${DAY}#map-hanbi`);
  await expect(page.getByTestId('pack-banner')).toContainText('한비자의 이야기');
  await expect(page.locator('[data-story="hb-02"]')).toHaveAttribute('data-paid', '1');
  await page.locator('[data-story="hb-04"]').click();
  await expect(page.getByTestId('storyboard')).toContainText('늙은 말');
  await expect(page.getByTestId('to-pack')).toHaveAttribute('href', '#pack-pack-hanfei');
});
