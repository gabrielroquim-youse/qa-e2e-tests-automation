/**
 * Jornada E2E — plano personalizado até emissão (fluxo F2).
 *
 * @see docs/guides/fluxos-cotacao-auto.md
 */
import { expect, test, generateQuotationData } from '../../../fixtures/setupQuotation';
import { MaritalStatuses } from '../../../enum/MaritalStatuses';
import { VehicleUsages } from '../../../enum/VehicleUsages';
import { AssistancesSelectionPage } from '../../../pages/quotation/AssistancesSelectionPage';
import { IssuancePage } from '../../../pages/quotation/IssuancePage';
import LeadInfoPage from '../../../pages/quotation/LeadInfoPage';

const PLAN_TIMEOUT = 45_000;

test.describe('Jornada — Plano personalizado', { tag: ['@b2c', '@journey', '@personalizacao', '@quotation_auto', '@happy_path'] }, () => {
  test('Deve contratar plano personalizado com configurações padrão', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(480_000);

    const data = generateQuotationData();

    const paginaLead = await LeadInfoPage.open(page);
    await paginaLead.fillLeadData({ name: data.name, email: data.email, phone: data.phone });
    const detalhesVeiculoPage = await paginaLead.clickContinueBtn();

    await detalhesVeiculoPage.fillLicensePlate(data.licensePlate);
    await detalhesVeiculoPage.selectBrandNew(false);
    await detalhesVeiculoPage.selectBulletproof(false);
    const enderecoUsoPage = await detalhesVeiculoPage.clickContinueBtn();

    await enderecoUsoPage.fillAddress(data.zipCode, data.addressNumber);
    await enderecoUsoPage.isOvernightGarage(true);
    await enderecoUsoPage.selectUsage(VehicleUsages.PRIVATE);
    const dadosPessoaisPage = await enderecoUsoPage.clickContinueBtn();

    await dadosPessoaisPage.fillDocumentNumber(data.documentNumber);
    await dadosPessoaisPage.selectMaritalStatus(MaritalStatuses.SINGLE);
    const classeBonusPage = await dadosPessoaisPage.clickContinueBtn();

    await classeBonusPage.useBonusClass(false);
    const selecaoPlanoPage = await classeBonusPage.clickContinueBtn();
    await expect(selecaoPlanoPage.title).toBeVisible({ timeout: PLAN_TIMEOUT });

    const coberturas = await selecaoPlanoPage.openPersonalization();
    await coberturas.waitForPrice();

    const assistencias: AssistancesSelectionPage = await coberturas.clickContinueBtn();
    await assistencias.heading.waitFor({ state: 'visible', timeout: 30_000 });
    await assistencias.dismissPromoModal();
    await assistencias.waitForPrice();

    const pagamentoPage = await assistencias.clickContinueBtn();

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
