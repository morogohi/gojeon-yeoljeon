import { h, replace, topbar } from '../dom';
import { app, commit } from '../../state/store';
import { STORIES } from '../../content/stories';
import { createRng } from '../../engine/rng';
import { unlockedStories } from '../../engine/rewards';
import { createPuzzle, pickPuzzleStories, tap, timeUp, PUZZLE_SECONDS, type PuzzleState } from '../../engine/puzzle';
import { go, type Screen } from '../../state/router';

export function puzzleScreen(): Screen {
  const rng = createRng(app.seed());
  const stories = pickPuzzleStories(rng, unlockedStories(app.save), STORIES);
  let s: PuzzleState = createPuzzle(rng, stories);
  let left = PUZZLE_SECONDS;
  let timer = 0;

  const clock = h('span', { class: 'clock', 'data-testid': 'clock' });
  const score = h('span', { class: 'score', 'data-testid': 'score' });
  const grid = h('div', { class: 'tile-grid' });
  const targets = h('ul', { class: 'targets' });
  const body = h('div', { class: 'puzzle-body' });
  const el = h('main', { class: 'screen puzzle' }, topbar('성어 퍼즐', null, clock), body);

  const paint = () => {
    clock.textContent = `${left}초`;
    clock.classList.toggle('urgent', left <= 10);
    score.textContent = `${s.score}점`;
    replace(grid, ...s.tiles.map((t) =>
      h('button', {
        class: `tile${t.gone ? ' gone' : ''}${s.selection.includes(t.id) ? ' sel' : ''}`,
        disabled: t.gone, 'data-char': t.char,
        onclick: () => onTap(t.id),
      }, t.char)));
    replace(targets, ...s.idioms.map((i) => h('li', { class: i.done ? 'done' : '' }, i.done ? `${i.idiom} ${i.reading}` : i.reading)));
  };

  const onTap = (id: number) => {
    const r = tap(s, id, left);
    s = r.state;
    if (r.event === 'reset') {
      grid.classList.remove('shake');
      void grid.offsetWidth;
      grid.classList.add('shake');
    }
    paint();
    if (s.done) finish(true);
  };

  const finish = (cleared: boolean) => {
    clearInterval(timer);
    const best = Math.max(app.save.puzzleBest, s.score);
    const isBest = s.score > app.save.puzzleBest;
    commit({ ...app.save, puzzleBest: best });
    replace(body, h('section', { class: 'card empty-state', 'data-testid': 'puzzle-done' },
      h('div', { class: 'hero-big' }, '字'),
      h('h2', null, cleared ? '네 성어를 모두 맞췄다' : '시간이 다 되었다'),
      h('p', { class: 'big-score' }, `${s.score}점`),
      h('p', null, isBest ? '새 최고 기록!' : `최고 기록 ${best}점`),
      h('ul', { class: 'targets' }, ...s.idioms.map((i) => h('li', { class: i.done ? 'done' : '' }, `${i.idiom} ${i.reading}`))),
      h('div', { class: 'result-actions' },
        h('a', { class: 'btn', href: '#home' }, '홈으로'),
        h('button', { class: 'btn primary', onclick: () => go('puzzle') }, '한 판 더'),
      ),
    ));
  };

  replace(body,
    h('div', { class: 'puzzle-head' }, h('p', { class: 'hint-line' }, '아래 독음에 맞게 한자를 순서대로 누르자.'), score),
    targets, grid,
  );
  paint();
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

  return { el, dispose: () => clearInterval(timer) };
}
