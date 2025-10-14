import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { TestConfig } from '../../../config/test.config';

export class Checkout extends BasePage {
  readonly title: Locator;
  readonly cardNumber: Locator;
  readonly cardExpireDate: Locator;
  readonly cardCvv: Locator;
  readonly cardHolderName: Locator;
  readonly emailConfirmation: Locator;
  readonly btnFinish: Locator;

  constructor(page: Page) {
    super(page);
    this.title = this.page.getByText('Confirme os valores e pague o seguro');
    this.cardNumber = this.page
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
    this.emailConfirmation = this.page.getByRole('textbox', { name: 'Repita o e-mail' });
    this.btnFinish = this.page.getByRole('button', { name: /^Finalizar Compra$/ });
  }

  async fillCreditCardData() {
    await this.cardNumber.fill(TestConfig.credentials.creditCard.number);
    await this.cardExpireDate.fill(TestConfig.credentials.creditCard.expireDate);
    await this.cardCvv.fill(TestConfig.credentials.creditCard.cvv);
    await this.cardHolderName.fill(TestConfig.credentials.name);
  }

  async fillEmailConfirmation() {
    await this.emailConfirmation.fill(TestConfig.credentials.email);
  }

  async clickFinishBtn() {
    await this.click(this.btnFinish);
    expect(this.page.getByText('estamos processando o seu pagamento', { exact: false }).isVisible());
  }
}
