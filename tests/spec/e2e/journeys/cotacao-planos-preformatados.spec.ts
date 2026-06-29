/**
 * Jornadas E2E — planos pré-formatados Essencial e Auto 1504 (fluxos F3 e F4).
 *
 * Cada teste verifica:
 *  - Navegação completa do funil até o checkout com o plano selecionado
 *  - Visibilidade dos elementos esperados no checkout
 *
 * Jornadas com pagamento real ficam em journeys/cotacao-plano-regular.spec.ts (cartão)
 * e em payment/checkout-pix-emission.spec.ts (PIX).
 *
 * @see docs/guides/fluxos-cotacao-auto.md
 */
import { expect, test } from '../../../fixtures/setupQuotation';
import { navigateToPlans } from '../../../helpers/funnel';

test.describe(
  'Jornada — Planos pré-formatados (Essencial e Auto 1504)',
  {
    tag: ['@b2c', '@journey', '@quotation_auto', '@happy_path'],
  },
  () => {
    // ── F3: Essencial ────────────────────────────────────────────────────────
    test.describe('Plano Essencial', () => {
      test('Deve chegar ao checkout com plano Essencial', { tag: ['@smoke'] }, async ({ page, quotationData }) => {
        test.setTimeout(240_000);

        const plansPage = await navigateToPlans(page, {}, quotationData);
        const checkout = await plansPage.selectPlan('Essencial');

        await expect(checkout.title).toBeVisible({ timeout: 60_000 });
        await expect(checkout.emailConfirmation).toBeVisible();
        await expect(checkout.btnFinish).toBeVisible();
      });

      test('Checkout Essencial deve exibir upsells Residencial e Vida', { tag: ['@regression'] }, async ({ page, quotationData }) => {
        test.setTimeout(240_000);

        const plansPage = await navigateToPlans(page, {}, quotationData);
        const checkout = await plansPage.selectPlan('Essencial');

        await expect(checkout.title).toBeVisible({ timeout: 60_000 });
        await expect(checkout.upsellButton('Seguro Residencial')).toBeVisible();
        await expect(checkout.upsellButton('Seguro Vida')).toBeVisible();
      });

      test('Checkout Essencial deve exibir assistências no accordion (Guincho 200km)', { tag: ['@regression'] }, async ({ page, quotationData }) => {
        test.setTimeout(240_000);

        const plansPage = await navigateToPlans(page, {}, quotationData);
        const checkout = await plansPage.selectPlan('Essencial');

        await expect(checkout.title).toBeVisible({ timeout: 60_000 });
        await checkout.openAssistenciasAccordion();

        await expect(page.getByText(/guincho|200\s*km/i).first()).toBeVisible();
        // Essencial é pré-formatado: sem switches de edição
        await expect(page.getByRole('switch')).toHaveCount(0);
      });
    });

    // ── F4: Auto 1504 ────────────────────────────────────────────────────────
    test.describe('Plano Auto 1504', () => {
      test('Deve chegar ao checkout com plano Auto 1504', { tag: ['@smoke'] }, async ({ page, quotationData }) => {
        test.setTimeout(240_000);

        const plansPage = await navigateToPlans(page, {}, quotationData);
        const checkout = await plansPage.selectPlan('Auto 1504');

        await expect(checkout.title).toBeVisible({ timeout: 60_000 });
        await expect(checkout.emailConfirmation).toBeVisible();
        await expect(checkout.btnFinish).toBeVisible();
      });

      test('Checkout Auto 1504 deve exibir upsells Residencial e Vida', { tag: ['@regression'] }, async ({ page, quotationData }) => {
        test.setTimeout(240_000);

        const plansPage = await navigateToPlans(page, {}, quotationData);
        const checkout = await plansPage.selectPlan('Auto 1504');

        await expect(checkout.title).toBeVisible({ timeout: 60_000 });
        await expect(checkout.upsellButton('Seguro Residencial')).toBeVisible();
        await expect(checkout.upsellButton('Seguro Vida')).toBeVisible();
      });

      test('Checkout Auto 1504 deve exibir Guincho 400km e Reparos no accordion', { tag: ['@regression'] }, async ({ page, quotationData }) => {
        test.setTimeout(240_000);

        const plansPage = await navigateToPlans(page, {}, quotationData);
        const checkout = await plansPage.selectPlan('Auto 1504');

        await expect(checkout.title).toBeVisible({ timeout: 60_000 });
        await checkout.openAssistenciasAccordion();

        await expect(page.getByText(/guincho|400\s*km/i).first()).toBeVisible();
        await expect(page.getByText(/reparos/i).first()).toBeVisible();
      });
    });
  },
);
