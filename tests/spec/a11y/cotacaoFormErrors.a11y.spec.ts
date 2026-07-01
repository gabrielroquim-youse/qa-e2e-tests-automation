/**
 * Acessibilidade de mensagens de erro em formulários (WCAG 3.3.1 + 1.3.1).
 *
 * Estratégia: acionar o estado de erro em cada campo crítico e executar
 * o scan axe ANTES de corrigir. Isso captura violações que só existem
 * quando a UI está em estado inválido — como:
 *   - aria-invalid="true" sem aria-describedby apontando para a mensagem
 *   - Mensagens de erro não associadas programaticamente ao input
 *   - Ausência de aria-live na região de feedback dinâmico
 *   - Botão Continuar desabilitado sem aria-disabled (estado não anunciado)
 *
 * Por que este spec existe à parte do cotacaoFunnel.a11y.spec.ts?
 * - O funil axe padrão escaneia telas em estado válido/neutro.
 * - Violações de erro só aparecem APÓS interação do usuário.
 * - Complementa (não substitui) os checks de UX em tests/spec/e2e/ux/.
 *
 * Roda no sandbox a11y — projetos desktop/tablet.
 * Pré-requisito: VPN Youse + ambiente QA.
 *
 * @see docs/guides/a11y-gap-map.md — P2: CAP-02 validação obrigatória
 * @see WCAG 3.3.1 — https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html
 * @see WCAG 1.3.1 — https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html
 */
/* eslint-disable playwright/expect-expect -- asserts em tests/helpers/a11y.ts */
import { test, generateQuotationData } from '../../fixtures/setupQuotation';
import { expectNoAccessibilityViolations } from '../../helpers/a11y';
import LeadInfoPage from '../../pages/quotation/LeadInfoPage';
import { navigateToVehicleDetails } from '../../helpers/funnel';

const FORM_A11Y_TIMEOUT = 240_000;

test.describe('A11y — erros de formulário (WCAG 3.3.1 + 1.3.1)', { tag: ['@a11y', '@quotation_auto'] }, () => {
  test.describe('lead_info — estado de erro', () => {
    test('e-mail inválido deve ser acessível a leitores de tela', async ({ page }) => {
      test.setTimeout(FORM_A11Y_TIMEOUT);
      const data = generateQuotationData();
      const lead = await LeadInfoPage.open(page);

      // Preenche nome e telefone válidos, deixa e-mail inválido
      await lead.nome.fill(data.name);
      await lead.email.fill('email-invalido');
      await lead.tel.fill(data.phone);
      await lead.email.blur();

      // Axe no estado de erro: detecta aria-invalid sem aria-describedby,
      // mensagens de erro não associadas e problemas de role/live region
      await expectNoAccessibilityViolations(page, { stepName: 'lead_info-email-error', failOnModerate: true });
    });

    test('telefone inválido deve ser acessível a leitores de tela', async ({ page }) => {
      test.setTimeout(FORM_A11Y_TIMEOUT);
      const data = generateQuotationData();
      const lead = await LeadInfoPage.open(page);

      await lead.nome.fill(data.name);
      await lead.email.fill(data.email);
      await lead.tel.fill('119');
      await lead.tel.blur();

      await expectNoAccessibilityViolations(page, { stepName: 'lead_info-tel-error', failOnModerate: true });
    });

    test('nome inválido deve ser acessível a leitores de tela', async ({ page }) => {
      test.setTimeout(FORM_A11Y_TIMEOUT);
      const data = generateQuotationData();
      const lead = await LeadInfoPage.open(page);

      await lead.nome.fill('12345');
      await lead.email.fill(data.email);
      await lead.tel.fill(data.phone);
      await lead.nome.blur();

      await expectNoAccessibilityViolations(page, { stepName: 'lead_info-nome-error', failOnModerate: true });
    });
  });

  test.describe('vehicle_details — estado de erro', () => {
    test('placa inválida deve ser acessível a leitores de tela', async ({ page }) => {
      test.setTimeout(FORM_A11Y_TIMEOUT);
      const vehiclePage = await navigateToVehicleDetails(page);

      // Placa com formato inválido (curta demais) — aciona aria-invalid
      await vehiclePage.licensePlate.fill('AB');
      await vehiclePage.licensePlate.blur();
      await vehiclePage.btnContinue.click();

      await expectNoAccessibilityViolations(page, { stepName: 'vehicle_details-placa-error', failOnModerate: true });
    });
  });
});
