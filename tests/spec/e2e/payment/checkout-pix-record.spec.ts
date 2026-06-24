/**
 * PAY-P4b gravado — funil PIX completo com vídeo (Stark auto-pay ou pause manual).
 *
 * Uso: npm run test:pix:record
 */
/* eslint-disable playwright/no-skipped-test, playwright/no-conditional-in-test, playwright/no-page-pause -- gravação sandbox */
import { navigateToCheckout } from '../../../helpers/funnel';
import { confirmPixInSandboxAndFinalize } from '../../../helpers/pixPaymentFlow';
import { savePixBrcodeCapture } from '../../../helpers/pixSandbox';
import { hasStarkCredentials } from '../../../helpers/starkPixPay';
import { expect, test } from '../../../fixtures/setupQuotation';

const slowMo = process.env.PW_SLOW_MO ? Number(process.env.PW_SLOW_MO) : 60;

test.use({
  video: 'on',
  viewport: { width: 1280, height: 800 },
  launchOptions: { slowMo },
});

test.describe('Payment — PIX gravação', { tag: ['@journey', '@quotation_auto', '@payment', '@record'] }, () => {
  test.skip(() => !process.env.PIX_RECORD, 'Defina PIX_RECORD=1 (npm run test:pix:record)');

  test('PAY-P4b record: PIX pago, aceito e emissão gravada', async ({ page }) => {
    test.setTimeout(900_000);

    const checkout = await navigateToCheckout(page);
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
    console.log('PIX gravando — confirmação de pagamento:');
    console.log(`  Protocolo: #${capture.protocol}`);
    console.log(`  Provider:  ${capture.provider}`);
    console.log('══════════════════════════════════════════════════════════\n');

    const autoPay = process.env.PIX_SANDBOX_AUTO_PAY === '1' && hasStarkCredentials();

    if (autoPay) {
      await confirmPixInSandboxAndFinalize(checkout, page, brcode);
    } else if (process.env.PIX_SANDBOX_MANUAL_PAUSE !== '0') {
      console.log('Sem STARK_* — pause no Inspector para confirmar PIX manualmente.\n');
      await page.pause();
      await checkout.finalizeAfterPixPayment();
    } else {
      await checkout.finalizeAfterPixPayment();
    }

    await expect(page).toHaveURL(/\/(issuance|sucesso)|youse\.com\.br/, { timeout: 120_000 });
  });
});
