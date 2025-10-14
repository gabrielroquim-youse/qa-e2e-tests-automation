import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { VehicleUsages } from '../../enum/VehicleUsages';

export class VehicleAdditionalDetails extends BasePage {
  readonly btnContinue: Locator;
  readonly zipCode: Locator;
  readonly number: Locator;
  readonly overnihgtGarageYes: Locator;
  readonly overnihgtGarageNo: Locator;

  constructor(page: Page) {
    super(page);
    this.btnContinue = this.page.getByRole('button', { name: /continuar/ });
    this.zipCode = this.page.getByRole('textbox', { name: 'CEP do veículo' });
    this.number = this.page.getByRole('textbox', { name: 'Número' });
    this.overnihgtGarageYes = this.page.getByRole('button', { name: 'Sim' });
    this.overnihgtGarageNo = this.page.getByRole('button', { name: 'Não' });
  }

  async fillAddress() {
    await this.zipCode.fill('01234000');
    await this.number.fill('123');
  }

  async overnightGarage(overnightGarage: boolean = true) {
    if (overnightGarage) {
      await this.overnihgtGarageYes.click();
    } else {
      await this.overnihgtGarageNo.click();
    }
  }

  async selectUsage(usage: VehicleUsages = VehicleUsages.PRIVATE) {
    await this.page.getByRole('radio', { name: usage }).click();
  }
}
