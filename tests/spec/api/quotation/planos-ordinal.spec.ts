/**
 * Ordinal de planos — motor de cotação (API).
 *
 * Migrado de: tests/spec/e2e/regression/precosPlanos.spec.ts
 * E2E equivalente permanece até esta spec estar verde com OPIN_SERVICE_URL.
 */
import { expect, test } from '@playwright/test';
import { expectSanityPrice, expectStrictlyIncreasing } from '../../../helpers/pricingAssertions';
import { QuotationPricingService, type PlanName } from '../../../services/quotation/QuotationPricingService';

const pricing = new QuotationPricingService();
const PLAN_ORDER: PlanName[] = ['Essencial', 'Regular', 'Auto 1504'];

const describePricing = pricing.isConfigured ? test.describe : test.describe.skip;

describePricing('API — Planos — ordinal de preço', { tag: ['@api', '@pricing', '@quotation_auto'] }, () => {
  test('Essencial < Regular < Auto 1504 no motor de cotação', async ({ request }) => {
    const response = await pricing.quotePlans(request);

    expect(response.ok(), `Cotação falhou: HTTP ${response.status()}`).toBeTruthy();

    const body = await response.json();
    const planPrices = QuotationPricingService.parsePlanPrices(body);

    const byPlan = new Map(planPrices.map((p) => [p.plan, p.monthly]));
    const prices = PLAN_ORDER.map((name) => {
      const value = byPlan.get(name);
      expect(value, `Plano ${name} ausente na resposta`).toBeDefined();
      expectSanityPrice(value!, name);
      return value!;
    });

    expectStrictlyIncreasing(prices, [...PLAN_ORDER]);
  });
});
