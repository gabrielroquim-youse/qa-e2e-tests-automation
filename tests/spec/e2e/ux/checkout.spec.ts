/**
 * Usabilidade — tela checkout (plano Regular, sem pagamento).
 */
import { navigateToPlans } from '../../../helpers/funnel';
import { expect, test } from '../../../fixtures/setupQuotation';

test.describe('UX — Checkout', { tag: ['@ux', '@quotation_auto'] }, () => {
  test('Deve exibir resumo, confirmação de e-mail e upsells opcionais', { tag: ['@smoke'] }, async ({ page }) => {
    test.setTimeout(240_000);

    const plansPage = await navigateToPlans(page);
    const checkout = await plansPage.selectPlan('Regular');

    await expect(checkout.title).toBeVisible({ timeout: 60_000 });
    await expect(checkout.emailConfirmation).toBeVisible();
    await expect(checkout.btnFinish).toBeVisible();
    await expect(checkout.upsellButton('Seguro Residencial')).toBeVisible();
    await expect(checkout.upsellButton('Seguro Vida')).toBeVisible();

    await checkout.openAssistenciasAccordion();
    await expect(page.getByText(/assistência|assistencias/i).first()).toBeVisible();
  });
});
