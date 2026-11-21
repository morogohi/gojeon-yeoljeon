// 확장팩 2 「전국시대의 책사들」 — 말 한마디와 꾀로 나라를 움직인 사람들. 『사기』 열전·세가에서 발췌.
// 원문은 공유 저작물인 백문을 짧게 인용하고, 장면·풀이는 자체 작문. 원전에 없는 대사는 지어내지 않는다.
// 『전국책』에만 있는 일화(소진의 자고, 천금으로 산 천리마 뼈 등)는 쓰지 않는다.
// 시대 순서: 鷄口牛後(기원전 333 무렵) → 先從隗始(311 무렵) → 鷄鳴狗盜(299 무렵) → 奇貨可居(3세기 중엽)
import type { ChoiceOption, Hanja, Hero, Story } from './types';
import type { Gloss } from './gloss';

export const PACK_STRATEGISTS = 'pack-strategists';

const ok = (label: string, feedback: string): ChoiceOption => ({ label, correct: true, feedback });
const no = (label: string, feedback: string): ChoiceOption => ({ label, correct: false, feedback });

export const STRATEGISTS_STORIES: Story[] = [
  {
    id: 'cs-01', book: 'chaeksa', pack: PACK_STRATEGISTS, idiom: '鷄口牛後', reading: '계구우후',
    meaning: '닭의 부리가 될지언정 소의 꼬리는 되지 마라. 큰 무리의 꼴찌보다 작은 무리의 우두머리가 낫다.',
    source: '『사기』 소진열전', heroId: 'sojin', era: '전국시대 · 기원전 333년 무렵',
    scenes: [
      { text: '전국시대, 서쪽의 진나라가 점점 강해지자 나머지 여섯 나라는 하나씩 진나라를 섬길지 고민했다.' },
      { text: '낙양 사람 소진은 여섯 나라가 세로로 손을 잡아 진나라에 맞서자는 ‘합종’을 들고 왕들을 찾아다녔다. 연나라와 조나라에 이어 한나라 왕을 만났다.' },
      {
        text: '소진은 한나라 왕에게 말했다. 한나라는 땅이 넓고 군사가 강한데 진나라를 섬기는 것은, 속담에 이른 대로 소의 꼬리가 되는 것과 무엇이 다르냐고.',
        choice: {
          prompt: '한나라 왕은 어떻게 했을까?',
          options: [
            ok('얼굴빛이 변하며 칼을 짚고, 진나라를 섬기지 않겠다며 합종에 들어갔다', '한나라에 이어 위·제·초까지 손을 잡았다. 소진은 여섯 나라 재상의 도장을 함께 차게 되었다.'),
            no('진나라의 꼬리라도 되는 것이 안전하다며 거절했다', '한왕은 ‘소의 꼬리’라는 말에 자존심이 상해 오히려 마음을 굳혔다.'),
            no('소진을 붙잡아 진나라에 넘겼다', '한왕은 소진의 말을 받아들였다.'),
          ],
        },
      },
    ],
    original: { text: '臣聞鄙諺曰：「寧爲雞口，無爲牛後。」', reading: '신문비언왈: 「영위계구, 무위우후.」', translation: '신이 듣기로 시골 속담에 “차라리 닭의 부리가 될지언정 소의 꼬리는 되지 마라.” 하였습니다. (원문은 ‘鷄’를 ‘雞’로 썼다)' },
    related: [
      { word: '鷄卵', reading: '계란', meaning: '닭의 알' },
      { word: '入口', reading: '입구', meaning: '들어가는 문이나 길' },
      { word: '韓牛', reading: '한우', meaning: '우리나라 소' },
    ],
    modern: '큰 회사의 말단보다 작은 회사의 책임자를 택한 그는 계구우후를 떠올렸다.',
  },
  {
    id: 'cs-02', book: 'chaeksa', pack: PACK_STRATEGISTS, idiom: '先從隗始', reading: '선종외시',
    meaning: '먼저 곽외부터 시작하라. 큰일을 하려면 가까운 일, 자기 자신부터 시작함.',
    source: '『사기』 연소공세가', heroId: 'gwakoe', era: '전국시대 · 기원전 311년 무렵',
    scenes: [
      { text: '제나라에 크게 패한 연나라에서 소왕이 새 왕이 되었다. 소왕은 몸을 낮추고 넉넉한 예물을 내어 어진 사람들을 불러 모으려 했다.' },
      { text: '소왕은 곽외에게 물었다. 제나라에 당한 치욕을 씻고 싶으니 함께 나라를 일으킬 인재를 어떻게 얻을 수 있겠느냐고.' },
      {
        text: '곽외가 대답했다.',
        choice: {
          prompt: '곽외의 대답은?',
          options: [
            ok('인재를 부르고 싶다면 먼저 저 곽외부터 쓰십시오. 저보다 어진 사람들이 어찌 천 리를 멀다 하겠습니까', '소왕은 곽외를 위해 집을 고쳐 지어 스승으로 모셨다. 그러자 악의·추연·극신 같은 인재들이 앞다투어 연나라로 왔다.'),
            no('먼 나라의 이름난 선비부터 비싼 값에 모셔 오십시오', '곽외는 멀리서 찾기 전에 가까운 곳에서부터 시작하라고 했다.'),
            no('인재는 저절로 찾아오니 기다리십시오', '곽외는 왕이 먼저 본을 보이라고 했다.'),
          ],
        },
      },
    ],
    original: { text: '王必欲致士，先從隗始。況賢於隗者，豈遠千里哉！', reading: '왕필욕치사, 선종외시. 황현어외자, 기원천리재!', translation: '왕께서 꼭 선비를 부르고자 하신다면 먼저 저 곽외부터 시작하십시오. 하물며 저보다 어진 사람들이 어찌 천 리를 멀다 하겠습니까!' },
    related: [
      { word: '從事', reading: '종사', meaning: '어떤 일을 맡아서 함' },
      { word: '始作', reading: '시작', meaning: '처음으로 함' },
      { word: '開始', reading: '개시', meaning: '일을 열어 시작함' },
    ],
    modern: '학급 분리수거를 바꾸자던 반장은 선종외시라며 자기 자리부터 정리하기 시작했다.',
  },
  {
    id: 'cs-03', book: 'chaeksa', pack: PACK_STRATEGISTS, idiom: '鷄鳴狗盜', reading: '계명구도',
    meaning: '닭 울음 흉내와 개 흉내 내는 좀도둑. 하찮아 보이는 재주도 쓰일 때가 있음. (낮잡아 보는 뜻으로도 씀)',
    source: '『사기』 맹상군열전', heroId: 'maengsang', era: '전국시대 · 기원전 299년 무렵',
    scenes: [
      { text: '제나라의 맹상군은 재주 있는 사람이라면 신분을 가리지 않고 식객으로 받아들였다. 그 수가 수천 명에 이르렀다.' },
      { text: '진나라 소왕이 맹상군을 불러들였다가 해치려 했다. 맹상군은 왕이 아끼는 여인에게 도움을 청했는데, 그는 하얀 여우 털옷을 바라였다. 그 옷은 이미 왕에게 바친 뒤였다.' },
      { text: '그때 가장 낮은 자리의 식객이 나섰다. 개처럼 몰래 들어가 훔치는 재주를 가진 그는 밤에 왕의 창고에서 여우 털옷을 가져왔고, 덕분에 맹상군은 풀려났다.' },
      {
        text: '맹상군 일행은 밤중에 국경의 함곡관에 이르렀다. 관문은 닭이 울어야 열리는데 뒤에서는 진나라 군사가 쫓아오고 있었다.',
        choice: {
          prompt: '맹상군 일행은 어떻게 빠져나갔을까?',
          options: [
            ok('닭 울음 흉내를 잘 내는 식객이 울자, 주변 닭들이 따라 울어 관문이 열렸다', '평소 이 두 식객을 함께 대접하는 것을 부끄러워하던 사람들도 그제야 모두 탄복했다.'),
            no('문지기에게 큰돈을 주고 문을 열게 했다', '맹상군을 살린 것은 돈이 아니라 하찮아 보이던 재주였다.'),
            no('날이 밝을 때까지 관문 앞에서 기다렸다', '기다렸다면 쫓아온 진나라 군사에게 잡혔을 것이다.'),
          ],
        },
      },
    ],
    original: { text: '最下坐有能爲狗盜者……客之居下坐者有能爲雞鳴，而雞齊鳴，遂發傳出。', reading: '최하좌유능위구도자…… 객지거하좌자유능위계명, 이계제명, 수발전출.', translation: '가장 낮은 자리에 개처럼 훔치는 재주를 가진 이가 있었다. …… 식객 가운데 아랫자리에 앉은 이가 닭 울음소리를 잘 냈는데, 그러자 닭들이 일제히 울어 마침내 통행증을 내보이고 관문을 나갔다. (원문은 ‘鷄’를 ‘雞’로 썼다)' },
    related: [
      { word: '共鳴', reading: '공명', meaning: '남의 생각에 같은 마음이 됨' },
      { word: '强盜', reading: '강도', meaning: '힘으로 남의 것을 빼앗는 도둑' },
      { word: '鷄卵', reading: '계란', meaning: '닭의 알' },
    ],
    modern: '모두 쓸모없다던 친구의 성대모사 실력이 장기자랑에서 반을 우승으로 이끌었다. 계명구도가 따로 없었다.',
  },
  {
    id: 'cs-04', book: 'chaeksa', pack: PACK_STRATEGISTS, idiom: '奇貨可居', reading: '기화가거',
    meaning: '진귀한 물건은 사 둘 만하다. 좋은 기회를 놓치지 않고 잡아 두면 큰 이익이 됨.',
    source: '『사기』 여불위열전', heroId: 'yeobulwi', era: '전국시대 말 · 기원전 3세기 중엽',
    scenes: [
      { text: '여불위는 여러 나라를 오가며 싸게 사서 비싸게 팔아 큰돈을 모은 상인이었다.' },
      { text: '조나라 수도 한단에는 진나라 왕손 자초가 볼모로 와 있었다. 자초는 형제가 스무 명이 넘는 서자였고, 진나라가 조나라를 자주 쳤기 때문에 조나라에서 푸대접을 받으며 어렵게 살았다.' },
      {
        text: '장사하러 한단에 온 여불위가 자초를 보았다.',
        choice: {
          prompt: '여불위는 어떻게 했을까?',
          options: [
            ok('이 사람은 사 둘 만한 진귀한 물건이라며, 재산을 들여 자초를 진나라 태자의 후계자로 세웠다', '여불위는 자식이 없던 태자비 화양부인을 설득해 자초를 아들로 삼게 했다. 자초는 뒷날 진나라 왕(장양왕)이 되었고 여불위는 승상이 되었다.'),
            no('가난한 볼모와 엮이면 손해라며 모른 척했다', '여불위는 남들이 보지 못한 가치를 알아보았다.'),
            no('자초를 조나라 왕에게 넘겨 상을 받았다', '여불위는 자초에게 모든 것을 걸었다.'),
          ],
        },
      },
    ],
    original: { text: '呂不韋賈邯鄲，見而憐之，曰：「此奇貨可居。」', reading: '여불위고한단, 견이련지, 왈: 「차기화가거.」', translation: '여불위가 한단에서 장사를 하다가 (자초를) 보고 딱하게 여겨 말했다. “이것은 사 둘 만한 진귀한 물건이다.”' },
    related: [
      { word: '新奇', reading: '신기', meaning: '새롭고 기이함' },
      { word: '貨物', reading: '화물', meaning: '실어 나르는 물건' },
      { word: '住居', reading: '주거', meaning: '머물러 삶, 사는 집' },
    ],
    modern: '아무도 관심 없던 신인 작가의 첫 작품을 알아본 출판사는 기화가거라며 바로 계약했다.',
  },
];

