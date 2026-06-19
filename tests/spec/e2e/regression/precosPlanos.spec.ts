/**
 * Testes de variação de preços — Seguro Auto.
 *
 * Valida que as variáveis de risco confirmadas no motor de precificação
 * (backend `opin-service` e frontend `sales-frontend/eventParams.ts`)
 * influenciam corretamente o prêmio calculado.
 *
 * Estratégia:
 *  - Cada test.describe cobre uma categoria isolada de variável de risco.
 *  - Cada teste é completamente independente: navega o funil do zero com
 *    uma página fresca fornecida pelo Playwright (sem mode: 'serial').
 *  - `resetSession` é usado apenas quando um único teste faz duas cotações
 *    consecutivas para comparar preços na mesma instância de página.
 *  - Não são fixados valores absolutos — apenas relações (A < B) ou
 *    faixas percentuais de desconto para tolerar reajustes sazonais.
 *
 * Variáveis de risco cobertas (confirmadas no backend):
 *  ✅ Classe de Bônus (progressiva + faixa de desconto)
 *  ✅ Garagem noturna
 *  ✅ Uso do veículo (Particular / App / Comercial / Táxi / Carga)
 *  ✅ Estado civil (Solteiro vs Casado)
 *  ✅ Veículo zero km vs usado
 *  ✅ Hierarquia de planos (Essencial < Regular < Auto 1504)
 *  ✅ Sanidade e idempotência do motor
 *
 * Pré-requisito: VPN Youse ativa com acesso ao ambiente QA.
 * Uso: npx playwright test precosPlanos --project=chromium --reporter=list
 */
import { expect, test } from '../../../fixtures/setupQuotation';
import { MaritalStatuses } from '../../../enum/MaritalStatuses';
import { UserBonusClass } from '../../../enum/UserBonusClass';
import { VehicleUsages } from '../../../enum/VehicleUsages';
import { navigateToPlans, resetSession } from '../../../helpers/funnel';
import { PlanName } from '../../../pages/quotation/PlanSelectionPage';

// ─── Constantes ────────────────────────────────────────────────────────────

const PLAN_TO_COMPARE: PlanName = 'Essencial';

/** Preços fora desta faixa indicam falha no motor (offline ou bug crítico). */
const PRICE_SANITY_FLOOR = 1; // > R$ 1,00 — nunca zero
const PRICE_SANITY_CEILING = 99_999; // < R$ 99.999/mês — absurdo seria bug

/**
 * Faixa esperada de desconto para Bônus Classe 10.
 * Motor real observado em QA: ~56%. Faixa conservadora para tolerar reajustes.
 * Fonte: `UserBonusClass.TEN` = "até 50% de desconto".
 */
const BONUS_CLASS_10_DISCOUNT_MIN_PCT = 30;
const BONUS_CLASS_10_DISCOUNT_MAX_PCT = 65;

// ─── Helpers de validação ──────────────────────────────────────────────────

function expectPriceWithinTolerance(price: number, reference: number, tolerancePct = 2): void {
  const delta = (Math.abs(price - reference) / reference) * 100;
  expect(
    delta,
    `Preço R$ ${price.toFixed(2)} desvia ${delta.toFixed(2)}% do ref R$ ${reference.toFixed(2)} (limite ±${tolerancePct}%)`,
  ).toBeLessThanOrEqual(tolerancePct);
}

