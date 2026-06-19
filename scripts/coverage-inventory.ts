/**
 * Inventário de capacidades testáveis no frontend (Seguro Auto).
 *
 * Fonte das funcionalidades: sales-frontend (sections) + planners + DOM QA.
 * Atualize o `status` quando implementar ou descobrir novo gap.
 *
 * Status:
 *   covered  = teste E2E dedicado
 *   partial  = percorrido no happy path ou cobertura incompleta
 *   missing  = testável, sem automação
 *   blocked  = testável em tese, bloqueado por massa/API/ambiente
 *   n/a      = não testável via E2E neste repo (fora de escopo)
 */
import { DEFAULT_GITHUB } from './coverage-config';

export type FeatureStatus = 'covered' | 'partial' | 'missing' | 'blocked' | 'n/a';

export interface FrontendCapability {
  id: string;
  section: string;
  /** Nome legível da funcionalidade visível no front */
  label: string;
  /** P0 = release blocker · P1 = alto risco · P2/P3 = evolução */
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  status: FeatureStatus;
  /** false = não entra no denominador de cobertura funcional */
  testable: boolean;
  specs?: string[];
  planner?: string;
  notes?: string;
}

/** Capacidades testáveis mapeadas a partir do funil web (GitHub Youse). */
export const FRONTEND_CAPABILITIES: FrontendCapability[] = [
  // ── lead_info ──
  {
    id: 'CAP-01',
    section: 'lead_info',
    label: 'Preencher nome, e-mail e telefone',
    priority: 'P0',
    status: 'covered',
    testable: true,
    specs: ['journeys/cotacao-plano-regular.spec.ts', 'ux/lead-info.spec.ts'],
    planner: 'planner.md',
  },
  {
    id: 'CAP-02',
    section: 'lead_info',
    label: 'Validação de campos obrigatórios',
    priority: 'P2',
    status: 'partial',
    testable: true,
    specs: ['ux/lead-info.spec.ts'],
    planner: 'planner.md',
    notes: 'E-mail inválido; expandir campos vazios/máscaras',
  },

  // ── vehicle_details ──
  {
    id: 'CAP-03',
    section: 'vehicle_details',
    label: 'Placa válida — avançar no funil',
    priority: 'P0',
    status: 'covered',
    testable: true,
    specs: ['journeys/cotacao-plano-regular.spec.ts'],
  },
  {
    id: 'CAP-04',
    section: 'vehicle_details',
    label: 'Toggle zero km',
    priority: 'P2',
    status: 'partial',
    testable: true,
    specs: ['regression/precosPlanos.spec.ts'],
    notes: 'Só compara diferença, não ordinal estrito',
  },
  {
    id: 'CAP-05',
    section: 'vehicle_details',
    label: 'Bloqueio veículo blindado',
    priority: 'P0',
    status: 'covered',
    testable: true,
    specs: ['blockers/cotacao-restricoes.spec.ts'],
    planner: 'planner.md',
  },
  {
    id: 'CAP-06',
    section: 'vehicle_details',
    label: 'Bloqueio placa restrita (leilão)',
    priority: 'P0',
    status: 'partial',
    testable: true,
    specs: ['blockers/cotacao-restricoes.spec.ts'],
    notes: 'test.fixme — QA não bloqueia placa de leilão',
  },

  // ── vehicle_additional_details ──
  {
    id: 'CAP-07',
    section: 'vehicle_additional_details',
    label: 'CEP e número do endereço',
    priority: 'P0',
    status: 'covered',
    testable: true,
    specs: ['journeys/cotacao-plano-regular.spec.ts'],
  },
  {
    id: 'CAP-08',
    section: 'vehicle_additional_details',
    label: 'Garagem noturna × preço',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/precosPlanos.spec.ts'],
    planner: 'planner-precos.md',
  },
  {
    id: 'CAP-09',
    section: 'vehicle_additional_details',
    label: 'Uso do veículo × preço',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/precosPlanos.spec.ts'],
  },
  {
    id: 'CAP-10',
    section: 'vehicle_additional_details',
    label: 'CEP alto risco × preço',
    priority: 'P2',
    status: 'blocked',
    testable: true,
    planner: 'planner-precos.md',
    notes: 'Massa CEP aceita no QA',
  },

  // ── person_data ──
  {
    id: 'CAP-11',
    section: 'person_data',
    label: 'CPF válido — avançar',
    priority: 'P0',
    status: 'covered',
    testable: true,
    specs: ['journeys/cotacao-plano-regular.spec.ts'],
  },
  {
    id: 'CAP-12',
    section: 'person_data',
    label: 'CPF blacklist / PEP',
    priority: 'P0',
    status: 'covered',
    testable: true,
    specs: ['blockers/cotacao-restricoes.spec.ts'],
  },
  {
    id: 'CAP-13',
    section: 'person_data',
    label: 'Estado civil × preço',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/precosPlanos.spec.ts'],
  },
  {
    id: 'CAP-14',
    section: 'person_data',
    label: 'Idade motorista × preço',
    priority: 'P2',
    status: 'blocked',
    testable: true,
    planner: 'planner-precos.md',
    notes: 'CPF/DOB fixos',
  },

  // ── bonuses_class ──
  {
    id: 'CAP-15',
    section: 'bonuses_class',
    label: 'Modal "Não sei minha Classe de Bônus"',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/validateBonusClass.spec.ts'],
  },
  {
    id: 'CAP-16',
    section: 'bonuses_class',
    label: 'Seleção classe 1–10 × preço',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/precosPlanos.spec.ts', 'regression/validateBonusClass.spec.ts'],
  },

  // ── data_enrichment ──
  {
    id: 'CAP-17',
    section: 'data_enrichment',
    label: 'Tela de enriquecimento de dados',
    priority: 'P3',
    status: 'missing',
    testable: true,
    notes: 'Section no front; fluxo QA pode pular',
  },

  // ── plan_selection ──
  {
    id: 'CAP-18',
    section: 'plan_selection',
    label: 'Exibir planos Essencial / Regular / Auto 1504',
    priority: 'P0',
    status: 'covered',
    testable: true,
    specs: ['regression/coberturas.spec.ts', 'ux/plan-selection.spec.ts'],
  },
  {
    id: 'CAP-19',
    section: 'plan_selection',
    label: 'Ordem de preço entre planos',
    priority: 'P0',
    status: 'covered',
    testable: true,
    specs: ['regression/coberturas.spec.ts', 'regression/precosPlanos.spec.ts'],
  },
  {
    id: 'CAP-20',
    section: 'plan_selection',
    label: 'Keywords coberturas/assistências nos cards',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/coberturas.spec.ts', 'ux/plan-selection.spec.ts'],
  },
  {
    id: 'CAP-21',
    section: 'plan_selection',
    label: 'Entrada plano Personalizado',
    priority: 'P0',
    status: 'covered',
    testable: true,
    specs: ['regression/personalizacao.spec.ts', 'regression/coberturas.spec.ts'],
  },

  // ── coverages_selection ──
  {
    id: 'CAP-22',
    section: 'coverages_selection',
    label: 'Toggle cobertura opcional (Danos Morais)',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/personalizacao.spec.ts'],
  },
  {
    id: 'CAP-23',
    section: 'coverages_selection',
    label: 'Desligar cobertura (Roubo e furto)',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/personalizacao.spec.ts'],
  },
  {
    id: 'CAP-24',
    section: 'coverages_selection',
    label: 'Cobertura obrigatória não desliga',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/personalizacao.spec.ts'],
    planner: 'planner-personalizacao.md',
  },
  {
    id: 'CAP-25',
    section: 'coverages_selection',
    label: 'Slider franquia × preço',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/personalizacao.spec.ts'],
  },
  {
    id: 'CAP-26',
    section: 'coverages_selection',
    label: 'Slider indenização × preço',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/personalizacao.spec.ts'],
  },
  {
    id: 'CAP-27',
    section: 'coverages_selection',
    label: 'Delta simétrico coberturas',
    priority: 'P2',
    status: 'partial',
    testable: true,
    specs: ['regression/validacaoValores.spec.ts'],
    planner: 'planner-validacao-valores.md',
    notes: 'Danos Morais ✅; estender',
  },

  // ── assistances_selection ──
  {
    id: 'CAP-28',
    section: 'assistances_selection',
    label: 'Visibilidade catálogo assistências',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/assistencias.spec.ts'],
  },
  {
    id: 'CAP-29',
    section: 'assistances_selection',
    label: 'Toggle assistência × preço (independentes)',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/assistencias.spec.ts'],
  },
  {
    id: 'CAP-30',
    section: 'assistances_selection',
    label: 'Combo guincho + modal',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/assistencias.spec.ts'],
  },
  {
    id: 'CAP-31',
    section: 'assistances_selection',
    label: 'Dependência combo (disabled sem guincho)',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/assistencias.spec.ts'],
    planner: 'planner-assistencias.md',
  },
  {
    id: 'CAP-32',
    section: 'assistances_selection',
    label: 'Promo RPS grátis vs cobrado',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/assistenciaRpsPromo.spec.ts'],
  },
  {
    id: 'CAP-33',
    section: 'assistances_selection',
    label: 'Assistências imutáveis (plano pré-formatado)',
    priority: 'P2',
    status: 'missing',
    testable: true,
    planner: 'planner-assistencias.md',
  },
  {
    id: 'CAP-34',
    section: 'assistances_selection',
    label: 'Delta simétrico assistências',
    priority: 'P2',
    status: 'partial',
    testable: true,
    specs: ['regression/validacaoValores.spec.ts'],
    notes: 'IPVA parcial no HEAD',
  },

  // ── risk_acceptance ──
  {
    id: 'CAP-35',
    section: 'risk_acceptance',
    label: 'Tela aceite de risco',
    priority: 'P2',
    status: 'missing',
    testable: true,
    notes: 'Sem POM; aparece em perfis específicos',
  },

  // ── checkout ──
  {
    id: 'CAP-36',
    section: 'checkout',
    label: 'Navegação até checkout (sem pagar)',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['ux/checkout.spec.ts', 'regression/personalizacao.spec.ts'],
  },
  {
    id: 'CAP-37',
    section: 'checkout',
    label: 'Pagamento cartão + emissão',
    priority: 'P0',
    status: 'covered',
    testable: true,
    specs: ['journeys/cotacao-plano-regular.spec.ts', 'journeys/cotacao-plano-personalizado.spec.ts'],
  },
  {
    id: 'CAP-38',
    section: 'checkout',
    label: 'Cross-sell residencial / vida',
    priority: 'P3',
    status: 'missing',
    testable: true,
    planner: 'planner.md',
  },
  {
    id: 'CAP-39',
    section: 'checkout',
    label: 'Resumo assistências no checkout',
    priority: 'P2',
    status: 'partial',
    testable: true,
    specs: ['ux/checkout.spec.ts', 'journeys/cotacao-plano-regular.spec.ts'],
    notes: 'Accordion assistências; expandir asserts dedicados',
  },

  // ── issuance / sucesso ──
  {
    id: 'CAP-40',
    section: 'issuance',
    label: 'Tela sucesso / apólice emitida',
    priority: 'P0',
    status: 'covered',
    testable: true,
    specs: ['journeys/cotacao-plano-regular.spec.ts', 'journeys/cotacao-plano-personalizado.spec.ts'],
  },
  {
    id: 'CAP-41',
    section: 'transversal',
    label: 'Idempotência de preço (mesmos dados)',
    priority: 'P1',
    status: 'covered',
    testable: true,
    specs: ['regression/precosPlanos.spec.ts'],
  },
  {
    id: 'CAP-42',
    section: 'transversal',
    label: 'Sanidade guard-rails de preço',
    priority: 'P0',
    status: 'covered',
    testable: true,
    specs: ['regression/precosPlanos.spec.ts', 'regression/coberturas.spec.ts'],
  },
  {
    id: 'CAP-43',
    section: 'transversal',
    label: 'Oráculo API PricingService',
    priority: 'P3',
    status: 'blocked',
    testable: false,
    planner: 'planner-validacao-valores.md',
    notes: 'E2E+API; cliente não implementado',
  },
  {
    id: 'CAP-44',
    section: 'transversal',
    label: 'Golden values CPF fixo',
    priority: 'P3',
    status: 'blocked',
    testable: false,
    planner: 'planner-validacao-valores.md',
  },
];

