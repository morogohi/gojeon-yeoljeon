// 그림으로 보는 유래(네 컷)와 기억 노트(오늘날의 비유·교훈·가르침)
import { h } from './dom';
import { storyboardOf } from '../content/storyboard';
import { lessonOf } from '../content/lesson';
import { EASY } from '../content/learn';
import type { Story } from '../content/types';

export function storyboardEl(story: Story): HTMLElement | null {
  const panels = storyboardOf(story.id);
  if (!panels.length) return null;
  return h('section', { class: 'card storyboard', 'data-testid': 'storyboard', 'aria-label': `그림으로 보는 「${story.reading}」의 유래` },
    h('p', { class: 'eyebrow' }, '그림으로 보는 유래'),
    h('ol', { class: 'panels' },
      ...panels.map((pnl, i) => {
        const pic = h('div', { class: 'panel-img' });
        pic.innerHTML = pnl.svg; // 정적 콘텐츠(content/storyboard.ts)만 넣는다
        return h('li', { class: 'panel' },
          h('span', { class: 'panel-no', 'aria-hidden': 'true' }, String(i + 1)),
          pic,
          h('p', { class: 'panel-cap' }, pnl.caption));
      }),
    ),
  );
}

export function lessonEl(story: Story, opts: { compact?: boolean } = {}): HTMLElement | null {
  const l = lessonOf(story.id);
  if (!l) return null;
  return h('section', { class: `card lesson${opts.compact ? ' compact' : ''}`, 'data-testid': 'lesson' },
    h('p', { class: 'eyebrow' }, '기억 노트'),
    h('h3', { class: 'lesson-title' }, h('span', { class: 'hanja-sm' }, story.idiom), ' ', story.reading),
    h('p', { class: 'lesson-easy' }, EASY[story.id] ?? story.meaning),
    h('p', { class: 'lesson-hook', 'data-testid': 'lesson-hook' }, h('span', { class: 'tag' }, '기억 고리'), ' ', l.hook),
    h('h4', null, '오늘날 이런 때 써요'),
    h('ul', { class: 'lesson-examples', 'data-testid': 'lesson-examples' },
      ...l.examples.map((e) => h('li', null, h('b', null, e.where), ' ', e.text)),
      h('li', null, h('b', null, '예문'), ' ', story.modern),
    ),
    h('h4', null, '교훈'),
    h('p', { 'data-testid': 'lesson-lesson' }, l.lesson),
    h('h4', null, '가르침'),
    h('p', { 'data-testid': 'lesson-teaching' }, l.teaching),
    l.caution ? h('p', { class: 'lesson-caution' }, h('span', { class: 'tag' }, '쓸 때 주의'), ' ', l.caution) : null,
    h('p', { class: 'lesson-think', 'data-testid': 'lesson-think' }, h('span', { class: 'tag' }, '생각해 보기'), ' ', l.think),
  );
}
