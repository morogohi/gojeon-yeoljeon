import { artFor } from '../content/art';
import { h } from './dom';

/** 고사 삽화. plain이면 한자 낙관을 숨긴다(장면·퀴즈용). */
export function artEl(storyId: string, opts: { plain?: boolean; caption?: boolean; cls?: string } = {}): HTMLElement | null {
  const art = artFor(storyId);
  if (!art) return null;
  const fig = h('figure', { class: `art${opts.plain ? ' plain' : ''}${opts.cls ? ` ${opts.cls}` : ''}`, 'data-art': storyId });
  const box = h('div', { class: 'art-img' });
  box.innerHTML = art.svg; // 정적 콘텐츠(content/art.ts)만 넣는다
  fig.appendChild(box);
  if (opts.caption) fig.appendChild(h('figcaption', null, art.caption));
  return fig;
}
