/**
 * Config de visual regression — Playwright `toHaveScreenshot()` nativo.
 *
 * Estratégia:
 * - Baseline gerado na primeira execução (stored em tests/__snapshots__/).
 * - PRs subsequentes comparam com o baseline — falha se diferença > threshold.
 * - Atualizar baseline: `npm run test:visual:update`
 *
 * Apenas Chromium — Firefox/WebKit têm rendering de fonte diferente e causariam
 * falsos positivos em comparações cross-browser.
 *
 * @see tests/spec/visual/README.md
 */
import { defineConfig } from '@playwright/test';
import 'dotenv/config';
import TestConfig from './config/test.config';

export default defineConfig({
  testDir: './tests/spec/visual',
  // Testes que navegam o funil completo (plan_selection, checkout) precisam de até 5 min
  // em headless — sem GPU e navegando o QA o cursor pode demorar mais que o habitual.
  timeout: 300_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      // Tolerância de 2% — absorve diferenças de anti-aliasing e sub-pixel rendering.
      // Aumentar para 0.05 se a tela tiver animações residuais.
      maxDiffPixelRatio: 0.02,
      // Aguarda que a tela esteja estável (sem mudanças de pixels) antes de capturar.
      animations: 'disabled',
      // CSS das scrollbars varia entre OS — ocultar para comparações consistentes.
      caret: 'hide',
    },
  },
  fullyParallel: false,
  workers: 1,
  retries: 0, // Visual regression não usa retry — diferenças devem ser revisadas
  snapshotDir: './tests/__snapshots__',
  snapshotPathTemplate: '{snapshotDir}/{testFilePath}/{arg}{ext}',
  reporter: process.env.CI
    ? [['list'], ['html', { outputFolder: 'playwright-report/visual', open: 'never' }]]
    : [['list'], ['html', { outputFolder: 'playwright-report/visual', open: 'never' }]],
  use: {
    baseURL: TestConfig.urls.autoQuotationUrl,
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
    // Viewport fixo garante screenshots consistentes entre máquinas
    viewport: { width: 1280, height: 800 },
    // Chrome sem channel para CI (não tem Chrome instalado)
    channel: process.env.CI ? undefined : 'chrome',
    headless: true, // Visual regression sempre headless para consistência
    deviceScaleFactor: 1, // Sem HiDPI para evitar diferenças entre monitores
  },
  projects: [
    {
      name: 'chromium-visual',
      use: { browserName: 'chromium' },
    },
  ],
});
