/**
 * Pagamento cartão Adyen — PAY-C2 / PAY-C3 (planner-pagamento.md).
 * Plano Regular + iframes Adyen (cartão mensal padrão).
 */
import { assertPostPaymentOutcome, prepareRegularCardCheckout } from '../../../helpers/paymentCheckout';
import { expect, test } from '../../../fixtures/setupQuotation';

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
});
