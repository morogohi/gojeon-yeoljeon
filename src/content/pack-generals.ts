// 확장팩 1 「사기의 명장들」 — 초한전쟁의 네 고사. 『사기』 항우본기·회음후열전에서 발췌.
// 원문은 공유 저작물인 백문을 짧게 인용하고, 장면·풀이는 자체 작문. 원전에 없는 대사는 지어내지 않는다.
// 시대 순서: 先則制人(기원전 209) → 破釜沈舟(207) → 鴻門之宴(206) → 國士無雙(206)
import type { ChoiceOption, Hanja, Hero, Story } from './types';
import type { Gloss } from './gloss';

export const PACK_GENERALS = 'pack-generals';

const ok = (label: string, feedback: string): ChoiceOption => ({ label, correct: true, feedback });
const no = (label: string, feedback: string): ChoiceOption => ({ label, correct: false, feedback });

export const GENERALS_STORIES: Story[] = [
  {
    id: 'mj-01', book: 'myeongjang', pack: PACK_GENERALS, idiom: '先則制人', reading: '선즉제인',
    meaning: '먼저 하면 남을 누른다. 남보다 앞서 일을 도모하면 유리한 자리를 차지함.',
    source: '『사기』 항우본기', heroId: 'hangryang', era: '진나라 말 · 기원전 209년',
    scenes: [
      { text: '기원전 209년, 진승과 오광이 진나라의 가혹한 다스림에 맞서 들고일어났다. 그 소식에 천하가 술렁였다.' },
      { text: '남쪽 회계군의 군수 은통이 항량을 불렀다. 그는 장강 서쪽이 모두 들고일어났으니 하늘이 진나라를 망하게 하려는 때라며, 군사를 일으켜 항량과 환초를 장수로 삼겠다고 했다.' },
      {
        text: '은통은 한마디를 덧붙였다. “내가 듣기로, 먼저 하면 남을 누르고 뒤처지면 남에게 눌린다고 했소.”',
        choice: {
          prompt: '항량은 어떻게 했을까?',
          options: [
            ok('조카 항우를 불러 은통을 치고, 스스로 회계의 군사를 일으켰다', '항량은 남의 장수가 되는 대신 자기가 먼저 움직였다. 정예병 8천을 얻어, 진나라에 맞서는 싸움의 앞줄에 섰다.'),
            no('은통의 장수가 되어 명령을 기다렸다', '항량은 남의 밑에서 기다리지 않았다. 바로 그 ‘먼저’를 자기가 차지했다.'),
            no('진나라 조정에 은통을 고발했다', '항량은 진나라를 무너뜨리려는 쪽이었다.'),
          ],
        },
      },
    ],
    original: { text: '吾聞先即制人，後則爲人所制。', reading: '오문선즉제인, 후즉위인소제.', translation: '내가 듣기로, 먼저 하면 남을 누르고 뒤처지면 남에게 눌린다고 했다. (원문에서는 ‘則’ 대신 ‘即’을 썼다)' },
    related: [
      { word: '先生', reading: '선생', meaning: '먼저 배워 남을 가르치는 사람' },
      { word: '規則', reading: '규칙', meaning: '여럿이 함께 지키기로 한 법칙' },
      { word: '制度', reading: '제도', meaning: '정해 놓은 법과 규칙의 틀' },
    ],
    modern: '경쟁사보다 한발 앞서 새 서비스를 내놓은 회사가 시장을 차지했다. 선즉제인이었다.',
  },
  {
    id: 'mj-02', book: 'myeongjang', pack: PACK_GENERALS, idiom: '破釜沈舟', reading: '파부침주',
    meaning: '솥을 깨뜨리고 배를 가라앉힘. 돌아갈 길을 끊고 죽을 각오로 싸움.',
    source: '『사기』 항우본기', heroId: 'beomjeung', era: '진나라 말 · 기원전 207년',
    scenes: [
      { text: '기원전 207년, 진나라 대군이 조나라의 거록성을 에워쌌다. 조나라를 구하러 나선 초나라 군대의 상장군 송의는 안양에 이르러 46일 동안 머물며 나아가지 않았다.' },
      { text: '버금 장수였던 항우는 머뭇거리는 송의를 처단하고 스스로 군대를 이끌었다. 그리고 군사를 모두 이끌고 강을 건넜다.' },
      {
        text: '강을 건넌 뒤, 항우는 군사들 앞에서 명령을 내렸다.',
        choice: {
          prompt: '항우의 명령은?',
          options: [
            ok('배를 모두 가라앉히고, 솥과 시루를 깨뜨리고, 막사를 불태우고, 사흘 치 식량만 지니게 했다', '돌아갈 마음을 하나도 남기지 않은 초나라 군사는 아홉 번 싸워 진나라 군대를 크게 무찔렀다.'),
            no('배를 강가에 매어 두고 물러설 길을 마련했다', '항우는 정반대로, 물러설 길을 스스로 끊었다.'),
            no('진나라에 사신을 보내 화친을 청했다', '항우는 싸움으로 거록을 구했다.'),
          ],
        },
      },
    ],
    original: { text: '皆沈船，破釜甑，燒廬舍，持三日糧，以示士卒必死，無一還心。', reading: '개침선, 파부증, 소려사, 지삼일량, 이시사졸필사, 무일환심.', translation: '배를 모두 가라앉히고 솥과 시루를 깨뜨리고 막사를 불사르고 사흘 치 식량만 지니게 하여, 병사들에게 반드시 죽기로 싸울 것이며 돌아갈 마음은 하나도 없음을 보였다. (성어의 ‘舟’를 원문에서는 ‘船’으로 썼다)' },
    related: [
      { word: '破産', reading: '파산', meaning: '재산을 모두 잃고 망함' },
      { word: '沈沒', reading: '침몰', meaning: '물속에 가라앉음' },
      { word: '釜山', reading: '부산', meaning: '가마솥(釜)을 닮은 산에서 온 땅 이름' },
    ],
    modern: '마지막 기회라 여긴 팀은 파부침주의 각오로 결승전에 나섰다.',
  },
  {
    id: 'mj-03', book: 'myeongjang', pack: PACK_GENERALS, idiom: '鴻門之宴', reading: '홍문지연',
    meaning: '홍문에서 열린 잔치. 겉으로는 환대하지만 속에는 해칠 뜻이 숨은 위험한 자리.',
    source: '『사기』 항우본기', heroId: 'beonkwae', era: '초한전쟁 직전 · 기원전 206년',
    scenes: [
      { text: '기원전 206년, 유방이 항우보다 먼저 진나라 수도 함양에 들어갔다. 뒤따라온 항우는 크게 노해 유방을 치려 했다. 항우의 군사는 40만, 유방은 10만이었다.' },
      { text: '유방은 홍문에 있는 항우의 진영을 찾아가 사과했고, 항우는 잔치를 열었다. 항우의 책사 범증은 차고 있던 옥 장식을 세 번이나 들어 보이며 유방을 없애라고 신호했지만, 항우는 응하지 않았다.' },
      { text: '범증은 항우의 사촌 항장에게 칼춤을 추는 척하며 유방을 치라고 시켰다. 그러자 항백이 함께 칼을 뽑아 춤추며 몸으로 유방을 가렸다.' },
      {
        text: '다급해진 장량이 밖으로 나가 유방의 장수 번쾌에게 알렸다. “지금 항장이 칼춤을 추는데, 그 뜻은 줄곧 패공에게 있다.”',
        choice: {
          prompt: '번쾌는 어떻게 했을까?',
          options: [
            ok('칼과 방패를 들고 잔치 자리에 뛰어들어 항우를 노려보며 유방을 변호했다', '항우는 번쾌를 장사라 부르며 술과 고기를 내렸다. 그 틈에 유방은 자리를 빠져나가 살아 돌아갔다.'),
            no('밖에서 군사를 이끌고 항우의 진영을 공격했다', '군사가 훨씬 적은 쪽이 싸웠다면 모두 위험했을 것이다. 번쾌는 혼자 잔치 자리로 들어갔다.'),
            no('유방을 두고 혼자 진영으로 돌아갔다', '번쾌는 끝까지 유방 곁을 지켰다.'),
          ],
        },
      },
    ],
    original: { text: '沛公旦日從百餘騎來見項王，至鴻門。……今者項莊拔劍舞，其意常在沛公也。', reading: '패공단일종백여기래견항왕, 지홍문. …… 금자항장발검무, 기의상재패공야.', translation: '패공(유방)은 이튿날 아침 기병 백여 명을 거느리고 항왕을 만나러 와서 홍문에 이르렀다. …… (장량이 번쾌에게) “지금 항장이 칼을 뽑아 춤을 추는데, 그 뜻은 줄곧 패공에게 있다.” (‘홍문지연’은 이 잔치를 가리키는 뒷날의 이름이다)' },
    related: [
      { word: '大門', reading: '대문', meaning: '큰 문, 집의 정문' },
      { word: '宴會', reading: '연회', meaning: '여럿이 모여 베푸는 잔치' },
      { word: '專門', reading: '전문', meaning: '한 가지 일을 오로지 맡거나 깊이 앎' },
    ],
    modern: '웃으며 차린 협상 자리가 알고 보니 홍문지연이었다. 그는 끝까지 침착하게 자리를 빠져나왔다.',
  },
  {
    id: 'mj-04', book: 'myeongjang', pack: PACK_GENERALS, idiom: '國士無雙', reading: '국사무쌍',
    meaning: '나라 안에 둘도 없는 뛰어난 인재.',
    source: '『사기』 회음후열전', heroId: 'soha', era: '초한전쟁 초기 · 기원전 206년',
    scenes: [
      { text: '한신은 처음에 항우 밑에 있었지만 꾀를 내어도 쓰이지 않자, 유방에게로 왔다. 그러나 여기서도 낮은 벼슬에 머물렀다.' },
      { text: '승상 소하는 한신과 여러 번 이야기를 나누고 그가 남다른 인물임을 알아보았다. 그래도 쓰이지 못하자 한신은 끝내 달아났다. 소하는 왕에게 알릴 틈도 없이 직접 그를 뒤쫓았다.' },
      { text: '소하마저 달아난 줄 안 유방은 두 팔을 잃은 듯 크게 화를 냈다. 하루 이틀 뒤 돌아온 소하에게 유방이 물었다. 달아난 장수가 열이 넘는데 왜 한신만 쫓았느냐고.' },
      {
        text: '소하는 차분히 대답했다.',
        choice: {
          prompt: '소하의 대답은?',
          options: [
            ok('여러 장수는 얻기 쉽지만, 한신 같은 사람은 나라 안에 둘도 없습니다', '유방은 한신을 대장군으로 삼았다. 한신은 뒷날 배수진 등으로 천하를 평정하는 데 큰 공을 세웠다.'),
            no('한신은 제 친척이라 그냥 둘 수 없었습니다', '소하가 본 것은 집안이 아니라 한신의 재능이었다.'),
            no('한신이 군량을 가지고 달아났기 때문입니다', '소하가 쫓은 까닭은 오직 한신이라는 인재 때문이었다.'),
          ],
        },
      },
    ],
    original: { text: '諸將易得耳。至如信者，國士無雙。', reading: '제장이득이. 지여신자, 국사무쌍.', translation: '여러 장수는 얻기 쉬울 뿐입니다. 한신 같은 사람으로 말하면, 나라 안에 둘도 없는 인물입니다.' },
    related: [
      { word: '國家', reading: '국가', meaning: '나라' },
      { word: '博士', reading: '박사', meaning: '어떤 분야를 깊이 연구해 학위를 받은 사람' },
      { word: '無限', reading: '무한', meaning: '끝이 없음' },
    ],
    modern: '감독은 그 선수를 우리 팀의 국사무쌍이라 부르며 어떤 조건에도 내주지 않겠다고 했다.',
  },
];

