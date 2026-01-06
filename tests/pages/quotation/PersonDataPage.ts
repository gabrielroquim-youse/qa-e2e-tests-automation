import { Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import { MaritalStatuses } from '../../enum/MaritalStatuses';
import { BonusesClassPage } from './BonusesClassPage';
import { QuotationPageLayout } from './QuotationPageLayout';

export class PersonDataPage extends QuotationPageLayout<BonusesClassPage> {
  readonly documentNumber: Locator;
  readonly maritalStatus: Locator;

  constructor(page: Page) {
    super(page, BonusesClassPage);
    this.documentNumber = this.page.getByRole('textbox', { name: 'CPF do segurado' });
    this.maritalStatus = this.page.getByRole('combobox');
  }

  async fillDocumentNumber() {
    await this.documentNumber.fill('12345676108');
    return this;
  }

  async selectMaritalStatus(maritalStatus: MaritalStatuses) {
    await this.maritalStatus.waitFor({state: 'visible'});
    await this.maritalStatus.selectOption(maritalStatus);
    return this;
  }
}

export default proxymise(PersonDataPage);
