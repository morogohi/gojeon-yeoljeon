import { h, replace, stars, topbar } from '../dom';
import { app, commit } from '../../state/store';
import { getStory, storiesOf, ALL_STORIES as STORIES } from '../../content/stories';
import { getHanja, hunEum } from '../../content/hanja';
import { getHero } from '../../content/heroes';
import { glossOf } from '../../content/gloss';
import { EASY, RECAP, termsIn } from '../../content/learn';
import type { Hero, Story } from '../../content/types';
import { createRng } from '../../engine/rng';
import { battleQuestions, type Question } from '../../engine/questions';
import { createBattle, answerAt, useSkill, canUseSkill, current, type BattleState } from '../../engine/battle';
import { isEntitled, isUnlocked, skillUsesFor } from '../../engine/rewards';
import { packOf } from '../../content/packs';
import { abandonSession, hasProgress, isResumable, newSession, sessionLabel, settleBattle, type LastAnswer, type PlaySession } from '../../engine/session';
import { loadIssues } from '../../state/save';
import { questionView } from '../quiz';
import { artEl } from '../art';
import { tappableText, openHanjaSheet } from '../hanjaSheet';
import { speakWithNotice } from '../speech';
import { lessonEl, storyboardEl } from '../learnCards';
import { shareIdiomCard } from '../shareCard';
import { track } from '../../state/track';
import { FIRST_STORY, type FunnelKey } from '../../engine/funnel';
import type { Screen } from '../../state/router';

/** 틀린 한자의 기억 도움: 콘텐츠에 있는 단어(검증된 자료)만 쓴다. 지어낸 자원 풀이는 하지 않는다. */
function memoryTip(q: Question): string | null {
  if (!q.cardKey.startsWith('h:')) return null;
  const c = q.cardKey.slice(2);
  const g = glossOf(c);
  const word = STORIES.flatMap((s) => s.related).find((r) => r.word.includes(c));
  if (word) return `기억 도움: ${word.word}(${word.reading}) — ${word.meaning}`;
  const idiom = STORIES.find((s) => s.idiom.includes(c));
  if (idiom) return `기억 도움: ${idiom.idiom}(${idiom.reading})의 ${c}${g ? ` — ${g.hun} ${g.eum}` : ''}`;
  return null;
}

