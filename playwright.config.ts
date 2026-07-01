import { defineConfig } from '@playwright/test';
import 'dotenv/config';
import 'dd-trace/ci/init';
import TestConfig from './config/test.config';

/**
 * Workers — 1 localmente para evitar conflito de CPF fixo (123.456.761-08):
 * requisições paralelas com o mesmo CPF são rejeitadas pelo backend QA.
 * CI: 4 (sharding por shard). Override: PW_WORKERS=N
 */
const workers = process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : process.env.CI ? 4 : 1;

export default defineConfig({
  testDir: './tests/spec',
  timeout: 150_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers,
  retries: process.env.CI ? 2 : 1,
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
    {
      // Smoke cross-browser — detecta incompatibilidades CSS/JS/Adyen que o Chromium não vê.
      // Roda apenas @smoke para manter o CI rápido; regressão completa fica no Chromium.
      // Local: requer `npx playwright install firefox` (uma vez por máquina).
      name: 'firefox',
      testIgnore: /\/a11y\//,
      grep: /@smoke/,
      use: {
        browserName: 'firefox',
        headless: !!process.env.CI,
      },
    },
  ],
  // globalSetup: './tests/global-setup.ts', // opcional
});
