import { h, topbar } from '../dom';
import { app, commit } from '../../state/store';
import { HEROES } from '../../content/heroes';
import { HANJA, hunEum } from '../../content/hanja';
import { STORIES } from '../../content/stories';
import { go, type Screen } from '../../state/router';
import { artEl } from '../art';
import { openHanjaSheet } from '../hanjaSheet';
import { glossOf } from '../../content/gloss';
import { mistakes } from '../../engine/stats';

export function codexScreen(args: string[]): Screen {
  const tab = ['hanja', 'album', 'words'].includes(args[0]) ? args[0] : 'heroes';
  const owned = Object.keys(app.save.heroes).length;
  const learned = HANJA.filter((x) => (app.save.cards[`h:${x.char}`]?.reps ?? 0) >= 1).length;

  const heroes = h('div', { class: 'hero-grid' },
    ...HEROES.map((hero) => {
      const mine = app.save.heroes[hero.id];
      const from = STORIES.find((s) => s.heroId === hero.id)!;
      if (!mine) {
        return h('div', { class: 'hero-card locked' },
          h('div', { class: 'hero-big' }, '？'),
          h('p', { class: 'hero-name' }, '미합류'),
          h('p', { class: 'hero-from' }, `「${from.reading}」 복원 시 합류`),
        );
      }
      const party = app.save.partyHeroId === hero.id;
      return h('button', {
        class: `hero-card${party ? ' party' : ''}`, 'data-hero': hero.id,
        onclick: () => { commit({ ...app.save, partyHeroId: hero.id }); go('codex-heroes'); },
      },
      party ? h('span', { class: 'party-tag' }, '출전') : null,
      h('div', { class: 'hero-big' }, hero.hanjaName),
      h('p', { class: 'hero-name' }, h('b', null, hero.name), ' ', h('span', { class: 'lv' }, '★'.repeat(mine.level))),
      h('p', { class: 'hero-from' }, hero.title),
      h('p', { class: 'skill-desc' }, `${hero.skillName}: ${hero.skillDesc}`),
      );
    }),
  );

  const hanja = h('div', { class: 'hanja-grid' },
    ...HANJA.map((x) => {
      const c = app.save.cards[`h:${x.char}`];
      const level = !c ? 0 : c.reps >= 3 ? 3 : c.reps >= 1 ? 2 : 1;
      return h('button', { class: `hanja-cell m${level}`, 'data-char': x.char, onclick: () => openHanjaSheet(x.char) }, h('span', { class: 'char' }, x.char), h('small', null, level ? hunEum(x) : '·'));
    }),
  );

  const restored = STORIES.filter((s) => (app.save.stars[s.id] ?? 0) > 0);
  const album = h('div', { class: 'album' },
    ...STORIES.map((s) => (app.save.stars[s.id] ?? 0) > 0
      ? h('section', { class: 'card art-card' }, h('p', { class: 'album-title' }, h('b', null, s.idiom), h('span', null, `${s.reading} · ${s.source}`)), artEl(s.id, { caption: true }))
      : h('section', { class: 'card' }, h('p', { class: 'album-title' }, h('b', null, '？？？？'), h('span', null, s.source)), h('div', { class: 'locked-art' }, '고사를 복원하면 그림이 채워진다'))),
  );

  const wrong = mistakes(app.save);
  const wordCell = (c: string, badge?: string) => {
    const g = glossOf(c);
    return h('button', { class: 'hanja-cell m2', 'data-char': c, onclick: () => openHanjaSheet(c) },
      h('span', { class: 'char' }, c), h('small', null, g ? `${g.hun} ${g.eum}` : ''), badge ? h('em', { class: 'cell-badge' }, badge) : null);
  };
  const words = h('div', { class: 'words' },
    h('h3', { class: 'words-title' }, `단어장 ${app.save.wordbook.length}자`),
    app.save.wordbook.length
      ? h('div', { class: 'hanja-grid', 'data-testid': 'wordbook' }, ...app.save.wordbook.map((c) => wordCell(c)))
      : h('p', { class: 'hint-line' }, '원문이나 한자 카드에서 글자를 누르고 ‘단어장에 담기’를 고르면 여기에 모인다.'),
    h('h3', { class: 'words-title' }, `오답 노트 ${wrong.length}개`),
    wrong.length
      ? h('div', { class: 'hanja-grid' }, ...wrong.map((w) => w.key.startsWith('h:')
        ? wordCell(w.key.slice(2), `${w.lapses}번`)
        : h('a', { class: 'hanja-cell m1 idiom-cell', href: `#story-${w.key.slice(2)}` },
          h('span', { class: 'char' }, STORIES.find((s) => s.id === w.key.slice(2))?.idiom ?? ''), h('em', { class: 'cell-badge' }, `${w.lapses}번`))))
      : h('p', { class: 'hint-line' }, '대전과 복습에서 틀린 글자가 자동으로 모인다.'),
    app.save.wordbook.length || wrong.length ? h('a', { class: 'btn primary big', href: '#review-focus', 'data-testid': 'focus-review' }, '단어장·오답만 집중 복습') : null,
  );

  const hints: Record<string, string> = {
    heroes: `합류한 인물 ${owned}/${HEROES.length}. 인물을 누르면 대전에 출전한다. 같은 고사를 다시 깰수록 성급이 오른다.`,
    hanja: `익힌 한자 ${learned}/${HANJA.length}. 진한 칸일수록 오래 기억하고 있다. 누르면 뜻과 소리가 나온다.`,
    album: `복원한 고사 ${restored.length}/${STORIES.length}. 붉은 낙관이 그 한자다.`,
    words: '담아 둔 글자와 자주 틀린 글자를 한곳에서 다시 본다.',
  };

  const el = h('main', { class: 'screen codex' },
    topbar('도감', null),
    h('div', { class: 'tabs' },
      h('a', { class: `tab${tab === 'heroes' ? ' active' : ''}`, href: '#codex-heroes' }, '인물'),
      h('a', { class: `tab${tab === 'hanja' ? ' active' : ''}`, href: '#codex-hanja' }, '한자'),
      h('a', { class: `tab${tab === 'album' ? ' active' : ''}`, href: '#codex-album' }, '화첩'),
      h('a', { class: `tab${tab === 'words' ? ' active' : ''}`, href: '#codex-words', 'data-testid': 'tab-words' }, '단어장'),
    ),
    h('p', { class: 'hint-line' }, hints[tab]),
    tab === 'heroes' ? heroes : tab === 'hanja' ? hanja : tab === 'album' ? album : words,
  );
  return { el };
}
