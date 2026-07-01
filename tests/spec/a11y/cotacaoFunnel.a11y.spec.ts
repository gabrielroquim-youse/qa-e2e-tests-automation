/**
 * Smoke de acessibilidade (axe) nas telas críticas do funil de cotação auto.
 *
 * Roda no sandbox a11y — projetos `mobile-chrome`, `mobile-ios`, `tablet` (ver playwright.a11y.config.ts).
 * Pré-requisito: VPN Youse + ambiente QA.
 *
 * @see docs/guides/accessibility-analysis.md
 */
/* eslint-disable playwright/expect-expect -- asserts em tests/helpers/a11y.ts */
import { test, generateQuotationData } from '../../fixtures/setupQuotation';
import { expectNoAccessibilityViolations } from '../../helpers/a11y';
import {
  navigateToAssistances,
  navigateToCheckout,
  navigateToCoverages,
  navigateToPlans,
  navigateToVehicleDetails,
  navigateToVehicleAdditional,
  navigateToPersonData,
  navigateToBonusesClass,
} from '../../helpers/funnel';
import { MaritalStatuses } from '../../enum/MaritalStatuses';
import LeadInfoPage from '../../pages/quotation/LeadInfoPage';

const A11Y_TIMEOUT = 240_000;

test.describe('A11y smoke — funil cotação auto', { tag: ['@a11y', '@quotation_auto'] }, () => {
  test('lead_info — sem violações serious/critical', async ({ page }) => {
    test.setTimeout(A11Y_TIMEOUT);
    await LeadInfoPage.open(page);
    await expectNoAccessibilityViolations(page, { stepName: 'lead_info' });
  });

  test('vehicle_details — sem violações serious/critical', async ({ page }) => {
    test.setTimeout(A11Y_TIMEOUT);
    await navigateToVehicleDetails(page);
    await expectNoAccessibilityViolations(page, { stepName: 'vehicle_details' });
  });

  test('vehicle_additional_details — sem violações serious/critical', async ({ page }) => {
    test.setTimeout(A11Y_TIMEOUT);
    await navigateToVehicleAdditional(page);
    await expectNoAccessibilityViolations(page, { stepName: 'vehicle_additional_details' });
  });

  test('person_data — sem violações serious/critical', async ({ page }) => {
    test.setTimeout(A11Y_TIMEOUT);
    await navigateToPersonData(page);
    await expectNoAccessibilityViolations(page, { stepName: 'person_data' });
  });

  test('data_enrichment — sem violações serious/critical (quando presente)', async ({ page }) => {
    test.setTimeout(A11Y_TIMEOUT);
    const data = generateQuotationData();
    const personPage = await navigateToPersonData(page);
    await personPage.fillDocumentNumber(data.documentNumber);
    await personPage.selectMaritalStatus(MaritalStatuses.SINGLE);
    await personPage.btnContinue.click();

    await page.waitForURL(/data_enrichment|bonuses_class/, { timeout: 60_000, waitUntil: 'commit' });

    /* eslint-disable playwright/no-conditional-in-test, playwright/no-skipped-test -- etapa condicional: só aparece para CPFs com dados enriquecíveis */
    if (!page.url().includes('data_enrichment')) {
      test.skip(true, 'data_enrichment não apareceu nesta execução (CPF sem dados a enriquecer)');
      return;
    }
    /* eslint-enable playwright/no-conditional-in-test, playwright/no-skipped-test */

    await expectNoAccessibilityViolations(page, { stepName: 'data_enrichment' });
  });

  test('bonuses_class — sem violações serious/critical', async ({ page }) => {
    test.setTimeout(A11Y_TIMEOUT);
    await navigateToBonusesClass(page);
    await expectNoAccessibilityViolations(page, { stepName: 'bonuses_class' });
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

  test('risk_acceptance — sem violações serious/critical (quando presente)', async ({ page }) => {
    test.setTimeout(A11Y_TIMEOUT);
    const assistancesPage = await navigateToAssistances(page);
    await assistancesPage.btnContinue.click();

    await page.waitForURL(/risk_acceptance|checkout/, { timeout: 120_000, waitUntil: 'commit' });

    /* eslint-disable playwright/no-conditional-in-test, playwright/no-skipped-test -- etapa condicional: só aparece para perfis de risco específicos (ex: sem garagem) */
    if (!page.url().includes('risk_acceptance')) {
      test.skip(true, 'risk_acceptance não apareceu nesta execução (perfil sem gatilho de risco)');
      return;
    }
    /* eslint-enable playwright/no-conditional-in-test, playwright/no-skipped-test */

    await expectNoAccessibilityViolations(page, { stepName: 'risk_acceptance' });
  });

  test('checkout — sem violações serious/critical', async ({ page }) => {
    test.setTimeout(A11Y_TIMEOUT);
    await navigateToCheckout(page);
    await expectNoAccessibilityViolations(page, { stepName: 'checkout' });
  });
});
