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
