// 고사별 원본 삽화 (인라인 SVG, 외부 이미지 없음).
// 그림 속 붉은 낙관(.sl)은 성어의 한자가 그림의 어느 부분인지 짚어 준다.
// 장면 단계에서는 낙관을 숨기고(.plain), 원문 카드부터 보여 준다.

const INK = '#2b2118';
const WASH = 'rgba(43,33,24,.10)';
const RED = '#b5372a';
const JADE = '#4f8f78';
const GOLD = '#a9812f';
const PAPER = '#f3ead6';
const WOOD = '#8a5a33';

const svg = (body: string, dark = false) =>
  `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" font-family="'Noto Serif KR','Noto Serif CJK KR',serif">` +
  `<rect width="320" height="180" rx="12" fill="${dark ? '#231c15' : PAPER}"/>` +
  (dark ? '' : `<path d="M0 118 Q40 78 72 104 T142 94 T214 108 T320 88 V180 H0Z" fill="${INK}" opacity=".06"/><path d="M0 162 H320" stroke="${INK}" stroke-opacity=".25" stroke-width="1.5"/>`) +
  stagger(body) + '</svg>';

/** 낙관이 하나씩 찍히도록 지연을 준다 */
function stagger(body: string): string {
  let i = 0;
  return body.replace(/class="sl-in"/g, () => `class="sl-in" style="animation-delay:${(i++ * 0.18).toFixed(2)}s"`);
}

/** 낙관: 붉은 사각 도장 안의 한자 */
function sl(x: number, y: number, text: string): string {
  const w = 14 + [...text].length * 15;
  return `<g class="sl" transform="translate(${x},${y})"><g class="sl-in"><rect x="${-w / 2}" y="-12" width="${w}" height="24" rx="4" fill="${RED}"/>` +
    `<text y="6" text-anchor="middle" font-size="16" font-weight="700" fill="#fbefe4">${text}</text></g></g>`;
}

type Arm = 'down' | 'up' | 'point' | 'reach';
const ARMS: Record<Arm, string> = {
  down: 'M7 -36 Q14 -24 12 -12',
  up: 'M7 -36 Q16 -50 18 -64',
  point: 'M7 -36 L30 -42',
  reach: 'M7 -36 Q20 -30 28 -30',
};

/** 도포 입은 인물. (x, y)는 발끝, dir 1 = 오른쪽을 봄 */
function fig(x: number, y: number, s = 1, dir = 1, arm: Arm = 'down', robe = INK): string {
  return `<g transform="translate(${x},${y}) scale(${s * dir},${s})">` +
    `<path d="M-14 0 L-9 -38 Q0 -45 9 -38 L14 0 Z" fill="${robe}" opacity=".88"/>` +
    `<path d="M-7 -36 Q-14 -24 -11 -12" stroke="${robe}" stroke-width="4.5" stroke-linecap="round" fill="none" opacity=".88"/>` +
    `<path d="${ARMS[arm]}" stroke="${robe}" stroke-width="4.5" stroke-linecap="round" fill="none" opacity=".88"/>` +
    `<circle cy="-50" r="8" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>` +
    `<path d="M-6 -57 Q0 -66 6 -57 Z" fill="${INK}"/><circle cx="3" cy="-51" r="1.2" fill="${INK}"/></g>`;
}

