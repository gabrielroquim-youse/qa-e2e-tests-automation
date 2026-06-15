/**
 * Testes de Coberturas, Assistências e Integridade de Preço — Seguro Auto.
 *
 * Valida o cruzamento entre:
 *  - Conteúdo dos planos (coberturas e assistências visíveis no card)
 *  - Preço mensal calculado pelo motor de precificação
 *
 * Premissas (fonte: order-service/pricing_plan_serializer.rb):
 *   monthly = coverages_monthly + assistances_monthly
 *   Plano com mais coberturas/melhores assistências → monthly maior
 *
 * Estratégia:
 *   - Não fixar valores absolutos de preço
 *   - Validar presença de coberturas/assistências por keyword no DOM
 *   - Validar relações ordinais de preço entre planos
 *   - Validar diferenciadores entre planos (ex: Guincho 400km vs 200km)
 *
 * Pré-requisito: VPN Youse ativa com acesso ao ambiente QA.
 * Uso: npx playwright test coberturas --project=chromium --reporter=list
 */
import { test, expect } from '@playwright/test';
import { MaritalStatuses } from '../../enum/MaritalStatuses';
import { VehicleUsages } from '../../enum/VehicleUsages';
import { generateQuotationData } from '../../fixtures/setupQuotation';
import { orderedPlans } from '../../data/plans';
import LeadInfoPage from '../../pages/quotation/LeadInfoPage';
import { PlanSelectionPage } from '../../pages/quotation/PlanSelectionPage';

// ─── Helper: navega até a seleção de planos (perfil médio risco) ─────────────

async function goToPlanSelection(page: Parameters<typeof LeadInfoPage.open>[0]): Promise<PlanSelectionPage> {
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

  await expect(selecaoPlanoPage.title).toBeVisible({ timeout: 45_000 });
  return selecaoPlanoPage;
}

// ─── Suite ───────────────────────────────────────────────────────────────────

