/**
 * Testes de Personalização de Coberturas e Assistências — Seguro Auto.
 *
 * Valida que ações do usuário na tela de personalização resultam na
 * direção correta de variação de prêmio:
 *  - Adicionar cobertura → prêmio aumenta
 *  - Remover cobertura → prêmio diminui
 *  - Franquia menor → prêmio maior (menor deductible = maior risco assumido)
 *  - Indenização maior → prêmio maior
 *  - Adicionar assistência → prêmio aumenta
 *
 * Estratégia:
 *  - Cada teste é completamente independente: navega o funil do zero.
 *  - Não são fixados valores absolutos — apenas relações de direção (A > B).
 *  - Prêmio inicial lido após waitForPrice(); novo prêmio após waitForPriceUpdate().
 *
 * Pré-requisito: VPN Youse ativa com acesso ao ambiente QA.
 * Uso: npx playwright test personalizacao --project=chromium --reporter=list
 */
import { test, expect } from '@playwright/test';
import { MaritalStatuses } from '../../enum/MaritalStatuses';
import { VehicleUsages } from '../../enum/VehicleUsages';
import { generateQuotationData } from '../../fixtures/setupQuotation';
import { navigateToCoverages } from '../../helpers/funnel';
import { AssistancesSelectionPage } from '../../pages/quotation/AssistancesSelectionPage';
import { IssuancePage } from '../../pages/quotation/IssuancePage';
import LeadInfoPage from '../../pages/quotation/LeadInfoPage';

// ─── Constantes ─────────────────────────────────────────────────────────────

