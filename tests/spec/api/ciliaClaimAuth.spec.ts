/**
 * ⚠️  MIGRADO — estes testes vivem em qa-api-tests-automation.
 *
 * Spec canônico: tests/spec/ciliaClaim.spec.ts
 *
 * Para executar:
 *   cd qa-api-tests-automation
 *   npx playwright test ciliaClaim
 */
/* eslint-disable playwright/no-skipped-test -- redirecionamento; spec canônico vive no repo API */
import { test } from '@playwright/test';

test.describe.skip('Cilia Claim Auth — migrado para qa-api-tests-automation', { tag: ['@whatsapp_claim'] }, () => {
  // eslint-disable-next-line playwright/expect-expect -- stub de redirecionamento; spec canonico vive em qa-api-tests-automation
  test('Executar: cd qa-api-tests-automation && npx playwright test ciliaClaim', () => {
    /* redirect */
  });
});

// ---- conteúdo original abaixo (mantido para histórico de git) ----
// import { expect } from '../../fixtures/matchers';
// import { test } from '../../fixtures/setupClaim';
// ...

// Os mesmos testes (T38, T39, T40, T42, T43, T44, T46, T47, T48) existem em:
//   qa-api-tests-automation/tests/spec/ciliaClaim.spec.ts
