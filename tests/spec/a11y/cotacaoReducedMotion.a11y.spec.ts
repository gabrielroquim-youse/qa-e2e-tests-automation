/**
 * Smoke de funil com animações desabilitadas (WCAG 2.3.3 — Animation from Interactions).
 *
 * `prefers-reduced-motion: reduce` é ativado por usuários com distúrbios vestibulares,
 * epilepsia fotossensível ou preferência por menos movimento.
 *
 * O que este spec verifica:
 * 1. O funil FUNCIONA com animações reduzidas — componentes que dependem de
 *    `transitionend` ou `animationend` como gatilho de navegação não ficam presos.
 * 2. Sem violações axe novas introduzidas pela ausência de transições (ex.: foco
 *    que some junto com a animação, overlay que não fecha).
 * 3. Textos e elementos focáveis permanecem visíveis após "transições instantâneas".
 *
 * Roda apenas em `desktop` (emulação via CSS media query).
 * Pré-requisito: VPN Youse + ambiente QA.
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html
 * @see docs/guides/a11y-gap-map.md
 */
/* eslint-disable playwright/expect-expect -- asserts em tests/helpers/a11y.ts */
import { expect, test, generateQuotationData } from '../../fixtures/setupQuotation';
import { expectNoAccessibilityViolations } from '../../helpers/a11y';
import { navigateToPlans, navigateToCheckout } from '../../helpers/funnel';
import LeadInfoPage from '../../pages/quotation/LeadInfoPage';

const REDUCED_MOTION_TIMEOUT = 240_000;

test.describe('A11y reduced motion (WCAG 2.3.3) — funil cotação auto', { tag: ['@a11y', '@quotation_auto'] }, () => {
  test.beforeEach(async ({ page }) => {
    // Simula usuário com preferência por movimento reduzido no SO
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('lead_info — sem violações e campos focáveis com reduced motion', async ({ page }) => {
    test.setTimeout(REDUCED_MOTION_TIMEOUT);
    const lead = await LeadInfoPage.open(page);

    // Garante que campos continuam interativos sem transições
    await expect(lead.nome).toBeVisible();
    await expect(lead.email).toBeVisible();
    await expect(lead.tel).toBeVisible();
    await expect(lead.btnContinue).toBeVisible();

    await expectNoAccessibilityViolations(page, { stepName: 'lead_info-reduced-motion' });
  });

  test('navegação funil completo funciona com reduced motion', async ({ page }) => {
    test.setTimeout(REDUCED_MOTION_TIMEOUT);
    const data = generateQuotationData();

    // Verifica que transições instantâneas não quebram a navegação
    const lead = await LeadInfoPage.open(page);
    await lead.fillLeadData({ name: data.name, email: data.email, phone: data.phone });
    const vehicle = await lead.clickContinueBtn();

    // Se transitionend não dispara (animações desabilitadas pelo browser),
    // o Playwright ainda precisa detectar o elemento da próxima etapa
    await expect(vehicle.licensePlate).toBeVisible({ timeout: 30_000 });
  });

  test('plan_selection — planos visíveis e interativos com reduced motion', async ({ page }) => {
    test.setTimeout(REDUCED_MOTION_TIMEOUT);
    const plans = await navigateToPlans(page);

    await expect(plans.title).toBeVisible({ timeout: 45_000 });
    await expectNoAccessibilityViolations(page, { stepName: 'plan_selection-reduced-motion' });
  });

  test('checkout — sem violações com reduced motion', async ({ page }) => {
    test.setTimeout(REDUCED_MOTION_TIMEOUT);
    await navigateToCheckout(page);
    await expectNoAccessibilityViolations(page, { stepName: 'checkout-reduced-motion' });
  });
});
