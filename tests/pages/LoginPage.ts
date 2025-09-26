import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestConfig } from '../../config/test.config';
import { DataGenerator } from '../helpers/data';

export class LoginPage extends BasePage {
  
  readonly nome = this.page.getByRole('textbox', { name: 'Nome completo*' });
  readonly email = this.page.getByRole('textbox', { name: 'E-mail*' });
  readonly tel = this.page.getByRole('textbox', { name: 'Telefone com DDD*' });
  readonly btnContinuar = this.page.getByRole('button', {name: /continuar/});
  readonly placaCar = this.page.getByRole('textbox', { name: 'Placa do carro*' });
  readonly flagCarroZero = this.page.locator('div').filter({ hasText: /^O carro é zero Km\?$/ }).locator('div').nth(1);
  readonly flagCarroBlindado = this.page.locator('div').filter({ hasText: /^O carro é blindado\?$/ }).locator('div').nth(1);

  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.goto(TestConfig.urls.baseUrl);
    await expect(this.email).toBeVisible();
  }

  async doLogin() {
    await this.fill(this.nome, TestConfig.credentials.nome);
    await this.fill(this.email, DataGenerator.gerarEmail());
    await this.fill(this.tel, TestConfig.credentials.tel);
    await this.click(this.btnContinuar);
    await this.isVisible(this.placaCar);
    //forçando erro para visualização do log
    //await this.expectTextEquals(this.placaCar, 'Placa do carro*');
  }

  async infosCar() {
    await this.fill(this.placaCar, DataGenerator.placaGenerator());
    await this.click(this.flagCarroZero, { force: true });
    await this.click(this.btnContinuar);
  }
}