export const STRATEGISTS_HANJA: Hanja[] = [
  { char: '鷄', hun: '닭', eum: '계' },
  { char: '口', hun: '입', eum: '구' },
  { char: '牛', hun: '소', eum: '우' },
  { char: '先', hun: '먼저', eum: '선' },
  { char: '從', hun: '좇을', eum: '종' },
  { char: '隗', hun: '높을', eum: '외' },
  { char: '始', hun: '비로소', eum: '시' },
  { char: '鳴', hun: '울', eum: '명' },
  { char: '盜', hun: '도둑', eum: '도' },
  { char: '奇', hun: '기이할', eum: '기' },
  { char: '貨', hun: '재물', eum: '화' },
  { char: '居', hun: '살', eum: '거' },
];

export const STRATEGISTS_GLOSS: Gloss[] = [
  { char: '鄙', hun: '더러울', eum: '비', note: '원문에서는 ‘시골’' },
  { char: '諺', hun: '언문', eum: '언', note: '원문에서는 ‘속담’' },
  { char: '寧', hun: '편안', eum: '녕', note: '원문에서는 ‘차라리’. 첫머리에서는 ‘영’으로 읽는다' },
  { char: '雞', hun: '닭', eum: '계', note: '鷄와 같은 글자' },
  { char: '欲', hun: '하고자할', eum: '욕' },
  { char: '致', hun: '이를', eum: '치', note: '원문에서는 ‘불러오다’' },
  { char: '況', hun: '하물며', eum: '황' },
  { char: '豈', hun: '어찌', eum: '기' },
  { char: '遠', hun: '멀', eum: '원' },
  { char: '千', hun: '일천', eum: '천' },
  { char: '里', hun: '마을', eum: '리', note: '거리의 단위(리)' },
  { char: '哉', hun: '어조사', eum: '재' },
  { char: '最', hun: '가장', eum: '최' },
  { char: '下', hun: '아래', eum: '하' },
  { char: '坐', hun: '앉을', eum: '좌', note: '원문에서는 ‘자리’' },
  { char: '有', hun: '있을', eum: '유' },
  { char: '客', hun: '손', eum: '객', note: '원문에서는 ‘식객’' },
  { char: '齊', hun: '가지런할', eum: '제', note: '원문에서는 ‘일제히’. 제나라 제' },
  { char: '遂', hun: '드디어', eum: '수' },
  { char: '傳', hun: '전할', eum: '전', note: '원문에서는 관문을 지나는 ‘통행증’' },
  { char: '出', hun: '날', eum: '출' },
  { char: '呂', hun: '성씨', eum: '려', note: '첫머리에서는 ‘여’로 읽는다(여불위)' },
  { char: '韋', hun: '가죽', eum: '위' },
  { char: '賈', hun: '장사', eum: '고', note: '값 가' },
  { char: '邯', hun: '땅이름', eum: '한' },
  { char: '鄲', hun: '땅이름', eum: '단', note: '邯鄲: 조나라 수도' },
  { char: '憐', hun: '불쌍히여길', eum: '련' },
  { char: '此', hun: '이', eum: '차' },
  { char: '卵', hun: '알', eum: '란' },
  { char: '韓', hun: '한국', eum: '한', note: '나라 이름 한' },
  { char: '事', hun: '일', eum: '사' },
  { char: '作', hun: '지을', eum: '작' },
  { char: '開', hun: '열', eum: '개' },
  { char: '共', hun: '한가지', eum: '공' },
  { char: '强', hun: '강할', eum: '강' },
  { char: '物', hun: '물건', eum: '물' },
  { char: '住', hun: '살', eum: '주' },
];

