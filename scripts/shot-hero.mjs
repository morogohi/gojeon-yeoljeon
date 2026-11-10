import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const U = 'http://localhost:4173/?e2e=1&today=2026-11-09';
async function play(id){ await p.goto(U+'#/story/'+id);
 while (await p.getByTestId('next').isVisible().catch(()=>false)) await p.getByTestId('next').click();
 await p.locator('.choice[data-correct="1"]').click(); await p.getByTestId('to-original').click(); await p.getByTestId('start-battle').click(); }
await play('sagi-01'); for(let i=0;i<8;i++){ await p.locator('.opt[data-correct="1"]').click(); await p.waitForTimeout(800);} await p.waitForTimeout(900);
await p.goto(U+'#/story/sagi-03'); await p.waitForTimeout(400);
await p.screenshot({path:'shots/11-locked.png'});
await play('sagi-02'); await p.locator('.opt[data-correct="1"]').click(); await p.waitForTimeout(900);
await p.screenshot({path:'shots/12-hero-battle.png'});
await b.close();
