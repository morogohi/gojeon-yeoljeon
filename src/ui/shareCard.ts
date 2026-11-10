import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import type { Story } from '../content/types';
import { artFor } from '../content/art';

export const SITE_URL = 'https://morogohi.github.io/gojeon-yeoljeon/';
const SERIF = '"Noto Serif KR", "Noto Serif CJK KR", "AppleMyungjo", serif';
const SANS = '"Gowun Dodum", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

function loadSvg(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** SNS에 올리기 좋은 4:5 성어 카드 (1080×1350) */
export async function renderIdiomCard(story: Story): Promise<Blob> {
  const W = 1080, H = 1350;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  await document.fonts?.ready;
  ctx.fillStyle = '#18222f';
  ctx.fillRect(0, 0, W, H);
  const art = artFor(story.id);
  if (art) {
    const img = await loadSvg(art.svg);
    ctx.drawImage(img, 60, 60, 960, 540);
  }
  ctx.fillStyle = '#ece2c9';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `900 150px ${SERIF}`;
  ctx.fillText([...story.idiom].join(' '), 60, 800);
  ctx.font = `700 44px ${SANS}`;
  ctx.fillStyle = '#d0a84f';
  ctx.fillText([...story.reading].join(' '), 66, 880);
  ctx.fillStyle = '#ece2c9';
  ctx.font = `400 40px ${SANS}`;
  wrap(ctx, story.meaning, 960).slice(0, 4).forEach((l, i) => ctx.fillText(l, 64, 970 + i * 60));
  ctx.fillStyle = '#9fadbd';
  ctx.font = `400 32px ${SANS}`;
  ctx.fillText(story.source, 64, 1230);
  // 낙관
  ctx.save();
  ctx.translate(950, 1210);
  ctx.rotate(-0.08);
  ctx.fillStyle = '#c8402f';
  ctx.fillRect(-60, -60, 120, 120);
  ctx.fillStyle = '#fff4ea';
  ctx.font = `900 46px ${SERIF}`;
  ctx.textAlign = 'center';
  ctx.fillText('古', 0, -6);
  ctx.fillText('典', 0, 44);
  ctx.restore();
  ctx.fillStyle = '#9fadbd';
  ctx.font = `400 28px ${SANS}`;
  ctx.fillText('고전열전 · morogohi.github.io/gojeon-yeoljeon', 64, 1290);
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('이미지를 만들지 못했다'))), 'image/png'));
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

/** 성어 카드를 이미지로 공유한다. 공유를 못 하는 브라우저에서는 이미지를 저장한다. */
export async function shareIdiomCard(story: Story, btn: HTMLButtonElement): Promise<void> {
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = '카드 만드는 중…';
  const text = `${story.idiom}(${story.reading}) — ${story.meaning}\n고전열전에서 배웠어요 ${SITE_URL}`;
  const name = `gojeon-${story.id}.png`;
  try {
    const blob = await renderIdiomCard(story);
    if (Capacitor.isNativePlatform()) {
      const saved = await Filesystem.writeFile({ path: name, data: await blobToBase64(blob), directory: Directory.Cache });
      await Share.share({ title: `${story.idiom} ${story.reading}`, text, files: [saved.uri] });
      btn.textContent = label;
    } else {
      const file = new File([blob], name, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${story.idiom} ${story.reading}`, text });
        btn.textContent = label;
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        btn.textContent = '이미지를 저장했다';
      }
    }
  } catch (e) {
    // 사용자가 공유 창을 닫은 경우는 실패로 보지 않는다
    btn.textContent = (e as Error)?.name === 'AbortError' ? label : '공유하지 못했다. 다시 눌러 보자';
  } finally {
    btn.disabled = false;
  }
}

/** 텍스트 공유(학습 리포트 등). 공유가 안 되면 클립보드에 복사한다. 결과 문구를 돌려준다. */
export async function shareText(title: string, text: string): Promise<string> {
  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({ title, text });
      return '공유 창을 열었다';
    }
    if (navigator.share) {
      await navigator.share({ title, text });
      return '공유 창을 열었다';
    }
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return '';
  }
  try {
    await navigator.clipboard.writeText(text);
    return '클립보드에 복사했다. 메신저에 붙여 넣으면 된다';
  } catch {
    return '이 기기에서는 공유할 수 없다';
  }
}
