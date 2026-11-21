// 확장팩 6 「맹자의 가르침」 — 『맹자』 공손추상·양혜왕상·고자상에서 발췌. 맹자가 제자와 왕에게 들려준 비유.
// 원문은 공유 저작물인 백문을 짧게 인용하고, 장면·풀이는 자체 작문. 원전에 없는 대사는 지어내지 않는다.
// 揠苗助長은 浩然之氣를 설명하는 대화 속 비유다(공손추상). 두 고사를 이어서 보여 준다.
// 글자 수가 4가 아닌 성어(五十步百步·助長 단독)는 지금 구조에 맞지 않아 넣지 않았다. 自暴自棄는 다음 후보.
// 시대: 맹자(기원전 372?~289?)가 제나라 선왕(재위 기원전 319~301) 무렵에 나눈 대화
import type { ChoiceOption, Hanja, Hero, Story } from './types';
import type { Gloss } from './gloss';

export const PACK_MENCIUS = 'pack-mencius';

const ok = (label: string, feedback: string): ChoiceOption => ({ label, correct: true, feedback });
const no = (label: string, feedback: string): ChoiceOption => ({ label, correct: false, feedback });

export const MENCIUS_STORIES: Story[] = [
  {
    id: 'mz-01', book: 'maengja', pack: PACK_MENCIUS, idiom: '揠苗助長', reading: '알묘조장',
    meaning: '싹을 뽑아 올려 자라기를 돕는다. 급하게 서두르다 오히려 일을 망침.',
    source: '『맹자』 공손추상', heroId: 'gongsonchu', era: '전국시대 · 기원전 4세기 말(맹자)',
    scenes: [
      { text: '제자 공손추가 마음의 힘을 어떻게 기르는지 묻자, 맹자는 서두르지 말라며 송나라 농부 이야기를 들려주었다.' },
      { text: '송나라의 한 농부는 자기가 심은 싹이 빨리 자라지 않는 것이 안타까웠다. 그래서 논에 나가 싹을 하나하나 조금씩 뽑아 올렸다.' },
      { text: '농부는 지친 얼굴로 집에 돌아와 식구들에게 말했다. “오늘 정말 힘들었다. 내가 싹이 자라도록 도와주었거든!”' },
      {
        text: '그 말을 들은 아들이 서둘러 논으로 달려가 보았다.',
        choice: {
          prompt: '논의 싹들은 어떻게 되었을까?',
          options: [
            ok('싹이 모두 말라 시들어 있었다', '뿌리가 들뜬 싹은 물을 빨아들이지 못해 말라 버렸다. 맹자는 “돕지 않아도 될 것을 억지로 도우면, 이로움이 없을 뿐 아니라 오히려 해친다”라고 했다.'),
            no('싹이 하룻밤 사이에 쑥쑥 자라 있었다', '싹을 뽑아 올린다고 빨리 자라지는 않는다.'),
            no('아무 일도 없이 그대로였다', '억지로 뽑아 올린 싹은 그대로일 수 없었다.'),
          ],
        },
      },
    ],
    original: { text: '宋人有閔其苗之不長而揠之者……其子趨而往視之，苗則槁矣。', reading: '송인유민기묘지부장이알지자…… 기자추이왕시지, 묘즉고의.', translation: '송나라 사람 중에 싹이 자라지 않는 것을 안타까워하여 뽑아 올린 이가 있었다. …… 그 아들이 달려가 보니 싹은 이미 말라 있었다.' },
    related: [
      { word: '種苗', reading: '종묘', meaning: '씨앗과 모종' },
      { word: '助言', reading: '조언', meaning: '도움이 되도록 말을 거들어 줌' },
      { word: '成長', reading: '성장', meaning: '자라서 점점 커짐' },
    ],
    modern: '아이가 빨리 잘하길 바라며 학원을 열 군데나 보낸 것은 알묘조장이었다. 아이는 오히려 공부가 싫어졌다.',
  },
  {
    id: 'mz-02', book: 'maengja', pack: PACK_MENCIUS, idiom: '浩然之氣', reading: '호연지기',
    meaning: '넓고 큰 기운. 하늘과 땅 사이에 가득 찰 만큼 크고 바른 마음의 힘.',
    source: '『맹자』 공손추상', heroId: 'maengja', era: '전국시대 · 기원전 4세기 말(맹자)',
    scenes: [
      { text: '공손추가 맹자에게 물었다. “선생님께서는 무엇을 잘하십니까?” 맹자가 대답했다. “나는 남의 말을 잘 알아듣고, 나의 호연지기를 잘 기른다.”' },
      { text: '“호연지기가 무엇입니까?” 맹자는 말로 하기 어렵다고 했다. 그것은 더없이 크고 굳센 기운이어서, 곧게 길러 해치지 않으면 하늘과 땅 사이를 가득 채운다고 했다.' },
      {
        text: '공손추는 그 기운을 어떻게 길러야 하는지 다시 물었다.',
        choice: {
          prompt: '맹자는 호연지기를 어떻게 기른다고 했을까?',
          options: [
            ok('옳은 일을 꾸준히 쌓아 기르되, 잊지도 말고 억지로 서두르지도 말라', '맹자는 의로운 일을 하나하나 쌓아야 생기는 기운이라고 했다. 그리고 억지로 서두르면 안 된다며, 싹을 뽑아 올린 송나라 농부 이야기를 덧붙였다.'),
            no('한 번 크게 옳은 일을 하면 저절로 생긴다', '맹자는 한 번의 행동이 아니라 꾸준히 쌓아야 한다고 했다.'),
            no('남을 이기는 싸움에서 생긴다', '호연지기는 남을 이기는 힘이 아니라 부끄러움 없는 바른 마음에서 나온다.'),
          ],
        },
      },
    ],
    original: { text: '我善養吾浩然之氣。……其爲氣也，至大至剛，以直養而無害，則塞于天地之閒。', reading: '아선양오호연지기. …… 기위기야, 지대지강, 이직양이무해, 즉색우천지지간.', translation: '나는 나의 호연지기를 잘 기른다. …… 그 기운은 더없이 크고 더없이 굳세어서, 곧게 길러 해치지 않으면 하늘과 땅 사이를 가득 채운다.' },
    related: [
      { word: '浩大', reading: '호대', meaning: '매우 넓고 큼' },
      { word: '天然', reading: '천연', meaning: '사람의 힘을 더하지 않은 저절로 된 상태' },
      { word: '氣分', reading: '기분', meaning: '마음에 생기는 즐거움이나 불쾌함 같은 느낌' },
    ],
    modern: '탁 트인 바다를 보며 크게 소리친 친구는 가슴에 호연지기가 가득 차는 것 같다고 했다.',
  },
  {
    id: 'mz-03', book: 'maengja', pack: PACK_MENCIUS, idiom: '緣木求魚', reading: '연목구어',
    meaning: '나무에 올라가 물고기를 구한다. 방법이 잘못되어 목적을 이룰 수 없음.',
    source: '『맹자』 양혜왕상', heroId: 'seonwang', era: '전국시대 · 기원전 4세기 말(제 선왕 때)',
    scenes: [
      { text: '제나라 선왕은 군대를 일으켜 이웃 나라들을 굴복시키고 천하를 차지하고 싶어 했다. 맹자는 왕이 정말 바라는 것이 무엇인지 물었다.' },
      { text: '왕이 웃기만 하고 대답하지 않자 맹자가 말했다. “땅을 넓히고 사방의 나라들을 따르게 하려는 것이겠지요. 그런데 지금의 방법으로 그것을 구하는 것은 나무에 올라가 물고기를 구하는 것과 같습니다.”' },
      { text: '왕이 놀라 물었다. “그렇게까지 심하단 말이오?”' },
      {
        text: '맹자가 대답했다.',
        choice: {
          prompt: '맹자는 왕의 방법이 나무 위에서 물고기를 찾는 것보다 무엇이 더 나쁘다고 했을까?',
          options: [
            ok('나무 위에서는 물고기를 못 얻을 뿐 탈은 없지만, 전쟁으로 천하를 얻으려 하면 반드시 재앙이 따른다', '맹자는 백성을 아끼는 어진 정치를 펴면 천하 사람들이 스스로 제나라로 모여들 것이라고 했다. 힘으로 빼앗기보다 마음을 얻으라는 말이었다.'),
            no('물고기보다 땅이 더 구하기 어렵다', '맹자는 어렵고 쉬움이 아니라 방법이 틀렸다고 했다.'),
            no('나무에 오르다 떨어질 수 있다', '맹자가 걱정한 것은 전쟁이 불러올 백성의 재앙이었다.'),
          ],
        },
      },
    ],
    original: { text: '以若所爲，求若所欲，猶緣木而求魚也。', reading: '이약소위, 구약소욕, 유연목이구어야.', translation: '지금 하시는 방법으로 바라시는 것을 구하는 것은, 나무에 올라가 물고기를 구하는 것과 같습니다.' },
    related: [
      { word: '因緣', reading: '인연', meaning: '사람 사이에 맺어지는 관계' },
      { word: '木手', reading: '목수', meaning: '나무로 집이나 물건을 만드는 사람' },
      { word: '要求', reading: '요구', meaning: '받아야 할 것을 달라고 청함' },
    ],
    modern: '잠을 줄이고 밤새 게임을 하면서 성적이 오르길 바라는 것은 연목구어다.',
  },
  {
    id: 'mz-04', book: 'maengja', pack: PACK_MENCIUS, idiom: '一曝十寒', reading: '일폭십한',
    meaning: '하루 볕을 쬐고 열흘 춥게 한다. 꾸준히 하지 않고 하다 말다 함.',
    source: '『맹자』 고자상', heroId: 'hyeokchu', era: '전국시대 · 기원전 4세기 말(맹자)',
    scenes: [
      { text: '사람들은 제나라 왕이 지혜롭지 못하다고 수군거렸다. 맹자는 이상하게 여길 것 없다며 이렇게 말했다.' },
      { text: '“아무리 잘 자라는 식물이라도 하루 볕을 쬐어 주고 열흘 춥게 두면 자랄 수 없다. 내가 왕을 만나는 날은 드물고, 내가 물러나면 왕의 마음을 차갑게 만드는 사람들이 몰려온다.”' },
      { text: '맹자는 바둑 이야기를 덧붙였다. 나라에서 제일가는 바둑 명인 혁추가 두 사람을 가르쳤다. 한 사람은 온 마음을 다해 혁추의 말만 들었다. 다른 사람은 듣는 척하면서 마음속으로는 날아오는 고니를 활로 쏠 생각만 했다.' },
      {
        text: '두 사람은 같은 스승에게 함께 배웠다.',
        choice: {
          prompt: '두 번째 사람이 첫 번째 사람만 못하게 된 까닭은?',
          options: [
            ok('머리가 나빠서가 아니라 마음을 다해 집중하지 않았기 때문', '맹자는 “그가 지혜가 모자라서이겠는가? 그렇지 않다.”라고 했다. 꾸준히, 마음을 다해 하느냐가 차이를 만든다.'),
            no('두 번째 사람이 원래 머리가 나빠서', '맹자는 지혜의 차이가 아니라고 분명히 말했다.'),
            no('스승 혁추가 한 사람만 편애해서', '혁추는 두 사람을 함께 가르쳤다.'),
          ],
        },
      },
    ],
    original: { text: '雖有天下易生之物也，一日暴之，十日寒之，未有能生者也。', reading: '수유천하이생지물야, 일일폭지, 십일한지, 미유능생자야.', translation: '비록 세상에서 가장 쉽게 자라는 식물이라도, 하루 볕을 쬐고 열흘 춥게 하면 자랄 수 있는 것은 없다. (원문은 ‘曝’을 ‘暴’으로 썼다)' },
    related: [
      { word: '一生', reading: '일생', meaning: '살아 있는 동안' },
      { word: '十分', reading: '십분', meaning: '아주 충분히' },
      { word: '寒冷', reading: '한랭', meaning: '날씨가 춥고 참' },
    ],
    modern: '사흘 줄넘기하고 열흘 쉬기를 되풀이한 그의 운동 계획은 일폭십한이었다.',
  },
];

