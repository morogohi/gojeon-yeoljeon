import { h } from './dom';
import { app, commit } from '../state/store';
import { glossOf, isHan } from '../content/gloss';
import { STORIES } from '../content/stories';
import { toggleWord } from '../engine/stats';
import { speak, stopSpeaking } from './speech';

let open: HTMLElement | null = null;

export function closeHanjaSheet(): void {
  stopSpeaking();
  open?.remove();
  open = null;
}

/** 한자 한 글자의 훈음·뜻·소리·쓰임을 보여 주는 아래쪽 팝업 */
export function openHanjaSheet(char: string): void {
  const g = glossOf(char);
  if (!g) return;
  closeHanjaSheet();
  const card = app.save.cards[`h:${char}`];
  const inBook = () => app.save.wordbook.includes(char);
  const idioms = STORIES.filter((s) => s.idiom.includes(char));
  const words = STORIES.flatMap((s) => s.related).filter((r) => r.word.includes(char));
  const usedIn = STORIES.filter((s) => s.original.text.includes(char) && !s.idiom.includes(char));

  const bookBtn = h('button', { class: 'btn sheet-book', 'data-testid': 'sheet-book' });
  const paintBook = () => {
    bookBtn.textContent = inBook() ? '단어장에서 빼기' : '단어장에 담기';
    bookBtn.classList.toggle('on', inBook());
  };
  bookBtn.onclick = () => {
    commit(toggleWord(app.save, char, app.today));
    paintBook();
  };
  paintBook();

  const sheet = h('div', { class: 'sheet-backdrop', 'data-testid': 'hanja-sheet', onclick: (e: Event) => { if (e.target === sheet) closeHanjaSheet(); } },
    h('section', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': `${char} ${g.hun} ${g.eum}` },
      h('button', { class: 'sheet-close', 'aria-label': '닫기', onclick: closeHanjaSheet }, '✕'),
      h('div', { class: 'sheet-head' },
        h('div', { class: 'sheet-char' }, char),
        h('div', null,
          h('p', { class: 'sheet-hun' }, h('span', null, g.hun), ' ', h('b', null, g.eum)),
          g.note ? h('p', { class: 'sheet-note' }, g.note) : null,
          h('p', { class: 'sheet-status' }, card ? `복습 카드 · ${card.reps >= 3 ? '오래 기억함' : card.reps >= 1 ? '익히는 중' : '아직 익히지 않음'}` : '아직 복습 카드 없음'),
        ),
      ),
      h('div', { class: 'sheet-actions' },
        h('button', { class: 'btn primary', 'data-testid': 'sheet-speak', onclick: () => speak(`${g.hun} ${g.eum}`) }, '소리 듣기'),
        bookBtn,
      ),
      idioms.length || words.length || usedIn.length
        ? h('div', { class: 'sheet-uses' },
          h('p', { class: 'sheet-label' }, '이 글자가 쓰인 곳'),
          h('ul', null,
            ...idioms.map((s) => h('li', null, h('a', { href: `#story-${s.id}`, onclick: closeHanjaSheet }, h('b', null, s.idiom), ` ${s.reading}`))),
            ...words.map((w) => h('li', null, h('b', null, w.word), ` ${w.reading} — ${w.meaning}`)),
            ...usedIn.map((s) => h('li', null, `원문 · ${s.source}`)),
          ),
        )
        : null,
    ),
  );
  document.body.appendChild(sheet);
  open = sheet;
  (sheet.querySelector('.sheet-close') as HTMLElement).focus();
}

window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeHanjaSheet(); });
window.addEventListener('hashchange', () => closeHanjaSheet());

/** 문장 속 한자를 하나하나 누를 수 있는 글자로 만든다 */
export function tappableText(text: string, cls = ''): HTMLElement {
  return h('p', { class: cls },
    ...[...text].map((c) => (isHan(c) && glossOf(c)
      ? h('button', { class: 'hz', 'data-char': c, 'aria-label': `${c} ${glossOf(c)!.hun} ${glossOf(c)!.eum}`, onclick: () => openHanjaSheet(c) }, c)
      : c)),
  );
}
