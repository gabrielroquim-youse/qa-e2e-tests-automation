/**
 * Validação de Valores — delta simétrico (Estratégia A).
 * Ver docs/planners/planner-validacao-valores.md
 */
/* eslint-disable playwright/expect-expect -- asserts em pricingAssertions.ts */
import { test } from '@playwright/test';
import { assertSymmetricPriceToggle } from '../../helpers/pricingAssertions';
import { navigateToAssistances, navigateToCoverages } from '../../helpers/funnel';

const TEST_TIMEOUT = 180_000;

test.describe('Validação de Valores — delta simétrico', { tag: ['@value', '@quotation_auto'] }, () => {
  test('IPVA ligar/desligar deve ser simétrico no total anual', { tag: ['@assistencias'] }, async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const p = await navigateToAssistances(page);
    await assertSymmetricPriceToggle(
      () => p.getAnnualPrice(),
      (from) => p.waitForPriceUpdate(from),
      () => p.clickAssistanceToggle('Restituição de IPVA'),
    );
  });

  test('Assistência a bike ligar/desligar deve ser simétrico', { tag: ['@assistencias'] }, async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const p = await navigateToAssistances(page);
    await assertSymmetricPriceToggle(
      () => p.getAnnualPrice(),
      (from) => p.waitForPriceUpdate(from),
      () => p.clickAssistanceToggle('Assistência a bike'),
    );
  });

  test('Danos Morais ligar/desligar deve ser simétrico', { tag: ['@coberturas'] }, async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const p = await navigateToCoverages(page);
    await assertSymmetricPriceToggle(
      () => p.getAnnualPrice(),
      (from) => p.waitForPriceUpdate(from),
      () => p.clickCoverageToggle('Danos Morais'),
    );
  });
});
