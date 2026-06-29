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
 *
 * ─── Mapeamento canônico de coberturas (pricing-engine) ───────────────────────
 * auto/coverage/1  → Incêndio
 * auto/coverage/2  → Perda Total
 * auto/coverage/3  → Roubo e Furto
 * auto/coverage/4  → Alagamento
 * auto/coverage/5  → Danos corporais a terceiros
 * auto/coverage/6  → Acidentes de passageiros
 * auto/coverage/7  → Danos materiais a terceiros
 * auto/coverage/8  → Colisão (Vale para qualquer batida)
 *
 * ─── Mapeamento canônico de assistências (pricing-engine) ─────────────────────
 * AA2  → Guincho 200 km  (plano Essencial — PLAN23)
 * AA3  → Guincho 400 km  (plano Regular/Intermediário — PLAN24)
 * AA4b → Guincho 1000 km (plano Completo — PLAN25)
 * AA9  → Básico 1.0 com ar — 7 dias (base, todos os planos)
 *
 * Fonte: pricing-engine/app/data/plans/auto_data.rb (PLAN23–PLAN25,
 *        context: current_default_monolithic_plan)
 * ─────────────────────────────────────────────────────────────────────────────
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
    // Coverages incluídas: Incêndio (cov/1), Roubo e Furto (cov/3).
    // A UI exibe todas as coberturas disponíveis na tela de seleção; keywords abaixo
    // são o subconjunto PRÉ-SELECIONADO conforme PLAN23 do pricing-engine.
    coverageKeywords: ['Roubo', 'Furto', 'Incêndio'],
    // Assistência diferenciadora: Guincho 200 km (AA2) — identificador único vs Regular.
    assistanceKeywords: ['200 km'],
    minCoverageCount: 2,
    referencePrice: { monthly: 2205.92, annual: 2205.92 },
  },

  Regular: {
    name: 'Regular',
    uid: 'bra/auto/plan/2',
    position: 2,
    // Coverages incluídas: Incêndio (cov/1), Roubo e Furto (cov/3),
    // Danos corporais (cov/5), Danos materiais (cov/7) — PLAN24 do pricing-engine.
    coverageKeywords: ['Roubo', 'Furto', 'Incêndio', 'Danos materiais', 'Danos corporais'],
    // Assistência diferenciadora: Guincho 400 km (AA3).
    assistanceKeywords: ['400 km'],
    minCoverageCount: 4,
    referencePrice: { monthly: 2588.58, annual: 2588.58 },
  },

  'Auto 1504': {
    name: 'Auto 1504',
    uid: 'bra/auto/plan/personalizado-1504',
    position: 3,
    // Coverages incluídas: similar ao Regular + Perda Total (cov/2), Alagamento (cov/4),
    // Colisão (cov/8) — confirmar via UI (plano personalizado-1504 não tem PLAN# no pricing-engine).
    coverageKeywords: ['Roubo', 'Furto', 'Incêndio', 'Alagamento', 'Colisão', 'Danos materiais', 'Danos corporais'],
    // Diferenciadores: Guincho 400 km (AA3) + Reparos especializados.
    assistanceKeywords: ['400 km', 'Reparos'],
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
