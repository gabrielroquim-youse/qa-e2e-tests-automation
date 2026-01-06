import { Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import { VehicleUsages } from '../../enum/VehicleUsages';
import { PersonDataPage } from './PersonDataPage';
import { QuotationPageLayout } from './QuotationPageLayout';

export class VehicleAdditionalDetailsPage extends QuotationPageLayout<PersonDataPage> {
  readonly zipCode: Locator;
  readonly number: Locator;
  readonly overnihgtGarageYes: Locator;
  readonly overnihgtGarageNo: Locator;

  constructor(page: Page) {
    super(page, PersonDataPage);
    this.zipCode = this.page.getByRole('textbox', { name: 'CEP do veículo' });
    this.number = this.page.getByRole('textbox', { name: 'Número' });
    this.overnihgtGarageYes = this.page.getByRole('button', { name: 'Sim' });
    this.overnihgtGarageNo = this.page.getByRole('button', { name: 'Não' });
  }

  async fillAddress() {
    await this.zipCode.fill('01234000');
    await this.number.fill('123');
    return this;
  }

  async isOvernightGarage(overnightGarage: boolean = true) {
    if (overnightGarage) {
      await this.overnihgtGarageYes.click();
    } else {
      await this.overnihgtGarageNo.click();
    }
    return this;
  }

  async selectUsage(usage: VehicleUsages = VehicleUsages.PRIVATE) {
    await this.page.getByRole('radio', { name: usage }).click();
    return this;
  }
}

export default proxymise(VehicleAdditionalDetailsPage);
