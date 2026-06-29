/**
 * Jornada E2E — Fluxo de vistoria online pós-pagamento.
 *
 * Placa YOU-0020 aciona vistoria online após o checkout no QA.
 * ⚠️ Esta placa NÃO deve ser usada em testes de fluxo feliz (happy path).
 *
 * @see tests/data/plate.ts — chave `noInspection` (⚠️ deprecada para happy path)
 * @see docs/README.md — seção "Catálogo de placas de teste"
 */
import { expect, test } from '../../../fixtures/setupQuotation';
import { navigateToPlans } from '../../../helpers/funnel';

test.describe('Jornada — Vistoria Online', { tag: ['@b2c', '@journey', '@quotation_auto', '@regression'] }, () => {
  test('Deve redirecionar para vistoria online após pagamento com placa YOU-0020', async ({ page, quotationData }) => {
    test.setTimeout(360_000);

    const plansPage = await navigateToPlans(page, {}, { ...quotationData, licensePlate: 'YOU-0020' });
    const checkout = await plansPage.selectPlan('Regular');

    await expect(checkout.title).toBeVisible({ timeout: 60_000 });
    await checkout.checkEmailConfirmation();
    await checkout.fillCreditCardData(
      quotationData.creditCard.number,
      quotationData.creditCard.expireDate,
      quotationData.creditCard.cvv,
      quotationData.creditCard.holderName,
    );

    await checkout.clickFinishBtn();

    // Após pagamento com placa de vistoria online, a jornada deve atingir /issuance.
    // O conteúdo específico da tela de vistoria online deve ser validado abaixo.
    await expect(page).toHaveURL(/\/issuance/, { timeout: 90_000 });

    // TODO: adicionar assertions específicas da tela de vistoria online após mapeamento da UI.
    // Exemplos prováveis:
    //   await expect(page.getByText(/vistoria online/i)).toBeVisible();
    //   await expect(page.getByRole('link', { name: /iniciar vistoria/i })).toBeVisible();
  });
});
