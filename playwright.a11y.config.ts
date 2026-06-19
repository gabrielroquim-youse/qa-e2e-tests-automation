/**
 * Sandbox de acessibilidade — emula celular (Android + iOS) e tablet.
 *
 * Não substitui device físico nem leitor de tela nativo; cobre viewport,
 * touch, axe WCAG e navegação por teclado contra QA (VPN).
 *
 * @see docs/guides/a11y-device-sandbox.md
 */
import { defineConfig } from '@playwright/test';
import 'dotenv/config';
import TestConfig from './config/test.config';
import { createA11yProjects } from './tests/config/a11yDevices';

export default defineConfig({
  testDir: './tests/spec',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list']] : [['list'], ['html', { outputFolder: 'playwright-report/a11y', open: 'never' }]],
  use: {
    baseURL: TestConfig.urls.autoQuotationUrl,
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
  },
  projects: createA11yProjects(),
});
