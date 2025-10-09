import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class BonusesClass extends BasePage {

  readonly title = this.page.getByText('Você pode ganhar até 50% de desconto');
  readonly btnContinue = this.page.getByRole('button', {name: /continuar/});
  readonly btnNo = this.page.getByRole('button', {name: 'Não'});

  constructor(page: Page) {
    super(page);
  }

  async execute() {
    await this.title.isVisible();
    await this.btnNo.click();
    await this.btnContinue.click();
    await this.page.waitForTimeout(5000);
  }
}
