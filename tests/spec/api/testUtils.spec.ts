/**
 * ⚠️  MIGRADO — estes testes vivem em qa-api-tests-automation.
 *
 * Spec canônico: tests/spec/testUtilsService.spec.ts
 *
 * Para executar:
 *   cd qa-api-tests-automation
 *   npx playwright test testUtilsService
 */
/* eslint-disable playwright/no-skipped-test -- redirecionamento; spec canônico vive no repo API */
import { test } from '@playwright/test';

test.describe.skip('Test Utils Service — migrado para qa-api-tests-automation', { tag: ['@test_utils'] }, () => {
  // eslint-disable-next-line playwright/expect-expect -- stub de redirecionamento; spec canonico vive em qa-api-tests-automation
  test('Executar: cd qa-api-tests-automation && npx playwright test testUtilsService', () => {
    /* redirect */
  });
});

// ---- conteúdo original abaixo (mantido para histórico de git) ----
// Os mesmos testes (policy, claim, customer, CI) existem em:
//   qa-api-tests-automation/tests/spec/testUtilsService.spec.ts
