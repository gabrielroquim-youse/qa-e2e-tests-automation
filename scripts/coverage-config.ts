/**
 * Mapa estático: section slug (sales-frontend) → Page Object esperado.
 * Atualize ao adicionar nova etapa no funil ou novo POM.
 */
export interface SectionMapping {
  slug: string;
  microFrontend?: string;
  pageObject: string | null;
  /** Sections conhecidas sem POM — não falham no --check */
  optional?: boolean;
}

export const AUTO_FUNNEL_SECTIONS: SectionMapping[] = [
  { slug: 'lead_info', microFrontend: 'sales-lead-requirements', pageObject: 'LeadInfoPage.ts' },
  { slug: 'vehicle_details', microFrontend: 'sales-vehicle-details', pageObject: 'VehicleDetailsPage.ts' },
  { slug: 'vehicle_additional_details', microFrontend: 'sales-vehicle-additional-details', pageObject: 'VehicleAdditionalDetailsPage.ts' },
  { slug: 'person_data', microFrontend: 'sales-person-data', pageObject: 'PersonDataPage.ts' },
  { slug: 'bonuses_class', microFrontend: 'sales-bonus-class', pageObject: 'BonusesClassPage.ts' },
  { slug: 'data_enrichment', microFrontend: 'sales-data-enrichment', pageObject: null, optional: true },
  { slug: 'plan_selection', microFrontend: 'sales-plan-selection', pageObject: 'PlanSelectionPage.ts' },
  { slug: 'coverages_selection', microFrontend: 'sales-personalization-coverages', pageObject: 'CoveragesSelectionPage.ts' },
  { slug: 'assistances_selection', microFrontend: 'sales-personalization-assistances', pageObject: 'AssistancesSelectionPage.ts' },
  { slug: 'risk_acceptance', microFrontend: 'sales-risk-acceptance', pageObject: null, optional: true },
  { slug: 'checkout', microFrontend: 'sales-checkout', pageObject: 'CheckoutPage.ts' },
  { slug: 'issuance', microFrontend: 'sales-issuance', pageObject: 'IssuancePage.ts' },
];

export const GITHUB_SECTIONS_PATH = 'apps/auto/src/routes/sections/index.tsx';

export const DEFAULT_GITHUB = {
  owner: 'youse-seguradora',
  repo: 'sales-frontend',
  branch: process.env.COVERAGE_GITHUB_BRANCH ?? 'main',
};
