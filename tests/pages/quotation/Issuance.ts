import { expect, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class Issuance extends BasePage {

  readonly title = this.page.getByRole('heading', { name: 'seu pagamento foi aprovado', exact: false })

  constructor(page: Page) {
    super(page);
  }

  async execute() {
    expect(this.title.isVisible());
  }
}