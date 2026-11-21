// 그림으로 보는 유래: 고사마다 네 컷(시작 → 일 → 고비 → 결말)과 쉬운 설명.
// 그림은 인라인 SVG(외부 이미지 없음). 설명은 『사기』·『논어』 원전 내용만 쉽게 옮기고 지어내지 않는다.
import { INK, WASH, RED, JADE, GOLD, PAPER, WOOD, fig, arrow, flame, shaft } from './art';

export interface Panel { svg: string; caption: string }

const W = 160;
const H = 100;
const SKY = '#2b3550';

/** 한 컷. night = 밤 장면 */
const panel = (body: string, night = false) =>
  `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" font-family="'Noto Sans KR','Noto Serif KR',sans-serif">` +
  `<rect width="${W}" height="${H}" rx="8" fill="${night ? SKY : PAPER}"/>` +
  `<path d="M0 92 H${W}" stroke="${night ? '#c9c2b0' : INK}" stroke-opacity=".3" stroke-width="1.2"/>` + body + '</svg>';

// ── 작은 그림 조각 ──
const p = (x: number, y: number, s = 0.62, dir = 1, arm: Parameters<typeof fig>[4] = 'down', robe = INK) => fig(x, y, s, dir, arm, robe);
const jade = (x: number, y: number, r = 9) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${JADE}"/><circle cx="${x}" cy="${y}" r="${r * 0.35}" fill="${PAPER}"/>`;
const bubble = (x: number, y: number, text: string, w = 0) => {
  const bw = w || 12 + [...text].length * 9;
  return `<g transform="translate(${x},${y})"><rect x="${-bw / 2}" y="-11" width="${bw}" height="20" rx="8" fill="#fffaf0" stroke="${INK}" stroke-width="1.2"/>` +
    `<path d="M-4 9 L-8 16 L3 9Z" fill="#fffaf0" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/><rect x="-6" y="7" width="12" height="3" fill="#fffaf0"/>` +
    `<text y="4" text-anchor="middle" font-size="11" font-weight="700" fill="${INK}">${text}</text></g>`;
};
const label = (x: number, y: number, text: string, color = INK, size = 10) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="700" fill="${color}">${text}</text>`;
const roof = (x: number, y: number, w = 60, color = INK) =>
  `<path d="M${x - w / 2 - 6} ${y} Q${x} ${y - 14} ${x + w / 2 + 6} ${y} Z" fill="${color}" opacity=".85"/><rect x="${x - w / 2}" y="${y}" width="${w}" height="4" fill="${WOOD}"/>` +
  `<path d="M${x - w / 2 + 4} ${y + 4} V92 M${x + w / 2 - 4} ${y + 4} V92" stroke="${WOOD}" stroke-width="3"/>`;
const castle = (x: number, y = 92, w = 30, flagColor = RED) =>
  `<path d="M${x - w / 2} ${y} V${y - 20} h5 v-5 h5 v5 h${w - 20} v-5 h5 v5 h5 V${y}Z" fill="${INK}" opacity=".75"/>` +
  `<path d="M${x} ${y - 25} V${y - 38}" stroke="${INK}" stroke-width="1.5"/><path d="M${x} ${y - 38} h10 l-3 4 l3 4 h-10z" fill="${flagColor}"/>`;
const flag = (x: number, y: number, text: string, color = RED) =>
  `<path d="M${x} ${y} V${y - 34}" stroke="${INK}" stroke-width="1.6"/><rect x="${x}" y="${y - 34}" width="18" height="14" fill="${color}"/>` +
  `<text x="${x + 9}" y="${y - 23}" text-anchor="middle" font-size="10" font-weight="700" fill="#fbefe4" font-family="'Noto Serif KR',serif">${text}</text>`;
const river = (y = 80) =>
  `<path d="M0 ${y} Q20 ${y - 4} 40 ${y} T80 ${y} T120 ${y} T160 ${y} V100 H0Z" fill="#6b9bb5" opacity=".55"/>`;
const tent = (x: number, y = 92, s = 1, color = INK) =>
  `<path transform="translate(${x},${y}) scale(${s})" d="M-14 0 L0 -20 L14 0Z" fill="${color}" opacity=".7"/>`;
const moon = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="8" fill="#f5e6b8"/><circle cx="${x + 4}" cy="${y - 3}" r="7" fill="${SKY}"/>`;
const note = (x: number, y: number) =>
  `<g transform="translate(${x},${y})" fill="#f5e6b8"><ellipse cx="0" cy="0" rx="3.2" ry="2.4"/><path d="M3 0 V-11 l5 2" stroke="#f5e6b8" stroke-width="1.4" fill="none"/></g>`;
const cart = (x: number, y = 92, dir = 1) =>
  `<g transform="translate(${x},${y}) scale(${dir},1)"><rect x="-16" y="-16" width="26" height="10" rx="2" fill="${WOOD}"/><circle cx="-8" cy="-5" r="5" fill="none" stroke="${INK}" stroke-width="2"/><path d="M10 -11 H22" stroke="${WOOD}" stroke-width="2.5"/></g>`;
const deer = (x: number, y = 92) =>
  `<g transform="translate(${x},${y})" fill="${WOOD}"><ellipse cx="0" cy="-18" rx="14" ry="7"/><path d="M-10 -12 V0 M-4 -12 V0 M6 -12 V0 M11 -12 V0" stroke="${WOOD}" stroke-width="2.5"/>` +
  `<path d="M10 -22 L16 -34" stroke="${WOOD}" stroke-width="4"/><ellipse cx="18" cy="-36" rx="6" ry="3.6"/>` +
  `<path d="M16 -39 l-3 -9 m1 4 l-5 -2 M20 -39 l3 -9 m-1 4 l5 -2" stroke="${INK}" stroke-width="1.4" fill="none"/></g>`;
const dog = (x: number, y = 92, color = INK) =>
  `<g transform="translate(${x},${y})" fill="${color}" opacity=".85"><ellipse cx="0" cy="-12" rx="11" ry="5"/><path d="M-7 -8 V0 M7 -8 V0" stroke="${color}" stroke-width="2.5"/>` +
  `<circle cx="11" cy="-18" r="4.5"/><path d="M13 -22 l3 -5 l1 6Z"/><path d="M-11 -13 l-6 -5" stroke="${color}" stroke-width="2"/></g>`;
const rabbit = (x: number, y = 92) =>
  `<g transform="translate(${x},${y})" fill="#b9a789"><ellipse cx="0" cy="-6" rx="7" ry="5"/><circle cx="6" cy="-11" r="3.5"/><path d="M6 -14 l-1 -9 M8 -14 l2 -8" stroke="#b9a789" stroke-width="2.2"/></g>`;
const bow = (x: number, y: number) => `<path d="M${x} ${y - 14} Q${x + 10} ${y} ${x} ${y + 14}" stroke="${WOOD}" stroke-width="2.5" fill="none"/><path d="M${x} ${y - 14} V${y + 14}" stroke="${INK}" stroke-width="1"/>`;
const book = (x: number, y: number, color = JADE) =>
  `<g transform="translate(${x},${y})"><path d="M-14 0 Q-7 -4 0 0 Q7 -4 14 0 V14 Q7 10 0 14 Q-7 10 -14 14Z" fill="${color}" opacity=".85"/><path d="M0 0 V14" stroke="${PAPER}" stroke-width="1.2"/></g>`;
const bulb = (x: number, y: number) =>
  `<g transform="translate(${x},${y})"><circle r="8" fill="#f2c14e"/><rect x="-3.5" y="7" width="7" height="5" fill="${INK}" opacity=".7"/>` +
  `<path d="M0 -14 V-18 M11 -9 l3 -3 M-11 -9 l-3 -3 M14 0 h4 M-14 0 h-4" stroke="${GOLD}" stroke-width="1.6" stroke-linecap="round"/></g>`;
const cup = (x: number, y: number, fill: number, spill = false) => {
  // 잔: 아래 폭 14, 위 폭 20, 높이 24. fill(0~1)만큼 물이 찬다. spill이면 넘쳐흐른다.
  const top = -24 * Math.min(fill, 1);
  const half = 7 + 3 * Math.min(fill, 1);
  return `<g transform="translate(${x},${y})">` +
    `<path d="M-7 0 L${-half} ${top} H${half} L7 0Z" fill="#6b9bb5" opacity=".8"/>` +
    (spill ? `<path d="M-10 -24 Q-13 -20 -12 -12 M10 -24 Q14 -18 13 -8" stroke="#6b9bb5" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="14" cy="-2" r="1.8" fill="#6b9bb5"/><circle cx="-13" cy="-4" r="1.6" fill="#6b9bb5"/>` : '') +
    `<path d="M-10 -24 L-7 0 H7 L10 -24" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/></g>`;
};
const sprout = (x: number, y = 92) =>
  `<path d="M${x} ${y} V${y - 12}" stroke="${JADE}" stroke-width="2"/><path d="M${x} ${y - 9} Q${x - 9} ${y - 16} ${x - 10} ${y - 10} Q${x - 4} ${y - 6} ${x} ${y - 9}Z M${x} ${y - 12} Q${x + 9} ${y - 20} ${x + 10} ${y - 13} Q${x + 4} ${y - 9} ${x} ${y - 12}Z" fill="${JADE}"/>`;
