/**
 * Captura BR Code PIX pendente no checkout QA.
 *
 * Uso (VPN on):
 *   npm run tool:pix-capture
 *
 * Saída: docs/reports/pix-brcode-capture.json
 * Próximo passo: npm run tool:pix-confirm
 */
import { expect, test } from '../../fixtures/setupQuotation';
import { navigateToCheckoutForPix } from '../../helpers/pixQuotation';
import { savePixBrcodeCapture } from '../../helpers/pixSandbox';

test.describe('Tools — captura PIX BR Code', { tag: ['@tool', '@payment'] }, () => {
  test('Gera pix-brcode-capture.json no checkout pendente', async ({ page }) => {
    test.setTimeout(300_000);

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

    expect(capture.brcode).toMatch(/^000201/);
    expect(capture.protocol.length).toBeGreaterThan(5);

    console.log(`\n[capture] protocol=#${capture.protocol} provider=${capture.provider}`);
    console.log(`[capture] arquivo → docs/reports/pix-brcode-capture.json`);
    console.log(`[capture] próximo → npm run tool:pix-confirm\n`);
  });
});
