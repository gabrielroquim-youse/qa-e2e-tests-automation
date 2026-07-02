/**
 * Fixture de pré-condição para testes de cotação auto.
 *
 * Gera massa de dados dinâmica (`quotationData`) e disponibiliza todos os
 * Page Objects do funil como fixtures injetáveis nos specs.
 * Importe `test` e `expect` deste arquivo — não do `@playwright/test` —
 * sempre que o spec precisar navegar pelo funil de cotação.
 */
import { faker } from '@faker-js/faker/locale/pt_BR';
import { test as base } from '@playwright/test';
import { cpf } from '../data/cpf';
import { ADYEN_TEST_CARDS } from '../data/adyenTestCards';
import { BonusesClassPage } from '../pages/quotation/BonusesClassPage';
import { CheckoutPage } from '../pages/quotation/CheckoutPage';
import { IssuancePage } from '../pages/quotation/IssuancePage';
import { LeadInfoPage } from '../pages/quotation/LeadInfoPage';
import { PersonDataPage } from '../pages/quotation/PersonDataPage';
import { PlanSelectionPage } from '../pages/quotation/PlanSelectionPage';
import { VehicleAdditionalDetailsPage } from '../pages/quotation/VehicleAdditionalDetailsPage';
import { VehicleDetailsPage } from '../pages/quotation/VehicleDetailsPage';

/** Dados de cotação gerados dinamicamente por faker */
export interface QuotationData {
  name: string;
  email: string;
  phone: string;
  licensePlate: string;
  zipCode: string;
  addressNumber: string;
  documentNumber: string;
  creditCard: {
    number: string;
    expireDate: string;
    cvv: string;
    holderName: string;
  };
}

/** Gera massa de dados dinâmica para o fluxo de cotação */
export function generateQuotationData(overrides?: Partial<QuotationData>): QuotationData {
  const dddsValidos = [11, 21, 31, 41, 51, 61, 71, 81, 91, 19, 27, 47, 67, 77, 87];
  const ddd = faker.helpers.arrayElement(dddsValidos);

  const rawName = faker.person.fullName();
  const normalizedName = rawName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z\s]/g, '')
    .trim();

  return {
    name: normalizedName,
    email: `qa.automation+${Date.now()}@youse.com.br`,
    phone: `(${ddd}) 9${faker.number.int({ min: 1000, max: 9999 })}-${faker.number.int({ min: 1000, max: 9999 })}`,
    licensePlate: 'YOU-0020',
    zipCode: '04777-020',
    addressNumber: '99999',
    // CPF de mock para caminho feliz (sem restrições, sem propósito especial).
    // NÃO usar cpf.accepted ('123.456.761-08') aqui — esse CPF é reservado
    // para criação de apólice D-1 e conflita com workflows internos do QA.
    // Para cenários de erro específicos, passe overrides.documentNumber.
    documentNumber: cpf.acceptedPool[0].number,
    // Cartão Visa aprovado do catálogo Adyen (sandbox Youse).
    // Para outros cenários (Elo, Hipercard, recusado), passe overrides.creditCard.
    creditCard: {
      number: ADYEN_TEST_CARDS.approved.number,
      expireDate: ADYEN_TEST_CARDS.approved.expireDate,
      cvv: ADYEN_TEST_CARDS.approved.cvv,
      holderName: ADYEN_TEST_CARDS.approved.holderName,
    },
    ...overrides,
  };
}

type QuotationFixtures = {
  /** Dados dinâmicos de cotação gerados para o teste */
  quotationData: QuotationData;
  /** Page Objects instanciados e prontos para uso */
  leadInfoPage: LeadInfoPage;
  vehicleDetailsPage: VehicleDetailsPage;
  vehicleAdditionalDetailsPage: VehicleAdditionalDetailsPage;
  personDataPage: PersonDataPage;
  bonusesClassPage: BonusesClassPage;
  planSelectionPage: PlanSelectionPage;
  checkoutPage: CheckoutPage;
  issuancePage: IssuancePage;
};

export const test = base.extend<QuotationFixtures>({
  quotationData: async ({}, use) => {
    await use(generateQuotationData());
  },

  leadInfoPage: async ({ page }, use) => {
    await use(new LeadInfoPage(page));
  },

  vehicleDetailsPage: async ({ page }, use) => {
    await use(new VehicleDetailsPage(page));
  },

  vehicleAdditionalDetailsPage: async ({ page }, use) => {
    await use(new VehicleAdditionalDetailsPage(page));
  },

  personDataPage: async ({ page }, use) => {
    await use(new PersonDataPage(page));
  },

  bonusesClassPage: async ({ page }, use) => {
    await use(new BonusesClassPage(page));
  },

  planSelectionPage: async ({ page }, use) => {
    await use(new PlanSelectionPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  issuancePage: async ({ page }, use) => {
    await use(new IssuancePage(page));
  },
});

export { expect } from '@playwright/test';