export const MENCIUS_HANJA: Hanja[] = [
  { char: '揠', hun: '뽑을', eum: '알' },
  { char: '苗', hun: '모', eum: '묘' },
  { char: '助', hun: '도울', eum: '조' },
  { char: '長', hun: '긴', eum: '장' },
  { char: '浩', hun: '넓을', eum: '호' },
  { char: '然', hun: '그럴', eum: '연' },
  { char: '氣', hun: '기운', eum: '기' },
  { char: '緣', hun: '인연', eum: '연' },
  { char: '木', hun: '나무', eum: '목' },
  { char: '求', hun: '구할', eum: '구' },
  { char: '魚', hun: '물고기', eum: '어' },
  { char: '一', hun: '한', eum: '일' },
  { char: '曝', hun: '쬘', eum: '폭' },
  { char: '十', hun: '열', eum: '십' },
  { char: '寒', hun: '찰', eum: '한' },
];

export const MENCIUS_GLOSS: Gloss[] = [
  { char: '宋', hun: '송나라', eum: '송' },
  { char: '人', hun: '사람', eum: '인' },
  { char: '有', hun: '있을', eum: '유' },
  { char: '閔', hun: '민망할', eum: '민', note: '원문에서는 ‘안타까워하다(憫)’' },
  { char: '其', hun: '그', eum: '기' },
  { char: '不', hun: '아닐', eum: '불', note: 'ㄷ·ㅈ 앞에서는 ‘부’로 읽는다(不長 부장)' },
  { char: '而', hun: '말이을', eum: '이' },
  { char: '者', hun: '놈', eum: '자', note: '원문에서는 ‘~하는 사람’' },
  { char: '子', hun: '아들', eum: '자' },
  { char: '趨', hun: '달아날', eum: '추', note: '원문에서는 ‘종종걸음으로 달려가다’' },
  { char: '往', hun: '갈', eum: '왕' },
  { char: '視', hun: '볼', eum: '시' },
  { char: '則', hun: '곧', eum: '즉', note: '법칙 칙' },
  { char: '槁', hun: '마를', eum: '고' },
  { char: '矣', hun: '어조사', eum: '의' },
  { char: '種', hun: '씨', eum: '종' },
  { char: '言', hun: '말씀', eum: '언' },
  { char: '成', hun: '이룰', eum: '성' },
  { char: '我', hun: '나', eum: '아' },
  { char: '善', hun: '착할', eum: '선', note: '원문에서는 ‘잘하다’' },
  { char: '養', hun: '기를', eum: '양' },
  { char: '吾', hun: '나', eum: '오' },
  { char: '爲', hun: '할', eum: '위' },
  { char: '至', hun: '이를', eum: '지', note: '원문에서는 ‘더없이’' },
  { char: '大', hun: '큰', eum: '대' },
  { char: '剛', hun: '굳셀', eum: '강' },
  { char: '以', hun: '써', eum: '이' },
  { char: '直', hun: '곧을', eum: '직' },
  { char: '無', hun: '없을', eum: '무' },
  { char: '害', hun: '해할', eum: '해' },
  { char: '塞', hun: '막힐', eum: '색', note: '원문에서는 ‘가득 차다’. 변방 새' },
  { char: '于', hun: '어조사', eum: '우', note: '~에' },
  { char: '天', hun: '하늘', eum: '천' },
  { char: '地', hun: '땅', eum: '지' },
  { char: '閒', hun: '사이', eum: '간', note: '間과 같은 글자' },
  { char: '分', hun: '나눌', eum: '분' },
  { char: '若', hun: '같을', eum: '약', note: '원문에서는 ‘그대(왕)’' },
  { char: '所', hun: '바', eum: '소' },
  { char: '欲', hun: '하고자할', eum: '욕' },
  { char: '猶', hun: '오히려', eum: '유', note: '원문에서는 ‘~와 같다’' },
  { char: '因', hun: '인할', eum: '인' },
  { char: '手', hun: '손', eum: '수' },
  { char: '要', hun: '요긴할', eum: '요' },
  { char: '雖', hun: '비록', eum: '수' },
  { char: '下', hun: '아래', eum: '하' },
  { char: '易', hun: '쉬울', eum: '이', note: '바꿀 역' },
  { char: '生', hun: '날', eum: '생' },
  { char: '物', hun: '물건', eum: '물' },
  { char: '日', hun: '날', eum: '일' },
  { char: '暴', hun: '사나울', eum: '폭', note: '원문에서는 ‘볕에 쬐다(曝)’. 사나울 포' },
  { char: '未', hun: '아닐', eum: '미' },
  { char: '能', hun: '능할', eum: '능' },
  { char: '冷', hun: '찰', eum: '랭' },
];

