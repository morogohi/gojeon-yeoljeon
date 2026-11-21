// 앱 내 구매(확장팩) 어댑터.
// - 실제 결제는 iOS App Store·Google Play 의 앱 내 구매로만 한다(웹에서는 결제하지 않는다).
// - 스토어 상품(App Store Connect·Play Console)과 결제 플러그인을 연결하기 전까지는 'unavailable'을 돌려준다.
//   연결할 때는 이 파일의 nativeStore 만 채우면 된다(화면·보유권 로직은 그대로).
// - 테스트: ?e2e=1&billing=ok|cancel|error|owned 로 결과를 흉내 낸다(owned: 복원하면 이미 산 것으로 나옴).
import { Capacitor } from '@capacitor/core';
import { app } from './store';

export type PurchaseResult = 'purchased' | 'cancelled' | 'unavailable' | 'error';

interface StoreAdapter {
  available(): Promise<boolean>;
  purchase(productId: string): Promise<PurchaseResult>;
  /** 이미 산 상품 ID 목록 */
  restore(): Promise<string[]>;
}

const nativeStore: StoreAdapter = {
  // 결제 플러그인(예: cordova-plugin-purchase / RevenueCat)을 연결하면 여기서 스토어를 부른다.
  async available() { return false; },
  async purchase() { return 'unavailable'; },
  async restore() { return []; },
};

const webStore: StoreAdapter = {
  async available() { return false; },
  async purchase() { return 'unavailable'; },
  async restore() { return []; },
};

function testStore(mode: string): StoreAdapter {
  const bought: string[] = [];
  return {
    async available() { return true; },
    async purchase(id) {
      if (mode === 'ok') { bought.push(id); return 'purchased'; }
      return mode === 'cancel' ? 'cancelled' : 'error';
    },
    async restore() { return mode === 'owned' ? ['gojeon.pack.generals'] : [...bought]; },
  };
}

export function billing(): StoreAdapter {
  const mode = new URLSearchParams(location.search).get('billing');
  if (app.e2e && mode) return testStore(mode);
  return Capacitor.isNativePlatform() ? nativeStore : webStore;
}

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}
