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
    let lastError: unknown;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await page.goto('/', {
          waitUntil: 'domcontentloaded',
          timeout: 60_000,
        });
        await instance.nome.waitFor({ state: 'visible', timeout: 60_000 });
        return instance;
      } catch (error) {
        lastError = error;
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 2_000));
      }
    }

    throw lastError;
  }

  async fillLeadData(data?: LeadData): Promise<LeadInfoPage> {
    const name = data?.name ?? TestConfig.credentials.name;
    const email = data?.email ?? TestConfig.credentials.email;
    const phone = data?.phone ?? TestConfig.credentials.phone;

    for (const [field, value] of [
      [this.nome, name],
      [this.email, email],
      [this.tel, phone],
    ] as const) {
      await field.click();
      await field.fill('');
      await field.fill(value);
    }

    return this;
  }
}

export default proxymise(LeadInfoPage);
