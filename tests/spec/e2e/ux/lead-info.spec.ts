/**
 * Usabilidade — tela lead_info (primeiro passo do funil).
 * Planner: docs/planners/planner-validacao-campos.md (L1–L4)
 */
import LeadInfoPage from '../../../pages/quotation/LeadInfoPage';
import { expectContinueDisabled, expectFieldInvalid, expectStayOnStep, expectValidationMessage } from '../../../helpers/formValidation';
import { expect, test } from '../../../fixtures/setupQuotation';

const nextStep = (page: import('@playwright/test').Page) => page.getByRole('textbox', { name: 'Placa do carro*' });

test.describe('UX — Lead info', { tag: ['@ux', '@quotation_auto', '@b2c'] }, () => {
  test('Deve exibir campos de contato e botão Continuar', { tag: ['@smoke'] }, async ({ page }) => {
    const lead = await LeadInfoPage.open(page);

    await expect(lead.nome).toBeVisible();
    await expect(lead.email).toBeVisible();
    await expect(lead.tel).toBeVisible();
    await expect(lead.btnContinue).toBeVisible();
  });

  test('Não deve permitir continuar com formulário vazio', { tag: ['@smoke', '@negative'] }, async ({ page }) => {
    const lead = await LeadInfoPage.open(page);

    await expectContinueDisabled(lead.btnContinue);
    await expectFieldInvalid(lead.nome);
    await expectFieldInvalid(lead.email);
    await expectFieldInvalid(lead.tel);
    await expectStayOnStep(page, lead.nome, nextStep(page));
  });

  test('Deve avançar para dados do veículo após preenchimento válido', { tag: ['@smoke'] }, async ({ page, quotationData }) => {
    const lead = await LeadInfoPage.open(page);
    await lead.fillLeadData({ name: quotationData.name, email: quotationData.email, phone: quotationData.phone });

    await lead.clickContinueBtn();
    await expect(nextStep(page)).toBeVisible({ timeout: 30_000 });
  });

  test('Não deve avançar com e-mail inválido', { tag: ['@regression', '@negative'] }, async ({ page, quotationData }) => {
    const lead = await LeadInfoPage.open(page);
    await lead.nome.fill(quotationData.name);
    await lead.email.fill('email-invalido');
    await lead.tel.fill(quotationData.phone);
    await lead.email.blur();

    await expectContinueDisabled(lead.btnContinue);
    await expectValidationMessage(page, /Por favor, digite um e-mail válido/i);
    await expectStayOnStep(page, lead.email, nextStep(page));
  });

  test('Não deve avançar com telefone incompleto', { tag: ['@regression', '@negative'] }, async ({ page, quotationData }) => {
    const lead = await LeadInfoPage.open(page);
    await lead.nome.fill(quotationData.name);
    await lead.email.fill(quotationData.email);
    await lead.tel.fill('1199');
    await lead.tel.blur();

    await expectContinueDisabled(lead.btnContinue);
    await expectFieldInvalid(lead.tel);
    await expectValidationMessage(page, /Por favor, digite um telefone válido/i);
    await expectStayOnStep(page, lead.tel, nextStep(page));
  });

  test('Não deve avançar com nome inválido (apenas números)', { tag: ['@regression', '@negative'] }, async ({ page, quotationData }) => {
    const lead = await LeadInfoPage.open(page);
    await lead.nome.fill('12345');
    await lead.email.fill(quotationData.email);
    await lead.tel.fill(quotationData.phone);
    await lead.nome.blur();

    await expectContinueDisabled(lead.btnContinue);
    await expectFieldInvalid(lead.nome);
    await expectValidationMessage(page, /Por favor, digite seu nome e sobrenome/i);
    await expectStayOnStep(page, lead.nome, nextStep(page));
  });

  /**
   * Regressão de usabilidade: o regex do sales-lead-requirements aceita apenas
   * caracteres ASCII (a-zA-Z). Nomes com acento (ex: João Silva) são rejeitados
   * com a mesma mensagem de erro.
   *
   * BUG conhecido: usuários brasileiros que digitam o próprio nome com acento
   * recebem "Por favor, digite seu nome e sobrenome" — confuso e contra-intuitivo.
   * Fonte: sales-lead-requirements/src/components/LeadRequirementsForm/schema/index.ts
   * Regex: /^[a-zA-Z]*[ ][a-zA-Z ]*$/ (não aceita ã, é, ç, etc.)
   */
  test('Não deve aceitar nome com caracteres acentuados (bug de UX)', { tag: ['@regression', '@negative'] }, async ({ page, quotationData }) => {
    const lead = await LeadInfoPage.open(page);
    await lead.nome.fill('João Silva'); // nome válido no mundo real, inválido no regex
    await lead.email.fill(quotationData.email);
    await lead.tel.fill(quotationData.phone);
    await lead.nome.blur();

    await expectContinueDisabled(lead.btnContinue);
    await expectFieldInvalid(lead.nome);
    await expectValidationMessage(page, /Por favor, digite seu nome e sobrenome/i);
  });
});