export const MENCIUS_HEROES: Hero[] = [
  { id: 'gongsonchu', name: '공손추', hanjaName: '公孫丑', title: '맹자의 제자', skill: 'shield', skillName: '서두르지 않기', skillDesc: '다음 오답 한 번은 체력이 줄지 않는다.' },
  { id: 'maengja', name: '맹자', hanjaName: '孟子', title: '성선설의 사상가', skill: 'insight', skillName: '호연지기', skillDesc: '정답의 첫 글자를 보여 준다.' },
  { id: 'seonwang', name: '제 선왕', hanjaName: '齊宣王', title: '제나라 왕', skill: 'reveal', skillName: '바른 방법 찾기', skillDesc: '오답 보기 두 개를 지운다.' },
  { id: 'hyeokchu', name: '혁추', hanjaName: '弈秋', title: '나라 제일의 바둑 명인', skill: 'heal', skillName: '온 마음으로', skillDesc: '체력을 1 회복한다.' },
];

export const MENCIUS_EASY: Record<string, string> = {
  'mz-01': '빨리 잘되게 하려고 억지로 서두르다가 오히려 망치는 것.',
  'mz-02': '하늘과 땅을 가득 채울 만큼 크고 바르고 씩씩한 마음.',
  'mz-03': '방법이 틀려서 아무리 애써도 원하는 것을 얻을 수 없는 것.',
  'mz-04': '꾸준히 하지 않고 하다 말다 해서 이루지 못하는 것.',
};

export const MENCIUS_TERMS: { word: string; desc: string }[] = [
  { word: '굴복', desc: '힘에 눌려 상대를 따름.' },
  { word: '고니', desc: '목이 길고 하얀 큰 물새. 백조라고도 한다.' },
  { word: '명인', desc: '어떤 재주가 매우 뛰어난 사람.' },
];
