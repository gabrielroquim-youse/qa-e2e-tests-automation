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

  private vehicleOptionSwitch(labelFragment: string): Locator {
    return this.page
      .locator(`xpath=//*[contains(normalize-space(.), "${labelFragment}")]/ancestor::*[.//*[@role="switch"]][1]`)
      .first()
      .getByRole('switch')
      .first();
  }

  async fillLicensePlate(plate = 'YOU-0020') {
    await this.licensePlate.waitFor({ state: 'visible', timeout: 30_000 });
    await this.licensePlate.fill(plate.replace('-', ''));
    return this;
  }

  /** Modal exibido ao marcar veículo zero km. */
  async dismissZeroKmNoticeIfVisible(): Promise<void> {
    const btn = this.page.getByRole('button', { name: 'Entendi, continuar cotação' });
    if (await btn.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await btn.click();
    }
  }

  private async clickVehicleSwitch(sw: Locator): Promise<void> {
    await sw.scrollIntoViewIfNeeded();
    try {
      await sw.click({ timeout: 5_000 });
    } catch {
      await sw.evaluate((el) => (el as HTMLElement).click());
    }
  }

  async selectBrandNew(brandNew: boolean = false) {
    const sw = this.vehicleOptionSwitch('zero Km');
    const isOn = (await sw.getAttribute('aria-checked')) === 'true';
    if (brandNew && !isOn) {
      await this.clickVehicleSwitch(sw);
      await this.dismissZeroKmNoticeIfVisible();
      if ((await sw.getAttribute('aria-checked')) !== 'true') {
        throw new Error('Toggle "zero Km" não ficou ativado após clique');
      }
    } else if (!brandNew && isOn) {
      await this.clickVehicleSwitch(sw);
    }
    return this;
  }

  async selectBulletproof(bulletproof: boolean = false) {
    const sw = this.vehicleOptionSwitch('blindado');
    const isOn = (await sw.getAttribute('aria-checked')) === 'true';
    if (bulletproof && !isOn) {
      await this.clickVehicleSwitch(sw);
    } else if (!bulletproof && isOn) {
      await this.clickVehicleSwitch(sw);
    }
    return this;
  }

  /** Retorna mensagem de bloqueio exibida quando o veículo é blindado */
  get bulletproofBlockMessage() {
    return this.page.getByText(/blindado/i).first();
  }
}

export default proxymise(VehicleDetailsPage);
