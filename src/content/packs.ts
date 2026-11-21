// 확장팩 상품 정의. 무료 12편은 앞으로도 무료이고 광고가 없다.
// 확장팩은 보호자가 한 번 구매하면 계속 쓰는 비소모성 상품(앱 내 구매)으로 판매한다.
import { GENERALS_STORIES, PACK_GENERALS } from './pack-generals';
import type { Story } from './types';

export interface Pack {
  id: string;
  /** 스토어 상품 ID(App Store Connect·Play Console에 같은 ID로 등록) */
  productId: string;
  title: string;
  hanja: string;
  lead: string;
  stories: Story[];
  /** 구매 전에도 끝까지 해 볼 수 있는 체험 고사 */
  trialIds: string[];
  /** 무엇이 들어 있는지(상품 설명) */
  includes: string[];
}

export const PACKS: Pack[] = [
  {
    id: PACK_GENERALS,
    productId: 'gojeon.pack.generals',
    title: '사기의 명장들',
    hanja: '名將',
    lead: '진나라가 무너지고 초나라와 한나라가 천하를 다툰 시대. 항량·항우·범증·유방·번쾌·한신·소하의 결단을 네 고사로 만난다.',
    stories: GENERALS_STORIES,
    trialIds: ['mj-01'],
    includes: [
      '고사 4편(이야기·원문·그림으로 보는 유래·한자 대전·기억 노트)',
      '새 한자 15자와 원문 한자 풀이',
      '새 인물 4명(항량·범증·번쾌·소하)',
      '한 번 구매하면 계속 이용, 광고 없음',
    ],
  },
];

export function packOf(storyId: string): Pack | undefined {
  return PACKS.find((p) => p.stories.some((s) => s.id === storyId));
}

export function getPack(id: string): Pack | undefined {
  return PACKS.find((p) => p.id === id);
}
