import { Page } from '@playwright/test';
import { cpf } from '../data/cpf';
import { plate } from '../data/plate';
import { CheckoutPage } from '../pages/quotation/CheckoutPage';
import { AssistancesNavOptions, navigateToCheckout, QuotationDataOverride, QuotationScenario } from './funnel';

/** CPF e placa aceitos em QA — sem restrição de risco (caminho feliz PIX). */
export function unrestrictedQuotationOverrides(): QuotationDataOverride {
  return {
    licensePlate: plate.noInspection.number,
    documentNumber: cpf.accepted.number,
    email: `qa.pix+${Date.now()}@youse.com.br`,
  };
}

/** Funil Auto → checkout com massa sem restrição (emissão + pagamento PIX). */
export async function navigateToCheckoutForPix(
  page: Page,
  scenario: QuotationScenario = {},
  options: AssistancesNavOptions = {},
): Promise<CheckoutPage> {
  return navigateToCheckout(page, scenario, options, unrestrictedQuotationOverrides());
}
