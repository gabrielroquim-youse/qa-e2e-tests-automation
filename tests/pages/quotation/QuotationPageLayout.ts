import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import proxymise from 'proxymise';

export class QuotationPageLayout<T> extends BasePage {
  readonly btnContinue: Locator;
  readonly nextPage: new (page: Page) => T;

  constructor(page: Page, nextPage: new (page: Page) => T) {
    super(page);
    this.btnContinue = this.page.getByRole('button', { name: /continuar/ });
    this.nextPage = nextPage;
  }

  async clickContinueBtn(): Promise<T> {
    await this.btnContinue.click();
    return new this.nextPage(this.page);
  }
}
export default proxymise(QuotationPageLayout);
