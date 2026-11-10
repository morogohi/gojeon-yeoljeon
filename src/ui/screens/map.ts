import { h, stars, topbar } from '../dom';
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
    h('div', { class: 'tabs', role: 'tablist' },
      ...BOOKS.map((b) => h('a', { class: `tab${b.id === book ? ' active' : ''}`, href: `#map-${b.id}`, role: 'tab' }, `${b.name} `, h('span', { class: 'hanja-sm' }, b.hanja))),
    ),
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
  return { el };
}
