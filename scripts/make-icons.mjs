// 앱 아이콘·스플래시 원본(PNG)을 HTML로 그려 Playwright로 찍는다.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
// 오프라인에서도 같은 결과가 나오도록 npm 패키지의 글꼴을 쓴다
const FONT = `<link rel="stylesheet" href="file://${resolve('node_modules/@fontsource/noto-serif-kr/900.css')}">`;
// 아이콘 A안 「붉은 낙관」(2026-11-18 선택): 먹색 바탕 + 붉은 인장 古典 + 금빛 붓 획
const sealSvg = (bg = true) => `
<svg viewBox="0 0 1024 1024" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  ${bg ? '<rect width="1024" height="1024" fill="#18222f"/><path d="M0 300 H1024 M0 520 H1024 M0 740 H1024" stroke="#fff" stroke-opacity=".04" stroke-width="6"/>' : ''}
  <path d="M150 800 Q500 930 880 730" stroke="#c9a14a" stroke-width="22" fill="none" stroke-linecap="round"/>
  <g transform="rotate(-5 512 470)">
    <rect x="232" y="180" width="560" height="580" rx="56" fill="#c8402f"/>
    <rect x="264" y="212" width="496" height="516" rx="32" fill="none" stroke="#fff4ea" stroke-opacity=".85" stroke-width="12"/>
    <text x="512" y="440" text-anchor="middle" font-family="Noto Serif KR" font-weight="900" font-size="230" fill="#fff4ea">古</text>
    <text x="512" y="690" text-anchor="middle" font-family="Noto Serif KR" font-weight="900" font-size="230" fill="#fff4ea">典</text>
  </g>
</svg>`;
const seal = (size, bg = true) => `<div style="width:${size}px;height:${size}px">${sealSvg(bg)}</div>`;
const splash = (w, h) => `
<div style="width:${w}px;height:${h}px;background:#18222f;display:grid;place-items:center">
  <div style="display:flex;flex-direction:column;align-items:center;gap:${w * .04}px">
    <div>${seal(w * .34, false)}</div>
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
async function shotTransparent(html, w, h, path) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  writeFileSync('/tmp/gojeon-asset.html', `<!DOCTYPE html><html><head>${FONT}<style>html,body{margin:0;background:transparent}</style></head><body>${html}</body></html>`);
  await p.goto('file:///tmp/gojeon-asset.html');
  await p.evaluate(async () => { await document.fonts.load('900 100px "Noto Serif KR"', '古典'); await document.fonts.ready; });
  await p.waitForTimeout(800);
  await p.screenshot({ path, omitBackground: true });
  await p.close();
}
await shot(seal(1024), 1024, 1024, 'assets/icon-only.png');
// 안드로이드 적응형 아이콘: 앞 층은 투명 배경(먹색은 뒤 층)
await shotTransparent(seal(1024, false), 1024, 1024, 'assets/icon-foreground.png');
await shot('<div style="width:1024px;height:1024px;background:#18222f"></div>', 1024, 1024, 'assets/icon-background.png');
await shot(splash(2732, 2732), 2732, 2732, 'assets/splash.png');
await shot(splash(2732, 2732), 2732, 2732, 'assets/splash-dark.png');
await b.close();
