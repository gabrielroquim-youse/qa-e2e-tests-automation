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
import { expect, test } from '../../fixtures/setupQuotation';
import { navigateToPlans } from '../../helpers/funnel';

const OUTPUT = join(process.cwd(), 'docs/reports/pricing-network-capture.json');

const PRICING_URL_PATTERN = /opin|pricing|quotation|quote|plan|premium|preco|preço|order|graphql|bff|calculate|simulate|seguro-auto/i;

type CapturedRequest = {
  method: string;
  url: string;
  status?: number;
  requestBody?: unknown;
  responseBody?: unknown;
};

function writeCapture(captured: CapturedRequest[], allApi: CapturedRequest[]): void {
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify({ capturedAt: new Date().toISOString(), pricing: captured, allYouseApi: allApi }, null, 2), 'utf-8');
}

test.describe('Tools — captura network pricing', { tag: ['@tool', '@pricing'] }, () => {
  test('Grava XHR/Fetch até seleção de planos', async ({ page }) => {
    test.setTimeout(360_000);

    const captured: CapturedRequest[] = [];
    const allYouseApi: CapturedRequest[] = [];

    page.on('response', async (response) => {
      const request = response.request();
      if (!['fetch', 'xhr'].includes(request.resourceType())) return;
      if (!/youse\.(io|com\.br)/i.test(response.url())) return;

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

      const entry: CapturedRequest = {
        method: request.method(),
        url: response.url(),
        status: response.status(),
        requestBody,
        responseBody,
      };

      allYouseApi.push(entry);
      if (PRICING_URL_PATTERN.test(response.url())) {
        captured.push(entry);
      }
    });

    try {
      await navigateToPlans(page);
      await expect(page.getByText('Escolha um plano ou personalize do seu jeito')).toBeVisible({ timeout: 60_000 });
    } finally {
      writeCapture(captured, allYouseApi);

      console.log(`\n[capture] ${captured.length} pricing / ${allYouseApi.length} total youse API → ${OUTPUT}`);
      for (const entry of captured) {
        console.log(`  ${entry.method} ${entry.status ?? '?'} ${entry.url}`);
      }
    }

    await test.info().attach('pricing-network-capture', {
      body: JSON.stringify({ pricing: captured, allYouseApi }, null, 2),
      contentType: 'application/json',
    });
  });
});
