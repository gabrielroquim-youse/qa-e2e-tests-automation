/**
 * Pricing de cotação — **migrado para qa-api-tests-automation**.
 *
 *   cd qa-api-tests-automation
 *   npm run test:pricing
 *
 * Spec canônico: tests/spec/quotation/planos-ordinal.spec.ts
 *
 * @see tests/spec/api/quotation/README.md
 */
/* eslint-disable playwright/no-skipped-test -- redirecionamento; specs vivem no repo API */
import { expect, test } from '../../../fixtures/setupQuotationApi';

test.describe.skip('API — Planos — ordinal (repo API)', { tag: ['@api', '@pricing', '@quotation_auto'] }, () => {
  test('Executar npm run test:pricing em qa-api-tests-automation', () => {
    expect(true).toBe(true);
  });
});
