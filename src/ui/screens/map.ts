import { h, stars, tabs, topbar } from '../dom';
import { app } from '../../state/store';
import { BOOKS, type Book } from '../../content/types';
import { storiesOf } from '../../content/stories';
import { isEntitled, isUnlocked, ownsPack } from '../../engine/rewards';
import { PACKS } from '../../content/packs';
import type { Screen } from '../../state/router';
import { artEl } from '../art';

export function mapScreen(args: string[]): Screen {
  const book: Book = args[0] === 'nonyu' ? 'nonyu' : args[0] === 'myeongjang' ? 'myeongjang' : 'sagi';
  const pack = PACKS.find((p) => p.stories[0].book === book);
  const list = storiesOf(book);
  const cleared = list.filter((s) => (app.save.stars[s.id] ?? 0) > 0).length;

  const el = h('main', { class: 'screen map' },
    topbar('열전 캠페인', null),
    tabs('원전', BOOKS.map((b) => ({ href: `#map-${b.id}`, label: [`${b.name} `, h('span', { class: 'hanja-sm', 'aria-hidden': 'true' }, b.hanja)], active: b.id === book, testid: `book-${b.id}` }))),
    h('p', { class: 'map-progress' }, `${cleared} / ${list.length} 고사 복원`),
    pack && !ownsPack(app.save, pack.id)
      ? h('a', { class: 'pack-banner', href: `#pack-${pack.id}`, 'data-testid': 'pack-banner' },
        h('b', null, `확장팩 「${pack.title}」`), h('span', null, '첫 고사는 무료 체험 · 나머지는 보호자 구매로 열린다'))
      : null,
    h('ol', { class: 'path' },
      ...list.map((s, i) => {
        const open = isUnlocked(app.save, s);
        const paid = !isEntitled(app.save, s);
        const st = app.save.stars[s.id] ?? 0;
        const inner = [
          open ? artEl(s.id, { plain: true, cls: 'node-thumb' }) : h('span', { class: 'node-thumb blank' }, String(i + 1)),
          h('span', { class: 'node-body' },
            h('span', { class: 'node-idiom' }, open || paid ? s.idiom : '？？？？'),
            h('span', { class: 'node-reading' }, open ? s.reading : paid ? `${s.reading} · 확장팩` : '앞 고사를 복원하면 열린다'),
            open || paid ? h('span', { class: 'node-era' }, s.era ?? '') : null,
          ),
          open ? stars(st) : h('span', { class: 'lock' }, '鎖'),
        ];
        return h('li', { class: `node${open ? '' : ' locked'}${st ? ' done' : ''}` },
          open ? h('a', { href: `#story-${s.id}`, 'data-story': s.id }, inner)
            : paid ? h('a', { href: `#story-${s.id}`, 'data-story': s.id, 'data-paid': '1' }, inner) : h('div', null, inner));
      }),
    ),
  );
  if (book !== 'myeongjang') el.appendChild(h('a', { class: 'season', href: `#pack-${PACKS[0].id}`, 'data-testid': 'season-teaser' },
    h('p', { class: 'season-label' }, '확장팩 1 · 첫 고사 무료 체험'),
    h('h3', null, PACKS[0].title),
    h('p', { class: 'season-idioms' }, PACKS[0].stories.map((s) => s.idiom).join(' · ')),
    h('p', { class: 'season-note' }, '항량·항우·범증·번쾌·소하, 초한전쟁의 결단을 네 고사로 만난다. 그 뒤로 맹자·장자(제자백가의 논쟁), 삼국지가 이어진다.'),
    h('p', { class: 'season-free' }, '지금의 사기·논어 12편은 앞으로도 무료이고 광고가 없다.'),
  ));
  return { el };
}
