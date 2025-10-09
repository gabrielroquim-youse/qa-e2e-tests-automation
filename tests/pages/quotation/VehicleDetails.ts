import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';
import { DataGenerator } from '../../helpers/data';

export class VehicleDetails extends BasePage {

  readonly btnContinue = this.page.getByRole('button', {name: /continuar/});
  readonly licensePlate = this.page.getByRole('textbox', { name: 'Placa do carro*' });
  readonly switchBrandNew = this.page.locator('div').filter({ hasText: /^O carro é zero Km\?$/ }).locator('div').nth(1);
  readonly switchBulletproof = this.page.locator('div').filter({ hasText: /^O carro é blindado\?$/ }).locator('div').nth(1);

  constructor(page: Page) {
    super(page);
  }

  async execute() {
    await this.isVisible(this.licensePlate);
    await this.fill(this.licensePlate, DataGenerator.placaGenerator());
    await this.click(this.switchBrandNew, { force: true });
    await this.click(this.btnContinue);
  }
}
