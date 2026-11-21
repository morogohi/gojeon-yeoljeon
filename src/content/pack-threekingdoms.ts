// 확장팩 5 「삼국지 정사」 — 진수 『삼국지』(정사)와 배송지 주석에서 발췌. 소설 『삼국지연의』의 장면은 쓰지 않는다.
// 원문은 공유 저작물인 백문을 짧게 인용하고, 장면·풀이는 자체 작문. 원전에 없는 대사는 지어내지 않는다.
// 정사 본문과 배송지 주석(『강표전』·『한진춘추』 인용)을 출전에서 구분해 밝힌다.
// 연의와 다른 점: 三顧草廬의 눈보라·장비의 불평 장면 등은 연의의 각색이라 넣지 않는다. 정사는 “모두 세 번 가서야 만났다”고만 적는다.
// 시대 순서: 三顧草廬(207) → 水魚之交(207~208) → 刮目相對(210년대) → 七縱七擒(225)
import type { ChoiceOption, Hanja, Hero, Story } from './types';
import type { Gloss } from './gloss';

export const PACK_THREE_KINGDOMS = 'pack-threekingdoms';

const ok = (label: string, feedback: string): ChoiceOption => ({ label, correct: true, feedback });
const no = (label: string, feedback: string): ChoiceOption => ({ label, correct: false, feedback });

