// 앱 아이콘·스플래시 원본(PNG)을 HTML로 그려 Playwright로 찍는다.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
// 오프라인에서도 같은 결과가 나오도록 npm 패키지의 글꼴을 쓴다
const FONT = `<link rel="stylesheet" href="file://${resolve('node_modules/@fontsource/noto-serif-kr/900.css')}">`;
const seal = (size) => `
<div style="width:${size}px;height:${size}px;background:#18222f;display:grid;place-items:center;
  background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.025) 0 2px,transparent 2px 8px)">
  <div style="width:${size * .62}px;height:${size * .62}px;background:#c8402f;border-radius:${size * .06}px;transform:rotate(-5deg);
    display:grid;place-items:center;box-shadow:0 ${size * .02}px ${size * .05}px rgba(0,0,0,.35)">
    <div style="width:88%;height:88%;border:${size * .012}px solid rgba(255,244,234,.75);border-radius:${size * .035}px;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-family:'Noto Serif KR',serif;font-weight:900;color:#fff4ea;font-size:${size * .23}px;line-height:1.02">
      <span>古</span><span>典</span></div></div></div>`;
const splash = (w, h) => `
<div style="width:${w}px;height:${h}px;background:#18222f;display:grid;place-items:center">
  <div style="display:flex;flex-direction:column;align-items:center;gap:${w * .04}px">
    <div style="transform:scale(1)">${seal(w * .34).replace('background:#18222f;', 'background:transparent;').replace(/background-image:[^"]*/, '')}</div>
    <div style="font-family:'Noto Serif KR',serif;font-weight:900;color:#ece2c9;font-size:${w * .06}px;letter-spacing:.2em">古典列傳</div>
  </div></div>`;
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
async function shot(html, w, h, path) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  writeFileSync('/tmp/gojeon-asset.html', `<!DOCTYPE html><html><head>${FONT}<style>body{margin:0}</style></head><body>${html}</body></html>`);
  await p.goto('file:///tmp/gojeon-asset.html');
  await p.evaluate(async () => { await document.fonts.load('900 100px "Noto Serif KR"', '古典列傳'); await document.fonts.ready; });
  await p.waitForTimeout(800);
  await p.screenshot({ path });
  await p.close();
}
await shot(seal(1024), 1024, 1024, 'assets/icon-only.png');
await shot(seal(1024), 1024, 1024, 'assets/icon-foreground.png');
await shot('<div style="width:1024px;height:1024px;background:#18222f"></div>', 1024, 1024, 'assets/icon-background.png');
await shot(splash(2732, 2732), 2732, 2732, 'assets/splash.png');
await shot(splash(2732, 2732), 2732, 2732, 'assets/splash-dark.png');
await b.close();
