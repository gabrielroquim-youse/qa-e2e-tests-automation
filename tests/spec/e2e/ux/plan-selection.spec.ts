/**
 * Usabilidade — tela plan_selection.
 */
import { orderedPlans } from '../../../data/plans';
import { navigateToPlans } from '../../../helpers/funnel';
import { expect, test } from '../../../fixtures/setupQuotation';

test.describe('UX — Seleção de planos', { tag: ['@ux', '@quotation_auto'] }, () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.setTimeout(240_000);
  });

  test('Deve exibir título, três planos com preço e opção de personalizar', { tag: ['@smoke'] }, async ({ page }) => {
    const plansPage = await navigateToPlans(page);

    await expect(plansPage.title).toBeVisible();
    await expect(page.getByRole('button', { name: /personalizar/i }).first()).toBeVisible();

    for (const plan of orderedPlans) {
      await expect(plansPage.planCard(plan.name)).toBeVisible();
      const price = await plansPage.getPlanMonthlyPriceValue(plan.name);
      expect(price).toBeGreaterThan(0);
      await expect(plansPage.planCard(plan.name).getByRole('button', { name: /quero esse/i })).toBeVisible();
    }
  });
});
