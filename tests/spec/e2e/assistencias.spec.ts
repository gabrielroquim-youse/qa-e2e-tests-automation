/**
 * Testes de Assistências — Seguro Auto.
 *
 * Valida a tela de seleção de assistências (/assistances_selection) no fluxo
 * de plano personalizado:
 *   - Visibilidade das assistências disponíveis no catálogo
 *   - Efeito no prêmio ao ativar assistências independentes (fora do combo)
 *   - Comportamento do combo: ativar "Assistência a automóvel" (guincho)
 *     inclui automaticamente 7 assistências complementares
 *
 * Estratégia:
 *   - Cada teste é completamente independente: navega o funil do zero.
 *   - Não são fixados valores absolutos — apenas relações de direção (A > B).
 *   - `dismissPromoModal()` é chamado no início de cada teste para descartar
 *     o modal promocional de lançamento (campanha 10 anos Youse).
 *   - `dismissComboModalIfVisible()` é chamado após ativar "Assistência a
 *     automóvel" para fechar o modal "Combo de assistências" se aparecer.
 *
 * Assistências independentes testadas (fora do combo bra/auto/assistance/4):
 *   - Restituição de IPVA
 *   - Assistência a bike
 *   - Serviço de histórico veicular
 *   - Serviço de leva e traz
 * (O teste de "Carro reserva" já está em personalizacao.spec.ts.)
 *
 * Fonte: docs/planner-assistencias.md
 * Pré-requisito: VPN Youse ativa com acesso ao ambiente QA.
 * Uso: npx playwright test assistencias --project=chromium --reporter=list
 */
import { test, expect } from '@playwright/test';
import { navigateToAssistances } from '../../helpers/funnel';

// ─── Constantes ──────────────────────────────────────────────────────────────

