// 확장팩 「사기의 명장들」: 콘텐츠 형식, 보유권(체험·구매), 지표, 저장
import { STORIES, ALL_STORIES, getStory } from '../src/content/stories';
import { HANJA, PACK_HANJA, getHanja } from '../src/content/hanja';
import { glossOf, isHan } from '../src/content/gloss';
import { ALL_HEROES } from '../src/content/heroes';
import { PACKS, getPack, packOf } from '../src/content/packs';
import { GENERALS_STORIES } from '../src/content/pack-generals';
import { defaultSave, exportCode, importCode, loadSave, persistSave, SAVE_KEY, type KV, type SaveData } from '../src/state/save';
import { hanjaStats, isEntitled, isUnlocked, unlockedStories, applyClear } from '../src/engine/rewards';
import { battleQuestions, reviewQuestion } from '../src/engine/questions';
import { createRng } from '../src/engine/rng';

const memKV = (): KV & { map: Map<string, string> } => {
  const map = new Map<string, string>();
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) };
};
const mj = (id: string) => getStory(id)!;
const owner = (): SaveData => ({ ...defaultSave(), owned: ['pack-generals'] });

describe('K 확장팩 콘텐츠', () => {
  it('K-01 4편, 무료 12편과 ID가 겹치지 않고 무료 목록(STORIES)에는 들어가지 않는다', () => {
    expect(GENERALS_STORIES).toHaveLength(4);
    expect(STORIES).toHaveLength(12);
    expect(ALL_STORIES).toHaveLength(20); // 무료 12 + 확장팩 2종 × 4
    expect(new Set(ALL_STORIES.map((s) => s.id)).size).toBe(20);
    for (const s of GENERALS_STORIES) {
      expect(s.pack).toBe('pack-generals');
      expect(s.book).toBe('myeongjang');
      expect(s.era, s.id).toBeTruthy();
      expect(packOf(s.id)?.id).toBe('pack-generals');
    }
  });

  it('K-02 성어 한자 15자는 무료 44자와 겹치지 않고(之 제외) 모두 사전·풀이에 있으며 음을 이으면 독음이 된다', () => {
    const free = new Set(HANJA.map((h) => h.char));
    const pack = PACK_HANJA['pack-generals'];
    expect(pack).toHaveLength(15);
    for (const h of pack) expect(free.has(h.char), h.char).toBe(false);
    const used = new Set(GENERALS_STORIES.flatMap((s) => [...s.idiom]));
    expect([...used].filter((c) => !free.has(c)).sort()).toEqual(pack.map((h) => h.char).sort());
    for (const s of GENERALS_STORIES) {
      expect([...s.idiom].map((c) => getHanja(c).eum).join(''), s.id).toBe(s.reading);
      for (const c of [...s.original.text, ...s.related.flatMap((r) => [...r.word])].filter(isHan)) expect(glossOf(c), `${s.id} ${c}`).toBeDefined();
    }
  });

  it('K-03 새 인물 4명, 상품 정의(스토어 상품 ID·체험 고사)가 올바르다', () => {
    const ids = new Set(ALL_HEROES.map((h) => h.id));
    for (const s of GENERALS_STORIES) expect(ids.has(s.heroId), s.id).toBe(true);
    expect(new Set(GENERALS_STORIES.map((s) => s.heroId)).size).toBe(4);
    const p = getPack('pack-generals')!;
    expect(p.productId).toMatch(/^[a-z0-9.]+$/);
    expect(p.trialIds).toEqual(['mj-01']);
    expect(PACKS.map((x) => x.id)).toEqual(['pack-generals', 'pack-strategists']);
    expect(new Set(PACKS.map((x) => x.productId)).size).toBe(PACKS.length);
  });

  it('K-04 확장팩 고사도 대전 8문제·복습 문제가 만들어진다', () => {
    for (const s of GENERALS_STORIES) {
      const qs = battleQuestions(createRng(1), s);
      expect(qs).toHaveLength(8);
      for (const q of qs) expect(q.options[q.answer], s.id).toBeTruthy();
      expect(reviewQuestion(createRng(2), `i:${s.id}`).cardKey).toBe(`i:${s.id}`);
      expect(reviewQuestion(createRng(3), `h:${s.idiom[0]}`).options).toHaveLength(4);
    }
  });
});

