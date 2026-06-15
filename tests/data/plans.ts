/**
 * Catálogo de planos do Seguro Auto observados no ambiente QA.
 *
 * Fonte: DOM capturado em `plan_selection` + `pricing_plan_serializer.rb` (order-service).
 *
 * Estrutura do preço por plano (invariante do motor):
 *   monthly = coverages_monthly + assistances_monthly
 *   annual  = total_cost / contract_duration
 *
 * Os `coverageKeywords` e `assistanceKeywords` são substrings que devem estar
 * presentes no texto do card do plano na UI. Use-os com `hasText` nos testes.
 *
 * IMPORTANTE: os valores monetários em `referencePrice` são REFERÊNCIAS observadas
 * em QA com placa YOU-0020 / CEP 04777-020 / sem bônus. Não use como asserts absolutos —
 * use apenas para validar ordem de grandeza (> floor, < ceiling) e ordenação (A < B).
 */

import type { PlanName } from '../pages/quotation/PlanSelectionPage';

export interface PlanDefinition {
  /** Nome exibido no card da UI (correspondente ao `PlanName` do PlanSelectionPage) */
  name: PlanName;
  /** UID do plano no order-service (ex: bra/auto/plan/1) */
  uid: string;
  /** Posição esperada na lista (1 = mais barato) */
  position: number;
  /** Substrings de cobertura que devem aparecer no card */
  coverageKeywords: string[];
  /** Substrings de assistência que devem aparecer no card */
  assistanceKeywords: string[];
  /** Número mínimo de coberturas esperadas no card */
  minCoverageCount: number;
  /** Preço mensal de referência observado em QA (sem bônus, placa YOU-0020) */
  referencePrice: {
    monthly: number;
    annual: number;
  };
}

export const plans: Record<PlanName, PlanDefinition> = {
  Essencial: {
    name: 'Essencial',
    uid: 'bra/auto/plan/1',
    position: 1,
    coverageKeywords: ['Roubo', 'Furto', 'Incêndio', 'Alagamento', 'Colisão', 'Danos materiais', 'Danos corporais'],
    assistanceKeywords: ['Proteção de Rodas', '200 km'],
    minCoverageCount: 6,
    referencePrice: { monthly: 2205.92, annual: 2205.92 },
  },

  Regular: {
    name: 'Regular',
    uid: 'bra/auto/plan/2',
    position: 2,
    coverageKeywords: ['Roubo', 'Furto', 'Incêndio', 'Alagamento', 'Colisão', 'Danos materiais', 'Danos corporais'],
    assistanceKeywords: ['Proteção de Rodas', '400 km'],
    minCoverageCount: 6,
    referencePrice: { monthly: 2588.58, annual: 2588.58 },
  },

  'Auto 1504': {
    name: 'Auto 1504',
    uid: 'bra/auto/plan/personalizado-1504',
    position: 3,
    coverageKeywords: ['Roubo', 'Furto', 'Incêndio', 'Alagamento', 'Colisão', 'Danos materiais', 'Danos corporais'],
    assistanceKeywords: ['Reparos', 'Proteção de Rodas', '400 km'],
    minCoverageCount: 6,
    referencePrice: { monthly: 2747.17, annual: 2747.17 },
  },

  Personalizado: {
    name: 'Personalizado',
    uid: 'bra/auto/plan/custom',
    position: 4,
    coverageKeywords: [],
    assistanceKeywords: [],
    minCoverageCount: 0,
    referencePrice: { monthly: 0, annual: 0 },
  },
};

/** Planos ordenados por posição (mais barato primeiro) */
export const orderedPlans = Object.values(plans)
  .filter((p) => p.position > 0 && p.position <= 3)
  .sort((a, b) => a.position - b.position);