export const STRATEGISTS_HEROES: Hero[] = [
  { id: 'sojin', name: '소진', hanjaName: '蘇秦', title: '여섯 나라의 재상', skill: 'insight', skillName: '합종 유세', skillDesc: '정답의 첫 글자를 보여 준다.' },
  { id: 'gwakoe', name: '곽외', hanjaName: '郭隗', title: '연나라 소왕의 스승', skill: 'heal', skillName: '나부터', skillDesc: '체력을 1 회복한다.' },
  { id: 'maengsang', name: '맹상군', hanjaName: '孟嘗君', title: '제나라 공자', skill: 'shield', skillName: '식객 삼천', skillDesc: '다음 오답 한 번은 체력이 줄지 않는다.' },
  { id: 'yeobulwi', name: '여불위', hanjaName: '呂不韋', title: '진나라 승상', skill: 'reveal', skillName: '안목', skillDesc: '오답 보기 두 개를 지운다.' },
];

export const STRATEGISTS_EASY: Record<string, string> = {
  'cs-01': '큰 무리의 꼴찌보다 작은 무리의 앞장이 되는 것이 낫다는 말.',
  'cs-02': '큰일을 하려면 가까운 일, 나 자신부터 시작하라는 말.',
  'cs-03': '하찮아 보이는 재주도 쓰일 때가 있다는 말.',
  'cs-04': '남들이 몰라보는 좋은 기회를 알아보고 잡아 두는 것.',
};

export const STRATEGISTS_TERMS: { word: string; desc: string }[] = [
  { word: '합종', desc: '여섯 나라가 남북(세로)으로 손잡고 진나라에 맞서자는 계책.' },
  { word: '예물', desc: '예의를 갖추어 주는 선물.' },
  { word: '함곡관', desc: '진나라로 드나드는 길목의 관문.' },
  { word: '볼모', desc: '약속을 지키는 증표로 다른 나라에 보내져 머무는 사람.' },
  { word: '서자', desc: '정식 부인이 아닌 여인에게서 태어난 아들.' },
];
