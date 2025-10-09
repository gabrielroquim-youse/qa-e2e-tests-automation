import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class PersonData extends BasePage {

  readonly btnContinue = this.page.getByRole('button', {name: /continuar/});
  readonly documentNumber = this.page.getByRole('textbox', { name: 'CPF do segurado' });
  readonly maritalStatus = this.page.getByRole('combobox');

  constructor(page: Page) {
    super(page);
  }

  async execute() {
    await this.isVisible(this.documentNumber);
    await this.fill(this.documentNumber, '12345676108')
    await this.maritalStatus.selectOption('Solteiro(a)')
    await this.btnContinue.click()
  }
}