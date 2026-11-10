// 고사 목록은 게임과 같은 콘텐츠 데이터에서 만든다(내용이 어긋나지 않도록).
import { STORIES } from '../src/content/stories';

const list = document.getElementById('slip-list');
if (list) {
  for (const s of STORIES) {
    const a = document.createElement('div');
    a.className = 'slip-item';
    a.innerHTML = `<span class="slip-idiom">${s.idiom}</span><span class="slip-reading">${s.reading}</span><span class="slip-meaning">${s.meaning}</span><span class="slip-source">${s.source}</span>`;
    list.appendChild(a);
  }
}
