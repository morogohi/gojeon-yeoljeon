// dist(게임) → dist-site/play 로 복사하고 GitHub Pages용 .nojekyll 을 둔다.
import { cpSync, writeFileSync, existsSync } from 'fs';
if (!existsSync('dist/index.html')) throw new Error('먼저 npm run build:app 을 실행하세요');
cpSync('dist', 'dist-site/play', { recursive: true });
writeFileSync('dist-site/.nojekyll', '');
console.log('dist-site 준비 완료: / (홍보), /play (게임), /support.html, /privacy.html');
