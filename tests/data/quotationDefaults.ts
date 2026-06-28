/**
 * Massa padrão para cotação Auto — compartilhada entre E2E e API.
 * Sobrescreva campos por cenário no builder ou via overrides no spec.
 */
export const DEFAULT_QUOTATION_MASS = {
  licensePlate: 'YOU-0020',
  zipCode: '04777-020',
  addressNumber: '99999',
  documentNumber: '123.456.761-08',
  dateOfBirth: '1980-01-01',
} as const;
