import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class BonusesClass extends BasePage {
  readonly title: Locator;
  readonly btnNo: Locator;
  readonly btnYes: Locator;

  constructor(page: Page) {
    super(page);
    this.title = this.page.getByText('Você tem ou teve Seguro Auto nos últimos 12 meses?');
    this.btnNo = this.page.getByRole('button', { name: 'Não', exact: true });
    this.btnYes = this.page.getByRole('button', { name: 'Sim', exact: true });
  }

  async onPageCheck() {
    await this.title.waitFor();
  }

  async useBonusClass(useBonusClass: boolean = false) {
    if (useBonusClass) {
      await this.btnYes.click();
    } else {
      await this.btnNo.click();
    }
  }
}
