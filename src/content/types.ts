export interface Hanja {
  char: string;
  hun: string;
  eum: string;
}

export type Book = 'sagi' | 'nonyu' | 'myeongjang' | 'chaeksa' | 'uhwa';

export interface ChoiceOption {
  label: string;
  correct: boolean;
  feedback: string;
}

export interface Scene {
  text: string;
  choice?: { prompt: string; options: ChoiceOption[] };
}

export interface RelatedWord {
  word: string;
  reading: string;
  meaning: string;
}

export interface Story {
  id: string;
  book: Book;
  idiom: string;
  reading: string;
  meaning: string;
  source: string;
  heroId: string;
  scenes: Scene[];
  /** text: 백문, reading: 한글 독음(문장부호 위치를 맞춘다), translation: 풀이 */
  original: { text: string; reading: string; translation: string };
  related: RelatedWord[];
  modern: string;
  /** 시대 배경(예: 전국시대 · 기원전 283년 무렵) */
  era?: string;
  /** 확장팩 id. 없으면 무료 고사 */
  pack?: string;
}

export type SkillKind = 'shield' | 'heal' | 'reveal' | 'insight';

export interface Hero {
  id: string;
  name: string;
  hanjaName: string;
  title: string;
  skill: SkillKind;
  skillName: string;
  skillDesc: string;
}

export const BOOKS: { id: Book; name: string; hanja: string }[] = [
  { id: 'sagi', name: '사기', hanja: '史記' },
  { id: 'nonyu', name: '논어', hanja: '論語' },
  { id: 'myeongjang', name: '명장', hanja: '名將' },
  { id: 'chaeksa', name: '책사', hanja: '策士' },
  { id: 'uhwa', name: '우화', hanja: '寓話' },
];