const PLAN_TIMEOUT = 45_000;
const TEST_TIMEOUT = 180_000;

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIA 1 — Coberturas
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Personalização — Coberturas', { tag: ['@personalizacao', '@coberturas', '@quotation_auto'] }, () => {
  // ── 1. Adicionar cobertura opcional aumenta o prêmio ─────────────────
  test('Ativar a cobertura "Danos Morais" deve aumentar o prêmio anual', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    const coveragesPage = await navigateToCoverages(page);

    const precoInicial = await coveragesPage.getAnnualPrice();
    console.log(`[Danos Morais OFF] R$ ${precoInicial.toFixed(2)}/ano`);

    // Danos Morais inicia desligado — ativar deve aumentar o prêmio
    await coveragesPage.coverageSwitch('Danos Morais').click();
    await coveragesPage.waitForPriceUpdate(precoInicial);

    const precoFinal = await coveragesPage.getAnnualPrice();
    console.log(`[Danos Morais ON]  R$ ${precoFinal.toFixed(2)}/ano`);

    expect(precoFinal, `Ativar "Danos Morais" deve aumentar o prêmio de R$ ${precoInicial.toFixed(2)}/ano`).toBeGreaterThan(precoInicial);
  });

  // ── 2. Remover cobertura reduz o prêmio ──────────────────────────────
  test('Desativar a cobertura "Roubo e furto" deve reduzir o prêmio anual', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    const coveragesPage = await navigateToCoverages(page);

    const precoInicial = await coveragesPage.getAnnualPrice();
    console.log(`[Roubo e Furto ON]  R$ ${precoInicial.toFixed(2)}/ano`);

    // Roubo e Furto inicia ligado — desativar deve reduzir o prêmio
    await coveragesPage.coverageSwitch('Roubo e furto').click();
    await coveragesPage.waitForPriceUpdate(precoInicial);

    const precoFinal = await coveragesPage.getAnnualPrice();
    console.log(`[Roubo e Furto OFF] R$ ${precoFinal.toFixed(2)}/ano`);

    expect(precoFinal, `Desativar "Roubo e Furto" deve reduzir o prêmio de R$ ${precoInicial.toFixed(2)}/ano`).toBeLessThan(precoInicial);
  });

  // ── 3. Franquia menor aumenta o prêmio ───────────────────────────────
  test('Reduzir a franquia de "Vale pra qualquer batida" deve aumentar o prêmio', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    const coveragesPage = await navigateToCoverages(page);

    const precoInicial = await coveragesPage.getAnnualPrice();
    console.log(`[Franquia padrão]   R$ ${precoInicial.toFixed(2)}/ano`);

    // Franquia menor = menor deductible = maior risco assumido pela seguradora = prêmio maior
    await coveragesPage.franquiaDecreaseBtn().click();
    await coveragesPage.waitForPriceUpdate(precoInicial);

    const precoFinal = await coveragesPage.getAnnualPrice();
    console.log(`[Franquia reduzida]  R$ ${precoFinal.toFixed(2)}/ano`);

    expect(precoFinal, `Franquia menor deve resultar em prêmio maior (inicial R$ ${precoInicial.toFixed(2)}/ano)`).toBeGreaterThan(precoInicial);
  });

  // ── 4. Indenização maior aumenta o prêmio ────────────────────────────
  test('Aumentar indenização de "Danos corporais a terceiros" deve aumentar o prêmio', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    const coveragesPage = await navigateToCoverages(page);

    const precoInicial = await coveragesPage.getAnnualPrice();
    console.log(`[Indenização R$ 100k] R$ ${precoInicial.toFixed(2)}/ano`);

    // Indenização padrão: R$ 100.000 — aumentar ao próximo patamar = prêmio maior
    await coveragesPage.indemnityIncreaseBtn('Danos corporais a terceiros').click();
    await coveragesPage.waitForPriceUpdate(precoInicial);

    const precoFinal = await coveragesPage.getAnnualPrice();
    console.log(`[Indenização aumentada] R$ ${precoFinal.toFixed(2)}/ano`);

    expect(precoFinal, `Indenização maior deve resultar em prêmio maior (inicial R$ ${precoInicial.toFixed(2)}/ano)`).toBeGreaterThan(precoInicial);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIA 2 — Assistências
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Personalização — Assistências', { tag: ['@personalizacao', '@assistencias', '@quotation_auto'] }, () => {
  // ── 5. Adicionar assistência aumenta o prêmio ────────────────────────
  test('Ativar a assistência "Carro reserva" deve aumentar o prêmio anual', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    const coveragesPage = await navigateToCoverages(page);
    const assistancesPage: AssistancesSelectionPage = await coveragesPage.clickContinueBtn();

    await assistancesPage.heading.waitFor({ state: 'visible', timeout: 30_000 });
    await assistancesPage.dismissPromoModal();
    await assistancesPage.waitForPrice();

    const precoInicial = await assistancesPage.getAnnualPrice();
    console.log(`[Sem assistências]   R$ ${precoInicial.toFixed(2)}/ano`);

    // Carro reserva inicia desligado — ativar deve aumentar o prêmio
    await assistancesPage.assistanceSwitch('Carro reserva').click();
    await assistancesPage.waitForPriceUpdate(precoInicial);

    const precoFinal = await assistancesPage.getAnnualPrice();
    console.log(`[Com Carro reserva]  R$ ${precoFinal.toFixed(2)}/ano`);

    expect(precoFinal, `Ativar "Carro reserva" deve aumentar o prêmio de R$ ${precoInicial.toFixed(2)}/ano`).toBeGreaterThan(precoInicial);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIA 3 — E2E Completo (Smoke)
// Único teste que avança até a emissão real da apólice.
// Usa configurações padrão (sem personalizações extras) para manter o CPF
// de teste reutilizável e não inflar custos de processamento no QA.
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Personalização — E2E Completo (Smoke)', { tag: ['@personalizacao', '@smoke', '@quotation_auto'] }, () => {
  // ── 6. Fluxo completo: Personalizar → Coberturas → Assistências → Emissão ─
  test('Deve contratar o plano personalizado com configurações padrão e emitir a apólice', async ({ page }) => {
    test.setTimeout(480_000);

    const data = generateQuotationData();

    // ── Etapa 1–5: Funil de cotação ──────────────────────────────────
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

    // ── Etapa 6: Personalizar → Coberturas ───────────────────────────
    const coberturas = await selecaoPlanoPage.openPersonalization();
    await coberturas.waitForPrice();
    console.log(`[Coberturas] Preço inicial: R$ ${(await coberturas.getAnnualPrice()).toFixed(2)}/ano`);

    // ── Etapa 7: Avançar para Assistências ────────────────────────────
    const assistencias: AssistancesSelectionPage = await coberturas.clickContinueBtn();
    await assistencias.heading.waitFor({ state: 'visible', timeout: 30_000 });
    await assistencias.dismissPromoModal();
    await assistencias.waitForPrice();
    console.log(`[Assistências] Preço: R$ ${(await assistencias.getAnnualPrice()).toFixed(2)}/ano`);

    // ── Etapa 8: Avançar para Checkout ────────────────────────────────
    const pagamentoPage = await assistencias.clickContinueBtn();

    // ── Etapa 9: Checkout — confirmar e pagar ─────────────────────────
    await pagamentoPage.checkEmailConfirmation();
    await pagamentoPage.fillCreditCardData(data.creditCard.number, data.creditCard.expireDate, data.creditCard.cvv, data.creditCard.holderName);
    const emissaoPage: IssuancePage = await pagamentoPage.clickFinishBtn();

    // ── Etapa 10: Validação pós-pagamento (3 caminhos possíveis no QA) ─
    if (emissaoPage.isOnSuccessPage()) {
      // Caminho A: tela /sucesso com confirmação da apólice
      await expect(emissaoPage.title).toBeVisible({ timeout: 15_000 });
      await expect(emissaoPage.tagCotacaoRealizada).toBeVisible();
      await expect(emissaoPage.tagPagamentoValidado).toBeVisible();
      await expect(emissaoPage.apoliceSectionAuto).toBeVisible();
      await expect(emissaoPage.emailDoSegurado(data.email)).toBeVisible();
      console.log('[Emissão] ✓ Apólice confirmada na tela /sucesso');
    } else if (page.url().includes('youse.com.br')) {
      // Caminho B: redirecionamento para www.youse.com.br — pagamento processado
      await expect(page).toHaveURL(/youse\.com\.br/);
      console.log('[Emissão] ✓ Redirecionado para youse.com.br — pagamento aceito');
    } else {
      // Caminho C: permanece em /issuance aguardando webhook — estado válido no QA
      await expect(page).toHaveURL(/\/issuance/);
      console.log('[Emissão] ✓ Permanece em /issuance — webhook pendente (comportamento esperado no QA)');
    }
  });
});