/** 확장팩 성어의 한자(무료 44자와 겹치지 않는 15자. 之는 무료 성어에 이미 있다) */
export const GENERALS_HANJA: Hanja[] = [
  { char: '先', hun: '먼저', eum: '선' },
  { char: '則', hun: '곧', eum: '즉' },
  { char: '制', hun: '절제할', eum: '제' },
  { char: '人', hun: '사람', eum: '인' },
  { char: '破', hun: '깨뜨릴', eum: '파' },
  { char: '釜', hun: '가마', eum: '부' },
  { char: '沈', hun: '잠길', eum: '침' },
  { char: '舟', hun: '배', eum: '주' },
  { char: '鴻', hun: '기러기', eum: '홍' },
  { char: '門', hun: '문', eum: '문' },
  { char: '宴', hun: '잔치', eum: '연' },
  { char: '國', hun: '나라', eum: '국' },
  { char: '士', hun: '선비', eum: '사' },
  { char: '無', hun: '없을', eum: '무' },
  { char: '雙', hun: '두', eum: '쌍' },
];

/** 확장팩 원문·관련 단어의 한자 풀이 */
export const GENERALS_GLOSS: Gloss[] = [
  { char: '吾', hun: '나', eum: '오' },
  { char: '聞', hun: '들을', eum: '문' },
  { char: '即', hun: '곧', eum: '즉' },
  { char: '後', hun: '뒤', eum: '후' },
  { char: '所', hun: '바', eum: '소', note: '爲~所~: ‘~에게 ~을 당하다’' },
  { char: '皆', hun: '다', eum: '개' },
  { char: '船', hun: '배', eum: '선' },
  { char: '甑', hun: '시루', eum: '증' },
  { char: '燒', hun: '불사를', eum: '소' },
  { char: '廬', hun: '농막집', eum: '려', note: '원문에서는 군대의 막사' },
  { char: '舍', hun: '집', eum: '사' },
  { char: '持', hun: '가질', eum: '지' },
  { char: '三', hun: '석', eum: '삼' },
  { char: '日', hun: '날', eum: '일' },
  { char: '糧', hun: '양식', eum: '량' },
  { char: '以', hun: '써', eum: '이' },
  { char: '示', hun: '보일', eum: '시' },
  { char: '必', hun: '반드시', eum: '필' },
  { char: '一', hun: '한', eum: '일' },
  { char: '還', hun: '돌아올', eum: '환' },
  { char: '心', hun: '마음', eum: '심' },
  { char: '者', hun: '놈', eum: '자', note: '今者: ‘지금’' },
  { char: '項', hun: '항목', eum: '항', note: '성씨 항(項羽·項莊)' },
  { char: '莊', hun: '씩씩할', eum: '장', note: '사람 이름(項莊)' },
  { char: '拔', hun: '뽑을', eum: '발' },
  { char: '劍', hun: '칼', eum: '검' },
  { char: '舞', hun: '춤출', eum: '무' },
  { char: '其', hun: '그', eum: '기' },
  { char: '意', hun: '뜻', eum: '의' },
  { char: '常', hun: '떳떳할', eum: '상', note: '원문에서는 ‘줄곧, 늘’' },
  { char: '在', hun: '있을', eum: '재' },
  { char: '沛', hun: '늪', eum: '패', note: '沛公: 패 땅에서 일어난 유방의 호칭' },
  { char: '公', hun: '공평할', eum: '공', note: '높여 부르는 말(공)' },
  { char: '也', hun: '어조사', eum: '야' },
  { char: '旦', hun: '아침', eum: '단', note: '旦日: 이튿날 아침' },
  { char: '從', hun: '좇을', eum: '종', note: '원문에서는 ‘거느리다’' },
  { char: '百', hun: '일백', eum: '백' },
  { char: '餘', hun: '남을', eum: '여' },
  { char: '騎', hun: '말탈', eum: '기', note: '원문에서는 ‘기병’' },
  { char: '見', hun: '볼', eum: '견', note: '뵐 현' },
  { char: '王', hun: '임금', eum: '왕' },
  { char: '諸', hun: '모두', eum: '제' },
  { char: '將', hun: '장수', eum: '장' },
  { char: '易', hun: '쉬울', eum: '이', note: '바꿀 역' },
  { char: '得', hun: '얻을', eum: '득' },
  { char: '耳', hun: '귀', eum: '이', note: '문장 끝에서는 ‘~일 뿐’' },
  { char: '至', hun: '이를', eum: '지', note: '至如~: ‘~으로 말하면’' },
  { char: '信', hun: '믿을', eum: '신', note: '원문에서는 한신(韓信)의 이름' },
  { char: '生', hun: '날', eum: '생' },
  { char: '規', hun: '법', eum: '규' },
  { char: '度', hun: '법도', eum: '도' },
  { char: '産', hun: '낳을', eum: '산' },
  { char: '沒', hun: '빠질', eum: '몰' },
  { char: '山', hun: '메', eum: '산' },
  { char: '大', hun: '큰', eum: '대' },
  { char: '會', hun: '모일', eum: '회' },
  { char: '專', hun: '오로지', eum: '전' },
  { char: '家', hun: '집', eum: '가' },
  { char: '博', hun: '넓을', eum: '박' },
  { char: '限', hun: '한할', eum: '한' },
];

