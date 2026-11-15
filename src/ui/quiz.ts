import type { Question } from '../engine/questions';
import { h } from './dom';
import { app } from '../state/store';
import { artEl } from './art';

export interface QuizView {
  el: HTMLElement;
  reveal(choice: number): void;
}

export function questionView(q: Question, opts: { removed?: number[]; hint?: string | null }, onPick: (i: number) => void): QuizView {
  const removed = opts.removed ?? [];
  const isHanjaPrompt = q.kind === 'char2hun';
  const isIdiomPrompt = q.kind === 'blank' || q.kind === 'meaning';
  const isSentencePrompt = q.kind === 'usage' || q.kind === 'similar';
  const longOptions = q.kind === 'meaning' || q.kind === 'picture' || isSentencePrompt;
  const optionHanja = q.kind === 'hun2char' || q.kind === 'blank';
  let locked = false;

  const buttons = q.options.map((text, i) =>
    h('button', {
      class: `opt${optionHanja ? ' opt-hanja' : ''}${removed.includes(i) ? ' removed' : ''}`,
      disabled: removed.includes(i),
      'data-correct': app.e2e && i === q.answer ? '1' : undefined,
      onclick: () => {
        if (locked) return;
        locked = true;
        onPick(i);
      },
    }, text),
  );

  const el = h('section', { class: 'quiz' },
    h('p', { class: 'quiz-label' }, q.label),
    q.art ? artEl(q.art, { plain: true, cls: 'quiz-art' }) : h('div', { class: `quiz-prompt${isHanjaPrompt ? ' big-hanja' : ''}${isIdiomPrompt ? ' idiom' : ''}${isSentencePrompt ? ' sentence' : ''}` }, q.prompt),
    q.sub ? h('p', { class: 'quiz-sub' }, q.sub) : null,
    opts.hint ? h('p', { class: 'quiz-hint' }, `가르침: 정답은 「${opts.hint}」로 시작한다`) : null,
    h('div', { class: `opts${longOptions ? ' opts-long' : ''}` }, buttons),
  );

  return {
    el,
    reveal(choice: number) {
      locked = true;
      // 색만으로 구분하지 않도록 ✓·✗ 표시와 글로도 알린다
      buttons.forEach((b, i) => {
        b.disabled = true;
        if (i === q.answer) {
          b.classList.add('right');
          b.prepend(h('span', { class: 'mark', 'aria-hidden': 'true' }, '✓ '));
          b.setAttribute('aria-label', `정답: ${q.options[i]}`);
        } else if (i === choice) {
          b.classList.add('wrong');
          b.prepend(h('span', { class: 'mark', 'aria-hidden': 'true' }, '✗ '));
          b.setAttribute('aria-label', `내가 고른 답(오답): ${q.options[i]}`);
        }
      });
    },
  };
}
