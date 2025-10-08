import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright'],
    //['playwright-qase-reporter'] //{
  //     testops: {
  //       api: { token: process.env.QASE_API_TOKEN! },
  //       project: process.env.QASE_PROJECT_CODE!,
  //       uploadAttachments: true,
  //     },
  //     run: {
  //       title: `PW Run ${new Date().toISOString()}`,
  //       description: 'Execução via Playwright CI',
  //       complete: true
  //     },
  //   }],
   ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    // storageState: 'storage/auth.json', // login reutilizável
  },
  projects: [
    { 
      name: 'Automação de Testes - Playwright', 
      use: { 
        ...devices['Desktop Chrome'], 
        channel: 'chrome', 
        headless: process.env.CI ? true : false // headless no CI, com interface localmente
      } 
    },
    //{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    //{ name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    //{ name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    // mobile exemplo:
    // { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  // globalSetup: './tests/global-setup.ts', // opcional
});
