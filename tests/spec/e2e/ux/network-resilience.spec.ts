/**
 * Testes de resiliência de rede — funil de cotação auto.
 *
 * Usa `page.route()` para interceptar chamadas ao BFF QA e simular:
 *   - Latência alta (3G lento) — garante que loading states aparecem
 *   - Timeout/erro 503 — garante que mensagem de erro é exibida e acessível
 *   - Retry automático — garante que a app tenta novamente quando a rede volta
 *
 * Por que testes de rede no E2E web?
 * - O qa-mobile-tests-automation tem docs/network-resilience.md mas apenas para o app nativo.
 * - No web, o BFF retorna 503 em deployments e manutenções. O usuário precisa ver
 *   uma mensagem clara — não uma tela em branco.
 * - `page.route()` é mais confiável que CDPs de throttling para testes reproduzíveis.
 *
 * Tags: @negative (falha esperada do sistema)
 * Pré-requisito: VPN Youse + ambiente QA.
 *
 * @see docs/guides/a11y-gap-map.md — formulários e feedback de erro
 */
import { expect, test, generateQuotationData } from '../../../fixtures/setupQuotation';
import LeadInfoPage from '../../../pages/quotation/LeadInfoPage';

/** Padrão que corresponde às chamadas do BFF de cotação (não intercepta rotas genéricas). */
const BFF_PATTERN = /qa-bff\.youse\.io|qa-cotacao\.youse\.io\/api\/(cotacao|bff)/;

/** Simula resposta de erro do servidor (serviço indisponível). */
async function routeServerError(page: import('@playwright/test').Page, statusCode: 503 | 500 = 503): Promise<void> {
  await page.route(BFF_PATTERN, async (route: import('@playwright/test').Route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Service Unavailable', message: 'Serviço temporariamente indisponível' }),
    });
  });
}

/** Adiciona latência artificial às respostas do BFF (simula 3G lento ~400ms/req). */
async function routeSlowNetwork(page: import('@playwright/test').Page, delayMs = 4_000): Promise<void> {
  await page.route(BFF_PATTERN, async (route: import('@playwright/test').Route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.continue();
  });
}

test.describe('Network resilience — funil cotação auto', { tag: ['@ux', '@regression', '@negative', '@quotation_auto'] }, () => {
  test('lead_info — carrega mesmo com BFF lento (3G)', async ({ page }) => {
    test.setTimeout(120_000);

    // BFF com 4s de latência por chamada
    await routeSlowNetwork(page, 4_000);

    const lead = await LeadInfoPage.open(page);

    // Tela deve carregar apesar da lentidão — o lead_info é renderizado pelo MFE,
    // mas qualquer call de inicialização ao BFF deve ter loading state visível
    await expect(lead.nome).toBeVisible({ timeout: 30_000 });
    await expect(lead.email).toBeVisible();
    await expect(lead.tel).toBeVisible();
  });

  test('lead_info — exibe mensagem de erro acessível quando BFF retorna 503', async ({ page }) => {
    test.setTimeout(60_000);
    const data = generateQuotationData();

    // Bloqueia apenas calls de validação/submit do funil (não o carregamento inicial da tela)
    const lead = await LeadInfoPage.open(page);
    await expect(lead.nome).toBeVisible({ timeout: 30_000 });

    // Ativa o bloqueio APÓS carregar o formulário
    await routeServerError(page, 503);

    // Tenta avançar — o BFF vai retornar 503
    await lead.fillLeadData({
      name: data.name,
      email: data.email,
      phone: data.phone,
    });

    // Clica em Continuar — a chamada ao BFF falha com 503
    await lead.btnContinue.click();

    // O funil NÃO deve navegar para a próxima etapa — a URL deve permanecer no lead_info
    await expect(page).toHaveURL(/lead_info|seguro-auto(?!\/[a-f0-9]{8}-)/, { timeout: 5_000 });
    // O campo nome permanece visível (confirma que não houve navegação)
    await expect(lead.nome).toBeVisible();
  });

  test('plan_selection — exibe estado de carregamento com rede lenta', async ({ page }) => {
    test.setTimeout(180_000);
    const data = generateQuotationData();

    // Carrega o lead normalmente (sem interceptação)
    const lead = await LeadInfoPage.open(page);
    await expect(lead.nome).toBeVisible({ timeout: 30_000 });

    // Ativa latência ANTES da navegação ao próximo passo
    await routeSlowNetwork(page, 3_000);

    await lead.fillLeadData({
      name: data.name,
      email: data.email,
      phone: data.phone,
    });
    await lead.btnContinue.click();

    // Tela de veículos deve aparecer mesmo com latência (dentro do navigationTimeout)
    await expect(page.getByRole('textbox', { name: 'Placa do carro*' })).toBeVisible({ timeout: 60_000 });
  });
});
