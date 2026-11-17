// v0.9: 그림으로 보는 유래(네 컷)와 기억 노트(오늘날의 비유·교훈·가르침)
import { STORIES } from '../src/content/stories';
import { STORYBOARD, storyboardOf } from '../src/content/storyboard';
import { LESSON } from '../src/content/lesson';

describe('W 유래 그림과 기억 노트', () => {
  it('W-01 12편 모두 네 컷 그림과 쉬운 설명이 있고, 그림은 외부 자원 없는 SVG', () => {
    expect(Object.keys(STORYBOARD).sort()).toEqual(STORIES.map((s) => s.id).sort());
    for (const s of STORIES) {
      const panels = storyboardOf(s.id);
      expect(panels, s.id).toHaveLength(4);
      for (const p of panels) {
        expect(p.caption.length, s.id).toBeGreaterThan(15);
        expect(p.svg.startsWith('<svg')).toBe(true);
        expect(p.svg.endsWith('</svg>')).toBe(true);
        expect(p.svg).not.toMatch(/href=|<script|<image|url\(/i);
        expect(p.svg).not.toMatch(/NaN|undefined/);
      }
    }
  });

  it('W-02 기억 노트: 12편 모두 기억 고리·오늘날 예시 3개(학교·가정·사회)·교훈·가르침·생각해 보기', () => {
    expect(Object.keys(LESSON).sort()).toEqual(STORIES.map((s) => s.id).sort());
    for (const s of STORIES) {
      const l = LESSON[s.id];
      expect(l.examples.map((e) => e.where), s.id).toEqual(['학교', '가정', '사회']);
      for (const e of l.examples) expect(e.text.length, s.id).toBeGreaterThan(15);
      for (const t of [l.hook, l.lesson, l.teaching, l.think]) expect(t.length, s.id).toBeGreaterThan(15);
      expect(l.lesson.length + l.teaching.length, s.id).toBeGreaterThan(150); // 자세한 설명
      // 예시는 그 성어 자체를 다룬다(다른 성어 이름을 정답처럼 쓰지 않음)
      const others = STORIES.filter((x) => x.id !== s.id).map((x) => x.reading);
      for (const e of l.examples) for (const o of others) expect(e.text, `${s.id} → ${o}`).not.toContain(o);
    }
  });
});