export const THREE_KINGDOMS_STORIES: Story[] = [
  {
    id: 'sg-01', book: 'samguk', pack: PACK_THREE_KINGDOMS, idiom: '三顧草廬', reading: '삼고초려',
    meaning: '초가집을 세 번 찾아간다. 훌륭한 사람을 얻기 위해 정성을 다해 거듭 찾아감.',
    source: '『삼국지』 촉서 제갈량전(출사표)', heroId: 'yubi', era: '후한 말 · 207년',
    scenes: [
      { text: '후한 말, 유비는 형주에 머물며 큰 뜻을 품었지만 아직 자리 잡을 땅도 없었다. 그때 서서가 말했다. “제갈공명은 누워 있는 용, 와룡입니다. 장군께서 만나 보시겠습니까?”' },
      { text: '유비가 데려오라고 하자 서서는 고개를 저었다. “이 사람은 찾아가서 만날 수는 있어도 불러올 수는 없습니다. 장군께서 몸을 낮추어 찾아가셔야 합니다.”' },
      { text: '유비는 직접 제갈량이 사는 초가로 찾아갔다. 한 번, 두 번으로는 만나지 못했고, 모두 세 번을 찾아가서야 비로소 마주 앉을 수 있었다.' },
      {
        text: '유비는 한나라를 다시 일으킬 방법을 물었다.',
        choice: {
          prompt: '제갈량은 유비에게 어떤 계책을 들려주었을까?',
          options: [
            ok('형주와 익주를 차지하고 손권과 손잡아 조조에 맞서라', '천하를 셋으로 나누어 보는 이 계책에 유비는 감탄했고, 제갈량은 유비를 돕기로 했다. 뒷날 제갈량은 출사표에 “선제께서 신을 초가로 세 번 찾아오셨다”라고 적었다.'),
            no('조조의 힘이 너무 세니 조조 밑으로 들어가라', '제갈량은 조조와는 다툴 수 없지만 손권과 손잡으면 맞설 수 있다고 했다.'),
            no('먼저 손권을 쳐서 강동을 차지하라', '제갈량은 손권을 적이 아니라 손잡을 상대로 보았다.'),
          ],
        },
      },
    ],
    original: { text: '先帝不以臣卑鄙，猥自枉屈，三顧臣於草廬之中，諮臣以當世之事。', reading: '선제불이신비비, 외자왕굴, 삼고신어초려지중, 자신이당세지사.', translation: '선제(유비)께서는 신을 낮고 보잘것없다 여기지 않으시고, 몸소 몸을 굽혀 세 번이나 신을 초가로 찾아오시어 당대의 일을 물으셨습니다. (제갈량 「출사표」)' },
    related: [
      { word: '顧客', reading: '고객', meaning: '가게를 찾아오는 손님' },
      { word: '草木', reading: '초목', meaning: '풀과 나무' },
      { word: '三寸', reading: '삼촌', meaning: '아버지의 형제' },
    ],
    modern: '그 감독은 최고의 선수를 데려오려고 세 번이나 찾아가 설득했다. 삼고초려 끝에 계약이 이루어졌다.',
  },
  {
    id: 'sg-02', book: 'samguk', pack: PACK_THREE_KINGDOMS, idiom: '水魚之交', reading: '수어지교',
    meaning: '물과 물고기의 사귐. 떨어질 수 없을 만큼 아주 가까운 사이.',
    source: '『삼국지』 촉서 제갈량전', heroId: 'jegalryang', era: '후한 말 · 207~208년',
    scenes: [
      { text: '제갈량을 맞아들인 유비는 날마다 그와 나랏일을 의논했다. 두 사람의 사이는 날이 갈수록 가까워졌다.' },
      { text: '오랫동안 유비와 함께 싸워 온 관우와 장비는 이 모습이 못마땅했다. 새로 온 젊은이를 너무 아낀다고 여긴 것이다.' },
      {
        text: '유비는 두 사람을 불러 타일렀다.',
        choice: {
          prompt: '유비는 관우와 장비에게 뭐라고 했을까?',
          options: [
            ok('“나에게 공명이 있는 것은 물고기에게 물이 있는 것과 같다. 다시는 말하지 말라.”', '관우와 장비는 그제야 불평을 멈추었다. 물고기가 물 없이 살 수 없듯, 유비에게 제갈량은 꼭 필요한 사람이었다.'),
            no('“그대들이 싫다면 공명을 멀리하겠다.”', '유비는 제갈량을 멀리하지 않았다.'),
            no('“공명과 그대들 중 하나만 곁에 두겠다.”', '유비는 셋 모두를 아꼈고, 다만 제갈량이 꼭 필요한 이유를 물고기와 물에 빗대어 설명했다.'),
          ],
        },
      },
    ],
    original: { text: '孤之有孔明，猶魚之有水也。願諸君勿復言。', reading: '고지유공명, 유어지유수야. 원제군물부언.', translation: '내가 공명을 얻은 것은 물고기가 물을 얻은 것과 같다. 그대들은 다시는 이 일을 말하지 말기 바란다.' },
    related: [
      { word: '人魚', reading: '인어', meaning: '몸 위는 사람, 아래는 물고기인 상상 속 동물' },
      { word: '魚類', reading: '어류', meaning: '물고기 무리' },
      { word: '交通', reading: '교통', meaning: '사람이나 물건이 오가는 일' },
    ],
    modern: '어릴 때부터 서로를 가장 잘 아는 두 친구는 수어지교라 할 만했다.',
  },
  {
    id: 'sg-03', book: 'samguk', pack: PACK_THREE_KINGDOMS, idiom: '刮目相對', reading: '괄목상대',
    meaning: '눈을 비비고 다시 본다. 학식이나 재주가 몰라볼 만큼 부쩍 늚.',
    source: '『삼국지』 오서 여몽전 배송지 주(『강표전』)', heroId: 'yeomong', era: '삼국시대 · 3세기 초(오나라)',
    scenes: [
      { text: '오나라 장수 여몽은 싸움은 잘했지만 글공부는 하지 않았다. 손권이 높은 자리에 올랐으니 책을 읽으라고 권하자, 여몽은 군대 일이 바빠 시간이 없다고 했다.' },
      { text: '손권이 말했다. “그대에게 학자가 되라는 것이 아니라 지난 일을 두루 살펴보라는 것이다. 그대가 나보다 바쁘겠는가? 나도 늘 책을 읽어 크게 도움이 되었다.” 여몽은 그때부터 부지런히 공부했다.' },
      { text: '얼마 뒤 노숙이 여몽을 찾아와 이야기를 나누다가 깜짝 놀랐다. “이제 그대는 예전 오나라의 아몽이 아니구려!” 아몽은 공부하지 않던 시절의 여몽을 부르던 이름이었다.' },
      {
        text: '여몽이 빙그레 웃으며 대답했다.',
        choice: {
          prompt: '여몽은 뭐라고 대답했을까?',
          options: [
            ok('“선비는 헤어진 지 사흘이면 눈을 비비고 다시 보아야 합니다.”', '노숙은 여몽의 어머니께 절하고 벗이 되어 돌아갔다. 꾸준히 배우는 사람은 짧은 사이에도 몰라보게 달라진다.'),
            no('“저는 예전과 똑같습니다.”', '노숙이 놀랄 만큼 여몽은 달라져 있었다.'),
            no('“책은 아직 한 권도 읽지 못했습니다.”', '여몽은 손권의 말을 듣고 부지런히 공부했다.'),
          ],
        },
      },
    ],
    original: { text: '士別三日，即更刮目相待，大兄何見事之晩乎！', reading: '사별삼일, 즉갱괄목상대, 대형하견사지만호!', translation: '선비는 헤어진 지 사흘이면 곧 눈을 비비고 다시 대해야 하는데, 형님은 어찌 이제야 알아보십니까! (원문은 ‘相待’로 썼고, 성어로는 ‘相對’로 쓴다)' },
    related: [
      { word: '目標', reading: '목표', meaning: '이루려고 하는 목적이 되는 대상' },
      { word: '對話', reading: '대화', meaning: '마주 대하여 이야기를 나눔' },
      { word: '相談', reading: '상담', meaning: '문제를 풀려고 서로 의논함' },
    ],
    modern: '여름 방학 동안 날마다 그림을 연습한 친구의 실력이 괄목상대하게 늘었다.',
  },
  {
    id: 'sg-04', book: 'samguk', pack: PACK_THREE_KINGDOMS, idiom: '七縱七擒', reading: '칠종칠금',
    meaning: '일곱 번 놓아주고 일곱 번 사로잡는다. 상대가 마음으로 따르게 함.',
    source: '『삼국지』 촉서 제갈량전 배송지 주(『한진춘추』)', heroId: 'maenghoek', era: '삼국시대 · 225년(촉한)',
    scenes: [
      { text: '촉한의 승상 제갈량이 남쪽 지방을 평정하러 나섰다. 그곳 사람들에게 존경받는 우두머리 맹획을 사로잡았다.' },
      { text: '제갈량은 맹획에게 진영을 구경시켜 주고 물었다. “우리 군대가 어떠하오?” 맹획이 말했다. “전에는 사정을 몰라 졌지만, 이 정도라면 쉽게 이길 수 있겠소.”' },
      { text: '제갈량은 웃으며 맹획을 풀어 주고 다시 싸우게 했다. 그렇게 일곱 번을 놓아주고 일곱 번을 사로잡았다.' },
      {
        text: '일곱 번째에도 제갈량은 맹획을 보내 주려 했다.',
        choice: {
          prompt: '맹획은 어떻게 했을까?',
          options: [
            ok('떠나지 않고 “공은 하늘의 위엄을 지니셨으니 남쪽 사람들은 다시는 배반하지 않겠습니다” 했다', '제갈량은 남쪽 땅을 그곳 우두머리들에게 맡기고 군대를 거두었다. 힘으로 누르기보다 마음으로 따르게 한 것이다.'),
            no('또 달아나 여덟 번째 싸움을 걸었다', '맹획은 더는 싸우지 않고 마음으로 따랐다.'),
            no('몰래 제갈량을 사로잡았다', '맹획은 제갈량에게 진심으로 굴복했다.'),
          ],
        },
      },
    ],
    original: { text: '七縱七禽，而亮猶遣獲。獲止不去，曰：「公，天威也，南人不復反矣。」', reading: '칠종칠금, 이량유견획. 획지불거, 왈: 「공, 천위야, 남인불부반의.」', translation: '일곱 번 놓아주고 일곱 번 사로잡았는데도 제갈량은 또 맹획을 보내려 했다. 맹획은 머물러 떠나지 않으며 말했다. “공은 하늘의 위엄을 지니셨으니, 남쪽 사람들은 다시는 배반하지 않을 것입니다.” (원문은 ‘擒’을 ‘禽’으로 썼다)' },
    related: [
      { word: '七夕', reading: '칠석', meaning: '음력 칠월 칠일 밤' },
      { word: '放縱', reading: '방종', meaning: '제멋대로 함부로 행동함' },
    ],
    modern: '선생님은 장난이 심한 친구를 벌주기보다 몇 번이고 기회를 주며 마음을 얻었다. 칠종칠금이었다.',
  },
];

