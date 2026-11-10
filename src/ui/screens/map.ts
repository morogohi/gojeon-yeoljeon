import { h, stars, tabs, topbar } from '../dom';
import { app } from '../../state/store';
import { BOOKS, type Book } from '../../content/types';
import { storiesOf } from '../../content/stories';
import { isUnlocked } from '../../engine/rewards';
import type { Screen } from '../../state/router';
import { artEl } from '../art';

export function mapScreen(args: string[]): Screen {
  const book: Book = args[0] === 'nonyu' ? 'nonyu' : 'sagi';
  const list = storiesOf(book);
  const cleared = list.filter((s) => (app.save.stars[s.id] ?? 0) > 0).length;

  const el = h('main', { class: 'screen map' },
    topbar('열전 캠페인', null),
    tabs('원전', BOOKS.map((b) => ({ href: `#map-${b.id}`, label: [`${b.name} `, h('span', { class: 'hanja-sm', 'aria-hidden': 'true' }, b.hanja)], active: b.id === book, testid: `book-${b.id}` }))),
    h('p', { class: 'map-progress' }, `${cleared} / ${list.length} 고사 복원`),
    h('ol', { class: 'path' },
      ...list.map((s, i) => {
        const open = isUnlocked(app.save, s);
        const st = app.save.stars[s.id] ?? 0;
        const inner = [
          open ? artEl(s.id, { plain: true, cls: 'node-thumb' }) : h('span', { class: 'node-thumb blank' }, String(i + 1)),
          h('span', { class: 'node-body' },
            h('span', { class: 'node-idiom' }, open ? s.idiom : '？？？？'),
            h('span', { class: 'node-reading' }, open ? s.reading : '앞 고사를 복원하면 열린다'),
          ),
          open ? stars(st) : h('span', { class: 'lock' }, '鎖'),
        ];
        return h('li', { class: `node${open ? '' : ' locked'}${st ? ' done' : ''}` },
          open ? h('a', { href: `#story-${s.id}`, 'data-story': s.id }, inner) : h('div', null, inner));
      }),
    ),
  );
  el.appendChild(h('section', { class: 'season', 'data-testid': 'season-teaser' },
    h('p', { class: 'season-label' }, '다음 시즌 준비 중'),
    h('h3', null, '맹자·장자 — 제자백가의 논쟁'),
    h('p', { class: 'season-idioms' }, '五十步百步 · 緣木求魚 · 浩然之氣 · 胡蝶之夢 · 朝三暮四'),
    h('p', { class: 'season-note' }, '토론 배틀 모드와 함께 찾아온다. 그 뒤로 한비자·전국책, 삼국지가 이어진다.'),
  ));
  return { el };
}
