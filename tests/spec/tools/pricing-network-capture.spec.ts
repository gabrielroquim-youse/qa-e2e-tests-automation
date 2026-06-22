/**
 * Captura requests de pricing no funil E2E (DevTools-like).
 *
 * Uso (VPN on):
 *   npx playwright test tests/spec/tools/pricing-network-capture.spec.ts --project=chromium --reporter=list
 *
 * Saída: docs/reports/pricing-network-capture.json
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '../../fixtures/setupQuotation';
import { navigateToPlans } from '../../helpers/funnel';

const OUTPUT = join(dirname(fileURLToPath(import.meta.url)), '../../../docs/reports/pricing-network-capture.json');

const PRICING_URL_PATTERN = /opin|pricing|quotation|quote|plan|premium|preco|preço/i;

test.describe('Tools — captura network pricing', { tag: ['@tool', '@pricing'] }, () => {
  test('Grava XHR/Fetch até seleção de planos', async ({ page }) => {
    test.setTimeout(180_000);

    const captured: Array<{ method: string; url: string; status?: number; requestBody?: unknown; responseBody?: unknown }> = [];

    page.on('response', async (response) => {
      const request = response.request();
      if (!['fetch', 'xhr'].includes(request.resourceType())) return;

      const url = response.url();
      if (!PRICING_URL_PATTERN.test(url)) return;

      let requestBody: unknown;
      let responseBody: unknown;

      try {
        requestBody = request.postDataJSON();
      } catch {
        requestBody = request.postData() ?? undefined;
      }

      try {
        responseBody = await response.json();
      } catch {
        responseBody = undefined;
      }

      captured.push({
        method: request.method(),
        url,
        status: response.status(),
        requestBody,
        responseBody,
      });
    });

    await navigateToPlans(page);

    await expect(page.getByText('Escolha um plano ou personalize do seu jeito')).toBeVisible();

    mkdirSync(dirname(OUTPUT), { recursive: true });
    writeFileSync(OUTPUT, JSON.stringify({ capturedAt: new Date().toISOString(), requests: captured }, null, 2), 'utf-8');

    console.log(`\n[capture] ${captured.length} request(s) → ${OUTPUT}`);
    for (const entry of captured) {
      console.log(`  ${entry.method} ${entry.status ?? '?'} ${entry.url}`);
    }
    console.log('[capture] Se zero requests, amplie PRICING_URL_PATTERN ou confira VPN');

    await test.info().attach('pricing-network-capture', {
      body: JSON.stringify(captured, null, 2),
      contentType: 'application/json',
    });
  });
});