const arrow = (x1: number, y1: number, x2: number, y2: number, dash = false) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p = (d: number, o: number) => `${(x2 - 9 * Math.cos(a + o)).toFixed(1)},${(y2 - 9 * Math.sin(a + o)).toFixed(1)}`;
  return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${INK}" stroke-width="2" fill="none"${dash ? ' stroke-dasharray="5 5"' : ''}/>` +
    `<path d="M${p(0, 0.45)} L${x2} ${y2} L${p(0, -0.45)}" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
};

const flame = (x: number, y: number, s = 1) =>
  `<path transform="translate(${x},${y}) scale(${s})" d="M0 0 Q-9 -8 -3 -20 Q0 -12 4 -16 Q10 -6 0 0Z" fill="#d9822b"/>` +
  `<path transform="translate(${x},${y}) scale(${s})" d="M0 -1 Q-4 -6 -1 -12 Q2 -7 3 -9 Q5 -4 0 -1Z" fill="#f2c14e"/>`;

/** 화살: 촉은 (x2, y2), 깃은 (x1, y1) */
function shaft(x1: number, y1: number, x2: number, y2: number): string {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const pt = (x: number, y: number, d: number, o: number) => `${(x - d * Math.cos(a + o)).toFixed(1)},${(y - d * Math.sin(a + o)).toFixed(1)}`;
  return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>` +
    `<path d="M${x2} ${y2} L${pt(x2, y2, 10, 0.4)} L${pt(x2, y2, 10, -0.4)}Z" fill="${INK}"/>` +
    `<path d="M${pt(x1, y1, -8, 0)} L${pt(x1, y1, 0, 0)} M${pt(x1, y1, -2, 0)} l${(-6 * Math.cos(a + 1.1)).toFixed(1)} ${(-6 * Math.sin(a + 1.1)).toFixed(1)} M${pt(x1, y1, -2, 0)} l${(-6 * Math.cos(a - 1.1)).toFixed(1)} ${(-6 * Math.sin(a - 1.1)).toFixed(1)}" stroke="${RED}" stroke-width="2" stroke-linecap="round"/>`;
}

