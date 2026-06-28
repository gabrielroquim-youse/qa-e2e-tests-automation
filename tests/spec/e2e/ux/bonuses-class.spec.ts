/**
 * Usabilidade — tela bonuses_class (histórico e classe de bônus).
 * Planner: docs/planners/planner-validacao-campos.md (B1–B3)
 */
import { navigateToBonusesClass } from '../../../helpers/funnel';
import { expectContinueDisabled, expectStayOnStep } from '../../../helpers/formValidation';
import { expect, test } from '../../../fixtures/setupQuotation';

const planStep = (page: import('@playwright/test').Page) => page.getByText('Escolha um plano ou personalize do seu jeito');

test.describe('UX — Histórico de seguro', { tag: ['@ux', '@quotation_auto', '@b2c', '@negative'] }, () => {
  test('Não deve permitir continuar sem escolher histórico de seguro', { tag: ['@smoke'] }, async ({ page }) => {
    test.setTimeout(180_000);

    const bonus = await navigateToBonusesClass(page);

    await expect(bonus.title).toBeVisible();
    await expectContinueDisabled(bonus.btnContinue);
  });

  test('Deve exibir fluxo WhatsApp ao informar que não teve seguro', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(180_000);

    const bonus = await navigateToBonusesClass(page);

    await bonus.btnNo.click();

    await expect(bonus.whatsappBtn).toBeVisible({ timeout: 15_000 });
  });

  test('Não deve avançar para planos ao escolher Sim sem classe de bônus', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(180_000);

    const bonus = await navigateToBonusesClass(page);

    await bonus.btnYes.click();
    await expect(bonus.userBonusesClass).toBeVisible({ timeout: 10_000 });
    await expectContinueDisabled(bonus.btnContinue);
    await expectStayOnStep(page, bonus.title, planStep(page));
  });
});
