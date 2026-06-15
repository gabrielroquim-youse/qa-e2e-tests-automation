/**
 * Etapa 2 do funil de cotação auto — Dados do veículo.
 *
 * Responsável pelo preenchimento da placa e seleção das características
 * do veículo (zero km e blindado). A placa informada determina o
 * fluxo de inspeção subsequente (sem inspeção, online, presencial, etc.).
 */
import { Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import { QuotationPageLayout } from './QuotationPageLayout';
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

  async fillLicensePlate(plate = 'YOU-0020') {
    await this.licensePlate.waitFor({ state: 'visible' });
    await this.licensePlate.fill(plate.replace('-', ''));
    return this;
  }

  async selectBrandNew(brandNew: boolean = false) {
    if (brandNew) {
      await this.switchBrandNew.click({ force: true });
    }
    return this;
  }

  async selectBulletproof(bulletproof: boolean = false) {
    if (bulletproof) {
      await this.switchBulletproof.click({ force: true });
    }
    return this;
  }

  /** Retorna mensagem de bloqueio exibida quando o veículo é blindado */
  get bulletproofBlockMessage() {
    return this.page.getByText(/blindado/i).first();
  }
}

export default proxymise(VehicleDetailsPage);
