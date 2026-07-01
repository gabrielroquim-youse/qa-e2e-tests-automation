/**
 * Smoke de acessibilidade em dark mode (WCAG 1.4.3 — contraste mínimo 4.5:1).
 *
 * Usa `page.emulateMedia({ colorScheme: 'dark' })` para ativar o tema escuro
 * no browser e re-executa os mesmos scans axe das telas críticas.
 *
 * Por que este spec existe?
 * - O scan axe padrão (cotacaoFunnel.a11y.spec.ts) roda em light mode.
 * - Em dark mode, componentes com cores hardcoded (texto claro sobre fundo claro
 *   que vira escuro) podem violar WCAG 1.4.3 sem que o scan em light mode detecte.
 * - O projeto qa-mobile-tests-automation usa `checkDarkMode` via `adb` e recomendou
 *   explicitamente replicar este check no web usando `emulateMedia`.
 *
 * Roda apenas em `desktop` (dark mode via CSS `prefers-color-scheme`) — tablet e
 * mobile têm dark mode via sistema operacional, coberto pelo qa-mobile-tests-automation.
 *
 * Pré-requisito: VPN Youse + ambiente QA.
 *
 * @see docs/guides/a11y-gap-map.md
 * @see qa-mobile-tests-automation/docs/accessibility.md#dark-mode
 */
/* eslint-disable playwright/expect-expect -- asserts em tests/helpers/a11y.ts */
import { test } from '../../fixtures/setupQuotation';
import { expectNoAccessibilityViolations } from '../../helpers/a11y';
import { navigateToPlans, navigateToCheckout } from '../../helpers/funnel';
import LeadInfoPage from '../../pages/quotation/LeadInfoPage';

const DARK_MODE_TIMEOUT = 240_000;

test.describe('A11y dark mode (WCAG 1.4.3) — funil cotação auto', { tag: ['@a11y', '@quotation_auto'] }, () => {
  test.beforeEach(async ({ page }) => {
    // Ativa dark mode via media query — simula usuário com tema escuro no SO
    await page.emulateMedia({ colorScheme: 'dark' });
  });

  test('lead_info — sem violações de contraste em dark mode', async ({ page }) => {
    test.setTimeout(DARK_MODE_TIMEOUT);
    await LeadInfoPage.open(page);
    await expectNoAccessibilityViolations(page, { stepName: 'lead_info-dark', failOnModerate: true });
  });

  test('plan_selection — sem violações de contraste em dark mode', async ({ page }) => {
    test.setTimeout(DARK_MODE_TIMEOUT);
    await navigateToPlans(page);
    await expectNoAccessibilityViolations(page, { stepName: 'plan_selection-dark', failOnModerate: true });
  });

  test('checkout — sem violações de contraste em dark mode', async ({ page }) => {
    test.setTimeout(DARK_MODE_TIMEOUT);
    await navigateToCheckout(page);
    await expectNoAccessibilityViolations(page, { stepName: 'checkout-dark', failOnModerate: true });
  });
});
