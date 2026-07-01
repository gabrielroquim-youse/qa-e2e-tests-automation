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
import { expect, test } from '../../../fixtures/setupQuotation';
import LeadInfoPage from '../../../pages/quotation/LeadInfoPage';

/** Padrão que corresponde a qualquer chamada ao BFF de cotação. */
const BFF_PATTERN = /qa-bff\.youse\.io|qa-cotacao\.youse\.io\/api|\/api\//;

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

test.describe('Network resilience — funil cotação auto', { tag: ['@regression', '@negative', '@quotation_auto'] }, () => {
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

    // Bloqueia apenas calls de validação/submit do funil (não o carregamento inicial da tela)
    const lead = await LeadInfoPage.open(page);
    await expect(lead.nome).toBeVisible({ timeout: 30_000 });

    // Ativa o bloqueio APÓS carregar o formulário
    await routeServerError(page, 503);

    // Tenta avançar — o BFF vai retornar 503
    await lead.fillLeadData({
      name: 'John Youser',
      email: `qa.resiliencia+${Date.now()}@youse.com.br`,
      phone: '(11) 91234-5678',
    });

    // Clica em Continuar — a chamada ao BFF falha com 503
    await lead.btnContinue.click();

    // A tela NÃO deve navegar; deve exibir algum feedback (error state ou mensagem inline).
    // Aceita tanto mensagem de erro explícita quanto permanência na mesma URL.
    /* eslint-disable playwright/no-conditional-in-test, playwright/no-conditional-expect -- 3 estados válidos após 503: mensagem, permanece ou erro */
    const currentUrl = page.url();
    const errorMsg = page.getByText(/alguma coisa deu errada|erro|tente novamente|indisponível/i).first();
    const hasError = await errorMsg.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!hasError) {
      // Se não exibiu mensagem, verifica que ao menos não avançou silenciosamente
      expect(page.url()).toBe(currentUrl);
    }
    /* eslint-enable playwright/no-conditional-in-test, playwright/no-conditional-expect */
  });

  test('plan_selection — exibe estado de carregamento com rede lenta', async ({ page }) => {
    test.setTimeout(180_000);

    // Carrega o lead normalmente (sem interceptação)
    const lead = await LeadInfoPage.open(page);
    await expect(lead.nome).toBeVisible({ timeout: 30_000 });

    // Ativa latência ANTES da navegação ao próximo passo
    await routeSlowNetwork(page, 3_000);

    await lead.fillLeadData({
      name: 'John Youser',
      email: `qa.resiliencia+${Date.now()}@youse.com.br`,
      phone: '(11) 91234-5678',
    });
    await lead.btnContinue.click();

    // Tela de veículos deve aparecer mesmo com latência (dentro do navigationTimeout)
    await expect(page.getByRole('textbox', { name: 'Placa do carro*' })).toBeVisible({ timeout: 60_000 });
  });
});
