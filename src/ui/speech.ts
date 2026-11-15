import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { app } from '../state/store';

/** 한국어로 읽어 준다. 앱에서는 기기 TTS, 웹에서는 브라우저 음성 합성을 쓴다. */
export async function speak(text: string): Promise<boolean> {
  if (!app.save.settings.sound || !text.trim()) return false;
  try {
    await TextToSpeech.stop().catch(() => undefined);
    await TextToSpeech.speak({ text, lang: 'ko-KR', rate: 0.9, pitch: 1, volume: 1, category: 'playback' });
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking(): void {
  TextToSpeech.stop().catch(() => undefined);
}

/** 소리를 낼 수 없으면 이유를 글로 알려 준다. 학습은 글로 계속할 수 있다. */
export async function speakWithNotice(text: string, status: HTMLElement): Promise<void> {
  status.textContent = '';
  if (!app.save.settings.sound) {
    status.textContent = '읽어 주기가 꺼져 있어요. 설정에서 켤 수 있어요.';
    return;
  }
  const ok = await speak(text);
  if (!ok) status.textContent = '이 기기에서는 소리를 낼 수 없어요. 글로 읽어 보세요.';
}
