/**
 * Etapa 3 do funil de cotação auto — Detalhes adicionais do veículo.
 *
 * Responsável por preencher o CEP de pernoite do veículo, número do
 * endereço, indicação de garagem e tipo de uso do veículo.
 */
import { Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import { VehicleUsages } from '../../enum/VehicleUsages';
import { PersonDataPage } from './PersonDataPage';
import { QuotationPageLayout } from './QuotationPageLayout';

export class VehicleAdditionalDetailsPage extends QuotationPageLayout<PersonDataPage> {
  readonly zipCode: Locator;
  readonly number: Locator;
  readonly overnightGarageYes: Locator;
  readonly overnightGarageNo: Locator;

  constructor(page: Page) {
    super(page, PersonDataPage);
    this.zipCode = this.page.getByRole('textbox', { name: 'CEP do veículo' });
    this.number = this.page.getByRole('textbox', { name: 'Número' });
    this.overnightGarageYes = this.page.getByRole('button', { name: 'Sim', exact: true });
    this.overnightGarageNo = this.page.getByRole('button', { name: 'Não', exact: true });
  }

  async fillAddress(zipCode = '04777020', addressNumber = '99999') {
    await this.zipCode.fill(zipCode.replace(/\D/g, ''));
    await this.number.fill(addressNumber);
    return this;
  }

  async isOvernightGarage(overnightGarage: boolean = true) {
    if (overnightGarage) {
      await this.overnightGarageYes.click();
    } else {
      await this.overnightGarageNo.click();
    }
    return this;
  }

  async selectUsage(usage: VehicleUsages = VehicleUsages.PRIVATE) {
    await this.page.getByRole('radio', { name: usage }).click();
    return this;
  }
}

export default proxymise(VehicleAdditionalDetailsPage);
