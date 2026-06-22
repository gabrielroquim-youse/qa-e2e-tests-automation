import type { APIRequestContext, APIResponse } from '@playwright/test';
import TestConfig from '../../../config/test.config';
import type { QuotationApiPayload } from './buildQuotationPayload';

export type PlanName = 'Essencial' | 'Regular' | 'Auto 1504';

export interface QuotationPlanPrice {
  plan: PlanName;
  monthly: number;
}

/**
 * Cliente HTTP para o motor de cotação (opin-service ou BFF de cotação).
 *
 * Passo 1 do playbook: confirmar base URL e paths com backend (ver docs/guides/api-quotation-layer.md).
 */
export class QuotationPricingService {
  private readonly baseUrl: string;

  constructor(baseUrl = TestConfig.urls.opinServiceUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  get isConfigured(): boolean {
    return this.baseUrl.length > 0;
  }

  /** Headers comuns — estender com auth quando necessário. */
  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  /**
   * Cotação até plan_selection — retorna preços mensais por plano.
   * TODO: substituir path `/v1/quotations/plans` pelo contrato real.
   */
  async quotePlans(request: APIRequestContext, payload: QuotationApiPayload): Promise<APIResponse> {
    if (!this.isConfigured) {
      throw new Error('OPIN_SERVICE_URL não configurada — defina no .env para rodar testes @pricing');
    }

    return request.post(`${this.baseUrl}/v1/quotations/plans`, {
      headers: this.headers(),
      data: payload,
    });
  }

  /** Parseia resposta em lista plano → preço mensual. */
  static parsePlanPrices(body: unknown): QuotationPlanPrice[] {
    if (!body || typeof body !== 'object' || !('plans' in body)) {
      throw new Error('Resposta de cotação inválida: campo "plans" ausente');
    }
    return (body as { plans: QuotationPlanPrice[] }).plans;
  }
}
