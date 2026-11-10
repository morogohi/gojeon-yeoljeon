type Child = Node | string | number | null | undefined | false | Child[];
type Props = Record<string, unknown> | null;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props?: Props, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener);
      else if (k === 'class') el.className = String(v);
      else if (k === 'style') el.setAttribute('style', String(v));
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, String(v));
    }
  }
  append(el, children);
  return el;
}

function append(el: Node, children: Child[]): void {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
  }
}

export function clear(el: Element): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function replace(el: Element, ...children: Child[]): void {
  clear(el);
  append(el, children);
}

export function stars(n: number, max = 3): HTMLElement {
  return h('span', { class: 'stars', 'aria-label': `별 ${n}개` }, ...Array.from({ length: max }, (_, i) => h('span', { class: i < n ? 'on' : 'off' }, '★')));
}

export function topbar(title: Child, back: string | null, right?: Child): HTMLElement {
  return h('header', { class: 'topbar' },
    back ? h('a', { class: 'back', href: back, 'aria-label': '뒤로' }, '←') : h('span', { class: 'back' }),
    h('div', { class: 'topbar-title' }, title),
    h('div', { class: 'topbar-right' }, right ?? ''),
  );
}
