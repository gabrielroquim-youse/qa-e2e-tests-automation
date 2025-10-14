import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { TestConfig } from '../../../config/test.config';
import { DataGenerator } from '../../helpers/data';

export class LeadInfo extends BasePage {
  readonly nome: Locator;
  readonly email: Locator;
  readonly tel: Locator;

  constructor(page: Page) {
    super(page);
    this.nome = this.page.getByRole('textbox', { name: 'Nome completo*' });
    this.email = this.page.getByRole('textbox', { name: 'E-mail*' });
    this.tel = this.page.getByRole('textbox', { name: 'Telefone com DDD*' });
  }

  async open() {
    await this.page.goto(TestConfig.urls.baseUrl);
    await expect(this.email).toBeVisible();
  }

  async fillLeadData() {
    await this.nome.fill(TestConfig.credentials.name);
    await this.email.fill(TestConfig.credentials.email);
    await this.tel.fill(TestConfig.credentials.phone);
  }
}