export const GENERALS_HEROES: Hero[] = [
  { id: 'hangryang', name: '항량', hanjaName: '項梁', title: '초나라 명문 장수', skill: 'insight', skillName: '선수', skillDesc: '정답의 첫 글자를 보여 준다.' },
  { id: 'beomjeung', name: '범증', hanjaName: '范增', title: '항우의 책사', skill: 'reveal', skillName: '옥 장식 신호', skillDesc: '오답 보기 두 개를 지운다.' },
  { id: 'beonkwae', name: '번쾌', hanjaName: '樊噲', title: '유방의 용장', skill: 'shield', skillName: '방패 돌진', skillDesc: '다음 오답 한 번은 체력이 줄지 않는다.' },
  { id: 'soha', name: '소하', hanjaName: '蕭何', title: '한나라 승상', skill: 'heal', skillName: '인재 추격', skillDesc: '체력을 1 회복한다.' },
];

export const GENERALS_EASY: Record<string, string> = {
  'mj-01': '남보다 먼저 움직이면 유리한 자리를 차지할 수 있다는 말.',
  'mj-02': '돌아갈 길을 스스로 끊고 온 힘을 다하는 굳은 각오.',
  'mj-03': '겉으로는 반겨 주지만 속으로는 해치려는 위험한 자리.',
  'mj-04': '나라 안에 둘도 없을 만큼 뛰어난 사람.',
};

export const GENERALS_TERMS: { word: string; desc: string }[] = [
  { word: '진승', desc: '진나라에 맞서 처음으로 크게 들고일어난 사람.' },
  { word: '군수', desc: '한 지방(군)을 다스리는 관리.' },
  { word: '상장군', desc: '군대 전체를 이끄는 가장 높은 장수.' },
  { word: '함양', desc: '진나라의 수도.' },
  { word: '책사', desc: '꾀를 내어 주인을 돕는 사람.' },
  { word: '패공', desc: '패 땅에서 일어난 유방을 높여 부르던 이름.' },
  { word: '승상', desc: '왕을 도와 나랏일을 맡은 가장 높은 벼슬.' },
];