const tree = (x: number, y = 92, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><path d="M0 0 V-30" stroke="${WOOD}" stroke-width="5"/><circle cy="-40" r="16" fill="${JADE}" opacity=".9"/><circle cx="-12" cy="-30" r="10" fill="${JADE}" opacity=".8"/><circle cx="12" cy="-30" r="10" fill="${JADE}" opacity=".8"/></g>`;
const heart = (x: number, y: number, s = 1, color = RED) =>
  `<path transform="translate(${x},${y}) scale(${s})" d="M0 6 C-10 -2 -8 -10 -3 -10 C0 -10 0 -7 0 -6 C0 -7 0 -10 3 -10 C8 -10 10 -2 0 6Z" fill="${color}"/>`;
const sparkle = (x: number, y: number) =>
  `<path transform="translate(${x},${y})" d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5Z" fill="${GOLD}"/>`;
const coins = (x: number, y: number, n: number) =>
  Array.from({ length: n }, (_, i) => `<ellipse cx="${x}" cy="${y - i * 4}" rx="7" ry="2.6" fill="${GOLD}" stroke="${INK}" stroke-width=".6"/>`).join('');
const thorns = (x: number, y: number) =>
  `<g transform="translate(${x},${y})"><path d="M-12 -4 L12 -14 M-12 0 L12 -10 M-10 4 L12 -6" stroke="${WOOD}" stroke-width="2.4"/><path d="M-4 -8 l-2 -4 M4 -12 l1 -4 M0 -2 l-2 -4 M8 -6 l2 -3" stroke="${WOOD}" stroke-width="1.4"/></g>`;
const sword = (x: number, y: number) => `<path d="M${x} ${y} l18 -18" stroke="#8d97a3" stroke-width="3" stroke-linecap="round"/><path d="M${x + 2} ${y - 7} l7 7" stroke="${INK}" stroke-width="2.5"/>`;
const bag = (x: number, y: number) =>
  `<g transform="translate(${x},${y})"><path d="M-14 -4 Q-18 18 0 20 Q18 18 14 -4 Q0 -10 -14 -4Z" fill="#b9a789" stroke="${INK}" stroke-width="1.2"/><path d="M-12 -4 Q0 2 12 -4" stroke="${INK}" stroke-width="1.2" fill="none"/>` +
  `<path d="M6 -6 L14 -26" stroke="#8d97a3" stroke-width="3" stroke-linecap="round"/><path d="M13 -24 l2 -6 l1 6" fill="#8d97a3"/></g>`;


const fox = (x: number, y = 92) =>
  `<g transform="translate(${x},${y})" fill="#c8742e"><ellipse cx="0" cy="-9" rx="11" ry="5.5"/><circle cx="11" cy="-16" r="5"/><path d="M9 -20 l1 -6 l4 5z M13 -20 l4 -5 l1 6z"/><path d="M-11 -9 q-11 -4 -12 -14 q7 3 11 8"/><path d="M-6 -5 V0 M6 -5 V0" stroke="#c8742e" stroke-width="2"/></g>`;
const tiger = (x: number, y = 92) =>
  `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-16" rx="22" ry="10" fill="#d9a441"/><path d="M-12 -25 v16 M-3 -26 v18 M6 -26 v18 M14 -24 v14" stroke="${INK}" stroke-width="2" opacity=".7"/>` +
  `<circle cx="22" cy="-24" r="9" fill="#d9a441"/><circle cx="25" cy="-26" r="1.3" fill="${INK}"/><path d="M-14 -7 V0 M-5 -6 V0 M7 -6 V0 M15 -7 V0" stroke="#d9a441" stroke-width="4"/><path d="M-22 -16 q-10 -4 -9 -14" stroke="#d9a441" stroke-width="3" fill="none"/></g>`;
const snake = (x: number, y: number) =>
  `<path d="M${x - 24} ${y} q8 -10 16 0 t16 0 t16 0" stroke="${JADE}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="${x + 25}" cy="${y - 2}" r="3.5" fill="${JADE}"/>`;
const clam = (x: number, y = 88) =>
  `<g transform="translate(${x},${y})"><path d="M-11 0 Q0 -12 11 0Z" fill="#b9a789" stroke="${INK}" stroke-width="1"/><path d="M-11 0 Q0 5 11 0" fill="#d8cbb0" stroke="${INK}" stroke-width="1"/></g>`;
const snipe = (x: number, y = 70) =>
  `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="9" ry="5" fill="${WOOD}"/><circle cx="-8" cy="-4" r="3.5" fill="${WOOD}"/><path d="M-11 -3 L-22 14" stroke="${INK}" stroke-width="1.6"/><path d="M2 5 V12 M-2 5 V12" stroke="${INK}" stroke-width="1"/></g>`;
const mountain = (x: number, top: number) =>
  `<path d="M${x - 44} 92 L${x} ${top} L${x + 44} 92Z" fill="${INK}" opacity=".55"/><path d="M${x + 4} 92 L${x + 30} ${top + 24} L${x + 56} 92Z" fill="${INK}" opacity=".35"/>`;

const stump = (x: number, y = 92) =>
  `<path d="M${x - 9} ${y} V${y - 12} h18 V${y}" fill="${WOOD}"/><ellipse cx="${x}" cy="${y - 12}" rx="9" ry="3" fill="#c9a47a" stroke="${WOOD}"/>`;
const horse = (x: number, y = 92, color = '#9a8a78') =>
  `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-20" rx="16" ry="7" fill="${color}"/><path d="M12 -24 L22 -36" stroke="${color}" stroke-width="5" stroke-linecap="round"/><ellipse cx="25" cy="-37" rx="6" ry="3.5" fill="${color}" transform="rotate(25 25 -37)"/>` +
  `<path d="M-11 -14 V0 M-4 -14 V0 M5 -14 V0 M12 -14 V0" stroke="${color}" stroke-width="3"/><path d="M-16 -21 q-7 3 -6 11" stroke="${color}" stroke-width="2" fill="none"/></g>`;
const flute = (x: number, y: number) => `<path d="M${x} ${y} l9 -6" stroke="${GOLD}" stroke-width="2.4" stroke-linecap="round"/>`;

const hut = (x: number, y = 92) =>
  `<path d="M${x - 24} ${y - 26} Q${x} ${y - 44} ${x + 24} ${y - 26}Z" fill="#c9a96a"/><rect x="${x - 20}" y="${y - 26}" width="40" height="26" fill="#e2d3b2" stroke="${WOOD}"/><rect x="${x - 5}" y="${y - 16}" width="10" height="16" fill="${WOOD}" opacity=".7"/>`;
const fish = (x: number, y: number, color = GOLD) =>
  `<g transform="translate(${x},${y})"><ellipse rx="10" ry="4.5" fill="${color}"/><path d="M9 0 l7 -5 v10z" fill="${color}"/><circle cx="-5" cy="-1" r="1.2" fill="${INK}"/></g>`;

const seedling = (x: number, y = 92, wilted = false) =>
  wilted
    ? `<path d="M${x} ${y} V${y - 10} q-2 -4 -8 -2 M${x} ${y - 10} q4 -2 6 4" stroke="#a89a6a" stroke-width="1.8" fill="none"/>`
    : `<path d="M${x} ${y} V${y - 10}" stroke="${JADE}" stroke-width="1.8"/><path d="M${x} ${y - 8} q-6 -5 -8 0 M${x} ${y - 8} q6 -5 8 0" stroke="${JADE}" stroke-width="1.8" fill="none"/>`;
const snowflake = (x: number, y: number) => `<text x="${x}" y="${y}" font-size="10" fill="#6b9bb5">❄</text>`;
const go = (x: number, y: number) =>
  `<rect x="${x - 18}" y="${y - 10}" width="36" height="20" fill="#d8b77a" stroke="${WOOD}"/>` + [[-8, -3, INK], [4, -3, '#f4f1ea'], [-2, 4, INK], [10, 4, '#f4f1ea']].map(([dx, dy, c]) => `<circle cx="${x + Number(dx)}" cy="${y + Number(dy)}" r="2.6" fill="${c}" stroke="${INK}" stroke-width=".4"/>`).join('');

export const STORYBOARD: Record<string, Panel[]> = {
  'sagi-01': [
    { caption: '조나라 왕이 세상에 둘도 없는 보물 구슬 ‘화씨벽’을 얻었어요.', svg: panel(roof(52, 46, 50) + p(52, 92, 0.6, 1, 'up', '#7a2e22') + jade(66, 40, 8) + sparkle(84, 30) + sparkle(42, 28) + label(122, 40, '조나라', INK, 11)) },
    { caption: '힘센 진나라 왕이 “성 열다섯 개와 바꾸자”고 했어요. 거절하면 쳐들어올 핑계가 되고, 주면 구슬만 빼앗길 수도 있었지요.', svg: panel(castle(36) + castle(60) + label(48, 18, '성 ×15', RED, 11) + arrow(76, 50, 100, 50) + jade(118, 50, 9) + p(140, 92, 0.6, -1, 'point') + bubble(118, 22, '바꾸자!')) },
    { caption: '사신 인상여는 진나라 왕이 성을 줄 생각이 없다는 걸 알아챘어요. “흠이 있다”며 구슬을 돌려받고는, 기둥 앞에서 구슬과 함께 머리를 부딪치겠다고 버텼어요.', svg: panel(`<rect x="28" y="20" width="12" height="72" fill="#7a2e22" opacity=".85"/>` + p(62, 92, 0.65, 1, 'up') + jade(74, 34, 8) + p(130, 92, 0.6, -1, 'reach', '#5a4a3a') + bubble(120, 30, '앗!')) },
    { caption: '인상여는 몰래 부하에게 구슬을 맡겨 조나라로 돌려보냈어요. 구슬은 흠 하나 없이 돌아왔어요. 그래서 ‘완벽’이라는 말이 생겼어요.', svg: panel(p(40, 92, 0.55, 1, 'reach') + jade(56, 64, 6) + `<path d="M58 70 Q96 40 128 60" stroke="${INK}" stroke-dasharray="4 4" fill="none" stroke-width="1.5"/>` + arrow(122, 56, 130, 62) + castle(136) + label(136, 18, '조나라', RED, 10)) },
  ],
  'sagi-02': [
    { caption: '구슬을 지킨 공으로 인상여는 아주 높은 자리에 올랐어요. 싸움터에서 큰 공을 세운 장수 염파보다도 높아졌지요.', svg: panel(`<path d="M30 92 V62 h30 V92" fill="${GOLD}" opacity=".35"/><path d="M90 92 V74 h30 V92" fill="${INK}" opacity=".15"/>` + p(45, 62, 0.6, 1, 'down') + p(105, 74, 0.6, -1, 'down', '#5a3a2a') + label(45, 18, '인상여', INK) + label(105, 30, '염파', '#5a3a2a')) },
    { caption: '염파는 “말솜씨로 높아졌다”며 화가 났어요. 하지만 인상여는 다투지 않고 염파를 피했어요. 길에서 만나면 수레를 돌렸지요.', svg: panel(p(124, 92, 0.65, -1, 'point', '#5a3a2a') + bubble(116, 22, '두고 보자!', 64) + cart(56, 92, -1) + p(38, 92, 0.55, -1, 'down')) },
    { caption: '부하들이 겁쟁이라고 하자 인상여가 말했어요. “진나라가 조나라를 못 치는 건 우리 둘이 있어서다. 두 호랑이가 싸우면 둘 다 다친다.”', svg: panel(p(40, 92, 0.65, 1, 'point') + bubble(92, 26, '나라가 먼저!', 72) + p(118, 92, 0.55, -1) + p(140, 92, 0.55, -1)) },
    { caption: '이 말을 들은 염파는 가시나무를 등에 지고 찾아와 용서를 빌었어요. 두 사람은 목숨을 함께할 만큼 깊은 친구가 되었어요.', svg: panel(p(56, 92, 0.6, 1, 'reach', '#5a3a2a') + thorns(48, 56) + p(104, 92, 0.6, -1, 'reach') + heart(80, 40, 1.2)) },
  ],
  'sagi-03': [
    { caption: '진나라 군대가 조나라 서울을 에워쌌어요. 평원군은 초나라에 도움을 청하러 갈 사람 스무 명을 고르는데, 한 명이 모자랐어요.', svg: panel(castle(80, 92, 34) + tent(30) + tent(130) + tent(50, 92, 0.7) + tent(110, 92, 0.7) + label(80, 16, '19 / 20', RED, 12)) },
    { caption: '모수가 “저를 데려가 주십시오” 하고 나섰어요. 평원군은 “재주 있는 사람은 주머니 속 송곳처럼 끝이 튀어나오는데, 3년 동안 그대 이름을 못 들었다”고 했어요.', svg: panel(p(44, 92, 0.65, 1, 'up') + bubble(60, 20, '저요!') + p(124, 92, 0.65, -1, 'down', '#5a4a3a') + bag(98, 56)) },
    { caption: '모수가 대답했어요. “그러니 오늘 저를 주머니에 넣어 주십시오. 일찍 넣어 주셨다면 손잡이까지 다 나왔을 겁니다.”', svg: panel(bag(80, 52) + `<path d="M94 26 l8 -16" stroke="#8d97a3" stroke-width="5" stroke-linecap="round"/>` + sparkle(110, 12) + sparkle(60, 20) + p(36, 92, 0.55, 1, 'point')) },
    { caption: '초나라에서 이야기가 꽉 막히자 모수가 앞으로 나가 초나라 왕을 설득했어요. 마침내 초나라가 조나라를 돕기로 했어요.', svg: panel(roof(110, 44, 52) + p(110, 92, 0.6, -1, 'down', '#5a4a3a') + p(52, 92, 0.65, 1, 'point') + bubble(84, 20, '함께 막읍시다!', 82) + `<path d="M72 80 h14" stroke="${INK}" stroke-width="1.5"/>`) },
  ],
  'sagi-04': [
    { caption: '진나라 첫 황제가 죽자, 궁궐의 관리 조고가 어린 황제를 세우고 권력을 손에 쥐었어요.', svg: panel(roof(80, 40, 70) + p(66, 92, 0.55, 1, 'down', GOLD) + p(98, 92, 0.65, -1, 'reach', '#3a3a5a') + label(98, 18, '조고', '#3a3a5a', 11)) },
    { caption: '조고는 신하들이 자기편인지 알아보려고, 황제에게 사슴을 바치며 “말입니다”라고 했어요.', svg: panel(deer(70) + p(118, 92, 0.65, -1, 'point', '#3a3a5a') + bubble(108, 24, '말입니다') + label(66, 30, '?', RED, 16)) },
    { caption: '황제가 웃으며 신하들에게 물었어요. 조고가 무서운 신하들은 “말”이라고 했고, 바른 신하들은 “사슴”이라고 했어요.', svg: panel(p(30, 92, 0.5) + p(52, 92, 0.5) + bubble(42, 30, '말!') + p(108, 92, 0.5, -1) + p(130, 92, 0.5, -1) + bubble(118, 30, '사슴!', 42)) },
    { caption: '조고는 “사슴”이라고 바른말 한 사람들을 몰래 벌주었어요. 그 뒤로는 아무도 조고에게 맞서지 못했어요. 힘으로 거짓을 참이라고 우긴 거예요.', svg: panel(p(118, 92, 0.65, -1, 'point', '#3a3a5a') + p(40, 92, 0.5, 1, 'down', '#8a8070') + p(62, 92, 0.5, 1, 'down', '#8a8070') + `<path d="M28 30 h44" stroke="${INK}" stroke-width="1.5"/>` + label(50, 26, '…', INK, 14)) },
  ],
  'sagi-05': [
    { caption: '한나라 장수 한신은 군사가 훨씬 많은 조나라 대군과 싸워야 했어요.', svg: panel(Array.from({ length: 6 }, (_, i) => tent(96 + (i % 3) * 22, 92 - Math.floor(i / 3) * 14, 0.8)).join('') + label(118, 20, '조나라 대군', RED, 10) + p(36, 92, 0.6, 1, 'point') + label(36, 22, '한신', INK)) },
    { caption: '한신은 군사 1만 명에게 강을 등지고 진을 치게 했어요. 도망칠 곳이 없는 자리였죠. 조나라 군사들은 “병법도 모른다”며 비웃었어요.', svg: panel(river(84) + `<rect x="0" y="70" width="160" height="10" fill="${PAPER}"/>` + p(36, 80, 0.5) + p(54, 80, 0.5) + p(72, 80, 0.5) + flag(90, 80, '漢') + bubble(126, 26, '하하!')) },
    { caption: '물러설 곳이 없는 병사들은 있는 힘을 다해 싸웠어요. 그사이 몰래 숨겨 둔 기병이 조나라 성에 한나라 깃발을 꽂았어요.', svg: panel(castle(118, 92, 36, '#2f5d7a') + flag(126, 54, '漢') + p(40, 92, 0.6, 1, 'up') + sword(46, 52) + p(70, 92, 0.6, 1, 'up')) },
    { caption: '조나라 군대는 무너졌어요. 한신은 “죽을 수밖에 없는 자리에 두어야 살길을 찾는다”고 말했어요.', svg: panel(p(80, 92, 0.65, 1, 'up') + flag(96, 92, '漢') + bubble(60, 24, '이겼다!') + sparkle(30, 30) + sparkle(130, 26)) },
  ],
  'sagi-06': [
    { caption: '천하를 다투던 초나라 장수 항우가 해하라는 곳에서 한나라 군대에 겹겹이 둘러싸였어요. 군사도 식량도 모자랐어요.', svg: panel(tent(80, 92, 1.3, RED) + [20, 44, 116, 140].map((x) => tent(x, 92, 0.8)).join('') + p(80, 70, 0.4, 1, 'down', RED), true) },
    { caption: '깊은 밤, 사방의 적 진영에서 초나라 노래가 들려왔어요.', svg: panel(moon(130, 20) + tent(80, 92, 1.2, RED) + [22, 48, 112, 138].map((x) => tent(x, 92, 0.8)).join('') + note(30, 50) + note(52, 40) + note(110, 42) + note(134, 54), true) },
    { caption: '항우는 깜짝 놀랐어요. “한나라가 초나라 땅을 다 차지했나? 적 속에 초나라 사람이 왜 이리 많지?”', svg: panel(moon(130, 20) + p(80, 92, 0.7, 1, 'up', RED) + bubble(80, 26, '?!') + note(30, 50) + note(134, 54), true) },
    { caption: '도와줄 사람이 하나도 없다고 느낀 항우는 끝내 다시 일어서지 못했어요. 사방이 막혀 혼자가 된 처지를 ‘사면초가’라고 해요.', svg: panel(p(80, 92, 0.6, -1, 'down', RED) + `<path d="M20 92 Q80 70 140 92" stroke="#c9c2b0" stroke-dasharray="3 5" fill="none"/>` + [20, 140, 50, 110].map((x, i) => tent(x, 92, 0.6 + (i % 2) * 0.1)).join(''), true) },
  ],
  'sagi-07': [
    { caption: '월나라 왕 구천은 신하 범려와 문종의 도움으로 원수인 오나라를 무너뜨렸어요.', svg: panel(roof(80, 44, 50) + p(80, 92, 0.6, 1, 'up', GOLD) + p(44, 92, 0.55) + p(116, 92, 0.55, -1) + label(44, 30, '범려') + label(116, 30, '문종')) },
    { caption: '이긴 뒤 범려는 높은 벼슬을 버리고 조용히 떠났어요.', svg: panel(roof(36, 46, 40) + `<path d="M60 92 Q110 80 150 86" stroke="${INK}" stroke-dasharray="4 4" fill="none"/>` + p(118, 92, 0.6, 1, 'down') + tree(150, 92, 0.6)) },
    { caption: '범려는 문종에게 편지를 보냈어요. “새를 다 잡으면 활은 치워 두고, 토끼를 다 잡으면 사냥개는 삶아 먹는다.”', svg: panel(rabbit(30) + `<path d="M24 74 l14 -4" stroke="${RED}" stroke-width="1.6"/>` + dog(76) + bow(112, 66) + `<rect x="126" y="40" width="26" height="34" fill="#fffaf0" stroke="${INK}"/><path d="M130 48 h18 M130 54 h18 M130 60 h12" stroke="${INK}" stroke-width="1"/>`) },
    { caption: '문종은 떠나지 않았다가 왕의 의심을 받아 비참하게 버림받았어요. 쓸모가 다하면 버림받는 것을 ‘토사구팽’이라고 해요.', svg: panel(roof(52, 44, 50) + p(52, 92, 0.6, 1, 'point', GOLD) + p(118, 92, 0.6, -1, 'down', '#8a8070') + dog(140, 92, '#8a8070') + label(90, 30, '…', INK, 14)) },
  ],
  'sagi-08': [
    { caption: '관중과 포숙아는 어릴 때부터 친구였어요. 함께 장사하면 관중이 이익을 더 가져갔지만, 포숙아는 관중이 가난한 걸 알기에 탓하지 않았어요.', svg: panel(p(44, 92, 0.6, 1, 'reach') + coins(66, 80, 4) + coins(96, 80, 2) + p(122, 92, 0.6, -1, 'down', '#2f5d7a') + heart(122, 26, 0.8)) },
    { caption: '관중이 싸움에서 도망쳐도, 벼슬에서 쫓겨나도 포숙아는 “집에 늙은 어머니가 계시고, 아직 때를 못 만났을 뿐”이라며 믿어 주었어요.', svg: panel(p(40, 92, 0.55, -1, 'down') + label(40, 30, '×3', RED, 12) + p(116, 92, 0.6, -1, 'point', '#2f5d7a') + bubble(108, 22, '괜찮아', 52)) },
    { caption: '관중은 나중에 제나라 환공의 반대편에 섰다가 붙잡혔어요. 그런데 포숙아는 환공에게 “관중을 재상으로 쓰십시오”라고 했어요.', svg: panel(roof(124, 44, 44) + p(124, 92, 0.55, -1, 'down', GOLD) + p(92, 92, 0.6, -1, 'point', '#2f5d7a') + p(36, 92, 0.55, 1, 'down', '#8a8070') + `<path d="M24 66 h24" stroke="${INK}" stroke-width="2"/>`) },
    { caption: '재상이 된 관중은 제나라를 강한 나라로 만들었어요. 관중은 “나를 낳은 이는 부모, 나를 알아준 이는 포숙아”라고 말했어요.', svg: panel(p(60, 92, 0.65, 1, 'reach') + p(100, 92, 0.65, -1, 'reach', '#2f5d7a') + heart(80, 34, 1.3) + castle(144, 92, 22)) },
  ],
  'nonyu-01': [
    { caption: '노나라의 스승 공자 곁에는 배우려는 사람들이 늘 모였어요.', svg: panel(p(40, 92, 0.65, 1, 'point', '#5a4a3a') + p(96, 92, 0.5, -1) + p(118, 92, 0.5, -1) + p(140, 92, 0.5, -1) + label(40, 18, '공자')) },
    { caption: '먼저 배운 것(옛것)을 다시 꺼내 익혀요. 한 번 배웠다고 끝이 아니에요.', svg: panel(book(56, 50, '#8a7050') + label(56, 40, '옛것', INK) + `<path d="M76 56 Q90 46 104 56" stroke="${INK}" fill="none" stroke-dasharray="3 3"/>` + arrow(98, 52, 106, 58) + p(124, 92, 0.6, -1, 'reach')) },
    { caption: '익히다 보면 전에는 보이지 않던 새로운 것이 보여요.', svg: panel(book(46, 56, '#8a7050') + arrow(66, 60, 92, 60) + bulb(114, 52) + label(114, 90, '새것', JADE, 11)) },
    { caption: '공자는 “옛것을 익혀 새것을 알면 스승이 될 수 있다”고 했어요. 많이 아는 것보다 배운 것에서 새로 깨닫는 힘이 중요하다는 뜻이에요.', svg: panel(p(56, 92, 0.7, 1, 'up', '#5a4a3a') + bulb(80, 26) + p(118, 92, 0.5, -1) + p(140, 92, 0.5, -1)) },
  ],
  'nonyu-02': [
    { caption: '공자의 제자 자공이 물었어요. “자장과 자하 중에 누가 더 낫습니까?”', svg: panel(p(40, 92, 0.6, 1, 'point') + bubble(64, 22, '누가 나아요?', 74) + p(124, 92, 0.65, -1, 'down', '#5a4a3a')) },
    { caption: '공자가 답했어요. “자장은 지나치고, 자하는 모자라다.”', svg: panel(cup(52, 80, 1, true) + label(52, 92, '지나침', RED, 9) + cup(108, 80, 0.35) + label(108, 92, '모자람', INK, 9)) },
    { caption: '자공이 다시 물었어요. “그럼 넘치는 자장이 더 나은 거지요?”', svg: panel(cup(60, 80, 1, true) + label(84, 50, '더 나아요?', INK, 11) + p(124, 92, 0.6, -1, 'point')) },
    { caption: '공자는 “지나침은 모자람과 같다”고 했어요. 넘쳐도 모자라도 좋지 않고, 알맞은 정도가 가장 좋다는 가르침이에요.', svg: panel(cup(40, 80, 1, true) + label(40, 92, '×', RED, 11) + cup(80, 80, 0.7) + label(80, 92, '○ 알맞음', JADE, 10) + cup(120, 80, 0.3) + label(120, 92, '×', RED, 11)) },
  ],
  'nonyu-03': [
    { caption: '공자가 가장 중요하게 여긴 것은 ‘인(仁)’, 사람을 진심으로 아끼는 마음이에요.', svg: panel(p(56, 92, 0.6, 1, 'reach', '#5a4a3a') + heart(80, 50, 1.4) + p(104, 92, 0.6, -1, 'reach') + label(80, 20, '仁', RED, 16)) },
    { caption: '그런데 듣기 좋은 말만 하고 표정을 꾸며 남의 마음을 사려는 사람이 있어요.', svg: panel(p(60, 92, 0.65, 1, 'reach', '#7a5a8a') + sparkle(80, 30) + sparkle(96, 44) + bubble(96, 20, '최고예요~', 62) + p(132, 92, 0.6, -1)) },
    { caption: '공자는 “말을 꾸미고 얼굴빛을 꾸미는 사람 중에 어진 사람은 드물다”고 했어요. 겉으로 꾸민 말 뒤에 진심이 없는 경우가 많다는 거예요.', svg: panel(p(60, 92, 0.65, 1, 'reach', '#7a5a8a') + `<rect x="46" y="28" width="28" height="18" rx="6" fill="none" stroke="${INK}" stroke-dasharray="3 2"/>` + heart(60, 70, 0.5, '#bbb') + label(120, 50, '진심?', RED, 12)) },
    { caption: '공자는 오히려 꾸밈없이 소박하고 말이 서툴러도 굳센 사람이 어진 마음에 가깝다고 했어요.', svg: panel(p(80, 92, 0.65, 1, 'down') + heart(80, 26, 1.2) + label(80, 12, '말보다 마음', JADE, 10)) },
  ],
  'nonyu-04': [
    { caption: '공자는 나이로 사람을 가볍게 보지 않았어요.', svg: panel(p(50, 92, 0.7, 1, 'down', '#5a4a3a') + p(110, 92, 0.45, -1, 'up') + label(110, 40, '?', INK, 14)) },
    { caption: '지금은 서툰 어린 사람도 배우고 또 배우며 자라요.', svg: panel(sprout(40) + arrow(56, 80, 82, 70) + tree(110, 92, 0.75) + p(140, 92, 0.45, -1)) },
    { caption: '공자는 “뒤에 오는 사람이 지금 사람만 못할 줄 어찌 알겠는가. 젊은이는 두려워할 만하다”고 했어요. 언젠가 앞사람을 넘어설 수 있다는 뜻이에요.', svg: panel(p(44, 92, 0.6, 1, 'reach', '#5a4a3a') + p(110, 92, 0.75, -1, 'up') + sparkle(130, 20) + sparkle(96, 16)) },
    { caption: '하지만 공자는 이렇게도 덧붙였어요. “마흔, 쉰이 되어도 이름이 알려지지 않으면 두려워할 것이 없다.” 가능성은 꾸준히 노력할 때 열매를 맺어요.', svg: panel(tree(40, 92, 0.8) + tree(80, 92, 0.9) + tree(120, 92, 1) + label(80, 16, '꾸준히', JADE, 11)) },
  ],
  // ── 확장팩 「사기의 명장들」 ──
  'mj-01': [
    { caption: '진나라의 다스림이 너무 가혹해지자, 진승과 오광이 들고일어났어요. 그 소식이 온 나라에 퍼졌어요.', svg: panel(flag(40, 92, '起') + p(70, 92, 0.6, 1, 'up') + p(96, 92, 0.55, 1, 'up') + p(120, 92, 0.5, 1, 'up') + label(110, 20, '진나라에 맞서자!', RED, 10)) },
    { caption: '회계 군수 은통이 항량을 불렀어요. “지금이 진나라가 망할 때다. 군사를 일으켜 그대를 장수로 삼겠다.”', svg: panel(roof(52, 46, 50) + p(52, 92, 0.6, 1, 'point', '#6a6a6a') + p(118, 92, 0.65, -1, 'down', '#7a2e22') + label(52, 20, '은통', INK) + label(118, 30, '항량', '#7a2e22')) },
    { caption: '은통은 “먼저 하면 남을 누르고, 뒤처지면 남에게 눌린다”고 했어요. 바로 ‘선즉제인’이에요.', svg: panel(p(40, 92, 0.6, 1, 'point', '#6a6a6a') + bubble(92, 26, '먼저 하면 이긴다', 96) + arrow(70, 60, 120, 60) + label(136, 64, '先', RED, 16)) },
    { caption: '그런데 그 ‘먼저’를 차지한 사람은 항량이었어요. 조카 항우와 함께 먼저 움직여 회계의 군사 8천을 이끌게 되었어요.', svg: panel(p(50, 92, 0.65, 1, 'up', '#7a2e22') + p(78, 92, 0.6, 1, 'up', RED) + [104, 122, 140].map((x) => p(x, 92, 0.45)).join('') + label(122, 22, '8천', RED, 12)) },
  ],
  'mj-02': [
    { caption: '진나라 대군이 조나라 거록성을 에워쌌어요. 도우러 온 초나라 장수 송의는 46일 동안 움직이지 않았어요.', svg: panel(castle(118, 92, 34, '#2f5d7a') + [90, 146].map((x) => tent(x, 92, 0.7)).join('') + p(36, 92, 0.6, 1, 'down', '#6a6a6a') + label(36, 22, '46일…', INK, 11)) },
    { caption: '항우는 머뭇거리는 송의를 물리치고 스스로 군대를 이끌었어요. 그리고 모든 군사와 함께 강을 건넜어요.', svg: panel(river(80) + `<rect x="0" y="66" width="160" height="12" fill="${PAPER}"/>` + p(40, 72, 0.55, 1, 'up', '#7a2e22') + p(60, 72, 0.5) + p(80, 72, 0.5) + arrow(96, 60, 130, 60)) },
    { caption: '강을 건넌 뒤 항우는 배를 가라앉히고, 밥 짓는 솥을 깨뜨리고, 막사를 불태웠어요. 식량은 딱 사흘 치만 남겼어요.', svg: panel(river(84) + `<path d="M20 92 L30 78 L62 78 L70 92Z" fill="${WOOD}" opacity=".6" transform="rotate(16 45 85)"/>` + `<path d="M96 74 q-3 -18 15 -20 h12 q18 2 15 20z" fill="${INK}" opacity=".8"/><path d="M108 64 l8 8 l-4 6" stroke="${PAPER}" stroke-width="2.5"/>` + flame(146, 70, 1.3) + label(40, 22, '돌아갈 길 없음', RED, 10)) },
    { caption: '돌아갈 곳이 없어진 군사들은 죽을힘을 다해 아홉 번 싸워 진나라 군대를 크게 이겼어요. 이것이 ‘파부침주’예요.', svg: panel(p(60, 92, 0.65, 1, 'up', '#7a2e22') + sword(66, 52) + p(92, 92, 0.6, 1, 'up') + p(118, 92, 0.6, 1, 'up') + label(130, 22, '×9', RED, 12) + sparkle(30, 30)) },
  ],
  'mj-03': [
    { caption: '유방이 항우보다 먼저 진나라 수도 함양에 들어갔어요. 화가 난 항우는 40만 대군으로 유방을 치려 했어요.', svg: panel(castle(40, 92, 28) + p(72, 92, 0.55, 1, 'down', GOLD) + label(72, 26, '유방 10만', INK, 9) + Array.from({ length: 4 }, (_, i) => tent(112 + i * 14, 92, 0.7)).join('') + label(132, 26, '항우 40만', RED, 9)) },
    { caption: '유방은 홍문의 항우 진영에 사과하러 갔고, 항우는 잔치를 열었어요. 책사 범증은 옥 장식을 들어 “지금 없애라”고 신호했지만 항우는 모른 척했어요.', svg: panel(`<rect x="50" y="70" width="60" height="8" rx="2" fill="${WOOD}"/>` + p(36, 92, 0.6, 1, 'down', RED) + p(124, 92, 0.6, -1, 'down', GOLD) + p(80, 66, 0.4, 1, 'up', '#3a3a5a') + `<circle cx="86" cy="18" r="5" fill="${JADE}"/>`) },
    { caption: '범증은 항장에게 칼춤을 추는 척하며 유방을 치라고 시켰어요. 그러자 항백이 함께 칼춤을 추며 몸으로 유방을 가렸어요.', svg: panel(p(50, 92, 0.6, 1, 'up', '#3a3a5a') + sword(58, 50) + p(96, 92, 0.6, -1, 'up', '#5a4a3a') + sword(92, 50) + p(132, 92, 0.55, -1, 'down', GOLD) + label(50, 22, '항장', INK, 9) + label(96, 22, '항백', INK, 9)) },
    { caption: '장량의 말을 들은 번쾌가 방패를 들고 뛰어들어 항우를 노려보았어요. 항우가 번쾌를 칭찬하는 사이, 유방은 몰래 빠져나와 살아 돌아갔어요.', svg: panel(p(60, 92, 0.7, 1, 'reach', '#2f5d7a') + `<rect x="74" y="52" width="10" height="26" rx="3" fill="${WOOD}"/>` + p(122, 92, 0.6, -1, 'down', RED) + `<path d="M20 92 Q10 60 30 40" stroke="${INK}" stroke-dasharray="3 4" fill="none"/>` + label(30, 30, '탈출', GOLD, 10)) },
  ],
  'mj-04': [
    { caption: '한신은 항우 밑에서 여러 번 꾀를 냈지만 쓰이지 않았어요. 유방에게 왔지만 여기서도 낮은 자리에 머물렀어요.', svg: panel(p(50, 92, 0.6, 1, 'down') + label(50, 22, '한신', INK) + `<path d="M74 70 h30" stroke="${INK}" stroke-width="1.5"/>` + arrow(80, 70, 104, 70) + p(128, 92, 0.6, -1, 'down', GOLD) + label(128, 22, '유방', INK)) },
    { caption: '승상 소하는 한신과 이야기를 나누며 그가 남다른 인재라는 것을 알아보았어요. 하지만 쓰이지 못하자 한신은 결국 떠나 버렸어요.', svg: panel(p(44, 92, 0.6, 1, 'reach', '#2f5d7a') + sparkle(80, 36) + p(116, 92, 0.6, 1, 'down') + `<path d="M130 70 h20" stroke="${INK}" stroke-dasharray="3 3"/>`) },
    { caption: '소하는 왕에게 알릴 틈도 없이 한신을 쫓아갔어요. 소하까지 달아난 줄 안 유방은 두 팔을 잃은 듯 크게 화냈어요.', svg: panel(p(40, 92, 0.6, 1, 'reach', '#2f5d7a') + arrow(62, 64, 100, 64, true) + p(126, 92, 0.6, 1, 'down') + bubble(60, 22, '기다리게!', 60)) },
    { caption: '돌아온 소하는 말했어요. “장수는 얻기 쉽지만, 한신 같은 사람은 나라에 둘도 없습니다.” 한신은 대장군이 되어 큰 공을 세웠어요.', svg: panel(p(44, 92, 0.6, 1, 'point', '#2f5d7a') + p(80, 92, 0.65, 1, 'up') + p(126, 92, 0.6, -1, 'down', GOLD) + label(80, 18, '國士無雙', RED, 12)) },
  ],
  // ── 확장팩 「전국시대의 책사들」 ──
  'cs-01': [
    { caption: '서쪽의 진나라가 점점 강해지자, 나머지 여섯 나라는 진나라를 섬길지 고민했어요.', svg: panel(castle(130, 92, 40) + label(130, 20, '진나라', RED, 11) + [24, 46, 68].map((x) => castle(x, 92, 18, '#2f5d7a')).join('') + label(46, 30, '여섯 나라', INK, 9)) },
    { caption: '소진은 “여섯 나라가 손을 잡아 진나라에 맞서자”는 ‘합종’을 들고 왕들을 찾아다녔어요.', svg: panel(p(40, 92, 0.65, 1, 'point') + [80, 104, 128].map((x) => castle(x, 92, 16, '#2f5d7a')).join('') + `<path d="M74 60 H140" stroke="${RED}" stroke-width="2.5"/>` + label(110, 50, '합종', RED, 11)) },
    { caption: '한나라 왕에게 소진은 속담을 들려주었어요. “차라리 닭의 부리가 되지, 소의 꼬리는 되지 마라.”', svg: panel(p(40, 92, 0.6, 1, 'point') + bubble(80, 20, '닭의 부리 > 소의 꼬리', 118) + `<g transform="translate(96,92)"><ellipse cx="0" cy="-12" rx="9" ry="7" fill="${WOOD}"/><circle cx="8" cy="-22" r="5" fill="${WOOD}"/></g>` + `<g transform="translate(136,92)"><ellipse cx="0" cy="-16" rx="18" ry="10" fill="${INK}" opacity=".6"/></g>`) },
    { caption: '자존심이 상한 한나라 왕은 진나라를 섬기지 않겠다며 합종에 들어갔어요. 소진은 마침내 여섯 나라의 재상이 되었어요.', svg: panel(p(80, 92, 0.7, 1, 'up') + Array.from({ length: 6 }, (_, i) => `<rect x="${30 + i * 18}" y="18" width="12" height="12" rx="2" fill="${RED}"/>`).join('') + label(80, 46, '여섯 나라 재상', INK, 9)) },
  ],
  'cs-02': [
    { caption: '제나라에 크게 진 연나라에 소왕이 새 왕이 되었어요. 소왕은 나라를 다시 일으킬 인재가 필요했어요.', svg: panel(roof(70, 46, 50) + p(70, 92, 0.6, 1, 'down', GOLD) + label(130, 40, '인재를 찾자', INK, 10)) },
    { caption: '소왕은 신하 곽외에게 물었어요. “어떻게 하면 훌륭한 사람들을 모을 수 있겠소?”', svg: panel(p(50, 92, 0.6, 1, 'reach', GOLD) + p(110, 92, 0.6, -1, 'down') + bubble(80, 22, '어떻게?', 56)) },
    { caption: '곽외는 대답했어요. “먼저 저 곽외부터 쓰십시오. 저 같은 사람도 대접받는 걸 보면, 더 뛰어난 사람들이 천 리를 멀다 않고 올 것입니다.”', svg: panel(p(60, 92, 0.65, 1, 'point') + bubble(80, 20, '저부터!', 54) + `<path d="M90 70 Q120 60 150 70" stroke="${INK}" stroke-dasharray="3 3" fill="none"/>` + label(130, 82, '천 리', INK, 9)) },
    { caption: '소왕이 곽외를 스승으로 모시자, 악의·추연·극신 같은 인재들이 앞다투어 연나라로 모여들었어요.', svg: panel(roof(40, 46, 40) + p(40, 92, 0.5, 1, 'down') + [84, 106, 128, 150].map((x) => p(x, 92, 0.5, -1)).join('') + arrow(150, 50, 70, 50)) },
  ],
  'cs-03': [
    { caption: '제나라 맹상군은 재주만 있으면 누구든 식객으로 받아들였어요. 그 수가 수천 명이었지요.', svg: panel(roof(80, 44, 70) + p(80, 92, 0.6, 1, 'reach', GOLD) + [36, 52, 112, 128].map((x) => p(x, 92, 0.4)).join('')) },
    { caption: '진나라 왕이 맹상군을 붙잡아 두자, 왕이 아끼는 여인은 도와주는 대가로 하얀 여우 털옷을 원했어요. 그런데 그 옷은 이미 왕에게 바친 뒤였어요.', svg: panel(p(40, 92, 0.6, 1, 'down', GOLD) + p(110, 92, 0.6, -1, 'reach', '#7a5a8a') + `<path d="M120 40 q16 -10 30 0 l-4 20 h-22z" fill="#f4f1ea" stroke="${INK}"/>` + label(135, 30, '?', RED, 12)) },
    { caption: '가장 낮은 자리의 식객이 개처럼 몰래 창고에 들어가 털옷을 가져왔어요. 덕분에 맹상군은 풀려났어요.', svg: panel(dog(60, 92) + `<path d="M76 70 q12 -8 22 0 l-3 12 h-16z" fill="#f4f1ea" stroke="${INK}"/>` + `<path d="M110 92 V52 h40 V92" fill="${INK}" opacity=".5"/>` + moon(140, 18), true) },
    { caption: '한밤중 함곡관. 닭이 울어야 문이 열리는데 진나라 군사가 쫓아와요. 닭 울음 흉내를 잘 내는 식객이 울자 닭들이 따라 울어 문이 열렸어요!', svg: panel(`<path d="M110 92 V40 h40 V92" fill="${INK}" opacity=".7"/>` + p(70, 92, 0.6, 1, 'up') + bubble(64, 22, '꼬끼오!', 52) + moon(24, 18) + arrow(86, 60, 108, 60), true) },
  ],
  'cs-04': [
    { caption: '여불위는 여러 나라를 오가며 싸게 사서 비싸게 파는 큰 상인이었어요.', svg: panel(p(60, 92, 0.65, 1, 'reach', '#5a4a3a') + coins(100, 82, 5) + coins(122, 82, 3) + label(80, 22, '큰 상인', INK, 10)) },
    { caption: '조나라에는 진나라 왕손 자초가 볼모로 와 있었어요. 형제가 많은 데다 대접도 받지 못해 가난하게 지냈어요.', svg: panel(castle(130, 92, 30) + p(80, 92, 0.6, 1, 'down', '#8a8070') + label(80, 24, '자초', INK, 10)) },
    { caption: '자초를 본 여불위가 말했어요. “이것은 사 둘 만한 귀한 물건이다!” 남들은 못 본 가능성을 본 거예요.', svg: panel(p(40, 92, 0.6, 1, 'point', '#5a4a3a') + bubble(70, 20, '귀한 물건!', 66) + p(120, 92, 0.6, -1, 'down', '#8a8070') + sparkle(140, 40)) },
    { caption: '여불위는 재산을 들여 자초를 진나라 왕의 후계자로 세웠어요. 자초는 왕이 되었고, 여불위는 승상이 되었어요.', svg: panel(roof(80, 44, 60) + p(80, 92, 0.65, 1, 'up', GOLD) + p(124, 92, 0.6, -1, 'reach', '#5a4a3a') + label(80, 18, '왕', RED, 12)) },
  ],
  // ── 확장팩 「우화 속 지혜」 ──
  'uh-01': [
    { caption: '초나라 선왕이 물었어요. “북쪽 나라들이 재상 소해휼을 두려워한다는데 정말이오?” 아무도 대답하지 못했어요.', svg: panel(roof(50, 46, 50) + p(50, 92, 0.6, 1, 'point', GOLD) + p(110, 92, 0.55, -1) + p(132, 92, 0.55, -1) + label(121, 34, '…', INK, 14)) },
    { caption: '강을이 이야기를 들려주었어요. 호랑이에게 잡힌 여우가 말했어요. “하늘이 나를 짐승들의 우두머리로 정했다!”', svg: panel(fox(56) + tiger(116) + bubble(58, 26, '내가 우두머리!', 84)) },
    { caption: '“못 믿겠으면 내 뒤를 따라와 봐.” 여우가 앞서고 호랑이가 뒤따라 숲을 걸었어요.', svg: panel(tree(18, 92, 0.7) + fox(56) + tiger(112) + arrow(74, 40, 96, 40)) },
    { caption: '짐승들이 모두 달아났어요. 정말 무서웠던 건 여우가 아니라 뒤에 오는 호랑이였는데, 호랑이는 그걸 몰랐어요.', svg: panel(fox(70) + tiger(124) + deer(22) + rabbit(36) + arrow(30, 56, 6, 56) + label(124, 20, '?', RED, 14)) },
  ],
  'uh-02': [
    { caption: '초나라 장군 소양이 위나라를 이기고 제나라까지 치려 했어요. 진진이 찾아가 이야기를 들려주었어요.', svg: panel(tent(40) + p(80, 92, 0.65, 1, 'up', '#5a3a2a') + flag(120, 40, '楚') + p(140, 92, 0.6, -1, 'point')) },
    { caption: '술은 딱 한 잔. 일꾼들은 땅에 뱀을 먼저 그리는 사람이 마시기로 했어요.', svg: panel(cup(80, 50, 0.8) + p(30, 92, 0.5) + p(130, 92, 0.5, -1) + snake(80, 84)) },
    { caption: '가장 먼저 다 그린 사람이 잔을 들고 말했어요. “나는 발까지 그릴 수 있지!”', svg: panel(p(40, 92, 0.6, 1, 'reach') + cup(32, 40, 0.8) + snake(100, 84) + `<path d="M92 84 l-4 8 M110 84 l4 8" stroke="${RED}" stroke-width="2"/>` + bubble(70, 18, '발도 그릴래!', 76)) },
    { caption: '그 사이 다른 사람이 뱀을 다 그리고 잔을 빼앗아 마셨어요. “뱀에게 발이 어디 있소?”', svg: panel(p(40, 92, 0.6, 1, 'down') + p(120, 92, 0.6, -1, 'up', JADE) + cup(126, 30, 0.8) + snake(70, 86) + label(40, 24, '헉!', RED, 12)) },
  ],
  'uh-03': [
    { caption: '조나라가 연나라를 치려 하자, 소대가 조나라 혜문왕을 찾아가 이야기를 들려주었어요.', svg: panel(roof(110, 46, 50) + p(110, 92, 0.6, -1, 'down', GOLD) + p(50, 92, 0.6, 1, 'point') + label(50, 24, '소대', INK, 10)) },
    { caption: '강가에서 볕을 쬐던 조개의 살을 도요새가 쪼자, 조개가 껍데기를 닫아 도요새 부리를 꽉 물었어요.', svg: panel(river(84) + clam(76) + snipe(100)) },
    { caption: '“비가 안 오면 넌 말라 죽을걸!” “놓아주지 않으면 넌 굶어 죽을걸!” 둘은 서로 놓지 않았어요.', svg: panel(river(84) + clam(70) + snipe(94) + bubble(40, 22, '안 놔!', 46) + bubble(124, 22, '안 놔!', 46)) },
    { caption: '그때 지나가던 어부가 둘을 한꺼번에 잡아갔어요. 소대는 “두 나라가 싸우면 진나라가 어부가 됩니다.”라고 했어요.', svg: panel(river(84) + p(120, 92, 0.65, -1, 'reach', '#4a5a66') + clam(60) + snipe(82) + `<path d="M104 46 Q84 56 76 80" stroke="${INK}" stroke-width="1.2" fill="none"/>` + label(120, 18, '어부', INK, 10)) },
  ],
  'uh-04': [
    { caption: '아흔 살 가까운 우공의 집 앞을 큰 산 두 개가 막고 있었어요. 드나들 때마다 멀리 돌아가야 했지요.', svg: panel(mountain(110, 36) + roof(36, 70, 34) + p(36, 92, 0.55, 1, 'down', '#6b5a48')) },
    { caption: '우공은 가족과 함께 돌을 깨고 흙을 퍼서 바닷가까지 날랐어요. 한 번 다녀오는 데 한 해가 걸렸어요.', svg: panel(mountain(130, 46) + p(30, 92, 0.55, 1, 'reach', '#6b5a48') + p(54, 92, 0.48, 1, 'reach') + p(74, 92, 0.4, 1, 'reach', JADE) + arrow(92, 70, 112, 70)) },
    { caption: '이웃 지수가 비웃었어요. “그 나이에 풀 한 포기도 못 뽑을 텐데 산을 옮긴다고?”', svg: panel(mountain(130, 46) + p(40, 92, 0.55, 1, 'down', '#6b5a48') + p(86, 92, 0.6, -1, 'point', '#7a5a8a') + bubble(86, 22, '어리석구려!', 70)) },
    { caption: '“내가 죽어도 자손은 끝없이 이어지고 산은 더 자라지 않소.” 그 정성에 감동한 하늘이 산을 옮겨 주었어요.', svg: panel(p(30, 92, 0.6, 1, 'up', '#6b5a48') + p(52, 92, 0.5) + p(70, 92, 0.42) + p(86, 92, 0.36) + `<g opacity=".45">` + mountain(136, 60) + `</g>` + arrow(126, 40, 150, 22, true) + sparkle(140, 50)) },
  ],
  // ── 확장팩 「한비자의 이야기」 ──
  'hb-01': [
    { caption: '송나라 농부가 밭을 갈고 있었어요. 밭 한가운데에는 나무 그루터기가 하나 있었어요.', svg: panel(stump(100) + p(50, 92, 0.6, 1, 'reach', '#6b5a48') + `<path d="M64 70 L80 88" stroke="${WOOD}" stroke-width="2.5"/>`) },
    { caption: '달려오던 토끼가 그루터기에 쾅! 부딪혀 쓰러졌어요. 농부는 공짜로 토끼를 얻었어요.', svg: panel(stump(100) + rabbit(84) + arrow(40, 82, 70, 82) + label(100, 52, '쾅!', RED, 13)) },
    { caption: '“또 토끼가 오겠지!” 농부는 쟁기를 내려놓고 날마다 그루터기 옆에서 기다렸어요.', svg: panel(stump(100) + p(70, 92, 0.6, 1, 'down', '#6b5a48') + `<path d="M20 90 L40 74" stroke="${WOOD}" stroke-width="2.5"/>` + bubble(70, 22, '또 오겠지?', 64)) },
    { caption: '토끼는 다시 오지 않았고 밭은 풀만 무성해졌어요. 농부는 송나라의 웃음거리가 되었어요.', svg: panel(stump(100) + p(70, 92, 0.6, 1, 'down', '#6b5a48') + sprout(20) + sprout(34) + sprout(130) + sprout(146) + p(140, 92, 0.45, -1, 'point') + label(140, 30, '하하', INK, 10)) },
  ],
  'hb-02': [
    { caption: '제나라 선왕은 피리(우) 연주를 좋아했는데, 꼭 삼백 명이 한꺼번에 부는 합주만 들었어요.', svg: panel([24, 44, 64, 84, 104].map((x) => p(x, 92, 0.42, 1, 'reach') + flute(x + 8, 72)).join('') + roof(140, 46, 30) + p(140, 92, 0.5, -1, 'down', GOLD)) },
    { caption: '남곽 선비는 불 줄도 모르면서 악사들 사이에 섞여 부는 척만 하고 녹봉을 받았어요.', svg: panel([30, 54, 78, 102, 126].map((x, i) => p(x, 92, 0.45, 1, 'reach', i === 2 ? '#8a6a4a' : INK) + flute(x + 8, 70)).join('') + label(78, 30, '쉿…', RED, 11)) },
    { caption: '선왕이 죽고 민왕이 왕이 되었어요. 민왕은 한 사람씩 따로 불게 해서 듣기를 좋아했어요.', svg: panel(roof(124, 46, 40) + p(124, 92, 0.6, -1, 'point', GOLD) + p(60, 92, 0.55, 1, 'reach') + flute(70, 66) + bubble(110, 20, '한 명씩!', 56)) },
    { caption: '이제 혼자 불어야 하니 숨을 곳이 없었어요. 남곽 선비는 차례가 오기 전에 몰래 달아났어요.', svg: panel(roof(130, 46, 34) + p(60, 92, 0.55, -1, 'down', '#8a6a4a') + arrow(48, 70, 16, 70) + label(110, 24, '다음은…?', INK, 10)) },
  ],
  'hb-03': [
    { caption: '위나라 신하 방공은 태자와 함께 조나라에 볼모로 가게 되었어요. 떠나기 전에 왕에게 물었어요.', svg: panel(roof(120, 46, 40) + p(120, 92, 0.6, -1, 'down', GOLD) + p(56, 92, 0.6, 1, 'point') + bubble(70, 20, '왕이시여', 60)) },
    { caption: '“한 사람이 시장에 호랑이가 나타났다고 하면 믿으시겠습니까?” “아니, 안 믿소.”', svg: panel(p(40, 92, 0.55, 1, 'point') + bubble(56, 22, '호랑이!', 52) + roof(120, 60, 40) + label(120, 40, '시장', INK, 10)) },
    { caption: '두 사람이 말해도 안 믿던 왕이, 세 사람이 말하면 “그렇다면 믿겠소.” 하고 대답했어요.', svg: panel(p(30, 92, 0.5, 1, 'point') + p(58, 92, 0.5, 1, 'point', '#4a5a66') + p(86, 92, 0.5, 1, 'point', '#6b5a48') + `<g opacity=".4">` + tiger(130) + `</g>` + label(58, 26, '호랑이! ×3', RED, 10)) },
    { caption: '“시장에 호랑이가 없는 건 분명한데도 셋이 말하면 생깁니다. 저를 헐뜯는 말도 잘 살펴 주십시오.”', svg: panel(p(50, 92, 0.6, 1, 'point') + roof(120, 46, 40) + p(120, 92, 0.6, -1, 'down', GOLD) + bubble(60, 20, '잘 살펴 주십시오', 96)) },
  ],
  'hb-04': [
    { caption: '제나라 환공이 북쪽 고죽국을 치러 갔어요. 재상 관중과 대부 습붕이 함께 따라갔어요.', svg: panel(flag(40, 40, '齊') + p(70, 92, 0.6, 1, 'point', GOLD) + p(100, 92, 0.55, 1, 'down') + p(124, 92, 0.55, 1, 'down', '#4a5a66')) },
    { caption: '봄에 떠난 군대가 겨울이 되어 돌아오는 길, 낯선 산속에서 그만 길을 잃었어요.', svg: panel(mountain(60, 40) + mountain(130, 50) + p(80, 92, 0.5, 1, 'down') + label(80, 24, '어느 쪽?', RED, 11)) },
    { caption: '관중이 말했어요. “늙은 말의 지혜를 빌립시다.” 그리고 늙은 말을 풀어 앞장세웠어요.', svg: panel(horse(100) + p(40, 92, 0.6, 1, 'point', GOLD) + bubble(50, 20, '늙은 말을 따르자', 96)) },
    { caption: '늙은 말은 지나온 길을 기억하고 있었어요. 군대는 말을 따라가 마침내 길을 찾았어요.', svg: panel(horse(110) + p(70, 92, 0.5) + p(48, 92, 0.5, 1, 'down', '#4a5a66') + p(26, 92, 0.5, 1, 'down', GOLD) + arrow(130, 60, 154, 60) + sparkle(146, 40)) },
  ],
  // ── 확장팩 「삼국지 정사」 ──
  'sg-01': [
    { caption: '서서가 유비에게 말했어요. “제갈공명은 누워 있는 용, 와룡입니다. 직접 찾아가셔야 만날 수 있습니다.”', svg: panel(p(50, 92, 0.6, 1, 'point') + p(110, 92, 0.6, -1, 'down', GOLD) + bubble(56, 20, '와룡이 있습니다', 92)) },
    { caption: '유비는 몸을 낮추어 제갈량이 사는 초가로 직접 찾아갔어요.', svg: panel(hut(124) + p(40, 92, 0.6, 1, 'down', GOLD) + arrow(58, 66, 92, 66)) },
    { caption: '한 번, 두 번으로는 만나지 못했어요. 세 번째 찾아가서야 비로소 마주 앉을 수 있었어요.', svg: panel(hut(124) + [26, 50, 74].map((x, i) => p(x, 92, 0.45, 1, 'down', i === 2 ? GOLD : '#b9a789')).join('') + label(50, 24, '1 · 2 · 3번째', RED, 10)) },
    { caption: '제갈량은 형주와 익주를 얻고 손권과 손잡아 조조에 맞서라는 계책을 들려주었어요.', svg: panel(p(44, 92, 0.6, 1, 'down', GOLD) + p(116, 92, 0.6, -1, 'point', '#e2d3b2') + [60, 80, 100].map((x, i) => `<circle cx="${x}" cy="28" r="9" fill="${[RED, JADE, '#4a5a66'][i]}" opacity=".8"/>`).join('') + label(80, 50, '셋으로 나누기', INK, 9)) },
  ],
  'sg-02': [
    { caption: '유비는 날마다 제갈량과 나랏일을 의논했어요. 둘은 날이 갈수록 가까워졌어요.', svg: panel(p(56, 92, 0.6, 1, 'reach', GOLD) + p(104, 92, 0.6, -1, 'reach', '#e2d3b2') + heart(80, 30, 1.4)) },
    { caption: '오래 함께 싸워 온 관우와 장비는 새로 온 젊은이를 너무 아낀다며 못마땅해했어요.', svg: panel(p(40, 92, 0.6, 1, 'down', '#2f6b4a') + p(70, 92, 0.6, 1, 'down', '#3a3a3a') + p(124, 92, 0.6, -1, 'down', GOLD) + label(55, 26, '흥!', RED, 12)) },
    { caption: '유비가 말했어요. “나에게 공명이 있는 것은 물고기에게 물이 있는 것과 같다.”', svg: panel(`<rect x="0" y="62" width="160" height="30" fill="#6b9bb5" opacity=".4"/>` + fish(110, 76) + p(40, 92, 0.6, 1, 'point', GOLD) + bubble(80, 20, '물고기와 물!', 72)) },
    { caption: '물 없이 살 수 없는 물고기처럼, 유비에게 제갈량은 꼭 필요한 사람이었어요. 관우와 장비도 불평을 멈추었어요.', svg: panel(`<rect x="0" y="62" width="160" height="30" fill="#6b9bb5" opacity=".4"/>` + fish(50, 76) + fish(110, 74, '#c8742e') + sparkle(80, 30)) },
  ],
  'sg-03': [
    { caption: '오나라 장수 여몽은 싸움은 잘했지만 공부는 하지 않았어요. “군대 일이 바빠서 책 읽을 시간이 없습니다.”', svg: panel(p(60, 92, 0.6, 1, 'down', '#4a5a66') + sword(84, 70) + book(124, 64) + label(124, 50, '?', RED, 12)) },
    { caption: '손권이 말했어요. “나도 바쁘지만 늘 책을 읽어 큰 도움을 받았다.” 여몽은 그때부터 부지런히 공부했어요.', svg: panel(p(40, 92, 0.6, 1, 'point', GOLD) + p(110, 92, 0.6, -1, 'reach', '#4a5a66') + book(96, 58) + book(126, 40, '#8a5a33')) },
    { caption: '얼마 뒤 여몽을 만난 노숙이 깜짝 놀랐어요. “이제 그대는 예전의 아몽이 아니구려!”', svg: panel(p(50, 92, 0.6, 1, 'up', RED) + p(110, 92, 0.6, -1, 'reach', '#4a5a66') + bubble(56, 20, '아니, 이럴 수가!', 92)) },
    { caption: '“선비는 사흘만 헤어져 있어도 눈을 비비고 다시 보아야 합니다.” 노숙은 여몽과 벗이 되었어요.', svg: panel(p(56, 92, 0.6, 1, 'reach', RED) + p(104, 92, 0.6, -1, 'reach', '#4a5a66') + heart(80, 34) + label(80, 18, '사흘', INK, 10)) },
  ],
  'sg-04': [
    { caption: '촉한의 승상 제갈량이 남쪽 지방을 평정하러 나섰고, 그곳 우두머리 맹획을 사로잡았어요.', svg: panel(flag(30, 40, '蜀') + p(60, 92, 0.6, 1, 'point', '#e2d3b2') + p(116, 92, 0.6, -1, 'down', '#7a4a2a')) },
    { caption: '진영을 둘러본 맹획이 말했어요. “이 정도라면 다음엔 쉽게 이기겠소!” 제갈량은 웃으며 풀어 주었어요.', svg: panel(tent(130) + p(50, 92, 0.6, 1, 'down', '#e2d3b2') + p(90, 92, 0.6, 1, 'point', '#7a4a2a') + bubble(90, 20, '이길 수 있소!', 78)) },
    { caption: '놓아주면 다시 싸우고, 또 사로잡고… 그렇게 일곱 번을 놓아주고 일곱 번을 사로잡았어요.', svg: panel(Array.from({ length: 7 }, (_, i) => `<circle cx="${26 + i * 18}" cy="30" r="6" fill="${i % 2 ? GOLD : RED}" opacity=".8"/>`).join('') + p(50, 92, 0.55, 1, 'reach', '#e2d3b2') + p(110, 92, 0.55, -1, 'down', '#7a4a2a') + label(80, 56, '×7', INK, 12)) },
    { caption: '일곱 번째에 맹획은 떠나지 않았어요. “남쪽 사람들은 다시는 배반하지 않겠습니다.” 마음으로 따른 거예요.', svg: panel(p(50, 92, 0.6, 1, 'reach', '#e2d3b2') + p(110, 92, 0.55, -1, 'reach', '#7a4a2a') + heart(80, 34, 1.3)) },
  ],
  // ── 확장팩 「맹자의 가르침」 ──
  'mz-01': [
    { caption: '송나라 농부는 자기가 심은 싹이 빨리 자라지 않아 속이 탔어요.', svg: panel([80, 98, 116, 134, 152].map((x) => seedling(x)).join('') + p(40, 92, 0.6, 1, 'down', '#6b5a48') + label(40, 24, '언제 커?', RED, 10)) },
    { caption: '농부는 논에 나가 싹을 하나하나 조금씩 뽑아 올렸어요. “이러면 금방 크겠지!”', svg: panel([80, 98, 116, 134, 152].map((x) => seedling(x, 86)).join('') + p(50, 92, 0.6, 1, 'up', '#6b5a48') + arrow(88, 60, 88, 46)) },
    { caption: '집에 돌아온 농부가 말했어요. “오늘 정말 힘들었다. 싹이 자라도록 도와주었거든!”', svg: panel(roof(110, 50, 50) + p(60, 92, 0.6, 1, 'down', '#6b5a48') + p(116, 92, 0.5, -1) + bubble(64, 20, '도와줬지!', 60)) },
    { caption: '아들이 달려가 보니 싹은 모두 말라 시들어 있었어요. 억지로 돕다가 오히려 망친 거예요.', svg: panel([60, 78, 96, 114, 132].map((x) => seedling(x, 92, true)).join('') + p(30, 92, 0.5, 1, 'up', JADE) + label(96, 30, '아이고!', RED, 12)) },
  ],
  'mz-02': [
    { caption: '제자 공손추가 물었어요. “선생님은 무엇을 잘하십니까?” “나는 호연지기를 잘 기른다.”', svg: panel(p(50, 92, 0.6, 1, 'reach', '#4a5a66') + p(110, 92, 0.65, -1, 'point', JADE) + bubble(110, 20, '호연지기!', 60)) },
    { caption: '호연지기는 아주 크고 굳센 기운이에요. 곧게 기르면 하늘과 땅 사이를 가득 채운대요.', svg: panel(mountain(80, 50) + `<circle cx="134" cy="22" r="9" fill="#f2c14e"/>` + p(80, 92, 0.6, 1, 'up', JADE) + `<path d="M50 40 q30 -20 60 0" stroke="${GOLD}" fill="none" stroke-width="1.6"/>`) },
    { caption: '이 기운은 옳은 일을 하나하나 꾸준히 쌓을 때 자라나요. 부끄러운 일을 하면 시들어 버려요.', svg: panel([30, 50, 70, 90, 110].map((x, i) => `<rect x="${x}" y="${84 - i * 8}" width="16" height="${8 + i * 8}" fill="${JADE}" opacity="${0.4 + i * 0.12}"/>`).join('') + p(140, 92, 0.55, -1, 'up', JADE)) },
    { caption: '맹자는 “잊지도 말고, 억지로 서두르지도 말라”고 하며 싹을 뽑아 올린 농부 이야기를 들려주었어요.', svg: panel(p(40, 92, 0.6, 1, 'point', JADE) + seedling(100) + seedling(116) + seedling(132, 92, true) + label(116, 50, '천천히, 꾸준히', INK, 9)) },
  ],
  'mz-03': [
    { caption: '제나라 선왕은 군대를 일으켜 이웃 나라를 굴복시키고 천하를 차지하고 싶어 했어요.', svg: panel(roof(50, 46, 40) + p(50, 92, 0.6, 1, 'point', GOLD) + flag(100, 40, '齊') + castle(136, 92, 24)) },
    { caption: '맹자가 말했어요. “지금 방법으로 그것을 구하는 건 나무에 올라가 물고기를 찾는 것과 같습니다.”', svg: panel(tree(110, 92, 1.1) + p(110, 60, 0.4, 1, 'reach', GOLD) + p(40, 92, 0.6, 1, 'point', JADE) + label(134, 30, '물고기?', RED, 10)) },
    { caption: '“그렇게까지 심하단 말이오?” 놀란 왕에게 맹자는 더 나쁜 점이 있다고 했어요.', svg: panel(p(50, 92, 0.6, 1, 'up', GOLD) + p(110, 92, 0.6, -1, 'point', JADE) + bubble(50, 20, '그렇게나?', 60)) },
    { caption: '“나무 위에선 물고기를 못 얻을 뿐이지만, 전쟁으로 천하를 얻으려 하면 반드시 재앙이 옵니다. 어진 정치를 하십시오.”', svg: panel(p(40, 92, 0.6, 1, 'point', JADE) + [86, 106, 126, 146].map((x) => p(x, 92, 0.45, -1, 'down', '#8a8070')).join('') + heart(116, 34)) },
  ],
  'mz-04': [
    { caption: '“아무리 잘 자라는 식물도 하루 볕을 쬐고 열흘 춥게 두면 자랄 수 없다.”', svg: panel(`<circle cx="30" cy="26" r="9" fill="#f2c14e"/>` + [70, 86, 102, 118, 134, 150].map((x, i) => snowflake(x - 4, 24 + (i % 2) * 14)).join('') + seedling(80, 92, true)) },
    { caption: '맹자가 말했어요. “내가 왕을 만나는 날은 드물고, 내가 물러나면 왕의 마음을 차갑게 하는 사람들이 몰려온다.”', svg: panel(roof(120, 46, 40) + p(120, 92, 0.55, -1, 'down', GOLD) + p(40, 92, 0.55, 1, 'point', JADE) + snowflake(80, 40) + snowflake(96, 30)) },
    { caption: '바둑 명인 혁추가 두 사람을 가르쳤어요. 한 사람은 온 마음을 다해 들었고, 한 사람은 날아오는 고니를 쏠 생각만 했어요.', svg: panel(go(80, 80) + p(40, 92, 0.55, 1, 'reach') + p(122, 92, 0.55, -1, 'down', '#6b5a48') + bubble(132, 20, '고니다…', 52)) },
    { caption: '같이 배웠지만 두 번째 사람은 따라가지 못했어요. 머리가 나빠서가 아니라 마음을 쏟지 않았기 때문이에요.', svg: panel(p(50, 92, 0.6, 1, 'up', JADE) + p(114, 92, 0.55, -1, 'down', '#6b5a48') + sparkle(50, 24) + label(114, 30, '…', INK, 14)) },
  ],
};

export function storyboardOf(storyId: string): Panel[] {
  return STORYBOARD[storyId] ?? [];
}

// 미사용 경고 방지: art.ts 의 일부 붓은 여기서 쓰지 않을 수 있다
void WASH; void flame; void shaft;