export const THREE_KINGDOMS_HANJA: Hanja[] = [
  { char: '三', hun: '석', eum: '삼' },
  { char: '顧', hun: '돌아볼', eum: '고' },
  { char: '草', hun: '풀', eum: '초' },
  { char: '廬', hun: '농막집', eum: '려' },
  { char: '魚', hun: '물고기', eum: '어' },
  { char: '刮', hun: '긁을', eum: '괄' },
  { char: '目', hun: '눈', eum: '목' },
  { char: '相', hun: '서로', eum: '상' },
  { char: '對', hun: '대할', eum: '대' },
  { char: '七', hun: '일곱', eum: '칠' },
  { char: '縱', hun: '놓을', eum: '종' },
  { char: '擒', hun: '사로잡을', eum: '금' },
];

export const THREE_KINGDOMS_GLOSS: Gloss[] = [
  { char: '帝', hun: '임금', eum: '제', note: '先帝: 돌아가신 임금(유비)' },
  { char: '不', hun: '아닐', eum: '불', note: 'ㄷ·ㅈ 앞에서는 ‘부’로 읽는다' },
  { char: '以', hun: '써', eum: '이' },
  { char: '卑', hun: '낮을', eum: '비' },
  { char: '鄙', hun: '더러울', eum: '비', note: '卑鄙: 낮고 보잘것없음' },
  { char: '猥', hun: '외람될', eum: '외', note: '원문에서는 ‘황송하게도 몸소’' },
  { char: '自', hun: '스스로', eum: '자' },
  { char: '枉', hun: '굽을', eum: '왕', note: '枉屈: 몸을 굽힘' },
  { char: '屈', hun: '굽힐', eum: '굴' },
  { char: '於', hun: '어조사', eum: '어', note: '~에' },
  { char: '中', hun: '가운데', eum: '중' },
  { char: '諮', hun: '물을', eum: '자' },
  { char: '當', hun: '마땅', eum: '당', note: '當世: 그 시대' },
  { char: '世', hun: '인간', eum: '세' },
  { char: '事', hun: '일', eum: '사' },
  { char: '客', hun: '손', eum: '객' },
  { char: '木', hun: '나무', eum: '목' },
  { char: '寸', hun: '마디', eum: '촌' },
  { char: '孤', hun: '외로울', eum: '고', note: '원문에서는 임금이 자기를 낮춰 부르는 말(나)' },
  { char: '有', hun: '있을', eum: '유' },
  { char: '孔', hun: '구멍', eum: '공', note: '孔明: 제갈량의 자' },
  { char: '明', hun: '밝을', eum: '명' },
  { char: '水', hun: '물', eum: '수' },
  { char: '願', hun: '원할', eum: '원' },
  { char: '諸', hun: '모두', eum: '제' },
  { char: '君', hun: '임금', eum: '군', note: '諸君: 여러분' },
  { char: '勿', hun: '말', eum: '물', note: '~하지 말라' },
  { char: '復', hun: '다시', eum: '부', note: '회복할 복. 원문에서는 ‘다시’라서 ‘부’로 읽는다' },
  { char: '言', hun: '말씀', eum: '언' },
  { char: '類', hun: '무리', eum: '류' },
  { char: '通', hun: '통할', eum: '통' },
  { char: '士', hun: '선비', eum: '사' },
  { char: '別', hun: '나눌', eum: '별', note: '원문에서는 ‘헤어지다’' },
  { char: '日', hun: '날', eum: '일' },
  { char: '即', hun: '곧', eum: '즉' },
  { char: '更', hun: '다시', eum: '갱', note: '고칠 경. 원문에서는 ‘다시’라서 ‘갱’으로 읽는다' },
  { char: '待', hun: '기다릴', eum: '대', note: '원문에서는 ‘대하다’' },
  { char: '大', hun: '큰', eum: '대' },
  { char: '兄', hun: '형', eum: '형' },
  { char: '何', hun: '어찌', eum: '하' },
  { char: '見', hun: '볼', eum: '견', note: '뵈올 현' },
  { char: '晩', hun: '늦을', eum: '만' },
  { char: '乎', hun: '어조사', eum: '호' },
  { char: '標', hun: '표할', eum: '표' },
  { char: '話', hun: '말씀', eum: '화' },
  { char: '談', hun: '말씀', eum: '담' },
  { char: '禽', hun: '새', eum: '금', note: '원문에서는 ‘사로잡다(擒)’' },
  { char: '亮', hun: '밝을', eum: '량', note: '제갈량의 이름' },
  { char: '猶', hun: '오히려', eum: '유', note: '원문에서는 ‘그래도 또’' },
  { char: '遣', hun: '보낼', eum: '견' },
  { char: '獲', hun: '얻을', eum: '획', note: '원문에서는 맹획의 이름' },
  { char: '止', hun: '그칠', eum: '지', note: '원문에서는 ‘머무르다’' },
  { char: '去', hun: '갈', eum: '거' },
  { char: '天', hun: '하늘', eum: '천' },
  { char: '南', hun: '남녘', eum: '남' },
  { char: '人', hun: '사람', eum: '인' },
  { char: '反', hun: '돌이킬', eum: '반', note: '원문에서는 ‘배반하다’' },
  { char: '矣', hun: '어조사', eum: '의' },
  { char: '夕', hun: '저녁', eum: '석' },
  { char: '放', hun: '놓을', eum: '방' },
];

