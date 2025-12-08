import { Locator, Page } from '@playwright/test';
import { QuotationPageLayout } from './QuotationPageLayout';
import proxymise from 'proxymise';
import { VehicleAdditionalDetailsPage } from './VehicleAdditionalDetailsPage';

export class VehicleDetailsPage extends QuotationPageLayout<VehicleAdditionalDetailsPage> {
  readonly licensePlate: Locator;
  readonly switchBrandNew: Locator;
  readonly switchBulletproof: Locator;

  constructor(page: Page) {
    super(page, VehicleAdditionalDetailsPage);
    this.licensePlate = this.page.getByRole('textbox', {
      name: 'Placa do carro*',
    });
    this.switchBrandNew = this.page
      .locator('div')
      .filter({ hasText: /^O carro é zero Km\?$/ })
      .locator('div')
      .nth(1);
    this.switchBulletproof = this.page
      .locator('div')
      .filter({ hasText: /^O carro é blindado\?$/ })
      .locator('div')
      .nth(1);
  }

  async fillLicensePlate() {
    await this.licensePlate.fill('YOU0020');
    return this;
  }

  async selectBrandNew(brandNew: boolean = false) {
    if (brandNew) {
      await this.switchBrandNew.click();
    }
    return this;
  }

  async selectBulletproof(bulletproof: boolean = false) {
    if (bulletproof) {
      await this.switchBulletproof.click();
    }
    return this;
  }
}

export default proxymise(VehicleDetailsPage);
