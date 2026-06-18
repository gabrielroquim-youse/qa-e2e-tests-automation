/**
 * Navegação por teclado (WCAG 2.1.1 / 2.4.3) nas telas críticas do funil.
 *
 * Projetos mobile-chrome, mobile-ios e tablet — sandbox a11y, navegador visível (headless: false).
 * Pré-requisito: VPN Youse + ambiente QA.
 *
 * @see docs/guides/accessibility-analysis.md
 */
/* eslint-disable playwright/expect-expect -- asserts em tests/helpers/a11yKeyboard.ts */
import { expect, test } from '@playwright/test';
import { activateFocused, expectReachableByTab, tabUntilFocused, typeInFocusedField } from '../../helpers/a11yKeyboard';
import { navigateToPlans } from '../../helpers/funnel';
import { generateQuotationData } from '../../fixtures/setupQuotation';
import LeadInfoPage from '../../pages/quotation/LeadInfoPage';

const KEYBOARD_TIMEOUT = 240_000;

test.describe('Keyboard — funil cotação auto', { tag: ['@a11y', '@keyboard', '@quotation_auto'] }, () => {
  test.describe.configure({ mode: 'serial' });

  test('lead_info — preencher campos e avançar só com teclado', async ({ page }) => {
    test.setTimeout(KEYBOARD_TIMEOUT);
    const data = generateQuotationData();
    const lead = await LeadInfoPage.open(page);

    // Primeiro foco útil: campo nome (até 40 Tabs a partir do load)
    await tabUntilFocused(page, lead.nome, 40);
    await typeInFocusedField(page, data.name);

    await tabUntilFocused(page, lead.email, 15);
    await typeInFocusedField(page, data.email);

    await tabUntilFocused(page, lead.tel, 15);
    await typeInFocusedField(page, data.phone);

    await tabUntilFocused(page, lead.btnContinue, 20);
    await activateFocused(page);

    await expect(page.getByRole('textbox', { name: 'Placa do carro*' })).toBeVisible({ timeout: 30_000 });
  });

  test('vehicle_details — placa e Continuar só com teclado', async ({ page }) => {
    test.setTimeout(KEYBOARD_TIMEOUT);
    const data = generateQuotationData();
    const lead = await LeadInfoPage.open(page);
    await lead.fillLeadData({ name: data.name, email: data.email, phone: data.phone });
    const vehicle = await lead.clickContinueBtn();

    await vehicle.licensePlate.waitFor({ state: 'visible' });
    await page.keyboard.press('Tab');
    await expectReachableByTab(page, vehicle.licensePlate, 40);
    await typeInFocusedField(page, data.licensePlate.replace(/-/g, ''));

    await tabUntilFocused(page, vehicle.btnContinue, 25);
    await activateFocused(page);

    await expect(page.getByRole('textbox', { name: 'CEP do veículo' })).toBeVisible({ timeout: 30_000 });
  });

  test('plan_selection — botão Continuar alcançável por Tab', async ({ page }) => {
    test.setTimeout(KEYBOARD_TIMEOUT);
    const plans = await navigateToPlans(page);
    await plans.title.waitFor({ state: 'visible', timeout: 45_000 });

    await page.keyboard.press('Tab');
    await expectReachableByTab(page, plans.btnContinue, 60);
  });

  test('plan_selection — card Regular alcançável por Tab', async ({ page }) => {
    test.setTimeout(KEYBOARD_TIMEOUT);
    const plans = await navigateToPlans(page);
    await plans.title.waitFor({ state: 'visible', timeout: 45_000 });

    const queroEsse = page.getByRole('button', { name: /quero esse/i }).first();
    await queroEsse.waitFor({ state: 'visible', timeout: 30_000 });

    await page.keyboard.press('Tab');
    await expectReachableByTab(page, queroEsse, 80);
  });
});
