/**
 * Jornada E2E — plano personalizado até emissão (fluxo F2).
 *
 * @see docs/guides/fluxos-cotacao-auto.md
 */
import { expect, test, generateQuotationData } from '../../../fixtures/setupQuotation';
import { IssuancePage } from '../../../pages/quotation/IssuancePage';
import { navigateToCheckout } from '../../../helpers/funnel';

test.describe('Jornada — Plano personalizado', { tag: ['@b2c', '@journey', '@personalizacao', '@quotation_auto', '@happy_path'] }, () => {
  test('Deve contratar plano personalizado com configurações padrão', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(480_000);

    const data = generateQuotationData();

    const pagamentoPage = await navigateToCheckout(page, {}, {}, data);

    await pagamentoPage.checkEmailConfirmation();
    await pagamentoPage.fillCreditCardData(data.creditCard.number, data.creditCard.expireDate, data.creditCard.cvv, data.creditCard.holderName);
    const emissaoPage: IssuancePage = await pagamentoPage.clickFinishBtn();

    /* eslint-disable playwright/no-conditional-in-test, playwright/no-conditional-expect -- QA: sucesso, redirect ou webhook */
    if (emissaoPage.isOnSuccessPage()) {
      await expect(emissaoPage.title).toBeVisible({ timeout: 15_000 });
      await expect(emissaoPage.tagCotacaoRealizada).toBeVisible();
      await expect(emissaoPage.tagPagamentoValidado).toBeVisible();
      await expect(emissaoPage.apoliceSectionAuto).toBeVisible();
      await expect(emissaoPage.emailDoSegurado(data.email)).toBeVisible();
    } else if (page.url().includes('youse.com.br')) {
      await expect(page).toHaveURL(/youse\.com\.br/);
    } else {
      await expect(page).toHaveURL(/\/issuance/);
    }
    /* eslint-enable playwright/no-conditional-in-test, playwright/no-conditional-expect */
  });
});
