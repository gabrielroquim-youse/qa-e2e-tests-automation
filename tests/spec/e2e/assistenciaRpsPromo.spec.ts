/**
 * Promo RPS — oráculo híbrido: calendário + selo UI "por nossa conta!".
 * Ver docs/planners/planner-validacao-valores.md §7
 */
import { test, expect } from '@playwright/test';
import { navigateToAssistances } from '../../helpers/funnel';
import { DELTA_TOLERANCE } from '../../helpers/pricingAssertions';

const TEST_TIMEOUT = 180_000;
const RPS_PROMO_START = new Date(2026, 5, 22, 0, 0, 0);
const RPS_PROMO_END = new Date(2026, 6, 31, 23, 59, 59, 999);

function isRpsPromoActiveByDate(now = new Date()): boolean {
  const override = process.env.RPS_PROMO_OVERRIDE;
  if (override === 'free') return true;
  if (override === 'charged') return false;
  return now >= RPS_PROMO_START && now <= RPS_PROMO_END;
}

test.describe('Promo RPS — Proteção de Rodas, Pneu e Suspensão', { tag: ['@value', '@assistencias', '@rps', '@quotation_auto'] }, () => {
  /* eslint-disable playwright/no-conditional-in-test, playwright/no-conditional-expect -- oráculo híbrido data + UI */
  test('RPS grátis vs cobrado — validado pelo delta do total e selo UI', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    const promoPorData = isRpsPromoActiveByDate();
    const assistancesPage = await navigateToAssistances(page, {}, { dismissPromo: false });

    await assistancesPage.dismissPromoModal();

    const freeInUi = await assistancesPage.isRpsFreeInUi();
    const expectFree = promoPorData || freeInUi || process.env.RPS_PROMO_OVERRIDE === 'free';

    console.log(`[RPS] Promo por data? ${promoPorData} | Selo grátis na UI? ${freeInUi} | Expect free? ${expectFree}`);

    const totalAntes = await assistancesPage.getAnnualPrice();
    const rpsName = 'Proteção de Rodas, Pneu e Suspensão' as const;
    const alreadyOn = await assistancesPage.isAssistanceChecked(rpsName);

    if (!alreadyOn) {
      await assistancesPage.addRps();
      await assistancesPage.waitForPriceUpdate(totalAntes).catch(() => undefined);
    }

    const totalDepois = await assistancesPage.getAnnualPrice();
    const delta = totalDepois - totalAntes;
    console.log(`[RPS] Δ R$ ${delta.toFixed(2)}/ano (${totalAntes.toFixed(2)} → ${totalDepois.toFixed(2)})`);

    if (expectFree) {
      expect(Math.abs(delta), 'RPS grátis: total não deve aumentar').toBeLessThanOrEqual(DELTA_TOLERANCE);
    } else {
      expect(delta, 'RPS cobrado: total deve aumentar').toBeGreaterThan(DELTA_TOLERANCE);
    }
  });
  /* eslint-enable playwright/no-conditional-in-test, playwright/no-conditional-expect */
});
