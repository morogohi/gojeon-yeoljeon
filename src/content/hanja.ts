import type { Hanja } from './types';

// 훈음은 국내 표준 훈을 따른다. 출시 전 한문학 전문가 검수 대상.
export const HANJA: Hanja[] = [
  { char: '完', hun: '완전할', eum: '완' },
  { char: '璧', hun: '구슬', eum: '벽' },
  { char: '歸', hun: '돌아갈', eum: '귀' },
  { char: '趙', hun: '조나라', eum: '조' },
  { char: '刎', hun: '목 벨', eum: '문' },
  { char: '頸', hun: '목', eum: '경' },
  { char: '之', hun: '갈', eum: '지' },
  { char: '交', hun: '사귈', eum: '교' },
  { char: '囊', hun: '주머니', eum: '낭' },
  { char: '中', hun: '가운데', eum: '중' },
  { char: '錐', hun: '송곳', eum: '추' },
  { char: '指', hun: '가리킬', eum: '지' },
  { char: '鹿', hun: '사슴', eum: '록' },
  { char: '爲', hun: '할', eum: '위' },
  { char: '馬', hun: '말', eum: '마' },
  { char: '背', hun: '등', eum: '배' },
  { char: '水', hun: '물', eum: '수' },
  { char: '陣', hun: '진 칠', eum: '진' },
  { char: '四', hun: '넉', eum: '사' },
  { char: '面', hun: '낯', eum: '면' },
  { char: '楚', hun: '초나라', eum: '초' },
  { char: '歌', hun: '노래', eum: '가' },
  { char: '兔', hun: '토끼', eum: '토' },
  { char: '死', hun: '죽을', eum: '사' },
  { char: '狗', hun: '개', eum: '구' },
  { char: '烹', hun: '삶을', eum: '팽' },
  { char: '管', hun: '대롱', eum: '관' },
  { char: '鮑', hun: '절인 물고기', eum: '포' },
  { char: '溫', hun: '따뜻할', eum: '온' },
  { char: '故', hun: '연고', eum: '고' },
  { char: '知', hun: '알', eum: '지' },
  { char: '新', hun: '새', eum: '신' },
  { char: '過', hun: '지날', eum: '과' },
  { char: '猶', hun: '오히려', eum: '유' },
  { char: '不', hun: '아닐', eum: '불' },
  { char: '及', hun: '미칠', eum: '급' },
  { char: '巧', hun: '공교할', eum: '교' },
  { char: '言', hun: '말씀', eum: '언' },
  { char: '令', hun: '하여금', eum: '령' },
  { char: '色', hun: '빛', eum: '색' },
  { char: '後', hun: '뒤', eum: '후' },
  { char: '生', hun: '날', eum: '생' },
  { char: '可', hun: '옳을', eum: '가' },
  { char: '畏', hun: '두려워할', eum: '외' },
];

const byChar = new Map(HANJA.map((h) => [h.char, h]));

export function getHanja(char: string): Hanja {
  const h = byChar.get(char);
  if (!h) throw new Error(`사전에 없는 한자: ${char}`);
  return h;
}

export function hunEum(h: Hanja): string {
  return `${h.hun} ${h.eum}`;
}

/** 성어 독음에서 두음법칙 등으로 사전 음과 달라지는 자리. key = `${idiom}:${index}` */
export const READING_EXCEPTIONS: Record<string, string> = {
  '巧言令色:2': '영',
};