export const THREE_KINGDOMS_HEROES: Hero[] = [
  { id: 'yubi', name: '유비', hanjaName: '劉備', title: '촉한의 소열제', skill: 'heal', skillName: '세 번의 방문', skillDesc: '체력을 1 회복한다.' },
  { id: 'jegalryang', name: '제갈량', hanjaName: '諸葛亮', title: '촉한 승상', skill: 'insight', skillName: '천하삼분', skillDesc: '정답의 첫 글자를 보여 준다.' },
  { id: 'yeomong', name: '여몽', hanjaName: '呂蒙', title: '오나라 장수', skill: 'reveal', skillName: '사흘 만의 변화', skillDesc: '오답 보기 두 개를 지운다.' },
  { id: 'maenghoek', name: '맹획', hanjaName: '孟獲', title: '남쪽 땅의 우두머리', skill: 'shield', skillName: '일곱 번의 싸움', skillDesc: '다음 오답 한 번은 체력이 줄지 않는다.' },
];

export const THREE_KINGDOMS_EASY: Record<string, string> = {
  'sg-01': '꼭 필요한 사람을 얻으려고 몇 번이고 정성껏 찾아가는 것.',
  'sg-02': '물과 물고기처럼 서로 없어서는 안 될 아주 가까운 사이.',
  'sg-03': '공부나 실력이 몰라볼 만큼 부쩍 늘었다는 말.',
  'sg-04': '힘으로 누르기보다 마음으로 따르게 만드는 것.',
};

export const THREE_KINGDOMS_TERMS: { word: string; desc: string }[] = [
  { word: '와룡', desc: '누워 있는 용. 아직 세상에 나오지 않은 큰 인물을 이르는 말.' },
  { word: '초가', desc: '짚이나 풀로 지붕을 인 집.' },
  { word: '평정', desc: '반란이나 다툼을 가라앉혀 조용하게 함.' },
  { word: '진영', desc: '군대가 머무는 곳.' },
];
