/**
 * Usabilidade — tela vehicle_details (placa e características).
 * Planner: docs/planners/planner-validacao-campos.md (V1–V3)
 */
import { plate } from '../../../data/plate';
import { navigateToVehicleDetails } from '../../../helpers/funnel';
import { expectContinueBlockedOnClick } from '../../../helpers/formValidation';
import { expect, test } from '../../../fixtures/setupQuotation';

const nextStep = (page: import('@playwright/test').Page) => page.getByRole('textbox', { name: 'CEP do veículo' });

test.describe('UX — Dados do veículo', { tag: ['@ux', '@quotation_auto', '@b2c', '@negative'] }, () => {
  test('Não deve avançar sem informar a placa', { tag: ['@smoke'] }, async ({ page }) => {
    const vehicle = await navigateToVehicleDetails(page);

    await expectContinueBlockedOnClick(page, vehicle.btnContinue, vehicle.licensePlate, nextStep(page));
  });

  test('Deve avançar para endereço após placa válida', { tag: ['@smoke'] }, async ({ page }) => {
    const vehicle = await navigateToVehicleDetails(page);

    await vehicle.fillLicensePlate(plate.noInspection.number);
    await vehicle.selectBrandNew(false);
    await vehicle.selectBulletproof(false);
    await vehicle.clickContinueBtn();

    await expect(nextStep(page)).toBeVisible({ timeout: 30_000 });
  });

  test('Não deve avançar com placa em formato inválido', { tag: ['@regression'] }, async ({ page }) => {
    const vehicle = await navigateToVehicleDetails(page);

    await vehicle.licensePlate.fill('ABC');
    await expectContinueBlockedOnClick(page, vehicle.btnContinue, vehicle.licensePlate, nextStep(page));
  });
});
