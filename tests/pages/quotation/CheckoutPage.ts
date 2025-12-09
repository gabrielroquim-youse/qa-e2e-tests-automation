import { Locator, Page } from '@playwright/test';
import proxymise from 'proxymise';
import { TestConfig } from '../../../config/test.config';
import { BasePage } from '../BasePage';
import { IssuancePage } from './IssuancePage';

export class CheckoutPage extends BasePage {
  readonly title: Locator;
  readonly cardNumber: Locator;
  readonly cardExpireDate: Locator;
  readonly cardCvv: Locator;
  readonly cardHolderName: Locator;
  readonly emailConfirmation: Locator;
  readonly btnFinish: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByText('Confirme os valores e pague o seguro');
    this.cardNumber = page
      .locator('iframe[title="Iframe para número de cartão seguro"]')
      .contentFrame()
      .getByRole('textbox', { name: 'Campo de número de cartão' });
    this.cardExpireDate = this.page
      .locator('iframe[title="Iframe para data de validade do cartão seguro"]')
      .contentFrame()
      .getByRole('textbox', { name: 'Campo de data de validade' });
    this.cardCvv = this.page
      .locator('iframe[title="Iframe para código de segurança do cartão seguro"]')
      .contentFrame()
      .getByRole('textbox', { name: 'Campo de código de segurança' });
    this.cardHolderName = this.page.getByRole('textbox', { name: 'Nome no cartão' });
    this.emailConfirmation = this.page.getByTitle('Confirmo que o e-mail e').locator('span');
    this.btnFinish = this.page.getByRole('button', { name: /^Finalizar Compra$/ });
  }

  async checkEmailConfirmation() {
    await this.emailConfirmation.click({ timeout: 20_000 });
    return this;
  }

  async fillCreditCardData() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.cardNumber.fill(TestConfig.credentials.creditCard.number);
    await this.cardExpireDate.fill(TestConfig.credentials.creditCard.expireDate);
    await this.cardCvv.fill(TestConfig.credentials.creditCard.cvv);
    await this.cardHolderName.fill(TestConfig.credentials.name);
    return this;
  }

  async clickFinishBtn() {
    await this.fillCreditCardData();
    await this.btnFinish.click();
    return new IssuancePage(this.page);
  }
}

export default proxymise(CheckoutPage);
