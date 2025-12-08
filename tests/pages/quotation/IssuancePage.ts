import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class IssuancePage extends BasePage {
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = this.page.getByTestId('title');
  }
}
