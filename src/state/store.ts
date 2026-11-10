import { browserKV, loadSave, persistSave, type KV, type SaveData } from './save';
import { touchStreak } from '../engine/rewards';

function localToday(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const params = new URLSearchParams(location.search);
const e2e = params.get('e2e') === '1';
const todayParam = params.get('today');

const kv: KV = browserKV();

export const app = {
  e2e,
  today: e2e && todayParam && /^\d{4}-\d{2}-\d{2}$/.test(todayParam) ? todayParam : localToday(),
  save: loadSave(kv) as SaveData,
  seed(): number {
    return e2e ? 12345 : (Math.random() * 2 ** 31) >>> 0;
  },
};

export function commit(next: SaveData): void {
  app.save = next;
  persistSave(kv, next);
}

export function startSession(): void {
  commit(touchStreak(app.save, app.today));
  applySettingsToPage();
}

/** 큰 글씨 등 화면 설정을 문서에 반영 */
export function applySettingsToPage(): void {
  document.body.classList.toggle('large', app.save.settings.large);
}
