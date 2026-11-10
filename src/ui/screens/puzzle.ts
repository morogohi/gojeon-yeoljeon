import { h, replace, topbar } from '../dom';
import { app, commit } from '../../state/store';
import { STORIES } from '../../content/stories';
import { createRng } from '../../engine/rng';
import { createPuzzle, puzzlePool, tap, timeUp, PUZZLE_SECONDS, type PuzzleScope, type PuzzleState } from '../../engine/puzzle';
import type { Screen } from '../../state/router';

type Mode = 'timed' | 'practice';

export function puzzleScreen(): Screen {
  const rng = createRng(app.seed());
  const learned = STORIES.filter((x) => (app.save.stars[x.id] ?? 0) > 0);
  let scope: PuzzleScope = learned.length >= 4 ? 'learned' : 'all';
  let mode: Mode = 'timed';
  let s: PuzzleState;
  let left = PUZZLE_SECONDS;
  let timer = 0;

  const clock = h('span', { class: 'clock', 'data-testid': 'clock', 'aria-live': 'off' });
  const score = h('span', { class: 'score', 'data-testid': 'score' });
  const grid = h('div', { class: 'tile-grid', role: 'group', 'aria-label': '한자 패' });
  const targets = h('ul', { class: 'targets', 'aria-label': '맞힐 성어' });
  const status = h('p', { class: 'sr-only', role: 'status', 'aria-live': 'polite' });
  const body = h('div', { class: 'puzzle-body' });
  const el = h('main', { class: 'screen puzzle' }, topbar('성어 퍼즐', null, clock), body);

  // ── 시작 화면: 범위와 방식을 고른 뒤 시작한다 ──
  const intro = () => {
    clock.textContent = '';
    const choice = (group: string, value: string, current: string, title: string, desc: string, disabled: boolean, pick: () => void) =>
      h('button', {
        class: `pick${value === current ? ' on' : ''}`, role: 'radio', 'aria-checked': String(value === current),
        disabled, 'data-testid': `${group}-${value}`, onclick: pick,
      }, h('b', null, title), h('small', null, desc));
    replace(body,
      h('section', { class: 'card puzzle-intro', 'data-testid': 'puzzle-intro' },
        h('div', { class: 'hero-big' }, '字'),
        h('p', { class: 'intro-rule' }, '아래에 보이는 독음에 맞춰 한자 패를 순서대로 누르면 성어가 완성된다. 순서가 틀리면 고른 패가 풀린다.'),
        h('p', { class: 'pick-label' }, '어떤 성어로 할까'),
        h('div', { class: 'picks', role: 'radiogroup', 'aria-label': '성어 범위' },
          choice('scope', 'learned', scope, `배운 성어 ${learned.length}편`, learned.length >= 4 ? '복원한 고사에서만 낸다' : '고사를 4편 복원하면 열린다', learned.length < 4, () => { scope = 'learned'; intro(); }),
          choice('scope', 'all', scope, `전체 성어 ${STORIES.length}편`, '아직 안 배운 성어도 나온다', false, () => { scope = 'all'; intro(); }),
        ),
        h('p', { class: 'pick-label' }, '어떻게 할까'),
        h('div', { class: 'picks', role: 'radiogroup', 'aria-label': '방식' },
          choice('mode', 'timed', mode, `${PUZZLE_SECONDS}초 도전`, `남은 초 × 5점 보너스, 최고 기록 ${app.save.puzzleBest}점`, false, () => { mode = 'timed'; intro(); }),
          choice('mode', 'practice', mode, '연습', '시간 제한 없이 천천히. 기록에는 남지 않는다', false, () => { mode = 'practice'; intro(); }),
        ),
        h('button', { class: 'btn primary big', 'data-testid': 'puzzle-start', onclick: start }, '시작'),
      ),
    );
  };

  const paint = () => {
    clock.textContent = mode === 'timed' ? `${left}초` : '연습';
    clock.classList.toggle('urgent', mode === 'timed' && left <= 10);
    score.textContent = `${s.score}점`;
    replace(grid, ...s.tiles.map((t) =>
      h('button', {
        class: `tile${t.gone ? ' gone' : ''}${s.selection.includes(t.id) ? ' sel' : ''}`,
        disabled: t.gone, 'data-char': t.char, 'aria-pressed': String(s.selection.includes(t.id)),
        onclick: () => onTap(t.id),
      }, t.char)));
    replace(targets, ...s.idioms.map((i) => h('li', { class: i.done ? 'done' : '' }, i.done ? `${i.idiom} ${i.reading}` : i.reading)));
  };

  const onTap = (id: number) => {
    const r = tap(s, id, mode === 'timed' ? left : 0);
    s = r.state;
    if (r.event === 'reset') {
      grid.classList.remove('shake');
      void grid.offsetWidth;
      grid.classList.add('shake');
      status.textContent = '순서가 맞지 않아 처음부터 다시 고른다';
    } else if (r.event === 'complete' || r.event === 'done') {
      status.textContent = `${r.idiom} 완성`;
    }
    paint();
    if (s.done) finish(true);
  };

  function start() {
    s = createPuzzle(rng, puzzlePool(rng, scope, learned, STORIES));
    left = PUZZLE_SECONDS;
    replace(body,
      h('div', { class: 'puzzle-head' }, h('p', { class: 'hint-line' }, '독음에 맞게 한자를 순서대로 누르자.'), score),
      targets, grid, status,
    );
    paint();
    if (mode === 'timed') {
      timer = window.setInterval(() => {
        left -= 1;
        if (left <= 0) {
          left = 0;
          s = timeUp(s);
          finish(false);
          return;
        }
        paint();
      }, 1000);
    }
  }

  const finish = (cleared: boolean) => {
    clearInterval(timer);
    const practice = mode === 'practice';
    const best = practice ? app.save.puzzleBest : Math.max(app.save.puzzleBest, s.score);
    const isBest = !practice && s.score > app.save.puzzleBest;
    if (!practice) commit({ ...app.save, puzzleBest: best });
    replace(body, h('section', { class: 'card empty-state', 'data-testid': 'puzzle-done' },
      h('div', { class: 'hero-big' }, '字'),
      h('h2', null, cleared ? '네 성어를 모두 맞췄다' : '시간이 다 되었다'),
      practice ? h('p', null, '연습 판은 기록에 남지 않는다.') : h('p', { class: 'big-score' }, `${s.score}점`),
      practice ? null : h('p', null, isBest ? '새 최고 기록!' : `최고 기록 ${best}점`),
      h('ul', { class: 'targets' }, ...s.idioms.map((i) => h('li', { class: i.done ? 'done' : '' }, `${i.idiom} ${i.reading}`))),
      h('div', { class: 'result-actions' },
        h('button', { class: 'btn', onclick: intro }, '방식 바꾸기'),
        h('button', { class: 'btn primary', 'data-testid': 'puzzle-again', onclick: start }, '한 판 더'),
      ),
    ));
  };

  intro();
  return { el, dispose: () => clearInterval(timer) };
}
