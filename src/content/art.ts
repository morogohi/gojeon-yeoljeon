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
  // ── 확장팩 「사기의 명장들」 ──
  'mj-01': {
    caption: '먼저(先) 움직이면 곧(則) 남을 누른다(制人). 뒤처지면 남에게 눌린다.',
    svg: svg(
      fig(70, 162, 1, 1, 'point', '#7a2e22') + fig(110, 162, .9, 1, 'up') +
      `<path d="M140 120 Q190 100 240 112" stroke="${INK}" stroke-width="2" fill="none"/>` + arrow(200, 104, 246, 112) +
      fig(262, 162, .9, -1, 'down', '#6a6a6a') +
      `<path d="M150 70 h36 l-6 6 l6 6 h-36z" fill="${RED}"/><path d="M150 70 V160" stroke="${INK}" stroke-width="2"/>` +
      sl(90, 40, '先') + sl(200, 60, '則') + sl(262, 80, '制人'),
    ),
  },
  'mj-02': {
    caption: '솥(釜)을 깨뜨리고(破) 배(舟)를 가라앉힌다(沈). 돌아갈 마음을 남기지 않는다.',
    svg: svg(
      `<path d="M0 140 Q40 132 80 140 T160 140 T240 140 T320 140 V180 H0Z" fill="#6b9bb5" opacity=".45"/>` +
      `<path d="M40 150 L60 130 L110 130 L126 150Z" fill="${WOOD}" opacity=".6" transform="rotate(14 80 140)"/>` +
      `<path d="M180 152 q-4 -26 22 -28 h20 q26 2 22 28z" fill="${INK}" opacity=".8"/><path d="M196 140 l10 10 l-6 8 M214 128 l-6 14" stroke="${PAPER}" stroke-width="3"/>` +
      fig(276, 150, 1, -1, 'up', '#7a2e22') + flame(140, 118, 1.4) +
      sl(90, 104, '沈舟') + sl(212, 96, '破釜'),
    ),
  },
  'mj-03': {
    caption: '홍문(鴻門)의 잔치(宴). 칼춤 뒤에 숨은 뜻을 알아챈 사람만 살아 나온다.',
    svg: svg(
      `<rect x="40" y="58" width="240" height="8" fill="${WOOD}"/><path d="M48 66 V162 M272 66 V162" stroke="${WOOD}" stroke-width="5"/>` +
      `<rect x="120" y="128" width="80" height="10" rx="3" fill="${WOOD}"/><circle cx="140" cy="124" r="5" fill="${GOLD}"/><circle cx="178" cy="124" r="5" fill="${GOLD}"/>` +
      fig(84, 162, .95, 1, 'up', '#3a3a5a') + `<path d="M98 100 l22 -30" stroke="#8d97a3" stroke-width="3" stroke-linecap="round"/>` +
      fig(236, 162, .95, -1, 'reach') + fig(160, 162, .8, 1, 'down', GOLD) +
      sl(160, 36, '鴻門') + sl(160, 150, '宴'),
    ),
  },
  'mj-04': {
    caption: '나라(國) 안의 선비(士) 가운데 둘(雙)도 없다(無). 소하는 그 한 사람을 쫓았다.',
    svg: svg(
      fig(250, 162, 1, 1, 'down') + `<path d="M266 140 l26 0" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 4"/>` +
      fig(150, 162, 1, 1, 'reach', '#2f5d7a') + arrow(176, 120, 226, 120, true) +
      `<path d="M40 162 V120 h14 v-8 h12 v8 h14 V162" fill="${INK}" opacity=".5"/>` +
      sl(250, 70, '國士') + sl(150, 60, '無雙'),
    ),
  },
  // ── 확장팩 「전국시대의 책사들」 ──
  'cs-01': {
    caption: '닭(鷄)의 부리(口)가 될지언정 소(牛)의 꼬리(後)는 되지 마라.',
    svg: svg(
      `<g transform="translate(70,150)"><ellipse cx="0" cy="-18" rx="20" ry="15" fill="${WOOD}"/><circle cx="16" cy="-36" r="9" fill="${WOOD}"/><path d="M24 -38 l10 3 l-10 3z" fill="${GOLD}"/><path d="M14 -46 q4 -8 8 0" fill="${RED}"/><path d="M-6 -4 V12 M6 -4 V12" stroke="${INK}" stroke-width="2.5"/></g>` +
      `<g transform="translate(220,150)"><ellipse cx="0" cy="-26" rx="52" ry="22" fill="${INK}" opacity=".7"/><circle cx="50" cy="-40" r="14" fill="${INK}" opacity=".7"/><path d="M58 -54 l8 -10 M44 -54 l-4 -10" stroke="${INK}" stroke-width="3"/><path d="M-50 -26 q-20 10 -16 30" stroke="${INK}" stroke-width="3" fill="none"/><path d="M-36 -8 V12 M-14 -6 V12 M16 -6 V12 M36 -8 V12" stroke="${INK}" stroke-width="5"/></g>` +
      sl(86, 92, '鷄口') + sl(154, 136, '牛後'),
    ),
  },
  'cs-02': {
    caption: '먼저(先) 곽외(隗)부터(從) 시작하라(始). 그러면 더 어진 이가 천 리 길을 온다.',
    svg: svg(
      `<rect x="40" y="70" width="90" height="8" fill="${WOOD}"/><path d="M48 78 V162 M122 78 V162" stroke="${WOOD}" stroke-width="5"/><path d="M30 70 Q85 46 140 70Z" fill="${INK}" opacity=".8"/>` +
      fig(70, 162, .95, 1, 'reach', GOLD) + fig(104, 162, .95, -1, 'down') +
      `<path d="M150 150 Q220 120 300 140" stroke="${INK}" stroke-dasharray="4 5" fill="none"/>` + fig(230, 150, .7, -1) + fig(262, 156, .7, -1) + fig(292, 160, .7, -1) +
      sl(88, 40, '先從隗') + sl(250, 100, '始'),
    ),
  },
  'cs-03': {
    caption: '닭(鷄)이 울면(鳴) 문이 열리고, 개(狗)처럼 숨어드는 도둑(盜)이 털옷을 찾아온다.',
    svg: svg(
      `<path d="M200 162 V70 h70 V162" fill="${INK}" opacity=".75"/><rect x="214" y="96" width="42" height="66" fill="${PAPER}" opacity=".25"/>` +
      `<circle cx="40" cy="34" r="12" fill="#f5e6b8"/>` +
      fig(150, 162, .95, 1, 'up') + `<path d="M162 96 q10 -8 18 -2 M164 102 q14 -4 22 4" stroke="${GOLD}" stroke-width="2" fill="none"/>` +
      `<g transform="translate(80,162)"><ellipse cx="0" cy="-12" rx="16" ry="7" fill="${INK}" opacity=".75"/><circle cx="16" cy="-20" r="6" fill="${INK}" opacity=".75"/><path d="M-10 -6 V0 M10 -6 V0" stroke="${INK}" stroke-width="3"/></g>` +
      sl(150, 50, '鷄鳴') + sl(80, 122, '狗盜'),
    ),
  },
  'cs-04': {
    caption: '진기한(奇) 물건(貨)은 사 둘(居) 만하다(可). 여불위는 볼모 왕손에게서 그 값을 보았다.',
    svg: svg(
      `<rect x="40" y="120" width="110" height="10" fill="${WOOD}"/>` + `<g fill="${GOLD}">${[60, 80, 100, 120].map((x) => `<ellipse cx="${x}" cy="116" rx="8" ry="3"/>`).join('')}</g>` +
      fig(80, 162, .95, 1, 'point', '#5a4a3a') + fig(230, 162, .95, -1, 'down', '#7a7a7a') +
      `<circle cx="230" cy="70" r="16" fill="none" stroke="${GOLD}" stroke-width="2" stroke-dasharray="3 3"/>` +
      sl(150, 50, '奇貨') + sl(230, 34, '可居'),
    ),
  },
  // ── 확장팩 「우화 속 지혜」 ──
  'uh-01': {
    caption: '여우(狐)가 호랑이(虎)의 위세(威)를 빌려(假) 숲을 걷는다. 짐승들이 달아난 건 누구 때문일까?',
    svg: svg(
      `<g transform="translate(110,162)"><ellipse cx="0" cy="-14" rx="16" ry="8" fill="#c8742e"/><circle cx="16" cy="-24" r="7" fill="#c8742e"/><path d="M12 -30 l2 -9 l5 7z M18 -29 l5 -8 l2 9z" fill="#c8742e"/><path d="M-16 -14 q-16 -6 -18 -20 q10 4 16 12" fill="#c8742e"/><path d="M-8 -8 V0 M8 -8 V0" stroke="#c8742e" stroke-width="3"/></g>` +
      `<g transform="translate(200,162)"><ellipse cx="0" cy="-24" rx="40" ry="17" fill="#d9a441"/><path d="M-24 -38 v26 M-8 -41 v30 M8 -41 v30 M24 -38 v26" stroke="${INK}" stroke-width="3" opacity=".7"/><circle cx="40" cy="-36" r="15" fill="#d9a441"/><path d="M48 -40 h6 M48 -33 h6" stroke="${INK}" stroke-width="1.5"/><circle cx="44" cy="-40" r="1.8" fill="${INK}"/><path d="M-26 -10 V0 M-10 -8 V0 M12 -8 V0 M28 -10 V0" stroke="#d9a441" stroke-width="6"/><path d="M-40 -26 q-18 -6 -16 -24" stroke="#d9a441" stroke-width="4" fill="none"/></g>` +
      `<g opacity=".6">` + arrow(70, 120, 24, 120) + arrow(70, 140, 30, 150) + `</g>` +
      sl(110, 40, '狐假') + sl(212, 40, '虎威'),
    ),
  },
  'uh-02': {
    caption: '뱀(蛇)을 그리고(畫) 없는 발(足)까지 더하다가(添), 다 그린 그림과 술잔을 모두 잃었다.',
    svg: svg(
      `<path d="M60 140 q20 -24 44 0 t44 0 t44 0 q12 -10 22 -4" stroke="${JADE}" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="216" cy="134" r="7" fill="${JADE}"/>` +
      `<path d="M92 132 l-6 14 M134 146 l4 14 M176 132 l-6 14" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>` +
      `<text x="134" y="176" text-anchor="middle" font-size="11" fill="${RED}">발?</text>` +
      fig(262, 162, .95, -1, 'reach') +
      `<path d="M240 108 l-8 -14 h14z" fill="${GOLD}"/>` +
      sl(80, 40, '畫蛇') + sl(170, 40, '添足'),
    ),
  },
  'uh-03': {
    caption: '조개와 도요새가 서로 물고 버티는 사이, 어부(漁父)가 둘을 함께 잡아 이익(利)을 보았다.',
    svg: svg(
      `<path d="M0 150 Q80 140 160 150 T320 146 V180 H0Z" fill="#6b9bb5" opacity=".35"/>` +
      `<g transform="translate(110,150)"><path d="M-22 0 Q0 -22 22 0Z" fill="#b9a789" stroke="${INK}"/><path d="M-22 0 Q0 10 22 0" fill="#d8cbb0" stroke="${INK}"/></g>` +
      `<g transform="translate(150,124)"><ellipse cx="0" cy="0" rx="16" ry="9" fill="${WOOD}"/><circle cx="-14" cy="-8" r="6" fill="${WOOD}"/><path d="M-19 -6 L-40 22" stroke="${INK}" stroke-width="2.5"/><path d="M4 9 V18 M-4 9 V18" stroke="${INK}" stroke-width="1.5"/></g>` +
      fig(250, 162, 1, -1, 'reach', '#4a5a66') +
      `<path d="M226 104 Q200 120 190 150" stroke="${INK}" stroke-width="1.5" fill="none"/>` +
      sl(110, 40, '漁父') + sl(212, 40, '之利'),
    ),
  },
  'uh-04': {
    caption: '어리석다(愚)는 소리를 들은 노인(公)이 대를 이어 산(山)을 옮기기(移) 시작했다.',
    svg: svg(
      `<path d="M150 162 L222 52 L300 162Z" fill="${INK}" opacity=".55"/><path d="M200 162 L250 92 L300 162Z" fill="${INK}" opacity=".35"/>` +
      fig(70, 162, .95, 1, 'reach', '#6b5a48') + fig(108, 162, .75, 1, 'reach') + fig(136, 162, .55, 1, 'reach', JADE) +
      `<g transform="translate(40,150)"><path d="M-10 -10 h20 l-3 12 h-14z" fill="#b9a789" stroke="${INK}"/></g>` +
      arrow(160, 120, 120, 120, true) +
      sl(60, 40, '愚公') + sl(150, 40, '移山'),
    ),
  },
  // ── 확장팩 「한비자의 이야기」 ──
  'hb-01': {
    caption: '그루터기(株)를 지키며(守) 토끼(兔)를 기다리는(待) 농부. 토끼는 다시 오지 않았다.',
    svg: svg(
      `<path d="M60 162 V138 h34 V162" fill="${WOOD}"/><ellipse cx="77" cy="138" rx="17" ry="5" fill="#c9a47a" stroke="${WOOD}"/><path d="M70 138 q7 4 14 0" stroke="${WOOD}" fill="none"/>` +
      fig(150, 162, 1, -1, 'down', '#6b5a48') +
      `<path d="M190 162 L230 120" stroke="${WOOD}" stroke-width="4"/><path d="M226 116 l12 -2 l-4 12z" fill="#8d97a3"/>` +
      `<path d="M260 150 q10 -16 24 -6 M262 162 q14 -10 30 0" stroke="${JADE}" stroke-width="3" fill="none" opacity=".6"/>` +
      `<text x="77" y="118" text-anchor="middle" font-size="16" fill="${INK}" opacity=".5">…</text>` +
      sl(70, 40, '守株') + sl(170, 40, '待兔'),
    ),
  },
  'hb-02': {
    caption: '삼백 명이 함께 부는 피리(竽) 연주 속에 불 줄 모르는 이가 섞여(濫) 수(數)만 채웠다(充).',
    svg: svg(
      [60, 100, 140, 180, 220].map((x, i) => fig(x, 162, .85, 1, 'reach', i === 2 ? '#8a6a4a' : INK) + `<path d="M${x + 18} ${162 - 56 * .85} l14 -10" stroke="${GOLD}" stroke-width="3"/>`).join('') +
      `<text x="146" y="74" text-anchor="middle" font-size="18" fill="${RED}">?</text>` +
      `<path d="M236 70 q8 -6 16 0 t16 0" stroke="${INK}" fill="none" opacity=".5"/>` +
      sl(80, 36, '濫竽') + sl(200, 36, '充數'),
    ),
  },
  'hb-03': {
    caption: '시장에 호랑이(虎)는 없다. 그런데 세(三) 사람(人)이 말하니 호랑이가 만들어졌다(成).',
    svg: svg(
      `<rect x="20" y="104" width="84" height="8" fill="${WOOD}"/><path d="M28 112 V162 M96 112 V162" stroke="${WOOD}" stroke-width="4"/><path d="M14 104 Q62 82 110 104Z" fill="${INK}" opacity=".7"/>` +
      fig(170, 162, .9, -1, 'point') + fig(210, 162, .9, -1, 'point', '#4a5a66') + fig(250, 162, .9, -1, 'point', '#6b5a48') +
      `<g opacity=".35" transform="translate(62,150)"><ellipse cx="0" cy="-14" rx="24" ry="10" fill="#d9a441"/><circle cx="24" cy="-22" r="9" fill="#d9a441"/><path d="M-14 -22 v14 M-4 -24 v16 M6 -24 v16" stroke="${INK}" stroke-width="2"/></g>` +
      sl(80, 40, '三人') + sl(190, 40, '成虎'),
    ),
  },
  'hb-04': {
    caption: '길을 잃은 군대가 늙은(老) 말(馬)의 지혜(智)를 빌려 집으로 가는 길을 찾았다.',
    svg: svg(
      `<path d="M0 162 L60 90 L120 162Z M90 162 L150 104 L210 162Z" fill="${INK}" opacity=".2"/>` +
      `<g transform="translate(210,162)"><ellipse cx="0" cy="-34" rx="30" ry="13" fill="#9a8a78"/><path d="M24 -40 L40 -62" stroke="#9a8a78" stroke-width="9" stroke-linecap="round"/><ellipse cx="46" cy="-64" rx="11" ry="6" fill="#9a8a78" transform="rotate(25 46 -64)"/><path d="M-20 -24 V0 M-8 -24 V0 M10 -24 V0 M22 -24 V0" stroke="#9a8a78" stroke-width="5"/><path d="M-30 -36 q-12 4 -10 18" stroke="#9a8a78" stroke-width="3" fill="none"/><path d="M32 -56 l-6 -8" stroke="#fbefe4" stroke-width="2"/></g>` +
      fig(130, 162, .9, 1, 'point', GOLD) + fig(96, 162, .8, 1, 'down') + fig(66, 162, .8, 1, 'down', '#4a5a66') +
      arrow(262, 120, 306, 120, true) +
      sl(110, 40, '老馬') + sl(200, 40, '之智'),
    ),
  },
  // ── 확장팩 「삼국지 정사」 ──
  'sg-01': {
    caption: '초가(草廬)를 세 번(三) 찾아가(顧) 마침내 제갈량을 만난 유비.',
    svg: svg(
      `<path d="M190 112 Q240 80 290 112Z" fill="#c9a96a"/><path d="M196 112 h88 v50 h-88z" fill="#e2d3b2" stroke="${WOOD}"/><rect x="230" y="128" width="20" height="34" fill="${WOOD}" opacity=".7"/>` +
      `<g transform="translate(300,162) scale(.7)"><path d="M0 0 V-30" stroke="${WOOD}" stroke-width="5"/><circle cy="-40" r="16" fill="${JADE}" opacity=".9"/></g>` +
      fig(176, 162, .9, -1, 'down', '#d8c59c') +
      fig(110, 162, 1, 1, 'reach', GOLD) +
      `<path d="M30 150 q20 -6 40 0" stroke="${INK}" stroke-dasharray="4 4" fill="none" opacity=".5"/>` +
      `<text x="46" y="138" font-size="13" fill="${RED}" text-anchor="middle">×3</text>` +
      sl(80, 40, '三顧') + sl(190, 40, '草廬'),
    ),
  },
  'sg-02': {
    caption: '물(水)과 물고기(魚)처럼 떨어질 수 없는 사귐(交). “나에게 공명은 물고기의 물이다.”',
    svg: svg(
      `<path d="M70 140 Q160 128 250 140 V180 H70Z" fill="#6b9bb5" opacity=".4"/>` +
      `<g transform="translate(150,158)"><ellipse rx="26" ry="11" fill="${GOLD}"/><path d="M24 0 l16 -12 v24z" fill="${GOLD}"/><circle cx="-14" cy="-3" r="2.5" fill="${INK}"/></g>` +
      `<circle cx="196" cy="146" r="3" fill="none" stroke="${INK}" opacity=".5"/><circle cx="204" cy="138" r="2" fill="none" stroke="${INK}" opacity=".5"/>` +
      fig(40, 162, .9, 1, 'reach', GOLD) + fig(280, 162, .9, -1, 'reach', '#d8c59c') +
      sl(100, 40, '水魚') + sl(220, 40, '之交'),
    ),
  },
  'sg-03': {
    caption: '사흘 만에 몰라보게 달라진 여몽. 눈(目)을 비비고(刮) 서로(相) 다시 대했다(對).',
    svg: svg(
      fig(90, 162, 1, 1, 'reach', '#4a5a66') +
      `<g transform="translate(60,104)"><path d="M-14 0 Q-7 -4 0 0 Q7 -4 14 0 V14 Q7 10 0 14 Q-7 10 -14 14Z" fill="${JADE}" opacity=".85"/></g>` +
      fig(210, 162, 1, -1, 'up', RED) +
      `<path d="M196 98 q-8 -4 -12 2" stroke="${INK}" stroke-width="2" fill="none"/>` +
      `<text x="150" y="92" text-anchor="middle" font-size="18" fill="${RED}">!</text>` +
      sl(80, 40, '刮目') + sl(200, 40, '相對'),
    ),
  },
  'sg-04': {
    caption: '일곱(七) 번 놓아주고(縱) 일곱 번 사로잡아(擒) 마음으로 따르게 한 제갈량.',
    svg: svg(
      `<path d="M30 162 L70 100 L110 162Z" fill="${INK}" opacity=".25"/>` +
      fig(110, 162, 1, 1, 'reach', '#e2d3b2') + fig(210, 162, 1, -1, 'down', '#7a4a2a') +
      Array.from({ length: 7 }, (_, i) => `<circle cx="${110 + i * 16}" cy="70" r="5" fill="${i % 2 ? GOLD : RED}" opacity=".8"/>`).join('') +
      `<path d="M140 120 q20 -14 40 0" stroke="${INK}" fill="none" stroke-dasharray="4 4"/><path d="M176 114 l6 6 l-8 2" stroke="${INK}" fill="none"/>` +
      sl(90, 40, '七縱') + sl(210, 40, '七擒'),
    ),
  },
  // ── 확장팩 「맹자의 가르침」 ──
  'mz-01': {
    caption: '싹(苗)을 뽑아(揠) 올려 자라기(長)를 도운(助) 농부. 싹은 모두 말라 버렸다.',
    svg: svg(
      `<path d="M120 162 H310" stroke="#6b9bb5" stroke-width="6" opacity=".35"/>` +
      [140, 170, 200, 230, 260, 290].map((x, i) => `<path d="M${x} 162 V${i % 2 ? 136 : 140}" stroke="#a89a6a" stroke-width="2"/><path d="M${x} ${i % 2 ? 140 : 144} q-8 -4 -10 2 M${x} ${i % 2 ? 140 : 144} q8 -4 10 2" stroke="#a89a6a" fill="none" stroke-width="2"/><path d="M${x - 3} 162 q3 6 6 0" stroke="${WOOD}" fill="none"/>`).join('') +
      fig(90, 162, 1, 1, 'up', '#6b5a48') +
      `<path d="M108 98 l-3 -10 M112 96 l2 -10" stroke="${JADE}" stroke-width="2"/>` +
      sl(80, 40, '揠苗') + sl(200, 40, '助長'),
    ),
  },
  'mz-02': {
    caption: '하늘과 땅 사이를 가득 채우는 넓고(浩) 큰 그러한(然) 기운(氣).',
    svg: svg(
      `<path d="M0 162 L90 96 L160 140 L230 84 L320 150 V162Z" fill="${INK}" opacity=".25"/>` +
      `<circle cx="250" cy="60" r="18" fill="#f2c14e" opacity=".8"/>` +
      fig(150, 162, 1.05, 1, 'up', JADE) +
      [0, 1, 2].map((i) => `<path d="M${110 - i * 22} ${110 - i * 10} q40 -30 80 0" stroke="${GOLD}" stroke-width="2" fill="none" opacity="${0.8 - i * 0.2}"/>`).join('') +
      sl(80, 40, '浩然') + sl(190, 40, '之氣'),
    ),
  },
  'mz-03': {
    caption: '나무(木)에 올라가(緣) 물고기(魚)를 구하는(求) 것. 방법이 틀리면 얻을 수 없다.',
    svg: svg(
      `<path d="M150 162 V70" stroke="${WOOD}" stroke-width="10"/><circle cx="150" cy="60" r="34" fill="${JADE}" opacity=".85"/><circle cx="120" cy="78" r="20" fill="${JADE}" opacity=".7"/><circle cx="182" cy="78" r="20" fill="${JADE}" opacity=".7"/>` +
      fig(170, 104, .7, 1, 'reach', GOLD) +
      `<path d="M230 150 Q270 140 310 150 V162 H230Z" fill="#6b9bb5" opacity=".45"/><g transform="translate(272,152)"><ellipse rx="10" ry="4.5" fill="${GOLD}"/><path d="M9 0 l7 -5 v10z" fill="${GOLD}"/></g>` +
      `<text x="208" y="96" font-size="16" fill="${RED}">?</text>` +
      sl(60, 40, '緣木') + sl(250, 40, '求魚'),
    ),
  },
  'mz-04': {
    caption: '하루(一) 볕을 쬐고(曝) 열흘(十) 춥게(寒) 두면 어떤 싹도 자라지 못한다.',
    svg: svg(
      `<circle cx="70" cy="80" r="20" fill="#f2c14e"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${70 + Math.cos(i * 0.785) * 26} ${80 + Math.sin(i * 0.785) * 26} l${(Math.cos(i * 0.785) * 8).toFixed(1)} ${(Math.sin(i * 0.785) * 8).toFixed(1)}" stroke="#f2c14e" stroke-width="2"/>`).join('') +
      Array.from({ length: 10 }, (_, i) => `<text x="${150 + (i % 5) * 32}" y="${84 + Math.floor(i / 5) * 30}" font-size="16" fill="#6b9bb5">❄</text>`).join('') +
      `<path d="M160 162 V146 M160 150 q-8 -4 -10 2" stroke="#a89a6a" stroke-width="2" fill="none"/>` +
      `<path d="M110 70 V130" stroke="${INK}" stroke-dasharray="3 4" opacity=".4"/>` +
      sl(70, 140, '一曝') + sl(230, 140, '十寒'),
    ),
  },
};

export function artFor(storyId: string): { svg: string; caption: string } | undefined {
  return ART[storyId];
}

// 그림으로 보는 유래(storyboard.ts)에서 같은 붓질을 쓴다
export { INK, WASH, RED, JADE, GOLD, PAPER, WOOD, fig, arrow, flame, shaft };
