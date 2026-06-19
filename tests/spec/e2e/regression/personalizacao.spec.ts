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
import { expect, test } from '../../../fixtures/setupQuotation';
import { navigateToCoverages, navigateToCheckout } from '../../../helpers/funnel';
import { AssistancesSelectionPage } from '../../../pages/quotation/AssistancesSelectionPage';

// ─── Constantes ─────────────────────────────────────────────────────────────

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
    await coveragesPage.clickCoverageToggle('Danos Morais');
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
    await coveragesPage.clickCoverageToggle('Roubo e furto');
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
    const franquiaInicial = await coveragesPage.getSidebarFranquiaValue();
    console.log(`[Franquia padrão]   R$ ${precoInicial.toFixed(2)}/ano (franquia R$ ${franquiaInicial.toFixed(2)})`);

    // Franquia menor = menor deductible = maior risco assumido pela seguradora = prêmio maior
    const franquiaBtn = coveragesPage.franquiaDecreaseBtn();
    for (let i = 0; i < 5; i++) {
      await franquiaBtn.click();
    }

    await expect.poll(async () => coveragesPage.getSidebarFranquiaValue(), { timeout: 15_000 }).toBeLessThan(franquiaInicial);

    await expect.poll(async () => coveragesPage.getAnnualPrice(), { timeout: 45_000 }).toBeGreaterThan(precoInicial);

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
// CATEGORIA 4 — Fluxo de navegação (sem contratação)
// Fonte: docs/planners/planner-personalizacao.md #9
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Personalização — Navegação', { tag: ['@regression', '@personalizacao', '@quotation_auto'] }, () => {
  test('Deve navegar coberturas → assistências → checkout sem contratar', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    const coveragesPage = await navigateToCoverages(page);
    await expect(coveragesPage.heading).toBeVisible();

    const assistancesPage = await coveragesPage.clickContinueBtn();
    await assistancesPage.heading.waitFor({ state: 'visible', timeout: 30_000 });
    await assistancesPage.dismissPromoModal();
    await assistancesPage.waitForPrice();

    const checkoutPage = await assistancesPage.clickContinueBtn();
    await expect(checkoutPage.title).toBeVisible({ timeout: 60_000 });
    await expect(page).toHaveURL(/checkout/);
  });

  test('Deve chegar ao checkout via helper navigateToCheckout', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    const checkoutPage = await navigateToCheckout(page);
    await expect(checkoutPage.title).toBeVisible();
    await expect(checkoutPage.btnFinish).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIA 5 — Coberturas obrigatórias
// Fonte: docs/planners/planner-personalizacao.md #10
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Personalização — Coberturas Obrigatórias', { tag: ['@regression', '@negative', '@personalizacao'] }, () => {
  test('Cobertura "Incêndio" (Inclusa) não deve exibir toggle desligável', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    await navigateToCoverages(page);
    const incendioRow = page.locator('xpath=//p[normalize-space(.)="Incêndio"]/parent::*');

    await expect(incendioRow).toBeVisible();
    await expect(incendioRow.getByText('Inclusa')).toBeVisible();
    expect(await incendioRow.getByRole('switch').count()).toBe(0);
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
    await assistancesPage.clickAssistanceToggle('Carro reserva');
    await assistancesPage.waitForPriceUpdate(precoInicial);

    const precoFinal = await assistancesPage.getAnnualPrice();
    console.log(`[Com Carro reserva]  R$ ${precoFinal.toFixed(2)}/ano`);

    expect(precoFinal, `Ativar "Carro reserva" deve aumentar o prêmio de R$ ${precoInicial.toFixed(2)}/ano`).toBeGreaterThan(precoInicial);
  });
});
