// 입문자·어린이 학습 보조 콘텐츠. 원문·번역(stories.ts)과 섞지 않고 따로 관리한다.
// - EASY: 쉬운 한 줄 풀이(번역이 아니다). 원뜻은 stories.ts 의 meaning, 번역은 original.translation.
// - TERMS: 이야기 속 어려운 말의 짧은 설명
// - RECAP: 앞 이야기를 알아야 하는 고사의 요약
// - USAGE: 뜻을 실제로 쓰는 문제(상황 적용·비슷한 뜻). 정답 근거(explain)를 함께 둔다.

import { GENERALS_EASY, GENERALS_TERMS } from './pack-generals';
import { STRATEGISTS_EASY, STRATEGISTS_TERMS } from './pack-strategists';
import { FABLES_EASY, FABLES_TERMS } from './pack-fables';
import { HANFEI_EASY, HANFEI_TERMS } from './pack-hanfei';

/** 쉬운 한 줄 풀이 */
export const EASY: Record<string, string> = {
  'sagi-01': '빌린 것을 흠 하나 없이 그대로 돌려주는 것. 일을 빈틈없이 해내는 것.',
  'sagi-02': '어려운 일이 생겨도 서로를 끝까지 믿는 친구 사이.',
  'sagi-03': '재능이 있는 사람은 숨어 있어도 결국 눈에 띈다는 말.',
  'sagi-04': '힘센 사람이 틀린 것을 맞다고 우기며 남을 속이는 것.',
  'sagi-05': '물러설 곳이 없다는 마음으로 온 힘을 다하는 것.',
  'sagi-06': '사방이 막혀서 도와줄 사람이 아무도 없는 외로운 처지.',
  'sagi-07': '필요할 때는 쓰다가 쓸모가 없어지면 버리는 것.',
  'sagi-08': '서로를 깊이 이해하고 믿어 주는 변함없는 우정.',
  'nonyu-01': '배운 것을 다시 익히면 새로운 것을 깨닫게 된다는 말.',
  'nonyu-02': '너무 많이 하는 것은 모자란 것과 마찬가지로 좋지 않다는 말.',
  'nonyu-03': '듣기 좋은 말과 꾸민 표정으로 남의 마음을 사려는 것.',
  'nonyu-04': '나중에 태어난 어린 사람도 크게 될 수 있으니 얕보면 안 된다는 말.',
  ...GENERALS_EASY,
  ...STRATEGISTS_EASY,
  ...FABLES_EASY,
  ...HANFEI_EASY,
};

/** 이야기 속 어려운 말. 장면 글에 나오는 말만 그 장면 아래에 보여 준다. */
export const TERMS: { word: string; desc: string }[] = [
  { word: '전국시대', desc: '중국에서 여러 나라가 서로 다투던 시대. 기원전 221년 진나라의 통일로 끝났다.' },
  { word: '조나라', desc: '전국시대 중국 북쪽에 있던 나라.' },
  { word: '진나라', desc: '전국시대 서쪽의 강한 나라. 뒤에 중국을 처음 통일했다.' },
  { word: '초나라', desc: '중국 남쪽에 있던 큰 나라.' },
  { word: '한나라', desc: '유방이 세운 나라. 초나라 항우와 천하를 다투어 이겼다.' },
  { word: '사신', desc: '나라를 대표해 다른 나라에 가는 사람.' },
  { word: '상경', desc: '아주 높은 벼슬자리.' },
  { word: '노장', desc: '나이가 많고 경험이 많은 장수.' },
  { word: '수도', desc: '나라의 중심이 되는 도시.' },
  { word: '식객', desc: '높은 사람의 집에 머물며 일을 돕던 손님.' },
  { word: '선비', desc: '학식과 바른 마음을 갖춘 사람.' },
  { word: '진시황', desc: '중국을 처음 통일한 진나라의 왕.' },
  { word: '환관', desc: '궁궐 안에서 왕을 가까이 모시던 관리.' },
  { word: '병법', desc: '군사를 부리고 싸우는 방법.' },
  { word: '공신', desc: '나라를 위해 큰 공을 세운 신하.' },
  { word: '벼슬', desc: '나라의 일을 맡는 자리.' },
  { word: '재상', desc: '왕을 도와 나랏일을 이끄는 가장 높은 신하.' },
  { word: '공자', desc: '노나라의 학자이자 스승. 『논어』는 제자들이 그의 말을 모은 책이다.' },
  { word: '제자', desc: '스승에게서 배우는 사람.' },
  ...GENERALS_TERMS,
  ...STRATEGISTS_TERMS,
  ...FABLES_TERMS,
  ...HANFEI_TERMS,
];

