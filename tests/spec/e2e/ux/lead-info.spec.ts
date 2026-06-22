/**
 * Usabilidade — tela lead_info (primeiro passo do funil).
 */
import LeadInfoPage from '../../../pages/quotation/LeadInfoPage';
import { expect, test } from '../../../fixtures/setupQuotation';

test.describe('UX — Lead info', { tag: ['@ux', '@quotation_auto', '@b2c'] }, () => {
  test('Deve exibir campos de contato e botão Continuar', { tag: ['@smoke'] }, async ({ page }) => {
    const lead = await LeadInfoPage.open(page);

    await expect(lead.nome).toBeVisible();
    await expect(lead.email).toBeVisible();
    await expect(lead.tel).toBeVisible();
    await expect(lead.btnContinue).toBeVisible();
  });

  test('Deve avançar para dados do veículo após preenchimento válido', { tag: ['@smoke'] }, async ({ page, quotationData }) => {
    const lead = await LeadInfoPage.open(page);
    await lead.fillLeadData({ name: quotationData.name, email: quotationData.email, phone: quotationData.phone });

    await lead.clickContinueBtn();
    await expect(page.getByRole('textbox', { name: 'Placa do carro*' })).toBeVisible({ timeout: 30_000 });
  });

  test('Não deve avançar com e-mail inválido', { tag: ['@regression'] }, async ({ page, quotationData }) => {
    const lead = await LeadInfoPage.open(page);
    await lead.nome.fill(quotationData.name);
    await lead.email.fill('email-invalido');
    await lead.tel.fill(quotationData.phone);

    await lead.btnContinue.click();

    await expect(page.getByRole('textbox', { name: 'Placa do carro*' })).toBeHidden({ timeout: 5_000 });
    await expect(lead.email).toBeVisible();
  });
});
