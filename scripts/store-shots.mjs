// 스토어·홍보 페이지용 스크린샷. 빌드된 게임(vite preview, :4173)을 실제로 플레이하며 찍는다.
// 사용: npm run build:app && npx vite preview --port 4173 & node scripts/store-shots.mjs
import { chromium } from '@playwright/test';
import { mkdirSync } from 'fs';
import sharp from 'sharp';

const BASE = 'http://localhost:4173/?e2e=1&today=2026-11-11';
const TARGETS = [
  { dir: 'store/ios-6.7', w: 430, h: 932, dpr: 3 },   // 1290×2796
  { dir: 'store/android', w: 360, h: 780, dpr: 3 },   // 1080×2340
  { dir: 'site/public/screens', w: 390, h: 844, dpr: 2, webp: true },
];

const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });

async function toChoice(p) {
  await p.locator('.scene').waitFor();
  while (!(await p.locator('.choice').first().isVisible())) await p.getByTestId('next').click();
}
async function clear(p, id) {
  await p.goto(`${BASE}#story-${id}`);
  await toChoice(p);
  await p.locator('.choice[data-correct="1"]').click();
  await p.getByTestId('to-original').click();
  await p.getByTestId('start-battle').click();
  for (let i = 0; i < 8; i++) { await p.locator('.opt[data-correct="1"]').click(); await p.waitForTimeout(820); }
  await p.getByTestId('result').waitFor();
}

for (const t of TARGETS) {
  mkdirSync(t.dir, { recursive: true });
  const ctx = await b.newContext({ viewport: { width: t.w, height: t.h }, deviceScaleFactor: t.dpr });
  const p = await ctx.newPage();
  const snap = async (name) => {
    await p.waitForTimeout(900);
    const path = `${t.dir}/${name}.png`;
    await p.screenshot({ path });
    if (t.webp) { await sharp(path).webp({ quality: 82 }).toFile(path.replace('.png', '.webp')); }
  };
  for (const id of ['sagi-01', 'sagi-02', 'sagi-03', 'sagi-04', 'nonyu-01']) await clear(p, id);
  await p.goto(`${BASE}#home`); await snap('1-home');
  await p.goto(`${BASE}#story-sagi-05`); await snap('2-scene');
  await toChoice(p); await p.locator('.choice[data-correct="1"]').click();
  await p.getByTestId('to-original').click(); await p.waitForTimeout(1600); await snap('3-original');
  await p.getByTestId('start-battle').click(); await snap('4-battle');
  for (let i = 0; i < 8; i++) { await p.locator('.opt[data-correct="1"]').click(); await p.waitForTimeout(820); }
  await p.getByTestId('result').waitFor(); await p.waitForTimeout(600); await snap('5-result');
  await p.goto(`${BASE}#codex-album`); await p.waitForTimeout(1500); await snap('6-album');
  await p.goto(`${BASE}#puzzle`); await snap('7-puzzle');
  await ctx.close();
}
await b.close();
