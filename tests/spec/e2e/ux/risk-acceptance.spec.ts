/**
 * Usabilidade — etapa risk_acceptance (aceite de risco).
 * CAP-35: section aparece no fluxo personalizado sem garagem noturna.
 */
import { VehicleUsages } from '../../../enum/VehicleUsages';
import { advancePastRiskAcceptance, navigateToAssistances } from '../../../helpers/funnel';
import { expect, test } from '../../../fixtures/setupQuotation';

test.describe('UX — Aceite de risco', { tag: ['@ux', '@quotation_auto', '@regression'] }, () => {
  test('Deve passar pela section risk_acceptance antes do checkout (sem garagem)', async ({ page }) => {
    test.setTimeout(300_000);

    const sections: string[] = [];
    page.on('framenavigated', (frame) => {
      if (frame !== page.mainFrame()) return;
      const match = frame.url().match(/\/([a-z_]+)(?:\?|$)/);
      if (match) sections.push(match[1]);
    });

    const assistancesPage = await navigateToAssistances(page, { garage: false, usage: VehicleUsages.PRIVATE });
    await assistancesPage.btnContinue.click();
    const checkout = await advancePastRiskAcceptance(page);

    await expect(checkout.title).toBeVisible();
    expect(sections).toContain('risk_acceptance');
    expect(sections).toContain('checkout');
  });
});
