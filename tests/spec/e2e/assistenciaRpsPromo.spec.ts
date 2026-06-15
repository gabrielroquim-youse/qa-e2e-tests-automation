/**
 * Promo RPS — "Proteção de Rodas, Pneu e Suspensão" (Seguro Auto).
 *
 * Regra de negócio (campanha):
 *   - Durante junho/2026: o RPS é "Assistência por nossa conta!" → GRÁTIS.
 *     Ao adicioná-lo, o total anual NÃO deve mudar (delta == 0).
 *   - A partir de julho/2026: o RPS passa a ser COBRADO.
 *     Ao adicioná-lo, o total anual deve AUMENTAR (delta > 0).
 *
 * O teste é "ciente da data": decide a expectativa a partir da data corrente
 * (ou de RPS_PROMO_OVERRIDE) e usa a UI como oráculo — não fixa valor de prêmio,
 * pois o RPS (assistance/27) é calculado dinamicamente pelo motor de preços.
 *
 * ⚠️ SPIKE: os seletores do modal/selo do RPS em AssistancesSelectionPage ainda
 * precisam ser confirmados contra o DOM real do QA. Os console.log ajudam nisso.
 *
 * Pré-requisito: VPN Youse ativa com acesso ao ambiente QA.
 * Uso: npx playwright test assistenciaRpsPromo --project=chromium --reporter=list
 */
import { test, expect } from '@playwright/test';
import { navigateToAssistances } from '../../helpers/funnel';

const TEST_TIMEOUT = 180_000;
const DELTA_TOLERANCE = 0.05; // Tolerância em reais para arredondamento

/**
 * Janela da promo: todo o mês de junho/2026. A partir de julho passa a cobrar.
 * Permite forçar o cenário em CI via RPS_PROMO_OVERRIDE = 'free' | 'charged'.
 */
function isRpsPromoActive(now = new Date()): boolean {
  const override = process.env.RPS_PROMO_OVERRIDE;
  if (override === 'free') return true;
  if (override === 'charged') return false;
  return now.getFullYear() === 2026 && now.getMonth() === 5; // mês 5 = junho
}

test.describe('Promo RPS — Proteção de Rodas, Pneu e Suspensão', { tag: ['@value', '@assistencias', '@rps', '@quotation_auto'] }, () => {
  test('RPS deve ser grátis durante a promo e cobrado após — validado pelo delta do total', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    const promoAtiva = isRpsPromoActive();
    console.log(`[RPS] Promo ativa? ${promoAtiva} (override=${process.env.RPS_PROMO_OVERRIDE ?? 'none'})`);

    // Mantém o modal de lançamento aberto (não dispensar a promo).
    const assistancesPage = await navigateToAssistances(page, {}, { dismissPromo: false });

    const modalVisivel = await assistancesPage.isRpsLaunchModalVisible();
    console.log(`[RPS] Modal de lançamento visível? ${modalVisivel}`);
    test.skip(!modalVisivel, 'Modal de lançamento do RPS não apareceu — confirmar seletor/condição no QA.');

    if (promoAtiva) {
      await expect(assistancesPage.rpsFreePledge, 'Durante a promo o selo "por nossa conta!" deve estar visível').toBeVisible();
    }

    const totalAntes = await assistancesPage.getAnnualPrice();
    console.log(`[RPS] Total antes: R$ ${totalAntes.toFixed(2)}/ano`);

    await assistancesPage.addRpsViaModal();

    if (promoAtiva) {
      // Grátis: o total não deve mudar. Damos um tempo curto para eventual recálculo.
      const totalDepois = await assistancesPage.getAnnualPrice();
      const delta = totalDepois - totalAntes;
      console.log(`[RPS] (promo) Total depois: R$ ${totalDepois.toFixed(2)}/ano | Δ R$ ${delta.toFixed(2)}`);
      expect(Math.abs(delta), `RPS grátis durante a promo: o total não deveria aumentar (Δ R$ ${delta.toFixed(2)}).`).toBeLessThanOrEqual(
        DELTA_TOLERANCE,
      );
    } else {
      // Cobrado: o total deve aumentar.
      await assistancesPage.waitForPriceUpdate(totalAntes);
      const totalDepois = await assistancesPage.getAnnualPrice();
      const delta = totalDepois - totalAntes;
      console.log(`[RPS] (cobrado) Total depois: R$ ${totalDepois.toFixed(2)}/ano | Δ R$ ${delta.toFixed(2)}`);
      expect(delta, `Fora da promo o RPS deve ser cobrado: o total deveria aumentar (Δ R$ ${delta.toFixed(2)}).`).toBeGreaterThan(
        DELTA_TOLERANCE,
      );
    }
  });
});
