import { HANJA, hunEum } from '../content/hanja';
import { glossOf } from '../content/gloss';
import { STORIES, ALL_STORIES } from '../content/stories';
import { usageOf, type UsageItem } from '../content/learn';
import type { Story } from '../content/types';
import { type Rng, pickDistinct, shuffle, randInt } from './rng';

export type QKind = 'char2hun' | 'hun2char' | 'blank' | 'meaning' | 'picture' | 'usage' | 'similar';

export interface Question {
  kind: QKind;
  label: string;      // 문제 유형 안내
  prompt: string;     // 큰 글씨 지문
  sub?: string;       // 보조 지문
  options: string[];  // 4개
  answer: number;     // 정답 인덱스
  cardKey: string;    // 'h:璧' | 'i:sagi-01'
  explain: string;    // 오답 시 해설
  art?: string;       // 그림 문제: 삽화의 storyId
}

function withAnswer(rng: Rng, correct: string, wrongs: string[]): { options: string[]; answer: number } {
  const options = shuffle(rng, [correct, ...wrongs]);
  return { options, answer: options.indexOf(correct) };
}

function lookup(char: string) {
  const g = glossOf(char);
  if (!g) throw new Error(`사전에 없는 한자: ${char}`);
  return g;
}

export function charToHun(rng: Rng, char: string): Question {
  const h = lookup(char);
  const correct = hunEum(h);
  const wrongs = pickDistinct(rng, HANJA.map(hunEum), 3, (x) => x === correct);
  return { kind: 'char2hun', label: '이 한자의 훈음은?', prompt: char, ...withAnswer(rng, correct, wrongs), cardKey: `h:${char}`, explain: `${char} = ${correct}` };
}

export function hunToChar(rng: Rng, char: string): Question {
  const h = lookup(char);
  const wrongs = pickDistinct(rng, HANJA.map((x) => x.char), 3, (x) => x === char);
  return { kind: 'hun2char', label: '훈음에 맞는 한자는?', prompt: hunEum(h), ...withAnswer(rng, char, wrongs), cardKey: `h:${char}`, explain: `${hunEum(h)} = ${char}` };
}

export function idiomBlank(rng: Rng, story: Story): Question {
  const chars = [...story.idiom];
  const pos = randInt(rng, chars.length);
  const correct = chars[pos];
  const masked = chars.map((c, i) => (i === pos ? '□' : c)).join('');
  const wrongs = pickDistinct(rng, HANJA.map((x) => x.char), 3, (x) => chars.includes(x));
  return { kind: 'blank', label: '빈칸에 들어갈 한자는?', prompt: masked, sub: story.reading, ...withAnswer(rng, correct, wrongs), cardKey: `i:${story.id}`, explain: `${story.idiom}(${story.reading})` };
}

export function idiomMeaning(rng: Rng, story: Story): Question {
  const correct = story.meaning;
  const wrongs = pickDistinct(rng, STORIES.map((s) => s.meaning), 3, (x) => x === correct);
  return { kind: 'meaning', label: '이 성어의 뜻은?', prompt: story.idiom, sub: story.reading, ...withAnswer(rng, correct, wrongs), cardKey: `i:${story.id}`, explain: `${story.reading}: ${story.meaning}` };
}

export function idiomPicture(rng: Rng, story: Story): Question {
  const label = (x: Story) => `${x.idiom} ${x.reading}`;
  const correct = label(story);
  const wrongs = pickDistinct(rng, STORIES.map(label), 3, (x) => x === correct);
  return { kind: 'picture', label: '이 그림이 나타내는 성어는?', prompt: '', art: story.id, ...withAnswer(rng, correct, wrongs), cardKey: `i:${story.id}`, explain: `${story.reading}: ${story.meaning}` };
}

/** 뜻을 실제로 쓰는 문제(상황 적용·비슷한 뜻). 보기는 성어와 독음, 근거는 콘텐츠(learn.ts)의 explain. */
export function usageQuestion(rng: Rng, item: UsageItem): Question {
  const label = (id: string) => {
    const s = ALL_STORIES.find((x) => x.id === id);
    if (!s) throw new Error(`없는 고사: ${id}`);
    return `${s.idiom} ${s.reading}`;
  };
  const correct = label(item.answer);
  return {
    kind: item.kind, label: item.kind === 'similar' ? '뜻이 비슷한 성어는?' : '이 상황에 어울리는 성어는?', prompt: item.prompt,
    ...withAnswer(rng, correct, item.distractors.map(label)), cardKey: `i:${item.storyId}`, explain: `${correct}: ${item.explain}`,
  };
}

/** 한 판 8문제: 한자→훈음 4, 훈음→한자 2, 성어 빈칸 1, 성어 뜻 1. 성어 문제는 마지막 2개. */
export function battleQuestions(rng: Rng, story: Story): Question[] {
  const chars = [...story.idiom];
  const unique = [...new Set(chars)];
  const charQs = [
    ...chars.map((c) => charToHun(rng, c)),
    ...shuffle(rng, unique).slice(0, 2).map((c) => hunToChar(rng, c)),
  ];
  // 4자가 모두 다르지 않으면 훈음→한자 수가 부족할 수 있으므로 채운다
  while (charQs.length < 6) charQs.push(hunToChar(rng, unique[randInt(rng, unique.length)]));
  return [...shuffle(rng, charQs), idiomBlank(rng, story), idiomMeaning(rng, story)];
}

/** 복습 카드 키 → 문제 1개 */
export function reviewQuestion(rng: Rng, cardKey: string): Question {
  if (cardKey.startsWith('h:')) {
    const c = cardKey.slice(2);
    return rng() < 0.5 ? charToHun(rng, c) : hunToChar(rng, c);
  }
  const story = ALL_STORIES.find((s) => `i:${s.id}` === cardKey);
  if (!story) throw new Error(`없는 카드: ${cardKey}`);
  // 뜻 활용 문제가 있는 고사는 그 문제도 복습에 섞는다
  const usage = usageOf(story.id);
  const n = 3 + usage.length;
  const k = Math.floor(rng() * n);
  if (k >= 3) return usageQuestion(rng, usage[k - 3]);
  return k === 0 ? idiomBlank(rng, story) : k === 1 ? idiomMeaning(rng, story) : idiomPicture(rng, story);
}