export const ART: Record<string, { svg: string; caption: string }> = {
  'sagi-01': {
    caption: '구슬(璧)을 온전히(完) 지켜 조나라(趙)로 돌려보낸다(歸).',
    svg: svg(
      `<rect x="34" y="34" width="30" height="8" fill="${INK}"/><rect x="40" y="42" width="18" height="114" fill="#7a2e22" opacity=".85"/><rect x="34" y="156" width="30" height="6" fill="${INK}"/>` +
      fig(98, 162, 1.1, 1, 'up') +
      `<circle cx="120" cy="68" r="23" fill="${JADE}" opacity=".9"/><circle cx="120" cy="68" r="16" fill="none" stroke="${PAPER}" stroke-opacity=".5" stroke-width="2"/><circle cx="120" cy="68" r="7" fill="${PAPER}"/>` +
      `<path d="M90 44 l-6 -6 M150 44 l6 -6 M120 34 v-8" stroke="${GOLD}" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="M150 62 Q208 26 258 72" stroke="${INK}" stroke-width="2" stroke-dasharray="5 6" fill="none"/>` + arrow(250, 64, 259, 74) +
      `<path d="M214 162 Q262 104 318 162Z" fill="${WASH}"/><path d="M272 140 V88" stroke="${INK}" stroke-width="3"/><path d="M272 90 h30 v22 h-30z" fill="${RED}" opacity=".18" stroke="${RED}"/>` +
      sl(120, 18, '完') + sl(160, 92, '璧') + sl(206, 30, '歸') + sl(287, 101, '趙'),
    ),
  },
  'sagi-02': {
    caption: '가시나무를 지고 사죄한 염파와 손을 잡는 인상여. 목(頸)을 베어도(刎) 변치 않을 사귐(交).',
    svg: svg(
      `<g transform="translate(118,162)"><path d="M-18 0 Q-20 -18 -8 -30 L10 -30 Q16 -16 20 0Z" fill="${INK}" opacity=".88"/><circle cy="-40" r="8" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><path d="M-6 -47 Q0 -56 6 -47Z" fill="${INK}"/>` +
      `<path d="M8 -26 Q22 -28 34 -36" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" fill="none" opacity=".88"/>` +
      `<g stroke="#5b7a3a" stroke-width="2.5" stroke-linecap="round"><path d="M-30 -6 L-10 -40"/><path d="M-26 -2 L-6 -36"/><path d="M-34 -10 L-14 -44"/><path d="M-22 -20 l-7 -2 M-17 -28 l7 2 M-28 -14 l6 3 M-12 -36 l-7 -1"/></g></g>` +
      fig(200, 162, 1.15, -1, 'reach') +
      `<path d="M150 124 Q160 104 170 124" stroke="${RED}" stroke-width="2" fill="none" stroke-dasharray="3 4"/>` +
      `<g transform="translate(150,170)"><path d="M0 0 H86" stroke="#6f6a63" stroke-width="3"/><path d="M-4 -6 V6" stroke="${INK}" stroke-width="4"/><path d="M-4 0 H-16" stroke="${WOOD}" stroke-width="5" stroke-linecap="round"/></g>` +
      sl(160, 88, '交') + sl(258, 150, '刎頸'),
    ),
  },
  'sagi-03': {
    caption: '주머니(囊) 속(中)에 든 송곳(錐)은 끝이 뚫고 나온다. 재능도 그렇게 드러난다.',
    svg: svg(
      fig(62, 162, 1, 1, 'point') +
      `<path d="M118 154 Q100 100 136 78 L186 78 Q224 100 206 154 Q162 172 118 154Z" fill="#b08a5a" opacity=".85" stroke="${INK}" stroke-width="2"/>` +
      `<path d="M134 80 Q160 70 188 80" stroke="${INK}" stroke-width="3" fill="none"/><path d="M160 74 q-8 -14 -14 -4 M160 74 q8 -14 14 -4" stroke="${INK}" stroke-width="2" fill="none"/>` +
      `<path d="M150 136 L196 122" stroke="${INK}" stroke-width="5" stroke-dasharray="4 4" opacity=".35"/>` +
      `<path d="M204 120 L246 108 L206 128 Z" fill="#cfd3d6" stroke="${INK}" stroke-width="2"/>` +
      `<path d="M254 98 l8 -6 M256 112 l10 0 M250 122 l7 6" stroke="${GOLD}" stroke-width="2" stroke-linecap="round"/>` +
      sl(118, 70, '囊') + sl(160, 118, '中') + sl(274, 82, '錐'),
    ),
  },
  'sagi-04': {
    caption: '사슴(鹿)을 가리키며(指) 말(馬)이라 한다(爲). 옳고 그름을 뒤바꾸는 권세.',
    svg: svg(
      fig(64, 162, 1.1, 1, 'point') +
      `<g transform="translate(0,4)"><ellipse cx="210" cy="124" rx="34" ry="15" fill="${WOOD}" opacity=".9"/><polygon points="232,116 244,88 253,92 243,121" fill="${WOOD}"/><ellipse cx="253" cy="86" rx="10" ry="6" fill="${WOOD}"/>` +
      `<g stroke="${INK}" stroke-width="2.5" stroke-linecap="round" fill="none"><path d="M249 80 l-6 -18 M246 70 l-9 -4 M256 80 l7 -18 M260 68 l9 -5"/></g>` +
      `<g stroke="#6b4426" stroke-width="3" stroke-linecap="round"><path d="M190 136 v22 M198 137 v22 M222 137 v22 M230 135 v23"/></g>` +
      `<circle cx="200" cy="120" r="2" fill="${PAPER}"/><circle cx="214" cy="116" r="2" fill="${PAPER}"/><circle cx="222" cy="124" r="2" fill="${PAPER}"/><circle cx="257" cy="85" r="1.5" fill="${INK}"/></g>` +
      `<path d="M98 22 h64 a10 10 0 0 1 10 10 v26 a10 10 0 0 1 -10 10 h-44 l-14 14 l2 -14 h-8 a10 10 0 0 1 -10 -10 v-26 a10 10 0 0 1 10 -10z" fill="#fffaf0" stroke="${INK}" stroke-width="2"/>` +
      `<text x="132" y="56" text-anchor="middle" font-size="30" font-weight="700" fill="${INK}">馬</text><text x="158" y="50" font-size="14" fill="${INK}">?</text>` +
      arrow(176, 60, 214, 86, true) +
      sl(102, 104, '指') + sl(206, 52, '爲') + sl(282, 112, '鹿'),
    ),
  },
  'sagi-05': {
    caption: '물(水)을 등지고(背) 진(陣)을 친다. 물러설 곳이 없으니 죽기로 싸운다.',
    svg: svg(
      `<path d="M0 12 H70 Q80 90 64 168 H0Z" fill="#7aa6b8" opacity=".55"/>` +
      `<g stroke="#f3ead6" stroke-width="2" fill="none" opacity=".8"><path d="M12 40 q8 -6 16 0 t16 0"/><path d="M8 80 q8 -6 16 0 t16 0"/><path d="M14 120 q8 -6 16 0 t16 0"/></g>` +
      fig(104, 162, .8, 1) + fig(132, 162, .8, 1) + fig(160, 162, .8, 1) + fig(118, 140, .7, 1) + fig(146, 140, .7, 1) +
      `<g stroke="${INK}" stroke-width="2.5"><path d="M98 162 V60"/><path d="M140 140 V52"/><path d="M176 162 V64"/></g>` +
      `<path d="M98 62 l26 8 l-26 8z M140 54 l26 8 l-26 8z M176 66 l26 8 l-26 8z" fill="${RED}" opacity=".8"/>` +
      arrow(214, 120, 252, 120) +
      `<path d="M262 162 V104 h10 v-8 h10 v8 h10 v-8 h10 v8 h8 V162Z" fill="${INK}" opacity=".7"/>` +
      `<path d="M94 30 Q80 26 72 34" stroke="${INK}" stroke-width="2" fill="none"/>` + arrow(80, 30, 70, 36) +
      sl(36, 154, '水') + sl(110, 24, '背') + sl(160, 26, '陣'),
    ),
  },
  'sagi-06': {
    caption: '사방(四面)에서 들려오는 초나라(楚) 노래(歌). 항우는 홀로 포위되었다.',
    svg: svg(
      `<circle cx="276" cy="34" r="14" fill="#efe1b8"/><circle cx="282" cy="30" r="12" fill="#231c15"/>` +
      `<path d="M0 150 Q160 128 320 150 V180 H0Z" fill="#3a2f24"/>` +
      `<path d="M118 146 L160 84 L202 146Z" fill="${WOOD}"/><path d="M152 146 L160 120 L168 146Z" fill="#231c15"/><path d="M160 84 V64" stroke="#efe1b8" stroke-width="2"/><path d="M160 64 h22 v14 h-22z" fill="${RED}"/>` +
      flame(30, 118, 1.2) + flame(290, 118, 1.2) + flame(70, 164, 1.1) + flame(250, 164, 1.1) +
      `<g fill="#efe1b8" font-size="18"><text x="44" y="92">♪</text><text x="76" y="70">♫</text><text x="262" y="92">♪</text><text x="228" y="74">♫</text><text x="96" y="140">♪</text><text x="214" y="140">♪</text></g>` +
      sl(48, 26, '四面') + sl(171, 46, '楚') + sl(232, 50, '歌'),
      true,
    ),
  },
  'sagi-07': {
    caption: '토끼(兔)가 죽으면(死) 사냥개(狗)를 삶는다(烹). 쓸모가 다하면 버림받는다.',
    svg: svg(
      `<ellipse cx="54" cy="148" rx="24" ry="11" fill="#d9ccb3" stroke="${INK}" stroke-width="2"/><circle cx="80" cy="144" r="9" fill="#d9ccb3" stroke="${INK}" stroke-width="2"/>` +
      `<path d="M84 137 Q96 132 104 134 M82 138 Q92 128 100 126" stroke="${INK}" stroke-width="2" fill="none"/><path d="M80 141 l4 4 M84 141 l-4 4" stroke="${INK}" stroke-width="1.5"/><circle cx="30" cy="146" r="4" fill="${PAPER}" stroke="${INK}"/>` +
      arrow(108, 132, 128, 132) +
      `<ellipse cx="166" cy="130" rx="26" ry="11" fill="${WOOD}"/><circle cx="192" cy="112" r="10" fill="${WOOD}"/><ellipse cx="202" cy="115" rx="7" ry="4" fill="${WOOD}"/><path d="M186 104 l-2 -10 l8 6z" fill="#6b4426"/><circle cx="194" cy="109" r="1.5" fill="${INK}"/>` +
      `<g stroke="#6b4426" stroke-width="3" stroke-linecap="round"><path d="M148 138 v22 M156 139 v21 M178 139 v21 M186 136 v24"/><path d="M140 126 q-10 -10 -4 -20" fill="none"/></g>` +
      arrow(214, 132, 234, 132) +
      `<path d="M240 104 q0 -6 6 -12 M256 104 q0 -6 6 -12 M272 104 q0 -6 6 -12" stroke="${INK}" stroke-opacity=".4" stroke-width="2" fill="none"/>` +
      `<path d="M240 112 h52 q0 34 -26 34 q-26 0 -26 -34z" fill="${INK}" opacity=".88"/><rect x="236" y="108" width="60" height="6" rx="3" fill="${INK}"/>` +
      flame(256, 162, 1) + flame(276, 162, 1) +
      sl(40, 108, '兔') + sl(80, 108, '死') + sl(166, 86, '狗') + sl(266, 76, '烹'),
    ),
  },
  'sagi-08': {
    caption: '관중(管)과 포숙(鮑)의 사귐(交). 관중이 몫을 더 가져가도 포숙은 탓하지 않았다.',
    svg: svg(
      `<path d="M40 162 V70" stroke="${INK}" stroke-width="5"/><path d="M16 84 Q22 58 42 60 Q62 56 68 82 Q42 92 16 84Z M6 110 Q14 84 40 86 Q68 82 76 108 Q40 120 6 110Z" fill="#3d5a3a" opacity=".55"/>` +
      fig(116, 162, 1.1, 1, 'reach', '#3e4f63') + fig(206, 162, 1.1, -1, 'reach') +
      `<g fill="${GOLD}" stroke="${INK}" stroke-width="1"><ellipse cx="140" cy="158" rx="9" ry="3"/><ellipse cx="140" cy="153" rx="9" ry="3"/><ellipse cx="140" cy="148" rx="9" ry="3"/><ellipse cx="140" cy="143" rx="9" ry="3"/><ellipse cx="182" cy="158" rx="9" ry="3"/></g>` +
      `<path d="M120 100 Q161 64 202 100" stroke="${RED}" stroke-width="2" fill="none" stroke-dasharray="3 4"/>` +
      sl(112, 28, '管仲') + sl(212, 28, '鮑叔') + sl(161, 64, '交'),
    ),
  },
  'nonyu-01': {
    caption: '옛(故) 글을 데워(溫) 익히면 새(新) 깨달음을 안다(知).',
    svg: svg(
      `<path d="M90 132 h140 v8 h-140z M100 140 v22 M220 140 v22" stroke="${INK}" stroke-width="3" fill="${WOOD}"/>` +
      `<path d="M108 132 Q104 112 112 108 H196 Q204 112 200 132Z" fill="#e7d6ae" stroke="${INK}" stroke-width="2"/><rect x="104" y="104" width="10" height="30" rx="5" fill="${WOOD}"/><rect x="196" y="104" width="10" height="30" rx="5" fill="${WOOD}"/>` +
      `<g stroke="${INK}" stroke-width="2" opacity=".5"><path d="M126 112 v16 M138 112 v16 M150 112 v16 M162 112 v16 M174 112 v16 M186 112 v16"/></g>` +
      `<path d="M30 162 h40 l-6 -20 h-28z" fill="${INK}" opacity=".85"/>` + flame(50, 142, 1.2) +
      `<path d="M60 120 q6 -8 0 -16 M72 124 q6 -8 0 -16" stroke="#d9822b" stroke-width="2" fill="none" opacity=".7"/>` +
      `<path d="M206 106 Q214 84 212 58" stroke="#3d6b3a" stroke-width="3" fill="none"/><path d="M212 74 q14 -10 22 -2 q-12 8 -22 2z M211 86 q-14 -8 -20 2 q12 6 20 -2z M212 58 q6 -12 14 -10 q-4 10 -14 10z" fill="#5b8a4a"/>` +
      `<circle cx="266" cy="40" r="12" fill="${GOLD}" opacity=".85"/><g stroke="${GOLD}" stroke-width="2" stroke-linecap="round"><path d="M266 18 v-6 M244 40 h-6 M288 40 h6 M250 24 l-4 -4 M282 24 l4 -4"/></g>` +
      sl(50, 106, '溫') + sl(155, 88, '故') + sl(240, 92, '新') + sl(266, 70, '知'),
    ),
  },
  'nonyu-02': {
    caption: '지나침(過)은 미치지 못함(不及)과 같다(猶). 과녁의 가운데(中)가 알맞음이다.',
    svg: svg(
      `<g transform="translate(160,92)"><circle r="44" fill="#fffaf0" stroke="${INK}" stroke-width="2"/><circle r="31" fill="none" stroke="${INK}" stroke-width="2"/><circle r="18" fill="none" stroke="${INK}" stroke-width="2"/><circle r="7" fill="${RED}"/></g>` +
      `<path d="M160 136 V162" stroke="${WOOD}" stroke-width="5"/>` +
      shaft(250, 50, 300, 28) + `<path d="M206 66 q16 -10 40 -15" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 4" fill="none"/>` +
      shaft(26, 160, 76, 154) + `<path d="M80 148 q18 -36 46 -52" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 4" fill="none"/>` +
      `<path d="M72 128 Q120 176 160 166 Q200 176 262 62" stroke="${RED}" stroke-width="1.5" stroke-dasharray="2 4" fill="none" opacity=".7"/>` +
      sl(274, 64, '過') + sl(56, 126, '不及') + sl(160, 30, '中') + sl(210, 166, '猶'),
    ),
  },
  'nonyu-03': {
    caption: '교묘하게 꾸민 말(巧言)과 꾸민 얼굴빛(令色). 가면 뒤의 진심은 보이지 않는다.',
    svg: svg(
      fig(132, 162, 1.25, 1, 'reach') +
      `<path d="M168 134 L166 112" stroke="${WOOD}" stroke-width="3"/>` +
      `<ellipse cx="166" cy="92" rx="17" ry="21" fill="#f6e7c8" stroke="${GOLD}" stroke-width="2.5"/>` +
      `<path d="M157 86 q4 -4 8 0 M169 86 q4 -4 8 0" stroke="${INK}" stroke-width="2" fill="none"/><path d="M156 100 q10 10 20 0" stroke="${RED}" stroke-width="2.5" fill="none"/><circle cx="155" cy="96" r="3" fill="#e9a3a0" opacity=".8"/><circle cx="178" cy="96" r="3" fill="#e9a3a0" opacity=".8"/>` +
      `<path d="M184 100 Q206 84 226 98 T268 94 Q284 86 298 96" stroke="${GOLD}" stroke-width="3" fill="none"/><path d="M186 108 Q210 118 232 106 T276 112" stroke="#d18aa0" stroke-width="3" fill="none"/>` +
      `<g fill="${GOLD}"><path d="M236 78 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z"/><path d="M286 116 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5z"/></g>` +
      sl(258, 62, '巧言') + sl(166, 48, '令色'),
    ),
  },
  'nonyu-04': {
    caption: '뒤에 난 사람(後生)이 두려울 만하다(可畏). 어린 나무가 고목보다 크게 자랄 수 있다.',
    svg: svg(
      `<path d="M70 162 Q66 120 74 82" stroke="#4a3a2a" stroke-width="10" fill="none"/><path d="M72 104 Q50 92 40 96 M74 92 Q94 78 104 82" stroke="#4a3a2a" stroke-width="4" fill="none"/>` +
      `<path d="M24 92 Q30 50 72 46 Q116 50 120 90 Q100 104 72 98 Q44 104 24 92Z" fill="#3d5a3a" opacity=".6"/>` +
      fig(132, 162, .95, 1) +
      `<path d="M228 162 V128" stroke="#5b7a3a" stroke-width="3"/><path d="M228 136 q-14 -8 -18 -18 q12 2 18 18z M228 130 q14 -10 20 -20 q-12 2 -20 20z" fill="#6f9a52"/>` +
      `<path d="M228 128 V40" stroke="${GOLD}" stroke-width="2" stroke-dasharray="4 5"/><path d="M180 52 Q186 12 228 10 Q270 12 276 52 Q254 66 228 60 Q202 66 180 52Z" fill="none" stroke="${GOLD}" stroke-width="2" stroke-dasharray="5 5"/>` +
      `<path d="M30 46 H290" stroke="${INK}" stroke-opacity=".2" stroke-dasharray="2 4"/>` +
      sl(262, 146, '後生') + sl(228, 36, '可畏'),
    ),
  },
};

export function artFor(storyId: string): { svg: string; caption: string } | undefined {
  return ART[storyId];
}