export function storyScreen(args: string[]): Screen {
  const found = getStory(args[0] ?? '');
  if (!found) {
    return { el: h('main', { class: 'screen' }, topbar('고사', '#home'), h('p', { class: 'empty' }, '찾을 수 없는 고사입니다.')) };
  }
  const story: Story = found;
  const body = h('div', { class: 'story-body' });
  const el = h('main', { class: 'screen story' }, topbar(h('span', { class: 'hanja-title' }, story.idiom), `#map-${story.book}`), body);
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
  const clearTimers = () => { timers.forEach(clearTimeout); timers.length = 0; };
  const playable = isUnlocked(app.save, story);
  const level = app.save.settings.level;
  // 첫 고사에서만 진행 단계를 남긴다 (어디서 멈추는지 보기 위해)
  const step = (key: FunnelKey) => { if (story.id === FIRST_STORY) track(key); };

  // ── 세션: 이 화면의 진행은 모두 app.save.session 에 저장한다 ──
  const S = (): PlaySession => app.save.session!;
  const save = (patch: Partial<PlaySession>) => commit({ ...app.save, session: { ...S(), ...patch, updated: app.today } });
  const startFresh = (phase: PlaySession['phase'] = 'scene') => {
    commit({ ...app.save, session: newSession(story.id, app.seed(), app.today, phase) });
  };

  const notice = loadIssues.droppedSession
    ? h('p', { class: 'session-notice', role: 'status', 'data-testid': 'session-notice' }, '저장된 진행 정보를 읽지 못해 이 고사는 처음부터 시작해요. 별·인물·학습 기록은 그대로예요.')
    : null;
  loadIssues.droppedSession = false;

  const idiomIntro = () => h('section', { class: 'idiom-intro card', 'data-testid': 'idiom-intro' },
    h('p', { class: 'intro-idiom' }, h('span', { class: 'hanja-sm' }, story.idiom), ' ', h('b', null, story.reading)),
    h('p', { class: 'intro-easy' }, h('span', { class: 'tag' }, '쉬운 뜻'), ' ', EASY[story.id] ?? story.meaning),
    story.era ? h('p', { class: 'intro-era', 'data-testid': 'story-era' }, `${story.era} · ${story.source}`) : null,
    level === 'new'
      ? h('p', { class: 'intro-chars' }, ...[...story.idiom].map((c) => h('span', null, `${c} ${hunEum(getHanja(c))}`)))
      : null,
  );

  // ── 진입: 이어 하기 / 다른 고사 진행 중 / 새로 시작 ──
  function enter() {
    if (!playable) { showOriginal(); return; }
    const sess = app.save.session;
    if (sess && sess.storyId === story.id) {
      if (sess.phase === 'result') { showResult(); return; } // 결과 화면에서 새로고침
      if (isResumable(sess)) { showResumePrompt(sess); return; }
      route();
      return;
    }
    if (sess && isResumable(sess)) { showOtherPrompt(sess); return; }
    startFresh();
    route();
  }

  /** 세션 단계에 맞는 화면 */
  function route() {
    const s = S();
    if (s.phase === 'scene') showScene(s.scene);
    else if (s.phase === 'original') showOriginal();
    else if (s.phase === 'battle') runBattle();
    else showResult();
  }

  function showResumePrompt(sess: PlaySession) {
    const answered = sess.phase === 'battle' && (sess.battle?.log.length ?? 0) > 0;
    replace(body, notice,
      h('section', { class: 'card resume-card', 'data-testid': 'resume-prompt', role: 'region', 'aria-label': '이어 하기' },
        h('p', { class: 'eyebrow' }, '멈춘 곳이 있어요'),
        h('p', { class: 'resume-where', 'data-testid': 'resume-where' }, `${story.idiom} ${story.reading} · ${sessionLabel(sess, story)}`),
        h('div', { class: 'result-actions' },
          h('button', { class: 'btn primary', 'data-testid': 'resume-continue', onclick: () => route() }, '이어 하기'),
          h('button', { class: 'btn', 'data-testid': 'resume-restart', onclick: () => {
            commit(abandonSession(app.save, app.today));
            startFresh();
            route();
          } }, '처음부터 보기'),
        ),
        answered ? h('p', { class: 'chip-note' }, '처음부터 하면 지금까지 푼 문제는 학습 기록에 남아요. 별과 인물은 대전을 끝까지 마쳐야 받아요.') : null,
      ),
    );
  }

  function showOtherPrompt(sess: PlaySession) {
    const other = getStory(sess.storyId)!;
    replace(body, notice,
      h('section', { class: 'card resume-card', 'data-testid': 'other-session' },
        h('p', { class: 'eyebrow' }, '하던 고사가 있어요'),
        h('p', { class: 'resume-where' }, `${other.idiom} ${other.reading} · ${sessionLabel(sess, other)}`),
        h('p', { class: 'chip-note' }, '고사는 한 번에 하나씩 진행돼요. 이 고사를 시작하면 하던 고사는 그만두고, 이미 푼 문제만 학습 기록에 남아요.'),
        h('div', { class: 'result-actions' },
          h('a', { class: 'btn primary', href: `#story-${other.id}`, 'data-testid': 'other-resume' }, '하던 고사 이어 하기'),
          h('button', { class: 'btn', 'data-testid': 'other-abandon', onclick: () => {
            commit(abandonSession(app.save, app.today));
            startFresh();
            route();
          } }, '이 고사 시작하기'),
        ),
      ),
    );
  }

  // ── 이야기 장면 ──
  function showScene(i: number) {
    if (i === 0) step('s1_scene');
    if (S().scene !== i || S().phase !== 'scene') save({ phase: 'scene', scene: i });
    const scene = story.scenes[i];
    const total = story.scenes.length;
    const dots = h('div', { class: 'dots', 'aria-hidden': 'true' }, ...story.scenes.map((_, k) => h('i', { class: k <= i ? 'on' : '' })));
    const terms = termsIn(scene.text);
    const panel = h('section', { class: 'scene card' },
      artEl(story.id, { plain: true, cls: `scene-art step-${Math.min(i, 3)}` }),
      h('p', { class: 'eyebrow' }, story.source, ' · ', h('span', { 'data-testid': 'scene-no' }, `장면 ${i + 1} / ${total}`)),
      h('p', { class: 'scene-text' }, scene.text),
      terms.length
        ? h('dl', { class: 'terms', 'data-testid': 'terms', 'aria-label': '어려운 말 풀이' }, ...terms.flatMap((t) => [h('dt', null, t.word), h('dd', null, t.desc)]))
        : null,
    );
    const recap = i === 0 && RECAP[story.id] ? h('p', { class: 'recap', 'data-testid': 'recap' }, RECAP[story.id]) : null;
    const prev = i > 0 ? h('button', { class: 'btn', 'data-testid': 'prev', onclick: () => showScene(i - 1) }, '이전 장면') : null;
    if (!scene.choice) {
      replace(body, notice, idiomIntro(), recap, dots, panel,
        h('div', { class: 'scene-nav' }, prev, h('button', { class: 'btn primary', 'data-testid': 'next', onclick: () => showScene(i + 1) }, '다음 장면')));
      return;
    }
    const choice = scene.choice;
    const fb = h('div', { class: 'choice-feedback', 'aria-live': 'polite' });
    const opts = choice.options.map((o, k) =>
      h('button', {
        class: 'choice', 'data-correct': app.e2e && o.correct ? '1' : undefined,
        onclick: () => {
          if (S().picked !== null) return; // 한 번만 고른다
          step('s1_choice');
          save({ picked: k, bonusHp: o.correct });
          paintChoice();
        },
      }, o.label));
    const paintChoice = () => {
      const picked = S().picked;
      if (picked === null) return;
      const o = choice.options[picked];
      opts.forEach((b, k) => {
        b.disabled = true;
        const right = choice.options[k].correct;
        if (right) { b.classList.add('right'); b.prepend(h('span', { class: 'mark' }, '✓ 실제 역사 ')); }
        else if (k === picked) { b.classList.add('wrong'); b.prepend(h('span', { class: 'mark' }, '✗ 내 선택 ')); }
      });
      replace(fb,
        h('p', { class: o.correct ? 'good' : 'bad' }, o.correct ? '✓ 맞아요. 실제 역사도 그랬어요. 대전에서 생명 +1' : '✗ 실제 역사는 달랐어요.'),
        h('p', null, o.feedback),
        h('button', { class: 'btn primary', 'data-testid': 'to-original', onclick: () => { save({ phase: 'original' }); showOriginal(); } }, '원문 펼치기'),
      );
    };
    replace(body, notice, idiomIntro(), recap, dots, panel, h('h2', { class: 'choice-prompt' }, choice.prompt), h('div', { class: 'choices' }, opts), fb,
      h('div', { class: 'scene-nav' }, prev));
    paintChoice();
  }

  // ── 원문 ──
  function showOriginal() {
    const s = story;
    if (playable) step('s1_original');
    const sound = h('p', { class: 'listen-status', role: 'status', 'data-testid': 'listen-status' });
    replace(body, notice,
      storyboardEl(s),
      h('section', { class: 'original card' },
        h('p', { class: 'eyebrow' }, `원문 ${s.source}`),
        tappableText(s.original.text, 'original-text'),
        h('p', { class: 'original-reading', 'data-testid': 'original-reading' }, s.original.reading),
        h('p', { class: 'original-tr' }, h('span', { class: 'tag' }, '원문 번역'), ' ', s.original.translation),
        h('div', { class: 'listen' },
          h('button', { class: 'btn small', 'data-testid': 'listen-reading', onclick: () => speakWithNotice(s.original.reading, sound) }, '독음 듣기'),
          h('button', { class: 'btn small', onclick: () => speakWithNotice(s.original.translation, sound) }, '풀이 듣기'),
          h('span', { class: 'listen-hint' }, '한자를 누르면 뜻과 소리가 나온다'),
        ),
        sound,
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
        h('p', { class: 'idiom-easy', 'data-testid': 'idiom-easy' }, h('span', { class: 'tag' }, '쉬운 풀이'), ' ', EASY[s.id] ?? s.meaning),
        h('details', { class: 'more', 'data-testid': 'more', open: level === 'deep' ? true : undefined },
          h('summary', null, '더 알아보기 (원뜻과 역사)'),
          h('p', { class: 'idiom-meaning' }, h('span', { class: 'tag' }, '원뜻'), ' ', s.meaning),
          h('p', null, h('span', { class: 'tag' }, '글자 풀이'), ' ', [...s.idiom].map((c) => `${c}(${hunEum(getHanja(c))})`).join(' · ')),
          h('p', null, h('span', { class: 'tag' }, '출전'), ' ', s.source),
        ),
      ),
      h('section', { class: 'related card' },
        h('p', { class: 'eyebrow' }, '같은 한자가 든 단어'),
        h('ul', null, ...s.related.map((r) => h('li', null, h('b', { class: 'hanja-sm' }, r.word), ` ${r.reading} — ${r.meaning}`))),
      ),
      playable
        ? h('button', { class: 'btn primary big', 'data-testid': 'start-battle', onclick: startBattle }, '한자 대전 시작')
        : !isEntitled(app.save, s)
          ? h('div', { class: 'locked-note', 'data-testid': 'pack-locked' },
            h('p', null, `이 고사는 확장팩 「${packOf(s.id)?.title ?? ''}」에 들어 있다. 이야기 그림과 원문은 미리 볼 수 있고, 대전은 확장팩에서 열린다.`),
            h('a', { class: 'btn primary', href: `#pack-${s.pack}`, 'data-testid': 'to-pack' }, '확장팩 보기'))
          : h('p', { class: 'locked-note' }, '캠페인에서 앞 고사를 복원하면 이 고사의 대전에 도전할 수 있다.'),
    );
  }

  function startBattle() {
    step('s1_battle');
    const partyId = app.save.partyHeroId;
    const hero = partyId && app.save.heroes[partyId] ? getHero(partyId) : null;
    const uses = hero ? skillUsesFor(app.save.heroes[hero.id].level) : 0;
    const sess = S();
    // 문제는 여기서 한 번만 뽑아 저장한다(새로고침해도 같은 문제·순서)
    const battle = createBattle(battleQuestions(createRng(sess.seed), story), { bonusHp: sess.bonusHp, skill: hero?.skill ?? null, skillUses: uses });
    save({ phase: 'battle', battle, last: null, heroId: hero?.id ?? null });
    runBattle();
  }

  // ── 한자 대전 ──
  function runBattle() {
    const sess = S();
    let s: BattleState = sess.battle!;
    const hero: Hero | null = sess.heroId ? getHero(sess.heroId) : null;
    const enemyBar = h('i', { style: `width:${s.enemyHp}%` });
    const enemy = h('section', { class: 'enemy' },
      h('div', { class: 'enemy-ghost' }, story.idiom),
      h('p', { class: 'enemy-name' }, '흩어진 글자의 혼'),
      h('div', { class: 'bar enemy-bar' }, enemyBar),
    );
    const progress = h('span', { class: 'q-progress' });
    const hpBox = h('div', { class: 'hp', 'data-testid': 'hp', role: 'img' });
    const hpLive = h('span', { class: 'sr-only', role: 'status', 'aria-live': 'polite' });
    const skillBtn = h('button', { class: 'skill', 'data-testid': 'skill' });
    const qBox = h('div', { class: 'q-box' });
    const fb = h('div', { class: 'battle-feedback', 'aria-live': 'polite' });
    const comboEl = h('div', { class: 'combo' });

    const heroBar = h('footer', { class: 'hero-bar' }, hpBox, hpLive,
      hero ? h('div', { class: 'hero-chip' }, h('span', { class: 'hero-hanja' }, hero.hanjaName), h('span', null, hero.name)) : h('div', { class: 'hero-chip empty' }, '출전 인물 없음'),
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
          skillBtn.setAttribute('aria-label', `${hero.skillName}: 남은 방어 ${s.skillUses}번`);
        } else {
          skillBtn.textContent = `${hero.skillName} ×${s.skillUses}`;
          skillBtn.disabled = !canUseSkill(s);
        }
      }
    };

    /** 학습 결과(맞음·틀림)와 게임 효과(생명·방어)를 따로 알려 준다 */
    const feedback = (q: Question, last: LastAnswer) => {
      const game = last.correct ? null
        : last.blocked
          ? `${hero ? `${hero.name}의 ${hero.skillName}` : '방어'} 덕분에 생명은 줄지 않았어요. 남은 방어 ${s.skillUses}번 · 이 문제는 틀린 문제로 기록돼요.`
          : `생명이 하나 줄었어요. 남은 생명 ${s.hp}/${s.maxHp}`;
      const tip = last.correct ? null : memoryTip(q);
      return [
        last.correct
          ? h('p', { class: 'good', 'data-testid': 'answer-result' }, '✓ 맞았어요! ', h('span', null, q.explain))
          : h('p', { class: 'bad', 'data-testid': 'answer-result' }, '✗ 조금 달라요. ', h('span', null, `정답: ${q.explain}`)),
        game ? h('p', { class: 'effect', 'data-testid': 'game-effect' }, game) : null,
        tip ? h('p', { class: 'tip', 'data-testid': 'memory-tip' }, tip) : null,
      ];
    };

    const toNext = () => {
      clearTimers();
      replace(fb);
      if (S().last) save({ last: null });
      if (S().phase === 'result') showResult();
      else showQuestion();
    };

    const showQuestion = () => {
      const qIndex = s.index;
      const q = current(s)!;
      const view = questionView(q, { removed: s.removed, hint: s.hint }, (choice) => {
        const res = answerAt(s, qIndex, choice);
        if (res.ignored) return; // 연속 클릭·이미 채점한 문제
        s = res.state;
        const last: LastAnswer = { q: qIndex, choice, correct: res.correct, blocked: res.blocked };
        if (s.over) {
          // 마지막 답과 보상 반영을 한 번에 저장한다(새로고침해도 중복 반영 없음)
          const settled = settleBattle({ ...app.save, session: { ...S(), battle: s, last: null } }, story, app.today);
          commit(settled.save);
          if (s.won) step('s1_clear');
          if (settled.result.newHero) step('s1_hero');
        } else {
          save({ battle: s, last });
        }
        step(`s1_q${s.index}` as FunnelKey);
        view.reveal(choice);
        paintStatus();
        if (res.correct) {
          enemy.classList.remove('hit');
          void enemy.offsetWidth;
          enemy.classList.add('hit');
        } else {
          el.classList.remove('shake');
          void el.offsetWidth;
          el.classList.add('shake');
        }
        replace(fb, ...feedback(q, last),
          s.over || res.correct ? null : h('button', { class: 'btn', 'data-testid': 'continue', onclick: toNext }, '다음 문제'));
        if (s.over) later(toNext, res.correct ? 700 : 1600);
        else if (res.correct) later(toNext, 750);
      });
      replace(qBox, view.el);
      progress.textContent = `${s.index + 1} / ${s.questions.length}`;
      paintStatus();
    };

    /** 답한 뒤 새로고침: 방금 답한 문제와 설명을 그대로 보여 주고 '다음 문제'로 이어 간다 */
    const showAnswered = (last: LastAnswer) => {
      const q = s.questions[last.q];
      const view = questionView(q, {}, () => undefined);
      view.reveal(last.choice);
      replace(qBox, view.el);
      progress.textContent = `${last.q + 1} / ${s.questions.length}`;
      paintStatus();
      replace(fb, ...feedback(q, last), h('button', { class: 'btn', 'data-testid': 'continue', onclick: toNext }, '다음 문제'));
    };

    skillBtn.onclick = () => {
      if (!canUseSkill(s) || S().last) return;
      s = useSkill(s, createRng((S().seed ^ ((s.index + 1) * 2654435761)) >>> 0));
      save({ battle: s });
      showQuestion();
    };

    if (sess.last) showAnswered(sess.last);
    else showQuestion();
  }

  // ── 결과(보상은 settleBattle 에서 한 번만 반영됨) ──
  function showResult() {
    const sess = S();
    const s = sess.battle!;
    const r = sess.result!;
    const hero = getHero(story.heroId);
    const list = storiesOf(story.book);
    const next = list[list.findIndex((x) => x.id === story.id) + 1] as Story | undefined;
    // 복습 카드와 같은 기준: 이번 판에서 한 번이라도 틀린 글자는 '다시 볼 글자'
    const met = [...new Set(s.log.filter((l) => l.cardKey.startsWith('h:')).map((l) => l.cardKey.slice(2)))];
    const missed = new Set(s.log.filter((l) => !l.correct && l.cardKey.startsWith('h:')).map((l) => l.cardKey.slice(2)));
    const learnedNow = met.filter((c) => !missed.has(c));
    replace(body,
      h('section', { class: `result card ${s.won ? 'win' : 'lose'}`, 'data-testid': 'result' },
        h('div', { class: `stamp ${s.won ? 'stamp-win' : 'stamp-lose'}`, 'aria-hidden': 'true' }, s.won ? '復元' : '退却'),
        h('h2', null, s.won ? '글자를 되찾았다' : '글자가 다시 흩어졌다'),
        stars(r.stars),
        h('p', { class: 'result-line' }, `정답 ${s.log.filter((l) => l.correct).length} / ${s.questions.length} · 최고 ${s.maxCombo}연속`),
      ),
      s.won && (r.newHero || r.levelUp)
        ? h('section', { class: 'hero-card new card', 'data-testid': 'hero-reward' },
          h('p', { class: 'eyebrow' }, r.newHero ? '인물 합류' : '성급 상승'),
          h('div', { class: 'hero-big' }, hero.hanjaName),
          h('p', null, h('b', null, hero.name), ` · ${hero.title}`),
          h('p', { class: 'skill-desc' }, `${hero.skillName}: ${hero.skillDesc}`),
        )
        : null,
      met.length
        ? h('section', { class: 'card', 'data-testid': 'met-hanja' },
          h('p', { class: 'eyebrow' }, `이번 고사에서 만난 한자 ${met.length}자 · 기억 ${learnedNow.length}${missed.size ? ` · 다시 볼 글자 ${missed.size}` : ''}`),
          h('div', { class: 'chips' }, ...met.map((c) => h('button', { class: `chip${missed.has(c) ? ' missed' : ''}`, onclick: () => openHanjaSheet(c) },
            h('b', null, c), ` ${hunEum(getHanja(c))}`, missed.has(c) ? h('em', null, ' 다시 보기') : null))),
          missed.size ? h('p', { class: 'chip-note' }, '틀린 글자는 내일 복습에 다시 나오고, 맞히면 기억하는 한자로 돌아간다. 만난 한자 수는 줄지 않는다.') : null,
        )
        : null,
      lessonEl(story) ?? h('section', { class: 'card modern' },
        h('p', { class: 'eyebrow' }, '오늘날의 쓰임'),
        h('p', null, story.modern),
      ),
      s.won ? h('button', { class: 'btn share-btn', 'data-testid': 'share-card', onclick: (e: Event) => shareIdiomCard(story, e.currentTarget as HTMLButtonElement) }, '성어 카드로 공유하기') : null,
      h('div', { class: 'result-actions' },
        h('button', { class: 'btn', 'data-testid': 'replay', onclick: () => { startFresh('original'); showOriginal(); } }, s.won ? '다시 하기' : '다시 도전'),
        s.won && next ? h('a', { class: 'btn primary', href: `#story-${next.id}`, 'data-testid': 'next-story' }, '다음 고사') : h('a', { class: 'btn primary', href: `#map-${story.book}` }, '지도로'),
      ),
    );
  }

  enter();

  return {
    el,
    dispose: () => {
      clearTimers();
      // 결과를 본 뒤 다른 화면으로 가면 끝난 세션을 정리한다(새로고침은 dispose 를 부르지 않아 결과가 남는다)
      const sess = app.save.session;
      if (sess && sess.storyId === story.id && (sess.phase === 'result' || !hasProgress(sess))) commit({ ...app.save, session: null });
    },
  };
}
