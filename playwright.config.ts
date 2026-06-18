import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests/spec',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: process.env.CI ? 4 : 1,
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
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
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
    {
      name: 'mobile-chrome',
      testMatch: /\/a11y\//,
      use: {
        ...devices['Pixel 5'],
        headless: false,
        channel: process.env.CI ? undefined : 'chrome',
        video: 'off',
        trace: 'off',
      },
    },
    {
      name: 'tablet',
      testMatch: /\/a11y\//,
      use: {
        ...devices['iPad (gen 7)'],
        headless: false,
        channel: process.env.CI ? undefined : 'chrome',
        video: 'off',
        trace: 'off',
      },
    },
  ],
  // globalSetup: './tests/global-setup.ts', // opcional
});
