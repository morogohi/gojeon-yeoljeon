import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const ID = 1101;

export const reminderSupported = (): boolean => Capacitor.isNativePlatform();

/** 매일 같은 시각에 복습 알림. time 이 null 이면 끈다. 성공 여부를 돌려준다. */
export async function scheduleReminder(time: string | null): Promise<boolean> {
  if (!reminderSupported()) return false;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: ID }] });
    if (!time) return true;
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return false;
    const [hour, minute] = time.split(':').map(Number);
    await LocalNotifications.schedule({
      notifications: [{
        id: ID,
        title: '고전열전',
        body: '오늘의 고사와 복습 카드가 기다린다. 10분이면 한 고사를 복원할 수 있다.',
        schedule: { on: { hour, minute }, allowWhileIdle: true },
      }],
    });
    return true;
  } catch {
    return false;
  }
}
