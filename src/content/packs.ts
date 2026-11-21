// 확장팩 상품 정의. 무료 12편은 앞으로도 무료이고 광고가 없다.
// 확장팩은 보호자가 한 번 구매하면 계속 쓰는 비소모성 상품(앱 내 구매)으로 판매한다.
import { GENERALS_STORIES, PACK_GENERALS } from './pack-generals';
import { STRATEGISTS_STORIES, PACK_STRATEGISTS } from './pack-strategists';
import { FABLES_STORIES, PACK_FABLES } from './pack-fables';
import { HANFEI_STORIES, PACK_HANFEI } from './pack-hanfei';
import { THREE_KINGDOMS_STORIES, PACK_THREE_KINGDOMS } from './pack-threekingdoms';
import { MENCIUS_STORIES, PACK_MENCIUS } from './pack-mencius';
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
  {
    id: PACK_STRATEGISTS,
    productId: 'gojeon.pack.strategists',
    title: '전국시대의 책사들',
    hanja: '策士',
    lead: '칼보다 말과 꾀로 나라를 움직인 시대. 소진·곽외·맹상군·여불위가 어떻게 기회를 만들고 사람을 얻었는지 네 고사로 만난다.',
    stories: STRATEGISTS_STORIES,
    trialIds: ['cs-01'],
    includes: [
      '고사 4편(이야기·원문·그림으로 보는 유래·한자 대전·기억 노트)',
      '새 한자 12자와 원문 한자 풀이',
      '새 인물 4명(소진·곽외·맹상군·여불위)',
      '한 번 구매하면 계속 이용, 광고 없음',
    ],
  },
  {
    id: PACK_FABLES,
    productId: 'gojeon.pack.fables',
    title: '우화 속 지혜',
    hanja: '寓話',
    lead: '여우와 호랑이, 조개와 도요새, 뱀의 발, 산을 옮긴 노인. 짧은 이야기 하나로 왕과 장군의 마음을 돌린 지혜를 네 고사로 만난다.',
    stories: FABLES_STORIES,
    trialIds: ['uh-01'],
    includes: [
      '고사 4편(이야기·원문·그림으로 보는 유래·한자 대전·기억 노트)',
      '새 한자 15자와 원문 한자 풀이',
      '새 인물 4명(강을·진진·소대·우공)',
      '한 번 구매하면 계속 이용, 광고 없음',
    ],
  },
  {
    id: PACK_HANFEI,
    productId: 'gojeon.pack.hanfei',
    title: '한비자의 이야기',
    hanja: '韓非',
    lead: '그루터기를 지킨 농부, 부는 척하던 악사, 시장의 호랑이, 길을 아는 늙은 말. 사상가 한비가 세상을 꿰뚫어 본 네 이야기를 만난다.',
    stories: HANFEI_STORIES,
    trialIds: ['hb-01'],
    includes: [
      '고사 4편(이야기·원문·그림으로 보는 유래·한자 대전·기억 노트)',
      '새 한자 13자와 원문 한자 풀이',
      '새 인물 4명(한비·남곽 선비·방공·관중)',
      '한 번 구매하면 계속 이용, 광고 없음',
    ],
  },
  {
    id: PACK_THREE_KINGDOMS,
    productId: 'gojeon.pack.threekingdoms',
    title: '삼국지 정사',
    hanja: '三國',
    lead: '소설이 아닌 역사책 『삼국지』로 만나는 유비·제갈량·여몽·맹획. 사람을 얻고, 믿고, 배우고, 마음으로 따르게 한 네 고사를 만난다.',
    stories: THREE_KINGDOMS_STORIES,
    trialIds: ['sg-01'],
    includes: [
      '고사 4편(이야기·원문·그림으로 보는 유래·한자 대전·기억 노트)',
      '새 한자 12자와 원문 한자 풀이',
      '새 인물 4명(유비·제갈량·여몽·맹획)',
      '한 번 구매하면 계속 이용, 광고 없음',
    ],
  },
  {
    id: PACK_MENCIUS,
    productId: 'gojeon.pack.mencius',
    title: '맹자의 가르침',
    hanja: '孟子',
    lead: '싹을 뽑아 올린 농부, 하늘과 땅을 채우는 기운, 나무 위의 물고기, 하루 볕과 열흘 추위. 맹자가 제자와 왕에게 들려준 네 비유를 만난다.',
    stories: MENCIUS_STORIES,
    trialIds: ['mz-01'],
    includes: [
      '고사 4편(이야기·원문·그림으로 보는 유래·한자 대전·기억 노트)',
      '새 한자 15자와 원문 한자 풀이',
      '새 인물 4명(공손추·맹자·제 선왕·혁추)',
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
