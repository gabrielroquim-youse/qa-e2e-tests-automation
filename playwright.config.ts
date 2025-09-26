import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    // storageState: 'storage/auth.json', // login reutilizável
  },
  projects: [
    //{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome', headless: false } },
    //{ name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    //{ name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    // mobile exemplo:
    // { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  // globalSetup: './tests/global-setup.ts', // opcional
});
