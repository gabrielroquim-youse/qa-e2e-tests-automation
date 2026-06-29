/**
 * Pagamento cartão Adyen — PAY-C2 / PAY-C3 / PAY-C-REF / PAY-C-INV (planner-pagamento.md).
 * Plano Regular + iframes Adyen (cartão mensal padrão).
 */
import { assertPostPaymentOutcome, prepareRegularCardCheckout } from '../../../helpers/paymentCheckout';
import { getAdyenTestCard } from '../../../data/adyenTestCards';
import { expect, test } from '../../../fixtures/setupQuotation';
import { navigateToPlans } from '../../../helpers/funnel';

test.describe('Payment — Cartões Adyen', { tag: ['@regression', '@quotation_auto', '@payment'] }, () => {
  test('PAY-C2: deve contratar com cartão Elo BR aprovado', async ({ page, quotationData }) => {
    test.setTimeout(360_000);

    const checkout = await prepareRegularCardCheckout(page, 'elo_br');
    await expect(checkout.btnFinish).toBeEnabled();
    const emissaoPage = await checkout.clickFinishBtn();
    await assertPostPaymentOutcome(page, emissaoPage, quotationData.email);
  });

  test('PAY-C3: deve contratar com cartão Hipercard BR aprovado', async ({ page, quotationData }) => {
    test.setTimeout(360_000);

    const checkout = await prepareRegularCardCheckout(page, 'hipercard_br');
    await expect(checkout.btnFinish).toBeEnabled();
    const emissaoPage = await checkout.clickFinishBtn();
    await assertPostPaymentOutcome(page, emissaoPage, quotationData.email);
  });

  test('PAY-C-INV: número de cartão inválido deve exibir erro de formato no iframe Adyen', { tag: ['@negative'] }, async ({ page }) => {
    test.setTimeout(240_000);

    const plans = await navigateToPlans(page);
    const checkout = await plans.selectPlan('Regular');
    await expect(checkout.title).toBeVisible({ timeout: 60_000 });

    const card = getAdyenTestCard('invalid_number');
    await checkout.checkEmailConfirmation();
    // Preenche número inválido (falha Luhn) e dispara validação saindo do campo
    await checkout.cardNumber.pressSequentially(card.number.replace(/\s/g, ''), { delay: 50 });
    await checkout.cardHolderName.focus(); // blur do campo de cartão dispara validação

    // Adyen exibe mensagem de erro de formato dentro do iframe ou abaixo do campo
    const iframeErrorMsg = page
      .locator('iframe[title*="número de cartão"]')
      .contentFrame()
      .getByText(/número de cartão inválido|invalid card number|invalido/i);
    const outerErrorMsg = page.getByText(/número de cartão inválido|invalid card number/i);

    await expect(iframeErrorMsg.or(outerErrorMsg).first()).toBeVisible({ timeout: 15_000 });
  });

  test('PAY-C-REF: cartão recusado pelo emissor deve exibir mensagem de erro no checkout', { tag: ['@negative'] }, async ({ page }) => {
    test.setTimeout(360_000);

    const checkout = await prepareRegularCardCheckout(page, 'refused');
    await expect(checkout.btnFinish).toBeEnabled();
    await checkout.btnFinish.click({ noWaitAfter: true });

    // Após recusa, o checkout deve permanecer na mesma tela com mensagem de erro do Adyen
    await expect(page).toHaveURL(/\/checkout/, { timeout: 30_000 });
    const errorMsg = page.getByText(/recusad|refused|pagamento n[aã]o aprovado|tente outro cart[aã]o/i);
    await expect(errorMsg).toBeVisible({ timeout: 60_000 });
  });
});
