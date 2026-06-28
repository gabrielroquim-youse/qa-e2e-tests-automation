/**
 * PAY-P4b — emissão após confirmação PIX no sandbox (fluxo híbrido).
 *
 * Uso (VPN + navegador visível): npm run test:pix:emission
 */
/* eslint-disable playwright/no-skipped-test, playwright/no-conditional-in-test, playwright/no-page-pause -- fluxo híbrido sandbox */
import { navigateToCheckoutForPix } from '../../../helpers/pixQuotation';
import { confirmPixInSandboxAndFinalize } from '../../../helpers/pixPaymentFlow';
import { savePixBrcodeCapture } from '../../../helpers/pixSandbox';
import { hasStarkCredentials } from '../../../helpers/starkPixPay';
import { expect, test } from '../../../fixtures/setupQuotation';

test.describe('Payment — PIX emissão sandbox', { tag: ['@journey', '@quotation_auto', '@payment'] }, () => {
  test.skip(() => !process.env.PIX_SANDBOX_EMISSION, 'Defina PIX_SANDBOX_EMISSION=1 para rodar PAY-P4b');

  test('PAY-P4b: deve emitir após confirmação PIX no sandbox', async ({ page }) => {
    test.setTimeout(900_000);

    const checkout = await navigateToCheckoutForPix(page);
    await checkout.checkEmailConfirmation();
    await checkout.selectPaymentMethod('pix');
    await checkout.expectPixPaymentVisible();
    await checkout.submitPixCheckout();
    await checkout.expectPixPendingCheckout();

    const brcode = await checkout.copyPixBrcode();
    const protocol = await checkout.getCheckoutProtocol();
    const capture = savePixBrcodeCapture({
      checkoutUrl: page.url(),
      protocol,
      brcode,
    });

    console.log('\n══════════════════════════════════════════════════════════');
    console.log('PIX pendente — confirme o pagamento no sandbox:');
    console.log(`  Protocolo: #${capture.protocol}`);
    console.log(`  Provider:  ${capture.provider}`);
    console.log('  Comandos:  npm run tool:pix-confirm');
    console.log('══════════════════════════════════════════════════════════\n');

    if (process.env.PIX_SANDBOX_AUTO_PAY === '1' && hasStarkCredentials()) {
      await confirmPixInSandboxAndFinalize(checkout, page, brcode);
    } else if (process.env.PIX_SANDBOX_MANUAL_PAUSE !== '0') {
      await page.pause();
      await checkout.finalizeAfterPixPayment();
    } else {
      await checkout.finalizeAfterPixPayment();
    }
    await expect(page).toHaveURL(/\/(issuance|sucesso)|youse\.com\.br/, { timeout: 120_000 });
  });
});
