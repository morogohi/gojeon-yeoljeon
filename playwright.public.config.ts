import { defineConfig } from '@playwright/test';

// 배포 후 공개 URL 핵심 기능 확인. PR 판정에는 쓰지 않는다(PR 은 playwright.config.ts 로 빌드 결과를 검사).
export default defineConfig({
  testDir: 'tests/public',
  timeout: 60_000,
  retries: 1,
  outputDir: 'test-results-public',
  reporter: [['list'], ['json', { outputFile: 'qa-output/public.json' }], ['html', { outputFolder: 'playwright-report-public', open: 'never' }]],
  use: {
    baseURL: process.env.PUBLIC_URL || 'https://morogohi.github.io/gojeon-yeoljeon/',
    viewport: { width: 390, height: 844 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: { executablePath: process.env.PW_CHROMIUM || undefined },
  },
});
