import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await b.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 1.5 });
await p.goto('file:///tmp/art.html'); await p.waitForTimeout(300);
await p.screenshot({ path: '/tmp/art.png', fullPage: true }); await b.close();
