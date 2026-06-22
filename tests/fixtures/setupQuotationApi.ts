/**
 * Fixture para testes API de cotação Auto.
 *
 * Uso nos specs:
 *   import { test, expect } from '../../fixtures/setupQuotationApi';
 */
import { test as base } from '@playwright/test';
import { buildQuotationPayload, type QuotationApiPayload } from '../services/quotation/buildQuotationPayload';
import { QuotationPricingService } from '../services/quotation/QuotationPricingService';

type Fixtures = {
  quotationApi: QuotationPricingService;
  quotationPayload: QuotationApiPayload;
};

export const test = base.extend<Fixtures>({
  quotationApi: async ({}, use) => {
    await use(new QuotationPricingService());
  },
  quotationPayload: async ({}, use) => {
    await use(buildQuotationPayload());
  },
});

export { expect } from '@playwright/test';
