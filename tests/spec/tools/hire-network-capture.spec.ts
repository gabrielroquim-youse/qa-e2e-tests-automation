/**
 * Captura contrato apiws — checkout → pagamento → emissão.
 *
 * Uso (VPN on):
 *   npx playwright test tests/spec/tools/hire-network-capture.spec.ts --project=chromium --reporter=list
 *
 * Saída: docs/reports/hire-network-capture.json
 */
/* eslint-disable playwright/no-conditional-in-test -- tool de captura */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, test } from '../../fixtures/setupQuotation';
import { navigateToCheckout } from '../../helpers/funnel';
import LeadInfoPage from '../../pages/quotation/LeadInfoPage';

const OUTPUT = join(process.cwd(), 'docs/reports/hire-network-capture.json');

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

test.describe('Tools — captura network contratação', { tag: ['@tool', '@journey'] }, () => {
  test('Grava XHR checkout → issuance (plano personalizado)', async ({ page, quotationData }) => {
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
      const leadPage = await LeadInfoPage.open(page);
      await leadPage.fillLeadData({
        name: quotationData.name,
        email: quotationData.email,
        phone: quotationData.phone,
      });
      await leadPage.clickContinueBtn();
      // Navegação completa até checkout via helper (personalizado)
      const checkout = await navigateToCheckout(page);
      await expect(checkout.title).toBeVisible({ timeout: 60_000 });
    } finally {
      writeCapture(captured, allApi);
      console.log(`\n[capture] ${captured.length} apiws / ${allApi.length} total → ${OUTPUT}`);
      for (const entry of captured) {
        const section =
          (entry.requestBody as { current_section?: string } | undefined)?.current_section ??
          (entry.responseBody as { current_section?: string } | undefined)?.current_section ??
          '-';
        console.log(`  ${entry.method} ${entry.status ?? '?'} section=${section} ${entry.url}`);
      }
    }
  });
});
