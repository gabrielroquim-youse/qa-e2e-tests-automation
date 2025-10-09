import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class PlanSelection extends BasePage {

  readonly title = this.page.getByText('Escolha um plano ou personalize do seu jeito');
  readonly btnPlan = this.page.getByRole('button', { name: 'QUERO ESSE' }).first()
  readonly loadingMsg = this.page.getByText('estamos montando o seu seguro', { exact: false });

  constructor(page: Page) {
    super(page);
  }

  async execute() {
    await this.title.isVisible();
    await this.btnPlan.click();
    await this.loadingMsg.isVisible();
    await this.page.waitForTimeout(5000);
  }
}
