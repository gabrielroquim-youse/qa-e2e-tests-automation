/**
 * Usabilidade — tela person_data (CPF e estado civil).
 * Planner: docs/planners/planner-validacao-campos.md (P1, P3, P4)
 */
import { MaritalStatuses } from '../../../enum/MaritalStatuses';
import { advanceFromPersonData, navigateToPersonData } from '../../../helpers/funnel';
import { expectContinueDisabled, expectFieldInvalid, expectValidationMessage } from '../../../helpers/formValidation';
import { expect, test } from '../../../fixtures/setupQuotation';

const nextStep = (page: import('@playwright/test').Page) => page.getByText('Você tem ou teve Seguro Auto nos últimos 12 meses?');

test.describe('UX — Dados do segurado', { tag: ['@ux', '@quotation_auto', '@b2c', '@negative'] }, () => {
  test('Não deve permitir continuar sem CPF e estado civil', { tag: ['@smoke'] }, async ({ page }) => {
    const person = await navigateToPersonData(page);

    await expectContinueDisabled(person.btnContinue);
    await expectFieldInvalid(person.documentNumber);
    await expectFieldInvalid(person.maritalStatus);
    await expectValidationMessage(page, /informe o cpf/i);
    await expect(nextStep(page)).toBeHidden({ timeout: 5_000 });
  });

  test('Deve avançar para histórico de seguro após dados válidos', { tag: ['@smoke'] }, async ({ page, quotationData }) => {
    const person = await navigateToPersonData(page);

    await person.fillDocumentNumber(quotationData.documentNumber);
    await person.selectMaritalStatus(MaritalStatuses.SINGLE);
    await advanceFromPersonData(page);

    await expect(nextStep(page)).toBeVisible({ timeout: 30_000 });
  });

  test('Não deve avançar com CPF em formato inválido', { tag: ['@regression'] }, async ({ page }) => {
    const person = await navigateToPersonData(page);

    await person.documentNumber.fill('12345');
    await person.documentNumber.blur();

    await expectContinueDisabled(person.btnContinue);
    await expect(nextStep(page)).toBeHidden({ timeout: 5_000 });
  });
});
