import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const U = 'http://localhost:4173/?e2e=1&today=2026-11-09';
const snap = async (n, full = false) => { await p.waitForTimeout(900); await p.screenshot({ path: `shots/${n}.png`, fullPage: full }); };
await p.goto(U + '#home'); await snap('1-home-new');
await p.goto(U + '#story-sagi-01'); await snap('2-scene');
while (await p.getByTestId('next').isVisible().catch(()=>false)) await p.getByTestId('next').click();
await p.locator('.choice:not([data-correct])').first().click(); await snap('3-choice', true);
await p.getByTestId('to-original').click(); await snap('4-original', true);
await p.getByTestId('start-battle').click(); await snap('5-battle');
for (let i=0;i<8;i++){ await p.locator('.opt[data-correct="1"]').click(); await p.waitForTimeout(800); if (i===6) await snap('6-battle-idiom'); }
await p.waitForTimeout(900); await snap('7-result', true);
await p.goto(U + '#home'); await snap('8-home-progress');
await p.goto(U + '#map-sagi'); await snap('9-map');
await p.goto(U + '#codex-heroes'); await snap('10-codex');
await p.goto(U + '#puzzle'); await snap('11-puzzle');
await b.close();
