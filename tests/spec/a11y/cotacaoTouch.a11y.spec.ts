/**
 * Testes de tamanho mínimo de alvo touch (WCAG 2.5.5) nos controles interativos do funil.
 *
 * Roda nos projetos `mobile-chrome` e `mobile-ios` do sandbox a11y (viewport ≤ 390px).
 * Pré-requisito: VPN Youse + ambiente QA.
 *
 * Por que 44px? WCAG 2.5.5 exige que o alvo de interação toque tenha no mínimo
 * 44×44 CSS pixels para ser operável por usuários com mobilidade reduzida.
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
 * @see docs/guides/a11y-gap-map.md — P1: steppers franquia/indenização · switches
 */
/* eslint-disable playwright/expect-expect -- asserts em tests/helpers/a11yTouch.ts */
import { test } from '../../fixtures/setupQuotation';
import { expectMinTouchTarget } from '../../helpers/a11yTouch';
import { navigateToCoverages, navigateToAssistances } from '../../helpers/funnel';

const TOUCH_TIMEOUT = 240_000;

test.describe('Touch targets (WCAG 2.5.5) — funil cotação auto', { tag: ['@a11y', '@quotation_auto'] }, () => {
  test.describe('coverages_selection — franquia e indenização', () => {
    test('Botões do stepper de franquia devem ter alvo ≥ 44×44px', async ({ page }) => {
      test.setTimeout(TOUCH_TIMEOUT);
      const coveragesPage = await navigateToCoverages(page);
      await coveragesPage.heading.waitFor({ state: 'visible', timeout: 30_000 });

      // O stepper de franquia tem dois botões (−/+) dentro do mesmo container
      const stepperContainer = page.getByText('Valor da Franquia:', { exact: false }).locator('xpath=ancestor::*[1]/following-sibling::*[1]');

      const decreaseBtn = stepperContainer.getByRole('button').first();
      await expectMinTouchTarget(decreaseBtn, 'Franquia — botão diminuir');

      const increaseBtn = stepperContainer.getByRole('button').last();
      await expectMinTouchTarget(increaseBtn, 'Franquia — botão aumentar');
    });

    test('Switch de cobertura "Vale pra qualquer batida" deve ter alvo ≥ 44×44px', async ({ page }) => {
      test.setTimeout(TOUCH_TIMEOUT);
      const coveragesPage = await navigateToCoverages(page);
      await coveragesPage.heading.waitFor({ state: 'visible', timeout: 30_000 });

      const sw = coveragesPage.coverageSwitch('Vale pra qualquer batida');
      await expectMinTouchTarget(sw, 'Switch cobertura "Vale pra qualquer batida"');
    });

    test('Switch de cobertura "Roubo e furto" deve ter alvo ≥ 44×44px', async ({ page }) => {
      test.setTimeout(TOUCH_TIMEOUT);
      const coveragesPage = await navigateToCoverages(page);
      await coveragesPage.heading.waitFor({ state: 'visible', timeout: 30_000 });

      const sw = coveragesPage.coverageSwitch('Roubo e furto');
      await expectMinTouchTarget(sw, 'Switch cobertura "Roubo e furto"');
    });
  });

  test.describe('assistances_selection — switches de assistência', () => {
    test('Primeiro switch de assistência deve ter alvo ≥ 44×44px', async ({ page }) => {
      test.setTimeout(TOUCH_TIMEOUT);
      const assistancesPage = await navigateToAssistances(page);
      await assistancesPage.heading.waitFor({ state: 'visible', timeout: 30_000 });

      const firstSwitch = assistancesPage.assistanceSwitch('Assistência a automóvel');
      await expectMinTouchTarget(firstSwitch, 'Switch assistência "Assistência a automóvel"');
    });
  });
});
