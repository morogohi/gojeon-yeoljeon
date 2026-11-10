import { h, replace, topbar } from '../dom';
import { app, commit } from '../../state/store';
import { dueQueue, review } from '../../engine/srs';
import { reviewQuestion } from '../../engine/questions';
import { createRng } from '../../engine/rng';
import { questionView } from '../quiz';
import type { Screen } from '../../state/router';

export function reviewScreen(): Screen {
  const queue = dueQueue(app.save.cards, app.today);
  const body = h('div', { class: 'review-body' });
  const el = h('main', { class: 'screen review' }, topbar('복습', null), body);
  const timers: number[] = [];
  const rng = createRng(app.seed());

  if (!queue.length) {
    const upcoming = Object.values(app.save.cards).map((c) => c.due).sort()[0];
    replace(body, h('section', { class: 'card empty-state', 'data-testid': 'review-empty' },
      h('div', { class: 'hero-big' }, '習'),
      h('h2', null, '오늘 복습은 끝났다'),
      h('p', null, upcoming ? `다음 복습: ${upcoming}` : '캠페인에서 고사를 하나 복원하면 복습 카드가 생긴다.'),
      h('a', { class: 'btn primary', href: '#map-sagi' }, '캠페인으로'),
    ));
    return { el };
  }

  let i = 0;
  let right = 0;
  const progress = h('p', { class: 'review-progress' });
  const qBox = h('div');
  const fb = h('div', { class: 'battle-feedback' });
  replace(body, progress, qBox, fb);

  const next = () => {
    if (i >= queue.length) return done();
    const key = queue[i];
    const q = reviewQuestion(rng, key);
    progress.textContent = `${i + 1} / ${queue.length}`;
    const view = questionView(q, {}, (choice) => {
      const ok = choice === q.answer;
      view.reveal(choice);
      if (ok) right += 1;
      commit({ ...app.save, cards: { ...app.save.cards, [key]: review(app.save.cards[key], ok, app.today) } });
      i += 1;
      if (ok) {
        replace(fb, h('p', { class: 'good' }, '기억났다! ', q.explain));
        timers.push(window.setTimeout(() => { replace(fb); next(); }, 650));
      } else {
        replace(fb, h('p', { class: 'bad' }, `정답: ${q.explain}`), h('button', { class: 'btn', 'data-testid': 'continue', onclick: () => { replace(fb); next(); } }, '다음'));
      }
    });
    replace(qBox, view.el);
  };

  const done = () => {
    replace(body, h('section', { class: 'card empty-state', 'data-testid': 'review-done' },
      h('div', { class: 'hero-big' }, '習'),
      h('h2', null, '복습 완료'),
      h('p', null, `${queue.length}장 중 ${right}장을 기억했다. 틀린 카드는 내일 다시 나온다.`),
      h('a', { class: 'btn primary', href: '#home' }, '홈으로'),
    ));
  };

  next();
  return { el, dispose: () => timers.forEach(clearTimeout) };
}
