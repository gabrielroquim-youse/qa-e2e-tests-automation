import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class PlanSelection extends BasePage {
  readonly title: Locator;
  readonly btnPlan: Locator;
  readonly loadingMsg: Locator;

  constructor(page: Page) {
    super(page);
    this.title = this.page.getByText('Escolha um plano ou personalize do seu jeito');
    this.btnPlan = this.page.getByRole('button', { name: 'QUERO ESSE' }).last();
    this.loadingMsg = this.page.getByText('estamos montando o seu seguro', { exact: false });
  }

  async selectPreFormatedPlan() {
    await this.btnPlan.click();
  }
}
