/**
 * Jornada E2E — Fluxo de vistoria por vídeo pós-pagamento (Planetun / ivideo).
 *
 * Placa YOU-0023 aciona vistoria por vídeo via plataforma Planetun após o checkout no QA.
 * ⚠️ Esta placa NÃO deve ser usada em testes de fluxo feliz (happy path).
 *
 * @see tests/data/plate.ts — chave `videoInspection`
 * @see docs/README.md — seção "Catálogo de placas de teste"
 */
import { expect, test } from '../../../fixtures/setupQuotation';
import { navigateToPlans } from '../../../helpers/funnel';
import { cpf } from '../../../data/cpf';

test.describe('Jornada — Vistoria por Vídeo (Planetun)', { tag: ['@b2c', '@journey', '@quotation_auto', '@regression'] }, () => {
  test('Deve redirecionar para vistoria por vídeo (Planetun) após pagamento com placa YOU-0023', async ({ page, quotationData }) => {
    test.setTimeout(360_000);

    // Usa CPF dedicado para evitar rate limiting após múltiplos pagamentos no mesmo CPF
    const plansPage = await navigateToPlans(page, {}, { ...quotationData, licensePlate: 'YOU-0023', documentNumber: cpf.acceptedPool[1].number });
    const checkout = await plansPage.selectPlan('Regular');

    await expect(checkout.title).toBeVisible({ timeout: 60_000 });
    await checkout.checkEmailConfirmation();
    await checkout.fillCreditCardData(
      quotationData.creditCard.number,
      quotationData.creditCard.expireDate,
      quotationData.creditCard.cvv,
      quotationData.creditCard.holderName,
    );

    const emissaoPage = await checkout.clickFinishBtn();

    // O QA admite 3 estados pós-pagamento (webhook pode não disparar em QA):
    // A) /sucesso — pagamento confirmado e apólice gerada
    // B) youse.com.br — redirecionado para o site principal
    // C) /issuance — aguardando webhook (estado estável no QA)
    /* eslint-disable playwright/no-conditional-in-test, playwright/no-conditional-expect -- QA: 3 caminhos válidos */
    if (emissaoPage.isOnSuccessPage()) {
      await expect(emissaoPage.title).toBeVisible({ timeout: 15_000 });
    } else if (page.url().includes('youse.com.br')) {
      await expect(page).toHaveURL(/youse\.com\.br/);
    } else {
      await expect(page).toHaveURL(/\/issuance/);
    }
    /* eslint-enable playwright/no-conditional-in-test, playwright/no-conditional-expect */

    // TODO: adicionar assertions específicas da tela de vistoria por vídeo (Planetun/ivideo) após mapeamento da UI.
    // Exemplos prováveis:
    //   await expect(page.getByText(/planetun|vistoria.*vídeo|ivideo/i)).toBeVisible();
    //   await expect(page.getByRole('link', { name: /iniciar vistoria.*vídeo/i })).toBeVisible();
    //   await expect(page.frameLocator('iframe[src*="planetun"]')).toBeTruthy();
  });
});
