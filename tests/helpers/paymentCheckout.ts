import { expect, Page } from '@playwright/test';
import { getAdyenTestCard, type AdyenCardScenario } from '../data/adyenTestCards';
import { CheckoutPage } from '../pages/quotation/CheckoutPage';
import { IssuancePage } from '../pages/quotation/IssuancePage';
import { navigateToPlans } from './funnel';

/** Checkout plano Regular com cartão Adyen preenchido. */
export async function prepareRegularCardCheckout(page: Page, scenario: AdyenCardScenario = 'approved'): Promise<CheckoutPage> {
  const plans = await navigateToPlans(page);
  const checkout = await plans.selectPlan('Regular');
  await expect(checkout.title).toBeVisible({ timeout: 60_000 });

  const card = getAdyenTestCard(scenario);
  await checkout.checkEmailConfirmation();
  await checkout.fillCreditCardData(card.number, card.expireDate, card.cvv, card.holderName);
  return checkout;
}

/** Valida os três caminhos pós-pagamento documentados no QA (jornadas). */
export async function assertPostPaymentOutcome(page: Page, emissaoPage: IssuancePage, insuredEmail: string): Promise<void> {
  if (emissaoPage.isOnSuccessPage()) {
    await expect(emissaoPage.title).toBeVisible({ timeout: 15_000 });
    await expect(emissaoPage.tagCotacaoRealizada).toBeVisible();
    await expect(emissaoPage.tagPagamentoValidado).toBeVisible();
    await expect(emissaoPage.apoliceSectionAuto).toBeVisible();
    await expect(emissaoPage.emailDoSegurado(insuredEmail)).toBeVisible();
  } else if (page.url().includes('youse.com.br')) {
    await expect(page).toHaveURL(/youse\.com\.br/);
  } else {
    await expect(page).toHaveURL(/\/issuance/);
  }
}
