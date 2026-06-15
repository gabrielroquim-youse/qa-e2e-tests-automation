/**
 * Etapa 1 do funil de cotação auto — Dados de contato do lead.
 *
 * Responsável por abrir a URL de cotação e preencher nome, e-mail e telefone.
 * É sempre o ponto de entrada do fluxo; use LeadInfoPage.open(page) para iniciar.
 */
import { Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import TestConfig from '../../../config/test.config';
import { QuotationPageLayout } from './QuotationPageLayout';
import { VehicleDetailsPage } from './VehicleDetailsPage';

export interface LeadData {
  name?: string;
  email?: string;
  phone?: string;
}

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
    const instance = new LeadInfoPage(page);
    await page.goto(TestConfig.urls.autoQuotationUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await instance.nome.waitFor({ state: 'visible', timeout: 60_000 });
    return instance;
  }

  async fillLeadData(data?: LeadData): Promise<LeadInfoPage> {
    await this.nome.fill(data?.name ?? TestConfig.credentials.name);
    await this.email.fill(data?.email ?? TestConfig.credentials.email);
    await this.tel.fill(data?.phone ?? TestConfig.credentials.phone);
    return this;
  }
}

export default proxymise(LeadInfoPage);
