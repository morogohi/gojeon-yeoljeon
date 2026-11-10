import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const U = 'http://localhost:4173/?e2e=1&today=2026-11-09';
const snap = async (n) => { await p.waitForTimeout(700); await p.screenshot({ path: `shots/${n}.png`, fullPage: true }); };
await p.goto(U + '#home'); await snap('a-home');
await p.goto(U + '#story-sagi-01'); await snap('b-scene');
while (await p.getByTestId('next').isVisible().catch(()=>false)) await p.getByTestId('next').click();
await p.locator('.choice[data-correct="1"]').click(); await p.getByTestId('to-original').click(); await snap('c-original');
await p.getByTestId('start-battle').click();
for (let i=0;i<8;i++){ await p.locator('.opt[data-correct="1"]').click(); await p.waitForTimeout(800); }
await p.waitForTimeout(900);
await p.goto(U + '#map-sagi'); await snap('d-map');
await p.goto('http://localhost:4173/?e2e=1&today=2026-11-10#review');
for (let i=0;i<5;i++){ if (await p.locator('.quiz-art').isVisible().catch(()=>false)) { await snap('e-picture'); break; } await p.locator('.opt[data-correct="1"]').click(); await p.waitForTimeout(800); }
await b.close();
