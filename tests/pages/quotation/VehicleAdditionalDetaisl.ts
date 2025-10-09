import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class VehicleAdditionalDetails extends BasePage {

  readonly btnContinue = this.page.getByRole('button', {name: /continuar/});
  readonly zipCode = this.page.getByRole('textbox', { name: 'CEP do veículo' });
  readonly number = this.page.getByRole('textbox', { name: 'Número' });
  readonly overnihgtGarage = this.page.getByRole('button', { name: 'Sim' })
  readonly usage = this.page.getByRole('radio', { name: 'Particular' })

  constructor(page: Page) {
    super(page);
  }

  async execute() {
    await this.isVisible(this.zipCode);
    await this.fill(this.zipCode, '01234000')
    await this.fill(this.number, '123')
    await this.click(this.overnihgtGarage)
    await this.click(this.usage)
    await this.click(this.btnContinue)
  }
}
