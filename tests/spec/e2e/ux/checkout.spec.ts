/**
 * Usabilidade — tela checkout (plano Regular, sem pagamento).
 */
import { navigateToPlans } from '../../../helpers/funnel';
import { expectStayOnUrl } from '../../../helpers/formValidation';
import { expect, test } from '../../../fixtures/setupQuotation';

test.describe('UX — Checkout', { tag: ['@ux', '@quotation_auto'] }, () => {
  test('Deve exibir resumo, confirmação de e-mail e upsells opcionais', { tag: ['@smoke'] }, async ({ page }) => {
    test.setTimeout(240_000);

    const plansPage = await navigateToPlans(page);
    const checkout = await plansPage.selectPlan('Regular');

    await expect(checkout.title).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText(/confirmo que o e-mail e telefone estão corretos/i)).toBeVisible();
    await expect(checkout.emailConfirmation).toBeAttached();
    await expect(checkout.btnFinish).toBeVisible();
    await expect(checkout.upsellButton('Seguro Residencial')).toBeVisible();
    await expect(checkout.upsellButton('Seguro Vida')).toBeVisible();

    await checkout.openAssistenciasAccordion();
    await expect(page.getByText(/assistência|assistencias/i).first()).toBeVisible();
  });

  test('Deve listar assistências do plano no accordion expandido', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(240_000);

    const plansPage = await navigateToPlans(page);
    const checkout = await plansPage.selectPlan('Regular');

    await expect(checkout.title).toBeVisible({ timeout: 60_000 });
    await checkout.openAssistenciasAccordion();

    await expect(page.getByText(/guincho|carro reserva|assistência/i).first()).toBeVisible();
    await expect(checkout.assistenciasAccordion).toBeVisible();
  });

  test('Cross-sell residencial e vida devem iniciar opcionais (Adicionar)', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(240_000);

    const plansPage = await navigateToPlans(page);
    const checkout = await plansPage.selectPlan('Regular');

    await expect(checkout.title).toBeVisible({ timeout: 60_000 });

    await expect(checkout.upsellCard('Seguro Residencial')).toBeVisible();
    await expect(checkout.upsellCard('Seguro Vida')).toBeVisible();
    await expect(checkout.upsellButton('Seguro Residencial')).toHaveText(/adicionar/i);
    await expect(checkout.upsellButton('Seguro Vida')).toHaveText(/adicionar/i);
  });

  test('Deve adicionar Seguro Residencial ao clicar em Adicionar', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(240_000);

    const plansPage = await navigateToPlans(page);
    const checkout = await plansPage.selectPlan('Regular');

    await expect(checkout.title).toBeVisible({ timeout: 60_000 });
    await checkout.addUpsell('Seguro Residencial', 'Casa');

    await expect(page.getByText(/detalhe do pagamento seguro residencial/i)).toBeVisible({ timeout: 30_000 });
    await expect(checkout.upsellSummaryLine('Seguro Residencial')).toBeVisible();
    await expect(checkout.upsellCard('Seguro Residencial')).toHaveCount(0);
    await expect(checkout.btnFinish).toBeVisible();
  });

  test('Não deve sair do checkout ao finalizar sem cartão preenchido', { tag: ['@regression', '@negative'] }, async ({ page }) => {
    test.setTimeout(240_000);

    const plansPage = await navigateToPlans(page);
    const checkout = await plansPage.selectPlan('Regular');

    await expect(checkout.title).toBeVisible({ timeout: 60_000 });
    await checkout.btnFinish.click({ noWaitAfter: true });

    await expectStayOnUrl(page, /\/checkout/);
    await expect(checkout.title).toBeVisible();
    await expect(checkout.cardHolderName).toBeVisible();
  });
});
