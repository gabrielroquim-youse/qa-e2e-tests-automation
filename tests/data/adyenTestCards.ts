/**
 * Catálogo reduzido de cartões Adyen para E2E (checkout iframe).
 * Lista completa: https://docs.adyen.com/development-resources/test-cards-and-credentials/test-card-numbers
 */
export type AdyenCardScenario = 'approved' | 'elo_br' | 'hipercard_br';

export interface AdyenTestCard {
  scenario: AdyenCardScenario;
  number: string;
  expireDate: string;
  cvv: string;
  holderName: string;
  description: string;
}

export const ADYEN_TEST_CARDS: Record<AdyenCardScenario, AdyenTestCard> = {
  approved: {
    scenario: 'approved',
    number: '4111 1111 1111 1111',
    expireDate: '0330',
    cvv: '737',
    holderName: 'youse',
    description: 'Visa — aprovado (happy path)',
  },
  elo_br: {
    scenario: 'elo_br',
    number: '5066 9911 1111 1118',
    expireDate: '0330',
    cvv: '737',
    holderName: 'youse',
    description: 'Elo BR — aprovado',
  },
  hipercard_br: {
    scenario: 'hipercard_br',
    number: '6062 8288 8866 6688',
    expireDate: '0330',
    cvv: '737',
    holderName: 'youse',
    description: 'Hipercard BR — aprovado',
  },
};

export function getAdyenTestCard(scenario: AdyenCardScenario = 'approved'): AdyenTestCard {
  return ADYEN_TEST_CARDS[scenario];
}
