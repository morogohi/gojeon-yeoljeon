import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const U = 'http://localhost:4173/?e2e=1&today=2026-11-09';
const snap = async (n) => { await p.waitForTimeout(400); await p.screenshot({ path: `shots/${n}.png`, fullPage: true }); };
await p.goto(U + '#/home'); await snap('1-home');
await p.goto(U + '#/story/sagi-01'); await snap('2-scene');
while (await p.getByTestId('next').isVisible().catch(()=>false)) await p.getByTestId('next').click();
await p.locator('.choice[data-correct="1"]').click(); await snap('3-choice');
await p.getByTestId('to-original').click(); await snap('4-original');
await p.getByTestId('start-battle').click(); await snap('5-battle');
await p.locator('.opt:not([data-correct])').first().click(); await snap('6-wrong');
await p.getByTestId('continue').click();
for (let i=0;i<7;i++){ await p.locator('.opt[data-correct="1"]').click(); await p.waitForTimeout(800); }
await p.waitForTimeout(800); await snap('7-result');
await p.goto(U + '#/map/sagi'); await snap('8-map');
await p.goto(U + '#/codex/heroes'); await snap('9-codex');
await p.goto(U + '#/puzzle'); await snap('10-puzzle');
await b.close();
