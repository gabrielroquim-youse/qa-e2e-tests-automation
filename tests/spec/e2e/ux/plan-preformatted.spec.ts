/**
 * Usabilidade — plano pré-formatado (Essencial) vs personalizado.
 * CAP-33: assistências imutáveis no pacote fechado; editáveis no fluxo Personalizar.
 */
import { navigateToAssistances, navigateToPlans } from '../../../helpers/funnel';
import { expect, test } from '../../../fixtures/setupQuotation';

test.describe('UX — Plano pré-formatado (assistências)', { tag: ['@ux', '@quotation_auto', '@regression'] }, () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.setTimeout(240_000);
  });

  test('Essencial deve exibir pacote fixo de assistências no card', { tag: ['@smoke'] }, async ({ page }) => {
    const plansPage = await navigateToPlans(page);

    const texto = await plansPage.getPlanAssistanceText('Essencial');
    expect(texto).toMatch(/guincho|200\s*km/i);

    await expect(plansPage.planCard('Essencial').getByRole('button', { name: /quero esse/i })).toBeVisible();
    await expect(page.getByTestId('plan-card-button-custom')).toBeVisible();
  });

  test('Checkout Essencial deve resumir assistências sem toggles de edição', async ({ page }) => {
    const plansPage = await navigateToPlans(page);
    const checkout = await plansPage.selectPlan('Essencial');

    await expect(checkout.title).toBeVisible({ timeout: 60_000 });
    await checkout.openAssistenciasAccordion();

    await expect(page.getByText(/guincho|200\s*km/i).first()).toBeVisible();
    await expect(page.getByRole('switch')).toHaveCount(0);
  });

  test('Fluxo personalizado deve exibir toggles na tela de assistências', async ({ page }) => {
    const assistancesPage = await navigateToAssistances(page);
    await assistancesPage.dismissPromoModal();

    await expect(assistancesPage.assistanceSwitch('Assistência a automóvel')).toBeVisible();
    await expect(assistancesPage.assistanceSwitch('Carro reserva')).toBeVisible();
  });
});
