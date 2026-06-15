/**
 * Validação de Valores — Seguro Auto (estratégia "delta exato" / invariante).
 *
 * Diferente dos testes de direção (A > B) em assistencias/personalizacao, aqui
 * validamos a MAGNITUDE da variação: ao ativar um item, o aumento do total deve
 * ser EXATAMENTE o preço daquele item (dentro de uma pequena tolerância).
 *
 * Estratégia (ver docs/planner-validacao-valores.md — Estratégia A):
 *   total_depois == total_antes + preço_do_item
 *
 * ⚠️ SPIKE: depende de `getAssistanceItemPrice()`, cujo seletor ainda precisa
 * ser confirmado contra o DOM do QA. Os console.log abaixo ajudam a validar.
 *
 * Pré-requisito: VPN Youse ativa com acesso ao ambiente QA.
 * Uso: npx playwright test validacaoValores --project=chromium --reporter=list
 */
import { test, expect } from '@playwright/test';
import { navigateToAssistances } from '../../helpers/funnel';

const TEST_TIMEOUT = 180_000;
const DELTA_TOLERANCE = 0.05; // Tolerância em reais

test.describe('Validação de Valores — Assistências (delta exato)', { tag: ['@value', '@assistencias', '@quotation_auto'] }, () => {
  test('Ativar "Restituição de IPVA" deve somar exatamente o preço do item ao total anual', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    const assistancesPage = await navigateToAssistances(page);

    const totalAntes = await assistancesPage.getAnnualPrice();
    const item = await assistancesPage.getAssistanceItemPrice('Restituição de IPVA');
    console.log(
      `[Total OFF] R$ ${totalAntes.toFixed(2)}/ano | [Item] R$ ${item.value.toFixed(2)} (${item.perMonth ? 'mês' : 'ano'}) | raw="${item.raw.slice(0, 120)}"`,
    );

    await assistancesPage.assistanceSwitch('Restituição de IPVA').click();
    await assistancesPage.waitForPriceUpdate(totalAntes);

    const totalDepois = await assistancesPage.getAnnualPrice();
    const deltaAnual = totalDepois - totalAntes;
    console.log(`[Total ON]  R$ ${totalDepois.toFixed(2)}/ano | Δ R$ ${deltaAnual.toFixed(2)}`);

    const itemAnual = item.perMonth ? item.value * 12 : item.value;

    expect(
      Math.abs(deltaAnual - itemAnual),
      `O aumento do total (R$ ${deltaAnual.toFixed(2)}/ano) deve ser igual ao preço do item (R$ ${itemAnual.toFixed(2)}/ano). ` +
        `Se a diferença for ~12x, o item está em base mensal — ajustar getAssistanceItemPrice().`,
    ).toBeLessThanOrEqual(DELTA_TOLERANCE);
  });
});
