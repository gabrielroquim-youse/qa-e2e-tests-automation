/**
 * Ordinal de planos — motor de cotação (API).
 *
 * Migrado de: tests/spec/e2e/regression/precosPlanos.spec.ts
 */
import { expect } from '../../../fixtures/matchers';
import { test } from '../../../fixtures/setupQuotationApi';
import { expectSanityPrice, expectStrictlyIncreasing } from '../../../helpers/pricingAssertions';
import { PlanPricesResponseSchema } from '../../../schemas/quotation/PlanPricesSchema';
import { QuotationPricingService, type PlanName } from '../../../services/quotation/QuotationPricingService';

const PLAN_ORDER: PlanName[] = ['Essencial', 'Regular', 'Auto 1504'];
const pricing = new QuotationPricingService();
const describePricing = pricing.isConfigured ? test.describe : test.describe.skip;

describePricing('API — Planos — ordinal de preço', { tag: ['@api', '@pricing', '@quotation_auto'] }, () => {
  test('Essencial < Regular < Auto 1504 no motor de cotação', async ({ request, quotationApi, quotationPayload }) => {
    const response = await quotationApi.quotePlans(request, quotationPayload);

    expect(response.ok(), `Cotação falhou: HTTP ${response.status()} — ${await response.text()}`).toBeTruthy();

    const body = PlanPricesResponseSchema.parse(await response.json());
    const byPlan = new Map(body.plans.map((p) => [p.plan, p.monthly]));
    const prices = PLAN_ORDER.map((name) => {
      const value = byPlan.get(name);
      expect(value, `Plano ${name} ausente na resposta`).toBeDefined();
      expectSanityPrice(value!, name);
      return value!;
    });

    expectStrictlyIncreasing(prices, [...PLAN_ORDER]);
  });
});
