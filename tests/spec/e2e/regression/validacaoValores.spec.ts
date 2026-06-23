/**
 * Validação de Valores — **migrada para API**.
 *
 *   cd qa-api-tests-automation
 *   npm run test:customization -- --grep validacao-valores
 *
 * Spec API: tests/spec/quotation/validacao-valores.spec.ts
 *
 * @see docs/guides/api-quotation-layer.md
 */
/* eslint-disable playwright/no-skipped-test -- suite migrada; stub documenta destino API */
import { expect, test } from '../../../fixtures/setupQuotation';

test.describe.skip('Validação de Valores — delta simétrico', { tag: ['@value', '@quotation_auto'] }, () => {
  test('Executar npm run test:customization em qa-api-tests-automation', () => {
    expect(true).toBe(true);
  });
});
