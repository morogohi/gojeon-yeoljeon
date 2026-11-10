import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 390, height: 844 },
    // 로컬에 크로미움이 따로 있으면 PW_CHROMIUM 으로 지정, 없으면 Playwright 기본 브라우저
    launchOptions: { executablePath: process.env.PW_CHROMIUM || undefined },
  },
  // 실제 배포 구조(dist-site: / 홍보, /play 게임)를 그대로 띄운다. 먼저 npm run build.
  webServer: { command: 'npx vite preview -c vite.site.config.ts --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: true },
});
