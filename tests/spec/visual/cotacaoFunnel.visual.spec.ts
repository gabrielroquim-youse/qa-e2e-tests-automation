/**
 * Visual regression — telas críticas do funil de cotação auto.
 *
 * O que é testado:
 * - Layout geral da tela (posição de elementos, grid, espaçamento)
 * - Cores, tipografia e ícones dos componentes fixos
 * - Estados visuais (botão habilitado/desabilitado, campo com erro)
 *
 * O que NÃO é testado (mascarado):
 * - Preços (dinâmicos — mudam com reajustes e campanhas)
 * - Emails e CPFs (dinâmicos — gerados por Faker)
 * - Timestamps e IDs de cotação (únicos por execução)
 *
 * Como usar:
 *   npm run test:visual           — compara com baseline
 *   npm run test:visual:update    — atualiza baseline (após mudança intencional de UI)
 *
 * Na primeira execução, os screenshots são criados como baseline em tests/__snapshots__/.
 * Commitar os baselines junto com o código (são parte do contrato visual do produto).
 *
 * Pré-requisito: VPN Youse + ambiente QA.
 */
import { expect, test, generateQuotationData } from '../../fixtures/setupQuotation';
import { navigateToPlans, navigateToCheckout } from '../../helpers/funnel';
import LeadInfoPage from '../../pages/quotation/LeadInfoPage';

/** Locators de conteúdo dinâmico a mascarar em todas as capturas. */
function getDynamicContentMasks(page: import('@playwright/test').Page) {
  return [
    // Preços (R$ X.XXX,XX/mês ou /ano)
    page.locator('p, span, div').filter({ hasText: /R\$\s*[\d.,]+\s*\/(mês|ano|month|year)/i }),
    // Campos com e-mail preenchido (único por execução)
    page.getByRole('textbox', { name: /e.?mail/i }),
    // Protocolo ou ID de cotação (aparece no checkout)
    page.locator('[data-testid*="protocol"], [data-testid*="id"], [data-testid*="session"]'),
  ];
}

test.describe('Visual regression — funil cotação auto', { tag: ['@visual', '@quotation_auto'] }, () => {
  test('lead_info — layout visual', async ({ page }) => {
    const lead = await LeadInfoPage.open(page);
    await lead.nome.waitFor({ state: 'visible' });

    // Aguarda scripts de inicialização concluírem
    await page.waitForLoadState('load');

    await expect(page).toHaveScreenshot('lead-info.png', {
      mask: getDynamicContentMasks(page),
      fullPage: false, // Viewport apenas — foco no above-the-fold
    });
  });

  test('lead_info — estado de erro (e-mail inválido)', async ({ page }) => {
    const data = generateQuotationData();
    const lead = await LeadInfoPage.open(page);

    await lead.nome.fill(data.name);
    await lead.email.fill('invalido@');
    await lead.tel.fill(data.phone);
    await lead.email.blur();

    // Aguarda mensagem de erro aparecer antes de capturar
    await page
      .getByText(/e-mail válido/i)
      .waitFor({ state: 'visible', timeout: 10_000 })
      .catch(() => {});

    await expect(page).toHaveScreenshot('lead-info-email-error.png', {
      mask: getDynamicContentMasks(page),
      fullPage: false,
    });
  });

  test('plan_selection — cards de plano', async ({ page }) => {
    const plans = await navigateToPlans(page);
    await plans.title.waitFor({ state: 'visible', timeout: 45_000 });

    // Aguarda preços carregarem (spinner sumiu = preços prontos)
    await plans.loadingMsg.waitFor({ state: 'hidden', timeout: 45_000 }).catch(() => {});

    // Garante que os cards de plano estão renderizados antes de capturar
    await plans.planCard('Essencial').waitFor({ state: 'visible', timeout: 15_000 });

    await expect(page).toHaveScreenshot('plan-selection.png', {
      mask: getDynamicContentMasks(page),
      fullPage: false,
    });
  });

  test('checkout — resumo do plano Regular', async ({ page }) => {
    const checkout = await navigateToCheckout(page);
    await checkout.title.waitFor({ state: 'visible', timeout: 60_000 });

    await expect(page).toHaveScreenshot('checkout-regular.png', {
      mask: [
        ...getDynamicContentMasks(page),
        // Upsells e valores do resumo (preços dinâmicos)
        page.locator('[data-testid*="upsell"], [class*="upsell"]'),
        // Seção de assistências do plano (valores podem variar)
        page.locator('[data-testid*="accordion"], [class*="accordion"]'),
      ],
      fullPage: false,
    });
  });
});
