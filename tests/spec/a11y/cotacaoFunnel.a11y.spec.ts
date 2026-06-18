/**
 * Smoke de acessibilidade (axe) nas telas críticas do funil de cotação auto.
 *
 * Roda no sandbox a11y — projetos `mobile-chrome`, `mobile-ios`, `tablet` (ver playwright.a11y.config.ts).
 * Pré-requisito: VPN Youse + ambiente QA.
 *
 * @see docs/guides/accessibility-analysis.md
 */
/* eslint-disable playwright/expect-expect -- asserts em tests/helpers/a11y.ts */
import { test } from '@playwright/test';
import { expectNoAccessibilityViolations } from '../../helpers/a11y';
import { navigateToAssistances, navigateToCheckout, navigateToCoverages, navigateToPlans } from '../../helpers/funnel';
import LeadInfoPage from '../../pages/quotation/LeadInfoPage';

const A11Y_TIMEOUT = 240_000;

test.describe('A11y smoke — funil cotação auto', { tag: ['@a11y', '@quotation_auto'] }, () => {
  test.describe.configure({ mode: 'serial' });

  test('lead_info — sem violações serious/critical', async ({ page }) => {
    test.setTimeout(A11Y_TIMEOUT);
    await LeadInfoPage.open(page);
    await expectNoAccessibilityViolations(page, { stepName: 'lead_info' });
  });

  test('plan_selection — sem violações serious/critical', async ({ page }) => {
    test.setTimeout(A11Y_TIMEOUT);
    await navigateToPlans(page);
    await expectNoAccessibilityViolations(page, { stepName: 'plan_selection' });
  });

  test('coverages_selection — sem violações serious/critical', async ({ page }) => {
    test.setTimeout(A11Y_TIMEOUT);
    await navigateToCoverages(page);
    await expectNoAccessibilityViolations(page, { stepName: 'coverages_selection' });
  });

  test('assistances_selection — sem violações serious/critical', async ({ page }) => {
    test.setTimeout(A11Y_TIMEOUT);
    await navigateToAssistances(page);
    await expectNoAccessibilityViolations(page, { stepName: 'assistances_selection' });
  });

  test('checkout — sem violações serious/critical', async ({ page }) => {
    test.setTimeout(A11Y_TIMEOUT);
    await navigateToCheckout(page);
    await expectNoAccessibilityViolations(page, { stepName: 'checkout' });
  });
});
