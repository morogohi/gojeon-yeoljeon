// 확장팩 상세·구매 화면. 무료 12편은 그대로 무료이고, 확장팩은 보호자가 한 번 구매한다.
import { h, replace, topbar } from '../dom';
import { app, commit } from '../../state/store';
import { getPack, PACKS } from '../../content/packs';
import { ownsPack } from '../../engine/rewards';
import { billing, isNativeApp, type PurchaseResult } from '../../state/billing';
import { storyboardEl } from '../learnCards';
import { artEl } from '../art';
import type { Screen } from '../../state/router';

const SUPPORT = 'support.um09@gmail.com';

export function packScreen(args: string[]): Screen {
  const pack = getPack(args[0] ?? '') ?? PACKS[0];
  const body = h('div', { class: 'pack-body' });
  const el = h('main', { class: 'screen pack', 'data-testid': 'pack-screen' }, topbar(h('span', null, '확장팩'), `#map-${pack.stories[0].book}`), body);
  const msg = h('p', { class: 'pack-msg', role: 'status', 'data-testid': 'pack-msg' });

  const grant = () => {
    if (!ownsPack(app.save, pack.id)) commit({ ...app.save, owned: [...app.save.owned, pack.id] });
  };

  /** 보호자 확인: 아이가 실수로 결제하지 않도록 어른만 풀 수 있는 계산을 묻는다 */
  const parentGate = (onPass: () => void) => {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 6 + Math.floor(Math.random() * 4);
    const input = h('input', { type: 'text', inputmode: 'numeric', id: 'gate-answer', 'data-testid': 'gate-answer', autocomplete: 'off' }) as HTMLInputElement;
    const gateMsg = h('p', { class: 'pack-msg', role: 'status' });
    const box = h('section', { class: 'card gate', 'data-testid': 'parent-gate', role: 'dialog', 'aria-label': '보호자 확인', 'data-answer': app.e2e ? String(a * b) : undefined },
      h('h3', null, '보호자 확인'),
      h('p', null, '구매는 보호자만 할 수 있어요. 아래 계산의 답을 숫자로 입력해 주세요.'),
      h('label', { for: 'gate-answer', class: 'gate-q' }, `${a} 곱하기 ${b}는?`),
      input,
      h('div', { class: 'result-actions' },
        h('button', { class: 'btn', onclick: () => box.remove() }, '취소'),
        h('button', { class: 'btn primary', 'data-testid': 'gate-ok', onclick: () => {
          if (Number(input.value.trim()) === a * b) { box.remove(); onPass(); }
          else { gateMsg.textContent = '답이 맞지 않아요. 보호자께 부탁해 주세요.'; input.value = ''; }
        } }, '확인'),
      ),
      gateMsg,
    );
    msg.after(box);
    input.focus();
  };

  const explain = (r: PurchaseResult) => {
    if (r === 'purchased') { grant(); render(); msg.textContent = '구매가 완료됐어요. 네 고사가 모두 열렸어요.'; return; }
    if (r === 'cancelled') msg.textContent = '구매를 취소했어요.';
    else if (r === 'unavailable') msg.textContent = isNativeApp()
      ? '스토어 결제를 준비하고 있어요. 앱 업데이트 후 구매할 수 있어요.'
      : '확장팩은 App Store·Google Play 앱에서 구매할 수 있어요(앱 출시 준비 중). 웹에서는 첫 고사를 무료로 체험할 수 있어요.';
    else msg.textContent = '구매를 마치지 못했어요. 잠시 뒤 다시 시도해 주세요.';
  };

  const buy = () => parentGate(async () => {
    msg.textContent = '스토어에 연결하는 중…';
    explain(await billing().purchase(pack.productId));
  });

  const restore = async () => {
    msg.textContent = '구매 내역을 확인하는 중…';
    const ids = await billing().restore();
    if (ids.includes(pack.productId)) { grant(); render(); msg.textContent = '구매 내역을 찾아 확장팩을 다시 열었어요.'; }
    else msg.textContent = isNativeApp() || app.e2e ? '이 계정으로 산 확장팩이 없어요.' : '구매 복원은 앱에서 할 수 있어요.';
  };

  function render() {
    const owned = ownsPack(app.save, pack.id);
    replace(body,
      h('section', { class: 'card pack-hero' },
        h('p', { class: 'eyebrow' }, owned ? '보유한 확장팩' : `확장팩 ${PACKS.indexOf(pack) + 1}`),
        h('h2', { class: 'pack-title' }, pack.title, ' ', h('span', { class: 'hanja-sm' }, pack.hanja)),
        h('p', null, pack.lead),
        h('ul', { class: 'pack-includes' }, ...pack.includes.map((x) => h('li', null, x))),
      ),
      h('ol', { class: 'pack-list', 'data-testid': 'pack-list' },
        ...pack.stories.map((s, i) => {
          const trial = pack.trialIds.includes(s.id);
          return h('li', { class: 'pack-item' },
            artEl(s.id, { plain: true, cls: 'node-thumb' }),
            h('span', { class: 'node-body' },
              h('span', { class: 'node-idiom' }, s.idiom),
              h('span', { class: 'node-reading' }, `${i + 1}. ${s.reading} · ${s.era ?? ''}`),
            ),
            h('span', { class: `pack-tag${trial ? ' free' : ''}` }, owned ? '보유' : trial ? '무료 체험' : '확장팩'),
          );
        }),
      ),
      storyboardEl(pack.stories[0]),
      owned
        ? h('a', { class: 'btn primary big', href: `#map-${pack.stories[0].book}`, 'data-testid': 'pack-play' }, '고사 지도로 가기')
        : h('div', { class: 'pack-actions' },
          h('a', { class: 'btn big', href: `#story-${pack.trialIds[0]}`, 'data-testid': 'pack-trial' }, '첫 고사 무료 체험'),
          h('button', { class: 'btn primary big', 'data-testid': 'pack-buy', onclick: buy }, '보호자 확인 후 구매'),
          h('button', { class: 'btn small', 'data-testid': 'pack-restore', onclick: restore }, '구매 복원'),
        ),
      msg,
      h('section', { class: 'card pack-note' },
        h('p', null, '무료 12편(사기·논어)은 앞으로도 무료이고 광고가 없어요. 확장팩은 한 번 구매하면 계속 쓸 수 있어요. 가격은 스토어에 표시돼요.'),
        h('p', null, '학교·학원 단체 이용은 ', h('a', { href: `mailto:${SUPPORT}?subject=${encodeURIComponent('[고전열전] 단체 이용 문의')}`, 'data-testid': 'b2b-contact' }, SUPPORT), ' 로 문의해 주세요.'),
      ),
    );
  }

  render();
  return { el };
}
