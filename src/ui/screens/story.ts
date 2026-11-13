import { h, replace, stars, topbar } from '../dom';
import { app, commit } from '../../state/store';
import { getStory, storiesOf } from '../../content/stories';
import { getHanja, hunEum } from '../../content/hanja';
import { getHero } from '../../content/heroes';
import type { Story } from '../../content/types';
import { createRng, type Rng } from '../../engine/rng';
import { battleQuestions } from '../../engine/questions';
import { createBattle, answer, useSkill, canUseSkill, current, starsOf, type BattleState } from '../../engine/battle';
import { applyClear, applyLog, isUnlocked, skillUsesFor } from '../../engine/rewards';
import { questionView } from '../quiz';
import { artEl } from '../art';
import { tappableText, openHanjaSheet } from '../hanjaSheet';
import { speak } from '../speech';
import { recordAnswers } from '../../engine/stats';
import { shareIdiomCard } from '../shareCard';
import { track } from '../../state/track';
import { FIRST_STORY, type FunnelKey } from '../../engine/funnel';
import type { Screen } from '../../state/router';

export function storyScreen(args: string[]): Screen {
  const story = getStory(args[0] ?? '');
  if (!story) {
    return { el: h('main', { class: 'screen' }, topbar('고사', '#home'), h('p', { class: 'empty' }, '찾을 수 없는 고사입니다.')) };
  }
  const body = h('div', { class: 'story-body' });
  const el = h('main', { class: 'screen story' }, topbar(h('span', { class: 'hanja-title' }, story.idiom), `#map-${story.book}`), body);
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
  const rng = createRng(app.seed());
  const playable = isUnlocked(app.save, story);
  // 첫 고사에서만 진행 단계를 남긴다 (어디서 멈추는지 보기 위해)
  const step = (key: FunnelKey) => { if (story.id === FIRST_STORY) track(key); };

  if (playable) showScene(0);
  else showOriginal(false);

  function showScene(i: number) {
    if (i === 0) step('s1_scene');
    const scene = story!.scenes[i];
    const dots = h('div', { class: 'dots' }, ...story!.scenes.map((_, k) => h('i', { class: k <= i ? 'on' : '' })));
    const panel = h('section', { class: 'scene card' },
      artEl(story!.id, { plain: true, cls: `scene-art step-${Math.min(i, 3)}` }),
      h('p', { class: 'eyebrow' }, story!.source),
      h('p', { class: 'scene-text' }, scene.text),
    );
    if (!scene.choice) {
      replace(body, dots, panel, h('button', { class: 'btn primary', 'data-testid': 'next', onclick: () => showScene(i + 1) }, '다음 장면'));
      return;
    }
    const fb = h('div', { class: 'choice-feedback' });
    const opts = scene.choice.options.map((o) =>
      h('button', {
        class: 'choice', 'data-correct': app.e2e && o.correct ? '1' : undefined,
        onclick: () => {
          step('s1_choice');
          opts.forEach((b, k) => {
            b.disabled = true;
            if (scene.choice!.options[k].correct) b.classList.add('right');
          });
          replace(fb,
            h('p', { class: o.correct ? 'good' : 'bad' }, o.correct ? '옳은 선택이다. 대전에서 체력 +1' : '실제 역사는 달랐다.'),
            h('p', null, o.feedback),
            h('button', { class: 'btn primary', 'data-testid': 'to-original', onclick: () => showOriginal(o.correct) }, '원문 펼치기'),
          );
        },
      }, o.label));
    // 고른 버튼이 오답이면 붉게 표시
    opts.forEach((b) => b.addEventListener('click', () => { if (!b.classList.contains('right')) b.classList.add('wrong'); }));
    replace(body, dots, panel, h('h2', { class: 'choice-prompt' }, scene.choice.prompt), h('div', { class: 'choices' }, opts), fb);
  }

  function showOriginal(bonusHp: boolean) {
    const s = story!;
    if (playable) step('s1_original');
    replace(body,
      h('section', { class: 'original card' },
        h('p', { class: 'eyebrow' }, `원문 ${s.source}`),
        tappableText(s.original.text, 'original-text'),
        h('p', { class: 'original-reading', 'data-testid': 'original-reading' }, s.original.reading),
        h('p', { class: 'original-tr' }, s.original.translation),
        h('div', { class: 'listen' },
          h('button', { class: 'btn small', 'data-testid': 'listen-reading', onclick: () => speak(s.original.reading) }, '독음 듣기'),
          h('button', { class: 'btn small', onclick: () => speak(s.original.translation) }, '풀이 듣기'),
          h('span', { class: 'listen-hint' }, '한자를 누르면 뜻과 소리가 나온다'),
        ),
      ),
      h('section', { class: 'card art-card', 'data-testid': 'art-card' },
        h('p', { class: 'eyebrow' }, '붉은 낙관이 찍힌 곳이 그 글자다'),
        artEl(s.id, { caption: true }),
      ),
      h('section', { class: 'idiom-card card' },
        h('div', { class: 'idiom-chars' },
          ...[...s.idiom].map((c) => {
            const hj = getHanja(c);
            return h('button', { class: 'char-tile', 'data-char': c, onclick: () => openHanjaSheet(c) }, h('span', { class: 'char' }, c), h('small', null, hunEum(hj)));
          }),
        ),
        h('p', { class: 'idiom-reading' }, s.reading),
        h('p', { class: 'idiom-meaning' }, s.meaning),
      ),
      h('section', { class: 'related card' },
        h('p', { class: 'eyebrow' }, '같은 한자가 든 단어'),
        h('ul', null, ...s.related.map((r) => h('li', null, h('b', { class: 'hanja-sm' }, r.word), ` ${r.reading} — ${r.meaning}`))),
      ),
      playable
        ? h('button', { class: 'btn primary big', 'data-testid': 'start-battle', onclick: () => startBattle(bonusHp) }, '한자 대전 시작')
        : h('p', { class: 'locked-note' }, '캠페인에서 앞 고사를 복원하면 이 고사의 대전에 도전할 수 있다.'),
    );
  }

  function startBattle(bonusHp: boolean) {
    step('s1_battle');
    const partyId = app.save.partyHeroId;
    const hero = partyId && app.save.heroes[partyId] ? getHero(partyId) : null;
    const uses = hero ? skillUsesFor(app.save.heroes[hero.id].level) : 0;
    const state = createBattle(battleQuestions(rng, story!), { bonusHp, skill: hero?.skill ?? null, skillUses: uses });
    runBattle(state, hero ? { name: hero.name, hanja: hero.hanjaName, skillName: hero.skillName } : null);
  }

  function runBattle(initial: BattleState, hero: { name: string; hanja: string; skillName: string } | null) {
    let s = initial;
    const enemyBar = h('i', { style: `width:${s.enemyHp}%` });
    const enemy = h('section', { class: 'enemy' },
      h('div', { class: 'enemy-ghost' }, story!.idiom),
      h('p', { class: 'enemy-name' }, '흩어진 글자의 혼'),
      h('div', { class: 'bar enemy-bar' }, enemyBar),
    );
    const progress = h('span', { class: 'q-progress' });
    const hpBox = h('div', { class: 'hp', 'data-testid': 'hp', role: 'img' });
    const hpLive = h('span', { class: 'sr-only', role: 'status', 'aria-live': 'polite' });
    const skillBtn = h('button', { class: 'skill', 'data-testid': 'skill' });
    const qBox = h('div', { class: 'q-box' });
    const fb = h('div', { class: 'battle-feedback' });
    const comboEl = h('div', { class: 'combo' });

    const heroBar = h('footer', { class: 'hero-bar' }, hpBox, hpLive,
      hero ? h('div', { class: 'hero-chip' }, h('span', { class: 'hero-hanja' }, hero.hanja), h('span', null, hero.name)) : h('div', { class: 'hero-chip empty' }, '출전 인물 없음'),
      hero ? skillBtn : null,
    );

    replace(body, h('div', { class: 'battle' }, h('div', { class: 'battle-top' }, progress, comboEl), enemy, qBox, fb, heroBar));

    const paintStatus = () => {
      enemyBar.style.width = `${s.enemyHp}%`;
      replace(hpBox, ...Array.from({ length: s.maxHp }, (_, k) => h('span', { class: k < s.hp ? 'life on' : 'life off', 'aria-hidden': 'true' }, '命')));
      const hpText = `남은 생명 ${s.hp}/${s.maxHp}`;
      if (hpBox.getAttribute('aria-label') && hpBox.getAttribute('aria-label') !== hpText) hpLive.textContent = hpText;
      hpBox.setAttribute('aria-label', hpText);
      comboEl.textContent = s.combo >= 2 ? `${s.combo} 연속!` : '';
      if (hero) {
        if (s.skill === 'shield') {
          skillBtn.textContent = `${hero.skillName} ${s.skillUses}`;
          skillBtn.disabled = true;
          skillBtn.classList.add('passive');
        } else {
          skillBtn.textContent = `${hero.skillName} ×${s.skillUses}`;
          skillBtn.disabled = !canUseSkill(s);
        }
      }
    };

    const showQuestion = () => {
      const q = current(s)!;
      const view = questionView(q, { removed: s.removed, hint: s.hint }, (choice) => {
        const res = answer(s, choice);
        s = res.state;
        step(`s1_q${s.index}` as FunnelKey);
        view.reveal(choice);
        paintStatus();
        if (res.correct) {
          enemy.classList.remove('hit');
          void enemy.offsetWidth;
          enemy.classList.add('hit');
          replace(fb, h('p', { class: 'good' }, '명중! ', h('span', null, q.explain)));
        } else {
          el.classList.remove('shake');
          void el.offsetWidth;
          el.classList.add('shake');
          replace(fb,
            h('p', { class: 'bad' }, res.blocked ? '방어했다! ' : '피격! ', h('span', null, `정답: ${q.explain}`)),
            s.over ? null : h('button', { class: 'btn', 'data-testid': 'continue', onclick: () => { replace(fb); showQuestion(); } }, '다음 문제'),
          );
        }
        if (s.over) later(finish, res.correct ? 700 : 1400);
        else if (res.correct) later(() => { replace(fb); showQuestion(); }, 750);
      });
      replace(qBox, view.el);
      progress.textContent = `${s.index + 1} / ${s.questions.length}`;
      paintStatus();
    };

    skillBtn.onclick = () => {
      if (!canUseSkill(s)) return;
      s = useSkill(s, rng as Rng);
      showQuestion();
    };

    showQuestion();

    function finish() {
      const st = starsOf(s);
      let save = applyLog(app.save, s.log, app.today);
      save = recordAnswers(save, app.today, s.log.length, s.log.filter((l) => l.correct).length);
      const res = applyClear(save, story!, st);
      save = res.save;
      commit(save);
      if (s.won) step('s1_clear');
      if (res.newHero) step('s1_hero');
      showResult(s, st, res.newHero, res.levelUp);
    }
  }

  function showResult(s: BattleState, st: 0 | 1 | 2 | 3, newHero: boolean, levelUp: boolean) {
    const st0 = story!;
    const hero = getHero(st0.heroId);
    const list = storiesOf(st0.book);
    const next = list[list.findIndex((x) => x.id === st0.id) + 1] as Story | undefined;
    const correctChars = [...new Set(s.log.filter((l) => l.correct && l.cardKey.startsWith('h:')).map((l) => l.cardKey.slice(2)))];
    replace(body,
      h('section', { class: `result card ${s.won ? 'win' : 'lose'}`, 'data-testid': 'result' },
        h('div', { class: `stamp ${s.won ? 'stamp-win' : 'stamp-lose'}`, 'aria-hidden': 'true' }, s.won ? '復元' : '退却'),
        h('h2', null, s.won ? '글자를 되찾았다' : '글자가 다시 흩어졌다'),
        stars(st),
        h('p', { class: 'result-line' }, `정답 ${s.log.filter((l) => l.correct).length} / ${s.questions.length} · 최고 ${s.maxCombo}연속`),
      ),
      s.won && (newHero || levelUp)
        ? h('section', { class: 'hero-card new card', 'data-testid': 'hero-reward' },
          h('p', { class: 'eyebrow' }, newHero ? '인물 합류' : '성급 상승'),
          h('div', { class: 'hero-big' }, hero.hanjaName),
          h('p', null, h('b', null, hero.name), ` · ${hero.title}`),
          h('p', { class: 'skill-desc' }, `${hero.skillName}: ${hero.skillDesc}`),
        )
        : null,
      correctChars.length
        ? h('section', { class: 'card' },
          h('p', { class: 'eyebrow' }, '되찾은 한자'),
          h('div', { class: 'chips' }, ...correctChars.map((c) => h('button', { class: 'chip', onclick: () => openHanjaSheet(c) }, h('b', null, c), ` ${hunEum(getHanja(c))}`))),
        )
        : null,
      h('section', { class: 'card modern' },
        h('p', { class: 'eyebrow' }, '오늘날의 쓰임'),
        h('p', null, st0.modern),
      ),
      s.won ? h('button', { class: 'btn share-btn', 'data-testid': 'share-card', onclick: (e: Event) => shareIdiomCard(st0, e.currentTarget as HTMLButtonElement) }, '성어 카드로 공유하기') : null,
      h('div', { class: 'result-actions' },
        h('button', { class: 'btn', onclick: () => storyRestart() }, s.won ? '다시 하기' : '다시 도전'),
        s.won && next ? h('a', { class: 'btn primary', href: `#story-${next.id}`, 'data-testid': 'next-story' }, '다음 고사') : h('a', { class: 'btn primary', href: `#map-${st0.book}` }, '지도로'),
      ),
    );
  }

  function storyRestart() {
    showOriginal(false);
  }

  return { el, dispose: () => timers.forEach(clearTimeout) };
}
