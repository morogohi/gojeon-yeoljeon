export interface Hanja {
  char: string;
  hun: string;
  eum: string;
}

export type Book = 'sagi' | 'nonyu';

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
];
