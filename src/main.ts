import './ui/styles.css';
import { startRouter, parseHash } from './state/router';
import { app, startSession, checkDayChange } from './state/store';
import { track } from './state/track';
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
track('first_open');

// 기존 메뉴 이름은 그대로 두고, 처음 배우는 동안(또는 '처음이에요' 학습 방식) 용도를 함께 쓴다
const TABS = [
  { route: 'home', href: '#home', glyph: '書', label: '서고', hint: '오늘의 학습' },
  { route: 'map', href: '#map-sagi', glyph: '傳', label: '열전', hint: '이야기 배우기' },
  { route: 'review', href: '#review', glyph: '習', label: '복습', hint: '배운 한자 다시 보기' },
  { route: 'codex', href: '#codex-heroes', glyph: '錄', label: '도감', hint: '모은 인물과 한자' },
  { route: 'puzzle', href: '#puzzle', glyph: '字', label: '퍼즐', hint: '성어 맞추기' },
];

const tabbar = h('nav', { class: 'tabbar', 'aria-label': '주 메뉴' });
document.body.appendChild(tabbar);

function paintTabs(): void {
  checkDayChange();
  const { name } = parseHash(location.hash);
  document.body.dataset.route = name || 'home';
  const due = dueQueue(app.save.cards, app.today).length;
  // 처음 고사를 복원할 때까지만 '서고·열전'의 용도를 풀어 쓴다
  const onboarding = !Object.values(app.save.stars).some((x) => x > 0) || app.save.settings.level === 'new';
  tabbar.classList.toggle('with-hints', onboarding);
  tabbar.replaceChildren(...TABS.map((t) =>
    h('a', { class: `tab-item${t.route === name ? ' active' : ''}`, href: t.href, 'data-testid': `tab-${t.route}`, 'aria-current': t.route === name ? 'page' : undefined, title: `${t.label}: ${t.hint}` },
      h('span', { class: 'tab-glyph' }, t.glyph),
      h('span', { class: 'tab-label' }, t.label),
      onboarding ? h('span', { class: 'tab-hint' }, t.hint) : null,
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
