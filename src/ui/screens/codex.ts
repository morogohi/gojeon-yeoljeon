import { h, topbar } from '../dom';
import { app, commit } from '../../state/store';
import { HEROES } from '../../content/heroes';
import { HANJA, hunEum } from '../../content/hanja';
import { STORIES } from '../../content/stories';
import { go, type Screen } from '../../state/router';
import { artEl } from '../art';

export function codexScreen(args: string[]): Screen {
  const tab = args[0] === 'hanja' ? 'hanja' : args[0] === 'album' ? 'album' : 'heroes';
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
      return h('div', { class: `hanja-cell m${level}`, title: hunEum(x) }, h('span', { class: 'char' }, x.char), h('small', null, level ? hunEum(x) : '·'));
    }),
  );

  const restored = STORIES.filter((s) => (app.save.stars[s.id] ?? 0) > 0);
  const album = h('div', { class: 'album' },
    ...STORIES.map((s) => (app.save.stars[s.id] ?? 0) > 0
      ? h('section', { class: 'card art-card' }, h('p', { class: 'album-title' }, h('b', null, s.idiom), h('span', null, `${s.reading} · ${s.source}`)), artEl(s.id, { caption: true }))
      : h('section', { class: 'card' }, h('p', { class: 'album-title' }, h('b', null, '？？？？'), h('span', null, s.source)), h('div', { class: 'locked-art' }, '고사를 복원하면 그림이 채워진다'))),
  );

  const hints: Record<string, string> = {
    heroes: '인물을 누르면 대전에 출전한다. 같은 고사를 다시 깰수록 성급이 오른다.',
    hanja: '진한 칸일수록 오래 기억하고 있는 한자다.',
    album: '복원한 고사의 그림이 화첩에 모인다. 붉은 낙관이 그 한자다.',
  };

  const el = h('main', { class: 'screen codex' },
    topbar('도감', null),
    h('div', { class: 'tabs' },
      h('a', { class: `tab${tab === 'heroes' ? ' active' : ''}`, href: '#codex-heroes' }, `인물 ${owned}/${HEROES.length}`),
      h('a', { class: `tab${tab === 'hanja' ? ' active' : ''}`, href: '#codex-hanja' }, `한자 ${learned}/${HANJA.length}`),
      h('a', { class: `tab${tab === 'album' ? ' active' : ''}`, href: '#codex-album' }, `화첩 ${restored.length}/${STORIES.length}`),
    ),
    h('p', { class: 'hint-line' }, hints[tab]),
    tab === 'heroes' ? heroes : tab === 'hanja' ? hanja : album,
  );
  return { el };
}
