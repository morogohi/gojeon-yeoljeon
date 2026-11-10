import { h } from '../dom';
import { app } from '../../state/store';
import { restoration, rankOf, todaysStory, unlockedStories } from '../../engine/rewards';
import { dueQueue } from '../../engine/srs';
import { HANJA } from '../../content/hanja';
import type { Screen } from '../../state/router';
import { artEl } from '../art';

export function homeScreen(): Screen {
  const pct = restoration(app.save);
  const rank = rankOf(pct);
  const story = todaysStory(app.today);
  const due = dueQueue(app.save.cards, app.today).length;
  const open = unlockedStories(app.save);
  const next = open.find((s) => !(app.save.stars[s.id] ?? 0)) ?? open.find((s) => (app.save.stars[s.id] ?? 0) < 3);
  const learned = HANJA.filter((x) => (app.save.cards[`h:${x.char}`]?.reps ?? 0) >= 1).length;

  // 서고 두루마리: 한자 하나가 죽간 하나. 익힌 글자만 먹으로 쓰인다.
  const scroll = h('div', { class: 'scroll', role: 'img', 'aria-label': `서고 복원 ${learned}/${HANJA.length}자` },
    ...HANJA.map((x) => {
      const inked = (app.save.cards[`h:${x.char}`]?.reps ?? 0) >= 1;
      return h('span', { class: `slip${inked ? ' inked' : ''}` }, inked ? x.char : '');
    }),
  );

  const el = h('main', { class: 'screen home' },
    h('header', { class: 'home-head' },
      h('h1', { class: 'title-vertical', 'aria-label': '고전열전' }, '古典列傳'),
      h('div', { class: 'home-meta' },
        h('p', { class: 'rank' }, h('span', { class: 'rank-hanja' }, rank.hanja), h('span', null, rank.name)),
        h('p', { class: 'library-row' }, '서고 복원 ', h('b', { 'data-testid': 'restore' }, `${pct}%`)),
        h('p', { class: 'streak', 'data-testid': 'streak' }, `연속 ${app.save.streak.count}일`),
      ),
    ),
    scroll,
    h('p', { class: 'scroll-note' }, `흩어진 글자 ${HANJA.length}자 중 ${learned}자를 되찾았다`),
    next
      ? h('a', { class: 'continue', href: `#story-${next.id}`, 'data-testid': 'continue-story' },
        h('span', { class: 'continue-label' }, (app.save.stars[next.id] ?? 0) ? '별 3개에 도전하기' : '다음 고사 이어 하기'),
        h('span', { class: 'continue-idiom' }, next.idiom),
        h('span', { class: 'continue-reading' }, next.reading),
        h('span', { class: 'continue-source' }, next.source),
      )
      : null,
    due
      ? h('a', { class: 'due-note', href: '#review' }, h('b', null, `복습 ${due}장`), h('span', null, '잊기 전에 오늘 다시 보자'))
      : null,
    h('a', { class: 'today card', href: `#story-${story.id}` },
      artEl(story.id, { plain: true, cls: 'today-art' }),
      h('div', { class: 'today-body' },
        h('p', { class: 'today-label' }, '오늘의 성어'),
        h('div', { class: 'today-idiom' }, story.idiom),
        h('p', { class: 'today-reading' }, story.reading),
        h('p', { class: 'today-meaning' }, story.meaning),
      ),
    ),
  );
  return { el };
}