test.describe('Coberturas, Assistências e Integridade de Preço — Seguro Auto', { tag: ['@price', '@quotation_auto', '@coberturas'] }, () => {
  test.describe.configure({ mode: 'serial' });

  // ── 1. Todos os planos pré-formatados estão visíveis ──────────────────────
  test('Deve exibir os três planos pré-formatados na tela de seleção', { tag: ['@smoke'] }, async ({ page }) => {
    test.setTimeout(180_000);

    const selecaoPlanoPage = await goToPlanSelection(page);

    for (const plan of orderedPlans) {
      const card = selecaoPlanoPage.planCard(plan.name);
      await expect(card, `Card "${plan.name}" deve estar visível`).toBeVisible();
      console.log(`[Plano] ${plan.name} ✓ visível`);
    }
  });

  // ── 2. Cada plano contém suas coberturas esperadas ────────────────────────
  test('Cada plano deve exibir suas coberturas esperadas no card', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(180_000);

    const selecaoPlanoPage = await goToPlanSelection(page);

    for (const plan of orderedPlans) {
      for (const keyword of plan.coverageKeywords) {
        const present = await selecaoPlanoPage.planCardContains(plan.name, keyword);
        expect(present, `Plano "${plan.name}" deve conter a cobertura "${keyword}" no card`).toBe(true);
      }
      console.log(`[${plan.name}] ${plan.coverageKeywords.length} coberturas verificadas ✓`);
    }
  });

  // ── 3. Cada plano contém suas assistências esperadas ──────────────────────
  test('Cada plano deve exibir suas assistências esperadas no card', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(180_000);

    const selecaoPlanoPage = await goToPlanSelection(page);

    for (const plan of orderedPlans) {
      const textoAssistencias = await selecaoPlanoPage.getPlanAssistanceText(plan.name);
      console.log(`[${plan.name}] Assistências: "${textoAssistencias.slice(0, 80)}..."`);

      for (const keyword of plan.assistanceKeywords) {
        expect(textoAssistencias.toLowerCase(), `Plano "${plan.name}" deve conter assistência "${keyword}"`).toContain(keyword.toLowerCase());
      }
    }
  });

  // ── 4. Diferenciador: Essencial tem Guincho 200km; Regular e Auto 1504 têm 400km ──
  test('Essencial deve ter Guincho 200km; Regular e Auto 1504 devem ter Guincho 400km', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(180_000);

    const selecaoPlanoPage = await goToPlanSelection(page);

    // Essencial: 200 km
    const textoEssencial = await selecaoPlanoPage.getPlanAssistanceText('Essencial');
    expect(textoEssencial, 'Essencial deve ter Guincho 200 km').toContain('200 km');
    expect(textoEssencial, 'Essencial NÃO deve ter Guincho 400 km').not.toContain('400 km');

    // Regular: 400 km
    const textoRegular = await selecaoPlanoPage.getPlanAssistanceText('Regular');
    expect(textoRegular, 'Regular deve ter Guincho 400 km').toContain('400 km');

    // Auto 1504: 400 km + Reparos Abaixo da Franquia
    const textoAuto1504 = await selecaoPlanoPage.getPlanAssistanceText('Auto 1504');
    expect(textoAuto1504, 'Auto 1504 deve ter Guincho 400 km').toContain('400 km');
    expect(textoAuto1504.toLowerCase(), 'Auto 1504 deve ter "Reparos" entre as assistências').toContain('reparos');

    console.log('[Guincho] Essencial: 200km | Regular: 400km | Auto 1504: 400km + Reparos ✓');
  });

  // ── 5. Preço cresce com a abrangência do plano ────────────────────────────
  test('Preço deve crescer conforme a abrangência: Essencial < Regular < Auto 1504', { tag: ['@regression', '@price'] }, async ({ page }) => {
    test.setTimeout(180_000);

    const selecaoPlanoPage = await goToPlanSelection(page);

    const precos: Record<string, number> = {};
    for (const plan of orderedPlans) {
      precos[plan.name] = await selecaoPlanoPage.getPlanMonthlyPriceValue(plan.name);
      expect(precos[plan.name], `Preço "${plan.name}" deve ser > 0`).toBeGreaterThan(0);
      console.log(`[${plan.name}] R$ ${precos[plan.name].toFixed(2)}`);
    }

    // Ordinal: mais coberturas/melhores assistências = prêmio maior
    for (let i = 0; i < orderedPlans.length - 1; i++) {
      const a = orderedPlans[i];
      const b = orderedPlans[i + 1];
      expect(precos[a.name], `"${a.name}" (R$ ${precos[a.name].toFixed(2)}) deve ser < "${b.name}" (R$ ${precos[b.name].toFixed(2)})`).toBeLessThan(
        precos[b.name],
      );
    }
  });

  // ── 6. Plano Personalizado ("Monte do seu jeito") está disponível ─────────
  test('Opção de plano personalizado deve estar disponível na tela', { tag: ['@smoke'] }, async ({ page }) => {
    test.setTimeout(180_000);

    await goToPlanSelection(page);

    // O card "Personalizado" pode ter texto "Monte do seu jeito"
    const cardPersonalizado = page.getByText(/Monte do seu jeito|Personalizado/i);
    await expect(cardPersonalizado.first(), 'Card de plano personalizado deve estar visível').toBeVisible({ timeout: 10_000 });

    console.log('[Personalizado] Card "Monte do seu jeito" visível ✓');
  });

  // ── 7. Preço de referência: todos os planos dentro dos guarda-rails ───────
  test('Preços de todos os planos devem estar dentro dos guarda-rails de sanidade', { tag: ['@sanity'] }, async ({ page }) => {
    test.setTimeout(180_000);

    const selecaoPlanoPage = await goToPlanSelection(page);

    for (const plan of orderedPlans) {
      const preco = await selecaoPlanoPage.getPlanMonthlyPriceValue(plan.name);
      console.log(`[Sanidade ${plan.name}] R$ ${preco.toFixed(2)}`);

      expect(preco, `"${plan.name}": preço zero indica motor offline`).toBeGreaterThan(1);
      expect(preco, `"${plan.name}": preço absurdo indica bug no motor`).toBeLessThan(99_999);
    }
  });
});
