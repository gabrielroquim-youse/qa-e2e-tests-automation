/**
 * Captura contrato apiws — plano personalizado (coberturas + assistências).
 *
 * Uso (VPN on):
 *   npx playwright test tests/spec/tools/customization-network-capture.spec.ts --project=chromium --reporter=list
 *
 * Saída: docs/reports/customization-network-capture.json
 */
/* eslint-disable playwright/no-conditional-in-test -- tool de captura; logs de diagnóstico */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, test } from '../../fixtures/setupQuotation';
import { navigateToAssistances } from '../../helpers/funnel';

const OUTPUT = join(process.cwd(), 'docs/reports/customization-network-capture.json');

type CapturedRequest = {
  method: string;
  url: string;
  status?: number;
  requestBody?: unknown;
  responseBody?: unknown;
};

function writeCapture(captured: CapturedRequest[], allApi: CapturedRequest[]): void {
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify({ capturedAt: new Date().toISOString(), apiws: captured, allYouseApi: allApi }, null, 2), 'utf-8');
}

test.describe('Tools — captura network personalização', { tag: ['@tool', '@pricing'] }, () => {
  test('Grava XHR até assistências + toggle IPVA', async ({ page }) => {
    test.setTimeout(600_000);

    const captured: CapturedRequest[] = [];
    const allApi: CapturedRequest[] = [];

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
      allApi.push(entry);
      if (/apiws|cotacao\/auto/i.test(response.url())) {
        captured.push(entry);
      }
    });

    try {
      const assistancesPage = await navigateToAssistances(page);
      await expect(assistancesPage.heading).toBeVisible({ timeout: 60_000 });

      const priceBefore = await assistancesPage.getAnnualPrice();
      await assistancesPage.clickAssistanceToggle('Restituição de IPVA');
      await assistancesPage.waitForPriceUpdate(priceBefore);
    } finally {
      writeCapture(captured, allApi);
      console.log(`\n[capture] ${captured.length} apiws / ${allApi.length} total → ${OUTPUT}`);
      for (const entry of captured) {
        const section = (entry.requestBody as { current_section?: string } | undefined)?.current_section ?? '-';
        console.log(`  ${entry.method} ${entry.status ?? '?'} section=${section} ${entry.url}`);
      }
    }
  });
});
