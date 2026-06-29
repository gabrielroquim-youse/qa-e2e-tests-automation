/**
 * Usabilidade — tela vehicle_additional (CEP, garagem, uso).
 * Planner: docs/planners/planner-validacao-campos.md (A1–A4)
 */
import { navigateToVehicleAdditional } from '../../../helpers/funnel';
import { expectContinueDisabled, expectFieldInvalid, expectValidationMessage } from '../../../helpers/formValidation';
import { VehicleUsages } from '../../../enum/VehicleUsages';
import { expect, test } from '../../../fixtures/setupQuotation';

const nextStep = (page: import('@playwright/test').Page) => page.getByRole('textbox', { name: 'CPF do segurado' });

test.describe('UX — Endereço e uso do veículo', { tag: ['@ux', '@quotation_auto', '@b2c', '@negative'] }, () => {
  test('Não deve permitir continuar sem CEP', { tag: ['@smoke'] }, async ({ page }) => {
    const address = await navigateToVehicleAdditional(page);

    await expectContinueDisabled(address.btnContinue);
    await expectFieldInvalid(address.zipCode);
    await expect(nextStep(page)).toBeHidden({ timeout: 5_000 });
  });

  test('Não deve permitir continuar sem selecionar uso do veículo', { tag: ['@regression'] }, async ({ page, quotationData }) => {
    const address = await navigateToVehicleAdditional(page);

    await address.fillAddress(quotationData.zipCode, quotationData.addressNumber);
    await address.isOvernightGarage(true);

    await expectContinueDisabled(address.btnContinue);
    await expect(nextStep(page)).toBeHidden({ timeout: 5_000 });
  });

  test('Não deve avançar com CEP inválido', { tag: ['@regression', '@negative'] }, async ({ page }) => {
    const address = await navigateToVehicleAdditional(page);

    await address.zipCode.fill('00000000');
    await address.zipCode.blur();

    await expectContinueDisabled(address.btnContinue);
    await expectFieldInvalid(address.zipCode);
    await expectValidationMessage(page, /cep (inválido|não encontrado|válido)|informe o cep|digit[ae].*cep/i);
    await expect(nextStep(page)).toBeHidden({ timeout: 5_000 });
  });

  test('Deve avançar para dados do segurado após preenchimento completo', { tag: ['@smoke'] }, async ({ page, quotationData }) => {
    const address = await navigateToVehicleAdditional(page);

    await address.fillAddress(quotationData.zipCode, quotationData.addressNumber);
    await address.isOvernightGarage(true);
    await address.selectUsage(VehicleUsages.PRIVATE);
    await address.clickContinueBtn();

    await expect(nextStep(page)).toBeVisible({ timeout: 30_000 });
  });
});
