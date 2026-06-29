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

test.describe('Jornada — Vistoria por Vídeo (Planetun)', { tag: ['@b2c', '@journey', '@quotation_auto', '@regression'] }, () => {
  test('Deve redirecionar para vistoria por vídeo (Planetun) após pagamento com placa YOU-0023', async ({ page, quotationData }) => {
    test.setTimeout(360_000);

    const plansPage = await navigateToPlans(page, {}, { ...quotationData, licensePlate: 'YOU-0023' });
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

    // Após pagamento com placa de vistoria por vídeo (Planetun), a jornada deve atingir /issuance.
    // O conteúdo específico da tela de vistoria via Planetun deve ser validado abaixo.
    await expect(page).toHaveURL(/\/issuance/, { timeout: 90_000 });

    // TODO: adicionar assertions específicas da tela de vistoria por vídeo (Planetun/ivideo) após mapeamento da UI.
    // Exemplos prováveis:
    //   await expect(page.getByText(/planetun|vistoria.*vídeo|ivideo/i)).toBeVisible();
    //   await expect(page.getByRole('link', { name: /iniciar vistoria.*vídeo/i })).toBeVisible();
    //   await expect(page.frameLocator('iframe[src*="planetun"]')).toBeTruthy();
  });
});
