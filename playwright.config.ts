import { defineConfig } from '@playwright/test';
import 'dotenv/config';
import TestConfig from './config/test.config';

/**
 * Workers — padrão Playwright: 50% dos processadores lógicos (local).
 * i7-1165G7 (8 threads) → 4 workers. CI: 4 (sharding). Override: PW_WORKERS=2
 */
const workers = process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : process.env.CI ? 4 : '50%';

export default defineConfig({
  testDir: './tests/spec',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [
        ['blob'], // necessário para merge-reports no sharding
        ['list'],
        ['allure-playwright'],
        [
          'playwright-zephyr/lib/src/cloud',
          {
            projectKey: process.env.ZEPHYR_PROJECT_KEY || 'POSV',
            authorizationToken: process.env.ZEPHYR_API_TOKEN,
            autoCreateTestCases: true,
            testCycle: {
              name: process.env.ZEPHYR_TEST_CYCLE_NAME || `Playwright Test Cycle - ${new Date().toISOString()}`,
            },
          },
        ],
      ]
    : [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }], ['allure-playwright']],
  use: {
    baseURL: TestConfig.urls.autoQuotationUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.PW_VIDEO === 'on' ? 'on' : process.env.CI ? 'retain-on-failure' : 'off',
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /\/a11y\//,
      use: {
        channel: process.env.CI ? undefined : 'chrome', // Chrome instalado localmente; Chromium no CI
        headless: !!process.env.CI, // sempre abre o navegador localmente; headless só no CI
        launchOptions: {
          args: ['--start-maximized'],
        },
      },
    },
  ],
  // globalSetup: './tests/global-setup.ts', // opcional
});
