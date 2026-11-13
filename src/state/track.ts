import { app, commit } from './store';
import { markStep, type FunnelKey } from '../engine/funnel';

/**
 * 진행 단계 기록. 기본은 기기 안에만 남긴다.
 * 빌드할 때 VITE_ANALYTICS_URL 을 지정하면, 처음 도달한 단계 이름과 날짜만
 * (기기·사람을 알아볼 수 있는 정보 없이) 그 주소로 보낸다. 지정하지 않으면 아무것도 보내지 않는다.
 */
const ENDPOINT: string = (import.meta.env?.VITE_ANALYTICS_URL as string | undefined) ?? '';

export function track(key: FunnelKey): void {
  const r = markStep(app.save, key, app.today);
  if (!r.first) return;
  commit(r.save);
  if (ENDPOINT && !app.e2e) {
    try {
      navigator.sendBeacon?.(ENDPOINT, JSON.stringify({ step: key, day: app.today, v: 1 }));
    } catch {
      // 전송 실패는 게임에 영향을 주지 않는다
    }
  }
}
