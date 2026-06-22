/**
 * Regras de preço do motor — **migradas para API**.
 *
 * Todos os cenários que navegavam o funil só para comparar prêmios
 * agora rodam via BFF apiws no repo `qa-api-tests-automation`:
 *
 *   cd qa-api-tests-automation
 *   npm run test:pricing
 *
 * Specs API equivalentes (`tests/spec/quotation/`):
 *   - planos-ordinal.spec.ts   — hierarquia Essencial < Regular < Auto 1504
 *   - precos-variaveis.spec.ts — garagem noturna
 *   - bonus-class.spec.ts      — classe de bônus
 *   - uso-veiculo.spec.ts      — uso do veículo
 *   - estado-civil.spec.ts     — estado civil
 *   - zero-km.spec.ts          — zero km vs usado
 *   - motor-sanidade.spec.ts   — guard-rails e idempotência
 *
 * Manter no E2E: UX de planos (`ux/plan-selection.spec.ts`), coberturas visuais,
 * personalização de tela, assistências na UI, validateBonusClass (comportamento da etapa).
 *
 * @see docs/guides/api-quotation-layer.md
 */
/* eslint-disable playwright/no-skipped-test -- suite migrada; stub documenta destino API */
import { expect, test } from '../../../fixtures/setupQuotation';

test.describe.skip('Preços por variável de risco — migrado para API @price', () => {
  test('Executar npm run test:pricing em qa-api-tests-automation', () => {
    expect(true).toBe(true);
  });
});
