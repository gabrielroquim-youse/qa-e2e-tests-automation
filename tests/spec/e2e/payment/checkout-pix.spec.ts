/**
 * Pagamento PIX no checkout — PAY-P1 a PAY-P4 (planner-pagamento.md).
 * PIX fica em "Veja outras formas de pagamento com desconto".
 */
import { navigateToCheckout } from '../../../helpers/funnel';
import { expect, test } from '../../../fixtures/setupQuotation';

test.describe('Payment — PIX checkout', { tag: ['@regression', '@quotation_auto', '@payment'] }, () => {
  test('PAY-P1: deve exibir opção PIX ao expandir formas de pagamento', { tag: ['@smoke'] }, async ({ page }) => {
    test.setTimeout(300_000);

    const checkout = await navigateToCheckout(page);
    await expect(checkout.title).toBeVisible({ timeout: 60_000 });

    await checkout.expandOtherPaymentMethods();
    await expect(checkout.paymentMethodPix).toBeVisible({ timeout: 15_000 });
    await expect(checkout.paymentMethodPix).toContainText(/pix/i);
  });

  test('PAY-P2: deve exibir interface PIX ao selecionar o método', async ({ page }) => {
    test.setTimeout(300_000);

    const checkout = await navigateToCheckout(page);
    await checkout.checkEmailConfirmation();

    await checkout.selectPaymentMethod('pix');
    await checkout.expectPixPaymentVisible();
  });

  test('PAY-P3: deve exibir CPF do segurado em Suas informações com PIX selecionado', async ({ page, quotationData }) => {
    test.setTimeout(300_000);

    const checkout = await navigateToCheckout(page, {}, {}, { documentNumber: quotationData.documentNumber });
    await checkout.checkEmailConfirmation();
    await checkout.selectPaymentMethod('pix');
    await checkout.expectPixPaymentVisible();
    await checkout.expectInsuredCpfVisible(quotationData.documentNumber);
  });

  test('PAY-P4: deve permanecer no checkout com PIX pendente ao finalizar', async ({ page }) => {
    test.setTimeout(300_000);

    const checkout = await navigateToCheckout(page);
    await checkout.checkEmailConfirmation();
    await checkout.selectPaymentMethod('pix');
    await checkout.expectPixPaymentVisible();

    await checkout.submitPixCheckout();
    await checkout.expectPixPendingCheckout();
  });
});
