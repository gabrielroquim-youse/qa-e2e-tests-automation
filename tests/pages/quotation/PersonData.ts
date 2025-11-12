import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { MaritalStatuses } from '../../enum/MaritalStatuses';

export class PersonData extends BasePage {
  readonly documentNumber: Locator;
  readonly maritalStatus: Locator;

  constructor(page: Page) {
    super(page);
    this.documentNumber = this.page.getByRole('textbox', { name: 'CPF do segurado' });
    this.maritalStatus = this.page.getByRole('combobox');
  }

  async fillDocumentNumber() {
    await this.documentNumber.fill('12345676108');
  }

  async selectMaritalStatus(maritalStatus: MaritalStatuses) {
    await this.maritalStatus.waitFor({state: 'visible'});
    await this.maritalStatus.selectOption(maritalStatus);
  }
}
