/**
 * Jornada E2E — plano pré-formatado Regular (fluxo F1).
 *
 * @see docs/guides/fluxos-cotacao-auto.md
 */
import { expect, test } from '../../../fixtures/setupQuotation';
import { navigateToPlans } from '../../../helpers/funnel';

test.describe('Jornada — Plano Regular', { tag: ['@b2c', '@journey', '@quotation_auto', '@happy_path'] }, () => {
  test('Deve chegar ao checkout com plano Regular sem pagar', { tag: ['@smoke', '@ux'] }, async ({ page, quotationData }) => {
    test.setTimeout(240_000);

    const selecaoPlanoPage = await navigateToPlans(page, {}, quotationData);
    const pagamentoPage = await selecaoPlanoPage.selectPlan('Regular');

    await expect(pagamentoPage.title).toBeVisible({ timeout: 60_000 });
    await expect(pagamentoPage.emailConfirmation).toBeVisible();
    await expect(pagamentoPage.btnFinish).toBeVisible();
  });

  test('Deve contratar com plano Regular até emissão', { tag: ['@regression'] }, async ({ page, quotationData }) => {
    test.setTimeout(360_000);

    const selecaoPlanoPage = await navigateToPlans(page, {}, quotationData);
    const pagamentoPage = await selecaoPlanoPage.selectPlan('Regular');

    await pagamentoPage.checkEmailConfirmation();
    await expect(pagamentoPage.upsellButton('Seguro Residencial')).toBeVisible();
    await expect(pagamentoPage.upsellButton('Seguro Vida')).toBeVisible();

    await pagamentoPage.openAssistenciasAccordion();
    await expect(page.getByText('Proteção de Rodas, Pneu e Suspensão', { exact: false })).toBeVisible();

    await pagamentoPage.fillCreditCardData(
      quotationData.creditCard.number,
      quotationData.creditCard.expireDate,
      quotationData.creditCard.cvv,
      quotationData.creditCard.holderName,
    );
    const emissaoPage = await pagamentoPage.clickFinishBtn();

    // Etapa 11: Validações pós-pagamento (3 caminhos possíveis no QA)
    /* eslint-disable playwright/no-conditional-in-test, playwright/no-conditional-expect -- QA: sucesso, redirect ou webhook */
    if (emissaoPage.isOnSuccessPage()) {
      await expect(emissaoPage.title).toBeVisible({ timeout: 15_000 });
      await expect(emissaoPage.tagCotacaoRealizada).toBeVisible();
      await expect(emissaoPage.tagPagamentoValidado).toBeVisible();
      await expect(emissaoPage.apoliceSectionAuto).toBeVisible();
      await expect(emissaoPage.emailDoSegurado(quotationData.email)).toBeVisible();
    } else if (page.url().includes('youse.com.br')) {
      await expect(page).toHaveURL(/youse\.com\.br/);
    } else {
      await expect(page).toHaveURL(/\/issuance/);
    }
    /* eslint-enable playwright/no-conditional-in-test, playwright/no-conditional-expect */
  });
});