describe('K 확장팩 2 「전국시대의 책사들」', () => {
  const cs = ALL_STORIES.filter((s) => s.pack === 'pack-strategists');
  it('K-10 4편, 첫 고사 체험, 성어 한자는 무료 44자 밖(先은 확장팩 1과 겹침)이며 사전·풀이·독음이 맞다', () => {
    expect(cs.map((s) => s.id)).toEqual(['cs-01', 'cs-02', 'cs-03', 'cs-04']);
    expect(getPack('pack-strategists')!.trialIds).toEqual(['cs-01']);
    const free = new Set(HANJA.map((h) => h.char));
    const pack = PACK_HANJA['pack-strategists'];
    expect(pack).toHaveLength(12);
    for (const h of pack) expect(free.has(h.char), h.char).toBe(false);
    for (const s of cs) {
      expect([...s.idiom].map((c) => getHanja(c).eum).join(''), s.id).toBe(s.reading);
      expect(new Set(cs.map((x) => x.heroId)).size).toBe(4);
      for (const c of [...s.original.text, ...s.related.flatMap((r) => [...r.word])].filter(isHan)) expect(glossOf(c), `${s.id} ${c}`).toBeDefined();
    }
  });
  it('K-11 두 팩을 모두 가지면 겹치는 글자는 한 번만 센다(44 + 15 + 11 = 70자)', () => {
    expect(hanjaStats({ ...defaultSave(), owned: ['pack-strategists'] }).total).toBe(56);
    expect(hanjaStats({ ...defaultSave(), owned: ['pack-generals', 'pack-strategists'] }).total).toBe(70);
  });
  it('K-12 팩마다 보유권이 따로다: 1팩만 사도 2팩은 체험만 열린다', () => {
    const s = applyClear({ ...defaultSave(), owned: ['pack-generals'] }, getStory('cs-01')!, 3).save;
    expect(isUnlocked(s, getStory('cs-01')!)).toBe(true);
    expect(isUnlocked(s, getStory('cs-02')!)).toBe(false);
    expect(isUnlocked({ ...s, owned: ['pack-generals', 'pack-strategists'] }, getStory('cs-02')!)).toBe(true);
  });
});

describe('K 보유권', () => {
  it('K-05 구매 전: 체험 고사(mj-01)만 열리고, 체험을 깨도 2편부터는 잠겨 있다', () => {
    const s = defaultSave();
    expect(isUnlocked(s, mj('mj-01'))).toBe(true);
    expect(isEntitled(s, mj('mj-02'))).toBe(false);
    const cleared = applyClear(s, mj('mj-01'), 3).save;
    expect(isUnlocked(cleared, mj('mj-02'))).toBe(false);
    expect(unlockedStories(cleared).map((x) => x.id)).not.toContain('mj-02');
  });

  it('K-06 구매 후: 앞 고사를 복원하면 차례로 열린다', () => {
    let s = owner();
    expect(isUnlocked(s, mj('mj-02'))).toBe(false); // 1편을 아직 안 깸
    s = applyClear(s, mj('mj-01'), 2).save;
    expect(isUnlocked(s, mj('mj-02'))).toBe(true);
    expect(isUnlocked(s, mj('mj-03'))).toBe(false);
  });

  it('K-07 서고 지표: 팩이 없으면 44자, 팩이 있으면 59자', () => {
    expect(hanjaStats(defaultSave()).total).toBe(44);
    expect(hanjaStats(owner()).total).toBe(59);
  });

  it('K-08 저장: 보유 목록은 아는 팩만 남기고, 예전 세이브(owned 없음)는 빈 목록', () => {
    const kv = memKV();
    persistSave(kv, { ...owner(), owned: ['pack-generals', 'pack-unknown'] } as SaveData);
    expect(loadSave(kv).owned).toEqual(['pack-generals']);
    const old = { ...defaultSave() } as Partial<SaveData>;
    delete old.owned;
    kv.map.set(SAVE_KEY, JSON.stringify(old));
    expect(loadSave(kv).owned).toEqual([]);
  });

  it('K-09 백업 코드로는 구매를 옮기지 않는다(새 기기에서는 구매 복원)', () => {
    const s = applyClear(owner(), mj('mj-01'), 3).save;
    const moved = importCode(exportCode(s))!;
    expect(moved.owned).toEqual([]);
    expect(moved.stars['mj-01']).toBe(3); // 학습 기록은 그대로 옮긴다
  });
});
