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

const fixedToday = e2e && todayParam && /^\d{4}-\d{2}-\d{2}$/.test(todayParam) ? todayParam : null;

export const app = {
  e2e,
  /** 오늘 날짜. 앱을 켜 둔 채 자정을 넘기면 다음 날로 바뀐다(목표·복습 일정이 따라간다). */
  get today(): string {
    return fixedToday ?? localToday();
  },
  save: loadSave(kv) as SaveData,
  seed(): number {
    return e2e ? 12345 : (Math.random() * 2 ** 31) >>> 0;
  },
};

export function commit(next: SaveData): void {
  app.save = next;
  persistSave(kv, next);
}

let sessionDay = '';
export function startSession(): void {
  sessionDay = app.today;
  commit(touchStreak(app.save, sessionDay));
  applySettingsToPage();
}

/** 화면을 옮길 때 날짜가 바뀌었으면 출석을 새로 센다 */
export function checkDayChange(): void {
  if (app.today !== sessionDay) startSession();
}

/** 큰 글씨 등 화면 설정을 문서에 반영 */
export function applySettingsToPage(): void {
  document.body.classList.toggle('large', app.save.settings.large);
}
