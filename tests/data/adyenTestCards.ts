/**
 * Catálogo reduzido de cartões Adyen para E2E (checkout iframe).
 * Lista completa: https://docs.adyen.com/development-resources/test-cards-and-credentials/test-card-numbers
 */
export type AdyenCardScenario = 'approved' | 'elo_br' | 'hipercard_br' | 'refused' | 'invalid_number';

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
  refused: {
    scenario: 'refused',
    // Cartão Visa de teste Adyen para recusa (hard decline — Refused reason code 2).
    // Fonte: https://docs.adyen.com/development-resources/test-cards-and-credentials/test-card-numbers
    number: '4000 0000 0000 0002',
    expireDate: '0330',
    cvv: '737',
    holderName: 'youse',
    description: 'Visa — recusado pelo emissor (PAY-C-REF)',
  },
  invalid_number: {
    scenario: 'invalid_number',
    // Número sem validade Luhn — acionou validação de formato no iframe Adyen.
    number: '1234 5678 9012 3456',
    expireDate: '0330',
    cvv: '737',
    holderName: 'youse',
    description: 'Número inválido (falha Luhn — PAY-C-INV)',
  },
};

export function getAdyenTestCard(scenario: AdyenCardScenario = 'approved'): AdyenTestCard {
  return ADYEN_TEST_CARDS[scenario];
}
