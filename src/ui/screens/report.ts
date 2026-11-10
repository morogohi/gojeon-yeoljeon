import { h, topbar } from '../dom';
import { app } from '../../state/store';
import { weekReport, reportText, mistakes } from '../../engine/stats';
import { restoration, rankOf } from '../../engine/rewards';
import { shareText } from '../shareCard';
import type { Screen } from '../../state/router';

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

export function reportScreen(): Screen {
  const r = weekReport(app.save, app.today);
  const rank = rankOf(restoration(app.save));
  const max = Math.max(app.save.settings.dailyGoal, ...r.days.map((d) => d.answered));
  const msg = h('p', { class: 'settings-msg', role: 'status', 'data-testid': 'report-msg' });
  const weak = mistakes(app.save, 5);

  const el = h('main', { class: 'screen report' },
    topbar('이번 주 기록', '#home'),
    h('section', { class: 'card week' },
      h('p', { class: 'eyebrow' }, `최근 7일 · 하루 목표 ${app.save.settings.dailyGoal}문제`),
      h('div', { class: 'week-bars', role: 'img', 'aria-label': r.days.map((d) => `${d.date} ${d.answered}문제`).join(', ') },
        ...r.days.map((d) => {
          const dow = WEEKDAY[new Date(`${d.date}T00:00:00Z`).getUTCDay()];
          const goalHit = d.answered >= app.save.settings.dailyGoal;
          return h('div', { class: `wb${d.date === app.today ? ' today' : ''}` },
            h('span', { class: 'wb-num' }, d.answered ? String(d.answered) : ''),
            h('span', { class: `wb-bar${goalHit ? ' hit' : ''}`, style: `height:${Math.round((d.answered / max) * 100)}%` }),
            h('span', { class: 'wb-day' }, dow));
        }),
        h('i', { class: 'wb-goal', style: `bottom:calc(22px + ${Math.round((app.save.settings.dailyGoal / max) * 100)}% * .82)` }),
      ),
    ),
    h('section', { class: 'stat-grid', 'data-testid': 'report-stats' },
      h('div', null, h('b', null, `${r.activeDays}일`), h('span', null, '공부한 날')),
      h('div', null, h('b', null, `${r.answered}`), h('span', null, '푼 문제')),
      h('div', null, h('b', null, `${r.accuracy}%`), h('span', null, '정답률')),
      h('div', null, h('b', null, `${r.learnedHanja}자`), h('span', null, '익힌 한자')),
      h('div', null, h('b', null, `${r.restoredStories}편`), h('span', null, '복원한 고사')),
      h('div', null, h('b', null, rank.name), h('span', null, '등급')),
    ),
    weak.length
      ? h('section', { class: 'card' },
        h('p', { class: 'eyebrow' }, '자주 틀린 글자'),
        h('p', { class: 'weak' }, weak.map((w) => w.key.slice(2)).join('  ')),
        h('a', { class: 'btn primary', href: '#review-focus' }, '틀린 글자만 다시 풀기'))
      : null,
    h('button', { class: 'btn big', 'data-testid': 'report-share', onclick: async () => { msg.textContent = await shareText('고전열전 학습 기록', reportText(r, rank.name)); } }, '보호자·친구에게 기록 보내기'),
    msg,
  );
  return { el };
}