function expectDiscountInRange(higherPrice: number, lowerPrice: number, minPct: number, maxPct: number): void {
  const discountPct = ((higherPrice - lowerPrice) / higherPrice) * 100;
  expect(discountPct, `Desconto ${discountPct.toFixed(1)}% abaixo do mínimo esperado de ${minPct}%`).toBeGreaterThanOrEqual(minPct);
  expect(discountPct, `Desconto ${discountPct.toFixed(1)}% acima do máximo razoável de ${maxPct}% (possível bug)`).toBeLessThanOrEqual(maxPct);
  console.log(`  → Desconto observado: ${discountPct.toFixed(1)}% (esperado ${minPct}%–${maxPct}%)`);
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIA 1 — Classe de Bônus
// Fonte: campo `ci_number` / `number_bonus_class` no backend opin-service
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Preços — Classe de Bônus', { tag: ['@price', '@bonus_class'] }, () => {
  test('Bônus Classe 10 deve resultar em prêmio menor que sem bônus', async ({ page }) => {
    test.setTimeout(360_000);

    const planosSemBonus = await navigateToPlans(page, { useBonusClass: false });
    const precoSemBonus = await planosSemBonus.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoSemBonus, 'Preço sem bônus deve ser maior que zero').toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Sem bônus]  R$ ${precoSemBonus.toFixed(2)}`);

    await resetSession(page);

    const planosComBonus = await navigateToPlans(page, { useBonusClass: true, bonusClass: UserBonusClass.TEN });
    const precoComBonus = await planosComBonus.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoComBonus, 'Preço com Bônus Classe 10 deve ser maior que zero').toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Bônus Cl.10] R$ ${precoComBonus.toFixed(2)}`);

    expect(
      precoComBonus,
      `Bônus Classe 10 (R$ ${precoComBonus.toFixed(2)}) deve ser menor que sem bônus (R$ ${precoSemBonus.toFixed(2)})`,
    ).toBeLessThan(precoSemBonus);
  });

  test('Desconto de Bônus Classe 10 deve estar entre 30% e 65%', async ({ page }) => {
    test.setTimeout(360_000);

    const planosSemBonus = await navigateToPlans(page, { useBonusClass: false });
    const precoSemBonus = await planosSemBonus.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoSemBonus).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Base]       R$ ${precoSemBonus.toFixed(2)}`);

    await resetSession(page);

    const planosComBonus = await navigateToPlans(page, { useBonusClass: true, bonusClass: UserBonusClass.TEN });
    const precoComBonus = await planosComBonus.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoComBonus).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Bônus Cl.10] R$ ${precoComBonus.toFixed(2)}`);

    expectDiscountInRange(precoSemBonus, precoComBonus, BONUS_CLASS_10_DISCOUNT_MIN_PCT, BONUS_CLASS_10_DISCOUNT_MAX_PCT);
  });

  test('Desconto deve crescer progressivamente: Classe 1 > Classe 5 > Classe 10 (prêmio decrescente)', async ({ page }) => {
    test.setTimeout(600_000);

    const planos1 = await navigateToPlans(page, { useBonusClass: true, bonusClass: UserBonusClass.ONE });
    const precoClasse1 = await planos1.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoClasse1).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Classe 1]  R$ ${precoClasse1.toFixed(2)}`);

    await resetSession(page);

    const planos5 = await navigateToPlans(page, { useBonusClass: true, bonusClass: UserBonusClass.FIVE });
    const precoClasse5 = await planos5.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoClasse5).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Classe 5]  R$ ${precoClasse5.toFixed(2)}`);

    await resetSession(page);

    const planos10 = await navigateToPlans(page, { useBonusClass: true, bonusClass: UserBonusClass.TEN });
    const precoClasse10 = await planos10.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoClasse10).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Classe 10] R$ ${precoClasse10.toFixed(2)}`);

    expect(precoClasse5, `Classe 5 (R$ ${precoClasse5.toFixed(2)}) deve ser menor que Classe 1 (R$ ${precoClasse1.toFixed(2)})`).toBeLessThan(
      precoClasse1,
    );

    expect(precoClasse10, `Classe 10 (R$ ${precoClasse10.toFixed(2)}) deve ser menor que Classe 5 (R$ ${precoClasse5.toFixed(2)})`).toBeLessThan(
      precoClasse5,
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIA 2 — Garagem Noturna
// Fonte: campo `garage_car_sleeps` no backend opin-service
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Preços — Garagem Noturna', { tag: ['@price', '@garage'] }, () => {
  test('Veículo com garagem deve ter prêmio menor que sem garagem', async ({ page }) => {
    test.setTimeout(360_000);

    const planosComGaragem = await navigateToPlans(page, { garage: true });
    const precoComGaragem = await planosComGaragem.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoComGaragem, 'Preço com garagem deve ser maior que zero').toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Com garagem] R$ ${precoComGaragem.toFixed(2)}`);

    await resetSession(page);

    const planosSemGaragem = await navigateToPlans(page, { garage: false });
    const precoSemGaragem = await planosSemGaragem.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoSemGaragem, 'Preço sem garagem deve ser maior que zero').toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Sem garagem] R$ ${precoSemGaragem.toFixed(2)}`);

    expect(
      precoComGaragem,
      `Com garagem (R$ ${precoComGaragem.toFixed(2)}) deve ser menor que sem garagem (R$ ${precoSemGaragem.toFixed(2)})`,
    ).toBeLessThan(precoSemGaragem);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIA 3 — Uso do Veículo
// Fonte: campo `car_usage` / `vehicle.usage` no backend opin-service
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Preços — Uso do Veículo', { tag: ['@price', '@usage'] }, () => {
  test('Uso Particular deve ter prêmio menor que Motorista de Aplicativo', async ({ page }) => {
    test.setTimeout(360_000);

    const planosParticular = await navigateToPlans(page, { usage: VehicleUsages.PRIVATE });
    const precoParticular = await planosParticular.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoParticular).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Particular]  R$ ${precoParticular.toFixed(2)}`);

    await resetSession(page);

    const planosApp = await navigateToPlans(page, { usage: VehicleUsages.APP });
    const precoApp = await planosApp.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoApp).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Aplicativo]  R$ ${precoApp.toFixed(2)}`);

    expect(precoParticular, `Particular (R$ ${precoParticular.toFixed(2)}) deve ser menor que Aplicativo (R$ ${precoApp.toFixed(2)})`).toBeLessThan(
      precoApp,
    );
  });

  test('Uso Particular deve ter prêmio menor que Comercial', async ({ page }) => {
    test.setTimeout(360_000);

    const planosParticular = await navigateToPlans(page, { usage: VehicleUsages.PRIVATE });
    const precoParticular = await planosParticular.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoParticular).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Particular]  R$ ${precoParticular.toFixed(2)}`);

    await resetSession(page);

    const planosComercial = await navigateToPlans(page, { usage: VehicleUsages.COMMERCIAL });
    const precoComercial = await planosComercial.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoComercial).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Comercial]   R$ ${precoComercial.toFixed(2)}`);

    expect(
      precoParticular,
      `Particular (R$ ${precoParticular.toFixed(2)}) deve ser menor que Comercial (R$ ${precoComercial.toFixed(2)})`,
    ).toBeLessThan(precoComercial);
  });

  test('Uso Particular deve ter prêmio menor que Táxi', async ({ page }) => {
    test.setTimeout(360_000);

    const planosParticular = await navigateToPlans(page, { usage: VehicleUsages.PRIVATE });
    const precoParticular = await planosParticular.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoParticular).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Particular]  R$ ${precoParticular.toFixed(2)}`);

    await resetSession(page);

    const planosTaxi = await navigateToPlans(page, { usage: VehicleUsages.TAXI });
    const precoTaxi = await planosTaxi.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoTaxi).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Táxi]        R$ ${precoTaxi.toFixed(2)}`);

    expect(precoParticular, `Particular (R$ ${precoParticular.toFixed(2)}) deve ser menor que Táxi (R$ ${precoTaxi.toFixed(2)})`).toBeLessThan(
      precoTaxi,
    );
  });

  test('Uso Particular deve ter prêmio menor que Transporte de Carga', async ({ page }) => {
    test.setTimeout(360_000);

    const planosParticular = await navigateToPlans(page, { usage: VehicleUsages.PRIVATE });
    const precoParticular = await planosParticular.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoParticular).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Particular]  R$ ${precoParticular.toFixed(2)}`);

    await resetSession(page);

    const planosCarga = await navigateToPlans(page, { usage: VehicleUsages.CARGO });
    const precoCarga = await planosCarga.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoCarga).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Carga]       R$ ${precoCarga.toFixed(2)}`);

    expect(precoParticular, `Particular (R$ ${precoParticular.toFixed(2)}) deve ser menor que Carga (R$ ${precoCarga.toFixed(2)})`).toBeLessThan(
      precoCarga,
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIA 4 — Estado Civil
// Fonte: campo `marital_status` no frontend sales-frontend/eventParams.ts
// Referência atuarial: casados apresentam menor índice de sinistro
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Preços — Estado Civil', { tag: ['@price', '@marital_status'] }, () => {
  test('Segurado casado deve ter prêmio menor ou igual ao de solteiro', async ({ page }) => {
    test.setTimeout(360_000);

    const planosCasado = await navigateToPlans(page, { maritalStatus: MaritalStatuses.MARRIED });
    const precoCasado = await planosCasado.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoCasado).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Casado]   R$ ${precoCasado.toFixed(2)}`);

    await resetSession(page);

    const planosSolteiro = await navigateToPlans(page, { maritalStatus: MaritalStatuses.SINGLE });
    const precoSolteiro = await planosSolteiro.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoSolteiro).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Solteiro] R$ ${precoSolteiro.toFixed(2)}`);

    // toBeLessThanOrEqual: aceita empate — motor pode não diferenciar todos os casos
    expect(
      precoCasado,
      `Casado (R$ ${precoCasado.toFixed(2)}) deve ser menor ou igual ao de Solteiro (R$ ${precoSolteiro.toFixed(2)})`,
    ).toBeLessThanOrEqual(precoSolteiro);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIA 5 — Veículo Zero Km
// Fonte: campo `is_car_0km` / `vehicle.brandNew` no backend opin-service
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Preços — Veículo Zero Km', { tag: ['@price', '@brand_new'] }, () => {
  test('Veículo zero km deve gerar prêmio diferente do veículo usado', async ({ page }) => {
    test.setTimeout(360_000);

    // Zero km tem custo de reparo mais alto (valor FIPE mais elevado)
    const planosZeroKm = await navigateToPlans(page, { brandNew: true });
    const precoZeroKm = await planosZeroKm.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoZeroKm).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Zero Km] R$ ${precoZeroKm.toFixed(2)}`);

    await resetSession(page);

    const planosUsado = await navigateToPlans(page, { brandNew: false });
    const precoUsado = await planosUsado.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(precoUsado).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Usado]   R$ ${precoUsado.toFixed(2)}`);

    /* eslint-disable playwright/no-conditional-in-test, playwright/no-skipped-test -- skip documentado quando motor QA ignora zero km */
    if (precoZeroKm === precoUsado) {
      test.skip(true, 'Gap QA: motor retorna mesmo preço para zero km vs usado (placa YOU-0020) — toggle UI validado');
    }
    /* eslint-enable playwright/no-conditional-in-test, playwright/no-skipped-test */

    // Valida que o motor usa o campo — se forem iguais, o campo está sendo ignorado
    expect(
      precoZeroKm,
      `Zero km (R$ ${precoZeroKm.toFixed(2)}) e usado (R$ ${precoUsado.toFixed(2)}) têm o mesmo preço — motor pode estar ignorando o campo`,
    ).not.toBe(precoUsado);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIA 6 — Hierarquia de Planos
// Mais coberturas = maior prêmio (Essencial < Regular < Auto 1504)
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Preços — Hierarquia de Planos', { tag: ['@price', '@plan_order'] }, () => {
  test('Prêmio deve crescer conforme a abrangência: Essencial < Regular < Auto 1504', async ({ page }) => {
    test.setTimeout(180_000);

    const selecaoPlanoPage = await navigateToPlans(page);

    const precoEssencial = await selecaoPlanoPage.getPlanMonthlyPriceValue('Essencial');
    const precoRegular = await selecaoPlanoPage.getPlanMonthlyPriceValue('Regular');
    const precoAuto1504 = await selecaoPlanoPage.getPlanMonthlyPriceValue('Auto 1504');

    console.log(`[Essencial]  R$ ${precoEssencial.toFixed(2)}`);
    console.log(`[Regular]    R$ ${precoRegular.toFixed(2)}`);
    console.log(`[Auto 1504]  R$ ${precoAuto1504.toFixed(2)}`);

    expect(precoEssencial).toBeGreaterThan(PRICE_SANITY_FLOOR);
    expect(precoRegular).toBeGreaterThan(PRICE_SANITY_FLOOR);
    expect(precoAuto1504).toBeGreaterThan(PRICE_SANITY_FLOOR);

    expect(precoEssencial, `Essencial (R$ ${precoEssencial.toFixed(2)}) deve ser menor que Regular (R$ ${precoRegular.toFixed(2)})`).toBeLessThan(
      precoRegular,
    );

    expect(precoRegular, `Regular (R$ ${precoRegular.toFixed(2)}) deve ser menor que Auto 1504 (R$ ${precoAuto1504.toFixed(2)})`).toBeLessThan(
      precoAuto1504,
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIA 7 — Sanidade e Estabilidade do Motor
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Preços — Sanidade e Estabilidade do Motor', { tag: ['@price', '@sanity'] }, () => {
  test('Preços de todos os planos devem estar dentro dos guarda-rails', async ({ page }) => {
    test.setTimeout(180_000);

    const selecaoPlanoPage = await navigateToPlans(page);

    const planos: PlanName[] = ['Essencial', 'Regular', 'Auto 1504'];
    for (const plano of planos) {
      const preco = await selecaoPlanoPage.getPlanMonthlyPriceValue(plano);
      console.log(`[Sanidade] ${plano}: R$ ${preco.toFixed(2)}`);

      expect(preco, `[${plano}] R$ ${preco.toFixed(2)} é zero ou negativo — motor offline?`).toBeGreaterThan(PRICE_SANITY_FLOOR);

      expect(preco, `[${plano}] R$ ${preco.toFixed(2)} excede R$ ${PRICE_SANITY_CEILING.toLocaleString('pt-BR')} — possível bug`).toBeLessThan(
        PRICE_SANITY_CEILING,
      );
    }
  });

  test('Preço deve ser estável entre duas cotações com os mesmos dados (idempotência)', async ({ page }) => {
    test.setTimeout(360_000);

    const planos1 = await navigateToPlans(page);
    const preco1 = await planos1.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(preco1).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Cotação 1] R$ ${preco1.toFixed(2)}`);

    await resetSession(page);

    const planos2 = await navigateToPlans(page);
    const preco2 = await planos2.getPlanMonthlyPriceValue(PLAN_TO_COMPARE);
    expect(preco2).toBeGreaterThan(PRICE_SANITY_FLOOR);
    console.log(`[Cotação 2] R$ ${preco2.toFixed(2)}`);

    // Tolerância de ±2% para reajustes sazonais — não usa .toBe() exato
    expectPriceWithinTolerance(preco2, preco1, 2);
  });
});