export interface CoverageMetrics {
  generatedAt: string;
  github: { owner: string; repo: string; branch: string; sectionsInFront: number };
  structural: {
    sectionsWithPom: number;
    sectionsTotal: number;
    percent: number;
  };
  functional: {
    testableTotal: number;
    covered: number;
    partial: number;
    missing: number;
    blocked: number;
    /** (covered + partial×0.5) / testableTotal */
    percentWeighted: number;
    /** covered / testableTotal */
    percentStrict: number;
  };
  byPriority: Record<'P0' | 'P1' | 'P2' | 'P3', { total: number; covered: number; percent: number }>;
  gaps: FrontendCapability[];
  partials: FrontendCapability[];
}

export function computeMetrics(
  remoteSectionCount: number,
  sectionsWithPom: number,
  capabilities: FrontendCapability[] = FRONTEND_CAPABILITIES,
): CoverageMetrics {
  const testable = capabilities.filter((c) => c.testable);
  const covered = testable.filter((c) => c.status === 'covered');
  const partial = testable.filter((c) => c.status === 'partial');
  const missing = testable.filter((c) => c.status === 'missing');
  const blocked = testable.filter((c) => c.status === 'blocked');

  const weightedNumerator = covered.length + partial.length * 0.5;
  const percentWeighted = testable.length ? Math.round((weightedNumerator / testable.length) * 100) : 0;
  const percentStrict = testable.length ? Math.round((covered.length / testable.length) * 100) : 0;

  const priorities = ['P0', 'P1', 'P2', 'P3'] as const;
  const byPriority = Object.fromEntries(
    priorities.map((p) => {
      const items = testable.filter((c) => c.priority === p);
      const cov = items.filter((c) => c.status === 'covered').length;
      return [p, { total: items.length, covered: cov, percent: items.length ? Math.round((cov / items.length) * 100) : 0 }];
    }),
  ) as CoverageMetrics['byPriority'];

  const sectionsTotal = remoteSectionCount + 1; // + /sucesso

  return {
    generatedAt: new Date().toISOString().slice(0, 10),
    github: { owner: DEFAULT_GITHUB.owner, repo: DEFAULT_GITHUB.repo, branch: DEFAULT_GITHUB.branch, sectionsInFront: remoteSectionCount },
    structural: {
      sectionsWithPom,
      sectionsTotal,
      percent: sectionsTotal ? Math.round((sectionsWithPom / sectionsTotal) * 100) : 0,
    },
    functional: {
      testableTotal: testable.length,
      covered: covered.length,
      partial: partial.length,
      missing: missing.length,
      blocked: blocked.length,
      percentWeighted,
      percentStrict,
    },
    byPriority,
    gaps: [...missing, ...blocked],
    partials: partial,
  };
}
