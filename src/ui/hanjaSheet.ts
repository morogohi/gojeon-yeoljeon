import { h } from './dom';
import { app, commit } from '../state/store';
import { glossOf, isHan } from '../content/gloss';
import { STORIES } from '../content/stories';
import { toggleWord } from '../engine/stats';
import { speakWithNotice, stopSpeaking } from './speech';
import { memoryOf } from '../engine/rewards';

let open: HTMLElement | null = null;
let opener: HTMLElement | null = null;

export function closeHanjaSheet(): void {
  if (!open) return;
  stopSpeaking();
  open.remove();
  open = null;
  // 팝업을 연 곳으로 초점을 돌려준다(키보드 사용자가 길을 잃지 않게)
  if (opener && opener.isConnected) opener.focus();
  opener = null;
}

/** 한자 한 글자의 훈음·뜻·소리·쓰임을 보여 주는 아래쪽 팝업 */
export function openHanjaSheet(char: string): void {
  const g = glossOf(char);
  if (!g) return;
  const from = (document.activeElement as HTMLElement | null) ?? null;
  closeHanjaSheet();
  opener = from && from !== document.body ? from : null;
  const mem = memoryOf(app.save, char);
  const inBook = () => app.save.wordbook.includes(char);
  const idioms = STORIES.filter((s) => s.idiom.includes(char));
  const words = STORIES.flatMap((s) => s.related).filter((r) => r.word.includes(char));
  const usedIn = STORIES.filter((s) => s.original.text.includes(char) && !s.idiom.includes(char));

  const bookBtn = h('button', { class: 'btn sheet-book', 'data-testid': 'sheet-book' });
  const soundMsg = h('p', { class: 'listen-status', role: 'status', 'data-testid': 'sheet-sound-msg' });
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
          h('p', { class: 'sheet-status', 'data-testid': 'sheet-status' }, { none: app.save.cards[`h:${char}`] ? '단어장에 담음 · 아직 풀어 보지 않음' : '아직 만나지 않은 글자', review: '다시 볼 한자 · 복습에서 맞히면 기억하는 한자가 돼요', remembered: '기억하는 한자', strong: '오래 기억하는 한자' }[mem]),
        ),
      ),
      h('div', { class: 'sheet-actions' },
        h('button', { class: 'btn primary', 'data-testid': 'sheet-speak', onclick: () => speakWithNotice(`${g.hun} ${g.eum}`, soundMsg) }, '소리 듣기'),
        bookBtn,
      ),
      soundMsg,
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

window.addEventListener('keydown', (e) => {
  if (!open) return;
  if (e.key === 'Escape') { closeHanjaSheet(); return; }
  if (e.key === 'Tab') {
    // 팝업이 열려 있는 동안 초점은 팝업 안에서만 돈다
    const items = [...open.querySelectorAll<HTMLElement>('button, a[href]')].filter((x) => !x.hasAttribute('disabled'));
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
window.addEventListener('hashchange', () => closeHanjaSheet());

/** 문장 속 한자를 하나하나 누를 수 있는 글자로 만든다 */
export function tappableText(text: string, cls = ''): HTMLElement {
  return h('p', { class: cls },
    ...[...text].map((c) => (isHan(c) && glossOf(c)
      ? h('button', { class: 'hz', 'data-char': c, 'aria-label': `${c} ${glossOf(c)!.hun} ${glossOf(c)!.eum}`, onclick: () => openHanjaSheet(c) }, c)
      : c)),
  );
}
