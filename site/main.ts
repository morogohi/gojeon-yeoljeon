// 고사 목록은 게임과 같은 콘텐츠 데이터에서 만든다(내용이 어긋나지 않도록).
import { STORIES } from '../src/content/stories';
import { PACKS } from '../src/content/packs';

const list = document.getElementById('slip-list');
if (list) {
  for (const s of STORIES) {
    const a = document.createElement('div');
    a.className = 'slip-item';
    a.innerHTML = `<span class="slip-idiom">${s.idiom}</span><span class="slip-reading">${s.reading}</span><span class="slip-meaning">${s.meaning}</span><span class="slip-source">${s.source}</span>`;
    list.appendChild(a);
  }
}

// 확장팩 고사 목록(같은 콘텐츠 데이터)
const packList = document.getElementById('pack-list');
if (packList) {
  for (const s of PACKS[0].stories) {
    const a = document.createElement('div');
    a.className = 'slip-pack';
    a.innerHTML = `<span class="slip-idiom">${s.idiom}</span><span class="slip-reading">${s.reading}${PACKS[0].trialIds.includes(s.id) ? ' · 무료 체험' : ''}</span><span class="slip-meaning">${s.meaning}</span><span class="slip-source">${s.source}</span>`;
    packList.appendChild(a);
  }
}
