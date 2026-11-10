import { defineConfig } from 'vite';
import { resolve } from 'path';

// 홍보·안내 사이트. 게임 빌드(dist)는 scripts/assemble-site.mjs 가 /play 로 넣는다.
export default defineConfig({
  root: 'site',
  base: './',
  build: {
    outDir: '../dist-site',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'site/index.html'),
        support: resolve(__dirname, 'site/support.html'),
        privacy: resolve(__dirname, 'site/privacy.html'),
        copyright: resolve(__dirname, 'site/copyright.html'),
      },
    },
  },
});
