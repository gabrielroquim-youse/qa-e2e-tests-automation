import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class VehicleDetails extends BasePage {
  readonly licensePlate: Locator;
  readonly switchBrandNew: Locator;
  readonly switchBulletproof: Locator;

  constructor(page: Page) {
    super(page);
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
  }

  async brandNew(brandNew: boolean = false) {
    if (brandNew) {
      await this.switchBrandNew.click();
    }
  }

  async bulletproof(bulletproof: boolean = false) {
    if (bulletproof) {
      await this.switchBulletproof.click();
    }
  }
}
