export interface Screen {
  el: HTMLElement;
  dispose?: () => void;
}

export type Route = (args: string[]) => Screen;

/** 해시 형식: #name 또는 #name-arg (예: #story-sagi-01). 글자·숫자·하이픈만 쓴다. */
export function parseHash(hash: string): { name: string; arg: string } {
  const raw = hash.replace(/^#\/?/, '');
  const i = raw.indexOf('-');
  return i < 0 ? { name: raw, arg: '' } : { name: raw.slice(0, i), arg: raw.slice(i + 1) };
}

export function startRouter(root: HTMLElement, routes: Record<string, Route>, fallback: string): void {
  let current: Screen | null = null;
  const render = () => {
    const { name, arg } = parseHash(location.hash);
    const route = routes[name];
    if (!route) {
      location.replace(`#${fallback}`);
      return;
    }
    current?.dispose?.();
    current = route(arg ? [arg] : []);
    root.replaceChildren(current.el);
    current.el.classList.add('enter');
    window.scrollTo(0, 0);
  };
  window.addEventListener('hashchange', render);
  render();
}

export function go(path: string): void {
  if (location.hash === `#${path}`) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = `#${path}`;
}
