import { Locator, Page } from '@playwright/test';
import { CheckoutPage } from './CheckoutPage';
import { QuotationPageLayout } from './QuotationPageLayout';
import proxymise from 'proxymise';

export class PlanSelectionPage extends QuotationPageLayout<CheckoutPage> {
  readonly title: Locator;
  readonly btnPlan: Locator;
  readonly loadingMsg: Locator;

  constructor(page: Page) {
    super(page, CheckoutPage);
    this.title = this.page.getByText('Escolha um plano ou personalize do seu jeito');
    this.btnPlan = this.page.getByRole('button', { name: 'QUERO ESSE' }).last();
    this.loadingMsg = this.page.getByText('estamos montando o seu seguro', { exact: false });
  }

  async selectPreFormatedPlan() {
    await this.btnPlan.click();
    return new CheckoutPage(this.page);
  }
}

export default proxymise(PlanSelectionPage);
