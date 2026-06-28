/**
 * Promo RPS — **migrada para API** (oráculo por data/campanha).
 *
 *   cd qa-api-tests-automation
 *   npm run test:customization -- --grep rps-promo
 *
 * Spec API: tests/spec/quotation/rps-promo.spec.ts
 *
 * Selo UI "por nossa conta!" permanece opcional no E2E manual; API usa RPS_PROMO_OVERRIDE + calendário.
 *
 * @see docs/guides/api-quotation-layer.md
 */
/* eslint-disable playwright/no-skipped-test -- suite migrada; stub documenta destino API */
import { expect, test } from '../../../fixtures/setupQuotation';

test.describe.skip('Promo RPS — Proteção de Rodas, Pneu e Suspensão', { tag: ['@value', '@assistencias', '@rps', '@quotation_auto'] }, () => {
  test('Executar npm run test:customization em qa-api-tests-automation', () => {
    expect(true).toBe(true);
  });
});
