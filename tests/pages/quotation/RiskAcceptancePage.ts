/**
 * Etapa opcional do funil — Aceite de risco (perfil sem garagem / alto risco).
 * Aparece após assistências; no QA pode auto-avançar para checkout sem formulário interativo.
 */
import { Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import { CheckoutPage } from './CheckoutPage';
import { QuotationPageLayout } from './QuotationPageLayout';

export class RiskAcceptancePage extends QuotationPageLayout<CheckoutPage> {
  readonly termsCheckbox: Locator;
  readonly acceptButton: Locator;

  constructor(page: Page) {
    super(page, CheckoutPage);
    this.termsCheckbox = this.page.getByRole('checkbox').first();
    this.acceptButton = this.page.getByRole('button', { name: /continuar|aceito|concordo|entendi/i }).first();
  }

  async isFormVisible(): Promise<boolean> {
    const hasCheckbox = await this.termsCheckbox.isVisible({ timeout: 5_000 }).catch(() => false);
    const hasAccept = await this.acceptButton.isVisible({ timeout: 2_000 }).catch(() => false);
    return hasCheckbox || hasAccept;
  }

  async acceptAndContinue(): Promise<CheckoutPage> {
    await this.page
      .getByText(/carregando/i)
      .waitFor({ state: 'hidden', timeout: 90_000 })
      .catch(() => {});

    if (await this.termsCheckbox.isVisible().catch(() => false)) {
      await this.termsCheckbox.check();
    }

    if (await this.acceptButton.isVisible().catch(() => false)) {
      await this.acceptButton.click();
    } else {
      await this.btnContinue.click();
    }

    await this.page.waitForURL(/checkout/, { timeout: 90_000, waitUntil: 'commit' });
    return new CheckoutPage(this.page);
  }

  async completeIfFormVisible(): Promise<void> {
    if (!(await this.isFormVisible())) return;
    await this.acceptAndContinue();
  }
}

export default proxymise(RiskAcceptancePage);