export function termsIn(text: string): { word: string; desc: string }[] {
  return TERMS.filter((t) => text.includes(t.word));
}

/** 앞 이야기를 알아야 하는 고사 */
export const RECAP: Record<string, string> = {
  'sagi-02': '앞 이야기 「완벽귀조」: 인상여는 진나라에 빼앗길 뻔한 구슬(화씨벽)을 흠 없이 조나라로 되찾아 왔다.',
};

export type UsageKind = 'usage' | 'similar';

export interface UsageItem {
  /** 이 문제가 확인하는 성어(복습 카드 i:<storyId>) */
  storyId: string;
  kind: UsageKind;
  prompt: string;
  /** 정답 성어의 storyId */
  answer: string;
  /** 오답 성어 3개. 상황에 맞지 않는 것만 고른다(애매한 보기 금지). */
  distractors: [string, string, string];
  /** 정답의 근거 */
  explain: string;
}

/** 대표 고사에 먼저 적용. 새 항목은 같은 형식으로 늘린다(tests/learn.test.ts 가 형식을 검사). */
export const USAGE: UsageItem[] = [
  {
    storyId: 'sagi-02', kind: 'usage', answer: 'sagi-02', distractors: ['sagi-06', 'sagi-04', 'nonyu-02'],
    prompt: '두 친구는 크게 다툰 적도 있지만, 어려운 일이 생기자 목숨을 걸 만큼 서로를 믿고 도왔다. 이 사이를 나타내는 성어는?',
    explain: '문경지교는 목숨을 함께할 만큼 깊은 사귐이다. 염파와 인상여도 다툼 끝에 이런 벗이 되었다.',
  },
  {
    storyId: 'sagi-03', kind: 'usage', answer: 'sagi-03', distractors: ['sagi-07', 'nonyu-01', 'nonyu-03'],
    prompt: '조용히 지내던 친구가 학예회에서 노래 실력을 보여 주자 모두가 그 재능을 알아보았다. 어울리는 성어는?',
    explain: '낭중지추는 주머니 속 송곳 끝이 드러나듯 재능 있는 사람은 저절로 드러난다는 뜻이다.',
  },
  {
    storyId: 'sagi-06', kind: 'usage', answer: 'sagi-06', distractors: ['nonyu-04', 'sagi-01', 'sagi-08'],
    prompt: '사방이 적에게 둘러싸여 도와줄 사람이 아무도 없는 처지를 나타내는 성어는?',
    explain: '사면초가는 항우가 사방에서 초나라 노래를 듣고 고립되었음을 깨달은 데서 나왔다.',
  },
  {
    storyId: 'nonyu-02', kind: 'usage', answer: 'nonyu-02', distractors: ['sagi-01', 'sagi-03', 'sagi-04'],
    prompt: '시험 공부를 한다고 밤을 새웠더니 너무 졸려서 오히려 시험을 망쳤다. 이 일에 어울리는 성어는?',
    explain: '과유불급은 지나침이 모자람과 같다는 뜻이다. 공부도 알맞게 해야 한다.',
  },
  {
    storyId: 'sagi-08', kind: 'similar', answer: 'sagi-02', distractors: ['sagi-06', 'sagi-04', 'nonyu-03'],
    prompt: '「관포지교」와 뜻이 가장 가까운 성어는?',
    explain: '관포지교와 문경지교는 모두 서로를 깊이 믿는 변함없는 우정을 뜻한다.',
  },
];

export function usageOf(storyId: string): UsageItem[] {
  return USAGE.filter((u) => u.storyId === storyId);
}
