import type { Hero } from './types';

export const HEROES: Hero[] = [
  { id: 'insangyeo', name: '인상여', hanjaName: '藺相如', title: '조나라 상경', skill: 'shield', skillName: '완벽 방어', skillDesc: '다음 오답 한 번은 체력이 줄지 않는다.' },
  { id: 'yeompa', name: '염파', hanjaName: '廉頗', title: '조나라 명장', skill: 'heal', skillName: '부형청죄', skillDesc: '체력을 1 회복한다.' },
  { id: 'mosu', name: '모수', hanjaName: '毛遂', title: '평원군의 식객', skill: 'reveal', skillName: '송곳 끝', skillDesc: '오답 보기 두 개를 지운다.' },
  { id: 'jogo', name: '조고', hanjaName: '趙高', title: '진나라 권신', skill: 'insight', skillName: '사슴과 말', skillDesc: '정답의 첫 글자를 보여 준다.' },
  { id: 'hansin', name: '한신', hanjaName: '韓信', title: '한나라 대장군', skill: 'reveal', skillName: '배수진', skillDesc: '오답 보기 두 개를 지운다.' },
  { id: 'hangu', name: '항우', hanjaName: '項羽', title: '서초패왕', skill: 'shield', skillName: '역발산', skillDesc: '다음 오답 한 번은 체력이 줄지 않는다.' },
  { id: 'beomnyeo', name: '범려', hanjaName: '范蠡', title: '월나라 공신', skill: 'reveal', skillName: '물러날 때', skillDesc: '오답 보기 두 개를 지운다.' },
  { id: 'posuka', name: '포숙아', hanjaName: '鮑叔牙', title: '제나라 대부', skill: 'heal', skillName: '알아주는 벗', skillDesc: '체력을 1 회복한다.' },
  { id: 'gongja', name: '공자', hanjaName: '孔子', title: '노나라의 스승', skill: 'insight', skillName: '가르침', skillDesc: '정답의 첫 글자를 보여 준다.' },
  { id: 'jagong', name: '자공', hanjaName: '子貢', title: '공문십철', skill: 'insight', skillName: '물음', skillDesc: '정답의 첫 글자를 보여 준다.' },
];

const byId = new Map(HEROES.map((h) => [h.id, h]));

export function getHero(id: string): Hero {
  const h = byId.get(id);
  if (!h) throw new Error(`없는 인물: ${id}`);
  return h;
}
