import { h, replace, topbar } from '../dom';
import { app, commit } from '../../state/store';
import { dueQueue, review } from '../../engine/srs';
import { reviewQuestion } from '../../engine/questions';
import { createRng } from '../../engine/rng';
import { questionView } from '../quiz';
import type { Screen } from '../../state/router';
import { recordAnswers, mistakes } from '../../engine/stats';
import { isNextDayReview } from '../../engine/funnel';
import { track } from '../../state/track';

export function reviewScreen(args: string[] = []): Screen {
  // focus: 단어장 + 오답 노트에서 골라 집중 복습 (날짜와 상관없이)
  const focus = args[0] === 'focus';
  const queue = focus
    ? [...new Set([...app.save.wordbook.map((c) => `h:${c}`), ...mistakes(app.save).map((m) => m.key)])].slice(0, 15)
    : dueQueue(app.save.cards, app.today);
  const body = h('div', { class: 'review-body' });
  const el = h('main', { class: 'screen review' }, topbar(focus ? '집중 복습' : '복습', focus ? '#codex-words' : null), body);
  const timers: number[] = [];
  const rng = createRng(app.seed());

  if (!queue.length && focus) {
    replace(body, h('section', { class: 'card empty-state', 'data-testid': 'review-empty' },
      h('div', { class: 'hero-big' }, '錄'),
      h('h2', null, '집중 복습할 글자가 없다'),
      h('p', null, '원문에서 한자를 눌러 단어장에 담거나, 대전에서 틀린 글자가 생기면 여기에 모인다.'),
      h('a', { class: 'btn primary', href: '#map-sagi' }, '캠페인으로'),
    ));
    return { el };
  }

  if (!queue.length) {
    const focusCount = new Set([...app.save.wordbook.map((c) => `h:${c}`), ...mistakes(app.save).map((m) => m.key)]).size;
    const upcoming = Object.values(app.save.cards).map((c) => c.due).sort()[0];
    replace(body, h('section', { class: 'card empty-state', 'data-testid': 'review-empty' },
      h('div', { class: 'hero-big' }, '習'),
      h('h2', null, '오늘 복습은 끝났다'),
      h('p', null, upcoming ? `다음 정기 복습은 ${upcoming}에 열린다.` : '캠페인에서 고사를 하나 복원하면 복습 카드가 생긴다.'),
      focusCount
        ? h('a', { class: 'btn primary', href: '#review-focus', 'data-testid': 'to-focus' }, `단어장·오답 ${focusCount}개 지금 복습하기`)
        : h('a', { class: 'btn primary', href: '#map-sagi' }, '캠페인으로'),
      focusCount ? h('a', { class: 'btn', href: '#map-sagi', style: 'margin-top:8px' }, '캠페인으로') : null,
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
      commit(recordAnswers({ ...app.save, cards: { ...app.save.cards, [key]: review(app.save.cards[key], ok, app.today) } }, app.today, 1, ok ? 1 : 0));
      if (isNextDayReview(app.save, app.today)) track('review_next_day');
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