const TEST_TIMEOUT = 180_000;

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIA 1 — Visibilidade
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Assistências — Visibilidade', { tag: ['@smoke', '@assistencias', '@quotation_auto'] }, () => {
  test('Deve exibir o título e as assistências disponíveis na tela de seleção', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    const assistancesPage = await navigateToAssistances(page);

    await expect(assistancesPage.heading, 'Título "Escolha as assistências para usar quando precisar" deve estar visível').toBeVisible();

    // Verifica presença de assistências representativas de cada categoria.
    // Usa o locator de label para tolerar assistências imutáveis (sem switch visível).
    const assistenciasEsperadas = [
      'Carro reserva',
      'Assistência a automóvel',
      'Proteção de Rodas, Pneu e Suspensão',
      'Restituição de IPVA',
      'Assistência a bike',
      'Motorista Parceiro',
      'Serviço de histórico veicular',
    ] as const;

    for (const nome of assistenciasEsperadas) {
      await expect(assistancesPage.assistanceName(nome), `Assistência "${nome}" deve estar visível na tela`).toBeVisible({ timeout: 5_000 });
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIA 2 — Efeito no Prêmio — Assistências Independentes
//
// Testa assistências fora do combo (bra/auto/assistance/4), que podem ser
// ativadas sem dependências ou modais adicionais.
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Assistências — Efeito no Prêmio — Independentes', { tag: ['@regression', '@assistencias', '@quotation_auto'] }, () => {
  // ── 1. Restituição de IPVA ────────────────────────────────────────────
  test('Ativar "Restituição de IPVA" deve aumentar o prêmio anual', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    const assistancesPage = await navigateToAssistances(page);

    const precoInicial = await assistancesPage.getAnnualPrice();
    console.log(`[Restituição de IPVA OFF] R$ ${precoInicial.toFixed(2)}/ano`);

    await assistancesPage.assistanceSwitch('Restituição de IPVA').click();
    await assistancesPage.waitForPriceUpdate(precoInicial);

    const precoFinal = await assistancesPage.getAnnualPrice();
    console.log(`[Restituição de IPVA ON]  R$ ${precoFinal.toFixed(2)}/ano`);

    expect(precoFinal, `Ativar "Restituição de IPVA" deve aumentar o prêmio de R$ ${precoInicial.toFixed(2)}/ano`).toBeGreaterThan(precoInicial);
  });

  // ── 2. Assistência a bike ─────────────────────────────────────────────
  test('Ativar "Assistência a bike" deve aumentar o prêmio anual', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    const assistancesPage = await navigateToAssistances(page);

    const precoInicial = await assistancesPage.getAnnualPrice();
    console.log(`[Assistência a bike OFF] R$ ${precoInicial.toFixed(2)}/ano`);

    await assistancesPage.assistanceSwitch('Assistência a bike').click();
    await assistancesPage.waitForPriceUpdate(precoInicial);

    const precoFinal = await assistancesPage.getAnnualPrice();
    console.log(`[Assistência a bike ON]  R$ ${precoFinal.toFixed(2)}/ano`);

    expect(precoFinal, `Ativar "Assistência a bike" deve aumentar o prêmio de R$ ${precoInicial.toFixed(2)}/ano`).toBeGreaterThan(precoInicial);
  });

  // ── 3. Serviço de histórico veicular ─────────────────────────────────
  test('Ativar "Serviço de histórico veicular" deve aumentar o prêmio anual', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    const assistancesPage = await navigateToAssistances(page);

    const precoInicial = await assistancesPage.getAnnualPrice();
    console.log(`[Histórico veicular OFF] R$ ${precoInicial.toFixed(2)}/ano`);

    await assistancesPage.assistanceSwitch('Serviço de histórico veicular').click();
    await assistancesPage.waitForPriceUpdate(precoInicial);

    const precoFinal = await assistancesPage.getAnnualPrice();
    console.log(`[Histórico veicular ON]  R$ ${precoFinal.toFixed(2)}/ano`);

    expect(precoFinal, `Ativar "Serviço de histórico veicular" deve aumentar o prêmio de R$ ${precoInicial.toFixed(2)}/ano`).toBeGreaterThan(
      precoInicial,
    );
  });

  // ── 4. Serviço de leva e traz ─────────────────────────────────────────
  test('Ativar "Serviço de leva e traz" deve aumentar o prêmio anual', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    const assistancesPage = await navigateToAssistances(page);

    const precoInicial = await assistancesPage.getAnnualPrice();
    console.log(`[Leva e traz OFF] R$ ${precoInicial.toFixed(2)}/ano`);

    await assistancesPage.assistanceSwitch('Serviço de leva e traz').click();
    await assistancesPage.waitForPriceUpdate(precoInicial);

    const precoFinal = await assistancesPage.getAnnualPrice();
    console.log(`[Leva e traz ON]  R$ ${precoFinal.toFixed(2)}/ano`);

    expect(precoFinal, `Ativar "Serviço de leva e traz" deve aumentar o prêmio de R$ ${precoInicial.toFixed(2)}/ano`).toBeGreaterThan(precoInicial);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIA 3 — Combo Assistência a Automóvel (bra/auto/assistance/4)
//
// Ao ativar "Assistência a automóvel", o motor inclui automaticamente
// 7 assistências complementares na faixa ("Combo de assistências").
// O incremento de prêmio deve ser superior ao de uma assistência simples.
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Assistências — Combo Assistência a Automóvel', { tag: ['@regression', '@assistencias', '@quotation_auto'] }, () => {
  // ── 5. Ativar "Assistência a automóvel" ativa o combo e aumenta o prêmio ─
  test('Ativar "Assistência a automóvel" deve aumentar o prêmio anual (efeito combo)', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    const assistancesPage = await navigateToAssistances(page);

    const precoInicial = await assistancesPage.getAnnualPrice();
    console.log(`[Assistência automóvel OFF] R$ ${precoInicial.toFixed(2)}/ano`);

    // Ativa o guincho — pode disparar o modal "Combo de assistências"
    await assistancesPage.assistanceSwitch('Assistência a automóvel').click();

    // Fecha o modal de combo se aparecer (confirma ou descarta)
    await assistancesPage.dismissComboModalIfVisible();

    await assistancesPage.waitForPriceUpdate(precoInicial);

    const precoFinal = await assistancesPage.getAnnualPrice();
    console.log(`[Assistência automóvel ON]  R$ ${precoFinal.toFixed(2)}/ano`);

    expect(precoFinal, `Ativar "Assistência a automóvel" deve aumentar o prêmio de R$ ${precoInicial.toFixed(2)}/ano`).toBeGreaterThan(precoInicial);
  });
});
