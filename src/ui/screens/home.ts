import { h } from '../dom';
import { app, commit, applySettingsToPage } from '../../state/store';
import { restoration, rankOf, todaysStory, unlockedStories, hanjaStats, memoryOf, libraryHanja } from '../../engine/rewards';
import { isResumable, sessionLabel } from '../../engine/session';
import { getStory } from '../../content/stories';
import { EASY } from '../../content/learn';
import type { LearnLevel } from '../../state/save';
import { go } from '../../state/router';
import { dueQueue } from '../../engine/srs';
import type { Screen } from '../../state/router';
import { artEl } from '../art';
import { todayProgress, weekReport } from '../../engine/stats';

export function homeScreen(): Screen {
  const pct = restoration(app.save);
  const rank = rankOf(pct);
  const story = todaysStory(app.today);
  const due = dueQueue(app.save.cards, app.today).length;
  const open = unlockedStories(app.save);
  const next = open.find((s) => !(app.save.stars[s.id] ?? 0)) ?? open.find((s) => (app.save.stars[s.id] ?? 0) < 3);
  const hs = hanjaStats(app.save);
  const sess = app.save.session;
  const resumeStory = isResumable(sess) ? getStory(sess.storyId) : undefined;
  // 멈춘 고사가 있으면 그 지점으로 바로 이어 간다
  const resume = sess && resumeStory
    ? h('a', { class: 'continue resume', href: `#story-${resumeStory.id}`, 'data-testid': 'resume-session' },
      h('span', { class: 'continue-label' }, '멈춘 곳에서 이어 하기'),
      h('span', { class: 'continue-idiom' }, resumeStory.idiom),
      h('span', { class: 'continue-reading' }, resumeStory.reading),
      h('span', { class: 'continue-source', 'data-testid': 'resume-session-where' }, sessionLabel(sess, resumeStory)),
    )
    : null;
  const goal = todayProgress(app.save, app.today);
  const week = weekReport(app.save, app.today);

  // 서고 두루마리: 한자 하나가 죽간 하나. 익힌 글자만 먹으로 쓰인다.
  // 만난 한자는 먹으로 쓰이고, 다시 볼 한자는 옅게 쓰인다
  const scroll = h('div', { class: 'scroll', role: 'img', 'aria-label': `서고 복원: 만난 한자 ${hs.seen}/${hs.total}자, 그중 다시 볼 한자 ${hs.toReview}자` },
    ...libraryHanja(app.save).map((x) => {
      const m = memoryOf(app.save, x.char);
      const inked = m !== 'none' && app.save.seen.includes(x.char);
      return h('span', { class: `slip${inked ? ' inked' : ''}${m === 'review' ? ' faded' : ''}` }, inked ? x.char : '');
    }),
  );
  const metricHelp = h('details', { class: 'metric-help', 'data-testid': 'metric-help' },
    h('summary', null, '숫자는 무슨 뜻인가요?'),
    h('ul', null,
      h('li', null, h('b', null, '만난 한자'), ' 대전·복습에서 한 번이라도 풀어 본 글자. 틀려도 줄지 않아요.'),
      h('li', null, h('b', null, '기억하는 한자'), ' 가장 최근에 맞힌 글자.'),
      h('li', null, h('b', null, '다시 볼 한자'), ' 최근에 틀린 글자. 복습에서 맞히면 기억하는 한자로 돌아가요.'),
      h('li', null, h('b', null, '서고 복원'), ` 만난 한자 ÷ 전체 ${hs.total}자(무료 44자 + 가진 확장팩의 한자).`),
    ),
  );
  const levelPick = () => {
    const pick = (v: LearnLevel, title: string, desc: string) => h('button', {
      class: `pick${app.save.settings.level === v ? ' on' : ''}`, role: 'radio', 'aria-checked': String(app.save.settings.level === v), 'data-testid': `level-${v}`,
      onclick: () => { commit({ ...app.save, settings: { ...app.save.settings, level: v } }); go('home'); },
    }, h('b', null, title), h('small', null, desc));
    return h('section', { class: 'card level-pick', 'data-testid': 'level-pick' },
      h('p', { class: 'pick-label' }, '어떻게 배워 볼까요? (나중에 설정에서 바꿀 수 있어요)'),
      h('div', { class: 'picks', role: 'radiogroup', 'aria-label': '학습 경험' },
        pick('new', '한자가 처음이에요', '쉬운 뜻과 글자 풀이를 먼저 보여 줘요'),
        pick('some', '조금 알고 있어요', '기본 흐름으로 배워요'),
        pick('deep', '고전을 깊게 읽고 싶어요', '원뜻과 출전을 펼쳐 보여 줘요'),
      ),
      app.save.settings.level === 'new' && !app.save.settings.large
        ? h('button', { class: 'btn small', 'data-testid': 'level-large', onclick: () => { commit({ ...app.save, settings: { ...app.save.settings, large: true } }); applySettingsToPage(); go('home'); } }, '큰 글씨로 보기')
        : null,
    );
  };

  const gear = h('a', { class: 'gear', href: '#settings', 'data-testid': 'open-settings' }, h('span', { class: 'gear-hanja', 'aria-hidden': 'true' }, '設'), '설정');

  // 첫 방문(아직 복원한 고사가 없음): 기록 대신 첫 고사로 바로 안내한다
  if (!Object.values(app.save.stars).some((x) => x > 0)) {
    const el = h('main', { class: 'screen home first', 'data-testid': 'home-first' },
      gear,
      h('header', { class: 'home-head' },
        h('h1', { class: 'title-vertical', 'aria-label': '고전열전' }, '古典列傳'),
        h('div', { class: 'first-intro' },
          h('p', { class: 'first-lead' }, '하루 10분, 이야기로 고사성어 하나를 익혀요.'),
          h('p', { class: 'first-sub' }, '사기와 논어의 장면 속 인물이 되어 선택하고, 원문을 읽고, 한자 대전으로 익힌다.'),
        ),
      ),
      resume,
      levelPick(),
      h('a', { class: 'first-start', href: '#story-sagi-01', 'data-testid': 'first-start' },
        artEl('sagi-01', { plain: true, cls: 'first-art' }),
        h('span', { class: 'first-hook' }, '인상여는 진나라 왕에게서 보물을 되찾을 수 있을까요?'),
        h('span', { class: 'first-cta' }, '첫 고사 시작 · 완벽귀조'),
        h('span', { class: 'first-easy' }, `쉬운 뜻: ${EASY['sagi-01']}`),
      ),
      h('ol', { class: 'first-steps', 'aria-label': '한 고사의 진행' },
        h('li', null, h('b', null, '장면'), h('span', null, '인물의 선택을 고른다')),
        h('li', null, h('b', null, '원문'), h('span', null, '한자를 누르면 뜻과 소리')),
        h('li', null, h('b', null, '대전'), h('span', null, '한자 문제 8개')),
        h('li', null, h('b', null, '합류'), h('span', null, '인물이 동료가 된다')),
      ),
      h('a', { class: 'first-browse', href: '#map-sagi' }, '다른 고사 둘러보기'),
      h('p', { class: 'first-note' }, '가입 없이 이 기기에 저장된다. 다른 기기로는 설정의 백업 코드로 옮길 수 있다.'),
    );
    return { el };
  }

  const el = h('main', { class: 'screen home' },
    gear,
    h('header', { class: 'home-head' },
      h('h1', { class: 'title-vertical', 'aria-label': '고전열전' }, '古典列傳'),
      h('div', { class: 'home-meta' },
        h('p', { class: 'rank' }, h('span', { class: 'rank-hanja' }, rank.hanja), h('span', null, rank.name)),
        h('p', { class: 'library-row' }, '서고 복원 ', h('b', { 'data-testid': 'restore' }, `${pct}%`)),
        h('p', { class: 'streak', 'data-testid': 'streak' }, `연속 ${app.save.streak.count}일`),
      ),
    ),
    scroll,
    h('p', { class: 'scroll-note', 'data-testid': 'learned-count' }, `만난 한자 ${hs.seen}자 / ${hs.total}자 · 기억하는 한자 ${hs.remembered}자 · 다시 볼 한자 ${hs.toReview}자`),
    metricHelp,
    resume,
    next && next.id !== resumeStory?.id
      ? h('a', { class: 'continue', href: `#story-${next.id}`, 'data-testid': 'continue-story' },
        h('span', { class: 'continue-label' }, (app.save.stars[next.id] ?? 0) ? '별 3개에 도전하기' : '다음 고사 이어 하기'),
        h('span', { class: 'continue-idiom' }, next.idiom),
        h('span', { class: 'continue-reading' }, next.reading),
        h('span', { class: 'continue-source' }, next.source),
      )
      : null,
    h('a', { class: `goal${goal.done ? ' done' : ''}`, href: '#report', 'data-testid': 'daily-goal' },
      h('span', { class: 'goal-text' }, h('b', null, goal.done ? '오늘 목표 달성' : '오늘의 목표'), h('span', null, `${Math.min(goal.answered, goal.goal)} / ${goal.goal}문제`)),
      h('span', { class: 'bar goal-bar' }, h('i', { style: `width:${Math.min(100, Math.round((goal.answered / goal.goal) * 100))}%` })),
      h('span', { class: 'goal-week' }, `이번 주 ${week.activeDays}일 공부 · 기록 보기`),
    ),
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
