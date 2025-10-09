import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';
import { TestConfig } from '../../../config/test.config';
import { DataGenerator } from '../../helpers/data';

export class LeadInfo extends BasePage {
  
  readonly nome = this.page.getByRole('textbox', { name: 'Nome completo*' });
  readonly email = this.page.getByRole('textbox', { name: 'E-mail*' });
  readonly tel = this.page.getByRole('textbox', { name: 'Telefone com DDD*' });
  readonly btnContinuar = this.page.getByRole('button', {name: /continuar/});

  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.goto(TestConfig.urls.baseUrl);
    await expect(this.email).toBeVisible();
  }

  async execute() {
    await this.fill(this.nome, 'John Youser');
    await this.fill(this.email, 'automation@youse.com.br');
    await this.fill(this.tel, TestConfig.credentials.tel);
    await this.click(this.btnContinuar);
  }
}
