import { Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import TestConfig from '../../../config/test.config';
import { QuotationPageLayout } from './QuotationPageLayout';
import { VehicleDetailsPage } from './VehicleDetailsPage';

export class LeadInfoPage extends QuotationPageLayout<VehicleDetailsPage> {
  readonly nome: Locator;
  readonly email: Locator;
  readonly tel: Locator;

  constructor(page: Page) {
    super(page, VehicleDetailsPage);
    this.nome = this.page.getByRole('textbox', { name: 'Nome completo*' });
    this.email = this.page.getByRole('textbox', { name: 'E-mail*' });
    this.tel = this.page.getByRole('textbox', { name: 'Telefone com DDD*' });
  }

  static async open(page: Page): Promise<LeadInfoPage> {
    await page.goto(TestConfig.urls.autoQuotationUrl);
    return new LeadInfoPage(page);
  }

  async fillLeadData(): Promise<LeadInfoPage> {
    await this.nome.fill(TestConfig.credentials.name);
    await this.email.fill(TestConfig.credentials.email);
    await this.tel.fill(TestConfig.credentials.phone);
    return this;
  }
}

export default proxymise(LeadInfoPage);
