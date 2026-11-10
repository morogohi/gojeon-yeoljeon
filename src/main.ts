import './ui/styles.css';
import { startRouter, parseHash } from './state/router';
import { app, startSession } from './state/store';
import { dueQueue } from './engine/srs';
import { h } from './ui/dom';
import { homeScreen } from './ui/screens/home';
import { mapScreen } from './ui/screens/map';
import { storyScreen } from './ui/screens/story';
import { codexScreen } from './ui/screens/codex';
import { reviewScreen } from './ui/screens/review';
import { puzzleScreen } from './ui/screens/puzzle';
import { settingsScreen } from './ui/screens/settings';
import { reportScreen } from './ui/screens/report';

// 웹폰트는 화면 표시를 막지 않도록 스크립트로 붙인다. 실패하면 시스템 글꼴을 쓴다.
const font = document.createElement('link');
font.rel = 'stylesheet';
font.href = 'https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Noto+Serif+KR:wght@500;700;900&display=swap';
document.head.appendChild(font);

startSession();

const TABS = [
  { route: 'home', href: '#home', glyph: '書', label: '서고' },
  { route: 'map', href: '#map-sagi', glyph: '傳', label: '열전' },
  { route: 'review', href: '#review', glyph: '習', label: '복습' },
  { route: 'codex', href: '#codex-heroes', glyph: '錄', label: '도감' },
  { route: 'puzzle', href: '#puzzle', glyph: '字', label: '퍼즐' },
];

const tabbar = h('nav', { class: 'tabbar', 'aria-label': '주 메뉴' });
document.body.appendChild(tabbar);

function paintTabs(): void {
  const { name } = parseHash(location.hash);
  document.body.dataset.route = name || 'home';
  const due = dueQueue(app.save.cards, app.today).length;
  tabbar.replaceChildren(...TABS.map((t) =>
    h('a', { class: `tab-item${t.route === name ? ' active' : ''}`, href: t.href, 'data-testid': `tab-${t.route}`, 'aria-current': t.route === name ? 'page' : undefined },
      h('span', { class: 'tab-glyph' }, t.glyph),
      h('span', { class: 'tab-label' }, t.label),
      t.route === 'review' && due ? h('span', { class: 'badge', 'data-testid': 'review-badge' }, String(due)) : null,
    )));
}

window.addEventListener('hashchange', paintTabs);
startRouter(document.getElementById('app')!, {
  home: homeScreen,
  map: mapScreen,
  story: storyScreen,
  codex: codexScreen,
  review: reviewScreen,
  puzzle: puzzleScreen,
  settings: settingsScreen,
  report: reportScreen,
}, 'home');
paintTabs();
