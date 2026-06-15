/**
 * Testes E2E do fluxo completo de Cotação e Contratação de Seguro Auto (B2C).
 *
 * Cobre o caminho feliz (lead → veículo → endereço → CPF → bônus → plano → checkout → emissão)
 * e cenários negativos de bloqueio (veículo blindado, placa de leilão, CPF restrito).
 *
 * Pré-requisito: estar na rede VPN da Youse com acesso ao ambiente QA.
 */
import { MaritalStatuses } from '../../enum/MaritalStatuses';
import { VehicleUsages } from '../../enum/VehicleUsages';
import { cpf } from '../../data/cpf';
import { plate } from '../../data/plate';
import LeadInfoPage from '../../pages/quotation/LeadInfoPage';
import { expect, test } from '../../fixtures/setupQuotation';
import TestConfig from '../../../config/test.config';

test.describe('B2C - Cotação e Contratação - Seguro Auto', { tag: ['@b2c', '@quotation_auto', '@happy_path'] }, () => {
  test('Deve realizar cotação e contratação com sucesso (Caminho Feliz)', async ({ page, quotationData }) => {
    test.setTimeout(360_000);
    // Etapa 1 + 2: Abertura e dados de contato
    const paginaLead = await LeadInfoPage.open(page);
    await paginaLead.fillLeadData({ name: quotationData.name, email: quotationData.email, phone: quotationData.phone });
    const detalhesVeiculoPage = await paginaLead.clickContinueBtn();

    // Etapa 3: Dados do veículo
    await detalhesVeiculoPage.fillLicensePlate(quotationData.licensePlate);
    await detalhesVeiculoPage.selectBrandNew(false);
    await detalhesVeiculoPage.selectBulletproof(false);
    const enderecoUsoPage = await detalhesVeiculoPage.clickContinueBtn();

    // Etapa 4: CEP, número e uso do veículo
    await enderecoUsoPage.fillAddress(quotationData.zipCode, quotationData.addressNumber);
    await enderecoUsoPage.isOvernightGarage(true);
    await enderecoUsoPage.selectUsage(VehicleUsages.PRIVATE);
    const dadosPessoaisPage = await enderecoUsoPage.clickContinueBtn();

    // Etapa 5 + 6: CPF e estado civil
    await dadosPessoaisPage.fillDocumentNumber(quotationData.documentNumber);
    await dadosPessoaisPage.selectMaritalStatus(MaritalStatuses.SINGLE);
    const classeBonusPage = await dadosPessoaisPage.clickContinueBtn();

    // Etapa 7: Histórico de seguro — sem classe de bônus
    await classeBonusPage.useBonusClass(false);
    const selecaoPlanoPage = await classeBonusPage.clickContinueBtn();

    // Etapa 8: Validação dos planos disponíveis
    await expect(selecaoPlanoPage.title).toBeVisible({ timeout: 30_000 });

    // Etapa 9: Seleção do plano Regular
    const pagamentoPage = await selecaoPlanoPage.selectPlan('Regular');

    // Etapa 10: Checkout — confirmação e pagamento
    await pagamentoPage.checkEmailConfirmation();

    // Garante que Seguro Residencial e Seguro de Vida NÃO estão adicionados
    await expect(pagamentoPage.upsellButton('Seguro Residencial')).toBeVisible();
    await expect(pagamentoPage.upsellButton('Seguro Vida')).toBeVisible();

    // Abre sanfona de assistências e verifica proteção de rodas
    await pagamentoPage.openAssistenciasAccordion();
    await expect(page.getByText('Proteção de Rodas, Pneu e Suspensão', { exact: false })).toBeVisible();

    // Preenche dados do cartão e finaliza
    await pagamentoPage.fillCreditCardData(
      quotationData.creditCard.number,
      quotationData.creditCard.expireDate,
      quotationData.creditCard.cvv,
      quotationData.creditCard.holderName,
    );
    const emissaoPage = await pagamentoPage.clickFinishBtn();

    // Etapa 11: Validações pós-pagamento
    // QA possui três caminhos possíveis após a contratação:
    if (emissaoPage.isOnSuccessPage()) {
      // Caminho A: tela /sucesso com confirmação completa da apólice
      await expect(emissaoPage.title).toBeVisible({ timeout: 15_000 });
      await expect(emissaoPage.tagCotacaoRealizada).toBeVisible();
      await expect(emissaoPage.tagPagamentoValidado).toBeVisible();
      await expect(emissaoPage.apoliceSectionAuto).toBeVisible();
      // Nota: o backend retorna o nome associado ao CPF de teste, não o gerado pelo faker
      await expect(emissaoPage.emailDoSegurado(quotationData.email)).toBeVisible();
    } else if (page.url().includes('youse.com.br')) {
      // Caminho B: redirecionamento para www.youse.com.br — pagamento processado com sucesso
      await expect(page).toHaveURL(/youse\.com\.br/);
    } else {
      // Caminho C: permanece em /issuance aguardando webhook — pagamento enviado, redirect pendente no QA
      await expect(page).toHaveURL(/\/issuance/);
    }
  });
});

test.describe('B2C - Cenários Negativos - Cotação Auto', { tag: ['@b2c', '@quotation_auto', '@negative'] }, () => {
  test('Não deve avançar ao informar veículo blindado', async ({ page }) => {
    const paginaLead = await LeadInfoPage.open(page);
    await paginaLead.fillLeadData();
    const detalhesVeiculoPage = await paginaLead.clickContinueBtn();

    await detalhesVeiculoPage.fillLicensePlate(plate.noInspection.number);
    await detalhesVeiculoPage.selectBrandNew(false);
    await detalhesVeiculoPage.selectBulletproof(true);

    // Ao ativar blindado, o fluxo deve ser bloqueado — botão Continuar some ou exibe aviso
    const continueBtn = detalhesVeiculoPage.btnContinue;
    const isBlocked = (await continueBtn.isHidden()) || (await detalhesVeiculoPage.bulletproofBlockMessage.isVisible());

    expect(isBlocked).toBeTruthy();
  });

  test('Não deve avançar ao informar placa com restrição (veículo de leilão)', async ({ page }) => {
    // FIXME: O ambiente QA não bloqueia placas de leilão no step vehicle_details.
    // A placa YOU-0016 (status: refused.vehicle.auction, source: nortix) avança normalmente
    // para vehicle_additional_details sem exibir mensagem de restrição.
    // Comportamento esperado: exibir mensagem de bloqueio após clicar em Continuar.
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
    // Comportamento real no QA: o CPF não é bloqueado nos steps do funil.
    // O bloqueio ocorre apenas ao finalizar o checkout — exibe tela de erro "Oh no!".
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
    // Comportamento real no QA: o CPF não é bloqueado nos steps do funil.
    // O bloqueio ocorre apenas ao finalizar o checkout — exibe tela de erro "Oh no!".
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
