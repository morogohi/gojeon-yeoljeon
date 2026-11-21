import { STORIES, ALL_STORIES } from '../src/content/stories';
import { HANJA, getHanja, READING_EXCEPTIONS } from '../src/content/hanja';
import { ALL_HEROES as HEROES } from '../src/content/heroes';

describe('C-01 고사 기본 형식', () => {
  it('C-01 12고사, ID 중복 없음, 성어 4자, 독음 4글자', () => {
    expect(STORIES).toHaveLength(12);
    expect(new Set(STORIES.map((s) => s.id)).size).toBe(12);
    for (const s of STORIES) {
      expect([...s.idiom], s.id).toHaveLength(4);
      expect([...s.reading], s.id).toHaveLength(4);
      expect(s.meaning.length).toBeGreaterThan(5);
      expect(s.source).toMatch(/^『(사기|논어)』/);
      expect(s.related.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('C-02 고사 ↔ 한자 사전', () => {
  it('C-02 성어의 모든 한자가 사전에 있고, 음을 이으면 독음과 같다', () => {
    for (const s of STORIES) {
      const eum = [...s.idiom].map((c, i) => READING_EXCEPTIONS[`${s.idiom}:${i}`] ?? getHanja(c).eum).join('');
      expect(eum, s.id).toBe(s.reading);
    }
  });

  it('C-03 사전에 중복 한자·중복 훈음이 없고, 쓰이지 않는 한자도 없다', () => {
    expect(new Set(HANJA.map((h) => h.char)).size).toBe(HANJA.length);
    expect(new Set(HANJA.map((h) => `${h.hun} ${h.eum}`)).size).toBe(HANJA.length);
    const used = new Set(STORIES.flatMap((s) => [...s.idiom]));
    expect([...used].sort()).toEqual(HANJA.map((h) => h.char).sort());
  });
});

describe('C-03 인물', () => {
  it('C-04 모든 heroId가 존재하고 스킬이 유효하다', () => {
    const ids = new Set(HEROES.map((h) => h.id));
    for (const s of ALL_STORIES) expect(ids.has(s.heroId), s.id).toBe(true);
    for (const h of HEROES) expect(['shield', 'heal', 'reveal', 'insight']).toContain(h.skill);
  });
});

describe('C-04 장면·원문', () => {
  it('C-05 장면 3~4개, 마지막 장면만 선택지, 정답 1개', () => {
    for (const s of ALL_STORIES) {
      expect(s.scenes.length, s.id).toBeGreaterThanOrEqual(3);
      expect(s.scenes.length, s.id).toBeLessThanOrEqual(4);
      s.scenes.slice(0, -1).forEach((sc) => expect(sc.choice, s.id).toBeUndefined());
      const choice = s.scenes.at(-1)!.choice!;
      expect(choice.options.filter((o) => o.correct), s.id).toHaveLength(1);
    }
  });

  it('C-06 원문에 성어의 한자가 하나 이상 들어 있다', () => {
    for (const s of ALL_STORIES) {
      const hit = [...s.idiom].filter((c) => c !== '之' && s.original.text.includes(c));
      expect(hit.length, s.id).toBeGreaterThanOrEqual(1);
    }
  });
});

import { ART } from '../src/content/art';
describe('C-05 삽화', () => {
  it('C-07 모든 고사에 그림과 설명이 있고, 성어의 한자가 그림·설명에 모두 나온다', () => {
    expect(Object.keys(ART).sort()).toEqual(ALL_STORIES.map((s) => s.id).sort());
    for (const s of ALL_STORIES) {
      const a = ART[s.id];
      expect(a.svg.startsWith('<svg'), s.id).toBe(true);
      expect(a.svg).not.toMatch(/https?:\/\/(?!www\.w3\.org)/); // 외부 리소스 없음
      for (const c of new Set([...s.idiom].filter((c) => c !== '之'))) {
        expect(a.svg, `${s.id} ${c}`).toContain(c);
        expect(a.caption, `${s.id} ${c}`).toContain(c);
      }
    }
  });
});

import { glossOf, isHan } from '../src/content/gloss';
describe('C-06 원문 한자 사전·독음', () => {
  it('C-08 원문과 관련 단어의 모든 한자에 훈음이 있다', () => {
    for (const s of ALL_STORIES) {
      for (const c of [...s.original.text, ...s.related.flatMap((r) => [...r.word])]) {
        if (isHan(c)) expect(glossOf(c), `${s.id} ${c}`).toBeDefined();
      }
    }
  });
  it('C-09 독음 글자 수가 원문 한자 수와 같다', () => {
    for (const s of ALL_STORIES) {
      const han = [...s.original.text].filter(isHan).length;
      const syl = [...s.original.reading].filter((c) => /[가-힣]/.test(c)).length;
      expect(syl, s.id).toBe(han);
    }
  });
  it('C-10 독음의 각 음절이 사전의 음과 같거나, 두음법칙·이독(異讀)으로 설명된다', () => {
    const variants: Record<string, string[]> = { 류: ['유'], 량: ['양'], 립: ['입'], 견: ['현'], 래: ['내'], 령: ['영'], 록: ['녹'], 칙: ['즉'], 녕: ['영'], 려: ['여'], 년: ['연'], 불: ['부'], 로: ['노'] }; // 두음법칙(寧→영, 呂→여, 年→연), 不은 ㄷ·ㅈ 앞에서 ‘부’
    for (const s of ALL_STORIES) {
      const han = [...s.original.text].filter(isHan);
      const syl = [...s.original.reading].filter((c) => /[가-힣]/.test(c));
      han.forEach((c, i) => {
        const e = glossOf(c)!.eum;
        expect([e, ...(variants[e] ?? [])], `${s.id} ${c}`).toContain(syl[i]);
      });
    }
  });
});
