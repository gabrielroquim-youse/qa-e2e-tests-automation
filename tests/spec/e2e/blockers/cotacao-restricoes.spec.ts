/**
 * Cenários de bloqueio no funil de cotação auto.
 */
import { MaritalStatuses } from '../../../enum/MaritalStatuses';
import { VehicleUsages } from '../../../enum/VehicleUsages';
import { cpf } from '../../../data/cpf';
import { plate } from '../../../data/plate';
import LeadInfoPage from '../../../pages/quotation/LeadInfoPage';
import { expect, test } from '../../../fixtures/setupQuotation';
import TestConfig from '../../../../config/test.config';

test.describe('Bloqueios — Cotação Auto', { tag: ['@b2c', '@quotation_auto', '@negative'] }, () => {
  test('Não deve avançar ao informar veículo blindado', async ({ page }) => {
    const paginaLead = await LeadInfoPage.open(page);
    await paginaLead.fillLeadData();
    const detalhesVeiculoPage = await paginaLead.clickContinueBtn();

    await detalhesVeiculoPage.fillLicensePlate(plate.noInspection.number);
    await detalhesVeiculoPage.selectBrandNew(false);
    await detalhesVeiculoPage.selectBulletproof(true);

    // Blindado bloqueia via mensagem ou remoção do botão Continuar
    const continueBtn = detalhesVeiculoPage.btnContinue;
    /* eslint-disable-next-line playwright/no-conditional-in-test -- bloqueio pode ser UI ou botão oculto */
    const isBlocked = (await continueBtn.isHidden()) || (await detalhesVeiculoPage.bulletproofBlockMessage.isVisible());

    expect(isBlocked).toBeTruthy();
  });

  test('Não deve avançar ao informar placa com AS restrição (veículo de leilão)', async ({ page }) => {
    test.fixme();

    const paginaLead = await LeadInfoPage.open(page);
    await paginaLead.fillLeadData();
    const detalhesVeiculoPage = await paginaLead.clickContinueBtn();

    await detalhesVeiculoPage.fillLicensePlate(plate.refusedAuction.number);
    await detalhesVeiculoPage.selectBrandNew(false);
    await detalhesVeiculoPage.selectBulletproof(false);
    await detalhesVeiculoPage.clickContinueBtn();

    await expect(page.getByText(/leilão|restri|bloqueada|não.*aceita/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('Não deve contratar ao informar CPF com restrição (blacklist)', async ({ page }) => {
    test.setTimeout(360_000);

    const paginaLead = await LeadInfoPage.open(page);
    await paginaLead.fillLeadData();
    const detalhesVeiculoPage = await paginaLead.clickContinueBtn();

    await detalhesVeiculoPage.fillLicensePlate(plate.noInspection.number);
    await detalhesVeiculoPage.selectBrandNew(false);
    await detalhesVeiculoPage.selectBulletproof(false);
    const enderecoUsoPage = await detalhesVeiculoPage.clickContinueBtn();

    await enderecoUsoPage.fillAddress();
    await enderecoUsoPage.isOvernightGarage(true);
    await enderecoUsoPage.selectUsage(VehicleUsages.PRIVATE);
    const dadosPessoaisPage = await enderecoUsoPage.clickContinueBtn();

    await dadosPessoaisPage.fillDocumentNumber(cpf.crivoRefusedInsuredCpfBlacklist.number);
    await dadosPessoaisPage.selectMaritalStatus(MaritalStatuses.SINGLE);
    const classeBonusPage = await dadosPessoaisPage.clickContinueBtn();

    await classeBonusPage.useBonusClass(false);
    const selecaoPlanoPage = await classeBonusPage.clickContinueBtn();

    await expect(selecaoPlanoPage.title).toBeVisible({ timeout: 30_000 });
    const pagamentoPage = await selecaoPlanoPage.selectPlan('Regular');

    await pagamentoPage.checkEmailConfirmation();
    await pagamentoPage.fillCreditCardData(
      TestConfig.credentials.creditCard.number,
      TestConfig.credentials.creditCard.expireDate,
      TestConfig.credentials.creditCard.cvv,
      'youse',
    );
    const resultadoPage = await pagamentoPage.clickFinishBtn();

    await expect(resultadoPage.errorTitle).toBeVisible({ timeout: 15_000 });
  });

  test('Não deve contratar ao informar CPF recusado por PEP', async ({ page }) => {
    test.setTimeout(360_000);

    const paginaLead = await LeadInfoPage.open(page);
    await paginaLead.fillLeadData();
    const detalhesVeiculoPage = await paginaLead.clickContinueBtn();

    await detalhesVeiculoPage.fillLicensePlate(plate.noInspection.number);
    await detalhesVeiculoPage.selectBrandNew(false);
    await detalhesVeiculoPage.selectBulletproof(false);
    const enderecoUsoPage = await detalhesVeiculoPage.clickContinueBtn();

    await enderecoUsoPage.fillAddress();
    await enderecoUsoPage.isOvernightGarage(true);
    await enderecoUsoPage.selectUsage(VehicleUsages.PRIVATE);
    const dadosPessoaisPage = await enderecoUsoPage.clickContinueBtn();

    await dadosPessoaisPage.fillDocumentNumber(cpf.pepRefusedInsured.number);
    await dadosPessoaisPage.selectMaritalStatus(MaritalStatuses.SINGLE);
    const classeBonusPage = await dadosPessoaisPage.clickContinueBtn();

    await classeBonusPage.useBonusClass(false);
    const selecaoPlanoPage = await classeBonusPage.clickContinueBtn();

    await expect(selecaoPlanoPage.title).toBeVisible({ timeout: 90_000 });
    const pagamentoPage = await selecaoPlanoPage.selectPlan('Regular');

    await pagamentoPage.checkEmailConfirmation();
    await pagamentoPage.fillCreditCardData(
      TestConfig.credentials.creditCard.number,
      TestConfig.credentials.creditCard.expireDate,
      TestConfig.credentials.creditCard.cvv,
      'youse',
    );
    const resultadoPage = await pagamentoPage.clickFinishBtn();

    await expect(resultadoPage.errorTitle).toBeVisible({ timeout: 15_000 });
  });
});
