import type { APIRequestContext, APIResponse } from '@playwright/test';
import TestConfig from '../../../config/test.config';

export type PlanName = 'Essencial' | 'Regular' | 'Auto 1504';

export interface QuotationPlanPrice {
  plan: PlanName;
  monthly: number;
}

/**
 * Cliente HTTP para o motor de cotação (opin-service / API de pricing).
 *
 * Endpoints reais serão plugados quando o contrato estiver documentado.
 * Enquanto isso, `baseUrl` vazio faz os specs ficarem em `test.fixme`.
 */
export class QuotationPricingService {
  private readonly baseUrl: string;

  constructor(baseUrl = TestConfig.urls.opinServiceUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  get isConfigured(): boolean {
    return this.baseUrl.length > 0;
  }

  /**
   * Cotação até plan_selection — retorna preços mensais por plano.
   * TODO: ajustar path e payload ao contrato OpenAPI do opin-service.
   */
  async quotePlans(_request: APIRequestContext): Promise<APIResponse> {
    if (!this.isConfigured) {
      throw new Error('OPIN_SERVICE_URL não configurada — defina no .env para rodar testes @pricing');
    }

    return _request.post(`${this.baseUrl}/v1/quotations/plans`, {
      data: {
        // payload mínimo — substituir por builder compartilhado com massa cpf/plate
      },
    });
  }

  /** Parseia resposta em mapa plano → preço mensual. */
  static parsePlanPrices(body: unknown): QuotationPlanPrice[] {
    if (!body || typeof body !== 'object' || !('plans' in body)) {
      throw new Error('Resposta de cotação inválida: campo "plans" ausente');
    }
    const plans = (body as { plans: QuotationPlanPrice[] }).plans;
    return plans;
  }
}
