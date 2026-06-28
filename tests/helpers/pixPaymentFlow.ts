import { Page } from '@playwright/test';
import { expect } from '../fixtures/setupQuotation';
import { CheckoutPage } from '../pages/quotation/CheckoutPage';
import { hasStarkCredentials, payBrcodeWithStark } from './starkPixPay';

async function completeIssuanceRedirectIfNeeded(page: Page): Promise<void> {
  if (!page.url().includes('/issuance')) {
    return;
  }
  const btnOk = page.getByRole('button', { name: /ok,?\s*entendi/i });
  try {
    await page.waitForURL(/\/sucesso|youse\.com\.br/, { timeout: 30_000 });
  } catch {
    // isVisible() é intencional aqui: usado como guarda de fluxo condicional,
    // não como assertion. Web-first assertion não se aplica nesse caso.
    if (await btnOk.isVisible()) {
      await btnOk.click();
    }
    await page.waitForURL(/\/sucesso|youse\.com\.br/, { timeout: 60_000 }).catch(() => {});
  }
}

/** Paga BR Code no Stark sandbox e aguarda webhook antes do segundo Finalizar. */
export async function confirmPixInSandboxAndFinalize(checkout: CheckoutPage, page: Page, brcode: string): Promise<void> {
  if (!hasStarkCredentials()) {
    throw new Error('Credenciais Stark ausentes (STARK_PROJECT_ID, STARK_PRIVATE_KEY, STARK_TAX_ID).');
  }

  const payment = await payBrcodeWithStark(brcode);
  console.info(`\n[pix] Stark BrcodePayment: id=${payment.id} status=${payment.status}`);
  console.info('[pix] Aguardando webhook e segundo Finalizar...\n');

  await finalizePixPaymentWhenReady(checkout, page);
  await completeIssuanceRedirectIfNeeded(page);
}

/** Tenta Finalizar até redirect pós-pagamento (webhook PIX pode demorar). */
export async function finalizePixPaymentWhenReady(checkout: CheckoutPage, page: Page, timeoutMs = 180_000): Promise<void> {
  await expect
    .poll(
      async () => {
        if (!page.url().includes('/checkout')) {
          return true;
        }
        return checkout.tryFinalizeAfterPixPayment(25_000);
      },
      { timeout: timeoutMs, intervals: [6_000, 8_000, 10_000] },
    )
    .toBe(true);

  if (page.url().includes('/checkout')) {
    throw new Error('PIX não confirmou a tempo no sandbox.');
  }
}
