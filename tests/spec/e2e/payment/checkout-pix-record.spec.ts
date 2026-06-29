/**
 * PAY-P4b gravado — funil PIX completo com vídeo (Stark auto-pay ou pause manual).
 *
 * Uso: npm run test:pix:record
 */
/* eslint-disable playwright/no-skipped-test, playwright/no-conditional-in-test, playwright/no-conditional-expect, playwright/no-page-pause -- gravação sandbox */
import { navigateToCheckoutForPix } from '../../../helpers/pixQuotation';
import { confirmPixInSandboxAndFinalize, finalizePixPaymentWhenReady } from '../../../helpers/pixPaymentFlow';
import { loadPixBrcodeCapture, savePixBrcodeCapture } from '../../../helpers/pixSandbox';
import { hasStarkCredentials } from '../../../helpers/starkPixPay';
import { CheckoutPage } from '../../../pages/quotation/CheckoutPage';
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

    const captureReplay = process.env.PIX_USE_CAPTURE_CHECKOUT === '1' ? loadPixBrcodeCapture() : null;
    let checkout: CheckoutPage;
    let brcode: string;

    if (captureReplay?.checkoutUrl) {
      await page.goto(captureReplay.checkoutUrl, { waitUntil: 'domcontentloaded' });
      checkout = new CheckoutPage(page);
      await expect(checkout.title).toBeVisible({ timeout: 90_000 });
      brcode = captureReplay.brcode;
      console.log(`\n[pix-record] Replay checkout: ${captureReplay.checkoutUrl}`);
      console.log(`[pix-record] Protocolo: #${captureReplay.protocol}\n`);
    } else {
      checkout = await navigateToCheckoutForPix(page);
      await checkout.checkEmailConfirmation();
      await checkout.selectPaymentMethod('pix');
      await checkout.expectPixPaymentVisible();
      await checkout.submitPixCheckout();
      await checkout.expectPixPendingCheckout();

      brcode = await checkout.copyPixBrcode();
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
    }

    const autoPay = process.env.PIX_SANDBOX_AUTO_PAY === '1' && hasStarkCredentials() && !captureReplay;

    if (autoPay) {
      await confirmPixInSandboxAndFinalize(checkout, page, brcode);
    } else if (captureReplay && hasStarkCredentials()) {
      console.log('[pix-record] BR Code já pago (tool:pix-pay) — aguardando 2º Finalizar...\n');
      await finalizePixPaymentWhenReady(checkout, page);
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
