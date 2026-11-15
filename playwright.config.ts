import { defineConfig, devices } from '@playwright/test';

// PR 의 빌드 결과(dist-site)를 실제 서비스와 같은 하위 경로로 띄워 검사한다. 먼저 npm run build.
// 브라우저: chromium 은 전체, mobile-webkit 은 @smoke 만 (CI 또는 PW_WEBKIT=1 일 때).
const PORT = Number(process.env.E2E_PORT || 4173);
const withWebkit = !!process.env.CI || process.env.PW_WEBKIT === '1';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  outputDir: 'test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'qa-output/e2e.json' }],
  ],
  use: {
    baseURL: `http://localhost:${PORT}/gojeon-yeoljeon/`,
    viewport: { width: 390, height: 844 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // 로컬에 크로미움이 따로 있으면 PW_CHROMIUM 으로 지정, 없으면 Playwright 기본 브라우저
    launchOptions: { executablePath: process.env.PW_CHROMIUM || undefined },
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    ...(withWebkit ? [{ name: 'mobile-webkit', grep: /@smoke/, use: { ...devices['iPhone 13'], launchOptions: {} } }] : []),
  ],
  webServer: {
    command: `node scripts/serve-pages.mjs ${PORT}`,
    url: `http://localhost:${PORT}/gojeon-yeoljeon/`,
    reuseExistingServer: !process.env.CI,
  },
});
